import { readConfiguration } from '@nirvor/contracts';
import { createPool } from '@nirvor/database';
import { createApp } from './app.js';

try {
  const config = readConfiguration(process.env);
  const pool = createPool({
    connectionString: config.DATABASE_URL,
    max: config.DB_POOL_MAX,
    timeoutMs: config.DB_TIMEOUT_MS,
  });
  const app = await createApp(config, async () => {
    await pool.query('SELECT 1');
  });
  await app.listen(config.API_PORT, config.API_HOST);
  console.log(
    JSON.stringify({ event: 'api.started', host: config.API_HOST, port: config.API_PORT }),
  );
  let stopping = false;
  const shutdown = async () => {
    if (stopping) return;
    stopping = true;
    const deadline = setTimeout(() => {
      process.exit(1);
    }, 10000);
    deadline.unref();
    try {
      await app.close();
      await pool.end();
      clearTimeout(deadline);
    } catch {
      console.error(JSON.stringify({ event: 'api.shutdown_failed' }));
      process.exitCode = 1;
    }
  };
  process.once('SIGTERM', () => {
    void shutdown();
  });
  process.once('SIGINT', () => {
    void shutdown();
  });
} catch {
  console.error(
    JSON.stringify({
      event: 'api.start_failed',
      message:
        'Check required environment fields and port availability. Credential values are never printed.',
    }),
  );
  process.exitCode = 1;
}
