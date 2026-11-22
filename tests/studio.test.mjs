// Tests for poiesis-studio 0.1.0 and the four patterns of poiesis-components 0.14.0. Node's own test runner, no
// packages, no network:  node --test tests/studio.test.mjs
// The tests that rebuild the lab's two recorded pages need the notebook (POIESIS_LAB, else ~/Poiesis Lab) and are
// skipped, saying so, where it is absent.

import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { HAVE_NOTEBOOK, makeProjects, NOTEBOOK } from './fixture-pages.mjs';
import { compare } from '../plugins/poiesis-studio/skills/report/scripts/report.mjs';
import { readNote, readStamps, sealOf, textSha256, verify } from '../plugins/poiesis-studio/skills/report/scripts/lib/stamp.mjs';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const STUDIO = join(ROOT, 'plugins/poiesis-studio');
const EXPLORE = join(STUDIO, 'skills/explore/scripts/explore.mjs');
const REPORT = join(STUDIO, 'skills/report/scripts/report.mjs');
const ADD = join(ROOT, 'plugins/poiesis-components/skills/components/scripts/add.mjs');
const FIX = join(ROOT, 'tests/fixtures');
const scratch = () => mkdtempSync(join(tmpdir(), 'studio-test-'));
const run = (script, args, cwd) => spawnSync(process.execPath, [script, ...args], { cwd, encoding: 'utf8' });
const filesUnder = (dir) => readdirSync(dir, { recursive: true, withFileTypes: true }).filter((e) => e.isFile()).map((e) => relative(dir, join(e.parentPath ?? e.path, e.name)));

// ---- The challenge record ------------------------------------------------------------------------------------

test('the three test vectors of the record format give the same hash and seal', () => {
  for (const v of JSON.parse(readFileSync(join(FIX, 'stamp/vectors.json'), 'utf8')).vectors) {
    assert.equal(textSha256(v.text), v.stamp.text_sha256, v.id);
    assert.equal(sealOf(v.id, v.verdict, v.date, v.stamp.text_sha256), v.stamp.seal, v.id);
  }
});

test('the three conclusions of the gate example show kept, dropped and not challenged', () => {
  const note = readNote(readFileSync(join(FIX, 'gate/insights/2026-11-17-gate-example.md'), 'utf8'));
  const stamps = readStamps(join(FIX, 'gate/insights/challenge-stamps.jsonl'));
  const shown = Object.fromEntries(note.map((c) => [c.id, verify({ id: c.id, text: c.text, shown: c.challenge }, stamps)]));
  assert.deepEqual([shown['IN-001'].status, shown['IN-001'].verdict], ['ok', 'kept']);
  assert.deepEqual([shown['IN-002'].status, shown['IN-002'].verdict], ['ok', 'dropped']);
  assert.deepEqual([shown['IN-003'].status, shown['IN-003'].verdict], ['no stamp', null]);
});

test('a retyped label, a changed sentence, an altered record and a damaged file are each caught', () => {
  const dir = scratch();
  const note = readFileSync(join(FIX, 'gate/insights/2026-11-17-gate-example.md'), 'utf8');
  const lines = readFileSync(join(FIX, 'gate/insights/challenge-stamps.jsonl'), 'utf8');
  const stamps = (text) => { writeFileSync(join(dir, 's.jsonl'), text); return readStamps(join(dir, 's.jsonl')); };
  const first = readNote(note)[0];
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: 'weakened · retyped' }, stamps(lines)).status, 'verdict retyped');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: 'weakened' }, stamps(lines)).verdict, 'kept', 'the record wins');
  assert.equal(verify({ id: 'IN-001', text: `${first.text} More.`, shown: null }, stamps(lines)).status, 'text changed');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: null }, stamps(lines.replace('"kept"', '"weakened"'))).status, 'stamp altered');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: null }, stamps(`${lines}<<<<<<< HEAD\n`)).status, 'file damaged');
  assert.equal(readNote(`${note}\n### Another\n\n- **Id:** IN-001\n`).filter((c) => c.id === 'IN-001').every((c) => c.twice), true);
  // The merged reference's stricter label rule: exactly one verdict word, and no negation.
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: 'weakened → kept after review' }, stamps(lines)).status, 'verdict retyped');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: 'not challenged' }, stamps(lines)).status, 'verdict retyped');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: '**Kept** · with caveats' }, stamps(lines)).status, 'ok');
  assert.equal(readStamps(join(dir, 's.jsonl')).damaged, false);
  assert.equal(stamps(lines.replace('"IN-001"', '"IN 001"')).damaged, true, 'an id not of the form is a damaged line');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: null }, stamps(lines.replace('2026-11-17', '2026-99-99'))).status, 'stamp altered', 'an impossible date');
  assert.equal(verify({ id: 'IN-009', text: 'Anything.', shown: 'kept' }, stamps(lines)).status, 'no stamp', 'a typed label with no record');
  assert.equal(verify({ id: 'IN-001', text: first.text, shown: 'ékept' }, stamps(lines)).status, 'verdict retyped', 'a word inside another word is not a verdict');
  const odd = readNote('## A line\u2028with a separator\n\n- **Id:** Z-1\n- **Challenge:** kept\u2028done\n\n## Q\n\n- **Id:** QN-001\n');
  assert.deepEqual(odd.map((o) => [o.id, o.text, o.challenge]), [['Z-1', 'A line\u2028with a separator', 'kept\u2028done'], ['QN-001', 'Q', null]]);
});

