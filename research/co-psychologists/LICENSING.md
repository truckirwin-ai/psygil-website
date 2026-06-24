# Licensed / paid access — Colorado psychologist roster

Pricing and access analysis for the data sources blocked from inside the Cowork sandbox. All prices are operator-facing — paid by Foundry SMB if pursued. Verified May 2026.

## TL;DR

The cheapest comprehensive path is **Colorado Information Marketplace + NPI Registry**, both **free**. They give name, license number, license status, taxonomy, practice address, and practice phone for essentially every licensed Colorado psychologist with a billing footprint. They do **not** give email. Email enrichment requires either a paid append (CarePrecise, ~$0.10-$0.30/email after a $90 floor) or a multi-day website-crawl run.

The expensive paths (Definitive Healthcare, IQVIA, ZoomInfo) are over-spec for this list and start at $25K/yr. Skip unless you already license one of them for other purposes.

## Source-by-source

### 1. NPI Registry (NPPES)
**Cost:** Free.
**Access:** Public REST API at `https://npiregistry.cms.hhs.gov/api/?version=2.1`. No auth. 200 records per call. Also available as a full monthly file dump (~6 GB compressed).
**ToS:** Public domain. No restrictions on bulk use.
**Yields:** Name, NPI, practice address, practice phone, taxonomy, enumeration date, sole-proprietor flag.
**Missing:** Email. Not even commercially available providers' emails.

### 2. Colorado Information Marketplace (DORA licensee data)
**Cost:** Free.
**Access:** `https://data.colorado.gov/resource/7s5z-vewr.json` — Socrata SODA API. Free anonymous tier is rate-limited (`X-App-Token` header lifts the throttle, also free — sign up at data.colorado.gov/signup).
**ToS:** Open data, public records. No commercial restrictions.
**Yields:** License number, holder name, license type (PSY, PSP, PSYC, PSYRX), status, expiration, original issue date, county where on file. Updated nightly.
**Missing:** Phone, address, email. License roster is name + license only.

### 3. DORA CORA fallback
**Cost:** $0.25 per page printed; $25/hr DORA staff time after the first hour; $30/hr attorney review if redaction is needed; $28 per box retrieval.
**Access:** Email `dora_doraweb@state.co.us` with a written request citing C.R.S. § 24-72-203. Response within 3 business days, often longer.
**ToS:** Public records.
**Yields:** Same as CIM (sometimes with extra fields like ZIP). Use only if CIM dataset is incomplete or you need a snapshot for legal record.

### 4. Psychology Today directory
**Cost (official):** No official B2B license or API. They sell listings to providers ($29-$45/mo per listing), not data licenses to consumers.
**Cost (third-party scrapers — at your own ToS risk):** Apify hosts several Psychology Today scrapers built by independent developers (`voyn/psychologytoday-scraper-therapist-psychiatrist-leads`, `jungle_synthesizer/psychology-today-therapist-scraper`, `memo23/psychologytoday-scraper`, `tropical_quince/psychology-today-scraper`, `consummate_mandala/psychology-today-scraper`). Apify billing is consumption-based (compute units + memory-time); for therapist scrapers, expect roughly **$0.50-$2.00 per 1,000 records** on top of the Apify base plan ($49/mo Personal, $499/mo Team).
**ToS:** Psychology Today Section 4 prohibits automated access and non-personal use. Using a scraper violates their ToS. Sussex Directories has sent takedown notices to commercial users. If this matters to you legally (and given the legal-software audience for Psygil, it should), don't use any scraper here. Use manual operator browsing, or contact Sussex Directories' partnerships team for a licensed data agreement.
**Yields:** Name, credentials, address, phone, specialties, accepted insurances, website URL, photo.
**Missing:** Email (Psychology Today routes contact through their on-site form to protect listed providers).

### 5. CarePrecise (NPI + email append)
**Cost (verified May 2026):**
- *Complete Provider Database*: **$599** one-time for the full US file (NPI-derived; updated monthly download for 12 months included with most tiers).
- *Complete Gold* (with extended demographics): higher tier, undisclosed flat price — quote required.
- *Email append* (premium add-on): **$250 minimum order + $90 processing fee**; per-email pricing scales down with volume. Quoted around $0.20-$0.30 per email at typical clinician volumes; lower at >50K.
- *Claimed coverage*: 96% of US clinicians have a CarePrecise record; >50% have a deliverable email.
**Access:** Order on careprecise.com; CSV delivered.
**ToS:** Commercial use allowed under license. Re-distribution not allowed.
**Yields:** Everything NPI gives, plus emails (where available), plus cell phones (premium tier), plus marketing flags.
**Recommendation:** This is the **realistic budget option** if you want emails. Buy the $599 base file, filter to CO + psychology taxonomies (~4,000 records), then order an email append (~$250-$500 for that slice). Total: under $1,000.

