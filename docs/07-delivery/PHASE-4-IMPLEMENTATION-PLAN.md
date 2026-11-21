# Phase 4 Module and Template Framework Plan

Status: bounded Phase 4 foundation authorized on 2026-11-21. Module lifecycle and migration
authority policies D-017 and D-023 remain `DECISION REQUIRED`.

## First implemented slice

The `@nirvor/modules` bounded context owns pure planning for versioned module manifests,
dependency/conflict evaluation, data-preserving deactivation, resumable tenant setup operations
and template conflict previews. It performs no database or tenant mutation.

Global schema deployment is deliberately excluded from module setup operations. Setup plans may
contain only declarative `tenant_configuration` steps. This preserves the required separation
between platform schema deployment and tenant-specific provisioning.

## Acceptance criteria for this slice

- Activation resolves exact-version dependencies in deterministic order.
- Missing, retired, conflicting, cyclic or version-incompatible modules fail closed.
- A partial setup can resume only from operation identifiers in the same deterministic plan.
- Deactivation is blocked while an active dependent exists and never proposes data deletion.
- Published template preview identifies tenant-customization conflicts without overwriting them.
- Runtime validation rejects a global schema operation disguised as tenant setup.

## Later Phase 4 increments

1. Approve D-017 lifecycle, compatibility, conflict-resolution and retained-record policies.
2. Approve D-023 migration/provisioning authority and recovery ownership.
3. Add versioned manifest/template persistence after Phase 2 tenant authorization is repaired.
4. Add transactional provisioning attempts, checkpoints, idempotency and audit records.
5. Add safe configuration migration/rollback adapters and representative migration tests.
6. Connect authorization and Phase 3 entitlements before exposing activation commands.

## Risks and limits

This slice validates deterministic planning only. It does not prove tenant isolation, durable
restart, transactional application, rollback, authorization, entitlement enforcement or schema
migration safety. Phase 4 cannot exit until those behaviors have approved policies and executed
integration evidence.
