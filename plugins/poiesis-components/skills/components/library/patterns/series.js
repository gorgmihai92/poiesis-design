// Pattern · series: the behavior of <po-series>, one or more counts over time, drawn as lines from the table it
// holds. The table is the data and stays on the page:
//   - its first column holds the periods (years), every other column one series, named by its header; a header
//     with data-focus is the line in ink at the start;
//   - a cell's number is its data-value when it has one, else its text when that reads as a number. An empty
//     cell is a gap in its line, never a zero. A cell whose words are not a number is left out and counted, and
//     the count is said under the lines (unread-label), so nothing disappears quietly;
//   - a row with data-partial is a period that is not complete: the line reaches it dashed, its point is hollow
//     and its tick carries the attribute's word ("partial" when it has none). Say it in the row's header too,
//     which is what a screen reader reads, and give the header the period alone as data-value:
//     <th scope="row" data-value="2026">2026 (partial)</th>;
//   - the scale starts at zero. min="…" starts it elsewhere (a number, or "auto" for just under the lowest
//     value), and then the line above the drawing says so, in the words of from-label ("the scale starts at");
//   - each line is named at its end by a button. Pressing one keeps that line in ink and sends "change"
//     (detail.name, detail.index; index -1 when no line is kept). Where the names do not fit beside the lines,
//     they stand in a row above them;
//   - pointing at the lines shows that period's values in words under them.
// The drawing is hidden from assistive technology: the table, moved into a collapsible named by numbers-label
// ("The numbers"), holds the same values and is the keyboard's way to them (I1). Nothing in it moves by itself.
//
//   <po-series unit="per 100,000 articles">
//     <table>
//       <thead><tr><th scope="col">Year</th><th scope="col" data-focus>Quantum computing</th></tr></thead>
//       <tbody><tr><th scope="row">2024</th><td>84.2</td></tr></tbody>
//     </table>
//   </po-series>
//
// Call refresh() after changing the table.

const SVG = "http://www.w3.org/2000/svg"
const NARROW = 26 // rem: under this width the names stand in a row above the lines

const make = (tag, className, text) => {
  const node = document.createElement(tag)
  if (className) node.className = className
  if (text != null) node.textContent = text
  return node
}
const shape = (tag, attrs) => {
  const node = document.createElementNS(SVG, tag)
  for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value)
  return node
}

// A cell's number: null for an empty cell (a gap), NaN for words that are not a number.
const read = (cell) => {
  if (!cell) return null
  const raw = (cell.dataset.value ?? cell.textContent).replace(/[\s  ]/g, "")
  if (raw === "") return null
  const value = Number(raw.replace(/^\u2212/, "-"))
  return Number.isFinite(value) ? value : NaN
}

// Round steps for a scale: 1, 2 or 5 times a power of ten, about four of them.
const steps = (low, high) => {
  const span = high - low || Math.abs(high) || 1
  const rough = span / 4
  const magnitude = 10 ** Math.floor(Math.log10(rough))
  const step = [1, 2, 5, 10].find((m) => m * magnitude >= rough) * magnitude
  const first = Math.floor(low / step) * step
  const ticks = []
  for (let i = 0; first + i * step <= high + step * (1 - 1e-9); i++) ticks.push(Number((first + i * step).toPrecision(12)))
  return ticks
}

class PoSeries extends HTMLElement {
  static observedAttributes = ["unit", "min", "from-label", "numbers-label", "unread-label"]
  #table = null
  #parts = null
  #data = null
  #focus = -1
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
    if (this.#focus >= this.#data.series.length) this.#focus = -1
    this.#draw()
    if (!this.#sizes && this.isConnected) {
      this.#sizes = new ResizeObserver(() => this.#place())
      this.#sizes.observe(this)
    }
    this.#place()
    this.setAttribute("data-drawn", "")
  }

