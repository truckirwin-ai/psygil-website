import { Hono } from 'hono';
import type { Env, PaidTier } from '../types';
import { stripeClient } from '../lib/stripe';
import { getSubscription } from '../lib/db';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/checkout
 * body: {
 *   tier: 'solo' | 'practice',
 *   seats?: number,
 *   convert_from_sub_id?: string   // trial subscription id to upgrade
 * }
 * returns: { url }
 *
 * Enterprise is sales-gated; this endpoint refuses it.
 *
 * When convert_from_sub_id is supplied and points at an active trial, the resulting
 * paid subscription inherits the trial's seat(s) on fulfillment — the device binding
 * carries over so the user doesn't re-activate.
 */
app.post('/', async (c) => {
  const body = await c.req.json<{
    tier: PaidTier;
    seats?: number;
    convert_from_sub_id?: string;
  }>().catch(() => null);

  if (!body?.tier) return c.json({ error: 'bad_request' }, 400);
  if (body.tier !== 'solo' && body.tier !== 'practice') {
    return c.json({ error: 'enterprise_requires_sales_contact' }, 400);
  }

  const line_items: { price: string; quantity: number }[] = [];
  if (body.tier === 'solo') {
    line_items.push({ price: c.env.STRIPE_PRICE_SOLO, quantity: 1 });
  } else {
    line_items.push({ price: c.env.STRIPE_PRICE_PRACTICE, quantity: 1 });
    const extra = Math.max(0, (body.seats ?? 5) - 5);
    if (extra > 0) {
      line_items.push({ price: c.env.STRIPE_PRICE_PRACTICE_EXTRA_SEAT, quantity: extra });
    }
  }

  // Validate the conversion target if supplied.
  let convertSubId: string | null = null;
  let prefillEmail: string | undefined;
  if (body.convert_from_sub_id) {
    const trial = await getSubscription(c.env, body.convert_from_sub_id);
    if (!trial || trial.tier !== 'trial') {
      return c.json({ error: 'invalid_conversion_target' }, 400);
    }
    convertSubId = trial.id;
    prefillEmail = trial.customer_email;
  }

  const metadata: Record<string, string> = { tier: body.tier };
  if (convertSubId) metadata.convert_seat_sub_id = convertSubId;

  const stripe = stripeClient(c.env);
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    line_items,
    success_url: `${c.env.APP_URL}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${c.env.APP_URL}/pricing`,
    allow_promotion_codes: true,
    billing_address_collection: 'required',
    customer_creation: 'always',
    customer_email: prefillEmail,
    metadata,
    subscription_data: { metadata },
  });

  return c.json({ url: session.url });
});

export default app;
