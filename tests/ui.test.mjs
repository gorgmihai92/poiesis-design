// Tests for poiesis-ui 0.12.1: which files the audit stamp covers, so that the publish gate (P1) sees every UI
// change and no change that is only logic. Node's own test runner, no packages, no network:
//   node --test tests/ui.test.mjs

import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { hashUi, writeJson } from '../plugins/poiesis-ui/skills/ui/scripts/lib/project.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const GATE = join(ROOT, 'plugins/poiesis-ui/hooks/publish-gate.mjs');

// A project opted in to the gate, with UI in src/ and the files around it that a project usually has.
function project(uiPaths = ['src']) {
  const dir = mkdtempSync(join(tmpdir(), 'ui-test-'));
  const put = (rel, text) => { mkdirSync(dirname(join(dir, rel)), { recursive: true }); writeFileSync(join(dir, rel), text); };
  put('src/styles/app.css', '.a { color: var(--ink); }\n');
  // The library poiesis-components' add.mjs copies in: elements, and the file that loads them.
  put('src/poiesis/patterns/series.js', 'class PoSeries extends HTMLElement {}\ncustomElements.define("po-series", PoSeries);\n');
  put('src/poiesis/poiesis-components.js', 'import "./patterns/series.js"\n');
  put('src/components/Button.js', 'import { useState } from "react";\nexport const Button = () => null;\n');
  put('src/components/index.js', 'export { Button } from "./Button";\n');
  put('src/theme/tokens.ts', 'export const accent = "var(--info)";\n');
  put('src/lib/db.ts', 'export const query = (sql: string) => sql;\n');
  put('src/app/api/route.ts', 'import { query } from "../../lib/db";\nexport const GET = () => query("select 1");\n');
  put('src/stores/cart.js', 'export const cart = [];\n');
  put('src/components/Button.test.js', 'import { Button } from "./Button";\ntest("button", () => {});\n');
  put('src/types.d.ts', 'export type A = string;\n');
  put('src/node_modules/lib/index.js', 'import "./style.css";\n');
  put('src/dist/bundle.js', 'customElements.define("po-x", class {});\n');
  put('vite.config.js', 'export default {};\n');
  for (const tool of ['tailwind', 'stitches', 'panda', 'uno', 'tamagui']) put(`${tool}.config.ts`, 'export default { theme: {} };\n');
  writeJson(dir, 'config.json', { uiPaths });
  return { dir, put };
}
const stamp = (dir, uiPaths) => writeJson(dir, 'audit.json', { result: 'pass', date: '2026-11-23', hash: hashUi(dir, uiPaths).hash, must: 0 });
const gate = (dir) => spawnSync(process.execPath, [GATE], { input: JSON.stringify({ cwd: dir, tool_input: { command: 'git push' } }), encoding: 'utf8' });
const changes = (dir, rel, text, uiPaths) => {
  const before = hashUi(dir, uiPaths).hash;
  writeFileSync(join(dir, rel), text);
  return hashUi(dir, uiPaths).hash !== before;
};

test('a changed .js component changes the hash, and the gate holds the push back', () => {
  const { dir, put } = project();
  stamp(dir);
  assert.equal(gate(dir).status, 0, 'a current pass lets the push through');
  put('src/components/Button.js', 'import { useState } from "react";\nexport const Button = () => "changed";\n');
  const r = gate(dir);
  assert.equal(r.status, 2);
  assert.match(r.stderr, /the UI changed since the last audit/);
});

test('a script counts when it defines an element, imports a stylesheet or a UI library, uses a custom property or a po- class', () => {
  const { dir, put } = project();
  assert.ok(changes(dir, 'src/poiesis/patterns/series.js', 'class PoSeries extends HTMLElement { x = 1 }\ncustomElements.define("po-series", PoSeries);\n'), 'a po-* element');
  assert.ok(changes(dir, 'src/theme/tokens.ts', 'export const accent = "var(--danger)";\n'), 'a custom property');
  for (const [ext, body] of [['mjs', 'import "./card.css";'], ['cjs', 'require("styled-components");'], ['mts', 'el.className = "po-card";'], ['cts', 'import x from "lit";'], ['ts', 'export const v = "var( --space)";']]) {
    put(`src/widgets/Card.${ext}`, `${body}\n`);
    assert.ok(changes(dir, `src/widgets/Card.${ext}`, `${body}\n// changed\n`), ext);
  }
});

test('a script that imports one that counts counts too: the library\'s loader and a barrel file', () => {
  const { dir } = project();
  assert.ok(changes(dir, 'src/poiesis/poiesis-components.js', 'import "./patterns/series.js"\nimport "./patterns/pager.js"\n'));
  assert.ok(changes(dir, 'src/components/index.js', 'export { Button } from "./Button";\nexport const n = 1;\n'));
});

test('logic-only scripts do not count: an API route, the database, a store; the gate lets the push through', () => {
  const { dir } = project();
  stamp(dir);
  assert.equal(changes(dir, 'src/lib/db.ts', 'export const query = (sql: string) => sql.trim();\n'), false);
  assert.equal(changes(dir, 'src/app/api/route.ts', 'import { query } from "../../lib/db";\nexport const GET = () => query("select 2");\n'), false);
  assert.equal(changes(dir, 'src/stores/cart.js', 'export const cart = [1];\n'), false);
  assert.equal(gate(dir).status, 0);
});

test('node_modules, build output, tests, type declarations and tool configs are not in the hash', () => {
  const { dir } = project(['.']);
  stamp(dir, ['.']);
  for (const [rel, text] of [
    ['src/node_modules/lib/index.js', 'import "./other.css";\n'],
    ['src/dist/bundle.js', 'customElements.define("po-y", class {});\n'],
    ['src/components/Button.test.js', 'import { Button } from "./Button";\ntest("again", () => {});\n'],
    ['src/types.d.ts', 'export type A = number;\n'],
    ['vite.config.js', 'import "./x.css";\nexport default { server: { port: 3000 } };\n'],
  ]) assert.equal(changes(dir, rel, text, ['.']), false, rel);
  assert.equal(gate(dir).status, 0, 'a changed vite.config.js does not hold the push back');
});

test('the configs that hold a theme are in the hash: Tailwind, Stitches, Panda, UnoCSS, Tamagui', () => {
  const { dir } = project(['.']);
  for (const tool of ['tailwind', 'stitches', 'panda', 'uno', 'tamagui']) {
    assert.ok(changes(dir, `${tool}.config.ts`, 'export default { theme: { extend: {} } };\n', ['.']), tool);
  }
});

test('the files counted are the UI files and nothing else', () => {
  const { dir } = project(['.']);
  // app.css, series.js, poiesis-components.js, Button.js, index.js, tokens.ts and the five theme configs.
  assert.equal(hashUi(dir, ['.']).files, 11);
  assert.equal(hashUi(dir).files, 6);
});

test('the version agrees in plugin.json, marketplace.json and the changelog', () => {
  const market = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  assert.equal(JSON.parse(readFileSync(join(ROOT, 'plugins/poiesis-ui/.claude-plugin/plugin.json'), 'utf8')).version, '0.12.1');
  assert.equal(market.plugins.find((p) => p.name === 'poiesis-ui')?.version, '0.12.1');
  assert.match(readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8'), /^## 0\.12\.1 \(poiesis-ui\)/m);
});
