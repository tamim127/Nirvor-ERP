---
name: nirvor-secure-implementation
description: Use for implementing or reviewing authentication, authorization, tenant isolation, sensitive data, billing, files, webhooks, secrets, audit logs, or security-sensitive workflows in Nirvor ERP.
---

# Nirvor Secure Implementation

## Mission
Apply defense in depth. Assume every client input, request, integration, tenant boundary, and asynchronous message can be malformed, stale, replayed, or malicious.

## Required context
Read `AGENTS.md`, `docs/03-security/`, tenancy/access documents, relevant API contracts, and applicable threat-model entries.

## Security workflow
1. Identify assets, actors, trust boundaries, entry points, and abuse cases.
2. Establish authentication identity from verified server-side credentials.
3. Resolve active tenant, organization, membership, and role from trusted server-side state.
4. Authorize every action and resource on the server using least privilege and deny-by-default rules.
5. Enforce tenant scope in queries and persistence; validate database-level isolation where designed.
6. Validate input shape, size, encoding, ownership, and business constraints at boundaries.
7. Protect secrets, sessions, tokens, cookies, uploads, exports, and sensitive logs.
8. Apply rate limits, quotas, timeouts, payload limits, replay protection, and idempotency.
9. Consider CSRF, XSS, injection, SSRF, IDOR/BOLA, privilege escalation, mass assignment, race conditions, and resource exhaustion.
10. Add positive and negative tests, especially cross-tenant and unauthorized access tests.
11. Record residual risk and update the threat model.

## High-risk rules
- Never authorize using a role, tenant ID, price, plan, or permission sent by the browser.
- Never rely on hidden UI elements to protect data or actions.
- Never expose secrets or sensitive personal data in logs, analytics, URLs, or error responses.
- Do not create broad support/admin bypasses. Require explicit scope, justification, time limits, and audit trails.
- File access must validate tenant ownership and authorization on every download or preview.
- Webhooks must verify authenticity, handle duplicates, and tolerate out-of-order delivery.
- Billing and entitlement changes must be auditable and protected from replay and race conditions.

## Required output
Threat summary, trust boundaries, security controls, negative test cases, residual risks, monitoring signals, and documentation changes.

## Stop conditions
Stop if identity authority, tenant ownership, access policy, data classification, retention, support access, or financial impact is ambiguous.
