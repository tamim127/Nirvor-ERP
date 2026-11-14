# Architecture Decision Records

## Process

Use one file per significant decision in `docs/04-engineering/adr/`.

Name format: `ADR-NNNN-short-title.md`

Each ADR contains:
- Status: Proposed / Accepted / Rejected / Superseded
- Date
- Context
- Decision drivers
- Options considered
- Decision
- Consequences and trade-offs
- Security and operational impact
- Migration/rollout impact
- Review trigger

## Required ADR topics

- Monorepo and package manager
- Modular monolith boundaries
- Tenant data isolation and RLS
- Authentication/session strategy
- ORM and connection pooling
- Entitlement evaluation and cache invalidation
- Queue and event delivery
- WebSocket distribution
- Object storage
- Deployment and hosting
- Payment provider abstraction
- Observability stack
- Backup and recovery policy

Do not record an unreviewed proposal as accepted.
