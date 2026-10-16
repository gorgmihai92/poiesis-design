#!/usr/bin/env node
// Builds one self-contained HTML page that shows every component in the four styles side by side, with the
// preset (type and density) and the theme switchable. The markup mirrors what the .tsx components render, with
// the same classes and ARIA, so the page shows the real CSS; a little script stands in for React and Radix.
//
//   node preview.mjs --out preview.html [--tokens <poiesis-ui skills/ui/tokens dir>]

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const LIB = resolve(HERE, '../library');
const argv = process.argv.slice(2);
const opt = (name) => {
  const i = argv.indexOf(`--${name}`);
  return i >= 0 ? argv[i + 1] : undefined;
};

/** The poiesis-ui tokens: next to this plugin in the repository, else in the installed plugin cache. */
function findTokens() {
  const given = opt('tokens');
  if (given) return resolve(given);
  const sibling = resolve(HERE, '../../../../poiesis-ui/skills/ui/tokens');
  if (existsSync(join(sibling, 'cells.css'))) return sibling;
  const cache = join(homedir(), '.claude/plugins/cache');
  const stack = [cache];
  while (stack.length) {
    const dir = stack.pop();
    if (!existsSync(dir)) continue;
    for (const e of readdirSync(dir, { withFileTypes: true })) {
      if (!e.isDirectory()) continue;
      const p = join(dir, e.name);
      if (p.endsWith('skills/ui/tokens') && existsSync(join(p, 'cells.css'))) return p;
      if (p.split('/').length - cache.split('/').length < 7) stack.push(p);
    }
  }
  throw new Error('poiesis-ui tokens not found: pass --tokens <dir>');
}