// ---- The report ---------------------------------------------------------------------------------------------

test('a report over the gate example shows each verdict from its record, and the page holds no typed verdict', () => {
  const out = join(scratch(), 'gate.html');
  const r = run(REPORT, ['build', join(FIX, 'gate/design/showroom/gate/report.json'), '--root', join(FIX, 'gate'), '--out', out, '--date', '2026-11-22'], ROOT);
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(out, 'utf8');
  assert.match(html, /<span class="po-verdict" data-state="kept">Kept<\/span>/);
  assert.match(html, /<span class="po-verdict" data-state="dropped">Dropped<\/span>/);
  assert.match(html, /<span class="po-verdict">Not challenged<\/span>/);
  const blocks = JSON.parse(readFileSync(join(FIX, 'gate/design/showroom/gate/report.json'), 'utf8')).sections.flatMap((s) => s.blocks);
  assert.deepEqual(blocks.map((b) => Object.keys(b).sort()), [['from', 'type']], 'the report names the note and nothing about its verdicts');
});

test('on the page, no record and a changed sentence both show as not challenged, with the reason', () => {
  const dir = scratch();
  mkdirSync(join(dir, 'insights'), { recursive: true });
  const note = readFileSync(join(FIX, 'gate/insights/2026-11-17-gate-example.md'), 'utf8').replace('Machines, AI and robots is', 'Machines, AI and robots are');
  writeFileSync(join(dir, 'insights/2026-11-17-gate-example.md'), note);
  writeFileSync(join(dir, 'insights/challenge-stamps.jsonl'), readFileSync(join(FIX, 'gate/insights/challenge-stamps.jsonl')));
  writeFileSync(join(dir, 'report.json'), readFileSync(join(FIX, 'gate/design/showroom/gate/report.json')));
  const r = run(REPORT, ['build', 'report.json', '--root', '.', '--out', 'page.html', '--date', '2026-11-22'], dir);
  assert.equal(r.status, 0, r.stderr);
  const html = readFileSync(join(dir, 'page.html'), 'utf8');
  const item = (id) => html.match(new RegExp(`<li id="conclusion-${id}">([\\s\\S]*?)</li>`))[1];
  assert.match(item('IN-001'), /<span class="po-verdict">Not challenged<\/span>/);
  assert.match(item('IN-001'), /the sentence changed after it was challenged \(kept, 2026-11-17\)/);
  assert.match(item('IN-002'), /data-state="dropped">Dropped</);
  assert.match(item('IN-003'), /<span class="po-verdict">Not challenged<\/span>/);
  assert.match(item('IN-003'), /No challenge is recorded for it\./);
});

test('a report refuses to build when a file it points to is missing, and writes nothing', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'report.json'), JSON.stringify({ title: 't', sections: [{ heading: 'h', blocks: [{ type: 'table', from: 'nowhere.json', columns: [{ field: 'a' }] }] }], not_checked: ['x'] }));
  const r = run(REPORT, ['build', 'report.json', '--root', '.'], dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /nowhere\.json: no such file/);
  assert.equal(existsSync(join(dir, 'report.html')), false);
});

test('a report with no "Not checked" lines is refused', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'report.json'), JSON.stringify({ title: 't', sections: [] }));
  const r = run(REPORT, ['collect', 'report.json'], dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /Not checked/);
});

