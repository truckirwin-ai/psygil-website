import { Hono } from 'hono';
import type { Env } from '../types';
import { stripeClient } from '../lib/stripe';
import { fulfillPaidCheckout } from '../lib/fulfillment';

const app = new Hono<{ Bindings: Env }>();

/**
 * GET /api/fulfill?session_id=cs_xxx
 *
 * Synchronous fulfillment endpoint called by the /thanks page after a successful
 * Stripe Checkout redirect. Idempotent with the webhook: either one can arrive first
 * and fulfill; the other returns the same data.
 *
 * Returns: { tier, tokens, installers, portal_url }
 *
 * This is the endpoint that powers "buy now, get license immediately on the success
 * page" — no email required to start using the app.
 */
app.get('/', async (c) => {
  const sessionId = c.req.query('session_id');
  if (!sessionId) return c.json({ error: 'missing_session_id' }, 400);

  const stripe = stripeClient(c.env);
  let session;
  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch (err) {
    return c.json({ error: 'unknown_session', detail: String(err) }, 404);
  }

  try {
    const result = await fulfillPaidCheckout(c.env, stripe, session);
    return c.json({
      tier: result.tier,
      tokens: result.tokens,
      installers: result.installers,
      portal_url: result.portal_url,
      customer_email: result.customer_email,
    });
  } catch (err) {
    console.error('fulfill_failed', err);
    return c.json({ error: 'fulfillment_failed', detail: String(err) }, 500);
  }
});

export default app;
