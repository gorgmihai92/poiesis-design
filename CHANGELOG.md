# Changelog

## 0.7.2 (poiesis-ui)
- `--subsection-space` is a quarter of `--section-space` (was half).
## 0.7.1 (poiesis-ui)
- **`--subsection-space`** (`gap-(--subsection-space)`): the space between the parts of a page section, half of
  `--section-space`, so a section's parts read as groups and sections stay further apart. Rule S1.
## 0.7.0 (poiesis-ui) · 0.4.0 (poiesis-components)
**Fewer colors.** Breaking: removed names need their replacements.
- Greys: `--surface-1`, `-2`, `-3` and `--hover` become one `--surface`; the unused `--overlay` is gone. Neutrals are
  now paper, surface, divider, line, faint, muted and ink (block is the paper or the surface, by `--atom-fill`).
- One color per role: the `-strong` shades and `--atom-strong-contrast` are gone; a role's color is used for fills,
  text, icons and lines alike, so there is one red everywhere (field error, invalid input, danger button). Its
  `-tint` stays. Colored text is below 4.5:1 for most roles; resolve.mjs reports it.
- Hover in one rule: plain controls take `--surface`; filled ones fade to `--hover` (`--atom-hover`, now an
  opacity, 0.85). `--ink-hover`, `--danger-hover`, `--selected-hover` are gone.
- States in greys: selection is inverted (ink) or the surface with an ink ring; the checked field is the surface.
- Alerts are rows on the page: no fill, no border, ink text, the role in the icon's color; the action is centered
  on the text. The danger button has paper text. Rules C1, C2, G3.
## 0.6.3 (poiesis-ui) · 0.3.3 (poiesis-components)
- **Hover on a selected thing.** New cell `--selected-hover` (`bg-selected-hover`): the selected color moved toward
  the paper by `--atom-hover`, as `--ink-hover` is. A pressed toggle, an active tab and an open button take it on
  hover; hover's ink text now applies only to what is not selected, so a pressed toggle no longer turns its icon
  black on black. Toggles move 1px when pressed, as buttons do. Rule G3 lists the cell.
- **`--faint`** (`text-faint`): a third text grey, lighter than `--muted`, for text out of focus such as sections
  already passed. It is below 4.5:1, so it never carries the only copy of information. Rules C1, C2.
- **`--section-space`** (`pb-(--section-space)`): the space between page sections, 64 spacing units, so sections
  breathe; a section's content starts near its top edge and the space follows it. Rule S1.
## 0.6.2 (poiesis-ui) · 0.3.2 (poiesis-components)
- Meter bars had lost their color: `poiesis.css` defined a `data-on` variant for pressed toggles, which replaced
  Tailwind's own `data-on` (an attribute is present) that the meter uses for its filled bars. The pressed variant
  is now `data-pressed`.
## 0.6.1 (poiesis-ui) · 0.3.1 (poiesis-components)
- **One text face.** `--atom-font-body` and `--atom-font-display` are gone, and with them the per-role font cells,
  `font-body`, `font-display` and the presets' font choice: all text is `--font-sans`, code `--font-mono`; the serif
  stays for use on purpose (`font-serif`). Rule T5.
- **Two weights.** `--atom-weight-regular` 400 and `--atom-weight-strong` 700; `--atom-weight-heading` is gone
  (headings use strong). Rule H2.
- **Component text 13px, 700.** `--atom-text-ui` is 0.8125rem and every component's text is `text-ui font-strong`;
  parts are told apart by color. Rule T6.
- Switch: an even 2px inset around the thumb (the track's transparent border and `calc(100%-2px)` travel left it
  0.6px from one edge and 1.4px from the other).
