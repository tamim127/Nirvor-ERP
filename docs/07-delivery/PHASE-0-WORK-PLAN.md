# Phase 0 Work Plan

Status: In progress — documentation and decision preparation authorized on 2026-11-13. Phase 0 exit and Phase 1 implementation are not approved.

## Outcome and working scope

Convert the owner's multi-industry ERP SaaS direction into reviewable requirements, bounded contexts, decisions, validation plans, and a Phase 1 implementation contract. Preserve all candidate modules in the product plan. Use the confirmed one-company, multiple-branch workspace model. Avoid inventing branch permissions, financial policy, commercial terms, or infrastructure commitments.

This work permits repository documentation preparation. It does not permit application scaffolding, dependency installation, live integrations, production data changes, or claims that isolation and scale have been demonstrated. A technical experiment needs its own scope and acceptance approval before execution under the root AGENTS.md rules.

## Work packages

| Work | Deliverable | Acceptance evidence | Current status |
|---|---|---|---|
| P0-01 Owner requirements | [Owner baseline](../00-product/OWNER-REQUIREMENTS-BASELINE.md) | Distinguish explicit instructions, proposals, and unknowns | Draft recorded; D-003 explicitly confirmed |
| P0-02 Delivery governance | Consistent roadmap, decision register, proposed sequencing ADR | Every phase has an exit gate; no unapproved ADR marked accepted | Prepared for review |
| P0-03 Business discovery | Workflow specifications for each approved delivery slice | Actors, states, exceptions, permissions, source documents, reconciliation, measurable acceptance | Pending workflow ordering and domain input |
| P0-04 Architecture validation | [Validation plan](../01-architecture/PHASE-0-VALIDATION-PLAN.md) and decision-specific ADRs | Alternatives, trust boundaries, failure cases, recovery and proof criteria | Plan drafted; experiments not executed |
| P0-05 Commercial policy | Subscription transition table, entitlement precedence, quota definitions | Payment delay, race, downgrade, cancellation, override and reconciliation scenarios | DECISION REQUIRED |
| P0-06 Experience | Mobile journey prototypes and design specification | Approved navigation, component states, branch context, accessibility and Bangla examples | Pending workflows; no placeholder module delivery |
| P0-07 Operations | Workload envelope, environment plan, SLI measurement and recovery targets | Named owners, budget, numeric internal targets, restore proof plan | DECISION REQUIRED |
| P0-08 Foundation contract | [Phase 1 plan](PHASE-1-IMPLEMENTATION-PLAN.md) | Scope, dependencies, checks, failure criteria, evidence and approval | Proposed; blocked from execution |

## Context and dependency map

- Identity establishes the actor; Access owns memberships and policies; Tenant owns the workspace, company, and branch lifecycle.
- Subscription owns the commercial agreement; Entitlements evaluates feature access and limits; module lifecycle owns installation state; Templates owns declarative presets.
- Business modules own their records and invariants. Sales, Procurement, Inventory, and Finance exchange explicit contracts; ownership of invoices, receipts, posting and reversal must be resolved before their implementation.
- Audit captures authorized changes; Integrations and workers handle external effects; Reporting consumes approved data contracts with tenant scope.
- Pricing decisions depend on business scope and measurable usage. Infrastructure sizing depends on workload and recovery objectives. UI scope depends on approved workflows and policies.

## Discovery format for every business workflow

Each workflow specification must identify the persona and problem, company/branch scope, start and final states, allowed and denied transitions, approval duties, authoritative records, amounts/units/rounding, transaction boundary, retry behavior, concurrency rules, reversal/correction path, audit events, integration failures, reports, mobile behavior, and acceptance tests. Unknown rules stay DECISION REQUIRED.

Potential delivery slices may use shared customer, supplier, item, purchasing, stock, sales, and finance capabilities, but no module combination or workflow order is approved yet. All-industry scope is maintained; specialized behavior is discovered and delivered incrementally.

## Approval and evidence rules

