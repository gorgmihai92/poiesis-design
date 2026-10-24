# Catalog

The Poiesis library: each primitive, component and composition, what it is for, its markup and its file in
`library/`. All plain CSS on poiesis-ui's tokens; tabs, tooltip, morph and the compositions add a custom element.
poiesis-gallery shows each one in its states.

## Primitives

| Primitive | For | Markup | File |
|---|---|---|---|
| Layout | placing things: stack, row (wraps), grid (as many columns as fit), padded box; widths | `.po-stack` `.po-row` `.po-grid` `.po-box` with `--po-gap`, `--po-pad`, `--po-min`; `.po-measure`, `.po-narrow` | primitives/layout.css |
| Text | the page text roles, and component text | `.po-title` `.po-heading` `.po-subheading` `.po-body` `.po-caption` `.po-code` `.po-ui` `.po-muted` | primitives/text.css |
| Surface | what things sit on | `.po-paper` `.po-block` `.po-layer` | primitives/surface.css |
| Pressable | the base of everything pressed: text, cursor, hover, selected, disabled | `.po-pressable` | primitives/pressable.css |
| Field | the base of everything typed into: edge, placeholder, invalid, disabled | `.po-field` | primitives/field.css |
| Focus | the one focus ring, for pressables, fields and `.po-focus` | (applies itself) | primitives/focus.css |

## Components

| Component | For | Markup | File |
|---|---|---|---|
| Icon | the one icon set (G5): chevron-down, close, check, grid, filter, spinner, circle, plus, pencil, calendar-plus, and one per role (info, success, warning, caution, danger, new) | `<span class="po-icon" data-icon="grid" aria-hidden="true">` | components/icon.css |
| Button | one action: `data-variant` primary (default, once per view, H3), secondary, outline, ghost, danger, link, quiet (a byline or credit in running text); `data-size` sm, lg; `data-shape="icon"` | `<button class="po-pressable po-button">` or `<a …>` | components/button.css |
| Toggle | a control pressed or not; a checkbox inside, so no script | `<label class="po-pressable po-toggle"><input type="checkbox">Bold</label>` | components/toggle.css |
| Switch | a setting on or off that applies at once, next to its label | `<input type="checkbox" role="switch" class="po-focus po-switch">` | components/switch.css |
| Input | a line of text; `aria-invalid` and `aria-describedby` for its error | `<input class="po-field po-input">` | components/input.css |
| Label | the name of a control | `<label class="po-label" for="…">` | components/label.css |
| Tabs | sections of one screen: segmented (default) or `data-variant="line"`; arrow keys, Home, End | `<po-tabs value="…">` with `[role=tablist]`, `[role=tab].po-pressable[data-value]`, `[role=tabpanel][data-value]` | components/tabs.css, tabs.js |
| Tooltip | a short explanation on hover and focus; stays while hovered; Esc closes; never the native `title` | `<po-tooltip class="po-layer" for="id">` | components/tooltip.css, tooltip.js |
| Collapsible | secondary content under its trigger; the content folds open and closed | `<details class="po-collapsible"><summary class="po-pressable">` | components/collapsible.css |
| Fold | content that opens and closes in place, opened by a control of the page's own: its height glides as it fades, what follows moves with it, a closed fold leaves no gap; closed is `inert`; one plain child holds the spacing | `<div class="po-fold" inert><div>…</div></div>` | components/fold.css |
| Morph | one place whose content is swapped (a button that becomes its form): its height glides between them, the new content fades in | `<po-morph>…</po-morph>` | components/morph.css, morph.js |
| Line | one item of a list as a row: a mark column (a check, a faint plus or pen, a chevron), its words on one line, a rule under the words only; `.po-line-actions` show over the end of the row on hover or focus (on touch, in the row); `.po-line-field` is its own field, no box, the rule its edge; `.po-line-indent` sets what follows in from the words; `data-state="done"`, `data-rule="none"`, `data-wrap` | `<div class="po-line"><span class="po-line-mark">…</span><div class="po-line-text">…</div><div class="po-line-actions">…</div></div>` | components/line.css |
| Check | marks an item done: a faint circle that turns into the circle with a tick, in success; a quiet square for a hit area; the tick grows in; several at once go in sequence with `--po-step` | `<label class="po-check"><input type="checkbox" aria-label="Done: …"></label>` | components/check.css |
| Options | a short list to choose one from, in the page under what it serves; rounded rows, a detail at the end (`.po-option-note`), five at most and the rest counted; highlighted `aria-selected`, buttons that act at once grey on hover and focus, `aria-current` in strong, a row with a field (`.po-option-field`) | `<ul class="po-options" role="listbox">` with `<li class="po-option" role="option">`, then `<p class="po-options-more">` | components/options.css |
| Due | when something is due, in words, colored by how near it is: `data-urgency` danger (late), caution (today), warning (tomorrow), else muted | `<span class="po-due" data-urgency="warning">due tomorrow</span>` | components/due.css |
| Alert | a status message; `data-role` info, success, warning, caution, danger, new shows a mark of that role's shape and color | `<div class="po-alert" data-role="success" role="status">` | components/alert.css |
| Card | one item or group as a block; `.po-card-title` for its title | `<article class="po-block po-card">` | components/card.css |
| Separator | a divider between groups; `aria-orientation="vertical"` in a row | `<hr class="po-separator">` | components/separator.css |
| Progress | how much of a known amount is done; without a value, waiting for an unknown time | `<progress class="po-progress" value="64" max="100">` | components/progress.css |
| Meter | a level 1–3 as rising bars; `data-tone` repeats the count | `<span class="po-meter" data-value="2" role="img" aria-label="…">` | components/meter.css |
| Spinner | something loading for an unknown time | `<span class="po-spinner" role="status" aria-label="Loading">` | components/spinner.css |
| Status dot | a process active (pulsing), paused, stopped or error, by shape and color | `<span class="po-status-dot" data-state="paused" role="img" aria-label="…">` | components/status-dot.css |

