---
name: brand-knowledge-map
description: Use when saving or reading anything about a brand — deciding where a piece of brand knowledge belongs, which knowledge types exist, why a saved banned-word list is not being enforced, or why a second voice entry was refused. Covers the brand record, the three layers and sixteen types, offerings and campaigns as records, and the things that are not knowledge at all.
---

# Where a brand's knowledge lives

A brand is stored in four different places, and putting something in the wrong
one does not fail loudly. It fails quietly, months later, when a rule nobody
can find is not being applied.

Read this before saving anything about a brand.

## The four places

| Place | What it holds | Written with |
|---|---|---|
| **The brand record** | Name, languages, banned words, **timezone** | `brand_update` |
| **Knowledge entries** | What the brand knows about itself — sixteen types, three layers | `knowledge_add`, `knowledge_update` |
| **Offerings** | What it sells: a product or a service, with its benefits | `offering_create`, `offering_update` |
| **Campaigns** | One thing it is saying for a while, with dates | `campaign_create`, `campaign_update` |

Topics, snippets, hashtag sets and images are none of these. They have their
own tools and are listed at the bottom.

## Read it back with one call

`context_get` assembles all four, in a fixed order, for one role:

```
context_get(role: "copywriter")
```

The output arrives in that order every time: the brand record, then
Foundation, then Business, then Creative.

Optional arguments beside `role`: `campaign_id` (default: every current
campaign), `offering_ids`, and `topic_id`, which adds the entries linked to
that topic.

Roles: `marketing_manager`, `creative_director`, `copywriter`, `art_director`,
`designer`, `all`. Each gets what it needs and not the rest — a copywriter
gets the voice and the benefits, an art director gets the picture rules and
the palette.

**Use it instead of several `knowledge_get` calls.** It is one read, and it
ends with the exact entry versions it gave you.

Use `knowledge_get` when you are checking or editing **one** thing:

```
knowledge_get(type: "competitor", keyword: "Acme")
```

`knowledge_history` shows every stored version of one entry, newest first, with
who changed it and why.

## The three layers

Entries are grouped by how often they change, and that grouping decides what
overrides what.

| Layer | Rule | Types |
|---|---|---|
| **Foundation** | Read first, never overridden | `brand_identity`, `brand_positioning`, `voice_tone`, `audience`, `visual_rules`, `creative_rules` |
| **Business** | What it sells, and the proof | `promotion`, `proof`, `objection`, `competitor`, `market_context`, `seo_rules`, `platform_rules` |
| **Creative** | How it says one thing, this once | `reference`, `approved_execution`, `example_post` |

Sixteen types. That is the entire list. There is no `offers` type and no
`publishing` type — those are an Offering and the brand record.

## Four of them are singletons

A brand holds **exactly one** `brand_identity`, one `brand_positioning`, one
`voice_tone` and one `audience`. A second one is refused, and the refusal
carries the id of the entry that already exists.

**That refusal is an instruction, not an error.** Update the entry it names
with `knowledge_update`. Never report it to the user as a failure, and never
try a different title to get around it — a brand with two voices has no voice.

## Foundation needs the user's yes

Every write to a Foundation type must pass `confirm: true`, and you may pass it
only **after** the user has approved the text you are about to save.

Foundation is what every future post reads. The confirmation is the difference
between a brand that agreed to how it sounds and one that was told.

## Every write is a version

An entry carries a version number. Changing its content bumps it and stores the
old text, with a note saying what changed. Linking it to a campaign does not.

So: send a short `note` on any write that changes meaning. Six months later it
is the only thing that says why.

## The trap: banned words

Banned words look like knowledge. They are not.

The server checks every post against the list on the **brand record**. A list
saved anywhere else is a note nobody reads — the post goes out with the word in
it, and the person who wrote the rule never finds out why.

Write them with `brand_update`. Read them back with `brand_list`, which returns
each brand's banned words directly.

`brand_update` replaces the whole list. To add one word, read the current list
first and send it back with the new word appended. Sending one word deletes the
rest.

## The timezone lives on the brand record

`brand_update(timezone: "Africa/Cairo")`, and `brand_list` prints it.

