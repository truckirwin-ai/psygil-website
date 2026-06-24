# Colorado Psychologist Acquisition Plan

This is the operating playbook for building a broad, deduped roster of currently practicing Colorado psychologists.

The goal is not one directory. The goal is coverage.

## Discovery lanes

### 1. Locale sweeps
Run by city or metro area.

Targets:
- Denver
- Colorado Springs
- Boulder
- Fort Collins
- Aurora
- Broomfield
- Centennial
- Littleton
- Lakewood
- Golden
- Longmont
- Loveland
- Greeley
- Pueblo

Use cases:
- Psychology Today city pages
- APA Locator city searches
- Practice websites found via web search
- Hospital provider directories

### 2. Specialty sweeps
Run by practice area or credential.

Targets:
- forensic
- neuropsychology
- child
- adolescent
- perinatal
- trauma
- EMDR
- assessment / testing
- couples
- health psychology
- addiction
- autism / ADHD

Use cases:
- Psychology Today specialty filters
- ABFP / ABPP directories
- SOMB roster
- court evaluator rosters

### 3. Institution sweeps
Run by hospital, university, or health system.

Targets:
- UCHealth
- Denver Health
- Children's Hospital Colorado
- VA Eastern Colorado Health Care System
- CU Boulder
- CU Denver
- CU Anschutz
- Colorado State University
- University of Northern Colorado
- University of Denver
- UCCS
- Regis

Use cases:
- Faculty pages
- provider directories
- department staff pages

### 4. Registry sweeps
Use authoritative rosters to anchor identity.

Targets:
- DORA active psychologist roster
- NPI Registry psychology taxonomies
- Colorado Information Marketplace license data
- ABFP diplomates
- ABPP diplomates
- CPA members

Use cases:
- license validation
- active/inactive filtering
- duplicate detection

### 5. Forensic/court sweeps
Most useful for Psygil's audience.

Targets:
- judicial district evaluator rosters
- competency evaluator lists
- PRE/CFI rosters
- SOMB approved providers

Use cases:
- forensic psychologists
- court-facing clinicians
- evaluators with public contact details

## Agent workflow

1. Start with a lane.
2. Capture candidate names.
3. Open profile or roster entries.
4. Extract public fields:
   - name
   - degree
   - license number
   - license status
   - city
   - phone
   - email if public
   - website
   - specialties
   - accepting-new-patients text
5. Cross-check against DORA.
6. Write to CSV.
7. Deduplicate.

## Merge priority

Most authoritative first:
1. DORA
2. NPI
3. ABFP / ABPP / SOMB
4. Hospital or university directory
5. Psychology Today
6. Practice website
7. Manual notes

## Practical note

Psychology Today is best treated as a discovery index, not the master roster.
Use it to find names, then validate and enrich elsewhere.
