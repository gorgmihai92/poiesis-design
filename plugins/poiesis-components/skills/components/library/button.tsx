// Button: one action. IconButton: an action shown as an icon, always named (its label is the tooltip and the
// accessible name). Rules: L2 the label says the result · F1 busy shows at once · I1 native button, keyboard ·
// I3 named · I4 at least 24px · G1 shape from cells · H3 one primary per view.
import type * as React from "react";
import { cx } from "./cx.js";
import { Dots } from "./loading.js";
import { Tip } from "./tip.js";
import "./base.css";
import "./button.css";

type ButtonProps = React.ComponentProps<"button"> & {
  /** primary: the main action of the view (one per view) · secondary: other actions · quiet: a text action. */
  variant?: "primary" | "secondary" | "quiet";
  size?: "m" | "s";
  /** Working on it: keeps the label, adds the dots, blocks a second press. */
  busy?: boolean;
};

export function Button({ variant = "secondary", size = "m", busy = false, className, children, disabled, ...props }: ButtonProps) {
  return (
    <button
      type="button"
      data-variant={variant}
      data-size={size}
      aria-busy={busy || undefined}
      disabled={disabled || busy}
      className={cx("pc-button", className)}
      {...props}
    >
      {busy && <Dots />}
      {children}
    </button>
  );
}

type IconButtonProps = Omit<React.ComponentProps<"button">, "aria-label"> & {
  /** What pressing it does, in words: the tooltip and the accessible name. */
  label: string;
  /** For an on/off icon (a filter, a view): shown with the selected cells when true. */
  pressed?: boolean;
};

export function IconButton({ label, pressed, className, children, ...props }: IconButtonProps) {
  return (
    <Tip label={label}>
      <button
        type="button"
        aria-label={label}
        aria-pressed={pressed}
        className={cx("pc-icon-button", pressed !== undefined && "pc-selectable", className)}
        {...props}
      >
        {children}
      </button>
    </Tip>
  );
}
