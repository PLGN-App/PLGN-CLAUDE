---
description: Draft one on-brand post from an idea, show it, and save it to your plgn workspace once you approve — scheduled if you want. Supports --yes to skip the confirmation. Use for "post about X", "write a post", or turning a single thought into content.
---

# /plgn post

One idea in, one post out. This is the command someone runs ten times a day, so
it stays fast and quiet.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Call `knowledge_get` for the brand's voice. If it is empty, send them to
`/plgn setup` and stop — a single post still goes out in the brand's name.

Print nothing for either call. A check that passes is silent.

## 2. The idea

In the user's own words. If none was given, ask for one line.

**Which platform:** if they did not say, ask — one short question with the
brand's usual platforms as the choices. Do not pick one quietly; the same idea
is a different post on each platform.

## 3. Write it

Start `plgn-copywriter` with the idea, the brand's voice, and the platform.
Ask for **one** post.

Per **_conventions** rule 6, put the voice, the banned words and that platform's
character limit into the prompt. The writer cannot read skills.

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
