# Changelog

## 0.10.0 (poiesis-ui) · 0.5.4 (poiesis-components)
- One theme. The styles (`soft`, `crisp`, `bold`, `quiet`), presets (`tool`, `reading`, `expressive`), palette and
  typeface files are gone: `quiet`, the palette and the typefaces only repeated the defaults in `atoms.css`, and
  nothing used the rest. `themes/poiesis.css` now holds only its own atoms (`--atom-fill`, `--atom-section`,
  `--atom-pace`); a page that imports it looks the same as before.
- `init.mjs` sets a project up from the defaults and the theme's atoms; `--preset`, `--style`, `--palette` and
  `--typeface` are gone, and `config.json` no longer records them. Shape is tuned with the shape atoms.

## 0.5.3 (poiesis-components)
- Input, button and toggle: an invalid control has one edge, its 1px danger border, instead of the border with a
  danger ring around it; the ring appears only on focus, in danger. Switch, which has no border, keeps its ring.

## 0.3.0 (poiesis-copy) · 0.9.0 (poiesis-ui) · 0.6.0 (poiesis-ux)
Rules learned while reviewing a workshop page for a teacher, where the page had to keep the client's voice and
stay still while the reader used it.
- poiesis-copy: **Q7** the client's own words stay theirs; added sentences are marked and shown first. **X7**
  English numbers and dates ("1,234.56", "17 Oct 2026", "$49"), each language in its own format, never mixed.
  `patterns.md`: a person's offer (class, workshop, service) as a path, doubts answered in the FAQ.
- poiesis-ui: **S5** side-by-side panels share one height. **T8** type by job (handwriting never carries a
  sentence). **T9** short items fit on one line. **G5** one icon set per product. **G6** one mark per meaning.
- poiesis-ux: **F7** reveals unlock in order, the next action keeps its place. **F8** small tasks show progress.
  **K9** what the person changes keeps its place (refines K3). **V4** stability is walked at 1440, 1024, 800, 390
  and 320 px.

## 0.5.2 (poiesis-components)
- `SectionNav`: the address and the current row agree. On wide screens a link scrolls its section to its own row,
  so the row it names is current even when the next section is short; opening a link from elsewhere, Back and
  Forward do the same. As the page scrolls, the address follows the current section (`replaceState`, so Back is
  not filled with every section passed). Narrow screens keep plain links.

## 0.5.1 (poiesis-components)
- `MastheadDescription`: what the page or app is, in one muted line under the name, so the first screen says it
  (copy O2).

## 0.2.0 (poiesis-copy) · 0.8.1 (poiesis-ui)
- Rule O6: no word left alone on the last line (a widow) in headings and short text, at the widths shown, in every
  language. Fixed by rewording, never by a forced line break; long running text is left to `text-wrap: pretty`.
  `copy-reviewer` checks it on the rendered page, or estimates from the container's width and says so.
- poiesis-ui rule T7: the `type-*` roles set how lines wrap: titles, headings and subheadings `text-wrap: balance`,
  body and captions `text-wrap: pretty`, so a block rarely ends on one word.

## 0.1.0 (poiesis-copy) · 0.5.0 (poiesis-ux)
**poiesis-copy: what the product says, in English and Romanian.** A new plugin for UX copy, landing pages, ads
and email, written clear, concise and honest.
- Skill `copy`: rules L (language), B (buttons and links), M (messages), O (order), Q (claims), Y (voice),
  X (languages, Romanian included) and Z (review), each with its source; `patterns.md` for each piece of copy, the
  landing page, ads and email; `inspiration/`, copy worth learning from (mymind, Semplice, Carbonmade to start),
  practices and never rules; `templates/voice.md` for the project's `.poiesis-design/voice.md`.
- Agent `copy-reviewer`: reads the project's text in every language and reports findings by rule id, with the
  text and `file:line`. Never edits the project.
- Twelve new research notes in `research/notes` (scanning, plain language, links, proof, manipulation, letter case).
- poiesis-ux: the wording rules L1–L3 move to poiesis-copy (now L1, B1, L5, Y4). E2 keeps where an error appears;
  its wording is copy M1. The `plugin.json` version, which had fallen behind the marketplace, matches again.

## 0.8.0 (poiesis-ui) · 0.5.0 (poiesis-components)
**Page rhythm in the theme, and the gallery's page parts as components.**
- Two atoms: `--atom-section` (space between page sections, default 8rem) and `--atom-pace` (how many times
  smaller each level of page space is, default 2). `--section-space` and `--subsection-space` keep their names and
  now derive from them, so a theme sets the rhythm. The poiesis theme sets 16rem and 4 (the values it had).
- `text-nearness`: a grey between `--faint` and `--ink` by `--nearness` (0% far, 100% here), for position in a
  sequence.
- Rules: H2 (a dense page can set all text in `--text-ui`), H3 (the byline stays quiet, its link included), H4 (a
  section's space comes after its content), new H5 (position in greys, choice in fills), S2 (levels of page space by
  `--atom-pace`), C2 (only links that are actions take `--info`).
- Card and empty titles are strong (T6): bold on buttons, toggles, tabs and these titles, regular elsewhere.
- Button variant `quiet`: a link in the color and weight of the text around it.
- New components: `Masthead` (name, quiet byline, one call to action), `PageSection` (divider, content near it,
  the section's space after), `SectionNav` (the stacked section navigation of poiesis-gallery).

## 0.7.3 (poiesis-ui) · 0.4.4 (poiesis-components)
- Component text weight: `--weight-strong` (700) on buttons, toggles and tabs only; every other component's text
  (labels, descriptions, errors, alerts, cards, empty states, tab panels, input values) is `--weight-regular` (400).
  Still one size, `--text-ui` (13px). Rule T6.
## 0.4.3 (poiesis-components)
- Button size `inline`: a text action inside a sentence (with variant `link`) that keeps the line's height.

## 0.4.3 (poiesis-components)
- Danger alert is red throughout: text, line and icon, in the one red (`--danger`). Other roles keep the grey line
  and ink text, the role in the icon's color.
## 0.4.2 (poiesis-components)
- Alert: back to the row of 0.4.0 (0.4.1's built-in icons and stacked layout are reverted), now inside a 1px
  `--divider` line with the control padding; still no fill, the role in the icon's color.
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