## 0.6.0 (poiesis-ui) · 0.3.0 (poiesis-components)
**One name per meaning.** Breaking: projects using the removed names need the new ones.
- Renamed: the accent color is `info` (atoms, cells, classes), so "accent" no longer means blue in the tokens and
  a hover grey in the components. `destructive` is `danger` (button variant; the alert's duplicate variant is gone).
- Removed aliases: `--accent-text`, `--on-accent`, `--focus` (now `--info-strong`, `--on-color`, `--info`); the
  `label` and `control` text roles (component text is `--text-ui`, T6); `--space-*` and `--pad-*` (Tailwind's
  spacing reads `--atom-space`; sizes come from the density cells).
- `poiesis.css` clears Tailwind's own colors, radii, shadows, fonts, weights, leading, tracking and text sizes:
  a class can only name a cell. One name each: greys `paper`, `surface-1`…`3`, `block`, `divider`, `line`,
  `muted`, `ink`; radii `sm`, `md`, `lg`, `pill`; shadows `sm`, `md`; weights `font-regular`, `-strong`, `-heading`.
- Settings that did nothing now work: `--atom-density` sets control heights and padding (`--control-xs`…`-lg`,
  `--control-pad`, `--block-pad`); `--atom-select-ink` sets how selected, pressed and active look (toggles,
  tabs); `--atom-motion` sets transition length (also off under reduced motion).
- New tokens: `--atom-control`, `--atom-icon`, `--atom-page`, `--atom-hover`, `--atom-disabled`,
  `--atom-paper-dark`, `--atom-ink-dark`; cells for hover, disabled, overlay, layers, easing, widths
  (`max-w-page`, `-measure`, `-narrow`).
- Components: no literal weights, leading, tracking, opacity, heights or `dark:` classes left; card and alert edges
  follow `--block-line`; rules H1, S1, C1, C2, G1, G3 say so.
## 0.5.2 (poiesis-ui) · 0.2.2 (poiesis-components)
- **All component text is one size, 14px.** New atom `--atom-text-ui` (0.875rem), cell `--text-ui` and the
  Tailwind class `text-ui`; rule T6. Every component uses it in place of `text-sm` / `text-base`, and containers
  (card, tab panel, collapsible content, empty state) set it too, so text inside a component is 14px whatever the
  page uses. Page titles, headings and running text keep the scale.
- `cn()` tells tailwind-merge that `text-ui` is a font size; it had read it as a color and dropped it next to one.
## 0.2.1 (poiesis-components)
- Crisper colors: status dots, meter bars and alert icons in the palette's role color as it is (they had taken the
  darker `-strong` shade once the theme turned strong contrast on); `-strong` stays for colored text.
- Destructive button: a solid danger fill with ink text (about 6.6:1), instead of red text on a pale tint.

## 0.5.1 (poiesis-ui) · 0.4.2 (poiesis-ux)
- Suggestions of another Poiesis plugin, from the skill or its agents, give the plugin's link and name the skill or
  agent to use.

## 0.5.0 (poiesis-ui) · 0.2.0 (poiesis-components)
Found by using the toolkit in a real product.
- **One component set.** poiesis-components now holds the shadcn/ui set themed by `poiesis.css` (18 components);
  the earlier `pc-` set and `preview.mjs` are gone. poiesis-gallery shows this set, read from the plugin.
- Containers (tab panels, cards) no longer set a text size: their text is the body role, not a caption.
- Controls (buttons, tabs, toggles) use the control role: body size, control weight.
- Round controls follow the style: new cell `--radius-round` and `rounded-pill` (switch, progress); no `rounded-full`,
  literal radii, `text-xs` or `text-[…]` left in the set. Rule G1 says so.
- `poiesis.css`: `bg-surface-1` … `bg-surface-3` for the grey steps; `rounded-xs` mapped.
- `scan.mjs`: in a project that imports `poiesis.css`, Tailwind's named radii are cells, not literals; only
  `rounded-full` and arbitrary literal radii are reported.
- `poiesis.css` defines the Radix state variants (`data-open:`, `data-checked:`, `data-active:`…), so selected tabs,
  switches and open states render without shadcn's own CSS; and the text roles as classes (`type-title` …
  `type-code`).
- Theme poiesis: `--atom-strong-contrast: 1`: status dots and meters were 2–3.2:1 on paper (C3).
- Components: focus rings at full strength and `--ring` width (were 50%, about 1.8:1); alert borders follow
  `--line`; looping motion only with `motion-safe:`; switch and tab indicator without literal sizes.

## 0.4.3 (poiesis-ui)
- `poiesis.css`: the theme for shadcn/ui and Tailwind v4 components.
- Colors from a palette; themes.
- Block cells and `--atom-fill`; pure greys; `--atom-strong-contrast`.
- Typefaces layer (sans, serif, mono); role fonts, tracking, a code role.
- "Other Poiesis plugins" in the ui skill.

## 0.4.1 (poiesis-ux)
- "Other Poiesis plugins" in the ux skill: when another plugin would change the result, Claude suggests it once
  and installs it only if the user agrees.
