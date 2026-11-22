#!/usr/bin/env node
// The files of a free exploration: several sketches of one question, side by side, made from the Poiesis theme.
// It writes only inside design/lab/ and design/patterns/ of the project. It never sets a project up for the
// design rules: no .poiesis-design/ folder, no audit, no scan.
//
//   node explore.mjs new "<the question>" [--variants 6] [--root .] [--design <checkout>]
//       design/lab/<date>-<slug>/ with theme.css (the theme's files, joined), prototype.css, one starting file
//       for each sketch (SK-001-….html), notes.md and the board, index.html
//   node explore.mjs board <exploration folder>
//       writes the board again from the sketches that are there (their ids, titles and generators)
//   node explore.mjs card <exploration folder> --name "<the pattern>" --from SK-001,SK-004 [--root .]
//       design/patterns/PT-001-<slug>.md from the template, for the owner to decide on
//   node explore.mjs next SK|PT [--root .]        the next free id
//   node explore.mjs check <exploration folder> [--root .]
//       what a script can see: no .poiesis-design/ anywhere in the project, at least three sketches, each one
//       changed from its starting file, linking the theme, saying it is a prototype, with something to act on
//
// Exit codes: 0 done (check: nothing found), 1 check found something or the theme is missing, 2 a wrong command.

import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMaterial, MissingMaterial, themeCss } from '../../../lib/material.mjs';
import { designSetups, nextIds, slug, today } from '../../../lib/notebook.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const TEMPLATES = resolve(HERE, '../templates');
const argv = process.argv.slice(2);
const command = argv[0];
const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
const VALUED = new Set(['variants', 'root', 'design', 'date', 'name', 'from']);
const words = argv.slice(1).filter((a, i, rest) => !a.startsWith('--') && !(rest[i - 1]?.startsWith('--') && VALUED.has(rest[i - 1].slice(2))));
const root = resolve(opt('root') ?? '.');
const fail = (message, code = 2) => { console.error(message); process.exit(code); };
const escape = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
// A value for a properties block: a YAML double-quoted string (JSON's escapes are YAML's), with the two characters
// YAML 1.1 read as line breaks escaped too.
const yamlText = (s) => JSON.stringify(String(s)).replace(/\u2028/g, '\\u2028').replace(/\u2029/g, '\\u2029');
// `from` as a list of quoted items, an id as a link: `\n  - "[[SK-002]]"`, or ` []`.
const yamlFrom = (items) => items.map((f) => `\n  - ${yamlText(/^[A-Z]{1,3}-\d+$/.test(f) ? `[[${f}]]` : f)}`).join('') || ' []';
const template = (name, values) =>
  readFileSync(join(TEMPLATES, name), 'utf8').replace(/\{\{(\w+)\}\}/g, (all, key) => (key in values ? values[key] : all));
const write = (path, text) => {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, text);
  console.log(`  wrote ${relative(root, path) || path}`);
};

const PROTOTYPE_CSS = `/* The one line of an exploration that is not about design: a sketch says that it is a prototype, on itself,
   wherever it is shown. A corner of the screen, above everything, in the theme's plain text. */
.prototype-mark {
  position: fixed;
  inset-block-end: 0;
  inset-inline-end: 0;
  z-index: 2147483647;
  margin: 0;
  padding: calc(var(--space, 0.25rem) * 1.5) calc(var(--space, 0.25rem) * 3);
  background: var(--ink, #000);
  color: var(--paper, #fff);
  font: 400 0.75rem / 1.4 "Helvetica Neue", Helvetica, Arial, sans-serif;
  pointer-events: none;
}
`;

// The sketches in a folder: id, file, title, generator, and what the file holds.
function sketches(dir) {
  return readdirSync(dir).filter((f) => /^SK-\d{3,}.*\.html$/.test(f)).sort().map((file) => {
    const html = readFileSync(join(dir, file), 'utf8');
    const meta = (name) => html.match(new RegExp(`<meta\\s+name="${name}"\\s+content="([^"]*)"`, 'i'))?.[1] ?? '';
    return {
      id: file.match(/^SK-\d+/)[0],
      file,
      html,
      title: (html.match(/<title>([^<]*)<\/title>/i)?.[1] ?? file).replace(/^SK-\d+\s*·\s*/, '').trim(),
      generator: meta('sketch:generator'),
    };
  });
}

