# ADR-0003: Phase 2 identity and tenant foundation

- Status: Proposed
- Date: 2026-11-18
- Owners: Product owner and engineering
- Related decisions: D-006, D-021, D-023 and D-027

## Context

The Phase 1 foundation proves transaction-scoped PostgreSQL tenant context and default-deny
database behavior, but it intentionally has no identity, membership, branch, or audit model.
Phase 2 now has owner approval to begin planning and implementation, while authentication
authority and branch access rules remain unresolved.

## Options

### Identity

- Application-managed credentials and sessions using a maintained library.
- Managed identity provider with an application-side identity and membership mapping.

Both options require server-derived identity, revocation, recovery, MFA policy for privileged
roles, rate limits, audit events, and a local-development strategy. Custom cryptography is not
an option.

### Branch scope

- Workspace-wide membership with explicit branch restrictions only when needed.
- Branch-scoped membership by default, with explicit grants for additional branches.

Both options require server-side validation, no client-authority from submitted IDs, and tests
for cross-branch and cross-workspace denial. The second option is the safer default if the
owner has not established a business need for workspace-wide access.

## Proposed decision

Do not implement identity or branch authorization until D-006 and D-021 are explicitly
resolved. Once resolved, retain the modular monolith, separate Identity, Tenant, Access, and
Audit ownership, and propagate an authenticated authorized context into each database
transaction. Use additive migrations and preserve the existing RLS proof.

## Consequences

- Phase 2 implementation is gated by two owner decisions rather than hidden defaults.
- Client-supplied tenant, company, branch, role, and permission values remain untrusted.
- The database continues to provide defense in depth; application authorization remains
  mandatory.
- Support access, entitlements, billing, background jobs, and realtime authorization require
  their own policies and are not implied by this ADR.

## Proof required before acceptance

- Authenticated identity cannot be forged through headers, body, query, or cookies outside the
  approved session mechanism.
- Revocation blocks subsequent requests and produces an audit event.
- Tenant A/B read, write, reference, export, and search denial tests pass.
- Second-company creation and foreign branch/company references are rejected.
- Pool reuse, rollback, timeout, and missing-context RLS tests remain green.
- Migration upgrade, recovery, and audit immutability behavior are verified.

This ADR remains Proposed until the owner approves the identity and branch-access choices and
the implementation evidence is reviewed.
