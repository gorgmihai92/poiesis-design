// Tip: a tooltip in the product's own type, opened by hover and by keyboard focus, closed with Esc. It never
// holds the only copy of needed information: the target keeps its own accessible name (R3, I3). Wrap the app
// once in <TipProvider>. Style a selected target by aria-* or state, not data-state (the tooltip overwrites it).
import { Tooltip as T } from "radix-ui";
import type * as React from "react";
import "./tip.css";

export function TipProvider({ children }: { children: React.ReactNode }) {
  return <T.Provider delayDuration={300}>{children}</T.Provider>;
}

export function Tip({ label, children, side = "top" }: { label: React.ReactNode; children: React.ReactElement; side?: "top" | "bottom" | "left" | "right" }) {
  return (
    <T.Root>
      <T.Trigger asChild>{children}</T.Trigger>
      <T.Portal>
        <T.Content side={side} sideOffset={6} collisionPadding={8} className="pc-tip">
          {label}
        </T.Content>
      </T.Portal>
    </T.Root>
  );
}
