import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center rounded-md border border-transparent bg-clip-padding text-ui font-strong whitespace-nowrap transition-all outline-none select-none focus-visible:border-info focus-visible:ring-(length:--ring) focus-visible:ring-info active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-(--disabled) aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-(--icon)",
  {
    variants: {
      variant: {
        default: "bg-ink text-paper hover:opacity-(--hover)",
        outline:
          "border-line bg-paper hover:not-aria-expanded:bg-surface hover:not-aria-expanded:text-ink aria-expanded:bg-selected aria-expanded:hover:opacity-(--hover) aria-expanded:text-selected-foreground",
        secondary:
          "bg-surface text-ink hover:not-aria-expanded:opacity-(--hover) aria-expanded:bg-selected aria-expanded:hover:opacity-(--hover) aria-expanded:text-selected-foreground",
        ghost:
          "hover:not-aria-expanded:bg-surface hover:not-aria-expanded:text-ink aria-expanded:bg-selected aria-expanded:hover:opacity-(--hover) aria-expanded:text-selected-foreground",
        danger:
          "bg-danger text-paper hover:opacity-(--hover) focus-visible:ring-danger",
        link: "text-info underline-offset-4 hover:underline",
        /** A link that is not an action (a byline, a credit): the color and weight of the text around it (H3). */
        quiet: "text-inherit font-regular underline-offset-4 hover:underline",
      },
      size: {
        default:
          "h-(--control-md) gap-1.5 px-(--control-pad) has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        xs: "h-(--control-xs) gap-1 rounded-md px-(--control-pad-sm) text-ui font-strong in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        sm: "h-(--control-sm) gap-1 rounded-md px-(--control-pad) text-ui font-strong in-data-[slot=button-group]:rounded-md has-data-[icon=inline-end]:pr-1.5 has-data-[icon=inline-start]:pl-1.5 [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        lg: "h-(--control-lg) gap-1.5 px-(--control-pad) has-data-[icon=inline-end]:pr-2 has-data-[icon=inline-start]:pl-2",
        icon: "size-(--control-md)",
        "icon-xs":
          "size-(--control-xs) rounded-md in-data-[slot=button-group]:rounded-md [&_svg:not([class*='size-'])]:size-(--icon-sm)",
        "icon-sm":
          "size-(--control-sm) rounded-md in-data-[slot=button-group]:rounded-md",
        "icon-lg": "size-(--control-lg)",
        /** A text action inside a sentence (with variant "link"): no box, it keeps the line's height. */
        inline: "h-auto gap-1 p-0 align-baseline",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
