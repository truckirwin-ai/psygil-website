// Cloudflare Pages Function: POST /api/stripe-webhook
//
// Receives Stripe webhook events. On checkout.session.completed we:
//   1. Verify the stripe-signature header using STRIPE_WEBHOOK_SECRET.
//   2. Call the license Worker /issue endpoint to mint a real Ed25519-signed
//      license for the customer.
//   3. Email the customer the license key, a psygil:// auto-activation URL,
//      and a signed installer download link.
//
// Bindings configured on the Pages project:
//   - Secret: STRIPE_WEBHOOK_SECRET
//   - Secret: STRIPE_SECRET_KEY (for fetching line_items, since Payment Links
//                                 do not carry API-set metadata)
//   - Secret: LICENSE_WORKER_ISSUE_SECRET (shared with the license Worker)
//   - Secret: INSTALLER_TOKEN_SECRET
//   - Secret: RESEND_API_KEY
//   - env var: LICENSE_WORKER_URL (for example https://license.psygil.com)
//   - env var: STRIPE_PRICE_SOLO (Stripe Price ID for Solo tier)
//   - env var: STRIPE_PRICE_PRACTICE (Stripe Price ID for Practice tier)
//   - env var: STRIPE_PRICE_ENTERPRISE_SETUP (Stripe Price ID for Enterprise Setup)
//   - Optional env var: CUSTOMER_FROM_EMAIL (defaults to Psygil support)
//   - Optional env var: PUBLIC_SITE_URL (used to build installer URLs)
//   - Optional env var: INSTALLER_TOKEN_TTL_DAYS (defaults to 14)

import {
  signInstallerToken,
  hmacSha256Hex,
  type InstallerPlatform,
} from '../_lib/crypto';

type LicenseTier = 'solo' | 'practice' | 'enterprise' | 'trial';

interface Env {
  STRIPE_WEBHOOK_SECRET: string;
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_SOLO: string;
  STRIPE_PRICE_PRACTICE: string;
  STRIPE_PRICE_ENTERPRISE_SETUP: string;
  LICENSE_WORKER_URL: string;
  LICENSE_WORKER_ISSUE_SECRET: string;
  INSTALLER_TOKEN_SECRET: string;
  RESEND_API_KEY: string;
  CUSTOMER_FROM_EMAIL?: string;
  PUBLIC_SITE_URL?: string;
  INSTALLER_TOKEN_TTL_DAYS?: string;
}

const SIG_TOLERANCE_SECONDS = 300;

export const onRequestPost: PagesFunction<Env> = async (ctx) => {
  const sigHeader = ctx.request.headers.get('stripe-signature') ?? '';
  const body = await ctx.request.text();

  if (!ctx.env.STRIPE_WEBHOOK_SECRET) {
    return textResponse('webhook not configured', 503);
  }

  const valid = await verifyStripeSignature(
    ctx.env.STRIPE_WEBHOOK_SECRET,
    sigHeader,
    body,
    Math.floor(Date.now() / 1000),
  );
  if (!valid) {
    return textResponse('invalid signature', 400);
  }

  let event: StripeEvent;
  try {
    event = JSON.parse(body) as StripeEvent;
  } catch {
    return textResponse('invalid json', 400);
  }

  if (event.type !== 'checkout.session.completed') {
    // Acknowledge other event types so Stripe stops retrying.
    return textResponse('ignored', 200);
  }

  const session = event.data?.object;
  if (!session || session.object !== 'checkout.session') {
    return textResponse('invalid event payload', 400);
  }

  try {
    await fulfillSession(ctx.env, session);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'fulfillment failed';
    return textResponse(`fulfillment error: ${message}`, 500);
  }

  return textResponse('ok', 200);
};

interface StripeEvent {
  id: string;
  type: string;
  data?: {
    object?: StripeCheckoutSession;
  };
}

interface StripeCheckoutSession {
  object: string;
  id: string;
  customer_email?: string | null;
  customer_details?: { email?: string | null; name?: string | null } | null;
  amount_total?: number | null;
  currency?: string | null;
  subscription?: string | null;
  metadata?: Record<string, string> | null;
}

