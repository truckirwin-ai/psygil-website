# Colorado Front Range Psychologist Roster

Working folder for assembling a deduplicated roster of psychologists and psychology practices on the Colorado Front Range (Fort Collins to Pueblo).

## Status: scaffolding only

The actual data pull cannot run from inside the Claude/Cowork sandbox in this session because the network egress allowlist blocks every relevant data source (NPI Registry, Colorado DORA, Psychology Today, CPA, ABFP, practice websites). Only GitHub, package registries, and Anthropic domains are reachable. The scripts in `scripts/` are written to run from the operator's own machine.

## Output schema (`co_psychologists.csv`)

| Column | Notes |
|---|---|
| Practice Name | Business / clinic name; for solo practitioners, use the practitioner's professional name |
| Chief Doctor / Director | Lead clinician, owner, or clinical director |
| Phone | E.164-ish but human-readable: `(719) 555-0123` |
| Contact Email | Best public contact email; intake/info preferred over personal |
| Address | Single line: `123 Main St, Suite 4, Colorado Springs, CO 80919` |
| Specialties | Semicolon-separated, lowercase keywords: `forensic; trauma; child` |
| City | Front Range city only (filter target) |
| County | Larimer, Boulder, Broomfield, Adams, Arapahoe, Denver, Douglas, Jefferson, El Paso, Pueblo, Weld |
| Source | Lowest-cost source that produced the row: `npi`, `dora`, `psychologytoday`, `cpa`, `abfp`, `court_roster`, `university`, `manual` |
| NPI | National Provider Identifier if known |
| License | Colorado PSY license number (e.g., `PSY.0001234`) |
| Last Verified | ISO date the row was last confirmed against source |

The first two columns are the deliverable shape you asked for. The auxiliary columns (City, County, Source, NPI, License, Last Verified) are present so we can dedupe across sources and re-verify on a cadence.

## Phased plan

1. **Phase 1 — NPI Registry (foundational)**
   Pull every Type 1 (individual) and Type 2 (organization) provider in Colorado with a psychology-family taxonomy. NPI gives: legal name, practice address, practice phone, taxonomy. Does NOT give: email, license number reliably.
   Script: `scripts/01_pull_npi.py`

2. **Phase 2 — Colorado DORA license roster**
   DORA license data is the only authoritative source for "is this person actually licensed in Colorado right now." The public lookup form is not bulk-scrapable. Path of least resistance: file a Colorado Open Records Act (CORA) request for the active PSY licensee roster. See `scripts/02_dora_request.md`.

3. **Phase 3 — Psychology Today directory**
   Surfaces practitioners NPI misses (cash-pay practices without billing footprints) and adds specialty tags, website URLs, accepted insurances. Their ToS prohibits scraping; the safe path is the operator visiting and exporting manually, or a contracted scraper run.
   Script (reference only): `scripts/03_pull_psychology_today.py`

4. **Phase 4 — Specialty boards and CPA**
   ABFP diplomate list (forensic), ABPP specialty boards, Colorado Psychological Association member directory. These are small, high-signal lists.
   Script: `scripts/04_pull_abfp.py`

5. **Phase 5 — Institution psychologists**
   Hospital systems and universities. These catch employed psychologists who never show up in private-practice directories.
   Script: `scripts/10_collect_institutions.py`

6. **Phase 6 — Court-appointed evaluator rosters**
   Most relevant for the Psygil audience. Each Colorado judicial district maintains its own roster. There are 23 districts; the meaningful ones for forensic work are the 1st (Jefferson/Gilpin), 2nd (Denver), 4th (El Paso/Teller), 8th (Larimer), 17th (Adams/Broomfield), 18th (Arapahoe/Douglas), 19th (Weld), 20th (Boulder), 10th (Pueblo). These are not in any unified registry — operator must request each district's current roster.

7. **Phase 7 — Merge and dedupe**
   Match by: exact NPI > exact license > fuzzy practice name + zip > fuzzy person name + city. Prefer the most authoritative source for each field.
   Script: `scripts/05_merge_dedupe.py`

8. **Phase 8 — Email enrichment**
   For each practice with a website URL, fetch `/`, `/contact`, `/about`, look for `mailto:` and email-pattern regex. Respects robots.txt, rate-limited, single user-agent identifying the request. Expect 30-50% hit rate; expect days of runtime.
   Script: `scripts/06_enrich_emails.py`

## What I can do in this session vs. what needs you

| Action | Where it has to run |
|---|---|
| Schema, scripts, plan, dedupe logic | This session (done) |
| Run scripts against the public APIs | Your machine, or after we add domains to Cowork allowlist |
| File the DORA CORA request | You (form submission) |
| Compile court evaluator rosters | You (each district's clerk) |
| Email enrichment crawl | Your machine; multi-day job |

## Manual browser lane

Use `data/manual_intake_template.csv` as the append-only intake file for:
- Psychology Today browser sweeps
- APA Locator browsing
- hospital / university profile pages
- county or district rosters

Use `scripts/11_append_manual_rows.py` to append verified browser captures into the manual intake file.

Append one row per verified profile, then rerun merge/dedupe.

If you want me to pull live data from inside Cowork, add these domains in **Settings → Capabilities** (workspace admin) and I can run Phase 1 here directly:

- `npiregistry.cms.hhs.gov` (NPI Registry API)
- `apps.colorado.gov` (DORA)
- `www.psychologytoday.com` (referenced read-only; respect their ToS)
- `www.coloradopsych.org` (CPA)
- `www.abfp.com` (ABFP)

## Realistic record counts (estimates, Front Range only)

| Bucket | Approx count |
|---|---|
| Individual licensed psychologists (DORA active) | 3,000-3,500 |
| Practice entities (NPI Type 2 with psychology taxonomy) | 700-1,100 |
| Forensic-credentialed psychologists | 80-160 |
| Institutional staff psychologists | 250-500 |
| Combined deduped roster | 3,500-4,500 |

## Voice / branding note

This roster is a research artifact, not site copy. It does not need to follow the `STYLE_GUIDE.md` voice. Do not ship it as a public page or import names into marketing material without consent.
