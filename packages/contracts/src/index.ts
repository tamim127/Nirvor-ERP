import { z } from 'zod';

export const requestIdSchema = z.string().uuid();
export const tenantIdSchema = z.string().uuid();
export const errorResponseSchema = z
  .object({
    error: z.object({ code: z.string(), message: z.string(), requestId: requestIdSchema }),
  })
  .strict();
export type ErrorResponse = z.infer<typeof errorResponseSchema>;
export const healthResponseSchema = z.object({ status: z.enum(['ok', 'ready']) }).strict();
export type HealthResponse = z.infer<typeof healthResponseSchema>;

// Shape validation is not authorization. Only a trusted application boundary may
// construct this context after authenticating membership and action permissions.
export interface AuthorizedTenantContext {
  readonly tenantId: string;
}

export const configurationSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  API_HOST: z.enum(['127.0.0.1', '0.0.0.0']).default('127.0.0.1'),
  API_PORT: z.coerce.number().int().min(1024).max(65535).default(4000),
  DATABASE_URL: z
    .string()
    .url()
    .refine((value) => {
      const url = new URL(value);
      return (
        ['postgres:', 'postgresql:'].includes(url.protocol) && !!url.username && !!url.password
      );
    }),
  DB_POOL_MAX: z.coerce.number().int().min(1).max(20).default(5),
  DB_TIMEOUT_MS: z.coerce.number().int().min(100).max(10000).default(2000),
  API_REQUEST_TIMEOUT_MS: z.coerce.number().int().min(100).max(30000).default(5000),
  API_MAX_INFLIGHT: z.coerce.number().int().min(1).max(200).default(32),
  API_RATE_LIMIT: z.coerce.number().int().min(1).max(10000).default(120),
  API_RATE_WINDOW_MS: z.coerce.number().int().min(100).max(3600000).default(60000),
});
export type Configuration = z.infer<typeof configurationSchema>;

export function readConfiguration(env: Record<string, string | undefined>): Configuration {
  const parsed = configurationSchema.safeParse(env);
  if (!parsed.success) {
    const fields = [...new Set(parsed.error.issues.map((issue) => issue.path.join('.')))];
    // Never interpolate Zod input or connection strings into diagnostics.
    throw new Error(`Invalid configuration fields: ${fields.join(', ')}`);
  }
  return parsed.data;
}
