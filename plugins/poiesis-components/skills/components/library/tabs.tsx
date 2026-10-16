// Tabs: the main sections of a screen. Segmented: a small choice between views of the same content, on a grey
// step, the chosen one with the selected cells. Both are the ARIA tabs pattern from Radix (arrow keys move,
// Tab enters the panel). Rules: I1 keyboard · K3 nothing moves (reserved bold width, indicator always 2px) ·
// R1 the current one is visible · R2 the caller remembers the choice · G3 selected cells.
import { Tabs as T } from "radix-ui";
import type * as React from "react";
import { cx } from "./cx.js";
import "./base.css";
import "./tabs.css";

export const Tabs = T.Root;
export const TabsContent = ({ className, ...p }: React.ComponentProps<typeof T.Content>) => (
  <T.Content className={cx("pc-tabs__content", className)} {...p} />
);

/** `items`: value and label of each tab, in order. */
export function TabsList({ items, label, className }: { items: [string, React.ReactNode][]; label: string; className?: string }) {
  return (
    <T.List aria-label={label} className={cx("pc-tabs__list", className)}>
      {items.map(([value, text]) => (
        <T.Trigger key={value} value={value} className="pc-tabs__trigger">
          <span className="pc-tabs__label">
            <span>{text}</span>
            <span aria-hidden>{text}</span>
          </span>
        </T.Trigger>
      ))}
    </T.List>
  );
}

/** A segmented control inside a Tabs root: the second level under the main tabs. */
export function Segmented({ items, label, className }: { items: [string, React.ReactNode][]; label: string; className?: string }) {
  return (
    <T.List aria-label={label} className={cx("pc-segmented", className)}>
      {items.map(([value, text]) => (
        <T.Trigger key={value} value={value} className="pc-segmented__trigger pc-selectable">
          {text}
        </T.Trigger>
      ))}
    </T.List>
  );
}
