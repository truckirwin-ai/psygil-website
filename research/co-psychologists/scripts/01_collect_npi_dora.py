#!/usr/bin/env python3
"""
Collect the identity backbone from NPI and Colorado DORA/CIM.

This is the authoritative spine for the roster:
- NPI adds practice phone/address/taxonomy
- DORA adds license number and active status

Output:
- ../data/npi.csv
- ../data/dora.csv

This script is intentionally separate from the specialty / institution lanes
so the master identity table can be refreshed independently.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run(script: str) -> None:
    subprocess.run([sys.executable, str(ROOT / script)], check=True)


def main() -> None:
    run("01_pull_npi.py")
    run("02_pull_dora_cim.py")


if __name__ == "__main__":
    main()
