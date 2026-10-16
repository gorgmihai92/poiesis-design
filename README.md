# Poiesis Design

A design toolkit for Claude Code, in two parts that check different things:

| | **ui**: how it looks | **ux**: how it behaves |
|---|---|---|
| Covers | typography, hierarchy, spacing, color | feedback, control, consistency, errors, recognition, effort, access, wording |
| Rules | T, H, S, C, A, P | F, K, N, E, R, W, I, L, V (sources: Nielsen, WCAG 2.2, ISO 9241-110) |
| Project files | `.poiesis-design/config.json`, `atoms.css` | `.poiesis-design/ux.md`: how to run the app, main tasks, decisions |
| Checked by | `ui-auditor`, reads the code | `ux-tester`, does the tasks in the running app (or through the code) |
| When | before every publish, enforced by a hook (P1) | after a change to a flow and before a release (V3) |

Rule letters never repeat, so an id (C3, K3) names one rule across the toolkit. A project's own decisions
(`design.md`, `CLAUDE.md`, "Decisions" in `ux.md`) override a rule.

## ui

The basics of a UI as tokens, shared by every project and tuned by a few values. Components come later, built
on the same tokens.

```
atoms   ~20 values a project changes: fonts, base size, ratio, leading, space unit, density, hues
  ↓
cells   --text-*, role tokens (title, heading, subheading, body, label, caption), --space-*, --pad-*,
        --ink, --muted, --paper, --surface-*, --accent*, status colors (light + dark)
```

- **Skill `ui`:** `init.mjs` (set up from a preset: `tool`, `reading`, `expressive`), `resolve.mjs` (scales in px,
  colors, contrast in both themes), `scan.mjs` (literal values), rules in `rules.md`.
- **Agent `ui-auditor`:** checks a project against the rules and records pass or fail.
- **Publish gate:** in projects with `.poiesis-design/config.json`, push, deploy and publish are blocked until the
  audit passed on the current UI.

Needs `pow()` and `light-dark()` (Chrome 123, Safari 17.5, Firefox 120) and Node 18+.

## ux

- **Skill `ux`:** the rules (`rules.md`) and the template for `.poiesis-design/ux.md`.
- **Agent `ux-tester`:** walks each task with Claude in Chrome when it can drive the app (also by keyboard only
  and at 200% zoom), else through the code, and reports pass or fail per task and findings by rule id with
  evidence. Read-only; it stops before anything that sends, publishes or deletes.

## Install

```sh
claude plugin marketplace add gorgmihai92/poiesis-design
claude plugin install poiesis-design@poiesis-design
```

Update: edit, `claude plugin validate .`, bump the version (`plugin.json`, `marketplace.json`, `CHANGELOG.md`), push,
`claude plugin marketplace update poiesis-design`, `claude plugin update poiesis-design@poiesis-design`; in each project
`init.mjs --update`. MIT licensed.
