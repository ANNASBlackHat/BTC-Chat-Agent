# Document 4: Implementation Roadmap

This document outlines the sequential, 10-session implementation roadmap for building the **btc-chat-agent**. Each session is isolated, highly focused, and specifies clear target files, dependencies, verification plans, and checkpoint criteria.

---

## 🗺️ Build Roadmap Overview

```text
┌────────────────────────────────────────────────────────┐
│                        Build Order                     │
├───────┬─────────────────────────────┬──────────────────┤
│ Phase │ Description                 │ Deliverables     │
├───────┼─────────────────────────────┼──────────────────┤
│ 1     │ Scaffold & Configurations   │ Base configs     │
│ 2     │ Password Auth Middleware    │ Edge middleware  │
│ 3     │ Database Layer Setup        │ DB client & helper│
│ 4     │ LLM Swappable Provider      │ LLM factory      │
│ 5     │ Agent Tools Engine          │ Custom SDK tools │
│ 6     │ Dynamic System Prompts      │ Prompt engine    │
│ 7     │ API Route Orchestration     │ API routes       │
│ 8     │ Frontend UI Components      │ Chat components  │
│ 9     │ Chat Page & State Hook      │ Chat page UI     │
│ 10    │ Deployment & Configuration  │ Vercel configs   │
└───────┴─────────────────────────────┴──────────────────┘
```

---

## 🛠️ Step-by-Step Implementation Guide

### 🏁 Phase 1: Scaffold & Project Configurations
* **Objective:** Verify absolute scaffolding setup and configure TypeScript and standard environment variables.
* **Target Files:**
  * `package.json`
  * `tsconfig.json`
  * `postcss.config.mjs`
  * `eslint.config.mjs`
  * `.env.example`
* **Dependencies:** None.
* **Verification Plan:**
  * Run `npm run lint` to confirm configuration files validate correctly.
  * Execute `npm run dev` to ensure Next.js starts without build problems.
* **Checkpoint:** Next.js development server starts and compiles the bare UI on port 3000.

---

### 🔒 Phase 2: Password Authentication Middleware
* **Objective:** Establish the HTTP-only cookie-based password gate. Users are redirected to `/login` if unauthorized.
* **Target Files:**
  * [NEW] `middleware.ts` (Root level)
  * [NEW] `src/lib/auth.ts` (Core authentication checking logic)
  * [NEW] `src/app/login/page.tsx` (Login input interface)
  * [NEW] `src/app/api/auth/route.ts` (Endpoint validating password and issuing JWT/Session Cookie)
* **Dependencies:** Phase 1.
* **Verification Plan:**
  * Open `/chat` in incognito browser mode; verify automatic redirect to `/login`.
  * Enter an incorrect password; verify error messages are rendered.
  * Enter the correct password (matching `APP_PASSWORD`); verify successful cookie injection and redirect to `/chat`.
* **Checkpoint:** All routes except `/login` and `/api/auth` are locked behind the cookie authentication check.

---

### 🔌 Phase 3: Database Client & Helper Layer
* **Objective:** Implement the singleton `MongoClient` connection cache and build type-safe read/write queries.
* **Target Files:**
  * [NEW] `src/types/index.ts` (Common TS interfaces for MongoDB records and API layers)
  * [NEW] `src/lib/db/client.ts` (Singleton client pattern)
  * [NEW] `src/lib/db/queries.ts` (Strictly typed MongoDB helpers for fetching pipeline analytics and positions)
* **Dependencies:** Phase 2.
* **Verification Plan:**
  * Create a temporary script `src/lib/db/test-db.ts` or a temporary api endpoint.
  * Run a query using the singleton to retrieve a sample record from the pipeline's `agent_memory` collection. Assert successful log output.
* **Checkpoint:** Database connectivity established via a single, cached client instances, with queries logging expected TS outputs.

---

### 🧠 Phase 4: Swappable LLM Provider Layer
* **Objective:** Build the factory layer that decouples model providers, enabling hot-swapping models via environment configurations.
* **Target Files:**
  * [NEW] `src/lib/llm/interface.ts` (Provider contracts)
  * [NEW] `src/lib/llm/gemini.ts` (Google provider)
  * [NEW] `src/lib/llm/index.ts` (Dynamic import resolver factory)
* **Dependencies:** Phase 1.
* **Verification Plan:**
  * Set `LLM_PROVIDER=gemini`. Verify that `getLLMProvider()` successfully resolves and loads the Google instance with model matching `LLM_MODEL`.
* **Checkpoint:** Swappable provider framework correctly isolates provider libraries behind standard interfaces.

---

