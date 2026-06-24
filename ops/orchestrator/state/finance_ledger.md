# Finance Ledger

Manual log of income and spend until Stripe MCP and bank account MCP are connected (TODO T-0009).

Format: one entry per line as a markdown table row. Date in ISO format. Amounts in USD, positive numbers, signed by type column (income/spend).

Categories used:
- **income:** subscription, one-time, refund-issued (negative income), service-fee
- **spend:** infrastructure, software, contractor, legal, conference, ads, travel, supplies, taxes, fees

The orchestrator reads this file daily. The founder logs entries here (or another agent does, once automation is wired).

| Date | Type | Category | Amount | Note |
|---|---|---|---|---|
| 2026-05-14 | spend | software | 20.00 | Resend Pro (transactional email) |
| 2026-05-14 | spend | software | 7.00 | Google Workspace Business Starter, first month |
| 2026-05-14 | spend | software | 99.00 | LinkedIn Sales Navigator Core |
| 2026-05-14 | spend | software | 37.00 | Instantly Growth tier |
| 2026-05-14 | spend | software | 20.00 | Mailwarm |
| 2026-05-14 | spend | infrastructure | 0.00 | Cloudflare Pages + Email Routing (free tier) |
| 2026-05-14 | spend | infrastructure | 0.00 | Attio Free tier |
| 2026-06-05 | income | service-fee | 309.84 | Consulting (Pulse) via Stripe, Mercury savings 1279 |
| 2026-06-09 | spend | software | 8.47 | Microsoft via PayPal, Mastercard 7405 |
| 2026-06-11 | spend | software | 103.07 | Anthropic Claude/SDK, Mercury debit 0521 |
| 2026-06-11 | spend | software | 99.99 | Microsoft via PayPal, Mastercard 7405 |
| 2026-06-13 | spend | software | 102.04 | HeyGen video via Stripe; confirm business |
| 2026-06-15 | spend | software | 47.64 | GoDaddy foundrysmb.net via Klarna, 1 of 4 |

> Canonical tax record is now `/ops/finance/TAX_LEDGER_2026.xlsx` (categorized, with summary totals). This markdown log stays as the orchestrator's daily-read mirror. Two observed items remain unclassified (see the "To confirm" sheet): a $0.66 Stripe payout (May 29) and a $69.58 PayPal-to-AUS-Merchant charge (June 6, appears personal).

---

## How to log a new entry

Append a row to the table. Use ISO dates. Round to 2 decimal places. Note should be < 60 characters.

If a recurring spend, note its cadence in the note column (e.g., "monthly", "annual prepay").

## Future automation

Once Stripe MCP is connected (T-0009), the orchestrator pulls income directly. Manual entries for income are then only needed for off-Stripe revenue (consulting, advisory, etc.).

Once a bank account aggregator MCP (Plaid, Stripe Treasury, or similar) is connected, spend is pulled automatically. Until then, the founder logs spend here weekly or per material event.
