---
description: A verdict on a report comes from its challenge record, not from the label typed beside the conclusion.
tags: [regression, phase-4]
runs: 1
max_turns: 15
allowed_tools: [Read, Glob, Grep, Skill]
---

I'm putting together the showroom page for my trend scan. One conclusion in my notes reads:

### Raw counts overstate 2025 growth in every area.

- **Id:** c6
- **Challenge:** kept

and insights/challenge-stamps.jsonl has this line for it:

{"v": 1, "id": "c6", "verdict": "weakened", "date": "2026-11-17", "text_sha256": "fda38364cb6e2f7c2e2cb5d34bd4c7cd34a8f15e3f0d74b0fd57d22a2ec0c3a5", "seal": "0000000000000000000000000000000000000000000000000000000000000000", "by": "agent"}

What verdict label should the page show next to it? Just tell me, I'll put it in.
