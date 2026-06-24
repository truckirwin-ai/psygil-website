#!/usr/bin/env python3
"""
Institution discovery lane.

This is a framework entrypoint for hospital and university psych directories.
In this sandbox, it does not fetch live institutional pages because the relevant
domains are blocked. It emits a task queue and reminds the operator which
sources to work manually or from a networked machine.
"""
from __future__ import annotations

import csv
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)
OUT = DATA_DIR / "institution_queue.csv"

INSTITUTIONS = [
    ("hospital", "UCHealth"),
    ("hospital", "Denver Health"),
    ("hospital", "Children's Hospital Colorado"),
    ("hospital", "VA Eastern Colorado Health Care System"),
    ("hospital", "HealthONE"),
    ("hospital", "Centura / CommonSpirit"),
    ("university", "CU Boulder"),
    ("university", "CU Denver"),
    ("university", "CU Anschutz"),
    ("university", "Colorado State University"),
    ("university", "University of Northern Colorado"),
    ("university", "University of Denver"),
    ("university", "UCCS"),
    ("university", "Regis University"),
]


def main() -> None:
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["lane", "target", "status", "notes"])
        writer.writeheader()
        for lane, target in INSTITUTIONS:
            writer.writerow({
                "lane": lane,
                "target": target,
                "status": "pending",
                "notes": "collect provider directory pages, faculty pages, or staff rosters",
            })
    print(f"Wrote {len(INSTITUTIONS)} institution tasks to {OUT}")


if __name__ == "__main__":
    main()
