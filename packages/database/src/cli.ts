import { createPool, migrate } from './index.js';

const connectionString = process.env.MIGRATION_DATABASE_URL;
if (!connectionString) throw new Error('MIGRATION_DATABASE_URL is required');
const pool = createPool({ connectionString, max: 1, timeoutMs: 10000 });
try {
  const count = await migrate(pool);
  console.log(JSON.stringify({ event: 'database.migrated', applied: count }));
} catch {
  console.error(
    JSON.stringify({
      event: 'database.migration_failed',
      message:
        'Migration failed. Inspect database state with authorized maintenance access; no automatic destructive rollback.',
    }),
  );
  process.exitCode = 1;
} finally {
  await pool.end();
}
