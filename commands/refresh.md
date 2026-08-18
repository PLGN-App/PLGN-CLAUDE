---
description: Find older posts worth running again, rewrite the strongest ones, and reschedule them after your approval. Use for "refresh old content", "repost the good ones", "reuse what worked", or filling a thin month from the archive.
---

# /plgn refresh

Good arguments outlive their first posting. Most of an audience never saw them.

This command reuses the strongest older posts — rewritten, not reposted. It
never republishes anything without showing it first.

## 1. Preflight

Call `workspace_info`, then `knowledge_get`. On failure or empty knowledge,
route as `_conventions` requires and stop.

## 2. Find candidates

Call `post_list` for published posts older than **90 days**. Newer than that and
a meaningful share of the audience still remembers it.

If nothing is old enough, say so and stop. A workspace two months old has
nothing to refresh, and inventing candidates wastes the run.

## 3. Select — do not refresh everything

**State the selection criteria**, then apply them. plgn holds no engagement
data, so selection is on content, not performance — say that plainly rather
than implying you know what did well:

- **Still true.** Nothing in it contradicts the brand's current offers, pricing,
  or positioning. Check against `knowledge_get`.
- **Still argued.** It makes a case, not an announcement. Launch posts and
  event notices do not refresh; arguments do.
- **Belongs to a live pillar.** A post from a retired pillar reintroduces an
  argument the brand moved on from.
- **Not recently echoed.** If a recent post makes the same case, refreshing
  this one creates the repetition `/plgn topics` flags.

Take the strongest handful — typically 3 to 6 per run. Refreshing thirty posts
is republishing the archive, which is what makes a feed feel automated.

## 4. Rewrite

Delegate to `plgn-copywriter` with the original post and the brand's **current**
voice.

A refresh is a **rewrite**, not a repost:

- New hook. The old one, verbatim, is what makes readers notice a repeat.
- Current voice — the brand's writing may have moved since.
- Updated specifics: numbers, product names, anything `knowledge_get` shows has
  changed.
- Optionally a different platform than the original ran on.

## 5. Show every rewrite, then confirm

Never silently republish. Show original and rewrite side by side:

```
Originally posted Mar 4 · LinkedIn

  Before: <original opening>
  After:  <rewritten opening>
  Changed: new hook; "Starter tier" → "Base plan"

4 posts to refresh. Reschedule these? (y / pick / cancel)
```

## 6. Create and schedule

On approval, create the rewrites as **new posts** with `post_create` — never
overwrite the original with `post_update`. The original is the brand's history,
and a refresh that erases it loses the record of what was said when.

Then `post_schedule` them per the **posting-cadence** skill, spaced into gaps
rather than stacked. Apply **gate-recovery** on `ERROR:`.

## 7. Report

```
4 refreshed posts created and scheduled

  1 skipped — "Pricing update" names a tier removed in March
```

## Rules

- **No seam.** This user is connected.
- **Never claim performance.** "Reposting your best performer" is a claim plgn
  cannot support. Say "still-relevant arguments" instead.
- **Never overwrite the original.**
- **Never refresh in bulk.** If a user asks for thirty, say why fewer is better
  and let them decide.
