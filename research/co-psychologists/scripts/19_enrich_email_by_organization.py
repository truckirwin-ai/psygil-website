#!/usr/bin/env python3
"""
Email enrichment by DORA profile organization.

Searches for the public practice/employer organization from DORA profiles,
then crawls likely website/contact pages. An email is accepted only if the page
contains either the organization name or the row's known phone number.
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
OUT = DATA_DIR / "email_by_org_first100.csv"

HEADERS = {"User-Agent": "Mozilla/5.0", "Accept": "text/html,application/xhtml+xml"}
TIMEOUT = 8
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
MAILTO_RE = re.compile(r"mailto:([^\"'?#>\s]+)", re.I)
PHONE_RE = re.compile(r"(?:\+?1[\s.\-]?)?(?:\(\d{3}\)|\d{3})[\s.\-]?\d{3}[\s.\-]?\d{4}")
SUBPATHS = ["", "/contact", "/contact-us", "/about", "/about-us", "/team", "/staff", "/providers"]

EXCLUDED_HOST_PARTS = {
    "colorado.gov", "bing.com", "google.com", "duckduckgo.com", "yahoo.com",
    "facebook.com", "instagram.com", "linkedin.com", "wikipedia.org",
    "healthgrades.com", "webmd.com", "npiprofile.com", "npino.com",
    "airport.com", "privateschoolreview.com", "jobs.org", "careers.",
}

GENERIC_EMAIL_LOCAL_PARTS = {
    "noreply", "no-reply", "donotreply", "webmaster", "postmaster",
    "privacy", "abuse", "support",
}


def normalize_phone(value: str) -> str:
    digits = re.sub(r"\D", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits


def org_tokens(org: str) -> list[str]:
    org = re.sub(r"\b(llc|pllc|pc|inc|corp|corporation|ltd|the|and|of|dr)\b", " ", org or "", flags=re.I)
    org = re.sub(r"[^a-zA-Z0-9]+", " ", org).lower()
    return [t for t in org.split() if len(t) > 2]


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
    return not any(url.lower().endswith(ext) for ext in [".css", ".js", ".png", ".jpg", ".jpeg", ".gif", ".svg", ".ico", ".woff", ".woff2"])


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
    time.sleep(0.4)
    return out


def page_matches(page_html: str, org: str, expected_phone: str) -> bool:
    text = html.unescape(re.sub(r"<[^>]+>", " ", page_html)).lower()
    tokens = org_tokens(org)
    if len(tokens) >= 2:
        return sum(1 for token in tokens if token in text) >= 2
    if tokens and tokens[0] in text:
        phones = {normalize_phone(p) for p in PHONE_RE.findall(text)}
        return bool(expected_phone and expected_phone in phones)
    return False


def extract_email(page_html: str) -> str:
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


def crawl_candidate(url: str, org: str, expected_phone: str) -> tuple[str, str]:
    parsed = urlparse(url)
    base = f"{parsed.scheme}://{parsed.netloc}"
    for subpath in SUBPATHS:
        target = urljoin(base + "/", subpath.lstrip("/"))
        try:
            r = requests.get(target, headers=HEADERS, timeout=TIMEOUT, allow_redirects=True)
            if r.status_code >= 400 or "text/html" not in r.headers.get("Content-Type", ""):
                continue
        except requests.RequestException:
            continue
        time.sleep(0.15)
        if not page_matches(r.text, org, expected_phone):
            continue
        email = extract_email(r.text)
        if email:
            return email, target
    return "", ""


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

    extra = ["Organization Email Search URLs", "Organization Email Source URL", "Found Email By Organization"]
    fieldnames = base_fields + [f for f in extra if f not in base_fields]
    targets = [r for r in rows if r.get("DORA Profile Organization") and not r.get("Contact Email")][: args.limit]

    out_rows = []
    for idx, row in enumerate(targets, 1):
        row = dict(row)
        org = row.get("DORA Profile Organization", "")
        city = row.get("City", "")
        phone = row.get("Phone", "")
        expected_phone = normalize_phone(phone)
        query = f'"{org}" "{city}" psychologist email contact'
        print(f"[{idx}/{len(targets)}] {org}", flush=True)
        urls = search_urls(query, args.max_results)
        row["Organization Email Search URLs"] = " | ".join(urls)
        row["Organization Email Source URL"] = ""
        row["Found Email By Organization"] = ""
        for url in urls:
            email, source = crawl_candidate(url, org, expected_phone)
            if email:
                row["Found Email By Organization"] = email
                row["Contact Email"] = email
                row["Organization Email Source URL"] = source
                break
        out_rows.append(row)
        with args.output.open("w", newline="", encoding="utf-8") as f:
            writer = csv.DictWriter(f, fieldnames=fieldnames)
            writer.writeheader()
            writer.writerows(out_rows)

    print(f"Wrote {len(out_rows)} rows to {args.output}")


if __name__ == "__main__":
    main()
