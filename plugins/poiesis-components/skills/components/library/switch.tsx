import * as React from "react"
import { cn } from "./utils"
import { Switch as SwitchPrimitive } from "radix-ui"

function Switch({
  className,
  size = "default",
  ...props
}: React.ComponentProps<typeof SwitchPrimitive.Root> & {
  size?: "sm" | "default"
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      data-size={size}
      className={cn(
        "peer group/switch relative inline-flex shrink-0 items-center rounded-pill p-0.5 transition-all outline-none group-has-[:focus-visible]/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:ring-(length:--ring) focus-visible:ring-info aria-invalid:ring-(length:--ring) aria-invalid:ring-danger-strong data-[size=default]:h-5 data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-checked:bg-ink data-unchecked:bg-line data-disabled:cursor-not-allowed data-disabled:opacity-(--disabled)",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        // The track has an even 2px inset (p-0.5); the thumb fills the rest of its height and travels the width
        // left over: 32 − 4 − 16 = 12px (translate-x-3), small 24 − 4 − 10 = 10px (translate-x-2.5).
        className="pointer-events-none block rounded-pill bg-paper ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-2.5 group-data-[size=default]/switch:data-checked:translate-x-3 group-data-[size=sm]/switch:data-checked:translate-x-2.5 data-unchecked:translate-x-0"
      />
    </SwitchPrimitive.Root>
  )
}

export { Switch }
