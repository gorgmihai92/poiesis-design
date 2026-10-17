// Reads custom properties from token files and evaluates them like the browser: var(), calc(), pow(), min(),
// max(), clamp(), light-dark() and oklch() with computed arguments. Lengths come out in px (1rem = 16px).

import { readFileSync } from 'node:fs';
import { parseColor, rgbToOklch, splitTop, toHex } from './color.mjs';

const REM = 16;

// Custom properties declared in :root-level rules (including :where(:root, ...)), in file order; later wins.
// Also collects "@pair --fg on --bg [ratio]" comments, which add contrast checks.
export function readTokens(files) {
  const props = new Map();
  const pairs = [];
  for (const file of files) {
    const css = readFileSync(file, 'utf8');
    for (const m of css.matchAll(/@pair\s+(--[\w-]+)\s+on\s+(--[\w-]+)(?:\s+([\d.]+))?/g))
      pairs.push({ fg: m[1], bg: m[2], min: m[3] ? Number(m[3]) : 4.5, source: file });
    const text = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const stack = [];
    let buf = '';
    for (const ch of text) {
      if (ch === '{') {
        stack.push(buf.trim());
        buf = '';
      } else if (ch === '}') {
        declarations(buf, stack, props, file);
        stack.pop();
        buf = '';
      } else if (ch === ';' && stack.length) {
        declarations(buf, stack, props, file);
        buf = '';
      } else buf += ch;
    }
  }
  return { props, pairs };
}

function declarations(chunk, stack, props, file) {
  const selector = stack[stack.length - 1] ?? '';
  if (!/:root/.test(selector) || stack.some((s) => s.startsWith('@media'))) return;
  const m = chunk.trim().match(/^(--[\w-]+)\s*:\s*([\s\S]+)$/);
  if (m) props.set(m[1], { value: m[2].trim().replace(/\s+/g, ' '), file });
}

// ---------- evaluation ----------

export function makeResolver(props, { scheme = 'light', vw = 1280 } = {}) {
  const cache = new Map();

  function substitute(value, seen) {
    let out = value;
    for (let guard = 0; guard < 50 && out.includes('var('); guard++) {
      out = out.replace(/var\(\s*(--[\w-]+)\s*(?:,\s*([^()]*(?:\([^()]*\))?[^()]*))?\)/, (_, name, fallback) => {
        if (seen.has(name)) throw new Error(`cycle at ${name}`);
        const p = props.get(name);
        if (!p) return fallback ?? `UNSET(${name})`;
        return substitute(p.value, new Set([...seen, name]));
      });
    }
    return out;
  }

  function pickScheme(value) {
    return replaceFn(value, 'light-dark', (args) => splitTop(args, /,/)[scheme === 'dark' ? 1 : 0]);
  }

  function evalColorArgs(value) {
    return replaceFn(value, 'oklch', (args) => {
      // Relative color: oklch(from <color> <l> <c> <h>), where l, c and h stand for the origin's channels.
      if (/^\s*from\s/.test(args)) {
        const [, origin, ...channels] = splitTop(args, /\s/);
        const base = parseColor(origin);
        if (!base) throw new Error(`unsupported origin color ${origin}`);
        const [l, c, h] = rgbToOklch(base);
        const parts = channels.slice(0, 3).map((p) => {
          const r = evaluate(p.replace(/\bl\b/g, String(l)).replace(/\bc\b/g, String(c)).replace(/\bh\b/g, String(h)), vw);
          if (!r) throw new Error(`cannot evaluate ${p} in oklch(from ...)`);
          return String(r.v);
        });
        return `oklch(${parts.join(' ')})`;
      }
      const [main, alpha] = args.split('/');
      const parts = splitTop(main, /\s/).map((p) => {
        const r = evaluate(p, vw);
        return r && r.u === '' ? String(r.v) : p;
      });
      return `oklch(${parts.join(' ')}${alpha ? ' / ' + alpha.trim() : ''})`;
    });
  }

  return function resolve(name) {
    if (cache.has(name)) return cache.get(name);
    const p = props.get(name);
    let result;
    if (!p) result = { kind: 'unset' };
    else {
      try {
        let v = substitute(p.value, new Set([name]));
        v = pickScheme(v);
        v = evalColorArgs(v);
        const color = parseColor(v);
        if (color) result = { kind: 'color', value: v, color, hex: toHex(color) };
        else {
          const n = evaluate(v, vw);
          result = n ? { kind: 'number', ...n, text: format(n) } : { kind: 'raw', text: v };
        }
      } catch (e) {
        result = { kind: 'error', text: e.message };
      }
    }
    cache.set(name, result);
    return result;
  };
}

