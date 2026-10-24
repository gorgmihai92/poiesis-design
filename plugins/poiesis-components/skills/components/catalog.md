# Catalog

The Poiesis library: each primitive, component and pattern, what it is for, its settings, its markup and its file
in `library/`. All plain CSS on poiesis-ui's tokens; the morph, tabs, tooltip and the patterns with behavior add a
custom element. poiesis-gallery shows each one in its states.

## Primitives

| Primitive | For | Markup | File |
|---|---|---|---|
| Layout | placing things: stack, row (wraps), grid (as many columns as fit), padded box; widths | `.po-stack` `.po-row` `.po-grid` `.po-box` with `--po-gap`, `--po-pad`, `--po-min`; `.po-measure`, `.po-narrow` | primitives/layout.css |
| Text | the page text roles, component text, and a role's color on words | `.po-title` `.po-heading` `.po-subheading` `.po-body` `.po-caption` `.po-code` `.po-ui` `.po-muted`; `.po-text` with `data-tone` (info, success, warning, caution, danger, new, muted) | primitives/text.css |
| Surface | what things sit on: the page, a block (a card: add `.po-box` for its padding), a floating layer | `.po-paper` `.po-block` `.po-layer` | primitives/surface.css |
| Pressable | the base of everything pressed: text, cursor, hover, selected, disabled | `.po-pressable` | primitives/pressable.css |
| Field | the base of everything typed into: edge, placeholder, invalid, disabled; on the control or on a box holding it | `.po-field` | primitives/field.css |
| Focus | the one focus ring, for pressables, fields and `.po-focus` | (applies itself) | primitives/focus.css |
| Motion | one motion for what opens and what is swapped: a fold opens and closes content in place (closed is `inert`; one plain child holds the spacing); a morph glides between the content it is given | `<div class="po-fold" inert><div>…</div></div>`; `<po-morph>…</po-morph>` | primitives/motion.css, motion.js |

## Components

The fundamentals: one thing each, every variant a setting.

| Component | For | Settings | Markup | File |
|---|---|---|---|---|
| Icon | the one icon set (G5): chevron-down, close, check, grid, filter, spinner, circle, plus, pencil, calendar-plus, search, arrow-left, arrow-right, and one per role (info, success, warning, caution, danger, new) | `data-icon`; `data-spin` (loading for an unknown time, with `role="status"` and a label) | `<span class="po-icon" data-icon="grid" aria-hidden="true">` | components/icon.css |
| Button | one action, or one thing pressed or not (a checkbox inside, or `aria-pressed`) | `data-variant` primary (default, once per view, H3) · secondary · outline · ghost · danger · link · quiet; `data-size` sm · lg; `data-shape="icon"` | `<button class="po-pressable po-button">`; pressed or not: `<label class="po-pressable po-button"><input type="checkbox">Bold</label>` | components/button.css |
| Input | text typed in, one line or several (`textarea`); `aria-invalid` and `aria-describedby` for its error | `data-variant` box (default) · bare (no box, a rule under the words); `data-size` sm · lg; icons: the box holds them and the control | `<input class="po-field po-input">`; with icons: `<div class="po-field po-input"><span class="po-icon" …></span><input></div>` | components/input.css |
| Label | the name of a control | — | `<label class="po-label" for="…">` | components/label.css |
| Checkbox | one thing on or off: a native checkbox in a quiet square | `data-variant` check (default: marks done, a faint circle that turns into the success tick) · switch (a setting that applies at once; add `role="switch"`); `--po-step` to tick several in sequence | `<label class="po-checkbox"><input type="checkbox" aria-label="…"></label>` | components/checkbox.css |
| List | items one under another: a mark column, the words, a note or actions at the end | `data-variant` lines (default: a rule under the words, actions on hover) · options (a short list to choose from: rounded rows, `aria-selected` highlight, buttons that act at once, `aria-current`, five at most and the rest in `.po-list-more`); per item `data-state="done"`, `data-rule="none"`, `data-wrap`; parts `.po-item-mark` `.po-item-text` `.po-item-detail` `.po-item-note` `.po-item-actions`; `.po-list-indent` sets what follows in from the words | `<ul class="po-list"><li class="po-item">…</li></ul>` | components/list.css |
| Tabs | sections of one screen; arrow keys, Home, End | `data-variant` segmented (default) · line; `orientation="vertical"` | `<po-tabs value="…">` with `[role=tablist]`, `[role=tab].po-pressable[data-value]`, `[role=tabpanel][data-value]` | components/tabs.css, tabs.js |
| Tooltip | a short explanation on hover and focus; stays while hovered; Esc closes; never the native `title` | `side` top · bottom · left · right | `<po-tooltip class="po-layer" for="id">` | components/tooltip.css, tooltip.js |
| Collapsible | secondary content under its trigger; folds open and closed | — | `<details class="po-collapsible"><summary class="po-pressable">` | components/collapsible.css |
| Alert | a status message; a tone shows a mark of that role's shape and color | `data-tone` info · success · warning · caution · danger · new | `<div class="po-alert" data-tone="success" role="status">` | components/alert.css |
| Progress | how much is done, or how high a level is | `data-variant` bar (default: native `<progress>`, no value for an unknown time) · level (1–3 rising bars, `data-value`); `data-tone` | `<progress class="po-progress" value="64" max="100">`; `<span class="po-progress" data-variant="level" data-value="2" role="img" aria-label="…">` | components/progress.css |
| Status dot | a process active (pulsing), paused, stopped or error, by shape and color | `data-state` | `<span class="po-status-dot" data-state="paused" role="img" aria-label="…">` | components/status-dot.css |
| Separator | a divider between groups | `aria-orientation="vertical"` in a row | `<hr class="po-separator">` | components/separator.css |