- README: the four Poiesis toolkits, their roles, agents, what each reads and leaves, and how they connect.

## 0.4.2 (poiesis-ui) · 0.1.2 (poiesis-components)
Second audit and live UX test: every earlier fix confirmed; these are the new findings.
- poiesis-ui: a `control` text role (buttons, tabs, triggers: body size, strong weight, UI leading), added to H1.
- Busy dots follow the button's text color (they failed 3:1 on the primary button).
- No hover look on disabled, busy or aria-disabled buttons; progress tracks have an edge.
- A disabled button's reason is read once (its description, not part of its name).
- Loading, Notice and a `live` StatusDot mount their live region empty and fill it, so they are announced.
- Field keeps a caller's `id`; status dots keep 14px apart in the preview.

## 0.4.1 (poiesis-ui) · 0.1.1 (poiesis-components)
Fixes from the first independent UI audit and UX test (live in a browser) of the components.
- The selected state was invisible in quiet and bold (the shared rule lost to each component's own background):
  it now wins whatever the import order.
- Inputs keep a 3:1 edge in styles without lines; an invalid input no longer doubles its line.
- Accent only on interactive things: progress fills in ink, loading dots muted.
- Warning and success hold 3:1 on grey surfaces too (`--warning`, `--success` slightly darker in light).
- A busy button keeps focus and blocks a second press; a disabled button can say why (`reason`).
- Status dots get a 24px target; loading is announced; notices wrap instead of cutting text; edge padding at
  least the inner gaps; disabled inputs and icon buttons look disabled; Field keeps a caller's description.
- `scan.mjs` no longer flags state rings computed from cells.

## 0.4.0 (poiesis-ui) · 0.1.0 (poiesis-components)
- poiesis-ui: shape atoms (radius, line, elevation, selected style, motion) and their cells, including
  `--selected-bg`, `--selected-fg` and `--selected-ring`; four styles in `tokens/styles` (quiet, soft, crisp,
  bold), chosen with `init.mjs --style`, independent of the preset; rules G1–G4; `scan.mjs` flags literal shape.
  Contrast passes for every style with every preset, light and dark.
- New plugin poiesis-components: 17 components on the cells, built to the ux rules, taken from a production side
  panel and made project-neutral; `add.mjs` copies them with what they import; `preview.mjs` shows all of them in
  the four styles.

## 0.4.0 (poiesis-ux)
- Evidence-based patterns for common situations (forms, waiting, confirmations, lists, notifications, transitions,
  defaults), as an index in the skill and as rules with their studies: F5, F6, K6, K7, K8, E4, E5; E1 and W3
  refined.
- New group **D** Honesty: no deceptive patterns (D1), never a pre-selected cost or data sharing (D2), defaults that
  serve the person (D3).
- `ux-tester` checks the patterns and the honesty rules.
- `research/`: one note per study behind the rules.

## 0.3.0 (2026-10-16)
- Split into two plugins in the same marketplace: `poiesis-ui` (how it looks: `ui` skill, `ui-auditor`, publish
  gate) and `poiesis-ux` (how it behaves: `ux` skill, `ux-tester`). Install one or both. Agents are now
  `poiesis-ui:ui-auditor` and `poiesis-ux:ux-tester`; projects keep the shared `.poiesis-design/` folder.
- README rewritten for people new to design: what UI and UX are, what each plugin does, what to ask Claude.

## 0.2.0 (2026-10-16)
- Skill `ux`: how the app behaves, as rules F, K, N, E, R, W, I, L, V with sources (Nielsen, WCAG 2.2,
  ISO 9241-110); letters never repeat a `ui` rule. Each project lists its main tasks in `.poiesis-design/ux.md`
  (does not turn on the publish gate).
- Agent `ux-tester`: walks the tasks in the running app (Claude in Chrome) or through the code, read-only, and
  reports by rule id with evidence. Runs next to `ui-auditor` before a release (V3, no gate).

## 0.1.0 (draft)
- Atoms → cells for typography, hierarchy (role tokens), spacing and color (OKLCH, light and dark); presets
  `tool`, `reading`, `expressive`.
- Rules T1–T5, H1–H4, S1–S4, C1–C5, A1–A3, P1.
- Scripts `init`, `resolve`, `scan`, `contrast`, `audit-stamp`; `ui-auditor` agent; publish gate hook.
