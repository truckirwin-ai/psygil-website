import type { Env } from '../types';

/**
 * HMAC-SHA256 signed download tokens. Format: base64url(hmac(platform|email|expires)).
 *
 * The marketing site's /download/:platform Pages Function uses the same secret to
 * verify the token before streaming the installer from R2.
 */
export async function signDownloadToken(
  env: Env,
  args: { platform: string; email: string; expires: number },
): Promise<string> {
  const payload = `${args.platform}|${args.email}|${args.expires}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.DOWNLOAD_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  return b64url(new Uint8Array(sig));
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