test('a report reads no file outside its project', () => {
  const dir = scratch();
  writeFileSync(join(dir, 'report.json'), JSON.stringify({ title: 't', sections: [{ heading: 'h', blocks: [{ type: 'table', from: '../../etc/hosts', columns: [{ field: 'a' }] }] }], not_checked: ['x'] }));
  const r = run(REPORT, ['collect', 'report.json'], dir);
  assert.equal(r.status, 1);
  assert.match(r.stderr, /only files inside its project/);
});

// ---- The lab's two recorded pages, rebuilt --------------------------------------------------------------------

const fixtures = { skip: HAVE_NOTEBOOK ? false : `no notebook at ${NOTEBOOK}` };

test('the trend scan is rebuilt: every series and number the same, and c6 shows the record, not the retyped label', fixtures, () => {
  const p = makeProjects(scratch())['trend-scan'];
  const expected = (w) => JSON.parse(readFileSync(join(p, `expected-${w}.json`), 'utf8'));
  for (const which of ['published', 'corrected']) {
    const r = run(REPORT, ['build', `design/showroom/${which}/report.json`, '--root', '.', '--date', '2026-11-22'], p);
    assert.equal(r.status, 0, r.stderr);
  }
  const page = (w) => readFileSync(join(p, `design/showroom/${w}/report.html`), 'utf8');
  const pub = compare(page('published'), expected('published'));
  assert.equal(pub.series.compared, 255);
  assert.equal(pub.series.same, pub.series.compared);
  assert.equal(pub.numbers.compared, 188);
  assert.equal(pub.numbers.same, pub.numbers.compared);
  assert.equal(pub.verdicts.compared, 6);
  assert.equal(pub.verdicts.lines.length, 1, 'only the label that was retyped differs');
  assert.match(pub.verdicts.lines[0], /^c6: the page shows "kept"; the report shows "weakened"/);
  const html = readFileSync(join(p, 'design/showroom/published/report.html'), 'utf8');
  assert.match(html, /The file shows “kept”; the challenge recorded weakened/);
  const cor = compare(page('corrected'), expected('corrected'));
  assert.equal(cor.differ, 0);
  // The comparison reads what the page renders: a broken page fails it.
  const broken = [
    [page('published').replace('data-state="weakened">Weakened</span> <span class="report-id">c6', 'data-state="weakened">Kept</span> <span class="report-id">c6'), 'a label that does not match its mark'],
    [page('published').replace(/(<td data-type="number" data-value="38\.6"[^>]*>)38\.6</, '$199.9<'), 'a number written wrong'],
    [page('published').replace(/(<td data-value="113\.6)/, '<td data-value="1">1</td>$1'), 'a series row with a cell too many'],
  ];
  const found = (r) => [...r.series.lines, ...r.numbers.lines, ...r.verdicts.lines, ...r.faults];
  for (const [html, what] of broken) {
    assert.notEqual(html, page('published'), `the mutation for ${what} applied`);
    const extra = found(compare(html, expected('published'))).filter((l) => !found(pub).includes(l));
    assert.ok(extra.length > 0, `${what} is caught`);
  }
});

test('the responsibility map is rebuilt: every series, number and verdict label the same', fixtures, () => {
  const p = makeProjects(scratch())['responsibility-map'];
  const r = run(REPORT, ['build', 'design/showroom/map/report.json', '--root', '.', '--date', '2026-11-22'], p);
  assert.equal(r.status, 0, r.stderr);
  const result = compare(readFileSync(join(p, 'design/showroom/map/report.html'), 'utf8'), JSON.parse(readFileSync(join(p, 'expected.json'), 'utf8')));
  assert.equal(result.differ, 0, JSON.stringify(result, null, 1));
  assert.equal(result.verdicts.compared, 27);
  assert.equal(result.names.length, 3, 'three series are named differently in the data than on the page');
});

test('the rebuilt pages read only copies: nothing in the notebook was written', fixtures, () => {
  const before = filesUnder(join(NOTEBOOK, 'fixtures')).sort();
  makeProjects(scratch());
  assert.deepEqual(filesUnder(join(NOTEBOOK, 'fixtures')).sort(), before);
});

// ---- Exploration: no design rule ------------------------------------------------------------------------------

test('an exploration writes only under design/lab/ and never makes .poiesis-design/', () => {
  const dir = scratch();
  const r = run(EXPLORE, ['new', 'How else could confirming a delete work?', '--date', '2026-11-22'], dir);
  assert.equal(r.status, 0, r.stderr);
  const files = filesUnder(dir);
  assert.equal(files.length, 10);
  assert.ok(files.every((f) => f.startsWith('design/lab/2026-11-22-how-else-could-confirming-a-delete-work/')), files.join('\n'));
  assert.equal(files.some((f) => f.includes('.poiesis-design')), false);
  assert.deepEqual(files.filter((f) => /SK-\d+\.html$/.test(f)).map((f) => f.split('/').pop()), ['SK-001.html', 'SK-002.html', 'SK-003.html', 'SK-004.html', 'SK-005.html', 'SK-006.html']);
  const card = run(EXPLORE, ['card', 'design/lab/2026-11-22-how-else-could-confirming-a-delete-work', '--name', 'Undo as the confirmation', '--from', 'SK-002,SK-005'], dir);
  assert.equal(card.status, 0, card.stderr);
  assert.ok(existsSync(join(dir, 'design/patterns/PT-001-undo-as-the-confirmation.md')));
  assert.match(readFileSync(join(dir, 'design/patterns/PT-001-undo-as-the-confirmation.md'), 'utf8'), /- \*\*Decision:\*\* none yet/);
  assert.equal(filesUnder(dir).some((f) => f.includes('.poiesis-design')), false);
});

test('the exploration check finds starting files, a missing mark and a .poiesis-design folder', () => {
  const dir = scratch();
  run(EXPLORE, ['new', 'Q', '--variants', '3', '--date', '2026-11-22'], dir);
  const lab = 'design/lab/2026-11-22-q';
  let r = run(EXPLORE, ['check', lab], dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /SK-001\.html: still the starting file/);
  const start = Object.fromEntries(['SK-001', 'SK-002', 'SK-003'].map((id) => [id, readFileSync(join(dir, lab, `${id}.html`), 'utf8')]));
  const sketch = (id, mark = true) => start[id]
    .replace(/<main>[\s\S]*?<\/main>/, '<main><button type="button">Delete</button></main>')
    .replace(mark ? /$^/ : /<p class="prototype-mark">[^<]*<\/p>/, '');
  for (const id of ['SK-001', 'SK-002', 'SK-003']) writeFileSync(join(dir, lab, `${id}.html`), sketch(id, id !== 'SK-003'));
  r = run(EXPLORE, ['check', lab], dir);
  assert.match(r.stdout, /SK-003\.html: does not say "Prototype · SK-003"/);
  writeFileSync(join(dir, lab, 'SK-003.html'), sketch('SK-003'));
  r = run(EXPLORE, ['check', lab], dir);
  assert.equal(r.status, 0, r.stdout);
  mkdirSync(join(dir, '.poiesis-design'));
  r = run(EXPLORE, ['check', lab], dir);
  assert.equal(r.status, 1);
  assert.match(r.stdout, /\.poiesis-design exists/);
});

test('ids are never used twice, even when only a note names one', () => {
  const dir = scratch();
  mkdirSync(join(dir, 'design/patterns'), { recursive: true });
  writeFileSync(join(dir, 'design/patterns/old.md'), '- **From:** SK-014, PT-003\n');
  assert.equal(run(EXPLORE, ['next', 'SK'], dir).stdout.trim(), 'SK-015');
  assert.equal(run(EXPLORE, ['next', 'PT'], dir).stdout.trim(), 'PT-004');
});

test('poiesis-studio has no agent, no hook and no dependency, and its scripts start no audit', () => {
  const manifest = JSON.parse(readFileSync(join(STUDIO, '.claude-plugin/plugin.json'), 'utf8'));
  assert.equal('dependencies' in manifest, false);
  assert.equal(existsSync(join(STUDIO, 'agents')), false);
  assert.equal(existsSync(join(STUDIO, 'hooks')), false);
  // Where the skill's own words name a rule check, they say not to run it.
  const skill = readFileSync(join(STUDIO, 'skills/explore/SKILL.md'), 'utf8').replace(/\n(?!\s*\n|\s*(?:[-*|]|\d+\.)\s)\s*/g, ' ');
  for (const sentence of skill.split(/(?<=[.:])\s+|\n/)) {
    if (/ui-auditor|ux-tester|copy-reviewer|init\.mjs|scan\.mjs|resolve\.mjs|\.poiesis-design/.test(sentence)) {
      assert.match(sentence, /\b(do not|never) (run|use|read|create|make|load)\b|\bno `\.poiesis-design\/`|\blooks for a `\.poiesis-design\/`|\bnever create a `\.poiesis-design\/`|\bnot read their/i, `explore/SKILL.md names a check without saying not to run it: ${sentence.trim()}`);
    }
  }
  const scripts = filesUnder(STUDIO).filter((f) => f.endsWith('.mjs'));
  for (const f of scripts) {
    const text = readFileSync(join(STUDIO, f), 'utf8');
    for (const word of ['init.mjs', 'scan.mjs', 'resolve.mjs', 'audit-stamp', 'ui-auditor', 'ux-tester', 'copy-reviewer', 'publish-gate']) {
      assert.equal(text.includes(word), false, `${f} names ${word}`);
    }
    assert.doesNotMatch(text, /mkdirSync\([^)]*poiesis-design/, `${f} makes a .poiesis-design folder`);
  }
});

// ---- The four patterns in poiesis-components ----------------------------------------------------------------

test('each of the four patterns is in PARTS, in the stylesheet, in the catalog, and copies into an empty project', () => {
  const add = readFileSync(ADD, 'utf8');
  const css = readFileSync(join(ROOT, 'plugins/poiesis-components/skills/components/library/poiesis-components.css'), 'utf8');
  const catalog = readFileSync(join(ROOT, 'plugins/poiesis-components/skills/components/catalog.md'), 'utf8');
  const parts = { verdict: [], evidence: [], series: ['collapsible'], 'dot-map': ['collapsible', 'verdict'] };
  const names = { verdict: 'Verdict', evidence: 'Evidence', series: 'Series', 'dot-map': 'Dot map' };
  for (const [name, needs] of Object.entries(parts)) {
    assert.match(add, new RegExp(`\\n  '?${name}'?: \\[${needs.map((n) => `'${n}'`).join(', ')}\\],`), `PARTS ${name}`);
    assert.match(css, new RegExp(`@import "./patterns/${name}.css";`));
    assert.match(catalog, new RegExp(`^\\| ${names[name]} \\|.*\\| patterns/${name}\\.css`, 'm'));
    const dir = scratch();
    execFileSync(process.execPath, [ADD, name, '--to', 'lib'], { cwd: dir });
    const copied = filesUnder(join(dir, 'lib'));
    assert.ok(copied.includes(`patterns/${name}.css`), copied.join(' '));
    for (const n of needs) assert.ok(copied.some((f) => f.endsWith(`/${n}.css`)), `${name} brings ${n}`);
    assert.match(readFileSync(join(dir, 'lib/poiesis-components.css'), 'utf8'), new RegExp(`patterns/${name}\\.css`));
    if (existsSync(join(ROOT, 'plugins/poiesis-components/skills/components/library/patterns', `${name}.js`))) {
      assert.match(readFileSync(join(dir, 'lib/poiesis-components.js'), 'utf8'), new RegExp(`patterns/${name}\\.js`));
    }
  }
});

test('the patterns use cells only: no literal colors or sizes beyond hairlines', () => {
  const out = execFileSync(process.execPath, [join(ROOT, 'plugins/poiesis-ui/skills/ui/scripts/scan.mjs'), ...['verdict', 'evidence', 'series', 'dot-map'].map((n) => join(ROOT, 'plugins/poiesis-components/skills/components/library/patterns', `${n}.css`))], { encoding: 'utf8' });
  const hits = out.split('\n').filter((l) => /^\s+\S+\.css:\d+/.test(l));
  assert.deepEqual(hits.map((l) => l.trim()), ['series.css:116  border: 1px'], 'only the 1px edge of a point, which rule G1 allows');
});

test('the versions agree in plugin.json, marketplace.json and the changelog', () => {
  const market = JSON.parse(readFileSync(join(ROOT, '.claude-plugin/marketplace.json'), 'utf8'));
  const log = readFileSync(join(ROOT, 'CHANGELOG.md'), 'utf8');
  for (const [name, version] of [['poiesis-studio', '0.2.0'], ['poiesis-components', '0.14.0']]) {
    assert.equal(JSON.parse(readFileSync(join(ROOT, 'plugins', name, '.claude-plugin/plugin.json'), 'utf8')).version, version);
    assert.equal(market.plugins.find((p) => p.name === name)?.version, version);
    assert.match(log, new RegExp(`^## ${version.replaceAll('.', '\\.')} \\(${name}\\)`, 'm'));
  }
});

// Properties (poiesis-studio 0.2.0): a block of Obsidian properties at the top of what explore writes, as a copy
// for Obsidian's views. The label lines stay the record, and every script reads those.
const blockOf = (text) => {
  const lines = text.split('\n');
  if (lines[0] !== '---' || !lines.slice(1).includes('---')) return [];
  return lines.slice(1, lines.indexOf('---', 1));
};
const keysOf = (block) => block.filter((l) => !l.startsWith(' ')).map((l) => l.split(':')[0]);
const blockRules = (name, block) => {
  for (const line of block) {
    assert.ok(!line.trimStart().startsWith('#'), `${name}: ${line}`);
    if (line.startsWith(' ')) assert.match(line, /^ {2}- "(?:\[\[[^\]|]+\]\]|[^"[\]]*)"$/, `${name}: ${line}`);
    else assert.match(line, /^[a-z]+:(?: (?:"(?:[^"\\]|\\.)*"|\[\]|<[^:"]*>|\{\{\w+\}\}|[a-z-]+|[0-9]{4}-[0-9]{2}-[0-9]{2}))?(?:\{\{\w+\}\})?$/, `${name}: ${line}`);
  }
};

