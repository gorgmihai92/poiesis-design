#!/usr/bin/env node
// Sets up Poiesis UI in a project, or refreshes the managed cells.
//
//   node init.mjs --preset tool|reading|expressive [--style quiet|soft|crisp|bold] [--palette poiesis] --styles src/styles --ui src [--root .]
//   node init.mjs --update               refresh poiesis/cells.css; atoms are never touched
//   node init.mjs --audit-only --ui src  only the rules, the auditor and the publish gate
//
// Writes <styles>/atoms.css (the project's, from the preset, style and palette), <styles>/poiesis/cells.css (managed),
// <styles>/index.css (if missing) and .poiesis-design/config.json.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findRoot, readConfig, writeJson } from './lib/project.mjs';

const UI = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const VERSION = JSON.parse(readFileSync(join(UI, '../../.claude-plugin/plugin.json'), 'utf8')).version;
const PRESETS = ['tool', 'reading', 'expressive'];
const STYLES = ['quiet', 'soft', 'crisp', 'bold'];
const PALETTES = ['poiesis'];

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
  preset: opt('preset') ?? existing.preset ?? null,
  style: opt('style') ?? existing.style ?? 'quiet',
  palette: opt('palette') ?? existing.palette ?? 'poiesis',
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

function atomsFromPreset(preset, style, palette) {
  let atoms = readFileSync(join(UI, 'tokens/atoms.css'), 'utf8');
  // The preset sets type and density, the style shape, the palette colors. Each only names the atoms it changes.
  for (const file of [`tokens/presets/${preset}.css`, `tokens/styles/${style}.css`, `tokens/palettes/${palette}.css`]) {
    const css = readFileSync(join(UI, file), 'utf8');
    for (const [, name, value] of css.matchAll(/(--atom-[\w-]+)\s*:\s*([^;]+);/g)) {
      atoms = atoms.replace(new RegExp(`^(\\s*${name}\\s*:\\s*)[^;]+;`, 'm'), `$1${value.trim()};`);
    }
  }
  return atoms.replace(
    'Poiesis UI · atoms:',
    `Poiesis UI · atoms (preset "${preset}", style "${style}", palette "${palette}", poiesis-ui ${VERSION}):`,
  );
}

if (!flag('audit-only')) {
  if (!config.styles) {
    console.error('Missing --styles <dir> (where the CSS goes).');
    process.exit(2);
  }
  if (!flag('update') && !PRESETS.includes(config.preset)) {
    console.error(`Missing or unknown --preset (${PRESETS.join(', ')}).`);
    process.exit(2);
  }
  if (!PALETTES.includes(config.palette)) {
    console.error(`Unknown --palette (${PALETTES.join(', ')}).`);
    process.exit(2);
  }
  if (!STYLES.includes(config.style)) {
    console.error(`Unknown --style (${STYLES.join(', ')}).`);
    process.exit(2);
  }
  const styles = join(root, config.styles);
  console.log(flag('update') ? `Updating poiesis-ui files to ${VERSION}` : `Setting up poiesis-ui ${VERSION}`);
  copyManaged(join(UI, 'tokens/cells.css'), join(styles, 'poiesis/cells.css'), 'cells');

  const atomsPath = join(styles, 'atoms.css');
  if (!existsSync(atomsPath)) {
    writeFileSync(atomsPath, atomsFromPreset(config.preset ?? 'tool', config.style, config.palette));
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
