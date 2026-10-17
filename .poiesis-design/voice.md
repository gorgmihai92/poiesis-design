# Voice

How the Poiesis Toolkit speaks in its READMEs and docs (poiesis-design, poiesis-research, poiesis-insight,
poiesis-frontier), used by the `copy` skill and checked by `poiesis-copy:copy-reviewer`. Rules: the `copy`
skill's `rules.md`; decisions here override them, except the Claims rules (Q).

## Reader
People who use Claude Code and want it to do one kind of work well: research they can check, interpretation that
survives a challenge, concepts with experiments, an interface that is designed and checked. They know Claude Code
and their own field; they don't know the plugins' internals. They come to learn what a plugin does, whether it fits,
how to install it and what to ask.

## Languages
- English only.
- Romanian address: not used.

## Traits
- **Plain, not promotional.** Say what it does and how; no hype, no superlatives.
- **Exact, not approximate.** Counts, paths, commands and versions as the repository has them.
- **Honest about limits.** What it does not check, what the evidence does not show, what needs the reader.

## Glossary
| Idea | English | Romanian | Not |
|---|---|---|---|
| One installable unit | plugin | | extension, add-on |
| The four products as a family | the Poiesis Toolkit | | the toolkits, suite, platform |
| One of the four, one repository each | product: Poiesis Research, Poiesis Insight, Poiesis Frontier, Poiesis Design | | toolkit, module |
| What Claude follows for a kind of work | skill | | mode |
| A sub-assistant run on its own | agent | | bot, worker |
| A procedure inside a skill | playbook | | workflow |
| A value a theme sets | atom | | setting, variable |
| A value derived from atoms | cell | | variable |
| Spelling | color, behavior (US) | | colour, behaviour |

## Avoid
Hype (powerful, seamless, magic, revolutionary), "simply", "just", superlatives without proof (Q1), and promises
of results the evidence does not give.

## Tone
- **Openings:** what it is, who it is for, what to do first, in a few lines (O2).
- **How it works:** the mechanism, plainly, with what it reads and writes.
- **Rules and sources:** neutral; numbers with their source.

## Inspiration
- mymind (`poiesis-copy/skills/copy/inspiration/mymind.md`): promises as refusals; two speeds (short headings, full
  sentences under them).

## Decisions
- O1 · Reference headings stay labels ("Install", "Update or remove", "License", "What's in this repository",
  "Files shared with the other products"): readers look them up by name, and other files refer to them.

- Product framing (George, 2026-10-17): the Poiesis Toolkit is one product made of four: Research, Insight,
  Frontier, Design. A product is named "Poiesis <Name>" in prose and by its plugin or repository name in code and
  commands. Design is one product with four plugins (poiesis-ui, poiesis-ux, poiesis-copy, poiesis-components);
  its README says what each plugin does. Every README opens with what its product does, then the same
  "Part of the Poiesis Toolkit" section.

## To confirm
- The reader and US spelling were guessed from the READMEs.