function board(dir) {
  const found = sketches(dir);
  const notes = existsSync(join(dir, 'notes.md')) ? readFileSync(join(dir, 'notes.md'), 'utf8') : '';
  const question = notes.match(/^# (.*)$/m)?.[1] ?? basename(dir);
  const frames = found.map((s) => `    <figure class="sketch">
      <figcaption><strong>${escape(s.id)}</strong> ${escape(s.title)}${s.generator ? ` <span class="muted">· ${escape(s.generator)}</span>` : ''} <a href="${escape(s.file)}">Open alone</a></figcaption>
      <iframe src="${escape(s.file)}" title="${escape(`${s.id}: ${s.title}`)}" loading="lazy"></iframe>
    </figure>`).join('\n');
  write(join(dir, 'index.html'), template('board.html', {
    question: escape(question),
    count: String(found.length),
    frames,
  }));
}

if (command === 'next') {
  const prefix = words[0];
  if (!['SK', 'PT'].includes(prefix)) fail('Usage: explore.mjs next SK|PT [--root <project>]');
  console.log(nextIds(root, prefix)[0]);
} else if (command === 'new') {
  const question = words.join(' ').trim();
  if (!question) fail('Usage: explore.mjs new "<the question>" [--variants 6] [--root <project>] [--design <checkout>]');
  const count = Number(opt('variants') ?? 6);
  if (!Number.isInteger(count) || count < 3 || count > 12) fail('--variants takes a whole number from 3 to 12: fewer than three is not a comparison.');
  let material;
  try { material = findMaterial({ design: opt('design') ?? process.env.POIESIS_DESIGN }); }
  catch (e) { if (e instanceof MissingMaterial) fail(e.message, 1); throw e; }
  const day = opt('date') ?? today();
  const dir = join(root, 'design/lab', `${day}-${slug(question)}`);
  if (existsSync(dir)) fail(`${relative(root, dir)} is already there. Nothing was written; an exploration is not written over.`, 1);
  const ids = nextIds(root, 'SK', count);
  console.log(`Exploration: ${relative(root, dir)}`);
  console.log(`Theme: poiesis-ui ${material.tokens.version}, read from ${material.tokens.dir} (${material.tokens.from})`);
  write(join(dir, 'theme.css'), themeCss(material.tokens, { today: day }));
  write(join(dir, 'prototype.css'), PROTOTYPE_CSS);
  for (const id of ids) {
    write(join(dir, `${id}.html`), template('sketch.html', { id, question: escape(question) }));
  }
  write(join(dir, 'notes.md'), template('exploration.md', {
    question,
    topic: yamlText(question),
    date: day,
    theme: `poiesis-ui ${material.tokens.version}`,
    sketches: ids.map((id) => `### ${id}: <name it once it exists>\n\n- **Id:** ${id}\n- **Written:** ${day}\n- **Generator:** <which one, from generators.md>\n- **Tries:** <what this sketch does differently, in one line>\n- **File:** ${id}.html\n`).join('\n'),
  }));
  board(dir);
  console.log(`\n${count} starting files. Write every sketch before judging any of them; then: explore.mjs board, explore.mjs check.`);
} else if (command === 'board') {
  const dir = resolve(words[0] ?? '');
  if (!words[0] || !existsSync(dir)) fail('Usage: explore.mjs board <exploration folder>');
  board(dir);
} else if (command === 'card') {
  const dir = resolve(words[0] ?? '');
  const name = opt('name');
  const from = (opt('from') ?? '').split(',').map((s) => s.trim()).filter(Boolean);
  if (!words[0] || !existsSync(dir) || !name || !from.length) fail('Usage: explore.mjs card <exploration folder> --name "<the pattern>" --from SK-001,SK-004 [--root <project>]');
  const have = new Set(sketches(dir).map((s) => s.id));
  const unknown = from.filter((id) => /^SK-/.test(id) && !have.has(id));
  if (unknown.length) fail(`Not in ${relative(root, dir)}: ${unknown.join(', ')}. A card names the sketches it came out of.`, 1);
  const [id] = nextIds(root, 'PT');
  const path = join(root, 'design/patterns', `${id}-${slug(name)}.md`);
  write(path, template('pattern-card.md', {
    id, name, topic: yamlText(name), from_links: yamlFrom(from), date: today(), from: from.join(', '), exploration: relative(dirname(path), dir).split('\\').join('/'),
  }));
  console.log('The Decision line is the owner\'s. Leave it as it is.');
} else if (command === 'check') {
  const dir = resolve(words[0] ?? '');
  if (!words[0] || !existsSync(dir)) fail('Usage: explore.mjs check <exploration folder> [--root <project>]');
  const found = [];
  for (const setup of designSetups(root)) found.push(`${relative(root, setup)} exists: this project is set up for the design rules. An exploration never makes that folder.`);
  const all = sketches(dir);
  if (all.length < 3) found.push(`${all.length} sketch file(s): fewer than three is not a comparison.`);
  const start = (id) => template('sketch.html', { id, question: '' }).replace(/<title>[^<]*<\/title>/, '');
  for (const s of all) {
    const body = s.html.replace(/<title>[^<]*<\/title>/, '');
    if (body === start(s.id) || /<main>\s*<!--[\s\S]*?-->\s*<\/main>/.test(s.html)) { found.push(`${s.file}: still the starting file.`); continue; }
    if (!/href="theme\.css"/.test(s.html)) found.push(`${s.file}: does not link theme.css, so it is not made from the theme.`);
    if (!/class="[^"]*prototype-mark/.test(s.html) || !new RegExp(`Prototype[^<]*${s.id}`).test(s.html)) found.push(`${s.file}: does not say "Prototype · ${s.id}" on itself.`);
    if (!/<(button|input|select|textarea|summary|a\s)|\btabindex=|\bcontenteditable/i.test(s.html)) found.push(`${s.file}: nothing in it can be acted on. A sketch works; a picture does not.`);
  }
  const notes = existsSync(join(dir, 'notes.md')) ? readFileSync(join(dir, 'notes.md'), 'utf8') : '';
  if (!/^## Not checked\s*$/m.test(notes)) found.push('notes.md has no "Not checked" section.');
  for (const s of all) if (!new RegExp(`\\*\\*Id:\\*\\*\\s*${s.id}\\b`).test(notes)) found.push(`notes.md has no entry for ${s.id}.`);
  if (found.length) {
    console.log(found.map((f) => `- ${f}`).join('\n'));
    console.log(`\n${found.length} found.`);
    process.exit(1);
  }
  console.log(`${all.length} sketches in order; no .poiesis-design/ in ${relative(process.cwd(), root) || '.'}.`);
  console.log('Not checked by this script: that each sketch really works, that they differ, and that no agent audited them.');
} else {
  fail('Usage: explore.mjs new|board|card|next|check … (see the top of this file)');
}
