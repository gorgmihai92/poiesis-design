// What both skills need to know about the project they write in: where its folders are, which ids are taken,
// what day it is, and how to turn a few words into a file name. Reads only.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';

// The folders the Poiesis plugins write in (PROTOCOL.md, "Where things go").
export const FOLDERS = ['research', 'insights', 'foresight', 'frontier', 'design', 'lab'];
const SKIP = new Set(['.git', 'node_modules', '.obsidian', '.trash', 'fixtures']);
const TEXT = /\.(md|html|json|jsonl|csv|txt)$/i;

export const today = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// "How else could confirming a delete work?" → "how-else-could-confirming-a-delete-work"
export const slug = (words, max = 48) => {
  const plain = words.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  return (plain.length > max ? plain.slice(0, max).replace(/-[^-]*$/, '') : plain) || 'untitled';
};

export function* files(dir) {
  let names;
  try { names = readdirSync(dir); } catch { return; }
  for (const name of names.sort()) {
    if (SKIP.has(name)) continue;
    const path = join(dir, name);
    let st;
    try { st = statSync(path); } catch { continue; }
    if (st.isDirectory()) yield* files(path);
    else yield path;
  }
}

// Every number already used with a prefix, anywhere in the project's folders: in a file's name or in its text.
// A number is never used twice, so one that appears only in a From line or in a note about a dropped sketch
// still counts.
export function usedIds(root, prefix) {
  const pattern = new RegExp(`(?<![A-Za-z0-9])${prefix}-(\\d{3,})(?!\\d)`, 'g');
  const used = new Set();
  for (const folder of FOLDERS) {
    for (const path of files(join(resolve(root), folder))) {
      for (const m of path.matchAll(pattern)) used.add(Number(m[1]));
      if (!TEXT.test(path)) continue;
      let text;
      try { text = readFileSync(path, 'utf8'); } catch { continue; }
      for (const m of text.matchAll(pattern)) used.add(Number(m[1]));
    }
  }
  return used;
}

export const formatId = (prefix, n) => `${prefix}-${String(n).padStart(3, '0')}`;

// The next free ids for a prefix: SK-007, SK-008, …
export function nextIds(root, prefix, count = 1) {
  const used = usedIds(root, prefix);
  const start = used.size ? Math.max(...used) + 1 : 1;
  return Array.from({ length: count }, (_, i) => formatId(prefix, start + i));
}

// Any folder named .poiesis-design under a root: the mark of a project set up for the design rules.
export function designSetups(root) {
  const found = [];
  const walk = (dir) => {
    let names;
    try { names = readdirSync(dir, { withFileTypes: true }); } catch { return; }
    for (const e of names) {
      if (!e.isDirectory() || e.name === '.git' || e.name === 'node_modules') continue;
      const path = join(dir, e.name);
      if (e.name === '.poiesis-design') found.push(path);
      else walk(path);
    }
  };
  if (existsSync(root)) walk(resolve(root));
  return found;
}
