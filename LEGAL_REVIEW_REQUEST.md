# Legal Review Request

Standalone brief for outside counsel. Self-contained, ready to attach to an outreach email.

Prepared by: Robert Irwin, Founder, Foundry SMB LLC
Subject company: Foundry SMB LLC (Colorado), product: Psygil
Date: 2026-05-14
Target counsel type: healthcare technology privacy and marketing specialist; secondary engagement for trademark and IP

---

## 1. Background

Foundry SMB LLC is a Colorado LLC operating Psygil, a forensic-grade IDE for psychological evaluations sold to licensed clinicians. The product is local-first, with a clinician-controlled diagnostic workflow and a "discovery package" export the evaluator can produce on demand for cross-examination, payer audit, or regulatory review.

The company is approximately two weeks from launching an outbound marketing program targeting forensic and assessment-heavy psychologists in Colorado, with national expansion planned over the following eight months. The marketing program includes cold outreach, a webinar series, content marketing, a referral program with customer credits, and case studies featuring named clinicians. The current plan is documented in `MARKETING_PLAN.md` (v2.1) and `COUNCIL_REVIEW.md`, both attached.

Two weeks of pre-launch work begins now (May 14, 2026). Wave 1 of cold outreach is targeted for the week of May 26, 2026, contingent on legal review of the items below.

## 2. Documents attached

1. `MARKETING_PLAN.md` — 16,800-word operating plan. Sections of greatest relevance to this review: Section 1 (non-negotiables), Section 1.5 (Solo BAA stance, see locked decision below), Section 10 (voice and approval gates), Appendix E (email templates).
2. `EMAIL_SETUP.md` — Cloudflare and Google Workspace email infrastructure, including the CAN-SPAM compliance posture and the planned outbound domain strategy.
3. `STYLE_GUIDE.md` — voice and terminology rules for all customer-facing copy.
4. `policies.html` — current public Privacy, Terms, Acceptable Use, Refund, Support SLA, Security, HIPAA policies. Live at `https://psygil.com/policies`.
5. `COUNCIL_REVIEW.md` — internal multi-perspective review of the marketing plan with the legal-risk areas already triaged by the Compliance seat (non-attorney; this section flags risks for your real review).

I can also share separately:
- Internal 5-year revenue projections (PDF available on request; treat as confidential).
- The product's HIPAA architectural notes.
- Sample cold email templates with the corrected CAN-SPAM footer.

## 3. Locked stance to review

The company has decided (effective 2026-05-14) that the Solo subscription tier is positioned explicitly as "non-PHI workflow only" — consult and expert-review work where records arrive under discovery order and are not stored. A hard checkbox at checkout will require the customer to acknowledge this constraint. The Practice and Enterprise tiers offer a BAA on request.

Please pressure-test this positioning. Specifically: is "non-PHI workflow only" a sustainable representation given that a Solo customer may, on their own initiative, attempt to upload PHI to the platform? What disclosure and contractual language strengthens it? Is the checkbox at checkout sufficient or is additional in-product enforcement required?

## 4. Specific questions

### Priority 1 (needed before first cold send, target May 26, 2026)

1. **CAN-SPAM compliance.** Do the corrected cold outreach templates in `MARKETING_PLAN.md` Appendix E satisfy 15 USC 7704 for B2B prospecting to publicly available business contacts in Colorado and the first expansion states (New Mexico, Wyoming, Utah, Arizona)? Specifically: is the shared footer block (working unsubscribe via web form and reply, Foundry SMB LLC street address, sender identification) sufficient? Any state-specific cold email rules to address, particularly California's broader anti-spam interpretations?

2. **HIPAA and BAA representation.** With Solo positioned as non-PHI only, is the policy language in `policies.html#hipaa` airtight? Does the new Solo-checkout disclosure adequately protect against a customer's misuse later being attributed to misrepresentation? Are there FTC or HHS enforcement angles to harden against?

