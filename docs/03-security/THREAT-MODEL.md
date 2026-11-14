# Threat Model

## Assets

- Tenant business records
- Financial and payroll data
- Credentials and sessions
- Subscription and payment state
- API keys and integration secrets
- Uploaded files
- Audit records
- Platform control plane

## Trust boundaries

- Browser/mobile client to API
- Tenant to tenant
- Tenant administrator to employee
- Platform operator to tenant environment
- API to database/cache/queue/object storage
- Application to external provider
- Worker to queued job payload

## Threat scenarios

| Threat | Required controls |
|---|---|
| Cross-tenant data access | RLS, tenant-scoped queries, authorization tests |
| IDOR/BOLA | Resource-level policy checks |
| Privilege escalation | Deny-by-default permissions, separation of duties |
| Session theft | Secure cookies, rotation, MFA, revocation |
| Webhook replay/spoofing | Signature validation, idempotency, replay controls |
| Queue tenant spoofing | Trusted job creation, signed/validated context, scoped worker |
| Noisy-neighbor abuse | Per-tenant quotas, fair scheduling, backpressure |
| Data exfiltration | Least privilege, audit, export controls |
| Malicious file upload | Size/type checks, scanning, isolated storage |
| Supply-chain compromise | Lockfiles, scanning, SBOM, update policy |
| Admin misuse | Just-in-time access, reason, expiry, audit |

## Review method

For each feature, identify assets, actors, entry points, trust boundaries, abuse cases, mitigations, residual risk, and tests. Revisit the threat model when architecture or data flows change.
