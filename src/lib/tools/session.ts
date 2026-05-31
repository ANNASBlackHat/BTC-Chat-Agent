import { tool } from 'ai'
import { z } from 'zod'
import { getUserPosition, saveUserPosition, clearUserPosition } from '@/lib/db/queries'
import { UserPosition } from '@/types'

export const getCurrentPosition = tool({
  description: "Retrieves the user's active trading position details (direction and entry price) from the database.",
  inputSchema: z.object({}),
  execute: async (): Promise<{ position: UserPosition | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPosition called`)
    try {
      const position = await getUserPosition()
      const result = { position }
      console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPosition completed in ${Date.now() - startTime}ms | position:`, position)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { position: null, error: `Failed to retrieve active position: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getCurrentPosition failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const updateUserPosition = tool({
  description: "Updates or sets the user's active trading position in the database.",
  inputSchema: z.object({
    direction: z.enum(['long', 'short']),
    entryPrice: z.number().describe('The BTC entry price for the position'),
  }),
  execute: async ({ direction, entryPrice }: { direction: 'long' | 'short'; entryPrice: number }): Promise<{ success: boolean; position: UserPosition | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] updateUserPosition called | params: direction=${direction}, entryPrice=${entryPrice}`)
    try {
      const position = await saveUserPosition({
        direction,
        entry_price: entryPrice,
      })
      const result = { success: true, position }
      console.log(`[${new Date().toISOString()}] [TOOL] updateUserPosition completed in ${Date.now() - startTime}ms | position updated:`, position)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { success: false, position: null, error: `Failed to update active position: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] updateUserPosition failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const clearActivePosition = tool({
  description: "Clears or deletes the user's active trading position from the database.",
  inputSchema: z.object({}),
  execute: async (): Promise<{ success: boolean; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] clearActivePosition called`)
    try {
      const cleared = await clearUserPosition()
      const result = { success: cleared }
      console.log(`[${new Date().toISOString()}] [TOOL] clearActivePosition completed in ${Date.now() - startTime}ms | success: ${cleared}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { success: false, error: `Failed to clear active position: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] clearActivePosition failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})
