import type Stripe from 'stripe';
import type { Env, PaidTier, Tier } from '../types';
import {
  claimFulfillment,
  createSeats,
  defaultSeatLimit,
  getSeatsBySubscription,
  logEvent,
  now,
  reparentSeats,
  updateSubscription,
} from './db';
import { buildInstallerUrls, fulfillmentEmail, sendEmail } from './email';
import { generateSeatToken } from './tokens';

export interface FulfillmentResult {
  already_fulfilled: boolean;
  subscription_id: string;
  customer_email: string;
  tier: Tier;
  tokens: string[];
  installers: Record<string, string>;
  portal_url: string | null;
}

/**
 * Idempotent fulfillment for a paid Stripe Checkout session.
 *
 * Called from both:
 *   - POST /api/webhooks/stripe (checkout.session.completed)
 *   - GET  /api/fulfill?session_id=... (synchronous, from the /thanks page)
 *
 * First caller wins: claims the stripe_session_id, generates seat tokens, emails the buyer.
 * Second caller detects the existing row and returns the same tokens without side effects.
 *
 * If the session carries metadata.convert_seat_id, the existing trial subscription's seats
 * are reparented to the new paid subscription (preserving device bindings).
 */
export async function fulfillPaidCheckout(
  env: Env,
  stripe: Stripe,
  session: Stripe.Checkout.Session,
): Promise<FulfillmentResult> {
  if (!session.subscription || !session.customer) {
    throw new Error('session_missing_subscription_or_customer');
  }
  if (session.payment_status !== 'paid' && session.payment_status !== 'no_payment_required') {
    throw new Error(`session_not_paid: ${session.payment_status}`);
  }

  const tier = (session.metadata?.tier ?? 'solo') as PaidTier;
  const convertSeatSubId = session.metadata?.convert_seat_sub_id ?? null;

  const subId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
  const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
  const stripeSub = await stripe.subscriptions.retrieve(subId);
  const email = session.customer_details?.email ?? session.customer_email ?? '';
  const seatLimit = computeSeatLimit(env, tier, stripeSub);

  const claim = await claimFulfillment(env, {
    id: subId,
    stripe_session_id: session.id,
    customer_id: customerId,
    customer_email: email,
    tier,
    seat_limit: seatLimit,
    status: mapStripeStatus(stripeSub.status),
    current_period_end: stripeSub.current_period_end,
    trial_ends_at: null,
  });

  if (!claim.created && claim.existing) {
    const seats = await getSeatsBySubscription(env, claim.existing.id);
    const [installers, portal] = await Promise.all([
      buildInstallerUrls(env, email),
      createPortalUrl(stripe, env, customerId),
    ]);
    return {
      already_fulfilled: true,
      subscription_id: claim.existing.id,
      customer_email: claim.existing.customer_email,
      tier: claim.existing.tier,
      tokens: seats.map((s) => s.seat_token),
      installers,
      portal_url: portal,
    };
  }

  let tokens: string[];
  if (convertSeatSubId) {
    // Conversion path: move existing trial seats to the new paid subscription.
    await reparentSeats(env, convertSeatSubId, subId);
    await updateSubscription(env, convertSeatSubId, {
      status: 'canceled',
      converted_to_sub_id: subId,
    });
    const seats = await getSeatsBySubscription(env, subId);
    tokens = seats.map((s) => s.seat_token);
    // If the new tier has more seats than the trial had, add more tokens to reach seat_limit.
    while (tokens.length < seatLimit) {
      const t = generateSeatToken();
      await createSeats(env, subId, [t]);
      tokens.push(t);
    }
    await logEvent(env, 'trial_converted', {
      detail: `trial=${convertSeatSubId} paid=${subId} tier=${tier}`,
    });
  } else {
    tokens = Array.from({ length: seatLimit }, () => generateSeatToken());
    await createSeats(env, subId, tokens);
  }

  const [installers, portal] = await Promise.all([
    buildInstallerUrls(env, email),
    createPortalUrl(stripe, env, customerId),
  ]);

  await maybeSendFulfillmentEmail(env, subId, {
    tier,
    customer_email: email,
    tokens,
    installers,
    portal_url: portal ?? `${env.APP_URL}/account`,
  });

  await logEvent(env, 'fulfilled', {
    detail: `sub=${subId} tier=${tier} seats=${seatLimit} email=${email}${convertSeatSubId ? ` converted_from=${convertSeatSubId}` : ''}`,
  });

  return {
    already_fulfilled: false,
    subscription_id: subId,
    customer_email: email,
    tier,
    tokens,
    installers,
    portal_url: portal,
  };
}