// Replaces fn(...) calls (innermost-safe, balanced parentheses) with the callback's result.
function replaceFn(s, fn, cb) {
  let out = '';
  let i = 0;
  const key = fn + '(';
  while (i < s.length) {
    const at = s.indexOf(key, i);
    if (at === -1 || (at > 0 && /[\w-]/.test(s[at - 1]))) {
      if (at === -1) {
        out += s.slice(i);
        break;
      }
      out += s.slice(i, at + key.length);
      i = at + key.length;
      continue;
    }
    let depth = 1;
    let j = at + key.length;
    while (j < s.length && depth) {
      if (s[j] === '(') depth++;
      if (s[j] === ')') depth--;
      j++;
    }
    const inner = s.slice(at + key.length, j - 1);
    out += s.slice(i, at) + cb(replaceFn(inner, fn, cb));
    i = j;
  }
  return out;
}

const format = ({ v, u }) =>
  u === 'px' ? `${round(v)}px (${round(v / REM, 4)}rem)` : u === '' ? String(round(v, 4)) : `${round(v)}${u}`;
const round = (v, d = 2) => Math.round(v * 10 ** d) / 10 ** d;

// Numeric expression → { v, u } with u in px | '' | ms | ch | % | deg, or null if not numeric.
export function evaluate(src, vw = 1280) {
  const tokens = [];
  const re = /\s*(?:(-?\d*\.?\d+(?:e-?\d+)?)(rem|px|em|vw|vh|ms|s|ch|%|deg)?|([a-z-]+)\(|([()+\-*/,]))/giy;
  let m;
  let last = 0;
  while ((m = re.exec(src))) {
    last = re.lastIndex;
    if (m[1] !== undefined) tokens.push({ t: 'num', ...unit(Number(m[1]), m[2] || '', vw) });
    else if (m[3]) tokens.push({ t: 'fn', name: m[3].toLowerCase() });
    else tokens.push({ t: m[4] });
  }
  if (src.slice(last).trim() || !tokens.length) return null;
  let k = 0;
  const peek = () => tokens[k];
  const take = (t) => {
    if (peek()?.t !== t) throw new Error(`expected ${t} in ${src}`);
    return tokens[k++];
  };
  function expr() {
    let a = term();
    while (peek() && (peek().t === '+' || peek().t === '-')) {
      const op = tokens[k++].t;
      const b = term();
      if (a.u !== b.u && a.v !== 0 && b.v !== 0) throw new Error(`mixed units ${a.u}/${b.u} in ${src}`);
      a = { v: op === '+' ? a.v + b.v : a.v - b.v, u: a.u || b.u };
    }
    return a;
  }
  function term() {
    let a = factor();
    while (peek() && (peek().t === '*' || peek().t === '/')) {
      const op = tokens[k++].t;
      const b = factor();
      if (op === '*') a = { v: a.v * b.v, u: a.u || b.u };
      else a = { v: a.v / b.v, u: a.u === b.u ? '' : a.u };
    }
    return a;
  }
  function args() {
    const list = [expr()];
    while (peek()?.t === ',') {
      k++;
      list.push(expr());
    }
    take(')');
    return list;
  }
  function factor() {
    const tok = tokens[k++];
    if (!tok) throw new Error(`unexpected end in ${src}`);
    if (tok.t === 'num') return { v: tok.v, u: tok.u };
    if (tok.t === '-') {
      const f = factor();
      return { v: -f.v, u: f.u };
    }
    if (tok.t === '(') {
      const e = expr();
      take(')');
      return e;
    }
    if (tok.t === 'fn') {
      const a = args();
      const u = a.find((x) => x.u)?.u ?? '';
      switch (tok.name) {
        case 'calc':
          return a[0];
        case 'pow':
          return { v: a[0].v ** a[1].v, u: '' };
        case 'min':
          return { v: Math.min(...a.map((x) => x.v)), u };
        case 'max':
          return { v: Math.max(...a.map((x) => x.v)), u };
        case 'clamp':
          return { v: Math.min(Math.max(a[0].v, a[1].v), a[2].v), u };
        default:
          throw new Error(`unknown function ${tok.name}`);
      }
    }
    throw new Error(`unexpected ${tok.t} in ${src}`);
  }
  try {
    const out = expr();
    return k === tokens.length ? out : null;
  } catch {
    return null; // not a numeric expression (cubic-bezier, font list, ...)
  }
}

function unit(v, u, vw) {
  switch (u.toLowerCase()) {
    case 'rem':
    case 'em':
      return { v: v * REM, u: 'px' };
    case 'px':
      return { v, u: 'px' };
    case 'vw':
      return { v: (v * vw) / 100, u: 'px' };
    case 'vh':
      return { v: (v * 800) / 100, u: 'px' };
    case 's':
      return { v: v * 1000, u: 'ms' };
    default:
      return { v, u: u.toLowerCase() };
  }
}
