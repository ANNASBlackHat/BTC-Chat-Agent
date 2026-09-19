/**
 * @btc-chat/shared
 * Platform-agnostic code shared between the Next.js web app and the Expo mobile app.
 *
 * - types: MongoDB pipeline + chat collection interfaces
 * - hooks: reusable React hooks (network calls go through getApiBaseUrl)
 * - lib:   utilities (cn, api base URL, message mapper, auth token store)
 *
 * Server-only code (MongoDB, LLM, tools, prompts) intentionally stays in apps/web.
 */

export * from './types';
export * from './lib/utils';
export * from './lib/api';
export * from './lib/messages';
export * from './lib/authToken';
export { usePosition } from './hooks/usePosition';
