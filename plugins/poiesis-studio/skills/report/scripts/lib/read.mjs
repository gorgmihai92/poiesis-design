// Readers for the files a report points to: JSON, CSV and Markdown tables, each turned into rows (objects), and
// the small helpers that pick a value out of a row and write a number the way a page shows it. Reads only.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';
import { isAbsolute, join, relative, resolve } from 'node:path';

export class ReportError extends Error {}

// A file named in a report, inside the project's root and nowhere else.
export function locate(root, path) {
  if (typeof path !== 'string' || !path) throw new ReportError('a block has no "from": it does not say which file to read');
  const full = resolve(root, path);
  const rel = relative(resolve(root), full);
  if (isAbsolute(path) || rel.startsWith('..')) throw new ReportError(`${path}: a report reads only files inside its project`);
  if (!existsSync(full)) throw new ReportError(`${path}: no such file`);
  return full;
}

export function readText(root, path, seen) {
  const full = locate(root, path);
  const text = readFileSync(full, 'utf8').replace(/^\uFEFF/, '');
  seen?.set(path, createHash('sha256').update(text, 'utf8').digest('hex').slice(0, 12));
  return text;
}

// "rows", "run.series", "": a dotted path into parsed JSON.
export const dig = (value, path) =>
  (path ? String(path).split('.') : []).reduce((at, key) => (at == null ? undefined : at[key]), value);

export function parseCsv(text) {
  const rows = [];
  let row = [], cell = '', quoted = false;
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (quoted) {
      if (c === '"' && text[i + 1] === '"') { cell += '"'; i++; }
      else if (c === '"') quoted = false;
      else cell += c;
    } else if (c === '"') quoted = true;
    else if (c === ',') { row.push(cell); cell = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && text[i + 1] === '\n') i++;
      row.push(cell); cell = '';
      if (row.length > 1 || row[0] !== '') rows.push(row);
      row = [];
    } else cell += c;
  }
  if (cell !== '' || row.length) { row.push(cell); rows.push(row); }
  const [head, ...body] = rows;
  return (head ? body : []).map((cells) => Object.fromEntries(head.map((name, i) => [name, cells[i] ?? ''])));
}

// The tables of a Markdown file. A row is split on every "|", as the plugins' own log scripts do, so a cell
// cannot hold one. Each table knows the heading it stands under.
export function markdownTables(text) {
  const tables = [];
  let heading = '', fenced = false, current = null;
  const cells = (line) => line.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((c) => c.trim());
  for (const line of text.split(/\r?\n/)) {
    if (/^[ \t]*(```|~~~)/.test(line)) { fenced = !fenced; current = null; continue; }
    if (fenced) continue;
    const h = line.match(/^#{1,6}[ \t]+(.*)$/);
    if (h) { heading = h[1].trim(); current = null; continue; }
    if (!/^\s*\|/.test(line)) { current = null; continue; }
    if (!current) { current = { heading, head: cells(line), rows: [], ruled: false }; tables.push(current); continue; }
    if (!current.ruled && /^\s*\|[\s:|-]+\|?\s*$/.test(line)) { current.ruled = true; continue; }
    const found = cells(line);
    current.rows.push(Object.fromEntries(current.head.map((name, i) => [name, found[i] ?? ''])));
  }
  return tables.filter((t) => t.ruled);
}

// The items of a Markdown list under a heading ("Not checked"), as plain lines.
export function markdownList(text, heading) {
  const lines = text.split(/\r?\n/);
  const items = [];
  let inside = false;
  for (const line of lines) {
    const h = line.match(/^#{1,6}[ \t]+(.*)$/);
    if (h) { inside = h[1].trim().toLowerCase() === heading.trim().toLowerCase(); continue; }
    if (!inside) continue;
    const item = line.match(/^[ \t]*[-*+][ \t]+(.*)$/);
    if (item) items.push(item[1].trim());
    else if (items.length && /^[ \t]+\S/.test(line)) items[items.length - 1] += ` ${line.trim()}`;
  }
  return items;
}

// Rows from the file a block names: a JSON array (at `rows`, "rows" by default when the file is an object), a CSV
// file, or a Markdown table (the first, the nth with `table`, or the first under `heading`).
export function rowsOf(root, block, seen) {
  const text = readText(root, block.from, seen);
  if (/\.csv$/i.test(block.from)) return parseCsv(text);
  if (/\.md$/i.test(block.from)) {
    const tables = markdownTables(text);
    const table = block.heading
      ? tables.find((t) => t.heading.toLowerCase() === String(block.heading).toLowerCase())
      : tables[(block.table ?? 1) - 1];
    if (!table) throw new ReportError(`${block.from}: no table ${block.heading ? `under "${block.heading}"` : `number ${block.table ?? 1}`}`);
    return table.rows;
  }
  let data;
  try { data = JSON.parse(text); } catch (e) { throw new ReportError(`${block.from}: not valid JSON (${e.message})`); }
  const path = block.rows ?? block.items ?? (Array.isArray(data) ? '' : 'rows');
  const rows = dig(data, path);
  // An object of values ({"2010": 919, …}) is read as rows of a key and a value.
  if (rows && typeof rows === 'object' && !Array.isArray(rows)) return Object.entries(rows).map(([key, value]) => ({ key, value }));
  if (!Array.isArray(rows)) throw new ReportError(`${block.from}: "${path}" is not a list of rows`);
  return rows;
}

// A number out of a row: null when the field is empty or absent, NaN when it holds words that are not a number.
export function numberOf(value) {
  if (value === null || value === undefined) return null;
  if (typeof value === 'number') return Number.isFinite(value) ? value : NaN;
  const raw = String(value).replace(/[\s\u00a0\u202f]/g, '').replace(/^\u2212/, '-');
  if (raw === '') return null;
  const n = Number(raw);
  return Number.isFinite(n) ? n : NaN;
}
export const truthy = (value) => value === true || /^(true|yes|1)$/i.test(String(value ?? '').trim());

// A number as the page writes it: grouped thousands, a fixed count of decimals when `digits` is given, a true
// minus sign, an optional + before numbers above zero, an optional unit after.
export function write(value, { digits = null, signed = false, unit = '' } = {}) {
  if (value === null || Number.isNaN(value)) return '';
  const options = digits === null ? { maximumFractionDigits: 2 } : { minimumFractionDigits: digits, maximumFractionDigits: digits };
  const rounded = digits === null ? value : Number(value.toFixed(digits));
  const body = new Intl.NumberFormat('en-US', options).format(Math.abs(rounded));
  const sign = rounded < 0 ? '\u2212' : signed && rounded > 0 ? '+' : '';
  return `${sign}${body}${unit}`;
}

export const fileNote = (root, path) => join('', path).split('\\').join('/');
