---
name: ux
description: How an app behaves - feedback, control, consistency, errors, recognition, effort, access, wording - as rules with sources, plus the project's main tasks in .poiesis-design/ux.md, which the ux-tester agent walks in the running app. Use when designing or changing flows, states, errors, navigation or labels, when setting up ux.md, or when asked for a UX test. How it looks (type, spacing, color) is the ui skill.
---

# Poiesis UX

`ui` is how the app looks, checked in the code by `ui-auditor`. `ux` is how it behaves, checked by doing the
tasks with `ux-tester`. Rules: `rules.md` (cite ids, e.g. F2, K3; no letter repeats a `ui` rule). `$UX` is this
folder (`${CLAUDE_PLUGIN_ROOT}/skills/ux`).

**Set up.** The project gets `.poiesis-design/ux.md` (same folder as the `ui` config; it does not turn on the
publish gate), from `$UX/templates/ux.md`: how to run the app, the main tasks (start state → steps → expected
outcome), and decisions that override rules. Write the tasks from the code and the project's notes; don't ask
questions. Keep 5–10 tasks, the ones people do most.

**Build.** When a change adds or alters a flow, check it against the rules before finishing: every state (F2),
the exit (K1), the keyboard path (I1), the wording (L1, L2). Add or update its task in `ux.md`.

**Test (V3).** Run `poiesis-design:ux-tester` after a change to a flow and before a release, next to
`ui-auditor`. It walks each task in the running app when it can drive it (browser tools), else through the code,
and reports findings by rule id with evidence. It never edits the project. Fix `must` findings; for a `should`
you keep, write the reason under "Decisions" in `ux.md`.
