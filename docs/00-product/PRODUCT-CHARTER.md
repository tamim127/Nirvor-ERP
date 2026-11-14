# Product Charter

## 1. Product identity

- Working brand: **Nirvor**
- Product name: **Nirvor ERP**
- Descriptor: Modular Enterprise Business Management Platform
- Working tagline: **Business, Under Control.**
- Initial market: Bangladesh
- Expansion direction: International markets

The brand name, domain availability, company-name availability, and trademark clearance are not confirmed. Treat Nirvor as a working brand until professional clearance is completed.

## 2. Vision

Enable organizations of different sizes and industries to run their operations through one configurable platform. A company should activate only the modules and capabilities it needs, pay according to its plan and usage, and expand without migrating to a different product.

The [owner requirements baseline](OWNER-REQUIREMENTS-BASELINE.md) records the 2026-11-13 confirmation of multi-industry scope, feature-based commercial access, mobile-first UX, and one company with multiple branches per customer workspace. Detailed module delivery and implementation approval remain phase-specific.

## 3. Product principles

1. Configurable, not fragmented: one platform with controlled configuration.
2. Modular: modules have explicit boundaries and dependencies.
3. Tenant-safe: customer data and operations are isolated.
4. Progressive: a small business can start simply and grow.
5. Usable: workflows should be understandable to non-technical staff.
6. Auditable: important business and administrative actions are traceable.
7. Reliable: data integrity takes precedence over superficial convenience.
8. Extensible: integrations and future modules use stable contracts.
9. Localized: Bangladesh requirements are first-class, without hard-coding local assumptions into the core.
10. Measurable: reliability and performance are validated with tests and telemetry.

## 4. Target customers

- Micro and small businesses
- Growing SMEs
- Multi-branch businesses
- Trading and distribution companies
- Retail and wholesale businesses
- Service companies
- Manufacturing businesses
- Larger organizations requiring configurable controls

The initial release must not attempt to fully solve every industry's specialized workflows. Select an initial customer segment through discovery.

## 5. Product outcomes

- Reduce duplicate data entry and disconnected spreadsheets.
- Improve visibility into operational and financial activity.
- Standardize approvals and business processes.
- Provide role-appropriate workspaces.
- Allow owners to control module access and spending.
- Support a safe path from a small plan to a larger plan.

## 6. Non-goals for the first release

- Replacing every specialist industry system.
- Building microservices without evidence.
- Supporting every country, tax regime, and payment provider at launch.
- Unlimited resources or unbounded API usage.
- Claiming compliance certifications before independent assessment.
- Building a native mobile application before validating the mobile web/PWA experience.

## 7. Success measures

Define baselines and targets during discovery:
- Time to onboard a new organization
- Activation rate by selected module
- Weekly active users per tenant
- Task completion time for core workflows
- Support tickets per active tenant
- Tenant-isolation test coverage
- API latency and error rate by endpoint class
- Queue delay and failure rate
- Data recovery test success
- Subscription conversion and churn

Do not publish numerical targets until capacity, product scope, and measurement methods are agreed.
