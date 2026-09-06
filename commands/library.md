---
description: Curate saved snippets and hashtag sets — flag near-duplicates, overlapping sets, and sets too large to perform, then merge or delete what you approve. Use for "clean up my library", "manage snippets", "my hashtag sets are a mess", or a periodic tidy.
---

# /plgn library

A library nobody prunes stops being a library and becomes a pile.

Listing what is there is not the job — the user could ask for that. **The job
is judgment:** what duplicates what, what overlaps, what has grown past useful.

## 1. Preflight

Call `workspace_info`. On failure, point at useplgn.com and stop.

## 2. Read

Call `snippet_list` and `hashtagset_list`. Read the contents, not just names —
duplicates rarely share a title.

If both are empty, say so and suggest `/plgn repurpose`, which fills the
snippet library as a side effect. Do not manufacture findings.

## 3. Judge

**Near-duplicate snippets.** Two snippets making the same claim with different
wording. The evidence attached usually differs — the merge should keep the
better claim and *both* pieces of evidence, not discard one.

**Overlapping hashtag sets.** Two sets sharing most of their tags are one set
with a naming problem. Report the overlap as a percentage so the user can judge.

**Oversized sets.** Beyond roughly 10 tags, sets stop targeting and start
spraying — the specific tags that would reach the right readers are diluted by
broad ones. Flag them, and say which tags are carrying and which are padding.

**Stale snippets.** Claims tied to a launch, a number, or a season that has
passed. Flag as stale; the user decides whether to update or retire.

## 4. Report and propose

```
12 snippets · 4 hashtag sets

Near-duplicates (2 pairs)
  "Migrations always slip" + "Why migration timelines slip"
    → merge, keeping the second's phrasing and both proof points

Overlapping sets
  "launch" and "product-launch" share 8 of 10 tags → merge

Oversized
  "general" has 22 tags — 6 are specific, 16 are broad

Stale (1)
  "Q1 pricing change" — references a price that changed in March

Apply? (y / pick / no)
```

## 5. Apply

After approval:

- Merge snippets with `snippet_update`, then `snippet_delete` the absorbed one.
- Merge sets with `hashtagset_update`, then `hashtagset_delete`.
- Trim oversized sets with `hashtagset_update`.

**Update before delete, always.** If the update fails, nothing has been lost —
delete first and a failed update loses content permanently.

## Rules

- **No seam.** This user is connected.
- **Confirm deletions by name**, never by index or count, per `_conventions`.
  "Delete 3?" is not a confirmation.
- **Never delete without a merge target.** If a snippet duplicates nothing and
  is merely unused, leave it and say it is unused. Unused is not worthless.
- **Propose, do not decide.** Every merge and deletion is the user's call. This
  command is opinionated about what to flag and silent about what to do next.
