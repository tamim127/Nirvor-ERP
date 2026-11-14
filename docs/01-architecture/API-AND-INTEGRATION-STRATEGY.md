# API and Integration Strategy

## 1. API style

Use REST with OpenAPI as the initial public and internal HTTP contract. Keep API versioning and compatibility policy explicit.

## 2. API standards

- Consistent resource naming and HTTP semantics.
- Request and response schemas.
- Stable error format with machine-readable codes.
- Authentication and authorization on every protected operation.
- Tenant context resolved server-side.
- Pagination, filtering, sorting, and field selection are bounded.
- Request size and upload limits are enforced.
- Rate limits vary by route risk, identity, tenant plan, and infrastructure safety.
- Idempotency for payment, order submission, and other retry-sensitive commands.
- Correlation/request IDs for tracing.

## 3. Versioning

Prefer additive changes. Deprecate with a published timeline. Breaking changes require a new API version and migration guidance. Internal contracts should also be versioned when independently deployed consumers exist.

## 4. Webhooks

- Verify signatures.
- Enforce timestamp/replay protection where supported.
- Persist delivery identity and idempotency state.
- Process asynchronously.
- Retry safely with exponential backoff and jitter.
- Dead-letter permanently failing events.
- Provide delivery history and controlled replay.

## 5. Third-party integrations

Use adapter boundaries. External provider models must not leak throughout domain code. Define timeouts, retry policy, rate limits, circuit breaking, credential rotation, and reconciliation.

## 6. File APIs

- Use signed, short-lived upload/download URLs where appropriate.
- Validate content type and size.
- Scan uploaded files where risk warrants.
- Store files outside application containers.
- Enforce tenant-scoped metadata and access checks.
