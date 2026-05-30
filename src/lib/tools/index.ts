import { getCurrentPrice } from './price'
import { 
  getCurrentPosition, 
  updateUserPosition, 
  clearActivePosition 
} from './session'
import { 
  getLatestAgentMemoryTool, 
  getRecentDailyAnalysesTool, 
  getDailyAnalysisByVideoIdTool, 
  getRecentPredictionsTool, 
  getPredictionByVideoIdTool, 
  getTechniqueLedgerEntriesTool 
} from './pipeline'

export const allTools = {
  getCurrentPrice,
  getCurrentPosition,
  updateUserPosition,
  clearActivePosition,
  getLatestAgentMemory: getLatestAgentMemoryTool,
  getRecentDailyAnalyses: getRecentDailyAnalysesTool,
  getDailyAnalysisByVideoId: getDailyAnalysisByVideoIdTool,
  getRecentPredictions: getRecentPredictionsTool,
  getPredictionByVideoId: getPredictionByVideoIdTool,
  getTechniqueLedgerEntries: getTechniqueLedgerEntriesTool,
}
