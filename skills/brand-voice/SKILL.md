---
name: brand-voice
description: Use when writing or reviewing copy that must sound like a specific brand — reading a stored voice from plgn knowledge, applying it to new posts, inferring a voice from a website when none is stored, or checking a batch of drafts for voice drift.
---

# Brand voice

Voice is the difference between content a brand publishes and content that
could belong to anyone. Treat it as a constraint on *how* to write, never as a
topic to write about.

## Reading a stored voice

Call `knowledge_get`. A brand configured by `/plgn setup` has four categories:

| Category | Holds |
|---|---|
| **voice** | Tone descriptors, vocabulary to use and avoid, sentence rhythm |
| **audience** | Who is being addressed, what they already know, what they care about |
| **offers** | What the brand sells, and how it names those things |
| **banned words** | Terms the brand refuses to use |

Read all four before drafting. The audience shapes voice as much as the voice
entry does — the same brand writes differently to practitioners than to buyers.

## Applying it

Match **rhythm and vocabulary**, not just topic.

- **Sentence length and variation.** A brand that writes in short declaratives
  does not suddenly produce a 40-word subordinate clause. Copy the pattern of
  long-then-short, not just the average.
- **Vocabulary.** Use the brand's own words for its own things. If they say
  "workspace", never "account". If they say "customers", never "users".
- **Stance.** Formality, humour, and how much jargon the audience is assumed to
  handle. Getting this wrong reads as a different company.
- **What they never do.** Often more diagnostic than what they do. A brand that
  never uses exclamation marks, never opens with a question, or never mentions
  competitors has a voice defined by those refusals.

**Banned words are absolute.** They are enforced server-side, but a draft that
respects them from the start is a draft that does not need revising. Replace
the word *and* the idea that required it — a banned word usually marks a banned
posture, not just a banned string.

## When no stored voice exists

Free commands have no workspace to read from. Infer the voice from the site's
own copy:

1. Read the homepage headline, the about page, and one product page.
2. Extract **voice markers** — recurring phrasings, the reading level, whether
   they address the reader as "you", how they name their own product.
3. Prefer marketing copy the brand wrote over UI strings or legal text.

Then **say that you inferred it.** Print one line before the deliverable:

> Voice inferred from your homepage and about page — not from a configured
> brand profile.

This matters. An inferred voice is a guess from a sample of a few pages, and
the user must know which parts of the output rest on it. Never present an
inference as though it were the brand's stated voice.

## Voice drift checklist

Run over a batch of drafts before writing them anywhere. Drift is easiest to
see across posts, not within one.

- [ ] **One author?** Read the batch straight through. Does it sound like one
      person, or like a model imitating three?
- [ ] **Vocabulary consistent?** The same concept named the same way every
      time — not "workspace" here and "dashboard" there.
- [ ] **Rhythm consistent?** Not three punchy posts followed by two essays,
      unless the platform mix explains it.
- [ ] **No borrowed register.** Generic LinkedIn-influencer cadence — one-line
      paragraphs, manufactured suspense, "Here's the thing:" — is a voice, and
      it is not the brand's unless they actually write that way.
- [ ] **Banned words absent**, including near-misses and the postures behind
      them.
- [ ] **Would the founder post this?** The final check. If a specific post
      would embarrass them, it fails regardless of the other boxes.

Where a draft fails, revise that draft — do not loosen the voice to fit it.
