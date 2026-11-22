#!/usr/bin/env node
// The showroom: a page made from what the project's notebook holds. A report's own file (report.json) holds only
// references and prose; every number is read from the file it lives in, and every verdict from its challenge
// stamp, when the page is built. The page is one HTML file that opens by double click.
//
//   node report.mjs collect <report.json> [--root .] [--json]
//       resolves every reference and says what the page would show, and every problem found
//   node report.mjs build <report.json> [--root .] [--out <file.html>] [--design <checkout>] [--date YYYY-MM-DD]
//       writes the page (next to report.json as report.html unless --out). Refuses when a file is missing
//   node report.mjs verdicts <note.md> [--root .] [--stamps <file>]
//       the verdict a report would show for each conclusion of a note, and why
//   node report.mjs compare <report.html> <expected.json>
//       the page against another page's series, numbers and verdict labels (see compare.md)
//
// Exit codes: 0 done (compare: the same); 1 a problem (compare: something differs); 2 a wrong command line.

import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { basename, dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { findMaterial, MissingMaterial, TOKEN_FILES } from '../../../lib/material.mjs';
import { today } from '../../../lib/notebook.mjs';
import { dig, locate, numberOf, readText, ReportError, rowsOf, truthy, write } from './lib/read.mjs';
import { readNote, readStamps, STAMP_FILE, verify } from './lib/stamp.mjs';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIBRARY_NEEDS = ['patterns/verdict.css', 'patterns/evidence.css', 'patterns/series.css', 'patterns/series.js', 'patterns/dot-map.css', 'patterns/dot-map.js'];
const esc = (s) => String(s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
const LABEL = { kept: 'Kept', weakened: 'Weakened', dropped: 'Dropped' };

// ---- What a verdict shows, from what the stamp check found -------------------------------------------------

export function display(check) {
  const { status, verdict, date, was, shown } = check;
  const when = date ? `, ${date}` : '';
  switch (status) {
    case 'ok': return { state: verdict, label: LABEL[verdict], note: `Challenged${when}.` };
    case 'verdict retyped':
      return { state: verdict, label: LABEL[verdict], warn: true,
        note: `The file shows “${shown}”; the challenge recorded ${verdict}${when}. The record is shown.` };
    case 'no stamp': return { state: null, label: 'Not challenged', note: 'No challenge is recorded for it.' };
    case 'text changed':
      return { state: null, label: 'Not challenged', warn: true,
        note: `Not as it stands: the sentence changed after it was challenged (${was}${when}).` };
    case 'stamp altered':
      return { state: null, label: 'Not challenged', warn: true, note: 'Its record was changed after it was written, so it is not used.' };
    case 'file damaged':
      return { state: null, label: 'Not challenged', warn: true, note: 'The file of records has a damaged line, so none of it is used.' };
    default: return { state: null, label: 'Not challenged', warn: true, note: 'Two conclusions in the file have this id.' };
  }
}

// ---- Collect: every block resolved from its files -----------------------------------------------------------

const thingsOf = (block) => block.things ?? basename(block.from ?? 'block').replace(/\.[^.]+$/, '');

function resolveSeries(root, block, seen) {
  const unread = [];
  const num = (v, where) => { const n = numberOf(v); if (Number.isNaN(n)) { unread.push(where); return null; } return n; };
  let periods, partial, series;
  if (block.items) {
    const data = JSON.parse(readText(root, block.from, seen));
    const items = dig(data, block.items);
    const source = dig(data, block.periods);
    if (!Array.isArray(items)) throw new ReportError(`${block.from}: "${block.items}" is not a list`);
    if (!source) throw new ReportError(`${block.from}: no "${block.periods}" to take the periods from`);
    periods = (Array.isArray(source) ? source : Object.keys(source)).map(String);
    partial = periods.map(() => '');
    const key = block.key ?? 'id';
    series = items.filter((it) => !block.only || block.only.includes(it[key])).map((it) => ({
      key: String(it[key]), name: String(it[block.name ?? 'name'] ?? it[key]),
      values: (it[block.values] ?? []).map((v, i) => num(v, `${it[key]} ${periods[i]}`)),
    }));
    for (const s of series) {
      if (s.values.length > periods.length) unread.push(`${s.key}: ${s.values.length - periods.length} value(s) past the last period`);
      s.values = periods.map((_, i) => s.values[i] ?? null);
    }
  } else {
    const rows = rowsOf(root, block, seen);
    if (block.columns) {
      periods = rows.map((r) => String(r[block.period]));
      partial = rows.map((r) => (block.partial && truthy(r[block.partial]) ? block.partial_word ?? 'partial' : ''));
      series = block.columns.map((c) => ({ key: c.field, name: c.name ?? c.field, values: rows.map((r, i) => num(r[c.field], `${c.field} ${periods[i]}`)) }));
    } else {
      const order = [], byKey = new Map(), part = new Map();
      for (const r of rows) {
        const p = String(r[block.period]);
        if (!part.has(p)) part.set(p, false);
        if (block.partial && truthy(r[block.partial])) part.set(p, true);
      }
      periods = [...part.keys()].sort((a, b) => (Number.isFinite(+a) && Number.isFinite(+b) ? a - b : a.localeCompare(b)));
      partial = periods.map((p) => (part.get(p) ? block.partial_word ?? 'partial' : ''));
      for (const r of rows) {
        const key = String(r[block.key ?? block.series]);
        if (!byKey.has(key)) { byKey.set(key, { key, name: String(r[block.series]), values: periods.map(() => null) }); order.push(key); }
        byKey.get(key).values[periods.indexOf(String(r[block.period]))] = num(r[block.value], `${key} ${r[block.period]}`);
      }
      series = order.map((k) => byKey.get(k)).filter((s) => !block.only || block.only.includes(s.key));
    }
  }
  return { type: 'series', things: thingsOf(block), from: block.from, unit: block.unit ?? '', min: block.min ?? null,
    period_label: block.period_label ?? 'Period', digits: block.digits ?? null, focus: block.focus ?? null,
    periods, partial, series, unread };
}

function rowsFor(root, block, seen) {
  if (block.items) {
    const data = JSON.parse(readText(root, block.from, seen));
    const rows = dig(data, block.items);
    if (!Array.isArray(rows)) throw new ReportError(`${block.from}: "${block.items}" is not a list`);
    return rows;
  }
  return rowsOf(root, block, seen);
}

function resolveTable(root, block, seen) {
  const rows = rowsFor(root, block, seen);
  if (!Array.isArray(block.columns) || !block.columns.length) throw new ReportError(`a table from ${block.from} has no "columns": it does not say what to show`);
  const key = block.key ?? block.columns[0].field;
  return { type: 'table', things: thingsOf(block), from: block.from, caption: block.caption ?? '', label: block.label ?? '',
    columns: block.columns.map((c) => ({ name: c.name ?? c.field, number: Boolean(c.number) })),
    rows: rows.map((r) => ({ key: String(dig(r, key) ?? ''), cells: block.columns.map((c) => {
      const raw = dig(r, c.field);
      if (c.number) {
        const n = numberOf(raw);
        return { value: Number.isNaN(n) ? null : n, text: n === null ? '' : Number.isNaN(n) ? String(raw) : write(n, c) };
      }
      return { text: raw == null ? '' : String(raw) };
    }) })) };
}

function resolveDots(root, block, seen) {
  const rows = rowsFor(root, block, seen);
  const key = block.key ?? 'id';
  const label = new Set(block.label ?? []);
  return { type: 'dots', things: thingsOf(block), from: block.from, verdicts: block.verdicts ?? null,
    x_label: block.x_label ?? block.x, y_label: block.y_label ?? block.y, x_scale: block.x_scale ?? 'linear', y_scale: block.y_scale ?? 'linear',
    x_unit: block.x_unit ?? '', y_unit: block.y_unit ?? '', x_signed: Boolean(block.x_signed), y_signed: Boolean(block.y_signed),
    rows: rows.map((r) => ({ key: String(dig(r, key)), name: String(dig(r, block.name ?? 'name') ?? dig(r, key)), x: numberOf(dig(r, block.x)), y: numberOf(dig(r, block.y)), label: label.has(String(dig(r, key))) })) };
}

function resolveConclusions(root, block, stamps, seen) {
  let items;
  if (/\.md$/i.test(block.from)) {
    items = readNote(readText(root, block.from, seen)).map((o) => ({
      id: o.id, text: o.text, shown: o.challenge, twice: o.twice,
      fields: o.fields.filter((f) => !/^(id|challenge|from|written)$/i.test(f.label)).map((f) => ({ name: f.label, text: f.text })),
    }));
  } else {
    const rows = rowsOf(root, block, seen);
    const f = { id: block.id_field ?? 'id', text: block.text ?? 'claim', shown: block.shown ?? 'verdict' };
    items = rows.map((r) => ({ id: String(r[f.id] ?? ''), text: String(r[f.text] ?? ''), shown: r[f.shown] == null ? null : String(r[f.shown]),
      fields: (block.fields ?? []).map((c) => ({ name: c.name, text: r[c.field] == null ? '' : String(r[c.field]) })).filter((c) => c.text) }));
  }
  if (block.only) items = items.filter((it) => block.only.includes(it.id));
  return { type: 'conclusions', name: block.name ?? null, from: block.from,
    items: items.map((it) => {
      const check = it.twice ? { status: 'id twice', verdict: null } : verify({ id: it.id, text: it.text, shown: it.shown }, stamps);
      return { ...it, check: { status: check.status, verdict: check.verdict, date: check.date ?? null, was: check.was ?? null }, show: display({ ...check, shown: it.shown }) };
    }) };
}

export function collect(reportPath, { root = '.' } = {}) {
  root = resolve(root);
  let report;
  try { report = JSON.parse(readFileSync(reportPath, 'utf8')); }
  catch (e) { throw new ReportError(`${reportPath}: not valid JSON (${e.message})`); }
  const seen = new Map();
  const problems = [];
  const stampsPath = report.stamps ?? STAMP_FILE;
  const stampsFull = resolve(root, stampsPath);
  if (relative(root, stampsFull).startsWith('..')) throw new ReportError(`${stampsPath}: a report reads only files inside its project`);
  const stamps = readStamps(stampsFull);
  const sections = (report.sections ?? []).map((section, s) => ({
    heading: section.heading ?? '', text: section.text ?? '',
    blocks: (section.blocks ?? []).map((block, b) => {
      try {
        if (block.type === 'text') return { type: 'text', text: block.text ?? '' };
        if (block.type === 'series') return { heading: block.heading ?? '', text: block.text ?? '', ...resolveSeries(root, block, seen) };
        if (block.type === 'table') return { heading: block.heading ?? '', text: block.text ?? '', ...resolveTable(root, block, seen) };
        if (block.type === 'dots') return { heading: block.heading ?? '', text: block.text ?? '', ...resolveDots(root, block, seen) };
        if (block.type === 'conclusions') return { heading: block.heading ?? '', text: block.text ?? '', ...resolveConclusions(root, block, stamps, seen) };
        throw new ReportError(`a block of type "${block.type}" is not one a report knows (text, series, table, dots, conclusions)`);
      } catch (e) {
        if (!(e instanceof ReportError) && !(e instanceof SyntaxError)) throw e;
        problems.push(`Section ${s + 1} ("${section.heading ?? ''}"), block ${b + 1}: ${e.message}`);
        return { type: 'missing', what: e.message };
      }
    }),
  }));
  // A dot's verdict is the one its conclusion shows: never a second copy.
  const named = new Map(sections.flatMap((s) => s.blocks).filter((b) => b.type === 'conclusions' && b.name).map((b) => [b.name, b]));
  for (const block of sections.flatMap((s) => s.blocks).filter((b) => b.type === 'dots' && b.verdicts)) {
    const from = named.get(block.verdicts.from);
    if (!from) { problems.push(`dots from ${block.from}: no conclusions block named "${block.verdicts.from}"`); continue; }
    for (const row of block.rows) {
      const id = block.verdicts.map?.[row.key] ?? row.key;
      const item = from.items.find((it) => it.id === id);
      row.verdict = item ? { id, ...item.show } : { id: null, state: null, label: 'Not challenged', note: 'No conclusion about it was challenged.' };
    }
  }
  for (const block of sections.flatMap((s) => s.blocks)) {
    if (block.unread?.length) problems.push(`series from ${block.from}: ${block.unread.length} value(s) are not numbers and are not drawn (${block.unread.slice(0, 3).join(', ')})`);
  }
  let notChecked = report.not_checked ?? [];
  if (!Array.isArray(notChecked)) problems.push('"not_checked" is a list of lines');
  if (!notChecked.length) problems.push('the report has no "Not checked" lines: every report ends with them');
  return {
    title: report.title ?? 'Report', about: report.about ?? '', root,
    stamps: { path: stampsPath, exists: stamps.exists, count: stamps.count, damaged: stamps.damaged },
    sources: [...seen].map(([path, hash]) => ({ path, hash })),
    sections, not_checked: Array.isArray(notChecked) ? notChecked : [], problems,
  };
}

// ---- Build: one HTML file, the theme and the components inside it ------------------------------------------

function inlineCss(path, done = new Set()) {
  if (done.has(path)) return '';
  done.add(path);
  return readFileSync(path, 'utf8').replace(/^@import\s+"([^"]+)";\s*$/gm, (all, rel) => inlineCss(resolve(dirname(path), rel), done));
}

const paragraphs = (text) => String(text ?? '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p)}</p>`).join('\n');

function verdictLabel(show) {
  return `<span class="po-verdict"${show.state ? ` data-state="${show.state}"` : ''}>${esc(show.label)}</span>`;
}

function seriesHtml(b) {
  const head = `<tr><th scope="col">${esc(b.period_label)}</th>${b.series.map((s) => `<th scope="col" data-key="${esc(s.key)}"${b.focus === s.key || b.focus === s.name ? ' data-focus' : ''}>${esc(s.name)}</th>`).join('')}</tr>`;
  // A period that is not complete says so in the table too, the copy a screen reader reads (U7).
  const body = b.periods.map((p, i) => `<tr${b.partial[i] ? ` data-partial="${esc(b.partial[i])}"` : ''}><th scope="row" data-value="${esc(p)}">${esc(p)}${b.partial[i] ? ` <span class="po-muted">(${esc(b.partial[i])})</span>` : ''}</th>${b.series.map((s) => {
    const v = s.values[i];
    return v === null ? '<td></td>' : `<td data-value="${v}">${esc(write(v, { digits: b.digits }))}</td>`;
  }).join('')}</tr>`).join('\n');
  const min = b.min === null ? '' : ` min="${esc(b.min)}"`;
  return `<po-series data-things="${esc(b.things)}" unit="${esc(b.unit)}"${min}>\n<table><thead>${head}</thead><tbody>\n${body}\n</tbody></table>\n</po-series>`;
}

function tableHtml(b) {
  const head = `<tr>${b.columns.map((c) => `<th scope="col">${esc(c.name)}</th>`).join('')}</tr>`;
  const body = b.rows.map((r) => `<tr data-key="${esc(r.key)}">${r.cells.map((c, i) => {
    const col = b.columns[i];
    const empty = c.text === '';
    const value = col.number && c.value !== null && c.value !== undefined ? ` data-value="${c.value}"` : '';
    const attrs = `${col.number ? ' data-type="number"' : ''}${value}${empty || /^not stated$/i.test(c.text) ? ' data-state="none"' : ''}`;
    const text = empty ? 'not given' : c.text;
    return i === 0 ? `<th scope="row"${attrs}>${esc(text)}</th>` : `<td${attrs}>${esc(text)}</td>`;
  }).join('')}</tr>`).join('\n');
  const label = b.label || b.caption || b.heading || 'Table';
  return `<div class="po-evidence" data-things="${esc(b.things)}" role="region" aria-label="${esc(label)}" tabindex="0">\n<table>${b.caption ? `<caption>${esc(b.caption)}</caption>` : ''}<thead>${head}</thead><tbody>\n${body}\n</tbody></table>\n</div>`;
}

function dotsHtml(b) {
  const withVerdicts = b.rows.some((r) => r.verdict);
  const attrs = [['x-scale', b.x_scale], ['y-scale', b.y_scale], ['x-unit', b.x_unit], ['y-unit', b.y_unit]]
    .filter(([, v]) => v && v !== 'linear').map(([k, v]) => ` ${k}="${esc(v)}"`).join('') + (b.x_signed ? ' x-signed' : '') + (b.y_signed ? ' y-signed' : '');
  const head = `<tr><th scope="col">Name</th><th scope="col">${esc(b.x_label)}</th><th scope="col">${esc(b.y_label)}</th>${withVerdicts ? '<th scope="col">Challenge</th>' : ''}</tr>`;
  const body = b.rows.map((r) => {
    const state = r.verdict ? ` data-state="${r.verdict.state ?? 'none'}"` : '';
    const cell = (v, signed, unit) => (v === null || Number.isNaN(v) ? '<td></td>' : `<td data-value="${v}">${esc(write(v, { signed, unit }))}</td>`);
    return `<tr data-key="${esc(r.key)}"${state}${r.label ? ' data-label' : ''}><th scope="row">${esc(r.name)}</th>${cell(r.x, b.x_signed, b.x_unit)}${cell(r.y, b.y_signed, b.y_unit)}${withVerdicts ? `<td>${verdictLabel(r.verdict)}</td>` : ''}</tr>`;
  }).join('\n');
  return `<po-dot-map data-things="${esc(b.things)}"${attrs}>\n<table><thead>${head}</thead><tbody>\n${body}\n</tbody></table>\n</po-dot-map>`;
}

function conclusionsHtml(b) {
  return `<ol class="report-conclusions">\n${b.items.map((it) => `<li id="conclusion-${esc(it.id)}">
  <p class="report-conclusion-head">${verdictLabel(it.show)} <span class="report-id">${esc(it.id)}</span></p>
  <p class="report-conclusion-text">${esc(it.text)}</p>
  <p class="report-conclusion-note"${it.show.warn ? ' data-warn' : ''}>${it.show.warn ? '<strong>Note:</strong> ' : ''}${esc(it.show.note)}</p>
  ${it.fields.map((f) => `<p class="report-conclusion-field"><span>${esc(f.name)}:</span> ${esc(f.text)}</p>`).join('\n  ')}
</li>`).join('\n')}\n</ol>`;
}

function blockHtml(b) {
  const intro = `${b.heading ? `<h3 class="po-subheading">${esc(b.heading)}</h3>` : ''}${b.text ? paragraphs(b.text) : ''}`;
  const body = b.type === 'text' ? paragraphs(b.text)
    : b.type === 'series' ? seriesHtml(b)
    : b.type === 'table' ? tableHtml(b)
    : b.type === 'dots' ? dotsHtml(b)
    : b.type === 'conclusions' ? conclusionsHtml(b)
    : `<div class="po-alert" data-tone="danger" role="alert"><p>Not shown: ${esc(b.what)}</p></div>`;
  return `<div class="report-block">${intro}${body}</div>`;
}

export function build(model, { material, date }) {
  const tokens = TOKEN_FILES.map((f) => readFileSync(join(material.tokens.dir, f), 'utf8')).join('\n');
  const library = inlineCss(join(material.library.dir, 'poiesis-components.css'));
  const viewer = readFileSync(resolve(HERE, '../viewer/viewer.css'), 'utf8');
  const scripts = ['patterns/series.js', 'patterns/dot-map.js'].map((f) => `<script type="module">\n${readFileSync(join(material.library.dir, f), 'utf8')}\n</script>`).join('\n');
  const { root, ...shown } = model;
  const json = JSON.stringify({ ...shown, built: date, material: { tokens: material.tokens.version, library: material.library.version } }).replace(/</g, '\\u003c');
  const stampsLine = model.stamps.exists
    ? `Verdicts come from ${model.stamps.count} challenge record${model.stamps.count === 1 ? '' : 's'} in ${model.stamps.path}${model.stamps.damaged ? ', a file with a damaged line: none of it is used' : ''}.`
    : `No challenge records were found (${model.stamps.path}), so every conclusion shows as not challenged.`;
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(model.title)}</title>
<style>
${tokens}
${library}
${viewer}
</style>
<script type="application/json" id="report-model">${json}</script>
${scripts}
</head>
<body class="po-paper">
<main class="report">
<header class="report-head">
  <h1 class="po-title">${esc(model.title)}</h1>
  ${paragraphs(model.about)}
  <p class="po-muted">Built ${esc(date)} by poiesis-studio from ${model.sources.length} file${model.sources.length === 1 ? '' : 's'} of the project: every figure, table and verdict on it is read from those files; the prose is the report's own. ${esc(stampsLine)}</p>
</header>
${model.sections.map((s) => `<section class="report-section">
  <h2 class="po-heading">${esc(s.heading)}</h2>
  ${paragraphs(s.text)}
  ${s.blocks.map(blockHtml).join('\n  ')}
</section>`).join('\n')}
<section class="report-section">
  <h2 class="po-heading">Where the numbers come from</h2>
  <ul class="report-sources">
${model.sources.map((f) => `    <li><code>${esc(f.path)}</code> <span class="po-muted">sha256 ${esc(f.hash)}…</span></li>`).join('\n')}
  </ul>
  <p class="po-muted">Theme: poiesis-ui ${esc(material.tokens.version)}. Components: poiesis-components ${esc(material.library.version)}.</p>
</section>
<section class="report-section">
  <h2 class="po-heading">Not checked</h2>
  <ul class="report-not-checked">
${model.not_checked.map((l) => `    <li>${esc(l)}</li>`).join('\n')}
  </ul>
</section>
</main>
</body>
</html>
`;
}

// ---- Compare: this page against another page's series, numbers and verdict labels ---------------------------

const unescape = (s) => s.replace(/<[^>]+>/g, '').replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&').trim();
const attr = (tag, name) => { const m = tag.match(new RegExp(`\\b${name}="([^"]*)"`)); return m ? unescape(m[1]) : null; };
const cellsOf = (row) => [...row.matchAll(/<(th|td)\b([^>]*)>([\s\S]*?)<\/\1>/g)].map((m) => ({ tag: m[2], text: unescape(m[3]) }));
// A number as the page writes it ("−1,234.5 SD", "+14%"), with the precision it is written to.
const read = (text) => {
  const m = text.replace(/−/g, '-').replace(/,/g, '').match(/[-+]?\d+(?:\.(\d+))?/);
  return m ? { value: Number(m[0]), digits: (m[1] ?? '').length } : null;
};

