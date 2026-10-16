# Changelog

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
