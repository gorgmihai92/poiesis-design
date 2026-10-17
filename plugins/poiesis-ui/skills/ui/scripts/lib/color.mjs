// Color parsing (hex, rgb, oklch, a few names) and WCAG 2.x contrast. No dependencies.

const NAMED = {
  white: [255, 255, 255, 1],
  black: [0, 0, 0, 1],
  transparent: [0, 0, 0, 0],
};

// Splits on a separator at parenthesis depth 0.
export function splitTop(s, sep = /[\s,]/) {
  const out = [];
  let depth = 0;
  let cur = '';
  for (const ch of s) {
    if (ch === '(') depth++;
    if (ch === ')') depth--;
    if (depth === 0 && sep.test(ch)) {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

function oklchToRgb(L, C, H) {
  const h = (H * Math.PI) / 180;
  const a = C * Math.cos(h);
  const b = C * Math.sin(h);
  const l_ = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
  const m_ = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
  const s_ = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
  const lin = [
    4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
    -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
    -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
  ];
  const inGamut = lin.every((v) => v >= -0.0005 && v <= 1.0005);
  const enc = (v) => {
    const c = Math.min(1, Math.max(0, v));
    return 255 * (c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055);
  };
  return { rgb: lin.map(enc), inGamut };
}

// sRGB 0–255 → OKLCH [L 0–1, C, H degrees], for relative colors (oklch(from <color> l c h)).
export function rgbToOklch({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  const [R, G, B] = [lin(r), lin(g), lin(b)];
  const l = Math.cbrt(0.4122214708 * R + 0.5363137098 * G + 0.0514625307 * B);
  const m = Math.cbrt(0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B);
  const s = Math.cbrt(0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B);
  const L = 0.2104542553 * l + 0.793617785 * m - 0.0040720468 * s;
  const a = 1.9779984951 * l - 2.428592205 * m + 0.4505937099 * s;
  const bb = 0.0259040371 * l + 0.7827717662 * m - 0.808675766 * s;
  const C = Math.hypot(a, bb);
  const H = C < 1e-4 ? 0 : ((Math.atan2(bb, a) * 180) / Math.PI + 360) % 360;
  return [L, C, H];
}

const pct = (v, scale = 1) => (String(v).endsWith('%') ? (parseFloat(v) / 100) * scale : Number(v));

// Returns { r, g, b, a, inGamut } or null when the string is not a color this parser knows.
export function parseColor(input) {
  const s = String(input).trim().toLowerCase();
  if (NAMED[s]) {
    const [r, g, b, a] = NAMED[s];
    return { r, g, b, a, inGamut: true };
  }
  let m = s.match(/^#([0-9a-f]{3,8})$/);
  if (m) {
    let h = m[1];
    if (h.length === 3 || h.length === 4) h = [...h].map((c) => c + c).join('');
    if (h.length !== 6 && h.length !== 8) return null;
    const n = (i) => parseInt(h.slice(i, i + 2), 16);
    return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1, inGamut: true };
  }
  m = s.match(/^rgba?\((.*)\)$/);
  if (m) {
    const p = splitTop(m[1], /[\s,/]/);
    const ch = (v) => (String(v).endsWith('%') ? pct(v, 255) : Number(v));
    return { r: ch(p[0]), g: ch(p[1]), b: ch(p[2]), a: p[3] === undefined ? 1 : pct(p[3]), inGamut: true };
  }
  m = s.match(/^oklch\((.*)\)$/);
  if (m) {
    const [main, alpha] = m[1].split('/');
    const p = splitTop(main, /\s/);
    const { rgb, inGamut } = oklchToRgb(pct(p[0]), pct(p[1], 0.4), Number(p[2]) || 0);
    return { r: rgb[0], g: rgb[1], b: rgb[2], a: alpha === undefined ? 1 : pct(alpha.trim()), inGamut };
  }
  return null;
}

export const toHex = ({ r, g, b }) =>
  '#' + [r, g, b].map((v) => Math.round(Math.min(255, Math.max(0, v))).toString(16).padStart(2, '0')).join('');

const over = (fg, bg) => ({
  r: fg.r * fg.a + bg.r * (1 - fg.a),
  g: fg.g * fg.a + bg.g * (1 - fg.a),
  b: fg.b * fg.a + bg.b * (1 - fg.a),
  a: 1,
});

function luminance({ r, g, b }) {
  const lin = (v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

// Contrast of a foreground over a background (a translucent foreground is composited first).
export function contrast(fg, bg) {
  const f = typeof fg === 'string' ? parseColor(fg) : fg;
  const b = typeof bg === 'string' ? parseColor(bg) : bg;
  if (!f || !b) throw new Error(`unsupported color: ${!f ? fg : bg}`);
  const [hi, lo] = [luminance(over(f, b)), luminance(b)].sort((x, y) => y - x);
  return (hi + 0.05) / (lo + 0.05);
}
