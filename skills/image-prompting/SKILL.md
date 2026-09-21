---
name: image-prompting
description: Use when making images for plgn posts — writing the description, and handling the generate_image then check_generation waiting cycle including slow jobs and points cost. Covers what makes a usable social image and when a post is better with none.
---

# Making images

Two separate things: writing a description worth spending points on, and
handling the wait that follows.

## Read the brand's look first

Before writing any image description, read the brand's visual direction:

```
context_get(role: "art_director")
```

The **visual-identity** skill owns what a direction contains and how it is
stored — it is a `brand_identity` entry, not a separate lookup.

Read it before writing the description, not after.

When one exists:

- Put its **promptPreamble** in front of the description, before the subject.
- Apply its **never** list as exclusions.
- Once **visual-identity** says a canonical reference exists, use
  `generate_image_from_image` with the saved **canonicalReference** instead of
  describing the style in words again — a reference image carries detail no
  sentence does.

When a frame is built around one of the brand's own things — a character, a
place, a person with consent — pass its id as `asset_ids` on
`generate_image_from_image` and never its URL. The server adds the asset's
main picture and records it; an asset marked not for AI pictures is refused
before anything is spent. See **brand-assets**.

When none exists, say so once in the reply and carry on. Then suggest
`/plgn visuals`, which works the look out from pictures the brand has already
published, so the next batch does not have to guess.

## Where the description comes from

The text handed to `generate_image` or `generate_image_from_image` is no
longer written here. It is the final image text from a **finalized brief** —
the four steps of benefit, meanings, idea and direction, checked and settled
before any points are spent. **creative-brief** owns all four steps and the
two calls that save them.

This skill starts once that text exists: it owns the wait for the image
those words produce, and what it costs.

## Never ask for words in the image

No text, letters, numbers, logos or interface labels. Generated text comes out
wrong — misspelt, malformed, subtly off — and a post carrying a broken word is
worse than a post with no picture at all.

The caption carries the words. The image carries the mood.

## Don't just draw the caption

A post about wasted planning time does not need a picture of a calendar. The
literal illustration is the first idea and almost always the weakest — it adds
nothing the reader just read.

Aim one step sideways: the mood of the argument, or what it leads to rather than
what it is about. Empty chairs after a meeting says more about wasted meetings
than a clock does.

## When to make nothing

Skip the image, and say why, when:

- The post is a written argument that reads stronger plain — common for long
  LinkedIn posts.
- The only description you can write is generic, and the result would look like
  stock. A stock-looking image costs points *and* some credibility.
- The brand has no image setup. Say so; do not retry.

Spending no points is a valid outcome. Report it as a decision, not a failure.

## The waiting cycle

`generate_image` **returns a job number, not an image.** Treat it as a job to
check on.

1. Call `generate_image` — keep the job number it returns.
2. Check with `check_generation` every **5 seconds**.
3. Stop checking after about **90 seconds** (about 18 checks) per image — but
   read what the last check said before deciding what that means.

`check_generation` reports `pending` with a **phase**. `waiting` or `queuing`
means the job is in line at the image service and can take several minutes;
`generating` means it is nearly done. A job that is still `pending` after 90
seconds **has not failed** — the points are already committed and the picture
will usually arrive. Only a `failed` result is a failure.

If it is still pending when you stop checking:

- Leave the post's picture slot empty for now, and keep the job number.
- Report it as **still running** — "still running, check again later" — never
  as failed. Give the post and the job number so it can be checked later with
  `check_generation`.
- **Carry on.** A missing image never blocks scheduling — a post that goes out
  text-only is fine; a month that stalls waiting on a picture is not.

If it failed, leave the slot empty and note the post and the reason for the
report.

Never wait forever, and never abandon a job without saying so. A silent stop
looks exactly like a post nobody wanted a picture for.

## Doing many at once

When making images for several posts, start **all** of them first, then check on
them. Going make → check → make → check one at a time turns a 90-second worst
case into half an hour.

Apply the same 90-second check window per image from the moment *that* image started,
not from when you began checking.

## Points are real money

Making images draws down the workspace's **points**. The cost is not one point
a picture: each image model has its own price. Call `workspace_info` and read
the `Image points` line (used, included, purchased) and the `Image models`
list (each model's points) — never assume a cost or a balance.

- **Say the cost before making anything**, in the plan, not after — frames ×
  the points of the model you will use.
- Where the number is more than they have, say so and make images for the most
  valuable posts rather than stopping partway with no explanation.
- Never remake an image just because the first one was dull; that is a second
  payment for a small gain. Remake only when one genuinely failed.

## Alt text

Every image gets alt text — written by `plgn-visual`, not here. It describes what
is visibly in the picture in one sentence, starts with the subject, leaves out
"image of", and never repeats the post.
