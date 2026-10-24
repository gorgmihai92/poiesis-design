---
name: components
description: The Poiesis component library, all its own and with no dependencies - tokens (from poiesis-ui), primitives (layout, text, surface, pressable, field, focus, motion), thirteen fundamental components where every variant is a setting (icon, button, input, label, checkbox, list, tabs, tooltip, collapsible, alert, progress, status dot, separator) and patterns built from them (combobox, picker, date pick, line form, pager, toast, bars, empty, masthead, sections, nav, frame), in plain CSS with small custom elements (<po-morph>, <po-tabs>, <po-tooltip>, and the patterns' <po-combobox>, <po-picker>, <po-date-pick>, <po-line-form>, <po-pager>, <po-toast>, <po-sections>) where behavior needs script. Use when building or restyling an interface, adding one of these pieces, or making a new primitive, component or pattern that follows the poiesis-ui and poiesis-ux rules.
---

# Poiesis Components

The Poiesis library: written from scratch, on nothing but the browser. No framework, no component library, no
CSS framework, no icon or animation package. It is four layers, each built only from the ones before:

1. **Tokens** (poiesis-ui `tokens/`): atoms, the values a project changes, and cells derived from them, the
   values code reads (`var(--ink)`, `var(--control-md)`, `var(--block-pad)`). Not in this folder.
2. **Primitives** (`library/primitives/`): `layout` (`.po-stack`, `.po-row`, `.po-grid`, `.po-box`, widths),
   `text` (the roles `.po-title` … `.po-code`, `.po-ui`, `.po-muted`, and `.po-text` with `data-tone`),
   `surface` (`.po-paper`, `.po-block`, `.po-layer`), `pressable` (`.po-pressable`: component text, cursor,
   hover, selected, disabled), `field` (`.po-field`: the edge, placeholder, invalid, disabled), `focus` (the one
   focus ring) and `motion` (`.po-fold` and `<po-morph>`: one motion for what opens and what is swapped).
3. **Components** (`library/components/`): the fundamentals, thirteen, one thing each: icon, button, input,
   label, checkbox, list, tabs, tooltip, collapsible, alert, progress, status dot, separator. One `.css` each, and
   a `.js` only for tabs and tooltip. What each is for, its settings and its markup: `catalog.md`.
4. **Patterns** (`library/patterns/`): components joined, with the behavior that joins them: combobox (an input
   with suggestions), picker (a search and what it finds), date pick, line form, pager, toast, bars, empty,
   masthead, sections, nav (the places of an app, the current one strong) and frame (a side column and the page).

`$C` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/components`).

**Set up.** The page's stylesheet imports, in this order: `<poiesis-ui>/skills/ui/tokens/poiesis.css`, the
theme `tokens/themes/poiesis.css`, then `library/poiesis-components.css` (or a copy). Load
`library/poiesis-components.js` once, as a module, when the page has a morph, tabs, a tooltip or a pattern with
behavior. Read the files in place from a poiesis-design checkout or copy them, and say which:
`node $C/scripts/add.mjs button tabs --to src/poiesis` copies the primitives, the icon set and the components and
patterns named (a pattern brings the components it is built from), with entry files that load just those (`all`
for every one, `--list` to see them). No package is ever installed.

**Use.** Markup names the layers it uses: a component sits on its primitive, both as classes
(`<button class="po-pressable po-button">`, `<input class="po-field po-input">`). Every variant is a setting of
its component, never a component of its own: `data-variant` (the look), `data-size` (sm · md · lg), `data-shape`,
`data-tone` (a role's color, the same name everywhere), `data-state`. States are the native ones and ARIA (`:disabled`, `:checked`,
`aria-pressed`, `aria-selected`, `aria-invalid`), so any framework can render them and wrap them later without
changing them. Change the look by changing atoms, never a component's CSS from outside.

**Fundamentals only.** A component is one thing people use, and each thing has one component: a toggle is a
button that stays pressed, a switch is a checkbox, a bare field is an input, suggestions are a list of options,
a spinner is an icon that spins, a level is a progress. Before adding a component, check whether it is a setting
of one that exists; add the setting there. A component never contains another component. A combination worth
having everywhere, whose parts need behavior to work together, is a pattern in `patterns/`, built only from
components; anything an app needs only for itself stays in that app.

**Rules every primitive, component and pattern keeps** (and a new one follows):
- **Its own, from scratch.** No import from outside this library and poiesis-ui's tokens; no copied code from
  another library. A new piece is written here.
- **Cells only** (T1, S1, C1, G1): colors, radii, heights, padding, icon sizes and durations are `var(--cell)`;
  spacing is `calc(var(--space) * n)`; atoms are never read directly (C1). No literal colors, no px except a 1px
  hairline (separator, the edge of an input, G2), no `@media (prefers-color-scheme)` (the cells handle dark).
- **All component text is one size**, `--text-ui` (T6): `--weight-strong` on buttons, tabs and the pressable
  base, `--weight-regular` elsewhere; secondary text `--muted`; the sans face.
- **States from the state cells** (G3): selected `--selected-bg` / `--selected-fg` / `--selected-ring`; hover
  `--surface` on plain controls, `opacity: var(--hover)` on filled ones; disabled `opacity: var(--disabled)`. The
  pressable and field primitives already hold them.
- **Native first.** A native element when one does the job, so keyboard, form and screen-reader behavior come
  free: `<button>`, a checkbox (for a toggle, a check and a switch), `<details>`, `<progress>`, `<hr>`, the
  `popover` attribute. Script only where nothing native does it, as a custom element named `po-*` with attributes
  in and a `change` event out.
- **Access** (poiesis-ux): a keyboard path (I1), the shared focus ring at full strength (I2, C3), a name for every
  control (I3), never color alone (C4: alerts, levels and status dots carry a shape too), motion only inside
  `@media (prefers-reduced-motion: no-preference)` (I5), nothing that shifts layout when a state changes (K3), Esc
  closes anything that floats (K1).
- **One motion** (ui G7–G11): what opens, closes or swaps glides its height as it fades, on `--duration-base` and
  `--ease` (fold, morph, the collapsible); what leaves stays until it has folded away; it is clipped while it
  moves and never scrolls; several changes at once go in sequence, `--duration-fast` apart (`--po-step`).
- **Layers**: primitives in `@layer poiesis.primitives`, components in `@layer poiesis.components`, patterns in
  `@layer poiesis.patterns`, so each wins over the layer below and a project's own CSS wins over all.

A new component goes in `components/` as one `.css` (and a `.js` if it needs behavior), a new pattern in
`patterns/` (with the components it is built from in `PARTS`, in `add.mjs`); each is imported in
`poiesis-components.css` (and `.js`), added to `catalog.md` and shown in the gallery.

**Check.** `node <poiesis-ui>/skills/ui/scripts/scan.mjs <dir>` for literal values, `poiesis-ui:ui-auditor` for
the look, `poiesis-ux:ux-tester` for the behavior. To see every primitive, component and pattern in its states:
poiesis-gallery (`npm run dev` next to poiesis-design; no install).
