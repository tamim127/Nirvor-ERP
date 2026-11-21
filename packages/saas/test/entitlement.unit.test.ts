import assert from 'node:assert/strict';
import { test } from 'node:test';
import {
  canTransitionSubscription,
  evaluateEntitlement,
  type EntitlementInput,
  type EntitlementPolicy,
  type SubscriptionTransitionPolicy,
} from '../src/index.js';

const policy: EntitlementPolicy = {
  version: 'test-policy-v1',
  restrictionOverridesGrant: true,
  subscriptionAccess: {
    pending_activation: 'disabled',
    trialing: 'enabled',
    active: 'enabled',
    past_due: 'read_only',
    suspended: 'disabled',
    canceled: 'read_only',
    expired: 'disabled',
  },
};

const catalog: NonNullable<EntitlementInput['catalog']> = {
  key: 'inventory.stock.read',
  version: 3,
  status: 'active',
};

const baseline: EntitlementInput = {
  now: '2026-11-21T00:00:00.000Z',
  feature: 'inventory.stock.read',
  requestedAccess: 'read',
  catalog,
  subscriptionState: 'active',
  planFeatures: new Set(['inventory.stock.read']),
  policy,
};

test('entitlements fail closed without policy or an active catalog entry', () => {
  assert.equal(
    evaluateEntitlement((({ policy: _policy, ...input }) => input)(baseline)).reason,
    'policy_unavailable',
  );
  assert.equal(
    evaluateEntitlement({ ...baseline, catalog: { ...catalog, status: 'retired' } }).reason,
    'catalog_unavailable',
  );
});

test('platform and tenant restrictions deny otherwise granted features', () => {
  assert.equal(
    evaluateEntitlement({ ...baseline, platformRestricted: true }).reason,
    'platform_restricted',
  );
  assert.equal(
    evaluateEntitlement({
      ...baseline,
      restrictions: [{ feature: baseline.feature }],
    }).reason,
    'tenant_restricted',
  );
});

test('subscription access mode separates read access from writes', () => {
  assert.equal(evaluateEntitlement({ ...baseline, subscriptionState: 'past_due' }).allowed, true);
  assert.equal(
    evaluateEntitlement({
      ...baseline,
      subscriptionState: 'past_due',
      requestedAccess: 'write',
    }).reason,
    'subscription_read_only',
  );
});

test('time-bounded grants and quota modes are deterministic', () => {
  const granted = {
    ...baseline,
    planFeatures: new Set<string>(),
    grants: [
      {
        feature: baseline.feature,
        startsAt: '2026-11-20T00:00:00.000Z',
        endsAt: '2026-11-22T00:00:00.000Z',
      },
    ],
  };
  assert.equal(evaluateEntitlement(granted).allowed, true);
  assert.equal(
    evaluateEntitlement({
      ...granted,
      usage: { mode: 'hard', limit: 10, used: 10, requested: 1 },
    }).reason,
    'hard_limit_exhausted',
  );
  assert.equal(
    evaluateEntitlement({
      ...granted,
      usage: { mode: 'soft', limit: 10, used: 10, requested: 1 },
    }).reason,
    'allowed_soft_limit',
  );
  assert.equal(
    evaluateEntitlement({
      ...granted,
      usage: {
        mode: 'hard',
        limit: Number.MAX_SAFE_INTEGER,
        used: Number.MAX_SAFE_INTEGER,
        requested: 1,
      },
    }).reason,
    'invalid_input',
  );
});

test('subscription transitions require an explicit versioned policy', () => {
  const transitions: SubscriptionTransitionPolicy = {
    version: 'test-transitions-v1',
    allowed: {
      pending_activation: ['trialing', 'active'],
      trialing: ['active', 'canceled', 'expired'],
      active: ['past_due', 'canceled'],
      past_due: ['active', 'suspended', 'canceled'],
      suspended: ['active', 'canceled'],
      canceled: ['active', 'expired'],
      expired: [],
    },
  };
  assert.equal(canTransitionSubscription('active', 'past_due', transitions), true);
  assert.equal(canTransitionSubscription('active', 'trialing', transitions), false);
  assert.equal(canTransitionSubscription('active', 'active', transitions), false);
  assert.equal(canTransitionSubscription('active', 'past_due'), false);
});
