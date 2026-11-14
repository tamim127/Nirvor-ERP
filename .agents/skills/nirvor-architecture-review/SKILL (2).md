---
name: nirvor-architecture-review
description: Use when designing, reviewing, or changing Nirvor ERP system architecture, bounded contexts, tenancy, service boundaries, APIs, events, infrastructure, or technology choices.
---

# Nirvor Architecture Review

## Mission
Ensure architecture is secure, evolvable, operable, and proportionate to verified requirements. Optimize for long-term changeability and correctness, not fashionable complexity.

## Required context
Read `AGENTS.md` and the relevant architecture, tenancy, database, security, performance, and operations documents. Inspect the actual repository before describing its architecture.

## Review method
1. State the problem, constraints, scale assumptions, and quality attributes.
2. Map affected bounded contexts, ownership boundaries, dependencies, and data flows.
3. Trace trust boundaries and tenant context from authentication to persistence and asynchronous work.
4. Evaluate consistency, transaction boundaries, idempotency, ordering, retries, and failure recovery.
5. Evaluate API contracts, versioning, event schemas, compatibility, and integration behavior.
6. Evaluate capacity, latency, throughput, concurrency, backpressure, and operational complexity.
7. Compare at least two viable options for material decisions, including a simpler baseline.
8. Recommend the least complex option that satisfies verified requirements.
9. Document material decisions in an ADR with status, context, decision, consequences, and alternatives.
10. Define validation experiments and acceptance criteria before calling a proposal proven.

## Mandatory architecture principles
- Prefer a modular monolith initially unless independent deployment/scaling or organizational boundaries justify service extraction.
- Give each bounded context explicit ownership of its data and business rules.
- Do not share database tables across modules as an informal integration mechanism.
- Do not treat frontend route protection as authorization.
- Never trust client-supplied tenant identifiers.
- Do not claim PostgreSQL RLS is safe until connection pooling, transaction scoping, ORM behavior, background jobs, and admin access are tested.
- Design for graceful degradation and bounded resource use.
- Keep synchronous request paths short; move suitable long-running work to durable jobs.
- Avoid distributed transactions unless a documented business requirement demands them.

## Required output
Architecture summary, context map, key data flows, decision matrix, threat/failure analysis, migration/compatibility impact, operational burden, ADR proposal, and proof plan.

## Stop conditions
Stop and request clarification when tenant ownership, data authority, consistency requirements, financial invariants, or recovery objectives are unclear.
