---
name: creative-brief
description: Use inside /plgn images or /plgn month when a post needs a picture — the four steps that decide what the picture shows, the brief calls that record them before any image credit is spent, and the limit that stops a picture getting busier every round. Covers carousels as one idea over several frames. Not for image requests outside plgn.
---

# The creative brief

A **brief** is the record of the thinking behind a picture, saved before any
image is made. It answers "why does this look like this" months after the
post went out. It stops the same idea being offered to the same brand twice.
And it gives a failed check somewhere to go back to, instead of a picture
that just gets busier each round.

## The four steps

**1 · benefit → meanings.** `plgn-creative-director` takes the post's
benefit — the one thing it promises — and works out what that benefit could
mean to someone. A benefit has several meanings; naming more than one is the
point of this step.

**2 · ideas → the one.** `plgn-creative-director` turns each meaning into an
idea for the picture, then picks one. Every idea is kept, including the
losers, each with the reason it lost. The chosen idea is kept too, with why.

**3 · what carries the frame → direction.** `plgn-creative-director` writes
one direction per frame. What carries the frame is not this agent's call —
the server decides it from what the brand sells. See below.

**4 · check → final text.** `plgn-designer` checks the direction against the
brand and the brief, then writes the final image text per frame — or raises
objections if the direction doesn't hold up.

## Two calls, not four

Four steps, two calls. `brief_create` saves steps 1 through 3 in one call:
the benefit, the meanings, every idea and why each won or lost, and the
direction per frame. `brief_finalize` saves step 4, and only when step 4
passed: the final image text per frame, nothing else. It is refused while
any frame has no text, so it is not somewhere objections can go.

A failed check does not go back to `brief_create`, and it does not go to
`brief_finalize` either. It calls `brief_update` with the objections and a
**different idea**, taken from the ones already saved in step 2. Never the
same idea with more elements bolted on — that is exactly the pattern this
record exists to stop.

## Three checks, then stop

The command stops at three. On a third failed check it does not attempt a fourth
`brief_update` — it names the post that needs a person and carries on with
the rest of the run.

The server enforces the same cap as a backstop: a fourth `brief_update` is
refused, and the brief is marked failed. The two only have to agree; the
server is what actually enforces it.

Write the reason down, because it is not obvious: with no record of the
ideas that already lost, the only way left to answer an objection is to add
another element to the same idea. That is how a picture gets busy — one
small addition per round until nothing in it is doing any work.

## What makes a real idea

An idea is a metaphor with a territory — a concrete thing the picture could
actually show, that stands for the benefit without stating it. It carries a
score, and every idea that was rejected carries the reason it lost, not just
its name.

"A nice photo of the product" is not an idea. It names no metaphor and no
territory — it is the absence of one, dressed up as a starting point.

## What carries the frame is not yours to choose

The server resolves what carries the frame from what the brand actually
sells — not from what reads best or what's easiest to generate. Four
answers, and only one applies to a given brief:

- **A real photo** — the brand has a product with a photo of it.
- **A built object** — the brand has a product but no photo. The picture is
  made rather than shot, and the missing photo is a real gap worth naming
  back to the brand.
- **A scene** — a service brand with a written process. There is nothing to
  photograph, so the picture shows the process happening.
- **Type alone** — nothing to photograph and no process. The picture is
  words.

A service brand has nothing to photograph, and that is not a problem to work
around — it is the answer.

What carries the frame is about the **offering**. The brand's other real
things — a character, the shop, the founder — are its **assets**, and an idea
may be built around one whatever carries the frame. The director names the
asset, the designer checks it against the asset's own rules and lists its id,
and the command passes that id when the picture is made. See **brand-assets**.

## Carousels

A carousel is one idea carried over several frames, each frame with its own
job: hook, proof, how, ask. A single picture is a brief with exactly one
frame, so there is never a second way of building this — a carousel is not a
different procedure, it is the same one with more frames.

Default to 3 frames when someone asks for a carousel without saying how
many, and never more than 10.

## Cost

Every frame is a picture, and every picture is a charge. State the total
before the first call — frame count times the cost of one image, said
plainly, so nobody finds out how many frames they paid for after the fact.
