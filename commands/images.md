---
description: Find posts with no image, plan and make one for each, and attach the results — with the points cost stated before anything is spent. Supports --dry-run and filters (campaign, platform, status, dates, title word). Use for "generate images", "my posts need images", or filling in artwork before a month goes out.
---

# /plgn images

Fill the empty image slots, on purpose and at a stated cost.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Check the image setup from the same `workspace_info` result. Images are paid
for in **points**, and the cost depends on the image model — `workspace_info`
lists every model with its points, and the `Image points` line shows what is
used and what is left. Read both; never assume one picture costs one point. If
no points are left, say so and stop — point them at billing in the dashboard,
never ask for a key in the terminal. Same for Cloudinary (the `Integrations`
line): without storage, new images have nowhere to live.

## 2. Find the gaps

Call `post_list` and `list_images` to find posts with no picture.

With no filter this fills the **whole board**. Pass `limit: 500` so a long
board is not silently cut at the tool's default of fifty.

### Narrowing the run

Filters combine — each one narrows what the last left. Read them off what the
user typed and pass them straight to `post_list`:

| Typed | Passed to `post_list` |
|---|---|
| `--campaign "Ramadan 2027"` | `campaign_id` |
| `--platform instagram` | `platform` |
| `--status draft` | `status` |
| `--from 2026-10-01 --to 2026-10-31` | `scheduled_from`, `scheduled_to` |
| a plain word | `search` — matches post titles only, case ignored |

`post_list` takes a campaign **id**, never a name. Resolve the name with
`campaign_list` first. If it matches none, or more than one, print what you
found and stop — do not pick one for them.

Stop on a filter you do not recognise, and say which one. A misread flag
spends points on the wrong posts.

Say what you found, and name the filter on the same line, so a narrowed run is
never read as an empty board:

```
7 posts have no image in "Ramadan 2027" · 24 points available
```

With no filter, the same line without the campaign clause.

## 3. Decide which deserve a picture

Not every post should have a picture. Send each candidate to `plgn-visual`,
which returns nothing to make when a post reads better plain.

For each post, read `context_get(role: "copywriter", campaign_id: <the
post's campaign, if it has one>)` and put the post text and that block into
`plgn-visual`'s prompt — per **_conventions** rule 6, the agent cannot see
this file.

Per post, not once for the run.

Say which ones you are skipping, rather than quietly leaving them out:

```
2 posts read better without a picture — long arguments where a stock-looking
image would cost more than it adds.
```

## 4. Say what it costs, then ask

**Before any thinking starts.** The frame count this bill uses is the frame
count section 5 will actually make — this command decides it, not reads it
back from somewhere else. Unless the user asked for a carousel when running
this command, every post left after section 3 is one frame. When they did
ask, use the count they gave for those posts (default 3, never more than
10) and say which posts are carousels.

The post's platform sets the real ceiling, and it is not ten everywhere —
one platform allows far fewer, and one takes no carousel at all. Look the
number up in **platform-specs** and clamp to it *before* the cost sentence,
so nobody is billed for frames that cannot be published. Where a platform
takes none, that post is one picture; say so rather than silently dropping
the request.

A carousel planned earlier by `/plgn month` cannot be seen from here, so
unless the user asks for one in this run, a post is costed and made as one
picture:

```
8 pictures for 5 posts — one is a carousel on X, asked for in this run and
cut from 6 frames to 4, which is all X allows.
8 points at 1 point each, leaving 16.
yes / pick / no
```

Images spend from a real balance, and this states the whole run's bill, not
one post's. Work the bill out from the points `workspace_info` gives for the
model you will use — frames × that model's points. If the number is more than the workspace has, say so and offer to
do the most valuable posts rather than stopping halfway with no explanation.

`--dry-run` stops here and spends nothing.
**`--yes` is not accepted by this command.** It spends points.

## 5. Per post: read, think, check, save

Once the user says yes, work through the posts one at a time, in this order,
for each one. This is the **creative-brief** skill's four steps in two calls
— read it before changing anything here.

1. Read `context_get(role: "creative_director", campaign_id: <the post's
   campaign, if it has one>)`.
2. Send `plgn-creative-director` that block, the caption, the offering's
   benefits, the campaign's constraints and vocabulary if this post runs
   inside one, the `Already done` lines from the read, the **Assets**
   section of that same read, and the frame count settled in section 4. Per **_conventions** rule 6, all of it goes in the
   prompt — the agent cannot see this file.