async function fulfillSession(env: Env, session: StripeCheckoutSession): Promise<void> {
  const email = session.customer_email ?? session.customer_details?.email ?? null;
  if (!email) throw new Error('session missing email');

  const metadata = session.metadata ?? {};
  // Prefer metadata.tier when present (API-created sessions). Fall back to
  // resolving tier from the line item's price ID (Payment Link sessions).
  const tier: LicenseTier = metadata.tier
    ? normalizeTier(metadata.tier)
    : await resolveTierFromLineItems(env, session.id);
  const platform = normalizePlatform(metadata.platform);
  const name = metadata.name ?? session.customer_details?.name ?? email;

  const issued = await issueLicense(env, {
    email,
    name,
    tier,
    stripeSessionId: session.id,
    stripeSubscriptionId: session.subscription ?? null,
  });

  const ttlDays = Number(env.INSTALLER_TOKEN_TTL_DAYS ?? '14');
  const expSeconds = Math.floor(Date.now() / 1000) + ttlDays * 24 * 3600;
  const installerToken = await signInstallerToken(env.INSTALLER_TOKEN_SECRET, {
    email,
    platform,
    exp: expSeconds,
    purpose: 'purchase',
  });

  const base = env.PUBLIC_SITE_URL ?? 'https://psygil.com';
  const installerUrl = `${base}/api/installer?token=${encodeURIComponent(installerToken)}`;

  // psygil:// deep link drops the signed license into the app on click.
  const activationUrl = `psygil://activate?license=${encodeURIComponent(issued.license)}`;

  if (env.RESEND_API_KEY) {
    await sendFulfillmentEmail(env, {
      to: email,
      name,
      tier,
      licenseKey: issued.license,
      activationUrl,
      installerUrl,
    });
  }
}

function normalizePlatform(value: string | undefined): InstallerPlatform {
  if (value === 'windows' || value === 'linux' || value === 'mac') return value;
  return 'mac';
}

function normalizeTier(value: string): LicenseTier {
  if (value === 'solo' || value === 'practice' || value === 'enterprise' || value === 'trial') {
    return value;
  }
  return 'solo';
}

interface StripeLineItemsResponse {
  data?: Array<{
    price?: { id?: string | null } | null;
  }>;
}

// Payment Link sessions do not carry API-set metadata, so we infer the tier
// from the price ID on the session's first line item. Requires the Stripe
// Price IDs to be wired into the Pages env vars.
async function resolveTierFromLineItems(env: Env, sessionId: string): Promise<LicenseTier> {
  if (!env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY not configured; cannot resolve tier from Payment Link');
  }
  const res = await fetch(
    `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}/line_items?limit=5`,
    {
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
      },
    },
  );
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`stripe_line_items_failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as StripeLineItemsResponse;
  const priceId = data.data?.[0]?.price?.id ?? null;
  if (!priceId) throw new Error('session has no line items with a price');

  if (priceId === env.STRIPE_PRICE_SOLO) return 'solo';
  if (priceId === env.STRIPE_PRICE_PRACTICE) return 'practice';
  // Enterprise Setup is a one-time payment that provisions a 30-day Enterprise
  // license as a placeholder. Sales converts to a real subscription via /issue.
  if (priceId === env.STRIPE_PRICE_ENTERPRISE_SETUP) return 'enterprise';

  throw new Error(`unknown price id: ${priceId}`);
}

interface IssueArgs {
  email: string;
  name: string;
  tier: LicenseTier;
  stripeSessionId: string;
  stripeSubscriptionId: string | null;
}

interface IssueResult {
  license: string;
  key_id: string;
  expires_at: number;
}

async function issueLicense(env: Env, args: IssueArgs): Promise<IssueResult> {
  const res = await fetch(`${env.LICENSE_WORKER_URL}/issue`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.LICENSE_WORKER_ISSUE_SECRET}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email: args.email,
      name: args.name,
      tier: args.tier,
      source: 'stripe',
      stripe_session_id: args.stripeSessionId,
      stripe_subscription_id: args.stripeSubscriptionId,
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`license_issue_failed: ${res.status} ${text}`);
  }
  const data = (await res.json()) as IssueResult;
  return data;
}

interface FulfillmentEmailArgs {
  to: string;
  name: string;
  tier: LicenseTier;
  licenseKey: string;
  activationUrl: string;
  installerUrl: string;
}

async function sendFulfillmentEmail(env: Env, args: FulfillmentEmailArgs): Promise<void> {
  const from = env.CUSTOMER_FROM_EMAIL ?? 'Psygil <support@psygil.com>';
  const subject = `Your Psygil license (${args.tier})`;
  const ttlDays = env.INSTALLER_TOKEN_TTL_DAYS ?? '14';

  const text = `Welcome to Psygil.

