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
knowledge_get(layer: "foundation")     what it already stands for
knowledge_get(layer: "business")       what it already claims
knowledge_get(layer: "creative")       what it has already made
offering_list()                        what it already sells
campaign_list()                        what it is already saying
```

Knowledge is read **one layer at a time** on purpose. A bare `knowledge_get()`
returns twenty entries however large a `limit` you send, so on a brand with
more than twenty it silently hides the very entries this read exists to find.
See **brand-knowledge-map** for the numbers.

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

**Find the accounts.** Read `knowledge_get(type: "channels")`. If there is no
entry, call `site_read` on the website: its `socials:` line lists the
Instagram, TikTok, Facebook and X accounts the site links to. Ask once for
any of the four that is missing ("no account" is an answer). Keep the
accounts in hand — nothing is written until the plan in step 6 gets its yes.
LinkedIn is not read.

Then ask, once, for anything else they have. Keep it to one short block:

- A brand or style guide, if one exists
- A few pictures, for the look
- The brand's own things, as files or links — the logo, a mascot, the
  founder or team, the shop — so pictures are built around the real ones

Every one of these is optional. Say what each adds so the answer is informed,
and carry on with whatever they give.

**Find the top five competitors.** Run two or three `web_search` queries built
from what the brand sells and where, the way its customers would search
("umrah packages Cairo", "travel agency Egypt"). Keep the five closest real
businesses; drop directories, marketplaces, listings and news. Show them once:

> Top five competitors: <a>, <b>, <c>, <d>, <e>. Right list?
> yes / edit / no

## 4. Read everything at once

Start `plgn-researcher` on the brand — its site **and its posts** (each
account in `channels`, 20 posts each) — and one on each of the five
competitors, the same way, all at the same time. Competitor posts show themes,
formats and gaps; they never set the brand's voice.

Per **_conventions** rule 6, each agent gets what it needs in its prompt — it
cannot see this file or the conversation.

Then, from those findings:

- `plgn-brand-architect` drafts the voice, the audience, **structured
  offerings**, the words to refuse, the search terms and the posts worth
  imitating. Each offering becomes its own `offering_create` in step 7, never
  a knowledge entry. Ask product-or-service when the source does not say.
- `plgn-art-director` reads the pictures, exactly as `/plgn visuals` does.
  It cannot call `social_fetch`, so give it the links: each researcher's
  `pictures` (about 12 for the brand, about 6 per competitor), plus any
  pictures the user gave in step 3. One art director per account, all at the
  same time, each with only that account's links.
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
  Channels      <website · instagram · tiktok · facebook · x, as found>
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
- The accounts found in step 3 become one **`channels`** entry (website,
  instagram, tiktok, facebook, x), saved with the Business pass. When one is
  already saved and unchanged, write nothing; when it changed, update it.
- Competitors become **one `competitor` entry each**, never one entry listing
  several, with their `url` and the handles their reader found.
- The brand's own things — logo, character, people, places — become **one
  `asset_create` each**, after the look, per **brand-assets**. Look at every
  picture before saving it, ask for each one's `never` rules, and send
  `consent: true` for a person only after the user has said that person
  agreed. A product shot goes on its offering, not here.

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
- **No points are spent.** Nothing here makes a picture.
- **Safe to run twice.** Compare against what is saved, mark each thing new,
  changed or unchanged, and write only what changed. A second run must never
  leave a brand with two voices.
- **Stopping early is a finish, not a failure.** If the user only wants the
  first two passes, say what is saved and that it is enough to write from.
- **Never invent.** With no site, no posts and no description, say the brand
  cannot be captured responsibly and stop.
- Replies follow the **reply-style** skill, including the user's language.
