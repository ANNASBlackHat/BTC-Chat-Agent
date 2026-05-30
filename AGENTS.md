<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

---

# 🤖 Agent Playbook & Codebase Guidelines

Welcome, Agent! To ensure we build **btc-chat-agent** with absolute architectural consistency, strict type safety, and premium design standards, you **MUST** read and adhere to our structured workspace rules.

## 📁 Workspace Rules Index

All project rules, schemas, and specs are modularized in the `.agents/rules/` directory. **Always consult these documents before writing any code:**

1. [**Workspace landing page and system map** (README.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/README.md) — System boundaries, Mermaid diagrams, and complete folder layout.
2. [**Product specification** (1_product_specification.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/1_product_specification.md) — Dynamic chat modes (**Analyst**, **Devil's Advocate**, **Tutor**), core must-haves, and exclusions.
3. [**Technical architecture** (2_technical_architecture.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/2_technical_architecture.md) — Swappable LLM provider factory, cached DB singleton client pattern, dynamic prompts, and API streaming orchestrator.
4. [**Database schemas reference** (3_database_schemas.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/3_database_schemas.md) — Schema definitions for pipeline collections (read-only) and chat collections (read-write).
5. [**10-Session implementation roadmap** (4_implementation_roadmap.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/4_implementation_roadmap.md) — Structured build timeline, file targets, dependencies, and verification criteria.
6. [**Absolute rules and styling memory** (5_project_memory_and_rules.md)](file:///Users/annasblackhat/Documents/Experiment/btc-chat-agent/.agents/rules/5_project_memory_and_rules.md) — Absolute codebase constraints, coding standards, and visual layout guides.

---

## 🛑 Core Architectural Rules (Quick Summary)

You must never violate these core engineering requirements:

* **Next.js App Router only:** All routing/endpoints belong in `src/app/`. Never use `pages/`.
* **Server-Only LLM:** Never import `ai`, `@ai-sdk/google`, or other LLM modules inside frontend React components. Keep them confined to the streaming API endpoint: `src/app/api/chat/route.ts`.
* **MongoDB Singleton Client:** Always import `clientPromise` from `src/lib/db/client.ts` to use the cached singleton. Never write `new MongoClient()` in other code blocks to prevent connection leaks in serverless functions.
* **Provider Swappability:** Load the model provider using the factory function `getLLMProvider()` from `src/lib/llm/index.ts`. Never import `@ai-sdk/google` directly inside API files.
* **Vercel AI SDK Tools:** Declare all tools using Vercel AI SDK `tool()` helpers with explicit `zod` schemas validating parameters.
* **Text Streaming:** Stream responses to the client using `streamText` from `ai` and capture them using `useChat` on the frontend.
* **React Server Components (RSC):** Default to RSC. Page files (e.g., `src/app/chat/page.tsx`) must remain Server Components; restrict `"use client"` strictly to sub-components that manage client-side interactive hooks.
* **Strict TypeScript:** Strictly define concrete interfaces in `src/types/index.ts`. The `any` keyword is completely banned.
