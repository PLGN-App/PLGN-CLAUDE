# Read filters and result caps — design

**Status:** ready to plan
**Date:** 2026-09-15
**Scope:** `plgn-claude` command and skill prose only. No server change.
**Follows:** `9d09a1b feat(images): let /plgn images take filters`

---

## 1. The problem

plgn's read tools take filters. plgn's commands mostly do not pass them.

A command that calls `post_list` with no arguments reads the whole board,
pushes every row through the model, and then narrows by eye. On a workspace
with two years of posts that is slow, expensive, and — because every list
tool stops at a cap — **quietly wrong**. The rows past the cap are not
reported as missing. They are simply absent, and the count printed to the
user is presented as a total.

One of these is already producing bad data in the field: `/plgn brandkit`
reads what a brand already has so that a second run updates instead of
duplicating, and the read it uses cannot see past twenty entries.

Separately, the plugin's busiest image path never checks whether a usable
picture already exists before paying to generate a new one.

## 2. What is true today

Verified against `plgn` at HEAD, reading the zod schemas in
`src/domains/*/tools.ts` and the caps in the matching `service.ts`. This is
the complete read surface — twelve tools. There is no thirteenth.

| Tool | Filters it accepts | Default | Hard cap |
|---|---|---|---|
| `post_list` | `campaign_id`, `topic_id`, `has_topic`, `status`, `platform`, `assignee_id`, `scheduled_from`, `scheduled_to`, `search`, `limit` | 50 | 500 |
| `knowledge_get` | `type`, `layer`, `keyword`, `campaign_id`, `offering_id`, `active_only`, `limit` | 20 | **20** |
| `context_get` | `role`, `campaign_id`, `offering_ids[]`, `topic_id` | — | — |
| `snippet_list` | `kind`, `platform`, `search`, `limit` | 50 | 500 |
| `brief_list` | `post_id`, `campaign_id`, `limit` | 20 | 100 |
| `list_images` | `folder`, `max` | 25 | 50 |
| `campaign_list` | `status` | all | — |
| `hashtagset_list` | `platform`, `search` | all | — |
| `offering_list` | `include_archived` | all | — |
| `knowledge_history` | `limit` | — | 50 |
| `topic_list` | **none** | all | — |
| `post_get`, `topic_get`, `snippet_get`, `campaign_get`, `brief_get` | id only | — | — |

Every tool also accepts `brand_id`.

Enum values: `status` = idea, draft, scheduled, published · `platform` =
instagram, linkedin, facebook, x, tiktok, youtube · `kind` = caption,
template, guideline · `campaign_list.status` = draft, active, done, archived
· `layer` = foundation, business, creative.

Three behaviours the schemas do not show, read from the handlers:

- **`post_list.search` matches the title only**, case-insensitively, with
  regex metacharacters escaped (`posts/service.ts:254-257`). It does not
  search captions.
- **`topic_id` overrides `has_topic`.** Pass both and `has_topic` is
  silently ignored (`posts/service.ts:225-227`).
- **`knowledge_get`'s cap cannot be raised.** `Math.min(f.limit, 20)`
  (`knowledge/service.ts:114`). A `limit: 100` still returns twenty.

## 3. Defects this exposes

Each was confirmed by reading the file, not inferred.

**D1 — `/plgn brandkit` cannot see what it claims to read.**
`commands/brandkit.md:30` reads `knowledge_get()` and annotates it
*"every entry, so nothing is added twice."* It is twenty entries. The
paragraph below it states the consequence exactly: *"a second run that does
not read first leaves a brand with two of everything."* Any brand past
twenty entries gets that outcome today.

**D2 — `/plgn month` never looks for a reusable picture.**
`grep -c list_images commands/month.md` returns 0; so does `post.md`. The
tool's own description instructs the opposite: *"ALWAYS check here for a
reusable existing asset BEFORE calling generate_image or
upload_image_from_url — reusing an existing image is free, generating a new
one costs the customer money."* `/plgn month` is the plugin's highest-volume
image path, around twenty-four generations per run.

**D3 — `/plgn refresh` reads the whole archive to find old posts.**
`commands/refresh.md:20` says *"Call `post_list` for published posts older
than 90 days"* and passes nothing. `grep scheduled_to commands/refresh.md`
returns nothing. So the ninety-day rule is applied by eye, after the tool has
already cut the result at fifty.

**D4 — `/plgn why` reads the board to find one post.**
`commands/why.md:17` — *"The argument can be a title, part of a caption, or
an id. Call `post_list` and match against it."* `search` exists and does
this server-side.

