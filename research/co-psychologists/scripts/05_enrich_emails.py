#!/usr/bin/env python3
"""
Email enrichment crawler.

Input:  ../data/merged.csv (or any CSV with a 'Website' column; falls back to
        Google search via WebSearch if no website is known -- removed for now,
        because operator should hand-curate websites or rely on Practice Name
        + zip lookup later)

For each row that has a discoverable website (we resolve via DuckDuckGo HTML
endpoint to avoid Google ToS), fetch:
   /                /contact            /contact-us
   /about           /about-us           /staff
   /providers       /our-team           /team
Extract mailto: links and emails matching r'[\\w.+-]+@[\\w-]+\\.[\\w.-]+'.
Skip generic disposable inboxes (info@example.com false-positives) by
deprioritizing common bot-targets in favor of human-looking addresses.

This is slow on purpose: 2-3 seconds per practice with a 1-2s delay between
requests. Expect to run overnight for several thousand records.

Resumable: writes ../data/enriched.csv incrementally; rerunning skips rows
that already have a non-empty Contact Email.
"""
from __future__ import annotations
import csv
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

import requests
try:
    from bs4 import BeautifulSoup
except Exception:  # pragma: no cover
    BeautifulSoup = None
try:
    from tqdm import tqdm
except Exception:  # pragma: no cover
    tqdm = lambda x, **_: x
try:
    import tldextract
except Exception:  # pragma: no cover
    tldextract = None

INPUT = Path(__file__).resolve().parent.parent / "data" / "merged.csv"
OUT = Path(__file__).resolve().parent.parent / "data" / "enriched.csv"

SUBPATHS = ["", "/contact", "/contact-us", "/about", "/about-us",
            "/staff", "/providers", "/our-team", "/team", "/clinicians"]
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
MAILTO_RE = re.compile(r"mailto:([^\"'?#>\s]+)", re.I)
HEADERS = {
    "User-Agent": "Foundry SMB research crawler (contact: truckirwin@gmail.com)",
    "Accept": "text/html,application/xhtml+xml",
}
REQUEST_TIMEOUT = 12
PAGE_DELAY = 1.2
PRACTICE_DELAY = 2.0

GENERIC_LOCAL_PARTS = {"noreply", "no-reply", "donotreply", "webmaster", "postmaster"}
NON_WEBSITE_SOURCES = {"npi", "dora", "abfp", "psychologytoday", "website", "manual"}


def extract_emails(html: str, domain: str) -> list[str]:
    found = set()
    # 1. mailto:
    if BeautifulSoup:
        soup = BeautifulSoup(html, "lxml")
        for a in soup.find_all("a", href=True):
            if a["href"].lower().startswith("mailto:"):
                addr = a["href"].split(":", 1)[1].split("?", 1)[0].strip()
                if addr:
                    found.add(addr)
    else:
        for addr in MAILTO_RE.findall(html):
            found.add(addr.strip())
    # 2. regex
    for m in EMAIL_RE.findall(html):
        # filter obvious assets
        if any(m.lower().endswith(ext) for ext in [".png", ".jpg", ".jpeg", ".gif", ".svg"]):
            continue
        found.add(m)
    # Prefer same-domain, non-generic addresses
    def score(addr: str) -> tuple:
        local, _, host = addr.partition("@")
        local = local.lower()
        host = host.lower()
        same_domain = host.endswith(domain)
        is_generic = local in GENERIC_LOCAL_PARTS
        return (0 if same_domain else 1, 0 if not is_generic else 1, len(local))
    return sorted(found, key=score)


def crawl_website(url: str) -> str:
    parsed = urlparse(url if "://" in url else "https://" + url)
    if not parsed.netloc:
        return ""
    base = f"{parsed.scheme or 'https'}://{parsed.netloc}"
    if tldextract:
        ext = tldextract.extract(parsed.netloc)
        domain = f"{ext.domain}.{ext.suffix}".lower()
    else:
        parts = parsed.netloc.lower().split(".")
        domain = ".".join(parts[-2:]) if len(parts) >= 2 else parsed.netloc.lower()
    candidates: list[str] = []
    for sub in SUBPATHS:
        target = urljoin(base + "/", sub.lstrip("/"))
        try:
            r = requests.get(target, headers=HEADERS, timeout=REQUEST_TIMEOUT, allow_redirects=True)
            if r.status_code != 200 or "text/html" not in r.headers.get("Content-Type", ""):
                continue
            candidates.extend(extract_emails(r.text, domain))
            if candidates:
                break  # got something; stop walking subpaths
        except requests.RequestException:
            continue
        finally:
            time.sleep(PAGE_DELAY)
    # Dedupe preserving order
    seen = set()
    out = []
    for c in candidates:
        c = c.strip().rstrip(".,;:")
        if c.lower() in seen:
            continue
        seen.add(c.lower())
        out.append(c)
    return out[0] if out else ""


def infer_website(row: dict) -> str:
    website = (row.get("Website") or "").strip()
    if website:
        return website
    source = (row.get("Source") or "").strip()
    first_source = source.split(";", 1)[0].strip()
    if first_source and first_source not in NON_WEBSITE_SOURCES and "." in first_source and " " not in first_source:
        return first_source
    return ""


def main() -> None:
    if not INPUT.exists():
        sys.exit(f"Missing input: {INPUT}. Run 04_merge_dedupe.py first.")
    with INPUT.open(encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
    fieldnames = list(rows[0].keys())
    if "Website" not in fieldnames:
        fieldnames.append("Website")
    # Load existing enriched output to resume.
    enriched_by_key: dict[str, dict] = {}
    if OUT.exists():
        with OUT.open(encoding="utf-8") as f:
            for r in csv.DictReader(f):
                enriched_by_key[r.get("NPI") or r.get("Practice Name", "")] = r

    out_rows = []
    for row in tqdm(rows, desc="enriching"):
        key = row.get("NPI") or row.get("Practice Name", "")
        prior = enriched_by_key.get(key)
        if prior and prior.get("Contact Email"):
            out_rows.append(prior)
            continue
        website = infer_website(row)
        if website and not row.get("Website"):
            row["Website"] = website
        if not website:
            # If no website is known, leave row untouched; manual curation step needed.
            out_rows.append(row)
            continue
        email = crawl_website(website)
        if email:
            row["Contact Email"] = email
        out_rows.append(row)
        # Write incrementally so we don't lose progress.
        with OUT.open("w", newline="", encoding="utf-8") as f:
            w = csv.DictWriter(f, fieldnames=fieldnames)
            w.writeheader()
            w.writerows(out_rows)
        time.sleep(PRACTICE_DELAY)
    with OUT.open("w", newline="", encoding="utf-8") as f:
        w = csv.DictWriter(f, fieldnames=fieldnames)
        w.writeheader()
        w.writerows(out_rows)
    print(f"Wrote {len(out_rows)} rows to {OUT}")


if __name__ == "__main__":
    main()
