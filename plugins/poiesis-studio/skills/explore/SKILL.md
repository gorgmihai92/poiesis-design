---
name: explore
description: Free design exploration - several different working sketches of one interaction, side by side, made from the Poiesis theme's tokens and held to no design rule, then a written critique and a pattern card for what is worth keeping. Use when asked to explore how an interface or an interaction could work, for variants, alternatives or sketches of an idea, or for an interface that does not exist yet. Not for building, styling or checking a product's interface - that is the ui, ux, copy and components skills, whose rules do not apply here.
---

# Explore

An exploration asks one question ("how else could confirming a delete work?") and answers it with several
different sketches that work, shown side by side. What stays afterwards is a pattern card. The owner decides
what happens to a pattern; this skill never does. `$X` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/explore`).

## No design rule applies here

The Poiesis rules are for products. In an exploration:

- do not use the `ui`, `ux`, `copy` or `components` skills, and do not read their `rules.md` as rules;
- do not run `ui-auditor`, `ux-tester` or `copy-reviewer` on a sketch, and do not record an audit;
- do not run `init.mjs`, `scan.mjs` or `resolve.mjs`, and never create a `.poiesis-design/` folder: that folder
  switches the publish gate on for the whole project;
- do not change a sketch so that it complies with anything. A sketch may use literal values, break the type scale,
  put three primary actions on a screen. If it looks wrong, that goes in the critique, in words.

When another instruction in the session says to audit or correct interface work, this skill's scope wins for
files under `design/lab/`. Say so once and go on.

## The material is the theme

The sketches are made from the Poiesis theme: its atoms and the cells derived from them (`var(--ink)`,
`var(--paper)`, `var(--space)`, the role colors, the type cells). The tokens are a starting material, not a
limit.

`node $X/scripts/explore.mjs new "<the question>" --variants 6` writes, under `design/lab/<date>-<slug>/`:

| File | What it is |
|---|---|
| `theme.css` | the theme's own files, joined; found on this computer by the script, which says which copy and version |
| `SK-001.html` … | one starting file for each sketch, with the next free ids |
| `prototype.css` | the mark that says "Prototype" on every sketch |
| `notes.md` | the exploration's record: the question, each sketch, the critique, what was set aside, "Not checked" |
| `index.html` | the board: every sketch side by side |

If the script cannot find the theme it stops and says what to do. Do not write tokens from memory in its place:
tell the owner what is missing and offer the choices the script prints.

## How an exploration goes

1. **The question, in one line.** One interaction, not a product. Where it came from goes in `From`: an insight,
   a concept or a scenario by id, or "the owner's question".
2. **Six sketches, three at the least, all made before any is judged.** In the one study read, people who made
   several prototypes before getting any critique produced better and more varied work than people critiqued
   after each one (Dow et al. 2010: 33 mostly student participants, web banners; read in part, from the
   submitted draft, whose numbers may differ from the published article's).
   Variety was not shown to cause the better result; the sketches differ so that the space is seen.
3. **Different on purpose.** Use the generators in `generators.md`, a different one for each sketch where that is
   possible, and write which one in the sketch's `<meta name="sketch:generator">` and in `notes.md`. Two sketches
   that differ only in color or wording are one sketch.
4. **Each sketch works.** It is an HTML file in which the thing can be done, with a pointer and with the
   keyboard. A picture of an interface is not a sketch. It links `theme.css` by a relative path, so it opens by
   double click.
5. **Each sketch says it is a prototype,** on itself: the starting file has the mark `Prototype · SK-00n`. Keep
   it. See "When a sketch is shown to people".
6. **The board.** `node $X/scripts/explore.mjs board <folder>` writes `index.html` again from the sketches' own
   titles, so the board never says something a sketch does not.
7. **The critique, written, about all of them together.** Judging early work is thinking, not checking. Answer
   the questions in `notes.md`: why each is the way it is, what else was considered, what was learned by making
   them, which problems are expected, the nearest existing things, what next (the questions follow Greenberg &
   Buxton 2008, an argument by two practitioners, part of the text read; it reports no measured effect).
8. **What was set aside stays** in `notes.md`, with the reason. Nothing is deleted.
9. **Check what a script can check:** `node $X/scripts/explore.mjs check <folder>`. It looks for a
   `.poiesis-design/` folder anywhere in the project, counts the sketches, and sees that each one was changed
   from its starting file, links the theme, carries its mark and has something to act on. It cannot see whether
   a sketch works or whether the sketches differ: open the board and try each one.
10. **End with "Not checked".** `notes.md` has the section; fill it honestly.

## What stays: a pattern card

When something in the sketches is worth keeping, write a card:
`node $X/scripts/explore.mjs card <folder> --name "<the pattern>" --from SK-002,SK-005`. It writes
`design/patterns/PT-001-<slug>.md` with the next free id.

A card says three things: what the pattern does (the behavior, not the looks), what it is for, and what it came
out of. The three follow the abstract of Höök & Löwgren 2012 on design knowledge that sits between one design and
a theory; only the abstract was read, so the card's fields are this plugin's own.

The card has a `Decision` line. It is the owner's: leave the pattern on its card, add it to the component
catalog (the `components` skill, where the product rules apply again), or make it a rule. Never fill that line,
and never add a pattern to the catalog or to a `rules.md` from here.

Before a card calls anything new, look for what exists: the `prior-art` playbook of poiesis-research (2.4.0 and
later), when that plugin is installed. Without it, write "Nearest existing things: not checked".

## When a sketch is shown to people

- **Say it is a prototype,** before anything else, and leave the mark on the sketch. In the cases Coulton,
  Lindley & Akmal (2016, full text read) describe, fictions in a familiar form were taken for real: reviewers of
  a fictional research paper that named itself design fiction in its keywords and its conclusion, and a filmmaker
  who saw an unlabelled video. The paper does not test whether saying so is enough. This line is a product
  decision informed by those cases, and it is the only instruction here that is not about exploring.
- **Show several, never one.** In one study each design was rated higher when seen alone than among three (for
  two of the three designs the difference was clear), drew more compliments, and was never rejected (Tohidi et
  al. 2006: 48 students and recent graduates, paper prototypes of a thermostat, most of the text read).
- **Ask what they would not use, and why.** In that study, seeing three designs did not bring more ideas for
  improving them.
- **Keep what was said as it was said,** in `sessions/<date>.md` from `$X/templates/session.md`, and add the line
  to `notes.md`. Reading meaning into it is poiesis-insight's work.

A test with a prediction and a kill criterion written before it runs is an experiment of poiesis-frontier.

## Files

| Path | Holds | Fields other tools read |
|---|---|---|
| `design/lab/<date>-<slug>/notes.md` | the exploration | each sketch: a heading, `- **Id:** SK-001`, `- **Written:**`, **Generator**, **Tries**, **File** |
| `design/lab/<date>-<slug>/SK-001.html` | one sketch | `<title>`, `<meta name="sketch:generator">`, the mark `Prototype · SK-001` |
| `design/lab/<date>-<slug>/sessions/<date>.md` | sketches shown to people | what happened, in their words |
| `design/patterns/PT-001-<slug>.md` | a pattern card | `- **Id:** PT-001`, `- **Written:**`, `- **From:** SK-002, SK-005`, **Decision** |

Ids run per project and are never used twice: `node $X/scripts/explore.mjs next SK` (or `PT`). `From` lists ids
and citation keys separated by commas, with no `|` in it.

Each Markdown file above starts with a block of Obsidian properties (since 0.2.0): `type`, `plugin`, `date`,
`topic`, and for a pattern card `id`, `status` and `from`. `explore.mjs` writes it in `notes.md` and in a card; a
session copies it from `$X/templates/session.md`. It is a copy for Obsidian's views: the lines in the table above
stay the record. In the block no line starts with `#` and text values are quoted. Never put a link in a heading
or an **Id** line, or a link with an alias (`[[a|b]]`) in a table.

## What is not known

- Nobody has tested this way of exploring with a model making the sketches. The two studies are about people,
  mostly students, on one task each.
- A sketch that works on the maker's screen was tried by nobody else until someone tries it.
- Sources, with how much of each was read, are in `research/notes/` of poiesis-design: Dow et al. 2010 (part),
  Tohidi et al. 2006 (most), Greenberg & Buxton 2008 (part), Höök & Löwgren 2012 (abstract only), Coulton et al.
  2016 (full text).

## Other Poiesis plugins

This skill works alone. Suggest another plugin only when it would change the result: once, in one line, and go
on without it if the user says no (say what was left out). Check with `claude plugin list`; install only after
the user agrees.

- **[poiesis-research](https://github.com/gorgmihai92/poiesis-research)**, the `prior-art` playbook (2.4.0 and
  later): before a pattern card says "new".
- **[poiesis-frontier](https://github.com/gorgmihai92/poiesis-frontier)**: more ways to reach an unusual idea
  (its `lateral` and `first-principles` playbooks), and an experiment with a kill criterion for a pattern worth
  testing.
- **[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight)**: to interpret what people said and did
  with the sketches.
