---
description: Go through everything waiting in your workspace — posts blocked by plgn's checks, posts missing an image, posts too short to be worth publishing, and posts ready to go — then fix what can be fixed. Use for "check my queue", "what needs attention", "what's blocked", or a weekly look before content goes out.
---

# /plgn queue

Look at everything waiting and say honestly what state it is in.

This is the command that makes a workspace trustworthy. It must never say
"all good" without having actually gone through the list.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Read everything

Call `post_list`. Read **every** post in the period, not a sample.

If nothing is waiting, say so plainly and suggest `/plgn month`. Do not invent
findings.

## 3. Sort into four groups

Every post lands in exactly one:

**Blocked** — plgn's checks won't let it out. A banned word, too long, or a
missing field. These cannot go out, so they come first.

**No image** — ready or scheduled, but no picture. Not fatal; worth knowing
before it goes out.

**Says too little** — technically fine but too short or too vague to be worth
publishing. A post that says nothing passes every automatic check and still
costs the brand attention. Judge this honestly: does it make a point, or just
fill a slot?

**Ready** — nothing to do. Count them; do not list them.

## 4. Report

Counts first, then the exceptions by name. Never a wall of every post.

```
34 waiting · 28 ready

Blocked (2)
  "Why migrations fail"    — uses "growth hack", a word you banned
  "Pricing, honestly"      — 3,240 characters, LinkedIn allows 3,000

No image (3)
  "Q3 launch notes", "The 90-minute review", "What we got wrong"

Says too little (1)
  "Big news coming"        — 40 characters, no point, nothing to click

Fix the blocked ones?
yes / pick / no
```

## 5. Fix what can be fixed

For each blocked post, suggest a **specific** fix — the actual replacement
wording, not "make this shorter". Then apply what they approve with
`post_update`, following **gate-recovery**.

For posts that say too little, offer a rewrite that makes the point the slot was
meant to carry. If there is no idea underneath, say so and suggest removing the
slot rather than padding it — an honest gap beats filler.

For missing images, hand off: *"Run `/plgn images` to fill these three."* Do not
make images here; that spends credits and belongs to a command the user chose
for it.

`--dry-run` prints the report and changes nothing.

## Notes

- **No seam.** This user is already signed up.
- **Never say the queue is clean without reading it.** The single most damaging
  thing this command could do is report "all good" from a partial look.
- **Ask before changing anything**, per **_conventions**. Show the fix, then
  apply it.
- **Never delete a post to clear a problem.** A blocked post still holds a
  usable idea. Deleting only ever happens when the user asks, confirmed by name.
- **Judge by the point, not the length.** A 90-character X post can be
  excellent; a 600-character post that says nothing is not.
- Replies follow the **reply-style** skill, including the user's language.
