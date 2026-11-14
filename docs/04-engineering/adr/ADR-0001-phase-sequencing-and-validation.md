# ADR-0001: Phase sequencing and validation

- Status: Proposed
- Date: 2026-11-13
- Owners: Product owner and engineering
- Related decisions: D-013 and D-026

## Context

README previously described phases 0–8, while the delivery roadmap described phases 0–9 with different later-stage meanings. The owner requests all-industry ERP breadth and phase-by-phase work, but no detailed implementation phase has been approved. Phase 0 requires isolation investigation while scaffolding is prohibited before Phase 0 and Phase 1 approval.

## Options considered

### Option A — Retain the detailed roadmap numbering and clarify gates

Use phases 0–9 from the detailed roadmap for consistent references. Describe Phase 6 advanced-module work as individually approved increments, not a requirement to finish every industry before a bounded launch. Carry security, accessibility, performance and recovery work in each relevant phase and use Phase 8 to verify the complete approved release. Permit only separately scoped and approved disposable Phase 0 experiments; they are not product scaffolding.

Benefits: preserves detailed roadmap references, retains the full product vision, makes proof and delivery gates explicit. Costs: requires owner review of the sequencing and the separate experiment approval rule.

### Option B — Rewrite numbering around a smaller first release

Create a new phase sequence that merges commercial capability into the first business release and schedules advanced modules after launch.

Benefits: potentially clearer first-release focus. Costs: changes existing references and requires a launch scope the owner has not selected; risks treating the owner's breadth requirement as an approved scope reduction.

## Proposed decision

Recommend Option A. README now mirrors the detailed roadmap's numbering as a documentation alignment. The roadmap's added gates and conditional sequencing remain proposed. No implementation or experiment approval is inferred from this ADR.

## Consequences

- Full catalog remains in the product plan; phase or module completion requires actual outcomes and evidence.
- Phase 3 owns commercial state and entitlement policy; Phase 7 adds provider execution, financial reconciliation and customer-facing commercial operations.
- Core reports necessary to validate business workflows belong with those workflows; they cannot all be postponed to advanced reporting.
- Phases 6 and 7 need an approved release-specific dependency order. No customer launch may omit required commercial, security, recovery or statutory controls.
- Operational cost and complexity remain bounded by individually justified infrastructure decisions.

## Rollout and migration

Documentation only. No database, application or external service is changed. After owner approval, record the approval date and evidence, resolve each blocking decision, and approve the exact Phase 1 scope. Rejecting this proposal requires a documented replacement sequence; never mark the proposal accepted automatically.

## Review triggers

Review when first delivery workflows, launch obligations, staffing, budget or measured dependencies show that the sequence should change. This ADR does not supersede the root engineering or approval rules.
