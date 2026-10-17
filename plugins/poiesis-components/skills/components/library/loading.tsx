// Loading: says what is pending, and for how long once it takes a while, so a slow answer never looks stuck.
// Rules: F2 the loading state of every async view · F3 what is pending is announced (the seconds are not, so
// it is not read every second) · F4 progress for long work · I5 dots still under reduced motion · T5 tabular
// figures for the changing number.
import { useEffect, useState } from "react";
import type * as React from "react";
import "./loading.css";

/**
 * True a moment after mounting. A live region is announced when its content changes, and many screen readers
 * skip one that appears already filled: mount it empty, then fill it.
 */
export function useFilled() {
  const [filled, setFilled] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setFilled(true), 50);
    return () => clearTimeout(id);
  }, []);
  return filled;
}

export function Dots() {
  return (
    <span className="pc-dots" aria-hidden>
      <i />
      <i />
      <i />
    </span>
  );
}

/** `since`: when the work started (ms); the elapsed seconds appear after a few seconds. */
export function Loading({ children, since }: { children: React.ReactNode; since?: number }) {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (since === undefined) return;
    // A timer, not requestAnimationFrame: it keeps counting while the view is hidden.
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [since]);
  const seconds = since === undefined ? 0 : Math.max(0, Math.round((now - since) / 1000));
  const filled = useFilled();
  return (
    <p className="pc-loading">
      <Dots />
      <span role="status">{filled ? children : null}</span>
      {seconds >= 3 && <span className="pc-loading__time">· {seconds} s</span>}
    </p>
  );
}
