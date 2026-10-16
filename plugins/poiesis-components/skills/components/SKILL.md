---
name: components
description: A set of UI components (button, icon button, switch, tabs, segmented control, tooltip, disclosure, field, notice, loading, status dot, meter, progress, tile, section, hint, empty state) built only on the poiesis-ui cells and meeting the poiesis-ux rules, copied into a project and restyled by choosing a style (quiet, soft, crisp, bold) and a preset. Use when building or restyling a React interface, adding one of these components, choosing a visual direction, or making a new component that follows both rule sets.
---

# Poiesis Components

Components that take their look from the poiesis-ui **cells** and their behavior from the poiesis-ux **rules**.
They never hold a value of their own, so the project's atoms decide how they look:

- **preset** (poiesis-ui): type and density: `tool`, `reading`, `expressive`;
- **style** (poiesis-ui shape atoms): corners, lines, shadows, how a selected thing looks, motion: `quiet`
  (square, no lines, inverted selection), `soft` (rounded, shadows, tint), `crisp` (small corners, thin lines,
  tint), `bold` (round, strong lines, raised, inverted).

`$C` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/components`). What each component is for and which rules it
meets: `catalog.md`.

**Set up.** The project needs the cells with shape (poiesis-ui 0.4+):
`node <poiesis-ui>/skills/ui/scripts/init.mjs --preset tool --style quiet --styles src/styles --ui src`. Pick
the preset and style from the project and say which; to change direction later, change the shape atoms in
`atoms.css` (or copy another file from `tokens/styles`). Then copy the components the screen needs:
`node $C/scripts/add.mjs button tabs field --to src/components/poiesis` (`all` for every one, `--list` to see
them). The copies belong to the project; wrap the app once in `<TipProvider>`.

**Use.** Build screens from these before writing new controls. Keep their names, labels in the product's
language, one primary button per view (H3), and the selected cells for anything chosen or open (G3).

**A new component** follows the same recipe, in its own `.tsx` + `.css`: cells only (T1, S1, C1, G1); every
state it can be in, including loading, empty, error and disabled (F2); a keyboard path and a visible focus (I1,
I2); an accessible name (I3); targets of 24px or more (I4); never color alone (C4); motion only without reduced
motion (I5); nothing that moves the layout when its state changes (K3). Add it to `catalog.md`.

**Check.** `node <poiesis-ui>/skills/ui/scripts/scan.mjs <components dir>` for literal values,
`poiesis-ui:ui-auditor` for the look, `poiesis-ux:ux-tester` for the behavior. To see every component in the four
styles: `node $C/scripts/preview.mjs --out preview.html`.
