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

## Where a direction is stored

One entry, of type `brand_identity`. A brand holds exactly one — it is a
Foundation singleton — so there is no question of which one is current.

```
knowledge_add(
  type: "brand_identity",
  title: "Visual direction",
  content: <the direction, written out for a person to read>,
  metadata: {
    palette: [{ name: "ink", hex: "#1A1033" }, ...],
    composition: "...",
    light: "...",
    medium: "...",
    subject: "...",
    finish: "...",
    textInImage: "...",
    never: ["stock smiles", "pure white backgrounds"],
    promptPreamble: "..."
  },
  assets: [{ secure_url: ..., public_id: ... }],
  confirm: true
)
```

Three things about that call are not obvious and all three matter.

**`content` is for a person.** It is what someone reads on the Knowledge page
to understand the look. Write it as prose.

**`metadata` is for the machine.** Nine of the ten fields live here as keys.
An art director reads them back through `context_get`; a field written into
`content` instead is a field no image generation will ever use.

**`assets[0]` is the canonical reference** — the one image that best represents
the set. Upload it first with `upload_image_from_url`, then attach what that
returns. It is `assets[0]` specifically, not "one of the assets": the command
that generates a matching image reaches for the first one.

**`confirm: true`, and only after the user has said yes.** `brand_identity` is
Foundation. Show the direction, get a real yes, then save.

**A second one is refused.** The refusal carries the existing entry's id — that
is the instruction to use `knowledge_update` on it, not a failure to report.
Re-running `/plgn visuals` on a brand that already has a look updates it.

## Rules that are refusals, not descriptions

The `never` list is a refusal, and a refusal is not the same shape as a
description. Keep it in `metadata.never` on the `brand_identity` entry.

Rules that are about **pictures in general** rather than about this brand's
look — "no faces of real customers", "no competitor logos" — belong in a
separate `visual_rules` entry, also Foundation, also with a `never` list. The
split matters because a direction can be replaced when the brand is
redesigned; those refusals usually survive it.

## Reading it back before making an image

```
context_get(role: "art_director")
```

That returns the palette, the `never` list, the picture rules, and an **anchor
hint** — the one product picture a new image should sit next to. It is one
read, and it is the read to make before every generation.

Never rebuild the direction by reading entries one at a time. `context_get`
puts Foundation first, which is the order that matters: the `never` list has to
be in hand before the description is written, not applied to it afterwards.

## Making a picture that matches

`generate_image_from_image` takes the canonical reference — `assets[0]` on the
`brand_identity` entry — and a description. That pairing is what makes a new
picture look like the same brand rather than like the same words.

Use it when there is a canonical reference. Fall back to `generate_image` with
the `promptPreamble` prepended when there is not, and say in the reply that the
match will be looser.

The **image-prompting** skill owns the mechanics of generating. This skill owns
what the picture should look like before that starts.

## A look for one campaign only

"Make everything gold for Ramadan" is not the brand's look. Saved as
`brand_identity` it **replaces** the permanent one — a singleton has no second
slot — and the brand comes out of Ramadan looking like Ramadan.

It is two things instead:

1. A **Campaign** — `campaign_create(name: "Ramadan 2027", startsAt, endsAt)`
   — which carries the dates and ends on its own.
2. A **`reference`** entry linked to it, with the picture attached and an
   `intent` in its metadata saying what to take from it.

```
knowledge_add(
  type: "reference",
  title: "Ramadan look",
  content: "...",
  campaignId: <the campaign>,
  assets: [...],
  metadata: { intent: "the warm gold and the low light, not the lanterns" }
)
```

`intent` is required — the server refuses a `reference` without one. That is
deliberate: a reference with no stated intent is a template, and a template is
how every brand's Ramadan post ends up identical.

## Honest limits

- Colours read off a compressed screenshot are close, not exact. Say "about
  this" rather than publishing a hex value as though it came from a brand book.
- A direction from three references is thinner than one from twelve. Say which.
- A picture nobody could see is not evidence.
