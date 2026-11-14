# Database Architecture

## 1. Primary database

PostgreSQL is the proposed transactional system of record.

## 2. Modeling rules

- Use explicit primary keys and stable identifiers.
- Use foreign keys and database constraints for invariants.
- Include tenant scope in tenant-owned records and relevant unique constraints.
- Define deletion behavior intentionally; avoid cascading deletion of financial/audit history.
- Use exact numeric types for money and quantities requiring precision.
- Store timestamps in UTC.
- Define soft-delete only where business/legal requirements justify it.
- Add indexes from observed query patterns, not speculation.
- Use bounded pagination; prefer cursor pagination for large/changing datasets.
- Avoid ORM-generated N+1 queries and uncontrolled relation expansion.

## 3. Transactions and concurrency

- Use database transactions for multi-row business invariants.
- Define isolation and locking strategy for stock, balances, numbering, and approvals.
- Use optimistic concurrency/version columns where suitable.
- Use idempotency keys for retried commands.
- Keep transactions short; never hold a transaction open during a slow external API call.
- Use outbox/inbox patterns where transactionally reliable messaging is needed.

## 4. Migration safety

- Migrations are version-controlled and reviewed.
- Prefer expand -> migrate/backfill -> contract for zero/low-downtime changes.
- Large backfills must be resumable and throttled.
- Test migrations against realistic data volumes.
- Take and verify backups before risky migrations.
- Do not rely on rollback scripts as the only recovery mechanism.

## 5. Data lifecycle

Define retention, archival, export, deletion, legal hold, backup retention, and restoration behavior for each data category.

## 6. Schema design status

This is an architectural guide, not a final Prisma schema. Final entities and constraints require approved domain workflows.
