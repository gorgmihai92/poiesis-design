// Pattern · dot map: the behavior of <po-dot-map>, things placed by two numbers, drawn as dots from the table
// it holds. The table is the data and stays on the page:
//   - each row is one thing: its name in the first column, the number along the level scale in the second, the
//     number up the upright scale in the third. More columns may follow; the map does not read them;
//   - a cell's number is its data-value when it has one, else its text when that reads as a number. A row with
//     a number missing, or one a scale cannot place (zero or less on a log scale), is left out and counted, and
//     the count is said under the map (unread-label), so nothing disappears quietly;
//   - a row's data-state gives its dot a verdict's mark: kept, weakened, dropped, and any other word is not
//     challenged. A row with no data-state is a plain dot. data-label asks for the name to be written beside the
//     dot; data-focus presses the dot at the start;
//   - each scale is named by its column's header (x-label, y-label to say it otherwise); x-scale and y-scale are
//     "linear" (default) or "log"; x-min, x-max, y-min, y-max fix an end of a scale; x-unit and y-unit follow
//     each number; x-signed and y-signed write a + before numbers above zero.
// Every dot is a button. The map is one stop for the Tab key and the arrow keys, Home and End move between dots,
// in the table's order (I1). Names are written where they do not run into each other: the pressed dot first,
// then the rows marked data-label, then the rest; the others show under the map while their dot is pointed at
// or has the focus. Pressing a dot sends "change" (detail.name, detail.index; index -1 when none is pressed).
// The verdict labels found in the rows are repeated once each under the map, as its key.
//
//   <po-dot-map y-scale="log" x-unit="%" y-unit="%">
//     <table>
//       <thead><tr><th scope="col">Topic</th><th scope="col">Growth a year</th><th scope="col">Share in 2025</th></tr></thead>
//       <tbody><tr data-state="kept" data-label><th scope="row">Topic A</th><td>32.0</td><td>4.00</td></tr></tbody>
//     </table>
//   </po-dot-map>
//
// Call refresh() after changing the table.

const VERDICTS = ["kept", "weakened", "dropped"]

const make = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}

// A cell's number, or null when it has none.
const read = (cell) => {
  if (!cell) return null
  const raw = (cell.dataset.value ?? cell.textContent).replace(/[\s  ]/g, "")
  if (raw === "") return null
  const value = Number(raw.replace(/^−/, "-"))
  return Number.isFinite(value) ? value : null
}

// Round steps between two ends: 1, 2 or 5 times a power of ten, about five of them.
const linearSteps = (low, high) => {
  const span = high - low || Math.abs(high) || 1
  const rough = span / 5
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].find((m) => m * magnitude >= rough) * magnitude
  const first = Math.floor(low / step + 1e-9) * step
  const ticks = []
  for (let i = 0; first + i * step <= high + step * (1 - 1e-9); i++) ticks.push(Number((first + i * step).toPrecision(12)))
  return ticks
}
const logSteps = (low, high) => {
  const ticks = []
  for (let power = Math.floor(Math.log10(low)); power <= Math.ceil(Math.log10(high)); power++) {
    for (const m of [1, 2, 5]) ticks.push(Number((m * 10 ** power).toPrecision(12)))
  }
  const from = ticks.findLast((t) => t <= low) ?? ticks[0]
  const to = ticks.find((t) => t >= high) ?? ticks.at(-1)
  return ticks.filter((t) => t >= from && t <= to)
}

class PoDotMap extends HTMLElement {
  static observedAttributes = [
    "x-label", "y-label", "x-scale", "y-scale", "x-min", "x-max", "y-min", "y-max",
    "x-unit", "y-unit", "x-signed", "y-signed", "numbers-label", "unread-label",
  ]
  #table = null
  #parts = null
  #data = null
  #pressed = -1
  #active = 0
  #shown = -1
  #sizes = null

  connectedCallback() {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", () => this.refresh(), { once: true })
    else this.refresh()
  }

  disconnectedCallback() {
    this.#sizes?.disconnect()
    this.#sizes = null
  }

