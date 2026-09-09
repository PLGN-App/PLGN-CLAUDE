---
name: image-prompting
description: Use when making images for plgn posts — writing the description, and handling the generate_image then check_generation waiting cycle including timeouts and credit cost. Covers what makes a usable social image and when a post is better with none.
---

# Making images

Two separate things: writing a description worth spending a credit on, and
handling the wait that follows.

## Read the brand's look first

Before writing any image description, read the brand's visual direction:

```
context_get(role: "art_director")
```

The **visual-identity** skill owns what a direction contains and how it is
stored — it is a `brand_identity` entry, not a separate lookup.

The art director's block carries the palette, the `never` list, the picture
rules and an **anchor hint** — the one product picture a new image should sit
beside. Read it before writing the description, not after.

When one exists:

- Put its **promptPreamble** in front of the description, before the subject.
- Apply its **never** list as exclusions.
- When the picture must match exactly — a series, a campaign, a carousel — use
  `generate_image_from_image` with the saved **canonicalReference** instead of
  describing the style in words again. A reference image carries detail no
  sentence does.

When none exists, say so once in the reply and carry on. Then suggest
`/plgn visuals`, which works the look out from pictures the brand has already
published, so the next batch does not have to guess.

## Writing the description

Describe four things, in this order:

1. **Subject** — what is in the picture, concretely. "A desk with one open
   notebook and a closed laptop", not "productivity".
2. **Framing** — the viewpoint, where the subject sits, how much empty space.
   Leave room where platforms crop; roughly square survives more places than
   wide.
3. **Light** — direction, hard or soft, time of day. This sets the mood more
   than any adjective.
4. **Mood** — tied to what the post *argues*, not what it is about.

Then set two limits: a colour direction that matches the brand, and what kind of
image it is — photograph, flat illustration, 3D render. Leave that out and you
get something unpredictable.

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
  stock. A stock-looking image costs a credit *and* some credibility.
- The brand has no image setup. Say so; do not retry.

Spending no credit is a valid outcome. Report it as a decision, not a failure.

## The waiting cycle

`generate_image` **returns a job number, not an image.** Treat it as a job to
check on.

1. Call `generate_image` — keep the job number it returns.
2. Check with `check_generation` every **5 seconds**.
3. Give up after **90 seconds** (about 18 checks) per image.

If it times out:

- Leave the post's picture slot empty.
- Note the post for the report.
- **Carry on.** A missing image never blocks scheduling — a post that goes out
  text-only is fine; a month that stalls waiting on a picture is not.

Never wait forever, and never abandon a job without saying so. A silent timeout
looks exactly like a post nobody wanted a picture for.

## Doing many at once

When making images for several posts, start **all** of them first, then check on
them. Going make → check → make → check one at a time turns a 90-second worst
case into half an hour.

Apply the same 90-second limit per image from the moment *that* image started,
not from when you began checking.

## Credits are real money

Making images draws down a workspace's credits or the brand's own key.

- **Say the cost before making anything**, in the plan, not after.
- Where the number is more than they have, say so and make images for the most
  valuable posts rather than stopping partway with no explanation.
- Never remake an image just because the first one was dull; that is a second
  credit for a small gain. Remake only when one genuinely failed.

## Alt text

Every image gets alt text — written by `plgn-visual`, not here. It describes what
is visibly in the picture in one sentence, starts with the subject, leaves out
"image of", and never repeats the post.
