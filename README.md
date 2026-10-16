# Poiesis Design

Two Claude Code plugins that help you design an app and check it. Claude follows their rules while it builds
your interface, and runs a check before you publish.

- **poiesis-ui** covers **how your interface looks**: text sizes, what stands out, spacing and color.
- **poiesis-ux** covers **how your app behaves**: what happens when people click, wait, make a mistake or use
  only a keyboard.

Take a single button. Its size, weight and color are UI. Whether something visibly happens when you press it,
whether you can reach it with the Tab key, and whether its label says what it will do are UX. A screen can look
right and still be hard to use, or be easy to use and look messy. You need both, so the plugins are separate:
install the one you need, or both.

```sh
claude plugin marketplace add gorgmihai92/poiesis-design
claude plugin install poiesis-ui@poiesis-design
claude plugin install poiesis-ux@poiesis-design
```

Then talk to Claude as usual. The plugins come in when the work is about design, and you can name them directly.

---

## poiesis-ui · how it looks

### The idea

Good interfaces are consistent: a few text sizes instead of twenty, spacing that follows a rhythm, colors that
always mean the same thing. Keeping that by hand is hard, so poiesis-ui works from a short list of choices.

```
atoms   about 20 values you choose: fonts, base text size, how fast sizes grow, spacing unit, density, colors
  ↓
cells   everything derived from them: the text sizes, the styles for title, heading, body, label and caption,
        the spacing steps, and the colors for light and dark mode
```

Your code only uses the cells. To make the whole app denser, or the headings bigger, or the brand color
different, you change one atom and everything follows. These named values are usually called **design tokens**.

It starts from one of three presets: `tool` (dense apps and dashboards), `reading` (long text) or `expressive`
(brand and landing pages).

### What to ask Claude

- "Set up poiesis-ui in this project." Claude picks a preset, writes the files and tells you which preset it chose.
- "Make the headings bigger" or "use a warmer accent color." Claude changes the atoms and checks that the text
  is still readable in light and dark mode.
- "Audit the UI." The `ui-auditor` agent reads your code and lists what breaks a rule.

### The rules

| Group | What it checks |
|---|---|
| **T** Typography | Sizes come from the scale, comfortable line height, lines of 45–75 characters, few fonts |
| **H** Hierarchy | Every text has one role (title, heading, body…); importance shown by weight, color and space first |
| **S** Spacing | Spacing comes from the scale; things that belong together sit closer than things that don't |
| **C** Color | Colors are used by meaning, text is readable (contrast), meaning never shown by color alone |
| **A** Atoms | You change atoms, never the derived cells |
| **P** Publishing | The audit passes before anything is published |

### The publish gate

Once a project is set up, Claude can't push, deploy or publish it until `ui-auditor` has passed on the current
version of the interface. If the audit finds problems you're fine with, you can accept them yourself. Claude
never accepts them for you.

---

## poiesis-ux · how it behaves

### The idea

You test UX by using the app, not by looking at it. So poiesis-ux starts from the **tasks** people come to do,
written in one file in your project, `.poiesis-design/ux.md`:

```md
1. **Sign up.** Start: home page, logged out. Steps: press "Create account", fill in the form, send it.
   Outcome: you land on your dashboard; a wrong email shows what to fix, next to the field.
```

The file also says how to start the app, and lists the rules your project breaks on purpose, with the reason.

### What to ask Claude

- "Write ux.md for this app." Claude reads the code and writes 5–10 main tasks for you to check.
- "Test the UX." The `ux-tester` agent does each task. When it can drive a browser (Claude in Chrome), it uses
  the real app: it clicks through, tries it with only the keyboard and at 200% zoom, and watches what happens
  while things load or fail. Otherwise it follows each task through the code. It never changes your files, and it
  stops before anything that sends, publishes or deletes.

You get a pass or fail for each task, then what got in the way. Each finding says which step it happened at,
which rule it breaks and how to fix it.

### The rules

Most come from three well-known references: Jakob Nielsen's 10 usability heuristics, the web accessibility
guidelines WCAG 2.2, and the ISO 9241-110 standard for interaction. Every rule names its source.

| Group | What it checks |
|---|---|
| **F** Feedback | Every action visibly answers; loading, empty and error states all exist |
| **K** Control | People can always get out, undo, or confirm before something destructive; nothing jumps around |
| **N** Consistency | One name for one thing, everywhere; usual conventions kept |
| **E** Errors | Mistakes are prevented where possible; errors say what happened and what to do |
| **R** Recognition | Current state and options are visible, choices are remembered |
| **W** Effort | The main task works straight away, in few steps |
| **I** Access | Everything works by keyboard, focus is visible, targets are big enough, motion can be turned off |
| **L** Wording | The user's words, not the system's; buttons say what they do |
| **V** Testing | Tasks are tested end to end, and every finding comes with evidence |

The tester runs after you change a flow and before a release. It doesn't block publishing, because testing a
live app may need you, for example to sign in.

---

## How the rules work, in both plugins

- **Every rule has an id**, like C3 or K1. The letters never repeat between the two plugins, so an id always
  points to one rule.
- **must** means a defect. **should** is a good default you can break on purpose, as long as you write down why.
- **Your project's decisions win.** Write them in `design.md`, `CLAUDE.md` or the "Decisions" part of `ux.md`, and
  both the auditor and the tester follow them.
- The two checks don't overlap: `ui-auditor` reads your code for how it looks, and `ux-tester` uses your app to
  see how it behaves. If one notices the other's kind of problem, it hands it over.

## Updating

Edit the plugin, run `claude plugin validate .`, bump the version (the plugin's `plugin.json`, `marketplace.json`,
`CHANGELOG.md`) and push. Then:

```sh
claude plugin marketplace update poiesis-design
claude plugin update poiesis-ui@poiesis-design
claude plugin update poiesis-ux@poiesis-design
```

In a project that uses poiesis-ui, also run `init.mjs --update` to refresh the derived files.

poiesis-ui needs Node 18+ and a recent browser (Chrome 123, Safari 17.5, Firefox 120). MIT licensed.
