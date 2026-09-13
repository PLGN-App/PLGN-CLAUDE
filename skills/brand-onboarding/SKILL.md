---
name: brand-onboarding
description: Use when capturing what plgn knows about a brand — a first setup, a full brand kit, a re-read after a repositioning, or filling gaps in an existing profile. Covers which sources to trust in what order, how many questions to ask, what order to save in, and how to run twice without duplicating anything.
---

# Capturing a brand

The job is to end with a brand profile sharp enough to write from, having asked
the user as little as possible.

Two people run this and both must finish. Someone setting up their first brand
cannot answer "what is your differentiated point of view?". Someone who has run
brand workshops for a decade will not retype what is already on their website.
The same method serves both: **read everything first, then ask only what
reading could not answer.**

## 1. The source ladder

Use every rung available, best first.

| Rung | Source | What it gives |
|---|---|---|
| 1 | The brand's own published posts | Real voice and real look, as actually used |
| 2 | The website — homepage, about, pricing, one product page, one article | Positioning, offers, proof, marketing voice |
| 3 | Brand guidelines, a style guide, a deck the user points at | Stated rules, palette, taboos |
| 4 | Competitor sites, three to five | Contrast and gaps — **never voice** |
| 5 | The user's own answers | Only what no source can show |

**The rule that governs all five:**

> Sources beat opinions for how a brand sounds. Opinions beat sources for what
> a brand intends.

Nobody describes their own voice accurately. Ask ten founders and nine say
"professional but friendly". Their published copy tells the truth. But no
document knows they are dropping a product line in March — only they do.

Never take voice from a competitor. Competitors show you what is crowded and
what nobody says. Borrow either and the brand sounds like the market.

## 2. Evidence and confidence

Every claim you draft carries three things:

- **The claim**, written so a writer could follow it.
- **The evidence** — a short quote, or the reference it came from.
- **A confidence** — high or low.

**No evidence, no save.** A claim with nothing behind it becomes a question, or
a stated assumption. It never becomes a saved entry, because a saved entry
looks like fact to every command that reads it afterwards.

## 3. Ask at most five questions

One block. Five questions. Each with an answer already filled in.

This cap is the whole method:

- A beginner reads five questions that are already answered, and says yes.
- A professional ignores the defaults, edits four, and finishes just as fast.

Neither is handed a blank page.

Choose the five by **how much breaks if you get it wrong**:

1. **Banned words** — every post is checked against them
2. **Offer names** — wrong names make every call to action wrong
3. **Audience level** — decides the jargon in every post
4. **Languages and timezone** — one question, because they are the same
   decision: where this brand publishes, and therefore in what language and at
   what hour. Both are invisible when wrong and expensive when wrong.
5. **Any place two sources disagree** — never average them, always ask

Anything past the fifth is **printed as a stated assumption**, per the
**reply-style** skill. Never guessed in silence.

## 4. The write order

Seven steps, in this order, because each one is readable by the next.

Where each of these is stored is the **brand-knowledge-map** skill's job.
Read it before writing. Banned words in particular are not knowledge.

### 1. The brand record

```
brand_update(
  languages: ["en", "ar"],
  bannedWords: [...],
  timezone: "Africa/Cairo"
)
```

First, because banned words are enforced from the moment they are saved. A run
that writes posts before saving them writes posts nothing checked.

Ask for the timezone if the site does not say. "Where do you post from?" is a
question a person can answer; a wrong timezone is a nine o'clock post that
lands at two in the morning.

### 2. Foundation — three entries, three approvals

`voice_tone`, `audience`, `brand_positioning`. One `knowledge_add` each, with
`confirm: true`, sent only after the user's yes — never before it.

Show the drafted text. Get a real yes. Then save. Foundation is what every
future post reads.

Draft all three first and show them together — three approvals in a row is one
conversation; three write-then-ask cycles is an interrogation.

### 3. Offerings

One `offering_create` per product or service:

```
offering_create(
  name: "...",
  kind: "product",       // or "service" — ask if the site does not say
  role: "hero",          // exactly one hero; the rest are "supporting"
  benefits: [{ label: {...}, meanings: [...], avoidCliches: [...] }]
)
```

**Ask which it is when the site does not say.** "A product or a service?"
takes one line — see **brand-knowledge-map** for what each kind carries.

Fill in `meanings` and `avoidCliches` for every benefit — see
**brand-knowledge-map** for why a label on its own is not enough.

The free plan caps how many offerings a brand can hold — see
**brand-knowledge-map** for the number. If the brand sells more, save the ones
that matter most, say which you saved and which you did not, and say what
raising the cap costs. Never drop one silently.

### 4. The look

`brand_identity`, with `confirm: true` after the yes. See **visual-identity**
for the ten fields, where each one goes, and why the canonical reference is
`assets[0]`.

Skip it rather than guess it — see **visual-identity** for how many real
references a direction needs before it counts as one.

### 5. Business

`competitor` — **one entry each**, not one entry listing five. A competitor you
can read on its own is a competitor a later run can update.

Then `seo_rules`, `proof`, `objection`, and any `example_post` worth imitating.
No `confirm` here: Business is not Foundation.

The free knowledge cap applies here too, and Foundation has already spent
three or four of it — see **brand-knowledge-map** for the number. Count
before writing, and say what you left out.

### 6. Topics, 7. Library

`topic_create`, then `snippet_create` and `hashtagset_create`. Unchanged.

## 5. One plan, one question

Show everything, grouped by pass, then ask once:

```
Save all this?
yes / pick / no
```

`pick` drops a whole group or a single item. Six separate confirmations for one
command is worse than the thing being confirmed.

## 6. Running it twice

A brand that has already been set up refuses the second `voice_tone`,
`audience`, `brand_positioning` or `brand_identity`. **That is an instruction,
not a failure to report** — see **gate-recovery** for what a singleton
refusal means. Call `knowledge_update` on the id the refusal names, with a
`note` saying what changed. Never add a second entry under a different title.

Offerings and Business entries have no such rule, so a second run must check
before writing: read `offering_list` and `knowledge_get` first, and update
what is there rather than adding a near-duplicate beside it.

A second run must never leave a brand with two voices.

## 7. The bar an entry has to clear

> Could two writers follow this and produce opposite copy?

If yes, it is too vague to save. "Professional and friendly" fails. "Short
sentences, no exclamation marks, never opens with a question" passes.

Vague guidance is worse than none, because it reads like direction and gives
none. **Four sharp entries beat nine soft ones.**

Posts saved as examples get checked first — a bad example poisons every draft
that later learns from it.

## Never

- Invent a voice or a look with no source. Say the profile cannot be filled
  responsibly and stop.
- Take voice from a competitor.
- Average two conflicting identities into a third one nobody owns.
- Write anything before the confirmation.
- Ask for a key, a token or a password.
