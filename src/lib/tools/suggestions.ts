import { tool } from 'ai';
import { z } from 'zod';

export const suggestFollowUps = tool({
  description: 'Generates 2-3 relevant follow-up questions for the user based on the current context.',
  inputSchema: z.object({
    suggestions: z.array(z.string()).describe('2 to 3 concise, click-to-reply follow-up suggestions.'),
  }),
  execute: async ({ suggestions }: { suggestions: string[] }): Promise<{ suggestions: string[] }> => {
    console.log(`[${new Date().toISOString()}] [TOOL] suggestFollowUps called with:`, suggestions);
    return { suggestions };
  },
});
