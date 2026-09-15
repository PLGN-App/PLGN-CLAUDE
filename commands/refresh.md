---
description: Find older posts worth running again, rewrite the strongest ones, and reschedule them after your approval. Use for "refresh old content", "repost the good ones", "reuse what worked", or filling a thin month from what you already have. Supports --platform, --campaign and --topic.
---

# /plgn refresh

Good points outlive their first posting. Most of an audience never saw them.

This command reuses the strongest older posts — rewritten, not reposted. It
never republishes anything without showing it to you first.

## 1. Check the connection

Call `workspace_info`, then `context_get(role: "copywriter")`. If either
fails or the brand has no Foundation, follow **_conventions** rule 2 and
stop.

## 2. Find candidates

Ask the server for them, rather than reading the board and sorting by eye:

```
post_list(status: "published", scheduled_to: <90 days before today>, limit: 500)
```

Any newer and a real share of the audience still remembers them. The `limit`
matters: without it the read stops at fifty, and on a workspace two years old
the fifty it returns are not the fifty you want — see **brand-knowledge-map**.

The ninety days are measured against the **scheduled** date, which is the only
date `post_list` can filter on. A post published without one — created
straight at `published`, or scheduled and then unscheduled — is not in this
list at all. Say so when the result looks thinner than the board.

Three optional narrowings, and they combine:

- `--platform linkedin` — passed as `platform`
- `--campaign "<name>"` — resolved with `campaign_list`, passed as
  `campaign_id`. Stop if the name matches none or more than one
- `--topic "<name>"` — resolved with `topic_list`, passed as `topic_id`

Stop on a filter you do not recognise, and say which one. A misread flag
rewrites the wrong posts.

If nothing is old enough, say so and stop. A two-month-old workspace has nothing
to refresh, and inventing candidates wastes the run.

## 3. Choose — don't refresh everything

**Say how you chose**, then choose. plgn cannot see likes or reach, so this is
based on the content, not on how it did — say that plainly rather than implying
you know what worked:

- **Still true.** Nothing in it contradicts the brand's current offers, prices
  or position — check against the brand you read in step 1.
- **Still makes a point.** It argues something, rather than announcing an event.
  Launch posts and event notices do not refresh; arguments do.
- **Belongs to a live topic.** A post from a retired topic brings back something
  the brand moved on from.
- **Not said again recently.** If a recent post makes the same point, refreshing
  this one creates the repetition `/plgn topics` flags.

Take the strongest handful — usually 3 to 6 per run. Refreshing thirty posts is
republishing the archive, which is what makes a feed feel automated.

## 4. Rewrite

A post being refreshed may already belong to a campaign. Keep its
`campaign_id`, and read the brand with that id so the rewrite is given the
same key message the original was written against. A refresh that drops the
campaign turns a campaign post into a loose one, and nothing says so.

Start `plgn-copywriter` with the original post and the brand read with
`context_get(role: "copywriter", campaign_id: <its campaign, if any>)`.

Per **_conventions** rule 6, pass that block into the prompt verbatim, along
with the original text and the platform limit. The writer cannot read skills
or this file.

A refresh is a **rewrite**, not a repost:

- A new opening. The old one word for word is what makes readers spot a repeat.
- The current voice — the brand's writing may have moved on.
- Updated details: numbers, product names, anything `context_get` shows has
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

Carry the original's `campaign_id` onto the new post, per step 4.

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
