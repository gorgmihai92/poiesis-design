// Pattern · sections: the behavior of <po-sections> (sections.css for the markup). It keeps the names, the
// address and the scroll in step:
//   - the current section is the last one that has reached its name's resting place; its name is the current one
//     (aria-current="location"), and the address follows it (replaceState, so Back isn't filled with every
//     section passed);
//   - a name takes you to its section, set where its name rests, so the name you chose is the current one; Back
//     and Forward do the same;
//   - a page opened on a section (a link, a reload) stays unseen until it stands there, and never longer than 1 s,
//     so it doesn't jump (ux R5); the page places itself, so the browser's own restoring of the old scroll is off;
//   - no blank screen between sections (ux K13): once the scroll rests in the room after a section's content, with
//     more than half the screen empty, the page glides on to the next section, or, scrolling up, back to the end of
//     this one's content (a small move up from the next section returns to it). A short section resting in its
//     place shows its room and stays. One scroll moves one section: what is left of it (a wheel's or trackpad's
//     momentum) is held back after a glide, and nothing moves while a finger is on the screen (ux K5). Under
//     reduced motion it jumps instead of gliding. The attribute no-advance turns this off.
// Heads and sections are matched in order; sections added or removed later are followed.

const SETTLE = 150 // ms of stillness that ends a scroll
const PLACE_MAX = 1000 // ms a page opened on a section may stay unseen
const GLIDE = 600 // ms a browser's smooth scroll takes, about

class PoSections extends HTMLElement {
  #heads = []
  #sections = []
  #current = -1
  #scrolled = false
  #frame = 0
  #settle = 0
  #release = 0
  #held = false
  #since = 0
  #touching = false
  #down = true
  #last = 0
  #placing = ""
  #structure = new MutationObserver(() => { this.#index(); this.#place() })

