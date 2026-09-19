# 🪙 btc-chat-agent

A highly responsive, premium Bitcoin chat companion that acts as a trader's thinking partner. It combines real-time data fetching, strict security gates, and structured access to a separate daily pipeline database to deliver deep, context-aware trading insights tailored precisely to the user's active trade position.

Ships as a **pnpm monorepo** with a Next.js web app and an Expo mobile app sharing common code:

```
btc-chat-agent/
├── apps/
│   ├── web/                    # Next.js 16 app — API + UI (the backend for both clients)
│   └── mobile/                 # Expo (SDK 57) / React Native app — talks to the web API
└── packages/
    └── shared/                 # @btc-chat/shared — cross-platform code for both apps
```

---

## 📍 Table of Contents

- [🚀 Key Features](#-key-features)
- [📦 Monorepo Layout](#-monorepo-layout)
- [⚙️ Environment Variables](#️-environment-variables)
- [💻 Local Development](#-local-development)
  - [Web app](#web-app-nextjs)
  - [Mobile app](#mobile-app-expo)
- [🧠 Dynamic Chat Modes](#-dynamic-chat-modes)
- [🛠️ AI Agent Tools & Functions](#️-ai-agent-tools--functions)
- [🚀 Production Deployment](#-production-deployment)

---

## 🚀 Key Features

* **Real-time Price Engine**: Live BTC/USDT via Binance WebSocket (with REST fallback) on both web and mobile.
* **Cached Singleton Database Client**: MongoDB connection pooling optimized for serverless executions.
* **Adaptive Prompt Engine**: Frames every conversation dynamically around the user's active trade (direction, entry price, live P&L).
* **Decoupled LLM Factory**: Hot-swappable AI provider layer (`getLLMProvider()`), independent of vendor SDKs.
* **Strict Security Guard**: Next.js Edge proxy gates all routes — httpOnly cookie for web, `Authorization: Bearer` token for mobile.
* **Shared Core**: Types, hooks, and chat-message mapping live in one package consumed by both platforms.
* **Premium UI/UX**: Pitch-dark terminal theme on web (glassmorphic panels, tool-execution indicators) and a matching native terminal UI on mobile (bottom-sheet position editor, live P&L header).

---

## 📦 Monorepo Layout

| Path | Package | Purpose |
| :--- | :--- | :--- |
| `apps/web` | `@btc-chat/web` | Next.js 16 (App Router, Turbopack). Hosts all API routes (`/api/chat`, `/api/position`, `/api/price`, `/api/starters`, `/api/auth`) and the web UI. Acts as the **single backend** for both clients. |
| `apps/mobile` | `@btc-chat/mobile` | Expo SDK 57 / RN 0.86 client. Auth gate → chat with streaming responses, live price header, position editor, dynamic starters. |
| `packages/shared` | `@btc-chat/shared` | Platform-agnostic code: MongoDB/chat TypeScript types, `cn()`, `getApiBaseUrl()`, `usePosition` hook, `mapSdkMessageToUIMessage`, auth-token store abstraction. |

**What is shared vs. platform-specific**

| Code | Lives in | Notes |
| :--- | :--- | :--- |
| Types, `cn`, message mapper, `usePosition` | `packages/shared` | Consumed as raw TS source; Next/Turbopack and Metro both transpile it directly. |
| MongoDB, LLM providers, agent tools, prompts | `apps/web/src/lib` | **Server-only by design** — the mobile app never touches the database or LLM SDKs. |
| UI components | per app | Web: shadcn/`@base-ui/react` + Tailwind. Mobile: React Native core components with a matching dark theme. |

**Architectural rules** (enforced across the repo):

- All routing/endpoints in `apps/web/src/app/` (App Router only, no `pages/`).
- LLM SDKs (`ai`, `@ai-sdk/*`) never imported in frontend components — only in `src/app/api/chat/route.ts`.
- Always import the cached DB singleton from `apps/web/src/lib/db/client.ts`; never `new MongoClient()` elsewhere.
- Load models via `getLLMProvider()` from `apps/web/src/lib/llm/index.ts`; never import `@ai-sdk/google` directly in API routes.
- No `any` — concrete interfaces live in `packages/shared/src/types/index.ts`.

---

## ⚙️ Environment Variables

**Web** — create `apps/web/.env` (see `apps/web/.env.example`):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | Active AI provider framework | `gemini` |
| `LLM_MODEL` | Specific LLM model identifier | `gemini-flash-lite-latest` |
| `GOOGLE_API_KEY` | Credentials for Google Gemini API | `AIzaSy...` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb+srv://...` |
| `APP_PASSWORD` | Access gate password (login + session token) | `your-strong-password` |

**Mobile** — create `apps/mobile/.env` (Expo inlines `EXPO_PUBLIC_*` at bundle time; restart `expo start -c` after changing them):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `EXPO_PUBLIC_API_URL` | Base URL of the deployed web app | `http://192.168.1.20:3000` (device) or `http://localhost:3000` (simulator) |
| `EXPO_PUBLIC_APP_PASSWORD` | *Optional* — pre-fills the login screen (convenience only) | `your-strong-password` |

> For physical devices, `localhost` refers to the phone itself — use your machine's LAN IP instead.

---

## 💻 Local Development

### Prerequisites

- **Node.js 20+**
- **pnpm** (`npm i -g pnpm` or `corepack enable`)

Install everything once from the repo root:

```bash
pnpm install
```

### Web app (Next.js)

```bash
cp apps/web/.env.example apps/web/.env   # then fill in your credentials
pnpm dev                                  # runs @btc-chat/web on http://localhost:3000
```

Open [http://localhost:3000](http://localhost:3000) — the edge proxy redirects to `/login`. Sign in with your `APP_PASSWORD`.

Other root scripts:

```bash
pnpm build       # production build of the web app
pnpm lint        # eslint for the web app
pnpm typecheck   # tsc --noEmit for all three packages
```

### Mobile app (Expo)

```bash
cd apps/mobile
cp .env.example .env    # if present; otherwise create .env with EXPO_PUBLIC_API_URL (+ optional password)
npx expo start          # scan the QR code with Expo Go (Android/iOS)
```

How the mobile app works:

1. **Auth gate** — on launch it validates any stored session token against `/api/position`; if invalid, shows the login screen.
2. **Login** — posts the password to `/api/auth` and stores the returned token in `expo-secure-store`; every request sends it as `Authorization: Bearer <token>` (the web proxy accepts Bearer or cookie).
3. **Streaming chat** — React Native's fetch can't stream, so the AI SDK transport uses `expo/fetch` (SDK 52+) against the same `/api/chat` endpoint and UI message stream protocol as web.
4. **Live price** — Binance WebSocket with the same reconnect/backoff strategy as web, pausing via React Native `AppState` instead of tab visibility.
5. **Position & starters** — tappable header chip opens a bottom-sheet position editor; dynamic conversation starters load from `/api/starters` (same DB-driven data the web page server-renders). The position refreshes after each agent turn since its tools may change it.

---

## 🧠 Dynamic Chat Modes

The chat agent continuously monitors user inputs to shift its conversational persona across three profiles:

```
┌──────────────────────────────────────────────┐
│             Determined Intent                │
└──────────────────────┬───────────────────────┘
                       │
       ┌───────────────┼───────────────┐
       ▼               ▼               ▼
[ Analyst Mode ] [ Devil's Advocate ] [ Tutor Mode ]
  Objective &      Contrarian &         Instructive &
  Analytical       Risk-Aware           Data-Backed
```

1. **Analyst Mode (Default)** — *Trigger:* standard market questions (*"What is the current resistance?"*). *Style:* objective, technical, data-focused.
2. **Devil's Advocate Mode** — *Trigger:* strong market theses (*"Bitcoin will break past $100k next week!"*). *Style:* argumentative, inquisitive, risk-aware; challenges assumptions with counter-evidence.
3. **Tutor Mode** — *Trigger:* indicator/math/definition questions (*"How is CVD calculated?"*). *Style:* clear, educational, grounded in real database metrics rather than textbook jargon.

---

## 🛠️ AI Agent Tools & Functions

The agent uses Vercel AI SDK `tool()` helpers with zod-validated parameters. Multi-step reasoning (`stopWhen: stepCountIs(5)`) lets it fetch a position, pull live prices, and read pipeline records sequentially in one turn.

| Tool | File (relative to `apps/web/`) | Parameters | Used when… |
| :--- | :--- | :--- | :--- |
| `getCurrentPrice` | `src/lib/tools/price.ts` | — | Live spot price / P&L calculations |
| `getCurrentPosition` | `src/lib/tools/session.ts` | — | Verifying the active simulated trade |
| `updateUserPosition` | `src/lib/tools/session.ts` | `direction`, `entryPrice` | User opens/adjusts a position |
| `clearActivePosition` | `src/lib/tools/session.ts` | — | User closes their trade |
| `getLatestAgentMemory` | `src/lib/tools/pipeline.ts` | — | Consensus summaries, key levels, narratives |
| `getRecentDailyAnalyses` | `src/lib/tools/pipeline.ts` | `limit?` | Browsing recent daily video analyses |
| `getDailyAnalysisByVideoId` | `src/lib/tools/pipeline.ts` | `videoId` | Diving into one video's analysis |
| `getRecentPredictions` | `src/lib/tools/pipeline.ts` | `limit?` | Open/resolved prediction ledger |
| `getPredictionByVideoId` | `src/lib/tools/pipeline.ts` | `videoId` | Accuracy tracking for one video |
| `getTechniqueLedgerEntries` | `src/lib/tools/pipeline.ts` | `techniqueName?` | Indicator hit-rates & reliability |
| `getPriceAlerts` | `src/lib/tools/alert.ts` | — | Listing existing Telegram alerts (dedupe) |
| `createPriceAlert` | `src/lib/tools/alert.ts` | `targetPrice`, `direction?`, `symbol?`, … | Setting standard/trailing price alerts |
| `suggestFollowUps` | `src/lib/tools/suggestions.ts` | — | Always called at the end of a turn |

The streaming orchestrator lives in [`apps/web/src/app/api/chat/route.ts`](apps/web/src/app/api/chat/route.ts) using `streamText` + `toUIMessageStreamResponse()`.

---

## 🚀 Production Deployment

### Web (Vercel)

1. Push the repository to GitHub/GitLab/Bitbucket.
2. In the [Vercel Dashboard](https://vercel.com/dashboard), create a **New Project** and import the repo.
3. Set the **Root Directory** to `apps/web` (the Next.js app lives there in this monorepo).
4. Add the web environment variables from the table above.
5. Deploy — `apps/web/vercel.json` pins the `sin1` region and configures the chat function (30 s max duration, 1 GB memory).

CLI alternative: `cd apps/web && npx vercel`.

### Mobile (EAS)

```bash
cd apps/mobile
npx eas build --platform all       # builds native binaries via Expo Application Services
```

Set `EXPO_PUBLIC_API_URL` to your production web URL before building (it is compiled into the bundle).

---

## 🧰 Troubleshooting

- **Mobile can't reach the API** — check `EXPO_PUBLIC_API_URL` (LAN IP for devices), rebuild with `npx expo start -c`, and make sure the web dev server is running.
- **401 loops on mobile** — the stored token is stale; log out (EXIT) or clear app data to force re-login.
- **Env changes don't apply on mobile** — `EXPO_PUBLIC_*` vars are inlined at bundle time; restart Metro with the cache flag.
- **Shared package edits not picked up** — both bundlers transpile `packages/shared/src` directly; restart the dev server if a watch issue appears.
