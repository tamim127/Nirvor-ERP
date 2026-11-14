# Usage Metering and Quotas

## 1. Meter candidates

- Active seats
- Branches/legal entities
- Storage bytes
- API requests
- Automation runs
- Import/export jobs
- Transaction volume
- Retained history

Only meter dimensions that are commercially meaningful and technically measurable.

## 2. Requirements

- Define event source and authoritative measurement.
- Define unit, aggregation window, timezone, and reset behavior.
- Make counting idempotent.
- Handle concurrent consumption safely.
- Expose usage to tenant admins.
- Provide warning thresholds and notification policy.
- Define hard vs soft limits and overage behavior.
- Separate abuse protection limits from paid plan quotas.

## 3. Fairness

A noisy tenant must not exhaust shared resources. Apply per-tenant concurrency, rate, queue, and storage controls. Enterprise exceptions must be explicit and capacity-reviewed.
