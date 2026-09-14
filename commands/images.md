---
description: Find posts with no image, plan and make one for each, and attach the results — with the credit cost stated before anything is spent. Supports --dry-run. Use for "generate images", "my posts need images", or filling in artwork before a month goes out.
---

# /plgn images

Fill the empty image slots, on purpose and at a stated cost.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Check the image setup. If `kie_key_set` has no key and the workspace has no
credits, say what is missing and stop — point them at the dashboard, never ask
for a key in the terminal. Same for `cloudinary_connect`: without storage, new
images have nowhere to live.

## 2. Find the gaps

Call `post_list` and `list_images` to find posts with no picture.

Say what you found and how many are worth filling:

```
7 posts have no image · 24 credits available
```

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

**Before any thinking starts.** Every post left after step 3 carries a frame
count — its saved `planned_slides`, or 1 for a single picture — so the total
for the whole run is already known:

```
9 pictures for 5 posts (one is a 4-frame carousel).
9 credits, leaving 15.
yes / pick / no
```

Images spend from a real balance, and this states the whole run's bill, not
one post's. If the number is more than the workspace has, say so and offer to
do the most valuable posts rather than stopping halfway with no explanation.

`--dry-run` stops here and spends nothing.
**`--yes` is not accepted by this command.** It spends credits.

## 5. Per post: read, think, check, save

Once the user says yes, work through the posts one at a time, in this order,
for each one. This is the **creative-brief** skill's four steps in two calls
— read it before changing anything here.

1. Read `context_get(role: "creative_director", campaign_id: <the post's
   campaign, if it has one>)`.
2. Send `plgn-creative-director` that block, the caption, the offering's
   benefits, the campaign's constraints and vocabulary if this post runs
   inside one, the `Already done` lines from the read, and the post's frame
   count. Per **_conventions** rule 6, all of it goes in the prompt — the
   agent cannot see this file.
3. Call `brief_create` with what it returned, plus `knowledge_used` copied
   from the end of the `context_get` read.
4. Read `context_get(role: "designer", campaign_id: <the post's campaign, if
   it has one>)` for the brand's identity and picture rules. Send
   `plgn-designer` the concept, the frames, that block, and what carries each
   frame, as step 3 above resolved it.
5. A frame that fails a check comes back as objections, not a picture. Call
   `brief_update` with them and a **different idea** — one `plgn-creative-
   director` already scored and did not pick — then send the result back to
   `plgn-designer`. **Three times at most.** On the third failed check, stop
   working on this post, say which post and why, and carry on with the rest
   of the run. Never a fourth `brief_update`.
6. No objections → call `brief_finalize` with the final image text per
   frame.

## 6. Make the pictures

Read the brand's saved look once for the whole run with
`context_get(role: "art_director")`. If nothing is saved, say so once and
offer `/plgn visuals`, which works the look out from pictures the brand
already published, then carry on without it.

When the brand holds a canonical reference, call
`generate_image_from_image` with it, for every frame. Otherwise call
`generate_image`. See **visual-identity** for why the two are different.
Either way, carry `post_id`, `brief_id` and `slide_order` on the call, and
use each frame's finalized image text from step 5.

Then follow the **image-prompting** skill's waiting cycle exactly — point at
it, do not restate it here.

## 7. Attach

Once a post's frames are made, send `plgn-visual` that post's final image
text and frame descriptions, so it can write the alt text per frame. Then
call `post_update` with the media in frame order. `media[0]` is the cover, so
the order matters and is the frame order.

## 8. Say what happened

Counts first: pictures made, credits spent, posts skipped and why, posts
that needed a person. Then, for each post that got a picture, print its idea
in one sentence — that is the part a user can actually agree or disagree
with.

```
7 pictures made across 4 posts · 7 credits spent, 17 left

  "The 90-minute review" — a rope under tension, for the strain of a
  packed calendar

  1 needed a person — "Why we cut prices" failed its check three times
  2 skipped — they read better plain
```

## Notes

- **No seam.** This user is already signed up.
- **Never remake an image because you don't like it.** A second credit for a
  small improvement is waste. Remake only when one actually failed.
- **Never spend before asking.** Credits are money.
- **Never ask for words inside an image** — no text, logos or labels. Generated
  text comes out wrong, and a misspelt word is worse than no image.
- **Alt text always.** Every attached image carries it.
- Replies follow the **reply-style** skill, including the user's language.
