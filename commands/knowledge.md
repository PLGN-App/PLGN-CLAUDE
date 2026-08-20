---
description: Audit what a brand knows about itself — voice, audience, offers, banned words — and fill what's missing, stale, or self-contradictory. Use for "check my brand profile", "update my voice", "my posts sound off", or after a repositioning.
---

# /plgn knowledge

Everything the plugin writes rests on four entries. This command checks whether
they still hold.

When a user says their posts "sound off", the cause is almost always here — a
voice profile seeded from a site that has since changed, or contradictory
entries pulling in different directions.

## 1. Preflight

Call `workspace_info`. On failure, point at app.plgn.dev and stop.

## 2. Read

Call `knowledge_get`. Audit against the four categories `/plgn setup` seeds:

| Category | Should hold |
|---|---|
| **voice** | Tone descriptors, vocabulary to use and avoid, rhythm, what the brand never does |
| **audience** | Who is addressed, what they already know, what they care about |
| **offers** | What is sold, named exactly as the brand names it |
| **banned words** | Terms the brand refuses to use |

If nothing is stored, route to `/plgn setup` and stop — seeding is that
command's job, and doing it here would duplicate the flow.

## 3. Diagnose

**Missing** — a category absent entirely, or present but empty of anything
usable. "Professional and friendly" is technically a voice entry and tells a
writer nothing.

**Thin** — present but too vague to constrain writing. The test: could two
different writers produce contradictory copy while both following it? Then it
is thin.

**Stale** — references something that has changed. Offers naming a discontinued
product, an audience the brand has moved past, a price that shifted.

**Self-contradictory** — the most damaging and the hardest to see, because each
entry looks fine alone. Voice says "plain language, no jargon" while audience
says "technical practitioners who expect precise terminology". Both are
plausible; together they make every draft a coin flip.

## 4. Report

```
Brand: <name>

  voice          thin      — "professional and friendly" constrains nothing
  audience       ok
  offers         stale     — names "Starter" tier, removed in March
  banned words   missing

Conflict: voice says "no jargon", audience says "technical practitioners
who expect precise terminology". Drafts will swing between the two.

Fix these? (y / pick / no)
```

## 5. Fill and fix

For each gap, propose specific replacement content — not "add more detail".

Where a website is available, offer to re-read it with `plgn-researcher` and
draft entries from current copy, exactly as `/plgn setup` does. A brand that
repositioned six months ago needs a re-read, not an edit.

**Show every proposed entry in full and confirm before writing.** Then:

- `knowledge_add` for missing categories
- `knowledge_update` for thin or stale ones

For conflicts, do not pick a side. Present both readings and ask which is true —
only the user knows.

## Deleting

`knowledge_delete` requires explicit confirmation **naming the entry**, per
`_conventions`. Never delete as part of an update; update in place so nothing
is lost if the write fails.

## Rules

- **No seam.** This user is connected.
- **One brand per run.** Auditing four brands at once produces a report nobody
  acts on.
- **Never invent a voice.** If the site is gone and the user cannot describe
  the brand, say the entry cannot be responsibly filled.
- **Specific beats complete.** Four sharp entries beat eight vague ones — vague
  knowledge is worse than none, because it reads as guidance and provides none.
