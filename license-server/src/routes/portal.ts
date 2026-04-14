import { Hono } from 'hono';
import type { Env } from '../types';
import { stripeClient } from '../lib/stripe';
import { getSubscription } from '../lib/db';
import { verifyLicenseJwt } from '../lib/jwt';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/portal
 * body: { jwt }
 * returns: { url }
 *
 * Returns a Stripe Customer Portal URL the desktop app can open in the system browser.
 * The buyer cancels, updates card, downloads invoices, and reassigns seats from there.
 */
app.post('/', async (c) => {
  const body = await c.req.json<{ jwt: string }>().catch(() => null);
  if (!body?.jwt) return c.json({ error: 'bad_request' }, 400);

  let claims;
  try {
    claims = await verifyLicenseJwt(c.env, body.jwt);
  } catch {
    return c.json({ error: 'invalid_jwt' }, 401);
  }

  const sub = await getSubscription(c.env, claims.sub_id);
  if (!sub) return c.json({ error: 'unknown_subscription' }, 404);

  const stripe = stripeClient(c.env);
  const session = await stripe.billingPortal.sessions.create({
    customer: sub.customer_id,
    return_url: `${c.env.APP_URL}/account`,
  });

  return c.json({ url: session.url });
});

export default app;
