import { tool } from 'ai';
import { z } from 'zod';

export interface Ticker24hStats {
  symbol: string;
  lastPrice: number;
  priceChange: number;
  priceChangePercent: number;
  highPrice: number;
  lowPrice: number;
  volume: number;
  quoteVolumeUsd: number;
  openPrice: number;
}

const BINANCE_ENDPOINTS = [
  'https://data-api.binance.vision/api/v3/ticker/24hr',
  'https://api.binance.com/api/v3/ticker/24hr',
  'https://api1.binance.com/api/v3/ticker/24hr',
];

export const get24hTickerStats = tool({
  description: 'Fetches real-time 24-hour ticker statistics from Binance spot market (24h high, 24h low, volume, price change %, and latest price).',
  inputSchema: z.object({
    symbol: z.string().optional().default('BTCUSDT').describe('The ticker pair symbol, e.g. "BTCUSDT", "ETHUSDT", "SOLUSDT"'),
  }),
  execute: async ({ symbol = 'BTCUSDT' }): Promise<{ success: boolean; data?: Ticker24hStats; error?: string }> => {
    let normalized = symbol.trim().toUpperCase();
    if (normalized === 'BTC') normalized = 'BTCUSDT';
    else if (normalized === 'ETH') normalized = 'ETHUSDT';
    else if (normalized === 'SOL') normalized = 'SOLUSDT';
    else if (!normalized.endsWith('USDT') && normalized.length <= 4) {
      normalized = `${normalized}USDT`;
    }

    let lastError: Error | null = null;
    for (const endpoint of BINANCE_ENDPOINTS) {
      try {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 4000);
        const response = await fetch(`${endpoint}?symbol=${normalized}`, {
          signal: controller.signal,
        });
        clearTimeout(timeout);

        if (!response.ok) {
          throw new Error(`Binance 24hr API HTTP ${response.status}`);
        }
        const data = await response.json();

        return {
          success: true,
          data: {
            symbol: normalized,
            lastPrice: parseFloat(data.lastPrice),
            priceChange: parseFloat(data.priceChange),
            priceChangePercent: parseFloat(data.priceChangePercent),
            highPrice: parseFloat(data.highPrice),
            lowPrice: parseFloat(data.lowPrice),
            volume: parseFloat(data.volume),
            quoteVolumeUsd: parseFloat(data.quoteVolume),
            openPrice: parseFloat(data.openPrice),
          },
        };
      } catch (err: unknown) {
        lastError = err instanceof Error ? err : new Error(String(err));
      }
    }

    return {
      success: false,
      error: `Failed to fetch 24h ticker for ${normalized}: ${lastError?.message || 'Network unreachable'}`,
    };
  },
});
