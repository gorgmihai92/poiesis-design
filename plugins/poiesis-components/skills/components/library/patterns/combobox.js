// Pattern · combobox: the behavior of <po-combobox>, a field with suggestions under it. It joins an input
// (po-input), a fold (po-fold) and a list of options (po-list, options look) already in it:
//   - typing opens the list under the field, in the page (ux K11), with the options that have a word starting with
//     what is typed, in the list's own order (ux K7); at most `max` (5 by default) show, and a muted line counts the
//     rest (ux W4); filter="none" leaves filtering to the page, which then only puts the options it wants inside;
//   - nothing is highlighted when the list opens (ux W5): ↓ and ↑ highlight and wrap around, the pointer moving
//     over an option highlights it; with open-on-focus the list also opens when the field takes focus;
//   - Enter takes the highlighted option, and only that, so Enter with nothing highlighted still submits the form;
//     Tab takes the highlighted option or, with none, the first, then moves on as usual;
//   - a press on an option takes it and keeps focus in the field;
//   - Esc closes the list and keeps the key for itself; with the list closed, Esc goes on to whatever holds the
//     field (ux K10). Leaving the field closes the list.
// Taking an option puts its data-value (else its text) in the field and sends a "change" event (detail.value,
// detail.option). Roles and states for screen readers are set here: combobox, listbox, aria-expanded,
// aria-activedescendant (I3).
//
//   <po-combobox>
//     <input class="po-field po-input" aria-label="Verb">
//     <div class="po-fold" inert><div>
//       <ul class="po-list" data-variant="options" role="listbox" aria-label="Verbs">
//         <li class="po-item" role="option">Write</li> …
//       </ul>
//     </div></div>
//   </po-combobox>

let count = 0

class PoCombobox extends HTMLElement {
  #id = `po-combobox-${++count}`
  #open = false
  #active = null
  #more = null
  #observer = new MutationObserver(() => this.#render())

  get #input() { return this.querySelector("input") }
  get #list() { return this.querySelector('[role="listbox"]') }
  get #fold() { return this.#list?.closest(".po-fold") }
  get #max() { return Math.max(1, parseInt(this.getAttribute("max") ?? "5", 10) || 5) }
  get #options() { return this.#list ? [...this.#list.querySelectorAll('[role="option"]')] : [] }
  get #shown() { return this.#options.filter((o) => !o.hidden && o.getAttribute("aria-disabled") !== "true") }

