# CLAUDE.md — psygil-website

Operating context and design brief for every Claude session working on this repo.
Treat this file as always-applied guidance. Read it before any design or copy change.

---

## Project

Marketing site for **Psygil**, a forensic psychology IDE. Audience is licensed clinicians, forensic practices, and expert witnesses. The product promise is that **the clinician diagnoses, always** — AI agents read records, organize evidence, and draft language, but never render a diagnosis or sign a report. The site exists to make that distinction legible in 10 seconds and defensible on cross-examination.

Pages: `index.html`, `features.html`, `demo.html`, `pricing.html`, `download.html`. Static HTML/CSS, no build step. Deployed to Cloudflare Pages via GitHub push (`main` branch).

---

## Existing design system

Tokens live in `styles.css` at `:root`. Do not re-theme without explicit instruction. Current direction is **light theme, strong contrast, single-accent**.

- Accent: `#E8650A` (--accent), soft fill `#fff4ec` (--accent-soft), muted `#b8540a`, hover `#c0530a`.
- Surfaces: `#ffffff` (--bg / --panel), `#f6f8fa` (--bg-soft / --panel-2).
- Text: `#1f2328` (--text), `#57606a` (--text-secondary).
- Border: `#d0d7de`, strong `#8c959f`.
- Typography: Inter for body (400/500/600/700), JetBrains Mono for data/eyebrow labels.
- Shadows: three tiers — `--shadow-sm`, `--shadow-md`, `--shadow-lg`.
- Radius: `--radius`, `--radius-lg`.

Pipeline stage cards, price cards, feature cards, `.screenshot` mockups, and `.evidence-mock` all already reference these tokens. Additions should reuse them, not introduce new colors.

---

## Design philosophy

This section synthesizes the design skill sources the operator has installed at the project level.

### 1. Intent over decoration (frontend-design skill, Anthropic)

- Pick a clear aesthetic direction and execute with precision. Bold maximalism and refined minimalism both work; AI-generic middle-ground does not.
- Avoid overused fonts (Arial, Roboto, generic Inter without intent) and clichéd color schemes (purple-on-white gradients, cookie-cutter gradient-mesh hero). Psygil's current direction is **restrained, editorial, instrument-like** — read as "surgical tool," not "SaaS template."
- Typography pairing should be deliberate. Current pairing is Inter + JetBrains Mono; the mono face is the characterful voice and is used for eyebrow labels, numeric data, stage numbers, and anything that should read as a captured record.
- Motion lives in high-impact moments (hover reveals on the pipeline, tooltip enters, the gate-card emphasis on Diagnostics). Do not scatter micro-animations everywhere.
- Depth comes from shadow tiers, not decorative gradients or excess borders.

### 2. Craft-level interaction details (Emil Kowalski tradition)

- Transitions in the 150–250ms band, with eases that feel tactile (`cubic-bezier(0.22, 1, 0.36, 1)` for enters; shorter `ease-out` for exits).
- Hover states should acknowledge the cursor, not redraw the card. Prefer a 2–4px `translateY(-)` with a shadow tier bump.
- Focus states must be visible for keyboard users (current `:focus-within` rule on pipeline tooltips is the right pattern).
- Never animate layout-shifting properties; stick to transform, opacity, filter, background-color.
- Small details compound: caret on tooltip, consistent stroke-width on SVG icons, identical border-radius across surfaces. Drift is visible.

### 3. Precision and motion craft (Impeccable tradition)

- Treat the viewport as a stage. Align elements to a consistent grid; break the grid only where a specific element must draw attention (the Primary Gate chip sits slightly emphasized for exactly this reason).
- Negative space is load-bearing. Do not crowd the pipeline with additional callouts unless it earns its place.
- Hardware-accelerated transforms only. No `top`/`left` animations.
- Sound-like restraint: the page should feel quiet, occasionally punctuated.

### 4. Component discipline (shadcn/ui tradition)

- Semantic token names (`--accent`, `--text`, `--border`) over literal colors. We already follow this; keep doing it.
- Base-8 spacing scale: 4, 8, 12, 16, 24, 32, 48, 64. Avoid 10, 14, 18, 22 unless there is a typographic reason (we use 22px hero padding-top intentionally).
- Radius system: buttons, chips, and small cards at 4–6px; panels and screenshots at 8–10px; nothing fully rounded except pills.
- Keyboard and screen-reader parity: every interactive element reachable by tab, every icon either labeled or `aria-hidden="true"`.

