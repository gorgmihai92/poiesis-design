// The lab's two recorded pages, read by script: what each page shows (its series, its numbers, its verdict
// labels) and a project folder from which a report can rebuild it. Used by the tests; also a command:
//
//   node tests/fixture-pages.mjs <out folder>      writes <out>/trend-scan/ and <out>/responsibility-map/
//
// Each project folder holds copies of the page's data files (never the notebook's own), the challenge records
// in insights/challenge-stamps.jsonl, the report's own file, and expected.json: what the published page shows.
// The notebook is found at POIESIS_LAB or ~/Poiesis Lab. Nothing in it is written.

import { copyFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const HERE = dirname(fileURLToPath(import.meta.url));
export const NOTEBOOK = resolve(process.env.POIESIS_LAB ?? join(homedir(), 'Poiesis Lab'));
export const HAVE_NOTEBOOK = existsSync(join(NOTEBOOK, 'fixtures/trend-scan/page.html'));
const FIX = join(NOTEBOOK, 'fixtures');
const json = (p) => JSON.parse(readFileSync(p, 'utf8'));
const num = (v) => (typeof v === 'number' && Number.isFinite(v) ? v : null);

// ---- Trend scan -------------------------------------------------------------------------------------------
// The page draws everything from its data files with small functions, dash.draw('<name>', …), each reading one
// source with dash.data('<source>') and fields r.<field>. What the page shows is read from those functions, so
// the list of fields is the page's, not chosen here. The trend chart shows one field at a time, picked in a
// select: its options are the series.

const KEYS = { checks: 'area_id', synbio: 'country', corpus: 'year', challenge: 'id' };

// `which`: the verdict file the page reads, published (the page as it was) or corrected (the label fixed).
export function trendScanShows(which = 'published', page = readFileSync(join(FIX, 'trend-scan/page.html'), 'utf8')) {
  const script = page.slice(page.lastIndexOf('<script>'));
  const draws = [...script.matchAll(/dash\.draw\('([\w-]+)',[\s\S]*?(?=\ndash\.draw\(|<\/script>)/g)].map((m) => ({
    name: m[1], source: m[0].match(/dash\.data\('(\w+)'\)/)?.[1] ?? null, fields: [...new Set([...m[0].matchAll(/\br\.([a-z_0-9]+)/g)].map((f) => f[1]))],
  })).filter((d) => d.source);
  const measures = [...page.matchAll(/<option value="(\w+)"/g)].map((m) => m[1]);
  const data = (source) => json(join(FIX, 'trend-scan', `${source === 'challenge' ? `challenge.${which}` : source}.json`)).rows;
  const expected = { page: `fixtures/trend-scan/page.html, with challenge.${which}.json`, series: {}, numbers: {}, verdicts: {} };
  for (const d of draws) {
    const rows = data(d.source);
    if (d.name === 'trend') {
      for (const m of measures) for (const r of rows) (expected.series[`${m}:${r.area_id}`] ??= {})[String(r.year)] = r[m];
      continue;
    }
    if (d.source === 'challenge') { for (const r of rows) expected.verdicts[r.id] = r.verdict; continue; }
    for (const r of rows) {
      const values = d.fields.filter((f) => f in r).map((f) => num(r[f])).filter((v) => v !== null && !(d.source === 'corpus' && v === r.year));
      if (!values.length) continue;
      const list = (expected.numbers[`${d.source}:${r[KEYS[d.source]]}`] ??= []);
      for (const v of values) if (!list.includes(v)) list.push(v);
    }
  }
  return { expected, draws, measures };
}

// ---- Responsibility map -----------------------------------------------------------------------------------
// This page holds its data in its first script, as literals. They are read by running that script alone, in an
// empty context: it only declares constants.

export function responsibilityLiterals(page = readFileSync(join(FIX, 'responsibility-map/page.html'), 'utf8')) {
  const first = [...page.matchAll(/<script>([\s\S]*?)<\/script>/g)][0][1];
  return vm.runInNewContext(`${first}\n;({FIELD, TOPIC_VERDICTS, topicVerdict, STUDIES, FINDINGS, CHAIN, CONCEPTS, SOURCES})`, {}, { timeout: 1000 });
}

export function responsibilityShows(lit = responsibilityLiterals()) {
  const { FIELD, TOPIC_VERDICTS, topicVerdict, FINDINGS } = lit;
  const years = FIELD.years.map(String);
  const expected = { page: 'fixtures/responsibility-map/page.html', series: {}, names: {}, numbers: {}, verdicts: {} };
  // The line chart can show any topic's share; the small bars show the three crossings; the tooltip of the line
  // chart gives the size of the field each year.
  for (const t of FIELD.topics) {
    expected.series[`topics:${t.id}`] = Object.fromEntries(years.map((y, i) => [y, t.share[i]]));
    expected.names[`topics:${t.id}`] = t.name;
    // The dot's tooltip: size, n25, momentum, prev. The dot's colour: its verdict, or "not tested".
    expected.numbers[`topics:${t.id}`] = [t.size, t.momentum, t.prev, t.n25];
    expected.verdicts[`dot:${t.id}`] = topicVerdict[t.id] ?? 'not challenged';
  }
  for (const c of FIELD.cross) {
    expected.series[`cross:${c.id}`] = Object.fromEntries(years.map((y, i) => [y, c.counts[i]]));
    expected.names[`cross:${c.id}`] = c.name;
  }
  expected.series['universe:value'] = Object.fromEntries(years.map((y, i) => [y, FIELD.universe[i]]));
  for (const t of TOPIC_VERDICTS) expected.verdicts[t.id] = t.v;
  for (const f of FINDINGS) expected.verdicts[f.id] = f.v;
  return expected;
}

// ---- The challenge records ----------------------------------------------------------------------------------
// Which conclusion each page's verdict belongs to, and the verdict the challenger gave it
// (fixtures/challenge-verdicts.json). The records themselves are written by poiesis-insight's challenge_stamp.py
// and kept in tests/fixtures/stamps/; this only says what they cover.

export const CHALLENGES = {
  'trend-scan': { c1: 'C1', c2: 'C2', c3: 'C3', c4: 'C4', c5: 'C5', c6: 'C6' },
  'responsibility-map': {
    ai: 'T1', climate: 'T2 (part: climate)', progress: 'T2 (part: moral change/progress)', found: 'T3', blame: 'T4', politics: 'T5',
    I1: 'I1', I2: 'I2', I3: 'I3', I4: 'I4', I5: 'I5',
  },
};

// ---- The two projects -------------------------------------------------------------------------------------

export function makeProjects(out) {
  const projects = {};
  // Trend scan: its five data files, both versions of the verdict file, the records, the report.
  {
    const dir = join(out, 'trend-scan');
    mkdirSync(join(dir, 'fixtures/trend-scan'), { recursive: true });
    for (const f of ['series', 'checks', 'corpus', 'synbio', 'challenge.published', 'challenge.corrected']) {
      copyFileSync(join(FIX, 'trend-scan', `${f}.json`), join(dir, 'fixtures/trend-scan', `${f}.json`));
    }
    mkdirSync(join(dir, 'insights'), { recursive: true });
    copyFileSync(join(HERE, 'fixtures/stamps/trend-scan.jsonl'), join(dir, 'insights/challenge-stamps.jsonl'));
    for (const which of ['published', 'corrected']) {
      const report = json(join(HERE, 'fixtures/reports/trend-scan.json'));
      for (const s of report.sections) for (const b of s.blocks) if (b.from?.includes('challenge.published')) b.from = b.from.replace('published', which);
      mkdirSync(join(dir, 'design/showroom', which), { recursive: true });
      writeFileSync(join(dir, 'design/showroom', which, 'report.json'), `${JSON.stringify(report, null, 2)}\n`);
    }
    for (const which of ['published', 'corrected']) {
      writeFileSync(join(dir, `expected-${which}.json`), `${JSON.stringify(trendScanShows(which).expected, null, 2)}\n`);
    }
    projects['trend-scan'] = dir;
  }
  // Responsibility map: page_data.json for the numbers, and the page's own literals for what exists nowhere
  // else (studies, findings, concepts, verdicts), copied out by script, not retyped.
  {
    const dir = join(out, 'responsibility-map');
    mkdirSync(join(dir, 'fixtures/responsibility-map'), { recursive: true });
    copyFileSync(join(FIX, 'responsibility-map/page_data.json'), join(dir, 'fixtures/responsibility-map/page_data.json'));
    const lit = responsibilityLiterals();
    writeFileSync(join(dir, 'fixtures/responsibility-map/page-literals.json'), `${JSON.stringify(lit, null, 2)}\n`);
    mkdirSync(join(dir, 'insights'), { recursive: true });
    copyFileSync(join(HERE, 'fixtures/stamps/responsibility-map.jsonl'), join(dir, 'insights/challenge-stamps.jsonl'));
    mkdirSync(join(dir, 'design/showroom/map'), { recursive: true });
    copyFileSync(join(HERE, 'fixtures/reports/responsibility-map.json'), join(dir, 'design/showroom/map/report.json'));
    writeFileSync(join(dir, 'expected.json'), `${JSON.stringify(responsibilityShows(lit), null, 2)}\n`);
    projects['responsibility-map'] = dir;
  }
  return projects;
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  if (!HAVE_NOTEBOOK) { console.error(`No notebook at ${NOTEBOOK} (POIESIS_LAB names another).`); process.exit(1); }
  const out = resolve(process.argv[2] ?? 'fixture-projects');
  for (const [name, dir] of Object.entries(makeProjects(out))) console.log(`${name}: ${dir}`);
}
