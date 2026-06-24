# Data sources for Colorado Front Range psychologist roster

Comprehensive list of where psychologist and practice data can be obtained, with access notes and ToS posture. Read before pointing any script at a source.

## Tier 1 — authoritative public registries

**NPPES / NPI Registry**
URL: `https://npiregistry.cms.hhs.gov/api/?version=2.1`
Scope: Every healthcare provider in the US who bills insurance.
Filter: `state=CO` + taxonomy code in the psychology family.
Yields: Legal name, practice address, practice phone, taxonomy, enumeration date. No email.
Taxonomy codes for psychology family:
- 103T00000X Psychologist
- 103TA0700X Adult Development & Aging
- 103TC0700X Clinical
- 103TC1900X Cognitive & Behavioral
- 103TC2200X Clinical Child & Adolescent
- 103TE1000X Educational
- 103TE1100X Exercise & Sports
- 103TF0000X Family
- 103TF0200X Forensic
- 103TH0004X Health Service
- 103TH0100X Health
- 103TM1700X Men & Masculinity
- 103TM1800X Mental Retardation & Developmental Disabilities
- 103TP0016X Prescribing (Medical)
- 103TP0814X Psychoanalysis
- 103TP2700X Psychotherapy
- 103TP2701X Psychotherapy, Child & Adolescent
- 103TR0400X Rehabilitation
- 103TS0200X School
Access: Free, no auth, pagination via `limit` (max 200) + `skip`.
ToS: Public domain.

**Colorado DORA — Division of Professions and Occupations, Psychology Board**
URL: `https://apps.colorado.gov/dora/licensing/Lookup/LicenseLookup.aspx`
Scope: Every active and historical psychology licensee in Colorado.
Yields: Name, license number, status (active/inactive/expired/disciplined), expiration date, license type (PSY / PSYC). No email, no phone, no address.
Access: Stateful ASP.NET form, not bulk-scrapable. Better: file a CORA request to DORA at `dora_doraweb@state.co.us` for the active PSY licensee roster as a CSV.
ToS: Public records.

## Tier 2 — directories with specialty info

**Psychology Today**
URL: `https://www.psychologytoday.com/us/therapists/co/<city>`
Scope: Practitioners who pay for a listing (subset of total).
Yields: Practice name, practitioner name, address, phone, specialties, accepted insurances, website URL, often headshot.
Access: HTML; pagination; anti-bot measures (Cloudflare).
ToS: Section 4 prohibits automated access. Do not bulk-scrape. Manual export or licensed data partnership only.

Discovery use: search by city, specialty, or keyword, then validate against DORA.

**SAMHSA Behavioral Health Treatment Locator**
URL: `https://findtreatment.samhsa.gov/`
Scope: Substance use and mental health treatment facilities (subset relevant for psychology).
Yields: Facility name, address, phone, services.
Access: Has a downloadable CSV (National Directory of Drug and Alcohol Abuse Treatment Facilities).
ToS: Public domain.

## Tier 3 — specialty rosters

**American Board of Forensic Psychology (ABFP)**
URL: `https://www.abfp.com/find-a-diplomate`
Scope: Board-certified forensic psychologists. National list, filter by state.
Yields: Name, certification year, often institutional affiliation.
Access: Public HTML.

**American Board of Professional Psychology (ABPP)**
URL: `https://abpp.org/directory/`
Scope: All ABPP specialty diplomates (forensic, clinical, neuropsych, etc.).
Yields: Name, specialty, city, state.
Access: Public search.

**Colorado Psychological Association (CPA)**
URL: `https://www.coloradopsych.org/find-a-psychologist`
Scope: CPA members opted into the public Find a Psychologist directory.
Yields: Name, practice, specialties, contact link (often a form, not a direct email).
Access: Public.

Discovery use: good for private-practice clinicians who keep membership current.

## Tier 4 — court evaluator rosters (forensic relevance)

