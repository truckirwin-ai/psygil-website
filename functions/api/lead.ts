// Cloudflare Pages Function: POST /api/lead
//
// Captures the Download page lead form (name, email, practice, city, state,
// phone, platform, action) and routes the submission to sales@psygil.com via
// Resend. Returns a placeholder trial key and a short-lived signed installer
// URL so the download.html UI can render the success state.
//
// The installer URL is a /api/installer?token=... link backed by an
// HMAC-signed token (see functions/_lib/crypto.ts). The real Ed25519-signed
// trial license is minted by the license Worker once it is deployed; today
// this endpoint returns a placeholder that matches the documented shape so
// the UI and email routing can be tested end-to-end.
//
// Bindings configured on the Pages project:
//   - Secret: RESEND_API_KEY
//   - Optional secret: INSTALLER_TOKEN_SECRET (enables signed installer URLs)
//   - Optional env var: SALES_FROM_EMAIL (defaults to "Psygil Sales <sales@psygil.com>")
//   - Optional env var: SALES_TO_EMAIL   (defaults to "sales@psygil.com")
//   - Optional env var: PUBLIC_SITE_URL  (base URL for installer links)
//   - Optional env var: INSTALLER_URL    (fallback static link if no secret is set)
//   - Optional env var: INSTALLER_TOKEN_TTL_DAYS (defaults to 14)
//   - Optional KV namespace binding: RATE_LIMIT (for per-IP rate limiting)

import { signInstallerToken, type InstallerPlatform } from '../_lib/crypto';

interface Env {
  RESEND_API_KEY: string;
  INSTALLER_TOKEN_SECRET?: string;
  SALES_FROM_EMAIL?: string;
  SALES_TO_EMAIL?: string;
  PUBLIC_SITE_URL?: string;
  INSTALLER_URL?: string;
  INSTALLER_TOKEN_TTL_DAYS?: string;
  RATE_LIMIT?: KVNamespace;
}

interface LeadPayload {
  name: string;
  email: string;
  practice_name: string;
  city: string;
  state: string;
  phone: string;
  action: 'trial' | 'purchase';
  platform: InstallerPlatform;
  website?: string;
}

interface ResendSendArgs {
  from: string;
  to: string;
  reply_to: string;
  subject: string;
  html: string;
  text: string;
}

const DEFAULT_FROM = 'Psygil Sales <sales@psygil.com>';
const DEFAULT_TO = 'sales@psygil.com';
const DEFAULT_INSTALLER_URL = 'https://downloads.psygil.com/psygil-latest-installer';
const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 5;

const VALID_ACTIONS = new Set<LeadPayload['action']>(['trial', 'purchase']);
const VALID_PLATFORMS: ReadonlySet<InstallerPlatform> = new Set(['mac', 'windows', 'linux']);

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  try {
    const ct = ctx.request.headers.get('content-type') ?? '';
    if (!ct.includes('application/json')) {
      return json({ ok: false, error: 'expected application/json' }, 415);
    }

    const raw = await ctx.request.text();
    if (raw.length > MAX_BODY_BYTES) {
      return json({ ok: false, error: 'payload too large' }, 413);
    }

    const payload = parseLeadPayload(raw);
    if (!payload.ok) {
      return json({ ok: false, error: payload.error }, 400);
    }

    // Honeypot: legitimate clients leave the `website` field blank.
    if ((payload.data.website ?? '').trim().length > 0) {
      // Fail silently with success so bots do not get a signal.
      const installerUrl = await resolveInstallerUrl(ctx, payload.data);
      return json({
        ok: true,
        action: payload.data.action,
        trial_key: generateTrialKey(),
        installer_url: installerUrl,
      });
    }

    const ip = ctx.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateOk = await checkRateLimit(ctx.env, `lead:${ip}`);
    if (!rateOk) {
      return json({ ok: false, error: 'rate limit exceeded, try again later' }, 429);
    }

    if (!ctx.env.RESEND_API_KEY) {
      return json({ ok: false, error: 'mail not configured' }, 503);
    }

    const trialKey = generateTrialKey();
    const installerUrl = await resolveInstallerUrl(ctx, payload.data);

    const from = ctx.env.SALES_FROM_EMAIL ?? DEFAULT_FROM;
    const to = ctx.env.SALES_TO_EMAIL ?? DEFAULT_TO;
    const { subject, html, text } = renderLeadEmail(payload.data, ip, trialKey, installerUrl);

    await sendViaResend(ctx.env.RESEND_API_KEY, {
      from,
      to,
      reply_to: payload.data.email,
      subject,
      html,
      text,
    });

    return json({
      ok: true,
      action: payload.data.action,
      trial_key: trialKey,
      installer_url: installerUrl,
    });
  } catch (error: unknown) {
    return json({ ok: false, error: 'internal error, try again later' }, 500);
  }
};

type ParseResult =
  | { ok: true; data: LeadPayload }
  | { ok: false; error: string };

