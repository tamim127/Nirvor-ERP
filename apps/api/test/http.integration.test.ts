import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Controller, Get, Post } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { errorResponseSchema, healthResponseSchema, readConfiguration } from '@nirvor/contracts';
import { createApp, PublicEndpoint, type AuthPort } from '../src/app.js';
import type { SafeEvent } from '../src/controls.js';

@Controller('test')
class TestController {
  @Get('private') privateRoute() {
    return { shouldNeverReturn: true };
  }
  @Get('error') @PublicEndpoint() failure() {
    throw new Error('internal-sensitive-value');
  }
  @Post('body') @PublicEndpoint() body() {
    return { ok: true };
  }
}

async function fixture(
  overrides: Record<string, string> = {},
  probe: () => Promise<void> = async () => {},
  auth?: AuthPort,
) {
  const config = readConfiguration({
    DATABASE_URL: `postgresql://test:${randomBytes(20).toString('hex')}@localhost/test`,
    API_RATE_LIMIT: '1000',
    ...overrides,
  });
  const events: SafeEvent[] = [];
  const app = await createApp(config, probe, (event) => events.push(event), [TestController], auth);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as AddressInfo;
  return { app, events, url: `http://127.0.0.1:${address.port}` };
}

test('login, server-derived session context and logout', async () => {
  const tenantId = '11111111-1111-4111-8111-111111111111';
  const branchId = '44444444-4444-4444-8444-444444444444';
  const token = 'a'.repeat(64);
  let revoked = false;
  const auth: AuthPort = {
    authenticate: async (email, password) =>
      email === 'owner@example.com' && password === 'correct horse battery staple'
        ? { userId: '22222222-2222-4222-8222-222222222222' }
        : null,
    createSession: async () => ({ token, expiresAt: new Date(Date.now() + 60_000) }),
    resolveSession: async (candidate) =>
      !revoked && candidate === token
        ? { userId: '22222222-2222-4222-8222-222222222222', tenantIds: [tenantId] }
        : null,
    resolveContext: async (candidate, requestedTenant, requestedBranch) =>
      !revoked &&
      candidate === token &&
      requestedTenant === tenantId &&
      requestedBranch === branchId
        ? { userId: '22222222-2222-4222-8222-222222222222', tenantId, branchId }
        : null,
    revokeSession: async (candidate) => {
      if (candidate !== token) return false;
      revoked = true;
      return true;
    },
  };
  const { app, url } = await fixture({}, async () => {}, auth);
  try {
    const invalid = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ email: 'owner@example.com', password: 'short' }),
    });
    assert.equal(invalid.status, 400);
    const login = await fetch(`${url}/auth/login`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        email: 'owner@example.com',
        password: 'correct horse battery staple',
      }),
    });
    assert.equal(login.status, 200);
    const cookie = login.headers.get('set-cookie');
    assert.ok(cookie?.startsWith('nirvor_session='));
    assert.equal(
      (
        await fetch(`${url}/test/private`, {
          headers: { cookie: cookie?.split(';')[0] ?? '', 'x-role': 'owner' },
        })
      ).status,
      403,
      'A valid session and forged role must not authorize an undeclared action',
    );
    assert.equal(
      (
        await fetch(`${url}/auth/session`, {
          headers: { cookie: 'nirvor_session=malformed' },
        })
      ).status,
      401,
    );
    const session = await fetch(`${url}/auth/session`, {
      headers: {
        cookie: cookie?.split(';')[0] ?? '',
        'x-tenant-id': tenantId,
        'x-branch-id': branchId,
      },
    });
    assert.equal(session.status, 200);
    assert.deepEqual(await session.json(), {
      userId: '22222222-2222-4222-8222-222222222222',
      tenantIds: [tenantId],
    });
    assert.equal(
      (
        await fetch(`${url}/auth/session`, {
          headers: {
            cookie: cookie?.split(';')[0] ?? '',
            'x-tenant-id': '33333333-3333-4333-8333-333333333333',
            'x-branch-id': branchId,
          },
        })
      ).status,
      401,
    );
    const logout = await fetch(`${url}/auth/logout`, {
      method: 'POST',
      headers: { cookie: cookie?.split(';')[0] ?? '' },
    });
    assert.equal(logout.status, 200);
    assert.match(logout.headers.get('set-cookie') ?? '', /Max-Age=0/);
    assert.equal(
      (
        await fetch(`${url}/auth/session`, {
          headers: {
            cookie: cookie?.split(';')[0] ?? '',
            'x-tenant-id': tenantId,
            'x-branch-id': branchId,
          },
        })
      ).status,
      401,
    );
  } finally {
    await app.close();
  }
});

