// Pattern · date pick: the behavior of <po-date-pick>, a date button and the short list it opens. It draws
// both itself, from a button (button, icon), a list of options (options) and the fold it opens in:
//   - without a date, the set's calendar icon, faint; with one, the date in words, colored by how near it is
//     (due: "due tomorrow" in warning, "2 days late" in danger), so the date reads as it does in the row;
//   - the list holds five quick dates (today, tomorrow, Friday, next week, in 2 weeks, end of month: the first five
//     different days, nearest first), each with its day; "No date" when there is one; and a field for any other day
//     ("12 Nov", "25.12", "in 3 weeks", "next Tuesday", "2026-12-25"), Enter taking it;
//   - it opens in the page, under the line, in the place marked data-below (inside a fold) of the <po-line-form>
//     around it, or of the element named by below="id"; with no such place it floats under the button;
//   - it opens when the keyboard reaches the button and closes when the keyboard leaves it or the list, on a press
//     outside, and with Esc, which it keeps for itself so the line around it stays (ux K10).
// Picking sends a "change" event (detail.value: "YYYY-MM-DD", or "" for no date) and sets the value attribute.
// Attributes: value, label (what the date is: "date", "finish date"), prefix (before the date: "due" by default),
// icon (always the icon: for a row that shows its date in its words already). Words are English.
//
//   <po-date-pick label="date"></po-date-pick>

let count = 0
const DAY = 864e5
const QUICK = ["Today", "Tomorrow", "Friday", "Next week", "In 2 weeks", "End of month"]
const SHOWN = 5
const WEEKDAYS = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"]
const MONTHS = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"]

const noon = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate(), 12)
const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
const fromIso = (s) => { const [y, m, d] = s.split("-").map(Number); return new Date(y, m - 1, d, 12) }
const addDays = (d, n) => new Date(d.getFullYear(), d.getMonth(), d.getDate() + n, 12)
const between = (a, b) => Math.round((noon(b) - noon(a)) / DAY)
const locale = () => (document.documentElement.lang || "en").startsWith("en") ? "en-GB" : document.documentElement.lang
const dayName = (d) => d.toLocaleDateString(locale(), { weekday: "short", day: "numeric", month: "short" })

// The day a few words mean, from today; undefined when they don't name one.
function readDay(words, today = noon(new Date())) {
  const w = words.trim().toLowerCase().replace(/\s+/g, " ")
  if (!w) return undefined
  if (/^\d{4}-\d{2}-\d{2}$/.test(w)) return fromIso(w)
  if (w === "today") return today
  if (w === "tomorrow") return addDays(today, 1)
  if (w === "next week") return addDays(today, ((8 - today.getDay()) % 7) || 7)
  if (w === "end of month") return new Date(today.getFullYear(), today.getMonth() + 1, 0, 12)
  const weekday = WEEKDAYS.findIndex((d) => d.startsWith(w.replace(/^next /, "")) && w.replace(/^next /, "").length >= 3)
  if (weekday >= 0) return addDays(today, ((weekday - today.getDay() + 7) % 7) || 7)
  const inN = w.match(/^in (\d+) (day|week|month)s?$/)
  if (inN) {
    const n = Number(inN[1])
    if (inN[2] === "month") return new Date(today.getFullYear(), today.getMonth() + n, today.getDate(), 12)
    return addDays(today, inN[2] === "week" ? n * 7 : n)
  }
  // "12 Nov", "12 November 2027", "Nov 12"; "25.12", "25/12/2027": the next one to come when no year is given.
  const month = (s) => MONTHS.findIndex((m) => s.length >= 3 && m.startsWith(s))
  let d, m, y
  let match = w.match(/^(\d{1,2}) ([a-z]+)(?: (\d{4}))?$/)
  if (match) [d, m, y] = [Number(match[1]), month(match[2]), match[3] && Number(match[3])]
  else if ((match = w.match(/^([a-z]+) (\d{1,2})(?: (\d{4}))?$/))) [d, m, y] = [Number(match[2]), month(match[1]), match[3] && Number(match[3])]
  else if ((match = w.match(/^(\d{1,2})[./](\d{1,2})(?:[./](\d{4}))?$/))) [d, m, y] = [Number(match[1]), Number(match[2]) - 1, match[3] && Number(match[3])]
  if (m === undefined || m < 0 || m > 11 || !d) return undefined
  let date = new Date(y || today.getFullYear(), m, d, 12)
  if (date.getDate() !== d) return undefined
  if (!y && date < today) date = new Date(today.getFullYear() + 1, m, d, 12)
  return date
}

