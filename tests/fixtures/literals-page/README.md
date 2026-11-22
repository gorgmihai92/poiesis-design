# Literals page: synthetic, for the test

A made-up page and its data file, for the test that rebuilds a page holding its data in its first script as
literals (`tests/studio.test.mjs`, "the literals page is rebuilt"). Nothing in this folder is data about anything:
the topics, studies, concepts and sources are placeholders, and the numbers were chosen to give the test a shape.

- `page.html`: the "published" page. Its first script only declares constants; `tests/fixture-pages.mjs` runs it
  alone, in an empty context, to read them. Its verdicts are typed in beside the claims, as such pages did.
- `page_data.json`: the same numbers as a data file, with one field renamed (`prev` is `momentum_prev`) and the
  three crossings given longer names, so the comparison has names to report.
- The challenge records are `tests/fixtures/stamps/literals-page.jsonl` (written for this test, over the
  claims as the page shows them); the report is `tests/fixtures/reports/literals-page.json`.
