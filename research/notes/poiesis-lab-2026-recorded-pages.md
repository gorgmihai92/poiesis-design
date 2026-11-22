# Two published pages from recorded runs (observations, 2026-11-17 and 2026-11-22)

- **Source:** the Poiesis Lab notebook, a private repository: `fixtures/trend-scan/`, `fixtures/responsibility-map/`,
  `fixtures/challenge-verdicts.json`, `fixtures/README.md`, `lab/plan.md`, `CLAUDE.md` and `PROTOCOL.md`. The files
  are not in this repository.
- **File:** none here.
- **Licence:** the owner's own data.
- **Evidence:** observation (O) · two pages published from runs of the Poiesis plugins on 2026-11-17, with the data
  files each page was built from.
- **Read:** both `page.html` files in full (396 and 575 lines), `fixtures/README.md`, `lab/plan.md`, `CLAUDE.md`,
  `PROTOCOL.md` and `challenge-verdicts.json` in full; the data files by script (their keys, row counts and first
  rows), on 2026-11-22. The agents' raw reports were not saved, so they were not read.

## What it says

### A verdict that drifted
- The trend scan's page reads its verdicts from `challenge.published.json`. Its first row, `c6`, says `kept`. The
  challenger's verdict for that conclusion was `weakened`: the label was typed again by hand and changed on the way
  (`fixtures/README.md`; `challenge-verdicts.json`, conclusion C6).
- `challenge.corrected.json` is the same file with that one verdict corrected. The notebook keeps both as the
  failing and the passing case.
- On the other page every verdict is a literal in the page's script: six topic verdicts, five findings and a table
  that colors the dots. None is read from a file, so nothing ties a label to what the challenger said.
- One conclusion of that run was `split`: its two parts carry verdicts of their own, `weakened` and `dropped`
  (`challenge-verdicts.json`, T2). The page shows the parts as two rows.

### Where the numbers live
- The trend scan's page draws from five files of rows (`series.json` 85 rows, `checks.json` 5, `corpus.json` 17,
  `synbio.json` 8, and the challenge file 6), each with the scripts that made it attached.
- The other page holds its numbers inside the page: the yearly shares of 16 topics and three small yearly counts.
  They equal `page_data.json`, with one field renamed and three series given shorter names (compared by script).
- That page also holds 15 studies, 5 findings, 5 concepts and a list of sources that exist nowhere else as data.
- Its heading for the sources says 22 (20 and 2); the list under it has 28 entries (counted by script). The count
  in the heading was typed, not computed.

### What the pages show
- Lines over years: five areas over 2010–2026 with the last year marked partial and drawn dashed; one or two topics
  over 2010–2025.
- A plot of dots: 16 topics by yearly growth and by share on a logarithmic scale, colored by verdict, with ten
  named on the plot.
- Tables: studies against the parties blamed, each cell a word (more, less, some) and a note; countries by year;
  areas with their largest institution and country.
- A verdict beside each conclusion: a colored word on one page, a tinted chip on the other.
- Both pages end with a list of what was not checked.
- The colors are hand-picked values in each page, different on the two pages. Neither page uses the library's
  components.

### The notebook's own rules
- `CLAUDE.md`, rule 1: nothing invented; a fact comes from a source read, data a script computed, or
  documentation read. Rule 3: a verdict is written once, by the challenge step, and not retyped elsewhere. Rule 5:
  every report ends with "Not checked". Rule 7: in `design/lab/` no design rule applies.
- `PROTOCOL.md`, "Entry gates": for poiesis-studio's `report`, a verdict is shown from its stamp, and anything
  without one is shown as not challenged.

## What it means for the plugin
- Rule U1: a verdict is shown from its stamp, by the script that verified the stamp, and is never typed into a page
  or into a file a page reads. `report` keeps the published file with `kept` as a failing case: given the stamp,
  it shows `weakened` and says the two disagree.
- A report's own file holds references and prose only. Numbers and verdicts stay in the files they came from and
  are read at build time, so there is one copy of each. Counts shown on the page (how many studies, how many
  sources) are computed from the lists they count.
- The four patterns added to poiesis-components are the four things both pages drew by hand: a table of evidence,
  a series over time, a map of dots, a verdict label.
- Two pages made in one session by one person: they show what went wrong once, not how often it would.