Use the [27-item Phase 0 checklist](PHASE-0-ACCEPTANCE-CHECKLIST.md). A drafted document is not an approved decision or executed test. Each completed item needs a linked artifact, evidence appropriate to that item, reviewer, approval date, and remaining limitations. A structural decision may be confirmed while its implementation and enforcement remain untested.

For every open decision, record its owner, options, recommendation, evidence, and blocking milestone. Decisions not needed for the immediate milestone may only be deferred explicitly with a trigger and owner; do not silently turn them into defaults. Phase 0 closes only after blocking questions are resolved and the owner approves the baseline and Phase 1 plan.

## Risks and boundaries

- Product breadth can obscure incomplete workflows: track completion by approved user outcomes, not screen count.
- Tenant/company cardinality is confirmed, but branch policy and cross-workspace membership are not: stop dependent security design until resolved.
- RLS, authentication, quota races, billing and financial invariants need real validation; documentation cannot prove them.
- Statutory rules require current authoritative sources and qualified review before implementation; this phase has not validated laws or provider capabilities.
- Existing local skills use canonical `SKILL.md` filenames after a content-neutral remediation rename. Read the files explicitly and do not infer approval from skill discovery alone.

## Progress record

2026-11-13: Full initial repository review completed; owner confirmed SaaS breadth, company-specific features, templates, pricing by features, mobile-first UX, scalability goals, and one company with multiple branches per workspace. Planning artifacts prepared. No application, migration, test suite, or production environment has been created or validated.

## Documentation change and verification record

2026-11-13: Five files added and eight existing files updated; no files deleted. No schema, dependencies, runtime infrastructure, protected instructions or local skills changed.

Added:

- `docs/00-product/OWNER-REQUIREMENTS-BASELINE.md`
- `docs/01-architecture/PHASE-0-VALIDATION-PLAN.md`
- `docs/04-engineering/adr/ADR-0001-phase-sequencing-and-validation.md`
- `docs/07-delivery/PHASE-0-WORK-PLAN.md`
- `docs/07-delivery/PHASE-1-IMPLEMENTATION-PLAN.md`

Updated:

- `README.md`
- `FILE-INVENTORY.txt`
- `docs/00-product/PRODUCT-CHARTER.md`
- `docs/00-product/PRODUCT-REQUIREMENTS.md`
- `docs/01-architecture/MULTI-TENANCY-AND-ORGANIZATION-MODEL.md`
- `docs/07-delivery/DEVELOPMENT-ROADMAP.md`
- `docs/07-delivery/OPEN-DECISIONS.md`
- `docs/07-delivery/PHASE-0-ACCEPTANCE-CHECKLIST.md`

Read-only before/after snapshots were obtained through PowerShell using:

```powershell
Get-ChildItem -LiteralPath . -Recurse -Force -File | ForEach-Object {
    [pscustomobject]@{
        Path = $_.FullName
        Hash = (Get-FileHash -LiteralPath $_.FullName -Algorithm SHA256).Hash
        Content = [System.IO.File]::ReadAllText($_.FullName)
    }
} | ConvertTo-Json -Depth 3 -Compress
```

The snapshots were compared in an in-memory JavaScript check. Relative Markdown file targets, inventory membership, decision IDs, phase checklist markers and protected-path hashes were checked. Added and removed text in modified documents was inspected for consistency with owner instructions, approval status, tenant boundaries, data integrity, accessibility and performance scope.

Results: 55 workspace files match 55 inventory entries; all 30 relative Markdown file links resolve; 27 decision IDs are unique; 27 Phase 0 checklist items remain unchecked; no protected instruction/skill change or file deletion. D-003 alone is Approved; D-013, D-025 and D-026 are Proposed. Remaining decisions are Open.

Limitations: documentation checks are not application tests. Formatting, lint, typecheck, build, migrations, security scans, load tests and restore drills were not run because the workspace has no application or executable project setup. Git diff is unavailable because this workspace has no Git repository; in-memory content/hash comparison was used instead. Runtime security, tenant isolation, financial integrity and capacity remain unverified. Phase 0 remains in progress.
