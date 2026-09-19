import {
  getApiBaseUrl,
  getAuthToken,
  saveAuthToken,
  clearAuthToken,
  type ConversationStarter,
} from '@btc-chat/shared';

/**
 * Mobile API client.
 *
 * Auth model: the web app relies on an httpOnly cookie set by /api/auth and
 * enforced by the Next.js proxy. Mobile has no reliable cookie jar, so we
 * persist the token returned by /api/auth (expo-secure-store) and attach it
 * as an Authorization: Bearer header — the proxy accepts both.
 */

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function apiFetch(path: string, init?: RequestInit): Promise<Response> {
  const token = await getAuthToken();
  const headers = new Headers(init?.headers);
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (init?.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, { ...init, headers });
  if (res.status === 401) {
    // Token expired/invalid — drop it so the next gate check forces re-login.
    await clearAuthToken();
    throw new ApiError(401, 'Session expired. Please sign in again.');
  }
  return res;
}

export async function login(password: string): Promise<void> {
  const res = await fetch(`${getApiBaseUrl()}/api/auth`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  const data = (await res.json().catch(() => ({}))) as { token?: string; error?: string };
  if (!res.ok || !data.token) {
    throw new ApiError(res.status, data.error || 'Authentication failed.');
  }
  await saveAuthToken(data.token);
}

export async function logout(): Promise<void> {
  await clearAuthToken();
}

/** Returns true when the stored token is accepted by the proxy. */
export async function checkAuth(): Promise<boolean> {
  try {
    const res = await apiFetch('/api/position');
    return res.ok;
  } catch {
    return false;
  }
}

export interface PositionPayload {
  direction: 'long' | 'short';
  entry_price: number;
}

export async function fetchPosition(): Promise<PositionPayload | null> {
  const res = await apiFetch('/api/position');
  if (!res.ok) throw new ApiError(res.status, 'Failed to fetch position');
  const data = (await res.json()) as { position: PositionPayload | null };
  return data.position;
}

export async function fetchBtcPrice(): Promise<{ price: number; source: string } | null> {
  try {
    const res = await apiFetch('/api/price');
    if (!res.ok) return null;
    const data = (await res.json()) as { price: number; source: string };
    return { price: data.price, source: data.source };
  } catch {
    return null;
  }
}

/** Dynamic, DB-driven conversation starters (mirrors the web /chat page). */
export async function fetchStarters(): Promise<ConversationStarter[]> {
  try {
    const res = await apiFetch('/api/starters');
    if (!res.ok) return [];
    const data = (await res.json()) as { starters: ConversationStarter[] };
    return data.starters ?? [];
  } catch {
    return [];
  }
}

export async function updatePosition(
  direction: 'long' | 'short',
  entryPrice: number
): Promise<PositionPayload | null> {
  const res = await apiFetch('/api/position', {
    method: 'POST',
    body: JSON.stringify({ direction, entryPrice }),
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, data.error || 'Failed to save position');
  }
  const data = (await res.json()) as { position: PositionPayload | null };
  return data.position;
}

export async function clearPosition(): Promise<void> {
  const res = await apiFetch('/api/position', { method: 'DELETE' });
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as { error?: string };
    throw new ApiError(res.status, data.error || 'Failed to clear position');
  }
}
