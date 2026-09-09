---
description: Connect Claude Code to a plgn workspace and prepare a brand — checks the connection, picks or creates a brand, and saves its voice, audience, offers and banned words from your website. Run this once before /plgn month. Use for "connect plgn", "set up my workspace", or first-time onboarding.
---

# /plgn setup

Get from installed to ready. Run once per brand.

Everything after this assumes it has run, so it is worth doing properly — a
brand with no saved voice makes every later command guess.

## 1. Check the connection

Call `workspace_info`.

**If it fails**, print the message from **_conventions** rule 2, in their
language, then stop. It names both causes, and here the first one — not having
restarted since installing — is the likely one. This is the first command
anyone runs, and it is usually run minutes after installing.

Do not retry in a loop. Do not offer to write something locally instead — a
user who ran `setup` wants a connection, not a consolation prize.

**If it succeeds**, carry on without printing the response.

## 2. Say where things stand

One short block:

```
Workspace: <name> · Plan: <plan> · Image credits: <n>
```

If they are on the free plan, say what that limits in one line. Say it as a
fact, not a pitch — they are already a customer.

## 3. Pick the brand

Call `brand_list`.

- **Brands exist** → list them and ask which to set up. If there is exactly
  one, name it and confirm rather than assuming.
- **None exist** → ask for a brand name, then create it with `brand_update`.

One brand per run. If they want three set up, run the command three times —
saving four things per brand is not something to do quietly in bulk.

## 4. Teach plgn how they sound

This is the step that makes every later command work, so do not rush it.

**Ask for the brand's website.** If they have none, ask them to describe the
business in a few sentences and work from that — say plainly that a description
gives a thinner result than a site does.

**Start `plgn-researcher`.** Use its findings to draft four things:

| Thing | Built from |
|---|---|
| voice | tone, words, rhythm, and what they never do |
| audience | who they talk to and what those people already know |
| offers | what is sold, named the way the brand names it |
| banned words | suggested from how the site writes, then confirmed |

**Show all four and ask before saving.** Print the drafts in full. This is the
brand's identity as the system will understand it — the user must see it, and
it is far cheaper to fix now than after thirty posts inherit it.

```
Save these four?
yes / pick / no
```

**Then save each one, following the write order the brand-onboarding skill
sets out.** That skill owns the order and which tool each thing is saved
with — read it before writing anything. Two of these are easy to get wrong:

- Voice and audience (`voice_tone`, `audience`) are Foundation entries. Save
  each with `confirm: true`, sent only after the user's yes.

Offers become one `offering_create` per offer:

> An offer is not a knowledge entry. Each one becomes an **offering** — a
> record with its own benefits — so the writer can name it and the art
> director can picture it.
>
> If the site does not make clear whether something is a product or a
> service, ask. One line, and it decides which fields the record carries.

- The words this brand refuses to use go on the **brand record**, with
  `brand_update`. Saved as a knowledge entry they are only a note — plgn's
  checks never see them, and the post goes out with the word in it.

> Save the languages, the banned words and the **timezone** together in one
> `brand_update`. Ask for the timezone if the site does not say it — a brand
> with none cannot be scheduled without a guess, and the guess is invisible
> when it is wrong.

The refused words deserve a direct question — most people have not thought
about it:

> Any words this brand refuses to use? Competitor names, industry clichés,
> claims you can't back up. I've suggested: <list>.

## 5. Connections

Say what is set up and what it costs them:

- `cloudinary_connect` — without it, images that get made have nowhere to live.
- `kie_key_set` — without it (or platform credits), images can't be made and
  posts go out text-only.

**Never ask them to type a key into the terminal.** Point them at the dashboard.
Missing connections do not block this command — say so and carry on.

## 6. Finish

```
Ready. Run /plgn month <subject>.
```

If something is not connected, add one line naming what will be skipped until
it is.

If they want the brand known properly — its look, its competitors, its topics
and the lines it already reuses — add one line offering `/plgn brandkit`. Say
what it adds, not that it is "deeper".

## Notes

- **No seam.** This user is already signed up.
- **Ask before saving**, per **_conventions** — both the brand and the four
  entries.
- **Safe to run twice.** If run again on a brand that is already set up, say
  what exists and offer to update it rather than adding a second copy. Setup
  must never quietly double a brand's saved knowledge.
- **Where each entry is stored** is owned by the **brand-knowledge-map** skill.
  Banned words in particular are not knowledge — they live on the brand record,
  and saved anywhere else nothing enforces them.
- Replies follow the **reply-style** skill, including the user's language.
- Per **_conventions** rule 6, put what `plgn-researcher` needs into its prompt.
