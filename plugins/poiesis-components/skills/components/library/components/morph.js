// Component · morph: the behavior of <po-morph>. One place whose content is swapped for other content (a button
// that becomes its form, a question that becomes its answer, an empty state that becomes a list):
//   - its height glides from the old content's to the new content's instead of jumping, so what follows moves
//     smoothly (K3, K9), and a swap during a glide carries on from where the height is;
//   - new content fades in; old content goes at once, so the two never show together.
// Nothing to set: it follows whatever is put inside it. The length and easing are the cells --duration-base and
// --ease (morph.css), so under reduced motion, where the cells are 0, the height changes at once (I5).

class PoMorph extends HTMLElement {
  #height = -1
  #glide = null
  #sizes = new ResizeObserver(() => this.#follow())
  #children = new MutationObserver((records) => this.#swapped(records))

  connectedCallback() {
    this.#watch()
    this.#children.observe(this, { childList: true })
    this.#height = this.#natural()
  }

  disconnectedCallback() {
    this.#sizes.disconnect()
    this.#children.disconnect()
    this.#glide?.cancel()
  }

  // The children's own sizes, which the glide never changes, so the height they need is always known.
  #watch() {
    this.#sizes.disconnect()
    for (const child of this.children) this.#sizes.observe(child)
  }

  #natural() {
    const range = document.createRange()
    range.selectNodeContents(this)
    return range.getBoundingClientRect().height
  }

  #timing() {
    const style = getComputedStyle(this)
    return { duration: parseFloat(style.transitionDuration) * 1000, easing: style.transitionTimingFunction }
  }

  #swapped(records) {
    this.#watch()
    const { duration, easing } = this.#timing()
    if (duration) {
      for (const record of records)
        for (const node of record.addedNodes)
          if (node instanceof HTMLElement) node.animate({ opacity: [0, 1] }, { duration, easing })
    }
    this.#follow()
  }

  #follow() {
    const to = this.#natural()
    const from = this.#glide ? this.getBoundingClientRect().height : this.#height
    this.#height = to
    if (from < 0 || Math.abs(to - from) < 0.5) return
    const { duration, easing } = this.#timing()
    this.#glide?.cancel()
    if (!duration) return
    this.dataset.moving = ""
    const glide = this.animate({ blockSize: [`${from}px`, `${to}px`] }, { duration, easing })
    this.#glide = glide
    glide.onfinish = glide.oncancel = () => {
      if (this.#glide !== glide) return
      this.#glide = null
      delete this.dataset.moving
    }
  }
}

if (!customElements.get("po-morph")) customElements.define("po-morph", PoMorph)

export { PoMorph }
