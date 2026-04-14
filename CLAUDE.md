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

### 1. Intent over decoration
Pick a clear aesthetic direction and execute with precision. Psygil's direction is restrained, editorial, instrument-like. Avoid cookie-cutter SaaS patterns. Typography pairing is Inter + JetBrains Mono; mono is the characterful voice for labels, numeric data, stage numbers. Motion lives in high-impact moments only. Depth from shadow tiers, not decorative gradients.

### 2. Craft-level interaction
Transitions 150-250ms with tactile eases. Hover states acknowledge the cursor (2-4px translateY with shadow bump), never redraw. Focus states visible for keyboard users. Animate only transform, opacity, filter, background-color. Small details compound: caret on tooltip, consistent stroke-width on SVG icons, identical border-radius across surfaces.

### 3. Precision and motion
Align to a consistent grid; break it only where a specific element must draw attention (the Primary Gate chip). Negative space is load-bearing. Hardware-accelerated transforms only. The page should feel quiet, occasionally punctuated.

### 4. Component discipline
Semantic token names over literal colors. Base-8 spacing: 4, 8, 12, 16, 24, 32, 48, 64. Radius: buttons/chips 4-6px, panels/screenshots 8-10px, nothing fully rounded except pills. Keyboard and screen-reader parity: every interactive element tab-reachable, every icon either labeled or aria-hidden.

### 5. Industry fit
Product type is court-grade forensic software. Mood reads as instrument, record, ledger — never consumer app or lifestyle brand. Anti-patterns: cartoon illustrations, stock photography, testimonial carousels with headshots, emoji in copy, gamification, progress bars celebrating AI doing the work. Preferred: data tables, mono-spaced numeric readouts, labeled field grids, timestamp stamps, signed-record motifs.

### 6. Operating principles
Clarity before cleverness. Feedback is immediate, specific, reversible. One primary action per view (hero CTA is "Watch the demo"). Copy is the UI.

---

## Hard rules (voice and style)

Non-negotiable on this project.

- Never use em dashes. Use commas, periods, or parentheses.
- Never use curly quotes. Straight quotes only.
- Never use marketing vocabulary: leverage, utilize, facilitate, empower (as a verb-for-its-own-sake), unlock, seamless, best-in-class, cutting-edge, next-generation.
- Never use phatic transitions: In conclusion, Overall, In summary, At the end of the day.
- Never invent testimonials or attribute quotes to named clinicians.
- Never introduce AI placeholder names ("Jane Doe, M.D.", "Dr. Example").
- Never add `Co-Authored-By: Claude` or similar watermarks to commits.
- Sentence fragments allowed when they earn rhythm. Do not chain three.
- Prefer short declaratives: "The clinician diagnoses. The record proves it."

---

## Operating procedure

1. Read the relevant HTML and CSS before editing. The repo is small; drift is expensive.
2. Reuse tokens. If a new surface needs a color, add a CSS variable in `:root`, don't hardcode.
3. Match existing patterns. Extend `.card`, don't introduce a parallel family.
4. Ship small commits. One change, one commit, one descriptive message.
5. **Cache dance after push.** Cloudflare Pages edge caches CSS with `immutable`. If `www.psygil.com` shows stale content, fix: Cloudflare → psygil.com zone → Caching → Configuration → Purge Everything. Verify with the build marker in `index.html`: `curl -s https://psygil-website.pages.dev/ | grep build:` vs `curl -s https://www.psygil.com/ | grep build:`.
6. Local preview: `python3 -m http.server 8080` in this folder.

---

## Design sources referenced

- Anthropic `frontend-design` skill.
- `nextlevelbuilder/ui-ux-pro-max-skill`.
- Emil Kowalski, Impeccable, shadcn/ui, ui-skills.com — not fetchable from sandbox. Paste relevant content into `DESIGN_PRINCIPLES.md` to merge next session.
