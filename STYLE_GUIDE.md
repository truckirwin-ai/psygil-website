# Psygil marketing style guide

Companion to CLAUDE.md. These rules govern voice and terminology on the marketing pages (`index`, `features`, `demo`, `pricing`, `enterprise`, `download`, `about`, `sales`, `contact`). The policies page (`policies.html`) and legal copy use formal third-person register and are exempt where noted.

Psygil is a doctor-centric tool. The clinician is the subject of every sentence that matters. The software streamlines what the clinician already does.

---

## 1. The doctor is the subject

Write to the clinician in second person. "Your clinical judgment." "Your signed diagnoses." "Your voice."

Use **you** and **your** wherever the action is the clinician's. Reserve "the clinician" for third-person explainers (the About page prose about the company, the Policies page, internal docs) where neutrality is required.

| Do | Don't |
|---|---|
| "You render, defer, or reject each candidate." | "The clinician renders, defers, or rejects each candidate." |
| "Your expertise shapes every evaluation." | "The clinician's expertise shapes every evaluation." |
| "You pick the tests. You score the tests." | "The clinician picks the tests." |

---

## 2. Assisting technologies, not "AI"

Do not use the bare term **AI** in marketing body copy. Name the function. Each assistant has a single plain-English role:

| Role | What it does |
|---|---|
| Writing assistant | Drafts report sections in your voice from your signed diagnoses. |
| Review assistant | Flags speculative language, unsupported conclusions, diagnostic overreach. |
| Diagnostic assistant | Maps evidence to DSM-5-TR criteria. Does not diagnose. |
| Ingestion assistant | Reads uploaded records into structured case data. |

Speak generically as **the assistants**, **assisting technologies**, or **the tools**. "AI" is acceptable only in precision contexts (policies, security documentation, a technical spec line) where it has a legal meaning. Never in a hero, a headline, a CTA.

| Do | Don't |
|---|---|
| "The writing assistant drafts the report in your voice." | "The AI writes the report for you." |
| "The assistants organize evidence, draft language, and pressure-test the record." | "Our AI system does it all." |
| "Assistant-drafted sections are labeled with a confidence score." | "AI-generated sections..." |

---

## 3. Streamline framing

What Psygil does, said simply: **Psygil streamlines the data gathering and the records keeping so your expertise shapes every evaluation.**

The software is the workbench, the ledger, the keeper of the record. It is not the decider. It stays out of the way so the clinician can stay with the patient, the test, the interview, the decision.

| Do | Don't |
|---|---|
| "Psygil streamlines the records keeping so your expertise shapes every evaluation." | "Psygil uses AI to speed up your workflow." |
| "The ingestion assistant keeps records keeping out of your way." | "AI automates document processing." |
| "The gate keeps you in charge." | "The gate prevents the AI from making bad decisions." |

---

## 4. Expertise words, preferred

Use these. They acknowledge the clinician and name the thing that matters:

- your clinical judgment
- your expertise
- your training
- your signature
- your voice, your vocabulary
- your decisions
- your signed diagnoses
- your record

---

## 5. Words and phrases to avoid

- **"the AI"** — name the specific assistant instead
- **"AI-generated"** — say **assistant-drafted** or **draft requiring your review**
- **"AI-first", "AI-only path"** — reframe: **no shortcut around your judgment**
- **"automates diagnosis"** — never
- **"replaces the clinician"** — Psygil does not replace; it streamlines
- **"prevents premature conclusions"** — softer: **keeps decisions in your hands**
- **"stops the AI from..."** — reframe: **keeps you in charge of...**

Also still banned from CLAUDE.md: em dashes, curly quotes, and marketing vocabulary (leverage, utilize, facilitate, seamless, cutting-edge, best-in-class, next-generation, unlock, empower).

---

## 6. The gate language

The decision gates exist for the clinician, not against the machine. Frame them as rails that keep judgment where it belongs.

| Do | Don't |
|---|---|
| "Decision gates keep you in charge of all diagnostics." | "Decision gates stop the AI from diagnosing." |
| "The writing assistant will not draft a report until you have rendered at least one diagnosis." | "The Writer agent refuses to run until a diagnosis exists." |
| "No shortcut around your judgment." | "No AI-only path." |

---

## 7. Defensibility, adversarial language, and where forensic voice lives

The top of every page reads calmly: service and expertise. Courtroom language (**cross-examination**, **discovery**, **defensibility**, **Daubert**, **Frye**) belongs in:

- the `.forensic-callout` pattern (the orange-bordered boxes on `index.html` and `features.html`)
- the Enterprise page copy
- the forensic sub-cards in Features sections
- the policies page where relevant

Elsewhere, use softer versions:

| Hero and body | Forensic callout |
|---|---|
| "A record you can stand behind." | "Defensible on cross-examination." |
| "Reports that hold up under any review." | "Court-grade on discovery." |
| "Reproducible on demand." | "Reconstructable on discovery." |

---

## 8. Clinical-first ordering

Where both audiences are listed, clinical goes first. "Clinical and forensic." "For every evaluation you sign: IME, disability, capacity, fitness-for-duty, diagnostic, and court-ordered forensic." Personas card order on the home page is Clinical → Forensic → Group practices.

---

## 9. Examples

### Hero lede, before and after

**Before:** *"Psygil is opinionated. It makes the right thing easy and the wrong thing impossible. AI organizes evidence. The clinician makes every decision the referral, the payer, the regulator, or the court cares about."*

**After:** *"Psygil streamlines the data gathering and the records keeping so your expertise shapes every evaluation. The assistants organize evidence, draft language in your voice, and pressure-test the record. You make every decision the referral, the payer, the regulator, or the court cares about."*

### Gate heading, before and after

**Before:** *"Decision gates stop the AI from diagnosing."*

**After:** *"Decision gates keep you in charge of all diagnostics."*

### Writer section, on-voice example

*"The writing assistant drafts the report in your voice and style, using your vocabulary, from the diagnoses you have approved and signed. Every section is labeled generated or draft with a confidence score. Sections awaiting upstream stages show placeholders, not prose."*

---

## 10. Exceptions

- **Policies** (`policies.html`): formal third-person legal register. "The Customer," "the clinician," "Foundry SMB LLC." Leave alone.
- **Release notes, engineering docs, technical specs**: may use **AI** and subsystem names (SQLCipher, Argon2id, Ed25519, Whisper) directly. Precision over rhetoric.
- **Forensic callouts**: adversarial language is on-topic. Use it.
- **The tagline**: *"Evidence ledger, not a decision engine."* stays. It is the product thesis.

---

Questions or exceptions: write to `legal@psygil.com` for anything that touches contract terms; to `hello@psygil.com` for everything else.
