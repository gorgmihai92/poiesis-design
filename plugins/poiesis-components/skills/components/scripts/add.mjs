#!/usr/bin/env node
// Copies components into a project, with the files they import (utils.ts and the other components they use).
// The copies are the project's own (the shadcn model): change them freely; nothing is linked back.
//
//   node add.mjs button tabs field --to src/components/ui   some components
//   node add.mjs all --to src/components/ui                 every component
//   node add.mjs --list                                     what there is
//
// Existing files are kept unless --force. Needs Tailwind v4 with poiesis-ui's poiesis.css and a theme imported in
// the project's CSS, and React 18+.

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
  console.error('Missing --to <dir> (where the components go, e.g. src/components/ui).');
  process.exit(2);
}
const unknown = names.filter((n) => n !== 'all' && !available.includes(n));
if (unknown.length) {
  console.error(`Unknown: ${unknown.join(', ')}. Available: ${available.join(', ')}`);
  process.exit(2);
}

// Follow the imports: "./x" is x.tsx or x.ts in the library; anything else is a package.
const files = new Set();
const packages = new Set(['react']);
const visit = (file) => {
  if (files.has(file)) return;
  files.add(file);
  const src = readFileSync(join(LIB, file), 'utf8');
  for (const [, spec] of src.matchAll(/(?:from\s+|import\s+)["']([^"']+)["']/g)) {
    if (spec.startsWith('./')) {
      const base = spec.slice(2).replace(/\.js$/, '');
      const local = [`${base}.tsx`, `${base}.ts`].find((f) => existsSync(join(LIB, f)));
      if (local) visit(local);
    } else packages.add(spec.startsWith('@') ? spec.split('/').slice(0, 2).join('/') : spec.split('/')[0]);
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

// The theme must be there: poiesis.css maps the components' slots onto the cells.
const hasTheme = (dir, depth = 0) => {
  if (depth > 6 || !existsSync(dir)) return false;
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', 'dist', 'build'].includes(e.name)) continue;
    const p = join(dir, e.name);
    if (e.isDirectory() ? hasTheme(p, depth + 1) : e.name.endsWith('.css') && /@import\s+["'][^"']*poiesis\.css["']/.test(readFileSync(p, 'utf8'))) return true;
  }
  return false;
};
console.log(`\nPackages: ${[...packages].sort().join(', ')}, tw-animate-css (install the ones the project lacks).`);
if (!hasTheme(process.cwd()))
  console.log('No CSS here imports poiesis.css: add poiesis-ui\'s poiesis.css and a theme to the main stylesheet first.');
console.log('Wrap the app once in <TooltipProvider> (tooltip.tsx). Then check with poiesis-ui:ui-auditor and poiesis-ux:ux-tester.');
