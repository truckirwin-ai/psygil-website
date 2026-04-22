// Shared Web Crypto helpers for Pages Functions.
//
// Currently covers HMAC-SHA256 sign/verify and a tiny signed-token format
// used for installer download URLs. Keep this module dependency-free so it
// compiles cleanly inside the Workers runtime.

const encoder = new TextEncoder();

export async function hmacSha256Hex(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(message));
  return bytesToHex(new Uint8Array(sig));
}

export async function hmacSha256Verify(
  secret: string,
  message: string,
  expectedHex: string,
): Promise<boolean> {
  const actual = await hmacSha256Hex(secret, message);
  return timingSafeEqualHex(actual, expectedHex);
}

function timingSafeEqualHex(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export function bytesToHex(bytes: Uint8Array): string {
  let out = '';
  for (const b of bytes) out += b.toString(16).padStart(2, '0');
  return out;
}

export function bytesToBase64Url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function base64UrlToBytes(s: string): Uint8Array {
  const padded = s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4);
  const bin = atob(padded);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

// ---------------------------------------------------------------------------
// Installer download tokens
// ---------------------------------------------------------------------------
//
// Format: base64url(JSON payload) + "." + hex HMAC-SHA256 over the base64url
// body using INSTALLER_TOKEN_SECRET. Good enough for a short-lived download
// link tied to an email + platform. The link expires; the R2 object stays.

export type InstallerPlatform = 'mac' | 'windows';

export interface InstallerTokenPayload {
  email: string;
  platform: InstallerPlatform;
  exp: number; // epoch seconds
  purpose: 'trial' | 'purchase';
}

const VALID_PLATFORMS: ReadonlySet<InstallerPlatform> = new Set(['mac', 'windows']);

export async function signInstallerToken(
  secret: string,
  payload: InstallerTokenPayload,
): Promise<string> {
  const body = bytesToBase64Url(encoder.encode(JSON.stringify(payload)));
  const sig = await hmacSha256Hex(secret, body);
  return `${body}.${sig}`;
}

export async function verifyInstallerToken(
  secret: string,
  token: string,
  nowSeconds: number = Math.floor(Date.now() / 1000),
): Promise<InstallerTokenPayload | null> {
  const dot = token.indexOf('.');
  if (dot <= 0 || dot === token.length - 1) return null;
  const body = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const ok = await hmacSha256Verify(secret, body, sig);
  if (!ok) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(new TextDecoder().decode(base64UrlToBytes(body)));
  } catch {
    return null;
  }
  if (typeof parsed !== 'object' || parsed === null) return null;
  const o = parsed as Record<string, unknown>;
  const email = typeof o.email === 'string' ? o.email : null;
  const platform = typeof o.platform === 'string' ? o.platform : null;
  const exp = typeof o.exp === 'number' ? o.exp : null;
  const purpose = typeof o.purpose === 'string' ? o.purpose : null;

  if (!email || !platform || exp === null || !purpose) return null;
  if (!VALID_PLATFORMS.has(platform as InstallerPlatform)) return null;
  if (purpose !== 'trial' && purpose !== 'purchase') return null;
  if (exp < nowSeconds) return null;

  return {
    email,
    platform: platform as InstallerPlatform,
    exp,
    purpose,
  };
}
