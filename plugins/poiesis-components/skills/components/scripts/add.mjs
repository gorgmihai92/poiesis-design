#!/usr/bin/env node
// Copies components into a project, with the files they import (helpers, base styles, other components).
// The copies are the project's own: change them freely; nothing is linked back.
//
//   node add.mjs button tabs field --to src/components/poiesis   some components
//   node add.mjs all --to src/components/poiesis                 every component
//   node add.mjs --list                                          what there is
//
// Existing files are kept unless --force. Needs the poiesis-ui cells (0.4+, with the shape cells) in the
// project's CSS, and React 18+; components that use Radix need the "radix-ui" package.

import { copyFileSync, existsSync, mkdirSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), '../library');
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const names = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--to');
const available = readdirSync(LIB).filter((f) => f.endsWith('.tsx')).map((f) => f.replace(/\.tsx$/, ''));

if (argv.includes('--list') || !names.length) {
  console.log(`Components: ${available.join(', ')}\nUsage: node add.mjs <names…|all> --to <dir> [--force]`);
  process.exit(names.length || argv.includes('--list') ? 0 : 2);
}
const to = opt('to');
if (!to) {
  console.error('Missing --to <dir> (where the components go).');
  process.exit(2);
}
const unknown = names.filter((n) => n !== 'all' && !available.includes(n));
if (unknown.length) {
  console.error(`Unknown: ${unknown.join(', ')}. Available: ${available.join(', ')}`);
  process.exit(2);
}

// Follow the imports: "./x.js" means x.tsx or x.ts; "./x.css" is copied as is.
const files = new Set();
const packages = new Set(['react']);
const visit = (file) => {
  if (files.has(file)) return;
  files.add(file);
  const src = readFileSync(join(LIB, file), 'utf8');
  for (const [, spec] of src.matchAll(/(?:from\s+|import\s+)["']([^"']+)["']/g)) {
    if (spec.startsWith('./')) {
      const base = spec.slice(2);
      const local = base.endsWith('.css') ? base : [base.replace(/\.js$/, '.tsx'), base.replace(/\.js$/, '.ts')].find((f) => existsSync(join(LIB, f)));
      if (local) visit(local);
    } else packages.add(spec.split('/')[0]);
  }
};
for (const n of names.includes('all') ? available : names) visit(`${n}.tsx`);

const dest = resolve(to);
mkdirSync(dest, { recursive: true });
const force = argv.includes('--force');
for (const f of [...files].sort()) {
  const target = join(dest, f);
  if (existsSync(target) && !force) {
    console.log(`  kept   ${relative(process.cwd(), target)} (yours; --force replaces it)`);
    continue;
  }
  copyFileSync(join(LIB, f), target);
  console.log(`  wrote  ${relative(process.cwd(), target)}`);
}

// The cells must be there, with the shape cells added in poiesis-ui 0.4.
const cssHasCells = (dir, depth = 0) => {
  if (depth > 6 || !existsSync(dir)) return false;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory() ? cssHasCells(p, depth + 1) : e.name.endsWith('.css') && /--selected-bg\s*:/.test(readFileSync(p, 'utf8'))) return true;
  }
  return false;
};
console.log(`\nPackages: ${[...packages].join(', ')} (install the ones the project lacks).`);
if (!cssHasCells(process.cwd()))
  console.log('No poiesis-ui cells with shape found here: run poiesis-ui init.mjs (0.4+) with --preset and --style first.');
console.log('Wrap the app once in <TipProvider> (tip.tsx). Then check with poiesis-ui:ui-auditor and poiesis-ux:ux-tester.');
