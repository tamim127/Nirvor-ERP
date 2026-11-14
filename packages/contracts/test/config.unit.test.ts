import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { test } from 'node:test';
import { readConfiguration } from '../src/index.js';

test('configuration rejects missing credentials and reports field names only', () => {
  assert.throws(() => readConfiguration({}), /DATABASE_URL/);
  const sensitive = randomBytes(24).toString('hex');
  assert.throws(
    () => readConfiguration({ DATABASE_URL: sensitive }),
    (error: unknown) => {
      assert.ok(error instanceof Error);
      assert.ok(!error.message.includes(sensitive));
      return true;
    },
  );
});

test('configuration bounds resource budgets and validates database protocol', () => {
  const password = randomBytes(24).toString('hex');
  const DATABASE_URL = `postgresql://runtime:${password}@localhost/example`;
  const result = readConfiguration({ DATABASE_URL });
  assert.equal(result.DB_POOL_MAX, 5);
  for (const invalid of ['0', '-1', '100', 'NaN', '1.5']) {
    assert.throws(() => readConfiguration({ DATABASE_URL, DB_POOL_MAX: invalid }));
  }
  assert.throws(() => readConfiguration({ DATABASE_URL: 'https://example.com' }));
});
