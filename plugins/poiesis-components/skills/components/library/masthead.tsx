import * as React from "react"
import { cn } from "./utils"

/** The top of a page or app: its name, a quiet byline, and one call to action (H3). */
function Masthead({ className, ...props }: React.ComponentProps<"header">) {
  return (
    <header
      data-slot="masthead"
      className={cn("grid justify-items-start gap-2 text-ui font-regular text-ink", className)}
      {...props}
    />
  )
}

/** The name, on one line with its byline. */
function MastheadTitle({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="masthead-title" className={cn(className)} {...props} />
}

function MastheadName({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="masthead-name" className={cn("font-strong", className)} {...props} />
}

/** Who made it, in muted; a link inside takes the same color (Button variant "quiet", size "inline"). */
function MastheadByline({ className, ...props }: React.ComponentProps<"span">) {
  return <span data-slot="masthead-byline" className={cn("text-muted", className)} {...props} />
}

/** What it is, in one muted line under the name, so the first screen says it (copy O2). */
function MastheadDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="masthead-description" className={cn("text-muted", className)} {...props} />
}

export { Masthead, MastheadTitle, MastheadName, MastheadByline, MastheadDescription }
