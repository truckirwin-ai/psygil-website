#!/usr/bin/env python3
"""
Search-based contact enrichment for Colorado psychologist roster rows.

Input:  ../data/enriched.csv
Output: ../data/contact_search_first100.csv by default

For each of the first N rows, this script:
  1. Builds a search query from name + city + "psychologist Colorado".
  2. Uses Bing's HTML result page to find public profile/practice pages.
  3. Fetches a small number of promising result pages.
  4. Extracts public email addresses, phone numbers, and Colorado street
     addresses from visible HTML.

It is deliberately conservative:
  - no hidden-email guessing
  - excludes DORA and generic NPI pages as contact sources
  - preserves existing roster values when they already exist
  - writes source URLs for every enriched field
"""
from __future__ import annotations

import argparse
import base64
import csv
import html
import re
import sys
import time
from pathlib import Path
from urllib.parse import parse_qs, quote_plus, unquote, urljoin, urlparse

import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT = DATA_DIR / "enriched.csv"
DEFAULT_OUT = DATA_DIR / "contact_search_first100.csv"

HEADERS = {
    "User-Agent": "Foundry SMB research contact enrichment (contact: truckirwin@gmail.com)",
    "Accept": "text/html,application/xhtml+xml",
}

SEARCH_URL = "https://www.bing.com/search?q={query}"
REQUEST_TIMEOUT = 8
SEARCH_DELAY = 1.0
PAGE_DELAY = 0.3
MAX_RESULTS = 6

EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
MAILTO_RE = re.compile(r"mailto:([^\"'?#>\s]+)", re.I)
PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}")
ADDRESS_RE = re.compile(
    r"\b\d{2,6}\s+[A-Za-z0-9.#'\- ]{3,80}?"
    r"(?:Street|St|Avenue|Ave|Road|Rd|Boulevard|Blvd|Drive|Dr|Lane|Ln|Way|Court|Ct|Circle|Cir|Parkway|Pkwy|Place|Pl|Suite|Ste)"
    r"[^,\n]{0,80},\s*[A-Za-z .'-]+,\s*CO\s+\d{5}(?:-\d{4})?\b",
    re.I,
)

EXCLUDED_HOST_PARTS = {
    "colorado.gov",
    "npiregistry.cms.hhs.gov",
    "radaris.com",
    "fastpeoplesearch.com",
    "truepeoplesearch.com",
    "duckduckgo.com",
    "bing.com",
    "google.com",
    "yahoo.com",
    "wikipedia.org",
    "wikimedia.org",
    "biblegateway.com",
    "biblehub.com",
    "kingjamesbibleonline.org",
    "bible.com",
    "christianity.com",
    "nameberry.com",
    "behindthename.com",
    "babynames.com",
    "britannica.com",
    "imdb.com",
    "netflix.com",
    "justwatch.com",
}

PSYCH_SIGNAL_RE = re.compile(r"\b(psychologist|psychology|psyd|phd|therapy|therapist|counseling|assessment|neuropsych|behavioral health)\b", re.I)

GENERIC_EMAIL_LOCAL_PARTS = {
    "noreply",
    "no-reply",
    "donotreply",
    "webmaster",
    "postmaster",
}


