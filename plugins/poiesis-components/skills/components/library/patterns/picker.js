// Pattern · picker: the behavior of <po-picker>, a search line and what it finds under it, to choose one item
// from many (a task to swap in, a project to move to). It joins a list item with its own bare field (list, input)
// and a list of options (list):
//   - the first `max` options show (5 by default), in the page's order (the best first), and a muted line counts the
//     rest (ux W4); typing keeps those with every word typed, in their words or in data-search;
//   - when nothing matches, the element marked .po-picker-empty shows instead, saying what to do, and a screen
//     reader hears it (it is a status, I3);
//   - ↓ from the field goes to the first option shown, ↓ ↑ move between them; a press or Enter on one takes it;
//   - Esc sends "close", for the page to close it (ux K10).
// Taking an option sends "change" (detail.value: its data-value, detail.option).
//
//   <po-picker>
//     <div class="po-item">
//       <span class="po-item-mark"><span class="po-icon" data-icon="search" aria-hidden="true"></span></span>
//       <input class="po-field po-input" data-variant="bare" placeholder="Find a task or project" aria-label="Find a task">
//     </div>
//     <ul class="po-list po-list-indent" data-variant="options" aria-label="Tasks">
//       <li><button type="button" class="po-item" data-value="t1">…</button></li> …
//     </ul>
//     <p class="po-picker-empty po-list-indent">No open task matches. Clear the search or add the task first.</p>
//   </po-picker>

class PoPicker extends HTMLElement {
  #more = null
  #changes = new MutationObserver(() => this.#render())

  get #field() { return this.querySelector(".po-input, input") }
  get #list() { return this.querySelector(".po-list") }
  get #options() { return [...this.querySelectorAll(".po-list .po-item")] }
  get #shown() { return this.#options.filter((o) => !this.#row(o).hidden) }
  get #max() { return Math.max(1, parseInt(this.getAttribute("max") ?? "5", 10) || 5) }
  #row(option) { return option.closest("li") ?? option }

  connectedCallback() {
    const list = this.#list
    if (!list) return
    // The count of the rest, as the list's last row, so it lines up with the options.
    this.#more = list.querySelector(".po-list-more")
    if (!this.#more) {
      this.#more = document.createElement("li")
      this.#more.className = "po-list-more"
      this.#more.setAttribute("role", "presentation")
      list.append(this.#more)
    }
    this.querySelector(".po-picker-empty")?.setAttribute("role", "status")
    this.addEventListener("input", this.#render)
    this.addEventListener("keydown", this.#onKey)
    this.addEventListener("click", this.#onClick)
    this.#changes.observe(list, { childList: true, subtree: true, characterData: true })
    this.#render()
  }

  disconnectedCallback() {
    this.removeEventListener("input", this.#render)
    this.removeEventListener("keydown", this.#onKey)
    this.removeEventListener("click", this.#onClick)
    this.#changes.disconnect()
  }

  #render = () => {
    this.#changes.disconnect()
    const words = (this.#field?.value ?? "").toLowerCase().split(/\s+/).filter(Boolean)
    const text = (o) => (o.dataset.search ?? o.textContent ?? "").toLowerCase()
    const found = this.#options.filter((o) => words.every((w) => text(o).includes(w)))
    const max = this.#max
    for (const o of this.#options) this.#row(o).hidden = found.indexOf(o) < 0 || found.indexOf(o) >= max
    const rest = Math.max(0, found.length - max)
    this.#more.textContent = rest ? `+${rest} more` : ""
    this.#more.hidden = rest === 0
    this.#list.append(this.#more)
    this.#list.hidden = found.length === 0
    const empty = this.querySelector(".po-picker-empty")
    if (empty) empty.hidden = found.length > 0
    this.#changes.observe(this.#list, { childList: true, subtree: true, characterData: true })
  }

  #onKey = (e) => {
    if (e.key === "Escape") {
      e.preventDefault()
      e.stopPropagation()
      this.dispatchEvent(new CustomEvent("close", { bubbles: true }))
      return
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return
    const shown = this.#shown
    if (!shown.length) return
    const at = shown.indexOf(document.activeElement)
    const next = e.key === "ArrowDown" ? (at < 0 ? 0 : Math.min(at + 1, shown.length - 1)) : at - 1
    e.preventDefault()
    if (next < 0) this.#field?.focus()
    else shown[next].focus()
  }

  #onClick = (e) => {
    const option = e.target.closest(".po-list .po-item")
    if (!option || !this.#options.includes(option) || option.disabled) return
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: option.dataset.value ?? option.textContent.trim(), option } }))
  }
}

if (!customElements.get("po-picker")) customElements.define("po-picker", PoPicker)

export { PoPicker }