### 🛠️ Phase 5: Agent Tools Engine
* **Objective:** Define all the tools available to the LLM agent using Vercel AI SDK `tool()` helpers and Zod validation.
* **Target Files:**
  * [NEW] `src/lib/tools/pipeline.ts` (Read-only pipeline database tools: memory, analysis, techniques)
  * [NEW] `src/lib/tools/price.ts` (Binance REST ticker fetcher)
  * [NEW] `src/lib/tools/session.ts` (User position setters and session helpers)
  * [NEW] `src/lib/tools/index.ts` (Unified export aggregator)
* **Dependencies:** Phase 3, Phase 4.
* **Verification Plan:**
  * Write unit tests or a runner script in `scratch/` that executes each tool directly.
  * Verify `getCurrentPrice` returns standard OHLCV/Ticker payload from Binance.
  * Verify `savePosition` successfully inserts long/short entry coordinates into MongoDB.
* **Checkpoint:** All tools return accurate, structured payloads verified through individual executions.

---

### 📋 Phase 6: Dynamic System Prompts Engine
* **Objective:** Develop the prompt builder that dynamically aggregates agent persona directives, tone hints, and current user positions.
* **Target Files:**
  * [NEW] `src/lib/prompts/system.ts` (Aggregate compiler class/method)
* **Dependencies:** Phase 3.
* **Verification Plan:**
  * Call `buildSystemPrompt(null)`. Confirm the output contains standard role guidelines and mode instructions.
  * Call `buildSystemPrompt({ direction: "long", entry_price: 67400 })`. Confirm the output contains custom injected long entry guidelines and distance warnings.
* **Checkpoint:** Dynamic compiler produces consistent system prompts containing active trade details when positions are set.

---

### 🔁 Phase 7: API Route Orchestration
* **Objective:** Build the main streaming endpoint integrating the LLM provider, prompt builder, and tools.
* **Target Files:**
  * [NEW] `src/app/api/chat/route.ts` (Streaming post endpoint)
* **Dependencies:** Phase 4, Phase 5, Phase 6.
* **Verification Plan:**
  * Trigger a `POST` request to `/api/chat` using `curl` or Postman with a simple question (e.g. *"What is the current BTC price?"*).
  * Verify the returned header is `Content-Type: text/plain; charset=utf-8` (or `text/event-stream`).
  * Verify the stream contains raw text tokens along with tool-call logs.
* **Checkpoint:** API endpoint processes input payloads, invokes correct tools, and streams response content successfully.

---

### 🎨 Phase 8: Premium Frontend Components
* **Objective:** Create the UI component layers styled to look like a premium terminal interface (dark glassmorphism, clean layouts).
* **Target Files:**
  * [NEW] `src/components/chat/ChatWindow.tsx` (Conversation logic shell)
  * [NEW] `src/components/chat/MessageList.tsx` (History grid)
  * [NEW] `src/components/chat/MessageBubble.tsx` (Markdown message bubble)
  * [NEW] `src/components/chat/InputBar.tsx` (Text inputs with prompt overrides)
  * [NEW] `src/components/chat/ToolCallIndicator.tsx` (Sleek status indicator for executing tools)
* **Dependencies:** Phase 1 (shadcn modules pre-installed).
* **Verification Plan:**
  * Render the mock components in a layout file. Check responsiveness across mobile, tablet, and widescreen viewports.
  * Verify markdown elements (headers, lists, tables) render beautifully.
* **Checkpoint:** Modern trading-terminal UI is responsive and styled correctly.

---

### 💻 Phase 9: Chat Page & Position State Hook
* **Objective:** Wire up the primary page layout and construct hooks to synchronize trading position indicators on the UI.
* **Target Files:**
  * [NEW] `src/app/chat/page.tsx` (Main Server Component entry point)
  * [NEW] `src/hooks/usePosition.ts` (Context/state sync hook)
* **Dependencies:** Phase 7, Phase 8.
* **Verification Plan:**
  * Load `/chat` page. Interact with the chat input to check streaming behavior.
  * Change trading position from the UI controls; verify immediate system prompt updates reflect new entry levels.
* **Checkpoint:** Full client-to-server chat flow completes successfully, dynamically framing results around the user's trading entry.

---

### 🚀 Phase 10: Production Build & Deployment Configuration
* **Objective:** Run production checks, compile optimization outputs, and formulate deployments scripts.
* **Target Files:**
  * [NEW] `vercel.json` (Deployment routing configurations)
  * `next.config.ts` (Optimizations configurations)
* **Dependencies:** Phase 9.
* **Verification Plan:**
  * Execute `npm run build` locally. Confirm the compiler outputs standard Next.js optimized assets without TypeScript errors.
* **Checkpoint:** Application passes all production compiler verifications.
