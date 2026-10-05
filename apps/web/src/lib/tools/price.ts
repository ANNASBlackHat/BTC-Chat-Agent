import { tool } from 'ai';
import { z } from 'zod';

const BINANCE_PRICE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/price',
  'https://api.binance.com/api/v3/ticker/price',
  'https://api1.binance.com/api/v3/ticker/price',
];

export const getCurrentPrice = tool({
  description: 'Fetches the real-time spot price of BTC/USDT from Binance REST endpoint.',
  inputSchema: z.object({}),
  execute: async (): Promise<{ price: number | null; symbol: string | null; timestamp: string | null; error?: string }> => {
    const startTime = Date.now();
    console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice called`);

    let lastError: Error | null = null;
    for (const endpoint of BINANCE_PRICE_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(`${endpoint}?symbol=BTCUSDT`, { signal: controller.signal });
        clearTimeout(timeout);

        if (!response.ok) throw new Error(`Binance API response failed with HTTP ${response.status}`);
        const data = await response.json();
        const result = {
          price: parseFloat(data.price),
          symbol: 'BTCUSDT',
          timestamp: new Date().toISOString(),
        };
        console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice completed in ${Date.now() - startTime}ms | result:`, result);
        return result;
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    const result = {
      price: null,
      symbol: null,
      timestamp: null,
      error: `Could not fetch current BTC price: ${lastError?.message || 'Network unreachable'}`,
    };
    console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice failed in ${Date.now() - startTime}ms | error:`, result.error);
    return result;
  },
});