  connectedCallback() {
    this.#index()
    this.#structure.observe(this, { childList: true })
    this.#last = scrollY
    this.addEventListener("click", this.#onClick)
    addEventListener("scroll", this.#onScroll, { passive: true })
    addEventListener("popstate", this.#onPop)
    addEventListener("wheel", this.#onWheel, { passive: false })
    addEventListener("touchstart", this.#onTouch, { passive: true })
    addEventListener("touchend", this.#onTouch, { passive: true })
    addEventListener("touchcancel", this.#onTouch, { passive: true })
    // The address always names the section you were in, so a reload comes back to it from there.
    if ("scrollRestoration" in history) history.scrollRestoration = "manual"
    const id = decodeURIComponent(location.hash.slice(1))
    if (id && this.#sections.some((s) => s.id === id)) {
      this.#placing = id
      this.dataset.placing = ""
      setTimeout(() => this.#placed(), PLACE_MAX)
      Promise.race([document.fonts?.ready, new Promise((r) => setTimeout(r, PLACE_MAX))])
        .then(() => requestAnimationFrame(() => this.#place()))
    }
    this.#follow()
  }

  disconnectedCallback() {
    this.#structure.disconnect()
    document.documentElement.style.removeProperty("--po-sections-n")
    this.removeEventListener("click", this.#onClick)
    removeEventListener("scroll", this.#onScroll)
    removeEventListener("popstate", this.#onPop)
    removeEventListener("wheel", this.#onWheel)
    removeEventListener("touchstart", this.#onTouch)
    removeEventListener("touchend", this.#onTouch)
    removeEventListener("touchcancel", this.#onTouch)
    cancelAnimationFrame(this.#frame)
    clearTimeout(this.#settle)
    clearTimeout(this.#release)
  }

  // Each head and section gets its place in the list (--po-i) and the list its length (--po-n), which the
  // stylesheet stacks the names by; each section is named by its head.
  #index() {
    this.#heads = [...this.querySelectorAll(":scope > .po-sections-head")]
    this.#sections = [...this.querySelectorAll(":scope > section")]
    this.style.setProperty("--po-n", String(this.#heads.length))
    // The page's root knows too, for what floats above the names stacked at the bottom (a toast).
    document.documentElement.style.setProperty("--po-sections-n", String(this.#heads.length))
    this.#heads.forEach((head, i) => {
      head.style.setProperty("--po-i", String(i))
      const section = this.#sections[i]
      if (!section) return
      section.style.setProperty("--po-i", String(i))
      const title = head.querySelector("h2")
      if (title) {
        title.id ||= `${section.id}-name`
        section.setAttribute("aria-labelledby", title.id)
      }
    })
    this.#current = -1
  }

  #row() { return this.#heads[0]?.offsetHeight ?? 0 }
  // Where section i starts on screen while it is current: under its name on narrow screens, level with it on wide
  // ones (where the name's negative margin lets the section rise beside it).
  #rest(i) {
    const style = getComputedStyle(this.#heads[i])
    return parseFloat(style.top) + this.#heads[i].offsetHeight + parseFloat(style.marginBlockEnd)
  }
  #top(i) { return this.#sections[i].getBoundingClientRect().top }
  #wide() { return this.#heads[0] ? parseFloat(getComputedStyle(this.#heads[0]).marginBlockEnd) < 0 : false }
  #still() { return matchMedia("(prefers-reduced-motion: reduce)").matches }

  #align(i, behavior) {
    if (!this.#sections[i]) return
    scrollTo({ top: scrollY + this.#top(i) - this.#rest(i), behavior })
  }

  #follow = () => {
    this.#frame = 0
    const n = Math.min(this.#heads.length, this.#sections.length)
    let at = 0
    for (let i = 0; i < n; i++) if (this.#top(i) <= this.#rest(i) + 1) at = i
    if (at !== this.#current) {
      this.#current = at
      this.#heads.forEach((head, i) => {
        const link = head.querySelector("a")
        if (i === at) link?.setAttribute("aria-current", "location")
        else link?.removeAttribute("aria-current")
      })
    }
    const hash = `#${this.#sections[at]?.id ?? ""}`
    if (this.#scrolled && !this.#placing && hash !== "#" && location.hash !== hash) history.replaceState(history.state, "", hash)
  }

  #place() {
    if (!this.#placing) return
    const i = this.#sections.findIndex((s) => s.id === this.#placing)
    if (i < 0) return
    this.#align(i, "instant")
    requestAnimationFrame(() => this.#placed())
  }

  #placed() {
    this.#placing = ""
    delete this.dataset.placing
    this.#follow()
  }

  #onClick = (e) => {
    const link = e.target.closest(".po-sections-head a[href^='#']")
    if (!link || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
    const i = this.#sections.findIndex((s) => `#${s.id}` === link.getAttribute("href"))
    if (i < 0) return
    e.preventDefault()
    this.#align(i, this.#still() ? "instant" : "smooth")
    history.pushState(history.state, "", `#${this.#sections[i].id}`)
  }

  #onPop = () => {
    const i = this.#sections.findIndex((s) => `#${s.id}` === location.hash)
    if (i >= 0) requestAnimationFrame(() => this.#align(i, "instant"))
  }

  #onScroll = () => {
    this.#scrolled = true
    if (scrollY !== this.#last) this.#down = scrollY > this.#last
    this.#last = scrollY
    if (!this.#frame) this.#frame = requestAnimationFrame(this.#follow)
    clearTimeout(this.#settle)
    this.#settle = setTimeout(this.#advance, SETTLE)
  }

  // After a glide, the rest of that scroll is held back until the glide has run and no wheel has turned for a
  // moment, so one scroll moves one section.
  #hold() {
    clearTimeout(this.#release)
    this.#release = setTimeout(() => { this.#held = false }, Math.max(SETTLE + 100, this.#since + GLIDE - performance.now()))
  }

  #onWheel = (e) => {
    if (!this.#held) return
    e.preventDefault()
    this.#hold()
  }

  #onTouch = (e) => {
    this.#touching = e.touches.length > 0
    // A finger on the screen is a scroll of its own.
    if (this.#touching) {
      this.#held = false
      clearTimeout(this.#release)
    } else {
      clearTimeout(this.#settle)
      this.#settle = setTimeout(this.#advance, SETTLE)
    }
  }

  #advance = () => {
    if (this.#touching || this.#held || this.#placing || this.hasAttribute("no-advance")) return
    const n = Math.min(this.#heads.length, this.#sections.length)
    const height = innerHeight
    const wide = this.#wide()
    for (let k = 0; k < n - 1; k++) {
      const section = this.#sections[k]
      const end = section.getBoundingClientRect().bottom - parseFloat(getComputedStyle(section).paddingBlockEnd)
      const past = this.#rest(k) - this.#top(k)
      const ahead = this.#top(k + 1) - this.#rest(k + 1)
      if (end > height / 2 || past <= 1 || ahead <= 1) continue
      const next = this.#down || ahead < height / 4
      // Back: the content's end just above the names stacked at the bottom (narrow) or the page's bottom edge (wide),
      // never above the section's own resting place.
      const below = this.#heads[wide ? n - 1 : k + 1]
      const room = parseFloat(getComputedStyle(below).bottom) + (wide ? 0 : below.offsetHeight)
      const by = next ? ahead : Math.max(end - (height - room), -past)
      this.#held = true
      this.#since = performance.now()
      this.#hold()
      scrollTo({ top: scrollY + by, behavior: this.#still() ? "instant" : "smooth" })
      return
    }
  }
}

if (!customElements.get("po-sections")) customElements.define("po-sections", PoSections)

export { PoSections }
