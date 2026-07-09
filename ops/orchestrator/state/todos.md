# TODOs

Current TODO list. Rolled forward by the orchestrator each morning. Items are removed only when:
1. Completed (move to `/ops/orchestrator/decision_log/[DATE].md` as a "done" entry), or
2. Explicitly killed by the founder, or
3. Superseded by a different item.

Format:

```
## T-NNNN: [Title]
**Priority:** today-blocking | this-week-blocking | strategic | background
**Added:** [DATE]
**Estimated time:** S (< 30 min) | M (30-90 min) | L (> 90 min)
**Blocked by:** [decision or dependency, if any]
**Acceptance:** [What "done" looks like.]
```

---

## T-0002: Send legal counsel intake email

**Priority:** today-blocking
**Added:** 2026-05-14
**Estimated time:** S (15 min: copy draft to Gmail, attach brief plus supporting docs, paste intake address, send)
**Status:** in-flight-awaiting-send 29 business days (per D-0006 on 2026-05-19; counsel selected, cover email drafted). D-0008 surfaced 2026-05-22 to diagnose the stall. D-0011 surfaced 2026-06-01 to decide whether to close this as superseded and re-initiate with a fresh draft, since the cover draft is now 22 business days old. Note: the Monday June 8, Wednesday June 10, and Thursday June 11 orchestrator runs were all missed (no briefings on disk). The Friday June 12, Monday June 15, Tuesday June 16, Wednesday June 17, and Thursday June 18 runs all fired, five clean runs in a row, so the stall is once again being tracked daily and the scheduler is accepted as healthy (T-0015 closed 2026-06-16). Note 2026-06-18: today is the week's last working day before the Juneteenth skip Friday June 19; normal resume Monday June 22. Note 2026-06-22: now 22 business days in-flight, cover draft 23 business days old. Parent decision D-0012 surfaced today asks whether this whole counsel-intake unit is superseded by the June 11 execution-plan pivot (recommended: yes, fold the live legal piece into vault gate 0.5). If D-0012 lands on Option A, this task closes as superseded, not failed. Note 2026-06-23: 23 business days in-flight, cover draft 24 business days old. D-0012 carried to its second business day with no ruling; held under the parent rather than re-aged as a separate story. Note 2026-06-24: 24 business days in-flight, cover draft 25 business days old. D-0012 now three business days old with no ruling; still held under the parent. The vault's SAM.gov wall (gate 1.2) hits tomorrow June 25 and the employment-agreement counsel gate (0.5, where Option A routes this legal piece) is overdue seven days. Note 2026-06-25: 25 business days in-flight, cover draft 26 business days old. D-0012 now four business days old with no ruling; still held under the parent. The vault's SAM.gov wall (gate 1.2) hits its hard stop today June 25 and the employment-agreement counsel gate (0.5, where Option A routes this legal piece) is overdue eight days. Note 2026-06-26: 26 business days in-flight, cover draft 27 business days old. D-0012 now five business days old with no ruling; still held under the parent. The SAM.gov wall (gate 1.2) passed yesterday with no recorded submit; gate 0.5 (where Option A routes this legal piece) is now overdue nine days. Note 2026-06-29 (Mon, deep module resumes after weekend skip): 27 business days in-flight, cover draft 28 business days old. D-0012 now six business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 4 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 12 days. Note 2026-06-30 (Tue): 28 business days in-flight, cover draft 29 business days old. D-0012 now seven business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 5 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 13 days. Note 2026-07-01 (Wed): 29 business days in-flight, cover draft 30 business days old. D-0012 now eight business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 6 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 14 days. Note 2026-07-02 (Thu): 30 business days in-flight, cover draft 31 business days old. D-0012 now nine business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 7 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 15 days. Note 2026-07-06 (Mon, first business day after the Jul 3 observed holiday + weekend): 31 business days in-flight, cover draft 32 business days old. D-0012 now ten business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 11 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 19 days; vault CPA hard date Friday Jul 10. Note 2026-07-07 (Tue): 32 business days in-flight, cover draft 33 business days old. D-0012 now eleven business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 12 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 20 days; vault CPA hard date is Friday Jul 10 (3 days); boreasclinical site deploy due tomorrow Jul 8. Note 2026-07-08 (Wed): 33 business days in-flight, cover draft 34 business days old. D-0012 now twelve business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 13 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 21 days; vault CPA hard date is Friday Jul 10 (2 days); boreasclinical site deploy due TODAY Jul 8, no deploy recorded as of the morning run. Note 2026-07-09 (Thu): 34 business days in-flight, cover draft 35 business days old. D-0012 now thirteen business days old with no ruling; still held under the parent. SAM.gov wall (1.2) 14 days past with no recorded submit; gate 0.5 (where Option A routes this legal piece) overdue 22 days; vault CPA hard date is TOMORROW Friday Jul 10; boreasclinical site deploy missed its Jul 8 due date (newest repo commit still Jun 12) and is now past due; vault Phase 3 opens tomorrow with both feeders gated.
**Blocked by:** D-0012 (parent); then D-0008 answer (A/B/C/D); reset path in D-0011
**Acceptance:** Cover email from `/ops/orchestrator/drafts/legal-counsel-cover-2026-05-19.md` sent to Hall Render Killian Heath & Lyman PC (Denver) with `LEGAL_REVIEW_REQUEST.md` attached. Closes when founder confirms send.

