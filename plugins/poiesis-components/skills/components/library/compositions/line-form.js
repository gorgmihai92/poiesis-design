// Composition · line form: the behavior of <po-line-form>, one line to add or edit an item, the same everywhere:
// a line (line) with its own field, a date pick, a ✓ that saves and an optional ✕, and under it the place where the
// date list opens (a fold). The page renders the markup; this keeps it working as one line (ux W6, K10):
//   - quiet until written: the ✓ and ✕ show once there are words; the date button too, or from the start with
//     date-always (a date can be picked first);
//   - Enter saves; with nothing written it does nothing, and an edit with nothing changed closes;
//   - leaving the line (a click or Tab away) saves an edit, and adds a new item with add-on-blur, so words written
//     are never lost; a new line left empty lets go of a date picked alone; focus moving inside the line or its list,
//     or the window losing focus, is not leaving;
//   - Esc empties a line with words in it and lets go of the focus (an edit closes); on an empty line Esc goes on to
//     whatever holds it; the date list takes the first Esc for itself;
//   - its buttons don't take the focus from the field, so using them is not leaving the line, and a date picked
//     brings the focus back to the field.
// It sends "save" (detail.text, detail.due, detail.via: "enter" or "blur"), cancelable, and "cancel". After a save
// that isn't canceled, clear-on-save empties the line, and the field lets go of the focus unless stay is set (one
// item follows another). edit marks a line editing an item: its first words and date are what "changed" compares.
//
//   <po-line-form date-always add-on-blur clear-on-save stay>
//     <form class="po-line" data-rule="none">
//       <span class="po-line-mark"><span class="po-icon" data-icon="plus" aria-hidden="true"></span></span>
//       <input class="po-line-field" placeholder="Add a task…" aria-label="Add a task">
//       <span class="po-line-form-controls">
//         <po-date-pick label="date"></po-date-pick>
//         <button type="submit" class="po-pressable po-button" data-variant="ghost" data-size="sm" data-shape="icon"
//           aria-label="Add task"><span class="po-icon" data-icon="check" aria-hidden="true"></span></button>
//       </span>
//     </form>
//     <div class="po-fold" inert><div><div class="po-line-indent" data-below></div></div></div>
//   </po-line-form>

class PoLineForm extends HTMLElement {
  #initial = { text: "", due: "" }
  #dropped = false
  #saving = false

  get #form() { return this.querySelector("form") }
  get #field() { return this.querySelector(".po-line-field") }
  get #date() { return this.querySelector("po-date-pick") }
  get #text() { return (this.#field?.value ?? "").trim() }
  get #due() { return this.#date?.value ?? "" }

  connectedCallback() {
    this.#initial = { text: this.#text, due: this.#due }
    this.addEventListener("submit", this.#onSubmit)
    this.addEventListener("input", this.#written)
    this.addEventListener("keydown", this.#onKey)
    this.addEventListener("mousedown", this.#onPress)
    this.addEventListener("click", this.#onClick)
    this.addEventListener("change", this.#onDate)
    this.addEventListener("focusout", this.#onLeave)
    this.#written()
  }

  disconnectedCallback() {
    this.removeEventListener("submit", this.#onSubmit)
    this.removeEventListener("input", this.#written)
    this.removeEventListener("keydown", this.#onKey)
    this.removeEventListener("mousedown", this.#onPress)
    this.removeEventListener("click", this.#onClick)
    this.removeEventListener("change", this.#onDate)
    this.removeEventListener("focusout", this.#onLeave)
  }

  get #changed() { return !this.hasAttribute("edit") || this.#text !== this.#initial.text || this.#due !== this.#initial.due }

  #written = () => { this.toggleAttribute("data-written", !!this.#text) }

  #reset() {
    if (this.#field) this.#field.value = ""
    if (this.#date) this.#date.value = ""
    this.#written()
  }

  #save(via) {
    if (this.#saving || !this.#text) return
    if (!this.#changed) return this.#cancel()
    this.#saving = true
    const go = this.dispatchEvent(new CustomEvent("save", { bubbles: true, cancelable: true, detail: { text: this.#text, due: this.#due, via } }))
    this.#saving = false
    if (!go) return
    if (this.hasAttribute("edit")) this.#initial = { text: this.#text, due: this.#due }
    if (this.hasAttribute("clear-on-save")) {
      this.#reset()
      if (!this.hasAttribute("stay")) this.#field?.blur()
    }
  }

  #cancel() { this.dispatchEvent(new CustomEvent("cancel", { bubbles: true })) }

  #onSubmit = (e) => {
    if (e.target !== this.#form) return
    e.preventDefault()
    this.#save("enter")
  }

  #onKey = (e) => {
    if (e.key !== "Escape" || e.defaultPrevented) return
    if (this.hasAttribute("edit")) {
      e.preventDefault()
      this.#cancel()
    } else if (this.#text) {
      e.preventDefault()
      this.#dropped = true
      this.#reset()
      this.#field?.blur()
    }
  }

  // Buttons in the line keep the focus in the field.
  #onPress = (e) => {
    if (this.#form?.contains(e.target) && !e.target.closest("input, textarea")) e.preventDefault()
  }

  #onClick = (e) => { if (e.target.closest("[data-cancel]")) this.#cancel() }

  #onDate = (e) => {
    if (!e.target.closest?.("po-date-pick")) return
    this.#field?.focus({ preventScroll: true })
  }

  // Checked once the focus has landed: still in the line (or its list), or the window left, is not leaving it.
  #onLeave = () => {
    setTimeout(() => {
      if (!this.isConnected || !document.hasFocus() || this.contains(document.activeElement)) return
      if (this.#dropped) { this.#dropped = false; return }
      if (this.hasAttribute("edit")) {
        if (this.#text && this.#changed) this.#save("blur")
        else this.#cancel()
      } else if (this.hasAttribute("add-on-blur") && this.#text) this.#save("blur")
      else if (!this.#text && this.#date) this.#date.value = ""
    })
  }
}

if (!customElements.get("po-line-form")) customElements.define("po-line-form", PoLineForm)

export { PoLineForm }
