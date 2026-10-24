// Pattern · pager: the behavior of <po-pager>, which part of a long list shows ("1–5 of 12"), and arrows to
// the part before and after. It draws itself from its attributes, with a button (button, icon) and a tooltip for
// each arrow:
//   - total, size (per part, 5 by default) and from (the first shown, counting from 0) say where the list stands;
//   - note adds words after the range ("3 done"); of-label is the word between the range and the total ("of" by
//     default, „din” in Romanian);
//   - the arrows are named by prev-label and next-label ("Newer feedback", "Earlier feedback"), and turn off at the
//     ends; an arrow that turns off while it has the focus hands it to the other one (I1);
//   - the range is a live region, so a screen reader hears the new part (I3).
// An arrow sends "change" (detail.from) and sets from; the page shows that part.
//
//   <po-pager total="12" from="0" note="3 done" prev-label="Newer feedback" next-label="Earlier feedback"></po-pager>

let count = 0

class PoPager extends HTMLElement {
  static observedAttributes = ["total", "size", "from", "note", "of-label", "prev-label", "next-label"]
  #id = `po-pager-${++count}`
  #range = null
  #prev = null
  #next = null

  get #total() { return Math.max(0, parseInt(this.getAttribute("total") ?? "0", 10) || 0) }
  get #size() { return Math.max(1, parseInt(this.getAttribute("size") ?? "5", 10) || 5) }
  get #from() { return Math.max(0, parseInt(this.getAttribute("from") ?? "0", 10) || 0) }
  get #last() { return Math.max(0, Math.floor((this.#total - 1) / this.#size) * this.#size) }

  connectedCallback() {
    if (!this.#range) {
      this.#range = document.createElement("span")
      this.#range.className = "po-pager-range"
      this.#range.setAttribute("aria-live", "polite")
      const arrows = document.createElement("span")
      arrows.className = "po-pager-arrows"
      this.#prev = this.#arrow("prev", "arrow-left")
      this.#next = this.#arrow("next", "arrow-right")
      arrows.append(...this.#prev, ...this.#next)
      this.append(this.#range, arrows)
    }
    this.#draw()
  }

  attributeChangedCallback() { if (this.#range) this.#draw() }

  #arrow(side, icon) {
    const button = document.createElement("button")
    button.type = "button"
    button.id = `${this.#id}-${side}`
    button.className = "po-pressable po-button"
    button.dataset.variant = "ghost"
    button.dataset.size = "sm"
    button.dataset.shape = "icon"
    button.innerHTML = `<span class="po-icon" data-icon="${icon}" aria-hidden="true"></span>`
    button.addEventListener("click", () => this.#move(side === "prev" ? this.#from - this.#size : this.#from + this.#size))
    const tip = document.createElement("po-tooltip")
    tip.className = "po-layer"
    tip.setAttribute("for", button.id)
    return [button, tip]
  }

  #draw() {
    const total = this.#total
    const from = Math.min(this.#from, this.#last)
    const to = Math.min(total, from + this.#size)
    const note = this.getAttribute("note")
    const of = this.getAttribute("of-label") ?? "of"
    this.#range.textContent = `${total ? from + 1 : 0}–${to} ${of} ${total}${note ? ` · ${note}` : ""}`
    const label = (side) => this.getAttribute(`${side}-label`) ?? (side === "prev" ? "Previous" : "Next")
    for (const [[button, tip], side, off] of [[this.#prev, "prev", from === 0], [this.#next, "next", from >= this.#last]]) {
      button.setAttribute("aria-label", label(side))
      button.disabled = off
      tip.textContent = label(side)
    }
  }

  #move(to) {
    const from = Math.min(Math.max(0, to), this.#last)
    if (from === this.#from) return
    this.setAttribute("from", String(from))
    const [prev] = this.#prev
    const [next] = this.#next
    if (document.activeElement?.disabled && (document.activeElement === prev || document.activeElement === next))
      (document.activeElement === prev ? next : prev).focus()
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { from } }))
  }
}

if (!customElements.get("po-pager")) customElements.define("po-pager", PoPager)

export { PoPager }
