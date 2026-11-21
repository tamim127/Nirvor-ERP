# ADR-0005: Phase 4 module and template boundary

- Status: Proposed
- Date: 2026-11-21
- Owners: Product owner and engineering
- Related decisions: D-017 and D-023

## Context

Phase 4 must resolve module dependencies, preview template conflicts, resume partial setup and
preserve historical data. Lifecycle and provisioning authority policies remain unresolved, and
the Phase 2 tenant database authorization path is not yet verified.

## Options considered

### Pure module/template planning bounded context

Validate immutable manifests and templates and produce deterministic plans. Keep persistence,
authorization, entitlements and migration execution in later adapters.

### Implement provisioning directly in API/database handlers

This has fewer initial boundaries but mixes unresolved policy, transport, migration authority
and tenant mutation. Recovery and deterministic testing become harder.

## Proposed decision

Create `@nirvor/modules` as a pure modular-monolith boundary. Module references use exact
versions. Tenant setup operations are declarative and limited to tenant configuration. Global
schema deployment is a separate release operation and cannot appear in a tenant setup plan.

## Consequences

- Dependency order, conflicts and restart tokens are deterministic and testable.
- Deactivation plans preserve historical data by construction.
- Template previews expose tenant customization conflicts before mutation.
- Durable execution, authorization, audit and rollback remain required later work.

## Proof plan

Unit tests cover dependency order, cycles, conflicts, resume validation, retained data and
template conflicts. Later integration tests must cover tenant isolation, concurrent activation,
transaction rollback, crash recovery, migration compatibility and audited authorization.
