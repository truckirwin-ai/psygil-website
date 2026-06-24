# Marketing Plan Council Review

Foundry SMB LLC. Internal review document.
Version 1.0. Effective: 2026-05-14.
Convened reviewers: Compliance and Legal, Voice and Brand, Sales and Conversion, Operations and Agent Architecture, Clinician and ICP, Skeptic and Devil's Advocate, Expansionist.
Reviewing: `MARKETING_PLAN.md` v2.0, `EMAIL_SETUP.md` v1.0, `STYLE_GUIDE.md`, `CLAUDE.md`, `policies.html`, public website pages.

This is the consolidated output of a seven-seat agent review. Each seat read the plan independently. This document organizes findings by severity rather than by seat, highlights where seats agreed (strong signal) and where they disagreed (open tensions for the founder to resolve), and produces a sequenced action list.

The verdict in one paragraph: the plan's operational hygiene is genuinely excellent, the voice discipline is real, and the agent architecture is the most thoughtful piece of the document. The plan is broken in three specific ways. First, the cold email templates carry both compliance risk and credibility risk that block launch as written. Second, the conversion rate and reply rate targets are 2x to 3x what the audience will actually deliver, which collapses the cumulative subscriber math. Third, the founder is the rate limiter, the single point of failure, and the only person whose time is not double-counted between marketing, engineering, support, and life. Each of these is fixable. None are fixed in the current document.

---

## 1. Critical findings (block launch until addressed)

Findings where two or more seats converged independently. Each lives in a specific section, line, or template.

