import { Hono } from 'hono';
import type { Env } from '../types';
import { getSubscriptionByCustomerEmail, getSeatsBySubscription, now } from '../lib/db';
import { startTrial } from '../lib/fulfillment';
import { buildInstallerUrls } from '../lib/email';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/trial/start
 * body: { email }
 * returns: { tier, tokens, installers, trial_ends_at }
 *
 * Creates a 10-day trial subscription (no payment required, no Stripe customer).
 * If the email already has an active trial, returns the existing tokens instead
 * of creating a new one — this is the "repeat visitor gets the same key" behavior.
 * If the email already converted to paid, returns an error so the user uses their
 * paid key instead.
 */
app.post('/', async (c) => {
  const body = await c.req.json<{ email: string }>().catch(() => null);
  if (!body?.email) return c.json({ error: 'bad_request' }, 400);

  const email = body.email.trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return c.json({ error: 'invalid_email' }, 400);
  }

  const existing = await getSubscriptionByCustomerEmail(c.env, email);
  if (existing) {
    if (existing.tier === 'trial' && existing.status === 'active' && existing.trial_ends_at && existing.trial_ends_at > now()) {
      const seats = await getSeatsBySubscription(c.env, existing.id);
      const installers = await buildInstallerUrls(c.env, email);
      return c.json({
        tier: 'trial' as const,
        tokens: seats.map((s) => s.seat_token),
        installers,
        trial_ends_at: existing.trial_ends_at,
        reused: true,
      });
    }
    if (existing.tier !== 'trial' && existing.status === 'active') {
      return c.json(
        { error: 'already_paid', hint: 'This email already has an active paid subscription. Use your existing license key.' },
        409,
      );
    }
    if (existing.tier === 'trial' && existing.trial_ends_at && existing.trial_ends_at <= now()) {
      return c.json(
        { error: 'trial_already_used', hint: 'This email has already used its free trial. Start a paid subscription at /pricing.' },
        409,
      );
    }
  }

  const result = await startTrial(c.env, { email });
  return c.json({
    tier: result.tier,
    tokens: result.tokens,
    installers: result.installers,
    trial_ends_at: now() + Number(c.env.TRIAL_DAYS || '10') * 86400,
    reused: false,
  });
});

export default app;
