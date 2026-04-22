// Cloudflare Pages Function: GET /api/installer?token=<installer-token>
//
// Verifies the short-lived installer token (HMAC-SHA256 signed with
// INSTALLER_TOKEN_SECRET) and streams the platform-specific installer from
// the R2 bucket back to the caller. The token carries the email, platform,
// and purpose, so the download link is bound to the lead or customer who
// requested it.
//
// Bindings configured on the Pages project:
//   - Secret: INSTALLER_TOKEN_SECRET
//   - R2 bucket binding: INSTALLERS  (recommended bucket name: psygil-installers)
//   - Optional env var: INSTALLER_VERSION (defaults to 'latest')

import { verifyInstallerToken, type InstallerPlatform } from '../_lib/crypto';

interface Env {
  INSTALLER_TOKEN_SECRET: string;
  INSTALLERS: R2Bucket;
  INSTALLER_VERSION?: string;
}

interface PlatformFile {
  readonly keySuffix: string;
  readonly filename: string;
  readonly mime: string;
}

const PLATFORM_FILES: Record<InstallerPlatform, PlatformFile> = {
  mac: {
    keySuffix: 'Psygil.dmg',
    filename: 'Psygil.dmg',
    mime: 'application/x-apple-diskimage',
  },
  windows: {
    keySuffix: 'Psygil-Setup.exe',
    filename: 'Psygil-Setup.exe',
    mime: 'application/vnd.microsoft.portable-executable',
  },
};

export const onRequestGet: PagesFunction<Env> = async (ctx) => {
  const url = new URL(ctx.request.url);
  const token = url.searchParams.get('token');
  if (!token) {
    return textResponse('Missing token', 400);
  }

  if (!ctx.env.INSTALLER_TOKEN_SECRET) {
    return textResponse('Installer downloads are not configured yet.', 503);
  }

  const payload = await verifyInstallerToken(ctx.env.INSTALLER_TOKEN_SECRET, token);
  if (!payload) {
    return textResponse(
      'Invalid or expired download link. Request a new link from the download page.',
      403,
    );
  }

  const fileInfo = PLATFORM_FILES[payload.platform];
  if (!fileInfo) {
    return textResponse('Unsupported platform', 400);
  }

  if (!ctx.env.INSTALLERS) {
    return textResponse('Installer bucket is not bound to this project.', 503);
  }

  const version = ctx.env.INSTALLER_VERSION ?? 'latest';
  const key = `${version}/${fileInfo.keySuffix}`;

  const object = await ctx.env.INSTALLERS.get(key);
  if (!object) {
    return textResponse(`Installer not found in bucket at ${key}`, 404);
  }

  const headers = new Headers();
  headers.set('Content-Type', fileInfo.mime);
  headers.set('Content-Disposition', `attachment; filename="${fileInfo.filename}"`);
  headers.set('Cache-Control', 'no-store');
  headers.set('X-Content-Type-Options', 'nosniff');
  if (typeof object.size === 'number') {
    headers.set('Content-Length', String(object.size));
  }

  return new Response(object.body, { status: 200, headers });
};

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
