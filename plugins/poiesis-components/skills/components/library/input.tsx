import * as React from "react"
import { cn } from "./utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "h-(--control-md) w-full min-w-0 rounded-md border border-line bg-transparent px-(--control-pad) py-1 text-ui font-regular transition-colors outline-none file:inline-flex file:h-(--control-xs) file:border-0 file:bg-transparent file:text-ui file:font-regular file:text-ink placeholder:text-muted focus-visible:border-info focus-visible:ring-(length:--ring) focus-visible:ring-info disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-surface disabled:opacity-(--disabled) aria-invalid:border-danger aria-invalid:focus-visible:border-danger aria-invalid:focus-visible:ring-danger",
        className
      )}
      {...props}
    />
  )
}

export { Input }
