/**
 * Cross-platform base URL for the btc-chat-agent backend API.
 *
 * - Web (apps/web): same-origin relative requests are the default, so '' keeps
 *   existing behavior identical (fetch('/api/...') still works).
 * - Mobile (future apps/mobile): Expo inlines EXPO_PUBLIC_* env vars, so the
 *   app can point at the deployed web deployment (e.g. https://btc-chat.vercel.app).
 */
export function getApiBaseUrl(): string {
  // Expo inlines EXPO_PUBLIC_* vars at bundle time via the Metro bundler.
  const expoEnv = process.env.EXPO_PUBLIC_API_URL as string | undefined;
  if (expoEnv) return stripTrailingSlash(expoEnv);

  // Browser environments: same-origin by default.
  if (typeof window !== 'undefined' && window.location) {
    return '';
  }

  // Generic fallback (SSR / tests) — allow override via a conventional env var.
  const nodeEnv = process.env.API_BASE_URL;
  return nodeEnv ? stripTrailingSlash(nodeEnv) : '';
}

/**
 * Auth token for mobile clients. Expo inlines EXPO_PUBLIC_APP_PASSWORD at bundle
 * time (non-secret convenience credential for this single-user terminal app;
 * the same value is already compiled into the login page bundle today).
 */
export function getAppPassword(): string | undefined {
  return process.env.EXPO_PUBLIC_APP_PASSWORD as string | undefined;
}

function stripTrailingSlash(url: string): string {
  return url.endsWith('/') ? url.slice(0, -1) : url;
}
