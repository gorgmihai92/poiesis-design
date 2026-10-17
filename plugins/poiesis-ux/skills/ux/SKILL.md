---
name: ux
description: How an app behaves - feedback, control, consistency, errors, recognition, effort, access, honesty - as rules with sources, including evidence-based patterns for forms, waiting, confirmations, lists, notifications, transitions and defaults, plus the project's main tasks in .poiesis-design/ux.md, which the ux-tester agent walks in the running app. Use when designing or changing flows, states, errors, navigation or labels, when setting up ux.md, or when asked for a UX test. How it looks (type, spacing, color) is the ui skill of poiesis-ui; what the words say is the copy skill of poiesis-copy.
---

# Poiesis UX

`ui` (plugin poiesis-ui) is how the app looks, checked in the code by `ui-auditor`. `ux` is how it behaves, checked by doing the
tasks with `ux-tester`. Rules: `rules.md` (cite ids, e.g. F2, K3; no letter repeats a `ui` rule). `$UX` is this
folder (`${CLAUDE_PLUGIN_ROOT}/skills/ux`).

**Set up.** The project gets `.poiesis-design/ux.md` (the folder both plugins use; `ux.md` alone does not turn on
the `ui` publish gate, and poiesis-ux works without poiesis-ui), from `$UX/templates/ux.md`: how to run the app, the main tasks (start state → steps → expected
outcome), and decisions that override rules. Write the tasks from the code and the project's notes; don't ask
questions. Keep 5–10 tasks, the ones people do most.

**Build.** When a change adds or alters a flow, check it against the rules before finishing: every state (F2),
the exit (K1), the keyboard path (I1); its words are
the `copy` skill's (B1, M1). Add or update its task in `ux.md`. For common
situations, apply the patterns:

| Situation | Behave like this | Rules |
|---|---|---|
| A form | formats and required fields shown in advance; no errors while typing; on submit, every error next to its field, input kept; submit busy after the click; confirm what was sent | E1, E2, E4, E5 |
| Waiting | answer within about 1 s; progress for long work, honest, slow stages first | F1, F4, F5 |
| Delete, archive, send | routine and reversible: act and offer undo; rare or irreversible: confirm, naming what happens | K2, K6 |
| Lists and menus | items stay where people left them; suggestions in a separate labelled area; pin or reorder by hand | K3, K7 |
| Notifications | non-urgent ones wait for the end of the step; urgent ones at once | K8 |
| A view changes in place | a simple transition shows where things went, within reduced motion | F6, I5 |
| Choices and defaults | default = what serves the person; never pre-select a cost or data sharing; no deceptive patterns | D1, D2, D3, W3 |

**Test (V3).** Run `poiesis-ux:ux-tester` after a change to a flow and before a release, next to
`ui-auditor`. It walks each task in the running app when it can drive it (browser tools), else through the code,
and reports findings by rule id with evidence. It never edits the project. Fix `must` findings; for a `should`
you keep, write the reason under "Decisions" in `ux.md`.

## Other Poiesis plugins
This plugin works alone. Suggest another one only when it would change the result: once, in one line, and go
on without it if the user says no (say what was left out). Check with `claude plugin list`; install only after
the user agrees, with `claude plugin marketplace add gorgmihai92/<repo>` and then
`claude plugin install <plugin>@<repo>` (it works after Claude Code restarts).
Every suggestion, from the skill or an agent, gives the plugin's link (below) and names the skill or agent
to use, e.g. "[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight), `foresight-analyst`".
- **poiesis-ui** ([poiesis-design](https://github.com/gorgmihai92/poiesis-design)): how the app looks (type, spacing, color), which this plugin does not
  check.
- **poiesis-copy** ([poiesis-design](https://github.com/gorgmihai92/poiesis-design)): what the words say (labels,
  errors, empty states, confirmations), in English and Romanian; `copy-reviewer` checks them.
- **[poiesis-frontier](https://github.com/gorgmihai92/poiesis-frontier)**: when the user wants an unconventional interaction concept, with an
  experiment, before building it.
- **[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight)**: to interpret what users did in a test or in usage data.
