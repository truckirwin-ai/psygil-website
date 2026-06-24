# Browser Runbook

Use this when manually collecting Psychology Today, APA Locator, hospital, or university pages.

## Per profile

Capture:
- Practice Name
- Chief Doctor / Director
- Phone
- Contact Email
- Address
- Specialties
- City
- County
- Source
- NPI
- License
- Last Verified
- Profile URL
- Accepting New Patients

## Workflow

1. Open the listing page.
2. Filter by city or specialty.
3. Open one profile at a time.
4. Copy the exact visible text.
5. If email is hidden behind a button, only record the exact address if the page reveals it after click.
6. Save rows into `data/manual_intake_template.csv`.
7. Rerun merge/dedupe.

## Good target pages

- Psychology Today city listings
- APA Locator profile pages
- hospital provider directories
- university faculty pages
- CPA public directory
- ABFP / ABPP directories

## Notes

- Do not infer hidden emails.
- Do not add unverified license numbers.
- Prefer the profile page over the listing card when both exist.
