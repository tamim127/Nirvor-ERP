# Phase 1 Engineering Foundation Plan

Status: Implementation verified locally and in remote CI; owner milestone acceptance pending.
Prepared 2026-11-13; implementation authorized by the product owner on 2026-11-13; evidence
updated 2026-11-14.

## Outcome

Create a reproducible, testable engineering foundation for the approved ERP design. Deliver developer tooling, application boundaries, database migration workflow, diagnostics, CI and a mobile UI foundation. Do not call a shell, sample screen or health endpoint a complete ERP module.

## Entry gate

- Phase 0 checklist completed with evidence and owner approval.
- This plan's scope and acceptance criteria explicitly approved.
- Accepted decisions for stack/runtime versions, package manager, module boundaries, authentication approach, tenancy/RLS/pooler, environments and secret handling.
- D-003 one-company/multiple-branch decision incorporated; branch authorization remains unresolved until D-021 is approved.
- Approved validation evidence or an explicitly reviewed alternative for failed architecture assumptions.
- Every dependency needed by Phase 1 resolved; later decisions may be deferred only under an approved record with owner and trigger.

The general instruction to start phased work authorizes preparing this plan, not filling unresolved security policies with defaults.

## Proposed work packages and acceptance criteria

| ID | Scope | Acceptance evidence |
|---|---|---|
| P1-01 | Version control and tooling | Initialize repository only after approval; ignore secrets/artifacts; select supported versions and package manager through ADR; one lockfile; documented clean checkout/install workflow; strict TypeScript and agreed formatter/linter |
| P1-02 | Application and package boundaries | Web/API and worker boundary as justified by approved job scope; no circular module dependencies; domain code independent of transport/persistence adapters; automated dependency-boundary check |
| P1-03 | Local environment and config | Approved PostgreSQL/pooler setup; only justified additional services; distinct runtime and migration credentials; validated configuration fails without exposing secrets; missing services produce useful diagnostics; fresh setup reproduced |
| P1-04 | Database migration foundation | Versioned migrations from empty database plus upgrade fixture; explicit migration ownership and execution ordering; repeat deployment safe; rollout/forward-recovery notes; runtime role cannot perform maintenance operations; approved tenant-context contract preserved |
| P1-05 | API diagnostics and request controls | Defined error envelope, validation, request IDs, redacted logs, payload/time/concurrency limits; separate liveness and readiness; readiness reflects required dependencies; graceful shutdown tested; final distributed rate-limit topology follows approved ADR |
| P1-06 | Automated verification | Meaningful unit/integration/contract harness; isolated synthetic fixtures and deterministic clocks where needed; database integration uses intended role; regression fixture for approved RLS proof; no production credentials or data |
| P1-07 | CI and build | On clean checkout: frozen dependency install, formatting check, lint, type check, relevant tests, builds and reviewed security scan; no allowed silent failures; logs and artifacts retained under approved policy; failure stops promotion |
| P1-08 | Mobile UI foundation | Shared typography/color/spacing/focus and component states; mobile navigation prototype; Bangla/English text expansion; keyboard use and contrast checks; no unapproved business forms or fabricated dashboard metrics |
| P1-09 | Handoff | Setup, architecture, configuration, migration and troubleshooting docs; exact command/output evidence; file/change list, risk review and owner milestone approval |

## Verification contract

Command names below are proposed package scripts to create during implementation; none exists or has run today. Substitute the approved package manager consistently, then record the exact commands in the evidence report.

| Script/check | Required behavior |
|---|---|
| `format:check` | Detect formatting differences without rewriting CI inputs |
| `lint` and `typecheck` | Fail on agreed lint and strict type errors |
| `test:unit` | Verify actual foundation behavior such as configuration validation and safe error mapping |
| `test:integration` | Exercise database roles/migrations, request controls, dependency failure and approved tenant isolation fixture |
| `test:contracts` | Verify foundation API/error schemas; add domain contracts only with their modules |
| `test:boundaries` | Fail on prohibited dependency directions and cycles |
| `build` | Build all selected applications from the lockfile and validated configuration |
| Security check | Record chosen dependency/secret scanning tools, findings, review and remediation; do not silently accept critical findings |
| Manual environment/UI checks | Fresh setup, shutdown/dependency outage, mobile interaction, focus, text expansion and redaction review |

Do not install packages, choose current versions, or claim command success from this proposed list. Pin the selected versions after current official-documentation review and record results when implementation is authorized.

## Explicit exclusions

Production deployment, real customer data, payment-provider connections, full authentication implementation, business module CRUD, posted finance/inventory records, marketplace plugins, offline writes, native apps and unbounded scaling promises are outside Phase 1. Identity and tenant implementation belongs to Phase 2; its approved design and isolation feasibility are dependencies of this foundation.

## Exit and failure handling

All P1 acceptance evidence must be linked to the implementation revision and execution environment. Review tenant isolation, authorization, integrity, accessibility and performance implications of the actual diff. No unfinished critical issue, ignored failing check or unapproved infrastructure may be hidden by a green build. Record failed/skipped/blocked checks and stop the phase gate until resolved under the governing rules.

No destructive rollback is authorized by this plan. Preserve changes for review; document forward fixes and recovery for any schema step. Phase 1 completion requires owner approval and does not establish production readiness.

## Implementation evidence

The bounded implementation and its exact local verification results are recorded in the
[Phase 1 verification report](PHASE-1-VERIFICATION-REPORT.md). Local development and recovery
steps are recorded in the [local runbook](../05-operations/LOCAL-DEVELOPMENT-RUNBOOK.md).
Remote GitHub Actions execution and product-owner milestone acceptance remain exit-gate items.
