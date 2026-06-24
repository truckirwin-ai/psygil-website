# Customer Discovery Interview Guide

Operating guide for the 10 interviews dispatched per decision D-0002 on 2026-05-14.

## Goal

Two outputs from the 10-interview block:

1. **Three named themes** about what forensic and assessment-heavy psychologists actually want from a tool like Psygil. Themes are surfaced from the interview transcripts, not from the marketing plan's hypotheses.

2. **Three letters of intent** (or strong verbal commitments) from interviewees who would buy at the current price points if the product shipped on the current roadmap. LOIs are not contracts; they are a high-quality signal of fit.

The interviews are not sales calls. The founder is explicitly not pitching. The frame is: "I am building a tool in this space and I want to talk to people doing the work, not to sell anything."

## Target interviewees

10 conversations across two segments:

- 6 forensic-credentialed psychologists (ABFP diplomate, ABPP-Forensic, SOMB approved provider, or court-roster member in any Colorado JD)
- 4 assessment-heavy clinical psychologists (significant testing volume, IME work, neuropsych focus, or psychological evaluation report output)

Distribution should hit:
- Colorado Front Range
- 1-2 from outside Colorado if accessible (Mountain West preview)
- 2-3 from group practices, the rest solo
- At least 1 ABFP diplomate
- At least 1 working CFI or PRE evaluator
- At least 1 hospital-employed psychologist (different selling motion)

## Sourcing approach

Sources, in order of warmest to coldest:

1. **Personal network.** Anyone the founder already knows in the field. Easiest yeses. Lowest signal quality (warm contacts are kind).
2. **LinkedIn second-degree connections.** Filter Segment A and B contacts in Sales Navigator that share a mutual connection with the founder. Reach via the mutual.
3. **Direct outreach via the contact list at `/research/co-psychologists/`.** Use a discovery-specific subject line, not the cold-email Wave 1 template. Example: "30 minutes with a Colorado forensic evaluator about tools."
4. **CPA member directory.** Filter by forensic and assessment.
5. **ABFP diplomate directory.** National; filter to Colorado and Mountain West for these interviews.

If sourcing slows: post a LinkedIn note asking for 30 minutes with forensic and assessment psychologists. Disclose it is for product discovery, not a sales call. Offer a $100 honorarium to acknowledge their time (paid via Stripe or check; logged in `finance_ledger.md` under category `discovery`).

## Scheduling pattern

30 minutes via Zoom or phone. Calendly link configured specifically for discovery (separate from the demo Calendly) with a different qualifying question: "What is your forensic or assessment volume per month?"

Aim for 2 to 3 interviews per business day across the first week, 1 to 2 per day in the second week. The founder personally runs each. No agent substitute for this work.

## Interview script

Twelve questions. The founder does not need to ask all twelve; the goal is to listen and follow the thread.

**Open (60 seconds, set the frame):**

"Thanks for the time. To be upfront: I am not selling anything. I am building a tool for forensic and assessment psychologists and I want to understand how the work actually goes for people doing it. I will ask a handful of open questions and mostly listen. There are no right answers, and anything you say stays between us unless you tell me otherwise. May I record this for note-taking? I will delete the audio when I am done."

**1. Day in the work (5 min):**
Walk me through your last evaluation, hour by hour. Start with the referral. End with the signed report. Where does the time actually go?

*(Listening for: the longest steps, the hated steps, the steps that go invisibly. Forensic evaluators rarely break down their own time well. The act of walking through it slowly surfaces what hurts.)*

**2. Tools currently used (3 min):**
What software, templates, or files are you using right now to keep an evaluation organized? Walk me through the actual folder structure on your laptop.

*(Listening for: Word docs, Dropbox/OneDrive, EHR usage, custom templates, voice dictation tools, Heidi or Freed, DocuSign for attestations, anything else. The real tooling, not the aspirational tooling.)*

**3. The records review (3 min):**
For your last evaluation, how many pages of records did you review and how long did it take? What did you wish was different?

*(Listening for: volume, fatigue, search vs read, missing citations later, the binder problem.)*

**4. The discovery package (3 min):**
When you have a case challenged on cross or under audit, what do you assemble for opposing counsel or the auditor? How long does that take? What are you worried might be missing or unreconstructable?

*(Listening for: do they assemble it day-of, do they pre-assemble, what is hard to find, what they wish they had logged better. This is the wedge question for the product.)*

**5. Voice and report quality (2 min):**
When you reread an old report of yours, what do you change? What is repetitive across reports that you wish you could template, and what is unique to each evaluation that no tool should touch?

*(Listening for: where templating helps, where templating hurts, the voice line.)*

**6. AI tools (2 min):**
Have you tried any AI or assistant tools for your work? What worked, what did not, what scared you? What would have to be true for you to trust a tool to draft language?

*(Listening for: existing exposure, trust thresholds, what makes them recoil. Do not pitch Psygil in response.)*

**7. Daubert and Rule 702 in practice (2 min):**
When was the last time methodology was challenged on a report of yours? What did the challenge look like? What did you wish you had ready?

