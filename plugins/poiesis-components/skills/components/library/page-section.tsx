import * as React from "react"
import { cn } from "./utils"

/** One section of a page: a divider on top (none on the first), the content near it, and the section's space after
 *  it (H4). Its parts sit --subsection-space apart, one level down (S2). Give it an id to link to it. */
function PageSection({ className, ...props }: React.ComponentProps<"section">) {
  return (
    <section
      data-slot="page-section"
      className={cn(
        "grid gap-(--subsection-space) border-t border-divider pt-(--block-pad) pb-(--section-space) text-ui font-regular text-ink first:border-t-0 first:pt-0",
        className
      )}
      {...props}
    />
  )
}

function PageSectionHeader({ className, ...props }: React.ComponentProps<"header">) {
  return <header data-slot="page-section-header" className={cn("grid gap-1", className)} {...props} />
}

function PageSectionTitle({ className, ...props }: React.ComponentProps<"h2">) {
  return <h2 data-slot="page-section-title" className={cn("font-strong", className)} {...props} />
}

function PageSectionDescription({ className, ...props }: React.ComponentProps<"p">) {
  return <p data-slot="page-section-description" className={cn("text-muted", className)} {...props} />
}

export { PageSection, PageSectionHeader, PageSectionTitle, PageSectionDescription }
