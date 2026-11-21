# ADR-0006: Phase 5 CRM domain boundary

- Status: Proposed
- Date: 2026-11-21
- Owners: Product owner and engineering
- Related decisions: D-001, D-002, D-011, D-021 and D-027

## Context

CRM is the approved first Phase 5 workflow, but customer-data retention and the Phase 2 tenant
authorization path remain unresolved. Lead transitions need explicit lifecycle policy,
optimistic concurrency, retry handling and auditable outcomes without coupling rules to HTTP or
database adapters.

## Options considered

### Pure CRM bounded-context package

Keep lifecycle decisions, invariants and events independent of transport and persistence. Supply
policy and trusted context from adapters after authorization.

### Put CRM behavior directly in API/database handlers

This is initially smaller but mixes business policy, client validation, tenant authorization and
persistence. It makes concurrency and transition tests less deterministic.

## Proposed decision

Create `@nirvor/crm` as a pure modular-monolith boundary. It emits decisions and versioned events
but performs no I/O. It does not accept tenant IDs or permissions from browser commands. The
future application adapter must inject server-resolved tenant and actor context and persist the
revision, idempotency record and audit event atomically.

## Consequences

- Lifecycle policy remains explicit and versioned.
- Optimistic concurrency and duplicate-command outcomes are testable.
- No customer PII is introduced before governance policy is approved.
- Tenant-isolated persistence, authorization and end-to-end workflow remain later work.

## Proof plan

Unit tests cover policy failure, legal/illegal transitions, stale revisions, duplicate commands,
conversion references and disqualification reason codes. Later tests must cover cross-tenant
denial, atomic idempotency, concurrent transitions, audit durability, PII controls and mobile UX.