  connectedCallback() {
    const input = this.#input
    const list = this.#list
    if (!input || !list) return
    list.id ||= `${this.#id}-list`
    input.setAttribute("role", "combobox")
    input.setAttribute("aria-autocomplete", "list")
    input.setAttribute("aria-controls", list.id)
    input.setAttribute("autocomplete", "off")
    // The count of the rest, as the list's last row, so it lines up with the options.
    this.#more = list.querySelector(".po-list-more")
    if (!this.#more) {
      this.#more = document.createElement("li")
      this.#more.className = "po-list-more"
      this.#more.setAttribute("role", "presentation")
      list.append(this.#more)
    }
    input.addEventListener("input", this.#onInput)
    input.addEventListener("keydown", this.#onKey)
    input.addEventListener("focus", this.#onFocus)
    input.addEventListener("blur", this.#onBlur)
    list.addEventListener("mousedown", this.#onPress)
    list.addEventListener("mousemove", this.#onMove)
    this.#observer.observe(list, { childList: true, subtree: true, characterData: true })
    this.#close()
  }

  disconnectedCallback() {
    const input = this.#input
    input?.removeEventListener("input", this.#onInput)
    input?.removeEventListener("keydown", this.#onKey)
    input?.removeEventListener("focus", this.#onFocus)
    input?.removeEventListener("blur", this.#onBlur)
    this.#list?.removeEventListener("mousedown", this.#onPress)
    this.#list?.removeEventListener("mousemove", this.#onMove)
    this.#observer.disconnect()
  }

  // Which options show: those with a word starting with what is typed, in the list's own order (ux K7), the first
  // `max` of them. True when any match.
  #render() {
    this.#observer.disconnect()
    const options = this.#options
    const text = (this.#input?.value ?? "").trim().toLowerCase()
    const words = (o) => (o.dataset.value ?? o.textContent ?? "").trim().toLowerCase().split(/\s+/)
    const matches = this.getAttribute("filter") === "none" || !text
      ? options
      : options.filter((o) => words(o).some((w, i, all) => all.slice(i).join(" ").startsWith(text)))
    const max = this.#max
    options.forEach((o, i) => {
      o.id ||= `${this.#id}-option-${i}`
      o.hidden = matches.indexOf(o) < 0 || matches.indexOf(o) >= max
    })
    const rest = Math.max(0, matches.length - max)
    this.#more.textContent = rest ? `+${rest} more` : ""
    this.#more.hidden = !this.#open || rest === 0
    this.#list.append(this.#more)
    if (this.#active?.hidden) this.#highlight(null)
    this.#observer.observe(this.#list, { childList: true, subtree: true, characterData: true })
    return matches.length > 0
  }

  #show() {
    this.#open = true
    if (!this.#render()) return this.#close()
    this.#setOpen(true)
  }

  #close() {
    this.#open = false
    this.#highlight(null)
    this.#setOpen(false)
    if (this.#more) this.#more.hidden = true
  }

  #setOpen(open) {
    this.#input?.setAttribute("aria-expanded", String(open))
    const fold = this.#fold
    if (fold) fold.inert = !open
    else if (this.#list) this.#list.hidden = !open
  }

  #highlight(option) {
    if (this.#active) this.#active.setAttribute("aria-selected", "false")
    this.#active = option
    if (option) {
      option.setAttribute("aria-selected", "true")
      option.scrollIntoView({ block: "nearest" })
      this.#input?.setAttribute("aria-activedescendant", option.id)
    } else this.#input?.removeAttribute("aria-activedescendant")
  }

  #take(option) {
    const input = this.#input
    if (!option || !input) return
    const value = option.dataset.value ?? option.textContent.trim()
    input.value = value
    this.#close()
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value, option } }))
  }

  #onInput = () => this.#show()
  #onFocus = () => { if (this.hasAttribute("open-on-focus")) this.#show() }
  // Leaving the field closes the list; a press on an option keeps focus (onPress), so it never counts as leaving.
  #onBlur = () => this.#close()

  #onPress = (e) => {
    const option = e.target.closest('[role="option"]')
    if (!option || option.getAttribute("aria-disabled") === "true") return
    e.preventDefault()
    this.#take(option)
  }

  #onMove = (e) => {
    const option = e.target.closest('[role="option"]')
    if (option && option !== this.#active && option.getAttribute("aria-disabled") !== "true") this.#highlight(option)
  }

  #onKey = (e) => {
    const shown = this.#shown
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      if (!this.#open) this.#show()
      if (!this.#open || !shown.length) return
      e.preventDefault()
      const at = shown.indexOf(this.#active)
      const step = e.key === "ArrowDown" ? 1 : -1
      const next = at < 0 ? (step > 0 ? 0 : shown.length - 1) : (at + step + shown.length) % shown.length
      this.#highlight(shown[next])
    } else if (e.key === "Enter" && this.#open && this.#active) {
      e.preventDefault()
      this.#take(this.#active)
    } else if (e.key === "Tab" && this.#open && shown.length && !e.shiftKey) {
      this.#take(this.#active ?? shown[0])
    } else if (e.key === "Escape" && this.#open) {
      e.preventDefault()
      e.stopPropagation()
      this.#close()
    }
  }
}

if (!customElements.get("po-combobox")) customElements.define("po-combobox", PoCombobox)

export { PoCombobox }
