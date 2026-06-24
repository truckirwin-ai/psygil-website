# Email setup runbook for psygil.com

Foundry SMB LLC. Internal operational runbook.
Version 1.0. Effective: 2026-05-14. Owner: Robert Irwin.

This runbook stands up a complete inbound and outbound email system for `@psygil.com` on Cloudflare. It assumes the domain is already on Cloudflare DNS and the website is deployed via Cloudflare Pages, both of which are current.

The system has three planes. Each plane is configured independently and they coexist on the same DNS zone:

1. **Inbound mail.** Cloudflare Email Routing receives mail at `@psygil.com`, forwards to a real mailbox. Free.
2. **Outbound human mail.** A real mailbox provider (recommended: Google Workspace) so the founder can send conversational and cold outreach mail from `founder@psygil.com`. ~$7/user/month.
3. **Outbound transactional mail.** Resend sends form submissions and system mail from `forms@psygil.com` or `noreply@psygil.com`. Already integrated under `functions/api/`. Free tier covers our volume.

A common confusion: Cloudflare Email Routing only forwards inbound mail. It cannot send outbound. To send mail from `founder@psygil.com` you need a real mailbox provider or an SMTP relay. The simplest path is Google Workspace; this runbook documents it.

---

## 1. Decisions before you click anything

Make these choices before touching Cloudflare:

1. **Where forwarded inbound mail lands.** Default: `truckirwin@gmail.com`. Phase B replaces this with a Workspace inbox.
2. **Outbound mailbox provider.** Recommended: Google Workspace Business Starter. List pricing is $7/user/month on the annual plan or $8.40/user/month on flexible monthly billing. A 50% promotional discount runs through August 27, 2026; new signups effectively pay $3.50/user/month for the first year on annual billing. Alternatives: Fastmail ($5/user/month), Zoho Mail (free single-user tier with a custom domain), Microsoft 365 ($6/user). Workspace is the path with the least friction for clinician outreach because Gmail's deliverability is excellent and the founder already lives in Gmail. Note: Cloudflare announced an Email Service (private beta, 2026) that will eventually add outbound sending via Workers API; until that ships generally, a real mailbox provider is still required for human-readable outbound.
3. **Whether to register a second domain for high-volume cold outreach.** Not needed for Phase 0; revisit at week 8 of the marketing plan. Candidates: `getpsygil.com`, `trypsygil.com`, `psygil.app`, `mail.psygil.com` (subdomain on the existing zone).
4. **DMARC posture.** Start at `p=none` to observe, move to `p=quarantine` within two weeks, move to `p=reject` once Workspace and Resend are confirmed clean.

---

## 2. Alias map (what address does what)

Configure these inbound aliases. Workspace aliases are free; you do not need one license per alias.

| Address | Purpose | Forwards to |
|---|---|---|
| `hello@psygil.com` | General inquiries, contact form fallback | Robert |
| `founder@psygil.com` | Founder outreach reply-to | Robert |
| `support@psygil.com` | Support page form destination | Robert (later: support inbox) |
| `sales@psygil.com` | Enterprise form destination, sample discovery requests | Robert |
| `security@psygil.com` | Responsible disclosure | Robert |
| `abuse@psygil.com` | Abuse reports, required by RFCs and many registries | Robert |
| `postmaster@psygil.com` | Required by RFC 2142, surfaces deliverability problems | Robert |
| `legal@psygil.com` | Contract or legal questions | Robert |
| `privacy@psygil.com` | Privacy / data subject requests, referenced in policies | Robert |
| `press@psygil.com` | Media inquiries | Robert |
| `careers@psygil.com` | Job inquiries | Robert |
| `noreply@psygil.com` | Outbound transactional (Resend), no inbound | (drop) |
| `forms@psygil.com` | Form-submission system mail (Resend) | Robert |

The drop on `noreply` is intentional. We do not want bounce mail to a black hole. Cloudflare Email Routing also accepts a "drop" rule for known-noisy auto-replies.

---

## 3. Phase A: Cloudflare Email Routing (inbound, free)

