#!/usr/bin/env node
// Copies components into a project: the primitives and the icon set (every component is built on them), the
// components and compositions asked for (their .css, and their .js when they have behavior), the components a
// composition is built from, and an entry stylesheet and script that load exactly those. The copies are the project's own: change them freely; nothing is linked back.
//
//   node add.mjs button tabs alert --to src/poiesis   some components
//   node add.mjs all --to src/poiesis                 every component
//   node add.mjs --list                               what there is
//
// Existing files are kept unless --force. Needs no package: plain CSS and, where behavior needs it, a script module.
// The project's CSS imports poiesis-ui's tokens (poiesis.css and a theme) before the entry stylesheet.

import { copyFileSync, existsSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const LIB = resolve(dirname(fileURLToPath(import.meta.url)), '../library');
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const names = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--to');
const PRIMITIVES = ['layout', 'text', 'surface', 'pressable', 'field', 'focus'];
// The icon set is shared: alerts, the collapsible, the spinner and the status dot draw from it.
const list = (dir) => readdirSync(join(LIB, dir)).filter((f) => f.endsWith('.css')).map((f) => f.replace(/\.css$/, ''));
const components = list('components').filter((n) => n !== 'icon');
const compositions = list('compositions');
const available = [...components, ...compositions];
// The components each composition is built from, copied with it.
const PARTS = {
  combobox: ['input', 'line', 'fold', 'options'],
  'date-pick': ['button', 'options', 'due', 'fold'],
  'line-form': ['line', 'button', 'fold', 'date-pick'],
  sections: [],
};

if (argv.includes('--list') || !names.length) {
  console.log(`Components: ${['icon', ...components].join(', ')}\nCompositions: ${compositions.join(', ')}\nUsage: node add.mjs <names…|all> --to <dir> [--force]`);
  process.exit(names.length || argv.includes('--list') ? 0 : 2);
}
const to = opt('to');
if (!to) {
  console.error('Missing --to <dir> (where the library goes, e.g. src/poiesis).');
  process.exit(2);
}
const unknown = names.filter((n) => n !== 'all' && n !== 'icon' && !available.includes(n));
if (unknown.length) {
  console.error(`Unknown: ${unknown.join(', ')}. Available: icon, ${available.join(', ')}`);
  process.exit(2);
}

const all = names.includes('all');
const wanted = new Set(available.filter((n) => all || names.includes(n)));
// A composition's parts, and theirs (a line form brings the date pick, and the date pick its options).
for (const n of wanted) for (const part of PARTS[n] ?? []) wanted.add(part);
const dirOf = (n) => (compositions.includes(n) ? 'compositions' : 'components');
const chosen = available.filter((n) => wanted.has(n));
const scripts = chosen.filter((n) => existsSync(join(LIB, dirOf(n), `${n}.js`)));
const files = [
  ...PRIMITIVES.map((p) => `primitives/${p}.css`),
  'components/icon.css',
  ...chosen.map((n) => `${dirOf(n)}/${n}.css`),
  ...scripts.map((n) => `${dirOf(n)}/${n}.js`),
];

const dest = resolve(to);
const force = argv.includes('--force');
const write = (file, make) => {
  const target = join(dest, file);
  if (existsSync(target) && !force) {
    console.log(`  kept   ${relative(process.cwd(), target)} (yours; --force replaces it)`);
    return;
  }
  mkdirSync(dirname(target), { recursive: true });
  make(target);
  console.log(`  wrote  ${relative(process.cwd(), target)}`);
};
for (const f of files) write(f, (target) => copyFileSync(join(LIB, f), target));

// The entry files load exactly what was copied, primitives first, in their layers.
write('poiesis-components.css', (target) => writeFileSync(target, [
  '/* Poiesis components: the primitives, the icon set and the components this project uses. Import after',
  '   poiesis-ui\'s tokens (poiesis.css, then a theme). */',
  '',
  '@layer poiesis.primitives, poiesis.components, poiesis.compositions;',
  '',
  ...files.filter((f) => f.endsWith('.css')).map((f) => `@import "./${f}";`),
  '',
].join('\n')));
if (scripts.length)
  write('poiesis-components.js', (target) => writeFileSync(target, [
    '// Poiesis components: the behavior of the components that need it. Load once, as a module.',
    ...scripts.map((n) => `import "./${dirOf(n)}/${n}.js"`),
    '',
  ].join('\n')));

console.log('\nNo packages to install. Import poiesis-ui\'s tokens, then poiesis-components.css'
  + (scripts.length ? ', and load poiesis-components.js as a module.' : '.'));
console.log('Then check with poiesis-ui:ui-auditor and poiesis-ux:ux-tester.');
