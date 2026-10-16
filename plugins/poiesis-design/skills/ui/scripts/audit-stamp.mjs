#!/usr/bin/env node
// Records an audit result for the current state of the UI files; the publish gate reads it.
//
//   node audit-stamp.mjs pass   [--should N] [--note "..."]      no open `must` findings (written by ui-auditor)
//   node audit-stamp.mjs fail   --must N [--should N] [--note "..."]
//   node audit-stamp.mjs accept --note "what the user accepted"  only when the user explicitly accepts open findings
//   node audit-stamp.mjs status                                   is the stamp current?

import { findRoot, readConfig, writeJson, readStamp, hashUi } from './lib/project.mjs';

const [result, ...rest] = process.argv.slice(2);
const opt = (name) => {
  const i = rest.indexOf(`--${name}`);
  return i >= 0 ? rest[i + 1] : undefined;
};

const root = findRoot(process.cwd());
if (!root) {
  console.error('No .poiesis-design/config.json here or above. Run init.mjs (or init.mjs --audit-only) first.');
  process.exit(2);
}
const config = readConfig(root);
const { hash, files } = hashUi(root, config.uiPaths);

if (result === 'status') {
  const s = readStamp(root);
  if (!s) console.log('No audit recorded.');
  else
    console.log(
      `${s.result} on ${s.date} · ${s.hash === hash ? 'current' : 'OUTDATED: UI changed since'} · must ${s.must ?? 0}, should ${s.should ?? 0}`,
    );
  process.exit(s && s.hash === hash && s.result !== 'fail' ? 0 : 1);
}

if (!['pass', 'fail', 'accept'].includes(result)) {
  console.error('usage: node audit-stamp.mjs pass|fail|accept|status [--must N] [--should N] [--note "..."]');
  process.exit(2);
}
if (result === 'accept' && !opt('note')) {
  console.error('accept needs --note with what the user accepted.');
  process.exit(2);
}

const stamp = {
  result,
  date: new Date().toISOString(),
  hash,
  files,
  must: Number(opt('must') ?? 0),
  should: Number(opt('should') ?? 0),
  note: opt('note') ?? '',
};
writeJson(root, 'audit.json', stamp);
console.log(`Recorded ${result} for ${files} UI files (${hash}).`);
