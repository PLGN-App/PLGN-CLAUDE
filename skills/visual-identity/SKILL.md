---
name: visual-identity
description: Use when working out how a brand's pictures look and making later images match — reading references, writing the visual direction, storing it, or applying it before generating an image. Covers what a direction contains, how to see an image that lives at a URL, and what to do when the references disagree.
---

# How a brand looks

A brand that has a voice and no look produces posts that read right and look
like stock. This is the other half.

A **visual direction** is a written record of how a brand's pictures work,
taken from pictures it has already published. It is not a mood board and not a
preference. Like voice, it is read off real material.

## What a direction contains

Ten fields. Each carries the evidence it came from.

| Field | What it records |
|---|---|
| **palette** | The colours, as hex values, with rough proportions and how backgrounds are treated |
| **composition** | Where the subject sits, how tight the crop is, how much empty space, where text can safely go |
| **light** | Direction, hardness, warm or cool, how shadows behave |
| **medium** | Photograph, illustration, 3D render or collage — and the camera feel: wide or long lens, shallow or deep focus, grain |
| **subject** | What actually appears. When there are people, who they are and what they are doing |
| **finish** | Matte or glossy, flat or gradient, texture, the colour grade |
| **textInImage** | Whether words appear at all, where, how heavy, upper or lower case |
| **never** | What these pictures never contain |
| **promptPreamble** | A block appended to every later image description, plus what to exclude |
| **canonicalReference** | The one image that best represents the set |

**The `never` field carries more weight than it looks.** A brand whose pictures
never show a face, never use pure white, or never contain a logo has an
identity built on those refusals. Getting a refusal wrong is what makes a
generated image feel like a different company.

## Reading the references

At least three. Fewer than three is a sample, not a pattern — say so rather
than dressing a guess up as a direction.

**A local file or a screenshot** is read directly with `Read`, which shows the
image.

**An image at a URL** — including the images already in a workspace, which
`list_images` returns as URLs — takes two steps:

1. `WebFetch` the URL. It will answer **"NO IMAGE VISIBLE"**. That is not a
   failure. It saves the binary to a local file and names that path in its
   result.
2. `Read` that saved path. The image is now visible.

Both steps are needed. `WebFetch` alone never sees a picture, and `Read` cannot
take a URL.

**If a reference cannot be seen, say so and leave it out.** Never describe an
image from its filename, its alt text, or the caption of the post it belongs
to. A direction built from a picture nobody looked at is worse than no
direction, because everything downstream trusts it.

## When the references disagree

They will, and it usually means something real: a rebrand, a new designer, or
two people posting without a shared rule.

**Never average them.** Averaging two identities produces a third that belongs
to nobody, and every generated image afterwards is slightly wrong in a way
nobody can name.

Report the clusters instead:

```
Your references split in two.

  Six images — flat illustration, two colours, no photography
  Three images — warm photography, shallow focus, people

Which is current?
yes / pick / no
```

Then build the direction from the chosen cluster, and note what was set aside.

## Storing it

One entry, per the **brand-knowledge-map** skill: type `brand_voice`, title
`Visual direction`, metadata `{ "kind": "visual" }`.

The canonical reference is saved as a real image with
`upload_image_from_url` or `upload_image_base64`, so it can be reached later.

## Using it

Before any image is made, read the direction and apply it:

- Put the **promptPreamble** into every image description, ahead of the
  subject.
- Apply **never** as the exclusion list.
- When an exact match matters — a series, a campaign, a carousel — use
  `generate_image_from_image` with the **canonicalReference** rather than
  describing the style again in words. A reference image holds detail no
  sentence carries.

The **image-prompting** skill owns the mechanics of generating. This skill owns
what the picture should look like before that starts.

## Honest limits

- Colours read off a compressed screenshot are close, not exact. Say "about
  this" rather than publishing a hex value as though it came from a brand book.
- A direction from three references is thinner than one from twelve. Say which.
- A picture nobody could see is not evidence.