## T-0004: Apply Phase 0 launch checklist (Appendix F)

**Priority:** this-week-blocking
**Added:** 2026-05-14
**Estimated time:** L (~10 working days per revised plan)
**Blocked by:** T-0002 (legal review of templates before Wave 1 send)
**Acceptance:** All items in `MARKETING_PLAN.md` Appendix F checked off.

## T-0005: Customer discovery interviews

**Priority:** this-week-blocking
**Added:** 2026-05-14
**Estimated time:** L (~9 hours founder time over 2 weeks per `/ops/discovery/INTERVIEW_GUIDE.md`)
**Blocked by:** none (D-0002 closed: Option C confirmed)
**Acceptance:** 10 interviews completed (6 forensic, 4 assessment), notes captured at `/ops/discovery/notes/`, two weekly synthesis docs at `/ops/discovery/synthesis/`, three named themes surfaced, three follow-up permissions secured.

## T-0008: Update website Solo tier copy to non-PHI positioning

**Priority:** this-week-blocking
**Added:** 2026-05-14
**Estimated time:** M (45 min)
**Blocked by:** none (D-0001 closed: Option B confirmed)
**Acceptance:** Copy updates to (1) `download.html` Solo card with a "non-PHI workflow only" line and the checkout checkbox requirement; (2) `policies.html#hipaa` to reflect the locked stance; (3) any Solo references on `about.html` or `forensic.html` that imply BAA scope. Build marker (`<!-- build: ... -->` in `index.html`) updated to confirm deploy.

## T-0009: Wire up Stripe MCP to orchestrator finance pulse

