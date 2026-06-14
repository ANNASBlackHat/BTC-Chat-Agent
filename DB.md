# Database Documentation: `btc_agent`

## Overview

The `btc_agent` database is designed to support an AI-driven cryptocurrency trading and analysis system, specifically focused on Bitcoin (BTC). It acts as the central knowledge graph for an agent that ingests market data and YouTube sentiment, extracts technical analysis (TA), tracks the reliability of various crypto influencers, manages market predictions, and evaluates the historical success rate of specific trading techniques.

---

## Collections Breakdown

The database consists of 7 collections that manage the pipeline from raw video ingestion to final trade positioning.

### 1. `agent_memory`

Acts as the global state and macro-perspective of the AI agent. It aggregates current market context, overriding biases, and the reliability of external data sources.

* **`key_levels_consensus`**: An object containing arrays for `support` and `resistance` price levels derived from aggregate analysis.
* **`technique_insights`**: Array of string notes detailing current macro TA observations (e.g., *"Structural pivots are holding better than RSI-based indicators in this..."*).
* **`channel_reliability`**: A nested object scoring the historical accuracy of specific YouTube channels (e.g., `CryptoWorldJosh`, `TheRoadTo1M`) with properties for `accuracy` and contextual `notes`.
* **`open_predictions`**: An array tracking active macro forecasts (target, scenario, confidence, date).
* **`agent_reflection`**: A string detailing the agent's current internal bias or summary of market sentiment.

### 2. `agent_opinions`

Logs the agent’s specific market stances on given dates, operating as a historical record of its analytical thesis.

* **`opinion_date`**: The date the opinion was formed.
* **`direction`**: The forecasted market move (e.g., "down", "up").
* **`price_target`**: The specific numerical price target.
* **`reasoning`**: A text description explaining the logic behind the opinion (e.g., *"The breakdown below 74,400 confirms strong bearish sentiment..."*).
* **`techniques_cited`**: An array of TA concepts used to justify the opinion (e.g., "Volume analysis", "Support/resistance levels").
* **`actual_price`** / **`outcome`**: Fields to later grade the opinion once the market moves.

### 3. `daily_analyses`

The largest data store, containing the granular, daily data extracted from specific YouTube videos.

* **`video_id`** / **`channel_id`** / **`channel_name`**: Metadata linking the analysis to its source.
* **`analysis_date`**: When the video was analyzed.
* **`catalysts`**: Array of macro events mentioned (e.g., "US stock market all-time highs", "Liquidity Building above price").
* **`key_levels`**: Extracted support and resistance arrays from the specific video.
* **`market_structure`**: The overarching sentiment of the video (e.g., "Bullish").
* **`predictions`**: An object breaking down the video's primary target and alternate scenarios.
* **`techniques_used`**: An array of objects detailing the TA used in the video (name, timeframe, signal).
* **`raw_transcription`**: Snippet of the video's transcript.
* **`sentiment_score`** / **`summary`**: AI-generated overviews of the video content.

### 4. `predictions`

Tracks specific, quantifiable market predictions extracted from the ingested content to calculate accuracy and channel reliability.

* **`target_date`** / **`prediction_date`**: Timestamps for when the prediction was made and its target horizon.
* **`video_id`** / **`channel_name`**: The source of the prediction.
* **`target`**: The expected price level.
* **`direction`**: "up" or "down".
* **`confidence`**: Assessed confidence level (e.g., "High").
* **`timeframe`**: Expected duration for the move (e.g., "Multiple weeks to months").
* **`invalidation`**: The specific market condition that would render the prediction null (e.g., *"getting back above the 72000 to 76000 area"*).
* **`outcome`** / **`accuracy_score`**: Post-event grading (e.g., "Partial", "Correct").

### 5. `processed_videos`

An ingestion ledger that tracks the pipeline status of targeted YouTube videos.

* **`video_id`** / **`channel_id`** / **`channel_name`**: Video identifiers.
* **`title`**: The raw title of the YouTube video.
* **`processed_at`**: Timestamp of ingestion.
* **`status`**: Current state in the data pipeline (e.g., "done").

### 6. `technique_ledger`

A meta-analysis collection that grades the historical effectiveness of specific technical indicators and chart patterns.

* **`technique_name`**: The name of the TA concept (e.g., "Support/Resistance Flip", "Three-Day (3D) Candle Close").
* **`best_market_condition`**: The environment where the technique performs best (e.g., "Ranging/Consolidating", "Trending bearish with structural breakdown.").
* **`times_used`** / **`correct_calls`** / **`hit_rate`**: Quantitative metrics tracking the technique's win rate.
* **`recent_examples`**: An array of historical instances where the technique was applied, logging the date, outcome (`correct: true/false`), and context notes.

### 7. `user_position`

Tracks the human user's active, real-world trading position to contextualize the agent's alerts and risk parameters.

* **`direction`**: Current market exposure (e.g., "long").
* **`entry_price`**: The specific price at which the position was opened (e.g., `64482`).
* **`updated_at`**: Timestamp of the last position change.

---

Collection: agent_memory
├── _id: ObjectId
├── key_levels_consensus: Object
│   ├── support: Array<Number>
│   └── resistance: Array<Number>
├── technique_insights: Array<String>
├── channel_reliability: Object
│   └── [dynamic_channel_name]: Object
│       ├── accuracy: Number
│       └── notes: String
├── open_predictions: Array<Object>
│   ├── target: Number
│   ├── scenario: String
│   ├── confidence: Number
│   └── date: String
└── agent_reflection: String

Collection: agent_opinions
├── _id: ObjectId
├── opinion_date: String
├── actual_price: Number | Null
├── direction: String
├── outcome: String | Null
├── price_target: Number
├── reasoning: String
├── reflection: String | Null
└── techniques_cited: Array<String>

Collection: daily_analyses
├── _id: ObjectId
├── analysis_date: String
├── btc_price_mentioned: Number | Null
├── catalysts: Array<String>
├── channel_id: String
├── channel_name: String
├── contrarian_view: String | Null
├── key_levels: Object
│   ├── support: Array<Number>
│   └── resistance: Array<Number>
├── market_structure: String
├── predictions: Object
│   ├── primary: Object
│   ├── scenarios: Array<Object>
│   └── long_term: String
├── raw_transcription: String
├── schema_version: String
├── sentiment_score: Number
├── summary: String
├── techniques_used: Array<Object>
│   ├── name: String
│   ├── timeframe: String
│   └── signal: String
└── video_id: String

Collection: predictions
├── _id: ObjectId
├── target_date: String
├── video_id: String
├── accuracy_score: Number
├── actual_price: Number
├── channel_name: String
├── confidence: String
├── direction: String
├── invalidation: String
├── outcome: String
├── prediction_date: String
├── target: Number
└── timeframe: String

Collection: processed_videos
├── _id: ObjectId
├── channel_id: String
├── channel_name: String
├── processed_at: String
├── status: String
├── title: String
└── video_id: String

Collection: technique_ledger
├── _id: ObjectId
├── technique_name: String
├── best_market_condition: String
├── correct_calls: Number
├── description: String
├── hit_rate: Number
├── last_updated: String
├── recent_examples: Array<Object>
│   ├── date: String
│   ├── context: String
│   ├── correct: Boolean
│   └── note: String
└── times_used: Number

Collection: user_position
├── _id: ObjectId
├── direction: String
├── entry_price: Number
└── updated_at: String