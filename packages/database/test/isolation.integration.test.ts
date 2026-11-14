import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { createPool, migrate, withTenant } from '../src/index.js';

test('PostgreSQL migrations, runtime privileges and pooled RLS isolation', async (t) => {
  const runtimeUrl = process.env.TEST_DATABASE_URL;
  const migrationUrl = process.env.TEST_MIGRATION_DATABASE_URL;
  assert.ok(
    runtimeUrl && migrationUrl,
    'Dedicated test URLs are required; tests never silently skip',
  );
  for (const url of [runtimeUrl, migrationUrl])
    assert.equal(new URL(url).pathname, '/nirvor_test', 'Refuse to mutate a non-test database');
  assert.equal(decodeURIComponent(new URL(runtimeUrl).username), 'nirvor_test_runtime');
  assert.equal(decodeURIComponent(new URL(migrationUrl).username), 'nirvor_test_migrator');
  const admin = createPool({ connectionString: migrationUrl, max: 1, timeoutMs: 10000 });
  const runtime = createPool({ connectionString: runtimeUrl, max: 1, timeoutMs: 300 });
  const a = randomUUID(),
    b = randomUUID(),
    rowA = randomUUID(),
    rowB = randomUUID();
  try {
    await migrate(admin);
    assert.equal(await migrate(admin), 0);
    await admin.query(`
      GRANT USAGE ON SCHEMA app TO nirvor_test_runtime;
      GRANT EXECUTE ON FUNCTION app.current_tenant_id() TO nirvor_test_runtime;
      CREATE TABLE IF NOT EXISTS app.isolation_probe (
        tenant_id uuid NOT NULL, id uuid NOT NULL, label text NOT NULL, PRIMARY KEY (tenant_id, id)
      );
      ALTER TABLE app.isolation_probe ENABLE ROW LEVEL SECURITY;
      ALTER TABLE app.isolation_probe FORCE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS tenant_scope ON app.isolation_probe;
      CREATE POLICY tenant_scope ON app.isolation_probe
        USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id());
      CREATE TABLE IF NOT EXISTS app.isolation_child (
        tenant_id uuid NOT NULL, id uuid NOT NULL, parent_id uuid NOT NULL,
        PRIMARY KEY (tenant_id, id), FOREIGN KEY (tenant_id, parent_id) REFERENCES app.isolation_probe(tenant_id, id)
      );
      ALTER TABLE app.isolation_child ENABLE ROW LEVEL SECURITY;
      ALTER TABLE app.isolation_child FORCE ROW LEVEL SECURITY;
      DROP POLICY IF EXISTS tenant_scope ON app.isolation_child;
      CREATE POLICY tenant_scope ON app.isolation_child
        USING (tenant_id = app.current_tenant_id()) WITH CHECK (tenant_id = app.current_tenant_id());
      GRANT SELECT, INSERT, UPDATE, DELETE ON app.isolation_probe, app.isolation_child TO nirvor_test_runtime;
    `);
    for (const [tenantId, id, label] of [
      [a, rowA, 'A'],
      [b, rowB, 'B'],
    ] as const) {
      await withTenant(runtime, { tenantId }, (client) =>
        client.query('INSERT INTO app.isolation_probe VALUES ($1,$2,$3)', [tenantId, id, label]),
      );
    }
    await t.test(
      'missing context denies reads and writes; runtime has no maintenance powers',
      async () => {
        assert.equal((await runtime.query('SELECT * FROM app.isolation_probe')).rowCount, 0);
        await assert.rejects(
          runtime.query('INSERT INTO app.isolation_probe VALUES ($1,$2,$3)', [
            a,
            randomUUID(),
            'denied',
          ]),
        );
        await assert.rejects(runtime.query('CREATE TABLE app.unapproved(id integer)'));
        await assert.rejects(
          runtime.query('ALTER TABLE app.isolation_probe DISABLE ROW LEVEL SECURITY'),
        );
        await assert.rejects(runtime.query('TRUNCATE app.isolation_probe'));
        await assert.rejects(runtime.query('SELECT * FROM migration_meta.history'));
        const flags = await runtime.query(
          'SELECT rolsuper, rolbypassrls, rolcreaterole, rolcreatedb FROM pg_roles WHERE rolname = current_user',
        );
        assert.deepEqual(flags.rows[0], {
          rolsuper: false,
          rolbypassrls: false,
          rolcreaterole: false,
          rolcreatedb: false,
        });
      },
    );
    await t.test('cross-tenant reads, writes and forged ownership changes are denied', async () => {
      await withTenant(runtime, { tenantId: a }, async (client) => {
        assert.equal(
          (await client.query('SELECT * FROM app.isolation_probe WHERE id=$1', [rowB])).rowCount,
          0,
        );
        assert.equal(
          (await client.query("UPDATE app.isolation_probe SET label='changed' WHERE id=$1", [rowB]))
            .rowCount,
          0,
        );
        assert.equal(
          (await client.query('DELETE FROM app.isolation_probe WHERE id=$1', [rowB])).rowCount,
          0,
        );
        assert.equal(
          (await client.query('SELECT label FROM app.isolation_probe WHERE id=$1', [rowA])).rows[0]
            ?.label,
          'A',
        );
      });
      await assert.rejects(
        withTenant(runtime, { tenantId: a }, (client) =>
          client.query('INSERT INTO app.isolation_probe VALUES ($1,$2,$3)', [
            b,
            randomUUID(),
            'forged',
          ]),
        ),
      );
      await assert.rejects(
        withTenant(runtime, { tenantId: a }, (client) =>
          client.query('UPDATE app.isolation_probe SET tenant_id=$1 WHERE id=$2', [b, rowA]),
        ),
      );
    });
    await t.test('composite foreign keys reject references into another tenant', async () => {
      await assert.rejects(
        withTenant(runtime, { tenantId: a }, (client) =>
          client.query('INSERT INTO app.isolation_child VALUES ($1,$2,$3)', [
            a,
            randomUUID(),
            rowB,
          ]),
        ),
      );
    });
    await t.test(
      'pool reuse after commit, rollback, timeout and concurrent callers preserves isolation',
      async () => {
        await assert.rejects(
          withTenant(runtime, { tenantId: a }, async (client) => {
            await client.query("UPDATE app.isolation_probe SET label='rollback' WHERE id=$1", [
              rowA,
            ]);
            throw new Error('intentional rollback');
          }),
        );
        await assert.rejects(
          withTenant(runtime, { tenantId: a }, (client) => client.query('SELECT pg_sleep(1)')),
        );
        await Promise.all(
          Array.from({ length: 12 }, (_, index) => {
            const tenantId = index % 2 ? a : b;
            return withTenant(runtime, { tenantId }, async (client) => {
              const rows = await client.query('SELECT tenant_id FROM app.isolation_probe');
              assert.ok(rows.rows.length > 0);
              assert.ok(
                rows.rows.every((row: { tenant_id: string }) => row.tenant_id === tenantId),
              );
            });
          }),
        );
        assert.equal((await runtime.query('SELECT * FROM app.isolation_probe')).rowCount, 0);
        assert.equal(
          await withTenant(
            runtime,
            { tenantId: a },
            async (client) =>
              (await client.query('SELECT label FROM app.isolation_probe WHERE id=$1', [rowA]))
                .rows[0]?.label,
          ),
          'A',
        );
      },
    );
    await t.test(
      'migrations preserve prior data, reject tampering, roll back failure and recover',
      async () => {
        const suffix = randomUUID().replaceAll('-', '');
        const schema = `proof_${suffix}`,
          history = `history_${suffix}`;
        const fixtureRoot = resolve('.local/migration-fixtures');
        await mkdir(fixtureRoot, { recursive: true });
        const directory = await mkdtemp(join(fixtureRoot, 'run-'));
        const first = `CREATE SCHEMA ${schema}; CREATE TABLE ${schema}.records(id integer PRIMARY KEY); INSERT INTO ${schema}.records VALUES (1);`;
        await writeFile(join(directory, '0001_initial.sql'), first);
        assert.equal(await migrate(admin, directory, history), 1);
        await writeFile(
          join(directory, '0002_expand.sql'),
          `ALTER TABLE ${schema}.records ADD COLUMN label text NOT NULL DEFAULT 'preserved';`,
        );
        assert.equal(await migrate(admin, directory, history), 1);
        assert.deepEqual((await admin.query(`SELECT * FROM ${schema}.records`)).rows, [
          { id: 1, label: 'preserved' },
        ]);
        assert.equal(await migrate(admin, directory, history), 0);
        await writeFile(join(directory, '0001_initial.sql'), `${first}\n-- tampered`);
        await assert.rejects(migrate(admin, directory, history), /checksum/);
        await writeFile(join(directory, '0001_initial.sql'), first);
        await writeFile(
          join(directory, '0003_failure.sql'),
          `ALTER TABLE ${schema}.records ADD COLUMN partial text; SELECT 1/0;`,
        );
        await assert.rejects(migrate(admin, directory, history));
        assert.equal(
          (
            await admin.query(
              'SELECT column_name FROM information_schema.columns WHERE table_schema=$1 AND column_name=$2',
              [schema, 'partial'],
            )
          ).rowCount,
          0,
        );
        await writeFile(
          join(directory, '0003_failure.sql'),
          `ALTER TABLE ${schema}.records ADD COLUMN recovered boolean DEFAULT true;`,
        );
        assert.equal(await migrate(admin, directory, history), 1);
        assert.equal(
          (await admin.query(`SELECT recovered FROM ${schema}.records`)).rows[0]?.recovered,
          true,
        );
        // Generated schemas only, in the explicitly guarded synthetic database.
        await admin.query(`DROP SCHEMA ${schema} CASCADE; DROP SCHEMA ${history} CASCADE;`);
      },
    );
  } finally {
    for (const tenantId of [a, b]) {
      await withTenant(runtime, { tenantId }, (client) =>
        client.query('DELETE FROM app.isolation_probe WHERE tenant_id=$1', [tenantId]),
      ).catch(() => {});
    }
    await runtime.end();
    await admin.end();
  }
});
