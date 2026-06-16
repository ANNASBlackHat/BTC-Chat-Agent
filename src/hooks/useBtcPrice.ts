import { useState, useEffect } from 'react';

export interface BtcPriceState {
  price: number | null;
  prevPrice: number | null;
  loading: boolean;
  error: string | null;
  source: string | null;
  lastUpdated: string | null;
}

export function useBtcPrice(intervalMs = 15000) {
  const [state, setState] = useState<BtcPriceState>({
    price: null,
    prevPrice: null,
    loading: true,
    error: null,
    source: null,
    lastUpdated: null,
  });

  useEffect(() => {
    let timerId: NodeJS.Timeout | null = null;
    let isMounted = true;

    async function fetchPrice() {
      if (!isMounted) return;

      try {
        const res = await fetch('/api/price');
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.error || `HTTP ${res.status}`);
        }
        const data = await res.json();

        if (isMounted) {
          setState((prev) => ({
            price: data.price,
            prevPrice: prev.price !== data.price ? prev.price : prev.prevPrice,
            loading: false,
            error: null,
            source: data.source,
            lastUpdated: data.timestamp,
          }));
        }
      } catch (err: any) {
        if (isMounted) {
          setState((prev) => ({
            ...prev,
            loading: false,
            error: err.message || 'Failed to fetch BTC price',
          }));
        }
      }
    }

    // Initial fetch
    fetchPrice();

    // Set up polling with visibility checks
    function startInterval() {
      if (timerId) clearInterval(timerId);
      timerId = setInterval(() => {
        if (document.visibilityState === 'visible') {
          fetchPrice();
        }
      }, intervalMs);
    }

    startInterval();

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        fetchPrice();
        startInterval();
      } else {
        if (timerId) {
          clearInterval(timerId);
          timerId = null;
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      isMounted = false;
      if (timerId) clearInterval(timerId);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [intervalMs]);

  return state;
}
