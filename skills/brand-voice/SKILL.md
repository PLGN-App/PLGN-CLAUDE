---
name: brand-voice
description: Use when writing or checking copy that must sound like a specific brand — reading a saved voice from plgn, applying it to new posts, working one out from a website when none is saved, or checking a batch of drafts for drift. This is about the brand's posts, not about how plgn talks to the user.
---

# Brand voice

Voice is the difference between content a brand publishes and content that could
belong to anyone. Treat it as a rule about *how* to write, never as a subject to
write about.

**This skill is about the posts.** How plgn talks to the user in chat is a
different thing entirely, and the **reply-style** skill owns it. Never apply a
brand's voice to a reply, and never apply reply rules to a post.

## Reading a saved voice

Call `knowledge_get`. A brand set up by `/plgn setup` has four entries:

| Entry | Holds |
|---|---|
| **voice** | Tone, words to use and avoid, sentence rhythm |
| **audience** | Who is addressed, what they know, what they care about |
| **offers** | What the brand sells, and what it calls those things |
| **banned words** | Words the brand refuses to use |

Read all four before writing. The audience shapes the voice as much as the voice
entry does — the same brand writes differently to people who do the work than to
people who buy it.

## Applying it

Match the **rhythm and the words**, not just the subject.

- **Sentence length and variety.** A brand that writes in short flat statements
  does not suddenly produce a 40-word sentence. Copy the pattern of long-then-
  short, not just the average.
- **Their words for their things.** If they say "workspace", never "account". If
  they say "customers", never "users".
- **Where they stand.** How formal, how funny, and how much specialist language
  the audience is assumed to handle. Getting this wrong reads as a different
  company.
- **What they never do.** Often more telling than what they do. A brand that
  never uses exclamation marks, never opens with a question, or never mentions
  competitors has a voice built on those refusals.

**Banned words are absolute.** The server enforces them, but a draft that
respects them from the start is a draft nobody has to fix. Replace the word *and*
the idea that needed it — a banned word usually marks a banned attitude, not just
a banned string.

## When no voice is saved

Free commands have no account to read from. Work the voice out from the site's
own copy:

1. Read the homepage headline, the about page, and one product page.
2. Pull out **voice markers** — repeated phrasings, how hard it is to read,
   whether they say "you", what they call their own product.
3. Prefer marketing copy the brand wrote over interface text or legal text.

Then **say that you worked it out.** Print one line before the result:

> This voice is my read of your homepage and about page — not a saved profile.

This matters. A worked-out voice is a guess from a few pages, and the user must
know which parts of the output rest on it. Never present a guess as though it
were the brand's stated voice.

## Checking a batch for drift

Run this over a set of drafts before saving them anywhere. Drift shows up across
posts, not within one.

- [ ] **One writer?** Read the batch straight through. Does it sound like one
      person, or like a model imitating three?
- [ ] **Same words for the same things?** Not "workspace" here and "dashboard"
      there.
- [ ] **Same rhythm?** Not three short punchy posts followed by two essays,
      unless the platform mix explains it.
- [ ] **No borrowed style.** Generic influencer rhythm — one-line paragraphs,
      manufactured suspense, "Here's the thing:" — is a voice, and it is not this
      brand's unless they actually write that way.
- [ ] **No banned words**, including close variants and the attitude behind them.
- [ ] **Would the founder post this?** The last check. If one post would
      embarrass them, it fails whatever the other boxes say.

Where a draft fails, fix that draft — do not loosen the voice to fit it.
