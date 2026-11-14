# Engineering Constitution

## Purpose

These rules govern architecture, implementation, testing, and operations for Nirvor ERP.

## Principles

1. Correctness before convenience.
2. Security and tenant isolation by design.
3. Explicit domain ownership.
4. Small, reviewable changes.
5. Observable behavior.
6. Automated verification.
7. Backward-compatible evolution.
8. Documentation as part of implementation.
9. Measured performance, not guessed performance.
10. Simplicity before infrastructure fashion.

## Architecture rules

- Modular monolith by default.
- Explicit bounded contexts and dependency direction.
- No circular dependencies.
- No cross-module table writes.
- No hidden global tenant context.
- No business rules in controllers or UI components.
- No provider-specific behavior leaking into domain logic.
- External side effects are isolated behind adapters.

## Data rules

- Database constraints enforce critical invariants.
- Tenant ownership is explicit.
- Money uses exact numeric representation.
- Financial postings are auditable and corrected through controlled entries.
- Migrations are reviewed and tested.
- Destructive changes require recovery planning.

## Security rules

- Server-side authorization on every protected action.
- Least privilege and deny-by-default.
- Secrets never committed.
- Sensitive data is not logged.
- Security-sensitive changes require tests and review.

## Delivery rules

- Every task has acceptance criteria.
- Every meaningful business rule has tests.
- CI must run formatting, lint, type checking, tests, and build.
- Failed checks cannot be ignored without documented approval.
- Production releases have rollback and monitoring plans.

## Exceptions

Exceptions require a written rationale, owner, risk, expiry/review date, and approval recorded in an ADR or issue.
