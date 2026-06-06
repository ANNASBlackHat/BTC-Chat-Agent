import { tool } from 'ai'
import { z } from 'zod'
import { PriceAlert } from '@/types'

const baseUrl = process.env.TRADING_ALERT_API_URL || 'https://trading-alert.com'

/**
 * Helper to fetch the current spot price for a given ticker from Binance to determine crossing direction
 */
async function fetchCurrentSpotPrice(symbol: string): Promise<number> {
  let normalizedSymbol = symbol.trim().toUpperCase()
  if (normalizedSymbol === 'BTC') normalizedSymbol = 'BTCUSDT'
  else if (normalizedSymbol === 'ETH') normalizedSymbol = 'ETHUSDT'
  else if (normalizedSymbol === 'SOL') normalizedSymbol = 'SOLUSDT'
  else if (!normalizedSymbol.endsWith('USDT') && normalizedSymbol.length <= 4) {
    normalizedSymbol = `${normalizedSymbol}USDT`
  }
  const response = await fetch(`https://api.binance.com/api/v3/ticker/price?symbol=${normalizedSymbol}`)
  if (!response.ok) throw new Error(`Binance API response failed for symbol ${normalizedSymbol}`)
  const data = await response.json()
  const price = parseFloat(data.price)
  if (isNaN(price)) throw new Error(`Binance API returned invalid price for symbol ${normalizedSymbol}`)
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
  description: 'Creates a new alert that sends a Telegram notification when price conditions are met. Supports standard price alerts and trailing stops.',
  inputSchema: z.object({
    symbol: z.string().optional().default('BTCUSDT').describe('The ticker symbol for the alert (e.g. "BTCUSDT", "ETHUSDT", "SOLUSDT"). Defaults to "BTCUSDT".'),
    type: z.enum(['price', 'trailing']).optional().default('price').describe('Alert type: "price" for standard price alerts, "trailing" for trailing stop alerts. Defaults to "price".'),
    direction: z.enum(['up', 'down']).optional().describe('Direction to trigger the alert ("up" or "down"). Optional; if not provided, automatically resolved (defaults to "down" for trailing alerts).'),
    targetPrice: z.number().optional().describe('The target price level for standard price alerts (required if type is "price")'),
    trailingPercent: z.number().optional().describe('Percentage drop/rise from highest/lowest point for trailing stop alerts (e.g. 15.0 for 15%). Used if type is "trailing"'),
    trailingValue: z.number().optional().describe('Absolute value drop/rise from highest/lowest point for trailing stop alerts (e.g. 50.0). Used if type is "trailing"'),
    activationPrice: z.number().optional().describe('Price level required to reach before the trailing stop activates. Used if type is "trailing"'),
    note: z.string().optional().describe('Custom label context included in the notification message (e.g. "Take profit zone!")'),
    botName: z.string().optional().default('BTC-1h/5m').describe('always use BTC-1h/5m'),
  }),
  execute: async ({ 
    symbol = 'BTCUSDT',
    type = 'price',
    direction,
    targetPrice,
    trailingPercent,
    trailingValue,
    activationPrice,
    note,
    botName = 'BTC-1h/5m',
  }: { 
    symbol?: string;
    type?: 'price' | 'trailing';
    direction?: 'up' | 'down'; 
    targetPrice?: number;
    trailingPercent?: number;
    trailingValue?: number;
    activationPrice?: number;
    note?: string;
    botName?: string; 
  }): Promise<{ success: boolean; alert: PriceAlert | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert called | params: symbol=${symbol}, type=${type}, targetPrice=${targetPrice}, direction=${direction}, botName=${botName}`)
    try {
      if (type === 'price' && targetPrice === undefined) {
        throw new Error('targetPrice is required when alert type is "price"')
      }
      if (type === 'trailing' && trailingPercent === undefined && trailingValue === undefined) {
        throw new Error('Either trailingPercent or trailingValue must be provided when alert type is "trailing"')
      }

      // Resolve current price if needed for direction or baseline trailing price
      const currentPrice = (direction === undefined || (type === 'trailing' && targetPrice === undefined))
        ? await fetchCurrentSpotPrice(symbol)
        : undefined

      let resolvedDirection = direction
      if (!resolvedDirection) {
        if (type === 'trailing') {
          resolvedDirection = 'down'
        } else if (targetPrice !== undefined && currentPrice !== undefined) {
          resolvedDirection = targetPrice > currentPrice ? 'up' : 'down'
        } else {
          resolvedDirection = 'up'
        }
      }

      let resolvedTargetPrice = targetPrice
      if (resolvedTargetPrice === undefined) {
        if (type === 'trailing') {
          resolvedTargetPrice = currentPrice
        } else {
          throw new Error('targetPrice is required when alert type is "price"')
        }
      }

      let normalizedSymbol = symbol.trim().toUpperCase()
      if (normalizedSymbol === 'BTC') normalizedSymbol = 'BTCUSDT'
      else if (normalizedSymbol === 'ETH') normalizedSymbol = 'ETHUSDT'
      else if (normalizedSymbol === 'SOL') normalizedSymbol = 'SOLUSDT'
      else if (!normalizedSymbol.endsWith('USDT') && normalizedSymbol.length <= 4) {
        normalizedSymbol = `${normalizedSymbol}USDT`
      }

      const payload: Record<string, any> = {
        bot_name: botName,
        symbol: normalizedSymbol,
        direction: resolvedDirection,
        type,
        target_price: resolvedTargetPrice,
      }

      if (note) {
        payload.note = note
      }

      if (type === 'trailing') {
        if (trailingPercent !== undefined) payload.trailing_percent = trailingPercent
        if (trailingValue !== undefined) payload.trailing_value = trailingValue
        if (activationPrice !== undefined) payload.activation_price = activationPrice
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
        let errMsg = ''
        try {
          errMsg = await response.text()
        } catch (_) {}
        throw new Error(`Trading Alert API responded with status ${response.status}${errMsg ? ': ' + errMsg : ''}`)
      }

      const alert = await response.json() as PriceAlert
      const result = { success: true, alert }
      console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert completed in ${Date.now() - startTime}ms | alert created with direction: ${resolvedDirection}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { success: false, alert: null, error: `Failed to create alert: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] createPriceAlert failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})
