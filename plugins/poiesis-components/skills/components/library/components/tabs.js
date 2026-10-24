// Component · tabs: the behavior of <po-tabs>. It reads the tabs ([role=tab]) and panels ([role=tabpanel]) inside
// it, matched by data-value, and keeps them in step:
//   - one tab is selected (the value attribute, else the first), its panel shown, the others hidden;
//   - the tab list is one stop in the tab order; arrow keys move between tabs and select the one reached, Home
//     and End go to the ends (I1); orientation="vertical" uses up and down;
//   - each tab names its panel and each panel its tab (aria-controls, aria-labelledby), for screen readers (I3).
// It sends a "change" event (detail.value) when the person selects a tab. Set the value attribute or property to
// select one from code.

let count = 0

class PoTabs extends HTMLElement {
  static observedAttributes = ["value", "orientation"]

  #id = `po-tabs-${++count}`
  #observer = new MutationObserver(() => this.#sync())

  // The selected value: the attribute when a tab has it, else the first tab that can be selected, so the list always
  // has a selected tab and a Tab stop (I1).
  get value() {
    const tabs = this.#tabs()
    const wanted = this.getAttribute("value")
    if (tabs.some((t) => t.dataset.value === wanted && !t.disabled)) return wanted
    return tabs.find((t) => !t.disabled)?.dataset.value ?? ""
  }
  set value(v) { this.setAttribute("value", v) }

  connectedCallback() {
    this.addEventListener("click", this.#onClick)
    this.addEventListener("keydown", this.#onKey)
    this.#observer.observe(this, { childList: true, subtree: true, attributeFilter: ["data-value", "disabled"] })
    this.#sync()
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick)
    this.removeEventListener("keydown", this.#onKey)
    this.#observer.disconnect()
  }

  attributeChangedCallback() { if (this.isConnected) this.#sync() }

  // Only this element's own tabs and panels, never those of tabs nested inside a panel.
  #own(selector) { return [...this.querySelectorAll(selector)].filter((el) => el.closest("po-tabs") === this) }
  #tabs() { return this.#own('[role="tab"]') }
  #panels() { return this.#own('[role="tabpanel"]') }

  #sync() {
    this.#observer.disconnect()
    const value = this.value
    const orientation = this.getAttribute("orientation") === "vertical" ? "vertical" : "horizontal"
    const panels = new Map(this.#panels().map((p) => [p.dataset.value, p]))
    for (const list of this.#own('[role="tablist"]')) list.setAttribute("aria-orientation", orientation)
    this.#tabs().forEach((tab, i) => {
      const selected = tab.dataset.value === value
      const panel = panels.get(tab.dataset.value)
      tab.id ||= `${this.#id}-tab-${i}`
      if (tab.tagName === "BUTTON") tab.type = "button"
      tab.setAttribute("aria-selected", String(selected))
      tab.tabIndex = selected ? 0 : -1
      if (panel) {
        panel.id ||= `${this.#id}-panel-${i}`
        tab.setAttribute("aria-controls", panel.id)
        panel.setAttribute("aria-labelledby", tab.id)
      } else tab.removeAttribute("aria-controls")
    })
    for (const [v, panel] of panels) {
      panel.hidden = v !== value
      // A panel may hold no control of its own, so it is reachable with Tab.
      panel.tabIndex = 0
    }
    this.#observer.observe(this, { childList: true, subtree: true, attributeFilter: ["data-value", "disabled"] })
  }

  #select(tab) {
    if (!tab || tab.disabled || tab.dataset.value === this.value) return
    this.value = tab.dataset.value
    this.dispatchEvent(new CustomEvent("change", { bubbles: true, detail: { value: tab.dataset.value } }))
  }

  #onClick = (e) => {
    const tab = e.target.closest('[role="tab"]')
    if (tab && this.#tabs().includes(tab)) this.#select(tab)
  }

  #onKey = (e) => {
    const tabs = this.#tabs().filter((t) => !t.disabled)
    const at = tabs.indexOf(e.target)
    if (at < 0) return
    const vertical = this.getAttribute("orientation") === "vertical"
    const next = vertical ? "ArrowDown" : "ArrowRight"
    const prev = vertical ? "ArrowUp" : "ArrowLeft"
    const to =
      e.key === next ? (at + 1) % tabs.length
      : e.key === prev ? (at - 1 + tabs.length) % tabs.length
      : e.key === "Home" ? 0
      : e.key === "End" ? tabs.length - 1
      : -1
    if (to < 0) return
    e.preventDefault()
    tabs[to].focus()
    this.#select(tabs[to])
  }
}

if (!customElements.get("po-tabs")) customElements.define("po-tabs", PoTabs)

export { PoTabs }
