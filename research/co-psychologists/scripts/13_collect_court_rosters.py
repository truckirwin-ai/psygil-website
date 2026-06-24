#!/usr/bin/env python3
"""
Court roster lane.

Builds a queue for the district-by-district evaluator rosters that matter for
forensic psychologists.
"""
from __future__ import annotations

import csv
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "court_roster_queue.csv"

DISTRICTS = [
    ("court", "1st Judicial District"),
    ("court", "2nd Judicial District"),
    ("court", "4th Judicial District"),
    ("court", "8th Judicial District"),
    ("court", "10th Judicial District"),
    ("court", "17th Judicial District"),
    ("court", "18th Judicial District"),
    ("court", "19th Judicial District"),
    ("court", "20th Judicial District"),
]


def main() -> None:
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["lane", "target", "status", "notes"])
        writer.writeheader()
        for lane, target in DISTRICTS:
            writer.writerow({
                "lane": lane,
                "target": target,
                "status": "pending",
                "notes": "request current evaluator roster or public PDF from district clerk / administrator",
            })
    print(f"Wrote {len(DISTRICTS)} court roster tasks to {OUT}")


if __name__ == "__main__":
    main()
