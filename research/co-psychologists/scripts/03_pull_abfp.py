#!/usr/bin/env python3
"""
Pull American Board of Forensic Psychology (ABFP) diplomates in Colorado.

Source: https://www.abfp.com/find-a-diplomate
The ABFP "find a diplomate" page is HTML; this script fetches it, parses each
diplomate card, and filters to CO. The list is small (~80 nationwide as of 2024).

Adjust the CSS selectors below if ABFP rebuilds their site.
"""
from __future__ import annotations
import csv
import time
from pathlib import Path

import requests
from bs4 import BeautifulSoup

URL = "https://www.abfp.com/find-a-diplomate"
HEADERS = {
    "User-Agent": "Foundry SMB research crawler (truckirwin@gmail.com)",
}

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "abfp.csv"


def main() -> None:
    r = requests.get(URL, headers=HEADERS, timeout=30)
    r.raise_for_status()
    soup = BeautifulSoup(r.text, "lxml")

    # The current ABFP page lists diplomates inside .diplomate-card / .directory-entry
    # elements. Fall back to scanning <li> entries if those classes are missing.
    cards = soup.select(".diplomate-card, .directory-entry, li.diplomate")
    if not cards:
        cards = soup.find_all("li")

    rows = []
    for card in cards:
        text = " ".join(card.get_text(" ", strip=True).split())
        if " CO" not in f" {text} " and "Colorado" not in text:
            continue
        # Heuristic extraction; tune as needed.
        name = card.select_one(".name, .diplomate-name, h3")
        affiliation = card.select_one(".affiliation, .practice, .organization")
        city = card.select_one(".city, .location")
        rows.append({
            "Practice Name": (affiliation.get_text(strip=True) if affiliation else (name.get_text(strip=True) if name else "")),
            "Chief Doctor / Director": (name.get_text(strip=True) if name else ""),
            "Phone": "",
            "Address": "",
            "Specialties": "forensic; ABFP diplomate",
            "Contact Email": "",
            "City": (city.get_text(strip=True) if city else ""),
            "County": "",
            "Source": "abfp",
            "NPI": "",
            "License": "",
            "Last Verified": time.strftime("%Y-%m-%d"),
        })

    if not rows:
        print("No ABFP rows extracted. Inspect the page HTML and update the CSS selectors.")
        return
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} ABFP diplomates to {OUT}")


if __name__ == "__main__":
    main()
