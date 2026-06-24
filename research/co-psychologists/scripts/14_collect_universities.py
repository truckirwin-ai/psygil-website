#!/usr/bin/env python3
"""
University and hospital discovery lane queue.
"""
from __future__ import annotations

import csv
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "institution_targets.csv"

TARGETS = [
    ("university", "CU Boulder"),
    ("university", "CU Denver"),
    ("university", "CU Anschutz"),
    ("university", "Colorado State University"),
    ("university", "University of Northern Colorado"),
    ("university", "University of Denver"),
    ("university", "UCCS"),
    ("university", "Regis University"),
    ("hospital", "UCHealth"),
    ("hospital", "Denver Health"),
    ("hospital", "Children's Hospital Colorado"),
    ("hospital", "VA Eastern Colorado Health Care System"),
    ("hospital", "HealthONE"),
    ("hospital", "CommonSpirit / Centura"),
]


def main() -> None:
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["lane", "target", "status", "notes"])
        writer.writeheader()
        for lane, target in TARGETS:
            writer.writerow({
                "lane": lane,
                "target": target,
                "status": "pending",
                "notes": "collect faculty pages, staff pages, and provider directories",
            })
    print(f"Wrote {len(TARGETS)} institution targets to {OUT}")


if __name__ == "__main__":
    main()
