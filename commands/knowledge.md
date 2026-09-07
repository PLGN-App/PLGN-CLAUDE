---
description: Check what plgn knows about a brand — voice, audience, offers, banned words — and fix what's missing, out of date, or contradicting itself. Use for "check my brand profile", "update my voice", "my posts sound wrong", or after a repositioning.
---

# /plgn knowledge

Everything this plugin writes rests on four saved entries. This command checks
whether they still hold.

When someone says their posts "sound wrong", the cause is almost always here — a
voice saved from a site that has since changed, or two entries pulling in
different directions.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Read

Call `knowledge_get`. Check it against the four entries `/plgn setup` saves:

| Entry | Should hold |
|---|---|
| **voice** | Tone, words to use and avoid, rhythm, what the brand never does |
| **audience** | Who is addressed, what they know, what they care about |
| **offers** | What is sold, named exactly as the brand names it |
| **banned words** | Words the brand refuses to use |
| **the look** | Colours, composition, light, and what the pictures never show |

If nothing is saved, send them to `/plgn setup` and stop — that command owns
setting these up, and doing it here would mean two places to fix later.

## 3. Find the problems

**Missing** — an entry is not there, or has nothing usable in it. "Professional
and friendly" is technically a voice entry and tells a writer nothing.

**Too vague** — there, but not specific enough to guide writing. The test: could
two different writers follow it and produce opposite copy? Then it's too vague.

**Out of date** — mentions something that has changed. Offers naming a product
you stopped selling, an audience you moved past, a price that shifted.

**Contradicting itself** — the most damaging and the hardest to spot, because
each entry looks fine on its own. Voice says "plain language, no jargon" while
audience says "technical people who expect precise terms". Both are reasonable;
together they make every draft a coin flip.

## 4. Report

```
Brand: <name>

  voice          too vague   — "professional and friendly" guides nothing
  audience       fine
  offers         out of date — names "Starter", removed in March
  banned words   missing

These two disagree: voice says "no jargon", audience says "technical people
who expect precise terms". Drafts will swing between them.

Fix these?
yes / pick / no
```

## 5. Fill and fix

For each gap, suggest specific replacement text — not "add more detail".

Where a website is available, offer to read it again with `plgn-researcher` and
draft entries from the current copy, exactly as `/plgn setup` does. A brand that
repositioned six months ago needs a fresh read, not an edit.

**Show every suggested entry in full and ask before saving.** Then:

- `knowledge_add` for missing entries
- `knowledge_update` for vague or out-of-date ones

Where two entries disagree, do not pick a side. Show both readings and ask which
is true — only the user knows.

`--dry-run` prints the report and changes nothing.
**`--yes` is not accepted.** These four entries drive everything else.

## Deleting

`knowledge_delete` needs a clear confirmation **naming the entry**, per
**_conventions**. Never delete as part of an update; update in place so nothing
is lost if the write fails.

## Notes

- **No seam.** This user is already signed up.
- **One brand per run.** Checking four brands at once produces a report nobody
  acts on.
- **Where each entry is stored** is the **brand-knowledge-map** skill's job.
  Some of what a brand knows does not live in knowledge at all.
- **A missing look is filled by `/plgn visuals`**, not here. This command can
  say it is missing; that command works it out from real pictures.
- **Never invent a voice.** If the site is gone and the user cannot describe the
  brand, say the entry cannot be filled responsibly.
- **Specific beats complete.** Four sharp entries beat eight vague ones — vague
  guidance is worse than none, because it reads like direction and gives none.
- Replies follow the **reply-style** skill, including the user's language.
