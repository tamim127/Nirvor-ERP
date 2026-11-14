# Deployment and Release Management

## Environments

- Local development
- Automated test/CI
- Shared staging
- Production

Use separate credentials, databases, storage buckets, and secrets for each environment.

## Release principles

- Immutable build artifacts.
- Automated tests and security checks.
- Reviewed database migrations.
- Expand/contract schema evolution.
- Feature flags for risky rollouts.
- Canary or staged rollout when infrastructure supports it.
- Rollback or forward-fix plan.
- Post-deploy smoke tests.
- Release notes and change ownership.

## Configuration

Validate required environment variables at startup. Fail safely with clear diagnostics. Never print secrets.

## Infrastructure as code

Adopt infrastructure as code when deployment architecture and provider are selected. Review access policies and state storage security.
