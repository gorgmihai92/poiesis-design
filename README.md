# Poiesis Design

A design toolkit for Claude Code. First part, **ui**: the basics of a UI as tokens (typography, hierarchy,
spacing, color), shared by every project and tuned by a few values. Components come later, built on the same
tokens.

```
atoms   ~20 values a project changes: fonts, base size, ratio, leading, space unit, density, hues
  ↓
cells   --text-*, role tokens (title, heading, subheading, body, label, caption), --space-*, --pad-*,
        --ink, --muted, --paper, --surface-*, --accent*, status colors (light + dark)
```

- **Skill `ui`:** `init.mjs` (set up from a preset: `tool`, `reading`, `expressive`), `resolve.mjs` (scales in px,
  colors, contrast in both themes), `scan.mjs` (literal values), rules in `rules.md`.
- **Agent `ui-auditor`:** checks a project against the rules and records pass or fail.
- **Publish gate:** in projects with `.poiesis-design/`, push, deploy and publish are blocked until the audit passed on
  the current UI.

Needs `pow()` and `light-dark()` (Chrome 123, Safari 17.5, Firefox 120) and Node 18+.

```sh
claude plugin marketplace add gorgmihai92/poiesis-design
claude plugin install poiesis-design@poiesis-design
```

Update: edit, `claude plugin validate .`, bump the version (`plugin.json`, `marketplace.json`, `CHANGELOG.md`), push,
`claude plugin marketplace update poiesis-design`, `claude plugin update poiesis-design@poiesis-design`; in each project
`init.mjs --update`. MIT licensed.
