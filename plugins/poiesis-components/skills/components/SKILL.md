---
name: components
description: The Poiesis component set (button, tabs, tooltip, switch, field, input, label, alert, card, collapsible, empty, meter, progress, separator, spinner, status dot, toggle, toggle group) - shadcn/ui components themed by poiesis-ui's poiesis.css, copied into a React + Tailwind v4 project and restyled by choosing a theme, preset and style. Use when building or restyling a React interface, adding one of these components, choosing a visual direction, or making a new component that follows the poiesis-ui and poiesis-ux rules.
---

# Poiesis Components

One set of components, the one [poiesis-gallery](https://github.com/gorgmihai92/poiesis-gallery) shows. They are
[shadcn/ui](https://ui.shadcn.com) (MIT) components, plus status dot and meter built the same way. They keep
shadcn's structure and behavior, renamed to the Poiesis names (`bg-ink`, `text-muted`, `bg-surface`,
`rounded-md`, `h-(--control-md)`…, the list is at the top of `poiesis.css`). `poiesis.css` maps them onto the
**cells** and clears Tailwind's own colors and scales, so the project's atoms decide the look:

- **theme** (poiesis-ui `tokens/themes`): one palette, typeface and style;
- **preset** (`tokens/presets`): type and density: `tool`, `reading`, `expressive`;
- **style** (`tokens/styles`): corners, lines, shadows, selection, motion: `quiet`, `soft`, `crisp`, `bold`.

`$C` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/components`). What each component is for: `catalog.md`.

**Set up.** Tailwind v4 and React 18+. The main stylesheet imports, in this order: `tailwindcss`,
`tw-animate-css`, `<poiesis-ui>/skills/ui/tokens/poiesis.css`, one theme, optionally one preset. Read the tokens
in place from a poiesis-design checkout (a bundler alias) or copy them; say which. Then copy the components:
`node $C/scripts/add.mjs button tabs field --to src/components/ui` (`all` for every one, `--list` to see them).
Wrap the app once in `<TooltipProvider>`. Packages: `radix-ui`, `class-variance-authority`, `clsx`,
`tailwind-merge`, `lucide-react` (spinner), `tw-animate-css`.

**Use.** Build screens from these before writing new controls; product composites wrap them, never restyle them
with values of their own. Change a component's look by changing atoms (theme, preset, style), not its classes.

**Rules every component keeps** (and a new one follows):
- Cells only, one name per meaning (T1, S1, C1, G1): the Poiesis color names, `rounded-sm`/`-md`/`-lg`/`-pill`,
  spacing steps; heights, padding and icons from the density cells (`h-(--control-md)`, `px-(--control-pad)`,
  `p-(--block-pad)`, `size-(--icon)`). No `dark:` classes (the cells handle dark), no `text-xs`, no `text-[…]`,
  no literal px.
- **All component text is one size: `text-ui`** (T6; `--atom-text-ui`, 13px), containers included (cards, tab
  panels, collapsible content, empty states), so text inside them is 13px whatever the page uses. Weight:
  `font-strong` (700) on buttons, toggles and tabs, `font-regular` (400) everywhere else. Color tells the other parts
  apart: `text-muted` for secondary text, a role's own color for colored text. All text is the sans face.
- Page titles and headings use the role classes from `poiesis.css` (`type-title`, `type-heading`,
  `type-subheading`, `type-caption`…), never a size or weight of their own.
- States use the state cells (G3): selected, pressed and active `bg-selected text-selected-foreground` with the
  `--selected-ring`; hover `bg-surface` on plain controls, `opacity-(--hover)` on filled ones; disabled `opacity-(--disabled)`.
- State styles use the variants `poiesis.css` defines for Radix (`data-open:`, `data-checked:`, `data-active:`,
  `data-horizontal:`…); no other CSS file is needed for them.
- Focus rings at full strength: `ring-(length:--ring) ring-info` (C3, 3:1), never a faded ring. Borders that are
  lines take `--line` (`border-(length:--line)`), a block's edge `--block-line`; an input keeps its 1px edge (G2).
- Motion only with `motion-safe:` (I5), loops included (status dot, spinner).
- Round controls use `rounded-pill` (the `--radius-round` cell), never `rounded-full`: square in a square style (G1).
- A keyboard path and a visible focus (I1, I2), an accessible name (I3), never color alone (C4), motion through
  tw-animate-css or `motion-safe:` (I5), no layout shift when the state changes (K3).
A new component goes in `library/` as one `.tsx`, is added to `catalog.md` and to the gallery page.

**Check.** `node <poiesis-ui>/skills/ui/scripts/scan.mjs <src>` for literal values, `poiesis-ui:ui-auditor` for
the look, `poiesis-ux:ux-tester` for the behavior. To see every component and its states: poiesis-gallery
(`npm run dev` next to poiesis-design).
