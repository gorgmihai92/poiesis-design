# Catalog

Each component: what it is for, its file, and the rules it is built to meet (poiesis-ui T, H, S, C, G, A;
poiesis-ux F, K, N, E, R, W, I, L, D). Every component also meets T1, S1, C1 and G1 (cells only) and I2 (focus).

| Component | For | File | Rules |
|---|---|---|---|
| Button | one action; `primary` once per view, `secondary`, `quiet` (text); `busy` shows at once and keeps focus; `reason` says why it is disabled | button.tsx | L2, F1, E1, I1, I4, H3 |
| IconButton | an action shown as an icon, always named; `pressed` for an on/off icon | button.tsx | I3, I4, R3, G3 |
| Switch | an on/off setting that applies at once, with its label | switch.tsx | I1, I3, C4, R2, I5 |
| Tabs | the main sections of a screen; bold width reserved, indicator always 2px | tabs.tsx | I1, K3, R1, R2 |
| Segmented | a small choice between views of the same content | tabs.tsx | I1, R1, G3 |
| Tip | a tooltip in the product's type, on hover and focus, Esc closes | tip.tsx | R3, I3, K1 |
| Disclosure | secondary content under its name; arrow down closed, up open | disclosure.tsx | R1, W3, I1, I5 |
| Field | labelled input with hint and error; error says what to do, keeps the input | field.tsx | I3, E1, E2, C4, G2 |
| Notice | a short status with its action and close, in one fixed slot | notice.tsx | F1, F3, K1, K3, K4 |
| Loading | what is pending and, after 3 s, for how long | loading.tsx | F2, F4, I5, T5 |
| StatusDot | a process running, paused, stopped or failed, by color and shape; `live` announces changes; keep 14px between dots | status.tsx | C4, I3, I4, I5, F3 |
| Meter | a level 1–3 as rising bars; tone repeats the count | meter.tsx | C4, C2, I3 |
| Progress | how much of a known amount is done, from real work | meter.tsx | F4, F5, I3 |
| Tile | one item on a grey step | layout.tsx | C5, S3, G2 |
| Section, Stack | titled groups; the parent owns the space between them | layout.tsx | H4, S2, S4 |
| Hint | secondary text, muted, not smaller | layout.tsx | H2 |
| Empty | an empty view that says why and what to do, with its action | layout.tsx | F2, L2 |

Text roles: buttons, tabs and triggers use the `control` role cells; everything else body, label, subheading or caption (H1).
Live regions (Loading, Notice, a `live` StatusDot) mount empty and fill a moment later, so screen readers announce them (F3).

Shared: `base.css` (focus ring, selected cells), `cx.ts` (class names). Packages: `react`, and `radix-ui` for
Tabs, Segmented, Tip and Disclosure.
