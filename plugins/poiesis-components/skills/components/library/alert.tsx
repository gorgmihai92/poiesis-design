import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "./utils"

const alertVariants = cva(
  // A row on the page, not a box: no fill, no border; the role shows in the icon's color only.
  "group/alert relative grid w-full gap-0.5 text-left text-ui font-strong text-ink has-data-[slot=alert-action]:pr-18 has-[>svg]:grid-cols-[auto_1fr] has-[>svg]:gap-x-2 *:[svg]:row-span-2 *:[svg]:translate-y-0.5 *:[svg]:text-ink *:[svg:not([class*='size-'])]:size-(--icon)",
  {
    variants: {
      variant: {
        default: "",
        info: "*:[svg]:text-info",
        success: "*:[svg]:text-success",
        warning: "*:[svg]:text-warning",
        caution: "*:[svg]:text-caution",
        danger: "*:[svg]:text-danger",
        new: "*:[svg]:text-new",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Alert({
  className,
  variant,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    />
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "font-strong group-has-[>svg]/alert:col-start-2 [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ink",
        className
      )}
      {...props}
    />
  )
}

function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "text-ui font-strong text-balance text-ink md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ink [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("absolute top-1/2 right-0 -translate-y-1/2", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
