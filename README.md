# 🪙 btc-chat-agent

A highly responsive, premium Bitcoin chat companion that acts as a trader's thinking partner. It combines real-time data fetching, strict security gates, and structured access to a separate daily pipeline database to deliver deep, context-aware trading insights tailored precisely to the user's active trade position.

---

## 🚀 Key Features

* **Real-time Price Engine**: Fetches live spot market OHLCV and ticker data from Binance REST APIs.
* **Cached Singleton Database client**: Integrated with MongoDB using strict connection-pooling patterns optimized for serverless executions.
* **Adaptive Prompt Engine**: Frames every conversation dynamically around the user's active simulated trade coordinates (direction, entry price, distance, and health score).
* **Decoupled LLM Factory**: Hot-swappable AI provider layer, keeping API endpoints independent from specific vendor libraries (e.g., Google Gemini).
* **Strict Security Guard**: Next.js Edge Proxy intercepts all routes, gating them behind a JWT cookie authentication layer.
* **Premium UI/UX**: Pitch-dark terminal theme with subtle glow filters, glassmorphic panels, and animated tool execution indicators.

---

## 🧠 Dynamic Chat Modes

The chat agent continuously monitors user inputs, statements, and queries to shift its conversational persona dynamically across three distinct profiles:

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

1. **Analyst Mode (Default)**:
   * **Trigger**: Standard market questions or casual prompts (e.g., *"What is the current resistance?"*).
   * **Style**: Objective, technical, and data-focused. Utilizes quantitative analysis and extracts structural observations directly from pipeline logs.
2. **Devil's Advocate Mode**:
   * **Trigger**: When the user states a strong market thesis or opinion (e.g., *"Bitcoin will break past $100k next week!"*).
   * **Style**: Argumentative, inquisitive, and risk-aware. Challenges assumptions by presenting historical counter-evidence, sell-side risks, and contrarian pipeline data to help the trader avoid cognitive bias.
3. **Tutor Mode**:
   * **Trigger**: Queries regarding technical indicators, math, or definitions (e.g., *"How is CVD calculated?"*).
   * **Style**: Clear, educational, and historically grounded. Uses real instances and metrics logged in the database rather than dry textbook jargon to illustrate concepts.

---

## ⚙️ Environment Variables

The application relies on the following configurations. Create a `.env` file in the root directory based on [.env.example](.env.example):

| Variable | Description | Example |
| :--- | :--- | :--- |
| `LLM_PROVIDER` | Active AI provider framework | `gemini` |
| `LLM_MODEL` | Specific LLM model identifier | `gemini-flash-lite-latest` |
| `GOOGLE_API_KEY` | Credentials for Google Gemini API | `AIzaSy...` |
| `MONGODB_URI` | Connection string for MongoDB | `mongodb+srv://...` |
| `APP_PASSWORD` | Access gate password | `makestories4impact` |

---

## 💻 Local Development

### 1. Prerequisite Installations
Ensure you have **Node.js 20+** installed on your system.

### 2. Configure Environment
Copy the example variables file:
```bash
cp .env.example .env
```
Open `.env` and insert your API keys and credentials.

### 3. Install Dependencies
```bash
npm install
```

### 4. Boot Development Server
Run the dev task to start the application locally:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser. The standard proxy will redirect you to `/login`. Sign in using your configured `APP_PASSWORD`.

---

## 🚀 Production Deployment on Vercel

The **btc-chat-agent** is engineered out-of-the-box for smooth serverless deployments on the Vercel platform.

### Standard Git-Connected Deployment (Recommended)
1. Push your repository to **GitHub**, **GitLab**, or **Bitbucket**.
2. Visit the [Vercel Dashboard](https://vercel.com/dashboard) and click **"New Project"**.
3. Import your repository.
4. Expand the **Environment Variables** section and insert the keys outlined in the **Environment Variables** section.
5. Click **"Deploy"**. Vercel will automatically analyze `vercel.json`, detect Next.js, and compile optimized static assets.

### Vercel CLI Deployment
If you prefer deploying directly from your terminal, execute the following commands:

```bash
# 1. Install the Vercel CLI globally if not already installed
npm install -g vercel

# 2. Login to your Vercel account
vercel login

# 3. Trigger the deployment wizard (link project and configure variables)
vercel
```