test('the templates of an exploration, a pattern card and a session start with a properties block', () => {
  const T = join(STUDIO, 'skills/explore/templates');
  const want = {
    'exploration.md': ['type', 'plugin', 'date', 'topic'],
    'pattern-card.md': ['type', 'plugin', 'date', 'topic', 'id', 'status', 'from'],
    'session.md': ['type', 'plugin', 'date', 'topic'],
  };
  for (const [name, keys] of Object.entries(want)) {
    const block = blockOf(readFileSync(join(T, name), 'utf8'));
    assert.deepEqual(keysOf(block), keys, name);
    assert.ok(block.includes('plugin: poiesis-studio'), name);
    blockRules(name, block);
  }
});

test('explore writes the block with the question quoted and the card\'s sources as links, and still reads its notes', () => {
  const dir = scratch();
  const question = 'How "else" could: a delete # work?';
  assert.equal(run(EXPLORE, ['new', question, '--variants', '3', '--date', '2026-11-22'], dir).status, 0);
  const lab = 'design/lab/2026-11-22-how-else-could-a-delete-work';
  const notes = readFileSync(join(dir, lab, 'notes.md'), 'utf8');
  assert.deepEqual(blockOf(notes), ['type: exploration', 'plugin: poiesis-studio', 'date: 2026-11-22', `topic: ${JSON.stringify(question)}`]);
  blockRules('notes.md', blockOf(notes));
  const card = run(EXPLORE, ['card', lab, '--name', 'Undo: the "confirmation"', '--from', 'SK-002,SK-003,@key2020'], dir);
  assert.equal(card.status, 0, card.stderr);
  const text = readFileSync(join(dir, 'design/patterns/PT-001-undo-the-confirmation.md'), 'utf8');
  const block = blockOf(text);
  assert.deepEqual(block.slice(4), ['id: "PT-001"', 'status: "none yet"', 'from:', '  - "[[SK-002]]"', '  - "[[SK-003]]"', '  - "@key2020"']);
  blockRules('pattern card', block);
  assert.match(text, /^- \*\*From:\*\* SK-002, SK-003, @key2020$/m);
  assert.match(text, /^- \*\*Id:\*\* PT-001$/m);
  // The board still takes the question from the title, not from the block.
  assert.match(readFileSync(join(dir, lab, 'index.html'), 'utf8'), /How &quot;else&quot; could: a delete # work\?|How "else" could: a delete # work\?/);
  assert.equal(run(EXPLORE, ['next', 'PT'], dir).stdout.trim(), 'PT-002');
});

test('the report reads conclusions and their records the same with a properties block on the note', () => {
  const plain = readFileSync(join(FIX, 'gate/insights/2026-11-17-gate-example.md'), 'utf8');
  const withBlock = '---\ntype: insight-report\nplugin: poiesis-insight\ndate: 2026-11-17\ntopic: "gate example"\n---\n' + plain;
  const stamps = readStamps(join(FIX, 'gate/insights/challenge-stamps.jsonl'));
  const shown = (text) => readNote(text).map((c) => [c.id, c.text, verify({ id: c.id, text: c.text, shown: c.challenge }, stamps)]);
  assert.deepEqual(shown(withBlock), shown(plain));
  assert.deepEqual(shown(withBlock).map(([id, , v]) => [id, v.verdict]), [['IN-001', 'kept'], ['IN-002', 'dropped'], ['IN-003', null]]);
});
