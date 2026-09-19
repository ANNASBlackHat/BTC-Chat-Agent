import { useCallback, useEffect, useRef, useState } from 'react';
import { AppState, type AppStateStatus } from 'react-native';
import { fetchBtcPrice } from './api';

export interface BtcPriceState {
  price: number | null;
  prevPrice: number | null;
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

// Binance miniTicker stream — same source as the web app's useBtcPrice.
const BINANCE_WS_URL = 'wss://stream.binance.com:443/ws/btcusdt@miniTicker';
const BASE_RECONNECT_MS = 2000;
const MAX_RECONNECT_MS = 30000;
const MAX_RECONNECT_ATTEMPTS = 6;

/**
 * Mobile variant of the web's useBtcPrice: identical reconnect/backoff strategy,
 * but uses React Native's AppState instead of document.visibilityState, and the
 * REST fallback goes through the authenticated API client.
 */
export function useBtcPriceMobile() {
  const [state, setState] = useState<BtcPriceState>({
    price: null,
    prevPrice: null,
    loading: true,
    error: null,
    lastUpdated: null,
  });

  const mountedRef = useRef(true);
  const wsRef = useRef<WebSocket | null>(null);
  const attemptsRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyPrice = useCallback((price: number) => {
    if (!mountedRef.current) return;
    setState((prev) => ({
      price,
      prevPrice: prev.price !== null && prev.price !== price ? prev.price : prev.prevPrice,
      loading: false,
      error: null,
      lastUpdated: new Date().toISOString(),
    }));
  }, []);

  const fetchRestFallback = useCallback(async () => {
    const data = await fetchBtcPrice();
    if (!mountedRef.current) return;
    if (data) {
      applyPrice(data.price);
    } else {
      setState((prev) => ({ ...prev, loading: false, error: 'Failed to fetch BTC price' }));
    }
  }, [applyPrice]);

  const connect = useCallback(() => {
    if (!mountedRef.current) return;

    const ws = new WebSocket(BINANCE_WS_URL);
    wsRef.current = ws;

    ws.onopen = () => {
      attemptsRef.current = 0;
    };

    ws.onmessage = (event: WebSocketMessageEvent) => {
      try {
        const data = JSON.parse(String(event.data)) as { c?: string };
        const price = parseFloat(data.c ?? '');
        if (!Number.isNaN(price)) applyPrice(price);
      } catch {
        // Ignore malformed frames
      }
    };

    ws.onclose = () => {
      wsRef.current = null;
      if (!mountedRef.current) return;

      if (attemptsRef.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(BASE_RECONNECT_MS * 2 ** attemptsRef.current, MAX_RECONNECT_MS);
        attemptsRef.current += 1;
        setState((prev) => ({
          ...prev,
          error: `Reconnecting in ${Math.round(delay / 1000)}s… (${attemptsRef.current}/${MAX_RECONNECT_ATTEMPTS})`,
        }));
        timerRef.current = setTimeout(connect, delay);
      } else {
        setState((prev) => ({
          ...prev,
          error: 'Live stream unavailable — using REST fallback.',
        }));
        void fetchRestFallback();
      }
    };
  }, [applyPrice, fetchRestFallback]);

  useEffect(() => {
    mountedRef.current = true;

    // Instant price while the socket handshake completes
    void fetchRestFallback();
    connect();

    const handleAppState = (next: AppStateStatus) => {
      if (next === 'active') {
        if (!wsRef.current) {
          attemptsRef.current = 0;
          connect();
        }
      } else if (wsRef.current) {
        wsRef.current.onclose = null; // suppress reconnect when backgrounding
        wsRef.current.close();
        wsRef.current = null;
      }
    };

    const sub = AppState.addEventListener('change', handleAppState);

    return () => {
      mountedRef.current = false;
      sub.remove();
      if (timerRef.current) clearTimeout(timerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null;
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [connect, fetchRestFallback]);

  return state;
}
