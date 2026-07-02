# Pending Decisions

Decisions awaiting founder response. Sorted by age (oldest first), then by blocking impact.

When a decision is resolved, the orchestrator moves it to `/ops/orchestrator/decision_log/[DATE].md` and dispatches the corresponding work.

Format:

```
## D-NNNN: [Title]
**Pending since:** [DATE]
**Blocks:** [What is paused.]
**Options:**
  A) [Option] [Trade-off]
  B) [Option] [Trade-off]
  C) [Option] [Trade-off]
**Recommended:** [Letter, one-sentence why.]
**Status:** open / awaiting-response / closed
```

---

## D-0008: Why is T-0002 still unsent

**Pending since:** 2026-05-22
**Blocks:** Phase 0 first gate (counsel scoping). T-0004, T-0012, and the timing of T-0005 are downstream.
**Options:**
  A) Calendar issue. The draft is fine. The founder calendars a 15-minute send slot today. No content changes.
  B) Draft issue. The cover or brief needs a revision before send. The founder marks the concern. Orchestrator returns a revised draft today.
  C) Firm-choice issue. Hall Render is no longer preferred. Orchestrator returns one alternative (Holland and Hart or Davis Wright Tremaine) for re-decision today.
  D) Other. The founder names the actual blocker. Orchestrator adapts.
**Recommended:** A. The draft was approved Tuesday, the firm was confirmed Tuesday, and nothing in the brief has been flagged for revision in three days. Calendar friction is the most likely cause and the only fix that does not introduce new work.
**Status:** open

---

## D-0009: Should Phase 0 sequencing be paused and re-baselined

**Pending since:** 2026-05-28
**Blocks:** Nothing immediately. Surfaces the question of whether to keep carrying the T-0002 stall in daily briefings or formally pause the Phase 0 schedule until the counsel intake gate is closed.
**Options:**
  A) Hold the current plan. Keep surfacing D-0008 daily. Wave 1 timing slips quietly as T-0002 stays in flight. No baseline change. Trade-off: the briefing keeps reporting the same stall; calendar drift is absorbed into the schedule informally.
  B) Pause Phase 0 launch sequencing. Mark Phase 0 as on-hold in MARKETING_PLAN.md and agent_status, freeze the Wave 1 timing references, and reset the Phase 0 calendar from the date T-0002 actually goes out. Trade-off: explicit, defensible, and stops the founder from feeling behind on a schedule that no longer matches reality; costs an explicit plan annotation.
  C) Re-baseline and drop one Phase 0 gate. Pause as in B, and additionally cut one gate from the Appendix F checklist that no longer earns its place at the volume Wave 1 is now sized for (20 contacts, not 60-100). Trade-off: smallest plan; some compounding rework if the dropped gate matters later.
  D) Other. The founder names a different framing.
**Recommended:** B. The stall is now a fact, not an event. An on-hold annotation costs a few lines in `MARKETING_PLAN.md` and stops the briefing from reading the same stall every morning. Re-baselining from the actual send date is more honest than carrying the original Phase 0 calendar.
**Status:** open

---

## D-0010: What to do with T-0011 now that the original window has closed

**Pending since:** 2026-05-29
**Blocks:** T-0005 (interview execution) and the weekly synthesis schedule. Phase 0 cannot move on the discovery gate without these.
**Options:**
  A) EXPIRED 2026-06-05. Extend the window to June 5 was the final-day path and no decision was taken; this option is no longer available.
  B) Re-scope to a 5-interview first batch (3 forensic, 2 assessment). The original June 12 target window arrived 2026-06-12 with 0 booked, so this option now requires a restated window (week of June 15 suggested). Trade-off: smaller commitment, signals an honest reset, defers the synthesis pass by a week.
  C) Pause T-0011 in lockstep with D-0009 Option B or C and reschedule from the Phase 0 re-baseline date. Trade-off: cleanest if Phase 0 is paused; ties two decisions together.
  D) Other.
