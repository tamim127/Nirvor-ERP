# Phase 2 Identity and Tenant Foundation Plan

Status: Proposed implementation contract; blocked on D-006 and D-021 owner decisions.
Prepared 2026-11-18 after approval to begin Phase 0 closure and Phase 2 planning.

## Outcome

Implement a secure identity and tenant foundation for the approved workspace model:
one company per customer workspace, multiple branches, server-derived membership and
authorization, session lifecycle controls, and auditable security-sensitive changes.

This phase does not implement subscriptions, entitlements, ERP business modules,
financial posting, inventory operations, provider billing, or unrestricted platform
support access.

## Required decisions before implementation

### D-006 Authentication and sessions

Recommended baseline: an established maintained authentication library with secure
HttpOnly, Secure, SameSite cookies for browser sessions, server-side session records,
short-lived session validity, explicit logout/revocation, recovery controls, and MFA
support for privileged roles. Do not store raw passwords or invent cryptography.

The owner must approve whether identity is:

1. Application-managed credentials using a maintained password/session library; or
2. A managed identity provider with an application-side session and membership mapping.

The choice must include recovery, invitation, MFA, session revocation, support access,
rate limiting, data residency, cost, and local-development behavior.

### D-021 Branch access and cross-workspace membership

The one-company/multiple-branch cardinality is approved. The following policy is still
required before authorization code is written:

- whether a user may belong to multiple workspaces;
- whether a membership can be restricted to selected branches;
- whether tenant administrators can delegate branch administration;
- how active workspace and branch context is selected and changed;
- whether cross-branch transfers are permitted and who may approve them;
- how membership removal affects active sessions and pending work.

Recommended least-privilege baseline: memberships are workspace-scoped by default,
branch scope is an explicit allow-list, no cross-workspace data access is implicit,
active context is server-validated on every request, and revocation invalidates future
requests and queued work according to an auditable policy.

## Bounded contexts and ownership

| Context | Owns | Must not own |
|---|---|---|
| Identity | users, credentials/provider identity, recovery, sessions | tenant business records |
| Tenant | workspace, company, branches, lifecycle | authentication secrets |
| Access | memberships, roles, permissions, branch scope | commercial entitlements |
| Audit | append-only security and authorization events | mutable business state |

The implementation remains a modular monolith. Contexts communicate through application
contracts; they do not share tables as an informal integration mechanism.

## Acceptance criteria

### Identity and session

- Unauthenticated requests to protected endpoints receive the stable authentication error.
- Authenticated identity is derived from verified server-side credentials, never request fields.
- Logout and administrative revocation prevent subsequent protected access.
- Recovery and invitation flows are single-use, time-limited, rate-limited, and auditable.
- Privileged-role authentication supports the approved MFA policy.
- Sensitive tokens and credentials are absent from logs, URLs, error responses, and fixtures.

### Tenant and branch isolation

- A request cannot select a tenant, company, or branch it is not authorized to use.
- Tenant A cannot read, update, delete, export, search, or reference Tenant B data.
- A workspace cannot create a second company.
- Foreign workspace/company/branch references are rejected by application and database constraints.
- Branch visibility and actions match the approved D-021 policy.
- Revoked membership is denied for HTTP requests and any in-scope asynchronous or realtime path.
- Database isolation remains default-deny without trusted transaction context.

### Authorization and audit

- Protected actions are deny-by-default and require explicit permission checks.
- Platform permissions and tenant permissions are separate.
- Resource ownership is checked independently from input shape validation.
- Membership, role, permission, session, invitation, recovery, and support-sensitive events
  are append-only/auditable with actor, tenant, scope, reason where required, and timestamp.
- Audit reads are tenant-scoped and protected from ordinary mutation.

## Verification plan

- Unit: session state transitions, permission evaluation, branch-scope evaluation, and
  invitation/recovery expiry.
- Integration: database constraints, RLS context, membership revocation, concurrent
  membership changes, and migration upgrade from the Phase 1 schema.
- Contract: stable authentication/authorization error envelopes and bounded response shapes.
- Security: IDOR/BOLA, forged tenant/branch IDs, role escalation, replayed invitations,
  recovery abuse, session fixation, revoked-session reuse, and cross-workspace membership.
- End-to-end: sign-in, workspace selection, branch selection, denial, logout, and recovery
  on narrow English and Bangla-capable layouts after the API contract is approved.

No test is a completion claim until it has been executed and its output recorded.

## Migration and recovery

Additive schema changes must be versioned. Expand identity, tenant, membership, and audit
tables before application cutover; preserve forward recovery and do not cascade-delete audit
history. A migration must be safe to re-run through the existing migration runner and must
be tested from an empty database and the current Phase 1 schema.

## Risks and out of scope

- Choosing an auth provider before D-006 would create security and migration rework.
- Assuming branch-wide access would violate least privilege if D-021 selects branch scoping.
- Support access remains blocked on D-018 and must not be implemented as an admin bypass.
- Production deployment, distributed sessions, external identity-provider integration,
  Redis, queues, WebSockets, and production SLOs remain later decisions unless explicitly
  approved with their own evidence.
