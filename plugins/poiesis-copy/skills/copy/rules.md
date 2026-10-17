# Poiesis copy rules

What the words say, in an app, on a page, in an ad or an email, in English and Romanian. Where a message appears
and when is the `ux` skill (plugin poiesis-ux): F2 says an empty state exists, M2 here says what it says. How text
looks is the `ui` skill (plugin poiesis-ui). The letters here don't repeat those of `ui` (T, H, S, C, A, P) or `ux`
(F, K, N, E, R, W, I, D, V), so an id names one rule across the toolkit. Used for writing (skill `copy`) and
reviewing (agent `copy-reviewer`). **must** = a defect when broken; **should** = a default you may break on
purpose, with the reason under "Decisions" in `.poiesis-design/voice.md`. A project decision (`voice.md`,
`design.md`, `CLAUDE.md`) overrides a rule, except the Claims rules (Q), which are about honesty.

Sources, cited by key: **N** = Nielsen, 10 usability heuristics (number = heuristic). **W** = WCAG 2.2 (number =
success criterion). **G** = GOV.UK style guide. **DOOM** = Dicționarul ortografic, ortoepic și morfologic al
limbii române, 3rd ed. (Academia Română, 2021). **EU** = Unfair Commercial Practices Directive 2005/29/EC as
amended by 2019/2161, and the Digital Services Act 2022/2065 art. 25. Rules from studies name the study; one note
per study in the repository's `research/notes`. The evidence on writing is thinner than its reputation: few
controlled studies, most in English, none in Romanian. Rules rest on a study where one exists, otherwise on a
standard or a widely shared convention, and say which. No rule claims a number the evidence does not give.
Inspiration (`inspiration/`) is good practice taken from copy the user admires; they inform writing and never
become rules.

## Language (L)

**L1 · must · The reader's words,** not the system's or the team's: no internal names, codes, jargon or
abbreviations the reader didn't bring with them (N2). Experts get their own field's words, not the team's.
**L2 · must · The point first.** Each heading, sentence, label and message opens with what the reader needs; the
reason, detail or context follows. People scan headings and the start of lines first and read fully only when
they are committed (NN/g eye-tracking: Nielsen 2006; Pernice 2019).
**L3 · must · The plain word when it says the same thing:** "use" not "utilize", "help" not "facilitate",
"pornește" not "inițializează". Plain versions are understood and recalled better, by experts too (Martínez et al.
2023, lawyers reading contracts; Masson & Waldron 1994).
**L4 · should · Short, but connected.** Sentences mostly under about 20 words, one idea each, active voice. Keep
the joints ("because", "so", "but"; "pentru că", "deci", "dar"): cutting them makes text harder for weaker
readers (McNamara et al. 1996). Concise, scannable, objective web text tested far more usable than promotional
text (Morkes & Nielsen 1997, n = 51).
**L5 · must · One term per idea,** everywhere: the same object, action or state has the same word in the UI, the
docs, the emails and the marketing; the glossary is in `voice.md` (pairs with `ux` N1).
**L6 · should · Numbers as digits, with units,** and no more precision than the data have ("about 2 million",
not "2,014,337" for an estimate).

## Buttons and links (B)

**B1 · must · A label says what happens:** buttons are verbs with their object ("Save draft", "Șterge proiectul"),
not "OK", "Yes", "Submit"; states are adjectives ("Saved"). Where a dialog asks a question, the buttons answer it
in words, not "Yes/No" (N2; W 2.5.3).
**B2 · must · Link text names the destination** and makes sense read alone, as screen-reader users read it: no
bare "click here", "read more", "aici" (W 2.4.4; WebAIM screen reader survey #10). "Learn more about pricing" is
fine.
**B3 · must · Destructive and outward actions name the object and the consequence** in the confirmation and on
the button: "Delete 3 files", not "Confirm" (pairs with `ux` K2).
**B4 · should · Calls to action are specific and low-commitment:** name what the person gets or does next ("Start
free trial", "See the plans") rather than a generic "Get started". No controlled study shows this lifts
conversion; it rests on B1 and on clarity, so don't promise a lift.
**B5 · must · The secondary option is neutral.** "No thanks", "Not now", "Skip"; never a line that shames or
mocks the choice ("No, I don't like saving money") (EU; Luguri & Strahilevitz 2021).

## Messages (M)

**M1 · must · An error says what happened, why if known, and what to do next,** in the reader's words, without
blame ("This card was declined. Try another card or contact your bank.", not "Invalid input", not "You entered…")
(N9; W 3.3.1, 3.3.3). No error codes alone; a code goes after the words, for support.
**M2 · must · An empty state says why it's empty and the next step,** with the action as a button (pairs with
`ux` F2). A first-use empty state invites; a no-results state offers a way out (clear filters, check spelling).
**M3 · should · Success confirms the result, not the click:** "Invoice sent to ana@firma.ro", not "Success!".
**M4 · should · Waiting copy says what is happening** when the wait is long ("Importing 120 of 400 contacts"); no
jokes or filler that pretend to be progress (pairs with `ux` F5).
**M5 · should · Humour stays out of failure, money, loss and privacy.** Play is for moments where nothing is at
stake.

## Order (O)

How a page, ad or email is put together. Landing page evidence is mostly practitioner work; these are **should**.

**O1 · should · Headings carry the page.** Read alone, in order, the headings state the offer and the case for
it: statements, not labels ("Your files, findable in seconds", not "Search"). The first screen holds most of the
attention (Pernice 2018: 57% of viewing time above the fold, 74% in the first two screens).
**O2 · should · The first screen says what it is, who it's for, and what to do,** in a heading, one supporting
line and one main action. A metaphor or claim may lead only if the next line says plainly what the product is.
**O3 · should · Claim, show, reassure, ask.** Each section makes one point, shows it (a screenshot, an example, a
real number), answers the doubt it raises (price, effort, lock-in, privacy) and offers the next step. One main
action per page, repeated, not competing ones.
**O4 · should · Don't cut what motivated readers need.** People who arrive with intent (a search, a referral, a
paid click) read further (Pernice 2019); answers to price, terms and limits stay on the page, in full sentences
when a "Yes" would hide a condition.
**O5 · must · Fits the format's limits** (characters per ad field, subject line length, button width in both
languages); see `patterns.md`.

