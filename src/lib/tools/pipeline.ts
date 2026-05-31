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
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getLatestAgentMemory called`)
    try {
      const memory = await getLatestAgentMemory()
      const result = { memory }
      console.log(`[${new Date().toISOString()}] [TOOL] getLatestAgentMemory completed in ${Date.now() - startTime}ms | memory retrieved`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { memory: null, error: `Failed to retrieve agent memory: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getLatestAgentMemory failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const getRecentDailyAnalysesTool = tool({
  description: 'Retrieves recent daily video analyses from the pipeline, including analyzed channels, sentiment scores, and techniques used.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Maximum number of analyses to retrieve (defaults to 10)'),
  }),
  execute: async ({ limit }: { limit?: number }): Promise<{ analyses: DailyAnalysis[] | null; error?: string }> => {
    const startTime = Date.now()
    const resolvedLimit = limit ?? 10
    console.log(`[${new Date().toISOString()}] [TOOL] getRecentDailyAnalyses called | params: limit=${resolvedLimit}`)
    try {      
      const analyses = await getRecentDailyAnalyses(resolvedLimit)
      const result = { analyses }
      console.log(`[${new Date().toISOString()}] [TOOL] getRecentDailyAnalyses completed in ${Date.now() - startTime}ms | analyses count: ${analyses?.length}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { analyses: null, error: `Failed to retrieve daily analyses: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getRecentDailyAnalyses failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const getDailyAnalysisByVideoIdTool = tool({
  description: "Retrieves a specific video's detailed analysis from the pipeline by its YouTube Video ID.",
  inputSchema: z.object({
    videoId: z.string().describe('The YouTube video ID to fetch'),
  }),
  execute: async ({ videoId }: { videoId: string }): Promise<{ analysis: DailyAnalysis | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getDailyAnalysisByVideoId called | params: videoId=${videoId}`)
    try {
      const analysis = await getDailyAnalysisByVideoId(videoId)
      const result = { analysis }
      console.log(`[${new Date().toISOString()}] [TOOL] getDailyAnalysisByVideoId completed in ${Date.now() - startTime}ms | analysis found: ${analysis ? 'yes' : 'no'}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { analysis: null, error: `Failed to retrieve video analysis: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getDailyAnalysisByVideoId failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const getRecentPredictionsTool = tool({
  description: 'Retrieves recent scored or open market predictions and their outcomes from the pipeline ledger.',
  inputSchema: z.object({
    limit: z.number().optional().describe('Maximum number of predictions to retrieve (defaults to 10)'),
  }),
  execute: async ({ limit }: { limit?: number }): Promise<{ predictions: Prediction[] | null; error?: string }> => {
    const startTime = Date.now()
    const resolvedLimit = limit ?? 10
    console.log(`[${new Date().toISOString()}] [TOOL] getRecentPredictions called | params: limit=${resolvedLimit}`)
    try {
      const predictions = await getRecentPredictions(resolvedLimit)
      const result = { predictions }
      console.log(`[${new Date().toISOString()}] [TOOL] getRecentPredictions completed in ${Date.now() - startTime}ms | predictions count: ${predictions?.length}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { predictions: null, error: `Failed to retrieve predictions: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getRecentPredictions failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const getPredictionByVideoIdTool = tool({
  description: "Retrieves a specific prediction's tracking status by its YouTube Video ID.",
  inputSchema: z.object({
    videoId: z.string().describe('The YouTube video ID to fetch'),
  }),
  execute: async ({ videoId }: { videoId: string }): Promise<{ prediction: Prediction | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getPredictionByVideoId called | params: videoId=${videoId}`)
    try {
      const prediction = await getPredictionByVideoId(videoId)
      const result = { prediction }
      console.log(`[${new Date().toISOString()}] [TOOL] getPredictionByVideoId completed in ${Date.now() - startTime}ms | prediction found: ${prediction ? 'yes' : 'no'}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { prediction: null, error: `Failed to retrieve prediction: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getPredictionByVideoId failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})

export const getTechniqueLedgerEntriesTool = tool({
  description: 'Retrieves technical indicator metrics, usage counts, hit rates, and recent validation examples. If a techniqueName is provided, returns metrics for that specific indicator; otherwise, returns the complete technique ledger.',
  inputSchema: z.object({
    techniqueName: z.string().optional().describe('The specific technical analysis technique name to filter by (optional)'),
  }),
  execute: async ({ techniqueName }: { techniqueName?: string }): Promise<{ entries: TechniqueLedgerEntry[] | null; error?: string }> => {
    const startTime = Date.now()
    console.log(`[${new Date().toISOString()}] [TOOL] getTechniqueLedgerEntries called | params: techniqueName=${techniqueName || 'all'}`)
    try {
      if (techniqueName) {
        const entry = await getTechniqueLedgerEntry(techniqueName)
        const result = { entries: entry ? [entry] : [] }
        console.log(`[${new Date().toISOString()}] [TOOL] getTechniqueLedgerEntries completed in ${Date.now() - startTime}ms | entries count: ${result.entries.length}`)
        return result
      }
      const entries = await getAllTechniqueLedgerEntries()
      const result = { entries }
      console.log(`[${new Date().toISOString()}] [TOOL] getTechniqueLedgerEntries completed in ${Date.now() - startTime}ms | entries count: ${entries?.length}`)
      return result
    } catch (error: unknown) {
      const err = error as Error
      const result = { entries: null, error: `Failed to retrieve technique ledger: ${err.message}` }
      console.log(`[${new Date().toISOString()}] [TOOL] getTechniqueLedgerEntries failed in ${Date.now() - startTime}ms | error:`, result.error)
      return result
    }
  },
})
