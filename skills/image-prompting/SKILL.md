---
name: image-prompting
description: Use when generating images for plgn posts — writing the prompt, and handling the asynchronous generate_image then check_generation polling cycle including timeouts and credit cost. Covers what makes a usable social image and when a post is better with none.
---

# Image prompting and generation

Two separate things: writing a prompt worth spending a credit on, and handling
the asynchronous generation that follows.

## Writing the prompt

Describe four things, in this order:

1. **Subject** — what is in frame, concretely. "A desk with one open notebook
   and a closed laptop", not "productivity".
2. **Composition** — framing, viewpoint, where the subject sits, negative
   space. Leave room where platforms crop; square-ish framing survives more
   placements than wide.
3. **Lighting** — direction, hardness, time of day. This sets mood more than
   any adjective.
4. **Mood** — tied to the post's *argument*, not its topic.

Then constrain: a colour direction consistent with the brand, and an explicit
medium — photograph, flat illustration, 3D render. An unstated medium produces
an unpredictable one.

## Never ask for text in the image

No words, letterforms, numbers, logos, or UI labels. Generated text renders
unreliably — misspelled, malformed, subtly wrong — and a post carrying a
garbled word is worse than a post with no image at all.

The caption carries the words. The image carries the mood.

## Do not illustrate the caption literally

A post about wasted planning time does not need a picture of a calendar. The
literal illustration is the first idea and almost always the weakest — it adds
nothing the reader just read.

Aim one step sideways: the mood of the argument, or its consequence rather than
its subject. Empty chairs after a meeting says more about wasted meetings than
a clock does.

## When to generate nothing

Skip the image, and say why, when:

- The post is a text-first argument that reads stronger unadorned — common for
  long-form LinkedIn.
- The only prompt available is generic, and the result would feel like stock.
  A stock-feeling image costs a credit *and* credibility.
- The brand has no configured image integration. Report it; do not retry.

Spending no credit is a valid outcome. Report it as a decision, not a failure.

## The asynchronous contract

`generate_image` **returns a task id, not an image.** Treat generation as a job
to be polled.

1. Call `generate_image` — keep the returned task id.
2. Poll `check_generation` with that id every **5 seconds**.
3. Give up after **90 seconds** (roughly 18 polls) per image.

On timeout:

- Leave the post's image slot empty.
- Record the post for the run's report.
- **Continue.** A missing image never blocks scheduling — a post that ships
  text-only is fine; a month that stalls waiting on a render is not.

Never poll indefinitely, and never abandon a task without reporting it. A
silent timeout looks identical to a post nobody wanted an image for.

## Batching

When generating for many posts, start all generations first, then poll. Issuing
generate → poll → generate → poll serially turns a 90-second worst case into a
30-minute one.

Apply the same 90-second ceiling per image from the moment that image's
generation started, not from when polling began.

## Credits are real

Image generation draws down a workspace's credit pool or the brand's own key.

- **State the cost before generating**, in the plan, not after.
- Where the count exceeds what is available, say so and generate for the
  highest-value posts rather than failing partway with no explanation.
- Never regenerate an image just because the first result was unexciting; that
  is a second credit for a marginal gain. Regenerate only on a genuine failure.

## Alt text

Every generated image gets alt text — it is written by `plgn-visual`, not here.
It describes what is visibly in the image in one sentence, leads with the
subject, omits "image of", and never repeats the post body.