class PoDatePick extends HTMLElement {
  static observedAttributes = ["value", "label", "prefix", "icon"]
  #id = `po-date-pick-${++count}`
  #button = null
  #list = null
  #open = false

  get value() { return this.getAttribute("value") ?? "" }
  set value(v) { if (v) this.setAttribute("value", v); else this.removeAttribute("value") }
  get #label() { return this.getAttribute("label") || "date" }

  connectedCallback() {
    if (!this.#button) {
      this.#button = document.createElement("button")
      this.#button.type = "button"
      this.#button.className = "po-pressable po-button"
      this.#button.dataset.variant = "ghost"
      this.#button.dataset.size = "sm"
      this.append(this.#button)
    }
    this.#button.addEventListener("click", this.#toggle)
    this.#button.addEventListener("focus", this.#onFocus)
    this.addEventListener("keydown", this.#onKey)
    this.addEventListener("focusout", this.#onLeave)
    this.#draw()
  }

  disconnectedCallback() {
    this.#close()
    this.#button?.removeEventListener("click", this.#toggle)
    this.#button?.removeEventListener("focus", this.#onFocus)
    this.removeEventListener("keydown", this.#onKey)
    this.removeEventListener("focusout", this.#onLeave)
  }

  attributeChangedCallback() { if (this.#button) this.#draw() }

  // The button: the calendar icon without a date (or with icon), else the date in the words and color of a row.
  #draw() {
    const b = this.#button
    const value = this.value
    const label = this.#label
    b.setAttribute("aria-expanded", String(this.#open))
    b.setAttribute("aria-controls", `${this.#id}-list`)
    b.setAttribute("aria-label", this.#open ? `Close the ${label} list` : value ? `Change the ${label}: ${dayName(fromIso(value))}` : `Add a ${label}`)
    if (!value || this.hasAttribute("icon")) {
      b.dataset.shape = "icon"
      b.classList.add("po-date-pick-icon")
      b.innerHTML = '<span class="po-icon" data-icon="calendar-plus" aria-hidden="true"></span>'
      return
    }
    delete b.dataset.shape
    b.classList.remove("po-date-pick-icon")
    const days = between(new Date(), fromIso(value))
    const prefix = this.getAttribute("prefix") ?? "due"
    const words = days < 0 ? `${-days} day${days === -1 ? "" : "s"} late`
      : days === 0 ? `${prefix} today`
      : days === 1 ? `${prefix} tomorrow`
      : days < 7 ? `${prefix} in ${days} days`
      : `${prefix} ${dayName(fromIso(value))}`
    const urgency = days < 0 ? "danger" : days === 0 ? "caution" : days === 1 ? "warning" : ""
    b.innerHTML = ""
    const due = document.createElement("span")
    due.className = "po-text"
    due.dataset.tone = urgency || "muted"
    due.textContent = words.trim()
    b.append(due)
  }

  // Where the list goes: the marked place under the line, else floating under the button.
  #place() {
    const named = this.getAttribute("below")
    return (named && document.getElementById(named)) || this.closest("po-line-form")?.querySelector("[data-below]") || null
  }

  #build() {
    const today = noon(new Date())
    const value = this.value
    const list = document.createElement("div")
    list.id = `${this.#id}-list`
    list.className = "po-list"
    list.dataset.variant = "options"
    list.setAttribute("role", "group")
    list.setAttribute("aria-label", `Pick a ${this.#label}`)
    const quick = QUICK.map((name) => ({ name, day: readDay(name, today) }))
      .filter((o, i, all) => all.findIndex((x) => iso(x.day) === iso(o.day)) === i)
      .sort((a, b) => a.day - b.day)
      .slice(0, SHOWN)
    const row = (name, note, pick) => {
      const b = document.createElement("button")
      b.type = "button"
      b.className = "po-item"
      b.append(name)
      if (note) { const n = document.createElement("span"); n.className = "po-item-note"; n.textContent = note; b.append(n) }
      b.addEventListener("click", pick)
      return b
    }
    for (const o of quick) {
      const b = row(o.name, dayName(o.day), () => this.#pick(iso(o.day)))
      if (iso(o.day) === value) b.setAttribute("aria-current", "true")
      list.append(b)
    }
    if (value) list.append(row("No date", "", () => this.#pick("")))
    // Any other day, written as a person would; the day it means shows beside it, and Enter takes it.
    const other = document.createElement("label")
    other.className = "po-item"
    const field = document.createElement("input")
    field.className = "po-field po-input"
    field.dataset.variant = "bare"
    field.placeholder = "Other day, like 12 Nov"
    field.setAttribute("aria-label", `Type another ${this.#label}`)
    const note = document.createElement("span")
    note.className = "po-item-note"
    note.setAttribute("aria-live", "polite")
    field.addEventListener("input", () => {
      const day = readDay(field.value, today)
      note.textContent = day ? dayName(day) : field.value.trim() ? "Not a day yet" : ""
    })
    field.addEventListener("keydown", (e) => {
      if (e.key !== "Enter") return
      e.preventDefault()
      e.stopPropagation()
      const day = readDay(field.value, today)
      if (day) this.#pick(iso(day))
    })
    other.append(field, note)
    list.append(other)
    // Placed under the line, outside this element, the list still brings its keys and focus here.
    list.addEventListener("keydown", this.#onKey)
    list.addEventListener("focusout", this.#onLeave)
    return list
  }

  #show() {
    if (this.#open) return
    this.#open = true
    this.#list = this.#build()
    const place = this.#place()
    if (place) {
      place.replaceChildren(this.#list)
      const fold = place.closest(".po-fold")
      if (fold) fold.inert = false
    } else {
      this.#list.classList.add("po-date-pick-float")
      this.append(this.#list)
    }
    document.addEventListener("mousedown", this.#onAway)
    this.#draw()
  }

  #close() {
    if (!this.#open) return
    this.#open = false
    document.removeEventListener("mousedown", this.#onAway)
    const list = this.#list
    const fold = list?.closest(".po-fold")
    // In a fold, the list stays while it folds away (ui G8), then goes, unless another took its place.
    if (fold) {
      fold.inert = true
      const wait = parseFloat(getComputedStyle(fold).transitionDuration) * 1000 || 0
      setTimeout(() => { if (!this.#open && list.isConnected && fold.inert) list.remove() }, wait)
    } else list?.remove()
    this.#list = null
    this.#draw()
  }

  #pick(value) {
    this.value = value
    this.#close()
    // Back on the button after a pick, the list stays closed: only reaching the button opens it.
    this.#returning = true
    this.#button.focus({ preventScroll: true })
    this.#returning = false
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value } }))
  }

  #inside(node) { return !!node && (this.contains(node) || !!this.#list?.contains(node)) }
  #toggle = () => (this.#open ? this.#close() : this.#show())
  // Reached by the keyboard, not a click (which toggles it itself): the list opens.
  #returning = false
  #onFocus = () => { if (!this.#returning && this.#button.matches(":focus-visible")) this.#show() }
  #onKey = (e) => {
    if (e.key !== "Escape" || !this.#open) return
    e.preventDefault()
    e.stopPropagation()
    this.#close()
    this.#button.focus({ preventScroll: true })
  }
  #onLeave = (e) => { if (!this.#inside(e.relatedTarget)) this.#close() }
  #onAway = (e) => { if (!this.#inside(e.target)) this.#close() }
}

if (!customElements.get("po-date-pick")) customElements.define("po-date-pick", PoDatePick)

export { PoDatePick }