**D5 — four more unfiltered reads.** `undo.md:24` (drafts and scheduled,
no window), `topics.md:22` (its own rule at :24-27 says to count inside a
campaign's window, then calls `post_list` bare), `visuals.md:33`
(`list_images` sees the 25 newest of a possible 50), `library.md:19`
(`snippet_list` and `hashtagset_list` bare, both take `kind`/`platform`/`search`).

## 4. Decisions

**4.1 — The cap rule is written once, in the skill.**
It goes in `skills/brand-knowledge-map/SKILL.md`, which already owns "where
brand knowledge lives" and is already pinned by the validator. Commands
point at it. Eight copies of a number is how the numbers drift apart.

**4.2 — The new section is NOT called "The caps".**
That heading already exists at `SKILL.md:183` and means something else
entirely: the free-plan limits on how many entries a brand may *hold*. The
new section is about how many rows a *read returns*. Two different numbers
under one name would be worse than no section. Name it
**"How much a read returns"**.

**4.3 — Two obligations follow from a cap, and both are required.**

1. **Ask for what you need.** A command reading a whole board passes an
   explicit `limit`. Leaving the default is a silent cut.
2. **Say what the number covers.** When a printed count came off a capped
   read, the line that prints it says so. `commands/report.md:41-45`
   already does this correctly for `brief_list` and is the model to follow.

**4.4 — A filter the tool does not have is not invented.**
`brief_list` has no date filter; `report.md` works around it honestly rather
than pretending. `topic_list` has no filters at all. Commands adapt to the
surface that exists.

**4.5 — A campaign is named by id, never by name.**
Every `campaign_id` filter needs a `campaign_list` resolution first. An
ambiguous or missing name stops the command; it never picks one.

**4.6 — An unrecognised user filter stops the run.**
Especially before spending credits. A misread flag spends on the wrong posts.

**4.7 — `/plgn month` gains image controls, not just a reuse check.**
Today the only choice is `--dry-run` (spend nothing) or a full run (spend
around twenty-four credits). There is no middle. Add `--no-images` and
`--max-images N`. Combined with the reuse check of D2, this is the only part
of this work that reduces **credits** rather than tokens.

**4.8 — Every behaviour added gets a validator needle.**
`node scripts/validate.mjs` is this repo's entire test suite. A needle must
fail when the behaviour is deleted, not merely match a word that happens to
appear. Mutation-test each one: delete the sentence it binds, run the
validator, confirm it fails naming the file, restore.

## 5. Required behaviour

| File | Must do |
|---|---|
| `skills/brand-knowledge-map/SKILL.md` | New section "How much a read returns": the cap table, the `knowledge_get` fixed cap, the two obligations from 4.3 |
| `commands/brandkit.md` | Read knowledge one `layer` at a time — foundation, business, creative — instead of one bare call. Stop claiming "every entry" |
| `commands/month.md` | Call `list_images` before generating and reuse a match; honour `--no-images` and `--max-images N`; state the count it will spend |
| `commands/refresh.md` | `post_list(status: "published", scheduled_to: <90 days ago>, limit: 500)`; accept `--platform`, `--topic`, `--campaign` |
| `commands/why.md` | Pass the argument as `search`; say it matches titles only, so a caption fragment finding nothing is explained |
| `commands/undo.md` | Bound the candidate read by `status` and a schedule window |
| `commands/topics.md` | Pass `campaign_id` and the campaign's window on the read its own counting rule describes |
| `commands/visuals.md` | Pass `folder` and `max` to `list_images`; say the read tops out at fifty |
| `commands/library.md` | Accept `--kind`, `--platform` and a search word; pass an explicit `limit` |
| `commands/help.md`, `README.md` | List the new flags |
| `scripts/validate.mjs` | A needle per behaviour above |

## 6. Non-goals

- **No server change.** `topic_list` accepting no filters
  (`plgn/src/domains/topics/tools.ts:16`) is a real gap and stays logged, not
  fixed here.
- **No agent change.** `grep post_list agents/` is empty; agents call no
  tools (`_conventions` rule 6). Nothing in this work reaches them.
- **`/plgn images` is not revisited.** It got its filters in `9d09a1b`.
- **No paging invented** where a tool caps hard. `knowledge_get` is read by
  layer; that is the only route past twenty and it is enough.
- **No new tool arguments, no new enum values, no renamed filters.**

## 7. How this is tested

`node scripts/validate.mjs` must print `OK: plugin structure valid.`

The suite reads every markdown file as text. There are no unit tests in this
repo and none are being added. Each task adds its needle to the validator
first, watches it fail, then writes the prose that satisfies it — and
mutation-tests the needle before committing.
