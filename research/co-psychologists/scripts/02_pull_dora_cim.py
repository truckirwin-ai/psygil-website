#!/usr/bin/env python3
"""
Pull Colorado psychologist licensees from the Colorado Information Marketplace.

Dataset: Professional and Occupational Licenses in Colorado (7s5z-vewr)
URL:     https://data.colorado.gov/Regulations/Professional-and-Occupational-Licenses-in-Colorado/7s5z-vewr
API:     https://data.colorado.gov/resource/7s5z-vewr.json (SODA 2.1)
Auth:    optional X-App-Token (free, lifts throttling; sign up at data.colorado.gov/signup)

License type we want:
  PSY    Licensed Psychologist

Output: ../data/dora.csv with the project schema. License roster has no phone,
no address, no email -- it only authoritatively confirms "this name is the
holder of this active CO PSY license." Phone/address come from NPI merge later.
"""
from __future__ import annotations
import csv
import os
import sys
import time
from pathlib import Path

import requests
from tqdm import tqdm

DATASET = "7s5z-vewr"
API = f"https://data.colorado.gov/resource/{DATASET}.json"
APP_TOKEN = os.environ.get("CIM_APP_TOKEN", "")
PAGE = 5000  # SODA allows up to 50k but pagination is safer

LICENSE_TYPES = ["PSY"]

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "dora.csv"


def fetch(where_clause: str) -> list[dict]:
    rows = []
    offset = 0
    headers = {"X-App-Token": APP_TOKEN} if APP_TOKEN else {}
    while True:
        params = {"$where": where_clause, "$limit": PAGE, "$offset": offset}
        for attempt in range(4):
            try:
                r = requests.get(API, params=params, headers=headers, timeout=30)
                r.raise_for_status()
                data = r.json()
                break
            except Exception as e:
                if attempt == 3:
                    print(f"  ! offset={offset} failed: {e}", file=sys.stderr)
                    return rows
                time.sleep(2 ** attempt)
        if not data:
            break
        rows.extend(data)
        offset += PAGE
        if len(data) < PAGE:
            break
        time.sleep(0.4)
    return rows


def normalize(rec: dict) -> dict:
    first = rec.get("firstname") or rec.get("first_name") or ""
    middle = rec.get("middlename") or rec.get("middle_name") or ""
    last = rec.get("lastname") or rec.get("last_name") or ""
    name = " ".join(x for x in [first, middle, last] if x).strip()
    number = rec.get("licensenumber") or rec.get("license_number") or ""
    license_no = f"PSY.{int(number):07d}" if number.isdigit() else number
    profile = rec.get("linktoviewhealthcareprofile") or {}
    verify = rec.get("linktoverifylicense") or {}
    return {
        "Practice Name": name,           # DORA roster is person-level; treat name as practice
        "Chief Doctor / Director": name,
        "Phone": "",
        "Address": ", ".join(x for x in [
            (rec.get("city") or "").title(),
            rec.get("state") or "",
            rec.get("mailzipcode") or "",
        ] if x),
        "Specialties": "licensed psychologist",
        "Contact Email": "",
        "City": (rec.get("city") or "").title(),
        "County": "",
        "Source": "dora",
        "NPI": "",
        "License": license_no,
        "Last Verified": time.strftime("%Y-%m-%d"),
        "Profile URL": profile.get("url") or verify.get("url") or "",
        "License Status": rec.get("licensestatusdescription") or "",
        "License Expires": (rec.get("licenseexpirationdate") or "")[:10],
    }


def main() -> None:
    where = "(" + " OR ".join(f"licensetype='{t}'" for t in LICENSE_TYPES) + ") AND licensestatusdescription='Active'"
    recs = fetch(where)
    seen = set()
    rows = []
    for rec in tqdm(recs, desc="dora records"):
        row = normalize(rec)
        key = row["License"] or f"{row['Chief Doctor / Director']}|{row['City']}"
        if key in seen:
            continue
        seen.add(key)
        rows.append(row)
    if not rows:
        print("No DORA rows returned. Confirm the dataset schema field names "
              "(licensetype, licensenumber, firstname, lastname) match the current CIM schema.")
        return
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: (r["Chief Doctor / Director"])))
    print(f"Wrote {len(rows)} unique DORA licensees to {OUT}")


if __name__ == "__main__":
    main()