## Claims (Q)

Honest persuasion. Manipulative wording measurably changes decisions — in one experiment acceptance of a dubious
plan rose from 11% to 26% (mild) and 42% (aggressive) (Luguri & Strahilevitz 2021) — so these are **must**
whatever it costs a conversion rate, and no project decision overrides them.

**Q1 · must · Every claim can be checked:** numbers have a source and a date, superlatives ("the fastest", "the
only") are provable or gone, "free" means free (a trial says what happens when it ends, next to the button).
Evidence that concreteness alone persuades is mixed (Hansen & Wänke 2010, not replicated); the reason is
honesty, not lift.
**Q2 · must · Proof is real:** testimonials, reviews, logos and user counts are genuine, attributable and used
with permission; never invented, generated, paid without saying so or edited to change their meaning (EU
2019/2161, fake reviews; Babić Rosario et al. 2016 meta-analysis: genuine reviews help sales, modestly).
**Q3 · must · No fake urgency or scarcity:** a deadline, stock count or "X people viewing" only when true and
current (EU; Mathur et al. 2019; deceptive timers are judged manipulative, Tiemessen et al. 2023).
**Q4 · must · Costs and conditions where the decision is made:** total price, renewal, cancellation terms; not
in a footnote or a later step (EU; `ux` D1).
**Q5 · must · Comparisons are fair:** like with like, the basis and the date named, and the other side's
advantages not hidden when the reader would weigh them (EU 2006/114/EC, comparative advertising).
**Q6 · should · Benefit first, then how it works.** Say what the reader gets, then enough of the mechanism to be
believed; "magically" or "seamlessly" explains nothing.

## Voice (Y)

**Y1 · must · One voice per product, written down** in `.poiesis-design/voice.md`: who the reader is, three or
four traits with "this, not that", the glossary (L5), the words to avoid, the form of address.
**Y2 · should · Voice stays, tone moves:** the same character, warmer in onboarding, plainer in errors, calmer in
anything about money or data (M5).
**Y3 · should · Speak to the reader as "you"**, the product as "we" only where a person stands behind it
(promises, apologies, support).
**Y4 · should · Sentence case** for headings, buttons, menus and titles in English, for consistency with most
platforms (G; no study shows it reads faster than Title Case; don't claim it does). **No ALL CAPS for more than a
few words:** running text in capitals reads about 10–14% slower (Tinker 1963); a short label set in capitals by
the `ui` style is a styling choice, written in sentence case in the source.

## Languages (X)

**X1 · must · Each language is written, not translated word for word.** Write the Romanian from the meaning;
keep the same terms (L5) and the same promises (Q), not the same sentences.
**X2 · must · Romanian diacritics, the right ones:** ă, â, î, ș, ț, with ș and ț written with the comma below
(U+0219, U+021B), not the cedilla (ş, ţ); î at the start and end of a word, â inside it (DOOM). No text without
diacritics, including in emails and ads.
**X3 · must · Romanian capitalisation follows DOOM:** sentence case in titles and buttons; days, months,
nationalities and languages lowercase ("luni", "română").
**X4 · must · One form of address per product,** set in `voice.md`: "tu" (most consumer products) or
"dumneavoastră" (banking, health, public services, older readers), with the matching verb forms throughout
("Salvează" / "Salvați"). Never mixed on one screen.
**X5 · must · Romanian plurals and numbers:** "1 fișier", "2 fișiere", "20 de fișiere" ("de" from 20 on, except when the
last two digits are 01–19: "100 de fișiere", "101 fișiere", "120 de fișiere"); use plural rules (ICU one, few,
other), not string concatenation. Numbers "1.234,56", dates "17.10.2026", currency after the number ("49 lei"),
quotes „…”.
**X6 · should · Leave room:** Romanian runs longer than English; layouts and character limits are checked in the
longer language (O5). Prefer the established Romanian word ("descarcă", "setări"), keep the loan when it is what
people say ("email", "link").

## Review (Z)

**Z1 · must · Evidence for every finding:** the text quoted and its `file:line` or URL, with the rule id. Never
invent a string, file or line; say what could not be checked.
**Z2 · should · Review before release,** next to `ui-auditor` and `ux-tester`: the reviewer reads every
user-facing string that changed, in every language.
