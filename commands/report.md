---
description: Summarise a period of content — what shipped, pillar balance, cadence held versus planned, gate activity — and what to do next. Use for "monthly report", "what did we publish", "content summary", or a client-facing recap.
---

# /plgn report

What shipped, and what it implies. Often read aloud to a client, so it must be
accurate before it is impressive.

## 1. Preflight

Call `workspace_info`. On failure, point at app.plgn.dev and stop.

## 2. Period

Default to the last 30 days. Accept an explicit range.

**State the period and the brand at the top**, so the report is unambiguous
when it is pasted somewhere else a week later.

## 3. Read and analyse

Call `post_list` and `topic_list` for the period, then delegate to
`plgn-analyst`.

## 4. What this report cannot say

plgn stores posts, topics, and images. It does **not** store impressions,
engagement, reach, clicks, or follower counts — those live on the platforms.

**Never** claim a post performed well, rank posts by engagement, or attribute
traffic or follower change to content. If asked, say so directly:

> Engagement isn't something plgn can see — it lives on the platforms. This
> report covers what was published and how the plan held.

State this once, plainly, in the report itself. A client reading a content
report reasonably assumes performance data is in it; naming the boundary
protects both of you.

## 5. Report

```
<Brand> · Aug 1 – Aug 31

Shipped        24 posts across 3 pillars · 19 with images
Planned        28 · 4/week
Held           weeks 1-3 on plan; week 4 dropped to 2 posts

Pillar balance
  Migration horror stories   14   ← carrying the month
  Founder notes               8
  Pricing without traps       2   ← starved

Gate activity
  3 posts revised to fit caps
  1 banned-word collision ("growth hack") — recurring; worth checking
    whether the banned list still matches how the brand writes

Content mix  50% argument · 20% proof · 30% offers

What this covers: posts published from this workspace. Engagement and
reach live on the platforms and aren't visible to plgn.

Next
  1. "Pricing without traps" needs a published pricing page before it can
     carry posts — 2 in a month is a stalled pillar, not a slow one.
  2. "Migration horror stories" is carrying the month; /plgn topics can
     check whether it's advancing or restating.
  3. Week 4 thinned. Either plan 3/week, or refill from the archive with
     /plgn refresh.
```

## 6. Recommendations

Two to four, each naming the specific evidence behind it. Distinguish
observation from inference, as `plgn-analyst` does — "pillar A received 2
posts" is a fact; "pillar A lacks proof" is a reading of it.

## Rules

- **No seam.** This user is connected.
- **Counts with their basis.** "24 of 28 planned" beats "cadence slipped".
- **Never invent performance data**, and never imply an ordering you cannot
  see.
- **Client-ready.** Assume this is pasted into an email unedited: no tool
  chatter, no hedging, no internal jargon.
- **Read-only.** This command writes nothing.