*(Listening for: real frequency of challenges, what specifically gets challenged, the cross-examiner's actual playbook from their POV. Many evaluators have never been seriously challenged; this question reveals the gap.)*

**8. HIPAA and PHI handling (2 min):**
How do you handle the PHI of the subjects of your evaluations? Where does it live, how is it transmitted, who has BAAs with you, what is the worst-case scenario you worry about?

*(Listening for: the BAA reality, the local-first stance fit, where the audience already lives. This question shapes the Solo non-PHI positioning.)*

**9. Pricing (2 min):**
Without naming a tool, what does a piece of software have to do to be worth $599 a month to you? What about $1,499 a month for a small team?

*(Listening for: anchoring, sticker-shock thresholds, willingness to pay framings. This question often produces the most useful single data point of the interview.)*

**10. What would have to be true (2 min):**
If a tool was going to actually shorten your evaluation time by a meaningful amount, what would it have to do that current tools do not?

*(Listening for: the deepest pain point in their own language, not the marketer's language. This is the answer that goes into the next round of cold email copy.)*

**11. Who else (1 min):**
Who are two other forensic or assessment psychologists you respect that I should also talk to? Why them?

*(Listening for: the actual influencers, the named champions, the names that recur across interviews. The Phase 1 case study candidates and the inner ring of the audience surface here.)*

**12. Anything I should have asked (1 min):**
What question should I have asked that I did not?

*(Listening for: the iceberg under the conversation. This question reliably produces the best answers in the last 30 seconds.)*

**Close (60 seconds):**

"This was incredibly useful, thank you. May I follow up if I have one more question later? And if I show you something I am building in a few weeks, would you be willing to take 15 minutes to react to it?"

*(The follow-up permission is the path to a letter of intent without asking for one in the discovery call.)*

## Recording and note capture

- **Audio recording:** with explicit consent, record via Zoom or Riverside. Delete the audio once notes are captured. Never share audio.
- **Notes file:** create `/ops/discovery/notes/[YYYY-MM-DD]-[lastname].md` after each interview within 2 hours of the call. Sleep on a note longer and the specifics fade.
- **Note template:** see below.
- **Tags:** mark notes with `forensic`, `assessment`, `ABFP`, `solo`, `group`, `Colorado`, plus any specific phrase that recurred ("the binder problem", "Word and Dropbox", "I have never been Daubert-challenged").

### Note file template

```markdown
# Discovery interview: [Last Name], [Date]

## Identifying info
- Name, credentials, location, practice setting
- Source of contact (warm intro, cold reach, LinkedIn, etc.)
- Volume estimate (evaluations per month or year)

## What they actually do
[Their day-in-the-work narrative, in their words where possible. Quote
exact phrasings. Note the steps they spent the most time describing.]

## Pain points named
[Numbered list, in their words.]

## Current tooling
[The actual folder structure, the actual software, the actual templates.
Not what they wish they used; what they used last week.]

## Quotes worth keeping
[3 to 8 exact quotations. Distinct phrasings. The "binder problem"
language, the "I do not trust AI to..." sentences, the "I'd pay $X
for..." admissions.]

## Pricing signal
[What they said about $599, $1,499, or anchored amounts. Strong / mid /
weak willingness signal.]

## Daubert/Rule 702 history
[Specific stories about challenges, audits, reviews. Or "never had one
challenged" if true; that itself is data.]

## HIPAA / PHI posture
[Where PHI lives in their workflow now. BAA-conscious or not.]

## Asked-of references
[Names they mentioned for next interviews.]

## Follow-up permission
[Did they say yes to the "may I show you what I am building" close?
Y/N. If Y, target date for follow-up.]

## My read
[2-3 sentences in the founder's own voice. Is this person a fit for
Solo, Practice, neither? Forensic or assessment? Champion potential?
Any flags?]
```

## Weekly synthesis

Every Friday afternoon during the discovery block (so May 16 and May 23), the founder reads all notes for that week and produces a 1-page synthesis at `/ops/discovery/synthesis/[YYYY-MM-DD].md` with:

- **The three most common pain points** in their actual language.
- **The pricing signal** (any anchoring around $599 / $1,499 / other).
- **The three recurring objections** (what tools fail at, what they would not trust).
- **The two or three named candidates** for the first Wave 1 contact list and possibly the first case study.
- **One revised hypothesis** about the Psygil thesis (did the discovery package idea land? Did the records-review idea land harder? Did neither?).
- **Any kill signals** (a specific reason this audience would not buy at all).

After the synthesis, the founder revises:
- The Wave 1 Email 1 template using the audience's actual language for line 1 and line 3.
- The webinar title if the audience's framing differs from the current title.
- Section 11 of `MARKETING_PLAN.md` if the conversion targets need another reset.
- The Solo BAA stance (D-0001 reversibility check; if 5+ interviewees signal willingness to pay $799-$899 for bundled BAA, propose flipping to Option A).

## Anti-patterns to avoid

- **Pitching.** Do not describe Psygil's features in the discovery interview. The frame is listening. If asked "what are you building," answer in one sentence and move back to listening.
- **Leading questions.** "Don't you wish you had a tool that produced a discovery package automatically?" is a leading question. "When was the last time you assembled records for a Daubert challenge?" is not.
- **Selling the BAA decision.** Do not ask "would you pay $799 for Solo with a BAA?" Ask "what does software have to do to be worth $599 to you?" and listen for whether they bring up BAAs unprompted.
- **Quick reads.** Do not synthesize after one interview. Patterns emerge at 5-10 interviews, not at 2.
- **Asking for an LOI in the call.** The LOI emerges from the follow-up permission, not from the discovery call. Asking too early kills the candor.

## Cost budget

10 interviews x 30 minutes = 5 hours of founder time.
10 interviews x optional $100 honorarium = $1,000 maximum.
Synthesis: 2 hours x 2 weeks = 4 hours of founder time.

Total: ~9 hours of founder time over 2 weeks, plus up to $1,000 in honoraria. Logged in `/ops/orchestrator/state/finance_ledger.md` under category `discovery`.

End of guide.
