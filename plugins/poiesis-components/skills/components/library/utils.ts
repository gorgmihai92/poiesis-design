import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// text-ui is a font size (the components' one text size, T6), not a color: without this, tailwind-merge drops it
// whenever a text color follows, as on every button.
const twMerge = extendTailwindMerge({ extend: { theme: { text: ["ui"] } } })

/** Joins class names; later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
