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

## 3. Decide which deserve one

Not every post should have a picture. Send each candidate to `plgn-visual`,
which returns nothing when a post reads better plain.

Per **_conventions** rule 6, put the post text, the brand's colours and its
audience into the agent's prompt.

Say which ones you are skipping, rather than quietly leaving them out:

```
2 posts read better without a picture — long arguments where a stock-looking
image would cost more than it adds.
```

## 4. Say what it costs, then ask

**Before making anything:**

```
Make 5 images? That's 5 credits, leaving 19.
yes / pick / no
```

Images spend from a real balance. The cost goes in the question, not
afterwards. If the number is more than they have, say so and offer to do the
most valuable posts rather than stopping halfway with no explanation.

`--dry-run` stops here and spends nothing.
**`--yes` is not accepted by this command.** It spends credits.

## 5. Make them

Follow the **image-prompting** skill exactly:

- `generate_image` returns a **job number**, not an image.
- Start **all** of them first, then check — one at a time turns a 90-second
  wait into half an hour.
- Check with `check_generation` every 5 seconds; give up at 90 seconds each.

If one takes too long: leave the slot empty, note it, and carry on. A missing
image never blocks anything.

## 6. Attach and report

Attach each finished image to its post, with the alt text `plgn-visual` wrote.

```
5 images made and attached · 19 credits left

  1 took too long — "The 90-minute review" still has no image
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
