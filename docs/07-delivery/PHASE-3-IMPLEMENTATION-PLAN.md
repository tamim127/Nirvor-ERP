# Phase 3 SaaS Control Plane Plan

Status: Phase 3 bounded foundation authorized on 2026-11-21. Commercial policies remain
`DECISION REQUIRED`; no plan prices, trial duration, grace period, provider, or quota values
are approved by this document.

## First implemented slice

The `@nirvor/saas` bounded context owns pure subscription and entitlement policy evaluation.
It is independent of HTTP, PostgreSQL, payment providers and the unfinished Phase 2 tenant
authorization path. Evaluation requires explicit versioned policy and catalog inputs and fails
closed when either is unavailable.

The slice distinguishes catalog entries, plan features, add-ons, tenant grants/restrictions,
platform restrictions, subscription state and usage boundaries. Permission evaluation remains
separate: a commercial grant never authorizes a user action.

## Acceptance criteria for this slice

- A missing policy or inactive catalog entry denies access.
- Platform restrictions and configured tenant-restriction precedence are deterministic.
- Read-only subscription modes deny writes.
- Time-bounded add-ons and grants use a caller-supplied deterministic clock.
- Hard quotas deny excess use; soft quotas return an explicit allowed-with-warning reason.
- Subscription transitions require an explicit versioned transition policy.
- No pricing, payment-provider or Bangladesh statutory rule is invented.

## Later Phase 3 increments

1. Approve D-015 entitlement precedence, revocation, outage and cache behavior.
2. Approve D-016 subscription states, grace, downgrade, reactivation and quota semantics.
3. Add versioned PostgreSQL catalog/subscription/entitlement records after Phase 2 database
   authorization is repaired and verified.
4. Add race-safe usage reservations and idempotent consumption records.
5. Add audited platform administration commands with separate platform permissions.
6. Add provider-neutral billing adapter contracts; provider execution remains Phase 7.

## Risks and limits

This pure evaluator proves deterministic policy behavior only. It does not prove persistence,
tenant isolation, concurrent quota consumption, cache invalidation, platform authorization or
provider reconciliation. Phase 3 cannot exit until those behaviors have approved policies and
executed integration evidence.