3. Call `brief_create` with what it returned, plus `post_id` for the post
   being illustrated, its `campaign_id`, `offering_ids` and `topic_id`
   where the post has them, and `knowledge_used` copied from the end of the
   `context_get` read. **`post_id` is not optional in practice.** Without
   it the brief is never joined to its post: `/plgn why` finds nothing to
   read back, `/plgn queue` cannot name the posts that need a person, and
   what carries each frame gets resolved from the brand's whole catalogue
   instead of what this post is actually about. Keep the id the call
   returns — every step below needs it.
4. Read `context_get(role: "designer", campaign_id: <the post's campaign, if
   it has one>)` for the brand's identity and picture rules. Send
   `plgn-designer` the concept, the frames, that block, the campaign's
   constraints from step 1 of this list — the designer's own read does not
   carry them — the **Assets** section of the designer read, and what
   carries each frame, as the `brief_create` call in step 3 resolved it.
5. A frame that fails a check comes back as objections, not a picture, and
   each objection belongs to the frame it was raised against. Send
   `plgn-creative-director` the objections and the ideas it already scored,
   so it can pick a **different idea** and write fresh directions for it.
   Call `brief_update` with the brief's id, the objections as `qa_findings`
   — grouped by frame, so an objection about frame 3 lands on frame 3 — and
   the new idea and directions the director returned. Then send the result
   back to `plgn-designer`. Up to three checks per post — on the third
   failed check, stop working on this post, say which post and why, and
   carry on with the rest of the run. Never attempt a fourth.
6. No objections → call `brief_finalize` with the brief's id and, per
   frame, its `order` and the designer's `generation_prompt`. Keep each frame's `asset_ids` from the designer for
   section 6 — they are not part of the brief.

## 6. Make the pictures

Read the brand's saved look per post, with `context_get(role:
"art_director", campaign_id: <the post's campaign, if it has one>)` — not
once for the whole run, for the reason `/plgn month`'s image step sets out:
a read with no campaign cannot see that campaign's own references. If
nothing is saved, say so once for the run and offer `/plgn visuals`, which
works the look out from pictures the brand already published, then carry on
without it.

When the brand holds a canonical reference, call
`generate_image_from_image` with it, for every frame. Otherwise call
`generate_image`. See **visual-identity** for why the two are different.
Either way, carry `post_id`, `brief_id` and `slide_order` on the call, and
use each frame's finalized image text from section 5.

**A frame built around the brand's own things names them.** When the
designer gave a frame `asset_ids`, call `generate_image_from_image` with
those as `asset_ids` — alongside the canonical reference in `input_urls`
when there is one, and on their own when there is not. The server adds each
asset's main picture itself; never paste an asset's URL into `input_urls`.
See **brand-assets**. If the call refuses an asset, it says which and why:
say so in one line, make that frame without it, and carry on.

If the read shows no assets at all and the brand plainly has some — a logo
on its site, a mascot in its posts — say so once for the run and offer
`/plgn assets`.

Then follow the **image-prompting** skill's waiting cycle exactly — point at
it, do not restate it here.

## 7. Attach

Once a post's frames are made, send `plgn-visual` the post and its frames,
the brand's voice from the copywriter read in section 3, and each frame's
final image text and `alt_text_hint` from `plgn-designer` — per
**_conventions** rule 6, the agent cannot see this file, so all of it goes
in the prompt. It writes the alt text per frame.

Then call `post_update` with the media in frame order — each item's alt
text in its `alt` field — **and** `brief_id`
set to the brief these pictures came from. `media[0]` is the cover, so the
order matters and is the frame order. The `brief_id` is the only thing that
joins the post to its thinking: leave it off and `/plgn why` reads back
nothing for a picture this command just made, and approving the post
records nothing about what worked.

## 8. Say what happened

Counts first: pictures made, points spent, posts skipped and why, posts
that needed a person. Then, for each post that got a picture, print its idea
in one sentence — that is the part a user can actually agree or disagree
with.

```
7 pictures made across 4 posts · 7 points spent, 17 left

  "The 90-minute review" — a rope under tension, for the strain of a
  packed calendar

  1 needed a person — "Why we cut prices" failed its check three times
  2 skipped — they read better plain
```

## Notes

- **No seam.** This user is already signed up.
- **Never remake an image because you don't like it.** A second payment for a
  small improvement is waste. Remake only when one actually failed.
- **Never spend before asking.** Points are money.
- **Never ask for words inside an image** — no text, logos or labels. Generated
  text comes out wrong, and a misspelt word is worse than no image.
- **Alt text always.** Every attached image carries it.
- Replies follow the **reply-style** skill, including the user's language.
