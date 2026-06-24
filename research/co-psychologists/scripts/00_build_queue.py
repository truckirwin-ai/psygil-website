#!/usr/bin/env python3
"""
Build a discovery queue for agent-run sweeps.

This does not collect any provider data. It emits a task list that can be
worked lane-by-lane:
  - locale sweeps
  - specialty sweeps
  - institution sweeps
  - board/registry sweeps
  - forensic/court sweeps

Output: ../data/queue.csv
"""
from __future__ import annotations

import csv
import time
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "queue.csv"

LANES = [
    ("locale", "Denver"),
    ("locale", "Colorado Springs"),
    ("locale", "Boulder"),
    ("locale", "Fort Collins"),
    ("locale", "Aurora"),
    ("locale", "Broomfield"),
    ("locale", "Centennial"),
    ("locale", "Littleton"),
    ("locale", "Lakewood"),
    ("locale", "Longmont"),
    ("locale", "Loveland"),
    ("locale", "Greeley"),
    ("locale", "Pueblo"),
    ("specialty", "forensic"),
    ("specialty", "neuropsychology"),
    ("specialty", "child"),
    ("specialty", "adolescent"),
    ("specialty", "trauma"),
    ("specialty", "assessment"),
    ("specialty", "testing"),
    ("specialty", "EMDR"),
    ("specialty", "autism"),
    ("specialty", "ADHD"),
    ("institution", "UCHealth"),
    ("institution", "Denver Health"),
    ("institution", "Children's Hospital Colorado"),
    ("institution", "VA Eastern Colorado Health Care System"),
    ("institution", "CU Boulder"),
    ("institution", "CU Denver"),
    ("institution", "CU Anschutz"),
    ("institution", "Colorado State University"),
    ("institution", "University of Northern Colorado"),
    ("institution", "University of Denver"),
    ("institution", "UCCS"),
    ("institution", "Regis"),
    ("registry", "DORA active psychologists"),
    ("registry", "NPI psychology taxonomies"),
    ("registry", "ABFP diplomates"),
    ("registry", "ABPP diplomates"),
    ("registry", "CPA public directory"),
    ("forensic", "SOMB approved providers"),
    ("forensic", "district court evaluator rosters"),
]


def main() -> None:
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["lane", "target", "priority", "status", "last_run"])
        writer.writeheader()
        for i, (lane, target) in enumerate(LANES, 1):
            writer.writerow({
                "lane": lane,
                "target": target,
                "priority": i,
                "status": "pending",
                "last_run": "",
            })
    print(f"Wrote {len(LANES)} queue items to {OUT}")


if __name__ == "__main__":
    main()