It used to be written into a knowledge entry, because the brand record had
nowhere to put it. It has a place now. A timezone saved as knowledge is a time
nobody schedules against.

**Never schedule against an assumed timezone without saying so in the reply.** A
time with no timezone is a time in whatever zone the server happens to think
in, and nobody finds out until a client notices their nine o'clock post arrived
at two in the morning.

## Offerings — what the brand sells

An offering is a **record**, not a knowledge entry:

```
offering_create(
  name: "Signature blend",
  kind: "product",          // product | service
  role: "hero",             // hero | supporting — only one hero at a time
  benefits: [{
    label: { "en": "Roasted weekly" },
    meanings: ["never sits in a warehouse"],
    avoidCliches: ["farm to cup"]
  }]
)
```

`meanings` and `avoidCliches` are the two fields a writer actually reads. A
benefit carrying only a label gives the writer a phrase to repeat, which is the
opposite of what it is for.

Products carry `variants` and pictures; services carry `deliverables`,
`process`, `outcome` and `engagement`. Read them back with `offering_list`
(there is no `offering_get`). Setting a second offering to `hero` demotes the
first — that is deliberate, and worth telling the user.

**Never delete an offering to retire it.** `offering_update(archived: true)`
keeps the record and takes it out of what the AI reads. Deleting unlinks it
from every post, entry and campaign that named it, and cannot be undone.

## Campaigns — one thing, for a while

```
campaign_create(
  name: "Ramadan 2027",
  status: "draft",          // draft | active | done | archived
  startsAt: "2027-02-01",
  endsAt: "2027-03-02",
  keyMessage: { "en": "One table, everyone welcome." },
  constraints: ["no ice"],
  vocabulary: ["gathering"],
  offeringIds: [...],
  topicIds: [...]
)
```

A campaign is **current** when it is `active` and today falls inside its
window. `context_get` reads the current ones unless you name one with
`campaign_id`.

A post inside a campaign carries `campaign_id` and inherits the campaign's
offerings. Its writer is given the key message, the constraints and the
vocabulary.

`campaign_get` returns one campaign with its posts, its references and its
exact counts. `campaign_list` is the overview.

## The caps

| | Free |
|---|---|
| Knowledge entries | 12 |
| Offerings | 2 |
| Campaigns in progress | 1 (`draft` + `active` only) |

Hitting one is a refusal, not an error. Say what is full and what it costs to
raise it — never retry, and never quietly drop the thing that did not fit.

## Not knowledge at all

| What | Tool |
|---|---|
| A content topic | `topic_create` |
| Reusable copy — a hook, a CTA, boilerplate | `snippet_create` |
| A set of hashtags | `hashtagset_create` |
| An image file | `upload_image_from_url` |

An image *file* is not knowledge. A **reference** — a picture worth learning
from, with a line saying what to learn — is: a `reference` entry, with the
picture attached and an `intent` in its metadata. Without the intent it is a
template, and the server refuses it.

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
*can* filter — status, the scheduled window, and now `campaign_id` — and then
confirms membership by reading the marker on each candidate. For a run of
thirty posts that is thirty cheap reads, and it is what makes a run undoable.

## Updating without losing anything

Use `knowledge_update` in place. It is partial — only the fields you send
change, and the version bumps only when the content does.

**Never delete and re-add.** If the second call fails, the entry is gone and
the brand is worse off than before it was touched. Deleting also throws away
every stored version of it. `knowledge_delete` is for an entry that should no
longer exist at all, confirmed by name.

## The old names

`brand_voice`, `competitor_data`, `seo_guidelines` and `example_article` were
the whole taxonomy until 1.4.0. The server still **accepts** them on both
sides, so a plugin that has not been updated keeps working.

As a write, a `brand_voice` entry is mapped to the type its title suggests,
and the reply says which type it became. As a filter on `knowledge_get`, a
legacy name does not return one type — `knowledge_get(type: "brand_voice")`
returns the whole Foundation layer. A command written against the old shape,
expecting a single entry back, gets six and reads only the first one,
silently dropping the rest.

**Nothing in this plugin writes one, and nothing in this plugin filters by
one.** They exist so that someone else's installed copy does not break.
