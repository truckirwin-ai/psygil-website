// Cloudflare Pages Function: POST /api/support
//
// Validates a support form submission, rejects honeypot hits, rate-limits by
// IP, and forwards the ticket to support@psygil.com via Resend. The submitter's
// email address is set as reply-to so support can reply directly from inbox.
//
// Bindings configured on the Pages project:
//   - Secret: RESEND_API_KEY
//   - Optional env var: SUPPORT_FROM_EMAIL (defaults to "Psygil Support <support@psygil.com>")
//   - Optional env var: SUPPORT_TO_EMAIL   (defaults to "support@psygil.com")
//   - Optional KV namespace binding: RATE_LIMIT (for per-IP rate limiting)

interface Env {
  RESEND_API_KEY: string;
  SUPPORT_FROM_EMAIL?: string;
  SUPPORT_TO_EMAIL?: string;
  RATE_LIMIT?: KVNamespace;
}

interface SupportPayload {
  name: string;
  email: string;
  tier: string;
  category: string;
  subject: string;
  message: string;
  company?: string;
}

interface ResendSendArgs {
  from: string;
  to: string;
  reply_to: string;
  subject: string;
  html: string;
  text: string;
}

const DEFAULT_FROM = 'Psygil Support <support@psygil.com>';
const DEFAULT_TO = 'support@psygil.com';
const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 5;

const VALID_TIERS = new Set(['solo', 'practice', 'enterprise', 'evaluating']);
const VALID_CATEGORIES = new Set([
  'activation',
  'installer',
  'billing',
  'bug',
  'feature',
  'other',
]);

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

    const payload = parseSupportPayload(raw);
    if (!payload.ok) {
      return json({ ok: false, error: payload.error }, 400);
    }

    // Honeypot: legitimate clients leave the `company` field blank.
    if ((payload.data.company ?? '').trim().length > 0) {
      // Fail silently with success to not tip off bots.
      return json({ ok: true });
    }

    const ip = ctx.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateOk = await checkRateLimit(ctx.env, `support:${ip}`);
    if (!rateOk) {
      return json({ ok: false, error: 'rate limit exceeded, try again later' }, 429);
    }

    if (!ctx.env.RESEND_API_KEY) {
      return json({ ok: false, error: 'mail not configured' }, 503);
    }

    const from = ctx.env.SUPPORT_FROM_EMAIL ?? DEFAULT_FROM;
    const to = ctx.env.SUPPORT_TO_EMAIL ?? DEFAULT_TO;
    const { subject, html, text } = renderSupportEmail(payload.data, ip);

    await sendViaResend(ctx.env.RESEND_API_KEY, {
      from,
      to,
      reply_to: payload.data.email,
      subject,
      html,
      text,
    });

    return json({ ok: true });
  } catch (error: unknown) {
    return json({ ok: false, error: 'internal error, try again later' }, 500);
  }
};

type ParseResult =
  | { ok: true; data: SupportPayload }
  | { ok: false; error: string };

function parseSupportPayload(raw: string): ParseResult {
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
  const tier = asString(obj.tier, 20);
  const category = asString(obj.category, 40);
  const subject = asString(obj.subject, 200);
  const message = asString(obj.message, 8000);
  const company = asString(obj.company, 200) ?? '';

  if (!name) return { ok: false, error: 'name is required' };
  if (!email || !isEmail(email)) return { ok: false, error: 'valid email is required' };
  if (!tier || !VALID_TIERS.has(tier)) return { ok: false, error: 'invalid tier' };
  if (!category || !VALID_CATEGORIES.has(category)) return { ok: false, error: 'invalid category' };
  if (!subject) return { ok: false, error: 'subject is required' };
  if (!message || message.length < 10) return { ok: false, error: 'message is too short' };

  return {
    ok: true,
    data: { name, email, tier, category, subject, message, company },
  };
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

function renderSupportEmail(
  p: SupportPayload,
  ip: string,
): { subject: string; html: string; text: string } {
  const subject = `[support/${p.tier}/${p.category}] ${p.subject}`;

  const text = `New support request

Name:      ${p.name}
Email:     ${p.email}
Tier:      ${p.tier}
Category:  ${p.category}
Subject:   ${p.subject}
IP:        ${ip}

Message:
${p.message}
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:18px;margin:0 0 12px;">New support request</h1>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 20px;">
<tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td style="padding:4px 0;">${escapeHtml(p.name)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Tier</td><td style="padding:4px 0;">${escapeHtml(p.tier)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Category</td><td style="padding:4px 0;">${escapeHtml(p.category)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Subject</td><td style="padding:4px 0;">${escapeHtml(p.subject)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">IP</td><td style="padding:4px 0;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(ip)}</td></tr>
</table>
<h2 style="font-size:14px;margin:0 0 8px;">Message</h2>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.message)}</div>
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
