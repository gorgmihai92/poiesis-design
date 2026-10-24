// Pattern · toast: the behavior of <po-toast>, what just happened on one line at the bottom of the screen, with
// Undo when it can be undone (ux K6). It holds an alert (alert) and its action (button):
//   - it shows while open is set, and closes itself after 3 s; it waits while the pointer is on it or it holds the
//     focus, so Undo can always be reached, and starts its 3 s again once left (ux K4); new words restart it;
//   - an alert with data-tone="danger" stays until it is closed, so an error is never missed;
//   - Esc closes it, as does a press on [data-close]; a press on [data-undo] sends "undo" and closes it;
//   - Ctrl+Z (⌘Z on a Mac) presses Undo from anywhere on the page while it is open, outside a field (which keeps
//     its own undo), so a keyboard user never has to travel to it (ux K6, I1);
//   - closing while the focus is in it gives the focus back to what had it when the toast opened (I2).
// Closing removes open and sends "close". It sits above the section names stacked at the bottom of a phone screen
// (<po-sections> says how many there are), never over them.
//
//   <po-toast open>
//     <div class="po-alert" role="status">
//       <p>Moved “Send the contract” to Archive.</p>
//       <button class="po-pressable po-button" data-variant="link" data-size="sm" data-undo>Undo</button>
//     </div>
//   </po-toast>

const SHOWN = 3000 // ms it shows before closing itself

class PoToast extends HTMLElement {
  static observedAttributes = ["open"]
  #timer = 0
  #held = false
  #opener = null
  #words = new MutationObserver(() => this.#wait())

  connectedCallback() {
    this.addEventListener("pointerenter", this.#hold)
    this.addEventListener("pointerleave", this.#release)
    this.addEventListener("focusin", this.#hold)
    this.addEventListener("focusout", this.#release)
    this.addEventListener("click", this.#onClick)
    this.#words.observe(this, { childList: true, subtree: true, characterData: true })
    this.#sync()
  }

  disconnectedCallback() {
    clearTimeout(this.#timer)
    this.#words.disconnect()
    document.removeEventListener("keydown", this.#onKey)
    this.removeEventListener("pointerenter", this.#hold)
    this.removeEventListener("pointerleave", this.#release)
    this.removeEventListener("focusin", this.#hold)
    this.removeEventListener("focusout", this.#release)
    this.removeEventListener("click", this.#onClick)
  }

  attributeChangedCallback() { if (this.isConnected) this.#sync() }

  get #open() { return this.hasAttribute("open") }
  get #stays() { return !!this.querySelector('.po-alert[data-tone="danger"]') }

  #sync() {
    if (this.#open) {
      if (!this.contains(document.activeElement)) this.#opener = document.activeElement
      document.addEventListener("keydown", this.#onKey)
    } else {
      document.removeEventListener("keydown", this.#onKey)
      this.#held = false
    }
    this.#wait()
  }

  #wait() {
    clearTimeout(this.#timer)
    if (this.#open && !this.#held && !this.#stays) this.#timer = setTimeout(() => this.close(), SHOWN)
  }

  close() {
    if (!this.#open) return
    const hadFocus = this.contains(document.activeElement)
    this.removeAttribute("open")
    if (hadFocus && this.#opener?.isConnected) this.#opener.focus({ preventScroll: true })
    this.dispatchEvent(new CustomEvent("close", { bubbles: true }))
  }

  #hold = () => { this.#held = true; clearTimeout(this.#timer) }
  #release = (e) => {
    if (e.type === "focusout" && this.contains(e.relatedTarget)) return
    if (e.type === "pointerleave" && this.contains(document.activeElement)) return
    this.#held = false
    this.#wait()
  }

  #onClick = (e) => {
    if (e.target.closest("[data-undo]")) {
      this.dispatchEvent(new CustomEvent("undo", { bubbles: true }))
      this.close()
    } else if (e.target.closest("[data-close]")) this.close()
  }

  #onKey = (e) => {
    if (e.defaultPrevented) return
    if (e.key === "Escape") return this.close()
    const undo = this.querySelector("[data-undo]")
    if (undo && e.key.toLowerCase() === "z" && (e.ctrlKey || e.metaKey) && !e.shiftKey && !e.target.closest?.("input, textarea, [contenteditable]")) {
      e.preventDefault()
      undo.click()
    }
  }
}

if (!customElements.get("po-toast")) customElements.define("po-toast", PoToast)

export { PoToast }
