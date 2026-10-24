# Poiesis UX rules

How an app behaves for the person using it: what they see happen, what they can do, what it costs them. How it
looks is the `ui` skill (plugin poiesis-ui) (its rules T, H, S, C, A, P); what the words say is the `copy` skill
(plugin poiesis-copy) (its rules L, B, M, O, Q, Y, X, Z): here a message must exist and appear at the right time,
there it says the right thing. The letters don't repeat, so an id names one rule across the toolkit. Used for building (skill `ux`) and testing (agent `ux-tester`). **must** = a defect when
broken; **should** = a default you may break on purpose, with the reason under "Decisions" in
`.poiesis-design/ux.md`. A project decision (`ux.md`, `design.md`, `CLAUDE.md`) overrides a rule.

Sources, cited by key: **N** = Nielsen, 10 usability heuristics (1994, rev. 2020; number = heuristic).
**W** = WCAG 2.2 (number = success criterion). **I** = ISO 9241-110:2020, interaction principles. Rules from
studies name the study (author year); one note per study in the repository's `research/notes`. Most of these
studies are desktop lab work with small samples: they are **should** unless the rule is a matter of honesty.

## Feedback (F)

**F1 · must · Every action answers.** A click, key or submit shows a result or a busy state within about 1 s
(N1, I "self-descriptiveness").
**F2 · must · Every async view has all its states:** loading, empty (says why and what to do), error, partial,
done. None is a blank area or a stuck spinner (N1).
**F3 · must · Status is announced.** Changes that matter and are not focused (saved, failed, new result) reach
screen readers through a live region or role=status (W 4.1.3).
**F4 · should · Long work shows progress** (how much, or what step), and keeps working when the view is hidden
or reopened (N1; people prefer progress indicators, Myers 1985).
**F5 · should · Progress is honest and ends cleanly.** Progress reflects real work, never invented movement. When
the order of stages is free, run the slow or unpredictable ones first, so the bar does not stall near the end
(Harrison et al. 2007, waits of about 5 s).
**F6 · should · Show where things went.** When a person's action changes a data display in place (sort, filter,
chart type), a simple transition (one or two stages) shows where items moved; always within I5 (Heer & Robertson
2007).
**F7 · should · Reveals unlock in order.** In a sequence the reader opens one part at a time (questions,
steps, a worked example), the parts not reached yet are visibly locked and what is done is shown by a line or a
count (`ui` H5). The next action sits on the same row as the steps and keeps its place and width; on the last
step it becomes "start again". In a narrow container it shrinks to an icon with a name (I3).
**F8 · should · Small tasks show progress too:** a box per item, or a path that fills in; the last state names
the result in the product's own words, and each change is announced (F3).
**F9 · should · A person's own change shows at once.** Marking, moving or editing something they own changes on
screen in the same frame, before the server answers; if the server refuses, it goes back with the reason (E2), and
a routine change offers undo (K6).

## Control (K)

