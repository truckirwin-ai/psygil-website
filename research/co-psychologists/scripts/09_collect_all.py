#!/usr/bin/env python3
"""
Run the full local collection pipeline in the intended order.

This is the operator-facing launcher for:
1. queue generation
2. identity backbone
3. specialty lane
4. institution lane
4. merge / dedupe
5. email enrichment
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
    run("00_build_queue.py")
    run("01_collect_npi_dora.py")
    run("08_collect_specialty_lanes.py")
    run("10_collect_institutions.py")
    run("04_merge_dedupe.py")
    run("05_enrich_emails.py")


if __name__ == "__main__":
    main()
