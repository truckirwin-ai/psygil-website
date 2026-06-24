#!/usr/bin/env python3
"""
Pull Colorado psychologist listings from Psychology Today using browser automation.

This script is intentionally browser-driven:
  1. Open the Colorado city listing page in a browser context.
  2. Scroll the listing results.
  3. Collect profile links for cards labeled Psychologist, Psychologist, PsyD,
     Psychologist, PhD, etc.
  4. Open each profile page.
  5. Extract visible contact data, including phone and any public email address
     shown on the page (often behind an "Email Me" / "Email Us" control).

Output: ../data/psychology_today.csv

Notes:
  - Psychology Today pages are dynamic and can change layout. This crawler uses
    conservative selectors plus text fallbacks.
  - The script respects a small delay between page visits.
  - If Playwright is unavailable, the script exits with a clear message.
"""
from __future__ import annotations

import csv
import re
import sys
import time
from pathlib import Path
from urllib.parse import urljoin, urlparse

CITY_SLUGS = [
    "denver",
    "colorado-springs",
    "boulder",
    "fort-collins",
    "aurora",
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
]

BASE = "https://www.psychologytoday.com"
LISTING_TAIL = "/us/therapists/co/"
OUT = Path(__file__).resolve().parent.parent / "data" / "psychology_today.csv"
DATA_DIR = OUT.parent
DATA_DIR.mkdir(exist_ok=True)

PHONE_RE = re.compile(r"(?:(?:\+1[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4})")
EMAIL_RE = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
LICENSE_RE = re.compile(r"(PSY[\.\s]?\d{3,7}|Colorado License No\.?\s*[:#]?\s*[A-Z0-9.\-]+)", re.I)


def strip(s: str | None) -> str:
    return (s or "").strip()


def normalize_phone(s: str) -> str:
    m = PHONE_RE.search(s or "")
    return m.group(0) if m else ""


def normalize_email(s: str) -> str:
    m = EMAIL_RE.search(s or "")
    return m.group(0) if m else ""


def extract_visible_emails(text: str) -> str:
    emails = []
    for m in EMAIL_RE.findall(text or ""):
        if m.lower().endswith((".png", ".jpg", ".jpeg", ".gif", ".svg")):
            continue
        emails.append(m)
    return emails[0] if emails else ""


def empty_row() -> dict[str, str]:
    return {
        "Practice Name": "",
        "Chief Doctor / Director": "",
        "Phone": "",
        "Address": "",
        "Specialties": "",
        "Contact Email": "",
        "City": "",
        "County": "",
        "Source": "psychologytoday",
        "NPI": "",
        "License": "",
        "Last Verified": "",
        "Profile URL": "",
        "Accepting New Patients": "",
    }


