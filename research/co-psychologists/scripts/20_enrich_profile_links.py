#!/usr/bin/env python3
"""
Find public Psychology Today and LinkedIn profile URLs for roster rows.

This script uses domain-restricted Bing searches:
  - site:psychologytoday.com/us/therapists
  - site:linkedin.com/in

It writes two columns:
  - Psychology Today URL
  - LinkedIn URL

Psychology Today links are fetched and checked for name evidence when possible.
LinkedIn often blocks direct fetching, so LinkedIn links are accepted only from
search results whose title/snippet contain the provider name.
"""
from __future__ import annotations

import argparse
import base64
import csv
import html
import re
import sys
import time
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path
from urllib.parse import parse_qs, quote_plus, unquote, urljoin, urlparse

import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
INPUT = DATA_DIR / "enriched.csv"
OUT = DATA_DIR / "profile_links.csv"

HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "text/html,application/xhtml+xml"}
TIMEOUT = 8


def clean_name(value: str) -> str:
    value = re.sub(r",?\s*\b(phd|psy\.?d|ed\.?d|lp|lcp|abpp|ma|ms|mba)\b\.?", " ", value or "", flags=re.I)
    value = re.sub(r"[^a-zA-Z0-9' -]+", " ", value)
    return " ".join(value.split()).strip()


def name_tokens(value: str) -> list[str]:
    cleaned = clean_name(value).lower()
    return [t for t in re.sub(r"[^a-z0-9]+", " ", cleaned).split() if len(t) > 1]


def name_matches(text: str, row: dict) -> bool:
    text = html.unescape(text or "").lower()
    candidates = [
        row.get("Chief Doctor / Director") or "",
        row.get("Practice Name") or "",
    ]
    for candidate in candidates:
        tokens = name_tokens(candidate)
        if len(tokens) >= 2 and tokens[0] in text and tokens[-1] in text:
            return True
    return False


def decode_result_url(href: str) -> str:
    href = html.unescape(href or "")
    if href.startswith("//"):
        href = "https:" + href
    if href.startswith("/"):
        href = urljoin("https://www.bing.com", href)
    parsed = urlparse(href)
    qs = parse_qs(parsed.query)
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


def bing_results(query: str, domain_hint: str) -> list[tuple[str, str]]:
    try:
        r = requests.get("https://www.bing.com/search", params={"q": query}, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
    except requests.RequestException:
        return []
    results = []
    for block in re.findall(r'<li class="b_algo"[\s\S]*?</li>', r.text):
        href_match = re.search(r'<h2[\s\S]*?<a[^>]+href="([^"]+)"[\s\S]*?</h2>', block)
        if not href_match:
            continue
        url = decode_result_url(href_match.group(1))
        host = urlparse(url).netloc.lower()
        if domain_hint not in host:
            continue
        snippet = re.sub(r"<[^>]+>", " ", block)
        snippet = re.sub(r"\s+", " ", html.unescape(snippet)).strip()
        results.append((url, snippet))
    time.sleep(0.35)
    return results


def validate_psychology_today(url: str, row: dict) -> bool:
    if "/us/therapists/" not in url:
        return False
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code >= 400 or "text/html" not in r.headers.get("Content-Type", ""):
            return name_matches(url, row)
        return name_matches(r.text, row)
    except requests.RequestException:
        return name_matches(url, row)


def find_profile_links(row: dict) -> dict[str, str]:
    name = clean_name(row.get("Chief Doctor / Director") or row.get("Practice Name") or "")
    city = row.get("City") or "Colorado"
    out = {"Psychology Today URL": "", "LinkedIn URL": ""}
    if not name:
        return out

    pt_query = f'site:psychologytoday.com/us/therapists "{name}" "{city}"'
    for url, snippet in bing_results(pt_query, "psychologytoday.com"):
        if name_matches(snippet, row) and validate_psychology_today(url, row):
            out["Psychology Today URL"] = url
            break

    li_query = f'site:linkedin.com/in "{name}" psychologist Colorado'
    for url, snippet in bing_results(li_query, "linkedin.com"):
        if "/in/" in url and name_matches(snippet + " " + url, row):
            out["LinkedIn URL"] = url.split("?", 1)[0]
            break

    return out


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=INPUT)
    parser.add_argument("--output", type=Path, default=OUT)
    parser.add_argument("--limit", type=int, default=0, help="0 means all rows")
    parser.add_argument("--workers", type=int, default=6)
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"Missing input: {args.input}")

    with args.input.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        base_fields = list(rows[0].keys()) if rows else []

    for field in ["Psychology Today URL", "LinkedIn URL"]:
        if field not in base_fields:
            base_fields.append(field)

    out_rows = [dict(row) for row in rows]
    targets = [(i, row) for i, row in enumerate(out_rows) if not row.get("Psychology Today URL") and not row.get("LinkedIn URL")]
    if args.limit:
        targets = targets[: args.limit]

    print(f"Searching profile links for {len(targets)} rows with {args.workers} workers", flush=True)
    completed = 0
    with ThreadPoolExecutor(max_workers=max(1, args.workers)) as executor:
        future_to_idx = {executor.submit(find_profile_links, row): idx for idx, row in targets}
        for future in as_completed(future_to_idx):
            idx = future_to_idx[future]
            completed += 1
            try:
                out_rows[idx].update(future.result())
            except Exception:
                out_rows[idx].setdefault("Psychology Today URL", "")
                out_rows[idx].setdefault("LinkedIn URL", "")
            if completed % 50 == 0 or completed == len(targets):
                print(f"completed {completed}/{len(targets)}", flush=True)

    with args.output.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=base_fields)
        writer.writeheader()
        writer.writerows(out_rows)
    print(f"Wrote {len(out_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
