# Scalability and Performance Strategy

## Principles

- Measure before optimizing.
- Protect shared resources from noisy tenants.
- Scale stateless compute horizontally.
- Keep database connections bounded.
- Use async jobs for long-running work.
- Apply backpressure rather than allowing unbounded queues.
- Use caching only with clear invalidation and correctness rules.

## API protection

- Rate limits by IP, account, user, tenant, and endpoint risk as appropriate.
- Concurrency limits for expensive operations.
- Request and response size limits.
- Timeouts and cancellation.
- Circuit breakers for failing external dependencies.
- Load shedding and graceful degradation.

## Database

- Connection pooling and pool budgets.
- Query timeouts for risky operations.
- Index and query-plan review.
- Read replicas only for suitable read workloads.
- Partitioning only when measured and operationally justified.
- Avoid unbounded scans and large synchronous exports.

## Tenant fairness

- Per-tenant request and job quotas.
- Weighted or fair queue scheduling where needed.
- Per-tenant concurrency budgets.
- Storage and bandwidth controls.
- Separate priority lanes only when commercial policy and capacity support them.

## Capacity testing

Build representative workload models before setting numeric SLOs. Test normal, peak, burst, tenant skew, queue backlog, dependency failure, and recovery scenarios. Record environment, dataset, concurrency, latency percentiles, errors, and resource use.