def main() -> None:
    try:
        from playwright.sync_api import sync_playwright
    except Exception as e:
        sys.exit(
            "Playwright is required for this script. Install it with "
            "`pip install playwright` and then `playwright install chromium`.\n"
            f"Import error: {e}"
        )

    rows: list[dict[str, str]] = []
    seen_profiles: set[str] = set()

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page(viewport={"width": 1440, "height": 2200})
        page.set_default_timeout(20000)

        for city in CITY_SLUGS:
            listing_url = f"{BASE}{LISTING_TAIL}{city}"
            page.goto(listing_url, wait_until="networkidle")
            time.sleep(1.0)

            # Scroll a few rounds to load lazy content.
            for _ in range(6):
                page.mouse.wheel(0, 1800)
                time.sleep(0.6)

            anchors = page.locator('a[href*="/therapists/"]')
            count = anchors.count()
            for i in range(count):
                try:
                    a = anchors.nth(i)
                    href = a.get_attribute("href") or ""
                    text = strip(a.inner_text())
                    if not href:
                        continue
                    profile_url = urljoin(BASE, href)
                    if "/therapists/" not in profile_url:
                        continue
                    if profile_url in seen_profiles:
                        continue
                    # Keep only likely psychologist profiles.
                    if not re.search(r"\b(Psychologist|PsyD|PhD|EdD)\b", text, re.I):
                        continue
                    seen_profiles.add(profile_url)

                    profile = page.context.new_page()
                    profile.set_default_timeout(20000)
                    profile.goto(profile_url, wait_until="networkidle")
                    time.sleep(0.8)
                    body = profile.locator("body")
                    visible_text = strip(body.inner_text())

                    name = strip(profile.locator("h1").first.inner_text()) if profile.locator("h1").count() else text
                    degree = ""
                    m = re.search(r"\b(Psy\.?D\.?|Ph\.?D\.?|Ed\.?D\.?)\b", visible_text, re.I)
                    if m:
                        degree = m.group(1).replace(" ", "")

                    phone = ""
                    phone_nodes = profile.locator('a[href^="tel:"], [data-testid*="phone"], text=/\\(\\d{3}\\)/')
                    if phone_nodes.count():
                        phone = normalize_phone(phone_nodes.first.inner_text() + " " + (phone_nodes.first.get_attribute("href") or ""))
                    if not phone:
                        phone = normalize_phone(visible_text)

                    email = ""
                    mailtos = profile.locator('a[href^="mailto:"]')
                    if mailtos.count():
                        email = strip((mailtos.first.get_attribute("href") or "").split(":", 1)[1].split("?", 1)[0])
                    if not email:
                        email = extract_visible_emails(visible_text)

                    address = ""
                    addr_nodes = profile.locator("address, [class*='address'], [data-testid*='address']")
                    if addr_nodes.count():
                        address = " ".join(strip(addr_nodes.first.inner_text()).split())
                    if not address:
                        addr_match = re.search(r"\b\d{2,5}[^\\n]+?,\\s*CO\\s*\\d{5}\b", visible_text)
                        if addr_match:
                            address = addr_match.group(0)

                    accepting = "yes" if re.search(r"Accepting New Patients via Telehealth\s*\n\s*\*\s*Yes", visible_text, re.I) or re.search(r"Waitlist for new clients", visible_text, re.I) else ""

                    specialties = []
                    for label in ["Practice Areas", "Treatment Methods", "Specialties", "Expertise"]:
                        if label in visible_text:
                            specialties.append(label.lower())
                    if not specialties:
                        specialties = [s.lower() for s in re.findall(r"\b(forensic|trauma|anxiety|depression|adhd|autism|assessment|testing|cbt|emdr|neuropsychology)\b", visible_text, re.I)]

                    license_no = ""
                    lic = LICENSE_RE.search(visible_text)
                    if lic:
                        license_no = lic.group(1).replace(" ", "").replace("#", "")

                    row = empty_row()
                    row["Practice Name"] = name
                    row["Chief Doctor / Director"] = name
                    row["Phone"] = phone
                    row["Address"] = address
                    row["Specialties"] = "; ".join(sorted(set(specialties)))
                    row["Contact Email"] = email
                    row["City"] = city.replace("-", " ").title()
                    row["License"] = license_no
                    row["Last Verified"] = time.strftime("%Y-%m-%d")
                    row["Profile URL"] = profile_url
                    row["Accepting New Patients"] = accepting
                    rows.append(row)
                    profile.close()
                except Exception:
                    continue

        browser.close()

    # Stable output for downstream merge.
    fieldnames = [
        "Practice Name",
        "Chief Doctor / Director",
        "Phone",
        "Contact Email",
        "Address",
        "Specialties",
        "City",
        "County",
        "Source",
        "NPI",
        "License",
        "Last Verified",
        "Profile URL",
        "Accepting New Patients",
    ]
    with OUT.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(rows)
    print(f"Wrote {len(rows)} Psychology Today rows to {OUT}")


if __name__ == "__main__":
    main()
