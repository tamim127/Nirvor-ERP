# Quality Gates and Definition of Done

## Pull request gates

- Formatting passes
- Lint passes
- Type checking passes
- Unit tests pass
- Relevant integration tests pass
- Build passes
- Dependency/security scans reviewed
- Migration review completed if schema changed
- Tenant isolation and authorization tests added where relevant
- Documentation updated
- No unresolved critical/high-risk finding without explicit approval

## Phase gate

A phase is complete only when:
- Scope and acceptance criteria are met.
- Required artifacts exist.
- Automated verification has run and results are recorded.
- Security and operational risks are reviewed.
- Known limitations are documented.
- Product owner approves the milestone.

## Release gate

- Staging smoke tests pass.
- Migration and rollback/forward-fix plan reviewed.
- Backup status verified.
- Dashboards and alerts ready.
- On-call/incident owner identified.
- Feature flags and rollback controls ready.
- Release notes prepared.

## Reporting rule

Reports must distinguish:
- Verified
- Not tested
- Failed
- Blocked
- Assumed
