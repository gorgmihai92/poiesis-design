import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { CircleCheck, CircleX, Info, OctagonAlert, Sparkles, TriangleAlert } from "lucide-react"
import { cn } from "./utils"

// A row on the page, not a box: no fill, no border. The icon carries the role (its color and its shape), so every
// variant draws its own and no alert appears without one. Title, description and action stack beside it.
const alertVariants = cva(
  "group/alert grid w-full grid-cols-[auto_1fr] gap-x-2 gap-y-0.5 text-left text-ui font-strong text-ink *:[svg]:row-span-3 *:[svg]:translate-y-0.5 *:[svg]:size-(--icon)",
  {
    variants: {
      variant: {
        default: "*:[svg]:text-ink",
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

const icons = {
  default: Info,
  info: Info,
  success: CircleCheck,
  warning: TriangleAlert,
  caution: OctagonAlert,
  danger: CircleX,
  new: Sparkles,
}

function Alert({
  className,
  variant,
  children,
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof alertVariants>) {
  const Icon = icons[variant ?? "default"]
  return (
    <div
      data-slot="alert"
      role="alert"
      className={cn(alertVariants({ variant }), className)}
      {...props}
    >
      <Icon aria-hidden="true" />
      {children}
    </div>
  )
}

function AlertTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-title"
      className={cn(
        "col-start-2 text-ui font-strong text-ink [&_a]:underline [&_a]:underline-offset-3",
        className
      )}
      {...props}
    />
  )
}

/** Under a title it is secondary (muted); alone it is the message (ink). */
function AlertDescription({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-description"
      className={cn(
        "col-start-2 text-ui font-strong text-balance text-ink group-has-data-[slot=alert-title]/alert:text-muted md:text-pretty [&_a]:underline [&_a]:underline-offset-3 [&_a]:hover:text-ink [&_p:not(:last-child)]:mb-4",
        className
      )}
      {...props}
    />
  )
}

/** The action belongs to the message: it sits under the text, aligned with it. */
function AlertAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="alert-action"
      className={cn("col-start-2 pt-1", className)}
      {...props}
    />
  )
}

export { Alert, AlertTitle, AlertDescription, AlertAction }
