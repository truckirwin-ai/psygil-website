#!/usr/bin/env python3
"""
Scrape public Psychology Today city listing pages for profile URLs.

This is intentionally narrower than the browser profile crawler:
  - fetch listing pages only
  - extract visible result cards
  - keep doctoral/psychologist cards
  - match profile URLs back to the DORA/NPI roster by first + last name

Output defaults to updating ../data/enriched.csv in place. Use --dry-run to
write only the scraped link inventory.
"""
from __future__ import annotations

import argparse
import csv
import html
import re
import sys
import time
from dataclasses import dataclass
from pathlib import Path
from urllib.parse import urlencode, urlparse

import requests

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
DEFAULT_INPUT = DATA_DIR / "enriched.csv"
DEFAULT_OUTPUT = DATA_DIR / "enriched.csv"
DEFAULT_LINKS = DATA_DIR / "psychology_today_links.csv"

BASE = "https://www.psychologytoday.com"
HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36",
    "Accept": "text/html,application/xhtml+xml",
}

CITY_SLUGS = [
    "denver",
    "colorado-springs",
    "boulder",
    "fort-collins",
    "aurora",
    "arvada",
    "broomfield",
    "centennial",
    "littleton",
    "lone-tree",
    "lakewood",
    "golden",
    "westminster",
    "longmont",
    "loveland",
    "greeley",
    "pueblo",
    "englewood",
    "greenwood-village",
    "highlands-ranch",
    "castle-rock",
    "parker",
    "lafayette",
    "louisville",
    "thornton",
    "wheat-ridge",
    "evergreen",
    "erie",
    "monument",
    "fountain",
    "brighton",
    "commerce-city",
    "windsor",
    "superior",
    "northglenn",
    "pueblo-west",
    "grand-junction",
    "durango",
    "aspen",
    "edwards",
    "fort-carson",
    "conifer",
    "evans",
    "frisco",
    "glendale",
    "montrose",
    "steamboat-springs",
    "vail",
    "carbondale",
    "cortez",
    "glenwood-springs",
    "silverthorne",
    "telluride",
    "trinidad",
]

CATEGORY_SLUGS = [
    "",
    "psychological-testing-and-evaluation",
    "forensic-psychology",
    "neuropsychology",
    "testing-and-evaluation",
    "child-or-adolescent",
    "trauma-and-ptsd",
    "adhd",
    "autism",
]


@dataclass(frozen=True)
class Listing:
    name: str
    credentials: str
    city: str
    category: str
    phone: str
    url: str


def strip_tags(value: str) -> str:
    value = re.sub(r"<!--.*?-->", " ", value, flags=re.S)
    value = re.sub(r"<[^>]+>", " ", value)
    return re.sub(r"\s+", " ", html.unescape(value)).strip()


def clean_name(value: str) -> str:
    value = html.unescape(value or "")
    value = re.sub(r"\([^)]*\)", " ", value)
    value = re.sub(
        r",?\s*\b(ph\.?d|psy\.?d|ed\.?d|ma|ms|m\.?a\.?|m\.?s\.?|abpp|lpc|lcsw|lmft|lpcc|licensed|psychologist)\b\.?",
        " ",
        value,
        flags=re.I,
    )
    value = re.sub(r"[^a-zA-Z' -]+", " ", value)
    return re.sub(r"\s+", " ", value).strip()


def name_key(value: str) -> str:
    parts = [p.lower() for p in clean_name(value).split() if len(p) > 1]
    if len(parts) < 2:
        return ""
    return f"{parts[0]} {parts[-1]}"


def phone_key(value: str) -> str:
    digits = re.sub(r"\D+", "", value or "")
    if len(digits) == 11 and digits.startswith("1"):
        digits = digits[1:]
    return digits if len(digits) == 10 else ""


def is_psychologist_credentials(value: str) -> bool:
    value = value or ""
    return bool(re.search(r"\bPsychologist\b|\bPh\.?D\b|\bPsy\.?D\b|\bEd\.?D\b", value, re.I))


def fetch(url: str, timeout: int = 20) -> str:
    r = requests.get(url, headers=HEADERS, timeout=timeout)
    if r.status_code == 404:
        return ""
    r.raise_for_status()
    return r.text


