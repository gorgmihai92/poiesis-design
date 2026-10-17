# Catalog

The Poiesis component set: what each is for and its file in `library/`. All are shadcn/ui (radix-nova) except
status dot, meter, masthead, page section and section nav, built the same way; `utils.ts` holds `cn`. poiesis-gallery shows each one in its states.

| Component | For | File |
|---|---|---|
| Button | one action: `default` (primary, once per view, H3), `secondary`, `outline`, `ghost`, `danger`, `link`, `quiet` (a link that is not an action: a byline or credit, in the text's own color); size `inline` for a link inside a sentence; sizes `xs`–`lg` and icon sizes | button.tsx |
| Tabs | sections of a screen: `line` (main navigation) or the default segmented control (views of the same content) | tabs.tsx |
| Tooltip | a short explanation on hover and focus, Esc closes; never the native `title` | tooltip.tsx |
| Switch | an on/off setting that applies at once, next to its label (in a `Field`) | switch.tsx |
| Field | a labelled control with description and error: `Field`, `FieldLabel`, `FieldDescription`, `FieldError`, `FieldSet`, `FieldGroup` | field.tsx |
| Input, Label | a text input; its label | input.tsx, label.tsx |
| Alert | a status message in a role color (`info`, `success`, `warning`, `caution`, `danger`, `new`) with title, description and action | alert.tsx |
| Card | one item or group as a block (on a grey step or apart by a line, `--atom-fill`) | card.tsx |
| Collapsible | secondary content under its trigger | collapsible.tsx |
| Empty | an empty view that says why and what to do | empty.tsx |
| StatusDot | a process `active` (pulsing), `paused`, `stopped` or `error`, by color and shape; give it an `aria-label` | status-dot.tsx |
| Meter | a level 1–3 as rising bars, the tone repeating the count | meter.tsx |
| Progress | how much of a known amount is done | progress.tsx |
| Spinner | something loading, for an unknown time | spinner.tsx |
| Separator | a divider between groups | separator.tsx |
| Masthead | the top of a page or app: `MastheadTitle` holding `MastheadName` and a muted `MastheadByline`, then one `default` button as the call to action | masthead.tsx |
| PageSection | one section of a long page: divider on top, content near it, `--section-space` after; parts `--subsection-space` apart. `PageSectionHeader`, `-Title`, `-Description` | page-section.tsx |
| SectionNav | navigation for a page of sections, in a side column: passed rows stack at the top, coming rows at the bottom, rows ride up with their sections; the current one ink with its description, the rest faint, darkening as they near (`text-nearness`); a wrapped list on narrow screens | section-nav.tsx |
| Toggle, ToggleGroup | a pressed / not pressed control; a group of them | toggle.tsx, toggle-group.tsx |

Colors: one color per role, the palette's, for icons, small shapes, lines, text and fills alike (`text-danger`,
`border-danger`, `bg-danger`); everything else is grey. Alerts sit on the paper inside a grey divider line, with no fill;
the role shown by the icon's color, ink text. Danger is red throughout: text, line and icon.

Text: every component's text is `text-ui` (T6, 13px), containers included, in the sans face; `font-strong` (700) on
buttons, toggles, tabs and the titles of cards and empty states, `font-regular` (400) elsewhere;
secondary text `text-muted`. States (selected, hover, disabled) and sizes (control height,
padding, icon) come from their cells, so density, selection style and motion follow the theme.
