# Poiesis UX rules

How an app behaves for the person using it: what they see happen, what they can do, what it costs them. How it
looks is the `ui` skill (plugin poiesis-ui) (its rules T, H, S, C, A, P); the letters here don't repeat those, so an id names one rule
across the toolkit. Used for building (skill `ux`) and testing (agent `ux-tester`). **must** = a defect when
broken; **should** = a default you may break on purpose, with the reason under "Decisions" in
`.poiesis-design/ux.md`. A project decision (`ux.md`, `design.md`, `CLAUDE.md`) overrides a rule.

Sources, cited by key: **N** = Nielsen, 10 usability heuristics (1994, rev. 2020; number = heuristic).
**W** = WCAG 2.2 (number = success criterion). **I** = ISO 9241-110:2020, interaction principles.

## Feedback (F)

**F1 · must · Every action answers.** A click, key or submit shows a result or a busy state within about 1 s
(N1, I "self-descriptiveness").
**F2 · must · Every async view has all its states:** loading, empty (says why and what to do), error, partial,
done. None is a blank area or a stuck spinner (N1).
**F3 · must · Status is announced.** Changes that matter and are not focused (saved, failed, new result) reach
screen readers through a live region or role=status (W 4.1.3).
**F4 · should · Long work shows progress** (how much, or what step), and keeps working when the view is hidden
or reopened (N1).

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

## Consistency (N)

**N1 · must · One name, one thing.** The same action, object or state has the same word, icon and place
everywhere; different things look different (N4).
**N2 · should · Platform conventions** (links look like links, Enter submits, standard icons mean their standard
thing) unless the project decides otherwise (N4).

## Errors (E)

**E1 · must · Prevent first.** Invalid input is limited or checked before it costs work: constraints, formats
shown, disabled actions say why (N5).
**E2 · must · Errors say what happened, why if known, and what to do next,** in plain words, next to the cause,
keeping what the person entered (N9, W 3.3.1, 3.3.3).
**E3 · should · Recover in place.** A failed step can be retried without starting over (N9).

## Recognition (R)

**R1 · must · Show, don't make them remember.** Current state, filters, selection and location are visible;
options are on screen, not only in a shortcut (N6).
**R2 · should · Choices persist.** View, filter and settings survive reload or reopening (N6, I
"user-engagement").
**R3 · should · Help where it is needed:** a short hint at the point of doubt; tooltips never hold the only copy
of needed information (N10).

## Effort (W)

**W1 · must · The main task works from the default state** with no setup the app could do itself (N7).
**W2 · should · Few steps.** Frequent tasks take the fewest actions; nothing asks twice for what the app knows
(N7, W 3.3.7).
**W3 · should · Each element earns its place.** Remove what does not help a task on this screen (N8).

## Access (I)

How it behaves for keyboard, screen-reader and zoom users. Contrast and color-alone are `ui` rules C3, C4.

**I1 · must · Keyboard path for every pointer action,** in a logical order (W 2.1.1, 2.4.3).
**I2 · must · Focus is visible and not hidden** behind sticky or overlay content (W 2.4.7, 2.4.11).
**I3 · must · Every control has a name** that says what it does, the visible label included (W 4.1.2, 2.5.3).
**I4 · must · Targets at least 24×24 CSS px** or spaced to the same (W 2.5.8).
**I5 · must · Motion is optional.** Non-essential animation runs only under `prefers-reduced-motion:
no-preference`; nothing flashes more than 3 times a second (W 2.3.1, 2.3.3).
**I6 · must · Works at 200% zoom and 320 px width** without loss or two-way scrolling (W 1.4.4, 1.4.10).

## Wording (L)

**L1 · must · The person's words,** not the system's: no internal names, codes or jargon in the UI (N2).
**L2 · must · Labels say the result** ("Save key", not "OK"); buttons are verbs, states are adjectives (N2).
**L3 · should · Short and in one voice:** sentence case, one term per idea, numbers with units.

## Testing (V)

**V1 · must · Test tasks, not screens.** Each task in `ux.md` is walked from its start state to its outcome; a
finding names the task, the step and the rule.
**V2 · must · Evidence for every finding:** the step seen in the running app (what was done, what happened) or a
`file:line`. Never invent a step, file or line; say what could not be checked.
**V3 · should · Test before release.** `ux-tester` runs after a change to a flow and before a release; unlike
P1 it has no gate, because a live test may need the user (sign-in, loading an extension).
