# Psygil Marketing Plan v2.1

AI-orchestrated 6-week Colorado launch and 8-month national roadmap.
Foundry SMB LLC. Operating reference document.
Version 2.1. Effective: 2026-05-14. Owner: Robert Irwin.

**Changelog (v2.0 → v2.1):** incorporates the seven-seat council review documented in `COUNCIL_REVIEW.md`. Specifically: CAN-SPAM corrections in Section 1 non-negotiable #3; new Section 1.5 (Solo BAA decision); Section 3 and Section 4 timeline reset (Phase 0 to 2 weeks, Week 6 paid target from 18-30 to 6-15); 8 new infrastructure agents added (Agents 13-20); STYLE_GUIDE.md added to inputs of Agents 3, 9, 10, 12; Section 10.1 scanner expanded with second-person, third-person, "Daubert-ready", and CAN-SPAM-footer checks; Section 11.1 metrics reset to realistic targets; Appendix E email templates rewritten in second person with CAN-SPAM-compliant footer and Rule 702 framing; agents.yaml cron expressions corrected.

This document is written to be read and executed by an AI agent. Any Claude or comparable LLM with the MCP stack described in Section 9 should be able to ingest this plan, schedule the agents, and run the workflow with the founder operating as the approval gate and the demo runner. The previous human-readable v1.0 plan is preserved in git history.

The structure is non-negotiable: this document is the contract. Agents reference specific sections by number. If you edit the plan, update the agents.

---

## 1. Mission and non-negotiables

Psygil is a forensic-grade IDE for psychological evaluations. The clinician diagnoses, always. The assistants read records, organize evidence, and draft language. Marketing exists to find clinicians for whom the discovery package is a working answer to a real cross-examination problem, and to convert them efficiently without ever overstating what the product does.

**Non-negotiables that bind every agent in this plan:**

1. The voice rules in `STYLE_GUIDE.md` and `CLAUDE.md` apply to every public artifact: outbound email, LinkedIn posts, blog content, ads, slides, social, scripts. Banned terms: em dashes, curly quotes, marketing vocabulary (leverage, utilize, facilitate, empower, unlock, seamless, best-in-class, cutting-edge, next-generation), "AI" as a subject. Every assistant is named by function (writing assistant, review assistant, diagnostic assistant, ingestion assistant). The clinician is the subject of every sentence that matters.
2. The clinician must approve every outbound message that uses their image or identity, every case study, every published quote.
3. Cold outreach complies with CAN-SPAM (15 USC 7704): truthful headers, identified sender, physical address (Foundry SMB LLC, Colorado mailing street address; not a PO box unless CMRA-compliant), working unsubscribe mechanism in every commercial message (web form at `psygil.com/unsubscribe` plus `unsubscribe@psygil.com`), opt-outs honored within 10 calendar days, and unsubscribe links remain functional for at least 30 days after the send.
4. No outbound from `psygil.com` exceeds 40 sends per day before week 4 deliverability proof. After week 4, high-volume sequences move to a separate sender domain (see Section 11).
5. HIPAA posture stays consistent: local-first, BAAs at Practice and Enterprise tiers, Solo explicitly out of BAA scope. Never imply otherwise in sales conversation, ever. The Solo-BAA conspicuous disclosure on the pricing page and a "Solo is for non-PHI workflow" framing in cold email are required before Wave 1. See Section 1.5 for the open Solo-BAA strategic decision.
6. No invented testimonials, no AI placeholder doctor names, no quotes attributed to clinicians who did not say them.
7. The discovery package is the lead artifact. Lead with the record, not the writing assistant.

If an agent run is about to violate any of these, halt and escalate. Never proceed past a non-negotiable on a soft signal.

---

## 1.5 Open strategic decision: Solo tier BAA stance

Flagged by the Compliance, Clinician, and Sales seats of the council review (see `COUNCIL_REVIEW.md` Section 1.4). The current plan's non-negotiable #5 treats this as fixed, but the field cost is real and Phase 1 forensic conversion likely collapses at trial activation if not resolved. Three options, founder must pick before Wave 1:

**Option A: Bundle a BAA into Solo at $799 to $899/month.** Doubles forensic-fit conversion. Adds operational burden of one BAA per Solo customer (template-based, but still). Recommended by the Clinician seat. Net price increase from $599 may dent volume of non-forensic adopters.

**Option B: Position Solo explicitly as "non-PHI workflow only" or "consult and expert-review work where records are produced in discovery and not stored."** Maintain the $599 price. Add a hard checkbox at checkout: "I will not transmit PHI through Psygil at the Solo tier." Reframe the marketing plan so Segment B (assessment-heavy clinical) is the dominant Phase 1 audience, since assessment workflow can plausibly operate without PHI transmission to support@. Halves the addressable forensic TAM at Solo.

**Option C: Maintain the current stance.** Solo no BAA, no price change, no framing change. Accept that forensic trials will not activate. Reframe Phase 1 metrics expectations downward by another 30-40% on the forensic segment. Refocus outbound on Segment B-first sequencing.

**DECISION LOCKED:** Option B selected 2026-05-14 (see `/ops/orchestrator/decision_log/2026-05-14.md` for full rationale). Solo tier is positioned explicitly as "non-PHI workflow only" — consult and expert-review work where records arrive under discovery order and are not stored. Hard checkbox at checkout. Cold email and trial onboarding both flag the constraint. List price remains $599/month.

**Reversibility:** if customer discovery interviews (running 2026-05-15 through 2026-05-29 per `/ops/discovery/INTERVIEW_GUIDE.md`) surface 5+ interviewees with explicit willingness to pay $799-$899 for a BAA-bundled Solo tier, the founder will revisit and may flip to Option A. The current Option B stance is the operating reality until that data lands.

---

## 2. Operating principles (the division of labor)

The marketing system is a closed loop. Agents do the work that scales (research, drafting, sequencing, monitoring, reporting). The founder does the work that does not scale (judgment calls, demos, relationships). Approval gates sit between the two so the founder always sees outbound before it goes out, but the founder's bottleneck is approval throughput, not generation throughput.

**Agents do:**

- Pull and dedupe contact data from public registries
- Score contacts by signal strength
- Draft personalized line 1 and line 3 for every cold email
- Sequence outbound through Instantly or Smartlead
- Triage replies into labeled buckets and draft suggested responses
- Research and rank SEO keywords, write the first draft of every blog post
- Generate LinkedIn post drafts on the founder's voice profile
- Monitor deliverability, DMARC reports, postmaster signals
- Produce the weekly metrics digest
- Draft case studies from interview transcripts
- Find conference and podcast opportunities and draft submissions
- Track referral credits and draft notification emails

**The founder does:**

- Approve every outbound email before send
- Run every demo personally for the first 8 weeks
- Make the final call on every case study, conference proposal, partnership
- Hold every relationship that becomes valuable
- Cut anything an agent produces that violates voice rules or is just bad
- Push features back into the product based on demo and trial conversations

**The approval gate is the rate limiter.** A realistic founder approval throughput is 40 to 60 email approvals per business day plus 6 to 10 demos per business day plus a 60-minute weekly review block. The plan is built to that throughput. If approval becomes a bottleneck, agents queue. They do not bypass.

**Failure mode:** any agent that hits a low-confidence state escalates to the founder via a Slack DM, an Attio task, or a Gmail draft labeled `Needs-Review`. Never push a low-confidence artifact to production.

---

## 3. Compressed timeline overview

Original v1.0 plan was 13 weeks of Phase 1 plus a 12-month roadmap. The agent-driven version compresses Phase 1 to 6 weeks and the full roadmap to 8 months, on the bet that the founder approval gate is the limit, not generation throughput.

### Phase 1: Colorado beachhead (6 weeks of execution + 2 weeks of foundation)

Targets reset per `COUNCIL_REVIEW.md` Section 1.6 and Section 4. Original v2.0 targets reflected industry-aspirational reply rates and trial conversion; revised targets reflect realistic floors for cold outbound to credentialed clinicians.

| Week | Headline | Outbound batches | Net paid target |
|---|---|---|---|
| Foundation (2 weeks pre-launch) | Agents stood up dependency-ordered, list loaded, domains warmed | 0 | 0 |
| 1 | Wave 1 Segment A launch + first 2 blog posts live | 60 to 90 | 0 to 1 |
| 2 | Wave 1 follow-ups + Wave 2 starts + Webinar #1 invites | 150 to 220 cumulative | 1 to 3 |
| 3 | Webinar #1 runs + Wave 3 Segment B opens | 260+ cumulative | 2 to 5 |
| 4 | Post-webinar push + first case study interviews | 360+ cumulative | 4 to 8 |
| 5 | Webinar #2 (Segment B) + case study published | 450+ cumulative | 5 to 11 |
| 6 | Referral program live + 6-week review + Phase 2 lock | 540+ cumulative | 6 to 15 |

Phase 1 success: 6 to 15 paid subscribers, 1 to 2 case studies live, 1 speaking proposal submitted, working referral program, 5+ SEO content pieces published. The Skeptic seat called the original 18-30 target "fiction-grade optimism"; the reset acknowledges that 60% of the realistic number arrives from referrals, webinars, and warm LinkedIn touches rather than from cold sequence alone.

### Phase 2: National acceleration (months 3 to 8)

| Month | Headline | New paid net adds (cumulative) | Channel additions |
|---|---|---|---|
| 3 | Mountain West expansion + Segment B push national | 25 to 50 | LinkedIn ads pilot $500/mo, Apollo seat |
| 4 | First conference attendance + PR pitch round | 50 to 90 | AP-LS attendance, podcast tour begins |
| 5 | Enterprise pipeline opens + content engine doubles | 80 to 140 | First Enterprise prospect in pipeline |
| 6 | First Enterprise pilot + Close CRM migration begins | 120 to 200 | Move to Close, hire contract SDR |
| 7 | Paid ads scale to $3K/mo + second conference | 170 to 280 | LinkedIn ads at $3K/mo, AAFP attendance |
| 8 | National brand consolidated + plan v3.0 | 230 to 380 | Plan rewrite based on observed CAC |

Phase 2 success: 230 to 380 paid subscribers, 1 to 3 signed Enterprise pilots, demonstrated CAC under $300 across organic channels, net revenue retention above 100% on Practice tier. The reset propagates Phase 1's realistic envelope through Phase 2; channel-mix expansion (paid ads, conferences, podcasts) partially compensates the lower starting base.

---

## 4. Detailed 6-week Phase 1 (week-by-week milestones)

### Foundation (Days -10 to 0): 2-week pre-launch window

Reset per `COUNCIL_REVIEW.md` Section 1.5 (Operations seat finding: original 3-day Phase 0 was unrealistic). The realistic dependency-ordered sequence is 10 working days plus a 7-day sender-domain warm-up running concurrently. Agents 1, 4, 5, 6 are the live-fire path that must be ready by Day 0. Agents 7 through 20 are scheduled additions over Weeks 1 to 3.

