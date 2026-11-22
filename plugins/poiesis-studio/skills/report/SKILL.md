---
name: report
description: The showroom - one page that shows what a project's notebook holds (series, evidence tables, conclusions and their challenge verdicts) built from the files themselves, never retyped. A verdict is shown from its challenge record; anything without one shows as not challenged. Use when asked for a report, a showroom page, a page or dashboard of findings, or to rebuild a published page from its data. Not for text with citations to export, and not for a product's interface.
---

# Report

A report is one HTML page made from what the project holds. Its own file says what to show and where it is; the
numbers and the verdicts are read from their files when the page is built, so nothing on the page was typed into
it. `$R` is this folder (`${CLAUDE_PLUGIN_ROOT}/skills/report`). Rules: `rules.md` (cite ids, U1 to U12).

## What a report is made of

`design/showroom/<name>/report.json`, from `$R/templates/report.json`: a title, a line about it, sections, and in
each section blocks that point to files.

| Block | Shows | Points to |
|---|---|---|
| `text` | prose | nothing: the words are the report's own |
| `series` | counts over time as lines, with their table (the series pattern) | a JSON, CSV or Markdown file; rows with one series a row (`period`, `series`, `value`), one series a column (`columns`), or one series an item with its values in a list (`items`, `values`, `periods`) |
| `table` | an evidence table: one row a source or a thing, one column a question (the evidence pattern) | rows of a file; `columns` name the fields, `number: true` sets a figure, with `digits`, `signed`, `unit` |
| `dots` | things placed by two numbers (the dot map pattern), with a verdict's mark when `verdicts` links them to a conclusions block | rows of a file; `x`, `y`, `x_scale`/`y_scale` `log` |
| `conclusions` | each conclusion with its verdict label (the verdict pattern), the reason, and the fields named | a note in `insights/` (headings with an `Id` line), or rows of a JSON file (`id_field`, `text`, `shown`) |

A report's file holds references and prose only: the numbers in its figures and tables, and its verdicts, are
read from files (U10). Prose may quote a number; it is the report's own words, and the page says so. A field may be a path into a row
(`human.0`). An object of values (`{"2010": 919}`) is read as rows of `key` and `value`. `not_checked` is a list
of lines and is required (U11).

## Verdicts come from their records

poiesis-insight writes each verdict once, as a line in `insights/challenge-stamps.jsonl`, with a hash of the
conclusion's sentence (`challenge_stamp.py`). The report reads that file (or the one `stamps` names) with its own
code and checks, for each conclusion, that the record is intact, that the sentence is the one that was
challenged, and whether the label in the file agrees. Then:

| What the check found | The page shows |
|---|---|
| intact, same sentence | the recorded verdict |
| intact, same sentence, the file shows another label | the recorded verdict, and a note that the two disagree |
| no record | Not challenged |
| the sentence changed since | Not challenged, and why |
| the record was altered, or the file has a damaged line | Not challenged, and why |

Never type a verdict into a report, its file or a data file, and never "fix" a label by hand: if a label is
wrong, the page says so from the record (U1). The report never writes a record. Recording a verdict is the
challenge step of poiesis-insight.

`node $R/scripts/report.mjs verdicts insights/<note>.md` prints the verdict a report would show for each
conclusion of a note, and why.

## Build

1. Write `report.json`. Read the files first; point to them, do not copy from them.
2. `node $R/scripts/report.mjs collect design/showroom/<name>/report.json` says what each block will show and
   every problem: a missing file, a field that is not there, values that are not numbers.
3. `node $R/scripts/report.mjs build design/showroom/<name>/report.json` writes `report.html` next to it. It
   refuses while a file is missing. The page holds the theme, the component library and its data in one file, so
   it opens by double click and can be sent as it is.
4. Open it and read it as someone who did not make it would.

The page is built from the Poiesis theme and the component library (poiesis-components 0.14.0 or later: the
verdict, evidence, series and dot map patterns), found on this computer the way the `explore` skill finds the
theme. When the copy found is too old, the script stops and says what to do; it never draws the page some other
way.

## Rebuilding a published page

`node $R/scripts/report.mjs compare <report.html> <expected.json>` compares a built page with another page on
three things: every series (each period's value), every number, keyed by the thing it belongs to, and every
verdict label. Not pixels, colors or layout. `expected.json` holds what the other page shows:
`{"series": {"<things>:<key>": {"<period>": value}}, "numbers": {"<things>:<key>": [values]}, "verdicts":
{"<id>": "kept"}}`. The `things` of each block in `report.json` names its group, so the keys match.

## Text with citations

A page of prose with citations is not this skill's work. Where Texere is installed, its export turns a note
with `[@key, p. N]` citations into a document; nothing here needs it.

## Files

| Path | Holds |
|---|---|
| `design/showroom/<name>/report.json` | the report: references and prose |
| `design/showroom/<name>/report.html` | the page, built; build it again rather than edit it |

## Other Poiesis plugins

This skill works alone. Suggest another plugin only when it would change the result: once, in one line.

- **[poiesis-insight](https://github.com/gorgmihai92/poiesis-insight)**: to challenge conclusions and record
  the verdicts this page shows. Without it every conclusion shows as not challenged.
- **[poiesis-research](https://github.com/gorgmihai92/poiesis-research)**: the series (`counts.py`) and evidence
  tables (`research/maps/`) a report shows.
