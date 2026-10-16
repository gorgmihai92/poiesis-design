#!/usr/bin/env node
// WCAG 2.x contrast ratio for literal color pairs (rule C3). For token files use resolve.mjs.
// Usage: node contrast.mjs <foreground> <background> [<fg> <bg> ...]   (hex, rgb(), oklch())

import { contrast } from './lib/color.mjs';

const args = process.argv.slice(2);
if (args.length < 2 || args.length % 2) {
  console.error('usage: node contrast.mjs <fg> <bg> [<fg> <bg> ...]');
  process.exit(2);
}
const mark = (ok) => (ok ? 'pass' : 'FAIL');
for (let i = 0; i < args.length; i += 2) {
  const r = contrast(args[i], args[i + 1]);
  console.log(
    `${args[i]} on ${args[i + 1]}: ${r.toFixed(2)}:1  ` +
      `text ${mark(r >= 4.5)} · large text ${mark(r >= 3)} · UI/icons ${mark(r >= 3)} · AAA text ${mark(r >= 7)}`,
  );
}
