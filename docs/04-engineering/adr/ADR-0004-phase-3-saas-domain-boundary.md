# ADR-0004: Phase 3 SaaS domain boundary

- Status: Proposed
- Date: 2026-11-21
- Owners: Product owner and engineering
- Related decisions: D-004, D-015, D-016 and D-017

## Context

Phase 3 needs deterministic subscription and entitlement behavior while pricing, lifecycle,
quota and outage policies remain unresolved. Coupling these rules directly to controllers,
database rows or a payment provider would turn unapproved assumptions into product behavior.

## Options considered

### Separate pure SaaS bounded-context package

Keep versioned policy evaluation independent of adapters. Callers supply approved policy,
catalog and time inputs. Missing policy fails closed.

### Implement rules inside the API or persistence adapter

This requires fewer files initially but couples commercial policy to transport or storage and
makes deterministic testing and provider replacement harder.

## Proposed decision

Use `@nirvor/saas` as a pure domain boundary. It may depend only on deliberately approved shared
contracts. API, PostgreSQL, cache and payment integrations remain adapters. Commercial
entitlement and user authorization are evaluated independently and both must permit an action.

## Consequences

- Policy versions and decision reasons are explicit and auditable.
- Unavailable policy/catalog data denies access instead of silently granting it.
- Persistence and race-safe quota consumption still require later implementation and tests.
- No plan price, provider or lifecycle timeline is selected by this ADR.

## Proof plan

Unit tests cover precedence, read-only behavior, timed rules, quotas and transition policies.
Later proofs must cover tenant isolation, concurrent final-unit consumption, invalidation,
outage behavior, audited overrides and provider reconciliation.
