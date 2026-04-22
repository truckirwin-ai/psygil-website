# Demo page mockup references

These are the visual reference points for the five screenshots embedded in `demo.html` (the `.screenshot` blocks inside `.stepper` `.step`). Each mockup is rendered in HTML/CSS, not raster. The notes below capture the style cues so any future redesign or live UI capture stays consistent.

To attach the actual PNG screenshots, drop them into this directory as `01-intake.png`, `02-testing.png`, `03-interviews.png`, `04-diagnostics.png`, `05-attestation.png`. They are small enough to commit.

## Shared chrome ("window") frame

Class: `.screenshot`

- White panel (`--panel`) on a 1px `--border`, 10px radius, `--shadow-lg`.
- Top bar `.chrome` is `--panel-2` background, `--font-mono` 0.72rem, `--text-secondary`.
- Three macOS-style traffic-light dots: red `#ff6b6b`, yellow `#f7c948`, green `#1a7f37`. 10x10, fully round.
- Title format: `Psygil — Case #CR-2026-00412 · <stage>` with a middle-dot separator. Letter-spacing 0.04em.
- Body padding 22px on a `display: grid; gap: 14px`. `body.two-col` adds a 220px sidebar column for the case nav.

Below every mockup: an italic caption "Mockup. Will be replaced with live UI capture before launch." (`.screenshot-caption`).

## Stage 01 — Intake

Source: `demo.html` lines 91-115. CSS: `.mock-rail`, `.mock-field`.

Cues:
- Two-column body. Left: `.mock-rail` "CASE NAV" with mono uppercase eyebrow `h5`. The active item ("Intake") gets `--accent-soft` background and `--accent` text in semibold.
- Right: stack of `.mock-field` rows. Two-column grid (160px label / 1fr value), 1px bottom border between rows, no border on the last.
- Labels are `--font-mono` 0.78rem, `--text-secondary`, letter-spacing 0.04em. Values are 0.9rem, `--text`, weight 500.
- "Substance use" is shown empty with `.val.dim` (italic, `--text-secondary`) reading "Clinician has not entered" — this is the design tell that Psygil never invents facts.

Caption meta: `~45 SECONDS · WATCH THE FIELD-BY-FIELD TYPING` (`.step .meta` — mono, 0.75rem, accent, letter-spacing 0.08em).

## Stage 02 — Testing

Source: lines 127-145. CSS: `.mock-table`.

Cues:
- Single-column body, full-width `.mock-table` (border-collapse, 0.85rem).
- Header row: mono uppercase 0.72rem `--text-secondary`, letter-spacing 0.08em, semibold, 1px bottom border.
- Body rows: regular Inter 0.85rem `--text`, 8/10 padding, 1px bottom border between rows.
- Numeric cells (`.num`): mono. The Result column uses mono so scores read like data.
- "Flag" column uses `.flag` — accent color, weight 600, all-caps. Used here for `REVIEW` on the ECST-R row.

## Stage 03 — Interviews

Source: lines 157-170. CSS: same `.mock-field` as Intake.

Cues:
- Single-column body. Six `.mock-field` rows: Appearance, Speech, Mood / affect, Thought process, Thought content, Insight / judgment.
- Same label/value typography as Intake. Reads like a structured MSE form.
- No accent color in the body — this stage is observational record-keeping, not a decision moment.

## Stage 04 — Diagnostics (THE GATE)

Source: lines 184-198. CSS: `.evidence-mock`, `.dx`, `.controls`, `.pill`.

Cues:
- Wrapper `.evidence-mock` is mono 0.78rem, `--text-secondary`. Sets the "ledger of decisions" voice.
- Each `.dx` row is a flex row, space-between, `--panel` background, `--border` 1px, 4px radius, 8px bottom margin.
- Diagnosis name: `--text`, weight 600. ICD-10 code: `--accent`, weight 600 (same row, mono).
- Right side `.controls` is an inline-flex with three `.pill` buttons: RENDER, DEFER, REJECT.
- Pills: 2px/8px padding, 3px radius, 1px `--border`, mono 0.72rem `--text-secondary`, weight 600, 0.05em tracking, `--panel` background.
- Active pill (`.pill.active`): `--accent` background, `--accent-on` (white) text, `--accent` border.
- Below the four diagnoses, one final `.mock-field`: `Writer agent` / `Blocked until clinician attests decisions` (italic dim). This is the visual proof that the gate is enforced.

### Button semantics (REMEMBER THIS)

The three pills represent the only three choices the clinician can make per proposed diagnosis:

- **RENDER** — Clinician accepts the diagnosis. Goes onto the report. Reasoning is recorded with timestamp + signature.
- **DEFER** — Clinician is not ready to decide. The diagnosis is parked; the case cannot leave the gate while any row is still in DEFER. Forces a follow-up.
- **REJECT** — Clinician explicitly rules out the diagnosis. Recorded as a negative finding (this is itself a defensible clinical act, separate from "didn't consider it").

These pills are mutually exclusive per row. Exactly one is `.active` at any time. The Writer agent stays blocked until every proposed diagnosis has a decision (no row left without an active pill, and no row left in DEFER if a downstream report is requested).

The mockup currently shows: MDD recurrent moderate → RENDER, PTSD → DEFER, AUD moderate → RENDER, Antisocial PD → REJECT. That mix is intentional — it shows all three states are real decisions, not stylistic variations.

Caption meta: `~50 SECONDS · SLOW DOWN. LINGER ON THE GATE`.

## Stage 05 — Reports / Attestation

Source: lines 211-225. CSS: `.mock-attestation`.

Cues:
- Body wraps a single `.mock-attestation` block: `--bg-soft` background, 1px `--border`, 6px radius, 14/16 padding.
- Mono 0.78rem, `--text-secondary`, line-height 1.7. Reads like a YAML-ish manifest or a git commit trailer.
- Each line is `key:` (accent color) + ` value` (`--text`). Keys: `document`, `signed_by`, `sha256`, `audit_events`, `lock_status`.
- The sha256 is shown in full to communicate "real cryptographic attestation, not a checkmark icon."
- `lock_status: LOCKED` is the closing beat — the clinician has signed and the report is sealed.

## Style summary (apply to any future stage mockup)

- Always use the chrome frame with the case ID in the title.
- Mono is the voice of "captured data" — labels, codes, scores, hashes, timestamps, eyebrow meta.
- Inter is the voice of "human content" — diagnosis names, value text, body copy.
- Accent (`#E8650A`) appears only on:
  - active states (selected nav item, RENDER/DEFER/REJECT active pill)
  - codes and identifiers (ICD-10, attestation keys)
  - flags that demand human attention (REVIEW)
- Negative space and 1px borders. No drop shadows on inner elements; only the outer `.screenshot` carries the shadow.
- Empty fields read as italic dim text, never as a placeholder dash. This communicates "the clinician has not entered this," which is part of the product's promise.
