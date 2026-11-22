# Rules for showing data in a report

Used by the `report` skill. Ids start with **U**, a letter no other Poiesis design rule uses. **must** is a defect
when broken; **should** is a default that may be broken on purpose, with the reason written in the report's text.

These rules are about pages that show findings to people. They do not apply in `design/lab/`, where nothing is held
to a rule.

How much of each source was read is in its note in `research/notes/` of poiesis-design. **None of these rules, and
none of the four patterns they use, has been tested with readers.** The evidence is a review of mostly small
laboratory studies with simple displays (Franconeri et al. 2021), not a test of these pages.

## Where things come from

**U1 · must · A verdict is shown from its record.** A conclusion's verdict (kept, weakened, dropped) is read from
its challenge record by the script that checked the record, and written on the page by that script. It is never
typed into the page, the report's file or a data file the page reads. A conclusion with no record, a record that
was altered, or a sentence that changed since its challenge shows as **not challenged**, with the reason. When a
file shows another label than the record, the record is shown and the page says that the two disagree.
*Rests on:* observation, `poiesis-lab-2026-recorded-pages.md` (a label retyped by hand changed from weakened to
kept); the entry gate of the lab's `PROTOCOL.md`; the record format of poiesis-insight 2.0.0.

**U10 · must · Every number says where it comes from.** A report's own file holds references and prose. Numbers
are read from the files they live in when the page is built, and the page lists those files with a hash of each.
A count shown on the page (how many studies, how many sources) is computed from the list it counts.
*Rests on:* the lab's rule "nothing invented"; observation, `poiesis-lab-2026-recorded-pages.md` (a verdict
typed again by hand changed on the way, the case under U1). Computing counts from their lists is a product
decision (P) that follows from both.

**U11 · must · The page ends with "Not checked".** *Rests on:* the lab's rule 5.

## How numbers are drawn

**U2 · should · Numbers people compare are positions on one shared scale.** Lines over time, dots on two scales,
bars that start on one baseline. Not areas, angles or shades for a number that matters.
*Rests on:* Franconeri et al. 2021, p. 5–7 (full text): position is read most precisely for the ratio of two
values; the ranking comes from Cleveland & McGill 1984 (abstract only here) and later work. The same review warns
the ranking is for one task and does not always hold for others (p. 11–12).

**U3 · should · An axis starts at zero; when it does not, the page says so in words.** A scale cut short makes a
difference look larger even when the cut is marked on the axis. Where the useful range is far from zero, or the
measure has no meaningful zero, start elsewhere and write it next to the figure (the series pattern writes "the
scale starts at …" when `min` is set).
*Rests on:* Franconeri et al. 2021, p. 7–8.

**U4 · should · Each line or dot is named where it is.** No legend to look up. A key is kept only where a mark
stands for a category, as the verdict marks of the dot map do, and then it repeats the marks themselves.
*Rests on:* Franconeri et al. 2021, p. 20–21 (direct labels were read faster and more accurately than a legend in
the one study cited).

**U5 · should · One comparison for each figure, said in words next to it; one series in ink.** People compare a
handful of values a second; grouping, a highlight and words placed next to the data lead them to the comparison
meant. The person who made a figure overrates how well others see what they see.
*Rests on:* Franconeri et al. 2021, p. 14–19.

**U6 · must · Never color alone.** A verdict, a status or a group shown by color also has a word or a shape: the
verdict label has a mark of its own shape, the dot map uses the same marks.
*Rests on:* poiesis-ui C4; Franconeri et al. 2021, p. 11 (color-vision impairments, about 4% of people) and p. 13.

**U7 · must · What is incomplete or uncertain is marked on the data and said in words.** A partial year is dashed
and named; a missing value is a gap, never a zero; a value that could not be read is counted and said. No error
bars for readers who are not specialists: they are read as the range of the data. A confidence a challenger gave
is shown in its words, never turned into a number, a bar or a shade.
*Rests on:* observation (the recorded trend scan marks its partial year); Franconeri et al. 2021, p. 31–33;
Hullman et al. 2019, p. 8–9 (part of the text: stated confidence is not statistical confidence; text is a valid
way to state uncertainty).

**U8 · should · A table to look a value up, a figure to see a pattern; the table is always there.** Every figure
holds its numbers as a table on the page, for the keyboard, for a screen reader and for anyone who needs the
value.
*Rests on:* Franconeri et al. 2021, p. 4 and 21.

**U9 · should · Familiar forms and directions.** More is up and to the right. A form the reader may not know (a dot
map on a logarithmic scale) gets one sentence that says how to read it.
*Rests on:* Franconeri et al. 2021, p. 23–27 (37% of adults in one survey misread a scatterplot, p. 25).

**U12 · should · Nothing moves by itself.** No animation carries a number.
*Rests on:* Franconeri et al. 2021, p. 21 (little evidence that animation helps understanding, apart from showing
draws of a distribution).

## What these rules do not say

- Which display is best for a given reader. The review says results across tasks are too complex to generalize
  (p. 12).
- That a page built by these rules is read correctly. Only a test with readers can show that, and none was run.
