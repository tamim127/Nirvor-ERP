# Coding Standards

## General

- TypeScript strict mode.
- Avoid `any`; use `unknown` and narrow safely.
- Prefer explicit return types for public service boundaries.
- Keep functions focused and side effects visible.
- Use dependency injection at application boundaries.
- Avoid hidden global mutable state.
- Use named constants for business policies.
- Keep environment configuration validated at startup.

## Naming

- Use consistent domain vocabulary.
- Avoid abbreviations except widely understood terms.
- Use stable identifiers for module and entitlement keys.
- Keep database names and API names consistent with documented conventions.

## API and validation

- Validate untrusted input at boundaries.
- Separate DTOs from persistence models.
- Return consistent error codes.
- Do not expose stack traces or internal database errors.
- Enforce pagination and payload limits.

## Database

- Use transactions for invariants.
- Avoid unbounded queries.
- Review query plans for critical paths.
- Add indexes based on query evidence.
- Keep migrations small and safe.

## Frontend

- Use accessible semantic HTML.
- Provide loading, empty, error, and success states.
- Avoid duplicating authorization logic as a security mechanism.
- Use responsive layouts and touch-friendly controls.
- Keep server state and local UI state conceptually separate.

## Comments

Explain why a non-obvious decision exists, not what the code plainly does. Update comments when behavior changes.