/**
 * Start a trial: create a trial subscription row, generate one seat token, send the
 * welcome email with installer links. Idempotent on (email): a second call within the
 * active trial window returns the existing tokens without re-sending the email.
 */
export async function startTrial(
  env: Env,
  args: { email: string },
): Promise<FulfillmentResult> {
  const trialDays = Number(env.TRIAL_DAYS || '10');
  const trialId = `trial_${crypto.randomUUID()}`;
  const trialEndsAt = now() + trialDays * 86400;

  const claim = await claimFulfillment(env, {
    id: trialId,
    stripe_session_id: null,
    customer_id: null,
    customer_email: args.email,
    tier: 'trial',
    seat_limit: 1,
    status: 'active',
    current_period_end: null,
    trial_ends_at: trialEndsAt,
  });

  if (!claim.created) throw new Error('trial_claim_race');

  const tokens = [generateSeatToken()];
  await createSeats(env, trialId, tokens);

  const installers = await buildInstallerUrls(env, args.email);

  await maybeSendFulfillmentEmail(env, trialId, {
    tier: 'trial',
    customer_email: args.email,
    tokens,
    installers,
    portal_url: `${env.APP_URL}/account`,
  });

  await logEvent(env, 'trial_started', {
    detail: `trial=${trialId} email=${args.email} ends=${trialEndsAt}`,
  });

  return {
    already_fulfilled: false,
    subscription_id: trialId,
    customer_email: args.email,
    tier: 'trial',
    tokens,
    installers,
    portal_url: null,
  };
}

async function maybeSendFulfillmentEmail(
  env: Env,
  subscription_id: string,
  args: {
    tier: Tier;
    customer_email: string;
    tokens: string[];
    installers: Record<string, string>;
    portal_url: string;
  },
): Promise<void> {
  if (!args.customer_email) return;
  // Idempotency: set email_sent_at only if null. If another worker already sent, skip.
  const res = await env.DB.prepare(
    `UPDATE subscriptions SET email_sent_at = ? WHERE id = ? AND email_sent_at IS NULL`,
  )
    .bind(now(), subscription_id)
    .run();
  if ((res.meta?.changes ?? 0) === 0) return;

  const { subject, html, text } = fulfillmentEmail(args);
  try {
    await sendEmail(env, {
      to: args.customer_email,
      subject,
      html,
      text,
    });
  } catch (err) {
    // Roll back the email_sent_at so a retry can try again.
    await env.DB.prepare(`UPDATE subscriptions SET email_sent_at = NULL WHERE id = ?`)
      .bind(subscription_id)
      .run();
    throw err;
  }
}

async function createPortalUrl(stripe: Stripe, env: Env, customerId: string): Promise<string | null> {
  try {
    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${env.APP_URL}/account`,
    });
    return session.url;
  } catch (err) {
    console.warn('portal_create_failed', err);
    return null;
  }
}

export function mapStripeStatus(s: Stripe.Subscription.Status): 'active' | 'past_due' | 'canceled' {
  switch (s) {
    case 'active':
    case 'trialing':
      return 'active';
    case 'past_due':
    case 'unpaid':
      return 'past_due';
    default:
      return 'canceled';
  }
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