Colorado judicial districts each maintain their own roster of court-appointed evaluators (Child and Family Investigators, Parental Responsibilities Evaluators, competency evaluators, etc.). Not in any unified registry.

Front Range districts of interest:
- 1st: Jefferson, Gilpin — `courts.state.co.us/Courts/District/Index.cfm?District_ID=1`
- 2nd: Denver — `courts.state.co.us/Courts/District/Index.cfm?District_ID=2`
- 4th: El Paso, Teller — Colorado Springs courthouse
- 8th: Larimer — Fort Collins courthouse
- 10th: Pueblo
- 17th: Adams, Broomfield
- 18th: Arapahoe, Douglas, Elbert, Lincoln (largest district)
- 19th: Weld — Greeley courthouse
- 20th: Boulder

State-level: Office of the Child's Representative (OCR) maintains a competency evaluator roster for criminal court at `coloradochildrep.org`.

Access: Email each district's court administrator; rosters are often PDF.

## Tier 5 — institutional staff

**University faculty pages (.edu — scrapable):**
- CU Boulder Psychology and Neuroscience
- CU Denver Psychology
- CU Anschutz Psychiatry, Behavioral Health & Wellness
- Colorado State University Psychology
- University of Northern Colorado School of Psychological Sciences
- University of Colorado Colorado Springs Psychology
- University of Denver Graduate School of Professional Psychology
- Regis University

Discovery use: these are high-yield for PhD/PsyD faculty and training-clinic staff, especially when direct practice directories are sparse.

**Hospital staff (provider lookup tools):**
- UCHealth (`uchealth.org/find-a-provider`)
- Centura Health
- Children's Hospital Colorado
- Denver Health
- HealthONE

**Government:**
- VA Eastern Colorado Health Care System (Aurora, Colorado Springs CBOCs)
- CDOC Mental Health (Department of Corrections)
- Colorado Mental Health Hospital at Fort Logan, Pueblo

## Tier 6 — fee-based commercial datasets (mention only)

If budget exists for high-confidence email coverage:
- CarePrecise (NPI-derived with email append)
- IQVIA OneKey
- Definitive Healthcare
- ZoomInfo / Apollo (B2B contact databases)
These typically require an annual license and ToS-bound use. Out of scope unless purchased.

## Sources we will NOT use

- **Facebook listings**: ToS forbids automated collection; per-page manual review only.
- **Instagram / TikTok**: Same.
- **Google Maps scraping**: ToS forbids scraping without API; Places API requires billing setup and has per-request costs.
- **LinkedIn**: Strict ToS, frequent bans; manual research only.

## Dedup strategy

Match priority (top match wins):
1. Exact NPI number
2. Exact DORA license number
3. Exact phone number (E.164-normalized)
4. Fuzzy practice name (Jaro-Winkler > 0.92) + same zip
5. Fuzzy person name (Jaro-Winkler > 0.95) + same city

## Search strategy by lane

1. **Locale-first**: sweep one city at a time in Psychology Today, APA Locator, then local hospital and university pages.
2. **Specialty-first**: sweep forensic, neuropsych, child, trauma, and assessment pages to catch people that city searches miss.
3. **Institution-first**: sweep university and hospital directories to catch employed psychologists who do not advertise privately.
4. **Registry-first**: sweep DORA and NPI to anchor the master identity list, then enrich outward.
5. **Forensic-first**: sweep ABFP, ABPP, SOMB, and court rosters for the Psygil-relevant subset.

Field preference when merging:
- Practice Name: DORA practice → NPI Type 2 → Psychology Today → CPA
- Chief Doctor: DORA license holder → NPI Type 1 sole proprietor → Psychology Today
- Phone: NPI practice phone → Psychology Today → website
- Address: NPI practice location → DORA → Psychology Today
- Specialties: ABPP/ABFP specialty board → Psychology Today tags → NPI taxonomy
- Email: practice website crawl → Psychology Today contact link → manual
