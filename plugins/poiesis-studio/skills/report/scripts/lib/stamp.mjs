// Challenge stamps, format 1: reading them and verifying a conclusion against its stamp. Written from the format's
// description alone (poiesis-insight, skills/insight/stamp-format.md); it needs neither that plugin nor its script.
// A report shows a verdict only from a stamp that verifies. It never writes one.
//
// A stamp is one JSON line in insights/challenge-stamps.jsonl:
//   {"v": 1, "id": "IN-004", "verdict": "weakened", "date": "2026-11-22", "text_sha256": "…", "seal": "…"}
// The last line for an id is the one in force. text_sha256 is the hash of the conclusion's sentence; the seal is
// the hash of the other four, so a line edited by hand no longer matches.

import { createHash } from 'node:crypto';
import { existsSync, readFileSync } from 'node:fs';

export const VERDICTS = ['kept', 'weakened', 'dropped'];
export const STAMP_FILE = 'insights/challenge-stamps.jsonl';

const sha256 = (text) => createHash('sha256').update(text, 'utf8').digest('hex');

// The sentence as it is hashed: NFC, every run of tab, line feed, vertical tab, form feed, carriage return and
// space becomes one space, spaces at both ends go. Nothing else is folded (not \s: it differs between languages).
export const normalise = (text) => text.normalize('NFC').replace(/[\t\n\v\f\r ]+/g, ' ').replace(/^ +| +$/g, '');
export const textSha256 = (text) => sha256(normalise(text));
export const sealOf = (id, verdict, date, hash) => sha256(['poiesis-challenge-stamp v1', id, verdict, date, hash].join('\n'));

// Reads a stamp file. `damaged` when any non-empty line is not a JSON object with an id: then nothing in the file
// can be trusted to be the last word on any id.
export function readStamps(path) {
  if (!path || !existsSync(path)) return { path, exists: false, damaged: false, last: new Map(), count: 0 };
  const text = readFileSync(path, 'utf8').replace(/^﻿/, '');
  const last = new Map();
  let damaged = false;
  let count = 0;
  text.split('\n').forEach((line, i) => {
    if (!line.trim()) return;
    let stamp;
    try { stamp = JSON.parse(line); } catch { damaged = true; return; }
    if (!stamp || typeof stamp !== 'object' || Array.isArray(stamp) || typeof stamp.id !== 'string') { damaged = true; return; }
    count++;
    last.set(stamp.id, { ...stamp, line: i + 1 });
  });
  return { path, exists: true, damaged, last, count };
}

const ID = /^[A-Za-z0-9][A-Za-z0-9._-]{0,63}$/;
const realDate = (d) => typeof d === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(d) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d;
const intact = (s) =>
  s.v === 1 && ID.test(s.id) && VERDICTS.includes(s.verdict) && realDate(s.date) &&
  typeof s.text_sha256 === 'string' && /^[0-9a-f]{64}$/.test(s.text_sha256) &&
  s.seal === sealOf(s.id, s.verdict, s.date, s.text_sha256);

// Verifies one conclusion: its id, its sentence as it stands now, and the verdict shown beside it, if one is.
// `status` is one of:
//   ok               the stamp is intact, the sentence is the one challenged, the label (if any) agrees
//   verdict retyped  the same, but the label beside the sentence says something else: the stamp is the record
//   no stamp         no challenge is recorded for this id
//   stamp altered    the last line for the id does not match its seal, or is not a format 1 stamp
//   text changed     the sentence is not the one that was challenged
//   file damaged     the stamp file has a line that is not a stamp
// `verdict` is set only for ok and verdict retyped: only then may a verdict be shown.
export function verify({ id, text, shown = null }, stamps) {
  if (stamps.damaged) return { id, status: 'file damaged', verdict: null };
  const stamp = stamps.last.get(id);
  if (!stamp) return { id, status: 'no stamp', verdict: null };
  if (!intact(stamp)) return { id, status: 'stamp altered', verdict: null, line: stamp.line };
  const { verdict, date, by = null, again = null } = stamp;
  if (stamp.text_sha256 !== textSha256(text)) return { id, status: 'text changed', verdict: null, was: verdict, date };
  const label = shown === null ? null : (String(shown).match(/[A-Za-z]+/)?.[0] ?? '').toLowerCase();
  if (label !== null && label !== verdict) return { id, status: 'verdict retyped', verdict, date, by, again, shown: String(shown).trim() };
  return { id, status: 'ok', verdict, date, by, again };
}

// The conclusions of a Markdown note: every heading with an Id line under it. For each: the sentence (the
// heading, whole), the verdict shown on its Challenge line (the words after the label, as typed), and its other
// labelled lines. An id under two headings cannot be verified: both are returned with `twice`.
export function readNote(markdown) {
  const lines = markdown.replace(/^﻿/, '').split(/\r?\n/);
  const blocks = [];
  let fenced = false;
  let block = null;
  for (const line of lines) {
    if (/^[ \t]*(```|~~~)/.test(line)) { fenced = !fenced; continue; }
    if (fenced) continue;
    const heading = line.match(/^#{1,6}[ \t]+(.*)$/);
    if (heading) { block = { text: heading[1], id: null, challenge: null, fields: [] }; blocks.push(block); continue; }
    if (!block) continue;
    const id = line.match(/^[ \t]*[-*+][ \t]+\*\*id:?\*\*:?[ \t]*(\S+)[ \t]*$/i);
    if (id) { block.id ??= id[1]; continue; }
    const challenge = line.match(/^[ \t]*[-*+][ \t]+\*\*challenge:?\*\*:?[ \t]*(.*)$/i);
    if (challenge) { block.challenge ??= challenge[1]; continue; }
    const field = line.match(/^[ \t]*[-*+][ \t]+\*\*([^*:]+):?\*\*:?[ \t]*(.*)$/);
    if (field) block.fields.push({ label: field[1].trim(), text: field[2].trim() });
  }
  const objects = blocks.filter((b) => b.id);
  const seen = new Map();
  for (const o of objects) seen.set(o.id, (seen.get(o.id) ?? 0) + 1);
  return objects.map((o) => ({ ...o, twice: seen.get(o.id) > 1 }));
}
