import { test } from 'node:test';
import assert from 'node:assert/strict';
import { randomBytes } from 'node:crypto';
import { Controller, Get, Post } from '@nestjs/common';
import type { AddressInfo } from 'node:net';
import { errorResponseSchema, healthResponseSchema, readConfiguration } from '@nirvor/contracts';
import { createApp, PublicEndpoint } from '../src/app.js';
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
) {
  const config = readConfiguration({
    DATABASE_URL: `postgresql://test:${randomBytes(20).toString('hex')}@localhost/test`,
    API_RATE_LIMIT: '1000',
    ...overrides,
  });
  const events: SafeEvent[] = [];
  const app = await createApp(config, probe, (event) => events.push(event), [TestController]);
  await app.listen(0, '127.0.0.1');
  const address = app.getHttpServer().address() as AddressInfo;
  return { app, events, url: `http://127.0.0.1:${address.port}` };
}

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