def clean_text(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"<script\b.*?</script>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<style\b.*?</style>", " ", value, flags=re.I | re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    value = re.sub(r"\s+", " ", value)
    return value.strip()


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    if len(digits) != 10:
        return value.strip()
    return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"


def decode_result_url(href: str) -> str:
    href = html.unescape(href or "")
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("/"):
        href = urljoin("https://duckduckgo.com", href)
    parsed = urlparse(href)
    qs = parse_qs(parsed.query)
    if "uddg" in qs and qs["uddg"]:
        return unquote(qs["uddg"][0])
    if "q" in qs and qs["q"]:
        q = unquote(qs["q"][0])
        if q.startswith("http"):
            return q
    if "u" in qs and qs["u"]:
        value = qs["u"][0]
        if value.startswith("a1"):
            value = value[2:]
        try:
            padded = value + "=" * (-len(value) % 4)
            decoded = base64.urlsafe_b64decode(padded).decode("utf-8", "replace")
            if decoded.startswith("http"):
                return decoded
        except Exception:
            pass
    return href


def is_candidate_url(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if not host or parsed.scheme not in {"http", "https"}:
        return False
    return not any(part in host for part in EXCLUDED_HOST_PARTS)


def search_urls(query: str) -> list[str]:
    url = SEARCH_URL.format(query=quote_plus(query))
    try:
        r = requests.get(url, headers={**HEADERS, "User-Agent": "Mozilla/5.0"}, timeout=REQUEST_TIMEOUT)
        r.raise_for_status()
    except requests.RequestException:
        return []
    links: list[str] = []
    html_text = r.text
    hrefs = re.findall(r'<li class="b_algo"[\s\S]*?<h2[\s\S]*?<a[^>]+href="([^"]+)"', html_text)
    if not hrefs:
        hrefs = re.findall(r'href="([^"]+)"', html_text)
    for href in hrefs:
        decoded = decode_result_url(href)
        if not is_candidate_url(decoded):
            continue
        if any(decoded.lower().endswith(ext) for ext in [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"]):
            continue
        if decoded not in links:
            links.append(decoded)
        if len(links) >= MAX_RESULTS:
            break
    time.sleep(SEARCH_DELAY)
    return links


def extract_contacts(page_html: str, row: dict) -> dict:
    text = clean_text(page_html)
    emails = []
    for value in MAILTO_RE.findall(page_html) + EMAIL_RE.findall(page_html):
        value = value.strip().rstrip(".,;:")
        local = value.split("@", 1)[0].lower()
        if local in GENERIC_EMAIL_LOCAL_PARTS:
            continue
        if value.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")):
            continue
        if value not in emails:
            emails.append(value)

    phones = []
    for value in PHONE_RE.findall(text):
        phone = normalize_phone(value)
        if phone not in phones:
            phones.append(phone)

    addresses = []
    for value in ADDRESS_RE.findall(text):
        value = re.sub(r"\s+", " ", value).strip().rstrip(".,;")
        city = (row.get("City") or "").lower()
        if city and city not in value.lower():
            continue
        if value not in addresses:
            addresses.append(value)

    return {
        "email": emails[0] if emails else "",
        "phone": phones[0] if phones else "",
        "address": addresses[0] if addresses else "",
    }


def identity_matches(page_html: str, row: dict) -> bool:
    text = clean_text(page_html).lower()
    if not PSYCH_SIGNAL_RE.search(text):
        return False
    names = [
        row.get("Chief Doctor / Director") or "",
        row.get("Practice Name") or "",
    ]
    for name in names:
        tokens = [t for t in norm_identity_tokens(name) if len(t) > 2]
        if not tokens:
            continue
        if len(tokens) >= 2 and tokens[0] in text and tokens[-1] in text:
            return True
    return False


def norm_identity_tokens(name: str) -> list[str]:
    name = re.sub(r"\b(phd|psy\.?d|ed\.?d|lp|lcp|abpp|ma|ms|mba|llc|pllc|pc)\b", " ", name or "", flags=re.I)
    name = re.sub(r"[^a-zA-Z0-9]+", " ", name).lower()
    return name.split()


def fetch_contacts(url: str, row: dict) -> dict:
    try:
        r = requests.get(url, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
        ctype = r.headers.get("Content-Type", "")
        if r.status_code >= 400 or "text/html" not in ctype:
            return {}
    except requests.RequestException:
        return {}
    time.sleep(PAGE_DELAY)
    if not identity_matches(r.text, row):
        return {}
    return extract_contacts(r.text, row)


def build_query(row: dict) -> str:
    name = row.get("Chief Doctor / Director") or row.get("Practice Name") or ""
    name = re.sub(r",?\s*(PhD|PsyD|EdD|LP|LCP)\b\.?", "", name, flags=re.I).strip()
    city = row.get("City") or "Colorado"
    license_no = row.get("License") or ""
    parts = [f'"{name}"', "psychologist", city, "Colorado"]
    if license_no:
        parts.append(license_no.replace("PSY.", ""))
    return " ".join(p for p in parts if p)


def build_queries(row: dict) -> list[str]:
    base = build_query(row)
    name = row.get("Chief Doctor / Director") or row.get("Practice Name") or ""
    name = re.sub(r",?\s*(PhD|PsyD|EdD|LP|LCP)\b\.?", "", name, flags=re.I).strip()
    city = row.get("City") or "Colorado"
    return [
        base,
        f'site:psychologytoday.com/us/therapists "{name}" "{city}"',
        f'site:npiprofile.com "{name}" psychologist',
        f'site:locator.apa.org/profile "{name}"',
    ]


def enrich_row(row: dict) -> dict:
    out = dict(row)
    out.setdefault("Search Query", "")
    out.setdefault("Search Result URLs", "")
    out.setdefault("Contact Source URLs", "")
    out.setdefault("Found Phone", "")
    out.setdefault("Found Email", "")
    out.setdefault("Found Address", "")

    queries = build_queries(row)
    out["Search Query"] = " | ".join(queries)
    urls = []
    for query in queries:
        for url in search_urls(query):
            if url not in urls:
                urls.append(url)
            if len(urls) >= MAX_RESULTS:
                break
        if len(urls) >= MAX_RESULTS:
            break
    out["Search Result URLs"] = " | ".join(urls)

    contact_sources = []
    for url in urls:
        contacts = fetch_contacts(url, row)
        if not contacts:
            continue
        if not out.get("Found Email") and not out.get("Contact Email") and contacts.get("email"):
            out["Found Email"] = contacts["email"]
            contact_sources.append(url)
        if not out.get("Found Phone") and not out.get("Phone") and contacts.get("phone"):
            out["Found Phone"] = contacts["phone"]
            contact_sources.append(url)
        if not out.get("Found Address") and contacts.get("address"):
            current_address = out.get("Address", "")
            if len(current_address.split(",")) < 3:
                out["Found Address"] = contacts["address"]
                contact_sources.append(url)
        if (out.get("Found Email") or out.get("Contact Email")) and (out.get("Found Phone") or out.get("Phone")):
            if out.get("Found Address") or len((out.get("Address") or "").split(",")) >= 3:
                break

    out["Contact Source URLs"] = " | ".join(dict.fromkeys(contact_sources))
    if out.get("Found Email") and not out.get("Contact Email"):
        out["Contact Email"] = out["Found Email"]
    if out.get("Found Phone") and not out.get("Phone"):
        out["Phone"] = out["Found Phone"]
    if out.get("Found Address") and len((out.get("Address") or "").split(",")) < 3:
        out["Address"] = out["Found Address"]
    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--input", type=Path, default=INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUT)
    parser.add_argument("--all-states", action="store_true", help="Do not filter to rows whose address contains CO")
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"Missing input: {args.input}")

    with args.input.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        base_fields = list(rows[0].keys()) if rows else []

    eligible_rows = rows if args.all_states else [r for r in rows if ", CO" in (r.get("Address") or "")]
    target_rows = eligible_rows[: args.limit]
    extra_fields = [
        "Search Query",
        "Search Result URLs",
        "Contact Source URLs",
        "Found Phone",
        "Found Email",
        "Found Address",
    ]
    fieldnames = base_fields + [f for f in extra_fields if f not in base_fields]

    out_rows = []
    for i, row in enumerate(target_rows, 1):
        print(f"[{i}/{len(target_rows)}] {row.get('Practice Name')}", flush=True)
        enriched = enrich_row(row)
        out_rows.append(enriched)
        with args.output.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(out_rows)

    print(f"Wrote {len(out_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
