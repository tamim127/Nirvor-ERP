# Phase 5 MVP Business Modules Plan

Status: Phase 5 implementation sequence authorized on 2026-11-21. The owner approved the
offered CRM, Sales and Inventory workflows; implementation order is CRM, Sales, then Inventory.
Detailed launch acceptance and validation customers remain open.

## First implemented slice: CRM lead lifecycle

Target users are small-business owners and operations staff who need a consistent, explainable
lead pipeline. The `@nirvor/crm` bounded context owns pure lead-lifecycle decisions and emits a
versioned, audit-ready event. The caller must supply an approved lifecycle policy, trusted actor
identity and server-resolved tenant context.

This slice deliberately stores no contact or customer personal data. Retention, deletion,
deduplication, assignment and support-access policy remain unresolved. Database and HTTP adapters
are blocked by the unfinished Phase 2 tenant-authorization proof.

## Workflow and invariants

1. An authorized command requests a lead transition using an expected aggregate revision.
2. The domain validates the versioned policy, command identity, deterministic timestamp and
   transition.
3. Stale revisions, duplicate command identifiers and illegal transitions fail closed.
4. Conversion requires an opaque contact reference; disqualification accepts only configured
   reason codes, not unrestricted text.
5. A successful decision increments revision once and emits a versioned event containing the
   trusted actor, command, policy and state transition identifiers.

The actual transition graph is configuration, not a universal CRM rule. Unit-test policies are
fixtures and are not production policy.

## Permissions and security boundary

Permissions are independent capabilities: `crm.lead.create`, `crm.lead.read`,
`crm.lead.transition` and `crm.lead.convert`. Role labels do not grant these automatically.
Application adapters must authenticate, resolve tenant membership, authorize permission and
entitlement, then load and persist only within the trusted tenant transaction.

## Acceptance criteria for this slice

- Missing or malformed lifecycle policy denies the command.
- Illegal transitions and stale revisions are denied.
- Duplicate command identifiers produce an explicit replay signal.
- Conversion requires a valid opaque contact reference.
- Disqualification uses configured reason codes.
- Successful decisions emit deterministic versioned events without customer PII.

## Out of scope and decisions required

- Contact/customer PII schema, classification, retention, export and deletion.
- Lead assignment, branch visibility, merging and deduplication.
- Default production lifecycle and conversion semantics.
- Pipeline reports, mobile UI, notifications and imports.
- Sales money/tax/posting and inventory unit/costing/reversal policies under D-024.

Phase 5 cannot exit until approved end-to-end workflows have tenant-isolated persistence,
authorization, audit, reports, responsive UI, concurrency/failure tests and domain-owner review.
