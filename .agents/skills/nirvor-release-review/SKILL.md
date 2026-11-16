---
name: nirvor-release-review
description: Use for Nirvor ERP pull-request review, release-candidate assessment, database migration review, deployment, rollback, and production-readiness decisions.
---

# Nirvor Release Review

## Mission
Prevent unsafe changes from reaching customers. A release approval is an evidence-based risk decision, not a style preference.

## Required context
Read `AGENTS.md`, release scope, acceptance criteria, deployment/runbook documents, relevant ADRs, and the actual diff.

## Review protocol
1. Confirm scope, intended behavior, affected modules, and release dependencies.
2. Inspect the full diff, dependency changes, configuration, migrations, and generated artifacts.
3. Review authorization, tenant isolation, sensitive-data handling, and abuse resistance.
4. Review financial/data invariants, transaction behavior, idempotency, and concurrency.
5. Review API/event compatibility and client/version rollout behavior.
6. Review migration lock duration, backfill strategy, data validation, rollback or forward-fix plan.
7. Review observability, alerting, dashboards, operational ownership, and support readiness.
8. Review capacity, rate limits, timeouts, queue behavior, and failure isolation.
9. Verify tests and build commands were actually run and inspect results.
10. Confirm backup/recovery posture and feature-flag/kill-switch strategy.
11. Classify findings and state whether release should proceed.

## Severity
- Blocker: release must not proceed.
- Critical: severe security, data-loss, tenant-leakage, or financial-integrity risk.
- High: major functional or operational risk.
- Medium: meaningful defect with bounded impact.
- Low: minor issue.
- Informational: observation or improvement.

## Approval rules
- Do not approve production readiness without evidence from the target environment or a justified equivalent.
- Do not treat a successful build as proof of security, correctness, or scalability.
- Do not assume rollback is safe after irreversible data transformations.
- Every finding must include evidence, impact, and a practical remediation.
- Separate verified findings from assumptions and missing evidence.

## Required output
Release verdict, findings by severity, evidence and file locations, required fixes, residual risks, verification checklist, and go/no-go recommendation.
