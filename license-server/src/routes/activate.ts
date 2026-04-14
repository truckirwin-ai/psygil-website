import { Hono } from 'hono';
import type { Env } from '../types';
import {
  bindSeat,
  effectiveStatus,
  getSeatByToken,
  getSubscription,
  logEvent,
  periodEnd,
  touchSeat,
} from '../lib/db';
import { signLicenseJwt } from '../lib/jwt';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/license/activate
 * body: { seat_token, device_fingerprint, device_label? }
 * returns: { jwt, tier, is_trial, period_end, refresh_after_seconds }
 *
 * First call on an unbound seat binds the device. Subsequent calls require the same fingerprint.
 * Trials are treated as 'active' until trial_ends_at passes, then activation/refresh both refuse.
 * Rebinding a seat to a different device is handled out-of-band (support request or Customer Portal).
 */
app.post('/', async (c) => {
  const body = await c.req.json<{
    seat_token: string;
    device_fingerprint: string;
    device_label?: string;
  }>().catch(() => null);

  if (!body?.seat_token || !body?.device_fingerprint) {
    return c.json({ error: 'bad_request' }, 400);
  }

  const ctx = {
    ip: c.req.header('cf-connecting-ip') ?? undefined,
    user_agent: c.req.header('user-agent') ?? undefined,
  };

  const seat = await getSeatByToken(c.env, body.seat_token);
  if (!seat) {
    await logEvent(c.env, 'denied', { ...ctx, detail: 'unknown_token' });
    return c.json({ error: 'unknown_token' }, 404);
  }

  const sub = await getSubscription(c.env, seat.subscription_id);
  const status = sub ? effectiveStatus(sub) : 'canceled';
  if (!sub || status !== 'active') {
    await logEvent(c.env, 'denied', {
      seat_id: seat.id,
      ...ctx,
      detail: `status=${status} tier=${sub?.tier ?? 'missing'}`,
    });
    const errCode = status === 'expired' ? 'trial_expired' : 'subscription_inactive';
    return c.json({ error: errCode, status, upgrade_sub_id: sub?.tier === 'trial' ? sub.id : null }, 403);
  }

  if (seat.device_fingerprint && seat.device_fingerprint !== body.device_fingerprint) {
    await logEvent(c.env, 'denied', {
      seat_id: seat.id,
      device_fingerprint: body.device_fingerprint,
      ...ctx,
      detail: 'seat_bound_to_other_device',
    });
    return c.json(
      {
        error: 'seat_bound_to_other_device',
        hint: 'Reassign via Stripe Customer Portal or contact support@psygil.com',
      },
      409,
    );
  }

  if (!seat.device_fingerprint) {
    await bindSeat(c.env, seat.id, body.device_fingerprint, body.device_label ?? '');
    await logEvent(c.env, 'activate', {
      seat_id: seat.id,
      device_fingerprint: body.device_fingerprint,
      ...ctx,
    });
  } else {
    await touchSeat(c.env, seat.id);
  }

  const pe = periodEnd(sub);
  const isTrial = sub.tier === 'trial';
  const jwt = await signLicenseJwt(c.env, {
    sub: seat.id,
    sub_id: sub.id,
    tier: sub.tier,
    fp: body.device_fingerprint,
    period_end: pe,
    is_trial: isTrial,
  });

  const ttl = Number(c.env.JWT_TTL_SECONDS);
  // For trials, clamp refresh cadence so the JWT cannot outlive trial_ends_at by much.
  const refreshAfter = isTrial
    ? Math.max(3600, Math.min(ttl, Math.max(0, pe - Math.floor(Date.now() / 1000))) / 2)
    : ttl / 2;

  return c.json({
    jwt,
    tier: sub.tier,
    is_trial: isTrial,
    period_end: pe,
    refresh_after_seconds: Math.floor(refreshAfter),
    upgrade_sub_id: isTrial ? sub.id : null,
  });
});

export default app;
