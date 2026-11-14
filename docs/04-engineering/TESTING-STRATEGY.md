# Testing Strategy

## Test layers

1. Unit tests: domain rules and pure functions.
2. Integration tests: database, queues, adapters, and module boundaries.
3. Contract tests: API and event schemas.
4. End-to-end tests: critical user journeys.
5. Security tests: authorization, tenant isolation, abuse cases.
6. Migration tests: upgrade from representative prior schema/data.
7. Performance tests: representative traffic and data volume.
8. Recovery tests: backup restore and operational recovery.

## Required critical coverage

- Cross-tenant read/write denial
- Role and permission enforcement
- Subscription and entitlement transitions
- Quota concurrency and race conditions
- Financial posting invariants
- Inventory movement invariants
- Webhook idempotency
- Background job retries and poison messages
- File access control
- API pagination and rate limiting
- Template update safety

## Test data

Use synthetic data. Never copy production personal or financial data into development/test environments unless explicitly approved and safely anonymized.

## Quality

Avoid brittle tests that only assert implementation details. Test observable behavior and business invariants. Record flaky tests and fix them; do not normalize repeated retries as success.