**Recommended:** With Option A expired, the live choice is B or C. B if D-0009 lands on Option A (hold the plan). C if D-0009 lands on Option B or C. The recommendation is contingent because T-0011 should not run on a calendar that disagrees with the rest of Phase 0.
**Status:** open

---

## D-0011: Formally close T-0002 as superseded and re-initiate counsel outreach

**Pending since:** 2026-06-01
**Blocks:** Nothing new. Reframes the T-0002 stall. The cover draft at `/ops/orchestrator/drafts/legal-counsel-cover-2026-05-19.md` is now 9 business days old (drafted Tuesday May 19). D-0008 has surfaced for 6 business days with no movement. This decision asks whether the original send is still the right unit of work or whether to reset.
**Options:**
  A) Keep T-0002 alive. The draft is still good. The only fix is a 15-minute send slot (this is D-0008 Option A). Trade-off: nothing changes; the stall continues if no slot opens.
  B) Close T-0002 as superseded and re-initiate. The orchestrator returns a fresh, shorter cover draft today (tighter ask, same firm) and resets the counsel intake task. Trade-off: discards a 9-business-day-old draft that may have aged in the founder's mind; costs one fresh draft.
  C) Close T-0002 and pause counsel outreach entirely until Phase 0 is re-baselined (ties to D-0009 Option B/C). Trade-off: cleanest if Phase 0 pauses; removes the daily stall from the briefing; defers legal review.
  D) Other.
**Recommended:** Contingent. A if D-0008 lands on Option A (it really is just calendar friction). B if the draft itself has gone stale in the founder's mind and a fresh, shorter ask would actually go out. C if D-0009 lands on Option B or C. The shared signal across six briefings is that the original unit of work is not moving; this decision names the reset option explicitly so the stall stops being the only story.
**Status:** open

---

## D-0012: Reconcile the Psygil queue against the adopted execution plan (PARENT)

**Pending since:** 2026-06-22
**Blocks:** The usefulness of D-0008, D-0009, D-0010, and D-0011. This is the parent question for all four.
**Context:** The vault execution plan adopted 2026-06-11 replaced the cold-outbound SaaS launch this queue assumes with a forensic-services motion (warm distribution via the wife's community + Canadian rail + AudienceForge phone/LinkedIn; cold email for this list explicitly deprecated; the product reclassed as demo-only). The four open decisions all serve the retired motion, which is why none has moved in over four weeks. Full analysis: `/ops/orchestrator/drafts/RECONCILIATION-psygil-queue-vs-execution-plan-2026-06-22.md`.
**Options:**
  A) Superseded. Retire the cold-outbound SaaS queue. Close D-0008, D-0010, D-0011 as superseded (not failed); pause T-0004, T-0005, T-0011, T-0012 and the twenty marketing agents. Keep finance (T-0009), identity (T-0013), and demo-product items. Fold the only live legal piece into vault gate 0.5 (employment-agreement counsel). Trade-off: an explicit retire; reclasses Psygil as the demo engine the plan already says it is.
  B) Both live. Psygil runs a parallel self-serve SaaS track on purpose. The queue is valid; the real issue is split founder bandwidth. Trade-off: keeps two go-to-markets and the daily stall continues.
  C) Still deciding. Park all four under this single parent and stop surfacing them individually until this resolves. Trade-off: removes the daily noise without committing.
**Recommended:** A. The evidence is one-directional: the plan is named the source of truth, it deprecated cold email for this exact list, it moved the first legal gate to the employment agreement, and it made discovery warm. The founder voted with the June 11 pivot; the state files never got the memo.
**Status:** open (9 business days; surfaced 2026-06-22, carried to 2026-06-23/24/25/26, weekend-skipped 06-27/28, carried to 2026-06-29/30/07-01/07-02 with no ruling)

---

*Earlier decisions: D-0001 through D-0005 closed on 2026-05-14 (see `/ops/orchestrator/decision_log/2026-05-14.md`). D-0006 closed on 2026-05-19 (see `/ops/orchestrator/decision_log/2026-05-19.md`). D-0007 (counsel scoping proposal received) remains contingent on T-0002 going out.*
