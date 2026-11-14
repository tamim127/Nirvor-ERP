# Localization and Regional Requirements

## Initial locale

- Default market: Bangladesh
- Default timezone: `Asia/Dhaka`
- Candidate default currency: `BDT`
- Languages: Bangla (`bn`) and English (`en`)

## Rules

- Store timestamps in UTC; render in the user's or organization's configured timezone.
- Store currency amounts using exact decimal/minor-unit representations. Never use binary floating point for money.
- Store currency code with monetary values.
- Do not assume every tenant uses BDT.
- Use locale-aware date, number, and currency formatting.
- Keep translations separate from business logic.
- Support Unicode and Bangla text in search, export, PDF, and reports.
- Validate phone and address formats without assuming a single format is universal.
- Tax/VAT rules must be versioned, configurable where appropriate, and professionally validated.
- Keep statutory document formats and retention rules behind region-specific policies.

## Open questions

- Which Bangla fonts and PDF rendering stack will be supported?
- Which tax/VAT workflows are in MVP?
- Which local payment providers are required?
- Are there customer or contractual data-residency requirements?
