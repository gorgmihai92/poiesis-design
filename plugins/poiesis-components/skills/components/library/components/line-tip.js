// Component · line tip: the behavior of <po-line-tip> (line-tip.css), a hint under a line that follows what is
// written. With one tip inside, it shows that one. With several, it shows one at a time, the next every 3.5 s,
// fading in on --duration-base (at once under reduced motion), and starts again from the first when its tips
// change. The page swaps the tips as the words change; the element is read out politely as they do (aria-live).

const EVERY = 3500 // ms each tip shows

class PoLineTip extends HTMLElement {
  #at = 0
  #timer = 0
  #changes = new MutationObserver(() => this.#restart())

  connectedCallback() {
    this.setAttribute("aria-live", "polite")
    this.#changes.observe(this, { childList: true })
    this.#restart()
  }

  disconnectedCallback() {
    this.#changes.disconnect()
    clearInterval(this.#timer)
  }

  get #tips() { return [...this.children] }

  #restart() {
    clearInterval(this.#timer)
    this.#at = 0
    this.#show()
    if (this.#tips.length > 1) this.#timer = setInterval(() => { this.#at = (this.#at + 1) % this.#tips.length; this.#show() }, EVERY)
  }

  #show() {
    const style = getComputedStyle(this)
    const duration = parseFloat(style.transitionDuration) * 1000
    this.#tips.forEach((tip, i) => {
      const shown = i === this.#at
      if (tip.hidden === !shown) return
      tip.hidden = !shown
      if (shown && duration && this.#tips.length > 1) tip.animate({ opacity: [0, 1] }, { duration, easing: style.transitionTimingFunction })
    })
  }
}

if (!customElements.get("po-line-tip")) customElements.define("po-line-tip", PoLineTip)

export { PoLineTip }
