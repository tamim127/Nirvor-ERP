# Subscription and Billing Architecture

## 1. Domain entities

Candidate entities:
- Product
- Plan and PlanVersion
- AddOn and AddOnVersion
- Price
- Subscription
- SubscriptionItem
- Invoice
- PaymentAttempt
- Payment
- CreditNote / Refund
- UsageRecord
- EntitlementGrant
- Discount / Promotion

## 2. Core principles

- Keep commercial catalog versioned.
- Preserve the plan and price terms that applied to an existing subscription.
- Store money with currency and exact precision.
- Payment provider is an adapter.
- Never store raw card credentials.
- Verify webhook signatures and deduplicate deliveries.
- Reconcile provider state with internal records.
- Separate invoice status, payment status, and subscription status.
- Use idempotency for charge and subscription operations.

## 3. Lifecycle

Define transitions for trial, active, past due, suspended, canceled, and expired states. State changes must have effective timestamps and audit history.

## 4. Downgrade and cancellation

Never silently delete tenant data when a plan is downgraded. Define read-only behavior, grace periods, quota overage, export windows, and reactivation.

## 5. Bangladesh requirements

Payment provider, invoice format, tax treatment, refunds, and settlement workflows require current legal/accounting review and provider documentation. Do not assume a provider supports a capability without verification.
