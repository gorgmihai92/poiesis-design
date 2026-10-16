// Field: a labelled input with an optional hint and error. The label is visible and names the input; hint and
// error are tied to it (aria-describedby), the error also by aria-invalid and a red square, never color alone.
// The error says what happened and what to do, next to the input, and keeps what was typed. Rules: I3 · E1
// constraints shown in the hint · E2 · C4 · G2 the input differs from the page by a surface step or a line.
import { useId } from "react";
import type * as React from "react";
import { cx } from "./cx.js";
import "./base.css";
import "./field.css";

export function Field({ label, hint, error, className, ...input }: React.ComponentProps<"input"> & {
  label: React.ReactNode;
  hint?: React.ReactNode;
  /** What went wrong and what to do now. */
  error?: React.ReactNode;
}) {
  const id = useId();
  const described = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cx("pc-field", className)}>
      <label htmlFor={id} className="pc-field__label">{label}</label>
      <input id={id} className="pc-input" aria-describedby={described} aria-invalid={error ? true : undefined} {...input} />
      {hint && <p id={`${id}-hint`} className="pc-field__hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="pc-field__error" role="alert">{error}</p>}
    </div>
  );
}
