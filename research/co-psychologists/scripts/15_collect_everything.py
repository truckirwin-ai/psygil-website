#!/usr/bin/env python3
"""
Operator-facing full process launcher.

This runs every local queue builder and collector hook in order, then merges
and enriches whatever live data is available in the current environment.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run(script: str) -> None:
    print(f"\n==> {script}")
    subprocess.run([sys.executable, str(ROOT / script)], check=True)


def main() -> None:
    for script in [
        "00_build_queue.py",
        "01_collect_npi_dora.py",
        "08_collect_specialty_lanes.py",
        "10_collect_institutions.py",
        "12_collect_boards.py",
        "13_collect_court_rosters.py",
        "14_collect_universities.py",
        "04_merge_dedupe.py",
        "05_enrich_emails.py",
    ]:
        run(script)


if __name__ == "__main__":
    main()
