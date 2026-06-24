#!/usr/bin/env python3
"""
Email enrichment by exact phone-number search.

For rows that already have a phone number but no email, search the public web
for the exact phone number plus psychology/contact terms. Only accept an email
from a page that also contains the same normalized phone number.
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
OUT = DATA_DIR / "email_by_phone_first100.csv"

HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "text/html,application/xhtml+xml"}
TIMEOUT = 8
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
MAILTO_RE = re.compile(r"mailto:([^\"'?#>\s]+)", re.I)
PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}")

EXCLUDED_HOST_PARTS = {
    "colorado.gov",
    "bing.com",
    "google.com",
    "duckduckgo.com",
    "yahoo.com",
    "wikipedia.org",
    "merriam-webster.com",
    "britannica.com",
    "imdb.com",
    "youtube.com",
    "facebook.com",
    "instagram.com",
}

GENERIC_EMAIL_LOCAL_PARTS = {
    "noreply",
    "no-reply",
    "donotreply",
    "webmaster",
    "postmaster",
}


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


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


def is_candidate_url(url: str) -> bool:
    parsed = urlparse(url)
    host = parsed.netloc.lower()
    if not host or parsed.scheme not in {"http", "https"}:
        return False
    if any(part in host for part in EXCLUDED_HOST_PARTS):
        return False
    if any(url.lower().endswith(ext) for ext in [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"]):
        return False
    return True


def search_urls(query: str, max_results: int) -> list[str]:
    try:
        r = requests.get("https://www.bing.com/search", params={"q": query}, headers=HEADERS, timeout=TIMEOUT)
        r.raise_for_status()
    except requests.RequestException:
        return []
    hrefs = re.findall(r'<li class="b_algo"[\s\S]*?<h2[\s\S]*?<a[^>]+href="([^"]+)"', r.text)
    out = []
    for href in hrefs:
        url = decode_result_url(href)
        if is_candidate_url(url) and url not in out:
            out.append(url)
        if len(out) >= max_results:
            break
    time.sleep(0.5)
    return out


def extract_valid_email(page_html: str, expected_phone: str) -> str:
    text = html.unescape(re.sub(r"<[^>]+>", " ", page_html))
    phones = {normalize_phone(p) for p in PHONE_RE.findall(text)}
    if expected_phone not in phones:
        return ""
    candidates = []
    for value in MAILTO_RE.findall(page_html) + EMAIL_RE.findall(page_html):
        value = value.strip().rstrip(".,;:")
        local = value.split("@", 1)[0].lower()
        if local in GENERIC_EMAIL_LOCAL_PARTS:
            continue
        if value.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp")):
            continue
        if value not in candidates:
            candidates.append(value)
    return candidates[0] if candidates else ""


def fetch_email(url: str, expected_phone: str) -> str:
    try:
        r = requests.get(url, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
        if r.status_code >= 400 or "text/html" not in r.headers.get("Content-Type", ""):
            return ""
    except requests.RequestException:
        return ""
    time.sleep(0.2)
    return extract_valid_email(r.text, expected_phone)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--limit", type=int, default=100)
    parser.add_argument("--input", type=Path, default=INPUT)
    parser.add_argument("--output", type=Path, default=OUT)
    parser.add_argument("--max-results", type=int, default=5)
    args = parser.parse_args()

    if not args.input.exists():
        sys.exit(f"Missing input: {args.input}")

    with args.input.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        base_fields = list(rows[0].keys()) if rows else []

    extra = ["Phone Email Search URLs", "Phone Email Source URL", "Found Email By Phone"]
    fieldnames = base_fields + [f for f in extra if f not in base_fields]
    targets = [r for r in rows if r.get("Phone") and not r.get("Contact Email")][: args.limit]

    out_rows = []
    for idx, row in enumerate(targets, 1):
        row = dict(row)
        phone = row.get("Phone", "")
        expected = normalize_phone(phone)
        name = row.get("Practice Name") or row.get("Chief Doctor / Director") or ""
        query = f'"{phone}" psychologist email contact "{name}"'
        print(f"[{idx}/{len(targets)}] {name} {phone}", flush=True)
        urls = search_urls(query, args.max_results)
        row["Phone Email Search URLs"] = " | ".join(urls)
        row["Phone Email Source URL"] = ""
        row["Found Email By Phone"] = ""
        for url in urls:
            email = fetch_email(url, expected)
            if email:
                row["Found Email By Phone"] = email
                row["Contact Email"] = email
                row["Phone Email Source URL"] = url
                break
        out_rows.append(row)
        with args.output.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(out_rows)

    print(f"Wrote {len(out_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