const T = findTokens();
const read = (p) => readFileSync(p, 'utf8');
const strip = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '').trim();
const scoped = (file, attr, value) => strip(read(file)).replace(/:root\s*\{/, `[data-${attr}="${value}"] {`);

const PRESETS = ['tool', 'reading', 'expressive'];
const STYLES = [
  ['quiet', 'Square, no lines, no shadows. Selected is inverted.'],
  ['soft', 'Rounded, no lines, gentle shadows. Selected is tinted.'],
  ['crisp', 'Small corners, thin lines, flat. Selected is tinted.'],
  ['bold', 'Round, strong lines, raised. Selected is inverted.'],
];
const components = ['base', 'button', 'switch', 'tabs', 'tip', 'disclosure', 'field', 'notice', 'loading', 'status', 'meter', 'layout']
  .map((n) => strip(read(join(LIB, `${n}.css`))))
  .join('\n');
const tokens = [
  strip(read(join(T, 'atoms.css'))),
  ...PRESETS.map((p) => scoped(join(T, `presets/${p}.css`), 'preset', p)),
  ...STYLES.map(([s]) => scoped(join(T, `styles/${s}.css`), 'style', s)),
  strip(read(join(T, 'cells.css'))),
].join('\n');

const icon = {
  filter: '<svg viewBox="0 0 16 16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M2 3h12M4.5 8h7M7 13h2"/></svg>',
  close: '<svg viewBox="0 0 10 10" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M1 1l8 8M9 1l-8 8"/></svg>',
  arrow: '<svg viewBox="0 0 10 6" aria-hidden="true" class="pc-disclosure__arrow" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square"><path d="M1 1l4 4 4-4"/></svg>',
};
const status = {
  active: '<rect x="0" y="0" width="10" height="10" fill="currentColor"/>',
  paused: '<rect x="1" y="0" width="3" height="10" fill="currentColor"/><rect x="6" y="0" width="3" height="10" fill="currentColor"/>',
  stopped: '<rect x="0.75" y="0.75" width="8.5" height="8.5" fill="none" stroke="currentColor" stroke-width="1.5"/>',
  error: '<rect x="0" y="0" width="10" height="10" fill="currentColor"/><path d="M5 2v4M5 7.5v1" stroke="var(--paper)" stroke-width="1.5"/>',
};
const dot = (state, label) =>
  `<span class="pc-status pc-tip-target" role="img" tabindex="0" data-state="${state}" aria-label="${label}" data-tip="${label}">${
    state === 'active' ? '<span class="pc-status__ring"></span>' : ''
  }<svg viewBox="0 0 10 10" aria-hidden="true">${status[state]}</svg></span>`;
const meter = (value, tone, label) =>
  `<svg viewBox="0 0 14 12" class="pc-meter" data-tone="${tone}" role="img" aria-label="${label}">${[
    [0, 5],
    [5, 8.5],
    [10, 12],
  ]
    .map(([x, h], i) => `<rect x="${x}" y="${12 - h}" width="4" height="${h}"${i < value ? ' data-on=""' : ''}/>`)
    .join('')}</svg>`;
const tabs = (id, items, cls, selectable) =>
  items
    .map(
      ([v, label], i) =>
        `<button type="button" role="tab" id="${id}-${v}" aria-controls="${id}-${v}-panel" aria-selected="${i === 0}" tabindex="${i === 0 ? 0 : -1}" data-state="${i === 0 ? 'active' : 'inactive'}" class="${cls}${selectable ? ' pc-selectable' : ''}">${
          selectable ? label : `<span class="pc-tabs__label"><span>${label}</span><span aria-hidden="true">${label}</span></span>`
        }</button>`,
    )
    .join('');

/** One column: every component, in one style. Ids are prefixed so the four columns never clash. */
function stage([style, about]) {
  const id = (s) => `${style}-${s}`;
  return `
<section class="stage" data-atoms data-style="${style}" aria-labelledby="${id('name')}">
  <header class="stage__head">
    <h2 id="${id('name')}" class="stage__name">${style}</h2>
    <p class="pc-hint">${about}</p>
  </header>
  <div class="stage__body">
    <div role="tablist" aria-label="Sections" class="pc-tabs__list">${tabs(id('t'), [['overview', 'Overview'], ['activity', 'Activity'], ['settings', 'Settings']], 'pc-tabs__trigger')}</div>

    <div class="row">
      <div role="tablist" aria-label="View" class="pc-segmented">${tabs(id('v'), [['list', 'List'], ['grid', 'Grid']], 'pc-segmented__trigger', true)}</div>
      <button type="button" class="pc-icon-button pc-selectable" aria-label="Only flagged rows" aria-pressed="false" data-tip="Only flagged rows">${icon.filter}</button>
      <span class="status-row">${dot('active', 'Importing')}${dot('paused', 'Paused')}${dot('stopped', 'Stopped')}${dot('error', 'Import failed')}</span>
    </div>

    <div class="row">
      <button type="button" class="pc-button" data-variant="primary" data-size="m">Save changes</button>
      <button type="button" class="pc-button" data-variant="secondary" data-size="m">Export CSV</button>
      <button type="button" class="pc-button" data-variant="quiet" data-size="m">Cancel</button>
    </div>
    <div class="row">
      <button type="button" class="pc-button" data-variant="secondary" data-size="s" aria-busy="true" disabled><span class="pc-dots" aria-hidden="true"><i></i><i></i><i></i></span>Saving</button>
      <button type="button" class="pc-button" data-variant="secondary" data-size="s" disabled>Publish</button>
    </div>

    <div role="status" class="pc-notice">
      <span class="pc-notice__text">New version available: 2.4</span>
      <span class="pc-notice__actions">
        <button type="button" class="pc-button" data-variant="quiet" data-size="s">Update</button>
        <button type="button" class="pc-icon-button" aria-label="Close" data-tip="Close">${icon.close}</button>
      </span>
    </div>

    <section class="pc-section">
      <h3 class="pc-section__title">Reports</h3>
      <div class="pc-section__body">
        <div class="pc-tile">
          <div class="tile-head"><strong>Quarterly costs</strong>${meter(3, 'danger', 'Risk: high')}</div>
          <p class="pc-hint">Updated 14 Oct · 3 sources</p>
        </div>
        <div class="pc-tile">
          <div class="tile-head"><strong>Supplier survey</strong>${meter(1, 'warning', 'Risk: low')}</div>
          <p class="pc-hint">Updated 2 Oct · 1 source</p>
        </div>
      </div>
    </section>

    <p class="pc-loading"><span class="pc-dots" aria-hidden="true"><i></i><i></i><i></i></span><span>Reading the file</span><span class="pc-loading__time">· 12 s</span></p>
    <div class="progress">
      <span>Upload</span>
      <span role="progressbar" aria-label="Upload" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" class="pc-progress"><span class="pc-progress__fill" style="inline-size: 64%"></span></span>
      <span class="num">64%</span>
    </div>

    <button type="button" role="switch" aria-checked="true" class="pc-switch"><span>Email me a weekly summary</span><span aria-hidden="true" class="pc-switch__track"><span class="pc-switch__thumb"></span></span></button>

    <div class="pc-field">
      <label for="${id('name-input')}" class="pc-field__label">Project name</label>
      <input id="${id('name-input')}" class="pc-input" value="Atlas" aria-invalid="true" aria-describedby="${id('name-hint')} ${id('name-error')}">
      <p id="${id('name-hint')}" class="pc-field__hint">Letters, numbers and spaces, up to 40 characters.</p>
      <p id="${id('name-error')}" class="pc-field__error">That name is taken. Try another one.</p>
    </div>

    <div>
      <button type="button" class="pc-disclosure__trigger" aria-expanded="false" aria-controls="${id('adv')}">Advanced options${icon.arrow}</button>
      <div id="${id('adv')}" class="pc-disclosure__content" hidden><p class="pc-hint">Keep raw files for 30 days after import.</p></div>
    </div>

    <div class="pc-empty">
      <p>No reports yet. They appear after the first import.</p>
      <button type="button" class="pc-button" data-variant="primary" data-size="s">Import data</button>
    </div>
  </div>
</section>`;
}

const html = `<title>Poiesis Components</title>
<meta name="claude:viewport-fit-sides" content="cover">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=DM+Sans:wght@400;600;700&family=Fraunces:opsz,wght@9..144,600&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600&display=swap">
<style>
${tokens}
${components}
/* The page around the components: the same cells (preset "tool", style "quiet" from :root). */
html, body { background: var(--paper); color: var(--ink); }
body {
  font-family: var(--font-body);
  font-size: var(--body-size);
  line-height: var(--body-leading);
  padding-block: var(--space-6) var(--space-8);
  padding-left: max(16px, env(safe-area-inset-left, 0px));
  padding-right: max(16px, env(safe-area-inset-right, 0px));
}
.page { display: grid; gap: var(--space-6); max-inline-size: 90rem; margin-inline: auto; }
.intro { display: grid; gap: var(--space-2); max-inline-size: var(--measure); }
.intro h1 { margin: 0; font-family: var(--font-display); font-size: var(--title-size); font-weight: var(--title-weight); line-height: var(--title-leading); text-wrap: balance; }
.intro p { margin: 0; color: var(--muted); }
.controls { display: flex; flex-wrap: wrap; gap: var(--space-5); align-items: end; }
.control { display: grid; gap: var(--space-1); }
.control > span { font-weight: var(--weight-strong); }
.stages { display: grid; grid-template-columns: repeat(auto-fit, minmax(17rem, 1fr)); gap: var(--space-4); align-items: start; }
.stage { min-inline-size: 0; display: grid; gap: var(--space-4); padding: var(--pad-m); background: var(--paper); color: var(--ink); font-family: var(--font-body); font-size: var(--body-size); line-height: var(--body-leading); outline: 1px solid var(--surface-3); }
.stage__head { display: grid; gap: var(--space-1); }
.stage__name { margin: 0; font-family: var(--font-display); font-size: var(--heading-size); font-weight: var(--heading-weight); line-height: var(--heading-leading); text-transform: capitalize; }
.stage__body { display: grid; gap: var(--space-4); }
.row { display: flex; flex-wrap: wrap; gap: var(--space-2); align-items: center; }
.status-row { display: inline-flex; gap: var(--space-3); margin-inline-start: auto; }
.tile-head { display: flex; justify-content: space-between; align-items: center; gap: var(--space-2); }
.progress { display: grid; grid-template-columns: auto 1fr auto; gap: var(--space-2); align-items: center; }
.num { font-variant-numeric: tabular-nums; color: var(--muted); }
.floating-tip { position: fixed; pointer-events: none; }
</style>

<main class="page">
  <header class="intro">
    <h1>Poiesis Components</h1>
    <p>The same components in four styles. The style sets corners, lines, shadows and how a selected thing looks; the preset sets type and density. Change either and every component follows, because they only use the cells from poiesis-ui.</p>
  </header>
  <div class="controls">
    <div class="control">
      <span id="preset-label">Preset</span>
      <div role="tablist" aria-labelledby="preset-label" class="pc-segmented" id="preset">${tabs('p', PRESETS.map((p) => [p, p[0].toUpperCase() + p.slice(1)]), 'pc-segmented__trigger', true)}</div>
    </div>
    <div class="control">
      <span id="theme-label">Theme</span>
      <div role="tablist" aria-labelledby="theme-label" class="pc-segmented" id="theme">${tabs('m', [['system', 'System'], ['light', 'Light'], ['dark', 'Dark']], 'pc-segmented__trigger', true)}</div>
    </div>
  </div>
  <div class="stages">${STYLES.map(stage).join('')}</div>
</main>
<div class="pc-tip floating-tip" role="tooltip" id="tip" hidden></div>

<script>
// Stand-ins for React and Radix in this static page: tabs, switches, toggles, disclosures, tooltips.
const stages = [...document.querySelectorAll('.stage')];
function selectTab(tab) {
  const list = tab.closest('[role="tablist"]');
  for (const t of list.querySelectorAll('[role="tab"]')) {
    const on = t === tab;
    t.setAttribute('aria-selected', on);
    t.dataset.state = on ? 'active' : 'inactive';
    t.tabIndex = on ? 0 : -1;
  }
  if (list.id === 'preset') stages.forEach((s) => (s.dataset.preset = tab.id.slice(2)));
  if (list.id === 'theme') {
    const v = tab.id.slice(2);
    stages.forEach((s) => (v === 'system' ? s.removeAttribute('data-theme') : (s.dataset.theme = v)));
  }
}
document.addEventListener('click', (e) => {
  const el = e.target.closest('button');
  if (!el || el.disabled) return;
  if (el.getAttribute('role') === 'tab') selectTab(el);
  else if (el.getAttribute('role') === 'switch') el.setAttribute('aria-checked', el.getAttribute('aria-checked') !== 'true');
  else if (el.hasAttribute('aria-pressed')) el.setAttribute('aria-pressed', el.getAttribute('aria-pressed') !== 'true');
  else if (el.hasAttribute('aria-expanded')) {
    const open = el.getAttribute('aria-expanded') !== 'true';
    el.setAttribute('aria-expanded', open);
    document.getElementById(el.getAttribute('aria-controls')).hidden = !open;
  }
});
document.addEventListener('keydown', (e) => {
  const tab = e.target.closest('[role="tab"]');
  if (tab && (e.key === 'ArrowRight' || e.key === 'ArrowLeft')) {
    const all = [...tab.closest('[role="tablist"]').querySelectorAll('[role="tab"]')];
    const next = all[(all.indexOf(tab) + (e.key === 'ArrowRight' ? 1 : all.length - 1)) % all.length];
    selectTab(next);
    next.focus();
    e.preventDefault();
  }
  if (e.key === 'Escape') hideTip();
});
const tip = document.getElementById('tip');
function showTip(el) {
  tip.textContent = el.dataset.tip;
  tip.hidden = false;
  const r = el.getBoundingClientRect();
  const w = tip.offsetWidth;
  tip.style.left = Math.max(8, Math.min(innerWidth - w - 8, r.left + r.width / 2 - w / 2)) + 'px';
  tip.style.top = Math.max(8, r.top - tip.offsetHeight - 6) + 'px';
}
function hideTip() { tip.hidden = true; }
for (const el of document.querySelectorAll('[data-tip]')) {
  el.addEventListener('mouseenter', () => showTip(el));
  el.addEventListener('mouseleave', hideTip);
  el.addEventListener('focus', () => showTip(el));
  el.addEventListener('blur', hideTip);
}
stages.forEach((s) => (s.dataset.preset = 'tool'));
</script>
`;

const out = resolve(opt('out') ?? 'poiesis-components-preview.html');
writeFileSync(out, html);
console.log(`wrote ${out} (tokens from ${T})`);
