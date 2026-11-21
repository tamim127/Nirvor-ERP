import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createSessionToken,
  hashPassword,
  hashSessionToken,
  verifyPassword,
} from '../src/index.js';

test('password hashes are salted and verify without exposing the password', async () => {
  const first = await hashPassword('correct horse battery staple');
  const second = await hashPassword('correct horse battery staple');
  assert.notEqual(first, second);
  assert.equal(await verifyPassword('correct horse battery staple', first), true);
  assert.equal(await verifyPassword('wrong password', first), false);
  assert.equal(await verifyPassword('correct horse battery staple', 'not-a-hash'), false);
});

test('session tokens are opaque, validated, and hashed for persistence', () => {
  const one = createSessionToken();
  const two = createSessionToken();
  assert.notEqual(one.token, two.token);
  assert.notDeepEqual(one.hash, Buffer.from(one.token, 'utf8'));
  assert.deepEqual(hashSessionToken(one.token), one.hash);
});
