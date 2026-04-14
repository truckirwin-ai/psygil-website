# psygil-license

Fully automated subscription fulfillment for Psygil. Cloudflare Worker + D1 + R2 + Stripe + Resend. Device-bound licenses with signed JWTs.

## What it does

1. Marketing site hits `POST /api/checkout` with a tier, gets a Stripe Checkout URL, redirects the buyer.
2. Buyer pays. Stripe fires `checkout.session.completed` to `POST /api/webhooks/stripe`, and the Stripe-hosted success page redirects the buyer to `/thanks?session_id=...` which calls `GET /api/fulfill` for a synchronous result.
3. Both paths share `fulfillPaidCheckout`. It is idempotent via a `UNIQUE(stripe_session_id)` constraint: whoever arrives first creates the subscription row and seat tokens, the other reads the existing rows. The buyer sees their license key and signed installer links on the thanks page; the webhook is belt-and-braces.
4. The email with the license key and installer links goes out once, guarded by `email_sent_at`.
5. Desktop app calls `POST /api/license/activate` on first launch. Worker binds the seat to the device fingerprint and returns a signed JWT with a 7-day TTL.
6. App verifies the JWT offline against the embedded Ed25519 public key. If offline, it works until the JWT expires.
7. App refreshes the JWT daily in the background via `POST /api/license/refresh`. If the subscription is `past_due`, `canceled`, or a trial past `trial_ends_at`, refresh returns 403 with a specific error code and the app gates itself when the current JWT expires.
8. Buyer cancels, updates card, or reassigns seats from the Stripe Customer Portal. Webhooks keep the DB in sync.

### Trial track

1. `POST /api/trial/start { email }` creates a `tier='trial'` subscription row with `trial_ends_at = now + TRIAL_DAYS * 86400` and one seat token. The email is idempotent on address: returning to the form with the same email reuses the existing trial.
2. Activation and refresh treat trials identically to paid except `effectiveStatus` flips to `'expired'` after `trial_ends_at`.
3. To convert, marketing site calls `POST /api/checkout { tier, convert_from_sub_id }`. The resulting Checkout session carries `metadata.convert_seat_sub_id`. On fulfillment, `reparentSeats` moves the trial's seat rows to the new paid subscription, preserving the existing `device_fingerprint`. The app's next refresh picks up the new tier automatically — the user never re-activates.

## Fulfillment plan playbooks

The backend supports all three plans simultaneously. Switching between them is a marketing-site config change (`site-config.json`), not a code change.

### Plan A — Paid-first

- Hero CTA: **Start subscription** → `/pricing.html`
- Buyer picks tier → `/api/checkout` → Stripe Checkout → `/thanks?session_id=...` → `/api/fulfill` returns `{ tokens, installers, portal_url }` immediately.
- No trial exposed. Simplest funnel, highest-intent traffic.
- `site-config.json`: `"offer": "paid_only"`.

### Plan B — Trial-first

- Hero CTA: **Download 10-day trial** → `/download.html`
- Email form → `/api/trial/start` → returns `{ seat_token, installer_url }` inline; email also sent.
- Day 10 in-app: refresh returns `{ error: 'trial_expired', upgrade_sub_id }`. App shows an upgrade modal that opens `/pricing.html?convert_from=<sub_id>`.
- Pricing page detects the param and passes `convert_from_sub_id` to `/api/checkout`. After payment, seats reparent; the app keeps working without re-activation.
- `site-config.json`: `"offer": "trial_first"`.

### Plan C — Hybrid

- Both CTAs on the hero: trial on the left, buy on the right.
- Same backend. The trial convert path still works end to end.
- Best for unknown-intent traffic; adds one decision step.
- `site-config.json`: `"offer": "both"`.

To A/B test plans, edit `site-config.json`, redeploy Pages. The backend does not need to know which plan is active.

## Stack

