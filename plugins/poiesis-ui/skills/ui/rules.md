# Poiesis UI rules

Used for building (skill `ui`) and auditing (agent `ui-auditor`). How the app behaves is the `ux` skill (plugin poiesis-ux); its
rule letters (F, K, N, E, R, W, I, D, L, V) never repeat these, so an id names one rule across the toolkit. **must** = a defect when broken; **should** = a
default you may break on purpose, with the reason in the project's design notes. A project decision (in
`design.md` or `CLAUDE.md`) overrides a rule. "Cells" are the tokens in `tokens/cells.css`.

## Typography (T)

**T1 · must · Sizes from the scale.** Every font size is a cell (`--text-*` or a role size), in `rem`. No literal
sizes, nothing under 12px.
**T2 · should · Few sizes.** 3–5 sizes per screen.
**T3 · must · Line height by role, unitless.** Body 1.5–1.65, UI text 1.3–1.45, headings 1.1–1.25.
**T4 · must · Measure.** Running text 45–75 characters per line (`max-inline-size: var(--measure)`).
**T5 · should · Two families at most** (plus mono). Changing or aligned numbers use `tabular-nums`.

## Hierarchy (H)

**H1 · must · Every text is one role:** title, heading, subheading, body, label, control (buttons, tabs, triggers) or caption, using that role's
size, weight and leading cells together.
**H2 · should · Weight, color and space before size.** At most three weights; secondary text is `--muted`, not
smaller and lighter and greyer at once.
**H3 · should · One primary per view.** One title, one accent-colored main action.
**H4 · should · Headings belong to what follows.** About twice as much space above a heading as below it.

## Spacing (S)

**S1 · must · Spacing from the scale.** Margin, padding and gap use `--space-*` (between things) and `--pad-*`
(inside blocks). Only 0, 1px and 2px are allowed as literals.
**S2 · must · Proximity shows grouping.** Space inside a group is at least one step smaller than space between
groups.
**S3 · must · Edges breathe.** A container's padding is at least the gaps inside it.
**S4 · should · Parents own the space between children** (`gap`); reusable blocks carry no outer margin.

## Color (C)

**C1 · must · Semantic cells only.** Code uses `--ink`, `--muted`, `--paper`, `--surface-*`, `--accent*`,
`--focus`, status colors and tints. No literal colors and no atoms outside the token files.
**C2 · must · One color, one meaning.** Accent = interactive; status colors = status only. Text is `--ink` or
`--muted` (`--accent-text` for links); strong colors are fills and lines.
**C3 · must · Contrast, light and dark.** Text 4.5:1 (3:1 at 24px+ or 18.66px+ bold); shapes and indicators 3:1.
**C4 · must · Never color alone.** Status and severity also have a word, icon or shape.
**C5 · should · Structure from space and grey steps** before lines.

## Shape (G)

The style: corners, lines, shadows, how a selected thing looks, motion. Set by the shape atoms or a style file
(`tokens/styles`: quiet, soft, crisp, bold), independent of the preset (type and density).

**G1 · must · Shape from cells.** Corner radius, border width and color, shadows and transition lengths use
`--radius-*`, `--line`, `--line-color`, `--ring`, `--shadow-*`, `--duration-*`. Only 0 and hairlines (1–2px) are literal.
**G2 · must · Lines are optional, boundaries are not.** With `--line` at 0, a control or tile still differs from
what is around it by a surface step; an input's boundary, when it is the only cue, keeps 3:1 (W 1.4.11).
**G3 · must · Selected and open use the selected cells:** `--selected-bg`, `--selected-fg` and the
`--selected-ring` (an accent ring in tint mode, where the fill alone is too faint), never a color of their own.
**G4 · should · One style per product.** Mixing radii or line weights between screens reads as two products.

## Atoms (A)

**A1 · must · Projects change atoms only.** `poiesis/cells.css` is managed. A missing value becomes a project cell
in another file, derived from atoms or cells, never a literal.
**A2 · must · Local tuning needs `data-atoms`** on the element where atoms are set, or the cells don't follow.
**A3 · must · `resolve.mjs` passes** (contrast, minimum size).

## Publishing (P)

**P1 · must · Audit before every publish.** In a project with `.poiesis-design/`, `ui-auditor` records a pass on the
current UI before any push, deploy or release, or the user explicitly accepts its findings. A hook enforces it.
