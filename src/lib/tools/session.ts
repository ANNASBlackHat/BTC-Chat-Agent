import { tool } from 'ai'
import { z } from 'zod'
import { getUserPosition, saveUserPosition, clearUserPosition } from '@/lib/db/queries'
import { UserPosition } from '@/types'

export const getCurrentPosition = tool({
  description: "Retrieves the user's active trading position details (direction and entry price) from the database.",
  inputSchema: z.object({}),
  execute: async (): Promise<{ position: UserPosition | null; error?: string }> => {
    try {
      const position = await getUserPosition()
      return { position }
    } catch (error: unknown) {
      const err = error as Error
      return { position: null, error: `Failed to retrieve active position: ${err.message}` }
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
    try {
      const position = await saveUserPosition({
        direction,
        entry_price: entryPrice,
      })
      return { success: true, position }
    } catch (error: unknown) {
      const err = error as Error
      return { success: false, position: null, error: `Failed to update active position: ${err.message}` }
    }
  },
})

export const clearActivePosition = tool({
  description: "Clears or deletes the user's active trading position from the database.",
  inputSchema: z.object({}),
  execute: async (): Promise<{ success: boolean; error?: string }> => {
    try {
      const cleared = await clearUserPosition()
      return { success: cleared }
    } catch (error: unknown) {
      const err = error as Error
      return { success: false, error: `Failed to clear active position: ${err.message}` }
    }
  },
})
