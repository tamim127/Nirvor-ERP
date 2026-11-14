# Multi-Tenancy and Organization Model

## 1. Proposed model

Start by evaluating shared PostgreSQL database and shared schema with `tenant_id` on tenant-owned rows, reinforced by PostgreSQL Row-Level Security (RLS), application authorization, and automated isolation tests.

Offer dedicated database or dedicated deployment options later for enterprise contracts if justified.

## 2. Conceptual entities

- Platform
- Tenant
- Organization / Legal Entity
- Branch / Location
- User
- Membership
- Role
- Permission
- Subscription
- Entitlement
- Audit Event

Owner decision D-003, confirmed 2026-11-13: each customer workspace contains one company and may contain multiple branches. See the [owner baseline](../00-product/OWNER-REQUIREMENTS-BASELINE.md). Keep workspace/tenant, company, and branch concepts explicit even with this cardinality. The company is the sole business entity within that workspace; do not introduce a group-of-companies hierarchy without a new approved decision. Jurisdiction-specific statutory identity fields remain subject to D-010.

The proposed schema must enforce this relationship, reject cross-workspace company/branch references, and keep subscriptions scoped to the approved commercial model. Cross-branch permissions, branch transfers, and a user's membership across separate workspaces remain DECISION REQUIRED under D-021. Confirmation of cardinality does not prove isolation or authorize support access.

## 3. Tenant context

Tenant context must be resolved from authenticated membership and trusted routing/session context. Never trust a raw tenant ID from request body or query string without membership and policy checks.

Propagate tenant context explicitly through:
- HTTP request context
- application use cases
- database transaction/session
- background job payloads
- event metadata
- WebSocket connection and room membership
- audit events
- cache keys and object-storage paths

## 4. Database isolation

- Apply RLS policies to tenant-owned tables.
- Use transaction-scoped tenant context where supported.
- Ensure connection pooling cannot leak session state between tenants.
- Use composite uniqueness and foreign keys that include tenant scope where appropriate.
- Ensure joins and background jobs preserve tenant boundaries.
- Restrict privileged database roles and test bypass behavior.
- Review migration and maintenance roles separately.

RLS is defense in depth, not a replacement for application authorization. The final design must be validated with the chosen ORM, connection pooler, and transaction model.

## 5. Platform operations access

Support access to tenant data must be explicit, scoped, time-limited, justified, and audited. Prefer customer-approved support sessions. Platform administrators must not receive unrestricted invisible access by default.

## 6. Isolation test cases

- Tenant A cannot read Tenant B records by changing IDs.
- Tenant A cannot update/delete Tenant B records.
- Cross-tenant foreign keys are rejected.
- Background jobs cannot execute under the wrong tenant.
- Cache keys cannot collide across tenants.
- WebSocket subscriptions cannot join another tenant's channel.
- Exports and generated files remain tenant-scoped.
- Support access expires and produces an audit record.

## 7. Decisions required

- Tenant-to-company cardinality is confirmed under D-003; schema and enforcement are not implemented or tested
- Branch permission policy and cross-workspace user membership (D-021)
- Tenant slug/custom domain strategy
- Shared schema vs schema-per-tenant vs database-per-tenant thresholds
- RLS implementation and ORM compatibility
- Tenant deletion and retention workflow
