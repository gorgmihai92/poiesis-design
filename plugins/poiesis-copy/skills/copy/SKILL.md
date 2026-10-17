---
name: copy
description: What the words say - UX copy and microcopy (buttons, errors, empty states, confirmations, onboarding), landing pages, ads, email and announcements, in English and Romanian - as rules with sources (plain language, labels, messages, page order, honest claims, voice, Romanian norms), patterns for each piece, inspiration (good practice from admired copy), and the project's voice in .poiesis-design/voice.md, which the copy-reviewer agent checks against. Use when writing, rewriting or reviewing any user-facing text, naming features, setting a voice or tone, writing headlines, calls to action, ads or emails, translating between English and Romanian, or when asked for a copy review. When and where a message appears is the ux skill of poiesis-ux; how text looks is the ui skill of poiesis-ui.
---

# Poiesis copy

`copy` is what the words say. When and where a message appears is `ux` (plugin poiesis-ux); how text looks is `ui`
(plugin poiesis-ui). Rules: `rules.md` (cite ids, e.g. L2, Q3; no letter repeats a `ui` or `ux` rule). Patterns:
`patterns.md`. Good practice from copy the user admires: `inspiration/`. `$COPY` is this folder
(`${CLAUDE_PLUGIN_ROOT}/skills/copy`).

The aim is copy that is clear, concise and honest: it helps people understand and decide, and never tricks them.
The Claims rules (Q) hold whatever a brief, a client or a conversion target asks; if a request needs breaking one,
say which and offer the honest version.

**Set up.** The project gets `.poiesis-design/voice.md` from `$COPY/templates/voice.md`: the reader, the
languages and the Romanian form of address, three or four traits ("this, not that"), the glossary, words to avoid,
tone by moment, decisions. Write it from the code, the existing copy, the brief and `ux.md`; don't ask questions.
Put what you guessed under "To confirm" and tell the user in one line. Without a project (an ad, a one-off page),
ask only what changes the words: who it's for, the one action, the language.

**Write.**
1. Read `voice.md` and the pattern for the piece in `patterns.md`; for a landing page, voice or ads, also skim
   `inspiration/` and use what fits.
2. Write the point first (L2), in the reader's words (L1, L3), with the glossary's terms (L5). Labels say what
   happens (B1–B3); messages say what happened and what to do (M1–M4); claims can be checked and proof is real
   (Q1–Q5).
3. Both languages when the project has both: write each from the meaning (X1), with the Romanian rules (X2–X5);
   check lengths in the longer one (X6, O5).
   Headings and short text that will wrap: no single word on the last line at the widths shown (O6); reword,
   don't force a break.
4. Before finishing, check the piece against the rules it touches and fix what breaks.

Headlines, taglines, ads and subject lines: give 2–3 versions with different angles (outcome, problem, belief),
recommend one and say why in a line. Product copy (buttons, errors, labels): give one, the clearest. When rewriting
existing copy, show before → after with the rule id, only where something changes.

**Inspiration.** When the user names copy they admire (a site, a campaign, a book), read it and add a file to
`$COPY/inspiration/` from the template in its README: moves, not phrases. Inspiration is practice, never rules; their
wording is never reused.

**Review (Z2).** Run `poiesis-copy:copy-reviewer` after copy changes and before a release, next to `ui-auditor`
and `ux-tester`. It reads every user-facing string that changed, in every language, and reports findings by rule
id with the text and `file:line`. It never edits the project. Fix `must` findings; for a `should` you keep, write
the reason under "Decisions" in `voice.md`.

## Files
Reads `.poiesis-design/ux.md` (tasks, to know what each screen is for) and `design.md` or `CLAUDE.md` (decisions)
when present; a missing file is unknown, never an error. Writes `.poiesis-design/voice.md`. Its sections (Reader,
Languages, Traits, Glossary, Avoid, Tone, Decisions) are a contract: they change only in a major version.

## Other Poiesis plugins
This plugin works alone. Suggest another one only when it would change the result: once, in one line, and go
on without it if the user says no (say what was left out). Check with `claude plugin list`; install only after
the user agrees, with `claude plugin marketplace add gorgmihai92/<repo>` and then
`claude plugin install <plugin>@<repo>` (it works after Claude Code restarts).
Every suggestion, from the skill or an agent, gives the plugin's link (below) and names the skill or agent
to use, e.g. "[poiesis-research](https://github.com/gorgmihai92/poiesis-research), `evidence-scout`".
- **poiesis-ux** ([poiesis-design](https://github.com/gorgmihai92/poiesis-design)): whether a message, state or
  confirmation should exist and when it appears, which this plugin does not check.
- **poiesis-ui** ([poiesis-design](https://github.com/gorgmihai92/poiesis-design)): how the text looks (size,
  weight, measure).
- **[poiesis-research](https://github.com/gorgmihai92/poiesis-research)**: `evidence-scout` for the data behind a
  claim the copy wants to make (Q1).
- **[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight)**: to interpret customer interviews or
  reviews into the reader's own words for the voice and glossary.