// What a built page shows, read from its markup: the series in each series table, the numbers in each table and
// dot map (from the text a reader sees, with the value it was written from), and each verdict label.
export function shownIn(html) {
  const series = {}, names = {}, numbers = {}, verdicts = {}, faults = [];
  const add = (thing, cell, value) => {
    const written = read(cell.text);
    if (value === null || Number.isNaN(value)) return;
    (numbers[thing] ??= []).push({ value, written });
  };
  for (const m of html.matchAll(/<po-series\b([^>]*)>([\s\S]*?)<\/po-series>/g)) {
    const things = attr(m[1], 'data-things');
    const keys = [...m[2].matchAll(/<th scope="col"([^>]*)>([\s\S]*?)<\/th>/g)].slice(1).map((h) => ({ key: attr(h[1], 'data-key'), name: unescape(h[2]) }));
    for (const k of keys) { series[`${things}:${k.key}`] = {}; names[`${things}:${k.key}`] = k.name; }
    const body = m[2].slice(m[2].indexOf('<tbody>'));
    for (const row of body.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/g)) {
      const cells = cellsOf(row[1]);
      const period = attr(cells[0].tag, 'data-value') ?? cells[0].text;
      if (cells.length !== keys.length + 1) faults.push(`${things} ${period}: ${cells.length - 1} cells under ${keys.length} series`);
      keys.forEach((k, i) => {
        const cell = cells[i + 1];
        if (!cell || cell.text === '') return;
        const value = Number(attr(cell.tag, 'data-value'));
        series[`${things}:${k.key}`][period] = { value, written: read(cell.text) };
      });
    }
  }
  for (const m of html.matchAll(/<(?:div class="po-evidence"|po-dot-map)(?=[\s>])([^>]*)>([\s\S]*?)<\/table>/g)) {
    const things = attr(m[1], 'data-things');
    for (const row of m[2].matchAll(/<tr data-key="([^"]*)"[^>]*>([\s\S]*?)<\/tr>/g)) {
      const key = unescape(row[1]);
      for (const cell of cellsOf(row[2])) {
        const v = attr(cell.tag, 'data-value');
        if (v !== null && v !== '') add(`${things}:${key}`, cell, Number(v));
      }
      const label = row[2].match(/<span class="po-verdict"[^>]*>([\s\S]*?)<\/span>/);
      if (label && m[0].startsWith('<po-dot-map')) verdicts[`dot:${key}`] = unescape(label[1]).toLowerCase();
    }
  }
  for (const m of html.matchAll(/<li id="conclusion-([^"]*)">([\s\S]*?)<\/li>/g)) {
    const label = m[2].match(/<span class="po-verdict"([^>]*)>([\s\S]*?)<\/span>/);
    const note = m[2].match(/<p class="report-conclusion-note"[^>]*>([\s\S]*?)<\/p>/);
    verdicts[unescape(m[1])] = label ? unescape(label[2]).toLowerCase() : 'nothing';
    verdicts[`note:${unescape(m[1])}`] = note ? unescape(note[1]) : '';
    const state = label ? attr(label[1], 'data-state') : null;
    if (label && (state ? LABEL[state] : 'Not challenged') !== unescape(label[2])) faults.push(`${unescape(m[1])}: its label says "${unescape(label[2])}" and its mark ${state ?? 'none'}`);
  }
  return { series, names, numbers, verdicts, faults };
}

