# Reliability and SLO Framework

## Status

No numeric availability or latency commitment is approved yet. Establish service-level indicators (SLIs) from representative production-like workloads before publishing service-level objectives (SLOs).

## Candidate SLIs

- API availability by critical route
- Successful login and tenant provisioning
- p50/p95/p99 request latency
- Error rate
- Queue processing delay and failure rate
- WebSocket connection and delivery health
- Database saturation and connection wait
- Backup completion and restore success
- Payment/webhook reconciliation delay

## Service tiers

Classify operations:
- Critical: authentication, authorization, financial posting, inventory posting
- Important: routine CRUD and approvals
- Deferred: reports, bulk exports, notifications, analytics

Define degradation behavior for each tier.

## Error budgets

After SLOs are approved, use error budgets to balance feature delivery and reliability work. Do not use arbitrary uptime percentages without measurement and operational capability.