Colors: one color per role, the palette's, for icons, marks, lines, text and fills alike; everything else is
grey. Text stays ink for contrast (C3): a danger alert is red in its mark and edge, a danger button's text is `--on-color`.

Text: every component's text is `--text-ui` (T6), in the sans face; `--weight-strong` on buttons, toggles, tabs
and card titles, `--weight-regular` elsewhere; secondary text `--muted`. States (selected, hover, disabled) and
sizes (control height, padding, icon) come from their cells, so density, selection style and motion follow the
theme.

## Compositions

Components joined, with the behavior that joins them. Each brings the components it is built from (`add.mjs`).

| Composition | For | Markup | File |
|---|---|---|---|
| Combobox | a field with suggestions under it: typing narrows them, five show and the rest are counted, nothing is highlighted until ↓ ↑ or the pointer moves, Enter takes only a highlighted one, Tab the highlighted or first, Esc closes the list first; sends `change` | `<po-combobox>` with an input, then a fold holding `.po-options` | compositions/combobox.css, combobox.js |
| Date pick | a date button (the calendar icon, faint, or the date in words and its urgency) and the list it opens under its line: five quick dates with their days, "No date", a field for any other day; opens when the keyboard reaches it; Esc closes the list first; sends `change` | `<po-date-pick label="date">` (`value`, `prefix`, `icon`, `below`) | compositions/date-pick.css, date-pick.js |
| Line form | one line to add or edit an item: quiet until written (then ✓ and ✕), Enter saves, leaving the line saves an edit and, with `add-on-blur`, adds; Esc empties it; its buttons keep the focus in the field; the date list opens under it; sends `save` and `cancel` | `<po-line-form>` with a `form.po-line` (mark, `.po-line-field`, `.po-line-form-controls`) and a fold holding `[data-below]` | compositions/line-form.css, line-form.js |
| Sections | a long page whose section names always show: passed ones stacked at the top, coming ones at the bottom, the current one in ink, the address following it; across the page on narrow screens, in a column level with each section from 64rem, with what the current one is for under its name; a page opened on a section shows once it is there; no blank screen between sections (the scroll glides on, one section per scroll; `no-advance` turns it off) | `<po-sections>` with, per section, `.po-sections-head` (an `h2` with a link, `.po-sections-about`) and its `<section id>` | compositions/sections.css, sections.js |
