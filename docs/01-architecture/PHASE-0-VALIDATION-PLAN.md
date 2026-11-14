# Phase 0 Architecture Validation Plan

Status: Proposed, not executed. Owners: engineering and product owner; named operational reviewers remain DECISION REQUIRED.

## Constraints and quality attributes

Use the [owner baseline](../00-product/OWNER-REQUIREMENTS-BASELINE.md): multiple customer workspaces, one company per workspace, multiple branches, configurable commercial access, mobile-first workflows, and growth across industries. Protect confidentiality, authorization, financial and inventory integrity, recoverability, compatibility, accessibility, and bounded resource use. Workload, budget, deployment region, SLO and recovery targets are undecided.

## Options to resolve through individual ADRs

These are evaluation candidates, not verified vendor capabilities or approved selections. Check current official documentation and supported versions before an experiment or implementation.

| Decision | Simpler baseline | Alternative | Proposed evaluation |
|---|---|---|---|
| Application boundaries | Modular monolith with explicit application contracts | Independently deployed domain services | Keep the existing monolith proposal; require measured need and ADR before service extraction |
| Tenant persistence | Shared schema with tenant constraints, authorization and RLS | Dedicated database per tenant | Compare isolation proof, pool management, restore, migrations and operating cost; do not choose from scale claims alone |
| Authentication | Maintained authentication library integrated with application | Managed identity provider | Compare session/recovery/MFA requirements, support burden, cost, data residency and revocation |
| Data access | Existing Prisma proposal | Explicit SQL/query layer | Validate transaction-scoped context, migrations, runtime roles, joins and query control before selecting |
| Realtime delivery | Bounded HTTP refresh for ordinary state | WebSockets for validated realtime journeys | Retain requested realtime capability, but select it per journey and validate authorization/fan-out/reconnect |
| Asynchronous work | PostgreSQL outbox and a bounded worker where sufficient | BullMQ/Redis with durable outbox handoff where required | Compare retry semantics, delivery proof, scheduling, tenant fairness and operations; no queue product is selected here |
| Foundation tooling | Package-manager workspaces and explicit scripts | Additional monorepo orchestration tooling | Add tooling only when build graph, caching or task coordination justifies it |

Each accepted option must get its own decision record with context, consequences, rollout, recovery, reviewer and review trigger. [ADR-0001](../04-engineering/adr/ADR-0001-phase-sequencing-and-validation.md) proposes sequencing, not acceptance of these technologies.

## Trust boundaries and proposed flows

1. Browser -> edge -> API: validate authenticated identity, workspace membership, company/branch scope, permission, entitlement, input and limits. A submitted workspace/branch identifier selects a candidate scope; it never proves authorization.
2. API -> domain -> database: use an explicit authorized context, constrained runtime role, tenant-aware keys and short transactions. Company belongs to one workspace; branch references must preserve that ownership. Critical invariants and RLS must survive bypass attempts through alternate query paths.
3. Database -> outbox -> worker: commit required event intent with business state; verify job source and scope; apply approved current-authorization or durable-command semantics; deduplicate effects and bound retries.
4. Provider -> webhook -> durable processing -> reconciliation: authenticate delivery, record identity, tolerate duplicates and ordering, and reconcile authoritative provider/domain state. Browser redirects cannot settle financial truth.
5. API -> files/cache/realtime: isolate keys, metadata and subscriptions; authorize access and renewal; enforce expiry, size limits and recovery. Realtime hints do not replace authoritative reads.
6. Platform support -> company data: explicit scope, approval policy, reason, expiry and audit. No unrestricted support bypass is implied by platform ownership.

## Proposed proof matrix

| ID | Experiment or review | Acceptance evidence required before design acceptance |
|---|---|---|
| V-01 | RLS/ORM/pooler transaction isolation | Tenant A/B canaries; missing context denied; read/write/reference isolation; concurrent pool reuse; commit, rollback, error and timeout paths; runtime/maintenance roles; workers and raw queries; no cross-tenant data or lingering context |
| V-02 | Company and branch ownership | Reject a second company in the same workspace; reject foreign workspace/company/branch references; test branch permissions after D-021 approval |
| V-03 | Identity, access and support | Permission matrix includes denial cases, role escalation, invitation abuse, recovery, logout, revocation, tenant switching, support expiry, job and websocket behavior |
| V-04 | Business command, outbox and consumer failure | Inject failure before/after commit, dispatch and effect; duplicate and out-of-order deliveries produce the approved outcome; dead letters are observable and replay is authorized |
| V-05 | Entitlements and quota | Deterministic precedence and policy version; concurrent last-unit consumption; state change versus active request; cache invalidation; outage behavior and safe recovery paths |
| V-06 | Workflow integrity | Domain-approved posting, reservation, rounding, reversal, period and concurrency scenarios; ledger/reconciliation checks where applicable |
| V-07 | Deployment, migration and restore design | Compatible app/schema ordering; clean and prior-version migration tests; backfill restart and lock budgets; isolated database/file restore with integrity checks and measured RPO/RTO |
| V-08 | Capacity and noisy tenant | Approved dataset/workload, environment and budgets; normal/burst/skew load; bounded queries, connections, jobs and fan-out; recovery after dependency failure |
| V-09 | Mobile and localization | Representative Bangla/English tasks, narrow viewports, keyboard/focus/screen-reader checks, denied/error states and safe interrupted submission behavior |

Define exact fixtures, workload values, commands, expected results and stop conditions before approving an experiment. Record runtime versions, configuration, output and limitations afterwards. Failure or untested paths prevent a proof claim. No proof has been run in this documentation task.

## Failure and operational responsibilities

Database unavailability, cache/queue loss, poisoned jobs, provider outage, revoked membership, stale entitlement state, excessive fan-out and interrupted migrations need explicit fail/retry/degrade policies. Critical writes must not become successful merely because a request was queued or a client showed success. Long-running exports need expiry, cancellation, ownership checks and bounded storage.

Every proposed service requires an owner, cost reason, secret/patch lifecycle, monitoring, backup/recovery treatment and shutdown behavior. Redis for cache and Redis for durable job coordination must have explicitly reviewed failure and retention policies; shared deployment is not assumed. Numeric commitments await D-011 and D-019.

## Migration and compatibility impact

There is no persisted application schema to migrate today. Future schema migrations are deployment-wide operations under a maintenance identity, separate from tenant module provisioning. Do not let enabling a module grant application users schema privileges. Tenant setup must be authorized, idempotent, auditable and recoverable without removing historical records. Keep API, event, template and plan versions explicit across rollout.
