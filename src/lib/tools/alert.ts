import { tool } from 'ai'
import { z } from 'zod'
import { PriceAlert } from '@/types'

const baseUrl = process.env.TRADING_ALERT_API_URL || 'https://trading-alert.com'

/**
 * Helper to fetch the current BTC/USDT spot price from Binance to determine crossing direction
 */
async function fetchCurrentBTCPrice(): Promise<number> {
  const response = await fetch('https://api.binance.com/api/v3/ticker/price?symbol=BTCUSDT')
  if (!response.ok) throw new Error('Binance API response failed')
  const data = await response.json()
  const price = parseFloat(data.price)
  if (isNaN(price)) throw new Error('Binance API returned invalid price')
  return price
}

export const getPriceAlerts = tool({
  description: 'Retrieves the list of active Telegram price alerts/warnings from the database.',
  inputSchema: z.object({}),
  execute: async (): Promise<{ alerts: PriceAlert[] | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getPriceAlerts called`)
    try {
      const response = await fetch(`${baseUrl}/api/targets`)
      if (!response.ok) throw new Error(`Trading Alert API responded with status ${response.status}`)
      const alerts = await response.json() as PriceAlert[]
      const result = { alerts }
      console.log(`[${new Date().toISOString()}] [TOOL] getPriceAlerts completed in ${Date.now() - startTime}ms | alerts count: ${alerts.length}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { alerts: null, error: `Failed to retrieve price alerts: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getPriceAlerts failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const createPriceAlert = tool({
  description: 'Creates a new price warning alert that sends a Telegram notification when BTC price crosses the target price. The direction is automatically determined based on the current spot price if not explicitly provided.',
  inputSchema: z.object({
    targetPrice: z.number().describe('The target BTC price level for the alert'),
    direction: z.enum(['up', 'down']).optional().describe('Direction BTC must cross to trigger alert. Optional; if not provided, it will be automatically computed relative to the current BTC spot price.'),
    botName: z.string().optional().default('BTC-1h/5m').describe('always use BTC-1h/5m'),
    symbol: z.string().optional().default('BTC').describe('always use symbol BTC'),
  }),
  execute: async ({ 
    targetPrice, 
    direction, 
    botName = 'BTC-1h/5m', 
    symbol = 'BTC' 
  }: { 
    targetPrice: number; 
    direction?: 'up' | 'down'; 
    botName?: string; 
    symbol?: string; 
  }): Promise<{ success: boolean; alert: PriceAlert | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert called | params: targetPrice=${targetPrice}, direction=${direction}, botName=${botName}, symbol=${symbol}`)
    try {
      let resolvedDirection = direction
      
      // Auto-determine direction based on current price if not provided
      if (!resolvedDirection) {
        const currentPrice = await fetchCurrentBTCPrice()
        resolvedDirection = targetPrice > currentPrice ? 'up' : 'down'
      }

      const payload = {
        bot_name: botName,
        symbol: symbol,
        target_price: targetPrice,
        direction: resolvedDirection,
      }

      const response = await fetch(`${baseUrl}/api/targets`, {
        method: 'POST',
        headers: {
          'accept': '*/*',
          'content-type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`Trading Alert API responded with status ${response.status}`)
      }

      const alert = await response.json() as PriceAlert
      const result = { success: true, alert }
      console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert completed in ${Date.now() - startTime}ms | alert created with direction: ${resolvedDirection}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { success: false, alert: null, error: `Failed to create price alert: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})
