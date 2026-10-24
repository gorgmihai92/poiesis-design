# Catalog

The Poiesis library: each primitive and component, what it is for, its markup and its file in `library/`. All
plain CSS on poiesis-ui's tokens; tabs and tooltip add a custom element. poiesis-gallery shows each one in its
states.

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
| Icon | the one icon set (G5): chevron-down, close, check, grid, filter, spinner, and one per role (info, success, warning, caution, danger, new) | `<span class="po-icon" data-icon="grid" aria-hidden="true">` | components/icon.css |
| Button | one action: `data-variant` primary (default, once per view, H3), secondary, outline, ghost, danger, link, quiet (a byline or credit in running text); `data-size` sm, lg; `data-shape="icon"` | `<button class="po-pressable po-button">` or `<a …>` | components/button.css |
| Toggle | a control pressed or not; a checkbox inside, so no script | `<label class="po-pressable po-toggle"><input type="checkbox">Bold</label>` | components/toggle.css |
| Switch | a setting on or off that applies at once, next to its label | `<input type="checkbox" role="switch" class="po-focus po-switch">` | components/switch.css |
| Input | a line of text; `aria-invalid` and `aria-describedby` for its error | `<input class="po-field po-input">` | components/input.css |
| Label | the name of a control | `<label class="po-label" for="…">` | components/label.css |
| Tabs | sections of one screen: segmented (default) or `data-variant="line"`; arrow keys, Home, End | `<po-tabs value="…">` with `[role=tablist]`, `[role=tab].po-pressable[data-value]`, `[role=tabpanel][data-value]` | components/tabs.css, tabs.js |
| Tooltip | a short explanation on hover and focus; stays while hovered; Esc closes; never the native `title` | `<po-tooltip class="po-layer" for="id">` | components/tooltip.css, tooltip.js |
| Collapsible | secondary content under its trigger | `<details class="po-collapsible"><summary class="po-pressable">` | components/collapsible.css |
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
