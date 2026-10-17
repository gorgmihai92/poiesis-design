# Poiesis Design

Three Claude Code plugins for designing an app and checking it. Claude follows their rules while it builds your
interface, builds it from components that already meet them, and runs a check before you publish.

## The Poiesis toolkits

**Collect → connect → explore → create.** Four toolkits. Each works on its own; together, each reads what the others
left in your project, as plain files.

| Toolkit | Role | Agents | Reads | Leaves in your project |
|---|---|---|---|---|
| [poiesis-research](https://github.com/gorgmihai92/poiesis-research) | **collect:** the literature on a topic, the evidence for and against a claim, the grants that fit | `paper-scout`, `evidence-scout`, `funding-scout` | the web's scholarly databases, official funding pages | `research/` |
| [poiesis-insight](https://github.com/gorgmihai92/poiesis-insight) | **connect:** what the evidence or your data mean, and what is emerging; every conclusion challenged | `insight-analyst`, `foresight-analyst`, `challenger` | `research/`, your own data, `frontier/results/` | `insights/`, `foresight/` |
| [poiesis-frontier](https://github.com/gorgmihai92/poiesis-frontier) | **explore:** new concepts, each with the smallest experiment that could kill it | `experimentalist` | `insights/`, `foresight/`, `research/` | `frontier/` |
| [poiesis-design](https://github.com/gorgmihai92/poiesis-design) | **create:** how the interface looks and behaves, checked before release | `ui-auditor`, `ux-tester` | your code, `.poiesis-design/` | `.poiesis-design/`, design tokens, components |

```
research ──► insight ──► frontier ──► design
               ▲            │
               └─ results ◄─┘   (experiment results go back to insight as data)
```

- **One job each.** Research says what sources say; insight says what it means; frontier proposes what could be
  and how to test it; design builds and checks. None does another's job.
- **None needs another.** When one would really improve the answer, Claude says so once, in one line, and offers
  to install it. You can say no; the work goes on and the report says what was left out.
- **Depth you choose:** quick, standard (the default) or thorough, per request or as a line in your project's
  `CLAUDE.md`, e.g. `Depth: quick`. A few rules hold at every depth (nothing invented, sources cited, interpretation
  labelled); the rest scale with what is at stake, and every report ends with what was **not checked**.
- **Short answers.** The answer first; the full work goes in the saved file. Agents are used only for independent
  parts in parallel, or for an independent check at thorough depth.
- **Rules limit what is reported as true, never what may be explored.**

## What it covers

| Plugin | Covers | Checked by | Kept in your project |
|---|---|---|---|
| **poiesis-ui** | **how the interface looks:** text sizes, what stands out, spacing and color | `ui-auditor`, which reads your code | `atoms.css`, `poiesis/cells.css`, `.poiesis-design/config.json` |
| **poiesis-ux** | **how the app behaves:** what happens when people click, wait, make a mistake or use only a keyboard | `ux-tester`, which does your app's main tasks | `.poiesis-design/ux.md` |
| **poiesis-components** | **the pieces a screen is made of:** buttons, tabs, fields, notices and more, built on both | both checks above | the components you copy, e.g. `src/components/poiesis/` |

Take a single button. Its size, weight and color are UI. Whether something visibly happens when you press it,
whether you can reach it with the Tab key, and whether its label says what it will do are UX. A screen can look
right and still be hard to use, or be easy to use and look messy. You need both, so the plugins are separate:
install the one you need, or both. **poiesis-components** is where they meet: a button from it already has its
look from poiesis-ui and its behavior from poiesis-ux, so you start from pieces that pass both checks.

## Install

In Claude Code:

```
/plugin marketplace add gorgmihai92/poiesis-design
/plugin install poiesis-ui@poiesis-design
/plugin install poiesis-ux@poiesis-design
/plugin install poiesis-components@poiesis-design
```

poiesis-components needs poiesis-ui (`poiesis.css`) and a React 18+ project with Tailwind v4. poiesis-ui needs **Node 18+**; the tokens it writes need a recent browser (Chrome 123, Safari 17.5, Firefox 120).
poiesis-ux needs nothing else; it drives the running app when Claude in Chrome is available.

## What to ask Claude

Ask in plain language. The plugins come in when the work is about design, and you can name their agents directly.

- *"Set up poiesis-ui in this project."* Claude picks a preset, writes the files and tells you which one it chose.
- *"Make the headings bigger"* or *"use a warmer accent color."* Claude changes the atoms and checks that text is
  still readable in light and dark mode.
- *"Audit the UI."* `ui-auditor` reads your code and lists what breaks a rule.
- *"Write ux.md for this app."* Claude reads the code and writes the 5–10 tasks people do most.
- *"Test the UX."* `ux-tester` does each task and reports what got in the way.
- *"Build the settings screen from the components."* Claude copies the components it needs and builds with them.
- *"Make it feel softer"* or *"more precise, with thin lines."* Claude switches the style; every component follows.

## How it works

### poiesis-ui: a few choices, everything else derived

Good interfaces are consistent: a few text sizes instead of twenty, spacing that follows a rhythm, colors that
always mean the same thing. poiesis-ui works from a short list of choices, usually called **design tokens**:

```
atoms   about 20 values you choose: fonts, base text size, how fast sizes grow, spacing unit, density, colors
  ↓
cells   everything derived from them: text sizes, the styles for title, heading, body, label and caption,
        the spacing steps, and the colors for light and dark mode
```

Your code uses only the cells. To make the whole app denser, the headings bigger or the brand color different,
you change one atom and everything follows. Two choices set the starting atoms:

- a **preset**, for type and density: `tool` (dense apps and dashboards), `reading` (long text) or `expressive`
  (brand and landing pages);
- a **style**, for shape: corners, lines, shadows, how a selected thing looks and how much moves. `quiet` is
  square with no lines or shadows and inverts what is selected; `soft` is rounded with gentle shadows; `crisp`
  has small corners and thin lines; `bold` is round, with strong lines, and raised.

Any preset goes with any style. A project that already has its own
design system can use the rules and the auditor alone.

**The publish gate.** Once a project is set up, Claude can't push, deploy or publish it until `ui-auditor` has
passed on the current version of the interface. Findings you're fine with you can accept yourself; Claude never
accepts them for you. Without `.poiesis-design/config.json` the gate stays off.

### poiesis-ux: the tasks people come to do

You test UX by using the app, not by looking at it. So poiesis-ux starts from the **tasks**, written in
`.poiesis-design/ux.md`, together with how to start the app and the rules your project breaks on purpose:

```md
1. **Sign up.** Start: home page, logged out. Steps: press "Create account", fill in the form, send it.
   Outcome: you land on your dashboard; a wrong email shows what to fix, next to the field.
```

`ux-tester` does each task. With Claude in Chrome it uses the real app: it clicks through, tries it with only the
keyboard and at 200% zoom, and watches what happens while things load or fail. Otherwise it follows each task
through the code. It never changes your files and stops before anything that sends, publishes or deletes. You
get a pass or fail per task, then each finding with the step, the rule it breaks and the fix.

It runs after you change a flow and before a release. It doesn't block publishing, because testing a live app
may need you, for example to sign in.

### poiesis-components: pieces that already pass both

One set of eighteen components a screen is usually made of: button, tabs, tooltip, switch, field, input, label,
alert, card, collapsible, empty state, status dot, meter, progress, spinner, separator, toggle and toggle group.
They are [shadcn/ui](https://ui.shadcn.com) components (plus status dot and meter, built the same way) that use
only role names; poiesis-ui's `poiesis.css` maps those onto the cells. Round controls follow the style (square in
`quiet`), containers leave text at the body size, controls use the control text role. `catalog.md` lists them.

`add.mjs` copies the ones you ask for into your project, with what they need. The copies are yours to change,
the way shadcn/ui works. Because they hold no values of their own, switching the theme, preset or style restyles
all of them at once. [poiesis-gallery](https://github.com/gorgmihai92/poiesis-gallery) shows every component and
its states, read straight from this folder, so you can choose a direction by looking.

## The rules

Every rule has an id, like C3 or K1, and the letters never repeat between the plugins. **must** is a defect;
**should** is a good default you can break on purpose if you write down why. **Your project's decisions win:**
write them in `design.md`, `CLAUDE.md` or the "Decisions" part of `ux.md`, and both checks follow them. A decision
can point to the research note or insight behind it (from poiesis-research or poiesis-insight).

**poiesis-ui** (`plugins/poiesis-ui/skills/ui/rules.md`)

| Group | What it checks |
|---|---|
| **T** Typography | Sizes come from the scale, comfortable line height, lines of 45–75 characters, few fonts |
| **H** Hierarchy | Every text has one role (title, heading, body…); importance shown by weight, color and space first |
| **S** Spacing | Spacing comes from the scale; things that belong together sit closer than things that don't |
| **C** Color | Colors are used by meaning, text is readable (contrast), meaning never shown by color alone |
| **G** Shape | Corners, lines, shadows and motion come from the style; selected things use the selected cells |
| **A** Atoms | You change atoms, never the derived cells |
| **P** Publishing | The audit passes before anything is published |

**poiesis-ux** (`plugins/poiesis-ux/skills/ux/rules.md`), from Nielsen's 10 usability heuristics, WCAG 2.2,
ISO 9241-110 and studies of how people use interfaces; every rule names its source. It also gives patterns for
common situations: forms, waiting, confirmations, lists, notifications, transitions, defaults.

| Group | What it checks |
|---|---|
| **F** Feedback | Every action visibly answers; loading, empty and error states all exist |
| **K** Control | People can always get out, undo, or confirm before something destructive; nothing jumps around |
| **N** Consistency | One name for one thing, everywhere; usual conventions kept |
| **E** Errors | Mistakes are prevented where possible; errors say what happened and what to do |
| **R** Recognition | Current state and options are visible, choices are remembered |
| **W** Effort | The main task works straight away, in few steps |
| **D** Honesty | No deceptive patterns; never a pre-selected cost or data sharing; defaults serve the person |
| **I** Access | Everything works by keyboard, focus is visible, targets are big enough, motion can be turned off |
| **L** Wording | The user's words, not the system's; buttons say what they do |
| **V** Testing | Tasks are tested end to end, and every finding comes with evidence |

The two checks don't overlap: `ui-auditor` reads your code for how it looks, `ux-tester` uses your app to see how
it behaves. If one notices the other's kind of problem, it hands it over.

## Where the rules come from

Each poiesis-ux rule cites its source by key in `plugins/poiesis-ux/skills/ux/rules.md`.

- **Usability:** Nielsen's 10 usability heuristics (1994, revised 2020), cited as N plus the heuristic's number.
- **Accessibility:** WCAG 2.2, cited as W plus the success criterion.
- **Interaction principles:** ISO 9241-110:2020, cited as I.
- **Studies of how people use interfaces,** cited by author and year, one note each in `research/notes`:
  - forms: Seckler et al. 2014, Bargas-Avila et al. 2007, Seckler et al. 2012 (E1, E4, E5);
  - waiting and progress: Shneiderman 1984, Myers 1985, Harrison et al. 2007 (F1, F4, F5);
  - confirmations and habituation: Bravo-Lillo et al. 2013, Vance et al. 2018 (K6);
  - stable lists: Findlater & McGrenere 2004, Gajos et al. 2008 (K7);
  - notifications: Iqbal & Bailey 2008, Okoshi et al. 2018, Mark et al. 2008 (K8);
  - transitions: Heer & Robertson 2007 (F6);
  - defaults and choices: Johnson & Goldstein 2003, Jachimowicz et al. 2019, Chernev et al. 2015 (D2, D3, W3);
  - deceptive patterns: Mathur et al. 2019, Gray et al. 2018, Luguri & Strahilevitz 2021 (D1).

  Most are desktop lab studies with small samples, so these rules are **should**, except the honesty rules.
- **Contrast in poiesis-ui (C3):** the WCAG 2.2 thresholds: 4.5:1 for text, 3:1 for large text and for shapes and
  indicators.
- **The other poiesis-ui rules** (type scale, roles, spacing, atoms and cells, the publish gate): the plugin's own
  design conventions. Your project's decisions override them.

## What it adds to your project

```
<styles>/atoms.css             poiesis-ui: the values you choose
<styles>/poiesis/cells.css     poiesis-ui: derived, managed by the plugin (refresh with init.mjs --update)
<styles>/index.css             poiesis-ui: imports both
.poiesis-design/
  config.json                  poiesis-ui: turns on the publish gate; which folders hold UI code
  audit.json                   poiesis-ui: the last audit result for the current UI
  ux.md                        poiesis-ux: how to run the app, the main tasks, decisions
```

## What's in this repository

The repository is a Claude Code **marketplace** holding three **plugins**, each installable on its own.

```
.claude-plugin/
  marketplace.json             the marketplace: its name and the three plugins it lists
plugins/
  poiesis-ui/                  how the interface looks
    .claude-plugin/
      plugin.json              name, version, description
    skills/ui/                 the skill: what Claude follows when it styles or checks a UI
      SKILL.md                 entry point: set up, tune, build, publish
      rules.md                 rules T, H, S, C, G, A, P with ids
      tokens/
        atoms.css              the atoms and their defaults
        cells.css              the cells derived from them
        presets/               tool.css, reading.css, expressive.css: type and density per kind of app
        styles/                quiet.css, soft.css, crisp.css, bold.css: shape atoms per visual direction
      scripts/                 Node 18+, no dependencies
        init.mjs               set up a project from a preset, or refresh its cells
        resolve.mjs            show what the atoms produce: scales in px, colors in both themes, contrast
        scan.mjs               list values in your code that bypass the cells, by rule id
        contrast.mjs           WCAG contrast for any color pairs
        audit-stamp.mjs        record an audit result, or your acceptance of open findings
        lib/                   color parsing, token evaluation, project state, shared by the scripts
    agents/
      ui-auditor.md            reads your code against the rules and records pass or fail
    hooks/
      hooks.json               runs the publish gate before shell commands
      publish-gate.mjs         blocks push, deploy and publish until the current UI passed the audit
  poiesis-ux/                  how the app behaves
    .claude-plugin/
      plugin.json              name, version, description
    skills/ux/                 the skill: what Claude follows when it designs or changes a flow
      SKILL.md                 entry point: set up ux.md, build with the patterns, test
      rules.md                 rules F, K, N, E, R, W, I, D, L, V with ids and sources
      templates/
        ux.md                  the project's task file, created on first use
    agents/
      ux-tester.md             does each task in ux.md and reports findings by rule id, with evidence
  poiesis-components/          the pieces a screen is made of, built on both
    .claude-plugin/
      plugin.json              name, version, description
    skills/components/
      SKILL.md                 entry point: set up, copy, build, make a new component, check
      catalog.md               each component and what it is for
      library/                 one .tsx per component (shadcn/ui on poiesis.css), plus utils.ts
      scripts/
        add.mjs                copy components and what they import into a project
research/                      the sources behind the evidence-based rules: one note per study
CHANGELOG.md                   what changed in each version
LICENSE                        MIT
```

## Files shared with the other toolkits

Writes `.poiesis-design/` (config, `ux.md`) and your tokens and components. The other toolkits don't read them; a frontier concept is built here when you ask.

The paths and fields the other toolkits read are a contract: they change only in a major version, noted in the
changelog. Every plugin reads the others' files tolerantly: a missing file or field is reported as unknown, never
an error. The full list is in each skill's `SKILL.md`, so Claude knows it too.

## Update or remove

```
/plugin marketplace update poiesis-design
/plugin update poiesis-ui@poiesis-design
/plugin update poiesis-ux@poiesis-design
/plugin update poiesis-components@poiesis-design
/plugin uninstall poiesis-ui@poiesis-design
/plugin uninstall poiesis-ux@poiesis-design
/plugin uninstall poiesis-components@poiesis-design
```

In a project that uses poiesis-ui, also run `init.mjs --update` after an update to refresh the derived cells.

## Changing the plugins

Edit the files under `plugins/`, run `claude plugin validate .`, bump the version (major if a field under "Files" changes) in the changed plugin's
`plugin.json`, in `marketplace.json` and in `CHANGELOG.md`, and push. Projects get it with the update commands
above.

## License

MIT. poiesis-ui requires Node 18+.
