import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { readFile } from 'node:fs/promises';

const gitArguments = ['-c', `safe.directory=${process.cwd()}`];
const paths = execFileSync(
  'git',
  [...gitArguments, 'ls-files', '--cached', '--others', '--exclude-standard', '-z'],
  { encoding: 'utf8' },
)
  .split('\0')
  .filter(Boolean);
const tracked = execFileSync('git', [...gitArguments, 'ls-files', '-z'], {
  encoding: 'utf8',
}).split('\0');
const findings = [];
for (const path of tracked) {
  if (/(^|\/)\.env(?:\.|$)/.test(path) && !path.endsWith('.env.example'))
    findings.push(`${path}: environment file must not be tracked`);
}
for (const path of new Set(paths)) {
  // During a content-preserving rename, the Git index may still list the old path.
  // Scan only files that exist in the current worktree; staged/committed state is checked by Git.
  if (!existsSync(path)) continue;
  if (!/\.(?:md|ts|tsx|mjs|json|sql|yaml|yml|txt)$/.test(path)) continue;
  const content = await readFile(path, 'utf8');
  const patterns = [
    /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /AKIA[0-9A-Z]{16}/,
    /gh[pousr]_[A-Za-z0-9]{30,}/,
    /postgres(?:ql)?:\/\/[a-zA-Z0-9_]+:[a-zA-Z0-9_-]{8,}@/,
  ];
  if (patterns.some((pattern) => pattern.test(content)))
    findings.push(`${path}: possible embedded credential (value redacted)`);
}
if (findings.length) {
  console.error(findings.join('\n'));
  process.exitCode = 1;
} else
  console.log(
    `Secret-pattern and tracked-environment checks passed (${new Set(paths).size} source files). This is not a comprehensive secret audit.`,
  );
