---
description: Summarise a period of content — what went out, how the topics were balanced, how the plan held, and what plgn's checks caught — plus what to do next. Read-only. Use for "monthly report", "what did we publish", "content summary", or a recap for a client.
---

# /plgn report

What went out, and what it means. This often gets read out loud to a client, so
it must be accurate before it is impressive.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. The period

Last 30 days by default. Accept any range the user gives.

**Say the period and the brand at the top**, so the report still makes sense
when it is pasted somewhere else a week later.

## 3. Read and work it out

Call `post_list` and `topic_list` for the period, then start `plgn-analyst`.

Per **_conventions** rule 6, put the posts, the topics and the brand's plan into
the agent's prompt. It cannot read the workspace itself.

## 4. What this report cannot say

plgn stores posts, topics and images. It does **not** store views, likes,
reach, clicks or follower counts — those live on the platforms.

**Never** say a post did well, rank posts by how they performed, or link
traffic or followers to any content. If asked, say so directly:

> plgn can't see likes or reach — those live on the platforms. This covers what
> went out and how the plan held.

Say it once, plainly, in the report itself. A client reading a content report
reasonably assumes performance is in it; naming the limit protects both of you.

## 5. The report

```
<Brand> · Aug 1 – Aug 31

Went out       24 posts across 3 topics · 19 with images
Planned        28 · 4 a week
How it held    weeks 1-3 on plan; week 4 dropped to 2 posts

Topics
  Migration stories        14   ← carried the month
  Founder notes             8
  Pricing without traps     2   ← almost nothing

What the checks caught
  3 posts shortened to fit
  1 banned word ("growth hack") — this keeps happening; worth checking
    whether that list still matches how the brand writes

Mix   50% helpful · 20% proof · 30% asks

What this covers: posts published from this workspace. Likes and reach live
on the platforms and plgn can't see them.

Next
  1. "Pricing without traps" needs a published pricing page before it can
     carry posts — 2 in a month means it's stuck, not slow.
  2. "Migration stories" carried the month; /plgn topics can check whether
     it's still going somewhere or just repeating.
  3. Week 4 thinned out. Either plan 3 a week, or refill from older posts
     with /plgn refresh.
```

## 6. What to do next

Two to four suggestions, each naming the evidence behind it. Keep facts and
readings apart, as `plgn-analyst` does — "this topic got 2 posts" is a fact;
"this topic lacks proof" is a reading of it.

## Notes

- **No seam.** This user is already signed up.
- **Counts with their basis.** "24 of 28 planned" beats "we posted less".
- **Never invent numbers**, and never suggest an order you cannot see.
- **Ready for a client.** Assume it gets pasted into an email unchanged: no
  tool names, no hedging, no internal words.
- **Read-only.** This command writes nothing, so it takes no flags.
- Replies follow the **reply-style** skill, including the user's language.
