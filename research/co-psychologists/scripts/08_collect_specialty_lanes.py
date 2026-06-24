#!/usr/bin/env python3
"""
Collect specialty-first sources.

This lane is where a lot of the hard-to-find Colorado psychologists live:
- forensic
- neuropsychology
- child/adolescent
- trauma / EMDR
- assessment / testing

Current implementation:
- ABFP diplomates
- seed rows from Psychology Today / manual notes already in co_psychologists.csv

This file exists as the hook for future specialty scrapers and manual exports.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run(script: str) -> None:
    subprocess.run([sys.executable, str(ROOT / script)], check=True)


def main() -> None:
    run("03_pull_abfp.py")


if __name__ == "__main__":
    main()
