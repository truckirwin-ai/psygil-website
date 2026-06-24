#!/usr/bin/env python3
"""
Enrich roster rows from DORA Healthcare Profile pages.

DORA license rows include Profile URL links. Those pages often expose public
practice-location and employer tables with street address and phone number.
This script fetches those profile pages and fills missing phone/address fields
from Colorado practice/employer records.
"""
from __future__ import annotations

import argparse
import csv
import html
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT = DATA_DIR / "enriched.csv"
OUT = DATA_DIR / "dora_profile_enriched.csv"

HEADERS = {
    "User-Agent": "Foundry SMB research DORA profile enrichment (contact: truckirwin@gmail.com)",
    "Accept": "text/html,application/xhtml+xml",
}
TIMEOUT = 12
DELAY = 0.05

PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}")
PROFILE_ROW_RE = re.compile(
    r"\|\s*(?P<address>\d{2,6}[^|]{3,120}?)\s*\|\s*\|\s*\|\s*"
    r"(?P<city>[A-Za-z .'-]+?)\s*\|\s*\|\s*\|\s*"
    r"(?P<state>Colorado|CO)\s*\|\s*\|\s*\|\s*"
    r"(?P<zip>\d{5}(?:-\d{4})?)\s*\|\s*\|\s*\|\s*"
    r"(?P<phone>(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4})",
    re.I,
)
EMPLOYER_ROW_RE = re.compile(
    r"\|\s*(?P<org>[A-Za-z0-9&.,'()/#\- ]{3,120}?)\s*\|\s*\|\s*\|\s*"
    r"(?P<address>\d{2,6}[^|]{3,120}?)\s*\|\s*\|\s*\|\s*"
    r"(?P<city>[A-Za-z .'-]+?)\s*\|\s*\|\s*\|\s*"
    r"(?P<state>Colorado|CO)\s*\|\s*\|\s*\|\s*"
    r"(?P<zip>\d{5}(?:-\d{4})?)\s*\|\s*\|\s*\|\s*"
    r"(?P<phone>(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4})",
    re.I,
)


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<script\b.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " | ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return value.strip()


def normalize_address(address: str, city: str, zip_code: str) -> str:
    address = re.sub(r"\s+", " ", address or "").strip().rstrip(".,;")
    city = re.sub(r"\s+", " ", city or "").strip().rstrip(".,;")
    return f"{address}, {city}, CO {zip_code}"


def extract_profile_contact(page_html: str) -> dict[str, str]:
    text = clean_text(page_html)
    employer_section = text.split("Healthcare Profile - Employment Contracts", 1)[0]
    for match in EMPLOYER_ROW_RE.finditer(employer_section):
        org = re.sub(r"\s+", " ", match.group("org")).strip().rstrip(".,;")
        if org.lower() in {"address", "employer name", "phone number"}:
            continue
        address = normalize_address(match.group("address"), match.group("city"), match.group("zip"))
        phone = normalize_phone(match.group("phone"))
        return {
            "DORA Profile Phone": phone,
            "DORA Profile Address": address,
            "DORA Profile Organization": org,
        }
    for match in PROFILE_ROW_RE.finditer(text):
        address = normalize_address(match.group("address"), match.group("city"), match.group("zip"))
        phone = normalize_phone(match.group("phone"))
        return {"DORA Profile Phone": phone, "DORA Profile Address": address, "DORA Profile Organization": ""}
    return {"DORA Profile Phone": "", "DORA Profile Address": "", "DORA Profile Organization": ""}


def fetch_profile(url: str) -> dict[str, str]:
    if not url:
        return {"DORA Profile Phone": "", "DORA Profile Address": ""}
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT)
        if r.status_code >= 400:
            return {"DORA Profile Phone": "", "DORA Profile Address": ""}
    except requests.RequestException:
        return {"DORA Profile Phone": "", "DORA Profile Address": ""}
    time.sleep(DELAY)
    return extract_profile_contact(r.text)


def has_street_address(row: dict) -> bool:
    return bool(re.search(r"\b\d{2,6}\s+", row.get("Address") or ""))


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=0, help="0 means all rows")
    parser.add_argument("--input", type=Path, default=INPUT)
    parser.add_argument("--output", type=Path, default=OUT)
    parser.add_argument("--workers", type=int, default=8)
    parser.add_argument("--missing-only", action="store_true")
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"Missing input: {args.input}")

    with args.input.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        base_fields = list(rows[0].keys()) if rows else []

    fieldnames = list(base_fields)
    for field in ["DORA Profile Phone", "DORA Profile Address"]:
        if field not in fieldnames:
            fieldnames.append(field)
    if "DORA Profile Organization" not in fieldnames:
        fieldnames.append("DORA Profile Organization")

    out_rows = [dict(row) for row in rows]
    targets = []
    for idx, row in enumerate(out_rows):
        row.setdefault("DORA Profile Phone", "")
        row.setdefault("DORA Profile Address", "")
        row.setdefault("DORA Profile Organization", "")
        if not row.get("Profile URL"):
            continue
        if args.missing_only and row.get("DORA Profile Phone") and row.get("DORA Profile Address"):
            continue
        targets.append((idx, row))
        if args.limit and len(targets) >= args.limit:
            break

    print(f"Fetching {len(targets)} DORA profiles with {args.workers} workers", flush=True)
    completed = 0
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        future_to_idx = {
            executor.submit(fetch_profile, row.get("Profile URL", "")): idx
            for idx, row in targets
        }
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            completed += 1
            try:
                contact = future.result()
            except Exception:
                contact = {"DORA Profile Phone": "", "DORA Profile Address": "", "DORA Profile Organization": ""}
            row = out_rows[idx]
            row.update(contact)
            if contact.get("DORA Profile Phone") and not row.get("Phone"):
                row["Phone"] = contact["DORA Profile Phone"]
            if contact.get("DORA Profile Address") and not has_street_address(row):
                row["Address"] = contact["DORA Profile Address"]
            if completed % 100 == 0 or completed == len(targets):
                print(f"completed {completed}/{len(targets)}", flush=True)

    with args.output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(out_rows)
    print(f"Wrote {len(out_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
