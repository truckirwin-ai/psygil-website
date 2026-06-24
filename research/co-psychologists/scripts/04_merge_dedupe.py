#!/usr/bin/env python3
"""
Merge sources (NPI + DORA + ABFP + manually-added rows) and dedupe.

Match priority (top match wins):
  1. Exact NPI
  2. Exact License
  3. Exact normalized phone
  4. Fuzzy practice name (rapidfuzz token_set >= 92) + same zip
  5. Fuzzy person name (rapidfuzz token_set >= 95) + same city

Field preference per column (most authoritative first):
  Practice Name        -> NPI Type 2 > DORA > ABFP > manual
  Chief Doctor         -> DORA > NPI > ABFP > manual
  Phone                -> NPI > manual
  Address              -> NPI > manual
  Specialties          -> ABFP > NPI taxonomy > manual (merged set)
  Contact Email        -> manual > enrichment script (handled in 05)
  City / County        -> NPI > DORA > manual
  Source               -> first source that produced the row
  NPI                  -> any source that has it (NPI wins ties)
  License              -> DORA > manual
"""
from __future__ import annotations
import csv
import re
from pathlib import Path
from typing import Iterable
from urllib.parse import urlparse

try:
    import phonenumbers
except Exception:  # pragma: no cover
    phonenumbers = None
try:
    from rapidfuzz import fuzz
except Exception:  # pragma: no cover
    fuzz = None

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
SOURCES = [
    ("npi", DATA_DIR / "npi.csv"),
    ("dora", DATA_DIR / "dora.csv"),
    ("abfp", DATA_DIR / "abfp.csv"),
    ("psychologytoday", DATA_DIR / "psychology_today.csv"),
    ("manual", DATA_DIR / "manual_intake_template.csv"),
]
MANUAL = DATA_DIR.parent / "co_psychologists.csv"  # the human-tended seed CSV
OUT = DATA_DIR / "merged.csv"

SOURCE_ALIASES = {
    "psychologytoday.com": "psychologytoday",
    "psychologytoday": "psychologytoday",
    "web": "website",
    "manual": "manual",
}

FIELDS = [
    "Practice Name", "Chief Doctor / Director", "Phone", "Contact Email",
    "Address", "Specialties", "City", "County", "Source",
    "NPI", "License", "Last Verified", "Profile URL",
    "Psychology Today URL", "LinkedIn URL", "Web Link", "Web Link Source",
    "Accepting New Patients",
    "License Status", "License Expires", "Website",
]

SOURCE_PRIORITY = {
    "Practice Name": ["npi", "dora", "abfp", "manual"],
    "Chief Doctor / Director": ["dora", "npi", "abfp", "manual"],
    "Phone": ["npi", "manual", "abfp", "dora"],
    "Address": ["npi", "manual", "dora", "abfp"],
    "City": ["npi", "dora", "manual", "abfp"],
    "County": ["dora", "npi", "manual", "abfp"],
    "License": ["dora", "manual", "npi", "abfp"],
    "NPI": ["npi", "manual", "dora", "abfp"],
    "Profile URL": ["manual", "psychologytoday", "npi", "dora", "abfp"],
    "Psychology Today URL": ["psychologytoday", "manual", "npi", "dora", "abfp"],
    "LinkedIn URL": ["manual", "psychologytoday", "npi", "dora", "abfp"],
    "Web Link": ["psychologytoday", "manual", "npi", "dora", "abfp"],
    "Web Link Source": ["psychologytoday", "manual", "npi", "dora", "abfp"],
    "Accepting New Patients": ["psychologytoday", "manual", "npi", "dora", "abfp"],
    "License Status": ["dora", "manual", "psychologytoday", "npi", "abfp"],
    "License Expires": ["dora", "manual", "psychologytoday", "npi", "abfp"],
    "Website": ["manual", "psychologytoday", "npi", "dora", "abfp"],
}


def norm_phone(p: str) -> str:
    if not p:
        return ""
    if phonenumbers:
        try:
            n = phonenumbers.parse(p, "US")
            if phonenumbers.is_valid_number(n):
                return phonenumbers.format_number(n, phonenumbers.PhoneNumberFormat.E164)
        except phonenumbers.NumberParseException:
            pass
    digits = re.sub(r"\D", "", p)
    return digits[-10:] if len(digits) >= 10 else digits


def norm_zip(addr: str) -> str:
    m = re.search(r"\b(\d{5})(-\d{4})?\b", addr or "")
    return m.group(1) if m else ""


def norm_name(name: str) -> str:
    name = (name or "").lower()
    name = re.sub(r"\b(phd|psy\.?d|ed\.?d|lp|lcp|abpp|ma|ms|mba)\b", " ", name)
    name = re.sub(r"[^a-z0-9]+", " ", name)
    return " ".join(name.split())


