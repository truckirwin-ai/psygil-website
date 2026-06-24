#!/usr/bin/env python3
"""
Append verified browser-captured rows into the manual intake file.

Usage:
  python 11_append_manual_rows.py rows.csv

Input must already match the manual intake template columns.
"""
from __future__ import annotations

import csv
import sys
from pathlib import Path

TARGET = Path(__file__).resolve().parent.parent / "data" / "manual_intake_template.csv"


def main() -> None:
    if len(sys.argv) != 2:
        sys.exit("Usage: python 11_append_manual_rows.py rows.csv")
    src = Path(sys.argv[1])
    if not src.exists():
        sys.exit(f"Missing file: {src}")

    with TARGET.open(newline="", encoding="utf-8") as f:
        target_rows = list(csv.DictReader(f))
        fieldnames = target_rows[0].keys() if target_rows else None

    with src.open(newline="", encoding="utf-8") as f:
        new_rows = list(csv.DictReader(f))

    if not new_rows:
        sys.exit("No rows found in input file")

    if fieldnames is None:
        fieldnames = new_rows[0].keys()

    with TARGET.open("a", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=list(fieldnames))
        for row in new_rows:
            writer.writerow(row)

    print(f"Appended {len(new_rows)} rows to {TARGET}")


if __name__ == "__main__":
    main()