### 5. Industry-fit reasoning (UI UX Pro Max tradition)

- Psygil's product type is **court-grade forensic software**. The design mood should read as *instrument, record, ledger* — never as *consumer app* or *lifestyle brand*.
- Anti-patterns for this context: cartoon illustrations, stock photography, testimonial carousels with headshots (until we have real attributable clinicians), emoji in copy, gamification, progress bars celebrating AI doing the work.
- Preferred patterns: data tables, mono-spaced numeric readouts, labeled field grids, timestamp stamps, signed-record motifs (hash strings, attestation blocks), courtroom-adjacent typography (the JetBrains Mono eyebrow labels lean this way).

### 6. Interaction and interface principles (ui-skills.com sources)

> Content from `ui-skills.com/skills/interaction-design`, `interface-design`, and `web-design-guidelines` was not fetchable from this environment. Paste the skill bodies into `DESIGN_PRINCIPLES.md` in the repo root when convenient and I will incorporate them.

General operating principles to apply in the meantime:

- **Clarity before cleverness.** Every screen should answer: what is this, what can I do, what happens if I do it.
- **Feedback is immediate, specific, and reversible.** Hover reveals, tooltip arrows pointing at the source card, undo where feasible.
- **One primary action per view.** The hero CTA is "Watch the demo." Everything else is secondary.
- **Respect the reader.** Copy is the UI. Short lines, scannable hierarchy, no marketing vocabulary.

---

## Hard rules (voice and style)

These are non-negotiable on this project.

- Never use em dashes. Use commas, periods, or parentheses.
- Never use curly quotes. Straight quotes only: `"` and `'`.
- Never use marketing vocabulary: `leverage`, `utilize`, `facilitate`, `empower` (as a verb-for-its-own-sake), `unlock`, `seamless`, `best-in-class`, `cutting-edge`, `next-generation`.
- Never use phatic transitions: `In conclusion`, `Overall`, `In summary`, `At the end of the day`.
- Never invent testimonials or attribute quotes to fictional or real named clinicians.
- Never introduce AI placeholder names ("Jane Doe, M.D.", "Dr. Example").
- Never add `Co-Authored-By: Claude` or similar watermarks to commits.
- Sentence fragments are allowed when they earn rhythm. Do not chain three consecutive fragments.
- Prefer short declaratives: "The clinician diagnoses. The record proves it."

---

## Operating procedure

When the operator asks for a design or copy change:

1. **Read the relevant HTML and CSS before editing.** The repo is small; cost is low; drift is expensive.
2. **Reuse tokens.** If a new surface needs a color, add a new CSS variable in `:root` rather than hardcoding.
3. **Match the existing pattern.** If a new card style is needed, extend the `.card` family, don't introduce a parallel one.
4. **Ship small commits.** One change, one commit, one descriptive message. Push after every batch unless told otherwise.
5. **After every push, remember the cache dance.** Cloudflare Pages edge caches CSS with `immutable`. If the operator reports stale content on `www.psygil.com`, the fix is Cloudflare → psygil.com zone → Caching → Purge Everything. The build marker comment in `index.html` (`<!-- build: ... -->`) is the verification vector: compare `curl -s <host>/ | grep build:` across `pages.dev` and `psygil.com`.
6. **For local preview**, the operator runs `python3 -m http.server 8080` in this folder. Edits are picked up on browser refresh.

---

## Design sources referenced

- Anthropic `frontend-design` skill — installed at `~/.claude/skills/frontend-design/SKILL.md`.
- `nextlevelbuilder/ui-ux-pro-max-skill` — summary incorporated above; full skill at https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.
- Emil Kowalski — https://emilkowal.ski (public interaction-design writing; not fetchable from Claude's sandbox).
- Impeccable — https://impeccable.style (not fetchable from Claude's sandbox).
- shadcn/ui — https://ui.shadcn.com/docs/skills (not fetchable from Claude's sandbox).
- UI-Skills — https://www.ui-skills.com/skills/{interaction-design,interface-design,web-design-guidelines} (not fetchable from Claude's sandbox).

For the fetch-blocked sources, paste the relevant skill content into `DESIGN_PRINCIPLES.md` in this repo and Claude will merge it into this file on next session.
