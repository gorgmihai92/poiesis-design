// Project state shared by init, audit-stamp and the publish gate: the opt-in config, the UI hash and the stamp.
// A project opts in by having .poiesis-design/config.json at its root.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { basename, dirname, join, relative, extname } from 'node:path';

export const STATE_DIR = '.poiesis-design';
const UI_EXT = new Set(['.css', '.scss', '.less', '.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.mdx', '.svg']);
// Script files count only when they shape the UI, so a change to an API route, the database or a store does not
// hold a push back. The rule, in one sentence: a .js/.mjs/.cjs/.ts/.mts/.cts file counts when it is a theme's
// config (THEME_CONFIG), or when its text defines a custom element, imports a stylesheet or a UI library, uses a
// custom property (`var(--…)`) or a `po-` class, or imports, by a relative path, a script file that counts.
// It misses a script with none of these that still changes what is shown: a helper a component imports (a date
// format, the items of a menu), or styles set as literals (`el.style.padding = '8px'`). Tests, type declarations
// and other tools' configs never count; build output is skipped by folder (SKIP).
const SCRIPT_EXT = ['.js', '.mjs', '.cjs', '.ts', '.mts', '.cts'];
const THEME_CONFIG = /^(?:tailwind|stitches|panda|uno|tamagui)\.config\.[^.]+$/;
const NOT_UI_SCRIPT = /\.config\.[^.]+$|\.d\.[mc]?ts$|\.(?:test|spec)\.[^.]+$/;
const SHAPES_UI = new RegExp([
  String.raw`\bcustomElements\.define\s*\(`,
  String.raw`(?:\bfrom|\bimport\s*\(?|\brequire\s*\()\s*['"][^'"]+\.(?:css|scss|sass|less)['"]`,
  String.raw`(?:\bfrom|\bimport\s*\(?|\brequire\s*\()\s*['"](?:react|react-dom|preact|vue|svelte|solid-js|lit|styled-components|@emotion\/[\w-]+|@stitches\/[\w-]+|@vanilla-extract\/[\w-]+)(?:\/[^'"]*)?['"]`,
  String.raw`var\(\s*--`,
  String.raw`(?<![\w-])po-[a-z]`,
].join('|'));
const RELATIVE_IMPORT = /(?:\bfrom|\bimport\s*\(?|\brequire\s*\()\s*['"](\.{1,2}\/[^'"]+)['"]/g;
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.vercel', '.turbo', STATE_DIR]);

// The script files among `paths` that shape the UI, by the rule above.
export function uiScripts(paths) {
  const all = new Set(paths);
  const text = new Map(paths.map((p) => [p, readFileSync(p, 'utf8')]));
  const counts = new Set();
  const open = [];
  for (const p of paths) {
    const name = basename(p);
    if (THEME_CONFIG.test(name) || (!NOT_UI_SCRIPT.test(name) && SHAPES_UI.test(text.get(p)))) counts.add(p);
    else if (!NOT_UI_SCRIPT.test(name)) open.push(p);
  }
  // An import names a file with or without its extension, by its folder's index, or (TypeScript) as `.js`.
  const resolveImport = (from, spec) => {
    const base = join(dirname(from), spec);
    const stem = base.replace(/\.[cm]?[jt]s$/, '');
    return [base, ...SCRIPT_EXT.map((e) => stem + e), ...SCRIPT_EXT.map((e) => join(base, 'index' + e))].find((c) => all.has(c));
  };
  for (let grew = true; grew; ) {
    grew = false;
    for (const p of open) {
      if (counts.has(p)) continue;
      for (const m of text.get(p).matchAll(RELATIVE_IMPORT)) {
        if (counts.has(resolveImport(p, m[1]))) { counts.add(p); grew = true; break; }
      }
    }
  }
  return paths.filter((p) => counts.has(p));
}

// Commands that publish. Projects add their own in config.publishCommands (regex strings).
export const DEFAULT_PUBLISH = [
  String.raw`\bgit\s+push\b`,
  String.raw`\bvercel\b[^|;&]*(\bdeploy\b|--prod\b)`,
  String.raw`\b(npm|pnpm|yarn|bun)\s+publish\b`,
  String.raw`\bgh\s+release\s+create\b`,
  String.raw`\bnetlify\s+deploy\b`,
  String.raw`\bwrangler\s+(pages\s+)?deploy\b`,
  String.raw`\bfirebase\s+deploy\b`,
  String.raw`\bfly\s+deploy\b`,
];

export function findRoot(start) {
  let dir = start;
  for (;;) {
    if (existsSync(join(dir, STATE_DIR, 'config.json'))) return dir;
    const up = dirname(dir);
    if (up === dir) return null;
    dir = up;
  }
}

export const readConfig = (root) => JSON.parse(readFileSync(join(root, STATE_DIR, 'config.json'), 'utf8'));

export function writeJson(root, name, data) {
  mkdirSync(join(root, STATE_DIR), { recursive: true });
  writeFileSync(join(root, STATE_DIR, name), JSON.stringify(data, null, 2) + '\n');
}

export function readStamp(root) {
  const p = join(root, STATE_DIR, 'audit.json');
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
}

// Hash of every UI file under the configured paths (script files by the rule above): any UI change after an
// audit changes it.
export function hashUi(root, uiPaths = ['src']) {
  const files = [];
  const scripts = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) if (!SKIP.has(name) && !name.startsWith('.')) walk(join(p, name));
    } else if (UI_EXT.has(extname(p))) files.push(p);
    else if (SCRIPT_EXT.includes(extname(p))) scripts.push(p);
  };
  for (const u of uiPaths) walk(join(root, u));
  files.push(...uiScripts(scripts));
  files.sort();
  const h = createHash('sha256');
  for (const f of files) h.update(relative(root, f) + '\0').update(readFileSync(f)).update('\0');
  return { hash: h.digest('hex').slice(0, 16), files: files.length };
}

export function isPublish(command, config) {
  const patterns = [...DEFAULT_PUBLISH, ...(config.publishCommands ?? [])];
  return patterns.some((p) => new RegExp(p).test(command));
}
