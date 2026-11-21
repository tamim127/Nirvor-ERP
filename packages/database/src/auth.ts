import { createHash, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { emailSchema, sessionTokenSchema, tenantIdSchema } from '@nirvor/contracts';
import type { Pool } from 'pg';

const N = 16384;
const R = 8;
const P = 1;
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(password, salt, KEY_LENGTH, { N, r: R, p: P }, (error, derived) => {
      if (error) reject(error);
      else resolve(derived as Buffer);
    });
  });
}

function encode(value: Buffer): string {
  return value.toString('base64url');
}

function decode(value: string): Buffer {
  return Buffer.from(value, 'base64url');
}

export async function hashPassword(password: string): Promise<string> {
  if (password.length < 12 || password.length > 256) throw new Error('Invalid password length');
  const salt = randomBytes(16);
  const derived = await derive(password, salt);
  return `scrypt$${N}$${R}$${P}$${encode(salt)}$${encode(derived)}`;
}

export async function verifyPassword(password: string, encoded: string): Promise<boolean> {
  const parts = encoded.split('$');
  if (parts.length !== 6 || parts[0] !== 'scrypt') return false;
  const n = parts[1],
    r = parts[2],
    p = parts[3],
    saltValue = parts[4],
    hashValue = parts[5];
  if (!n || !r || !p || !saltValue || !hashValue) return false;
  if (n !== String(N) || r !== String(R) || p !== String(P)) return false;
  try {
    const salt = decode(saltValue);
    const expected = decode(hashValue);
    if (salt.length !== 16 || expected.length !== KEY_LENGTH) return false;
    const actual = await derive(password, salt);
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export function createSessionToken(): { token: string; hash: Buffer } {
  const token = randomBytes(48).toString('base64url');
  sessionTokenSchema.parse(token);
  return { token, hash: hashSessionToken(token) };
}

export function hashSessionToken(token: string): Buffer {
  sessionTokenSchema.parse(token);
  return createHash('sha256').update(token, 'utf8').digest();
}

export async function createSession(
  pool: Pool,
  userId: string,
  lifetimeMs = 8 * 60 * 60 * 1000,
): Promise<{ id: string; token: string; expiresAt: Date }> {
  if (!Number.isInteger(lifetimeMs) || lifetimeMs < 60_000 || lifetimeMs > 24 * 60 * 60 * 1000)
    throw new Error('Invalid session lifetime');
  const { randomUUID } = await import('node:crypto');
  const { token, hash } = createSessionToken();
  const id = randomUUID();
  const expiresAt = new Date(Date.now() + lifetimeMs);
  await pool.query(
    'INSERT INTO app.sessions(id, user_id, token_hash, expires_at) VALUES ($1,$2,$3,$4)',
    [id, userId, hash, expiresAt],
  );
  return { id, token, expiresAt };
}

export async function resolveSession(
  pool: Pool,
  token: string,
): Promise<{ userId: string; tenantIds: string[] } | null> {
  const hash = hashSessionToken(token);
  const result = await pool.query<{ user_id: string; tenant_id: string | null }>(
    `SELECT s.user_id, m.tenant_id
       FROM app.sessions s
       JOIN app.users u ON u.id = s.user_id AND u.status = 'active'
       LEFT JOIN app.memberships m ON m.user_id = s.user_id AND m.status = 'active'
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
    [hash],
  );
  const first = result.rows[0];
  return first
    ? {
        userId: first.user_id,
        tenantIds: [
          ...new Set(result.rows.flatMap((row) => (row.tenant_id ? [row.tenant_id] : []))),
        ],
      }
    : null;
}

export async function authenticateUser(
  pool: Pool,
  email: string,
  password: string,
): Promise<{ userId: string } | null> {
  const normalized = normalizeEmail(email);
  const result = await pool.query<{ id: string; password_hash: string | null }>(
    `SELECT id, password_hash FROM app.users WHERE lower(email) = $1 AND status = 'active' LIMIT 1`,
    [normalized],
  );
  const user = result.rows[0];
  if (!user?.password_hash || !(await verifyPassword(password, user.password_hash))) return null;
  return { userId: user.id };
}

export async function resolveAuthorizedContext(
  pool: Pool,
  token: string,
  tenantId: string,
  branchId: string,
): Promise<{ userId: string; tenantId: string; branchId: string } | null> {
  tenantIdSchema.parse(tenantId);
  tenantIdSchema.parse(branchId);
  const result = await pool.query<{ userId: string; tenantId: string; branchId: string }>(
    `SELECT s.user_id AS "userId", m.tenant_id AS "tenantId", b.id AS "branchId"
       FROM app.sessions s
       JOIN app.users u ON u.id = s.user_id AND u.status = 'active'
       JOIN app.memberships m
         ON m.user_id = s.user_id AND m.tenant_id = $2 AND m.status = 'active'
       JOIN app.membership_branch_access mba
         ON mba.tenant_id = m.tenant_id AND mba.user_id = m.user_id AND mba.branch_id = $3
       JOIN app.branches b
         ON b.tenant_id = mba.tenant_id AND b.id = mba.branch_id AND b.status = 'active'
      WHERE s.token_hash = $1 AND s.revoked_at IS NULL AND s.expires_at > now()`,
    [hashSessionToken(token), tenantId, branchId],
  );
  const row = result.rows[0];
  return row ?? null;
}

export async function revokeSession(pool: Pool, token: string): Promise<boolean> {
  const result = await pool.query(
    'UPDATE app.sessions SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL',
    [hashSessionToken(token)],
  );
  return result.rowCount === 1;
}

export function normalizeEmail(email: string): string {
  return emailSchema.parse(email);
}
