import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { errorResponseSchema, healthResponseSchema } from '../src/index.js';

test('error contract requires safe correlation and rejects extra top-level fields', () => {
  const payload = {
    error: { code: 'UNAVAILABLE', message: 'Service unavailable', requestId: randomUUID() },
  };
  assert.equal(errorResponseSchema.safeParse(payload).success, true);
  assert.equal(errorResponseSchema.safeParse({ ...payload, stack: 'internal' }).success, false);
  assert.equal(
    errorResponseSchema.safeParse({ error: { ...payload.error, requestId: 'user-input' } }).success,
    false,
  );
});
test('health contract does not reveal database or configuration details', () => {
  assert.equal(healthResponseSchema.safeParse({ status: 'ready' }).success, true);
  assert.equal(
    healthResponseSchema.safeParse({ status: 'ready', databaseUrl: 'internal' }).success,
    false,
  );
});
