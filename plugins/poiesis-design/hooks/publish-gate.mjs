#!/usr/bin/env node
// PreToolUse hook (Bash): blocks publishing commands in projects that opted in to Poiesis UI until the
// ui-auditor has passed (or the user accepted the findings) on the current UI files. Rule P1.
// Projects without .poiesis-design/config.json are never affected.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { findRoot, readConfig, readStamp, hashUi, isPublish } from '../skills/ui/scripts/lib/project.mjs';

let input = {};
try {
  input = JSON.parse(readFileSync(0, 'utf8'));
} catch {
  process.exit(0);
}
const command = input.tool_input?.command ?? '';
const root = findRoot(input.cwd ?? process.cwd());
if (!root || !command) process.exit(0);

let config;
try {
  config = readConfig(root);
} catch {
  process.exit(0);
}
if (!isPublish(command, config)) process.exit(0);

const stamp = readStamp(root);
const { hash } = hashUi(root, config.uiPaths);
if (stamp && stamp.hash === hash && (stamp.result === 'pass' || stamp.result === 'accept')) process.exit(0);

const scripts = join(process.env.CLAUDE_PLUGIN_ROOT ?? '<poiesis-design plugin>', 'skills/ui/scripts');
const why = !stamp
  ? 'no UI audit has been recorded for this project'
  : stamp.hash !== hash
    ? `the UI changed since the last audit (${stamp.date})`
    : `the last audit failed with ${stamp.must} open must finding(s)`;
process.stderr.write(
  `Poiesis UI publish gate (P1): ${why}.\n` +
    `Run the poiesis-design:ui-auditor agent on this project; it records the result. Fix the must findings and audit ` +
    `again, or, only if the user explicitly accepts them, run:\n` +
    `  node ${scripts}/audit-stamp.mjs accept --note "<what the user accepted>"\n` +
    `Then retry the command.\n`,
);
process.exit(2);
