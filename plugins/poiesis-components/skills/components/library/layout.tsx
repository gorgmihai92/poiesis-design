// Tile: one item on a grey step. Section: a titled group; space above it is about twice the space inside (H4).
// Stack: sections apart, so the parent owns the space (S4). Hint: secondary text, muted, not smaller (H2).
// Empty: an empty view that says why and what to do next (F2), with its action.
import type * as React from "react";
import { cx } from "./cx.js";
import "./layout.css";

export const Tile = ({ className, ...p }: React.ComponentProps<"div">) => <div className={cx("pc-tile", className)} {...p} />;
export const Stack = ({ className, ...p }: React.ComponentProps<"div">) => <div className={cx("pc-stack", className)} {...p} />;
export const Hint = ({ className, ...p }: React.ComponentProps<"p">) => <p className={cx("pc-hint", className)} {...p} />;

export function Section({ title, children, className }: { title: React.ReactNode; children: React.ReactNode; className?: string }) {
  return (
    <section className={cx("pc-section", className)}>
      <h2 className="pc-section__title">{title}</h2>
      <div className="pc-section__body">{children}</div>
    </section>
  );
}

/** `children`: why it is empty and what to do; `action`: the button that does it. */
export function Empty({ children, action }: { children: React.ReactNode; action?: React.ReactNode }) {
  return (
    <div className="pc-empty">
      <p>{children}</p>
      {action}
    </div>
  );
}