  attributeChangedCallback() {
    if (this.#parts) this.refresh()
  }

  // Reads the table again and draws it.
  refresh() {
    this.#table ??= this.querySelector("table")
    const table = this.#table
    if (!table?.tHead?.rows[0] || !table.tBodies[0]) return
    if (!this.#parts) this.#scaffold(table)
    this.#data = this.#read(table)
    this.#draw()
    if (!this.#sizes && this.isConnected) {
      this.#sizes = new ResizeObserver(() => this.#place())
      this.#sizes.observe(this)
    }
    this.#place()
    this.setAttribute("data-drawn", "")
  }

  #scaffold(table) {
    const upright = make("p", "po-dot-map-axis")
    upright.dataset.axis = "y"
    const level = make("p", "po-dot-map-axis")
    level.dataset.axis = "x"
    const chart = make("div", "po-dot-map-chart")
    const scaleY = make("div", "po-dot-map-scale")
    scaleY.dataset.axis = "y"
    const scaleX = make("div", "po-dot-map-scale")
    scaleX.dataset.axis = "x"
    for (const hidden of [scaleY, scaleX]) hidden.setAttribute("aria-hidden", "true")
    const plot = make("div", "po-dot-map-plot")
    plot.setAttribute("role", "group")
    chart.append(scaleY, plot, scaleX)
    const readout = make("p", "po-dot-map-readout")
    const key = make("div", "po-dot-map-key")
    const numbers = make("details", "po-collapsible po-dot-map-numbers")
    const summary = make("summary", "po-pressable")
    const holder = make("div")
    numbers.append(summary, holder)
    table.before(upright, chart, level, readout, key, numbers)
    holder.append(table)
    plot.addEventListener("keydown", this.#keys)
    this.#parts = { upright, level, scaleY, scaleX, plot, readout, key, summary, dots: [] }
    const rows = [...table.tBodies[0].rows]
    this.#pressed = rows.findIndex((r) => r.hasAttribute("data-focus"))
    this.#active = Math.max(0, this.#pressed)
  }

  #axis(name, values) {
    const log = this.getAttribute(`${name}-scale`) === "log"
    const usable = values.filter((v) => v !== null && (!log || v > 0))
    const end = (which) => {
      const given = Number(this.getAttribute(`${name}-${which}`))
      return this.hasAttribute(`${name}-${which}`) && Number.isFinite(given) && (!log || given > 0) ? given : null
    }
    let low = end("min") ?? (usable.length ? Math.min(...usable) : log ? 1 : 0)
    let high = end("max") ?? (usable.length ? Math.max(...usable) : log ? 10 : 1)
    if (high < low) [low, high] = [high, low]
    const ticks = log ? logSteps(low, high) : linearSteps(low, high)
    if (end("min") === null) low = Math.min(low, ticks[0])
    if (end("max") === null) high = Math.max(high, ticks.at(-1))
    const shown = ticks.filter((t) => t >= low && t <= high)
    const at = (value) => {
      if (value === null || (log && value <= 0)) return null
      const share = log ? (Math.log(value) - Math.log(low)) / (Math.log(high) - Math.log(low) || 1) : (value - low) / (high - low || 1)
      return share < -1e-9 || share > 1 + 1e-9 ? null : Math.min(100, Math.max(0, share * 100))
    }
    return { log, low, high, ticks: shown, at }
  }

  #read(table) {
    const head = [...table.tHead.rows[0].cells]
    const rows = [...table.tBodies[0].rows]
    const things = rows.map((row) => ({
      row,
      name: row.cells[0]?.textContent.trim() ?? "",
      x: read(row.cells[1]),
      y: read(row.cells[2]),
      xWords: row.cells[1]?.textContent.trim() ?? "",
      yWords: row.cells[2]?.textContent.trim() ?? "",
      state: row.hasAttribute("data-state") ? row.getAttribute("data-state") : null,
      wanted: row.hasAttribute("data-label"),
      verdict: row.querySelector(".po-verdict"),
    }))
    const x = this.#axis("x", things.map((t) => t.x))
    const y = this.#axis("y", things.map((t) => t.y))
    for (const thing of things) {
      thing.left = x.at(thing.x)
      thing.bottom = y.at(thing.y)
      thing.placed = thing.left !== null && thing.bottom !== null
    }
    return {
      things, x, y,
      xLabel: this.getAttribute("x-label") ?? head[1]?.textContent.trim() ?? "",
      yLabel: this.getAttribute("y-label") ?? head[2]?.textContent.trim() ?? "",
      unread: things.filter((t) => !t.placed).length,
    }
  }