def extract_cards(page_html: str, city: str, category: str = "") -> list[Listing]:
    cards = re.findall(r'<div class="results-row"[\s\S]*?(?=<div class="results-row"|<nav|</main>)', page_html)
    listings: list[Listing] = []
    seen_urls: set[str] = set()
    for card in cards:
        hrefs = re.findall(r'href="(https://www\.psychologytoday\.com/us/therapists/[^"]+)"', card)
        profile_urls = [
            h
            for h in hrefs
            if not re.search(r"/us/therapists/co(?:/|$)|\?|#", h)
            and re.search(r"/[0-9]+(?:$|[?#])", h)
            and re.search(r"-co/[0-9]+(?:$|[?#])", h)
        ]
        if not profile_urls:
            continue
        url = profile_urls[0].split("?", 1)[0]
        if url in seen_urls:
            continue
        seen_urls.add(url)

        title = re.search(r'class="profile-title"[\s\S]*?>([\s\S]*?)</a>', card)
        name = strip_tags(title.group(1)) if title else ""
        if not name:
            alt = re.search(r'alt="Photo of ([^,"]+)', card)
            name = html.unescape(alt.group(1)).strip() if alt else ""
        creds_match = re.search(r'class="profile-subtitle-credentials"[^>]*>([\s\S]*?)</div>', card)
        credentials = strip_tags(creds_match.group(1)) if creds_match else ""
        if not is_psychologist_credentials(credentials):
            continue

        phone = ""
        tel = re.search(r'href="tel:\+?1?(\d{10})"', card)
        if tel:
            digits = tel.group(1)
            phone = f"({digits[0:3]}) {digits[3:6]}-{digits[6:10]}"
        else:
            phone_match = re.search(r"\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}", strip_tags(card))
            if phone_match:
                phone = phone_match.group(0)

        if name and url:
            listings.append(Listing(name=name, credentials=credentials, city=city, category=category, phone=phone, url=url))
    return listings


def discover_area_paths(city: str) -> list[str]:
    """Return city plus neighborhood/subarea paths linked from the city page."""
    root = f"{BASE}/us/therapists/co/{city}"
    try:
        page_html = fetch(root)
    except requests.RequestException as exc:
        print(f"warn: could not discover neighborhoods for {city}: {exc}", file=sys.stderr)
        return [city]
    paths = {city}
    for href in re.findall(r'href="(?:https://www\.psychologytoday\.com)?/us/therapists/co/([^"#?]+)"', page_html):
        href = href.strip("/")
        if href == city or href.startswith(f"{city}/"):
            # Exclude profile-like numeric tails and directory utility routes.
            if re.search(r"/[0-9]+$", href):
                continue
            paths.add(href)
    return sorted(paths)


def scrape_area(area_path: str, pages: int, delay: float, category: str = "", max_empty_pages: int = 3) -> list[Listing]:
    listings: list[Listing] = []
    seen_urls: set[str] = set()
    empty_pages = 0
    for page in range(1, pages + 1):
        params: dict[str, str | int] = {}
        if category:
            params["category"] = category
        if page > 1:
            params["page"] = page
        suffix = f"?{urlencode(params)}" if params else ""
        url = f"{BASE}/us/therapists/co/{area_path}{suffix}"
        try:
            page_html = fetch(url)
        except requests.RequestException as exc:
            print(f"warn: {area_path} page {page}: {exc}", file=sys.stderr)
            break
        if not page_html:
            break
        page_listings = extract_cards(page_html, area_path, category)
        new_count = 0
        for listing in page_listings:
            if listing.url in seen_urls:
                continue
            seen_urls.add(listing.url)
            listings.append(listing)
            new_count += 1
        label = f"{area_path} / {category or 'all'}"
        print(f"{label} page {page}: {new_count} new psychologist links", flush=True)
        if new_count == 0:
            empty_pages += 1
        else:
            empty_pages = 0
        if page > 1 and empty_pages >= max_empty_pages:
            break
        time.sleep(delay)
    return listings


def write_links(path: Path, listings: list[Listing]) -> None:
    fields = ["Name", "Credentials", "City", "Category", "Phone", "Psychology Today URL"]
    with path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        for listing in sorted(listings, key=lambda x: (x.city, x.name, x.url)):
            writer.writerow(
                {
                    "Name": listing.name,
                    "Credentials": listing.credentials,
                    "City": listing.city.replace("-", " ").title(),
                    "Category": listing.category,
                    "Phone": listing.phone,
                    "Psychology Today URL": listing.url,
                }
            )


