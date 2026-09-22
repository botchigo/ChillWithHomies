import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, extname, join, normalize, relative, resolve } from 'node:path';

const projectRoot = resolve(import.meta.dirname, '..');
const sourceRoots = ['app', 'components', 'constants', 'context', 'data', 'src'];
const sourceExtensions = ['.ts', '.tsx', '.js', '.jsx'];

function collectFiles(path) {
  if (!existsSync(path)) return [];
  return readdirSync(path).flatMap((name) => {
    const child = join(path, name);
    return statSync(child).isDirectory()
      ? collectFiles(child)
      : sourceExtensions.includes(extname(child)) ? [normalize(child)] : [];
  });
}

const files = sourceRoots.flatMap((folder) => collectFiles(join(projectRoot, folder)));
const fileSet = new Set(files);

function resolveImport(fromFile, specifier) {
  if (!specifier.startsWith('.') && !specifier.startsWith('@/')) return null;
  const base = specifier.startsWith('@/')
    ? join(projectRoot, specifier.slice(2))
    : resolve(dirname(fromFile), specifier);
  const candidates = [
    ...sourceExtensions.map((extension) => `${base}${extension}`),
    ...sourceExtensions.map((extension) => join(base, `index${extension}`)),
  ].map(normalize);
  return candidates.find((candidate) => fileSet.has(candidate)) ?? null;
}

function importsFor(file) {
  const source = readFileSync(file, 'utf8');
  const imports = new Set();
  const pattern = /(?:import|export)\s+(?:type\s+)?(?:[\w*{},\s]+?\s+from\s+)?['"]([^'"]+)['"]/g;
  for (const match of source.matchAll(pattern)) {
    const target = resolveImport(file, match[1]);
    if (target) imports.add(target);
  }
  return [...imports];
}

const graph = new Map(files.map((file) => [file, importsFor(file)]));
const visiting = new Set();
const visited = new Set();
const stack = [];
const cycles = [];

function visit(file) {
  if (visiting.has(file)) {
    const start = stack.indexOf(file);
    cycles.push([...stack.slice(start), file]);
    return;
  }
  if (visited.has(file)) return;
  visiting.add(file);
  stack.push(file);
  for (const dependency of graph.get(file) ?? []) visit(dependency);
  stack.pop();
  visiting.delete(file);
  visited.add(file);
}

for (const file of files) visit(file);

if (cycles.length) {
  console.error('Circular dependencies found:');
  for (const cycle of cycles) {
    console.error(cycle.map((file) => relative(projectRoot, file)).join(' -> '));
  }
  process.exitCode = 1;
} else {
  console.log(`No circular dependencies found across ${files.length} source files.`);
}
