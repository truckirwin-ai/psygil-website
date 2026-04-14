import type { Env, PaidTier, Seat, Subscription, Tier } from '../types';

export function now(): number {
  return Math.floor(Date.now() / 1000);
}

/**
 * Insert a subscription row, or return the existing one if the Stripe session id
 * already fulfilled this purchase. Used as the idempotency gate for both the
 * webhook and the synchronous /api/fulfill path.
 *
 * Returns { created: true } on first insert, { created: false, existing } on replay.
 */
export async function claimFulfillment(
  env: Env,
  sub: Omit<Subscription, 'created_at' | 'updated_at' | 'email_sent_at' | 'converted_to_sub_id'>,
): Promise<{ created: boolean; existing?: Subscription }> {
  const t = now();
  // If this stripe_session_id was already written, INSERT OR IGNORE is a no-op.
  const res = await env.DB.prepare(
    `INSERT OR IGNORE INTO subscriptions
      (id, stripe_session_id, customer_id, customer_email, tier, seat_limit, status,
       current_period_end, trial_ends_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      sub.id,
      sub.stripe_session_id,
      sub.customer_id,
      sub.customer_email,
      sub.tier,
      sub.seat_limit,
      sub.status,
      sub.current_period_end,
      sub.trial_ends_at,
      t,
      t,
    )
    .run();

  if ((res.meta?.changes ?? 0) === 1) return { created: true };

  // Replay: look up the existing row, either by our id or by stripe_session_id.
  const existing =
    (await env.DB.prepare(
      `SELECT * FROM subscriptions WHERE id = ? OR (stripe_session_id IS NOT NULL AND stripe_session_id = ?)`,
    )
      .bind(sub.id, sub.stripe_session_id ?? '')
      .first<Subscription>()) ?? undefined;

  return { created: false, existing };
}

export async function updateSubscription(
  env: Env,
  id: string,
  fields: Partial<
    Pick<
      Subscription,
      'status' | 'current_period_end' | 'seat_limit' | 'trial_ends_at' | 'converted_to_sub_id' | 'email_sent_at' | 'tier' | 'customer_id' | 'stripe_session_id'
    >
  >,
): Promise<void> {
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const [k, v] of Object.entries(fields)) {
    sets.push(`${k}=?`);
    vals.push(v);
  }
  if (sets.length === 0) return;
  sets.push('updated_at=?');
  vals.push(now(), id);
  await env.DB.prepare(`UPDATE subscriptions SET ${sets.join(', ')} WHERE id=?`).bind(...vals).run();
}

export async function getSubscription(env: Env, id: string): Promise<Subscription | null> {
  const row = await env.DB.prepare(`SELECT * FROM subscriptions WHERE id = ?`).bind(id).first<Subscription>();
  return row ?? null;
}

export async function getSubscriptionBySessionId(
  env: Env,
  stripe_session_id: string,
): Promise<Subscription | null> {
  const row = await env.DB
    .prepare(`SELECT * FROM subscriptions WHERE stripe_session_id = ?`)
    .bind(stripe_session_id)
    .first<Subscription>();
  return row ?? null;
}

export async function getSubscriptionByCustomerEmail(
  env: Env,
  email: string,
): Promise<Subscription | null> {
  const row = await env.DB
    .prepare(`SELECT * FROM subscriptions WHERE customer_email = ? ORDER BY created_at DESC LIMIT 1`)
    .bind(email)
    .first<Subscription>();
  return row ?? null;
}

export async function createSeats(
  env: Env,
  subscription_id: string,
  tokens: string[],
): Promise<string[]> {
  const t = now();
  const seatIds: string[] = [];
  const stmts = tokens.map((token) => {
    const id = crypto.randomUUID();
    seatIds.push(id);
    return env.DB.prepare(
      `INSERT INTO seats (id, subscription_id, seat_token, created_at) VALUES (?, ?, ?, ?)`,
    ).bind(id, subscription_id, token, t);
  });
  await env.DB.batch(stmts);
  return seatIds;
}

export async function getSeatsBySubscription(env: Env, subscription_id: string): Promise<Seat[]> {
  const res = await env.DB
    .prepare(`SELECT * FROM seats WHERE subscription_id = ? ORDER BY created_at ASC`)
    .bind(subscription_id)
    .all<Seat>();
  return res.results ?? [];
}

export async function reparentSeats(
  env: Env,
  from_subscription_id: string,
  to_subscription_id: string,
): Promise<void> {
  await env.DB
    .prepare(`UPDATE seats SET subscription_id = ? WHERE subscription_id = ?`)
    .bind(to_subscription_id, from_subscription_id)
    .run();
}

export async function getSeatByToken(env: Env, token: string): Promise<Seat | null> {
  return (await env.DB.prepare(`SELECT * FROM seats WHERE seat_token = ?`).bind(token).first<Seat>()) ?? null;
}

export async function getSeatById(env: Env, id: string): Promise<Seat | null> {
  return (await env.DB.prepare(`SELECT * FROM seats WHERE id = ?`).bind(id).first<Seat>()) ?? null;
}

export async function bindSeat(
  env: Env,
  seat_id: string,
  fingerprint: string,
  label: string,
): Promise<void> {
  const t = now();
  await env.DB.prepare(
    `UPDATE seats SET device_fingerprint=?, device_label=?, bound_at=?, last_seen_at=? WHERE id=?`,
  ).bind(fingerprint, label, t, t, seat_id).run();
}

export async function touchSeat(env: Env, seat_id: string): Promise<void> {
  await env.DB.prepare(`UPDATE seats SET last_seen_at=? WHERE id=?`).bind(now(), seat_id).run();
}

export async function logEvent(
  env: Env,
  event: string,
  detail: {
    seat_id?: string;
    device_fingerprint?: string;
    ip?: string;
    user_agent?: string;
    detail?: string;
  },
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO activation_log (seat_id, event, device_fingerprint, ip, user_agent, detail, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
  )
    .bind(
      detail.seat_id ?? null,
      event,
      detail.device_fingerprint ?? null,
      detail.ip ?? null,
      detail.user_agent ?? null,
      detail.detail ?? null,
      now(),
    )
    .run();
}

export function defaultSeatLimit(tier: Tier): number {
  switch (tier) {
    case 'trial': return 1;
    case 'solo': return 1;
    case 'practice': return 5;
    case 'enterprise': return 25;
  }
}

/**
 * Check whether a subscription is currently active considering trial expiration.
 * Returns the effective status: 'active', 'expired' (trial), 'past_due', 'canceled'.
 */
export function effectiveStatus(sub: Subscription): SubStatusEffective {
  if (sub.tier === 'trial') {
    if (sub.trial_ends_at && sub.trial_ends_at < now()) return 'expired';
    return sub.status === 'active' ? 'active' : sub.status;
  }
  return sub.status;
}

export type SubStatusEffective = Subscription['status'];

export function periodEnd(sub: Subscription): number {
  return sub.tier === 'trial' ? (sub.trial_ends_at ?? 0) : (sub.current_period_end ?? 0);
}

export function isPaidTier(tier: Tier): tier is PaidTier {
  return tier !== 'trial';
}
