import { readFile, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
import ts from 'typescript';

const roots = {
  '@nirvor/contracts': 'packages/contracts',
  '@nirvor/database': 'packages/database',
  '@nirvor/ui': 'packages/ui',
  '@nirvor/api': 'apps/api',
  '@nirvor/web': 'apps/web',
};
const allowed = {
  '@nirvor/contracts': [],
  '@nirvor/database': ['@nirvor/contracts'],
  '@nirvor/ui': [],
  '@nirvor/api': ['@nirvor/contracts', '@nirvor/database'],
  '@nirvor/web': ['@nirvor/ui'],
};
const files = new Map();
async function walk(directory, owner) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory() && !['dist', '.next', 'node_modules'].includes(entry.name))
      await walk(path, owner);
    else if (entry.isFile() && /\.(ts|tsx)$/.test(path)) files.set(path, owner);
  }
}
for (const [owner, root] of Object.entries(roots)) await walk(root, owner);
const edges = new Map(),
  problems = [];
for (const [path, owner] of files) {
  const imports = [];
  const source = ts.createSourceFile(
    path,
    await readFile(path, 'utf8'),
    ts.ScriptTarget.Latest,
    true,
  );
  const visit = (node) => {
    if (
      (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) &&
      node.moduleSpecifier &&
      ts.isStringLiteral(node.moduleSpecifier)
    )
      imports.push(node.moduleSpecifier.text);
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      const argument = node.arguments[0];
      if (argument && ts.isStringLiteral(argument)) imports.push(argument.text);
      else
        problems.push(
          `${relative('.', path)}: nonliteral dynamic import requires architecture review`,
        );
    }
    ts.forEachChild(node, visit);
  };
  visit(source);
  const dependencies = [];
  for (const specifier of imports) {
    if (specifier.startsWith('@nirvor/')) {
      const target = specifier.split('/').slice(0, 2).join('/');
      if (!allowed[owner].includes(target)) problems.push(`${owner} must not import ${target}`);
    }
    if (specifier.startsWith('.')) {
      const base = resolve(dirname(path), specifier);
      const candidate = [
        base,
        base.replace(/\.js$/, '.ts'),
        base.replace(/\.js$/, '.tsx'),
        `${base}.ts`,
        `${base}.tsx`,
        resolve(base, 'index.ts'),
      ].find((file) => files.has(file));
      if (candidate) {
        if (files.get(candidate) !== owner)
          problems.push(`${relative('.', path)}: cross-package relative import`);
        dependencies.push(candidate);
      }
    }
  }
  edges.set(path, dependencies);
}
const visited = new Set(),
  active = new Set();
function visit(path) {
  if (active.has(path)) {
    problems.push(`Circular import: ${relative('.', path)}`);
    return;
  }
  if (visited.has(path)) return;
  active.add(path);
  for (const child of edges.get(path) ?? []) visit(child);
  active.delete(path);
  visited.add(path);
}
for (const path of files.keys()) visit(path);
if (problems.length) {
  console.error(problems.join('\n'));
  process.exitCode = 1;
} else console.log(`Boundary checks passed for ${files.size} TypeScript files.`);
