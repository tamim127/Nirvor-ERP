# Feature Entitlement Engine

## 1. Purpose

Resolve what a tenant is allowed to use based on subscription, purchased add-ons, contractual grants, restrictions, lifecycle state, and usage policy.

## 2. Separate concepts

- Feature catalog: what capabilities exist.
- Plan: commercial package and default entitlements.
- Add-on: separately purchasable capability or quota extension.
- Subscription: tenant's commercial agreement and lifecycle.
- Entitlement: effective grant/restriction.
- Quota: measurable consumption boundary.
- Feature flag: controlled rollout mechanism, not a substitute for billing entitlement.
- Permission: what a user may do within an enabled capability.

A feature being commercially entitled does not automatically authorize every user.

## 3. Evaluation

Define a deterministic, auditable policy. It must consider:
- Tenant and subscription status
- Plan version
- Purchased add-ons and effective dates
- Approved contract overrides
- Explicit restrictions
- Module dependencies
- Grace periods
- Usage quota state
- Platform safety restrictions

Document precedence and fail-closed behavior for every entitlement class.

## 4. Enforcement

- Backend enforcement is mandatory.
- UI may hide or explain unavailable features but is not a security boundary.
- Cache effective entitlements with explicit invalidation/versioning.
- Do not rely on stale cache for critical billing or security decisions.
- Include tenant, feature, decision, policy version, and reason in safe audit/diagnostic records.
- Avoid exposing internal plan or risk logic unnecessarily.

## 5. Limits

Define limit units, measurement windows, reset behavior, overage behavior, grace policy, and race-safe counting. Use atomic or otherwise concurrency-safe quota enforcement.

## 6. Admin controls

All manual grants/restrictions require actor, reason, scope, effective date, expiry, and audit record. Support emergency revocation.