| Layer | Tool |
|---|---|
| API | Cloudflare Workers (Hono) |
| DB | Cloudflare D1 |
| Installer hosting | Cloudflare R2 |
| Billing | Stripe Checkout + Customer Portal |
| Email | Resend |
| License format | Ed25519-signed JWT |

## Setup

### 1. Install deps

```bash
npm install
```

### 2. Stripe: create products and prices

In the Stripe Dashboard (or via CLI):

- Product "Psygil Solo" → recurring monthly price → save the `price_xxx` id
- Product "Psygil Practice" → recurring monthly price (5 seats) → save the `price_xxx` id
- Product "Psygil Practice Extra Seat" → recurring monthly price (per-seat) → save the `price_xxx` id
- For Enterprise: create manually per-deal in the Dashboard with `subscription_data.add_invoice_items` for the one-time setup fee.

Create a webhook endpoint pointed at `https://api.psygil.com/api/webhooks/stripe` subscribing to:

- `checkout.session.completed`
- `customer.subscription.updated`
- `customer.subscription.deleted`
- `invoice.payment_failed`

Save the **signing secret** (starts with `whsec_`).

### 3. Cloudflare: create D1 and R2

```bash
npx wrangler d1 create psygil-license
# copy the database_id into wrangler.toml

npx wrangler r2 bucket create psygil-installers

npm run db:migrate
```

Upload installer binaries to the R2 bucket with the keys `psygil-macos.dmg`, `psygil-windows.exe`, `psygil-linux.AppImage`. Replace or version them as you ship.

### 4. Generate the license-signing keypair

```bash
npm run keys:generate
```

Paste the base64 values into Worker secrets (step 5). Embed the PEM public key in the desktop app binary.

### 5. Set Worker secrets

```bash
npx wrangler secret put STRIPE_SECRET_KEY                    # sk_live_...
npx wrangler secret put STRIPE_WEBHOOK_SECRET                # whsec_...
npx wrangler secret put STRIPE_PRICE_SOLO                    # price_...
npx wrangler secret put STRIPE_PRICE_PRACTICE                # price_...
npx wrangler secret put STRIPE_PRICE_PRACTICE_EXTRA_SEAT     # price_...
npx wrangler secret put RESEND_API_KEY                       # re_...
npx wrangler secret put RESEND_FROM_EMAIL                    # "Psygil <no-reply@psygil.com>"
npx wrangler secret put LICENSE_SIGNING_KEY_PRIVATE          # base64 from keys:generate
npx wrangler secret put LICENSE_SIGNING_KEY_PUBLIC           # base64 from keys:generate
npx wrangler secret put DOWNLOAD_SIGNING_SECRET              # random 32-byte hex; also set on Pages
```

`DOWNLOAD_SIGNING_SECRET` must be identical on the Worker and on the marketing site's Pages project (where `functions/download/[platform].ts` runs). Generate with `openssl rand -hex 32` and set it once in each place.

### 6. Deploy

```bash
npm run deploy
```

Wire DNS: `api.psygil.com` → the Worker (uncomment the `routes` block in `wrangler.toml`, then `npm run deploy` again).

### 7. Wire the marketing site

In `pricing.html`, replace the `mailto:` Start buttons with:

```html
<button data-tier="solo"     class="btn btn-primary">Start Solo · $299/mo</button>
<button data-tier="practice" class="btn btn-primary">Start Practice · $1,000/mo</button>

<script>
document.querySelectorAll('[data-tier]').forEach((btn) => {
  btn.addEventListener('click', async () => {
    const res = await fetch('https://api.psygil.com/api/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: btn.dataset.tier }),
    });
    const { url } = await res.json();
    window.location.href = url;
  });
});
</script>
```

Add `https://api.psygil.com` to the site's CSP `connect-src` in `_headers`.

## API reference

### `POST /api/checkout`

```json
{ "tier": "solo" }                                      // or { "tier": "practice", "seats": 7 }
{ "tier": "solo", "convert_from_sub_id": "trial_xxx" }  // trial → paid conversion
```