**Priority:** strategic
**Added:** 2026-05-14
**Estimated time:** M (30 min: connect Stripe, test that yesterday's payments show up in briefing)
**Blocked by:** none
**Acceptance:** Tomorrow's briefing shows a real Yesterday's income value from Stripe, not a "manual ledger" fallback.

## T-0010: Decide on Practice tier seat structure

**Priority:** strategic
**Added:** 2026-05-14
**Estimated time:** M (45 min, with Clinician seat input)
**Blocked by:** none; better with customer discovery signal
**Acceptance:** A documented decision on whether Practice tier is "3 clinician seats" or "1 lead + 2 support seats (psychometrician/admin/second evaluator)" per Clinician seat finding. Best resolved after the first 5 customer discovery interviews land.

## T-0011: Book 10 customer discovery interviews this week

**Priority:** today-blocking
**Added:** 2026-05-14 (from D-0002 dispatch)
**Estimated time:** M (60 min sourcing + outreach)
**Status:** original window May 15 to May 28 closed 2026-05-28 with 0 of 10 booked. Now blocked by D-0010 (re-scope or pause). Note 2026-06-12: D-0010 Option B's target window (June 12) arrived with 0 booked, so Option B now requires a restated window if chosen. Note 2026-06-15: with Juneteenth closing this week on Thursday, the next clean Option B window is the week of June 22.
**Blocked by:** D-0010
**Acceptance:** Pending D-0010 outcome. Original acceptance was 10 confirmed slots on the discovery Calendly between May 15 and May 28 per `/ops/discovery/INTERVIEW_GUIDE.md` mix (6 forensic, 4 assessment, mostly Colorado, at least one ABFP diplomate and one working CFI or PRE evaluator); to be restated when D-0010 closes.

## T-0012: Shrink first Wave 1 batch from 60-100 to 20

**Priority:** this-week-blocking
**Added:** 2026-05-14 (from D-0002 dispatch)
**Estimated time:** S (5 min: update Wave Builder Agent 3 daily_batches config from 5 to 4 per week, set first-week batch to 20 total)
**Blocked by:** Phase 0 completion
**Acceptance:** `/ops/config/agents.yaml` updated so the first Wave 1 send is 20 contacts spread across May 26-30, not 60-100.

## T-0007: Run a council pass on Marketing Plan v2.1

**Priority:** strategic
**Added:** 2026-05-14
**Estimated time:** L (~20 min to convene, 10 min to dispatch, 90 min for seats to return)
**Blocked by:** none
**Acceptance:** Second council review confirms v2.1 fixes landed cleanly. Optional — recommended after Phase 0 launch checklist is mostly complete but before Wave 1 first send.

## T-0013: Update outbound identity to Robert Irwin

**Priority:** strategic
**Added:** 2026-05-15
**Estimated time:** M (cumulative across sub-steps; each is small)
**Blocked by:** none
**Acceptance:** Outbound mail and customer-facing surfaces show "Robert Irwin" rather than "Truck Irwin." Three sub-steps:

  (a) Gmail display name updated to "Robert Irwin" in Gmail settings. 2 min. Mail from `truckirwin@gmail.com` will then show "Robert Irwin" in the From field.
  (b) Workspace primary user set up as `robert@psygil.com` once Workspace is provisioned per `EMAIL_SETUP.md` Phase B. Mail forwarding from `truckirwin@gmail.com` configured if desired.
  (c) LinkedIn profile, Foundry SMB Colorado Secretary of State filings, Stripe customer-facing display name, and any other public-facing identities updated to "Robert Irwin." Founder pace.

---

## Done log (rolled here when items complete; archived to decision log)

- **T-0001:** Decide on Solo BAA stance — DONE 2026-05-14, Option B selected. See `/ops/orchestrator/decision_log/2026-05-14.md` D-0001.
- **T-0006:** Confirm scheduled orchestrator task is running — DONE 2026-05-14, task `psygil-morning-orchestrator` created and verified, next run Friday May 15 at 08:03 MT.
- **T-0003:** Install council skill at user level — DONE 2026-06-16, confirmed by founder. `ls ~/.claude/skills/council/` returned SKILL.md plus DISPATCH.md, EXAMPLES.md, README.md, SEATS.md, SYNTHESIS.md. The `mv` had already run; repo source folder is gone as expected.
- **T-0015:** Verify the scheduled orchestrator task is healthy — DONE 2026-06-16, founder confirmed healthy. Three clean runs in a row landed (June 12, 15, 16) after three misses (June 8, 10, 11). Root cause of the June misses not formally named; founder accepted the schedule as healthy and closed the item.
- **T-0014:** Confirm and log the cash events — DONE 2026-06-16. Founder confirmed the four items are business (the $309.84 is consulting income from Pulse; the rest are expenses). Logged the consulting income plus five June expenses to finance_ledger.md, started the canonical tax ledger at /ops/finance/TAX_LEDGER_2026.xlsx (categorized, summary totals, zero formula errors), and seeded runway.md with the $602.64 May-end Mercury anchor. June period: $309.84 income, $544.21 expenses (incl. the May software baseline). Two items parked on the ledger "To confirm" sheet: $0.66 Stripe (May 29) and $69.58 PayPal-to-AUS-Merchant (June 6).
