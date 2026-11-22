# Generators

Ways to make the sketches of one exploration differ from each other. Use a different one for each sketch where
that is possible, and write its name in the sketch's `<meta name="sketch:generator">` and in `notes.md`.

**Every generator here is a product decision (P) and is untested.** None comes from a source that was read. They
are prompts for making variants differ, not methods with evidence, and nothing says which gives better sketches.
A generator that turns out useless is worth a line in `notes.md`.

Not a generator: taste. "A cleaner version" and "a more modern version" produce the same sketch twice.

## 1. Push one atom to its end

The theme is a few values (atoms) from which everything else follows. Take one and set it far outside its usual
range in this sketch, on the sketch's root with `data-atoms`, then design for what that does.

| Atom | Usual | Try |
|---|---|---|
| `--atom-density` | 1 | 0.5, or 2 |
| `--atom-ratio` | 1.2 | 1, so every text is one size; or 2 |
| `--atom-text-ui` | 0.75rem | 2rem: the controls are the page |
| `--atom-section` | 16rem | 0: nothing is apart; or 100svh: one thing a screen |
| `--atom-radius` | 0 | 2rem |
| `--atom-select-ink` | 1 | 0 |
| `--atom-motion` | 1 | 0: nothing moves; or 6: everything takes a second |
| `--atom-ink`, `--atom-paper` | black, white | one of the role colors as the paper |

## 2. Remove the part that is taken for granted

Name the element everyone would start from (the button, the dialog, the list, the form, the page itself) and make
the interaction work without it.

## 3. Borrow a form from somewhere else

Do the same job the way another kind of thing does it: a paper form, a light switch, a conversation, a map, a
timeline, a ledger, a board game, a receipt.

## 4. Change who, or where

The same interaction for someone with one hand free, in a glance of two seconds, with no screen to look at,
with a large screen across the room, or for two people at once.

## 5. Move the moment

Put the interaction earlier or later than it usually happens: before the person asks, long after the act, spread
over a day, or only when something goes wrong.

## 6. Turn one of the suite's own assumptions upside down

One assumption per sketch, taken from the list below and reversed on purpose. This list is carried here so that
the rules files of the design plugins are never opened during an exploration: each line is a thing those rules
assume, in a few words, with the rule's id only as a pointer. Nothing is checked against them.

No documented method of this kind was found when the lab's plan was written, so this is the lab's own, and it is
untested like the rest.

| The suite assumes | Rule | Reversed |
|---|---|---|
| all text in a component is one size | ui T6 | size carries the meaning |
| there is one main action in a view | ui H3 | every action is equal, or there is none |
| what is selected is inverted | ui G3 | what is selected disappears, or moves |
| color is never the only signal | ui C4 | color is the only signal: what that makes possible, and for whom it fails |
| space, not lines, sets things apart | ui C5 | nothing is apart: one continuous surface |
| an action answers within a second | ux F1 | the wait is the interaction |
| a destructive action is confirmed, or can be undone | ux K2, K6 | the thing is never gone, or is gone at once and says so differently |
| items stay where people left them | ux K7 | the order is the message |
| an error says what happened, next to its cause | ux E2 | there is no error: nothing wrong can be entered |
| the main task works straight away | ux W1 | the first use is slow on purpose |
| defaults serve the person | ux D3 | there is no default: nothing happens until a choice is made |
| a button says what it will do | copy B1 | there are no words |
| the point comes first | copy L2 | the reader builds the point |

The honesty rules of the suite (no deceptive patterns, no pre-selected cost, no false claim) are not on this
list. A sketch that deceives the person using it is not an exploration of design.
