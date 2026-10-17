import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"
import { Toggle as TogglePrimitive } from "radix-ui"

const toggleVariants = cva(
  "group/toggle inline-flex items-center justify-center gap-1 rounded-md text-ui font-strong whitespace-nowrap transition-all outline-none hover:not-data-on:bg-hover hover:text-ink focus-visible:border-info focus-visible:ring-(length:--ring) focus-visible:ring-info disabled:pointer-events-none disabled:opacity-(--disabled) aria-invalid:border-danger-strong aria-invalid:ring-danger-tint data-on:bg-selected data-on:text-selected-foreground data-on:shadow-[inset_0_0_0_var(--selected-ring)_var(--info)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon)",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline: "border border-line bg-transparent",
      },
      size: {
        default:
          "h-(--control-md) min-w-(--control-md) px-(--control-pad) has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        sm: "h-(--control-sm) min-w-(--control-sm) rounded-md px-(--control-pad) text-ui has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        lg: "h-(--control-lg) min-w-(--control-lg) px-(--control-pad) has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Toggle({
  className,
  variant = "default",
  size = "default",
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Toggle, toggleVariants }