Sets up inbound forwarding to `truckirwin@gmail.com` while the website forms continue to work via Resend. This is the fastest path to "the site can receive mail."

### Step A1: Enable Email Routing

1. Cloudflare dashboard → select `psygil.com`.
2. Left nav → **Email** → **Email Routing**.
3. Click **Get started** (or **Enable Email Routing**).
4. Cloudflare will offer to add the required MX records and SPF record automatically. Accept the automatic addition. The MX records will look like:
   - `psygil.com  MX 10  route1.mx.cloudflare.net.`
   - `psygil.com  MX 24  route2.mx.cloudflare.net.`
   - `psygil.com  MX 38  route3.mx.cloudflare.net.`
5. The SPF record Cloudflare adds will look like:
   - `psygil.com  TXT  "v=spf1 include:_spf.mx.cloudflare.net ~all"`
6. Verify the records appear under **DNS → Records**.

If you already had MX records pointing somewhere else (Google, Zoho, a previous host), Cloudflare will warn you. For Phase A we want only Cloudflare's MX records. If old ones exist, delete them after confirming the new ones are saved.

### Step A2: Verify the destination mailbox

1. **Email Routing → Destination addresses → Add destination address**.
2. Enter `truckirwin@gmail.com`.
3. Open the verification email Cloudflare sends to that address. Click the link.
4. Status flips to **Verified**.

### Step A3: Create the aliases

In **Email Routing → Routes → Custom addresses**, add each alias from the table in section 2. The fastest pattern:

1. Click **Create address**.
2. Custom address: `hello@psygil.com`.
3. Action: **Send to an email**.
4. Destination: `truckirwin@gmail.com`.
5. Save.

Repeat for `founder`, `support`, `sales`, `security`, `abuse`, `postmaster`, `legal`, `privacy`, `press`, `careers`, `forms`.

For `noreply`:

1. Click **Create address**.
2. Custom address: `noreply@psygil.com`.
3. Action: **Drop**.
4. Save.

Optional catch-all (recommended early on, replace later):

1. Email Routing → Routes → **Catch-all address**.
2. Action: **Send to an email**.
3. Destination: `truckirwin@gmail.com`.
4. Enable.

The catch-all gets you any mail to addresses you forgot to configure. Disable it once Phase B is live and a typo `slaes@psygil.com` is no longer interesting.

### Step A4: Smoke test

