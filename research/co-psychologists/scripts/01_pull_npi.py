#!/usr/bin/env python3
"""
Pull Colorado psychologists from the NPI Registry.

API:   https://npiregistry.cms.hhs.gov/api/?version=2.1
Docs:  https://npiregistry.cms.hhs.gov/registry/help-api
Auth:  none. Public.

Filters: state=CO, plus each psychology-family taxonomy code. Iterates with
limit=200, skip=0..1000 (API cap). Filters to Front Range cities client-side.

Output: ../data/npi.csv with columns matching the project schema.
"""
from __future__ import annotations
import csv
import json
import sys
import time
from pathlib import Path

import requests
from tqdm import tqdm

API = "https://npiregistry.cms.hhs.gov/api/"
VERSION = "2.1"
LIMIT = 200
MAX_SKIP = 1000  # NPI API hard cap

# Psychology family taxonomies. The NPI API accepts taxonomy descriptions, not
# taxonomy codes, so keep these close to the registry's published labels.
PSYCHOLOGY_TAXONOMIES = {
    "103T00000X": "Psychologist",
    "103TA0700X": "Psychologist, Adult Development & Aging",
    "103TC0700X": "Psychologist, Clinical",
    "103TC1900X": "Psychologist, Cognitive & Behavioral",
    "103TC2200X": "Psychologist, Clinical Child & Adolescent",
    "103TE1000X": "Psychologist, Educational",
    "103TE1100X": "Psychologist, Exercise & Sports",
    "103TF0000X": "Psychologist, Family",
    "103TF0200X": "Psychologist, Forensic",
    "103TH0004X": "Psychologist, Health Service",
    "103TH0100X": "Psychologist, Health",
    "103TM1800X": "Psychologist, Intellectual & Developmental Disabilities",
    "103TP0016X": "Psychologist, Prescribing (Medical)",
    "103TP0814X": "Psychologist, Psychoanalysis",
    "103TP2700X": "Psychologist, Psychotherapy",
    "103TP2701X": "Psychologist, Psychotherapy, Child & Adolescent",
    "103TR0400X": "Psychologist, Rehabilitation",
    "103TS0200X": "Psychologist, School",
}

FRONT_RANGE_CITIES = {
    "arvada", "aurora", "boulder", "brighton", "broomfield", "castle rock",
    "centennial", "cherry hills village", "colorado springs", "commerce city",
    "denver", "englewood", "erie", "evergreen", "fort collins", "fountain",
    "golden", "greeley", "greenwood village", "highlands ranch", "lafayette",
    "lakewood", "littleton", "lone tree", "longmont", "louisville", "loveland",
    "monument", "northglenn", "parker", "pueblo", "pueblo west", "superior",
    "thornton", "westminster", "wheat ridge", "windsor",
}

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "npi.csv"


def fetch_taxonomy(code: str) -> list[dict]:
    rows = []
    for skip in range(0, MAX_SKIP + 1, LIMIT):
        params = {
            "version": VERSION,
            "state": "CO",
            "taxonomy_description": PSYCHOLOGY_TAXONOMIES[code],
            "limit": LIMIT,
            "skip": skip,
        }
        for attempt in range(4):
            try:
                r = requests.get(API, params=params, timeout=30)
                r.raise_for_status()
                data = r.json()
                break
            except Exception as e:
                if attempt == 3:
                    print(f"  ! {code} skip={skip} failed: {e}", file=sys.stderr)
                    return rows
                time.sleep(2 ** attempt)
        results = data.get("results", [])
        if not results:
            break
        rows.extend(results)
        if len(results) < LIMIT:
            break
        time.sleep(0.4)  # polite rate limit
    return rows


def normalize(record: dict, taxonomy_name: str) -> dict:
    basic = record.get("basic", {})
    addrs = record.get("addresses", [])
    practice = next((a for a in addrs if a.get("address_purpose") == "LOCATION"), addrs[0] if addrs else {})
    org = basic.get("organization_name") or ""
    first = basic.get("first_name") or ""
    last = basic.get("last_name") or ""
    credential = basic.get("credential") or ""
    person = " ".join(p for p in [first, last] if p)
    if credential:
        person = f"{person}, {credential}".strip(", ")
    practice_name = org or person
    director = person if not org else person  # for sole proprietors, person == practice
    return {
        "Practice Name": practice_name,
        "Chief Doctor / Director": director,
        "Phone": practice.get("telephone_number", ""),
        "Address": ", ".join(
            x for x in [
                practice.get("address_1", ""),
                practice.get("address_2", ""),
                practice.get("city", ""),
                f"{practice.get('state', '')} {practice.get('postal_code', '')}".strip(),
            ] if x
        ),
        "Specialties": taxonomy_name.lower(),
        "Contact Email": "",
        "City": (practice.get("city") or "").title(),
        "County": "",  # NPI doesn't provide county; fill via zip lookup later if needed
        "Source": "npi",
        "NPI": record.get("number", ""),
        "License": "",
        "Last Verified": time.strftime("%Y-%m-%d"),
    }


def main() -> None:
    all_rows: dict[str, dict] = {}
    for code, name in tqdm(PSYCHOLOGY_TAXONOMIES.items(), desc="taxonomies"):
        recs = fetch_taxonomy(code)
        for rec in recs:
            row = normalize(rec, name)
            city = row["City"].lower()
            if city not in FRONT_RANGE_CITIES:
                continue
            npi = row["NPI"]
            existing = all_rows.get(npi)
            if existing:
                existing["Specialties"] = "; ".join(sorted(set(
                    existing["Specialties"].split("; ") + [name.lower()]
                )))
                continue
            all_rows[npi] = row

    if not all_rows:
        print("No NPI rows returned. Confirm network access and NPI API parameters.")
        return

    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(next(iter(all_rows.values())).keys()))
        writer.writeheader()
        for row in sorted(all_rows.values(), key=lambda r: (r["City"], r["Practice Name"])):
            writer.writerow(row)
    print(f"Wrote {len(all_rows)} unique NPI records to {OUT}")


if __name__ == "__main__":
    main()
