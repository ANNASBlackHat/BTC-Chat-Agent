import { 
  getLatestAgentMemory, 
  getRecentDailyAnalyses, 
  getDailyAnalysisByVideoId, 
  getRecentPredictions, 
  getPredictionByVideoId, 
  getTechniqueLedgerEntry, 
  getAllTechniqueLedgerEntries, 
  getUserPosition, 
  saveUserPosition, 
  clearUserPosition, 
  getRecentChatSessions, 
  getChatSession, 
  createChatSession, 
  addMessageToSession 
} from './queries';
import { PositionContext, ChatMessage } from '@/types';

async function test() {
  console.log('--- DB Helpers Type Verification Start ---');

  // Let's assert types through local variable declarations to prove strict TS check passes
  const memoryTest: typeof getLatestAgentMemory = async () => null;
  const analysesTest: typeof getRecentDailyAnalyses = async () => [];
  const analysisByVideoTest: typeof getDailyAnalysisByVideoId = async () => null;
  const predictionsTest: typeof getRecentPredictions = async () => [];
  const predictionByVideoTest: typeof getPredictionByVideoId = async () => null;
  const ledgerTest: typeof getTechniqueLedgerEntry = async () => null;
  const allLedgersTest: typeof getAllTechniqueLedgerEntries = async () => [];
  
  const getPosTest: typeof getUserPosition = async () => null;
  const savePosTest: typeof saveUserPosition = async (pos: PositionContext) => {
    return {
      _id: 'test_id',
      direction: pos.direction,
      entry_price: pos.entry_price,
      updated_at: new Date().toISOString(),
    };
  };
  const clearPosTest: typeof clearUserPosition = async () => true;
  
  const getSessionsTest: typeof getRecentChatSessions = async () => [];
  const getSessionTest: typeof getChatSession = async () => null;
  const createSessionTest: typeof createChatSession = async (id: string, pos: PositionContext | null) => {
    return {
      _id: 'test_id',
      session_id: id,
      started_at: new Date().toISOString(),
      position_at_start: pos,
      messages: [],
    };
  };
  const addMsgTest: typeof addMessageToSession = async (id: string, msg: ChatMessage) => {
    return {
      _id: 'test_id',
      session_id: id,
      started_at: new Date().toISOString(),
      position_at_start: null,
      messages: [msg],
    };
  };

  console.log('Compile-time declarations valid:');
  console.log('  - memoryTest:', !!memoryTest);
  console.log('  - analysesTest:', !!analysesTest);
  console.log('  - analysisByVideoTest:', !!analysisByVideoTest);
  console.log('  - predictionsTest:', !!predictionsTest);
  console.log('  - predictionByVideoTest:', !!predictionByVideoTest);
  console.log('  - ledgerTest:', !!ledgerTest);
  console.log('  - allLedgersTest:', !!allLedgersTest);
  console.log('  - getPosTest:', !!getPosTest);
  console.log('  - savePosTest:', !!savePosTest);
  console.log('  - clearPosTest:', !!clearPosTest);
  console.log('  - getSessionsTest:', !!getSessionsTest);
  console.log('  - getSessionTest:', !!getSessionTest);
  console.log('  - createSessionTest:', !!createSessionTest);
  console.log('  - addMsgTest:', !!addMsgTest);

  console.log('--- DB Helpers Type Verification Complete ---');
}

test().catch(console.error);
