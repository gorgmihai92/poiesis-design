# Poiesis UI rules

Used for building (skill `ui`) and auditing (agent `ui-auditor`). How the app behaves is the `ux` skill (plugin poiesis-ux); its
rule letters (F, K, N, E, R, W, I, D, L, V) never repeat these, so an id names one rule across the toolkit. **must** = a defect when broken; **should** = a
default you may break on purpose, with the reason in the project's design notes. A project decision (in
`design.md` or `CLAUDE.md`) overrides a rule. "Cells" are the tokens in `tokens/cells.css`.

## Typography (T)

**T1 · must · Sizes from the scale.** Every font size is a cell (`--text-*` or a role size), in `rem`. No literal
sizes, nothing under 12px.
**T6 · must · One size for component text, two weights.** All text inside a UI component (controls, labels,
captions, descriptions, its content) is `--text-ui` (`--atom-text-ui`, 13px by default): `--weight-strong` (700) on
buttons, toggles, tabs and the titles of cards and empty states, `--weight-regular` (400) everywhere else.
Page text outside components (titles, headings, running text) keeps the scale; color, not size or weight, tells
a component's parts apart.
**T2 · should · Few sizes.** 3–5 sizes per screen.
**T3 · must · Line height by role, unitless.** Body 1.5–1.65, UI text 1.3–1.45, headings 1.1–1.25.
**T4 · must · Measure.** Running text 45–75 characters per line (`max-inline-size: var(--measure)`).
**T5 · must · One family for text** (`--font-sans`), mono for code; the serif only where chosen on purpose. Changing or aligned numbers use `tabular-nums`.
**T7 · should · Lines wrap well.** Titles and headings `text-wrap: balance`, running text and captions
`text-wrap: pretty`, so a block rarely ends on one word; the `type-*` roles set it. A fallback: short text is
reworded so no word sits alone (`copy` O6).

## Hierarchy (H)

**H1 · must · Every page text is one role:** title, heading, subheading, body, caption or code, using that role's
size, weight, leading, font and tracking cells together (`type-*` with `poiesis.css`). Text inside a component is
not a role: it is `--text-ui` in `--weight-strong` (T6). All text is the sans face; code is mono.
**H2 · should · Weight, color and space before size.** Two weights: `--weight-regular` (400) and `--weight-strong` (700); secondary text is `--muted`, not
smaller and lighter and greyer at once. A dense tool or index page can set all its text in `--text-ui`: titles
strong, the rest regular, apart by grey and space; the scale stays for real headings and specimens.
**H3 · should · One primary per view.** One title, one main action (the `default` button). Everything around it
stays quiet: a byline or credit is `--muted` text, its link included (the button's `quiet` variant), so nothing
competes with the action.
**H4 · should · Headings belong to what follows.** About twice as much space above a heading as below it. The
same for a section: its content starts near its top edge (`--block-pad` below the divider) and the section's
space comes after it (`--section-space`), so a divider belongs to the section below it.
**H5 · should · Position in greys, choice in fills.** Where the reader is in a sequence (the current section,
steps done, items read) is shown by text greys: `--ink` here, `--faint` far or passed, between them by nearness
(`text-nearness`). Selected fills (G3) are for what the user chose (a tab, a pressed toggle), not for where they
are.

## Spacing (S)

**S1 · must · Spacing from the scale.** Margin, padding and gap are multiples of `--atom-space` (Tailwind's
`p-4`, `gap-2`…). Controls and blocks take their size from the density cells: `--control-xs` … `--control-lg`,
`--control-pad`, `--block-pad`, `--icon`; page sections `--section-space` apart, their parts `--subsection-space` (S2). Only 0, 1px and 2px are allowed as
literals.
**S2 · must · Proximity shows grouping.** Space inside a group is at least one step smaller than space between
groups. Page space has levels (between sections, between a section's parts), each `--atom-pace` times smaller
than the one above; the theme sets the pace (2 gentle, 4 marked) and `--atom-section`, never a page by hand.
**S3 · must · Edges breathe.** A container's padding is at least the gaps inside it.
**S4 · should · Parents own the space between children** (`gap`); reusable blocks carry no outer margin.

## Color (C)

**C1 · must · Semantic cells only, one name per meaning, as few as possible.** Greys only for everything that is
not a status: `--paper`, `--surface`, `--block-bg` (the paper or the surface, by `--atom-fill`), `--divider`,
`--line-color`, `--faint`, `--muted`, `--ink`. Color roles: `--info`, `--success`, `--warning`, `--caution`,
`--danger`, `--new`, each one color for fills, text, icons and lines (one red everywhere), and a `-tint`;
`--on-color` for text on a fill. No literal colors, no atoms
outside the token files, and no second name for a cell (no alias tokens).
**C2 · must · One color, one meaning.** Info = interactive, information and focus; success, warning, caution,
danger and new = that status only. Text is `--ink` or `--muted` (`--faint` only for text out of focus that is
not the only copy of its information, such as sections already passed, since it is below 4.5:1), `--info` for links
that are actions (a byline or credit link takes the text around it, H3), a role's color for colored
text, icons and lines; on a role's fill, `--on-color` text (paper on danger).
**C3 · must · Contrast, light and dark.** Text 4.5:1 (3:1 at 24px+ or 18.66px+ bold); shapes and indicators 3:1.
**C4 · must · Never color alone.** Status and severity also have a word, icon or shape.
**C5 · should · Structure from space first, then the blocks.** Sections stand apart by white space; where more
is needed, by the block cells (`--block-bg`, `--block-line`, `--divider`), which the theme sets with `--atom-fill`:
grey steps (1) or the paper with lines (0). Never a surface picked by hand to set sections apart.

## Shape (G)

The style: corners, lines, shadows, how a selected thing looks, motion. Set by the shape atoms or a style file
(`tokens/styles`: quiet, soft, crisp, bold), independent of the preset (type and density).

**G1 · must · Shape from cells.** Corner radius, border width and color, shadows and transition lengths use
`--radius-*`, `--line`, `--block-line`, `--line-color`, `--ring`, `--shadow-*`, `--duration-*`, `--ease`. Only 0 and hairlines (1–2px) are literal. Round
controls (pills, switch tracks) use `--radius-round`, never a fixed full radius: square in a square style. With
`poiesis.css`, Tailwind's named radii map onto the cells and `rounded-pill` replaces `rounded-full`.
**G2 · must · Lines are optional, boundaries are not.** With `--line` at 0, a control or tile still differs from
what is around it by a surface step; an input's boundary, when it is the only cue, keeps 3:1 (W 1.4.11).
**G3 · must · States use the state cells.** Selected, pressed, active and open: `--selected-bg`, `--selected-fg`
and `--selected-ring` (an ink ring when selection is the surface, where the fill alone is too faint), all greys.
Hover: `--surface` on plain controls; filled ones (ink, colored, surface, selected) fade to opacity `--hover`.
Disabled: opacity `--disabled`. Never a color or
opacity of their own.
**G4 · should · One style per product.** Mixing radii or line weights between screens reads as two products.

## Atoms (A)

**A1 · must · Projects change atoms only.** `poiesis/cells.css` is managed. A missing value becomes a project cell
in another file, derived from atoms or cells, never a literal.
**A2 · must · Local tuning needs `data-atoms`** on the element where atoms are set, or the cells don't follow.
**A3 · must · `resolve.mjs` passes** (contrast, minimum size).

## Publishing (P)

**P1 · must · Audit before every publish.** In a project with `.poiesis-design/`, `ui-auditor` records a pass on the
current UI before any push, deploy or release, or the user explicitly accepts its findings. A hook enforces it.
