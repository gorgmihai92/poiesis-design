# Gate example: three conclusions

Test input for the challenge stamp, and for the entry gate of poiesis-frontier: one conclusion kept, one dropped
and one never challenged. The first two and their verdicts are T1 and T5 of the lab's recorded run of 2026-11-17
(`fixtures/challenge-verdicts.json` in the Poiesis Lab notebook). The third came out of a second pass on the same
day, after the challenger had answered (`fixtures/trend-scan/challenge.published.json`, row `c1`), and nothing
records a challenge of it. Only the lines the stamp reads are kept: the sentence, the id and the verdict shown.

## Kept

### Machines, AI and robots is the fastest-growing major area of moral research. Its share of the universe went from 0.4% (2015) to 6.9% (2025), growing about 20% a year in 2020–25, down from about 46% in 2015–20.

- **Id:** IN-001
- **Challenge:** kept · with caveats: broad terms, "fastest-growing" among 16 preset topics, growth decelerating

## Dropped

### Politics and polarization is a "neglected" topic. The rule fixed in advance: impact at least 1.2 × average, momentum below the median, size below the median. Its impact is 1.44, from 5 of 88 works cited 50 or more times.

- **Id:** IN-002
- **Challenge:** dropped · 5 of 88 against an expected 3.5 is within chance; one fewer highly cited paper fails the rule

## Not challenged

### No single source is behind the 2025 rise of synthetic biology: its share rose within China, the US, India, South Korea and Japan, beyond each country's overall growth.

- **Id:** IN-003
- **Challenge:** not challenged · found in a second pass, after the challenger had answered
