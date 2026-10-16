// Meter: a level from 1 to 3 as rising bars, like a signal indicator; the number of filled bars reads without a
// legend or color, the tone repeats it. Progress: how much of a known amount is done. Rules: C4 never color alone
// (bar count; level in words in the label) · C2 tones are status colors only · F4, F5 honest progress · I3 named.
import { cx } from "./cx.js";
import "./meter.css";

const BARS = [
  { x: 0, h: 5 },
  { x: 5, h: 8.5 },
  { x: 10, h: 12 },
];

/** `label`: the level in words ("High", "Level 2 of 3"); without it the meter is decorative. */
export function Meter({ value, tone = "ink", label, className }: {
  value: 1 | 2 | 3;
  tone?: "ink" | "danger" | "warning" | "success";
  label?: string;
  className?: string;
}) {
  const a11y = label ? { role: "img", "aria-label": label } : { "aria-hidden": true as const };
  return (
    <svg viewBox="0 0 14 12" data-tone={tone} className={cx("pc-meter", className)} {...a11y}>
      {BARS.map((b, i) => (
        <rect key={b.x} x={b.x} y={12 - b.h} width="4" height={b.h} data-on={i < value ? "" : undefined} />
      ))}
    </svg>
  );
}

/** `value` between 0 and 1, from real work done (never invented movement). */
export function Progress({ value, label, className }: { value: number; label: string; className?: string }) {
  const v = Math.max(0, Math.min(1, value));
  return (
    <span role="progressbar" aria-label={label} aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} className={cx("pc-progress", className)}>
      <span className="pc-progress__fill" style={{ inlineSize: `${v * 100}%` }} />
    </span>
  );
}
