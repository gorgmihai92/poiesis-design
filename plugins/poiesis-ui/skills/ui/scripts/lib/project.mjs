// Project state shared by init, audit-stamp and the publish gate: the opt-in config, the UI hash and the stamp.
// A project opts in by having .poiesis-design/config.json at its root.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join, relative, extname } from 'node:path';

export const STATE_DIR = '.poiesis-design';
const UI_EXT = new Set(['.css', '.scss', '.less', '.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro', '.mdx', '.svg']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.vercel', '.turbo', STATE_DIR]);

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

// Hash of every UI file under the configured paths: any UI change after an audit changes it.
export function hashUi(root, uiPaths = ['src']) {
  const files = [];
  const walk = (p) => {
    if (!existsSync(p)) return;
    const st = statSync(p);
    if (st.isDirectory()) {
      for (const name of readdirSync(p)) if (!SKIP.has(name) && !name.startsWith('.')) walk(join(p, name));
    } else if (UI_EXT.has(extname(p))) files.push(p);
  };
  for (const u of uiPaths) walk(join(root, u));
  files.sort();
  const h = createHash('sha256');
  for (const f of files) h.update(relative(root, f) + '\0').update(readFileSync(f)).update('\0');
  return { hash: h.digest('hex').slice(0, 16), files: files.length };
}

export function isPublish(command, config) {
  const patterns = [...DEFAULT_PUBLISH, ...(config.publishCommands ?? [])];
  return patterns.some((p) => new RegExp(p).test(command));
}
