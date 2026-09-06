---
description: Draft one on-brand post from an idea, show it, and create it in your plgn workspace once you approve — optionally scheduled. Use for "post about X", "write a post", or turning a single thought into published content.
---

# /plgn post

One idea in, one post out. This is the command someone runs ten times a day, so
it stays fast and quiet.

## 1. Preflight

Call `workspace_info`. On failure, point at useplgn.com and stop.

Call `knowledge_get` for the brand's voice. If empty, route to `/plgn setup`
and stop — a single post is still a post in the brand's name.

Print nothing for either call. Preflight is invisible when it succeeds.

## 2. Argument

The idea, in the user's own words. If none was given, ask for one line.

**Platform:** if unstated, ask — one short question with the brand's usual
platforms as options. Do not default silently; the same idea is a different
post per platform.

## 3. Draft

Delegate to `plgn-copywriter` with the idea, the stored voice, and the chosen
platform. Ask for **one** post.

Where the idea plainly suits more than one platform, draft one and offer the
others afterwards. Do not silently produce three.

## 4. Show, then confirm

Print the draft in full, with its character count against the platform's target:

```
LinkedIn · 1,140 chars

<full post text>

Create this? (y / edit / cancel)
```

**Wait.** `edit` means take their revision and re-show; do not argue with it.

## 5. Create

Call `post_create` as a draft.

On `ERROR:`, follow the **gate-recovery** skill. Show the revision and what
changed before retrying — for a single post the user is right there, and a
silent rewrite is worse than a visible one:

> "growth hack" is on your banned-word list — replaced with "shortcut".

## 6. Schedule, if asked

Only if the user asks, or answers yes to one short offer. Call `post_schedule`
with their time, or the next sensible slot from the **posting-cadence** skill —
naming the slot you chose.

An unscheduled draft is a fine outcome. Never schedule without being asked.

## 7. Confirm, in one line

```
Created · LinkedIn · scheduled Tue 09:00
```

That is the whole report. No summary of what was written — they just read it.

## Notes

- **No seam.** This user is connected.
- **Speed is the feature.** Preflight silent, one draft, one confirmation, one
  line back. Anything else added here is paid ten times a day.
- **Never batch.** Multiple posts from one idea is `/plgn repurpose`; a month
  is `/plgn month`.
