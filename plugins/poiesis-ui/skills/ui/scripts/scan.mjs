#!/usr/bin/env node
// Lists values that bypass the cells, by rule id (see ../rules.md). Each hit is a lead to check in context.
// Usage: node scan.mjs <dir or file> [...] [--json]

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';

const EXT = new Set(['.css', '.scss', '.less', '.html', '.jsx', '.tsx', '.vue', '.svelte', '.astro']);
const SKIP = new Set(['node_modules', '.git', 'dist', 'build', '.next', 'out', 'coverage', '.vercel', 'vendor', '.turbo']);
const TOKEN_FILE = /(^|\/)(atoms|cells)(\.[\w-]+)?\.css$|\/themes\//;
const num = String.raw`-?\d*\.?\d+`;
const hairline = /^(?:0|0?\.5px|-?1px|-?2px)$/;

const checks = [
  {
    id: 'T1', what: 'literal font size',
    test: (l) =>
      l.match(new RegExp(String.raw`font-size\s*:\s*(?!var\()[^;]*?${num}(px|rem|em|pt|vw)`))?.[0] ??
      l.match(/\btext-\[\d[^\]]*\]/)?.[0] ?? l.match(/fontSize\s*:\s*['"]?\d/)?.[0] ?? null,
  },
  { id: 'T3', what: 'line height in px', test: (l) => l.match(new RegExp(String.raw`line-height\s*:\s*${num}px`))?.[0] ?? l.match(/\bleading-\[\d+px\]/)?.[0] ?? null },
  {
    id: 'S1', what: 'literal spacing',
    test: (l) => {
      const m = l.match(/\b(margin|padding|gap|row-gap|column-gap)(-[a-z-]+)?\s*:\s*([^;{}"]+)/);
      if (m) {
        const vals = m[3].replace(/var\([^)]*\)|calc\([^)]*\)|clamp\([^)]*\)/g, '').split(/\s+/).filter(Boolean);
        if (vals.some((v) => new RegExp(String.raw`^${num}(px|rem|em)$`).test(v) && !hairline.test(v))) return m[0].trim();
      }
      return (
        l.match(/\b(?:p|px|py|pt|pr|pb|pl|ps|pe|m|mx|my|mt|mr|mb|ml|ms|me|gap|gap-x|gap-y|space-x|space-y)-\[-?\d[^\]]*\]/)?.[0] ??
        l.match(/\b(?:padding|margin|gap)\w*\s*:\s*['"]?[1-9]\d*(px)?['"]?\s*[,}]/)?.[0] ?? null
      );
    },
  },
  {
    id: 'C1', what: 'literal color',
    test: (l) =>
      l.match(/(?<![\w&-])#[0-9a-fA-F]{3,8}\b(?![\w-])/)?.[0] ??
      l.match(/\b(?:rgba?|hsla?|oklch|oklab|lab|lch)\(\s*\d/)?.[0] ??
      l.match(/\b(?:bg|text|border|fill|stroke|ring|outline|from|to|via)-\[#[0-9a-fA-F]+\]/)?.[0] ?? null,
  },
  {
    id: 'G1', what: 'literal shape (radius, border, shadow, duration)',
    test: (l) =>
      l.match(new RegExp(String.raw`border-radius\s*:\s*(?!var\()[^;]*?[1-9]\d*\.?\d*(px|rem|em|%)`))?.[0] ??
      l.match(/box-shadow\s*:(?!\s*(?:var\(|none|inset 0 0 0 (?:var|max|calc)\())[^;]*\d+px/)?.[0] ??
      l.match(/border(-[a-z]+)?(-width)?\s*:\s*(?!var\()[^;]*?\b[1-9]\d*px/)?.[0] ??
      l.match(/\b(?:transition|animation)(-duration)?\s*:[^;]*?\b\d+m?s\b/)?.[0] ??
      l.match(/\brounded(?:-[trblse]{1,2})?-(?:full|\[[^\]]*\d(?:px|rem|em|%)[^\]]*\])/)?.[0] ??
      (themed ? null : l.match(/\brounded(?:-[trblse]{1,2})?-(?:xs|sm|md|lg|xl|2xl|3xl|4xl)\b/)?.[0]) ?? null,
  },
  { id: 'C1', what: 'atom used directly (use a cell)', test: (l) => l.match(/var\(\s*--atom-[\w-]+/)?.[0] ?? null },
  { id: 'A2', what: 'atom set outside atoms.css (needs data-atoms there)', test: (l) => (/data-atoms/.test(l) ? null : l.match(/--atom-[\w-]+\s*:/)?.[0] ?? null) },
];

// A project that imports poiesis.css has Tailwind's named radii (rounded-sm … rounded-4xl, rounded-pill) mapped
// onto the radius cells, so only rounded-full and arbitrary literals bypass them.
let themed = false;
const hits = [];
const sizes = new Set();
const weights = new Set();
let files = 0;

function scanFile(path, root) {
  const rel = relative(root, path) || path;
  if (TOKEN_FILE.test(rel)) return;
  files++;
  let inComment = false;
  readFileSync(path, 'utf8').split('\n').forEach((raw, i) => {
    let line = raw;
    if (inComment) {
      const end = line.indexOf('*/');
      if (end === -1) return;
      line = line.slice(end + 2);
      inComment = false;
    }
    line = line.replace(/\/\*.*?\*\//g, '');
    if (line.includes('/*')) [line, inComment] = [line.slice(0, line.indexOf('/*')), true];
    if (/^\s*\/\//.test(line)) return;
    for (const c of checks) {
      const m = c.test(line);
      if (m) hits.push({ rule: c.id, what: c.what, where: `${rel}:${i + 1}`, match: m.trim().slice(0, 80) });
    }
    if (/^\s*--[\w-]+\s*:/.test(line)) return;
    for (const m of line.matchAll(/font-size\s*:\s*([^;"}]+)/g)) sizes.add(m[1].trim());
    for (const m of line.matchAll(/(?<![\w-])text-(xs|sm|base|lg|xl|[2-9]xl)\b/g)) sizes.add(`text-${m[1]}`);
    for (const m of line.matchAll(/font-weight\s*:\s*([^;"}]+)/g)) weights.add(m[1].trim());
    for (const m of line.matchAll(/\bfont-(light|normal|medium|semibold|bold|extrabold|black)\b/g)) weights.add(`font-${m[1]}`);
  });
}

function walk(path, root) {
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) if (!SKIP.has(name) && !name.startsWith('.')) walk(join(path, name), root);
  } else if (EXT.has(extname(path)) && !path.endsWith('.min.css')) scanFile(path, root);
}

const args = process.argv.slice(2);
const targets = args.filter((a) => !a.startsWith('--'));
if (!targets.length) {
  console.error('usage: node scan.mjs <dir or file> [...] [--json]');
  process.exit(2);
}
const findTheme = (path) => {
  if (themed) return;
  if (statSync(path).isDirectory()) {
    for (const name of readdirSync(path)) if (!SKIP.has(name) && !name.startsWith('.')) findTheme(join(path, name));
  } else if (extname(path) === '.css' && /@import\s+["'][^"']*poiesis\.css["']/.test(readFileSync(path, 'utf8'))) themed = true;
};
for (const t of targets) findTheme(t);
for (const t of targets) walk(t, statSync(t).isDirectory() ? t : join(t, '..'));

if (args.includes('--json')) {
  console.log(JSON.stringify({ hits, files, sizes: [...sizes], weights: [...weights] }, null, 2));
} else {
  const groups = hits.reduce((a, h) => ((a[`${h.rule} · ${h.what}`] ??= []).push(h), a), {});
  for (const key of Object.keys(groups).sort()) {
    console.log(`\n${key} · ${groups[key].length}`);
    for (const h of groups[key].slice(0, 30)) console.log(`  ${h.where}  ${h.match}`);
    if (groups[key].length > 30) console.log(`  … ${groups[key].length - 30} more (--json for all)`);
  }
  console.log(`\n${files} files · font sizes (${sizes.size}): ${[...sizes].join(' | ') || '-'}`);
  console.log(`weights (${weights.size}): ${[...weights].join(' | ') || '-'}`);
  if (!hits.length) console.log('No literal values found.');
}
