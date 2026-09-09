---
description: Draft one on-brand post from an idea, show it, and save it to your plgn workspace once you approve — scheduled if you want. Supports --yes to skip the confirmation. Use for "post about X", "write a post", or turning a single thought into content.
---

# /plgn post

One idea in, one post out. This is the command someone runs ten times a day, so
it stays fast and quiet.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Call `context_get(role: "copywriter")`. One read: the voice, the banned
words, what the brand sells, and the campaign running now. If the brand has
no Foundation, send them to `/plgn setup` and stop — a single post still goes
out in the brand's name.

The brand record it returns carries the **languages** it publishes in, too.
Write the post in those languages — they are not necessarily the language of
the conversation. Someone writing to plgn in English may publish only in
Arabic.

Print nothing for this call. A check that passes is silent.

## 2. The idea

In the user's own words. If none was given, ask for one line.

**Which platform:** if they did not say, ask — one short question with the
brand's usual platforms as the choices. Do not pick one quietly; the same idea
is a different post on each platform.

**If the request names a campaign** — "a post for Ramadan" — call
`campaign_list`, match it by name, and pass `campaign_id` to both
`context_get` and `post_create`. The post then inherits that campaign's
offerings, and its writer is given the key message it has to say
differently.

A name that matches no campaign is a question, not a new campaign: say what
you found and ask. `/plgn campaign` is where one gets created.

## 3. Write it

Start `plgn-copywriter` with the idea and the platform. Ask for **one** post.

Per **_conventions** rule 6, pass the `context_get` block from step 1 into
the prompt verbatim — the one read with `campaign_id` when a campaign was
matched — alongside the idea, the platform and its character limit. The
writer cannot read skills or this file.

Where the idea plainly suits more than one platform, write one and offer the
others afterwards. Do not quietly produce three.

## 4. Show it, then ask

Print the draft in full, with its length against the platform's target:

```
LinkedIn · 1,140 characters

<full post text>

Save this post?
yes / edit / no
```

**Wait.** `edit` means take their change and show it again; do not argue with
it.

`--yes` skips this step. It is allowed here because one post is cheap, easy to
delete, and this command runs many times a day.

`--dry-run` stops here and writes nothing.

## 5. Save it

Call `post_create` as a draft.

On `ERROR:`, follow the **gate-recovery** skill. Show the change and what moved
before trying again — for a single post the user is right there, and a silent
rewrite is worse than a visible one:

> "growth hack" is on your banned words list — I've used "shortcut" instead.

## 6. Schedule it, if asked

Only if the user asks, or says yes to one short offer. Call `post_schedule`
with their time, or the next sensible slot from the **posting-cadence** skill —
naming the slot you picked.

An unscheduled draft is a fine outcome. Never schedule without being asked.

## 7. Confirm in one line

```
Saved as a draft · LinkedIn · going out Tue 09:00
```

That is the whole report. No summary of what was written — they just read it.

## Notes

- **No seam.** This user is already signed up.
- **Speed is the feature.** Silent check, one draft, one question, one line
  back. Anything else added here gets paid for ten times a day.
- **Never batch.** Several posts from one idea is `/plgn repurpose`; a month is
  `/plgn month`.
- Replies follow the **reply-style** skill, including the user's language.
