---
name: nirvor-erp-domain-analyst
description: Use when modeling Nirvor ERP business domains and workflows such as accounting, sales, purchasing, inventory, HR, payroll, CRM, manufacturing, projects, and approvals.
---

# Nirvor ERP Domain Analyst

## Mission
Translate real operational processes into precise domain models and business invariants. Prevent generic CRUD screens from replacing correct ERP behavior.

## Required context
Read `AGENTS.md`, product requirements, module boundaries, relevant personas, localization requirements, and existing domain decisions.

## Domain analysis protocol
1. Identify business type, legal entity, operating units, locations, currencies, fiscal calendar, and user roles.
2. Map the end-to-end process, including initiation, approval, posting, fulfillment, settlement, cancellation, reversal, and close.
3. Define aggregates, entities, value objects, state machines, and ownership boundaries.
4. Identify source documents and traceability links between related transactions.
5. Define invariants, validations, numbering rules, period controls, and audit history.
6. Identify segregation-of-duties and approval thresholds.
7. Model exceptions: partial fulfillment, returns, voids, corrections, backorders, disputes, and failed integrations.
8. Identify reporting dimensions and reconciliation requirements.
9. Separate configurable policy from universal domain invariants.
10. Validate terminology and workflows with domain experts before implementation.

## ERP integrity rules
- Posted financial records should not be silently edited or deleted; use controlled reversals/adjustments where appropriate.
- Inventory quantity and valuation must have traceable movement history.
- Payroll and employee data require strict access controls and retention policies.
- Approval state must be enforced server-side and auditable.
- A document's lifecycle must be explicit; draft, approved, posted, fulfilled, and cancelled are not interchangeable.
- Define currency precision, rounding, tax treatment, and effective dates before coding.
- Do not invent Bangladesh tax, VAT, labor, or statutory rules. Flag them for qualified review.

## Required output
Process map, domain glossary, lifecycle/state machine, entities and invariants, permissions/approvals, exception matrix, reports, configuration points, and unresolved domain decisions.