function parseLeadPayload(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid json' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'invalid payload' };
  }
  const obj = parsed as Record<string, unknown>;

  const name = asString(obj.name, 120);
  const email = asString(obj.email, 200);
  const practiceName = asString(obj.practice_name, 200);
  const city = asString(obj.city, 120);
  const state = asString(obj.state, 80);
  const phone = asString(obj.phone, 40);
  const actionRaw = asString(obj.action, 20);
  const platformRaw = asString(obj.platform, 20) ?? 'mac';
  const website = asString(obj.website, 200) ?? '';

  if (!name) return { ok: false, error: 'name is required' };
  if (!email || !isEmail(email)) return { ok: false, error: 'valid email is required' };
  if (!practiceName) return { ok: false, error: 'practice name is required' };
  if (!city) return { ok: false, error: 'city is required' };
  if (!state) return { ok: false, error: 'state is required' };
  if (!phone) return { ok: false, error: 'phone is required' };
  if (!actionRaw || !VALID_ACTIONS.has(actionRaw as LeadPayload['action'])) {
    return { ok: false, error: 'invalid action' };
  }
  if (!VALID_PLATFORMS.has(platformRaw as InstallerPlatform)) {
    return { ok: false, error: 'invalid platform' };
  }

  return {
    ok: true,
    data: {
      name,
      email,
      practice_name: practiceName,
      city,
      state,
      phone,
      action: actionRaw as LeadPayload['action'],
      platform: platformRaw as InstallerPlatform,
      website,
    },
  };
}

async function resolveInstallerUrl(
  ctx: Parameters<PagesFunction<Env>>[0],
  lead: LeadPayload,
): Promise<string> {
  const secret = ctx.env.INSTALLER_TOKEN_SECRET;
  if (!secret) {
    // Fall back to the static placeholder URL until the signing secret is set.
    return ctx.env.INSTALLER_URL ?? DEFAULT_INSTALLER_URL;
  }

  const ttlDays = Number(ctx.env.INSTALLER_TOKEN_TTL_DAYS ?? '14');
  const expSeconds = Math.floor(Date.now() / 1000) + ttlDays * 24 * 3600;
  const token = await signInstallerToken(secret, {
    email: lead.email,
    platform: lead.platform,
    exp: expSeconds,
    purpose: lead.action,
  });

  const url = new URL(ctx.request.url);
  const base = ctx.env.PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;
  return `${base}/api/installer?token=${encodeURIComponent(token)}`;
}

function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > max) return trimmed.slice(0, max);
  return trimmed;
}

function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

async function checkRateLimit(env: Env, key: string): Promise<boolean> {
  if (!env.RATE_LIMIT) return true;
  const raw = await env.RATE_LIMIT.get(key);
  const count = raw ? Number(raw) : 0;
  if (count >= RATE_LIMIT_MAX) return false;
  await env.RATE_LIMIT.put(key, String(count + 1), {
    expirationTtl: RATE_LIMIT_WINDOW_SECONDS,
  });
  return true;
}

// Placeholder trial key generator. Matches the shape documented in
// 15_Licensing_Spec.md so the app and dashboard can recognize it, but is not
// signed. The license Worker replaces this with a real Ed25519-signed blob in
// a later build-order step.
function generateTrialKey(): string {
  const bytes = new Uint8Array(10);
  crypto.getRandomValues(bytes);
  const alphabet = '0123456789ABCDEFGHJKMNPQRSTVWXYZ'; // Crockford base32
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += alphabet[bytes[i] % 32];
  }
  return `PSG-TRIAL-${out}`;
}

function renderLeadEmail(
  p: LeadPayload,
  ip: string,
  trialKey: string,
  installerUrl: string,
): { subject: string; html: string; text: string } {
  const intent = p.action === 'trial' ? 'TRIAL' : 'PURCHASE';
  const subject = `[lead/${p.action}] ${p.name}, ${p.practice_name} (${p.city}, ${p.state})`;

  const text = `New download-page lead (${intent})

Name:           ${p.name}
Email:          ${p.email}
Practice name:  ${p.practice_name}
City:           ${p.city}
State:          ${p.state}
Phone:          ${p.phone}
Platform:       ${p.platform}
Action:         ${p.action}
IP:             ${ip}

Placeholder trial key issued: ${trialKey}
Installer URL returned:       ${installerUrl}

Note: trial key above is a placeholder generated by /api/lead. It is not
Ed25519-signed. The license Worker at license.psygil.com replaces this with
a real signed key in a later build-order step.
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:18px;margin:0 0 12px;">New download-page lead (${escapeHtml(intent)})</h1>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 20px;">
<tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td style="padding:4px 0;">${escapeHtml(p.name)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Practice name</td><td style="padding:4px 0;">${escapeHtml(p.practice_name)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">City</td><td style="padding:4px 0;">${escapeHtml(p.city)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">State</td><td style="padding:4px 0;">${escapeHtml(p.state)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${escapeHtml(p.phone)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Platform</td><td style="padding:4px 0;">${escapeHtml(p.platform)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Action</td><td style="padding:4px 0;"><strong>${escapeHtml(p.action)}</strong></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">IP</td><td style="padding:4px 0;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(ip)}</td></tr>
</table>
<h2 style="font-size:14px;margin:0 0 8px;">Placeholder issued</h2>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 16px;">
<tr><td style="padding:4px 12px 4px 0;color:#666;">Trial key</td><td style="padding:4px 0;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(trialKey)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Installer URL</td><td style="padding:4px 0;">${escapeHtml(installerUrl)}</td></tr>
</table>
<p style="color:#666;font-size:12px;">The trial key above is a placeholder generated by /api/lead. It is not Ed25519-signed. The license Worker at license.psygil.com replaces this with a real signed key in a later build-order step.</p>
</body></html>`;

  return { subject, html, text };
}

async function sendViaResend(apiKey: string, args: ResendSendArgs): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: args.from,
      to: [args.to],
      reply_to: args.reply_to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend_failed: ${res.status} ${body}`);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function json(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
