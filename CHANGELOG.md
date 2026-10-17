# Changelog

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
