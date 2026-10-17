// Button: one action. IconButton: an action shown as an icon, always named (its label is the tooltip and the
// accessible name). Rules: L2 the label says the result · F1 busy shows at once and blocks a second press, while
// focus stays on the button (aria-disabled, not disabled) · E1 a disabled button can say why (`reason`: its
// tooltip and description, and it stays focusable to reach them) · I1 native button, keyboard · I3 named ·
// I4 at least 24px · G1 shape from cells · H3 one primary per view.
import { useId } from "react";
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
  /** Working on it: keeps the label, adds the dots, blocks a second press. Change the label too ("Saving…"). */
  busy?: boolean;
  /** Why it is disabled, in words: shown as its tooltip and read with it. */
  reason?: string;
};

export function Button({ variant = "secondary", size = "m", busy = false, reason, className, children, disabled, onClick, ...props }: ButtonProps) {
  const id = useId();
  // Busy, or disabled with a reason, stays focusable: aria-disabled and a blocked click instead of `disabled`.
  const soft = busy || (disabled && reason);
  const button = (
    <button
      type="button"
      data-variant={variant}
      data-size={size}
      aria-busy={busy || undefined}
      aria-disabled={soft ? true : undefined}
      aria-describedby={disabled && reason ? `${id}-reason` : undefined}
      disabled={disabled && !reason ? true : undefined}
      onClick={(e) => (soft ? e.preventDefault() : onClick?.(e))}
      className={cx("pc-button", className)}
      {...props}
    >
      {busy && <Dots />}
      {children}
    </button>
  );
  if (!(disabled && reason)) return button;
  // The reason sits outside the button, so it is its description and not part of its name.
  return (
    <>
      <Tip label={reason}>{button}</Tip>
      <span id={`${id}-reason`} className="pc-sr-only">{reason}</span>
    </>
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
