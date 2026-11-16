# Local Development Runbook

Updated: 2026-11-14. This runbook covers the Phase 1 local foundation only.

## Prerequisites

- Node.js 24 and npm 11
- Docker Desktop with Linux containers and Docker Compose
- Git

The verified workstation used Node.js 24.22.2, npm 11.6.1, Docker 29.7.2 and Docker Compose 5.5.0.
The lockfile is the dependency source of truth.

## First setup

```powershell
npm ci
npm run setup:local
npm run db:up
npm run build
npm test
```

`setup:local` creates an ignored `.env.local` file with generated local-only credentials. The
committed PostgreSQL initialization script contains no credentials; Docker receives the generated
values only through its local environment. Setup does not print credential values. Do not commit,
paste into tickets, or reuse these credentials outside this local environment. The command refuses to overwrite an existing
`.env.local`; rotate deliberately instead of silently replacing credentials.

## Run the applications

Build first, then run the API and web application in separate terminals:

```powershell
npm run start:api
npm run start --workspace @nirvor/web -- --port 3000
```

For web development with hot reload:

```powershell
npm run dev:web
```

Liveness is `/health/live`; readiness is `/health/ready`. Readiness depends on PostgreSQL and must
fail safely without exposing connection details.

## Verification

```powershell
npm run check
npm run security:dependencies
npm run build
npm test
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.local\browsers'
npm run test:e2e
```

Install the Playwright Chromium binary once if it is absent:

```powershell
$env:PLAYWRIGHT_BROWSERS_PATH = Join-Path (Get-Location) '.local\browsers'
npx playwright install chromium
```

Generated browser reports, screenshots, local credentials, build output and test artifacts are
ignored by Git.

Next.js generated policy: `apps/web/next-env.d.ts` is a tracked framework-generated TypeScript
reference file and may change when the pinned Next.js version changes; review its diff and commit it
only with the related dependency/framework change. `apps/web/AGENTS.md` is local Next.js-generated
agent guidance and is intentionally ignored. Never delete either file to hide a diff; inspect and
preserve intentional changes.

## Database and migrations

```powershell
npm run db:up
npm run db:migrate
npm run db:down
```

The migration command uses the migration credential. Application code must use the runtime
credential. Never grant schema-maintenance powers to the runtime role. Migrations are versioned and
checksummed; changing an already-applied file is treated as tampering. Fix a released migration with
a new forward migration.

## Troubleshooting

- If `db:up` cannot reach the Docker engine, start Docker Desktop and wait until `docker info`
  succeeds.
- If readiness returns 503, check container health with `docker compose --env-file .env.local ps`;
  do not expose the database URL in logs or support messages.
- If browser tests report a busy port, confirm port 3107 is free; Playwright owns that port.
- If local credentials must be regenerated, stop the stack, preserve any needed local data, remove
  only the ignored local credential/database state intentionally, rerun `setup:local`, then recreate
  PostgreSQL. This destroys local data and must never be used as a production recovery procedure.

## Scope limit

This setup has no production identity provider, customer data, backup proof, distributed limiter,
queue, WebSocket infrastructure or deployment topology. Passing this runbook does not establish
production readiness.