  #words(value, axis) {
    const lang = this.closest("[lang]")?.lang || undefined
    let words
    try { words = new Intl.NumberFormat(lang, { maximumFractionDigits: 6 }).format(value) } catch { words = String(value) }
    const sign = this.hasAttribute(`${axis}-signed`) && value > 0 ? "+" : ""
    return `${sign}${words}${this.getAttribute(`${axis}-unit`) ?? ""}`
  }

  #draw() {
    const { upright, level, scaleY, scaleX, plot, key, summary } = this.#parts
    const { things, x, y, xLabel, yLabel } = this.#data
    upright.textContent = yLabel
    level.textContent = xLabel
    plot.setAttribute("aria-label", [yLabel, xLabel].filter(Boolean).join(" · "))
    summary.textContent = this.getAttribute("numbers-label") ?? "The numbers"

    // The scales and their lines.
    const yWords = y.ticks.map((t) => this.#words(t, "y"))
    scaleY.replaceChildren(make("span", "po-dot-map-sizer", yWords.reduce((a, b) => (b.length > a.length ? b : a), "")))
    scaleX.replaceChildren()
    for (const old of plot.querySelectorAll(".po-dot-map-rule")) old.remove()
    const rule = (axis, at, base) => {
      const line = make("span", "po-dot-map-rule")
      line.dataset.axis = axis
      line.style[axis === "x" ? "left" : "bottom"] = `${at}%`
      if (base) line.setAttribute("data-base", "")
      plot.prepend(line)
    }
    y.ticks.forEach((t, i) => {
      const at = y.at(t)
      const label = make("span", "", yWords[i])
      label.style.bottom = `${at}%`
      scaleY.append(label)
      rule("y", at, y.log ? i === 0 : t === 0 || (i === 0 && !y.ticks.includes(0)))
    })
    x.ticks.forEach((t, i) => {
      const at = x.at(t)
      const label = make("span", "", this.#words(t, "x"))
      label.style.left = `${at}%`
      scaleX.append(label)
      rule("x", at, x.log ? i === 0 : t === 0 || (i === 0 && !x.ticks.includes(0)))
    })

    // The dots: one button for each row that can be placed, kept between drawings so the focus stays.
    const dots = this.#parts.dots
    while (dots.length > things.length) dots.pop().remove()
    if (!things[this.#pressed]?.placed) this.#pressed = -1
    if (!things[this.#active]?.placed) this.#active = Math.max(0, things.findIndex((t) => t.placed))
    things.forEach((thing, i) => {
      const dot = (dots[i] ??= this.#dot(i))
      dot.hidden = !thing.placed
      if (!thing.placed) return
      dot.style.left = `${thing.left}%`
      dot.style.bottom = `${thing.bottom}%`
      if (thing.state === null) delete dot.dataset.state
      else dot.dataset.state = VERDICTS.includes(thing.state) ? thing.state : "none"
      dot.lastElementChild.textContent = thing.name
      dot.setAttribute("aria-label", this.#say(thing, ": ", ", "))
      dot.setAttribute("aria-pressed", String(i === this.#pressed))
      dot.tabIndex = i === this.#active ? 0 : -1
      if (dot.parentElement !== plot) plot.append(dot)
    })

    // The key: each verdict label found in the rows, once.
    const seen = new Set()
    key.replaceChildren(...things.flatMap((thing) => {
      const label = thing.verdict
      const id = label ? `${label.dataset.state ?? ""}|${label.textContent.trim()}` : null
      if (!label || seen.has(id)) return []
      seen.add(id)
      return [label.cloneNode(true)]
    }))
    key.hidden = !key.childElementCount
    this.#tell()
    if (this.#data.unread) this.setAttribute("data-unread", String(this.#data.unread))
    else this.removeAttribute("data-unread")
  }

  // One thing in words: its name, each number with the name of its scale, and its verdict when it has one.
  #say(thing, afterName, between) {
    const { xLabel, yLabel } = this.#data
    const parts = [`${xLabel} ${thing.xWords}`.trim(), `${yLabel} ${thing.yWords}`.trim()]
    if (thing.verdict) parts.push(thing.verdict.textContent.trim())
    return `${thing.name}${afterName}${parts.filter(Boolean).join(between)}`
  }

  #dot(index) {
    const dot = make("button", "po-pressable po-dot")
    dot.type = "button"
    dot.append(make("span", "po-dot-mark"), make("span", "po-dot-name"))
    dot.addEventListener("click", () => {
      this.#pressed = this.#pressed === index ? -1 : index
      this.#active = index
      this.#draw()
      this.#place()
      const name = this.#pressed < 0 ? "" : this.#data.things[this.#pressed].name
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { name, index: this.#pressed } }))
    })
    const show = () => { this.#shown = index; this.#tell() }
    const rest = () => { if (this.#shown === index) { this.#shown = -1; this.#tell() } }
    dot.addEventListener("pointerenter", show)
    dot.addEventListener("pointerleave", rest)
    dot.addEventListener("focus", () => { this.#active = index; this.#roving(); show() })
    dot.addEventListener("blur", rest)
    return dot
  }

  #roving() {
    this.#parts.dots.forEach((dot, i) => { dot.tabIndex = i === this.#active ? 0 : -1 })
  }

  // The words under the map: what could not be placed, else the dot pointed at, else the pressed one.
  #tell() {
    const { readout } = this.#parts
    const { things, unread } = this.#data
    const words = this.getAttribute("unread-label") ?? "rows could not be placed and are not drawn"
    const thing = things[this.#shown >= 0 ? this.#shown : this.#pressed]
    readout.textContent = [unread ? `${unread} ${words}` : "", thing?.placed ? this.#say(thing, " · ", " · ") : ""].filter(Boolean).join(" · ")
  }

  #keys = (event) => {
    const dots = this.#parts.dots
    const open = dots.map((dot, i) => (dot.hidden ? -1 : i)).filter((i) => i >= 0)
    const here = open.indexOf(this.#active)
    const to = { ArrowRight: here + 1, ArrowDown: here + 1, ArrowLeft: here - 1, ArrowUp: here - 1, Home: 0, End: open.length - 1 }[event.key]
    if (to === undefined || !open.length) return
    event.preventDefault()
    dots[open[(to + open.length) % open.length]].focus()
  }

  // Which names are written beside their dots. It runs again whenever the width changes.
  #place() {
    if (!this.#parts || !this.#data) return
    const { plot } = this.#parts
    const { things } = this.#data
    const dots = this.#parts.dots
    const width = plot.clientWidth
    const height = plot.clientHeight
    if (!width || !height) return
    const hit = dots.find((dot) => !dot.hidden)?.offsetHeight ?? 0
    for (const dot of dots) {
      dot.lastElementChild.hidden = false
      delete dot.dataset.side
    }
    const sizes = dots.map((dot) => (dot.hidden ? 0 : dot.lastElementChild.offsetWidth))
    const centres = things.map((t) => (t.placed ? { x: (t.left / 100) * width, y: height - (t.bottom / 100) * height } : null))
    const half = hit / 3
    const marks = centres.map((c) => (c ? { left: c.x - half, right: c.x + half, top: c.y - half, bottom: c.y + half } : null))
    const crosses = (a, b) => a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom
    const taken = []
    const order = things.map((_, i) => i).filter((i) => things[i].placed).sort((a, b) =>
      (b === this.#pressed) - (a === this.#pressed) || things[b].wanted - things[a].wanted || a - b)
    for (const i of order) {
      const c = centres[i]
      const box = (side) => side === "end"
        ? { left: c.x + hit / 2, right: c.x + hit / 2 + sizes[i], top: c.y - hit / 2, bottom: c.y + hit / 2 }
        : { left: c.x - hit / 2 - sizes[i], right: c.x - hit / 2, top: c.y - hit / 2, bottom: c.y + hit / 2 }
      const free = (b) => b.left >= 0 && b.right <= width
        && !taken.some((t) => crosses(b, t)) && !marks.some((m, j) => m && j !== i && crosses(b, m))
      const side = ["end", "start"].find((s) => free(box(s)))
      if (side) {
        taken.push(box(side))
        if (side === "start") dots[i].dataset.side = "start"
      } else dots[i].lastElementChild.hidden = true
    }
  }
}

if (!customElements.get("po-dot-map")) customElements.define("po-dot-map", PoDotMap)

export { PoDotMap }
