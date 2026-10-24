---
name: components
description: The Poiesis component library, all its own and with no dependencies - tokens (from poiesis-ui), primitives (layout, text, surface, pressable, field, focus), bare components (button, input, label, card, alert, switch, toggle, collapsible, fold, morph, line, check, options, due, bars, line tip, tabs, tooltip, separator, progress, meter, spinner, status dot, icon) and compositions (combobox, date pick, line form, picker, pager, toast, empty, masthead, sections) in plain CSS, with small custom elements (<po-tabs>, <po-tooltip>, <po-morph>, <po-line-tip>, <po-combobox>, <po-date-pick>, <po-line-form>, <po-picker>, <po-pager>, <po-toast>, <po-sections>) for the behavior that needs script. Use when building or restyling an interface, adding one of these components, or making a new primitive or component that follows the poiesis-ui and poiesis-ux rules.
---

# Poiesis Components

The Poiesis library: written from scratch, on nothing but the browser. No framework, no component library, no
CSS framework, no icon or animation package. It is four layers, each built only from the ones before:

1. **Tokens** (poiesis-ui `tokens/`): atoms, the values a project changes, and cells derived from them, the
   values code reads (`var(--ink)`, `var(--control-md)`, `var(--block-pad)`). Not in this folder.
2. **Primitives** (`library/primitives/`): `layout` (`.po-stack`, `.po-row`, `.po-grid`, `.po-box`, widths),
   `text` (the roles `.po-title` … `.po-code`, `.po-ui`, `.po-muted`), `surface` (`.po-paper`, `.po-block`,
   `.po-layer`), `pressable` (`.po-pressable`: component text, cursor, hover, selected, disabled), `field`
   (`.po-field`: the edge, placeholder, invalid, disabled) and `focus` (the one focus ring).
3. **Components** (`library/components/`): one `.css` each, and a `.js` only for tabs, tooltip, morph and line tip. What
   each is for and its markup: `catalog.md`.
4. **Compositions** (`library/compositions/`): components joined, with the behavior that joins them, a `.css` and
   a `.js` each: combobox (a field, fold and options), date pick (a button and its list of dates), line form (a
   line that adds or edits, with its date pick), picker (a search line and what it finds), pager, toast (what just
   happened, with Undo), empty and masthead (CSS only) and sections (the page's section names and its scroll).

`$C` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/components`).

**Set up.** The page's stylesheet imports, in this order: `<poiesis-ui>/skills/ui/tokens/poiesis.css`, the
theme `tokens/themes/poiesis.css`, then `library/poiesis-components.css` (or a copy). Load
`library/poiesis-components.js` once, as a module, when the page has tabs, a tooltip, a morph or a composition. Read the files in place
from a poiesis-design checkout or copy them, and say which: `node $C/scripts/add.mjs button tabs --to src/poiesis`
copies the primitives, the icon set and the components and compositions named (a composition brings the components
it is built from), with entry files that load just those (`all` for every one, `--list` to see them). No package is ever installed.

**Use.** Markup names the layers it uses: a component sits on its primitive, both as classes
(`<button class="po-pressable po-button">`). Variants and sizes are data attributes (`data-variant`,
`data-size`, `data-shape`, `data-role`, `data-tone`, `data-state`), states are the native ones and ARIA
(`:disabled`, `:checked`, `aria-pressed`, `aria-selected`, `aria-invalid`), so any framework can render them and
wrap them later without changing them. Change the look by changing atoms, never a component's CSS from outside.

**Bare components, then compositions.** A component is one thing: it never contains another component or is
assembled from several. A combination worth having everywhere, whose parts need behavior to work together (a
field with suggestions, a page of sections), is a composition in `compositions/`, built only from components;
other combinations (a field with its label and error, a toggle group, an empty state) are built in the project.

**Rules every primitive and component keeps** (and a new one follows):
- **Its own, from scratch.** No import from outside this library and poiesis-ui's tokens; no copied code from
  another library. A new piece is written here.
- **Cells only** (T1, S1, C1, G1): colors, radii, heights, padding, icon sizes and durations are `var(--cell)`;
  spacing is `calc(var(--space) * n)`; atoms are never read directly (C1). No literal colors, no px except a 1px hairline (separator, the edge
  of an input, G2), no `@media (prefers-color-scheme)` (the cells handle dark).
- **All component text is one size**, `--text-ui` (T6): `--weight-strong` on buttons, toggles, tabs and card
  titles, `--weight-regular` elsewhere; secondary text `--muted`; the sans face.
- **States from the state cells** (G3): selected `--selected-bg` / `--selected-fg` / `--selected-ring`; hover
  `--surface` on plain controls, `opacity: var(--hover)` on filled ones; disabled `opacity: var(--disabled)`. The
  pressable and field primitives already hold them.
- **Native first.** A native element when one does the job, so keyboard, form and screen-reader behavior come
  free: `<button>`, `<input type="checkbox" role="switch">`, a checkbox inside a pressable label for a toggle,
  `<details>`, `<progress>`, `<hr>`, the `popover` attribute. Script only where nothing native does it, as a
  custom element named `po-*` with attributes in and a `change` event out.
- **Access** (poiesis-ux): a keyboard path (I1), the shared focus ring at full strength (I2, C3), a name for every
  control (I3), never color alone (C4: alerts, meters and status dots carry a shape too), motion only inside
  `@media (prefers-reduced-motion: no-preference)` (I5), nothing that shifts layout when a state changes (K3), Esc
  closes anything that floats (K1).
- **One motion** (ui G7–G11): what opens, closes or swaps glides its height as it fades, on `--duration-base` and
  `--ease` (fold, morph, the collapsible); what leaves stays until it has folded away; it is clipped while it
  moves and never scrolls; several changes at once go in sequence, `--duration-fast` apart (`--po-step`).
- **Layers**: primitives in `@layer poiesis.primitives`, components in `@layer poiesis.components`, compositions in
  `@layer poiesis.compositions`, so each wins over the layer below and a project's own CSS wins over all.

A new component goes in `components/` as one `.css` (and a `.js` if it needs behavior), a new composition in
`compositions/` (with the components it is built from in `PARTS`, in `add.mjs`); each is imported in
`poiesis-components.css` (and `.js`), added to `catalog.md` and shown in the gallery.

**Check.** `node <poiesis-ui>/skills/ui/scripts/scan.mjs <dir>` for literal values, `poiesis-ui:ui-auditor` for
the look, `poiesis-ux:ux-tester` for the behavior. To see every primitive and component in its states:
poiesis-gallery (`npm run dev` next to poiesis-design; no install).
