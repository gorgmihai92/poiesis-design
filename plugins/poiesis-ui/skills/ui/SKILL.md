---
name: ui
description: The basics of a UI as tokens - typography, hierarchy, spacing and color - in an atomic structure (a few atoms per project derive the cells every project shares), with the rules and a publish gate. Use when setting up or styling a project's UI, tuning type, spacing or color, building components on the tokens, or before publishing a project that has .poiesis-design/.
---

# Poiesis UI

**Atoms** (`tokens/atoms.css`) are the few values a project changes. **Cells** (`tokens/cells.css`) derive from
them and are the same everywhere, one name per meaning: type scale and page text roles (title, heading,
subheading, body, caption, code; all sans, code mono), component text (`--text-ui`, bold), sizes that follow density (controls, blocks,
icons), colors for light and dark, states (selected, hover, disabled), shape, motion and layers. Code and components
use cells only. One **theme** (`tokens/themes/poiesis.css`) sets a few atoms on top of the defaults: square, no
lines or shadows, sections apart by lines and white space. Ready-made components on these cells: plugin
poiesis-components. How the app behaves (flows, states,
errors, keyboard) is the `ux` skill of the poiesis-ux plugin, tested by
`ux-tester`. Rules: `rules.md` (cite ids). `$UI` is
this folder (`${CLAUDE_PLUGIN_ROOT}/skills/ui`).

**Set up** without asking questions first.
`node $UI/scripts/init.mjs --styles src/styles --ui src` writes the project's `atoms.css` (the defaults with the
theme's atoms), the managed `poiesis/cells.css`, an `index.css` and `.poiesis-design/config.json` (turns on the publish gate). A project
with its own system: `--audit-only`. To read the tokens in place instead, import `tokens/poiesis.css` (atoms and cells), then `tokens/themes/poiesis.css`; poiesis-components builds on them.

**Tune.** Change atoms, then `node $UI/scripts/resolve.mjs <styles>/atoms.css <styles>/poiesis/cells.css`: scales
in px, colors in both themes, contrast of every pair; exit 1 on a failure. Denser → `--atom-density`,
`--atom-ratio` down. Bigger headings → `--atom-ratio` up. More or less air between page sections → `--atom-section`; levels of space more or less apart → `--atom-pace`. Colors → the palette atoms (`--atom-paper`, `--atom-ink`, their dark versions, and a color and a tint for info, success, warning, caution, danger, new); corners, lines, shadows → the shape atoms (`--atom-radius`, `--atom-line`, `--atom-elevation`). One area different →
atoms on that element plus `data-atoms`.

**Build.** Page text takes a role's size, weight, leading and tracking together (H1); component text is `--text-ui`, strong on buttons, toggles, tabs and card and empty titles, regular elsewhere (T6). Spacing in multiples of `--atom-space`; control and block sizes from the density cells (S1).
After a change: `node $UI/scripts/scan.mjs <dirs>`. `init.mjs --update` refreshes cells; atoms stay.

**Publish (P1).** Before any push, deploy or release, run `poiesis-ui:ui-auditor`; it records pass or fail and a
hook blocks publishing until the current UI passed. Only the user can accept open findings:
`node $UI/scripts/audit-stamp.mjs accept --note "..."`.

## Other Poiesis plugins
This plugin works alone. Suggest another one only when it would change the result: once, in one line, and go
on without it if the user says no (say what was left out). Check with `claude plugin list`; install only after
the user agrees, with `claude plugin marketplace add gorgmihai92/<repo>` and then
`claude plugin install <plugin>@<repo>` (it works after Claude Code restarts).
Every suggestion, from the skill or an agent, gives the plugin's link (below) and names the skill or agent
to use, e.g. "[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight), `foresight-analyst`".
- **poiesis-ux** ([poiesis-design](https://github.com/gorgmihai92/poiesis-design)): how the app behaves (feedback, errors, keyboard), which this plugin does
  not check.
- **[poiesis-frontier](https://github.com/gorgmihai92/poiesis-frontier)**: when the user wants an unconventional interface concept, with an
  experiment, before building it.
- **[poiesis-research](https://github.com/gorgmihai92/poiesis-research)**: when a design decision needs evidence (e.g. readability of a type
  size).
