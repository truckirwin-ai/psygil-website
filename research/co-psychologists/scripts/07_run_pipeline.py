#!/usr/bin/env python3
"""
Run the local Colorado psychologist pipeline in order.

This script runs the pieces that can work with existing local inputs:
  - build queue
  - merge/dedupe

It intentionally does not call live network collectors here, because this
environment cannot reach the external source domains.
"""
from __future__ import annotations

import subprocess
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def run(script: str) -> None:
    path = ROOT / script
    print(f"\n==> {script}")
    subprocess.run([sys.executable, str(path)], check=True)


def main() -> None:
    run("00_build_queue.py")
    run("04_merge_dedupe.py")


if __name__ == "__main__":
    main()