**K1 · must · Exits are clear.** Every dialog, menu, overlay or mode closes with Esc and a visible control;
focus returns to what opened it (N3, W 2.1.2).
**K2 · must · Destructive or outward actions** (delete, overwrite, send, publish) are undoable or confirmed, and
the confirmation names what will happen (N3, N5).
**K3 · must · Nothing moves under the pointer.** Content does not shift on load, hover, state change or tab
switch unless the person caused it (W 3.2.1, 3.2.2).
**K4 · must · No time traps.** Anything that disappears or closes on a timer can be paused, extended or reopened
(W 2.2.1).
**K5 · should · The app does not take over.** Auto-scrolling, auto-play or auto-focus stops when the person acts
elsewhere and offers a way back (I "controllability").
**K6 · should · Undo for routine actions, confirmation for rare ones.** Repeated confirmations lose their effect
(Bravo-Lillo et al. 2013; Vance et al. 2018), so frequent, reversible actions act at once and offer undo; keep
confirmation for rare, irreversible or outward actions, naming the object and the consequence (refines K2).
**K7 · should · Lists stay where people left them.** Do not reorder existing items on their own by use;
usage-based suggestions go in a separate, labelled area (Recent, Suggested), and people can pin or reorder
(Findlater & McGrenere 2004; Gajos et al. 2008).
**K8 · should · Non-urgent notifications wait for a break.** Those created while the person is typing or mid-step
are held until the step ends (save, submit, page change), with a short maximum delay; urgent or time-critical ones
show at once (Iqbal & Bailey 2008; Okoshi et al. 2018; interruptions cost stress even when work quality holds,
Mark et al. 2008).
**K9 · should · What the person changes keeps its place.** A reveal, a toggle or a next step the person
causes (allowed by K3) still does not resize or move what is around it: the element reserves room for its largest
state (states stacked in one cell, or a minimum height), so the control they used stays under the pointer.
**K10 · must · Esc works from the inside out.** Each Esc closes the innermost thing open (a list under a field,
then what the field holds, then the dialog or mode) and keeps the key for itself, so one press never closes two
things; with nothing open inside, Esc goes on to what holds it (refines K1).
**K11 · should · Suggestions open in the page, under their field.** A list of suggestions or quick choices opens
under what it serves and pushes what follows down instead of covering it (the person still sees the rest of the
form and its own words); a list that must float, for lack of room, opens on the side with room.
**K12 · should · One panel open at a time** among panels of the same kind on a screen (a reply box, a list of
alternatives, a detail): opening one closes the other, so the screen keeps one focus.
**K13 · should · A page of sections leaves no blank screen.** When each section is followed by room so the next
arrives under its name, and the scroll comes to rest with more than half the screen empty after a section's
content, the page glides on to the next section, or back to the end of this one when scrolling up. One scroll
moves one section (the rest of a wheel's or trackpad's momentum is held back), nothing moves while a finger is on
the screen, a short section resting in its place stays, and under reduced motion it jumps (refines K5).

## Consistency (N)

**N1 · must · One name, one thing.** The same action, object or state has the same word, icon and place
everywhere; different things look different (N4).
**N2 · should · Platform conventions** (links look like links, Enter submits, standard icons mean their standard
thing) unless the project decides otherwise (N4).

## Errors (E)

**E1 · must · Prevent first.** Invalid input is limited before it costs work: constraints, required formats
stated in advance, required and optional fields marked, disabled actions say why (N5; Seckler et al. 2014).
**E2 · must · Errors say what happened, why if known, and what to do next,** next to the cause, keeping what
the person entered (N9, W 3.3.1, 3.3.3); the wording is `copy` M1.
**E3 · should · Recover in place.** A failed step can be retried without starting over (N9).
**E4 · should · Do not interrupt typing with errors.** In multi-field forms, show all errors at once when the
person submits, each next to its field, input kept. A field may be checked when the person leaves it only if the
check cannot fire on a partly typed value (Bargas-Avila et al. 2007; Seckler et al. 2012; Seckler et al. 2014).
**E5 · should · Forms finish cleanly.** Only necessary fields; no reset button; submit disabled after the click,
with a busy state; a confirmation of what was sent (expert-rated guidelines, tested as a set, Seckler et al. 2014).

## Recognition (R)

**R1 · must · Show, don't make them remember.** Current state, filters, selection and location are visible;
options are on screen, not only in a shortcut (N6).
**R2 · should · Choices persist.** View, filter and settings survive reload or reopening (N6, I
"user-engagement").
**R3 · should · Help where it is needed:** a short hint at the point of doubt; tooltips never hold the only copy
of needed information (N10).
**R4 · should · A long page keeps its section names in view.** On a page of sections, the names of sections passed
stay stacked at the top and those to come at the bottom, the current one between them in ink (`ui` H5), at every
width; a name takes you to its section, and the address follows the current one.
**R5 · should · A page opened on a place shows once it is there.** A link or a reload that names a section or item
keeps the page unseen until it stands there, then shows it in one step, never later than 1 s, so it doesn't jump
from the top (K3).

