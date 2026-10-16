// Switch: an on/off setting that applies at once, the label beside it. A button with role="switch": Space and
// Enter toggle it, screen readers hear its state. Rules: I1 keyboard · I3 named by its label · R2 the caller
// remembers the choice · C4 on/off also by the thumb's position · I5 no motion under reduced motion.
import { cx } from "./cx.js";
import "./base.css";
import "./switch.css";

export function Switch({ checked, onChange, label, id, className }: {
  checked: boolean;
  onChange: (on: boolean) => void;
  label: React.ReactNode;
  id?: string;
  className?: string;
}) {
  return (
    <button id={id} type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={cx("pc-switch", className)}>
      <span>{label}</span>
      <span aria-hidden className="pc-switch__track">
        <span className="pc-switch__thumb" />
      </span>
    </button>
  );
}
