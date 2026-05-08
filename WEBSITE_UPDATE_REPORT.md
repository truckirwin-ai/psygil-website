# Psygil Website Update Report

**Date:** May 8, 2026
**Working copy:** `/Users/truckirwin/Desktop/Foundry SMB/Products/Psygil/website-working-copy`
**Primary site target:** `/Users/truckirwin/Desktop/Foundry SMB/Products/psygil-website`

## Purpose

Update the Psygil marketing site from the current product and competitive analysis, then promote the working copy to the primary website folder.

## Strategic Direction

The site now positions Psygil as a forensic evaluation workspace, not a generic report writer. The core message is that Psygil protects the clinical record: local-first workspace, gated and signed diagnostic workflow, source-linked reporting, report hashing, and audit proof.

PsychAssist is treated as the closest broad assessment-platform competitor. Psygil is positioned as more focused, more local-first, and more defensibility-centered for forensic, IME, disability, capacity, and high-stakes clinical evaluation work.

## Major Site Changes

- Added `compare.html` for competitive positioning and head-to-head comparison.
- Added `forensic.html` for forensic psychologists, IME work, attorneys, and high-stakes referral contexts.
- Updated global navigation and footer links to include Compare and Forensic.
- Added homepage differentiator section and local-control privacy callout.
- Updated homepage hero eyebrow layout and version text treatment.
- Added Psygil fox icon to the header and footer only.
- Added Features page sections for Peer Review, Psychometrician Assistant, test-score charting, and the Feature Catalog.
- Added Download page v1.1 roadmap teaser and Practice tier card.
- Added Zero-Retention Architecture content to Policies.
- Rewrote the About page local-first section and added `#zero-retention`.
- Updated Enterprise hero language around accountability to courts, attorneys, patients, families, and clinicians.
- Updated sitemap entries for Compare and Forensic.

## Product Claims Cleaned Up

- Removed school psychology, FERPA, EvalDraft, and psychoeducational positioning from active website copy.
- Removed old pricing-page references from the active sitemap.
- Removed bare "AI" marketing language from active marketing pages.
- Avoided shipped claims for planned features such as full peer review exchange and broad instrument expansion.
- Replaced old claims around "patient data never leaves" with local-first and redaction-manifest language.

## Asset Changes

- Copied Psygil fox icons into `assets/icons/`.
- Header uses `assets/icons/CoolFox_circle_512x512.png` at 36px.
- Footer uses the same fox asset at 56px.
- Mid-page fox icons were removed so the icon appears only in global site chrome.

## Pricing And Business Notes

Recommended pricing direction from the business review:

- Founder Beta: $399/month for early design partners.
- Professional: $599/month for solo forensic, IME, disability, capacity, and clinical evaluators.
- Practice: $1,499/month base with three clinician seats.
- Additional clinician seats: $299/month.
- Enterprise: starts at $3,000/month, with custom terms, onboarding, BAA, security review, and priority support.

Business moat framing:

- Records remain portable.
- The active Psygil workspace, encrypted database, diagnostic workflow, audit-chain UI, and structured case state remain part of the licensed product.
- The defensible moat is workflow depth, signed clinical authority, local-first trust, audit proof, accumulated practice templates, and onboarding services.

## Verification Performed

- Footer links verified across active pages.
- Local HTTP status verified for active pages and icon assets.
- HTML structure verified for active pages.
- Footer fragment links verified for `policies.html#privacy` and `policies.html#terms`.
- `git diff --check` clean.
- Em and en dashes removed across the working copy outside `.git` and `node_modules`.

## Active Pages

- `index.html`
- `features.html`
- `compare.html`
- `demo.html`
- `forensic.html`
- `enterprise.html`
- `download.html`
- `about.html`
- `support.html`
- `sales.html`
- `contact.html`
- `policies.html`
- `thanks.html`

## Notes

`psygil-preview.html` remains a legacy bundled preview artifact and should not be treated as the current live site source.