  // The parts around the table, made once: the unit line, a row for names, the chart, the readout, the numbers.
  #scaffold(table) {
    const unit = make("p", "po-series-unit")
    const row = make("div", "po-series-row")
    const chart = make("div", "po-series-chart")
    const scale = make("div", "po-series-scale")
    const plot = make("div", "po-series-plot")
    const ends = make("div", "po-series-ends")
    const periods = make("div", "po-series-periods")
    for (const hidden of [scale, plot, periods]) hidden.setAttribute("aria-hidden", "true")
    const lines = shape("svg", { viewBox: "0 0 100 100", preserveAspectRatio: "none", focusable: "false" })
    const guide = make("span", "po-series-guide")
    guide.hidden = true
    plot.append(lines, guide)
    chart.append(scale, plot, ends, periods)
    const readout = make("p", "po-series-readout")
    const numbers = make("details", "po-collapsible po-series-numbers")
    const summary = make("summary", "po-pressable")
    const holder = make("div")
    numbers.append(summary, holder)
    table.before(unit, row, chart, readout, numbers)
    holder.append(table)
    plot.addEventListener("pointermove", this.#point)
    plot.addEventListener("pointerdown", this.#point)
    plot.addEventListener("pointerleave", this.#leave)
    this.#parts = { unit, row, scale, plot, lines, guide, ends, periods, readout, summary, names: [] }
    for (const th of table.tHead.rows[0].cells) if (th.hasAttribute("data-focus")) this.#focus = th.cellIndex - 1
  }

  #read(table) {
    const head = [...table.tHead.rows[0].cells]
    const rows = [...table.tBodies[0].rows]
    const periods = rows.map((r) => (r.cells[0]?.dataset.value ?? r.cells[0]?.textContent ?? "").trim())
    const numbers = periods.map(Number)
    const even = !periods.length || periods.some((p, i) => p === "" || !Number.isFinite(numbers[i]))
    const first = even ? 0 : Math.min(...numbers)
    const last = even ? Math.max(1, periods.length - 1) : Math.max(...numbers)
    const x = periods.map((_, i) => (last === first ? 50 : (((even ? i : numbers[i]) - first) / (last - first)) * 100))
    const partial = rows.map((r) => (r.hasAttribute("data-partial") ? r.getAttribute("data-partial") || "partial" : ""))
    let unread = 0
    const series = head.slice(1).map((th, s) => {
      const cells = rows.map((r) => r.cells[s + 1])
      const values = cells.map((cell) => {
        const value = read(cell)
        if (Number.isNaN(value)) unread++
        return value === null || Number.isNaN(value) ? null : value
      })
      return { name: th.textContent.trim(), values, words: cells.map((cell) => cell?.textContent.trim() ?? "") }
    })
    const all = series.flatMap((s) => s.values.filter((v) => v !== null))
    const lowest = all.length ? Math.min(...all) : 0
    const highest = all.length ? Math.max(...all) : 1
    const min = this.getAttribute("min")
    const wanted = min === null ? 0 : min === "auto" ? lowest : Number(min)
    const from = Number.isFinite(wanted) ? Math.min(wanted, lowest) : Math.min(0, lowest)
    const ticks = steps(from, highest)
    const low = ticks[0]
    const high = Math.max(ticks.at(-1), highest)
    return { periods, x, partial, series, ticks, low, high, unread }
  }

  #words(value) {
    const lang = this.closest("[lang]")?.lang || undefined
    const compact = Math.abs(this.#data.high) >= 100000
    try {
      return new Intl.NumberFormat(lang, compact ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 6 }).format(value)
    } catch {
      return String(value)
    }
  }

  #draw() {
    const { unit, scale, lines, ends, periods, readout, summary, row } = this.#parts
    const { x, partial, series, ticks, low, high, unread } = this.#data
    const y = (value) => 100 - ((value - low) / (high - low || 1)) * 100
    const said = [this.getAttribute("unit")]
    if (low !== 0) said.push(`${this.getAttribute("from-label") ?? "the scale starts at"} ${this.#words(low)}`)
    unit.textContent = said.filter(Boolean).join(" · ")
    unit.hidden = !unit.textContent
    summary.textContent = this.getAttribute("numbers-label") ?? "The numbers"

