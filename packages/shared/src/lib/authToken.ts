/**
 * Platform-agnostic auth token persistence.
 *
 * The web app uses an httpOnly cookie handled entirely by the Next.js proxy,
 * so on web these helpers are usually unused. Mobile (Expo) has no reliable
 * cookie jar, so the auth route's token is persisted via expo-secure-store
 * and attached to every request as a Bearer header.
 *
 * The active platform registers an implementation at startup:
 * - apps/web:  nothing to do (cookie-based, defaults are unused)
 * - apps/mobile: registerAuthTokenStore(secureStoreAdapter) in App.tsx
 */

export interface AuthTokenStore {
  getToken(): Promise<string | null>;
  saveToken(token: string): Promise<void>;
  removeToken(): Promise<void>;
}

const registry: { store: AuthTokenStore | null } = { store: null };

export function registerAuthTokenStore(store: AuthTokenStore): void {
  registry.store = store;
}

export async function getAuthToken(): Promise<string | null> {
  if (registry.store) return registry.store.getToken();
  // Web default: no token store registered — cookie-based auth handles it.
  return null;
}

export async function saveAuthToken(token: string): Promise<void> {
  if (registry.store) await registry.store.saveToken(token);
}

export async function clearAuthToken(): Promise<void> {
  if (registry.store) await registry.store.removeToken();
}
