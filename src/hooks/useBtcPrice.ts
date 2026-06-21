import { useState, useEffect, useRef, useCallback } from 'react';

export interface BtcPriceState {
  price: number | null;
  prevPrice: number | null;
  loading: boolean;
  error: string | null;
  source: string | null;
  lastUpdated: string | null;
}

// Binance miniTicker stream: pushes the last close price (`c`) ~every second.
// Lower noise than aggTrade (which fires on every single trade).
const BINANCE_WS_URL = 'wss://stream.binance.com:443/ws/btcusdt@miniTicker';

// Reconnect strategy: exponential backoff capped at 30 s
const BASE_RECONNECT_MS = 2000;
const MAX_RECONNECT_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 6;

export function useBtcPrice() {
  const [state, setState] = useState<BtcPriceState>({
    price: null,
    prevPrice: null,
    loading: true,
    error: null,
    source: null,
    lastUpdated: null,
  });

  const isMountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Update price, tracking the previous value for direction arrows in the UI. */
  const applyPrice = useCallback((price: number, source: string) => {
    if (!isMountedRef.current) return;
    setState((prev) => ({
      price,
      prevPrice: prev.price !== null && prev.price !== price ? prev.price : prev.prevPrice,
      loading: false,
      error: null,
      source,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  /**
   * REST fallback: hits the /api/price route which tries Binance REST → Coinbase.
   * Used on initial mount (while the socket is negotiating) and when the socket
   * fails permanently after exhausting all reconnect attempts.
   */
  const fetchRestFallback = useCallback(async () => {
    if (!isMountedRef.current) return;
    try {
      const res = await fetch('/api/price');
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }
      const data = await res.json() as { price: number; source: string; timestamp: string };
      applyPrice(data.price, data.source);
    } catch (err: unknown) {
      if (!isMountedRef.current) return;
      const message = err instanceof Error ? err.message : 'Failed to fetch BTC price';
      setState((prev) => ({ ...prev, loading: false, error: message }));
    }
  }, [applyPrice]);

  /** Open a new WebSocket and wire up all event handlers. */
  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    const ws = new WebSocket(BINANCE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      reconnectAttemptRef.current = 0; // reset backoff on successful connection
      if (isMountedRef.current) {
        setState((prev) => ({ ...prev, error: null }));
      }
    };

    ws.onmessage = (event: MessageEvent) => {
      try {
        // miniTicker payload: { e, E, s, c, o, h, l, v, q }
        // `c` = current close price (last traded price)
        const data = JSON.parse(event.data as string) as { c?: string };
        const price = parseFloat(data.c ?? '');
        if (!isNaN(price)) {
          applyPrice(price, 'binance');
        }
      } catch {
        // Silently ignore malformed frames
        console.log('err..');
      }
    };

    ws.onerror = () => {
      // onerror is always followed by onclose — handle everything there
      console.log('onError');
    };

    ws.onclose = () => {
      console.log('onClose...');
      wsRef.current = null;
      if (!isMountedRef.current) return;

      if (reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        // Exponential backoff: 2s, 4s, 8s, 16s, 30s, 30s …
        const delay = Math.min(
          BASE_RECONNECT_MS * 2 ** reconnectAttemptRef.current,
          MAX_RECONNECT_MS
        );
        reconnectAttemptRef.current += 1;

        setState((prev) => ({
          ...prev,
          error: `WebSocket closed. Reconnecting in ${Math.round(delay / 1000)}s… (attempt ${reconnectAttemptRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
        }));

        reconnectTimerRef.current = setTimeout(connect, delay);
      } else {
        // All reconnect attempts exhausted — degrade to REST fallback
        setState((prev) => ({
          ...prev,
          error: 'Live stream unavailable. Switching to REST fallback.',
        }));
        fetchRestFallback();
      }
    };
  }, [applyPrice, fetchRestFallback]);

  useEffect(() => {
    isMountedRef.current = true;

    // Kick off an immediate REST fetch so the price displays instantly while
    // the WebSocket handshake completes (~200–500 ms).
    fetchRestFallback();

    // Open the primary WebSocket stream
    connect();

    // Pause the socket while the tab is hidden, resume on visibility
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Reconnect only if the socket is not already alive
        if (!wsRef.current || wsRef.current.readyState === WebSocket.CLOSED) {
          reconnectAttemptRef.current = 0; // fresh budget on user-initiated resume
          connect();
        }
      } else {
        // Tab hidden — close socket gracefully to save resources & server slots
        if (wsRef.current) {
          wsRef.current.onclose = null; // suppress reconnect logic
          wsRef.current.close(1000, 'Tab hidden');
          wsRef.current = null;
        }
        if (reconnectTimerRef.current) {
          clearTimeout(reconnectTimerRef.current);
          reconnectTimerRef.current = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMountedRef.current = false;
      document.removeEventListener('visibilitychange', handleVisibilityChange);

      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);

      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on unmount
        wsRef.current.close(1000, 'Component unmounted');
        wsRef.current = null;
      }
    };
    // connect / fetchRestFallback are stable useCallback refs — safe to include
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return state;
}
