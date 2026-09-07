---
description: Take back the last batch of posts plgn created — unschedule them, or delete them entirely — after showing exactly what will go. Use for "undo that", "take that month back", "I didn't want those", or right after a run that came out wrong. Never touches anything already published.
---

# /plgn undo

`/plgn month` writes thirty posts on one keystroke. This is the way back.

Without it, a run that came out wrong costs half an hour of deleting things by
hand, and people stop trying runs at all. That is the real damage — not the
thirty posts, but the caution afterwards.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Find the last run

Every command that writes in bulk stamps its posts with a run marker. The
**brand-knowledge-map** skill has the mechanics: the marker is not something
`post_list` can filter on, so find candidates the way the tools allow.

1. Call `post_list` for drafts and scheduled posts, newest window first.
2. Read the run marker on each candidate.
3. Group by marker. The newest group is the last run.

**Published posts are never candidates.** They are out in the world; taking
them out of plgn changes nothing and loses the record. Say plainly that
published posts are excluded and how many there were.

If the user named a run, use that one. If nothing carries a marker, say so —
older posts were written before runs were stamped, and those have to go one at
a time by name.

## 3. Show exactly what would go

Never a count on its own. "Delete 28?" is not something anyone can agree to
safely.

```
Last run: 28 posts, saved 7 September

  24 scheduled · 4 still drafts
  22 have images
  none published

  Migration horror stories      9 posts
  Pricing without traps         8 posts
  Founder notes                11 posts
```

Then offer the two ways back, because they are very different:

```
Unschedule them, or delete them?
yes / pick / no
```

- **Unschedule** — the posts stay, nothing goes out, the writing survives. This
  is what most people mean by undo, and it is the safe default. Offer it first.
- **Delete** — the posts are gone permanently, and so are their images.

**Recommend unscheduling.** Someone undoing a run is usually reacting to
timing, not to the writing, and rewriting thirty posts to fix a date is a bad
trade.

## 4. Do it

**Unschedule** — `post_schedule` with the clear flag on each post. Status
stays, so nothing is lost and the posts can be scheduled again later.

**Delete** — `post_delete` on each post, which needs a clear confirmation. Per
**_conventions**, deleting is confirmed by **name**, not by number: name the
run and say how many, and take a yes on that.

Deleting posts does not delete the images they used. Say how many images are
now unused and that `/plgn library` can tidy them.

## 5. Report

```
28 posts unscheduled · nothing was published

They're still here as drafts. Reschedule with /plgn month, or delete them with
/plgn undo again.
```

If anything failed, name it and say what state it is in now. A half-undone run
is worse than none, so be exact about which posts are still scheduled.

`--dry-run` shows what would go and changes nothing.
**`--yes` is not accepted.** This removes work.

## Notes

- **No seam.** This user is already signed up.
- **One run per invocation.** Undoing three runs at once is how people lose
  work they meant to keep.
- **Never touch a published post.**
- **Never undo silently.** Even with `--dry-run` off, the list comes first and
  the answer comes second.
- Replies follow the **reply-style** skill, including the user's language.
