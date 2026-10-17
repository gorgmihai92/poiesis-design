---
name: components
description: The Poiesis component set (button, tabs, tooltip, switch, field, input, label, alert, card, collapsible, empty, meter, progress, separator, spinner, status dot, toggle, toggle group) - shadcn/ui components themed by poiesis-ui's poiesis.css, copied into a React + Tailwind v4 project and restyled by choosing a theme, preset and style. Use when building or restyling a React interface, adding one of these components, choosing a visual direction, or making a new component that follows the poiesis-ui and poiesis-ux rules.
---

# Poiesis Components

One set of components, the one [poiesis-gallery](https://github.com/gorgmihai92/poiesis-gallery) shows. They are
[shadcn/ui](https://ui.shadcn.com) (MIT) components, plus status dot and meter built the same way. They keep
shadcn's structure and behavior and use only role names (`bg-primary`, `text-muted-foreground`, `bg-danger-tint`,
`rounded-lg`…); poiesis-ui's `poiesis.css` maps those names onto the **cells**, so the project's atoms decide the
look:

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
- Cells only (T1, S1, C1, G1): role colors, Tailwind's named radii and spacing steps, text sizes from the scale
  (`text-sm` caption and label, `text-base` body and controls). No `text-xs`, no `text-[…]`, no literal px.
- **Containers never set a text size** (tab panels, cards, collapsible content): text inside them takes the body
  role from the page (H1). Only a component's own text sets one: controls the `control` role (`text-base
  font-(--control-weight)`), labels and captions `text-sm`.
- Section titles and headings use the role classes from `poiesis.css` (`type-subheading`, `type-heading`,
  `type-label`, `type-caption`…), never a size or weight of their own.
- State styles use the variants `poiesis.css` defines for Radix (`data-open:`, `data-checked:`, `data-active:`,
  `data-horizontal:`…); no other CSS file is needed for them.
- Focus rings at full strength: `ring-(length:--ring) ring-ring` (C3, 3:1), never a faded ring. Borders that are
  lines take `--line` (`border-(length:--line)`); an input keeps its 1px edge (G2).
- Motion only with `motion-safe:` (I5), loops included (status dot, spinner).
- Round controls use `rounded-pill` (the `--radius-round` cell), never `rounded-full`: square in a square style (G1).
- A keyboard path and a visible focus (I1, I2), an accessible name (I3), never color alone (C4), motion through
  tw-animate-css or `motion-safe:` (I5), no layout shift when the state changes (K3).
A new component goes in `library/` as one `.tsx`, is added to `catalog.md` and to the gallery page.

**Check.** `node <poiesis-ui>/skills/ui/scripts/scan.mjs <src>` for literal values, `poiesis-ui:ui-auditor` for
the look, `poiesis-ux:ux-tester` for the behavior. To see every component and its states: poiesis-gallery
(`npm run dev` next to poiesis-design).