3. **State psychology board exposure.** The product includes a software component named "diagnostic assistant" that "maps evidence to DSM-5-TR criteria." The marketing copy is explicit that the clinician renders every diagnosis. Any concerns with state psychology boards in Colorado (Phase 1) and California, New York, Florida, Texas (Phase 2 expansion) regarding marketing, software naming, or implied scope of practice?

### Priority 2 (needed before first case study publishes, ~6 weeks out)

4. **FTC endorsement and case studies.** The referral program offers a $200 credit per referred trial and a free month per referred conversion. The case study program will feature named clinicians at the rate of approximately one per quarter. What FTC Endorsement Guides (16 CFR Part 255) disclosure language is required in each case study? In each public LinkedIn post by a referrer? In each blog post or webinar appearance by a featured clinician? Draft language preferred.

5. **Case study consent.** Please review and improve a template case-study consent form covering (a) named or pseudonymous use, (b) ad reuse rights, (c) revocation procedure, (d) PHI-screening warranty by the clinician, (e) referral-credit disclosure if applicable.

### Priority 3 (no urgent deadline)

6. **Securities and investor communications.** The 5-year revenue projection may be shown to advisors and potential investors. If the company plans to raise under SEC Rule 506(b), what disclaimers and accredited-investor representations need to accompany the projection? Is anything in the marketing plan or the founder's planned public posting cadence (LinkedIn three times per week, podcast tour, blog post on 6-week metrics) inadvertently a "general solicitation" under 506(b)? Should the company operate under 506(c) instead given the marketing cadence?

7. **Substantiation memo.** Please advise on the substantiation needed for the following claims, currently appearing in `MARKETING_PLAN.md` and the public site: "discovery package," "defensible record," "Architecturally, we cannot retain PHI we never receive," "Rule 702-defensible," and the broader implied claim that Psygil's output survives cross-examination. What testing, documentation, or third-party validation is required to support each?

8. **Trademark clearance and filing.** Is "Psygil" clearable in the psychology software class (Nice classification 9 software and possibly 42 SaaS)? Worth filing? Estimated cost and timeline?

9. **IP assignment cleanup.** Confirm assignment language between Robert Irwin individually and Foundry SMB LLC for: the product source code, the website code, all marketing materials, the trademark application if filed. Any cleanup needed before due diligence?

10. **Foreign-entity registrations.** Foundry SMB LLC is a Colorado LLC. Phase 2 marketing reaches NM, WY, UT, AZ and then national. At what point do we need foreign-entity registrations or sales-tax registrations in each state?

## 5. Engagement preferences

**Deliverable:** a written memo or annotated PDF addressing items 1 through 10.

**Timeline:**
- Priority 1 items: by May 25, 2026 (one day before Wave 1 launch target).
- Priority 2 items: within four weeks of engagement start.
- Priority 3 items: within eight weeks of engagement start.

**Fee structure:** fixed fee preferred. If hourly, please provide an estimate and a not-to-exceed cap.

**Format:** I am comfortable receiving the memo as PDF or markdown. Tracked-change suggestions on the Appendix E templates and on `policies.html` content (provided as a text file or as the live URL) are welcome.

**Privilege:** by responding to this email and accepting the engagement, you confirm the customary attorney-client privilege applies to subsequent communications. An engagement letter is welcome before substantive work begins.

## 6. Context on the founder

This is a one-person company at present (Robert Irwin, founder). I am not a lawyer. I am asking you to identify and harden the items above before they ship to clinicians. I welcome being told that an item is fine as-is, but I would rather you call out the smaller risks than have me discover them at scale.

I am comfortable on a 30-minute introductory call to align on scope and fee before you begin. I prefer to start with Priority 1 only and authorize Priority 2 and 3 as the relationship develops.

---

Robert Irwin
Founder, Foundry SMB LLC
robert@psygil.com (once Workspace is live), truckirwin@gmail.com (current; this Gmail account predates the name change)
Colorado (street address on file with the Colorado Secretary of State)

End of request.