Returns `{ "url": "https://checkout.stripe.com/..." }`. Redirect the buyer. When `convert_from_sub_id` is present and valid, the session's `metadata.convert_seat_sub_id` drives seat reparenting at fulfillment time.

### `GET /api/fulfill?session_id=cs_xxx`

Synchronous fulfillment for the `/thanks` page. Idempotent — safe to call before or after the webhook. Returns:

```json
{
  "tier": "solo",
  "customer_email": "clinician@example.com",
  "tokens": ["PSG-XXXX-XXXX-XXXX"],
  "installers": {
    "macos": "https://psygil.com/download/macos?t=...&e=...",
    "windows": "https://psygil.com/download/windows?t=...&e=...",
    "linux":  "https://psygil.com/download/linux?t=...&e=..."
  },
  "portal_url": "https://billing.stripe.com/..."
}
```

### `POST /api/trial/start`

```json
{ "email": "clinician@example.com" }
```

Returns `{ sub_id, seat_token, trial_ends_at, installers }`. Rejects with `409` if the email already has a paid subscription or a used trial.

### `POST /api/webhooks/stripe`

Stripe-signed. Do not call directly.

### `POST /api/license/activate`

```json
{
  "seat_token": "PSG-XXXX-XXXX-XXXX",
  "device_fingerprint": "sha256-of-hardware-ids",
  "device_label": "MBP-clinician-01"
}
```

Returns `{ jwt, tier, current_period_end, refresh_after_seconds }`. On conflict (seat bound to a different device) returns `409`. On inactive subscription returns `403`.

### `POST /api/license/refresh`

```json
{
  "jwt": "<current jwt>",
  "device_fingerprint": "sha256-of-hardware-ids"
}
```

Returns a fresh JWT if the subscription is still active. Call daily from the desktop app.

### `POST /api/portal`

```json
{ "jwt": "<current jwt>" }
```

Returns `{ "url": "https://billing.stripe.com/..." }`. Open in the system browser.

## Desktop app integration

1. Embed `LICENSE_SIGNING_KEY_PUBLIC` (PEM) in the app binary.
2. Derive a stable `device_fingerprint`: hash of machine UUID + primary MAC + OS build. Do not include anything the user routinely changes.
3. On first launch, prompt for the seat token, call `/api/license/activate`, store the JWT and fingerprint locally (keychain on macOS, DPAPI on Windows, Secret Service on Linux).
4. On every launch, verify the JWT locally. If `exp < now`, call `/api/license/refresh`. If offline, allow up to 7 days grace.
5. Daily background refresh when the app is open.
6. If refresh returns 403 with `status: 'canceled'`, gate the app after the current JWT's `exp`. Show the Customer Portal link.
7. Add a Settings → Billing button that calls `/api/portal` and opens the returned URL.

## What's still TODO

- **Practice seat invitations**: current flow emails all N tokens to the admin. A nicer flow is a `/seats` page where the admin invites clinicians by email and each claims their own token. Add a `POST /api/seats/invite` route backed by a `seat_invites` table.
- **Rate limiting**: add the Workers rate limiting binding on `/api/license/activate` and `/api/checkout` before launch.
- **Key rotation**: schema supports it; implement dual-trust in the desktop app (verify against both current and previous public keys for one TTL window during rotation).
- **Dunning**: Stripe handles retries, but you may want a `customer.subscription.updated` handler that emails the user when their card is about to expire.
- **Enterprise onboarding**: currently gated through `sales@`. If volume grows, add a `/api/enterprise/quote` endpoint that creates a draft subscription with the setup fee line item and emails a quote link.

## Costs at low volume

- Cloudflare Workers: free tier covers 100k requests/day
- D1: free tier covers 5GB and 5M reads/day
- R2: $0.015/GB stored, free egress from Workers
- Resend: $20/mo for 50k emails
- Stripe: 2.9% + 30¢ per charge
