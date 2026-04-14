// Cloudflare Pages Function: /download/:platform
//
// Verifies a short-lived HMAC-signed token issued by the license server
// and streams the matching installer binary out of R2.
//
// Deploy: Cloudflare Pages picks this up automatically when the `functions/`
// directory exists in the site repo. Bindings configured in the Pages project:
//   - R2 binding: INSTALLERS -> psygil-installers bucket
//   - Env var (secret): DOWNLOAD_SIGNING_SECRET (same value as the Worker's secret)

interface Env {
  INSTALLERS: R2Bucket;
  DOWNLOAD_SIGNING_SECRET: string;
}

const PLATFORM_KEYS: Record<string, { key: string; filename: string; mime: string }> = {
  macos: { key: 'psygil-macos.dmg', filename: 'Psygil.dmg', mime: 'application/x-apple-diskimage' },
  windows: { key: 'psygil-windows.exe', filename: 'PsygilSetup.exe', mime: 'application/vnd.microsoft.portable-executable' },
  linux: { key: 'psygil-linux.AppImage', filename: 'Psygil.AppImage', mime: 'application/vnd.appimage' },
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const platform = (ctx.params.platform as string) || '';
  const spec = PLATFORM_KEYS[platform];
  if (!spec) return new Response('unknown platform', { status: 404 });

  const url = new URL(ctx.request.url);
  const token = url.searchParams.get('t');
  const expires = Number(url.searchParams.get('e') ?? '0');
  const email = url.searchParams.get('email') ?? '';

  if (!token || !expires) return new Response('missing signature', { status: 403 });
  if (expires < Math.floor(Date.now() / 1000)) return new Response('link expired', { status: 410 });

  const ok = await verifyDownloadToken(ctx.env, { platform, email, expires, token });
  if (!ok) return new Response('bad signature', { status: 403 });

  const obj = await ctx.env.INSTALLERS.get(spec.key);
  if (!obj) return new Response('installer not uploaded yet', { status: 503 });

  const headers = new Headers();
  obj.writeHttpMetadata(headers);
  headers.set('Content-Type', spec.mime);
  headers.set('Content-Disposition', `attachment; filename="${spec.filename}"`);
  headers.set('Cache-Control', 'private, max-age=0, must-revalidate');
  return new Response(obj.body, { headers });
};

async function verifyDownloadToken(
  env: Env,
  args: { platform: string; email: string; expires: number; token: string },
): Promise<boolean> {
  const payload = `${args.platform}|${args.email}|${args.expires}`;
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(env.DOWNLOAD_SIGNING_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
  const expected = b64url(new Uint8Array(sig));
  return timingSafeEqual(expected, args.token);
}

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}
