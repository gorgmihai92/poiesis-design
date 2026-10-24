// Component · tooltip: the behavior of <po-tooltip for="id">. It explains the control with that id:
//   - it opens when the pointer rests on the control (mouse and pen; touch has no hover) and when the control takes
//     keyboard focus (I1);
//   - it stays while the pointer moves onto it, and closes on leaving, on a press, on blur, and with Esc, which it
//     keeps for itself so a dialog under it stays open (K1; WCAG 1.4.13);
//   - the control is described by it while it is open (aria-describedby, I3);
//   - it sits on its side of the control (side="top" by default), moves to the other side when there is no room,
//     and stays on screen.
// It is a popover, so it floats above everything without a z-index of its own.

let count = 0
const GRACE = 100 // ms to move the pointer from the control onto the tooltip

class PoTooltip extends HTMLElement {
  #trigger = null
  #timer = 0

  connectedCallback() {
    this.id ||= `po-tooltip-${++count}`
    this.setAttribute("role", "tooltip")
    if (!this.hasAttribute("popover")) this.setAttribute("popover", "manual")
    this.addEventListener("pointerenter", this.#keep)
    this.addEventListener("pointerleave", this.#leave)
    // The control may come later in the page than its tooltip.
    queueMicrotask(() => this.#attach())
  }

  disconnectedCallback() {
    this.#hide()
    this.#detach()
    this.removeEventListener("pointerenter", this.#keep)
    this.removeEventListener("pointerleave", this.#leave)
  }

  #attach() {
    const id = this.getAttribute("for")
    const trigger = id && this.getRootNode().getElementById?.(id)
    if (!trigger || trigger === this.#trigger) return
    this.#detach()
    this.#trigger = trigger
    trigger.addEventListener("pointerenter", this.#enter)
    trigger.addEventListener("pointerleave", this.#leave)
    trigger.addEventListener("pointerdown", this.#hide)
    trigger.addEventListener("focus", this.#focus)
    trigger.addEventListener("blur", this.#hide)
  }

  #detach() {
    const t = this.#trigger
    if (!t) return
    t.removeEventListener("pointerenter", this.#enter)
    t.removeEventListener("pointerleave", this.#leave)
    t.removeEventListener("pointerdown", this.#hide)
    t.removeEventListener("focus", this.#focus)
    t.removeEventListener("blur", this.#hide)
    this.#trigger = null
  }

  get #open() { return this.matches(":popover-open") }

  #enter = (e) => { if (e.pointerType !== "touch") this.#show() }
  #focus = () => { if (this.#trigger?.matches(":focus-visible")) this.#show() }
  #keep = () => clearTimeout(this.#timer)
  #leave = () => {
    clearTimeout(this.#timer)
    this.#timer = setTimeout(this.#hide, GRACE)
  }

  #show() {
    clearTimeout(this.#timer)
    if (this.#open || !this.#trigger) return
    this.showPopover()
    const ids = (this.#trigger.getAttribute("aria-describedby") ?? "").split(/\s+/).filter(Boolean)
    if (!ids.includes(this.id)) this.#trigger.setAttribute("aria-describedby", [...ids, this.id].join(" "))
    this.#place()
    document.addEventListener("keydown", this.#onKey, true)
    addEventListener("scroll", this.#place, true)
    addEventListener("resize", this.#place)
  }

  #hide = () => {
    clearTimeout(this.#timer)
    if (!this.#open) return
    this.hidePopover()
    const t = this.#trigger
    if (t) {
      const ids = (t.getAttribute("aria-describedby") ?? "").split(/\s+/).filter((i) => i && i !== this.id)
      if (ids.length) t.setAttribute("aria-describedby", ids.join(" "))
      else t.removeAttribute("aria-describedby")
    }
    document.removeEventListener("keydown", this.#onKey, true)
    removeEventListener("scroll", this.#place, true)
    removeEventListener("resize", this.#place)
  }

  #onKey = (e) => {
    if (e.key !== "Escape") return
    e.stopPropagation()
    this.#hide()
  }

  // Its side of the control, the other side when there is no room there; kept on screen; the arrow at the
  // control's middle. The gap leaves room for the arrow, which sticks out by half its diagonal.
  #place = () => {
    if (!this.#trigger) return
    const t = this.#trigger.getBoundingClientRect()
    const box = this.getBoundingClientRect()
    const arrow = parseFloat(getComputedStyle(this, "::before").height) || 0
    const gap = arrow * Math.SQRT1_2
    const room = { top: t.top, bottom: innerHeight - t.bottom, left: t.left, right: innerWidth - t.right }
    const flip = { top: "bottom", bottom: "top", left: "right", right: "left" }
    const wanted = flip[this.getAttribute("side")] ? this.getAttribute("side") : "top"
    const need = wanted === "top" || wanted === "bottom" ? box.height + gap : box.width + gap
    const side = room[wanted] < need && room[flip[wanted]] > room[wanted] ? flip[wanted] : wanted
    const clamp = (v, max) => Math.min(Math.max(v, 0), Math.max(max, 0))
    let top, left, along
    if (side === "top" || side === "bottom") {
      left = clamp(t.left + t.width / 2 - box.width / 2, innerWidth - box.width)
      top = side === "top" ? t.top - box.height - gap : t.bottom + gap
      along = t.left + t.width / 2 - left
    } else {
      top = clamp(t.top + t.height / 2 - box.height / 2, innerHeight - box.height)
      left = side === "left" ? t.left - box.width - gap : t.right + gap
      along = t.top + t.height / 2 - top
    }
    this.dataset.side = side
    this.style.top = `${top}px`
    this.style.left = `${left}px`
    this.style.setProperty("--po-arrow", `${along}px`)
  }
}

if (!customElements.get("po-tooltip")) customElements.define("po-tooltip", PoTooltip)

export { PoTooltip }
