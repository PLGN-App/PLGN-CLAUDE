---
description: Fill a plgn workspace with a month of on-brand content — plans pillars, drafts posts in parallel, generates images, and schedules everything after your approval. Supports --dry-run to see the plan without writing. Use for "a month of content", "fill my calendar", or "plan next month".
---

# /plgn month

Take a topic and leave the workspace with a month of scheduled, illustrated,
on-brand posts.

This command writes real data to a real workspace. Everything below is built
around that fact: plan first, confirm once, write carefully, report honestly.

## 1. Preflight

Call `workspace_info`. On failure, point the user at useplgn.com and stop —
see `_conventions`.

Then call `knowledge_get`.

**If the brand has no stored voice, stop and route to `/plgn setup`.** Do not
infer a voice from a website here. Inference is the free layer's compromise; a
connected user has a real profile one call away, and thirty posts written in a
guessed voice is thirty posts to redo.

## 2. Plan, and stop

Decide the shape of the month, then present it as a short table:

```
Pillars:    <name> · <name> · <name>
Platforms:  LinkedIn, X, Instagram
Cadence:    <n>/week — <n> posts total
Images:     <n> to generate (<n> credits)
Window:     <start date> → <end date>
```

Derive pillars by delegating to `plgn-strategist` with the topic and the
brand's stored knowledge. Where the topic narrows an existing pillar, say so.

**Wait for an explicit yes. No writes before this point.**

`--dry-run` ends here: print the plan, write nothing, and say so.

State the image credit cost in the plan, not later — it draws down a real
pool, and it is the part of the run a user is most likely to want reduced.

## 3. Fan out

Spawn one `plgn-copywriter` per pillar, **in parallel**. Give each the pillar,
the stored voice, the platforms, and its share of the post count.

If a copywriter returns fewer posts than asked because the pillar was thin,
take the shortfall. Do not backfill with a second request — a thin pillar is
information about the plan, and it belongs in the final report.

## 4. Write

For each pillar, call `topic_create`. Then call `post_create` per post, as
drafts.

**Record the ids the tools return.** Never assume creation order matches your
draft order, and never reconstruct an id — read it from the response. If a
later step needs a post you cannot identify, re-read with `post_get` or
`post_list` rather than guessing.

Posts are created as drafts. Nothing is scheduled until step 7.

## 5. Recover

On any `ERROR:`, follow the **gate-recovery** skill. It owns the procedure,
including which errors are not gate failures at all.

**Never abort the run for one post.** Twenty-nine good posts and one honest
hand-off is a successful run. Track anything left as a draft for the report.

## 6. Illustrate

For each post that should have one, delegate the prompt to `plgn-visual`, then
call `generate_image`.

**Generation is asynchronous.** `generate_image` returns a task id, not an
image. Poll `check_generation` per the interval and give-up threshold in the
**image-prompting** skill.

On timeout, leave the image slot empty, record the post for the report, and
**continue** — a missing image never blocks scheduling. A post that ships
text-only is fine; a month that stalls waiting on a render is not.

If `plgn-visual` returns an empty prompt because the post is stronger without
an image, respect that and spend no credit.

## 7. Schedule

Call `post_schedule` across the agreed window, following the
**posting-cadence** skill for spacing and platform mix.

Do not clump one pillar into a single week. If there are fewer good posts than
slots, schedule fewer — thinning beats padding, and the plan already told the
user how many to expect.

## 8. Report

Counts first, then exceptions by name, then the link.

```
28 posts scheduled across 4 weeks · 3 pillars · 24 images

  2 revised to fit LinkedIn's cap
  1 left as a draft — "growth hack" is on your banned-word list and the
    post's point depends on it
  1 has no image — generation timed out; the post is scheduled without one

Review at useplgn.com
```

Never print a raw `ERROR:` string. Never report the run as failed because
individual posts needed a human.

## Partial failure

If the run stops midway — a tool goes down, the user interrupts, a limit is
hit — **report exactly what exists in the workspace right now**: what was
created, what was scheduled, what is still a draft.

A user must never be left guessing what landed. That is the difference between
a run they can recover from and one they have to clean up by hand.

## Notes

- **No seam.** This user is connected.
- **One confirmation, not many.** Confirm the plan in step 2, then execute. Do
  not stop to confirm each post — that is what the plan was for.
