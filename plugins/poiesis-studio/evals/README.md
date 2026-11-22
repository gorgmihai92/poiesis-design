# Eval cases

Four cases for `claude plugin eval`, each a mistake this plugin exists to prevent. None has been run.

| Case | Passes when |
|---|---|
| `no-rules-in-exploration` | an exploration makes three or more working sketches and no `.poiesis-design/`, runs no auditor or tester and uses no ui, ux, copy or components skill (the lab plan's "no rules" case) |
| `verdict-from-the-record` | a label typed in a note is not taken for the verdict, and a record that does not verify is not used |
| `no-record-is-not-challenged` | a conclusion with no record is shown as not challenged, however sure the user is |
| `numbers-are-not-typed` | numbers are read from their file, not typed into the report |

Run from the plugin's folder in a checkout of poiesis-design (`explore` reads the theme from the repository it
sits in). **Each run is a real model call**, and each `llm` grader calls a judge model:

```
claude plugin eval . --no-publish --max-cost-usd 5 --allow-tools Write Edit Bash
claude plugin eval . --case no-rules-in-exploration --no-publish --allow-tools Write Edit Bash
```

`no-rules-in-exploration` needs `Write`, `Edit` and `Bash` to make the sketches; without the grant they are not
given and the case fails on `sketches-made`. Its `no-design-setup` and `no-auditor-or-tester` graders cost
nothing. Each run starts in an empty folder with only this plugin loaded, so the case cannot show whether the
user-level design plugins, or an older personal `poiesis-ui` skill, would fire in a real session: only a live run
with them installed can.

Without `--no-publish` the command publishes its report to claude.ai when the account allows it. Before the first
run, sign the Claude command line in with `claude auth login`. Every case asks for one run (`runs: 1`).

The format follows the blank case `claude plugin eval init --bare` writes and the reference in the Claude Code
documentation ("Test plugins with evals"): grader fields as the reference lists them, read in the poiesis-insight
session's copy of the page on 2026-11-22.
