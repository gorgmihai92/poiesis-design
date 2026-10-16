// StatusDot: whether a process runs, waits, stopped or failed. Each state has its own shape (filled, pause bars,
// hollow, "!"), not only its color, and its name is the accessible label and the tooltip. Rules: C4 never color
// alone · I3 named · I5 the pulse only without reduced motion · F1 the state is visible.
import { cx } from "./cx.js";
import { Tip } from "./tip.js";
import "./status.css";

export type ProcessState = "active" | "paused" | "stopped" | "error";

const SHAPES: Record<ProcessState, React.ReactNode> = {
  active: <rect x="0" y="0" width="10" height="10" fill="currentColor" />,
  paused: (
    <>
      <rect x="1" y="0" width="3" height="10" fill="currentColor" />
      <rect x="6" y="0" width="3" height="10" fill="currentColor" />
    </>
  ),
  stopped: <rect x="0.75" y="0.75" width="8.5" height="8.5" fill="none" stroke="currentColor" strokeWidth="1.5" />,
  error: (
    <>
      <rect x="0" y="0" width="10" height="10" fill="currentColor" />
      <path d="M5 2v4M5 7.5v1" stroke="var(--paper)" strokeWidth="1.5" />
    </>
  ),
};

/** `label`: the state in words, e.g. "Analyzing" or "Paused". */
export function StatusDot({ state, label, className }: { state: ProcessState; label: string; className?: string }) {
  return (
    <Tip label={label}>
      <span role="img" aria-label={label} tabIndex={0} data-state={state} className={cx("pc-status pc-tip-target", className)}>
        {state === "active" && <span className="pc-status__ring" />}
        <svg viewBox="0 0 10 10" aria-hidden>{SHAPES[state]}</svg>
      </span>
    </Tip>
  );
}
