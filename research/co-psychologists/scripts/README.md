# Scripts

Run from any machine with public internet access. Cowork sandbox cannot reach the source domains.

```bash
cd research/co-psychologists/scripts
python3 -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt
```

Run in order. Each script writes to `../data/` (created automatically).

```bash
python 00_build_queue.py        # discovery queue -> ../data/queue.csv
python 01_collect_npi_dora.py   # identity backbone -> ../data/npi.csv and ../data/dora.csv
python 01_pull_npi.py            # NPI Registry  -> ../data/npi.csv
python 02_pull_dora_cim.py       # CO Info Marketplace -> ../data/dora.csv
python 03_pull_psychology_today.py  # Psychology Today browser crawl -> ../data/psychology_today.csv
python 04_pull_abfp.py           # ABFP diplomates -> ../data/abfp.csv
python 05_merge_dedupe.py        # merge all -> ../data/merged.csv
python 06_enrich_emails.py       # crawl websites -> ../data/enriched.csv
python 07_run_pipeline.py        # queue + merge quick verification
python 08_collect_specialty_lanes.py # specialty-first lane -> ../data/abfp.csv
python 10_collect_institutions.py # institution lane queue -> ../data/institution_queue.csv
python 12_collect_boards.py # board lane queue -> ../data/board_queue.csv
python 13_collect_court_rosters.py # court roster queue -> ../data/court_roster_queue.csv
python 14_collect_universities.py # university/hospital queue -> ../data/institution_targets.csv
python 11_append_manual_rows.py rows.csv # append browser-captured rows into manual intake
python 09_collect_all.py        # full operator-facing pipeline
python 15_collect_everything.py # all queues + collectors + merge + enrichment
python 16_enrich_contact_search.py --limit 100 # cautious public web contact search
python 17_enrich_dora_profiles.py --limit 100 # DORA profile practice phone/address enrichment
python 20_enrich_profile_links.py --limit 100 # domain-restricted PT/LinkedIn search
python 21_scrape_psychology_today_links.py # scrape public PT city listing URLs and merge by name
```

Final output: `../data/enriched.csv` (overwrite-safe; resumable per script).

For Psychology Today, this browser-driven crawler is designed to mimic normal navigation and then capture public listing data from each opened profile page. If site behavior changes, review the selectors in `03_pull_psychology_today.py`.

## Front Range city allowlist used everywhere

```
Arvada, Aurora, Boulder, Brighton, Broomfield, Castle Rock, Centennial,
Cherry Hills Village, Colorado Springs, Commerce City, Denver, Englewood,
Erie, Evergreen, Fort Collins, Fountain, Golden, Greeley, Greenwood Village,
Highlands Ranch, Lafayette, Lakewood, Littleton, Lone Tree, Longmont,
Louisville, Loveland, Monument, Northglenn, Parker, Pueblo, Pueblo West,
Superior, Thornton, Westminster, Wheat Ridge, Windsor
```

Edit the `FRONT_RANGE_CITIES` constant in `01_pull_npi.py` and `02_pull_dora_cim.py` to adjust.
