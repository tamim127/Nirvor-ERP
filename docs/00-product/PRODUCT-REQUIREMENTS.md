# Product Requirements Document (PRD)

**Status:** Draft for product-owner review
**Product:** Nirvor ERP

## 1. Summary

Nirvor ERP is a multi-tenant SaaS platform offering configurable business modules, subscription plans, add-ons, industry templates, and role-based workspaces.

## 2. Core user roles

### Platform roles
- Platform Owner: controls global platform configuration.
- Platform Operations Admin: performs explicitly authorized support and operational tasks.
- Billing Operations: manages subscription and payment operations with limited permissions.
- Support Agent: accesses only approved support context, preferably through audited, time-limited access.

### Tenant roles
- Organization Owner: owns the tenant relationship and high-level settings.
- Tenant Administrator: manages organization configuration and users.
- Department Manager: manages permitted department workflows.
- Employee: uses assigned functions.
- Auditor: read-only access to authorized records.
- External Accountant/Partner: limited, revocable access if enabled.

Role names are examples. Permissions must be modeled independently from role labels.

## 3. Core journeys

1. Visitor reviews product, plans, and module catalog.
2. Customer registers and verifies identity/contact details.
3. Customer creates an organization or accepts an invitation.
4. Customer selects an industry template or starts from a blank workspace.
5. System provisions tenant configuration and default roles.
6. Owner selects a plan and optional add-ons.
7. Tenant admin invites users and assigns permissions.
8. Employees complete authorized workflows.
9. Owner monitors usage and upgrades or changes the plan.
10. Customer exports data or closes the account under documented policies.

## 4. Functional capability areas

### Platform foundation
- Authentication and session management
- Organization and membership management
- Tenant lifecycle and provisioning
- Roles, permissions, and policy evaluation
- Audit logging
- Notification preferences
- Localization and timezone settings

### SaaS platform
- Plan catalog and versioning
- Subscription lifecycle
- Feature catalog and entitlements
- Add-on catalog
- Usage metering
- Quotas and enforcement
- Trials, discounts, and manual overrides
- Billing records and payment reconciliation

### ERP modules (candidate catalog)
- CRM and contacts
- Sales and quotations
- Orders and invoicing
- Inventory and warehouse
- Procurement and suppliers
- Finance and accounting
- HR and employee records
- Attendance and leave
- Payroll
- Projects and tasks
- Manufacturing and bills of materials
- Quality management
- POS and retail operations
- Reporting and business intelligence
- Workflow automation and integrations

Each module requires its own discovery, workflows, permissions, data model, audit requirements, and acceptance criteria before implementation.

## 5. Cross-cutting requirements

- Every tenant-owned record must have a defined ownership and isolation strategy.
- Authorization must be enforced server-side.
- Sensitive operations must be audited.
- APIs must be versioned and documented.
- Long-running work must use asynchronous processing.
- List APIs must support bounded pagination and filtering.
- User-visible errors must be actionable without leaking internal details.
- Accessibility and responsive behavior must be tested.
- Data export and deletion must follow documented retention and legal requirements.

## 6. Non-functional requirements

Detailed measurable targets are defined in `docs/05-operations/RELIABILITY-AND-SLO.md`. Until approved, all performance figures are targets to be established, not promises.

Required quality attributes:
- Security and tenant isolation
- Availability and recoverability
- Consistent financial and inventory data
- Performance under representative load
- Maintainability and modularity
- Accessibility
- Observability
- Compatibility and upgrade safety

## 7. Bangladesh-first requirements

Candidate requirements requiring validation:
- BDT as a supported currency
- Asia/Dhaka timezone
- Bangla and English interface support
- Local address and phone-number formats
- Local tax/VAT workflows and document requirements
- Bangladesh payment gateway integrations
- Local invoice and financial reporting conventions

Do not encode tax rates or statutory rules as constants. Obtain current professional/legal validation before implementing compliance-sensitive behavior.

## 8. Open product decisions

- Which industry/customer segment is the first paid target?
- Which two or three modules form the MVP?
- Is self-service signup enabled at launch?
- Resolved D-003: one company with multiple branches per customer workspace (owner confirmation, 2026-11-13). Branch access and cross-workspace membership remain open under D-021; see the [owner baseline](OWNER-REQUIREMENTS-BASELINE.md).
- What are the initial plans, limits, trial terms, and billing intervals?
- Which payment provider(s) are required for Bangladesh launch?
- What support-access model is acceptable to customers?
- Which data residency and retention commitments are required?
