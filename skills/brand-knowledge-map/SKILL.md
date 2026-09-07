---
name: brand-knowledge-map
description: Use when saving or reading anything about a brand — deciding where a piece of brand knowledge belongs, which knowledge types exist, or working out why a saved banned-word list is not being enforced. Covers the brand record, the four knowledge types, and the things that are not knowledge at all.
---

# Where a brand's knowledge lives

A brand is stored in three different places, and putting something in the wrong
one does not fail loudly. It fails quietly, months later, when a rule nobody can
find is not being applied.

Read this before saving anything about a brand.

## The map

| What you want to save | Where it goes | Tool |
|---|---|---|
| Brand name | brand record | `brand_update` |
| Languages the brand publishes in | brand record | `brand_update` |
| **Banned words** | **brand record** | **`brand_update`** |
| Voice | knowledge, type `brand_voice` | `knowledge_add` |
| Audience | knowledge, type `brand_voice` | `knowledge_add` |
| Offers | knowledge, type `brand_voice` | `knowledge_add` |
| Visual direction | knowledge, type `brand_voice` | `knowledge_add` |
| Timezone and when they publish | knowledge, type `brand_voice` | `knowledge_add` |
| SEO and keyword rules | knowledge, type `seo_guidelines` | `knowledge_add` |
| Posts worth imitating | knowledge, type `example_article` | `knowledge_add` |
| A competitor | knowledge, type `competitor_data` | `knowledge_add` |
| A content topic | not knowledge | `topic_create` |
| Reusable copy — a hook, a CTA, boilerplate | not knowledge | `snippet_create` |
| A set of hashtags | not knowledge | `hashtagset_create` |
| A reference image | not knowledge | `upload_image_from_url` |

## The trap

Banned words look like knowledge. They are not.

The server checks every post against the list on the **brand record**. A list
saved anywhere else is a note nobody reads — the post goes out with the word in
it, and the person who wrote the rule never finds out why.

Write them with `brand_update`. Read them back with `brand_list`, which returns
each brand's banned words directly.

`brand_update` replaces the whole list. To add one word, read the current list
first and send it back with the new word appended. Sending one word deletes the
rest.

## There are exactly four knowledge types

`brand_voice`, `competitor_data`, `seo_guidelines`, `example_article`. That is
the entire list.

There is no `audience` type and no `offers` type. Those are real things a brand
needs, and they are stored as `brand_voice` entries told apart by their title:

| Entry | type | title | metadata |
|---|---|---|---|
| Voice | `brand_voice` | `Voice` | `{ "kind": "voice" }` |
| Audience | `brand_voice` | `Audience` | `{ "kind": "audience" }` |
| Offers | `brand_voice` | `Offers` | `{ "kind": "offers" }` |
| Visual direction | `brand_voice` | `Visual direction` | `{ "kind": "visual" }` |
| Publishing | `brand_voice` | `Publishing` | `{ "kind": "publishing" }` |

Always set the metadata. The title is what a person reads; the metadata is what
lets a later command find one entry among five of the same type.

## The timezone has nowhere else to go

`Publishing` holds the brand's **timezone** and the days and hours it posts.

It is not stored on the brand record, because the record takes only a name,
languages and banned words. So it lives here, and every command that schedules
must read it.

This matters more than it looks. A time with no timezone is a time in whatever
zone the server happens to think in, and nobody finds out until a client
notices their nine o'clock post arrived at two in the morning. **Never schedule
against an assumed timezone without saying so in the reply.**

## Marking which run made a post

A command that writes many posts at once stamps each one with the same run
marker, in `post_create`'s `external_post_id` field:

```
plgn-run-2026-09-07-1
```

That field exists for identifiers from other systems, it is not shown to the
reader, and it is the only free string a post carries. Posts have **no tags and
no metadata** — this is the whole mechanism.

`post_list` cannot filter by it. So a later command narrows by what `post_list`
*can* filter — status and the scheduled window — and then confirms membership
by reading the marker on each candidate. For a run of thirty posts that is
thirty cheap reads, and it is what makes a run undoable.

## Reading it back

`knowledge_get` takes a `type` and a `keyword` and returns full entries, up to
twenty, newest first. Entries can be long.

- Need one thing → filter by `type`, or by `keyword` matching the title.
- Need everything before drafting → read all four `brand_voice` entries at once.

## Updating without losing anything

Use `knowledge_update` in place. It is partial — only the fields you send
change.

**Never delete and re-add.** If the second call fails, the entry is gone and the
brand is worse off than before it was touched. `knowledge_delete` is for an
entry that should no longer exist at all, confirmed by name.
