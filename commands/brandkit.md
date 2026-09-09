---
description: Learn everything about a brand in one run — how it sounds, how it looks, who it competes with, what it should talk about, and the lines it already reuses. Reads the brand's own site and posts, then asks at most five questions. Use after /plgn setup, for "learn my brand properly", or when posts keep coming out generic.
---

# /plgn brandkit

`/plgn setup` gets a brand working. This makes it known.

It reads everything the brand has already published, drafts the whole profile
from that, and asks only what reading could not answer. Someone doing this for
the first time answers five questions with the answers already filled in.
Someone who has done it a hundred times edits the drafts instead of writing
them.

The method is the **brand-onboarding** skill. Read it first — it owns the
source order, the question limit, the save order and how to run this twice.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Pick the brand and see what is already known

Call `brand_list`. One brand per run.

Before writing anything, read what already exists:

```
knowledge_get()        every entry, so nothing is added twice
offering_list()        what it already sells
campaign_list()        what it is already saying
```

A second run **updates** rather than adds. The four Foundation singletons
refuse a second entry anyway — that refusal is an instruction to update, see
**gate-recovery** — but offerings and Business entries have no such rule, and
a second run that does not read first leaves a brand with two of everything.

**If a lot is already saved**, say so in one line and carry on. This command is
safe to run again — it compares and updates rather than adding a second copy of
anything.

**If nothing is saved and the brand is new**, say `/plgn setup` is the shorter
path and offer it. Some people want the full thing immediately; let them have
it.

## 3. Gather the material

Take the website from the argument. If there is none, ask — never invent one.

Then ask, once, for anything else they have. Keep it to one short block:

- Recent posts of theirs, pasted or pointed at — the most useful thing here,
  because published posts show how a brand really sounds
- A brand or style guide, if one exists
- Two or three competitors
- A few pictures, for the look

Every one of these is optional. Say what each adds so the answer is informed,
and carry on with whatever they give.

## 4. Read everything at once

Start `plgn-researcher` on the brand's site and one on each competitor, all at
the same time.

Per **_conventions** rule 6, each agent gets what it needs in its prompt — it
cannot see this file or the conversation.

Then, from those findings:

- `plgn-brand-architect` drafts the voice, the audience, **structured
  offerings**, the words to refuse, the search terms and the posts worth
  imitating. Each offering becomes its own `offering_create` in step 7, never
  a knowledge entry. Ask product-or-service when the source does not say.
- `plgn-art-director` reads the pictures, exactly as `/plgn visuals` does.
- `plgn-strategist` proposes the brand's positioning and three to five things
  this brand should talk about.
- `plgn-librarian` pulls out the lines and hashtag groups it already reuses.

Give the librarian what is already saved, so it does not hand back things the
brand has.

## 5. Ask at most five questions

One block, five questions, every one already answered with your best draft.

Choose them by how much breaks if they are wrong. The **brand-onboarding**
skill sets the order — the words this brand refuses to use come first, because
every post is checked against them.

One of the five asks where this brand publishes: **which languages, and which
timezone**. Both are invisible when wrong. A brand posting to Riyadh from a
server thinking in UTC publishes in the middle of the night for months before
anyone connects the two.

Anything past the fifth is printed as an assumption, not asked. Per
**reply-style** rule 7, a user cannot correct an assumption they cannot see.

## 6. Show the whole plan, ask once

Print everything, grouped, in full. This is the brand as plgn will understand
it, and it is far cheaper to fix now than after thirty posts inherit it.

```
Brand: <name>

  Sounds like   <voice, in full>
  Talks to      <audience>
  Positioned as <positioning, in full>
  Sells         <offerings, named their way>
  Refuses       <words>
  Looks like    <the direction, in full>
  Competitors   <n> · Topics <n> · Lines to reuse <n>

  Already saved and unchanged: <n items>
```

```
Save all this?
yes / pick / no
```

`pick` drops a whole group or one item. Ask once, not six times.

**If a cap blocks part of this** — the free-plan limits are the
**brand-knowledge-map** skill's numbers — follow **gate-recovery**: say which
entries or offerings did not fit, by name, and what raising the cap costs.
Never drop one silently.

## 7. Save

Follow the **brand-onboarding** skill's write order — it owns the sequence and
why each pass comes before the next.

What this run's own agents change about it:

- `plgn-brand-architect`'s **structured offerings** — each becomes its own
  `offering_create`, not a knowledge entry.
- `plgn-strategist`'s positioning becomes one **`brand_positioning`** entry,
  with `confirm: true` sent only after the user's yes.
- `plgn-art-director`'s look is saved as **`brand_identity`** — see
  **visual-identity** for the ten fields and why the canonical reference goes
  in `assets[0]`.
- Competitors become **one `competitor` entry each**, never one entry listing
  several.

Which knowledge entry is which is the **brand-knowledge-map** skill's job. Read
it before writing — some of this does not belong in knowledge at all.

**If a pass fails**, keep the ones before it and say exactly what is saved.
Never stop halfway in silence.

## 8. Finish

```
<name> is set up.

  Voice, positioning, audience and offerings saved
  Look saved — 9 pictures read
  3 competitors · 4 topics · 6 lines to reuse

Run /plgn month <subject>.
```

Then one line naming anything left thin, and what would fill it.

`--dry-run` prints the plan and saves nothing.
**`--yes` is not accepted.** This writes a brand's whole identity at once.

## Notes

- **No seam.** This user is already signed up.
- **No credits are spent.** Nothing here makes a picture.
- **Safe to run twice.** Compare against what is saved, mark each thing new,
  changed or unchanged, and write only what changed. A second run must never
  leave a brand with two voices.
- **Stopping early is a finish, not a failure.** If the user only wants the
  first two passes, say what is saved and that it is enough to write from.
- **Never invent.** With no site, no posts and no description, say the brand
  cannot be captured responsibly and stop.
- Replies follow the **reply-style** skill, including the user's language.
