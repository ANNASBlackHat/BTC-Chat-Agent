const PASSWORD = process.env.APP_PASSWORD || 'makestories4impact';

/**
 * Checks if the provided password matches the configured app password.
 */
export function verifyPassword(password: string): boolean {
  return password === PASSWORD;
}

/**
 * Generates a stable session signature using HMAC-SHA256 based on the APP_PASSWORD.
 * This runs entirely on the Web Crypto API, making it fully compatible with
 * Next.js Edge middleware runtime without relying on Node.js-only modules.
 */
export async function getSessionSignature(): Promise<string> {
  const encoder = new TextEncoder();
  const keyData = encoder.encode(PASSWORD);
  const data = encoder.encode('btc-chat-agent-session');
  
  const cryptoKey = await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  
  const signature = await crypto.subtle.sign('HMAC', cryptoKey, data);
  
  return Array.from(new Uint8Array(signature))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Verifies if the provided session token matches the expected signature.
 */
export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  try {
    const expected = await getSessionSignature();
    return token === expected;
  } catch (error) {
    console.error('Session signature verification failed:', error);
    return false;
  }
}