const same = (a, b) => a === b || (typeof a === 'number' && typeof b === 'number' && Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a)));

// The value a cell was written from equals the page's, and the words a reader sees say the same number, to the
// precision they are written to.
const agrees = (got, value) => got && same(got.value, value) && got.written !== null &&
  Math.abs(got.written.value - value) <= 0.5 * 10 ** -got.written.digits + 1e-9 * Math.max(1, Math.abs(value));

export function compare(html, expected) {
  const shown = shownIn(html);
  const out = { series: { compared: 0, same: 0, lines: [] }, numbers: { compared: 0, same: 0, lines: [] }, verdicts: { compared: 0, same: 0, lines: [] }, names: [], faults: shown.faults };
  for (const [key, points] of Object.entries(expected.series ?? {})) {
    const got = shown.series[key];
    for (const [period, value] of Object.entries(points)) {
      if (value === null) continue;
      out.series.compared++;
      if (got && agrees(got[period], value)) out.series.same++;
      else out.series.lines.push(got ? `${key} ${period}: the page shows ${value}; the report ${got[period] ? `writes ${got[period].written?.value ?? 'no number'}` : 'nothing'}` : `${key} ${period}: the page shows ${value}; the report has no such series`);
    }
    if (expected.names?.[key] && shown.names[key] && expected.names[key] !== shown.names[key]) {
      out.names.push(`${key}: the page names it "${expected.names[key]}"; the data file, which the report shows, "${shown.names[key]}"`);
    }
  }
  for (const [thing, values] of Object.entries(expected.numbers ?? {})) {
    const got = shown.numbers[thing] ?? [];
    for (const value of values) {
      out.numbers.compared++;
      if (got.some((g) => agrees(g, value))) out.numbers.same++;
      else out.numbers.lines.push(`${thing}: the page shows ${value}; the report does not`);
    }
  }
  for (const [id, label] of Object.entries(expected.verdicts ?? {})) {
    out.verdicts.compared++;
    const got = shown.verdicts[id];
    if (got === label.toLowerCase()) out.verdicts.same++;
    else out.verdicts.lines.push(`${id}: the page shows "${label}"; the report shows "${got ?? 'nothing'}"${shown.verdicts[`note:${id}`] ? ` (${shown.verdicts[`note:${id}`]})` : ''}`);
  }
  out.differ = out.series.lines.length + out.numbers.lines.length + out.verdicts.lines.length + out.faults.length;
  return out;
}

