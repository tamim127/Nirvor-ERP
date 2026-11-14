# ADR-0002: Phase 1 engineering foundation

- Status: Proposed
- Date: 2026-11-14
- Owners: Product owner and engineering
- Related decisions: D-007, D-014, D-022, D-023 and D-025

## Context

The approved Phase 1 scope needs a small reproducible foundation that validates application
boundaries, database tenant isolation, migration safety, API request controls and mobile-first UI.
Later choices for identity, production hosting, ORM, distributed coordination, jobs and realtime
delivery remain unresolved. Adding them now would widen the foundation without an approved need.

## Decision proposed for acceptance

- Use Node.js 24 and npm workspaces with one lockfile; do not add a monorepo orchestrator yet.
- Use strict TypeScript across `apps` and `packages`.
- Use Next.js for the web boundary and NestJS for the REST API boundary.
- Use PostgreSQL with distinct migration and runtime roles.
- Use direct `pg` access for the Phase 1 isolation proof. Do not infer a final ORM decision.
- Use transaction-scoped, server-derived tenant context and PostgreSQL row-level security.
- Keep a modular monolith. Shared packages contain contracts, database infrastructure and UI;
  no business domain has been fabricated in Phase 1.
- Use local in-process request limits only for foundation behavior. Distributed rate limiting,
  queues, Redis and WebSocket topology require later approved decisions.
- Use Biome for lint, Prettier for formatting, Node's test runner for foundation tests and
  Playwright plus axe-core for browser/accessibility tests.
- Use Docker Compose only for the local PostgreSQL dependency.

## Evidence

On 2026-11-14 the local build and all configured verification suites passed. PostgreSQL tests
proved default denial without tenant context, cross-tenant denial, runtime-role restrictions,
composite-key tenant integrity, pool reuse isolation, migration checksum enforcement, rollback and
recovery. Exact commands and limits are in the
[Phase 1 verification report](../../07-delivery/PHASE-1-VERIFICATION-REPORT.md).

## Consequences

- The baseline stays small and can be replaced deliberately when measured requirements justify it.
- The API must derive tenant identity from authenticated server context once Phase 2 adds identity;
  client-supplied tenant or role headers never become authority.
- Direct `pg` is not approval or rejection of Prisma.
- In-process rate limiting does not satisfy multi-instance production enforcement.
- No worker service exists until a bounded background job is approved.
- This decision does not approve production deployment or establish production readiness.

## Schema rollout and recovery

Migrations are ordered, checksummed and transactional. The migration role owns schema changes;
the runtime role has least privilege and no maintenance authority. Forward recovery is required for
released migrations. Before any production migration, add environment-specific backup, restore,
compatibility and rollout evidence; Phase 1 local recovery tests are not production proof.

## Review triggers

Review before selecting an ORM or pooler, adding authentication, Redis, queues, WebSockets,
horizontal API instances, production deployment or the first business bounded context. Acceptance
requires explicit owner approval; implementation evidence alone does not change this ADR to
Accepted.
