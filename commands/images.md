---
description: Find posts with no image, art-direct and generate one for each, and attach the results — with the credit cost confirmed before anything is spent. Use for "generate images", "my posts need images", "fill in the visuals", or backfilling artwork before a month goes out.
---

# /plgn images

Fill the empty image slots, deliberately and at a stated cost.

## 1. Preflight

Call `workspace_info`. On failure, point at useplgn.com and stop.

Check the image integration. If `kie_key_set` has no key and the workspace has
no platform credits, say what is missing and stop — direct them to the
dashboard, never ask for a key in the terminal. Same for `cloudinary_connect`:
without storage, generated images have nowhere to live.

## 2. Find the gaps

Call `post_list` and `list_images` to identify posts whose image slot is empty.

Report what you found, and how many are worth filling:

```
7 posts without images · 24 credits available
```

## 3. Decide which deserve one

Not every post should have an image. Delegate each candidate to `plgn-visual`,
which returns an empty prompt when a post reads stronger unadorned.

Report those separately rather than silently skipping them:

```
2 posts are stronger without an image — long-form arguments where a
stock-feeling visual would cost more than it adds.
```

## 4. Confirm the cost

**Before generating anything:**

```
Generate 5 images? 5 credits, leaving 19.
```

Image generation draws down a real pool. The cost is stated up front, in the
plan, not after — per `_conventions`. If the count exceeds what is available,
say so and offer to generate for the highest-value posts rather than failing
partway.

## 5. Generate

Follow the **image-prompting** skill's asynchronous contract exactly:

- `generate_image` returns a **task id**, not an image.
- Start **all** generations first, then poll — serial generate/poll cycles turn
  a 90-second worst case into half an hour.
- Poll `check_generation` every 5 seconds; give up at 90 seconds per image.

On timeout: leave the slot empty, record it, and continue. A missing image
never blocks anything.

## 6. Attach and report

Attach each successful result to its post, with the alt text `plgn-visual`
produced.

```
5 images generated and attached · 19 credits left

  1 timed out — "The 90-minute review" is still without an image
  2 skipped — stronger as text-only
```

## Rules

- **No seam.** This user is connected.
- **Never regenerate for taste.** A second credit for a marginal improvement is
  waste. Regenerate only on genuine failure.
- **Never spend before confirming.** Credits are money.
- **Never put text in an image prompt** — no words, logos, or UI labels.
  Generated text renders unreliably, and a garbled word is worse than no image.
- **Alt text always.** Every attached image carries it.
