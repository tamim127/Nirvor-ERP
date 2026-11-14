# Events and Background Jobs

## 1. Use cases

Use asynchronous processing for email/SMS delivery, report generation, bulk imports/exports, scheduled reminders, integrations, and other work that should not block a request.

## 2. Queue design

- Define queue ownership by bounded context or workload.
- Set maximum attempts, exponential backoff, jitter, and job timeout.
- Use dead-letter handling and operator visibility.
- Bound queue length, payload size, concurrency, and execution time.
- Prioritize workloads carefully; avoid starving lower tiers.
- Apply tenant-aware fair scheduling and quotas.
- Jobs must be idempotent or use deduplication/locking.

## 3. Event reliability

A database commit and message publish are not automatically atomic. Use a transactional outbox where losing an event would violate business correctness. Consumers should use inbox/deduplication patterns.

## 4. Event contracts

Every event should include:
- Event ID
- Event type and schema version
- Occurred-at timestamp
- Tenant and aggregate identifiers where applicable
- Correlation/causation IDs
- Minimal payload
- No secrets or unnecessary personal data

## 5. Failure behavior

Define retryable vs permanent errors. Avoid infinite retries. Provide dead-letter inspection, replay authorization, and audit logs. Ensure poison messages cannot consume unlimited resources.
