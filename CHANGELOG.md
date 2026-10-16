# Changelog

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
