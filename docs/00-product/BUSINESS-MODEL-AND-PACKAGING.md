# Business Model and Packaging

## 1. Model

Proposed SaaS model:
- Tiered subscriptions
- Optional paid modules/add-ons
- Usage-based charges only where measurable and understandable
- Enterprise contracts for negotiated needs
- Optional implementation, migration, training, and support services

All prices in this document are undecided. Do not hard-code prices in application logic.

## 2. Packaging principles

- A plan grants a versioned baseline set of entitlements.
- Add-ons extend the baseline.
- Contractual overrides can grant or restrict specific capabilities.
- Limits must be explicit and visible to tenant administrators.
- Plan changes must not silently delete data.
- Downgrades must have a grace and remediation policy.
- Usage measurement must be explainable and auditable.
- Never advertise “unlimited” without a defined fair-use and capacity policy.

## 3. Candidate plan dimensions

- Active users
- Legal entities / companies
- Branches
- Storage
- API rate and monthly usage
- Automation executions
- Transaction volume
- Report retention
- Support level
- Available modules and sub-features

## 4. Entitlement precedence (proposed)

The final policy must be approved and tested. A possible evaluation order:
1. Platform safety restrictions and legal suspension
2. Tenant subscription status and contract state
3. Plan baseline
4. Purchased add-ons
5. Approved tenant-specific grants
6. Explicit tenant-specific restrictions
7. Usage and quota enforcement

The system must define whether a restriction always overrides a grant. Fail closed for paid or security-sensitive capabilities when entitlement state cannot be verified, while allowing safe read-only or recovery paths where explicitly designed.

## 5. Subscription lifecycle

Candidate states:
- trialing
- active
- past_due
- suspended
- canceled
- expired
- pending_activation

Define transitions, effective dates, grace periods, payment retries, and data access behavior. Do not infer subscription state from a frontend label.

## 6. Billing and payment

Keep billing domain logic provider-neutral. Payment providers are adapters. Store provider references and verified webhook events, not raw card data. Use idempotency and reconciliation.

## 7. Decisions required

- Initial plan names and prices
- Monthly/annual billing
- Trial duration
- Free plan availability
- Grace period and downgrade policy
- Refund and cancellation policy
- Tax and invoice requirements
- Payment provider selection
- Usage overage policy
