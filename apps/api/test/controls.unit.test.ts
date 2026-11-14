import { test } from 'node:test';
import assert from 'node:assert/strict';
import { WindowLimiter } from '../src/controls.js';

test('limiter bounds requests and recovers at the window boundary', () => {
  const limiter = new WindowLimiter(2, 1000, 2);
  assert.equal(limiter.allow('a', 0), true);
  assert.equal(limiter.allow('a', 1), true);
  assert.equal(limiter.allow('a', 2), false);
  assert.equal(limiter.allow('a', 1000), true);
});
test('limiter bounds key storage without allowing evictions to bypass limits', () => {
  const limiter = new WindowLimiter(1, 1000, 2);
  assert.equal(limiter.allow('a', 0), true);
  assert.equal(limiter.allow('b', 0), true);
  assert.equal(limiter.allow('c', 0), false);
  assert.equal(limiter.allow('a', 1), false);
  assert.equal(limiter.allow('c', 1001), true);
});
