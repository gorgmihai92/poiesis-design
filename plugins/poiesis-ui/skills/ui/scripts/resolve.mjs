#!/usr/bin/env node
// Shows what the atoms produce: type and space scales in px, colors in both themes, and the contrast of every
// semantic pair (C3, T12). Exit code 1 when a pair fails, so it can gate a build.
// Usage: node resolve.mjs <atoms.css> [<preset.css>] <cells.css> [more token files] [--vw 1280] [--json]
// Later files override earlier ones. "@pair --fg on --bg 3" comments in any file add checks.

import { readTokens, makeResolver } from './lib/tokens.mjs';
import { contrast } from './lib/color.mjs';

// Default pairs: text 4.5:1, shapes and boundaries 3:1.
const SURFACES = ['--paper', '--surface-1', '--surface-2', '--surface-3'];
const ROLES = ['accent', 'success', 'warning', 'caution', 'danger', 'new'];
const DEFAULT_PAIRS = [
  ...['--ink', '--muted', '--accent-text'].flatMap((fg) => SURFACES.map((bg) => ({ fg, bg, min: 4.5 }))),
  // Each color role: text on its fill and on its tint; its strong shade as text on paper and on its tint.
  ...ROLES.flatMap((r) => [
    { fg: '--on-color', bg: `--${r}`, min: 4.5 },
    { fg: '--ink', bg: `--${r}-tint`, min: 4.5 },
    { fg: `--${r}-strong`, bg: '--paper', min: 4.5 },
    { fg: `--${r}-strong`, bg: `--${r}-tint`, min: 4.5 },
  ]),
  { fg: '--focus', bg: '--paper', min: 3 },
];

const argv = process.argv.slice(2);
const json = argv.includes('--json');
const vwAt = argv.indexOf('--vw');
const vw = vwAt >= 0 ? Number(argv[vwAt + 1]) : 1280;
const files = argv.filter((a, i) => !a.startsWith('--') && argv[i - 1] !== '--vw');
if (!files.length) {
  console.error('usage: node resolve.mjs <atoms.css> [preset.css] <cells.css> [...] [--vw 1280] [--json]');
  process.exit(2);
}

const { props, pairs: extraPairs } = readTokens(files);
const names = [...props.keys()].filter((n) => !n.startsWith('--atom-'));
const schemes = ['light', 'dark'];
const resolvers = Object.fromEntries(schemes.map((s) => [s, makeResolver(props, { scheme: s, vw })]));
const phone = makeResolver(props, { scheme: 'light', vw: 360 });

const report = { vw, scales: [], colors: [], pairs: [], problems: [] };

for (const n of names) {
  const light = resolvers.light(n);
  if (light.kind === 'color') {
    const dark = resolvers.dark(n);
    report.colors.push({ name: n, light: light.hex, dark: dark.hex ?? dark.text, gamut: light.color.inGamut && dark.color?.inGamut });
  } else if (light.kind === 'number') {
    const p = phone(n);
    report.scales.push({ name: n, value: light.text, phone: p.text !== light.text ? p.text : undefined, px: light.u === 'px' ? light.v : undefined });
  } else if (light.kind === 'error') report.problems.push(`${n}: ${light.text}`);
}

for (const pair of [...DEFAULT_PAIRS, ...extraPairs]) {
  for (const s of schemes) {
    const fg = resolvers[s](pair.fg);
    const bg = resolvers[s](pair.bg);
    if (fg.kind !== 'color' || bg.kind !== 'color') continue;
    const r = contrast(fg.color, bg.color);
    report.pairs.push({ ...pair, scheme: s, ratio: Math.round(r * 100) / 100, pass: r >= pair.min });
  }
}

for (const s of report.scales)
  if (/^--text-/.test(s.name) && s.px !== undefined && s.px < 12) report.problems.push(`${s.name} is ${s.value}: under 12px`);

const failed = report.pairs.filter((p) => !p.pass);
if (json) console.log(JSON.stringify(report, null, 2));
else {
  console.log(`Scales (viewport ${vw}px; fluid values also at 360px)`);
  for (const s of report.scales) console.log(`  ${s.name.padEnd(18)} ${s.value}${s.phone ? `  · phone ${s.phone}` : ''}`);
  console.log('\nColors (light · dark)');
  for (const c of report.colors) console.log(`  ${c.name.padEnd(18)} ${c.light}  ${c.dark}${c.gamut === false ? '  (clipped to sRGB)' : ''}`);
  console.log('\nContrast');
  for (const p of report.pairs)
    console.log(`  ${p.pass ? 'pass' : 'FAIL'}  ${p.scheme.padEnd(5)} ${p.fg} on ${p.bg}: ${p.ratio.toFixed(2)}:1 (min ${p.min})`);
  if (report.problems.length) console.log('\nProblems\n  ' + report.problems.join('\n  '));
  console.log(`\n${failed.length ? `${failed.length} contrast pair(s) fail.` : 'All contrast pairs pass.'}`);
}
process.exit(failed.length || report.problems.length ? 1 : 0);
