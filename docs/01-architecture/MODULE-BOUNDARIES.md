# Module Boundaries and Domain Design

## 1. Principles

- Each module owns its business rules and data lifecycle.
- Other modules must not write directly to its tables.
- Public module interactions use explicit application contracts.
- Events communicate facts that have already occurred.
- Commands request a business action and must be authorized.
- Shared kernel is deliberately small.

## 2. Candidate module responsibilities

| Context | Owns |
|---|---|
| Identity | Credentials, sessions, authentication factors |
| Access | Memberships, roles, permissions, policy decisions |
| Tenant | Tenant lifecycle, organization hierarchy |
| Subscription | Plans, subscriptions, billing state |
| Entitlements | Feature grants, limits, effective access |
| Templates | Versioned configuration blueprints |
| CRM | Leads, contacts, customer relationship records |
| Sales | Quotations, sales orders, sales lifecycle |
| Inventory | Stock ledger, locations, reservations |
| Procurement | Suppliers, purchase orders, receipts |
| Finance | Chart of accounts, journals, periods, reconciliation |
| HR | Employee records, departments, leave, attendance |
| Manufacturing | BOM, work orders, production consumption/output |
| Audit | Security and business audit records |

## 3. Financial and inventory invariants

- Posted accounting entries should be immutable; corrections use reversal/adjustment workflows.
- Journal entries must balance before posting.
- Inventory movements must be traceable and reconcile to stock balances.
- Do not treat a mutable quantity field as the only stock history.
- Use explicit units of measure and conversion rules.
- Define costing method and valuation policy before inventory accounting.

## 4. Module lifecycle

Each module should declare:
- Stable module identifier
- Version
- Dependencies
- Permissions
- Entitlements
- Routes/navigation contributions
- Events published/consumed
- Data ownership
- Migration requirements
- Configuration schema
- Health/operational requirements

Do not dynamically execute arbitrary tenant-supplied code in the core application.
