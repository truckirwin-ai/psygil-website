#!/usr/bin/env python3
"""
Board-directory lane.

This is the hook for ABPP and CPA public directories. In this sandbox, it
builds task queues rather than fetching live pages.
"""
from __future__ import annotations

import csv
from pathlib import Path

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DATA_DIR.mkdir(exist_ok=True)

OUT = DATA_DIR / "board_queue.csv"

TASKS = [
    ("board", "ABPP directory"),
    ("board", "CPA public directory"),
    ("board", "ABFP diplomates"),
]


def main() -> None:
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=["lane", "target", "status", "notes"])
        writer.writeheader()
        for lane, target in TASKS:
            writer.writerow({
                "lane": lane,
                "target": target,
                "status": "pending",
                "notes": "collect profiles, names, specialties, contact details, then cross-check DORA",
            })
    print(f"Wrote {len(TASKS)} board tasks to {OUT}")


if __name__ == "__main__":
    main()