Your license key:
${args.licenseKey}

One-click activation (opens the app and applies your license):
${args.activationUrl}

Installer download (link expires in ${ttlDays} days):
${args.installerUrl}

Questions? Reply to this email and support will pick it up.

Foundry SMB LLC
Colorado, United States
`;

  const html = `<!doctype html><html><body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,sans-serif;max-width:640px;margin:0 auto;padding:24px;color:#111;line-height:1.55;">
<h1 style="font-size:20px;margin:0 0 16px;">Welcome to Psygil.</h1>
<p>Hi ${escapeHtml(args.name)}, your <strong>${escapeHtml(args.tier)}</strong> license is ready.</p>

<h2 style="font-size:15px;margin:24px 0 8px;">Your license key</h2>
<pre style="font-family:ui-monospace,Menlo,monospace;background:#f4f4f4;padding:12px;border-radius:6px;font-size:12px;overflow:auto;white-space:pre-wrap;word-break:break-all;">${escapeHtml(args.licenseKey)}</pre>

<p style="margin:20px 0;">
  <a href="${escapeHtml(args.activationUrl)}" style="display:inline-block;background:#E8650A;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Activate Psygil now</a>
</p>

<p style="margin:20px 0;">
  <a href="${escapeHtml(args.installerUrl)}" style="display:inline-block;background:#111;color:#fff;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:600;">Download installer</a>
</p>

<p style="color:#666;font-size:12px;">The installer link expires in ${escapeHtml(ttlDays)} days. If it expires, write to support@psygil.com and we will issue a new one.</p>

<p style="color:#666;font-size:12px;margin-top:24px;">Foundry SMB LLC, Colorado, United States</p>
</body></html>`;

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [args.to],
      subject,
      html,
      text,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`resend_fulfillment_failed: ${res.status} ${body}`);
  }
}

async function verifyStripeSignature(
  secret: string,
  header: string,
  body: string,
  nowSeconds: number,
): Promise<boolean> {
  if (!header) return false;
  const parts = header.split(',').map((p) => p.trim());
  let timestamp: number | null = null;
  const v1: string[] = [];
  for (const part of parts) {
    const [k, v] = part.split('=');
    if (k === 't' && v) timestamp = Number(v);
    else if (k === 'v1' && v) v1.push(v);
  }
  if (timestamp === null || Number.isNaN(timestamp) || v1.length === 0) return false;
  if (Math.abs(nowSeconds - timestamp) > SIG_TOLERANCE_SECONDS) return false;

  const signed = `${timestamp}.${body}`;
  const expected = await hmacSha256Hex(secret, signed);

  // Constant-time compare across all provided v1 candidates.
  let ok = false;
  for (const candidate of v1) {
    if (candidate.length !== expected.length) continue;
    let diff = 0;
    for (let i = 0; i < candidate.length; i++) {
      diff |= candidate.charCodeAt(i) ^ expected.charCodeAt(i);
    }
    if (diff === 0) ok = true;
  }
  return ok;
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function textResponse(body: string, status: number): Response {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  });
}
