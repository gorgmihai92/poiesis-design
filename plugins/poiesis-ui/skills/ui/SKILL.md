---
name: ui
description: The basics of a UI as tokens - typography, hierarchy, spacing and color - in an atomic structure (a few atoms per project derive the cells every project shares), with the rules and a publish gate. Use when setting up or styling a project's UI, tuning type, spacing or color, building components on the tokens, or before publishing a project that has .poiesis-design/.
---

# Poiesis UI

**Atoms** (`tokens/atoms.css`) are the few values a project changes. **Cells** (`tokens/cells.css`) derive from
them and are the same everywhere: type scale, role tokens (title, heading, subheading, body, label, caption),
spacing, colors for light and dark. Code and components use cells only. How the app behaves (flows, states,
errors, keyboard) is the `ux` skill of the poiesis-ux plugin, tested by
`ux-tester`. Rules: `rules.md` (cite ids). `$UI` is
this folder (`${CLAUDE_PLUGIN_ROOT}/skills/ui`).

**Set up.** Pick the preset from the project (`tool` dense UI, `reading` long text, `expressive` brand pages) and
say which; don't ask questions.
`node $UI/scripts/init.mjs --preset tool --styles src/styles --ui src` writes the project's `atoms.css`, the
managed `poiesis/cells.css`, an `index.css` and `.poiesis-design/config.json` (turns on the publish gate). A project
with its own system: `--audit-only`. With Tailwind, map the cells into `@theme` and drop the default scales.

**Tune.** Change atoms, then `node $UI/scripts/resolve.mjs <styles>/atoms.css <styles>/poiesis/cells.css`: scales
in px, colors in both themes, contrast of every pair; exit 1 on a failure. Denser → `--atom-density`,
`--atom-ratio` down. Bigger headings → `--atom-ratio` up. Brand color → `--atom-accent-h/c`. One area different →
atoms on that element plus `data-atoms`.

**Build.** Text takes a role's size, weight and leading together (H1). Spacing from `--space-*` and `--pad-*`.
After a change: `node $UI/scripts/scan.mjs <dirs>`. `init.mjs --update` refreshes cells; atoms stay.

**Publish (P1).** Before any push, deploy or release, run `poiesis-ui:ui-auditor`; it records pass or fail and a
hook blocks publishing until the current UI passed. Only the user can accept open findings:
`node $UI/scripts/audit-stamp.mjs accept --note "..."`.
