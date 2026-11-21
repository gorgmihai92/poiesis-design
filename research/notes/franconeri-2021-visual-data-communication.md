# The Science of Visual Data Communication: What Works (Franconeri, Padilla, Shah, Zacks & Hullman, 2021)

- **Source:** Psychological Science in the Public Interest 22(3): 110–161 · https://doi.org/10.1177/15291006211051956
  (pages = PDF pages of the publisher's version; journal page = PDF page + 109)
- **File:** none kept. Read from a copy of the publisher's PDF hosted as course material on data.europa.eu.
- **Licence:** © The Authors 2021, published by SAGE: not stored.
- **Evidence:** review · a narrative review of studies from perception, graph comprehension, information visualization,
  statistical reasoning and health-risk communication, with guidance from practitioners where no study exists (p. 2).
  Not a systematic review: it states no search or inclusion method.
- **Read:** full text of the body, p. 1–41, on 2026-11-22, as text extracted from the PDF. Not read: the reference
  list (p. 41–52). Not seen: the figures themselves; only their captions and the words inside them came through.

## What it says

### Which marks carry a number most precisely
- Position on a common scale lets people state the ratio between two values most precisely; length is next, then
  area and angle, and color intensity is the least precise. The ranking comes from Cleveland & McGill (1984, 1985)
  and Heer & Bostock (2010) (p. 5).
- Segments of a stacked bar that do not share a baseline are judged by length alone, so they are harder to compare
  than bars that start on one line (p. 7).
- The ranking is for one task, the ratio between two values. It does not always hold for others: for the average
  of many values intensity can do better than position, and results across tasks are "currently too complex to
  generalize" (p. 11–12).
- Scatterplots give more accurate judgments of correlation than pairs of bar charts (p. 12). Putting two measures in
  one scatterplot makes each measure's own distribution harder to see (p. 9).

### Ways a display misleads
- An axis that does not start at zero makes people overestimate a difference. In the studies cited the effect
  stayed when the break was marked on the axis and when people first typed the two values (p. 7).
- A zero baseline is not always the honest choice: when small differences matter, or the measure has no meaningful
  zero, the practically relevant range shows what a zero-based axis hides (p. 7–8).
- In a line chart the eye judges the nearest distance between two lines, not the vertical one, so the gap between
  two steep lines looks smaller than it is. Plotting the difference as its own line avoids it (p. 9).
- Hue boundaries exaggerate differences that happen to straddle them (p. 11).
- A bar reads as a container: values inside it are judged more likely than values the same distance above it
  (p. 32).

### Color, groups and access
- Color-vision impairments are estimated at 4% of people. The simplest remedy is never to use hue as the only
  channel; a second channel such as shape may carry the same variable (p. 11).
- For telling groups apart color works better than shape (p. 12). Coding one variable by both color and shape does
  not help most viewers, and the authors advise it only for access (p. 13).
- A color that fits what it stands for is read more easily (p. 12).

### What people can compare
- Broad statistics (the mean, the extremes, an outlier) are seen within a fraction of a second; comparisons between
  particular values are made one at a time, a handful per second (p. 14). Twelve bars hold 66 pairwise comparisons
  (p. 14).
- What gets compared follows grouping, in this order of strength: connecting lines, nearness, the same color, the
  same shape (p. 15). In a line chart the variable joined by a line is the one people reason about (p. 15).
- A highlight on one group, and words placed next to what they describe, lead people to the intended comparison;
  this helps readers with little knowledge of the subject most (p. 17). A title shapes what people take a chart to
  say and what they recall (p. 19).
- The person who made a chart overestimates how well others see what they see in it (p. 18–19).
- Showing data as a few aggregated groups led to more unwarranted causal readings than showing every value (p. 20).

### Working memory
- A legend makes people look back and forth; direct labels were read faster and more accurately in the one study
  cited (Lohse 1993). The authors' advice is direct labels whenever possible, with a legend where it works as an
  index (p. 20–21).
- There is little evidence that animation helps people understand a display, apart from animating draws from a
  distribution to show uncertainty (p. 21).
- Removing "clutter" has mixed evidence for preference and little for performance (p. 22–23).
- Older adults chose better between health plans from a table that also coded the categories visually than from a
  table of text and numbers (p. 21).

### Familiar forms
- A form the reader has not learned has to be explained: 37% of adults in the United States misread a scatterplot
  in one survey (p. 25).
- People expect more to be up, and time and larger values to run to the right; an inverted axis was misread
  (p. 25–27).
- Bars invite a comparison between separate things, lines a trend; what matters is the message intended, not the
  type of the data (p. 28).
- Few students noticed a text that contradicted the chart beside it: 4% in one study of 673 (p. 28).

### Uncertainty
- For lay readers uncertainty is often left out. When shown as error bars it is misread as the range of the data,
  even with a key saying otherwise (p. 31–32).
- Showing the distribution, or a set of discrete possible outcomes, led to better decisions than intervals in the
  studies cited (p. 33, 36–37). Probabilities are better understood as frequencies (p. 34).

### Its own summary and limits
- The summary of guidelines is on p. 41: zero-based axes, area and not diameter, direct labels, annotation and
  highlight for the one comparison that matters, familiar formats, no error bars for a lay audience.
- The review is about communicating with non-specialists, not about tools for analysts (p. 3). Many of its points
  rest on one or a few laboratory studies with simple displays, and it says where evidence is mixed or missing.

## What it means for the plugin
- Rules U2 to U9 in `plugins/poiesis-studio/skills/report/rules.md` rest on the pages above. Each is a **should**:
  the evidence is a review of mostly small laboratory studies, not a test of this viewer.
- The series pattern draws values as positions on one shared scale, starts its axis at zero unless told otherwise,
  names each line at its end and keeps one series in ink. The dot map explains in words how to read it.
- No error bars are drawn. What is uncertain or incomplete is marked on the data and said in words (U7).
- Not established by this source: that the four patterns, as built, are read correctly. Nobody has tested them.
