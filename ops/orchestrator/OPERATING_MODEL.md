# Operating model: one front door, one Psygil desk, one working session

Status: proposed, awaiting founder decision. Drafted 2026-06-18 by the Orchestrator in response to the founder's request to (1) run an interactive morning session that walks each TODO and builds the outcome together, (2) stage human-gated steps as ready drafts, and (3) decide whether the Orchestrator and the Chief of Staff should be one agent or a set of agents.

---

## 1. What is running today

Three scheduled agents, discovered 2026-06-18 via the scheduled-tasks list:

| Agent | When | Scope | Writes to | Output |
|---|---|---|---|---|
| chief-of-staff-standup | 07:02 daily | Whole life and business ("second me"). Coach AI, SAM.gov, the execution plan, Psygil as one project among several. | Desktop/FUTURE vault (BRAIN.md, BACKLOG.md, Operations/) | One morning brief, drafts staged in Operations/Outbox/ |
| psygil-morning-orchestrator | 08:03 weekdays | Psygil only, in depth. Finance ledger, runway, the 20-agent marketing fleet, the decision queue, the council. | psygil-website repo (ops/orchestrator/) | A briefing, an interactive TODO widget, a notification |
| checkpoint-sweep | hourly 09:00-19:00 | Detect finished work blocks and commit them. | Desktop/FUTURE vault | Commits, session log lines |

## 2. The overlap

The Chief of Staff and the Orchestrator do the same shape of work, one hour apart:

- Both run a morning survey and produce a morning brief.
- Both triage every item into "the agent can finish this unattended" versus "this needs the founder's hands."
- Both stage human-gated items as ready-to-send drafts (the CoS in Operations/Outbox/, the Orchestrator in ops/orchestrator/drafts/).
- Both surface "decisions waiting on you, with a recommendation."
- Both keep a rolling state file (BACKLOG.md, todos.md) and roll it forward each run.

Two briefs land before 8am. For a one-person company that is one brief too many, and the Psygil items risk being described twice, slightly differently.

## 3. The difference worth keeping

The two are not duplicates in scope. The Chief of Staff is broad and shallow by design: it holds the whole life and refuses to drown in any one project. The Orchestrator is narrow and deep: it carries Psygil machinery the CoS should never have to (the finance ledger, the runway math, a 20-agent marketing fleet, a versioned decision queue, the council). Collapsing the Orchestrator's depth into the CoS would bloat the "second me" with Psygil plumbing. Deleting the Orchestrator would lose that depth.

So the answer to "should we be one agent" is: not one blob, and not two competing briefs. One front door, with a Psygil desk behind it.

## 4. Recommendation: a two-layer set of agents

**The Chief of Staff is the front door.** It owns the single morning brief and the single "I need YOU today" list across everything. It is the one place the founder looks first.

**The Orchestrator becomes the Psygil desk, a specialist the front door delegates to.** It keeps all its depth, but it stops firing a second competing 8am brief. Instead it does two things:

1. Feeds one Psygil section up into the Chief of Staff brief (decisions, the day's Psygil priority, finance pulse in one line). The CoS brief stays the front door; the Orchestrator supplies the Psygil paragraph rather than a rival page.
2. Runs the interactive working session on demand, when the founder sits down to work Psygil. This is the new mode in Section 5. It is not a scheduled brief; it is a co-working block the founder starts.

**checkpoint-sweep stays as shared plumbing**, with one extension worth making: it currently commits only the Desktop/FUTURE vault. It should also checkpoint the psygil-website repo so the Orchestrator's drafts, briefings, and state changes get committed and logged the same way the rest of the work does.

The net change: two morning briefs become one. The Orchestrator's depth is preserved and pointed at the interactive session, which is where the founder actually wants the agent leading.

## 5. The interactive morning working session (the new mode)

This is the thing the founder asked for: each morning, walk through each open item and build the outcome together, with the agent leading because the agent is the one with the whole board in working memory. Today's session (T-0002, T-0011, T-0008, T-0004) is the worked example of the pattern below.

**How it starts.** The morning brief ends with an offer: "Start the working session." The founder opens the session when they have the bandwidth. The session is interactive by nature; it needs the founder present for the judgment calls and the human-gated clicks.

**The loop, per item:**

1. State the item in one breath: what it is, why it matters now, current status, what blocks it.
2. Lead with a recommendation, not a menu. The agent proposes the path and says why. Options come second, for when the founder wants to overrule.
3. Build the outcome in the session. Produce the actual artifact: the drafted email, the copy block, the checklist, the config change. Not a description of the artifact, the artifact.
4. Stage every human-gated step to the edge. Anything that needs a click the agent cannot make (send an email, sign, pay, publish, commit the founder to a person) gets prepped fully and dropped in the drafts folder, ready to send. The founder's only remaining action is the click.
5. Document the step and the outcome. Write it to the session log, update todos.md, and queue the checkpoint.
6. Advance to the next item, or stop when the founder's bandwidth is spent. Unfinished items roll forward to tomorrow's session.

**What gets documented, every session:**

- A session log at ops/orchestrator/sessions/[YYYY-MM-DD].md: each item, the recommendation given, the outcome built, and the path to any staged artifact.
- todos.md updated in place: completed items moved to the Done log, new items appended, ages rolled.
- Staged artifacts in the drafts folder, each named by date and subject, each with a short "how to send" header (verified address, what to attach, what to do).

**What "human action required" looks like in practice.** The founder said it directly with the legal emails: when a step needs a human, the agent sets up everything and leaves it ready. Today that meant three verified firms, three tailored drafts, and a notes block, all sitting in ops/orchestrator/drafts/ip-business-counsel-outreach-2026-06-18.md, with nothing left but the founder pasting and sending. That is the standard for every human-gated step from here on.

## 6. How the two agents combine

To stop the two agents from keeping separate, drifting lists:

- **One outbox convention.** Psygil drafts live in ops/orchestrator/drafts/. The Chief of Staff's Operations/Outbox/ links to them rather than copying them, so a staged email exists in exactly one place.
- **One backlog source of truth per domain.** todos.md is the source of truth for Psygil. The CoS BACKLOG.md references the Psygil items by ID (T-0002, etc.) rather than re-describing them, so a status only changes in one file.
- **One brief.** The CoS brief is the front door. The Orchestrator supplies the Psygil section to it and does not publish a rival brief.
- **One checkpoint pipeline.** checkpoint-sweep commits both vaults.

## 7. What changes if approved

1. Retire the Orchestrator's standalone 8am briefing as a separate artifact; convert it to a Psygil section handed to the CoS brief, plus the on-demand working session.
2. Update ORCHESTRATOR.md Section 4 (what it produces) and Section 2 (when it runs) to match: the deep state work and the interactive session stay, the rival brief goes.
3. Extend checkpoint-sweep to commit the psygil-website repo.
4. Point the CoS BACKLOG.md and Outbox at the Psygil todos.md and drafts folder rather than duplicating them.
5. Add ops/orchestrator/sessions/ as the home for session logs.

None of this deletes an agent or changes MARKETING_PLAN.md. It removes one redundant brief and formalizes the working session.

## 8. The decision

The open choice is the shape of the consolidation. The recommendation is the two-layer set in Section 4. The alternatives are a full merge into one agent with a Psygil module (simpler, but the "second me" inherits Psygil's plumbing), or keeping both agents and both briefs but de-conflicting their scope (least change, keeps the redundancy). The founder picks; the Orchestrator implements.
