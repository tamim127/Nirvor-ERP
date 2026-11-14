import { createHash } from 'node:crypto';
import { readdir, readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { join } from 'node:path';
import type { Pool } from 'pg';

const migrationsDirectory = fileURLToPath(new URL('../../migrations/', import.meta.url));

export async function migrate(
  pool: Pool,
  directory = migrationsDirectory,
  historySchema = 'migration_meta',
): Promise<number> {
  if (!/^[a-z][a-z0-9_]{0,62}$/.test(historySchema))
    throw new Error('Invalid migration history schema');
  const table = `"${historySchema}".history`;
  const client = await pool.connect();
  let locked = false;
  let applied = 0;
  try {
    const lock = await client.query<{ locked: boolean }>(
      'SELECT pg_try_advisory_lock(61523891) AS locked',
    );
    locked = lock.rows[0]?.locked === true;
    if (!locked) throw new Error('Another migration process holds the deployment lock');
    await client.query(`CREATE SCHEMA IF NOT EXISTS "${historySchema}"`);
    await client.query(`REVOKE ALL ON SCHEMA "${historySchema}" FROM PUBLIC`);
    await client.query(
      `CREATE TABLE IF NOT EXISTS ${table} (name text PRIMARY KEY, checksum text NOT NULL, applied_at timestamptz NOT NULL DEFAULT now())`,
    );
    const names = (await readdir(directory))
      .filter((name) => /^\d{4}_[a-z0-9_-]+\.sql$/.test(name))
      .sort();
    if (!names.length) throw new Error('No versioned migrations found');
    const history = await client.query<{ name: string; checksum: string }>(
      `SELECT name, checksum FROM ${table} ORDER BY name`,
    );
    for (let i = 0; i < history.rows.length; i++) {
      if (history.rows[i]?.name !== names[i])
        throw new Error('Migration history is not a prefix of the migration files');
    }
    for (const name of names) {
      const sql = await readFile(join(directory, name), 'utf8');
      const checksum = createHash('sha256').update(sql).digest('hex');
      const existing = history.rows.find((row) => row.name === name);
      if (existing) {
        if (existing.checksum !== checksum) throw new Error(`Migration checksum mismatch: ${name}`);
        continue;
      }
      await client.query('BEGIN');
      try {
        await client.query("SET LOCAL lock_timeout = '3s'");
        await client.query(sql);
        await client.query(`INSERT INTO ${table}(name, checksum) VALUES ($1, $2)`, [
          name,
          checksum,
        ]);
        await client.query('COMMIT');
        applied++;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      }
    }
    return applied;
  } finally {
    if (locked) await client.query('SELECT pg_advisory_unlock(61523891)');
    client.release();
  }
}