## Effort (W)

**W1 · must · The main task works from the default state** with no setup the app could do itself (N7).
**W2 · should · Few steps.** Frequent tasks take the fewest actions; nothing asks twice for what the app knows
(N7, W 3.3.7).
**W3 · should · Each element earns its place.** Remove what does not help a task on this screen (N8). Fewer
options is not a universal rule: when choosing among comparable alternatives, offer a sensible default and a way
to compare (Chernev et al. 2015).
**W4 · should · Short lists: a few, then a count.** A list to choose from as you type or tap (suggestions,
search results, quick dates) shows five options at most, the same number across the product, and counts the rest on
a muted line ("+3 more"); typing narrows it. A product decision rather than a finding: W3 still holds where people
compare alternatives.
**W5 · should · Nothing is highlighted until the person points.** A list opens with no option highlighted; an
arrow key or the pointer moving over an option highlights one, so Enter never takes an option the person didn't
choose and a list opening under a resting pointer doesn't light up.
**W6 · should · Leaving a line saves it.** Editing in place saves when the person clicks or tabs away; Enter saves
and, in a list, adds the next; Esc on an emptied line lets it go. Its buttons don't take focus from the field, and
focus moving inside the line, or the window losing focus, doesn't count as leaving.

## Access (I)

How it behaves for keyboard, screen-reader and zoom users. Contrast and color-alone are `ui` rules C3, C4.

**I1 · must · Keyboard path for every pointer action,** in a logical order (W 2.1.1, 2.4.3).
**I2 · must · Focus is visible and not hidden** behind sticky or overlay content (W 2.4.7, 2.4.11).
**I3 · must · Every control has a name** that says what it does, the visible label included (W 4.1.2, 2.5.3).
**I4 · must · Targets at least 24×24 CSS px** or spaced to the same (W 2.5.8).
**I5 · must · Motion is optional.** Non-essential animation runs only under `prefers-reduced-motion:
no-preference`; nothing flashes more than 3 times a second (W 2.3.1, 2.3.3).
**I6 · must · Works at 200% zoom and 320 px width** without loss or two-way scrolling (W 1.4.4, 1.4.10).
**I7 · must · What shows on hover also shows on focus and on touch.** Actions that appear when the pointer rests
on a row appear when the row or its field takes keyboard focus, and on a tap on touch screens (W 1.4.13, 2.1.1).

## Honesty (D)

How the app treats the person's choices. Defaults decide for most people (Jachimowicz et al. 2019), and deceptive
patterns measurably change decisions (Luguri & Strahilevitz 2021).

**D1 · must · No deceptive patterns:** no fake urgency or scarcity (timers, stock or activity messages that are false
or unverifiable), confirmshaming, hidden costs revealed late, items added without consent, subscriptions disguised
as one-time or free, trick questions, cancelling harder than signing up, forced account creation to finish a task,
or repeating a request the person already declined (Mathur et al. 2019; Gray et al. 2018).
**D2 · must · Never pre-select a cost** (a paid add-on, a higher tier, a subscription) **or data sharing**
(Jachimowicz et al. 2019; Mathur et al. 2019).
**D3 · should · Defaults serve the person:** pre-select the option that serves them, or none when no option clearly
does (Johnson & Goldstein 2003; Jachimowicz et al. 2019).

## Testing (V)

**V1 · must · Test tasks, not screens.** Each task in `ux.md` is walked from its start state to its outcome; a
finding names the task, the step and the rule.
**V2 · must · Evidence for every finding:** the step seen in the running app (what was done, what happened) or a
`file:line`. Never invent a step, file or line; say what could not be checked.
**V3 · should · Test before release.** `ux-tester` runs after a change to a flow and before a release; unlike
P1 it has no gate, because a live test may need the user (sign-in, loading an extension).
**V4 · should · Stability is walked at 1440, 1024, 800, 390 and 320 px:** every interactive state stepped
through (each step, each reveal, the reset), measuring the size and place of the control used and of its
container (K3, K9).
