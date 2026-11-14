import { Pool, type PoolClient } from 'pg';
import { tenantIdSchema, type AuthorizedTenantContext } from '@nirvor/contracts';

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

export { migrate } from './migrate.js';
