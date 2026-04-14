import { Hono } from 'hono';
import type Stripe from 'stripe';
import type { Env, PaidTier } from '../types';
import { stripeClient } from '../lib/stripe';
import { defaultSeatLimit, logEvent, updateSubscription } from '../lib/db';
import { fulfillPaidCheckout, mapStripeStatus } from '../lib/fulfillment';

const app = new Hono<{ Bindings: Env }>();

app.post('/', async (c) => {
  const sig = c.req.header('stripe-signature');
  if (!sig) return c.json({ error: 'missing_signature' }, 400);
  const raw = await c.req.text();
  const stripe = stripeClient(c.env);

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(raw, sig, c.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    return c.json({ error: 'bad_signature', detail: String(err) }, 400);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        // Delegated to the shared fulfillment path so /api/fulfill and the webhook
        // converge on the same outcome regardless of who arrives first.
        await fulfillPaidCheckout(c.env, stripe, event.data.object as Stripe.Checkout.Session);
        break;
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        await onSubscriptionChanged(c.env, event.data.object as Stripe.Subscription);
        break;
      case 'invoice.payment_failed':
        await onPaymentFailed(c.env, event.data.object as Stripe.Invoice);
        break;
      default:
        // Unhandled event types are fine; Stripe retries on 5xx only.
        break;
    }
  } catch (err) {
    console.error('webhook_handler_failed', event.type, err);
    return c.json({ error: 'handler_failed', detail: String(err) }, 500);
  }

  return c.json({ received: true });
});

async function onSubscriptionChanged(env: Env, sub: Stripe.Subscription): Promise<void> {
  const tier = (sub.metadata?.tier ?? 'solo') as PaidTier;
  const seatLimit = computeSeatLimit(env, tier, sub);
  const status = mapStripeStatus(sub.status);

  await updateSubscription(env, sub.id, {
    status,
    current_period_end: sub.current_period_end,
    seat_limit: seatLimit,
  });

  await logEvent(env, 'subscription_changed', {
    detail: `sub=${sub.id} status=${status} period_end=${sub.current_period_end} seat_limit=${seatLimit}`,
  });
}

async function onPaymentFailed(env: Env, invoice: Stripe.Invoice): Promise<void> {
  const subId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
  if (!subId) return;
  await updateSubscription(env, subId, { status: 'past_due' });
  await logEvent(env, 'payment_failed', { detail: `sub=${subId} invoice=${invoice.id}` });
}

function computeSeatLimit(env: Env, tier: PaidTier, sub: Stripe.Subscription): number {
  if (tier === 'solo') return 1;
  if (tier === 'enterprise') return defaultSeatLimit('enterprise');
  let base = 0;
  let extras = 0;
  for (const item of sub.items.data) {
    const q = item.quantity ?? 0;
    if (item.price.id === env.STRIPE_PRICE_PRACTICE) base += 5 * q;
    else if (item.price.id === env.STRIPE_PRICE_PRACTICE_EXTRA_SEAT) extras += q;
  }
  return (base || 5) + extras;
}

export default app;
