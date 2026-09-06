---
description: Find older posts worth running again, rewrite the strongest ones, and reschedule them after your approval. Use for "refresh old content", "repost the good ones", "reuse what worked", or filling a thin month from what you already have.
---

# /plgn refresh

Good points outlive their first posting. Most of an audience never saw them.

This command reuses the strongest older posts — rewritten, not reposted. It
never republishes anything without showing it to you first.

## 1. Check the connection

Call `workspace_info`, then `knowledge_get`. If either fails or the voice is
empty, follow **_conventions** rule 2 and stop.

## 2. Find candidates

Call `post_list` for published posts older than **90 days**. Any newer and a
real share of the audience still remembers them.

If nothing is old enough, say so and stop. A two-month-old workspace has nothing
to refresh, and inventing candidates wastes the run.

## 3. Choose — don't refresh everything

**Say how you chose**, then choose. plgn cannot see likes or reach, so this is
based on the content, not on how it did — say that plainly rather than implying
you know what worked:

- **Still true.** Nothing in it contradicts the brand's current offers, prices
  or position. Check against `knowledge_get`.
- **Still makes a point.** It argues something, rather than announcing an event.
  Launch posts and event notices do not refresh; arguments do.
- **Belongs to a live topic.** A post from a retired topic brings back something
  the brand moved on from.
- **Not said again recently.** If a recent post makes the same point, refreshing
  this one creates the repetition `/plgn topics` flags.

Take the strongest handful — usually 3 to 6 per run. Refreshing thirty posts is
republishing the archive, which is what makes a feed feel automated.

## 4. Rewrite

Start `plgn-copywriter` with the original post and the brand's **current**
voice.

Per **_conventions** rule 6, put the original text, the current voice, the
banned words and the platform limit into the prompt.

A refresh is a **rewrite**, not a repost:

- A new opening. The old one word for word is what makes readers spot a repeat.
- The current voice — the brand's writing may have moved on.
- Updated details: numbers, product names, anything `knowledge_get` shows has
  changed.
- Possibly a different platform than it first ran on.

## 5. Show every rewrite, then ask

Never republish quietly. Show the old and the new side by side:

```
First posted Mar 4 · LinkedIn

  Before: <original opening>
  After:  <rewritten opening>
  Changed: new opening; "Starter tier" → "Base plan"

4 posts to refresh. Reschedule these?
yes / pick / no
```

`--dry-run` stops here and writes nothing.
**`--yes` is not accepted.** This republishes to a real audience.

## 6. Save and schedule

Once approved, save the rewrites as **new posts** with `post_create` — never
overwrite the original with `post_update`. The original is the brand's history,
and a refresh that erases it loses the record of what was said when.

Then `post_schedule` following the **posting-cadence** skill, spread into gaps
rather than stacked. Follow **gate-recovery** on any `ERROR:`.

## 7. Report

```
4 refreshed posts saved and scheduled

  1 skipped — "Pricing update" names a plan you removed in March
```

## Notes

- **No seam.** This user is already signed up.
- **Never say a post did well.** "Reposting your best performer" is something
  plgn cannot know. Say "points that still hold" instead.
- **Never overwrite the original.**
- **Never refresh in bulk.** If a user asks for thirty, say why fewer is better
  and let them decide.
- Replies follow the **reply-style** skill, including the user's language.
