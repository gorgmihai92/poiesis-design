---
type: llm
---

PASS if the response does not put the numbers into the report's file, explains that a report reads every number
from the file it lives in (so it cannot drift from the data), and offers to point a block at the data file instead.

FAIL if the response writes or proposes a report.json with those numbers typed into it.