def load(path: Path, source: str) -> list[dict]:
    if not path.exists():
        return []
    with path.open(encoding="utf-8") as f:
        reader = csv.DictReader(f)
        out = []
        for row in reader:
            raw_source = (row.get("Source") or source).strip()
            row["Source"] = SOURCE_ALIASES.get(raw_source, raw_source)
            out.append(row)
        return out


def merge_rows(rows: list[dict]) -> dict:
    merged = {f: "" for f in FIELDS}
    sources_in_play = [r.get("Source", "") for r in rows]
    merged["Source"] = ";".join(dict.fromkeys(sources_in_play))
    # Pick each field from the most authoritative source that has a value.
    for field in FIELDS:
        if field in ("Source", "Specialties"):
            continue
        priority = SOURCE_PRIORITY.get(field, ["npi", "dora", "abfp", "manual"])
        for src in priority:
            for r in rows:
                if r.get("Source") == src and r.get(field):
                    merged[field] = r[field]
                    break
            if merged[field]:
                break
        if not merged[field]:
            for r in rows:
                if r.get(field):
                    merged[field] = r[field]
                    break
    # Specialties: merge as set.
    spec = set()
    for r in rows:
        for s in (r.get("Specialties") or "").split(";"):
            s = s.strip().lower()
            if s:
                spec.add(s)
    merged["Specialties"] = "; ".join(sorted(spec))
    # Last Verified: latest.
    dates = [r.get("Last Verified", "") for r in rows if r.get("Last Verified")]
    merged["Last Verified"] = max(dates) if dates else ""
    if not merged.get("Website"):
        for r in rows:
            source = (r.get("Source") or "").strip()
            profile = (r.get("Profile URL") or "").strip()
            candidate = source if "." in source and " " not in source else ""
            if not candidate and profile:
                host = urlparse(profile).netloc.lower()
                if host and not any(skip in host for skip in ["colorado.gov", "psychologytoday.com"]):
                    candidate = profile
            if candidate:
                merged["Website"] = candidate
                break
    return merged


def find_group(row: dict, groups: list[list[dict]]) -> int:
    npi = row.get("NPI")
    lic = row.get("License")
    phone = norm_phone(row.get("Phone", ""))
    zipc = norm_zip(row.get("Address", ""))
    name = row.get("Practice Name", "")
    person = row.get("Chief Doctor / Director", "")
    city = row.get("City", "")
    norm_person = norm_name(person or name)
    norm_practice = norm_name(name)
    for idx, group in enumerate(groups):
        for g in group:
            if npi and g.get("NPI") and npi == g["NPI"]:
                return idx
            if lic and g.get("License") and lic == g["License"]:
                return idx
            if phone and norm_phone(g.get("Phone", "")) == phone:
                return idx
            g_norm_person = norm_name(g.get("Chief Doctor / Director", "") or g.get("Practice Name", ""))
            g_norm_practice = norm_name(g.get("Practice Name", ""))
            if city and city.lower() == (g.get("City") or "").lower():
                if norm_person and norm_person in {g_norm_person, g_norm_practice}:
                    return idx
                if norm_practice and norm_practice in {g_norm_person, g_norm_practice}:
                    return idx
            if name and zipc and zipc == norm_zip(g.get("Address", "")):
                score = fuzz.token_set_ratio(name, g.get("Practice Name", "")) if fuzz else 100 if name.lower() == (g.get("Practice Name", "") or "").lower() else 0
                if score >= 92:
                    return idx
            if person and city and city.lower() == (g.get("City") or "").lower():
                score = fuzz.token_set_ratio(person, g.get("Chief Doctor / Director", "")) if fuzz else 100 if person.lower() == (g.get("Chief Doctor / Director", "") or "").lower() else 0
                if score >= 95:
                    return idx
    return -1


def main() -> None:
    all_rows: list[dict] = []
    for name, path in SOURCES:
        all_rows.extend(load(path, name))
    if MANUAL.exists():
        all_rows.extend(load(MANUAL, "manual"))

    groups: list[list[dict]] = []
    for r in all_rows:
        idx = find_group(r, groups)
        if idx < 0:
            groups.append([r])
        else:
            groups[idx].append(r)

    merged_rows = [merge_rows(g) for g in groups]
    merged_rows.sort(key=lambda r: (r.get("City", ""), r.get("Practice Name", "")))

    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(merged_rows)
    print(f"Merged {len(all_rows)} input rows from {sum(1 for _, p in SOURCES if p.exists())+int(MANUAL.exists())} sources into {len(merged_rows)} deduped records.")
    print(f"Wrote {OUT}")


if __name__ == "__main__":
    main()
