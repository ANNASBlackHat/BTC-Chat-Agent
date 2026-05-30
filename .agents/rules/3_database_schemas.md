# Document 3: Database Schemas

This document provides a comprehensive schema catalog of the MongoDB collections. The database is shared between the **offline Kaggle analysis pipeline** (which writes daily) and the **Next.js chat application** (which consumes the pipeline data and maintains session state).

---

## 🔒 Collection Permissions Boundary

```text
┌────────────────────────────────────────────────────────┐
│                      MongoDB Cluster                   │
├───────────────────────────┬────────────────────────────┤
│ Pipeline Data (Read-Only) │ Chat App Data (Read-Write) │
├───────────────────────────┼────────────────────────────┤
│ • agent_memory            │ • user_position            │
│ • daily_analyses          │ • chat_sessions            │
│ • predictions             │                            │
│ • technique_ledger        │                            │
└───────────────────────────┴────────────────────────────┘
```

The Next.js chat application **must never write, modify, or insert** records into the four pipeline collections. It maintains strict read-only interactions. It maintains full read-write ownership of `user_position` and `chat_sessions`.

---

## 📂 Pipeline Collections (Read-Only)

### 1. `agent_memory`
Contains a single, highly compressed document representing the pipeline agent's distilled market consensus, active predictions, and analytical rules.

#### Schema Definition (TypeScript Interface)
```typescript
interface AgentMemory {
  _id?: any;
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
```

---

### 2. `daily_analyses`
Holds records of each individual video source analyzed by the pipeline. A single day can see multiple entries from different authors.

#### Schema Definition (TypeScript Interface)
```typescript
interface DailyAnalysis {
  _id?: any;
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
```

---

### 3. `predictions`
Used to score individual forecasting declarations. This is where calls are isolated and flagged for automated tracking against live price outcomes.

#### Schema Definition (TypeScript Interface)
```typescript
interface ScoredPrediction {
  _id?: any;
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
```

---

### 4. `technique_ledger`
Aggregated tracking of technical analysis indicators across all video analysis processes.

#### Schema Definition (TypeScript Interface)
```typescript
interface TechniqueLedger {
  _id?: any;
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
```

---

## ✍️ Chat Application Collections (Read-Write)

### 1. `user_position`
Maintains the active trade entry details for the user. Only a single active record is maintained at any given time.

#### Schema Definition (TypeScript Interface)
```typescript
interface UserPosition {
  _id?: any;
  direction: "long" | "short";
  entry_price: number;
  updated_at: string;                   // ISO 8601 Timestamp
}
```

#### Example Document
```json
{
  "_id": "65cd1b24e65bf324baef12d0",
  "direction": "long",
  "entry_price": 67450.00,
  "updated_at": "2026-05-30T10:45:00.000Z"
}
```

---

### 2. `chat_sessions`
Stores past conversation structures. While not loaded directly into context for new chats, it acts as a permanent record for retrospective analysis and performance reporting.

#### Schema Definition (TypeScript Interface)
```typescript
interface ChatSession {
  _id?: any;
  session_id: string;                   // Unique UUID v4 key
  started_at: string;                   // ISO 8601 Timestamp
  position_at_start: {
    direction: "long" | "short";
    entry_price: number;
  } | null;                             // Captured status of user position at session init
  messages: Array<{
    role: "user" | "assistant";
    content: string;                    // Raw chat message text (markdown formatting allowed)
    timestamp: string;                  // ISO 8601 Timestamp
  }>;
}
```

#### Example Document
```json
{
  "_id": "65cd1b87e65bf324baef12d1",
  "session_id": "8b5fdfca-a09c-4971-85e7-a9a79fa45cc1",
  "started_at": "2026-05-30T12:00:00.000Z",
  "position_at_start": {
    "direction": "long",
    "entry_price": 67450.00
  },
  "messages": [
    {
      "role": "user",
      "content": "Where is key resistance holding right now?",
      "timestamp": "2026-05-30T12:00:05.000Z"
    },
    {
      "role": "assistant",
      "content": "According to consolidated pipeline analyses from today, key resistances are heavily clustered at **$69,200** and **$70,500**...",
      "timestamp": "2026-05-30T12:00:12.000Z"
    }
  ]
}
```
