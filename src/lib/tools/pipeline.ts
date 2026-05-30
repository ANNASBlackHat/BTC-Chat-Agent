import { tool } from 'ai'
import { z } from 'zod'
import { 
  getLatestAgentMemory, 
  getRecentDailyAnalyses, 
  getDailyAnalysisByVideoId, 
  getRecentPredictions, 
  getPredictionByVideoId, 
  getTechniqueLedgerEntry, 
  getAllTechniqueLedgerEntries 
} from '@/lib/db/queries'
import { AgentMemory, DailyAnalysis, Prediction, TechniqueLedgerEntry } from '@/types'

export const getLatestAgentMemoryTool = tool({
  description: 'Retrieves the latest consolidated pipeline agent memory, market narrative, key consensus support/resistance levels, open channel predictions, and reflections.',
  inputSchema: z.object({}),
  execute: async (): Promise<{ memory: AgentMemory | null; error?: string }> => {
    try {
      const memory = await getLatestAgentMemory()
      return { memory }
    } catch (error: unknown) {
      const err = error as Error
      return { memory: null, error: `Failed to retrieve agent memory: ${err.message}` }
    }
  },
})

export const getRecentDailyAnalysesTool = tool({
  description: 'Retrieves recent daily video analyses from the pipeline, including analyzed channels, sentiment scores, and techniques used.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Maximum number of analyses to retrieve (defaults to 10)'),
  }),
  execute: async ({ limit }: { limit?: number }): Promise<{ analyses: DailyAnalysis[] | null; error?: string }> => {
    try {
      const analyses = await getRecentDailyAnalyses(limit ?? 10)
      return { analyses }
    } catch (error: unknown) {
      const err = error as Error
      return { analyses: null, error: `Failed to retrieve daily analyses: ${err.message}` }
    }
  },
})

export const getDailyAnalysisByVideoIdTool = tool({
  description: "Retrieves a specific video's detailed analysis from the pipeline by its YouTube Video ID.",
  inputSchema: z.object({
    videoId: z.string().describe('The YouTube video ID to fetch'),
  }),
  execute: async ({ videoId }: { videoId: string }): Promise<{ analysis: DailyAnalysis | null; error?: string }> => {
    try {
      const analysis = await getDailyAnalysisByVideoId(videoId)
      return { analysis }
    } catch (error: unknown) {
      const err = error as Error
      return { analysis: null, error: `Failed to retrieve video analysis: ${err.message}` }
    }
  },
})

export const getRecentPredictionsTool = tool({
  description: 'Retrieves recent scored or open market predictions and their outcomes from the pipeline ledger.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Maximum number of predictions to retrieve (defaults to 10)'),
  }),
  execute: async ({ limit }: { limit?: number }): Promise<{ predictions: Prediction[] | null; error?: string }> => {
    try {
      const predictions = await getRecentPredictions(limit ?? 10)
      return { predictions }
    } catch (error: unknown) {
      const err = error as Error
      return { predictions: null, error: `Failed to retrieve predictions: ${err.message}` }
    }
  },
})

export const getPredictionByVideoIdTool = tool({
  description: "Retrieves a specific prediction's tracking status by its YouTube Video ID.",
  inputSchema: z.object({
    videoId: z.string().describe('The YouTube video ID to fetch'),
  }),
  execute: async ({ videoId }: { videoId: string }): Promise<{ prediction: Prediction | null; error?: string }> => {
    try {
      const prediction = await getPredictionByVideoId(videoId)
      return { prediction }
    } catch (error: unknown) {
      const err = error as Error
      return { prediction: null, error: `Failed to retrieve prediction: ${err.message}` }
    }
  },
})

export const getTechniqueLedgerEntriesTool = tool({
  description: 'Retrieves technical indicator metrics, usage counts, hit rates, and recent validation examples. If a techniqueName is provided, returns metrics for that specific indicator; otherwise, returns the complete technique ledger.',
  inputSchema: z.object({
    techniqueName: z.string().optional().describe('The specific technical analysis technique name to filter by (optional)'),
  }),
  execute: async ({ techniqueName }: { techniqueName?: string }): Promise<{ entries: TechniqueLedgerEntry[] | null; error?: string }> => {
    try {
      if (techniqueName) {
        const entry = await getTechniqueLedgerEntry(techniqueName)
        return { entries: entry ? [entry] : [] }
      }
      const entries = await getAllTechniqueLedgerEntries()
      return { entries }
    } catch (error: unknown) {
      const err = error as Error
      return { entries: null, error: `Failed to retrieve technique ledger: ${err.message}` }
    }
  },
})
