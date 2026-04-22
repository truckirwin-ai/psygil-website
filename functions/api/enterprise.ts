// Cloudflare Pages Function: POST /api/enterprise
//
// Validates an Enterprise sales inquiry, rejects honeypot hits, rate-limits
// by IP, and forwards to sales@psygil.com via Resend. The submitter's email
// is set as reply-to so sales can reply directly from inbox.
//
// Bindings configured on the Pages project:
//   - Secret: RESEND_API_KEY
//   - Optional env var: SALES_FROM_EMAIL (defaults to "Psygil Sales <sales@psygil.com>")
//   - Optional env var: SALES_TO_EMAIL   (defaults to "sales@psygil.com")
//   - Optional KV namespace binding: RATE_LIMIT (for per-IP rate limiting)

interface Env {
  RESEND_API_KEY: string;
  SALES_FROM_EMAIL?: string;
  SALES_TO_EMAIL?: string;
  RATE_LIMIT?: KVNamespace;
}

interface EnterprisePayload {
  name: string;
  title: string;
  email: string;
  phone: string;
  org: string;
  org_type: string;
  seats: string;
  timeline: string;
  compliance: ReadonlyArray<string>;
  notes: string;
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
const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 5;

const VALID_ORG_TYPES = new Set([
  'forensic_practice',
  'hospital',
  'clinic',
  'court_ime',
  'government',
  'university',
  'other',
]);
const VALID_SEATS = new Set(['6-15', '16-50', '51-200', '200+']);
const VALID_TIMELINES = new Set(['immediate', 'quarter', 'year', 'exploring']);
const VALID_COMPLIANCE = new Set([
  'baa',
  'dpa',
  'security_q',
  'soc2',
  'msa_redlines',
  'procurement',
  'insurance',
  'audit',
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

    const payload = parseEnterprisePayload(raw);
    if (!payload.ok) {
      return json({ ok: false, error: payload.error }, 400);
    }

    // Honeypot: legitimate clients leave the `website` field blank.
    if ((payload.data.website ?? '').trim().length > 0) {
      return json({ ok: true });
    }

    const ip = ctx.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateOk = await checkRateLimit(ctx.env, `enterprise:${ip}`);
    if (!rateOk) {
      return json({ ok: false, error: 'rate limit exceeded, try again later' }, 429);
    }

    if (!ctx.env.RESEND_API_KEY) {
      return json({ ok: false, error: 'mail not configured' }, 503);
    }

    const from = ctx.env.SALES_FROM_EMAIL ?? DEFAULT_FROM;
    const to = ctx.env.SALES_TO_EMAIL ?? DEFAULT_TO;
    const { subject, html, text } = renderEnterpriseEmail(payload.data, ip);

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
  | { ok: true; data: EnterprisePayload }
  | { ok: false; error: string };

function parseEnterprisePayload(raw: string): ParseResult {
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
  const title = asString(obj.title, 120);
  const email = asString(obj.email, 200);
  const phone = asString(obj.phone, 40) ?? '';
  const org = asString(obj.org, 200);
  const orgType = asString(obj.org_type, 40);
  const seats = asString(obj.seats, 20);
  const timeline = asString(obj.timeline, 20);
  const notes = asString(obj.notes, 8000) ?? '';
  const website = asString(obj.website, 200) ?? '';
  const compliance = asStringArray(obj.compliance, 16, VALID_COMPLIANCE);

  if (!name) return { ok: false, error: 'name is required' };
  if (!title) return { ok: false, error: 'title is required' };
  if (!email || !isEmail(email)) return { ok: false, error: 'valid email is required' };
  if (!org) return { ok: false, error: 'organization is required' };
  if (!orgType || !VALID_ORG_TYPES.has(orgType)) return { ok: false, error: 'invalid organization type' };
  if (!seats || !VALID_SEATS.has(seats)) return { ok: false, error: 'invalid seats selection' };
  if (!timeline || !VALID_TIMELINES.has(timeline)) return { ok: false, error: 'invalid timeline' };

  return {
    ok: true,
    data: {
      name,
      title,
      email,
      phone,
      org,
      org_type: orgType,
      seats,
      timeline,
      compliance,
      notes,
      website,
    },
  };
}

function asString(value: unknown, max: number): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  if (trimmed.length === 0) return null;
  if (trimmed.length > max) return trimmed.slice(0, max);
  return trimmed;
}

function asStringArray(
  value: unknown,
  maxItems: number,
  allowed: ReadonlySet<string>,
): string[] {
  if (!Array.isArray(value)) return [];
  const out: string[] = [];
  for (const v of value) {
    if (typeof v !== 'string') continue;
    if (!allowed.has(v)) continue;
    if (out.length >= maxItems) break;
    if (!out.includes(v)) out.push(v);
  }
  return out;
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

function renderEnterpriseEmail(
  p: EnterprisePayload,
  ip: string,
): { subject: string; html: string; text: string } {
  const subject = `[enterprise/${p.org_type}/${p.seats}] ${p.org} (${p.timeline})`;
  const complianceStr = p.compliance.length > 0 ? p.compliance.join(', ') : 'none selected';

  const text = `New Enterprise inquiry

Name:          ${p.name}
Title:         ${p.title}
Email:         ${p.email}
Phone:         ${p.phone || 'not provided'}
Organization:  ${p.org}
Org type:      ${p.org_type}
Seats:         ${p.seats}
Timeline:      ${p.timeline}
Compliance:    ${complianceStr}
IP:            ${ip}

Notes:
${p.notes || '(none)'}
`;

  const complianceHtml = p.compliance.length > 0
    ? p.compliance.map((c) => `<span style="display:inline-block;background:#fff4ec;color:#c0530a;border:1px solid #E8650A;border-radius:4px;padding:2px 8px;margin:2px 4px 2px 0;font-size:12px;font-weight:600;">${escapeHtml(c)}</span>`).join('')
    : '<span style="color:#888;">none selected</span>';

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:18px;margin:0 0 12px;">New Enterprise inquiry</h1>
<table style="border-collapse:collapse;font-size:14px;margin:0 0 16px;">
<tr><td style="padding:4px 12px 4px 0;color:#666;">Name</td><td style="padding:4px 0;">${escapeHtml(p.name)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Title</td><td style="padding:4px 0;">${escapeHtml(p.title)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Email</td><td style="padding:4px 0;"><a href="mailto:${escapeHtml(p.email)}">${escapeHtml(p.email)}</a></td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Phone</td><td style="padding:4px 0;">${escapeHtml(p.phone || 'not provided')}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Organization</td><td style="padding:4px 0;">${escapeHtml(p.org)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Type</td><td style="padding:4px 0;">${escapeHtml(p.org_type)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Seats</td><td style="padding:4px 0;">${escapeHtml(p.seats)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">Timeline</td><td style="padding:4px 0;">${escapeHtml(p.timeline)}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;vertical-align:top;">Compliance</td><td style="padding:4px 0;">${complianceHtml}</td></tr>
<tr><td style="padding:4px 12px 4px 0;color:#666;">IP</td><td style="padding:4px 0;font-family:ui-monospace,Menlo,monospace;">${escapeHtml(ip)}</td></tr>
</table>
<h2 style="font-size:14px;margin:0 0 8px;">Notes</h2>
<div style="background:#f6f6f4;border:1px solid #e6e4de;border-radius:6px;padding:14px;font-size:14px;white-space:pre-wrap;">${escapeHtml(p.notes || '(none)')}</div>
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
