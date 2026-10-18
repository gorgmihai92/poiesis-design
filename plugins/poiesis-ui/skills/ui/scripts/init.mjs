#!/usr/bin/env node
// Sets up Poiesis UI in a project, or refreshes the managed cells.
//
//   node init.mjs --styles src/styles --ui src [--root .]
//   node init.mjs --update               refresh poiesis/cells.css; atoms are never touched
//   node init.mjs --audit-only --ui src  only the rules, the auditor and the publish gate
//
// Writes <styles>/atoms.css (the project's, from the poiesis theme), <styles>/poiesis/cells.css (managed),
// <styles>/index.css (if missing) and .poiesis-design/config.json.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRoot, readConfig, writeJson } from './lib/project.mjs';

const UI = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = JSON.parse(readFileSync(join(UI, '../../.claude-plugin/plugin.json'), 'utf8')).version;

const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};
const all = (name) => argv.flatMap((a, i) => (a === `--${name}` ? [argv[i + 1]] : []));
const flag = (name) => argv.includes(`--${name}`);

const root = resolve(opt('root') ?? (flag('update') ? findRoot(process.cwd()) ?? '.' : '.'));
const existing = existsSync(join(root, '.poiesis-design/config.json')) ? readConfig(root) : {};
const config = {
  version: VERSION,
  styles: opt('styles') ?? existing.styles ?? null,
  uiPaths: all('ui').length ? all('ui') : existing.uiPaths ?? ['src'],
  publishCommands: existing.publishCommands ?? [],
};

const header = (name) =>
  `/* Managed by poiesis-ui ${VERSION} (${name}). Do not edit: change atoms.css, or add project cells in another\n   file. Refresh with init.mjs --update. */\n`;

function copyManaged(src, dest, name) {
  mkdirSync(dirname(dest), { recursive: true });
  const body = readFileSync(src, 'utf8');
  writeFileSync(dest, header(name) + body);
  console.log(`  wrote ${relative(root, dest)}`);
}

function atomsFromTheme() {
  let atoms = readFileSync(join(UI, 'tokens/atoms.css'), 'utf8');
  // The theme names only the atoms it changes.
  const css = readFileSync(join(UI, 'tokens/themes/poiesis.css'), 'utf8');
  for (const [, name, value] of css.matchAll(/(--atom-[\w-]+)\s*:\s*([^;]+);/g)) {
    atoms = atoms.replace(new RegExp(`^(\\s*${name}\\s*:\\s*)[^;]+;`, 'm'), `$1${value.trim()};`);
  }
  return atoms.replace('Poiesis UI · atoms:', `Poiesis UI · atoms (theme "poiesis", poiesis-ui ${VERSION}):`);
}

if (!flag('audit-only')) {
  if (!config.styles) {
    console.error('Missing --styles <dir> (where the CSS goes).');
    process.exit(2);
  }
  const styles = join(root, config.styles);
  console.log(flag('update') ? `Updating poiesis-ui files to ${VERSION}` : `Setting up poiesis-ui ${VERSION}`);
  copyManaged(join(UI, 'tokens/cells.css'), join(styles, 'poiesis/cells.css'), 'cells');

  const atomsPath = join(styles, 'atoms.css');
  if (!existsSync(atomsPath)) {
    writeFileSync(atomsPath, atomsFromTheme());
    console.log(`  wrote ${relative(root, atomsPath)} (yours to tune)`);
  } else console.log(`  kept ${relative(root, atomsPath)} (project-owned)`);

  const indexPath = join(styles, 'index.css');
  if (!existsSync(indexPath)) {
    writeFileSync(
      indexPath,
      ['atoms.css', 'poiesis/cells.css']
        .map((f) => `@import "./${f}";`)
        .join('\n') + '\n',
    );
    console.log(`  wrote ${relative(root, indexPath)}`);
  }
}

writeJson(root, 'config.json', config);
console.log(`  wrote .poiesis-design/config.json (UI paths: ${config.uiPaths.join(', ')})`);
console.log('\nThe publish gate is on for this project: run the ui-auditor before pushing or deploying.');
if (!flag('audit-only') && !flag('update'))
  console.log('Fonts: load the families named in atoms.css (with the subsets your language needs).');