    // The scale: a hidden copy of its widest word sets the column's width.
    const labels = ticks.map((t) => this.#words(t))
    scale.replaceChildren(make("span", "po-series-sizer", labels.reduce((a, b) => (b.length > a.length ? b : a), "")))
    lines.replaceChildren()
    ticks.forEach((t, i) => {
      const at = y(t)
      const label = make("span", "", labels[i])
      label.style.bottom = `${100 - at}%`
      scale.append(label)
      const rule = shape("line", { class: "po-series-grid", x1: 0, x2: 100, y1: at, y2: at })
      if (t === (ticks.includes(0) ? 0 : low)) rule.setAttribute("data-base", "")
      lines.append(rule)
    })

    // The periods under the lines; which of them show is decided once the width is known (#place).
    periods.replaceChildren(...this.#data.periods.map((p, i) => {
      const label = make("span", "", partial[i] ? `${p} ${partial[i]}` : p)
      label.style.left = `${x[i]}%`
      return label
    }))

    // The lines, the one in focus last so it lies over the others; a stretch that touches a period that is not
    // complete is dashed.
    for (const old of this.#parts.plot.querySelectorAll(".po-series-point")) old.remove()
    const order = series.map((_, s) => s).sort((a, b) => (a === this.#focus) - (b === this.#focus))
    for (const s of order) {
      const { values } = series[s]
      const focus = s === this.#focus
      const path = (stretch, dashed) => {
        if (stretch.length < 2) return
        const line = shape("path", { class: "po-series-line", d: stretch.map((i, n) => `${n ? "L" : "M"}${x[i]} ${y(values[i])}`).join("") })
        if (dashed) line.setAttribute("data-partial", "")
        if (focus) line.setAttribute("data-focus", "")
        lines.append(line)
      }
      const drawn = new Set()
      const point = (i, hollow) => {
        if (drawn.has(i)) return
        drawn.add(i)
        const dot = make("span", "po-series-point")
        dot.style.left = `${x[i]}%`
        dot.style.top = `${y(values[i])}%`
        if (hollow) dot.setAttribute("data-partial", "")
        if (focus) dot.setAttribute("data-focus", "")
        this.#parts.plot.append(dot)
      }
      let stretch = []
      let dashed = false
      let lastWhole = -1
      values.forEach((value, i) => {
        if (value === null) {
          path(stretch, dashed)
          if (stretch.length === 1 && !partial[stretch[0]]) point(stretch[0], false)
          stretch = []
          return
        }
        if (partial[i]) point(i, true)
        else lastWhole = i
        const before = stretch.at(-1)
        const touches = before !== undefined && Boolean(partial[i] || partial[before])
        if (before !== undefined && touches !== dashed && stretch.length > 1) {
          path(stretch, dashed)
          stretch = [before]
        }
        if (before !== undefined) dashed = touches
        stretch.push(i)
      })
      path(stretch, dashed)
      if (lastWhole >= 0) point(lastWhole, false)
    }

    // The names: one button for each line, kept between drawings so the focus stays where it is.
    const names = this.#parts.names
    while (names.length > series.length) names.pop().remove()
    series.forEach((line, s) => {
      names[s] ??= this.#name(s)
      names[s].textContent = line.name
      names[s].setAttribute("aria-pressed", String(s === this.#focus))
    })
    const sizer = make("span", "po-series-sizer", series.map((line) => line.name).reduce((a, b) => (b.length > a.length ? b : a), ""))
    ends.querySelector(".po-series-sizer")?.remove()
    ends.prepend(sizer)
    if (!names.every((b) => b.parentElement === ends || b.parentElement === row)) ends.append(...names)

    const words = this.getAttribute("unread-label") ?? "cells could not be read as numbers and are not drawn"
    readout.textContent = unread ? `${unread} ${words}` : ""
    if (unread) this.setAttribute("data-unread", String(unread))
    else this.removeAttribute("data-unread")
  }

  #name(index) {
    const button = make("button", "po-pressable po-series-name")
    button.type = "button"
    button.addEventListener("click", () => {
      this.#focus = this.#focus === index ? -1 : index
      this.#draw()
      this.#place()
      const name = this.#focus < 0 ? "" : this.#data.series[this.#focus].name
      this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { name, index: this.#focus } }))
    })
    return button
  }

  // Where the names stand, and which periods are written out. It runs again whenever the width changes.
  #place() {
    if (!this.#parts || !this.#data) return
    const { ends, row, periods } = this.#parts
    const { series, low, high, x } = this.#data
    const names = this.#parts.names
    const held = names.find((b) => b === document.activeElement)
    const rem = parseFloat(getComputedStyle(document.documentElement).fontSize) || 16

    // Beside the lines first; in a row above them when they would overlap or the element is narrow.
    this.dataset.names = "ends"
    if (names.some((b) => b.parentElement !== ends)) ends.append(...names)
    const height = ends.clientHeight
    const each = names[0]?.offsetHeight ?? 0
    const at = series.map((line, s) => {
      const last = line.values.findLastIndex((v) => v !== null)
      return { s, top: last < 0 ? null : (1 - (line.values[last] - low) / (high - low || 1)) * height }
    }).filter((p) => p.top !== null).sort((a, b) => a.top - b.top)
    for (let i = 1; i < at.length; i++) at[i].top = Math.max(at[i].top, at[i - 1].top + each)
    if (at.length && at.at(-1).top > height) {
      at.at(-1).top = height
      for (let i = at.length - 2; i >= 0; i--) at[i].top = Math.min(at[i].top, at[i + 1].top - each)
    }
    const fits = !at.length || at[0].top >= 0
    if (!fits || this.clientWidth < NARROW * rem) {
      this.dataset.names = "row"
      row.append(...names)
      for (const b of names) b.style.top = ""
    } else {
      for (const b of names) b.hidden = true
      for (const p of at) {
        names[p.s].hidden = false
        names[p.s].style.top = `${p.top}px`
      }
    }
    if (this.dataset.names === "row") for (const b of names) b.hidden = false
    if (held && document.activeElement !== held) held.focus()

    // As many periods as have room, counted back from the last one, which always shows.
    const labels = [...periods.children]
    if (!labels.length) return
    for (const label of labels) label.hidden = false
    const widest = Math.max(...labels.map((l) => l.offsetWidth)) || 1
    const room = Math.max(2, Math.floor(periods.clientWidth / (widest * 1.4)))
    const every = Math.max(1, Math.ceil(labels.length / room))
    labels.forEach((label, i) => {
      label.hidden = (labels.length - 1 - i) % every !== 0
      label.style.translate = x[i] <= 0 ? "0 0" : x[i] >= 100 ? "-100% 0" : ""
    })
  }

  #point = (event) => {
    const { plot, guide, readout } = this.#parts
    const { x, periods, partial, series, unread } = this.#data
    if (!x.length || unread) return
    const box = plot.getBoundingClientRect()
    const at = ((event.clientX - box.left) / (box.width || 1)) * 100
    let nearest = 0
    x.forEach((value, i) => { if (Math.abs(value - at) < Math.abs(x[nearest] - at)) nearest = i })
    guide.style.left = `${x[nearest]}%`
    guide.hidden = false
    const said = series
      .map((line) => ({ name: line.name, value: line.values[nearest], words: line.words[nearest] }))
      .filter((line) => line.value !== null)
      .sort((a, b) => b.value - a.value)
      .map((line) => `${line.name} ${line.words}`)
    readout.textContent = [`${periods[nearest]}${partial[nearest] ? ` (${partial[nearest]})` : ""}`, ...said].join(" · ")
  }

  #leave = () => {
    this.#parts.guide.hidden = true
    if (!this.#data.unread) this.#parts.readout.textContent = ""
  }
}

if (!customElements.get("po-series")) customElements.define("po-series", PoSeries)

export { PoSeries }
