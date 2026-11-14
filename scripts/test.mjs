import { readdir } from 'node:fs/promises';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const kind = process.argv[2];
if (!['unit', 'integration', 'contract'].includes(kind))
  throw new Error('Choose unit, integration or contract');
const matches = [];
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await walk(path);
    else if (entry.name.endsWith(`.${kind}.test.js`)) matches.push(path);
  }
}
for (const workspace of ['packages/contracts', 'packages/database', 'apps/api'])
  await walk(`${workspace}/dist`);
if (!matches.length) throw new Error('No compiled tests found. Run npm run build:server first.');
const result = spawnSync(process.execPath, ['--test', '--test-concurrency=1', ...matches], {
  stdio: 'inherit',
  env: process.env,
});
process.exitCode = result.status ?? 1;
