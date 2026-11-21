# Published pages from recorded runs (observations, 2026-11-17 and 2026-11-22)

- **Source:** the Poiesis Lab notebook, a private repository: `fixtures/trend-scan/`, `fixtures/README.md`,
  `fixtures/challenge-verdicts.json` and `lab/plan.md`. The notebook also holds a second recorded page, which is
  not described here. The files are not in this repository.
- **File:** none here.
- **Licence:** the owner's own data.
- **Evidence:** observation (O) · the page published from a trend scan run with the Poiesis plugins on 2026-11-17,
  with the data files it was built from.
- **Read:** the trend scan's `page.html` in full (396 lines), `fixtures/README.md`, `lab/plan.md` and
  `challenge-verdicts.json` in full; the data files by script (their keys, row counts and first rows), on
  2026-11-22. Where the page's colors come from was checked again on 2026-11-26. The agents' raw reports were not
  saved, so they were not read.

## What it says

### A verdict that drifted
- The trend scan's page reads its verdicts from `challenge.published.json`. Its first row, `c6`, says `kept`. The
  challenger's verdict for that conclusion was `weakened`: the label was typed again by hand and changed on the way
  (`fixtures/README.md`; `challenge-verdicts.json`, conclusion C6).
- `challenge.corrected.json` is the same file with that one verdict corrected. The notebook keeps both as the
  failing and the passing case.

### Where the numbers live
- The page draws from five files of rows (`series.json` 85 rows, `checks.json` 5, `corpus.json` 17, `synbio.json`
  8, and the challenge file 6), each with the scripts that made it attached.

### What the page shows
- Lines over years: five areas over 2010–2026 with the last year marked partial and drawn dashed.
- A plot of dots: each area's recent growth against its usual range, one row of dots for each area.
- Tables: countries by year; areas with their largest institution and country.
- A verdict beside each conclusion, as a colored word.
- The page ends with a list of what was not checked.
- The styles are the page's own classes over color variables of the host it was published on. It uses none of the
  library's components.

## What it means for the plugin
- Rule U1: a verdict is shown from its stamp, by the script that verified the stamp, and is never typed into a page
  or into a file a page reads. `report` keeps the published file with `kept` as a failing case: given the stamp,
  it shows `weakened` and says the two disagree.
- A report's own file holds references and prose only. Numbers and verdicts stay in the files they came from and
  are read at build time, so there is one copy of each. Counts shown on the page (how many studies, how many
  sources) are computed from the lists they count. That part is a product decision (P), drawn from the retyped
  verdict above and the rule "nothing invented"; no drifted count is recorded here.
- The four patterns added to poiesis-components are the four things this page drew by hand: a table of evidence,
  a series over time, a map of dots, a verdict label.
- One page from one run: it shows what went wrong once, not how often it would.