### 1.1 Cold email templates violate CAN-SPAM and FTC rules
**Seats:** Compliance (critical #1, #2, #3), Voice (hard #1, #4), Sales (best single change).
**What's wrong:**
- No working unsubscribe mechanism in Email 1, Email 2, Email 3, or Wave 3 Segment B Email 1. The Email 2 line "you can ignore this and I will leave you alone" and the Email 3 line "no further outreach from me" do not meet 15 USC 7704(a)(4)(A).
- The footer placeholder `[Colorado address]` must be a real permanent physical postal address. Email 2 and Email 3 omit the sender-identification block entirely.
- Section 2 non-negotiable #3 says "10 business days" for opt-out honoring; the statute says 10 **calendar** days. Unsubscribe links must remain functional for at least 30 days.
- Referral notification template and case study program create "material connections" under the FTC Endorsement Guides (16 CFR Part 255) that must be disclosed in any public mention by the referrer.
**Fix:** rewrite the footer block in Appendix E to include a working unsubscribe (a dedicated `unsubscribe@psygil.com` plus a web form), the full Foundry SMB LLC street address (not a PO box), and a clear sender identification. Update Section 2 non-negotiable #3. Add FTC disclosure language to the referral program T&Cs and to the case study consent template.

### 1.2 Email 1 has a voice violation that is also a credibility violation
**Seats:** Voice (hard #1), Clinician (what loses trust).
**What's wrong:** The line "Most evaluators I have spoken with..." and "The clinician renders every diagnosis" in Email 1 put the clinician in third person, in an email sent directly to that clinician. The Style Guide is explicit: second person on marketing pages and outbound. The Wave 3 Segment B email contains the same drift. The Clinician seat noticed the issue independently as a tonal misfit.
**Fix:** rewrite Email 1 in second person throughout. The Wave 3 Segment B template already has the right register ("The writing assistant drafts integration sections from your signed diagnoses, in your voice. You render every diagnosis. The report stays yours.") and should be the model.

### 1.3 The "Daubert-ready" framing is wrong and the audience will catch it
**Seats:** Compliance (important #7, substantiation), Clinician (what loses trust), Voice (soft drift).
**What's wrong:** "Daubert-ready" is a vendor phrase, not a clinician phrase. The court applies Rule 702 / Daubert / Frye to the *expert's testimony*, not to a software artifact. Forensic psychologists will read "Daubert-ready" the way doctors read "military-grade." It also creates substantiation risk if read as a performance guarantee.
**Fix:** Webinar title and supporting copy change from "How a Daubert-ready evaluation gets built" to the Clinician seat's recommended frame: **"The records you wish you had kept: building an evaluation file that survives a Rule 702 challenge."** Same pattern elsewhere: "challenge-ready," "Rule 702-defensible," or simply "defensible." Audit every instance.

### 1.4 The Solo tier BAA gap collapses forensic conversion
**Seats:** Compliance (critical #4), Clinician (tier-fit), Sales (funnel friction #3).
**What's wrong:** Solo is explicitly out of BAA scope. A forensic evaluator who reaches trial-activation will not upload real records without a BAA. A clinician who buys Solo and later finds out has a colorable misrepresentation argument unless the BAA-ineligibility was conspicuously disclosed at checkout. The Refund Policy says fees are non-refundable, which compounds the risk.
**Fix options (founder must choose):**
1. **Bundle a BAA into Solo at $799 to $899/month.** Accepts a slightly higher Solo price, doubles forensic-fit conversion. Recommended by the Clinician seat.
2. **Position Solo explicitly as "for non-PHI work" or "for the diagnostic-record layer without record ingestion."** Accept the halved TAM. Add the constraint to the pricing page, the cold email, and the trial onboarding.
3. **Maintain current stance** (Solo no BAA, period). Accept that forensic trials will not activate. Reframe the marketing plan to target assessment-only (Segment B) as the dominant Phase 1 audience.

This is the single largest open strategic question in the plan. The current stance is a non-negotiable per Section 1, but the field cost is real. Decide before Wave 1.

### 1.5 Phase 0 cannot fit in 3 days
**Seats:** Operations (implementation sequencing), Skeptic (load-bearing assumption #2).
**What's wrong:** The plan says all 12 agents stand up Day -3 to Day 0. Realistic sequence requires roughly 10 to 14 working days, plus 7-day domain warm-up running concurrently. Agents 1, 4, 5, 6 are the live-fire path. Agents 7 to 12 should be scheduled additions over Weeks 1 to 3, not Phase 0 work.
**Fix:** rewrite Section 4 Week 0 to a two-week pre-launch period. Move agents 7 to 12 to Phase 1 incremental adds. Founder writes the Week 1 blog post manually rather than waiting for the SEO Content Agent to be ready.

### 1.6 Reply rate and conversion targets are 2x to 3x reality
**Seats:** Sales (top-line read), Skeptic (load-bearing assumption #4 and #5).
**What's wrong:** 8 to 15% cold email reply rate to forensic psychologists is not what the industry delivers. Real floor is 2 to 4% on Wave 1, climbing to 6 to 9% by Wave 4 with proof. 25 to 40% trial-to-paid on Solo assumes a BAA conversation that does not exist. Webinar attendance 35 to 45% on a new domain with a list of 80 to 120 registrants is optimistic by 10 to 15 percentage points.
**Fix:** rewrite Section 11.1. Reply rate target: 3 to 7%. Trial-to-paid Solo: 15 to 25%. Webinar attendance: 25 to 35%. Recompute Phase 1 Week 6 cumulative paid: realistic 6 to 15 paid, not 18 to 30. Either accept the lower number or revise the channel mix to pull more from referrals, conferences, and partnerships (which the plan undersizes).

### 1.7 Founder bandwidth is double-counted
**Seats:** Operations (approval gate bottlenecks), Skeptic (founder bandwidth reality check).
**What's wrong:** Section 6 self-reports 26 to 35 hours/week on marketing. Operations math shows daily email approvals plus reply triage plus LinkedIn alone exceeds the stated 60-minute daily block (~68 minutes for cold emails plus replies plus LinkedIn). The 26 to 35 hours/week ignores engineering load (30 to 50 hours), customer support, onboarding, operations, BAAs, legal review, DMARC review, deliverability triage, and life. Sustainable marketing capacity for a solo founder shipping a HIPAA-adjacent SaaS is closer to 12 to 18 hours/week, with 25-hour bursts possible for 3 to 4 weeks before quality degrades.
**Fix:** add a "trust founder-approved templates fully for Email 2 and Email 3 follow-ups in a sequence after Email 1 is approved" rule. Halves the daily email approval queue. Move LinkedIn comment approval to a sample-based audit (1 in 5 reviewed) rather than 100%. Reduce cold email daily volume to 15 to 20 in Weeks 1 to 2 and ramp only after approval-time data shows headroom.

### 1.8 Eight infrastructure agents are missing
**Seats:** Operations (missing agents or orchestration).
**What's wrong:** the agent roster of 12 does not include:
1. **Content Publishing Agent.** Moves approved drafts from `/content/drafts/` to `/content/published/`, deploys to Cloudflare Pages, pings Search Console.
2. **Referral / Billing Agent.** Detects referral signups, applies the $200 credit in Stripe, posts the free-month credit on conversion. Week 6 referral program will fail silently without it.
3. **Sender Reputation Monitor.** Reads Postmaster Tools and DMARC reports independently from Send Agent. Send Agent should not police itself.
4. **Suppression List Maintainer.** Audits suppression integrity, validates new entries.
5. **Demo Prep Agent.** Generates a 5-minute pre-read for each demo (Attio summary, last touchpoint, expressed interest). At 8 to 12 demos per week, prep is a real founder time sink.
6. **DMARC Report Reader.** Ingests aggregate reports from `dmarc@psygil.com`. Section 11.2 alert on DMARC fail rate > 5% cannot fire without this.
7. **Approval Queue Dashboard.** Single surface combining Gmail drafts, Attio tasks, LinkedIn drafts, content drafts. Founder needs one inbox, not five.
8. **Calendly-to-Attio Webhook.** Day 0 smoke test asserts this exists; no agent or service is specified.
**Fix:** add these 8 agents to Section 5, write the prompt scaffolds in Appendix A, and update the cron schedule in Section 6.

---

## 2. Important findings (real but not launch-blocking)

Findings flagged by a single seat or shared but lower urgency.

### 2.1 The cold email needs proof, not just a Loom
**Seat:** Sales, Clinician.
**Fix:** test the Sales seat's recommendation: replace cold Email 1 with a "sample discovery package" first-touch. Subject: "Sample discovery package for forensic evaluators in Colorado." Body: 3 sentences, links a sanitized real export, asks for nothing. The artifact qualifies; anyone who replies has self-selected. Add named methodologies (MMPI-3 F-r, TOMM, MacCAT-CA, HCR-20, Static-99R) to Email 1 or to the Loom landing page. Add one named clinical advisor or ABFP affiliation to the team page before Wave 1.

### 2.2 Four agents that produce customer-facing copy lack a STYLE_GUIDE.md reference
**Seat:** Voice (missing anchors).
**Affected agents:** LinkedIn Engagement (Agent 9), Webinar (Agent 10), Case Study/PR (Agent 12), Wave Builder (Agent 3).
**Fix:** add STYLE_GUIDE.md and the Section 1 non-negotiables to the Inputs field of each of these agent specs. Add prompt scaffolds for these agents to Appendix A.

### 2.3 Section 10.1 banned-terms scanner cannot catch the biggest drift pattern
**Seat:** Voice.
**What's wrong:** the scanner catches em dashes, curly quotes, marketing vocab, and "AI" as subject. It does not catch third-person "the clinician" in marketing copy or missing second-person "you/your" in outbound. This is the dominant drift in the current document.
**Fix:** add a second-person presence check ("each outbound paragraph must contain at least one second-person pronoun") and a third-person prohibition check ("`the clinician` is prohibited in cold email, webinar, and LinkedIn copy") to the automatic check list.

### 2.4 SEC Rule 506 risk in founder's public posting cadence
**Seat:** Compliance (important #6).
**What's wrong:** the LinkedIn cadence (3 founder posts/week, podcast tour, blog post 5 "6-week public update conditional on metrics") could be deemed general solicitation under SEC Rule 506(b). If the company plans to raise under 506(b), public posting of MRR or projections blows the exemption.
**Fix:** decide between 506(b) (no public financials) and 506(c) (general solicitation allowed, all purchasers must be verified accredited). Add a no-public-financials rule to STYLE_GUIDE until the founder makes that decision with counsel. Hold the "6-week public update" until after the call.

### 2.5 Cron expressions in agents.yaml are invalid
**Seat:** Operations.
**What's wrong:** `*/90 8-19 * * 1-5` is invalid (cron minute max is 59). `0 10 * * 1/14` is not valid cron. These were copy-pasted from the plan.
**Fix:** the orchestrator runs custom intervals via the scheduled-tasks MCP or a wrapper; rewrite to valid cron or to descriptive triggers with the orchestrator handling the scheduling.

### 2.6 The discovery-package thesis is unvalidated
**Seat:** Skeptic, Sales.
**What's wrong:** no customer discovery interviews are referenced. The whole plan rests on the founder's hypothesis that the discovery package is what clinicians actually want. The plan is 12,000 words of execution built on zero validated buyer conversation.
**Fix:** before Wave 1, run 20 to 30 customer discovery interviews with Segment A psychologists. Ask: "When you have a Rule 702 challenge, what record do you wish you had?" "Walk me through your last evaluation, hour by hour, where does the time go?" Target: 3 to 5 letters of intent before public push.

### 2.7 Webinar attendance numbers are unrealistic for a cold list
**Seat:** Sales, Skeptic.
**Fix:** target 15 to 40 registrants, 5 to 12 live attendees for Webinar #1. Treat the first webinar as a proof event, not a pipeline event. Move the bigger volume target to Webinar #2 after the blog and LinkedIn engagement have built name recognition.

### 2.8 No founder-OOO mode
**Seats:** Operations, Skeptic.
**Fix:** specify a `founder_ooo` field in `/ops/config/agents.yaml` that auto-pauses Send Agent, sets Calendly to a stub, and queues drafts without sending escalations. Founder will need this within the first 8 weeks.

### 2.9 Three Apify/LinkedIn data sources risk ToS violations
**Seat:** Compliance, Operations.
**Fix:** confirm DORA dataset license terms. Replace any LinkedIn scraping in the Personalization Agent with Sales Navigator (already budgeted in Section 9.2). Apify-based crawling stays only for court rosters and university faculty pages where ToS permits.

### 2.10 Section 4 references a contractor that may not exist
**Seat:** Skeptic.
**What's wrong:** Section 10.3 says "by month 3 we hire a 10-hour/week contractor (existing CO forensic psychologist if possible) to spot-check 10%." A credentialed CO forensic psychologist moonlighting at $X/hour does not exist at scale, and if they did they would be a competitor.
**Fix:** scope this as either (a) a paid clinical advisor on a quarterly retainer (more honest about the rate), or (b) cut the role and rely on the founder + the voice scanner.

---

## 3. Where the seats disagreed

Three open tensions for the founder to resolve.

### 3.1 Solo BAA stance
- **Plan's position:** Non-negotiable #5. Solo out of BAA scope.
- **Clinician seat:** This is a hard stop for the forensic audience. Bundle BAA into Solo at $799-$899.
- **Compliance seat:** Maintain the carve-out but make the disclosure conspicuous at checkout.
- **Resolution required:** decide before Wave 1. See section 1.4 for the three options.

### 3.2 Cold email length and structure
- **Sales seat:** Replace Email 1 with a 3-sentence sample-discovery-package first-touch. The artifact qualifies. No pitch.
- **Voice seat:** Email 1 is broadly on-voice (after the second-person fix). Keep the structure.
- **Clinician seat:** Email 1 earns three seconds of attention but does not reply-trigger. Email 2's Loom is what converts.
- **Resolution required:** A/B test. Run two flights of Wave 1 (50 sends each), one with the current Email 1 (post second-person fix), one with the artifact-first Email 1. Measure reply rate and demo-booking rate. The audience answers.

### 3.3 Approval gate aggressiveness
- **Operations seat:** Trust founder-approved templates for Email 2 and Email 3 follow-ups; founder approves the first send and the sequence runs.
- **Compliance seat:** Founder must approve each send for CAN-SPAM purposes (the sender personally authorized the communication).
- **Voice seat:** Per-send approval is the only way to catch drift.
- **Resolution:** the founder should approve every individual cold Email 1. Email 2 and Email 3 in the sequence should auto-send if the prospect did not reply and was not opted out, with the founder reviewing a daily digest rather than per-send approval. CAN-SPAM is satisfied by the original consent to launch the sequence; voice drift in Email 2/3 is contained because the templates are static.

---

## 4. Numbers reset (Phase 1 realistic targets)

The plan v2.0 had targets that no seat believed. The realistic envelope:

| Metric | Plan v2.0 target | Realistic floor | Realistic ceiling |
|---|---|---|---|
| Cold email reply rate Wave 1 | 8 to 15% | 2% | 4% |
| Cold email reply rate Wave 4 | 8 to 15% | 5% | 9% |
| Demo booking rate (replies to demos) | 30 to 50% | 25% | 40% |
| Trial start rate (demos to trials) | 50 to 70% | 40% | 60% |
| Trial-to-paid Solo | 25 to 40% | 15% | 25% |
| Trial-to-paid Practice | 15 to 30% | 10% | 20% |
| Webinar reg rate (invited to registered) | 8 to 15% | 4% | 8% |
| Webinar attendance (registered to attended) | 35 to 45% | 20% | 30% |
| Founder marketing hours/week sustainable | 26 to 35 | 12 | 22 |
| Phase 1 Week 6 cumulative paid | 18 to 30 | 6 | 15 |

The plan can still hit a meaningful Week 6 number. It cannot hit 18 to 30. Rewriting Section 11.1 and Section 4 to the realistic envelope makes the rest of the plan honest.

---

## 5. Items deferred to real legal review

The Compliance seat is not a lawyer. These items need a real attorney before launch (see also `LEGAL_REVIEW_REQUEST` recommended in the prior chat session):

1. State-by-state authorized-practice and software-marketing analysis for psychology boards in each Phase 2 expansion state (NM, WY, UT, AZ, then CA, NY, FL, TX). Whether marketing a "diagnostic assistant" or "diagnostic gate" component to licensed psychologists triggers registration, advertising approval, or board notice requirements.
2. CAN-SPAM template review of the corrected Appendix E templates (with unsubscribe and full postal address).
3. FTC Endorsement Guides compliance: referrer disclosure clause, case-study consent form, public-mention disclosure language.
4. Securities counsel opinion on 506(b) vs 506(c), and on the founder's public posting cadence (LinkedIn, podcasts, blog).
5. Substantiation memo for "Daubert-ready," "discovery package," "defensible record," "court-grade on discovery," "Architecturally, we cannot retain PHI we never receive." Including the underlying technical and clinical evidence.
6. HIPAA BAA template review (the policy promises a BAA based on the HHS sample; confirm form is signed off before any Practice customer activates).
7. LinkedIn/Apify scraping and DORA/NPI data-use terms versus state computer-misuse statutes.
8. Foundry SMB LLC Colorado business filings, registered agent, and foreign-entity registrations for Phase 2 expansion states.

---

## 6. Expansion roadmap (Expansionist seat's standalone output)

The Expansionist seat operated at a different layer than the rest. The other seats critiqued execution within the current vertical; the Expansionist sees a platform play hidden inside a single-vertical SaaS launch. This is constructive input for the founder's strategic thinking but is not gating Phase 1.

### 6.1 What the current plan misses strategically

1. **No international view** despite UK/AU/CA being near-direct fits and the policies page already including GDPR/UK GDPR DPA language.
2. **Adjacent psychology subspecialties folded into "clinical"** instead of treated as distinct ICPs (neuropsychology, custody evaluators, pain psychology, school IEEs, SUD assessors).
3. **No partnership channel strategy.** Defense law firms, IME network operators (ExamWorks, MES, Dane Street), TPAs, court ODR programs are missing from the channel map.
4. **No platform-isation hypothesis.** The product builds a network-effect-shaped dataset that the plan does not exploit.
5. **No B2B2C wedge.** Examinees themselves and their counsel can be a free distribution channel.
6. **No academic / training-clinic vector.** University programs seed lifetime habits in young clinicians.

### 6.2 Adjacent products on the same engine
Standalone Psygil Discovery (expert-witness package builder for non-psychology experts, ~$200M TAM), Records-Review API sold to legal-tech (~$300M+), Audit-trail-as-a-Service for clinical research (~$400M+), Telehealth defensibility layer (~$150M), Peer-review marketplace, Signed-EHR for high-liability specialties (~$300M+), CE/certification platform, Open spec for the discovery package format.

### 6.3 Adjacent verticals (same problem shape, different profession)
Forensic psychiatrists (~$60M TAM), forensic nurses (~$40M), vocational evaluators (~$25M), IMEs across medical specialties (~$120M), forensic SLPs (~$30M), accident reconstructionists (~$40M), forensic accountants (~$80M), SUD evaluators (~$25M), CPS investigators (~$30M government), disability examiners (~$100M+).

### 6.4 Adjacent buyer types
Defense law firms, IME network operators, insurance carriers, government (VA/SSA/courts), universities, large group practice administrators, expert witness referral networks.

### 6.5 International
UK (highest fit, CPR Part 35 maps directly), Australia, Canada, Ireland, NZ, Singapore.

### 6.6 5-year sequencing
- **Year 1:** Execute Colorado-then-national forensic plan. Add only academic/training-clinic site licenses as the single expansion vector.
- **Year 2:** Psygil Discovery standalone + forensic psychiatry vertical. UK pilot. First IME network partnership conversation.
- **Year 3:** Records-Review API to legal-tech. Forensic nurses + vocational evaluators as full verticals. Australia pilot. Anonymized benchmarks (free platform-seeding product).
- **Year 4:** Telehealth defensibility layer (different brand, same engine). Expert-witness marketplace. Federal pilot (VA or SSA). Canada launch.
- **Year 5:** Clinical-research audit-trail SaaS. Insurer-funded BAA marketplace. Consider holding-company restructure: Foundry SMB as parent, Psygil as the clinical brand, separate brands for legal-tech and research.
- **Park indefinitely:** consumer B2C portal, accident reconstruction / forensic engineering (too far from psychology DNA), China/EU mainland (regulatory cost too high).

---

## 7. Recommended action sequence

The first three weeks of fixes, ordered.

**Week 0 (this week):**
1. Fix Appendix E CAN-SPAM compliance (unsubscribe mechanism, full physical address, sender ID block in every send).
2. Rewrite Email 1 in second person.
3. Resolve the Solo BAA stance.
4. Replace "Daubert-ready" copy everywhere with the Rule 702 framing.
5. Reset Section 11.1 to realistic targets.
6. Reset Section 4 Phase 0 to a 2-week pre-launch window.

**Week 1:**
7. Draft prompt scaffolds for Agents 3, 9, 10, 12.
8. Add second-person and third-person checks to Section 10.1 banned-terms scanner.
9. Begin 20 to 30 customer discovery interviews with Segment A psychologists.
10. Send Compliance review request to legal counsel (template in prior session output).

**Week 2:**
11. Add the 8 missing infrastructure agents to Section 5.
12. Resolve the 506(b)/(c) question with securities counsel.
13. Fix invalid cron expressions in agents.yaml.
14. Begin negotiating BAA with a Resend, Workspace, and Cloudflare under the corrected stance.

**Week 3 (Wave 1 launch):**
15. With templates fixed and targets reset, launch Wave 1 at 15 emails/day for 5 business days.
16. Watch the data. Approve agents 7 to 12 for incremental Phase 1 add in Weeks 2 to 4.

The kindest thing the Skeptic seat had to say is worth keeping: "the operational hygiene encoded in this plan will keep the founder from torching the domain, the brand, or a license. That alone is worth more than the rest of the plan combined." The fixes above turn the rest of the plan from beautifully-formatted ambition into a realistic launch.

End of council review v1.0.
