#!/usr/bin/env node
// Finds the Poiesis theme's token files (poiesis-ui) and the component library (poiesis-components) on this
// computer, and says which copy it found. poiesis-studio keeps no copy of its own: the theme is the material, read
// where it lives. Files are only read. Nothing is installed, switched on or written, so the design plugins can
// stay off in the project.
//
//   node material.mjs                     what was found
//   node material.mjs --json              the same, as JSON
//   node material.mjs --design <folder>   look in this poiesis-design checkout first
//
// Where it looks, in this order:
//   1. --design, or the environment variable POIESIS_DESIGN: a checkout of poiesis-design
//   2. the repository this plugin sits in (a checkout, or the marketplace's copy)
//   3. the marketplaces' copies under ~/.claude/plugins/marketplaces
//   4. the plugin cache under ~/.claude/plugins/cache, highest version
// A copy counts only when it has every file that is asked for. When none does, the error says what is missing
// and what to do about it; nothing is made up in its place.

import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const STUDIO = resolve(HERE, '..');
const CLAUDE = process.env.CLAUDE_CONFIG_DIR || join(homedir(), '.claude');

export const TOKEN_FILES = ['atoms.css', 'cells.css', 'themes/poiesis.css'];
const PIECES = {
  tokens: { plugin: 'poiesis-ui', inside: 'skills/ui/tokens', always: TOKEN_FILES },
  library: { plugin: 'poiesis-components', inside: 'skills/components/library', always: ['poiesis-components.css'] },
};

export class MissingMaterial extends Error {}

const list = (dir) => {
  try { return readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name); }
  catch { return []; }
};
const versionOf = (pluginRoot) => {
  try { return JSON.parse(readFileSync(join(pluginRoot, '.claude-plugin/plugin.json'), 'utf8')).version ?? 'unknown'; }
  catch { return 'unknown'; }
};
const newest = (a, b) => {
  const pa = a.split('.').map(Number), pb = b.split('.').map(Number);
  for (let i = 0; i < 3; i++) if ((pb[i] || 0) !== (pa[i] || 0)) return (pb[i] || 0) - (pa[i] || 0);
  return 0;
};

// Every place a plugin's folder may be, in the order above, each with the words that say where it is.
function places(plugin, design) {
  const found = [];
  if (design) found.push({ root: join(resolve(design), 'plugins', plugin), from: 'the checkout given' });
  found.push({ root: resolve(STUDIO, '..', plugin), from: 'the repository this plugin is in' });
  const markets = join(CLAUDE, 'plugins/marketplaces');
  for (const name of list(markets).sort((a, b) => (b === 'poiesis-design') - (a === 'poiesis-design'))) {
    found.push({ root: join(markets, name, 'plugins', plugin), from: `the marketplace copy "${name}"` });
  }
  const cache = join(CLAUDE, 'plugins/cache');
  for (const market of list(cache)) {
    for (const version of list(join(cache, market, plugin)).sort(newest)) {
      found.push({ root: join(cache, market, plugin, version), from: `the plugin cache (${market})` });
    }
  }
  return found;
}

function find(piece, need, design) {
  const { plugin, inside, always } = PIECES[piece];
  const wanted = [...always, ...need];
  const tried = [];
  for (const place of places(plugin, design)) {
    const dir = join(place.root, inside);
    if (!existsSync(dir)) continue;
    const missing = wanted.filter((f) => !existsSync(join(dir, f)));
    const version = versionOf(place.root);
    if (!missing.length) return { dir, version, from: place.from, plugin, tried };
    tried.push({ dir, version, from: place.from, missing });
  }
  return { dir: null, plugin, tried };
}

// Finds the theme's tokens and, when `library` lists files, a library that has them. Throws MissingMaterial.
export function findMaterial({ design = process.env.POIESIS_DESIGN, library = null } = {}) {
  const tokens = find('tokens', [], design);
  const lib = library ? find('library', library, design) : null;
  const problems = [];
  for (const [what, got] of [['The theme\'s token files', tokens], ['The component library', lib]]) {
    if (!got || got.dir) continue;
    const seen = got.tried.length
      ? got.tried.map((t) => `  ${t.dir} (${got.plugin} ${t.version}) lacks ${t.missing.join(', ')}`).join('\n')
      : `  no copy of ${got.plugin} was found`;
    problems.push(`${what} could not be used:\n${seen}`);
  }
  if (problems.length) {
    throw new MissingMaterial(
      `${problems.join('\n')}\n` +
      'Nothing was written. To go on, one of:\n' +
      '  - bring the marketplace copy up to date: claude plugin marketplace update poiesis-design\n' +
      '  - point at a checkout of poiesis-design: --design <folder>, or POIESIS_DESIGN=<folder>\n' +
      'Updating changes the computer\'s setup, so ask the owner before running it.',
    );
  }
  return { tokens, library: lib };
}

// The theme as one stylesheet: the atoms, the cells derived from them, then the atoms the poiesis theme sets.
export function themeCss(tokens, { today }) {
  const head =
    `/* The Poiesis theme, joined into one file for this exploration: ${TOKEN_FILES.join(', ')}.\n` +
    `   Read from poiesis-ui ${tokens.version} (${tokens.from}) on ${today}.\n` +
    '   It is the material, not a rule: a sketch may use any of it, change any of it, or leave it.\n' +
    '   To change the theme itself, change it where it lives; this copy is not read back. */\n\n';
  return head + TOKEN_FILES.map((f) => `/* ---- ${f} ---- */\n${readFileSync(join(tokens.dir, f), 'utf8').trim()}\n`).join('\n');
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const at = argv.indexOf('--design');
  try {
    const found = findMaterial({ design: at >= 0 ? argv[at + 1] : process.env.POIESIS_DESIGN, library: [] });
    if (argv.includes('--json')) console.log(JSON.stringify(found, null, 2));
    else {
      console.log(`Theme:   ${found.tokens.dir}\n         poiesis-ui ${found.tokens.version}, from ${found.tokens.from}`);
      console.log(`Library: ${found.library.dir}\n         poiesis-components ${found.library.version}, from ${found.library.from}`);
    }
  } catch (e) {
    if (!(e instanceof MissingMaterial)) throw e;
    console.error(e.message);
    process.exit(1);
  }
}
