# Owner Requirements Baseline

Recorded: 2026-11-13. Source: product-owner instructions in the project conversation.

This baseline records the owner's intended product and separates it from design choices awaiting approval. It supplements the product charter and PRD; it does not approve implementation, prices, infrastructure, or launch scope.

## Confirmed direction

| ID | Owner requirement | Delivery implication |
|---|---|---|
| OR-01 | Sell one ERP SaaS product to multiple companies | Isolate customer data and configuration throughout requests, persistence, files, caches, jobs, and realtime delivery |
| OR-02 | Each customer workspace contains one company with multiple branches | Tenant is the customer isolation boundary; exactly one company belongs to that workspace; branch access policy remains a separate decision |
| OR-03 | Configure different feature sets for different companies | Separate module installation, commercial entitlement, user permission, and quota enforcement |
| OR-04 | Pricing depends on required features | Version commercial packages and add-ons; amounts, billing intervals, discounts, and meters remain undecided |
| OR-05 | Reusable templates make setup easier | Use versioned declarative configuration with dependency checks, preview, conflict handling, and audit |
| OR-06 | Serve all types of companies, including small and large businesses | Preserve the full candidate module catalog; delivery is incremental, with no approved exclusion of an industry |
| OR-07 | Provide a polished, easy-to-use, mobile-first experience | Design mobile workflows intentionally, with clear loading, empty, error, denied, and recovery states |
| OR-08 | Mobile web should feel like an application | Validate navigation, forms, approvals, and touch interaction; native apps, installation, and offline writes are not yet approved scope |
| OR-09 | Backend must handle growth, overload, and efficient data fetching | Plan rate limits, load distribution, bounded queries, concurrency controls, resource budgets, and reproducible capacity tests |
| OR-10 | Include realtime capabilities such as WebSockets | Identify specific realtime journeys, authorization, reconnect recovery, and fan-out limits before implementation |
| OR-11 | Build a production ERP through controlled phases | Require approved acceptance criteria, security and integrity tests, operational evidence, and owner sign-off |

The owner answered the industry question with “sob thakbe” (everything should be included). This confirms breadth of the intended product, not a selected first vertical or approval to implement every module simultaneously. The owner answered the organization question with “শুধু একটি কোম্পানি, একাধিক শাখা” (one company, multiple branches), resolving D-003.

## Scope and boundaries

The full PRD candidate catalog remains in scope for product planning: CRM, sales, orders/invoicing, inventory, procurement, finance, HR, attendance/leave, payroll, projects, manufacturing, quality, POS, reporting, automation, and integrations. Each requires its own discovery and implementation approval. No candidate module is considered implemented or launch-ready by appearing in the catalog.

Within one workspace, company configuration and branch structure must have explicit ownership. A branch is not an independent subscription tenant by default in this proposed design. Cross-branch visibility, transfers, administrative scope, user membership across separate workspaces, company closure, and ownership transfer are DECISION REQUIRED; the one-company decision does not authorize them.

The platform's own subscription invoices and payments are separate from ERP invoices and payments belonging to customer companies. Commercial access never grants a user permission to view a company's records.

## Proposed acceptance scenarios

These scenarios guide phase planning and are not execution results or approved detailed business rules.

| Scenario | Required observable result | Phase |
|---|---|---|
| Company A requests Company B's record, file, export, or realtime channel | Access denied without revealing B's data | 2 and every affected later phase |
| A customer workspace attempts to add a second company | Rejected under the approved one-company model; branch creation follows authorized limits | 2 |
| An administrator changes a role or support session expires | Access follows the approved revocation policy, including pending jobs and live sessions | 2 |
| A company has a feature but the user lacks its permission | Backend denies the action | 3 |
| A company is downgraded or a module is disabled | Approved access policy applies without silently deleting records | 3–4 |
| Two requests consume the final quota unit concurrently | Outcome satisfies the approved hard/soft limit policy with no duplicate charge | 3 |
| Template update conflicts with company customization | Conflict is surfaced; no silent overwrite or arbitrary code execution | 4 |
| An approved business command is retried or races with another command | Domain invariants hold; audit and idempotency outcomes are explainable | 5–7 |
| User completes an approved workflow on a narrow mobile viewport | Core actions work without page-level horizontal overflow; keyboard, focus, Bangla text, and errors are checked | 1 design baseline and each UI phase |
| One tenant overloads an expensive API, job, or realtime path | Approved resource bounds and degradation policy protect other tenants | Relevant phase, verified again in 8 |

## Unresolved product evidence

Customer interviews, first delivery workflows, launch module set, pricing evidence, workload numbers, retention commitments, and regulatory requirements have not been supplied. Do not infer them from the product's broad ambition or its comparison to Odoo.

See [open decisions](../07-delivery/OPEN-DECISIONS.md), [Phase 0 work plan](../07-delivery/PHASE-0-WORK-PLAN.md), and [roadmap](../07-delivery/DEVELOPMENT-ROADMAP.md).
