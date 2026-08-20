---
description: Report the health of the content pipeline — which pillars are exhausted, which are starved, and what to add — then create the topics you approve. Use for "what should I write next", "check my pillars", "am I repeating myself", or planning before a new month.
---

# /plgn topics

Is the pipeline healthy, and what is missing?

A topic list is easy to read. What is hard — and what this command is for — is
noticing that a pillar has been restating one idea for six weeks.

## 1. Preflight

Call `workspace_info`. On failure, point at app.plgn.dev and stop.

Call `knowledge_get` for the brand's pillars and voice.

## 2. Read

Call `topic_list` and `post_list`. Topics alone do not show health — what
matters is how many posts each pillar actually produced and whether they
advanced the argument.

## 3. Diagnose, per the content-pillars skill

**Exhausted** — the pillar keeps restating one angle rather than advancing it.
Symptoms: the same hook shape repeatedly, interchangeable posts, adjacent
topics pulled in to fill slots. More posts will not fix it; narrowing or
retiring it will.

**Starved** — the pillar exists in the plan and received almost no posts. Say
*why*. Often it needs proof the brand does not yet have — "this pillar needs
two customer results before it can carry posts" is actionable; silently
under-serving it is not.

**Healthy** — producing posts that each take the argument somewhere new. Count
them; do not list them.

**Ratio check.** Across recent posts, roughly: half arguments that help whether
or not the reader buys, a third proof, a fifth direct offers. Flag a
permanently inverted feed — where nearly every post asks for something — since
that is what burns an audience.

## 4. Report

```
3 pillars · 34 posts over 8 weeks

Exhausted
  Migration horror stories — 14 posts, 9 open with a statistic, and the
  last 5 restate "legacy tooling is expensive" without advancing it.
  → Narrow to "migrations that failed after go-live", or retire.

Starved
  Pricing without traps — 2 posts in 8 weeks. Needs a published pricing
  page to write against; there isn't one yet.

Healthy
  Founder notes — 18 posts, each taking the argument somewhere new.

Ratio: 30% helpful / 20% proof / 50% offers — heavy on asks.

Add topics? (y / no)
```

## 5. Create

On approval, call `topic_create` for each agreed topic, tied to its pillar.

Where a pillar is exhausted, propose the **narrowed** version rather than more
topics under the old framing — that is what produced the repetition.

Retiring a pillar is a normal outcome, not a failure. Pillars have a lifespan,
usually a few months of regular posting. Say so when recommending it.

## Rules

- **No seam.** This user is connected.
- **Confirm before creating**, per `_conventions`.
- **Never recommend "post more"** as a fix for an exhausted pillar. Volume is
  what exhausted it.
- **Base the diagnosis on posts, not topics.** A pillar with twelve topics and
  two posts is starved, whatever the topic list suggests.
