/**
 * Common TypeScript interfaces for the pipeline data and chat application collections.
 * Defined in accordance with the Database Schemas specification.
 */

/**
 * 1. AgentMemory
 * Contains distilled market consensus, active predictions, and analytical rules.
 * Retrieved from the read-only `agent_memory` collection.
 */
export interface AgentMemory {
  _id?: string;
  last_updated: string;                 // ISO 8601 Timestamp
  market_narrative: string;             // Broad summary of the structural state
  key_levels_consensus: {
    support: number[];                  // Clustered key support prices
    resistance: number[];                // Clustered key resistance prices
  };
  technique_insights: string[];         // Text observations on indicator accuracy
  channel_reliability: Record<
    string,
    {
      recent_accuracy: number;          // 0 to 1 percentage representing correct calls
      note: string;                     // Contextual behavior details
    }
  >;
  open_predictions: Array<{
    channel: string;                    // YouTube content source channel name
    direction: "long" | "short";        // Forecasted direction
    target: number | null;              // Price target (null if directional only)
    by_date: string;                    // ISO date string target completion deadline
    confidence: "high" | "medium" | "low";
    scenario: string;                   // Text describing conditions
  }>;
  agent_current_view: string;           // Overall bias of the model
  agent_reflection: string;             // Meta-evaluation of past accuracy failures
}

/**
 * 2. DailyAnalysis
 * Holds records of each individual video source analyzed by the pipeline.
 * Retrieved from the read-only `daily_analyses` collection.
 */
export interface DailyAnalysis {
  _id?: string;
  video_id: string;                     // Unique YouTube Video ID
  channel_id: string;                   // YouTube Channel ID
  channel_name: string;                 // Source channel name (e.g. CilinixCrypto)
  analysis_date: string;                // Date processed format: YYYY-MM-DD
  schema_version: string;               // Database parsing version
  btc_price_mentioned: number | null;   // BTC price at video capture
  market_structure: "bullish" | "bearish" | "ranging" | "unclear";
  techniques_used: Array<{
    name: string;                       // Technique name (e.g. CVD, RSI, Orderbook)
    timeframe: string | null;           // 1h, 4h, Daily, etc.
    signal: "bullish" | "bearish" | "neutral";
  }>;
  predictions: {
    primary: {
      scenario: string;
      direction: "long" | "short" | "neutral";
      target: number | null;
      timeframe: string;
      confidence: "high" | "medium" | "low";
      invalidation: string | null;
    } | null;
    scenarios: Array<{
      label: string;                    // "Bull Case", "Bear Case"
      condition: string;
      target: number | null;
      probability: string | null;
    }>;
    short_term: string | null;          // Narrative on near-term movement
    long_term: string | null;           // Narrative on macro trend
    narrative: string | null;           // Broader context
  };
  key_levels: {
    support: number[];                  // Explicit support levels noted by channel
    resistance: number[];               // Explicit resistance levels noted by channel
  };
  catalysts: string[];                  // Macro events, FOMC, CPI, halving impacts
  contrarian_view: string | null;       // Opposing arguments identified
  sentiment_score: number;              // Numeric representation: -2 (extremely bearish) to +2 (extremely bullish)
  summary: string;                      // Distilled summary of the complete video transcript
}

/**
 * 3. Prediction
 * Used to score individual forecasting declarations.
 * Retrieved from the read-only `predictions` collection.
 */
export interface Prediction {
  _id?: string;
  video_id: string;                     // Source video reference ID
  channel_name: string;                 // Channel name
  prediction_date: string;              // ISO Date the prediction was declared
  direction: "long" | "short";          // Direction
  target: number;                       // Expressed price target
  timeframe: string;                    // Declared timeframe description
  target_date: string;                  // Resolved deadline target: YYYY-MM-DD
  confidence: "high" | "medium" | "low";
  invalidation: string | null;          // Price level triggering failure
  actual_price: number | null;          // BTC price reached at evaluation time
  outcome: "correct" | "partial" | "wrong" | null; // Resolved outcome status
  accuracy_score: number | null;        // Score index (0 to 100)
}

/** Alias mapping to ScoredPrediction for database collection schema consistency */
export type ScoredPrediction = Prediction;

/**
 * 4. TechniqueLedgerEntry
 * Aggregated tracking of technical analysis indicators across all video analysis processes.
 * Retrieved from the read-only `technique_ledger` collection.
 */
export interface TechniqueLedgerEntry {
  _id?: string;
  technique_name: string;               // Name of indicator (e.g. "Orderbook Liquidity")
  description: string | null;
  times_used: number;                   // Total times identified across videos
  correct_calls: number;                // Total successful forecasts using indicator
  hit_rate: number;                     // Decimal ratio (correct_calls / times_used)
  best_market_condition: string | null; // Bullish, Ranging, High-Vol, etc.
  recent_examples: Array<{
    date: string;                       // YYYY-MM-DD
    correct: boolean;                   // Did the signal resolve successfully
    condition: string;                  // Market state context
    note: string;                       // Brief writeup of technique setup
  }>;
  last_updated: string;                 // ISO 8601 string
}

/** Alias mapping to TechniqueLedger for database collection schema consistency */
export type TechniqueLedger = TechniqueLedgerEntry;

/**
 * 5. UserPosition
 * Maintains the active trade entry details for the user.
 * Read-write access to the `user_position` collection.
 */
export interface UserPosition {
  _id?: string;
  direction: "long" | "short";
  entry_price: number;
  updated_at: string;                   // ISO 8601 Timestamp
}

/**
 * 6. PositionContext
 * Contextual representation of the user's active trade position.
 * Passed to backend/LLM layers to frame analysis around entry levels.
 */
export interface PositionContext {
  direction: "long" | "short";
  entry_price: number;
}

/**
 * 7. ChatMessage
 * Represents a single message in a chat session.
 */
export interface ChatMessage {
  role: "user" | "assistant";
  content: string;                      // Raw chat message text (markdown formatting allowed)
  timestamp: string;                  // ISO 8601 Timestamp
}

/**
 * 8. ChatSession
 * Stores past conversation structures.
 * Read-write access to the `chat_sessions` collection.
 */
export interface ChatSession {
  _id?: string;
  session_id: string;                   // Unique UUID v4 key
  started_at: string;                   // ISO 8601 Timestamp
  position_at_start: PositionContext | null; // Captured status of user position at session init
  messages: ChatMessage[];
}

/**
 * 9. ToolInvocation
 * Represents a single background LLM tool call execution step.
 */
export interface ToolInvocation {
  toolCallId: string;
  toolName: string;
  args: Record<string, unknown>;
  state: "call" | "result";
  result?: unknown;
}

/**
 * 10. UIMessage
 * Represents a user interface message used inside client-side streaming views.
 */
export interface UIMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt?: Date;
  toolInvocations?: ToolInvocation[];
}

