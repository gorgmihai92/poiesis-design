import * as React from "react"
import { Button } from "./button"
import { cn } from "./utils"

type SectionNavItem = { id: string; title: React.ReactNode; description?: React.ReactNode }

/** Navigation for a long page of sections, in a side column. On wide screens one row per section: rows of
 *  sections already passed stack at the top, rows still to come at the bottom, and each row rides up with its
 *  section as it scrolls into view. The current row is ink and shows its description, which the next row closes
 *  as it arrives; the others are faint, darkening as they near the current place (H5, text-nearness). On narrow
 *  screens it is the header and a wrapped list of links. Each item's id is the id of its section on the page. */
function SectionNav({
  items,
  header,
  className,
  "aria-label": label = "Sections",
}: {
  items: SectionNavItem[]
  header?: React.ReactNode
  className?: string
  "aria-label"?: string
}) {
  const area = React.useRef<HTMLDivElement>(null)
  const head = React.useRef<HTMLDivElement>(null)
  const rows = React.useRef<(HTMLLIElement | null)[]>([])
  const notes = React.useRef<(HTMLDivElement | null)[]>([])
  const [active, setActive] = React.useState(0)

  React.useLayoutEffect(() => {
    let frame = 0
    const place = () => {
      frame = 0
      const box = area.current
      if (!box || !box.offsetParent) return
      const boxTop = box.getBoundingClientRect().top
      const height = box.clientHeight
      const start = head.current?.offsetHeight ?? 0
      const row = rows.current[0]?.querySelector("a")?.offsetHeight ?? 0
      const n = items.length
      // Where each row would be if it scrolled with its section's top edge.
      const natural = items.map(({ id }) => (document.getElementById(id)?.getBoundingClientRect().top ?? 0) - boxTop)
      let current = 0
      natural.forEach((y, i) => { if (y <= start + i * row + 0.5) current = i })
      natural.forEach((y, i) => {
        const top = start + i * row
        const bottom = height - (n - i) * row
        const pos = i <= current ? top : Math.min(Math.max(y, top), bottom)
        const li = rows.current[i]
        if (li) {
          li.style.transform = `translateY(${pos}px)`
          const near = i === current ? 1 : i < current || bottom <= top ? 0 : (bottom - pos) / (bottom - top)
          li.style.setProperty("--nearness", `${Math.round(Math.min(Math.max(near, 0), 1) * 100)}%`)
        }
        const note = notes.current[i]
        if (note) {
          const room = i + 1 < n ? natural[i + 1] - (top + row) : Infinity
          note.style.height = i === current ? `${Math.max(0, Math.min(note.scrollHeight, room))}px` : "0px"
        }
      })
      setActive(current)
    }
    const queue = () => { if (!frame) frame = requestAnimationFrame(place) }
    place()
    window.addEventListener("scroll", queue, { passive: true })
    window.addEventListener("resize", queue)
    document.fonts?.ready.then(queue)
    return () => {
      window.removeEventListener("scroll", queue)
      window.removeEventListener("resize", queue)
      cancelAnimationFrame(frame)
    }
  }, [items])

  return (
    <div data-slot="section-nav" className={cn("text-ui font-regular", className)}>
      <nav aria-label={label} className="sticky top-0 hidden h-svh lg:block">
        <div ref={area} className="absolute inset-x-0 top-8 bottom-8 overflow-hidden">
          {header && <div ref={head} className="absolute inset-x-0 top-0 px-(--control-pad) pb-(--subsection-space)">{header}</div>}
          <ul>
            {items.map((item, i) => (
              <li key={item.id} ref={(el) => { rows.current[i] = el }} className="absolute inset-x-0 top-0 bg-paper">
                <Button variant="ghost" size="sm" asChild className="w-full justify-start text-nearness">
                  <a href={`#${item.id}`} aria-current={i === active ? "location" : undefined}>{item.title}</a>
                </Button>
                {item.description && (
                  <div ref={(el) => { notes.current[i] = el }} className="h-0 overflow-hidden px-(--control-pad) text-muted">
                    <p className="pt-1 pb-2">{item.description}</p>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>
      <nav aria-label={label} className="grid gap-(--block-pad) pt-8 lg:hidden">
        {header && <div className="px-(--control-pad)">{header}</div>}
        <ul className="flex flex-wrap">
          {items.map((item) => (
            <li key={item.id}>
              <Button variant="ghost" size="sm" asChild className="text-muted">
                <a href={`#${item.id}`}>{item.title}</a>
              </Button>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}

export { SectionNav, type SectionNavItem }
