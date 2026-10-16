// Notice: a short status line with an optional action and close button, announced politely (role="status").
// Use one slot for every notice of a kind, so switching between them moves nothing. Something that closes on a
// timer shows the count and has a close button (K4). Rules: F1, F3 announced · K1 a visible close · K3 · L2.
import type * as React from "react";
import { IconButton } from "./button.js";
import { cx } from "./cx.js";
import "./notice.css";

export function Notice({ children, action, onClose, closeLabel = "Close", className }: {
  children: React.ReactNode;
  action?: React.ReactNode;
  onClose?: () => void;
  /** The close button's name, in the product's language. */
  closeLabel?: string;
  className?: string;
}) {
  return (
    <div role="status" className={cx("pc-notice", className)}>
      <span className="pc-notice__text">{children}</span>
      {(action || onClose) && (
        <span className="pc-notice__actions">
          {action}
          {onClose && (
            <IconButton label={closeLabel} onClick={onClose}>
              <svg viewBox="0 0 10 10" aria-hidden fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M1 1l8 8M9 1l-8 8" />
              </svg>
            </IconButton>
          )}
        </span>
      )}
    </div>
  );
}
