# Nirvor ERP — Agent Instructions

## Mission

Build Nirvor ERP as a maintainable, secure, multi-tenant ERP SaaS for businesses of different sizes and industries. The initial market is Bangladesh, with an architecture that can support internationalization later.

## Source of truth

Before making changes, inspect:

1. `README.md`
2. Relevant documents under `docs/`
3. Existing code, tests, migrations, and package scripts
4. Applicable skill instructions under `.agents/skills/`

If documentation conflicts with existing verified behavior, do not guess. Report the conflict and request a decision or create a proposed ADR.

## Non-negotiable engineering rules

- Product engineering comes before feature count.
- Do not start implementation until the current phase and its acceptance criteria are approved.
- Prefer a modular monolith with explicit bounded contexts. Do not introduce microservices without an ADR and a demonstrated need.
- Enforce tenant isolation in the backend and database. Frontend hiding is never authorization.
- Never trust tenant IDs, role names, prices, entitlements, or ownership supplied by the client.
- Use least privilege and deny-by-default authorization.
- Do not store secrets in source code, logs, tests, fixtures, or committed environment files.
- All schema changes require versioned migrations and a documented rollout/rollback strategy.
- Preserve data integrity. Financial and inventory operations must use explicit transactions and immutable/auditable records where appropriate.
- Use idempotency for retryable commands and external webhook processing.
- Use bounded queues, timeouts, retries with backoff, concurrency controls, and dead-letter handling for background work.
- Avoid N+1 queries, unbounded result sets, unbounded payloads, and unbounded WebSocket fan-out.
- Validate input at system boundaries. Validate authorization separately from input shape.
- Use structured logs, correlation/request IDs, metrics, and traces without logging sensitive data.
- Add tests for business rules, authorization, tenant isolation, migrations, and failure cases.
- Do not claim a test, scan, build, migration, deployment, or performance test passed unless it was actually run and its result inspected.
- Do not claim production readiness based only on local tests.
- Keep dependencies minimal and justify infrastructure complexity.
- Maintain backward compatibility for public APIs and persisted data unless a versioned breaking change is approved.
- Update documentation and ADRs when implementation changes an approved design.

## Required workflow for every task

1. Restate the requested outcome and identify the relevant phase.
2. Inspect the repository and relevant documentation.
3. Identify assumptions, dependencies, risks, and affected bounded contexts.
4. Propose a small implementation plan.
5. Implement only the approved scope.
6. Run relevant formatting, lint, type checks, tests, and build commands available in the repository.
7. Inspect the diff for security, tenant isolation, data integrity, accessibility, and performance issues.
8. Update docs, migration notes, and ADRs if required.
9. Report exact files changed, commands run, results, known limitations, and remaining work.

## Scope discipline

- Do not build placeholder screens and call them complete modules.
- Do not invent business rules. Mark unknown rules as `DECISION REQUIRED`.
- Do not add a package, service, queue, cache, database, or cloud provider without explaining why it is needed.
- Do not make irreversible data changes without an explicit migration and recovery plan.
- Do not silently broaden the task.
- If a security-sensitive requirement is ambiguous, stop and ask.

## Initial stack direction (proposed, not immutable)

- Web: Next.js, React, TypeScript
- API: NestJS, TypeScript, REST/OpenAPI
- Database: PostgreSQL
- Data access: Prisma initially, subject to RLS integration and query-control validation
- Cache/coordination: Redis where justified
- Background jobs: BullMQ initially
- UI: Tailwind CSS and shadcn/ui, with a documented design system
- Testing: unit, integration, contract, end-to-end, security and load tests
- Local infrastructure: Docker Compose
- Observability: OpenTelemetry-compatible traces, metrics and structured logs

Do not scaffold until Phase 0 decisions and Phase 1 implementation plan are approved.

## Definition of done

A task is done only when:

- Acceptance criteria are met.
- Relevant automated tests pass.
- Tenant and authorization behavior is tested where applicable.
- Error and edge cases are handled.
- No known critical security issue is introduced.
- Documentation and migrations are updated.
- The final report distinguishes verified facts from assumptions.