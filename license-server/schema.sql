-- Psygil license server schema
-- Run: npm run db:migrate (remote) or npm run db:migrate:local (local dev)
--
-- Design goals:
--   - Support paid subscriptions AND trial licenses in the same tables
--   - Idempotent fulfillment: webhook and sync /fulfill both safe to run for the same session
--   - Trial → paid conversion preserves the seat and its device binding

CREATE TABLE IF NOT EXISTS subscriptions (
  id                   TEXT PRIMARY KEY,            -- Stripe sub_xxx for paid; 'trial_' + uuid for trials
  stripe_session_id    TEXT UNIQUE,                 -- Checkout Session id (null for trials); idempotency key
  customer_id          TEXT,                        -- Stripe customer id (null for trials)
  customer_email       TEXT NOT NULL,
  tier                 TEXT NOT NULL CHECK (tier IN ('trial','solo','practice','enterprise')),
  seat_limit           INTEGER NOT NULL,
  status               TEXT NOT NULL CHECK (status IN ('active','past_due','canceled','expired')),
  current_period_end   INTEGER,                     -- unix seconds (null for trials)
  trial_ends_at        INTEGER,                     -- unix seconds (set for trials only)
  converted_to_sub_id  TEXT,                        -- if a trial was converted, points at the paid sub
  email_sent_at        INTEGER,                     -- one-shot guard for fulfillment email
  created_at           INTEGER NOT NULL,
  updated_at           INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_subs_customer ON subscriptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_subs_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_subs_email ON subscriptions(customer_email);

CREATE TABLE IF NOT EXISTS seats (
  id                  TEXT PRIMARY KEY,            -- uuid, stable across trial→paid conversion
  subscription_id     TEXT NOT NULL REFERENCES subscriptions(id) ON DELETE CASCADE,
  seat_token          TEXT UNIQUE NOT NULL,
  assigned_email      TEXT,
  device_fingerprint  TEXT,
  device_label        TEXT,
  bound_at            INTEGER,
  last_seen_at        INTEGER,
  created_at          INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_seats_sub ON seats(subscription_id);
CREATE INDEX IF NOT EXISTS idx_seats_token ON seats(seat_token);
CREATE INDEX IF NOT EXISTS idx_seats_fingerprint ON seats(device_fingerprint);

CREATE TABLE IF NOT EXISTS activation_log (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  seat_id             TEXT,
  event               TEXT NOT NULL,
  device_fingerprint  TEXT,
  ip                  TEXT,
  user_agent          TEXT,
  detail              TEXT,
  created_at          INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_log_seat ON activation_log(seat_id);
CREATE INDEX IF NOT EXISTS idx_log_event ON activation_log(event);
CREATE INDEX IF NOT EXISTS idx_log_created ON activation_log(created_at);
