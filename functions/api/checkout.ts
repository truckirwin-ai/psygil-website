// Cloudflare Pages Function: POST /api/checkout
//
// Creates a Stripe Checkout Session for a selected tier and returns the
// session URL for the browser to redirect to. On success Stripe funnels the
// customer to /thanks.html?session_id={CHECKOUT_SESSION_ID}. Fulfillment
// (license minting + email + installer token) happens server-side via the
// /api/stripe-webhook handler.
//
// Bindings configured on the Pages project:
//   - Secret: STRIPE_SECRET_KEY
//   - env vars: STRIPE_PRICE_SOLO, STRIPE_PRICE_PRACTICE, STRIPE_PRICE_ENTERPRISE
//   - Optional env var: PUBLIC_SITE_URL (defaults to origin of request)
//   - Optional KV namespace binding: RATE_LIMIT

interface Env {
  STRIPE_SECRET_KEY: string;
  STRIPE_PRICE_SOLO?: string;
  STRIPE_PRICE_PRACTICE?: string;
  STRIPE_PRICE_ENTERPRISE?: string;
  PUBLIC_SITE_URL?: string;
  RATE_LIMIT?: KVNamespace;
}

type Tier = 'solo' | 'practice' | 'enterprise';
type Platform = 'mac' | 'windows' | 'linux';

interface CheckoutPayload {
  tier: Tier;
  email: string;
  name: string;
  practice_name: string;
  city: string;
  state: string;
  phone: string;
  platform: Platform;
}

const MAX_BODY_BYTES = 32 * 1024;
const RATE_LIMIT_WINDOW_SECONDS = 3600;
const RATE_LIMIT_MAX = 10;

const VALID_TIERS: ReadonlySet<Tier> = new Set(['solo', 'practice', 'enterprise']);
const VALID_PLATFORMS: ReadonlySet<Platform> = new Set(['mac', 'windows', 'linux']);

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

    const parsed = parsePayload(raw);
    if (!parsed.ok) {
      return json({ ok: false, error: parsed.error }, 400);
    }
    const data = parsed.data;

    const ip = ctx.request.headers.get('cf-connecting-ip') ?? 'unknown';
    const rateOk = await checkRateLimit(ctx.env, `checkout:${ip}`);
    if (!rateOk) {
      return json({ ok: false, error: 'rate limit exceeded, try again later' }, 429);
    }

    if (!ctx.env.STRIPE_SECRET_KEY) {
      return json({ ok: false, error: 'checkout not configured' }, 503);
    }

    const priceId = resolvePriceId(ctx.env, data.tier);
    if (!priceId) {
      return json({ ok: false, error: `tier not available: ${data.tier}` }, 400);
    }

    const url = new URL(ctx.request.url);
    const base = ctx.env.PUBLIC_SITE_URL ?? `${url.protocol}//${url.host}`;
    const successUrl = `${base}/thanks.html?session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${base}/pricing.html`;

    const session = await createCheckoutSession(ctx.env.STRIPE_SECRET_KEY, {
      priceId,
      customerEmail: data.email,
      successUrl,
      cancelUrl,
      metadata: {
        tier: data.tier,
        name: data.name,
        practice_name: data.practice_name,
        city: data.city,
        state: data.state,
        phone: data.phone,
        platform: data.platform,
      },
    });

    if (!session.url) {
      return json({ ok: false, error: 'checkout session missing url' }, 502);
    }

    return json({ ok: true, url: session.url });
  } catch {
    return json({ ok: false, error: 'internal error, try again later' }, 500);
  }
};

type ParseResult =
  | { ok: true; data: CheckoutPayload }
  | { ok: false; error: string };

function parsePayload(raw: string): ParseResult {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return { ok: false, error: 'invalid json' };
  }
  if (typeof parsed !== 'object' || parsed === null) {
    return { ok: false, error: 'invalid payload' };
  }
  const o = parsed as Record<string, unknown>;

  const tierRaw = asString(o.tier, 20);
  const email = asString(o.email, 200);
  const name = asString(o.name, 120);
  const practice = asString(o.practice_name, 200);
  const city = asString(o.city, 120);
  const state = asString(o.state, 80);
  const phone = asString(o.phone, 40);
  const platformRaw = asString(o.platform, 20) ?? 'mac';

  if (!tierRaw || !VALID_TIERS.has(tierRaw as Tier)) {
    return { ok: false, error: 'invalid tier' };
  }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: 'valid email is required' };
  }
  if (!name) return { ok: false, error: 'name is required' };
  if (!practice) return { ok: false, error: 'practice name is required' };
  if (!city) return { ok: false, error: 'city is required' };
  if (!state) return { ok: false, error: 'state is required' };
  if (!phone) return { ok: false, error: 'phone is required' };
  if (!VALID_PLATFORMS.has(platformRaw as Platform)) {
    return { ok: false, error: 'invalid platform' };
  }

  return {
    ok: true,
    data: {
      tier: tierRaw as Tier,
      email,
      name,
      practice_name: practice,
      city,
      state,
      phone,
      platform: platformRaw as Platform,
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

function resolvePriceId(env: Env, tier: Tier): string | undefined {
  if (tier === 'solo') return env.STRIPE_PRICE_SOLO;
  if (tier === 'practice') return env.STRIPE_PRICE_PRACTICE;
  if (tier === 'enterprise') return env.STRIPE_PRICE_ENTERPRISE;
  return undefined;
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

interface StripeSessionArgs {
  priceId: string;
  customerEmail: string;
  successUrl: string;
  cancelUrl: string;
  metadata: Record<string, string>;
}

interface StripeSession {
  id: string;
  url?: string;
}

async function createCheckoutSession(
  secretKey: string,
  args: StripeSessionArgs,
): Promise<StripeSession> {
  const form = new URLSearchParams();
  form.set('mode', 'subscription');
  form.set('line_items[0][price]', args.priceId);
  form.set('line_items[0][quantity]', '1');
  form.set('customer_email', args.customerEmail);
  form.set('success_url', args.successUrl);
  form.set('cancel_url', args.cancelUrl);
  form.set('allow_promotion_codes', 'true');
  form.set('billing_address_collection', 'auto');
  for (const [k, v] of Object.entries(args.metadata)) {
    form.set(`metadata[${k}]`, v);
  }
  form.set('subscription_data[metadata][tier]', args.metadata.tier ?? '');

  const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form.toString(),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`stripe_checkout_failed: ${res.status} ${body}`);
  }
  const data = (await res.json()) as StripeSession;
  return data;
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