### 6. Definitive Healthcare — PhysicianView
**Cost:** **$25,000-$100,000+ per year**, multi-year contracts standard. Sales-quoted.
**Access:** Web platform + CSV/API export.
**ToS:** Heavy commercial license; per-seat; export restrictions.
**Yields:** 3M+ providers with claims-derived intelligence (referral patterns, practice affiliations), email, direct dial.
**Recommendation:** Overkill for this list. Justified only if you also need claims analytics or hospital intelligence.

### 7. IQVIA OneKey
**Cost:** Enterprise — six-figure annual. Not publicly listed.
**Yields:** Pharma-grade HCP master data; highly accurate identity resolution.
**Recommendation:** Skip unless integrating with a pharma CRM.

### 8. ZoomInfo / Apollo (B2B contact databases)
**Cost:** ZoomInfo starts ~$15,000/yr for the lowest tier with bulk export. Apollo Pro is ~$99/user/month with bulk export caps.
**Yields:** Direct dial, work email, LinkedIn for business contacts including clinicians.
**Caveat:** Coverage on private-practice clinicians is patchy — these tools index corporate footprints, so a solo practitioner with no LinkedIn won't appear.
**Recommendation:** Useful for the institutional psychologist tier (hospital-employed, university faculty) but not for solo practices.

### 9. Apify (general scraping platform)
**Cost (verified May 2026):**
- Free tier: $5 in platform credits/month — enough to scrape a few thousand records once.
- Personal: **$49/mo** ($60 in platform credits).
- Team: **$499/mo** ($500 platform credits + 9 seats).
- Actor-specific pricing on top (each scraper sets its own per-result or per-event fee; psychology-today actors typically charge nothing extra beyond compute, or a small per-record fee like $1/1,000).
**Recommendation:** Useful for sources without ToS conflicts (court roster PDFs, university faculty pages, hospital provider lookups). **Do not point at Psychology Today** per the ToS analysis above.

### 10. Court roster acquisition (forensic relevance)
**Cost:** Free in most districts; some charge a CORA-style fee for compiled rosters.
**Access:** Email each district's court administrator. Typical turnaround: 1-3 weeks.
- 1st Judicial District (Jefferson/Gilpin): `admin@judicial.state.co.us` for the 1st JD
- 2nd JD (Denver): Denver District Court clerk
- 4th JD (El Paso/Teller): clerk at the Terry R. Ruckriegle Judicial Building
- 8th JD (Larimer): Fort Collins courthouse
- 17th JD (Adams/Broomfield): Adams County Justice Center
- 18th JD (Arapahoe/Douglas/Elbert/Lincoln): Arapahoe County Justice Center
- 19th JD (Weld): Weld County Courthouse
- 20th JD (Boulder): Boulder County Justice Center
- 10th JD (Pueblo): Pueblo Judicial Building
**Recommendation:** For Psygil's audience (court-grade forensic), these rosters are the gold standard. Worth the time.

### 11. Colorado Sex Offender Management Board (SOMB) approved provider list
**Cost:** Free.
**Access:** PDF download from `dcj.colorado.gov/dcj-offices/odvsom/somb`. The "Find an Approved Provider" page hosts the current list; historical attachments are on `cdpsdocs.state.co.us` and `spl.cde.state.co.us`.
**Yields:** Name, license, contact, region, populations served, status (full/associate).
**Use:** High-signal source for forensic-adjacent psychologists who do court-ordered work.

## Budget summary

| Option | Up-front | Recurring | Time to data |
|---|---|---|---|
| CIM + NPI + manual court rosters (no emails) | $0 | $0 | ~2 weeks |
| Above + CarePrecise base + email append | ~$850 | $0 | ~3 weeks |
| Above + Apify for safe scraping | $850 | $49-$499/mo for as long as needed | ~3 weeks |
| Definitive Healthcare PhysicianView | $25K-$100K | Annual | 1 week |

**My recommendation for Psygil:** CIM + NPI as the foundation, manual harvest of court rosters and ABFP diplomate list for the forensic subset (highest relevance to product audience), CarePrecise email append for the practices you actually want to contact. Total realistic cost: **under $1,000** for a list that's good enough to start outbound from.
