# Open Decisions Register

Updated: 2026-11-14. Record unresolved decisions here; never silently invent answers. General authorization to start phased work is not approval of every decision. Approved requirements and their limits are recorded in the [owner baseline](../00-product/OWNER-REQUIREMENTS-BASELINE.md).

| ID | Decision | Owner | Status | Evidence or next action / blocking milestone |
|---|---|---|---|---|
| D-001 | First delivery workflows and validation customers within all-industry scope | Product owner | Open | Owner says all industries are included; first delivery ordering and customer validation remain undecided; Phase 0 |
| D-002 | MVP/release module set and acceptance | Product owner | Open | Full candidate catalog retained; approve complete workflow slices and launch scope; Phase 0 |
| D-003 | Tenant vs company relationship | Product owner | Approved | 2026-11-13 explicit answer: one company, multiple branches per workspace; [baseline OR-02](../00-product/OWNER-REQUIREMENTS-BASELINE.md); branch policy is D-021 |
| D-004 | Initial pricing, packaging and limits | Product owner | Open | Feature-based pricing direction confirmed; amounts, meters, terms and quotas unapproved; Phase 0 policy baseline / Phase 3 detail |
| D-005 | Signup and verification flow | Product owner | Open | Self-service versus assisted onboarding, abuse controls and invitation lifecycle; Phase 0 |
| D-006 | Authentication provider/library and sessions | Engineering + product owner | Open | Compare maintained library and managed provider; recovery/MFA/revocation matrix; Phase 0 |
| D-007 | RLS, ORM and pooling | Engineering | Open | Phase 1 direct-`pg` RLS proof passed locally on 2026-11-14; ORM and production pooler/topology still require a dedicated ADR; Phase 0 |
| D-008 | Hosting, environments and deployment provider | Product/Engineering | Open | Region, budget, runtime identities, secrets, storage and topology; Phase 0 |
| D-009 | Bangladesh payment providers | Product owner | Open | Verify official capabilities after commercial requirements; launch dependency, deferral needs explicit approval |
| D-010 | Tax/VAT, statutory identity and invoice rules | Product owner + advisor | Open | Current authoritative/professional validation; before affected domain implementation |
| D-011 | Retention, export and recovery objectives | Product/Engineering | Open | Data classes, legal hold/deletion, RPO/RTO, restore ownership; Phase 0 |
| D-012 | Domain and trademark clearance | Product owner/legal advisor | Open | Working brand only; before public commercial commitment |
| D-013 | Canonical roadmap and phase sequencing | Product owner | Proposed | [ADR-0001](../04-engineering/adr/ADR-0001-phase-sequencing-and-validation.md); Phase 0 |
| D-014 | Stack, runtime, package manager and boundaries | Engineering | Proposed | Minimal npm-workspace baseline implemented and verified locally; [ADR-0002](../04-engineering/adr/ADR-0002-phase-1-engineering-foundation.md) awaits owner acceptance |
| D-015 | Entitlement precedence, revocation and outage behavior | Product/Engineering | Open | Grants/restrictions, policy versions, cache invalidation, safe recovery paths; Phase 0 |
| D-016 | Subscription and usage lifecycle | Product/Engineering | Open | Transition table, grace/downgrade/expiry, idempotent concurrent meters; Phase 0 |
| D-017 | Module and template lifecycle | Product/Engineering | Open | Dependency behavior, partial provisioning, configuration conflicts, retained records; Phase 0 |
| D-018 | Platform support access | Product owner + security reviewer | Open | Approval authority, scope, reason, expiry, emergency handling, audit; Phase 0 |
| D-019 | Capacity, SLI/SLO measurement and operational budget | Product/Engineering | Open | Workloads, concurrency, data sizes, resource limits, owners and measurement plan; Phase 0 |
| D-020 | Mobile UX scope and localization acceptance | Product owner + design | Open | Responsive journeys, Bangla/English, accessibility, PWA/offline scope; Phase 0 baseline |
| D-021 | Branch access and cross-workspace membership | Product owner + security reviewer | Open | Visibility, role delegation, transfers, tenant switching, owner lifecycle; Phase 0 |
| D-022 | API, events, queues and realtime conventions | Engineering | Open | Versioning, idempotency, error contracts, trusted jobs, replay, WebSocket scope/distribution; Phase 0 |
| D-023 | Migration and provisioning authority | Engineering | Open | Global schema versus tenant setup, maintenance roles, recovery and compatibility; Phase 0 |
| D-024 | Financial and inventory workflow contracts | Product owner + domain advisor | Open | Invoice ownership, posting boundaries, stock costing, units, period/rounding/reversal rules; approved baseline before affected module |
| D-025 | Phase 1 implementation plan | Product owner | Approved | Product owner explicitly instructed implementation and Phase 1 completion on 2026-11-13; [plan and acceptance criteria](PHASE-1-IMPLEMENTATION-PLAN.md); local evidence recorded 2026-11-14 |
| D-026 | Phase 0 validation experiments | Product owner + engineering | Proposed | The RLS/migration subset was executed under the approved Phase 1 plan and passed locally; remaining [proof matrix](../01-architecture/PHASE-0-VALIDATION-PLAN.md) scope still needs approval |
| D-027 | Observability and audit policy | Engineering + security reviewer | Open | Redaction, audit durability/access/retention, trace/log tools, metrics cardinality, alerts and runbook ownership; Phase 0 |

Statuses: Open, Proposed, Approved, Rejected, Deferred. Approved entries require the decision, approver, date, evidence and applicable ADR. Deferred entries require rationale, owner and a mandatory revisit trigger. ADR status uses Accepted only after explicit approval. The D-003 approval resolves cardinality only, not the entire tenant security model or Phase 0 exit.