test('HTTP health, safe errors, request IDs, headers and deny-by-default', async () => {
  const { app, url, events } = await fixture();
  try {
    const health = await fetch(`${url}/health/live`, {
      headers: { 'x-request-id': 'untrusted', authorization: 'sensitive-input' },
    });
    assert.equal(health.status, 200);
    assert.ok(healthResponseSchema.safeParse(await health.json()).success);
    assert.notEqual(health.headers.get('x-request-id'), 'untrusted');
    assert.equal(health.headers.get('x-content-type-options'), 'nosniff');
    assert.equal(health.headers.get('cache-control'), 'no-store');
    assert.equal((await fetch(`${url}/health/ready`)).status, 200);
    for (const [path, status] of [
      ['/test/private', 401],
      ['/missing?token=sensitive-input', 404],
      ['/test/error', 500],
    ] as const) {
      const response = await fetch(`${url}${path}`, {
        headers: { 'x-tenant-id': 'forged', 'x-role': 'owner' },
      });
      assert.equal(response.status, status);
      const body: unknown = await response.json();
      assert.ok(errorResponseSchema.safeParse(body).success);
      assert.ok(!JSON.stringify(body).includes('internal-sensitive'));
    }
    assert.ok(!JSON.stringify(events).includes('sensitive'));
    assert.ok(!JSON.stringify(events).includes('authorization'));
  } finally {
    await app.close();
  }
});

test('readiness failure does not take liveness down or leak dependency errors', async () => {
  const { app, url } = await fixture({}, async () => {
    throw new Error('private database address');
  });
  try {
    const response = await fetch(`${url}/health/ready`);
    assert.equal(response.status, 503);
    assert.ok(!JSON.stringify(await response.json()).includes('database address'));
    assert.equal((await fetch(`${url}/health/live`)).status, 200);
  } finally {
    await app.close();
  }
});

test('body parser rejects malformed and oversized payloads safely', async () => {
  const { app, url } = await fixture();
  try {
    for (const [body, expected] of [
      ['{broken', 400],
      [JSON.stringify({ data: 'x'.repeat(20000) }), 413],
    ] as const) {
      const response = await fetch(`${url}/test/body`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body,
      });
      assert.equal(response.status, expected);
      assert.ok(errorResponseSchema.safeParse(await response.json()).success);
    }
  } finally {
    await app.close();
  }
});

test('rate limits ignore spoofed forwarded addresses', async () => {
  const { app, url } = await fixture({ API_RATE_LIMIT: '1' });
  try {
    assert.equal((await fetch(`${url}/health/live`)).status, 200);
    const response = await fetch(`${url}/health/live`, {
      headers: { 'x-forwarded-for': '1.2.3.4' },
    });
    assert.equal(response.status, 429);
    assert.ok(response.headers.get('retry-after'));
  } finally {
    await app.close();
  }
});

test('inflight work is bounded and timeout returns a stable error', async () => {
  let started!: () => void;
  let release!: () => void;
  const began = new Promise<void>((resolve) => {
    started = resolve;
  });
  const waiting = new Promise<void>((resolve) => {
    release = resolve;
  });
  const { app, url } = await fixture(
    { API_MAX_INFLIGHT: '1', API_REQUEST_TIMEOUT_MS: '100' },
    async () => {
      started();
      await waiting;
    },
  );
  try {
    const request = fetch(`${url}/health/ready`);
    await began;
    assert.equal((await fetch(`${url}/health/live`)).status, 503);
    const timedOut = await request;
    assert.equal(timedOut.status, 504);
    assert.ok(errorResponseSchema.safeParse(await timedOut.json()).success);
  } finally {
    release();
    await new Promise((resolve) => setTimeout(resolve, 20));
    await app.close();
  }
});
