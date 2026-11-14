# System Architecture

**Status:** Proposed baseline; ADR approval required.

## 1. Architectural direction

Start with a modular monolith and separate deployable web, API, and worker applications within a monorepo. Maintain explicit domain boundaries and contracts. Extract services only when operational or scaling evidence justifies the cost.

## 2. Logical components

- Web application: presentation, navigation, client-side state.
- API application: authentication, authorization, application use cases, domain orchestration.
- Worker application: asynchronous jobs and scheduled tasks.
- PostgreSQL: authoritative transactional data.
- Redis: cache, distributed coordination, and queue infrastructure where appropriate.
- Object storage: documents and generated files.
- External adapters: email, SMS, payment, accounting imports, and other integrations.
- Observability stack: logs, metrics, traces, alerting.

## 3. Dependency direction

Presentation -> application/use cases -> domain model.
Infrastructure adapters implement interfaces required by application/domain layers.

Domain logic must not depend directly on HTTP frameworks, Redis, cloud SDKs, or ORM-specific models.

## 4. Bounded contexts (candidate)

- Identity and Access
- Tenant and Organization
- Subscription and Billing
- Catalog and Entitlements
- Template and Configuration
- CRM
- Sales
- Inventory
- Procurement
- Finance
- HR
- Manufacturing
- Reporting
- Notifications
- Integrations
- Audit

Boundaries must be refined during discovery. Avoid creating a shared “common” package that becomes a dumping ground.

## 5. Deployment topology

Initial deployment can use independently deployable web, API, and worker containers with managed PostgreSQL and Redis. Use a reverse proxy/load balancer at the edge. Exact provider and topology require an ADR.

## 6. Scaling approach

Scale stateless web/API/worker processes horizontally. Protect PostgreSQL with connection pooling, query budgets, indexes, and bounded concurrency. Use queue-based processing for slow tasks. Apply tenant-aware quotas and fair scheduling.

## 7. Architecture constraints

- No direct cross-module table writes.
- Cross-context interactions use application interfaces or explicit events.
- Avoid distributed transactions in the initial architecture.
- Use an outbox pattern when reliable event publication is required.
- Cache is never the source of truth for authorization or financial balances.
- Every external call has timeout and failure handling.