Colors: one color per role, the palette's, for icons, marks, lines, text and fills alike; everything else is
grey. Text stays ink for contrast (C3): a danger alert is red in its mark and edge, a danger button's text is
`--on-color`.

Text: every component's text is `--text-ui` (T6), in the sans face; `--weight-strong` on buttons, tabs and the
pressable base, `--weight-regular` elsewhere; secondary text `--muted`. States (selected, hover, disabled) and sizes
(control height, padding, icon) come from their cells, so density, selection style and motion follow the theme.

## Patterns

Components joined, with the behavior that joins them. Each brings the components it is built from (`add.mjs`).

| Pattern | For | Markup | File |
|---|---|---|---|
| Combobox | an input with suggestions under it: typing narrows them, five show and the rest are counted, nothing is highlighted until ↓ ↑ or the pointer moves, Enter takes only a highlighted one, Tab the highlighted or first, Esc closes the list first; sends `change` | `<po-combobox>` with an input, then a fold holding a `.po-list` of options | patterns/combobox.css, combobox.js |
| Picker | a search line and what it finds under it, to choose one item from many: five shown and the rest counted, every word typed must match, ↓ ↑ move between them, Esc sends `close`, a press sends `change`; words for nothing found, announced | `<po-picker>` with a `.po-item` (search mark, bare input), a `.po-list` of options of `button.po-item`, and `.po-picker-empty` | patterns/picker.css, picker.js |
| Date pick | a date button (the calendar icon, faint, or the date in words and its tone) and the list it opens under its line: five quick dates with their days, "No date", a bare input for any other day; opens when the keyboard reaches it; Esc closes the list first; sends `change` | `<po-date-pick label="date">` (`value`, `prefix`, `icon`, `below`) | patterns/date-pick.css, date-pick.js |
| Line form | one line to add or edit an item: quiet until written (then ✓ and ✕), Enter saves, leaving the line saves an edit and, with `add-on-blur`, adds; Esc empties it; Esc keeps the focus in the emptied line; its buttons keep the focus in the field; the date list opens under it; a save is announced; sends `save` and `cancel` | `<po-line-form>` with a `form.po-item` (mark, bare input, `.po-line-form-controls`) and a fold holding `[data-below]` | patterns/line-form.css, line-form.js |
| Pager | which part of a long list shows ("1–5 of 12 · 3 done", announced) and arrows, with tooltips, to the parts before and after; at an end the focus moves to the other arrow; sends `change` | `<po-pager total="12" from="0" note="3 done" of-label="of" prev-label="…" next-label="…">` | patterns/pager.css, pager.js |
| Toast | what just happened at the bottom of the screen, with Undo: closes after 3 s, waits while pointed at or focused, a danger one stays, Esc closes it and gives the focus back, Ctrl/⌘ Z presses Undo from anywhere; above the section names stacked on a phone; sends `undo`, `close` | `<po-toast open>` holding a `.po-alert` with a `[data-undo]` or `[data-close]` button | patterns/toast.css, toast.js |
| Bars | a few counts side by side: a name, a progress bar against the largest count, the count in words | `<div class="po-bars">` with, per row, a name, a `<progress class="po-progress">` and the count | patterns/bars.css |
| Empty | what an empty place is for and how to fill it: a title, a line, one action, centered in a box with a line around it | `<div class="po-empty">` with `.po-empty-title`, `.po-empty-text` and a button | patterns/empty.css |
| Masthead | the top of a page or app: its name with a byline, what it is in one muted line, one action; as the first name of sections, the byline follows its grey | `<header class="po-masthead">` with `.po-masthead-name`, `.po-masthead-byline`, `.po-masthead-description` | patterns/masthead.css |
| Sections | a long page whose section names always show: passed ones stacked at the top, coming ones at the bottom, the current one in ink, the address following it; across the page on narrow screens, in a column level with each section from 64rem; no blank screen between sections (`no-advance` turns the glide off) | `<po-sections>` with, per section, `.po-sections-head` (an `h2` with a link, `.po-sections-about`) and its `<section id>` | patterns/sections.css, sections.js |
| Nav | the places of an app or site, or the sections of a long page: links one under another (across the page on narrow screens, a column from 64rem), every link ink, the one you are on (`aria-current` page or location) ink and strong with no fill, the surface behind the one pointed at; groups under a muted name | `<nav class="po-nav" aria-label="…">` with optional `.po-nav-group` names and `<ul>`s of `<a class="po-pressable">` | patterns/nav.css |
| Frame | the page of an app or site with a side column: the masthead, the nav and what belongs to the whole app in the side, the page in the main; the side above the page on narrow screens, from 64rem a column that stays in view, a free column as wide as it, then the page, all centered at the page width; `--po-side` sets the columns' width (16rem) | `<div class="po-frame">` with `<aside class="po-frame-side">` and `<main class="po-frame-main">` | patterns/frame.css |
| Form field | a control with its name, hint and error as one group: the label 6px above the control, the hint and the error 4px under it, no outer margin; the form sets the space between fields (S2) | `<div class="po-form-field">` with `.po-label`, the control, `.po-form-hint`, `.po-form-error` (`role="alert"`) | patterns/form-field.css |
