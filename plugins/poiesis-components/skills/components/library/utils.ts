import { clsx, type ClassValue } from "clsx"
import { extendTailwindMerge } from "tailwind-merge"

// The Poiesis names (poiesis.css) for tailwind-merge: text-ui is a font size, font-strong a weight, and so on.
// Without this it reads an unknown name as a color and drops it whenever a color follows, as on every button.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["ui", "md"],
      font: ["body", "display"],
      "font-weight": ["regular", "strong", "heading"],
      leading: ["body", "ui", "heading", "display"],
      tracking: ["body", "heading"],
      radius: ["pill"],
    },
  },
})

/** Joins class names; later Tailwind classes win over earlier ones. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