export function compareText(result, expected) {
  const part = (title, p) => [`${title}: ${p.compared} compared, ${p.same} the same, ${p.compared - p.same} different.`, ...p.lines.map((l) => `  ${l}`)];
  return [
    `Compared with ${expected.page ?? 'the expected page'}.`,
    ...part('Series values', result.series), ...part('Numbers', result.numbers), ...part('Verdict labels', result.verdicts),
    ...(result.faults.length ? ['Faults in the page:', ...result.faults.map((l) => `  ${l}`)] : []),
    ...(result.names.length ? ['Names (not counted as differences):', ...result.names.map((l) => `  ${l}`)] : []),
  ].join('\n');
}

export const modelOf = (html) => {
  const m = html.match(/<script type="application\/json" id="report-model">([\s\S]*?)<\/script>/);
  if (!m) throw new ReportError('this page has no report model: it was not built by report.mjs');
  return JSON.parse(m[1]);
};

// ---- Command line -------------------------------------------------------------------------------------------

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const argv = process.argv.slice(2);
  const opt = (name) => { const i = argv.indexOf(`--${name}`); return i >= 0 ? argv[i + 1] : undefined; };
  const VALUED = new Set(['root', 'out', 'design', 'date', 'stamps']);
  const args = argv.slice(1).filter((a, i, rest) => !a.startsWith('--') && !(rest[i - 1]?.startsWith('--') && VALUED.has(rest[i - 1].slice(2))));
  const fail = (m, code = 2) => { console.error(m); process.exit(code); };
  const root = opt('root') ?? '.';
  try {
    const command = argv[0];
    if (command === 'collect' || command === 'build') {
      if (!args[0] || !existsSync(args[0])) fail(`Usage: report.mjs ${command} <report.json> [--root <project>]`);
      const model = collect(args[0], { root });
      if (command === 'collect') {
        if (argv.includes('--json')) console.log(JSON.stringify(model, null, 2));
        else {
          for (const s of model.sections) {
            console.log(`## ${s.heading}`);
            for (const b of s.blocks) {
              if (b.type === 'series') console.log(`  series from ${b.from}: ${b.series.length} lines, ${b.periods.length} periods${b.partial.some(Boolean) ? ', partial ones marked' : ''}`);
              if (b.type === 'table') console.log(`  table from ${b.from}: ${b.rows.length} rows, ${b.columns.length} columns`);
              if (b.type === 'dots') console.log(`  dots from ${b.from}: ${b.rows.length}`);
              if (b.type === 'conclusions') for (const it of b.items) console.log(`  ${it.id}: ${it.show.label} (${it.check.status})`);
            }
          }
        }
        if (model.problems.length) { console.error(model.problems.map((p) => `PROBLEM ${p}`).join('\n')); process.exit(1); }
      } else {
        if (model.problems.length) fail(`${model.problems.map((p) => `PROBLEM ${p}`).join('\n')}\nNothing was written.`, 1);
        const material = findMaterial({ design: opt('design') ?? process.env.POIESIS_DESIGN, library: LIBRARY_NEEDS });
        const out = opt('out') ?? join(dirname(args[0]), 'report.html');
        writeFileSync(out, build(model, { material, date: opt('date') ?? today() }));
        console.log(`Saved: ${out}`);
      }
    } else if (command === 'verdicts') {
      if (!args[0]) fail('Usage: report.mjs verdicts <note.md> [--root <project>] [--stamps <file>]');
      const stamps = readStamps(resolve(root, opt('stamps') ?? STAMP_FILE));
      for (const o of readNote(readFileSync(args[0], 'utf8'))) {
        const check = o.twice ? { status: 'id twice' } : verify({ id: o.id, text: o.text, shown: o.challenge }, stamps);
        const show = display({ ...check, shown: o.challenge });
        console.log(`${o.id}: ${show.label} · ${check.status} · ${show.note}`);
      }
    } else if (command === 'compare') {
      if (!args[1]) fail('Usage: report.mjs compare <report.html> <expected.json>');
      const expected = JSON.parse(readFileSync(args[1], 'utf8'));
      const result = compare(readFileSync(args[0], 'utf8'), expected);
      console.log(compareText(result, expected));
      process.exit(result.differ ? 1 : 0);
    } else fail('Usage: report.mjs collect|build|verdicts|compare … (see the top of this file)');
  } catch (e) {
    if (e instanceof ReportError || e instanceof MissingMaterial) fail(e.message, 1);
    throw e;
  }
}