def merge_links(input_path: Path, output_path: Path, listings: list[Listing]) -> tuple[int, int]:
    with input_path.open(newline="", encoding="utf-8") as f:
        rows = list(csv.DictReader(f))
        fields = list(rows[0].keys()) if rows else []

    for field in ["Psychology Today URL", "LinkedIn URL", "Web Link", "Web Link Source"]:
        if field not in fields:
            fields.append(field)

    link_by_key: dict[str, Listing] = {}
    duplicate_keys: set[str] = set()
    link_by_phone: dict[str, Listing] = {}
    duplicate_phones: set[str] = set()
    for listing in listings:
        key = name_key(listing.name)
        if not key:
            pass
        elif key in link_by_key and link_by_key[key].url != listing.url:
            duplicate_keys.add(key)
        else:
            link_by_key[key] = listing

        phone = phone_key(listing.phone)
        if not phone:
            continue
        if phone in link_by_phone and link_by_phone[phone].url != listing.url:
            duplicate_phones.add(phone)
        else:
            link_by_phone[phone] = listing

    matched = 0
    for row in rows:
        if row.get("Psychology Today URL"):
            continue
        key = name_key(row.get("Chief Doctor / Director") or row.get("Practice Name") or "")
        if not key or key in duplicate_keys:
            continue
        listing = link_by_key.get(key)
        if not listing:
            continue
        row["Psychology Today URL"] = listing.url
        row["Web Link"] = listing.url
        row["Web Link Source"] = "Psychology Today"
        matched += 1

    phone_matched = 0
    for row in rows:
        if row.get("Psychology Today URL"):
            continue
        phones = [row.get("Phone", ""), row.get("DORA Profile Phone", "")]
        for phone in phones:
            key = phone_key(phone)
            if not key or key in duplicate_phones or key not in link_by_phone:
                continue
            listing = link_by_phone[key]
            row["Psychology Today URL"] = listing.url
            row["Web Link"] = listing.url
            row["Web Link Source"] = "Psychology Today"
            matched += 1
            phone_matched += 1
            break

    for row in rows:
        if row.get("Web Link"):
            continue
        if row.get("Psychology Today URL"):
            row["Web Link"] = row["Psychology Today URL"]
            row["Web Link Source"] = "Psychology Today"
        elif row.get("LinkedIn URL"):
            row["Web Link"] = row["LinkedIn URL"]
            row["Web Link Source"] = "LinkedIn"

    with output_path.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fields)
        writer.writeheader()
        writer.writerows(rows)
    return matched, len(duplicate_keys) + len(duplicate_phones)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--input", type=Path, default=DEFAULT_INPUT)
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT)
    parser.add_argument("--links-output", type=Path, default=DEFAULT_LINKS)
    parser.add_argument("--pages", type=int, default=9)
    parser.add_argument("--delay", type=float, default=0.35)
    parser.add_argument("--city", action="append", default=[])
    parser.add_argument("--category", action="append", default=[])
    parser.add_argument("--discover-neighborhoods", action="store_true")
    parser.add_argument("--max-empty-pages", type=int, default=3)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    cities = args.city or CITY_SLUGS
    area_paths: list[str] = []
    for city in cities:
        if args.discover_neighborhoods:
            area_paths.extend(discover_area_paths(city))
        else:
            area_paths.append(city)
    area_paths = sorted(set(area_paths))
    print(f"Scraping {len(area_paths)} Psychology Today area paths", flush=True)
    categories = args.category if args.category else CATEGORY_SLUGS
    categories = [c.strip() for c in categories]
    print(f"Using {len(categories)} category lanes", flush=True)

    all_listings: list[Listing] = []
    seen: set[str] = set()
    for area_path in area_paths:
        for category in categories:
            for listing in scrape_area(area_path, args.pages, args.delay, category, args.max_empty_pages):
                if listing.url in seen:
                    continue
                seen.add(listing.url)
                all_listings.append(listing)

    write_links(args.links_output, all_listings)
    print(f"Wrote {len(all_listings)} scraped Psychology Today links to {args.links_output}")

    if args.dry_run:
        return
    matched, ambiguous = merge_links(args.input, args.output, all_listings)
    print(f"Matched {matched} roster rows; skipped {ambiguous} ambiguous first+last name keys")


if __name__ == "__main__":
    main()
