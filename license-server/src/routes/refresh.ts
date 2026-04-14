import { Hono } from 'hono';
import type { Env } from '../types';
import {
  effectiveStatus,
  getSeatById,
  getSubscription,
  logEvent,
  periodEnd,
  touchSeat,
} from '../lib/db';
import { signLicenseJwt, verifyLicenseJwt } from '../lib/jwt';

const app = new Hono<{ Bindings: Env }>();

/**
 * POST /api/license/refresh
 * body: { jwt, device_fingerprint }
 * returns: { jwt, tier, is_trial, period_end, refresh_after_seconds, upgrade_sub_id? }
 *
 * Called by the desktop app in the background. If the underlying seat was reparented
 * to a paid subscription during a trial conversion, this endpoint reflects the new
 * tier automatically — no re-activation needed on the client.
 */
app.post('/', async (c) => {
  const body = await c.req.json<{ jwt: string; device_fingerprint: string }>().catch(() => null);
  if (!body?.jwt || !body?.device_fingerprint) return c.json({ error: 'bad_request' }, 400);

  let claims;
  try {
    claims = await verifyLicenseJwt(c.env, body.jwt);
  } catch (err) {
    return c.json({ error: 'invalid_jwt', detail: String(err) }, 401);
  }

  if (claims.fp !== body.device_fingerprint) {
    return c.json({ error: 'fingerprint_mismatch' }, 403);
  }

  const seat = await getSeatById(c.env, claims.sub);
  if (!seat) return c.json({ error: 'seat_missing' }, 404);

  const sub = await getSubscription(c.env, seat.subscription_id);
  const status = sub ? effectiveStatus(sub) : 'canceled';
  if (!sub || status !== 'active') {
    await logEvent(c.env, 'refresh_denied', {
      seat_id: seat.id,
      detail: `status=${status} tier=${sub?.tier ?? 'missing'}`,
    });
    const errCode = status === 'expired' ? 'trial_expired' : 'subscription_inactive';
    return c.json({ error: errCode, status, upgrade_sub_id: sub?.tier === 'trial' ? sub.id : null }, 403);
  }

  await touchSeat(c.env, seat.id);

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
