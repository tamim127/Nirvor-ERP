import { Pool, type PoolClient } from 'pg';
import { randomUUID } from 'node:crypto';
import {
  tenantIdSchema,
  type AuthorizedRequestContext,
  type AuthorizedTenantContext,
} from '@nirvor/contracts';

export interface DatabaseOptions {
  connectionString: string;
  max?: number;
  timeoutMs?: number;
}

export function createPool(options: DatabaseOptions): Pool {
  const timeout = options.timeoutMs ?? 2000;
  const pool = new Pool({
    connectionString: options.connectionString,
    max: options.max ?? 5,
    connectionTimeoutMillis: timeout,
    idleTimeoutMillis: 10000,
    statement_timeout: timeout,
    query_timeout: timeout + 500,
    idle_in_transaction_session_timeout: timeout * 2,
    application_name: 'nirvor-foundation',
  });
  // Idle connection failures must not crash the process or reveal connection details.
  pool.on('error', () => {
    console.error(JSON.stringify({ event: 'database.pool_error' }));
  });
  return pool;
}

export async function withTenant<T>(
  pool: Pool,
  context: AuthorizedTenantContext,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  const tenantId = tenantIdSchema.parse(context.tenantId);
  const client = await pool.connect();
  let discard = false;
  try {
    await client.query('BEGIN');
    await client.query("SELECT set_config('app.tenant_id', $1, true)", [tenantId]);
    const result = await work(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch {
      discard = true;
    }
    throw error;
  } finally {
    client.release(discard);
  }
}

export async function withAuthorizedTenant<T>(
  pool: Pool,
  context: AuthorizedRequestContext,
  work: (client: PoolClient) => Promise<T>,
): Promise<T> {
  tenantIdSchema.parse(context.tenantId);
  tenantIdSchema.parse(context.branchId);
  return withTenant(pool, context, work);
}

export interface AuditEventInput {
  readonly action: string;
  readonly resourceType: string;
  readonly resourceId?: string;
  readonly metadata?: Record<string, unknown>;
}

export async function recordAuditEvent(
  pool: Pool,
  context: AuthorizedRequestContext,
  event: AuditEventInput,
): Promise<void> {
  if (!/^[a-z][a-z0-9_.-]{1,95}$/.test(event.action)) throw new Error('Invalid audit action');
  if (!/^[a-z][a-z0-9_.-]{1,95}$/.test(event.resourceType))
    throw new Error('Invalid audit resource type');
  await withAuthorizedTenant(pool, context, (client) =>
    client.query(
      `INSERT INTO app.audit_events
        (tenant_id, id, actor_user_id, action, resource_type, resource_id, metadata)
       VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb)`,
      [
        context.tenantId,
        randomUUID(),
        context.userId,
        event.action,
        event.resourceType,
        event.resourceId ?? null,
        JSON.stringify(event.metadata ?? {}),
      ],
    ),
  ).then(() => undefined);
}

export { migrate } from './migrate.js';
export {
  authenticateUser,
  createSession,
  createSessionToken,
  hashPassword,
  hashSessionToken,
  normalizeEmail,
  resolveSession,
  revokeSession,
  resolveAuthorizedContext,
  verifyPassword,
} from './auth.js';