**Days -10 to -8 (Week minus-2, infrastructure prerequisites):**
- Cloudflare Email Routing live, all inbound aliases working (Phase A of `EMAIL_SETUP.md`).
- Google Workspace provisioned, `founder@psygil.com` active, MX migrated.
- DKIM, SPF, DMARC at `p=none` configured; `dmarc@psygil.com` collecting reports.
- Resend transactional confirmed (existing).
- Sender-domain warm-up begins on Day -10 via Mailwarm; runs 7 to 14 days minimum before Wave 1.
- Cloudflare Pages, `/unsubscribe` web form, and `unsubscribe@psygil.com` alias live (CAN-SPAM compliance prerequisite per Section 1 non-negotiable #3).
- Attio Free workspace created, schema imported (see Section 8 + Appendix C).
- Filesystem scaffold created: `/content/`, `/ops/runlog/`, `/ops/digest/`, `/ops/seo/`, `/ops/deliverability/`, `/ops/config/agents.yaml` drafted.

**Days -7 to -3 (Week minus-1, integration and agent prep):**
- Colorado contact list imported, deduped, segmented (A, B, parked). Suppression list seeded.
- Calendly link live with revised qualifying question ("How many forensic or assessment evaluations did you sign in the last 90 days?").
- Calendly-to-Attio webhook (Agent 20) deployed and tested. The Day 0 smoke test depends on this.
- Personalization Agent (Agent 4) standalone test: 5 records, manual approval, validate output schema.
- Send Agent (Agent 5) configured against Instantly with hard cap of 5 sends/day for testing.
- Reply Triage Agent (Agent 6) prompt iterated against synthetic replies.
- Founder Loom recorded: 6 minutes, forensic flow, intake to Rule 702 challenge-ready package.
- Sample discovery package PDF prepared (sanitized real export).

**Days -3 to -1 (Phase 0, live-fire path):**
- Day -3: Pipeline Orchestrator (Agent 1), Send (5), Personalization (4), Reply Triage (6) configured and dry-run validated. These four are the launch-critical agents.
- Day -2: Wave Builder (Agent 3), Contact Enrichment (Agent 2) configured. Both feed the personalization queue.
- Day -1: Analytics Agent (11) in read-only stub mode. SEO Research Agent (8) configured so the keyword backlog CSV is populated before SEO Content Agent (7) is needed in Week 2.

**Day 0 (Thursday, smoke test and approval):**
- End-to-end smoke tests: personalized test email lands at a friendly inbox, `/support` form routes, Calendly booking creates Attio task, suppression list returns true on a known-opted-out address.
- Founder reviews and approves Wave 1 contact list (40 to 60 Segment A names; lower than original target per the reset).
- Agents run in dry-run mode against the Wave 1 list to validate personalization and sequencing.
- Friday is buffer for any issues found.

**Phase 1 incremental agent adds:**
- Week 1: SEO Content Agent (7) — first blog post can be founder-written if agent not yet ready.
- Week 1: LinkedIn Engagement (9) — drafts can be founder-written initially.
- Week 2: SEO Content Agent (7) producing autonomously.
- Week 3 (before Webinar #1): Webinar Agent (10).
- Week 4: Case Study and PR Agent (12), Sender Reputation Monitor (15), DMARC Report Reader (18).
- Week 5: Content Publishing Agent (13), Suppression List Maintainer (16), Approval Queue Dashboard (19).
- Week 6: Referral and Billing Agent (14) — required before referral program launch.
- Demo Prep Agent (17) added as soon as founder demo load exceeds 4/week.

### Week 1: Wave 1 Segment A launch

**Monday:**
- Personalization agent generates 20 line-1 + line-3 drafts overnight.
- Founder reviews and approves at 8 AM in a 60-minute approval block.
- Send agent dispatches Email 1 in batches of 5 across the morning.
- SEO content agent publishes Blog Post 1 ("What a discovery-ready evaluation file looks like").
- LinkedIn engagement agent: founder posts a 400-word piece on the discovery package; 10 prospect comments queued for review.

**Tuesday through Thursday:**
- Daily approval block (8 AM, 45 minutes).
- Send agent dispatches 15 to 25 emails per day.
- Reply triage agent runs every 90 minutes during business hours.
- Founder takes any booked demos (target: 2 to 3 this week).

**Friday:**
- Analytics agent produces Week 1 digest (Section 11).
- Founder 60-minute review block.
- Wave 2 contact list approved for next week.

Week 1 numbers expected: 80 to 120 emails sent, 8 to 18 replies, 3 to 7 demos booked, 1 to 3 trial starts.

### Week 2: Wave 1 follow-ups + Wave 2 starts + Webinar #1 invites

**Monday:**
- Wave 1 Email 2 (value/Loom) dispatches.
- Wave 2 list (next 80 Segment A names) starts Email 1.
- SEO content agent publishes Blog Post 2 ("Records review without the binder").
- Webinar agent sends Invite Email 1 for "How a Daubert-ready evaluation gets built" (Week 3 Thursday).

**Tuesday through Thursday:**
- Daily approval, send, triage cadence continues.
- Founder demos: 4 to 6 this week.
- First trial starts may convert to paid; founder calls each subscriber personally.

**Friday:**
- Week 2 digest. Wave 3 approved (first 60 Segment B names).
- Webinar Invite Email 2 dispatches over the weekend.

Week 2 cumulative: 180 to 250 emails, 4 to 10 paid subscribers cumulative.

### Week 3: Webinar #1 + Wave 3 Segment B

**Monday and Tuesday:**
- Webinar reminder emails.
- Wave 1 Email 3 (break-up) dispatches to non-replies.
- Wave 3 (Segment B) Email 1 launches with revised framing (records review and report integration, lighter forensic).

**Wednesday:**
- Founder rehearses webinar.
- Webinar agent confirms registrations, prepares attendee list.

**Thursday: Webinar #1 (45 minutes, 12 PM MT).**
- Target: 80 to 120 registrations, 30 to 50 live attendees.
- Recording uploaded same day.
- Post-webinar email with replay + booking CTA dispatches Friday morning.

**Friday:**
- Week 3 digest.
- Case study agent identifies the top 2 trial users for outreach next week.

Week 3 cumulative: 300+ emails, 6 to 12 paid cumulative.

### Week 4: Post-webinar push + case study interviews

**Monday:**
- Post-webinar replay drives 5 to 10 new demo requests.
- Wave 4 list approved (re-engage Wave 1 non-responders with new proof: webinar replay + 2 published blog posts).
- SEO content agent publishes Blog Post 3 ("What goes in a discovery package").

**Tuesday and Wednesday:**
- Case study agent runs structured interviews with top 2 trial users (60 minutes each, recorded with permission).
- Case study agent drafts v1 of each story.

**Thursday and Friday:**
- Wave 4 sends.
- Founder approves case study v1.
- Week 4 digest.

Week 4 cumulative: 400+ emails, 9 to 16 paid cumulative.

### Week 5: Webinar #2 (Segment B) + case study published

**Monday:**
- Case Study 1 published on blog and pushed to LinkedIn.
- Webinar #2 invites dispatched (Segment B repositioning: "Records review and report integration for clinical assessment practices", Thursday Week 6).
- SEO content agent publishes Blog Post 4 ("The Daubert checklist working forensic evaluators actually use").

**Tuesday through Thursday:**
- Wave 5 emails: Mountain West expansion preview (high-signal NM, WY, UT forensic contacts).
- Founder demos: 8 to 12 this week (heaviest demo week so far).
- PR/podcast outreach agent sends pitches to The Testing Psychologist, Forensic Psychology Today, AP-LS Sound Mind.

**Friday:**
- Week 5 digest.

Week 5 cumulative: 500+ emails, 13 to 22 paid cumulative.

### Week 6: Referral program + 6-week review + Phase 2 lock

**Monday:**
- Referral program live. Existing paid subscribers receive announcement email with referral link.
- Mechanic: refer a colleague who starts a trial → $200 credit on next invoice. Convert to paid → free month.
- SEO content agent publishes Blog Post 5 (6-week public update, conditional on metrics).

**Tuesday and Wednesday:**
- Wave 6 emails: continued Mountain West push.
- Webinar #2 reminder.
- Conference scout agent submits CPA talk proposal (even if the event is Q3 or later).

**Thursday: Webinar #2 runs.**

**Friday:**
- 6-week review block (90 minutes, founder + agent dashboard).
- Cohort analysis: which channel produced which subscribers, at what CAC, what retention so far.
- Phase 2 priorities locked.

Week 6 cumulative: 600+ emails, 18 to 30 paid total.

---

## 5. Agent roster

Twelve agents make up the marketing system. Each agent is specified with the same shape so it can be implemented as a Claude scheduled task, a Cowork agent, or a custom integration. Section 6 is the cron schedule that says when each one runs.

The notation is `AGENT: <name>` with seven fixed fields. Read every field. The escalation field is what keeps the system safe.

---

### Agent 1: Pipeline Orchestrator

```
AGENT: Pipeline Orchestrator
PURPOSE: Meta-agent. Runs at the start of every business day, audits the state
  of the pipeline, decides which agents need to fire, and dispatches them.
  Single source of truth for "what should happen today."
TRIGGER: Cron, daily at 06:30 MT, business days only. Also on-demand via founder.
INPUTS:
  - Attio: full contact pipeline state
  - Calendar: today's demos, founder availability
  - Email setup status (warm-up day count if pre-launch)
  - Previous day's agent run logs
OUTPUTS:
  - Daily run plan in Notion or a markdown file at /ops/runlog/YYYY-MM-DD.md
  - Dispatches to specific agents (via scheduled-task triggers or direct calls)
  - Slack DM or Gmail draft to founder: today's approval queue summary
TOOLS REQUIRED:
  - Attio MCP (read)
  - Google Calendar MCP
  - Filesystem write
  - Scheduled-tasks MCP
APPROVAL GATE: None. This agent only orchestrates, it never sends customer-facing
  artifacts.
SUCCESS CRITERIA: Daily run plan posted by 06:45 MT every business day with
  zero missing dependencies.
ESCALATE IF:
  - Approval queue exceeds 50 items overnight (founder bottleneck)
  - Any agent failed yesterday and has not been re-tried
  - Deliverability metrics from prior day fell below thresholds
```

---

### Agent 2: Contact Enrichment Agent

```
AGENT: Contact Enrichment Agent
PURPOSE: Pull, dedupe, and enrich the contact universe from public sources.
  Owns the freshness and completeness of Attio Contact records.
TRIGGER: Cron, Sundays 22:00 MT, weekly. Also after any list import.
INPUTS:
  - NPI Registry API (https://npiregistry.cms.hhs.gov/api)
  - Colorado Information Marketplace DORA dataset
  - ABFP, ABPP public diplomate listings
  - SOMB approved provider PDFs
  - Court roster CSVs (when operator obtains)
  - Practice website crawl for email enrichment
OUTPUTS:
  - Attio: new Contact and Practice records, deduped via NPI > license > phone > fuzzy
  - Attio: updated fields on existing records (license status, taxonomy, last_verified)
  - /research/co-psychologists/data/co_psychologists.csv updated
TOOLS REQUIRED:
  - Web fetch (allowlisted to NPI Registry, data.colorado.gov, abfp.com, abpp.org)
  - Attio MCP (create-record, update-record)
  - Filesystem read/write
APPROVAL GATE: Founder reviews any new Practice record with confidence < 0.8
  before it enters the active outreach pool.
SUCCESS CRITERIA:
  - Weekly delta produces at least 5 new high-confidence records during Phase 1
  - Zero duplicate records introduced
  - All records have NPI or license number attached when available
ESCALATE IF:
  - API returns unusual volume (more than 200 new CO records in a week)
  - Suspicion of stale data: license_status field is unverifiable
```

---

### Agent 3: Wave Builder Agent

```
AGENT: Wave Builder Agent
PURPOSE: Pick the next outbound wave (15 to 25 contacts) from the Attio pipeline.
  Scores by signal strength (ABFP diplomate, court roster member, recent forensic
  activity, location relevance, last contact recency).
TRIGGER: Cron, Fridays 17:00 MT, weekly. Selects next week's batches.
INPUTS:
  - Attio: all Contacts with status "Available for outreach"
  - Attio: prior outreach history (avoid re-contacting within 90 days)
  - Suppression list (do-not-contact, competitors, opt-outs)
  - STYLE_GUIDE.md (required for any contact-segment notes that may surface in
    the founder review or feed downstream agent personalization)
  - MARKETING_PLAN.md Section 3 ICP definitions
OUTPUTS:
  - Attio: 5 daily batches of 15 contacts each (reset per Section 11.1 from
    20 to 15; lower volume aligns with realistic founder approval throughput),
    status flipped to "Queued for personalization", target send date stamped
    (use field name `send_date`; harmonized with Personalization Agent)
  - Founder review note: this week's planned waves at a glance
TOOLS REQUIRED:
  - Attio MCP (search, update-record)
SCORING FORMULA (weight in parens, sum to 1.0):
  - ABFP or ABPP-Forensic diplomate (0.25)
  - Court evaluator roster present (0.20)
  - SOMB approved provider (0.10)
  - Recent CPA membership or talk (0.10)
  - Practice website mentions "forensic" or "IME" (0.10)
  - Email address confidence (0.10)
  - Geographic proximity to Front Range (0.05)
  - Specialty match to Psygil ICP (0.10)
APPROVAL GATE: Founder reviews the week's batches every Friday 17:30 to 18:30
  and approves or swaps individual contacts.
SUCCESS CRITERIA:
  - Weekly batch is balanced across signal sources, not over-weighted to one
  - No suppression-list violations
ESCALATE IF:
  - Eligible contact pool drops below 100 (need to enrich faster)
  - Same practice appears in two consecutive weeks
```

---

### Agent 4: Personalization Agent

```
AGENT: Personalization Agent
PURPOSE: Draft line 1 and line 3 personalization for each contact in the day's
  send queue. Uses public information only.
TRIGGER: Cron, business days 04:00 MT. Drafts the day's batch before founder
  approval block at 08:00.
INPUTS:
  - Attio: contacts with status "Queued for personalization" and send_date == today
  - Psychology Today profile URL (if present)
  - LinkedIn URL (if present, scrape via Apify with permission)
  - Practice website (homepage and /about, light fetch)
  - Recent web search for clinician name + "Colorado"
  - STYLE_GUIDE.md (voice rules)
  - MARKETING_PLAN.md Appendix E (email templates)
OUTPUTS:
  - Attio: per-contact note "Personalization v1" with line-1, line-3, and
    citation of the source used
  - Gmail draft pre-filled with the personalized email, subject line, and
    correct From alias (founder@psygil.com)
TOOLS REQUIRED:
  - Web fetch
  - Web search
  - Attio MCP
  - Gmail MCP (create draft)
APPROVAL GATE: Founder reviews every draft before send. Approval is a single
  click in Gmail or marking Attio field "approved" to true.
QUALITY RULES:
  - Line 1 must reference a specific, verifiable fact about the contact
  - Line 3 must connect their work to the discovery package thesis
  - No invented quotes, no flattery, no "I noticed your work in X" without X
  - Banned terms enforced before output is produced
SUCCESS CRITERIA:
  - 95% of batch personalized within 30 minutes of trigger
  - Founder rejection rate below 20% (anything higher means tune prompts)
ESCALATE IF:
  - Personalization source confidence is low
  - Web search returns no information on the contact
  - Contact record is missing required fields
```

---

### Agent 5: Send Agent

```
AGENT: Send Agent
PURPOSE: Dispatch approved emails through the cold-outreach platform (Instantly
  through Week 4, then transition to dedicated subdomain sequence in Week 5+).
  Monitors deliverability signals in real time.
TRIGGER: Continuous, business hours. Polls Attio every 15 minutes for
  approved-and-pending records.
INPUTS:
  - Attio: contacts with field "approved" == true and send_status == "pending"
  - Instantly or Smartlead API
  - Google Postmaster Tools (read)
OUTPUTS:
  - Instantly: send job dispatched
  - Attio: send_status flipped to "sent", timestamp recorded
  - Attio: sequence_step field incremented
  - Deliverability log written to /ops/deliverability/YYYY-MM-DD.md
TOOLS REQUIRED:
  - Instantly or Smartlead MCP (when available) or REST API
  - Attio MCP
  - Web fetch (Postmaster Tools)
DELIVERABILITY GUARDRAILS:
  - Cap: 40 sends/day from founder@psygil.com through Week 4
  - Cap: 100 sends/day from mail.psygil.com from Week 5 onward
  - Pause sends if spam rate > 0.3% in Postmaster Tools
  - Pause sends if bounce rate > 4% on any 24h rolling window
  - Random jitter between sends: 90 to 240 seconds
APPROVAL GATE: Each individual send was approved upstream by founder. Send agent
  does not re-prompt for approval at dispatch time.
SUCCESS CRITERIA:
  - 99% of approved sends delivered within 4 hours
  - Spam complaint rate stays below 0.1%
ESCALATE IF:
  - Any guardrail trips
  - Bounce > 6% in 24h: halt sends entirely and page founder
```

---

### Agent 6: Reply Triage Agent

```
AGENT: Reply Triage Agent
PURPOSE: Read inbound replies in founder@psygil.com, classify, draft a response,
  and update Attio.
TRIGGER: Every 90 minutes during business hours; once at 19:00 MT for overflow.
INPUTS:
  - Gmail inbox (founder@psygil.com)
  - Attio: contact records to update
  - STYLE_GUIDE.md
OUTPUTS:
  - Gmail: labels applied (Interested, Not-Now, Hard-No, Question, Bounce, OOO)
  - Gmail: draft response composed for every Interested/Question reply
  - Attio: contact field reply_classification updated
  - Attio: task created for founder for any Interested or Question reply
  - Calendar: holds for "interested" replies to convert to demo slots
CLASSIFICATION RULES:
  - "Interested": explicit "yes" or scheduling intent → draft Calendly link
  - "Not-Now": polite decline with future possibility → 90-day nurture
  - "Hard-No": opt-out or remove-me → suppress permanently
  - "Question": clarifying question → draft answer + invite to demo
  - "Bounce": auto-reply or undeliverable → mark for verification
  - "OOO": out of office → reschedule send for return date
APPROVAL GATE: Founder reviews every draft response before send. Hard-Nos are
  auto-suppressed without approval (compliance requirement).
SUCCESS CRITERIA:
  - 95% of replies triaged within 2 hours
  - Misclassification rate below 5%
ESCALATE IF:
  - Reply contains words suggesting complaint, threat, or legal action
  - Reply is from a clinician with media reach (founder handles personally)
```

---

### Agent 7: SEO Content Agent

```
AGENT: SEO Content Agent
PURPOSE: Draft long-form blog posts targeting the keyword backlog in Section 7.
  Produces ~1500-word drafts with on-page SEO baked in.
TRIGGER: Cron, Wednesdays 06:00 MT, weekly. Drafts that week's piece.
INPUTS:
  - /content/keyword_backlog.csv (priority-ranked queries from SEO Research Agent)
  - /content/templates/blog_post.md (structure template)
  - STYLE_GUIDE.md
  - 3 to 5 high-ranking competitor pieces for each target query (Search Console + manual fetch)
  - Existing site pages for internal linking opportunities
OUTPUTS:
  - /content/drafts/YYYY-MM-DD-slug.md (full draft, ~1500 words)
  - Title tag, meta description, H1, H2 outline, internal link suggestions
  - Suggested schema markup (Article + FAQPage where appropriate)
  - Featured image brief (handed to designer or Midjourney prompt)
APPROVAL GATE: Founder reviews and edits draft before publication. Target
  edit-to-final delta below 30%.
SUCCESS CRITERIA:
  - One publishable draft per week, every Wednesday
  - Each draft includes 3+ internal links and 2+ authoritative external citations
  - Each draft hits the target keyword in title, H1, first 100 words, URL slug
ESCALATE IF:
  - Target keyword has changed intent in SERP (commercial vs informational shift)
  - Competitor pieces are all sponsored content (paid distribution required)
```

---

### Agent 8: SEO Research Agent

```
AGENT: SEO Research Agent
PURPOSE: Maintain the keyword backlog. Discover new long-tail queries, monitor
  ranking movement, track competitor publishing cadence.
TRIGGER: Cron, Sundays 20:00 MT, weekly.
INPUTS:
  - Google Search Console API (psygil.com performance data)
  - Bing Webmaster Tools
  - Ahrefs API (when subscription active, expected month 3+)
  - Manual seed list from Appendix B
  - Competitor sites: SimplePractice, TheraNest, Heidi, Freed, Mentaya, Headway,
    Suite of forensic-specific sites (RemoteCounsel.com, ForensicPanel.com, etc.)
OUTPUTS:
  - /content/keyword_backlog.csv updated with new queries, priority, difficulty,
    intent, monthly volume, current rank, target rank
  - /ops/seo/weekly_seo_digest.md
  - Alert if existing post drops more than 5 positions in a week
TOOLS REQUIRED:
  - Search Console API
  - Web fetch
  - Filesystem write
APPROVAL GATE: None for backlog updates. Founder reviews weekly digest.
SUCCESS CRITERIA:
  - Backlog grows by 10+ qualified queries per week
  - All Psygil-published pages tracked
  - Competitor publishing detected within 7 days
ESCALATE IF:
  - Critical keyword (top 10 in backlog) drops out of top 20
  - Site-wide impression drop > 20% week over week
```

---

### Agent 9: LinkedIn Engagement Agent

```
AGENT: LinkedIn Engagement Agent
PURPOSE: Draft founder LinkedIn posts (3 per week), draft comment replies on
  Segment A/B prospects' content (10 per week), maintain warm-up list.
TRIGGER: Cron, Mon/Wed/Fri 07:00 MT.
INPUTS:
  - Founder voice profile (file at /content/voice/founder_voice.md, ~500 words
    of sample founder writing for tone calibration)
  - Topic backlog at /content/linkedin/topic_backlog.md
  - LinkedIn Sales Navigator saved searches (Segment A and B)
  - Recent blog posts and case studies for content reuse
  - Recent product updates and changelog entries
  - STYLE_GUIDE.md and MARKETING_PLAN.md Section 1 non-negotiables (REQUIRED;
    LinkedIn is the highest-volume customer-facing surface in the plan and
    the most prone to voice drift if anchors are missing)
  - CLAUDE.md voice rules
TOOLS REQUIRED:
  - LinkedIn Sales Navigator (manual interaction; no MCP today)
  - Filesystem read
  - Web search (for current events to react to)
OUTPUTS:
  - Drafts queued in /content/linkedin/drafts/YYYY-MM-DD-slug.md, also queued
    in the Approval Queue Dashboard (Agent 19)
  - Comment drafts in a checklist for founder to action in 15 minutes
APPROVAL GATE: Founder approves every post before publication (no autonomous
  posting on LinkedIn at any point). Comments use sample-based review (1 in 5
  reviewed for tone; the rest pre-approved against tested templates) to ease
  the approval-queue load.
SUCCESS CRITERIA:
  - 3 founder posts per week published
  - 10 substantive comments per week
  - Follower growth: 10+ Segment A/B contacts per week
ESCALATE IF:
  - Engagement drops below 3 reactions per post for two weeks running
  - Sales Navigator search returns no new prospects
```

---

### Agent 10: Webinar Agent

```
AGENT: Webinar Agent
PURPOSE: Run the logistics around webinars: invite list, registration tracking,
  reminder cadence, replay distribution, post-event follow-up.
TRIGGER: 21 days before webinar date, weekly thereafter until completion + 14 days.
INPUTS:
  - Attio: contact list segmented for the topic (Segment A for forensic webinars,
    Segment B for assessment webinars)
  - CPA member list (when accessible)
  - Webinar metadata (title, date, registration URL, replay URL)
  - Email templates from Appendix E
  - STYLE_GUIDE.md and MARKETING_PLAN.md Section 1 non-negotiables (REQUIRED;
    webinar copy is forensic-audience-facing and is the most exposed touch
    point in the funnel)
  - CLAUDE.md voice rules
TOOLS REQUIRED:
  - Filesystem read
  - Gmail MCP (draft creation)
  - Attio MCP (contact list, field updates)
OUTPUTS:
  - Invite Email 1 (21 days out)
  - Invite Email 2 (10 days out)
  - Reminder Email (24 hours out)
  - Reminder Email (1 hour out, registrants only)
  - Replay distribution email (24 hours after) - segmented by attendance:
    attendees get a personalized 48h follow-up; no-shows get a separate
    replay-driven sequence
  - 14-day post-webinar follow-up sequence to non-attendees
  - Attio: webinar_status field tracking each contact
APPROVAL GATE: Founder approves the 4 emails in the sequence and the replay
  email before scheduling.
SUCCESS CRITERIA (reset per Section 11.1):
  - Registration rate (invitees → registrants): 4 to 8%
  - Attendance rate (registrants → live attendees): 20 to 30%
  - Post-webinar demo booking rate: 5 to 10% of attendees
ESCALATE IF:
  - Registration < 50 by 10 days out (founder pushes proposal personally)
  - Cancellations spike on event day (technical issue)
```

---

### Agent 11: Analytics and Reporting Agent

```
AGENT: Analytics and Reporting Agent
PURPOSE: Produce the weekly metrics digest. Run cohort analysis monthly. Flag
  anomalies daily.
TRIGGER: Cron, Fridays 16:30 MT (weekly digest); Mondays 09:00 MT (monthly
  cohort, first Monday of month); continuous monitoring for anomaly alerts.
INPUTS:
  - Attio: pipeline counts, conversions, cycle times
  - Cloudflare Web Analytics
  - GA4 (if configured)
  - Search Console
  - Resend send metrics
  - Stripe MRR data (when subscription active)
  - Instantly send metrics
OUTPUTS:
  - /ops/digest/YYYY-MM-DD-weekly.md (Friday)
  - /ops/digest/YYYY-MM-cohort.md (first Monday)
  - Anomaly alerts via Slack DM or Gmail (immediate)
DIGEST FORMAT: See Appendix D.
APPROVAL GATE: None. Read-only reporting.
SUCCESS CRITERIA:
  - Friday digest published by 17:00 MT every week
  - Anomaly false positive rate below 10%
ESCALATE IF:
  - Any week-over-week metric drops > 30%
  - MRR churn event occurs
  - Three-week trend on reply rate is negative
```

---

### Agent 12: Case Study and PR Agent

```
AGENT: Case Study and PR Agent
PURPOSE: Convert trial users into published case studies. Find podcast and PR
  opportunities. Draft pitches and submissions.
TRIGGER: Bi-weekly Monday 10:00 MT (orchestrator-computed, not raw cron).
  Also on-demand when a trial user hits 30-day mark.
INPUTS:
  - Attio: paid subscribers tagged "case_study_candidate"
  - Founder interview transcripts (Riverside or Otter recordings)
  - Podcast directory (podchaser.com search), HARO queries
  - Conference and association calendars (manually maintained list)
  - STYLE_GUIDE.md and MARKETING_PLAN.md Section 1 non-negotiables (REQUIRED;
    case studies are the highest-trust customer-facing artifact and the most
    expensive to retract if voice or compliance drifts)
  - CLAUDE.md voice rules (especially the "no invented testimonials" rule)
  - FTC Endorsement Guides 16 CFR Part 255 reference (referrer-credit
    disclosure required if subject is also a referrer)
TOOLS REQUIRED:
  - Filesystem read/write
  - Attio MCP
  - Gmail MCP (draft creation)
  - Web search (HARO, podcast directories)
OUTPUTS:
  - /content/case-studies/drafts/<name>-v1.md
  - /ops/pr/podcast_outreach.csv tracker
  - Email drafts for podcast pitches
  - Conference proposal drafts saved to /ops/pr/proposals/
  - Case-study consent form pre-filled per subject
APPROVAL GATE: Founder approves every case study before publication, every
  podcast pitch before send, every conference proposal before submission. The
  named subject of any case study must give explicit written consent covering
  (a) named or pseudonymous use, (b) ad reuse rights, (c) revocation procedure,
  (d) PHI-screening warranty, (e) referral-credit disclosure if applicable.
SUCCESS CRITERIA (reset for realism):
  - 1 published case study per quarter from Quarter 1 onward
    (original "1 per month from month 2" was unachievable given consent +
    interview + draft + approval cycle of ~6 weeks; Clinician seat also
    noted that working forensic evaluators are unlikely to allow attribution
    while cases may still be on appeal)
  - 2 podcast pitches per week, 1 booked per month
  - 1 conference proposal submitted per quarter
ESCALATE IF:
  - Case study subject withdraws consent
  - Podcast pitch response rate < 10% over 4 weeks (revise pitch template)
```

---

### Agent 13: Content Publishing Agent

```
AGENT: Content Publishing Agent
PURPOSE: Move approved drafts from /content/drafts/ to /content/published/,
  deploy to Cloudflare Pages, ping Search Console and Bing Webmaster for
  re-indexing, update the sitemap, and trigger the LinkedIn announcement
  via Agent 9.
TRIGGER: Event-driven. Fires when a draft's frontmatter "status" flips to
  "approved" by the founder.
INPUTS:
  - /content/drafts/*.md (approved drafts)
  - /content/templates/blog_post.md (publication template)
  - Cloudflare Pages deploy hook URL
  - Google Search Console + Bing Webmaster API credentials
  - STYLE_GUIDE.md (final pre-publish sanity scan)
OUTPUTS:
  - /content/published/YYYY-MM-DD-slug.md (canonical publication record)
  - Git commit pushed to main (triggers Cloudflare Pages deploy)
  - Sitemap.xml updated
  - Search Console URL submitted for indexing
  - Attio Note attached to relevant Deals tagged "content_published"
  - LinkedIn announcement task created for Agent 9
TOOLS REQUIRED:
  - Filesystem read/write
  - Git CLI
  - Web fetch (Cloudflare deploy hook, Search Console API)
  - Attio MCP (note creation)
APPROVAL GATE: None. The founder's "approved" flag in the draft frontmatter
  is the gate. This agent is purely mechanical from there.
SUCCESS CRITERIA:
  - Approved drafts publish within 60 minutes of approval flag
  - Sitemap.xml regeneration succeeds
  - Search Console submission returns 200
  - No publication occurs without the second-person check (Section 10.1) passing
ESCALATE IF:
  - Cloudflare Pages deploy fails
  - Search Console submission returns 4xx
  - Final voice scan flags a banned term that the SEO Content Agent missed
```

---

### Agent 14: Referral and Billing Agent

```
AGENT: Referral and Billing Agent
PURPOSE: Run the $200-credit referral mechanic. Detect referral signups,
  apply credits in Stripe, detect conversions to paid, post free-month
  credits, draft notification emails per Appendix E template.
TRIGGER: Every 15 minutes during business hours. Daily summary at 17:00.
INPUTS:
  - Stripe Customer + Subscription events (webhook)
  - Attio: contacts tagged "referrer_*" and "referred_by_*"
  - /ops/config/referral_terms.yaml (credit amounts, eligibility rules)
  - STYLE_GUIDE.md (voice for notification emails)
OUTPUTS:
  - Stripe customer balance credit (negative balance entry of $200 on trial start)
  - Stripe customer balance credit (free month: -$599 or -$1499 on conversion)
  - Attio: referrer_credits_issued and referrer_credits_redeemed fields updated
  - Gmail draft notification email to referrer (Appendix E "Referral notification")
  - /ops/digest/referral_program.md weekly log
TOOLS REQUIRED:
  - Stripe API
  - Attio MCP
  - Gmail MCP (draft creation)
APPROVAL GATE: Founder approves the first 5 notification emails individually.
  After that, the template is trusted and notifications send automatically with
  founder receiving a weekly digest.
SUCCESS CRITERIA:
  - Every qualifying referral detected within 1 hour of event
  - Stripe credit applied within 4 hours
  - Notification email drafted within 6 hours
  - Zero double-credits, zero missed credits
ESCALATE IF:
  - Stripe webhook fails to deliver
  - Referrer is on the suppression list (notification blocked, founder review)
  - Credit total for one referrer exceeds $2,000/quarter (anti-abuse threshold)
```

---

### Agent 15: Sender Reputation Monitor

```
AGENT: Sender Reputation Monitor
PURPOSE: Independent monitor of outbound deliverability. Reads Postmaster Tools,
  DMARC aggregate reports, blacklist databases, and Instantly platform metrics
  separately from Send Agent. Operates as the kill-switch for Send Agent when
  thresholds trip. Critical separation: Send Agent should not police itself.
TRIGGER: Cron, every 30 minutes during business hours; hourly otherwise.
INPUTS:
  - Google Postmaster Tools API
  - Microsoft SNDS API
  - DMARC aggregate reports at dmarc@psygil.com (via Agent 18)
  - mxtoolbox.com/blacklists.aspx (web fetch)
  - Instantly platform send + bounce + complaint metrics
  - /ops/config/deliverability_thresholds.yaml
OUTPUTS:
  - /ops/deliverability/YYYY-MM-DD.md hourly snapshot
  - Send Agent halt signal (writes to /ops/config/send_paused.flag)
  - Slack DM or Gmail urgent alert to founder when any threshold trips
  - Weekly deliverability summary appended to Analytics Agent digest
TOOLS REQUIRED:
  - Web fetch (Postmaster Tools, SNDS, mxtoolbox, Instantly)
  - Filesystem write
THRESHOLDS:
  - Spam rate > 0.3% on any 24h rolling window: halt Send Agent
  - Bounce rate > 4% on any 24h rolling window: halt Send Agent
  - Postmaster Tools Domain Reputation drops to "Low" or "Bad": halt Send Agent
  - Listing on any major blacklist (Spamhaus, SpamCop, Barracuda): halt Send Agent
APPROVAL GATE: None. Read-only monitoring; the only action it takes is the halt
  signal, which is reversible by the founder.
SUCCESS CRITERIA:
  - Threshold breach detected within 30 minutes of occurrence
  - Halt signal applied before Send Agent dispatches the next batch
  - Zero missed breaches against ground-truth daily review
ESCALATE IF:
  - Postmaster Tools API returns error for more than 2 consecutive runs
  - Any threshold trips outside business hours (urgent alert)
```

---

### Agent 16: Suppression List Maintainer

```
AGENT: Suppression List Maintainer
PURPOSE: Own the integrity of the do-not-contact list. Validate new entries,
  audit for accidental high-value-contact inclusions, propagate suppressions
  across Attio + Instantly + Gmail filters.
TRIGGER: Cron, every 4 hours during business hours; daily summary at 19:00.
  Also event-driven when Reply Triage flags a Hard-No.
INPUTS:
  - /ops/config/suppression_list.csv (canonical)
  - Reply Triage outputs (Hard-No classifications)
  - Inbound replies containing "unsubscribe", "remove me", "stop"
  - Web form submissions to psygil.com/unsubscribe
  - Email bounces flagged as permanent
  - Attio: do_not_contact field on Person and Company objects
OUTPUTS:
  - /ops/config/suppression_list.csv updated (canonical source)
  - Attio: do_not_contact = true on matching records
  - Instantly suppression list synced via API
  - Gmail filter rule to auto-archive any future inbound from suppressed addresses
  - /ops/digest/suppression_audit_YYYY-MM-DD.md weekly summary
TOOLS REQUIRED:
  - Filesystem read/write
  - Attio MCP
  - Instantly API
  - Gmail MCP (filter management)
APPROVAL GATE: None for additions (CAN-SPAM legal requirement: silent and
  immediate compliance). Founder review for any removal from the suppression
  list (unusual; requires explicit re-opt-in evidence).
SUCCESS CRITERIA:
  - 100% of Hard-No replies suppressed within 10 calendar days (CAN-SPAM)
  - Zero accidental sends to suppressed addresses
  - Suppression list audit log clean: every entry has a source and timestamp
ESCALATE IF:
  - A high-value contact (ABFP diplomate, court roster member) lands on the
    suppression list; founder personal follow-up may be warranted
  - More than 5 unsubscribes from a single send batch (content problem)
  - More than 20 unsubscribes in 24h (anomaly)
```

---

### Agent 17: Demo Prep Agent

```
AGENT: Demo Prep Agent
PURPOSE: Generate a 5-minute pre-read brief for every demo on the founder's
  calendar. Reduces demo prep time from 10-15 min per call to under 5 min.
  Critical at 8-12 demos/week.
TRIGGER: Cron, daily at 06:45 MT for that day's demos. Also event-driven when
  a new demo lands on Calendar with less than 2 hours notice.
INPUTS:
  - Google Calendar today's demo blocks
  - Attio contact record for each booked attendee
  - Reply Triage history (what they said in their reply)
  - Calendly qualifying answer ("How many evaluations did you sign in the
    last 90 days?")
  - LinkedIn profile (if available)
  - Recent web search for clinician name + practice
OUTPUTS:
  - /ops/demos/YYYY-MM-DD/HH-MM-name.md brief per demo with:
    * One-paragraph contact summary
    * Reply history (last 3 touches)
    * Stated volume and segment (A_forensic, B_assessment)
    * Likely objections (BAA scope, pricing, integration)
    * Suggested opening question
    * Two product framings most likely to land for this prospect
  - Gmail draft "demo confirmation" email if call is less than 24h out
TOOLS REQUIRED:
  - Google Calendar MCP
  - Attio MCP
  - Web search
  - Gmail MCP
APPROVAL GATE: None. The brief is for founder consumption.
SUCCESS CRITERIA:
  - 100% of demos have a brief delivered 30+ minutes before the call
  - Founder reports brief was useful in post-demo log
ESCALATE IF:
  - Demo is with a clinician on the suppression list (something went wrong)
  - Demo is with someone we cannot identify (LinkedIn, web search, Attio all blank)
```

---

### Agent 18: DMARC Report Reader

```
AGENT: DMARC Report Reader
PURPOSE: Ingest DMARC aggregate reports delivered to dmarc@psygil.com.
  Parse XML, identify unauthorized senders, surface auth-fail patterns,
  feed Sender Reputation Monitor (Agent 15).
TRIGGER: Cron, daily at 06:00 MT. Most ESPs deliver reports overnight.
INPUTS:
  - Gmail inbox (dmarc@psygil.com alias)
  - /ops/config/expected_senders.yaml (Google Workspace, Resend, Instantly IPs)
OUTPUTS:
  - /ops/deliverability/dmarc_YYYY-MM-DD.md daily summary
  - Attio attribute: unauthorized_sender flag if a new sender appears
  - Signal to Sender Reputation Monitor (Agent 15)
  - Weekly DMARC digest appended to Analytics Agent output
TOOLS REQUIRED:
  - Gmail MCP (read dmarc@ alias)
  - XML parsing (DMARC reports are XML)
  - Filesystem write
APPROVAL GATE: None. Read-only.
SUCCESS CRITERIA:
  - 100% of DMARC reports parsed within 24h of delivery
  - Unauthorized sender detection within 48h of first appearance
  - SPF/DKIM pass rate visible in weekly digest
ESCALATE IF:
  - Unauthorized sender persists for more than 7 days
  - Auth-fail rate exceeds 5% on any 7-day window
  - DMARC report delivery stops (configuration issue)
```

---

### Agent 19: Approval Queue Dashboard

```
AGENT: Approval Queue Dashboard
PURPOSE: Single surface for the founder to triage all pending approvals.
  Consolidates Gmail drafts, Attio tasks, LinkedIn drafts, content drafts,
  podcast pitches, case study consents, and conference proposals into one
  prioritized list.
TRIGGER: Continuous. Refreshes every 5 minutes during business hours.
INPUTS:
  - Gmail drafts in "Needs-Review" label
  - Attio tasks tagged "founder_approval"
  - Filesystem: /content/needs-review/* files
  - LinkedIn draft folder
  - Calendar for next 4 hours
OUTPUTS:
  - HTML dashboard at /ops/approval_queue.html (or a Cowork artifact)
  - Priority-ranked list with one-click approve or reject per item
  - Approval action triggers downstream agent execution
TOOLS REQUIRED:
  - Gmail MCP
  - Attio MCP
  - Filesystem read
PRIORITY RANKING:
  1. Cold email drafts due to send today (time-sensitive)
  2. Reply Triage drafts (response-time-sensitive)
  3. LinkedIn drafts queued for today's posting time
  4. Webinar invite sequences with deadline within 24h
  5. SEO content awaiting publication
  6. Case studies and podcast pitches (slower cadence)
APPROVAL GATE: This IS the approval gate. The founder operates through this
  surface.
SUCCESS CRITERIA:
  - Queue depth visible within 5 seconds of opening dashboard
  - Approval throughput target met (40-50 items/day in 60-min block)
  - Zero items lost between agents and queue
ESCALATE IF:
  - Queue depth exceeds 75 items overnight (founder bottleneck)
  - Any item waits more than 24h (stale work)
  - Queue refresh fails (system health issue)
```

---

### Agent 20: Calendly Webhook Receiver

```
AGENT: Calendly Webhook Receiver
PURPOSE: Bridge Calendly bookings into Attio. When a demo is booked, create
  or update the corresponding Attio contact, log the demo on the Deal record,
  trigger Demo Prep Agent (17). Without this bridge the Day 0 smoke test
  cannot pass.
TRIGGER: Webhook event from Calendly on booking, cancellation, or reschedule.
INPUTS:
  - Calendly webhook payload (POST to a Cloudflare Pages Function endpoint
    at functions/api/calendly.ts)
  - Attio contact search by email
OUTPUTS:
  - Attio: new Person record created or existing matched
  - Attio: Deal stage flipped to "Demo Booked" (note: distinct from Reply
    Triage's "Demo Requested" intermediate stage; this is the real booking)
  - Attio: task created for founder with subject "Demo with [Name] at [Time]"
  - Demo Prep Agent (17) triggered to generate the brief
  - Reply Triage Agent (6) updated to mark conversation thread as "demo_locked"
TOOLS REQUIRED:
  - Cloudflare Pages Function (new file: functions/api/calendly.ts)
  - Attio MCP
  - Webhook signature verification (Calendly signed webhook)
APPROVAL GATE: None. Mechanical bridge.
SUCCESS CRITERIA:
  - 100% of Calendly bookings appear in Attio within 60 seconds
  - Zero duplicate records on rebooking
  - Demo Prep Agent fires for every booking
ESCALATE IF:
  - Webhook signature verification fails (possible spoof)
  - Booking is from an email on the suppression list
  - Booking conflicts with an existing demo on the same time slot
```

---

## 6. Weekly schedule (the cron calendar)

A normal Phase 1 week looks like this. All times Mountain Time.

| Day | Time | Agent | Output |
|---|---|---|---|
| Monday | 04:00 | Personalization | Today's email batch drafted |
| Monday | 06:30 | Pipeline Orchestrator | Daily run plan published |
| Monday | 07:00 | LinkedIn Engagement | 1 post + 4 comments queued |
| Monday | 08:00 to 09:00 | Founder approval block | Today's emails approved |
| Monday | 09:00 to 17:00 | Send (continuous) + Reply Triage (every 90 min) | Sends out, replies in |
| Monday | 10:00 (bi-weekly) | Case Study/PR | Podcast pitches drafted |
| Tuesday | 04:00 | Personalization | Today's batch drafted |
| Tuesday | 06:30 | Pipeline Orchestrator | Run plan |
| Tuesday | 08:00 to 09:00 | Founder approval | Approved |
| Tuesday | All day | Send + Reply Triage | Operational |
| Wednesday | 04:00 | Personalization | Today's batch |
| Wednesday | 06:00 | SEO Content | This week's blog post drafted |
| Wednesday | 06:30 | Pipeline Orchestrator | Run plan |
| Wednesday | 07:00 | LinkedIn Engagement | 1 post + 4 comments |
| Wednesday | 08:00 to 09:00 | Founder approval | Approved |
| Wednesday | 11:00 | Webinar Agent (if webinar week) | Invite/reminder sent |
| Thursday | 04:00 | Personalization | Today's batch |
| Thursday | 06:30 | Pipeline Orchestrator | Run plan |
| Thursday | 08:00 to 09:00 | Founder approval | Approved |
| Thursday | 12:00 (webinar weeks) | Webinar (run) | Live event |
| Friday | 04:00 | Personalization | Today's batch |
| Friday | 06:30 | Pipeline Orchestrator | Run plan |
| Friday | 07:00 | LinkedIn Engagement | 1 post + 4 comments |
| Friday | 08:00 to 09:00 | Founder approval | Approved |
| Friday | 16:30 | Analytics | Weekly digest |
| Friday | 17:00 | Wave Builder | Next week's batches queued |
| Friday | 17:30 to 18:30 | Founder review | Next week approved |
| Sunday | 20:00 | SEO Research | Backlog and digest updated |
| Sunday | 22:00 | Contact Enrichment | New records added |
| Daily | 06:00 | DMARC Report Reader (18) | Yesterday's reports parsed |
| Daily | 06:45 | Demo Prep Agent (17) | Today's demo briefs generated |
| Daily | 19:00 | Suppression List Maintainer (16) | Daily audit and Hard-No propagation |
| Continuous | every 30 min | Sender Reputation Monitor (15) | Deliverability snapshot, halt signal if needed |
| Continuous | every 15 min | Referral and Billing Agent (14) | Stripe event check, credit posting |
| Continuous | every 5 min | Approval Queue Dashboard (19) | Refresh founder triage surface |
| Event-driven | on draft approval | Content Publishing Agent (13) | Publish, deploy, ping Search Console |
| Event-driven | on Calendly booking | Calendly Webhook Receiver (20) | Attio record sync, trigger Demo Prep |

**Founder's weekly time budget** (steady state, Phase 1):

| Activity | Daily | Weekly total |
|---|---|---|
| Morning approval block (via Agent 19 dashboard) | 45 min × 5 | 3.75 hr |
| Demos (target 5 to 8/week with Demo Prep Agent help) | 75 min average | 6 to 10 hr |
| Reply review and personal responses | 20 min × 5 | 1.7 hr |
| Friday review block | | 1.5 hr |
| Strategic / content / product feedback | | 3 to 5 hr |
| **Total founder marketing time** | | **16 to 22 hr/week** |

Reset per `COUNCIL_REVIEW.md` Section 1.7 (Skeptic and Operations seats: original 26-35 hours/week double-counted founder time against engineering, support, onboarding, and life). Sustainable marketing capacity for a solo founder shipping a HIPAA-adjacent SaaS is 16 to 22 hours/week steady-state, with 25-hour bursts possible for 3 to 4 weeks before quality degrades. The Demo Prep Agent (17) and Approval Queue Dashboard (19) make the lower number workable. Email 2 and Email 3 in each sequence auto-send to non-replies (founder pre-approval of the sequence; only Email 1 needs per-send approval); this halves the daily approval queue.

---

## 7. SEO plan (detailed)

The SEO motion is the second-cheapest channel after referrals once it compounds (months 4+). It needs to be set up correctly from day 0 so the compound starts on day 1.

### 7.1 Strategy

**Bet:** Forensic and assessment psychologists Google specific, high-intent queries when a referral lands. We rank for those queries with content that is more useful than what currently exists, and we capture trial signups from the long tail.

**Differentiator:** Most "psychology software" content online is written by SaaS marketers for SaaS audiences. Our content is written by a clinician-informed team for clinicians. We use the right vocabulary (Daubert factors, prong analysis, criterion-based content analysis, AUSDIT, MSE, CAARMS, ASEBA) without explaining it like a Wikipedia article. We respect the reader's training.

**Anti-pattern:** generic "Top 10 EHRs for therapists" listicles. We do not write these. They rank but they do not convert our buyer.

### 7.2 Keyword strategy and clustering

Keywords cluster into five pillars. The SEO Research Agent maintains the backlog by pillar.

**Pillar 1: Forensic methodology (highest priority, Segment A)**

Intent: a working forensic evaluator looking for tools or technique.
Difficulty: medium-low (small total volume, low competition).
Conversion likelihood: very high.

Examples:
- forensic psychological evaluation report template
- defensible psychological evaluation
- discovery package psychological evaluation
- Daubert standard psychological evaluation
- competency evaluation report software
- parental responsibilities evaluation software
- court-ordered psychological evaluation software
- IME report writing software
- psychological evaluation audit trail
- chain of custody psychological records
- forensic psychology Daubert checklist
- cross-examination preparation forensic psychologist

**Pillar 2: Records review and integration (Segment B)**

Intent: assessment-heavy clinical practitioners.
Difficulty: medium (some SaaS competition).
Conversion likelihood: medium-high.

Examples:
- records review software for psychologists
- psychological testing report writer
- neuropsychological evaluation integration software
- psychological assessment report template
- psychometric report writing software
- assessment integration report
- ASEBA report writing
- MMPI-3 report integration
- WAIS-IV report writing software

**Pillar 3: Counter-positioning (defense)**

Intent: practitioners actively comparing or unhappy with current setup.
Difficulty: medium.
Conversion likelihood: high (active intent).

Examples:
- alternative to Word for psychological reports
- secure local report writing for psychologists
- HIPAA-compliant psychological evaluation software
- forensic psychology software local first
- SimplePractice forensic alternative
- TheraNest forensic alternative
- Mentaya assessment alternative
- Headway forensic alternative

**Pillar 4: Clinical methodology (top-of-funnel)**

Intent: clinicians researching practice topics.
Difficulty: high (established competitors like AP-LS, APA, PsychCentral).
Conversion likelihood: low directly, high for nurture.

Examples:
- what is Daubert standard psychology
- competency to stand trial evaluation
- fitness for duty evaluation
- IME process forensic psychology
- Faust's framework forensic psychology
- malingering assessment

**Pillar 5: Local Colorado (geographic)**

Intent: Colorado practitioners specifically.
Difficulty: low.
Conversion likelihood: very high during Phase 1.

Examples:
- forensic psychologist Colorado evaluation
- court-appointed evaluator Colorado
- CFI evaluator Colorado software
- PRE evaluator Colorado software
- 18th judicial district psychological evaluator
- Denver forensic psychology practice tools

The SEO Research Agent ranks every query in the backlog by `(intent × volume) / difficulty` and exposes the top 50 to the SEO Content Agent.

### 7.3 Content cadence and types

**Weekly long-form blog (every Wednesday):**

1500 words minimum. Targets one keyword from Pillar 1, 2, or 3. Written to the STYLE_GUIDE.md voice. Includes:
- H1 matching target keyword
- Three or more H2 sections
- One or more H3 sub-sections per H2
- At least three internal links
- At least two external citations (peer-reviewed when possible)
- One sample artifact (screenshot, diagram, or PDF excerpt)
- Author byline (founder)
- Schema markup: Article + Author + Organization
- FAQPage schema where 3+ Q&A pairs are present

**Bi-weekly case study (every other Wednesday from Week 4):**

500 to 800 words. Anonymized or named with consent. Structure:
- Practice context (one paragraph)
- The specific workflow change (two paragraphs)
- The artifact: a before/after of the discovery package, or a screenshot
- A signed quote from the clinician
- Schema markup: Article + Review where a clear quote stands in for review

**Monthly pillar piece (first Wednesday of each month):**

3000+ words. A definitive resource for one cluster. Examples:
- "The complete forensic psychological evaluation workflow"
- "Records review in psychology: methodology and tooling"
- "Building a discovery-ready evaluation file: a step-by-step framework"
- "The Daubert checklist for forensic psychologists"
- "Court-ordered psychological evaluations in Colorado: a practitioner's guide"

These earn backlinks and become the internal-linking hub for their cluster.

**Comparison pages (one new per month from month 2):**

`/compare/<competitor>` style pages. Already started in `compare.html` and `compare-v2.html`. We do these against:
- Word + Dropbox (the real status quo)
- SimplePractice
- TheraNest
- Heidi
- Freed
- General-purpose AI legal tools

Each comparison page targets the keyword `Psygil vs <competitor>` plus `<competitor> alternative for forensic`. Honest comparisons, no straw-man positioning.

**Glossary (built incrementally):**

`/glossary/<term>` pages for forensic and clinical methodology terms. Each glossary page is ~600 words: definition, history, methodology, related Psygil capability. Builds the long-tail surface area over time.

Initial glossary list (15 entries to launch in months 1-3):
- Daubert standard
- Frye standard
- Discovery package
- Criterion-based content analysis (CBCA)
- Statement validity assessment (SVA)
- Malingering assessment
- Cross-examination
- Adversarial allegiance
- Forensic case formulation
- Decision gates (link to product page)
- Audit trail (link to product page)
- Defensibility
- Parental responsibilities evaluation
- Child and family investigator
- Competency to stand trial

### 7.4 On-page SEO checklist

Every page that ships passes this checklist. The SEO Content Agent enforces it on drafts.

- [ ] Title tag: 50 to 60 chars, target keyword in first 30 chars, ends with "| Psygil"
- [ ] Meta description: 140 to 158 chars, target keyword in first 100 chars, includes a soft CTA
- [ ] H1: matches title tag intent, contains target keyword
- [ ] URL slug: lowercase, hyphenated, target keyword, no stop words
- [ ] First 100 words: contain target keyword and clearly state the answer
- [ ] H2 outline: 3 to 6 sections, each scannable in 2 seconds
- [ ] Internal links: 3+ to related pages
- [ ] External links: 2+ authoritative sources (peer-reviewed, .gov, .edu, established journals)
- [ ] Image: one minimum, ALT text descriptive, filename keyword-rich
- [ ] Schema markup: appropriate type (Article, Product, FAQPage, BreadcrumbList)
- [ ] Mobile readability: paragraphs under 4 lines, headers every 200 words
- [ ] CTA: one primary, "Start trial" or "Request sample discovery package"

### 7.5 Technical SEO baseline (set during Week 0)

- Sitemap.xml generated and submitted to Google Search Console + Bing Webmaster
- robots.txt allows all crawlers, blocks /private/ if present
- Canonical tags on every page
- hreflang only if/when international expansion happens (year 2)
- Page speed: Lighthouse Performance > 90 on every page (the static HTML/CSS approach already wins here)
- Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1
- Schema markup site-wide:
  - Organization (every page)
  - WebSite + WebPage (every page)
  - BreadcrumbList (every non-root page)
  - Article (blog posts)
  - Product (pricing, features)
  - FAQPage (where 3+ Q&A present)
  - VideoObject (demo page)
- Open Graph tags on every page (already implemented)
- Twitter Card tags on every page
- Author markup with org affiliation for E-E-A-T signals (Foundry SMB LLC)

### 7.6 Link building

We do not buy backlinks. We earn them. The Case Study/PR Agent owns this channel.

**Tier 1 (highest signal): peer-reviewed and association placements**
- American Journal of Psychiatry letter to the editor on forensic tooling (year 2 target)
- APA Monitor contributor piece
- Psychiatric Times column
- AP-LS newsletter contributor

**Tier 2: industry publications and podcasts**
- The Testing Psychologist podcast (target month 3)
- Forensic Psychology Today
- AP-LS Sound Mind
- Pinetum publications, when relevant

**Tier 3: HARO and reactive PR**
- Daily HARO query review for psychology, mental health, and legal-tech queries
- Founder quotes positioned around defensibility and the assistant model
- Target: 1 placement per month from month 3+

**Tier 4: digital PR**
- Submit Psygil to relevant directories: Capterra, G2, Software Advice, GetApp
- Listing on Crunchbase, Product Hunt (launch with care - timing matters)
- Beta List, BetaPage, Indie Hackers (founder story)

### 7.7 Local SEO (Colorado-specific)

- Google Business Profile for Foundry SMB LLC (Colorado address)
- Bing Places for Business
- Apple Business Connect
- Yelp (for the practice tier, less relevant for forensic SaaS)
- Citation consistency across all directories: name, address, phone matching exactly

### 7.8 SEO tooling

| Tool | Cost | Phase | Purpose |
|---|---|---|---|
| Google Search Console | Free | Day 0 | Performance, crawl, indexing |
| Bing Webmaster Tools | Free | Day 0 | Bing visibility |
| Cloudflare Web Analytics | Free | Day 0 | Privacy-friendly traffic |
| GA4 | Free | Day 0 | Conversion tracking |
| Google Postmaster Tools | Free | Day 0 | Email reputation (covered in EMAIL_SETUP.md) |
| Ahrefs Webmaster Tools | Free | Day 0 | Limited keyword data on own domain |
| Ahrefs Lite | $129/mo | Month 3+ | Full keyword research, backlink monitoring |
| Surfer SEO | $99/mo | Month 4+ (optional) | Content optimization scoring |
| ChatGPT or Claude (this agent) | $20/mo | Day 0 | Draft generation, this is already in stack |

### 7.9 SEO KPIs

| Metric | Week 6 | Month 3 | Month 6 | Month 8 |
|---|---|---|---|---|
| Indexed pages | 30 | 60 | 100 | 150 |
| Total monthly organic clicks | 50 | 300 | 1500 | 4000 |
| Trial signups from organic | 1 to 3 | 10 to 20 | 30 to 50 | 60 to 100 |
| Keywords ranking top 10 | 5 | 20 | 50 | 100 |
| Keywords ranking #1 | 0 | 3 | 10 | 25 |
| Backlinks (referring domains) | 5 | 25 | 70 | 150 |
| Domain Rating (Ahrefs) | n/a | 10 | 18 | 25 |

---

## 8. CRM strategy: Attio now, Close at month 6 to 8

### 8.1 Why Attio for Phase 1

- Free up to 3 users; supports the entire 8-week Phase 1 at $0
- 15+ MCP tools cover the operations agents need: create-record, create-note, create-task, search, read email content from connected Gmail
- Schema flexibility lets us model the ICP correctly (ABFP diplomate, court roster, license number) without bending Lead/Contact/Account to fit
- Native Gmail two-way sync threads email under contacts automatically
- Modern UI familiar to founder + reduces training time for any contractor

### 8.2 Attio schema (Phase 1)

Three core objects:

**People (the clinician)**
Standard fields plus:
- License number (Colorado PSY)
- NPI
- Degree (PhD, PsyD, EdD)
- Specialty (forensic, neuropsychology, assessment, child/adolescent, trauma, other)
- ABFP diplomate (boolean, year if true)
- ABPP-Forensic diplomate (boolean, specialty if other)
- SOMB approved provider (boolean)
- Court rosters (multi-select: 1st JD, 2nd JD, 4th JD, 8th JD, 10th JD, 17th JD, 18th JD, 19th JD, 20th JD)
- Practice URL
- Psychology Today profile URL
- LinkedIn URL
- Last verified date (license status check)
- Source (npi, dora, abfp, abpp, somb, court_roster, university, psychology_today, manual)

**Companies (the practice)**
Standard fields plus:
- Practice type (solo, group, hospital_employed, university_employed, government)
- NPI Type 2
- Specialty focus (forensic, assessment, mixed, clinical)
- Size (1-2, 3-10, 11-50, 51+)
- Subscription tier (none, trial, solo, practice, enterprise)

**Deals (the opportunity)**
Standard pipeline stages:
- Prospected
- Contacted
- Replied
- Demo Booked
- Demo Completed
- Trial Active
- Activated (discovery package generated)
- Won (paid)
- Lost

Custom fields:
- ICP segment (A_forensic, B_assessment, C_parked)
- Outreach wave (1 through n)
- Sequence step (1, 2, 3, follow-up)
- First contact date
- Last contact date
- Trial start date
- Activation date
- Subscription start date
- Source attribution (cold_email, webinar, content, linkedin, referral, conference)

### 8.3 Migration path to Close at month 6 to 8

**Trigger:** the moment any of the following becomes true:
- Outbound volume exceeds 200 emails/week
- A contract SDR joins (Q3 hire per Phase 2)
- Phone calls become a primary contact mode (forensic audience adoption uncertain)
- Pipeline complexity exceeds Attio's deal-stage model

**Process (week of migration):**

1. Export Attio data: People, Companies, Deals as CSV.
2. Map fields to Close schema:
   - Attio People → Close Contacts
   - Attio Companies → Close Leads
   - Attio Deals → Close Opportunities
   - Custom fields preserved as Close custom fields
3. Import via Close's CSV importer.
4. Reconnect Gmail to Close (Close has native sync).
5. Reconfigure all agents that touch Attio MCP to Close MCP (Pipeline Orchestrator, Wave Builder, Personalization, Reply Triage, Analytics).
6. Set up Close email sequencing (replaces Instantly).
7. Set up Close power dialer (new capability not available in Attio).
8. Decommission Attio after a 30-day overlap period.

**Cost at migration:** Close Startup $99/month for founder + Close Startup $99/month for contract SDR = $198/month minimum. The volume and motion change is what justifies it.

**Risk:** Close's automation system (Workflows) is more rigid than Attio's. Re-test every agent in dry-run mode for the first week post-migration.

---

## 9. Data architecture and tool stack

### 9.1 System of record map

| Data | System of record | Read by | Written by |
|---|---|---|---|
| Contact details | Attio (then Close) | All agents, founder, contractor | Contact Enrichment Agent, founder manual |
| Outreach history | Attio (then Close) | Reply Triage, Analytics | Send Agent, Reply Triage |
| Calendar | Google Calendar | Pipeline Orchestrator, Webinar | Founder, Calendly |
| Email | Gmail (founder@psygil.com) | Reply Triage | All sends and replies |
| Site analytics | Cloudflare Web Analytics + GA4 | Analytics Agent | (read-only) |
| Search performance | Search Console + Bing | SEO Research | (read-only) |
| Subscription / MRR | Stripe (when live) | Analytics | Subscription system |
| Content drafts | Filesystem (/content/) | SEO Content, founder | SEO Content Agent |
| Run logs | Filesystem (/ops/) | All agents, founder | All agents |
| Configuration | Filesystem (/ops/config/) | All agents | Founder |

### 9.2 Tool stack by phase

**Phase 0 (Week 0):**
| Tool | Cost | Purpose |
|---|---|---|
| Cloudflare Pages + Email Routing | $0 | Site hosting, inbound mail |
| Google Workspace Business Starter | $7/mo annual or $3.50/mo with current promo | Outbound founder mail |
| Resend Free | $0 | Transactional forms |
| Attio Free | $0 | CRM |
| Calendly Free | $0 | Demo scheduling |
| Loom Starter | $0 | Async video demos |
| Cloudflare Web Analytics | $0 | Privacy-friendly traffic |
| GA4 | $0 | Conversion tracking |
| Claude/ChatGPT | $20/mo | Agent brains |
| Total Phase 0 burn | ~$27/mo | |

**Phase 1 (Weeks 1 to 6):**
| Add | Cost |
|---|---|
| Instantly Growth | $37/mo |
| LinkedIn Sales Navigator Core | $99/mo |
| Mailwarm or Warmup Inbox | $20/mo |
| Buttondown (newsletter) | $9/mo |
| Total Phase 1 burn | ~$192/mo |

**Phase 2 (Months 3 to 8):**
| Add | Cost |
|---|---|
| Ahrefs Lite | $129/mo |
| Apollo Pro | $99/mo |
| Riverside Pro | $24/mo |
| CarePrecise email append | $850 one-time |
| Content writer contractor | $400 to $800/piece |
| Close CRM (month 6+) | $99/mo founder + $99/mo SDR |
| LinkedIn Ads pilot | $500 → $3000/mo |
| Conference attendance | $2000 to $5000 one-time |
| PR retainer (3-month engagement) | $2500/mo |

Reinvestment rule: 30 to 40% of net new MRR funds the next-tier add. Hard cap on monthly burn at $5K until Phase 3 (month 9+).

### 9.3 Files and folders the agents touch

```
/Users/truckirwin/Desktop/Foundry SMB/Products/psygil-website/
├── MARKETING_PLAN.md (this file)
├── EMAIL_SETUP.md
├── STYLE_GUIDE.md
├── CLAUDE.md
├── content/
│   ├── keyword_backlog.csv          (SEO Research Agent maintains)
│   ├── templates/
│   │   ├── blog_post.md             (template for SEO Content Agent)
│   │   ├── case_study.md            (template for Case Study Agent)
│   │   └── email_sequence.md        (cold email templates)
│   ├── voice/
│   │   └── founder_voice.md         (calibration corpus)
│   ├── drafts/                      (SEO Content Agent writes here)
│   ├── published/                   (after founder approval and publish)
│   ├── case-studies/
│   │   └── drafts/
│   ├── linkedin/
│   │   ├── topic_backlog.md
│   │   └── drafts/
│   └── webinars/
│       ├── invite_templates.md
│       └── recordings/
├── ops/
│   ├── config/
│   │   ├── agents.yaml              (agent configurations and schedules)
│   │   ├── suppression_list.csv     (do-not-contact)
│   │   └── icp_signals.yaml         (scoring weights)
│   ├── runlog/                      (daily run plans, Pipeline Orchestrator writes)
│   │   └── YYYY-MM-DD.md
│   ├── digest/                      (Analytics Agent writes)
│   │   ├── weekly/
│   │   └── monthly/
│   ├── seo/                         (SEO Research Agent writes)
│   │   └── weekly_digest.md
│   ├── deliverability/              (Send Agent writes)
│   │   └── YYYY-MM-DD.md
│   └── pr/
│       ├── podcast_outreach.csv
│       └── proposals/
└── research/
    └── co-psychologists/            (existing folder, Contact Enrichment Agent reads/writes)
        └── data/
            └── co_psychologists.csv
```

The Pipeline Orchestrator reads `/ops/config/agents.yaml` to know what is scheduled. The file looks roughly like:

```yaml
# Cron expressions corrected per COUNCIL_REVIEW.md Section 2.5.
# Original *invalid* expressions removed: */90 (cron max minute = 59),
# 1/14 (no day-of-week alternation operator).
# For non-standard intervals, the Pipeline Orchestrator computes the
# next run time and triggers via the scheduled-tasks MCP rather than
# relying on cron alone.

agents:
  pipeline_orchestrator:
    schedule: "30 6 * * 1-5"
    enabled: true
    escalation_email: founder@psygil.com
  contact_enrichment:
    schedule: "0 22 * * 0"
    enabled: true
    sources: [npi, dora, abfp, abpp, somb]
  wave_builder:
    schedule: "0 17 * * 5"
    enabled: true
    batch_size: 15
    daily_batches: 5
  personalization:
    schedule: "0 4 * * 1-5"
    enabled: true
    model: claude-opus-4-7
  send:
    schedule: "*/15 9-17 * * 1-5"
    enabled: true
    daily_cap: 25
    domain_warmup_active: true
    warmup_complete_date: null
  reply_triage:
    # Every 90 minutes during business hours - cron cannot express ">59",
    # orchestrator computes triggers at 08:00, 09:30, 11:00, 12:30, 14:00,
    # 15:30, 17:00, 18:30
    trigger: "orchestrator_computed"
    interval_minutes: 90
    business_hours: "08:00-19:00"
    enabled: true
  seo_content:
    schedule: "0 6 * * 3"
    enabled: true
    word_count_target: 1500
  seo_research:
    schedule: "0 20 * * 0"
    enabled: true
  linkedin_engagement:
    schedule: "0 7 * * 1,3,5"
    enabled: true
    posts_per_week: 3
    comments_per_week: 10
  webinar:
    trigger: "event_driven"
    event_offsets_days: [21, 10, 1]
    enabled: true
  analytics:
    weekly_digest_schedule: "30 16 * * 5"
    monthly_cohort_schedule: "0 9 1 * *"
    enabled: true
  case_study_pr:
    # Bi-weekly Mondays - cron cannot express alternation,
    # orchestrator computes triggers on weeks matching ISO_WEEK % 2 == 1
    trigger: "orchestrator_computed"
    cadence: "biweekly_monday"
    time: "10:00"
    enabled: true
  content_publishing:
    trigger: "event_driven"
    event: "draft_status_approved"
    enabled: true
  referral_billing:
    schedule: "*/15 9-17 * * 1-5"
    daily_summary_schedule: "0 17 * * 1-5"
    enabled: true
  sender_reputation_monitor:
    schedule: "*/30 9-17 * * 1-5"
    off_hours_schedule: "0 * * * *"  # hourly outside business hours
    enabled: true
    halt_signal_path: "/ops/config/send_paused.flag"
  suppression_list_maintainer:
    schedule: "0 */4 9-19 * * 1-5"
    daily_summary_schedule: "0 19 * * 1-5"
    trigger_on_event: "hard_no_classification"
    enabled: true
  demo_prep:
    schedule: "45 6 * * 1-5"
    trigger_on_short_notice: true
    enabled: true
  dmarc_report_reader:
    schedule: "0 6 * * *"
    enabled: true
  approval_queue_dashboard:
    schedule: "*/5 8-19 * * 1-5"
    surface: "html"
    output_path: "/ops/approval_queue.html"
    enabled: true
  calendly_webhook_receiver:
    trigger: "webhook"
    endpoint: "functions/api/calendly.ts"
    verify_signature: true
    enabled: true
```

---

## 10. Voice, quality, and approval gates

Every agent's output passes through one or more of three checks before reaching a customer.

### 10.1 Automatic checks (in-agent)

Each agent runs these self-checks before producing an output:

- Banned terms scan: em dash, curly quote, marketing vocabulary list (leverage, utilize, facilitate, empower, unlock, seamless, best-in-class, cutting-edge, next-generation), "AI" as subject in marketing copy
- **Second-person presence check (added per `COUNCIL_REVIEW.md` Section 2.3, Voice seat):** every outbound paragraph in marketing copy (email body, LinkedIn post, blog post body, webinar invite, case study quote attribution) must contain at least one second-person pronoun (`you`, `your`, `yours`). Exceptions: policies copy, About prose, internal documentation.
- **Third-person prohibition check (added per `COUNCIL_REVIEW.md` Section 2.3):** the literal string `the clinician` is banned in cold email body, webinar invite body, blog post body, LinkedIn post, and case study customer-facing copy. The string is permitted in policies, About, agent specs, and internal docs.
- **"Daubert-ready" replacement check:** the phrase "Daubert-ready" is banned in any customer-facing copy. Acceptable substitutes: "Rule 702-defensible", "challenge-ready", "survives Rule 702 challenge", "defensible under cross-examination". Daubert as a noun is permitted in forensic callouts and webinar agendas; "Daubert-ready" as a compound adjective is not.
- **CAN-SPAM footer check:** every outbound cold email and every commercial bulk email must contain (a) a working unsubscribe mechanism (link or instruction), (b) Foundry SMB LLC physical street address (not a PO box unless CMRA-compliant), (c) clear sender identification. Templates without this footer halt at the agent self-check, not at founder approval.
- Length and structure check against template
- Internal link sanity (no broken anchors)
- Schema markup validation
- Confidence threshold on any inference (personalization source, classification label)

If any check fails, the agent halts and writes the artifact to a `/needs-review/` folder rather than publishing.

### 10.2 Founder approval gates

The founder is the final gate on every customer-facing artifact:

| Artifact | Gate |
|---|---|
| Cold email send | Per-email approval in Gmail draft review |
| Webinar invite | Whole-sequence approval before scheduling |
| Blog post | Approval after draft, before publish |
| Case study | Approval and subject written consent before publish |
| LinkedIn post | Approval before publish |
| LinkedIn comment | Approval before posting |
| Podcast pitch | Approval before send |
| Conference proposal | Approval before submit |
| Referral notification | Approval per first batch; templated thereafter |
| PR pitch | Approval before send |

The founder's approval throughput is the rate limit on the entire system. Designed for 60 minutes daily plus 90 minutes weekly review.

### 10.3 External voice review (month 3+)

By month 3 we hire a 10-hour/week contractor (existing CO forensic psychologist if possible) to spot-check 10% of customer-facing artifacts for clinical accuracy and voice authenticity. This is cheap insurance against founder voice drift as content volume grows.

---

## 11. Metrics, feedback loops, and the weekly digest

### 11.1 Primary metrics

Targets reset per `COUNCIL_REVIEW.md` Section 4. The original v2.0 targets reflected best-case industry benchmarks for warm B2B audiences; the revised targets reflect realistic floors for cold outbound to credentialed clinicians.

| Metric | Definition | Phase 1 Target | Phase 2 Target |
|---|---|---|---|
| Reply rate Wave 1-2 | Replies / Sends, first two waves | 2 to 4% | 4 to 7% |
| Reply rate Wave 4+ | Replies / Sends with proof in market | 5 to 9% | 7 to 12% |
| Demo booking rate | Demos booked / Replies | 25 to 40% | 30 to 50% |
| Trial start rate | Trials / Demos | 40 to 60% | 45 to 65% |
| Trial-to-paid Solo | Paid / Trials | 15 to 25% | 20 to 30% |
| Trial-to-paid Practice | Paid / Trials | 10 to 20% | 15 to 25% |
| CAC by channel | Total channel cost / new paid | < $150 cold, < $300 webinar | < $250 ads |
| 90-day retention | Active paid at 90d / paid at 0d | 85 to 90% | 90% |
| Webinar registration rate | Registered / Invited | 4 to 8% | 6 to 10% |
| Webinar attendance rate | Live attendees / Registrants | 20 to 30% | 25 to 35% |
| SEO trial signups | Trials sourced organic / month | 0 to 1 by W6 | 10 to 30 by M6 |
| MRR growth | Month-over-month new MRR | n/a | 20 to 35% MoM |
| Net revenue retention | (MRR_t + expansion - contraction) / MRR_t-1 | n/a | 105%+ Practice |
| Founder marketing hours sustainable | Hours/week without quality degradation | 12 to 18 | 18 to 25 |

### 11.2 Anomaly thresholds (Analytics Agent fires alert if breached)

- Reply rate < 2% on any 14-day rolling window (Wave 1-2) or < 4% (Wave 4+)
- Open rate < 30% (deliverability red flag)
- Spam complaint rate > 0.3%
- Bounce rate > 4% in any 24h
- Demo no-show rate > 25%
- Search Console impressions drop > 20% week-over-week
- DMARC fail rate > 5%
- Webinar registration < 50 within 10 days of event

### 11.3 Weekly digest format (Analytics Agent produces)

Section 12 (Appendix D) has the template. The digest is 1 page max. Founder reads in 5 minutes.

### 11.4 Cohort review (monthly, first Monday)

The monthly cohort analysis groups paid subscribers by acquisition week and tracks:
- Subscription tier mix
- Activation rate (used discovery package within 14 days)
- 30-day retention
- 90-day retention (when applicable)
- Expansion rate (Solo → Practice upgrades)
- Referrals generated

The output is a markdown table and a one-paragraph commentary. The commentary is the founder's job, not the agent's.

---

## 12. 8-month roadmap (consolidated)

| Month | Theme | Headline action | Cumulative paid |
|---|---|---|---|
| 1 | Phase 1 weeks 1-3 | Cold email + Webinar #1 + 4 blog posts | 6 to 12 |
| 2 | Phase 1 weeks 4-6 | Case studies + Webinar #2 + Referral live | 18 to 30 |
| 3 | Mountain West | Expansion to NM/WY/UT/AZ + LinkedIn Ads pilot | 50 to 80 |
| 4 | National Segment B | AP-LS attendance + The Testing Psychologist podcast | 90 to 140 |
| 5 | Enterprise pipeline | First Enterprise prospects + APA Monitor pitch | 140 to 210 |
| 6 | Close migration | Move CRM to Close, hire contract SDR | 200 to 290 |
| 7 | Ads scale-up | LinkedIn Ads to $3K/mo + AAFP attendance | 270 to 380 |
| 8 | Consolidation | Plan v3.0 rewrite, brand consolidation | 350 to 500 |

---

## 13. Risks and recovery

### 13.1 Deliverability collapse

**Symptom:** Open rate drops below 30%, spam rate exceeds 0.3%, replies stop.

**Recovery:**
1. Pipeline Orchestrator halts Send Agent immediately.
2. Audit recent batches for content patterns (subject lines, link density, image weight).
3. Run mail-tester.com from founder@psygil.com to clean inbox.
4. If main domain reputation is the issue, switch to mail.psygil.com subdomain (already DNS-prepped per EMAIL_SETUP.md).
5. Resume at 50% volume for 7 days, re-warm if needed.

### 13.2 Approval gate bottleneck

**Symptom:** Founder approval queue exceeds 50 items overnight.

**Recovery:**
1. Pipeline Orchestrator reduces Wave Builder batch size to 15/day.
2. Personalization Agent runs only 4 days/week (Tuesday-Friday).
3. SEO Content Agent and LinkedIn Engagement Agent extend deadlines.
4. If chronic, founder commits to two 30-minute approval blocks per day instead of one 60-minute block.

### 13.3 Founder bandwidth exhaustion (demos)

**Symptom:** More demo requests than founder can run (>12/week).

**Recovery:**
1. Switch demo length from 25 minutes to 20 minutes.
2. Add a 6-minute Loom pre-watch requirement for demo confirmation.
3. Move qualifying questions from Calendly to a 3-question form.
4. Begin search for contract SDR or forensic-credentialed co-demo partner (originally planned for month 6).

### 13.4 Voice drift

**Symptom:** Output starts to read generic or marketing-vocabulary.

**Recovery:**
1. Re-feed founder voice corpus to Personalization, SEO Content, LinkedIn Engagement, Case Study agents.
2. Founder writes one new blog post manually to refresh the voice signal.
3. Hire contractor reviewer earlier than planned.

### 13.5 ICP misfit signal

**Symptom:** Reply rate is high but trial-to-paid is low.

**Recovery:**
1. Cohort analysis on the misfit subscribers: which sources, which specialties, which practice types.
2. Adjust ICP scoring weights in Wave Builder.
3. Demo-script revision to surface deal-breaker objections in first 5 minutes.

### 13.6 Compliance event

**Symptom:** HIPAA-related question from a buyer the agent cannot answer; legal letter received; CAN-SPAM complaint.

**Recovery:**
1. Pipeline Orchestrator escalates to founder immediately.
2. All outbound halts pending review.
3. Founder responds personally within 24h.
4. Suppression list updated, agent prompts retuned.

---

## Appendix A: Agent prompt scaffolds (copy-paste ready)

These are starting prompts for each agent. Tune as the system runs.

### A.1 Pipeline Orchestrator prompt

```
You are the Pipeline Orchestrator for Psygil's marketing system. It is now [TIME] MT on [DATE].

Your job is to audit pipeline state and dispatch the day's agent runs.

Read:
- /ops/config/agents.yaml for scheduled agents
- Attio: today's queued and approved contacts
- Yesterday's run log at /ops/runlog/[YESTERDAY].md
- This week's deliverability log

Produce:
1. /ops/runlog/[TODAY].md with sections:
   - Agents to dispatch today
   - Founder approval queue summary (count, oldest pending)
   - Any escalations from yesterday
   - Deliverability snapshot
   - Demos on calendar today
2. A short Gmail draft to founder@psygil.com summarizing the above (one paragraph max).

Read these files before drafting anything:
- MARKETING_PLAN.md sections 1, 2, 5, 6
- /ops/config/agents.yaml
- STYLE_GUIDE.md (voice for the Gmail draft)

If any non-negotiable from MARKETING_PLAN.md Section 1 is at risk, halt and escalate.
```

### A.2 Personalization Agent prompt

```
You are the Personalization Agent for Psygil's cold outreach.

Today's date: [DATE]. Today's send queue: [N] contacts. Each contact has an Attio record ID.

For each contact:
1. Read the Attio record (name, license info, specialty, practice URL, Psychology Today URL, LinkedIn URL).
2. Read at most three public sources: Psychology Today profile, LinkedIn (if public), practice website /about page.
3. Draft a 1-sentence line 1 that references one specific, verifiable fact from those sources.
4. Draft a 1-sentence line 3 that connects their work to Psygil's discovery package thesis.
5. Insert into the Email 1 template from MARKETING_PLAN.md Appendix E.
6. Set the From alias to founder@psygil.com.

Voice rules from STYLE_GUIDE.md and MARKETING_PLAN.md Section 1:
- No em dashes
- No curly quotes
- No banned marketing vocabulary
- Never use "AI" as a subject
- Name the assistants by function
- Second-person address to the clinician

Quality bar: Each draft must cite the source of the personalization in an Attio note. If you cannot find a specific, verifiable fact, escalate. Do not invent.

Output:
- One Gmail draft per contact (use Gmail MCP create-draft)
- One Attio note per contact with the personalization source and your confidence score (0.0 to 1.0)
- A summary log: total drafted, average confidence, contacts escalated for missing info

Halt and escalate if:
- A contact's Psychology Today profile is unreachable AND there is no LinkedIn AND no practice website
- A contact's license_status field shows "expired" or "inactive"
- A contact is on the suppression list (do-not-contact)
```

### A.3 Reply Triage Agent prompt

```
You are the Reply Triage Agent. You read inbound replies to founder@psygil.com and route them.

For each unread reply:
1. Read the full thread for context (last outbound from us included).
2. Classify into one of: Interested, Not-Now, Hard-No, Question, Bounce, OOO.
3. Apply the matching Gmail label.
4. Update the matching Attio contact record (find by email).

5. If Interested:
   - Draft a response that includes the Calendly link
   - Create an Attio task for founder with subject "Confirm demo with [Name]"
   - Set Attio stage to "Demo Booked" (pending confirmation)

6. If Question:
   - Draft a response that answers the question crisply (under 100 words)
   - Include a soft re-ask for the demo
   - Create an Attio task for founder review

7. If Not-Now:
   - Draft a polite acknowledgement
   - Set Attio stage to "Nurture 90d"
   - Schedule a follow-up reminder for 90 days out

8. If Hard-No / unsubscribe request:
   - Do not draft a response (legal requirement: silent compliance)
   - Add to suppression list IMMEDIATELY
   - Update Attio stage to "Lost - Opt out"

9. If Bounce:
   - Update Attio: email status = "invalid"
   - Notify Contact Enrichment Agent for re-verification

10. If OOO:
   - Read the return date from the auto-reply
   - Reschedule the next send for that date + 1 business day

Voice for all drafts: STYLE_GUIDE.md, second-person, conversational, no boilerplate.

Halt and escalate if:
- Reply contains complaint, threat, or legal language
- Reply is from a recognized industry figure (ABFP president, journal editor, etc.)
- Classification confidence is below 0.7
```

### A.4 SEO Content Agent prompt

```
You are the SEO Content Agent. This Wednesday's target keyword is [KEYWORD] from the backlog.

Process:
1. Read MARKETING_PLAN.md Section 7 (SEO strategy and on-page checklist).
2. Read STYLE_GUIDE.md.
3. Pull 3 to 5 top-ranking pages for [KEYWORD] from Search Console or Ahrefs.
4. Identify the angle that is missing from the SERP.
5. Draft a 1500-word post.
6. Output to /content/drafts/[YYYY-MM-DD]-[slug].md

The draft must include:
- Title tag (50-60 chars, keyword in first 30)
- Meta description (140-158 chars)
- H1 matching title
- 3 to 6 H2 sections
- One sample artifact (screenshot, code block, diagram description)
- At least 3 internal links (to existing pages on psygil.com)
- At least 2 external citations to authoritative sources (peer-reviewed, .gov, .edu)
- Schema markup JSON-LD block
- Author byline: Robert Irwin, Founder, Psygil

Voice rules: STYLE_GUIDE.md governs. Second-person to clinician. No em dashes. No marketing vocab. No "AI" as subject - name the assistant by function.

After drafting, run the self-check from Section 10.1. If any check fails, write to /content/needs-review/ instead of /drafts/.

Notify founder with a Gmail draft summarizing: keyword, draft path, estimated edit time.
```

---

## Appendix B: SEO keyword bank (Phase 1 priority)

The SEO Research Agent maintains the full backlog. Section 7.2 has the structure. The Week 1 starter set:

**Forensic methodology (Pillar 1):**

| # | Query | Intent | Est. monthly vol | Difficulty | Priority |
|---|---|---|---|---|---|
| 1 | forensic psychological evaluation report template | Commercial | 200 to 500 | Low | P0 |
| 2 | defensible psychological evaluation | Informational/commercial | 50 to 150 | Low | P0 |
| 3 | discovery package psychological evaluation | Commercial | 20 to 50 | Very low | P0 |
| 4 | Daubert standard psychological evaluation | Informational | 100 to 300 | Medium | P1 |
| 5 | competency evaluation report software | Commercial | 50 to 150 | Low | P1 |
| 6 | parental responsibilities evaluation Colorado | Local commercial | 30 to 80 | Low | P1 |
| 7 | court-ordered psychological evaluation software | Commercial | 100 to 200 | Low | P0 |
| 8 | IME report writing software | Commercial | 200 to 400 | Medium | P0 |
| 9 | psychological evaluation audit trail | Commercial | 20 to 50 | Very low | P2 |
| 10 | chain of custody psychological records | Informational | 30 to 80 | Low | P2 |

**Records review and integration (Pillar 2):**

| # | Query | Intent | Vol | Difficulty | Priority |
|---|---|---|---|---|---|
| 11 | records review software for psychologists | Commercial | 100 to 300 | Medium | P0 |
| 12 | psychological testing report writer | Commercial | 200 to 500 | Medium | P0 |
| 13 | neuropsychological evaluation integration software | Commercial | 50 to 150 | Low | P1 |
| 14 | psychological assessment report template | Commercial | 500 to 1000 | High | P1 |
| 15 | psychometric report writing software | Commercial | 50 to 150 | Low | P1 |

**Counter-positioning (Pillar 3):**

| # | Query | Intent | Vol | Difficulty | Priority |
|---|---|---|---|---|---|
| 16 | alternative to Word for psychological reports | Commercial | 30 to 80 | Low | P0 |
| 17 | secure local report writing for psychologists | Commercial | 20 to 50 | Very low | P1 |
| 18 | HIPAA-compliant psychological evaluation software | Commercial | 200 to 500 | High | P2 |
| 19 | forensic psychology software local first | Commercial | 10 to 30 | Very low | P1 |
| 20 | SimplePractice forensic alternative | Commercial | 50 to 150 | Medium | P1 |

The SEO Research Agent expands this list weekly by examining Search Console "queries with impressions but no clicks" and ranking competitors' new content.

---

## Appendix C: Attio schema migration spec (preserved on Close migration)

When migrating from Attio to Close at month 6 to 8, map fields as follows:

| Attio Object | Attio Field | Close Object | Close Field | Notes |
|---|---|---|---|---|
| Person | name | Contact | name | direct |
| Person | email | Contact | emails[0] | direct |
| Person | phone | Contact | phones[0] | direct |
| Person | license_number | Contact | custom.license_number | Close custom field |
| Person | NPI | Contact | custom.npi | Close custom field |
| Person | abfp_diplomate | Contact | custom.abfp | boolean |
| Person | court_rosters | Contact | custom.court_rosters | multi-select |
| Company | name | Lead | display_name | direct |
| Company | practice_type | Lead | custom.practice_type | enum |
| Company | subscription_tier | Lead | custom.subscription_tier | enum |
| Deal | stage | Opportunity | status | direct mapping |
| Deal | icp_segment | Opportunity | custom.icp_segment | enum (A_forensic, B_assessment) |
| Deal | outreach_wave | Opportunity | custom.wave | integer |
| Deal | source_attribution | Opportunity | custom.source | enum |

---

## Appendix D: Weekly digest template (Analytics Agent output)

```markdown
# Weekly Marketing Digest: Week of [START_DATE]

## Top line
- Paid subscribers: [N] total ([+/-] this week)
- MRR: $[X] ([+/-]% WoW)
- Trials active: [N]
- Reply rate (rolling 14d): [N]%

## Pipeline movement
| Stage | Count start of week | Count end of week | Change |
|---|---|---|---|
| Prospected | | | |
| Contacted | | | |
| Replied | | | |
| Demo Booked | | | |
| Trial | | | |
| Paid | | | |

## Outbound performance
- Emails sent: [N] (Wave [N], Step [1/2/3])
- Open rate: [N]%
- Reply rate: [N]%
- Demos booked: [N]
- Spam complaints: [N]

## Content
- Published this week: [URL] (target keyword: [keyword], CWV pass: yes/no)
- Search Console impressions: [N] (Δ WoW: [+/-]%)
- Top-3 ranking keywords: [list]

## Webinar (if applicable)
- Registered: [N]
- Attended live: [N]
- Replay views: [N]
- Demo bookings from webinar: [N]

## LinkedIn
- Posts: [N]
- Engagement: [N reactions, N comments]
- New Sales Nav connections: [N]

## Referrals
- New referrals submitted: [N]
- Credits issued: $[X]
- Referral-sourced trials: [N]

## Anomalies / escalations
- [Item if any]

## Founder action items for next week
- [Generated from agent failures and escalations]

## Phase 1 progress
- Week [X] of 6
- Cumulative paid: [N] of [target 18-30]
- On track / Off track: [status with one-line reason]
```

---

## Appendix E: Email templates

Rewritten per `COUNCIL_REVIEW.md` Sections 1.1, 1.2, 1.3, and 2.1. All templates now (a) carry a CAN-SPAM-compliant footer, (b) address the clinician in second person, (c) replace "Daubert-ready" with Rule 702 framing, and (d) name specific assistants by function per `STYLE_GUIDE.md`.

The shared footer block at the bottom of every commercial send is canonical and must not be edited per-send.

### Shared footer (appended to every commercial send)

```
--
Robert Irwin
Founder, Psygil

Foundry SMB LLC
[STREET ADDRESS], [CITY], CO [ZIP]

To stop hearing from us: reply with "unsubscribe" or visit https://psygil.com/unsubscribe
```

The street address is the operating address on file for Foundry SMB LLC with the Colorado Secretary of State. Not a PO box. The unsubscribe link must resolve to a working web form that does not require login and does not require additional information beyond the recipient's email address. Per Section 1 non-negotiable #3 and `COUNCIL_REVIEW.md` Section 1.1, every template that omits this footer halts at the agent self-check.

---

### Email 1 (Wave 1 forensic, Segment A)

```
Subject: A sample discovery package, before the next referral

Dr. [Last Name],

[Personalization line 1 - one verifiable fact about their work, sourced
from a public profile and cited in the Attio note]

A short note from someone working on Psygil, a forensic evaluation tool
built in Colorado. You already produce a defensible record by hand:
timestamps, source quotes, an attestation trail, the records you would
need to reconstruct the evaluation on cross. The work happens. The cost
is hours.

[Personalization line 3 - connect their work to the discovery package
thesis: e.g., for a court-roster CFI evaluator, the discovery binder for
parental responsibilities evaluations]

Psygil produces that record as a byproduct of the work you would do
anyway. You render every diagnosis. The discovery package exports on
demand: final report, SHA-256 manifest, audit chain, interview
transcript, and the cited source records in one file.

If a sample package is easier to evaluate than a meeting, here it is
(redacted, 12 pages, no signup): [sample link]. If a 20-minute
walkthrough is useful, my Calendly is [link].

Note on tier scope: Psygil's Solo plan is positioned for non-PHI
workflow (consults, expert reviews where records arrive under discovery
order and are not stored). The Practice and Enterprise tiers offer a
BAA on request.

Robert

[shared footer]
```

Notes:
- Per `COUNCIL_REVIEW.md` Section 1.2 and Section 2.1 (Voice and Clinician seats), this template leads with the artifact rather than the pitch. A/B test against an artifact-first 3-sentence variant during Wave 1.
- The "forensic-grade IDE" phrase is removed per Clinician seat finding (vendor-anointed term).
- Demo length cut to 20 minutes per Sales seat funnel-friction finding.
- Solo tier scope disclosure per Compliance seat critical #4.

---

### Email 2 (Wave 1 follow-up, Day 8)

```
Subject: A six-minute Loom on the discovery export

Dr. [Last Name],

Following up briefly. The piece most evaluators look at first is the
discovery package itself: the export that gathers the final report,
the SHA-256 manifest, the audit chain, the interview transcript, and
the cited source records into one reviewable file.

A six-minute walkthrough is here: [Loom link]. The first 90 seconds
show the export. The rest is the workflow that produces it.

If a demo is easier, [Calendly link]. If neither is useful right now,
you can ignore this. The break-up email next week will tell you that
I am done.

Robert

[shared footer]
```

---

### Email 3 (Wave 1 break-up, Day 18)

```
Subject: Closing the loop

Dr. [Last Name],

Closing the loop. If Psygil is worth a look later, the Calendly link
stays open: [link]. If not, no further outreach.

Two artifacts you might find useful regardless:
- The sample discovery package, free to download: [link]
- A short blog post on what a defensible evaluation file looks like
  under a Rule 702 challenge: [link]

Best,
Robert

[shared footer]
```

Notes:
- Day 14 → Day 18 per Sales seat finding: forensic audience may have been in court between Email 2 and Email 3; longer interval reduces "I just saw your last email" replies.
- "what we think a defensible evaluation file looks like" → "what a defensible evaluation file looks like under a Rule 702 challenge" per Voice seat.

---

### Email 1 (Wave 3 Segment B repositioning)

```
Subject: The records review and the integration writeup

Dr. [Last Name],

[Personalization line 1]

A short note from someone working on Psygil, a tool built in Colorado
for evaluation-heavy psychology practices. In the evaluations you run,
the records review and the integration writeup are usually the longest
parts. The interviews and the testing are paced by the patient. Your
records review is paced by the binder.

[Personalization line 3]

Psygil's ingestion assistant reads uploaded records into structured
case data you can navigate. The writing assistant drafts integration
sections from the diagnoses you have signed, in your voice. You render
every diagnosis. The report stays yours.

Sample integration export here (redacted): [link]. A 20-minute
walkthrough here: [Calendly]. A six-minute Loom: [Loom link].

Note on tier scope: Psygil's Solo plan is positioned for non-PHI
workflow. Practice and Enterprise tiers offer a BAA on request.

Robert

[shared footer]
```

---

### Webinar invitation Email 1 (21 days out)

```
Subject: The records you wish you had kept (webinar, [DATE])

Dr. [Last Name],

Running a 45-minute webinar on [DATE] at noon MT.

Title: The records you wish you had kept: building an evaluation file
that survives a Rule 702 challenge.

Agenda: 30 minutes of walkthrough through an actual evaluation, intake
to signed discovery package. 15 minutes of Q and A. Forensic evaluators
welcome. This is a product demonstration; it is not continuing
education and it is not legal advice.

Register: [link]. If you cannot attend live, register and I will send
the recording.

Robert

[shared footer]
```

Notes:
- Webinar title change per Clinician seat best-single-change finding.
- "Forensic evaluators only - the framing assumes you know what cross-examination looks like" line cut per Clinician seat ("reads as a flex").
- CE / legal-advice disclaimer added per Compliance seat important #8.

---

### Webinar reminder Email (24 hours out)

```
Subject: Tomorrow at noon: the records you wish you had kept

Quick reminder. The webinar is tomorrow at noon MT.

Zoom link: [link]
Calendar invite: [link]

The walkthrough covers:
1. Intake and referral handling
2. Records ingestion
3. Testing entry and scoring (with validity scale handling)
4. The diagnostic gate
5. The writing assistant drafting integration sections from your
   signed diagnoses
6. Attestation and the discovery package export

See you tomorrow.

Robert

[shared footer]
```

Notes:
- Title aligned to invite email.
- Agenda items 3 and 5 rewritten per Clinician and Voice seats: "Testing entry and scoring (with validity scale handling)" instead of generic "Testing entry"; "the writing assistant drafting integration sections from your signed diagnoses" instead of "Writer pre-fill from signed diagnoses."
- One agenda item per the original six retained per Sales seat's "trim to four" suggestion; kept six because each item is short enough to read in one breath.

---

### Post-webinar follow-up (attendees)

```
Subject: Recording and a longer demo invite

Dr. [Last Name],

Thanks for joining today. The questions you all asked were the right
ones; I owe a couple of you direct follow-up that I will send by end
of day Friday.

Webinar recording: [link]
Slides: [link]
Sample discovery package PDF: [link]

If a 30-minute working demo against your own evaluation workflow would
be useful, my Calendly is [link]. I would rather walk through your
specific question than pitch you.

Robert

[shared footer]
```

### Post-webinar follow-up (registered but did not attend)

```
Subject: Recording and the discovery package sample

Dr. [Last Name],

You registered for today's webinar but I did not see you live. The
recording is here: [link]. The first 12 minutes are the part most
evaluators care about (the discovery package export).

Sample discovery package PDF: [link].

If a demo is useful, my Calendly stays open: [link].

Robert

[shared footer]
```

Notes:
- Split per Sales seat finding: attendees and no-shows should not receive identical copy.

---

### Referral notification

```
Subject: A credit on your Psygil account

Dr. [Last Name],

Thanks for the referral. [Referred name] started a trial today, and
there is a $200 credit on your account against your next invoice. If
they convert to paid, a free month posts automatically.

Required FTC disclosure: this referral credit is the consideration we
provide for the introduction. If you mention Psygil in public posts
(LinkedIn, conference talks, podcast appearances), please include a
brief disclosure such as "I receive a credit on my Psygil account"
in those mentions. This is also covered in the referral program terms
at https://psygil.com/policies#referral-program.

Appreciate it.

Robert

[shared footer]
```

Notes:
- FTC Endorsement Guides 16 CFR Part 255 disclosure added per Compliance seat critical #3.

---

## Appendix F: Phase 0 launch checklist

Day -3 (Monday):

- [ ] Cloudflare Email Routing enabled for psygil.com
- [ ] Google Workspace Business Starter active with founder@psygil.com
- [ ] All aliases configured per EMAIL_SETUP.md Section 2
- [ ] DKIM, SPF, DMARC at p=none configured
- [ ] dmarc@psygil.com receiving reports

Day -2 (Tuesday):

- [ ] Attio Free workspace stood up
- [ ] Schema imported per Appendix C (People, Companies, Deals with custom fields)
- [ ] Colorado contact list imported, deduped, tagged by segment (A, B, parked)
- [ ] Instantly account active, founder@psygil.com configured
- [ ] Mailwarm running 7-day warm-up cycle
- [ ] Calendly link live: calendly.com/psygil/demo
- [ ] One qualifying question: "What is your primary referral source?"

Day -1 (Wednesday):

- [ ] 12 agents configured as scheduled tasks per Section 5 + 6
- [ ] Founder Loom recorded (6 minutes, forensic flow)
- [ ] Sample discovery package PDF prepared
- [ ] 4 blog post drafts in /content/drafts/
- [ ] /ops/config/agents.yaml configured
- [ ] /ops/runlog/, /ops/digest/, /ops/seo/, /ops/deliverability/ created

Day 0 (Thursday):

- [ ] Smoke tests pass: personalized test email lands, /support form routes, Calendly booking creates Attio task
- [ ] Wave 1 list (60 to 100 Segment A names) approved by founder
- [ ] All agents run in dry-run mode against Wave 1
- [ ] Pipeline Orchestrator produces first daily run plan

Friday is buffer.

Week 1 begins Monday.

---

End of plan v2.0. The system runs from here.
