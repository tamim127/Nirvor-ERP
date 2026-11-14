# Nirvor ERP

**Nirvor ERP** is a multi-tenant ERP SaaS platform designed to help businesses manage their operations through configurable, integrated business modules.

## Product vision

Build a reliable, extensible ERP platform that can serve different industries and business sizes without requiring a separate application for every customer.

The platform should support:

- Multiple customer workspaces, with one company and multiple branches in each workspace
- Secure multi-tenant data isolation
- Configurable ERP modules
- Industry-specific templates
- Subscription-based feature access
- Role-based permissions
- Business workflows and automation
- Operational dashboards and reporting
- Bangla and English localization
- Bangladesh-first business requirements
- Future international expansion

## Product principles

1. Security and data integrity are foundational.
2. Every tenant must have isolated and authorized access to its data.
3. Modules should have clear responsibilities and boundaries.
4. Businesses should only pay for the features they need.
5. Configuration should be preferred over unnecessary customization.
6. The interface must be consistent, accessible, responsive, and mobile-friendly.
7. Performance and reliability must be measurable.
8. The system must be maintainable as the product grows.

## Initial technical direction

| Layer             | Proposed technology                        |
| ----------------- | ------------------------------------------ |
| Web application   | Next.js, React, TypeScript                 |
| API               | NestJS, TypeScript                         |
| Database          | PostgreSQL                                 |
| ORM               | Prisma, subject to architecture validation |
| Cache             | Redis, when justified                      |
| Background jobs   | BullMQ                                     |
| UI                | Tailwind CSS, shadcn/ui                    |
| Local development | Docker Compose                             |
| Observability     | OpenTelemetry-compatible tooling           |

The Phase 1 implementation currently validates this direction with npm workspaces, Next.js,
NestJS, PostgreSQL and direct `pg` access for the isolation proof. Prisma, Redis, BullMQ,
Tailwind, shadcn/ui and production observability remain unselected or deferred; see ADR-0002.

## Repository structure

```text
nirvor-erp/
├── AGENTS.md
├── README.md
├── apps/
│   ├── api/
│   └── web/
├── packages/
│   ├── contracts/
│   ├── database/
│   └── ui/
├── scripts/
├── tests/
├── compose.yaml
├── .agents/
│   └── skills/
└── docs/
    ├── 00-product/
    ├── 01-architecture/
    ├── 02-platform/
    ├── 03-security/
    ├── 04-engineering/
    ├── 05-operations/
    ├── 06-design/
    └── 07-delivery/
```

Application source code currently contains the bounded Phase 1 engineering foundation and UI
preview. It does not contain completed ERP business modules.

## Development approach

The project follows a phased engineering process:

1. Phase 0: Product discovery and architecture validation
2. Phase 1: Engineering foundation
3. Phase 2: Identity, authentication, and tenant management
4. Phase 3: SaaS control plane and subscription management
5. Phase 4: Module and template framework
6. Phase 5: Core ERP modules
7. Phase 6: Advanced modules
8. Phase 7: Commercial platform
9. Phase 8: Production hardening
10. Phase 9: Launch and iteration

See `docs/07-delivery/DEVELOPMENT-ROADMAP.md` for the detailed roadmap.

## Current status

**Status: Phase 1 implementation verified locally — owner milestone acceptance and remote CI pending**

On 2026-11-13, the product owner explicitly authorized the bounded Phase 1 implementation and
confirmed one company with multiple branches per customer workspace. On 2026-11-14, the local
format, lint, type, boundary, secret, dependency, build, unit, contract, integration and browser
E2E checks passed. Database tests include default-deny tenant context and cross-tenant denial.
The product remains a multi-industry ERP SaaS with company-specific features, reusable templates,
feature-based pricing and mobile-first UX. Business policies, launch scope, production topology,
identity and later-phase acceptance decisions remain open.

Start with the [owner requirements baseline](docs/00-product/OWNER-REQUIREMENTS-BASELINE.md),
[open decisions](docs/07-delivery/OPEN-DECISIONS.md),
[Phase 1 plan](docs/07-delivery/PHASE-1-IMPLEMENTATION-PLAN.md),
[verification report](docs/07-delivery/PHASE-1-VERIFICATION-REPORT.md), and
[local runbook](docs/05-operations/LOCAL-DEVELOPMENT-RUNBOOK.md). Roadmap numbering is aligned
with the detailed roadmap; sequencing remains proposed in
[ADR-0001](docs/04-engineering/adr/ADR-0001-phase-sequencing-and-validation.md).

No production-readiness claim should be made until the required implementation, testing, security reviews, and operational validation are complete.

## Important instructions

All AI coding agents must follow the root `AGENTS.md` instructions and inspect the relevant project documentation before working.
