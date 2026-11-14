import { randomBytes } from 'node:crypto';
import { writeFile, access } from 'node:fs/promises';

try {
  await access('.env.local');
  console.log('Local environment already exists; credentials were not replaced.');
  process.exit(0);
} catch {
  /* first setup */
}
const secret = () => randomBytes(32).toString('hex');
const admin = secret();
const roles = {
  nirvor_migrator: secret(),
  nirvor_runtime: secret(),
  nirvor_test_migrator: secret(),
  nirvor_test_runtime: secret(),
};
const dbUrl = (role, database) => `postgresql://${role}:${roles[role]}@127.0.0.1:55432/${database}`;
const env = `${[
  'NODE_ENV=development',
  'API_HOST=127.0.0.1',
  'API_PORT=4000',
  `POSTGRES_PASSWORD=${admin}`,
  `DATABASE_URL=${dbUrl('nirvor_runtime', 'nirvor')}`,
  `MIGRATION_DATABASE_URL=${dbUrl('nirvor_migrator', 'nirvor')}`,
  `TEST_DATABASE_URL=${dbUrl('nirvor_test_runtime', 'nirvor_test')}`,
  `TEST_MIGRATION_DATABASE_URL=${dbUrl('nirvor_test_migrator', 'nirvor_test')}`,
].join('\n')}\n`;
await writeFile('.env.local', env, { mode: 0o600, flag: 'wx' });
console.log('Created ignored local credentials. No credential values were printed.');
