import { tool } from 'ai'
import { z } from 'zod'

export const getCurrentPrice = tool({
  description: 'Fetches the real-time spot price of BTC/USDT from Binance REST endpoint.',
  inputSchema: z.object({}),
  execute: async (): Promise<{ price: number | null; symbol: string | null; timestamp: string | null; error?: string }> => {
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      if (!response.ok) throw new Error('Binance API response failed')
      const data = await response.json()
      return {
        price: parseFloat(data.price),
        symbol: 'BTCUSDT',
        timestamp: new Date().toISOString(),
      }
    } catch (error: unknown) {
      const err = error as Error
      return { price: null, symbol: null, timestamp: null, error: `Could not fetch current BTC price: ${err.message}` }
    }
  },
})
