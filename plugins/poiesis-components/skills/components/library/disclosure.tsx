// Disclosure: hides secondary content under its name; the arrow points down when closed and up when open. A
// button with aria-expanded, so Enter and Space work and the state is heard. Rules: R1 the state shows · W3
// keeps rare things out of the way · I1 keyboard · I5 the arrow turns only without reduced motion.
import { Collapsible as C } from "radix-ui";
import type * as React from "react";
import "./base.css";
import "./disclosure.css";

export function Disclosure({ title, children, defaultOpen, open, onOpenChange }: {
  title: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <C.Root defaultOpen={defaultOpen} open={open} onOpenChange={onOpenChange}>
      <C.Trigger className="pc-disclosure__trigger">
        {title}
        <svg viewBox="0 0 10 6" aria-hidden className="pc-disclosure__arrow" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square">
          <path d="M1 1l4 4 4-4" />
        </svg>
      </C.Trigger>
      <C.Content className="pc-disclosure__content">{children}</C.Content>
    </C.Root>
  );
}
