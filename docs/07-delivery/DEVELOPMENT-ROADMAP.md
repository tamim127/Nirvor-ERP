# Development Roadmap

This roadmap is a sequence of gated phases, not a promise of delivery dates.

Status: Proposed delivery baseline, updated 2026-11-13. Phase 0 documentation work is active. No implementation phase is approved by this document. See [ADR-0001](../04-engineering/adr/ADR-0001-phase-sequencing-and-validation.md) for the proposed resolution of the earlier README/roadmap mismatch and sequencing conditions.

All candidate industries and modules remain part of the product direction. The first delivery workflows and launch module set remain DECISION REQUIRED. Phase 6 is a series of separately approved advanced-module increments, not a requirement to complete every industry before any launch. The release-specific order of Phase 6 and Phase 7 requires owner approval. Security, accessibility, observability, recovery and capacity checks begin in each applicable phase; Phase 8 verifies the complete approved release.

## Phase 0 — Product and architecture discovery
Deliverables:
- Approved product charter and MVP scope
- Validated target customer and workflows
- Architecture and ADRs
- Tenant and security model
- Initial data and API strategy
- Quality and operational acceptance criteria

Exit: Product owner approves open decisions and architecture baseline.

Working artifacts: [owner baseline](../00-product/OWNER-REQUIREMENTS-BASELINE.md), [Phase 0 work plan](PHASE-0-WORK-PLAN.md), [validation plan](../01-architecture/PHASE-0-VALIDATION-PLAN.md), and [acceptance checklist](PHASE-0-ACCEPTANCE-CHECKLIST.md). Later-stage decisions may be deferred only with explicit approval, owner and trigger; no unresolved critical architectural question may pass the exit gate.

## Phase 1 — Engineering foundation
- Monorepo and package boundaries
- CI checks and coding standards
- Local Docker environment
- Database migration workflow
- Logging and health checks
- Test infrastructure

Exit: reproducible local setup and CI green.

The [proposed Phase 1 plan](PHASE-1-IMPLEMENTATION-PLAN.md) defines the scope and evidence required behind this exit condition. Both Phase 0 and that plan require approval before scaffolding.

## Phase 2 — Identity and tenant foundation
- Authentication/session lifecycle
- Tenant and organization model
- Membership and invitation
- Authorization engine
- RLS and isolation tests
- Audit baseline

Exit: adversarial tenant-isolation suite passes.

Also require the approved one-company/multiple-branch model, permission and session-revocation matrix, invitation/recovery abuse tests, audited support expiry, and negative tests across files, jobs and realtime paths included in the phase.

## Phase 3 — SaaS control plane
- Plan catalog and versions
- Subscription lifecycle
- Feature catalog
- Entitlement evaluation
- Usage metering and quotas
- Platform admin controls

Exit: deterministic entitlement and subscription tests pass.

Also require approved precedence, lifecycle transitions, quota concurrency tests, outage/cache invalidation behavior and auditable overrides. Provider payment execution is Phase 7; its future adapter contract must be explicit here.

## Phase 4 — Templates and module framework
- Module manifests
- Dependency checks
- Activation/deactivation lifecycle
- Versioned templates
- Configuration migration

Exit: safe template application and module lifecycle demonstrated.

Demonstrate restart after partial setup, conflict preview, dependency checks and historical data preservation. Global schema deployment and tenant-specific provisioning must be separate operations.

## Phase 5 — MVP business modules
Choose delivery workflows through owner decisions and domain research without excluding the broader multi-industry catalog. Candidate modules include CRM, Sales, Inventory, Procurement, Finance and HR. Required reconciliation and operational reports ship with their workflows.

Exit: end-to-end business workflows and data integrity verified.

Require domain-approved states, exceptions, approvals, money/quantity precision, concurrency, reversals, audit and mobile acceptance for each delivered workflow. No placeholder module counts as completion.

## Phase 6 — Advanced modules
Manufacturing, supply chain, projects, automation, advanced reporting as justified by demand.

Exit per increment: approved domain specification, module dependency/compatibility review, migration and reconciliation evidence, authorization and failure tests, and usable end-to-end journeys. Preserve the full product catalog; schedule each increment explicitly.

## Phase 7 — Commercial platform
Payments, billing, add-ons, customer portal, integrations, support operations.

Exit: approved commercial/provider policies, verified webhook security, duplicate/out-of-order handling, settlement/refund reconciliation, renewal/downgrade outcomes, customer export and support procedures. Verify current provider documentation before integration. Keep SaaS billing separate from tenant ERP invoicing.

## Phase 8 — Production hardening
Load tests, security assessment, restore drills, incident runbooks, accessibility, performance.

Exit: approved representative load and failure results, tenant-isolation evidence, isolated restore with measured recovery against agreed targets, migration rehearsal, accessibility review, incident ownership and no unresolved launch-blocking security or integrity issue.

## Phase 9 — Launch and iteration
Limited beta, customer feedback, staged rollout, support readiness, reliability review.

Exit for each rollout: named release owner, approved launch scope, target-environment evidence, monitoring and recovery plan, customer support readiness, feedback review and explicit go/no-go. Limited beta still requires the controls appropriate to real customer data.

Every phase must have detailed scope, owners, acceptance criteria, test evidence, risks, and approval.