1. From your phone or a second email account, send to `hello@psygil.com`.
2. Watch it arrive in `truckirwin@gmail.com` within seconds.
3. Repeat for two or three other aliases.
4. Test the drop: send to `noreply@psygil.com` from a throwaway. It should be silently dropped (no bounce back to sender per Cloudflare's behavior).

Phase A is complete. The site can now receive mail.

---

## 4. Phase B: Outbound founder mailbox (Google Workspace)

You need this before sending any cold outreach. Resend will not send cold email; Cloudflare Email Routing cannot send any outbound. Workspace gives the founder a real `founder@psygil.com` mailbox with Gmail's deliverability.

### Step B1: Provision Google Workspace

1. Sign up at `workspace.google.com` for Business Starter ($7/user/month).
2. Use `psygil.com` as the primary domain.
3. Create the primary user: `founder@psygil.com` (or `robert@psygil.com` if you prefer that as the canonical address).
4. **Do NOT verify the domain via TXT yet if Workspace asks during signup.** We will switch MX to Workspace ourselves below.

### Step B2: Verify the domain in Workspace

Workspace will offer a TXT verification token. Add it via Cloudflare DNS:

1. Cloudflare → DNS → Records → **Add record**.
2. Type: `TXT`.
3. Name: `@` (root).
4. Content: the value Workspace gave you (looks like `google-site-verification=...`).
5. TTL: Auto.
6. Save.
7. Back in Workspace, click **Verify**. Should clear within minutes.

### Step B3: Migrate MX to Google

Because Workspace must receive mail directly, Cloudflare Email Routing's MX records have to be replaced with Google's. The aliases you set up in Phase A will stop working at this point; replace them with Workspace aliases (free, no per-alias cost).

1. Cloudflare → DNS → Records → delete the three `route*.mx.cloudflare.net` MX records.
2. Add Google's MX records:
   - `psygil.com  MX  1  smtp.google.com.`
   (Modern Workspace uses a single MX. If your setup shows the legacy five MX records, use those. Cross-check at `support.google.com/a/answer/140034` if unsure.)
3. Cloudflare → Email Routing → **Disable**. The Email Routing dashboard will warn that disabling the service deletes the MX records; that is fine, we already replaced them.
4. Wait 10 to 30 minutes for DNS propagation.

### Step B4: Configure Workspace aliases

In Workspace admin:

1. **Directory → Users → founder@psygil.com → Email aliases**.
2. Add each alias from the table in section 2 that should land in the founder inbox: `hello`, `support`, `sales`, `security`, `abuse`, `postmaster`, `legal`, `privacy`, `press`, `careers`, `forms`.
3. Save.

Workspace permits unlimited aliases per user at no extra cost. All of them deliver to the founder inbox; in Gmail you can filter by alias to separate Support from Sales visually.

### Step B5: Enable "send mail as" each alias

In the founder Gmail account:

1. Settings → **Accounts and Import** → **Send mail as** → **Add another email address**.
2. For each alias, add as a "send mail as" address with **treat as alias** checked.
3. Workspace will not require additional SMTP credentials because all the aliases are inside the same account.

You can now compose a new mail and pick `support@psygil.com` from the From dropdown. Replies to `support@psygil.com` will surface in the same Gmail inbox.

### Step B6: SPF, DKIM, DMARC for Workspace

Workspace requires SPF and DKIM records on the DNS zone. Cloudflare's old SPF record needs to be replaced with one that includes Google:

1. Cloudflare → DNS → Records → delete the old `psygil.com TXT "v=spf1 include:_spf.mx.cloudflare.net ~all"` if present.
2. Add a new SPF record that allows Google plus Resend:
   - Type: `TXT`
   - Name: `@`
   - Content: `v=spf1 include:_spf.google.com include:amazonses.com ~all`
   - TTL: Auto
3. In Workspace admin → **Apps → Google Workspace → Gmail → Authenticate email**, generate a DKIM key. Workspace gives you a TXT record like `google._domainkey.psygil.com  TXT  "v=DKIM1; k=rsa; p=..."`.
4. Add that DKIM record in Cloudflare DNS exactly as Workspace gave it.
5. Wait for propagation (10 to 30 minutes).
6. In Workspace, click **Start authentication**.

DMARC is configured in section 7 below.

### Step B7: Smoke test outbound

1. From the founder Gmail account, compose a new mail to a personal address.
2. Set From to `founder@psygil.com`.
3. Send. Verify it lands cleanly (not spam) on a Gmail recipient.
4. Repeat to a recipient on a non-Google provider (an `outlook.com` address ideally). This catches Microsoft-specific deliverability issues early.
5. Check headers on the received mail. Look for `SPF: PASS`, `DKIM: PASS`, and (later) `DMARC: PASS`.

Phase B is complete. You can now send and receive from `@psygil.com`.

---

## 5. Phase C: Outbound transactional (Resend)

Already configured per `CLAUDE.md`. The Cloudflare Pages functions at `functions/api/support.ts` and `functions/api/enterprise.ts` use `RESEND_API_KEY` to send form submissions to `support@psygil.com` and `sales@psygil.com`. This runbook documents the verification step so you can confirm it survives the Phase B MX migration.

### Step C1: Verify the Resend domain

1. Sign in at `resend.com` → **Domains**.
2. Confirm `psygil.com` (or a subdomain such as `send.psygil.com`, depending on existing setup) is verified.
3. Resend adds three records: a verification TXT, a DKIM TXT at `resend._domainkey`, and a Return-Path CNAME. Confirm all three are present in Cloudflare DNS.
4. Status should read **Verified** in Resend.

If Resend was configured before this runbook, the DKIM record is already in place and the migration to Workspace does not affect it. DKIM records are scoped by selector, so Resend (`resend._domainkey`) and Google (`google._domainkey`) coexist without conflict.

### Step C2: Confirm SPF includes Resend's sending IPs

Resend sends through Amazon SES. The SPF record from Step B6 already includes `amazonses.com`, which covers Resend. If you change senders later, update SPF accordingly.

### Step C3: Test the live forms

1. Open `https://psygil.com/support` in a browser.
2. Submit a real-looking test submission with your personal email in the reply-to field.
3. Confirm the mail lands at `support@psygil.com` (which is the founder Gmail inbox via alias).
4. Repeat at `https://psygil.com/enterprise` → `sales@psygil.com`.

If Resend mail bounces or lands in spam:
- Check `RESEND_API_KEY` is set on the Pages project (Settings → Environment variables → Production).
- Check the function logs in Cloudflare Pages → Deployments → Functions for any 4xx/5xx response from Resend.
- Confirm the DKIM record is intact in DNS.

---

## 6. Phase D: DNS hardening (SPF, DKIM, DMARC, MTA-STS)

### SPF (already set above)

Final SPF record after all three planes are live:

```
psygil.com  TXT  "v=spf1 include:_spf.google.com include:amazonses.com ~all"
```

`include:amazonses.com` covers Resend. `include:_spf.google.com` covers Workspace. `~all` is soft-fail; tighten to `-all` only after a week of clean DMARC reports.

If you later add Instantly or Smartlead for cold outreach, you do **not** add their SPF include to the main domain. Cold outreach should run on a separate sender domain. See section 9.

### DKIM (set in Phase B and C)

Both DKIM records coexist:
- `google._domainkey.psygil.com TXT "v=DKIM1; k=rsa; p=..."` (set in Step B6)
- `resend._domainkey.psygil.com TXT "v=DKIM1; k=rsa; p=..."` (set in Phase C)

Different selectors mean both work simultaneously.

### DMARC

Add a single DMARC TXT record. Start observational, then tighten.

Week 1 (observe only, no enforcement):

```
_dmarc.psygil.com  TXT  "v=DMARC1; p=none; rua=mailto:dmarc@psygil.com; ruf=mailto:dmarc@psygil.com; fo=1; adkim=r; aspf=r; pct=100"
```

Create `dmarc@psygil.com` as a Workspace alias to receive aggregate reports. Most ESPs send daily XML reports. Free tools like `dmarcian.com`, `valimail.com` and `postmarkapp.com/dmarc` parse them.

Week 2 to 4 (quarantine):

```
_dmarc.psygil.com  TXT  "v=DMARC1; p=quarantine; rua=mailto:dmarc@psygil.com; ruf=mailto:dmarc@psygil.com; fo=1; adkim=r; aspf=r; pct=100"
```

Month 2+ (reject, only after a clean two-week DMARC report stream):

```
_dmarc.psygil.com  TXT  "v=DMARC1; p=reject; rua=mailto:dmarc@psygil.com; ruf=mailto:dmarc@psygil.com; fo=1; adkim=s; aspf=s; pct=100"
```

Tightening `adkim` and `aspf` to `s` (strict) at `p=reject` time forces exact-match alignment.

### MTA-STS and TLS-RPT (optional, after Phase B)

These signal to other servers that your mail must arrive over TLS. Useful for any clinician audience because their providers (UCHealth, Denver Health, VA) often enforce TLS.

1. Host an MTA-STS policy at `https://mta-sts.psygil.com/.well-known/mta-sts.txt`. The policy looks like:

   ```
   version: STSv1
   mode: enforce
   mx: smtp.google.com
   max_age: 86400
   ```

2. Add DNS records:

   - `_mta-sts.psygil.com  TXT  "v=STSv1; id=2026051401"`
   - `_smtp._tls.psygil.com  TXT  "v=TLSRPTv1; rua=mailto:dmarc@psygil.com"`

If Cloudflare Pages serves `mta-sts.psygil.com`, host the policy as a static file at that path. Or skip MTA-STS for the first month and revisit.

### Postmaster Tools and reputation monitoring

Register `psygil.com` with:

- **Google Postmaster Tools** (`postmaster.google.com`). Add the domain, verify by TXT, watch the IP reputation, domain reputation, spam-rate, and authentication tabs.
- **Microsoft SNDS** (`postmaster.live.com`). Less responsive but worth the registration.

Check both weekly during outbound ramp.

---

## 7. Final DNS records reference

At the end of this runbook the Cloudflare DNS zone for `psygil.com` should contain at minimum:

| Type | Name | Content | Notes |
|---|---|---|---|
| A or CNAME | `@` | (existing site) | Cloudflare Pages |
| A or CNAME | `www` | (existing site) | Cloudflare Pages |
| MX | `@` | `1 smtp.google.com.` | Workspace inbound |
| TXT | `@` | `v=spf1 include:_spf.google.com include:amazonses.com ~all` | SPF |
| TXT | `google._domainkey` | (Google DKIM value) | Workspace DKIM |
| TXT | `resend._domainkey` | (Resend DKIM value) | Resend DKIM |
| TXT | `_dmarc` | `v=DMARC1; p=quarantine; rua=mailto:dmarc@psygil.com; ...` | DMARC |
| TXT | `@` | `google-site-verification=...` | Workspace verification |
| CNAME | (Resend return-path) | (Resend value) | Resend bounces |
| TXT | `_mta-sts` | `v=STSv1; id=...` | Optional, after month 1 |
| TXT | `_smtp._tls` | `v=TLSRPTv1; rua=mailto:dmarc@psygil.com` | Optional |

---

## 8. Operational runbook

### Weekly (during outbound ramp)

- Open Google Postmaster Tools; check Domain Reputation and Spam Rate. Spam rate above 0.3 percent is a yellow flag, above 0.5 percent is red.
- Skim DMARC aggregate reports for unexpected senders. Anything unfamiliar gets investigated.
- Verify forms still deliver: submit one test through `/support` and `/enterprise` every Monday.

### Monthly

- Re-run a mail-tester.com or learndmarc.com check from `founder@psygil.com` to a clean recipient. Score should stay above 9.0/10.
- Confirm SPF, DKIM, DMARC records are intact via `mxtoolbox.com/SuperTool.aspx`.
- Confirm Workspace and Resend DKIM keys have not rotated unexpectedly.

### When deliverability degrades

Symptoms: open rates drop suddenly, replies stop, a recipient complains a mail landed in spam.

Triage order:
1. Check Postmaster Tools first. Domain Reputation drop is the leading indicator.
2. Check spam rate in Postmaster Tools.
3. Check `mxtoolbox.com/blacklists.aspx` for `psygil.com` and the sending IP.
4. Audit recent outbound: any list that exceeded normal volume, any subject lines that resemble spam patterns, any link shortener usage.
5. If a list send caused the issue, pause all outbound for 72 hours and resume at 50 percent volume on a different sender warm-up cycle.

### Sender warm-up checklist (before any cold outreach)

For a new sender address (`founder@psygil.com` or a new outreach domain):

- Day 1 to 3: send 5 to 10 personal mails per day to known contacts who reply. Reply rate matters.
- Day 4 to 7: 15 to 25 personal mails per day. Begin one-to-one prospect emails.
- Day 8 to 14: 25 to 40 sends per day. First real prospect sequence may begin with batches of 15.
- Day 15+: full prospect cadence within the 50-per-day soft ceiling on the main domain.

Automated tooling (Mailwarm, Warmup Inbox, Instantly's built-in warm-up) can compress this from 14 days to 7. Worth the $20 to $40/month during ramp.

---

## 9. Cold outreach domain strategy (revisit week 8 of marketing plan)

The marketing plan ramps cold outbound volume in two phases. Phase 1 (weeks 1 to 7) sends 15 to 25 personalized mails per day from `founder@psygil.com`. This is small enough that main-domain reputation is fine.

Phase 2 (week 8 onward) increases volume and adds sequence automation. At that point, the deliverability risk on `psygil.com` is real. Options, in order of preference:

1. **Subdomain split.** Register `mail.psygil.com` or `outreach.psygil.com` as a sender domain. Configure SPF, DKIM, and a separate DMARC policy for the subdomain. Main domain reputation stays clean.
2. **Separate domain.** Register `getpsygil.com` or `trypsygil.com`. Fully separate identity for cold; mirror website branding so replies do not feel like a switch.
3. **Both.** Use the subdomain for warm-prospect sequences and the separate domain for true cold lists. This is overkill until volume exceeds 200 sends/day.

Whichever option, the SPF record for the cold-sending domain must include the tool's send infrastructure (Instantly's, Smartlead's, or SES) rather than `_spf.google.com`. Do not let the cold-outreach SPF include leak into the main `psygil.com` zone.

---

## 10. Checklist (run this in order)

Phase A (free, ~30 minutes):

- [ ] Cloudflare Email Routing enabled on `psygil.com`
- [ ] MX records: `route1/2/3.mx.cloudflare.net` (auto-added)
- [ ] SPF: `v=spf1 include:_spf.mx.cloudflare.net ~all`
- [ ] Destination address `truckirwin@gmail.com` verified
- [ ] Aliases created: `hello`, `founder`, `support`, `sales`, `security`, `abuse`, `postmaster`, `legal`, `privacy`, `press`, `careers`, `forms`
- [ ] `noreply@psygil.com` set to **Drop**
- [ ] Catch-all enabled (temporary)
- [ ] Smoke test: send to two aliases, confirm receipt

Phase B (Workspace, ~1 hour plus DNS propagation):

- [ ] Google Workspace Business Starter provisioned for `psygil.com`
- [ ] Domain verified via TXT record
- [ ] Cloudflare Email Routing disabled
- [ ] Cloudflare MX records changed to `1 smtp.google.com.`
- [ ] Workspace aliases configured for every address from section 2
- [ ] "Send mail as" set for each alias in founder Gmail
- [ ] SPF record updated to `v=spf1 include:_spf.google.com include:amazonses.com ~all`
- [ ] Google DKIM record added at `google._domainkey`
- [ ] Workspace DKIM authentication switched on
- [ ] Smoke test: send from `founder@`, `support@`, and `sales@` to a personal outside address

Phase C (Resend, ~15 minutes verification):

- [ ] Resend domain status: Verified
- [ ] `resend._domainkey` TXT record present
- [ ] Resend Return-Path CNAME present
- [ ] Test form submission at `/support` lands in inbox
- [ ] Test form submission at `/enterprise` lands in inbox

Phase D (hardening, ~30 minutes):

- [ ] DMARC at `p=none` for week 1
- [ ] `dmarc@psygil.com` alias receives reports
- [ ] DMARC moved to `p=quarantine` after week 1 (clean reports)
- [ ] Google Postmaster Tools registered and verified
- [ ] Microsoft SNDS registered
- [ ] Mail-tester.com score above 9.0
- [ ] MX records confirmed in `mxtoolbox.com`

---

## 11. Common problems and fixes

**"Cloudflare Email Routing won't enable, says MX records exist."**
The dashboard wants to own the MX records. Delete the existing MX records under DNS → Records, then return to Email Routing and click Enable. It will recreate them.

**"Workspace verification keeps failing."**
DNS propagation. Wait 15 minutes and retry. If a `google-site-verification` TXT for an old Workspace tenant still exists, delete it before adding the new one.

**"I sent from founder@ and the recipient said it landed in spam."**
Three likely causes, in order:
1. DKIM not yet enabled in Workspace (Step B6).
2. SPF still set to Cloudflare's value instead of `_spf.google.com`.
3. Domain reputation has not built yet. Wait the warm-up cycle in section 8.

**"The Resend form emails stopped after switching to Workspace."**
The `resend._domainkey` DKIM record was likely deleted when you cleaned up old DNS during MX migration. Re-add it from Resend's domain verification page.

**"My DMARC reports show unauthorized sends from an unfamiliar IP."**
Either a misconfigured sender on your side (a tool you forgot about) or a spoofer. Investigate before tightening DMARC. `dmarcian.com` makes this easier than reading the XML.

**"I want to send 200+ cold emails per day."**
Stop sending from the main domain. Stand up a subdomain or separate domain per section 9.

---

End of runbook v1.0.
