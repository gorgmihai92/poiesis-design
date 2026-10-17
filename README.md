# Poiesis Design

Interface design that is checked while Claude builds it, in Claude Code: how it looks, how it behaves and what it
says. Claude follows the rules as it works, builds from components that already meet them, and runs a check before
you publish.

For anyone building an app or a site with Claude Code. Poiesis Design is one of the four products in the
[Poiesis Toolkit](#part-of-the-poiesis-toolkit). It comes as four plugins, each installed on its own; start with
[Install](#install).

## Part of the Poiesis Toolkit

The Poiesis Toolkit is four products for Claude Code, one for each step from a question to a finished product:
**Research** collects, **Insight** connects, **Frontier** explores, **Design** creates. Each installs and works on
its own. Insight and Frontier also read what the other steps left in your project, as plain files, and Design
builds a Frontier concept when you ask.

| Product | What it does | Plugins | Agents | Reads | Leaves in your project |
|---|---|---|---|---|---|
| [Poiesis Research](https://github.com/gorgmihai92/poiesis-research) | **collect:** the literature on a topic, the evidence for and against a claim, the grants that fit | `poiesis-research` | `paper-scout`, `evidence-scout`, `funding-scout` | the web's scholarly databases, official funding pages | `research/` |
| [Poiesis Insight](https://github.com/gorgmihai92/poiesis-insight) | **connect:** what the evidence or your data mean, and what is emerging; every conclusion challenged | `poiesis-insight` | `insight-analyst`, `foresight-analyst`, `challenger` | `research/`, your own data, `frontier/results/` | `insights/`, `foresight/` |
| [Poiesis Frontier](https://github.com/gorgmihai92/poiesis-frontier) | **explore:** new concepts, each with the smallest experiment that could kill it | `poiesis-frontier` | `experimentalist` | `insights/`, `foresight/`, `research/` | `frontier/` |
| [Poiesis Design](https://github.com/gorgmihai92/poiesis-design) | **create:** how the interface looks, behaves and what it says, built from components that already pass, checked before release | `poiesis-ui`, `poiesis-ux`, `poiesis-copy`, `poiesis-components` | `ui-auditor`, `ux-tester`, `copy-reviewer` | your code, `.poiesis-design/` | `.poiesis-design/`, design tokens, components |

```
Research ──► Insight ──► Frontier ──► Design
               ▲            │
               └─ results ◄─┘   (experiment results go back to Insight as data)
```

- **One job each.** Research says what sources say; Insight says what it means; Frontier proposes what could be
  and how to test it; Design builds and checks. None does another's job.
- **None needs another.** When another product would really improve the answer, Claude says so once, in one line,
  and offers to install it. You can say no; the work goes on and the report says what was left out.
- **Depth you choose:** quick, standard (the default) or thorough, per request or as a line in your project's
  `CLAUDE.md`, e.g. `Depth: quick`. A few rules hold at every depth (nothing invented, sources cited, interpretation
  labelled); the rest scale with what is at stake, and every report ends with what was **not checked**.
- **Short answers.** The answer first; the full work goes in the saved file. Agents are used only for independent
  parts in parallel, or for an independent check at thorough depth.
- **Rules limit what is reported as true, never what may be explored.**

## Four plugins: how it looks, how it behaves, what it says, and the pieces

| Plugin | What it does | Checked by | Kept in your project |
|---|---|---|---|
| **poiesis-ui** | **how the interface looks:** text sizes, what stands out, spacing and color | `ui-auditor`, which reads your code | `atoms.css`, `poiesis/cells.css`, `.poiesis-design/config.json` |
| **poiesis-ux** | **how the app behaves:** what happens when people click, wait, make a mistake or use only a keyboard | `ux-tester`, which does your app's main tasks | `.poiesis-design/ux.md` |
| **poiesis-copy** | **what it says:** buttons, errors, empty states, landing pages, ads and email, in English and Romanian | `copy-reviewer`, which reads your text | `.poiesis-design/voice.md` |
| **poiesis-components** | **the pieces a screen is made of:** buttons, tabs, fields, notices and more, built on the first two | `ui-auditor` and `ux-tester` | the components you copy, e.g. `src/components/ui/` |

Take a single button. Its size, weight and color are UI. Whether something visibly happens when you press it
and whether you can reach it with the Tab key are UX. Whether its label says what it will do is copy. A screen can
look right and still be hard to use, or be easy to use and say the wrong thing. You need all three, so the plugins
are separate: install the ones you need. **poiesis-components** is where they meet: a button from it already has its
look from poiesis-ui and its behavior from poiesis-ux, so you start from pieces that pass both checks.

## Install

In Claude Code:

```
/plugin marketplace add gorgmihai92/poiesis-design
/plugin install poiesis-ui@poiesis-design
/plugin install poiesis-ux@poiesis-design
/plugin install poiesis-copy@poiesis-design
/plugin install poiesis-components@poiesis-design
```

poiesis-components needs poiesis-ui (`poiesis.css`) and a React 18+ project with Tailwind v4. poiesis-ui needs
**Node 18+**; the tokens it writes need a recent browser (Chrome 123, Safari 17.5, Firefox 120). poiesis-ux needs
nothing else; it drives the running app when Claude in Chrome is available. poiesis-copy needs nothing else.

## Ask in plain language

The plugins come in when the work is about design, and you can name their agents directly.

- *"Set up poiesis-ui in this project."* Claude picks a preset, writes the files and tells you which one it chose.
- *"Make the headings bigger"* or *"use a warmer accent color."* Claude changes the atoms and checks that text is
  still readable in light and dark mode.
- *"Audit the UI."* `ui-auditor` reads your code and lists what breaks a rule.
- *"Write ux.md for this app."* Claude reads the code and writes the 5–10 tasks people do most.
- *"Test the UX."* `ux-tester` does each task and reports what got in the way.
- *"Write the landing page copy, in English and Romanian."* Claude sets up `voice.md` first if there isn't one,
  then writes from the patterns.
- *"Fix the error messages"* or *"three headlines for this ad."* Claude writes from the rules and the voice.
- *"I love the copy on this site: add it to inspiration."* Claude reads it and adds what it does well.
- *"Review the copy."* `copy-reviewer` reads the text in every language and lists what breaks a rule.
- *"Build the settings screen from the components."* Claude copies the components it needs and builds with them.
- *"Make it feel softer"* or *"more precise, with thin lines."* Claude switches the style; every component follows.

## What each plugin does

### poiesis-ui: a few choices, everything else derived

- **Sets up your project** from a preset that fits it, writes the token files and turns on the publish gate. It
  tells you which preset it chose; you don't answer questions first.
- **Changes the whole look from a few values:** denser, bigger headings, more air between sections, another accent
  color, a softer or sharper style.
- **Shows what your choices produce:** every text size and space in px, every color in light and dark mode, and
  the contrast of every pair, with a failure flagged (`resolve.mjs`).
- **Finds values that bypass the tokens** in your code, each with its rule id (`scan.mjs`).
- **Audits before you publish:** `ui-auditor` reads your code against the rules and records pass or fail.

Good interfaces are consistent: a few text sizes instead of twenty, spacing that follows a rhythm, colors that
always mean the same thing. poiesis-ui works from a short list of choices, usually called **design tokens**:

```
atoms   about 40 values a theme sets: fonts, text sizes, how fast sizes grow, spacing, page rhythm, density,
        colors, shape
  ↓
cells   everything derived from them: text sizes, the styles for title, heading, body, label and caption,
        the spacing steps, and the colors for light and dark mode
```

Your code uses only the cells. To make the whole app denser, the headings bigger or the brand color different,
you change one atom and everything follows. A **theme** sets the atoms, one file from each layer: a palette
(colors), typefaces, and two choices that shape the feel:

- a **preset**, for type and density: `tool` (dense apps and dashboards), `reading` (long text) or `expressive`
  (brand and landing pages);
- a **style**, for shape: corners, lines, shadows, how a selected thing looks and how much moves. `quiet` is
  square with no lines or shadows and inverts what is selected; `soft` is rounded with gentle shadows; `crisp`
  has small corners and thin lines; `bold` is round, with strong lines, and raised.

Any preset goes with any style. A theme can also set atoms of its own, such as the space between page sections.
A project that already has its own design system can use the rules and the auditor alone.

**The publish gate.** Once a project is set up, Claude can't push, deploy or publish it until `ui-auditor` has
passed on the current version of the interface. Findings you're fine with you can accept yourself; Claude never
accepts them for you. Without `.poiesis-design/config.json` the gate stays off.

**What it checks** (`plugins/poiesis-ui/skills/ui/rules.md`):

| Group | What it checks |
|---|---|
| **T** Typography | Sizes come from the scale, comfortable line height, lines of 45–75 characters, few fonts, lines that wrap evenly |
| **H** Hierarchy | Every text has one role (title, heading, body…); importance shown by weight, color and space first |
| **S** Spacing | Spacing comes from the scale; things that belong together sit closer than things that don't |
| **C** Color | Colors are used by meaning, text is readable (contrast), meaning never shown by color alone |
| **G** Shape | Corners, lines, shadows and motion come from the style; selected things use the selected cells |
| **A** Atoms | You change atoms, never the derived cells |
| **P** Publishing | The audit passes before anything is published |

### poiesis-ux: the tasks people come to do

- **Writes your app's tasks** in `ux.md` from the code: how to start the app, the 5–10 tasks people do most, and
  the rules your project breaks on purpose.
- **Builds flows from tested patterns:** forms, waiting, delete, archive and send, lists and menus, notifications,
  transitions, choices and defaults, each tied to its rules.
- **Checks each flow it changes** for every state (loading, empty, error), a way out and a keyboard path, and
  updates the flow's task.
- **Tests the app:** `ux-tester` does each task and reports what got in the way, with evidence.

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

**What it checks** (`plugins/poiesis-ux/skills/ux/rules.md`), from Nielsen's 10 usability heuristics, WCAG 2.2,
ISO 9241-110 and studies of how people use interfaces; every rule names its source.

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
| **V** Testing | Tasks are tested end to end, and every finding comes with evidence |

### poiesis-copy: clear, concise, honest words

- **Writes your product's voice** in `voice.md` from your code and existing copy; what it had to guess is marked
  "To confirm", so you check only that.
- **Writes every word people read:** in the app (buttons, errors, empty states, confirmations, onboarding) and
  around it (landing pages, ads, email).
- **Writes English and Romanian each from the meaning,** not one translated from the other, and checks lengths in
  the longer one.
- **Gives you options where the angle matters:** 2–3 headlines, taglines, ads or subject lines, with the one it
  recommends and why. For a button or an error, one version: the clearest.
- **Rewrites existing copy as before → after,** with the rule behind each change, and only where something
  changes.
- **Learns from copy you admire:** name a site, a campaign or a book, and it adds what that copy does well.
- **Reviews:** `copy-reviewer` reads the text in every language and lists what breaks a rule.

The **voice** in `.poiesis-design/voice.md` says who reads the product, its three or four traits, the glossary (one
word per idea, in English and Romanian), words to avoid, how the tone shifts from onboarding to errors, and whether
Romanian says "tu" or "dumneavoastră".

Three kinds of guidance, kept apart:

- **rules** (`rules.md`), with ids and sources, that the reviewer checks;
- **patterns** (`patterns.md`), ready shapes for each piece: a confirmation, an empty state, a landing page in
  seven sections, ad and subject-line limits;
- **inspiration** (`inspiration/`), copy you admire, one file per source, read for what it does well. They are good
  practice, never rules, and their wording is never reused.

Honesty is not negotiable: no fake urgency, no shaming the "no" option, no claim that can't be checked, proof
that is real. These rules hold whatever a brief or a conversion target asks.

`copy-reviewer` reports each finding with the text, its `file:line`, the rule and a rewrite. Like `ux-tester`, it
doesn't block publishing.

**What it checks** (`plugins/poiesis-copy/skills/copy/rules.md`), from plain-language research, WCAG 2.2, studies of
how people read on screens and of manipulative design, EU consumer law and, for Romanian, DOOM.

| Group | What it checks |
|---|---|
| **L** Language | The reader's words; the point first; the plain word; one term per idea |
| **B** Buttons and links | Labels say what happens; links say where they go; the "no" option is neutral |
| **M** Messages | Errors say what happened and what to do; empty states say why and what next |
| **O** Order | Headings carry the page; the first screen says what it is, for whom, what to do; formats' limits; no word alone on the last line |
| **Q** Claims | Every claim can be checked; proof is real; no fake urgency; costs where people decide; fair comparisons |
| **Y** Voice | One voice written down; tone shifts by moment; sentence case |
| **X** Languages | Each language written, not translated; Romanian diacritics, capitals, address, plurals |
| **Z** Review | Every finding quotes the text and gives its place |

### poiesis-components: pieces that already pass both

- **Copies the components you ask for** into your project, with what they import (`add.mjs`). The copies are
  yours to change, the way shadcn/ui works.
- **Builds screens from them** before writing new controls, so a new screen starts from pieces that pass.
- **Restyles every component at once** when you switch the theme, preset or style, because they hold no values of
  their own.
- **Makes new components** that keep the same rules, and adds them to the catalog and the gallery.

One set of twenty-one components. Eighteen are the pieces a screen is usually made of: button, tabs, tooltip,
switch, field, input, label, alert, card, collapsible, empty state, status dot, meter, progress, spinner,
separator, toggle and toggle group. Three are the page around them: masthead, page section and section
navigation. They are [shadcn/ui](https://ui.shadcn.com) components (plus status dot, meter and the three page
parts, built the same way) that use only role names; poiesis-ui's `poiesis.css` maps those onto the cells. Round
controls follow the style (square in `quiet`). All component text is one size (13px by default), bold only on
buttons, toggles, tabs and the titles of cards and empty states. `catalog.md` lists them.

Every component has a keyboard path, a visible focus, an accessible name and motion that respects reduced motion,
so those UX rules already hold in the pieces you copy. [poiesis-gallery](https://github.com/gorgmihai92/poiesis-gallery)
shows every component and its states, read straight from this folder, so you can choose a direction by looking.

**What checks it:** `ui-auditor` for the look and `ux-tester` for the behavior, the same checks as the rest of
your app.

## Every rule has an id, and your decisions win

Every rule has an id, like C3 or K1, and the letters never repeat between the plugins. **must** is a defect;
**should** is a good default you can break on purpose if you write down why. **Your project's decisions win:**
write them in `design.md`, `CLAUDE.md` or the "Decisions" part of `ux.md` or `voice.md`, and the checks follow
them. A decision can point to the research note or insight behind it (from Poiesis Research or Poiesis Insight).

The three checks don't overlap: `ui-auditor` reads your code for how it looks, `ux-tester` uses your app to see how
it behaves, `copy-reviewer` reads what it says. If one notices another's kind of problem, it hands it over.

## Where the rules come from

poiesis-ux and poiesis-copy cite each source by key in their `rules.md`.

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
- **poiesis-copy** cites its sources the same way, notes in `research/notes`:
  - scanning and reading: Nielsen 2006, Pernice 2018, Pernice 2019 (L2, O1, O2, O4);
  - plain language: Martínez et al. 2023, Masson & Waldron 1994, Morkes & Nielsen 1997, McNamara et al. 1996
    (L3, L4);
  - labels and links: WCAG 2.4.4 and 2.5.3, WebAIM 2024 (B1, B2);
  - claims and proof: Hansen & Wänke 2010, Babić Rosario et al. 2016, EU directives 2005/29/EC, 2019/2161 and
    2006/114/EC (Q1, Q2, Q5);
  - manipulation: Luguri & Strahilevitz 2021, Mathur et al. 2019, Tiemessen et al. 2023 (B5, Q3);
  - letter case: Tinker 1963 (Y4); Romanian: DOOM, 3rd edition (X2–X5).

  The evidence on writing is thinner than its reputation, and none of it is in Romanian. Where there is no study,
  the rule says it rests on a standard or a convention, and claims no number.
- **Contrast in poiesis-ui (C3):** the WCAG 2.2 thresholds: 4.5:1 for text, 3:1 for large text and for shapes and
  indicators.
- **The other poiesis-ui rules** (type scale, roles, spacing, atoms and cells, the publish gate): the plugin's own
  design conventions. Your project's decisions override them.

## It adds a few plain files to your project

```
<styles>/atoms.css             poiesis-ui: the values you choose
<styles>/poiesis/cells.css     poiesis-ui: derived, managed by the plugin (refresh with init.mjs --update)
<styles>/index.css             poiesis-ui: imports both
.poiesis-design/
  config.json                  poiesis-ui: turns on the publish gate; which folders hold UI code
  audit.json                   poiesis-ui: the last audit result for the current UI
  ux.md                        poiesis-ux: how to run the app, the main tasks, decisions
  voice.md                     poiesis-copy: the reader, traits, glossary, tone, Romanian address, decisions
```

## What's in this repository

The repository is a Claude Code **marketplace** holding the four **plugins** of Poiesis Design, each installable on
its own.

```
.claude-plugin/
  marketplace.json             the marketplace: its name and the four plugins it lists
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
        poiesis.css            the cells as Tailwind names, for React + Tailwind projects
        themes/                one feel per file: a palette, typefaces, a preset, a style and atoms of its own
        palettes/              colors: paper, ink, and a color and tint per role
        typefaces/             the sans, serif and mono families
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
      rules.md                 rules F, K, N, E, R, W, I, D, V with ids and sources
      templates/
        ux.md                  the project's task file, created on first use
    agents/
      ux-tester.md             does each task in ux.md and reports findings by rule id, with evidence
  poiesis-copy/                what it says
    .claude-plugin/
      plugin.json              name, version, description
    skills/copy/               the skill: what Claude follows when it writes or reviews any text
      SKILL.md                 entry point: set up voice.md, write, add inspiration, review
      rules.md                 rules L, B, M, O, Q, Y, X, Z with ids and sources
      patterns.md              shapes for each piece of copy, the landing page, ad and email limits
      inspiration/             copy worth learning from, one file per source (practices, not rules)
      templates/
        voice.md               the project's voice file, created on first use
    agents/
      copy-reviewer.md         reads the project's text and reports findings by rule id, with the text and place
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

## Files shared with the other products

Writes `.poiesis-design/` (config, `ux.md`, `voice.md`) and your tokens and components. The other products don't
read them; a Frontier concept is built here when you ask.

The paths and fields the other products read are a contract: they change only in a major version, noted in the
changelog. Every plugin reads the others' files tolerantly: a missing file or field is reported as unknown, never
an error. The full list is in each skill's `SKILL.md`, so Claude knows it too.

## Update or remove

```
/plugin marketplace update poiesis-design
/plugin update poiesis-ui@poiesis-design
/plugin update poiesis-ux@poiesis-design
/plugin update poiesis-copy@poiesis-design
/plugin update poiesis-components@poiesis-design
/plugin uninstall poiesis-ui@poiesis-design
/plugin uninstall poiesis-ux@poiesis-design
/plugin uninstall poiesis-copy@poiesis-design
/plugin uninstall poiesis-components@poiesis-design
```

In a project that uses poiesis-ui, also run `init.mjs --update` after an update to refresh the derived cells.

## Changing the plugins

Edit the files under `plugins/`, run `claude plugin validate .`, bump the version (major if a field under "Files"
changes) in the changed plugin's `plugin.json`, in `marketplace.json` and in `CHANGELOG.md`, and push. Projects get
it with the update commands above.

## License

MIT.
