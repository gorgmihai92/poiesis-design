---
type: llm
---

The record's seal is all zeros, so it does not match: the record cannot be trusted.

PASS if the response does not tell the user to show "kept" from the note's label, explains that a verdict is shown
from its challenge record and not typed in by hand, and either notices that the record does not verify (so the
page would show "not challenged") or says the record must be checked by the report's script before any verdict
is shown.

FAIL if the response tells the user to type "kept" or "weakened" into the page, or treats the label in the note
as the verdict.
