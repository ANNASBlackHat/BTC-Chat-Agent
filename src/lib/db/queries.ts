import { Document, UpdateFilter } from 'mongodb';
import clientPromise from './client';
import { 
  AgentMemory, 
  DailyAnalysis, 
  Prediction, 
  TechniqueLedgerEntry, 
  UserPosition, 
  ChatSession, 
  ChatMessage, 
  PositionContext 
} from '@/types';

// Helper to get strictly typed db instance
async function getDb() {
  const client = await clientPromise;
  return client.db();
}

// Map MongoDB Document to typed interface converting ObjectID to string
function mapDocument<T>(doc: Document | null): T | null {
  if (!doc) return null;
  const { _id, ...rest } = doc;
  return {
    _id: _id ? _id.toString() : undefined,
    ...rest
  } as unknown as T;
}

// ==========================================
// Pipeline Collections (Read-Only)
// ==========================================

/**
 * Retrieves the single, latest consolidated agent memory consensus.
 */
export async function getLatestAgentMemory(): Promise<AgentMemory | null> {
  const db = await getDb();
  const doc = await db.collection('agent_memory').findOne({});
  return mapDocument<AgentMemory>(doc);
}

/**
 * Retrieves recent daily video analyses, sorted by analysis date descending.
 */
export async function getRecentDailyAnalyses(limit = 10): Promise<DailyAnalysis[]> {
  const db = await getDb();
  const docs = await db.collection('daily_analyses')
    .find({})
    .sort({ analysis_date: -1 })
    .limit(limit)
    .toArray();
  return docs.map(doc => mapDocument<DailyAnalysis>(doc)).filter((d): d is DailyAnalysis => d !== null);
}

/**
 * Retrieves a single daily analysis document by video ID.
 */
export async function getDailyAnalysisByVideoId(videoId: string): Promise<DailyAnalysis | null> {
  const db = await getDb();
  const doc = await db.collection('daily_analyses').findOne({ video_id: videoId });
  return mapDocument<DailyAnalysis>(doc);
}

/**
 * Retrieves recent prediction forecasts, sorted by prediction date descending.
 */
export async function getRecentPredictions(limit = 10): Promise<Prediction[]> {
  const db = await getDb();
  const docs = await db.collection('predictions')
    .find({})
    .sort({ prediction_date: -1 })
    .limit(limit)
    .toArray();
  return docs.map(doc => mapDocument<Prediction>(doc)).filter((p): p is Prediction => p !== null);
}

/**
 * Retrieves a single prediction by video ID.
 */
export async function getPredictionByVideoId(videoId: string): Promise<Prediction | null> {
  const db = await getDb();
  const doc = await db.collection('predictions').findOne({ video_id: videoId });
  return mapDocument<Prediction>(doc);
}

/**
 * Retrieves technique metrics from the ledger for a specific technique name.
 */
export async function getTechniqueLedgerEntry(techniqueName: string): Promise<TechniqueLedgerEntry | null> {
  const db = await getDb();
  const doc = await db.collection('technique_ledger').findOne({ technique_name: techniqueName });
  return mapDocument<TechniqueLedgerEntry>(doc);
}

/**
 * Retrieves all technique performance records from the technique ledger.
 */
export async function getAllTechniqueLedgerEntries(): Promise<TechniqueLedgerEntry[]> {
  const db = await getDb();
  const docs = await db.collection('technique_ledger')
    .find({})
    .toArray();
  return docs.map(doc => mapDocument<TechniqueLedgerEntry>(doc)).filter((t): t is TechniqueLedgerEntry => t !== null);
}

// ==========================================
// Chat Application Collections (Read-Write)
// ==========================================

/**
 * Retrieves the single active user trading position.
 */
export async function getUserPosition(): Promise<UserPosition | null> {
  const db = await getDb();
  const doc = await db.collection('user_position').findOne({});
  return mapDocument<UserPosition>(doc);
}

/**
 * Upserts the single active user position record.
 */
export async function saveUserPosition(position: PositionContext): Promise<UserPosition> {
  const db = await getDb();
  const updatedAt = new Date().toISOString();
  
  const doc = {
    direction: position.direction,
    entry_price: position.entry_price,
    updated_at: updatedAt,
  };
  
  // Replace the single active document or create a new one
  await db.collection('user_position').replaceOne(
    {},
    doc,
    { upsert: true }
  );
  
  const savedDoc = await db.collection('user_position').findOne({});
  const mapped = mapDocument<UserPosition>(savedDoc);
  if (!mapped) {
    throw new Error('Failed to retrieve upserted user position');
  }
  return mapped;
}

/**
 * Deletes the single active user position record (closing the position).
 */
export async function clearUserPosition(): Promise<boolean> {
  const db = await getDb();
  const result = await db.collection('user_position').deleteMany({});
  return result.deletedCount > 0;
}

/**
 * Retrieves recent chat sessions list.
 */
export async function getRecentChatSessions(limit = 20): Promise<ChatSession[]> {
  const db = await getDb();
  const docs = await db.collection('chat_sessions')
    .find({})
    .sort({ started_at: -1 })
    .limit(limit)
    .toArray();
  return docs.map(doc => mapDocument<ChatSession>(doc)).filter((s): s is ChatSession => s !== null);
}

/**
 * Retrieves a complete chat session structure by UUID/session_id.
 */
export async function getChatSession(sessionId: string): Promise<ChatSession | null> {
  const db = await getDb();
  const doc = await db.collection('chat_sessions').findOne({ session_id: sessionId });
  return mapDocument<ChatSession>(doc);
}

/**
 * Initializes a new chat session record.
 */
export async function createChatSession(sessionId: string, positionAtStart: PositionContext | null): Promise<ChatSession> {
  const db = await getDb();
  const session: Omit<ChatSession, '_id'> = {
    session_id: sessionId,
    started_at: new Date().toISOString(),
    position_at_start: positionAtStart,
    messages: [],
  };
  
  await db.collection('chat_sessions').insertOne(session);
  
  const doc = await db.collection('chat_sessions').findOne({ session_id: sessionId });
  const mapped = mapDocument<ChatSession>(doc);
  if (!mapped) {
    throw new Error('Failed to retrieve created chat session');
  }
  return mapped;
}

/**
 * Appends a chat message to an active session history.
 */
export async function addMessageToSession(sessionId: string, message: ChatMessage): Promise<ChatSession | null> {
  const db = await getDb();
  await db.collection('chat_sessions').updateOne(
    { session_id: sessionId },
    { 
      $push: { 
        messages: message 
      } 
    } as unknown as UpdateFilter<Document>
  );
  
  return getChatSession(sessionId);
}
