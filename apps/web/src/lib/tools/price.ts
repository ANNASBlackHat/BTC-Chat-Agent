import { tool } from 'ai'
import { z } from 'zod'

export const getCurrentPrice = tool({
  description: 'Fetches the real-time spot price of BTC/USDT from Binance REST endpoint.',
  inputSchema: z.object({}),
  execute: async (): Promise<{ price: number | null; symbol: string | null; timestamp: string | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice called`)
    try {
      const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
      if (!response.ok) throw new Error('Binance API response failed')
      const data = await response.json()
      const result = {
        price: parseFloat(data.price),
        symbol: 'BTCUSDT',
        timestamp: new Date().toISOString(),
      }
      console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice completed in ${Date.now() - startTime}ms | result:`, result)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { price: null, symbol: null, timestamp: null, error: `Could not fetch current BTC price: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPrice failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})
