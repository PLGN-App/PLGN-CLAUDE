---
description: Triage the workspace queue — posts blocked by the validation gate, missing images, too thin to publish, or ready to go — and fix what can be fixed. Use for "review my queue", "what needs attention", "what's blocked", or a weekly check before content goes out.
---

# /plgn review

Look at everything queued and say honestly what state it is in.

This is the command that makes a workspace trustworthy. It must never report
"all good" without having actually listed the queue.

## 1. Preflight

Call `workspace_info`. On failure, point at app.plgn.dev and stop.

## 2. Read the queue

Call `post_list`. Read **every** post in the window, not a sample.

If the queue is empty, say so plainly and suggest `/plgn month` — do not
manufacture findings.

## 3. Sort into four buckets

Every post lands in exactly one:

**Blocked** — the validation gate refuses it. Banned word, over cap, or a
required field missing. These cannot publish, so they come first.

**No image** — scheduled or ready, but the image slot is empty. Not fatal;
worth knowing before it goes out.

**Thin** — technically valid but too short or too vague to carry its pillar. A
post that says nothing passes every automated check and still costs the brand
attention. Judge this honestly: does it make an argument, or just occupy a slot?

**Ready** — nothing to do. Count them; do not list them.

## 4. Report

Counts first, then the exceptions by name. Never a wall of every post.

```
34 queued · 28 ready

Blocked (2)
  "Why migrations fail"      — "growth hack" is on your banned-word list
  "Pricing, honestly"        — 3,240 chars, LinkedIn caps at 3,000

No image (3)
  "Q3 launch notes", "The 90-minute review", "What we got wrong"

Thin (1)
  "Big news coming"          — 40 chars, no argument, no CTA

Fix the blocked posts? (y / pick / no)
```

## 5. Fix what can be fixed

For each blocked post, propose a **specific** fix — the actual replacement
wording, not "shorten this". Then apply approved fixes with `post_update`,
following **gate-recovery**.

For thin posts, offer a rewrite that makes the argument the slot was meant to
carry. If the idea underneath is empty, say so and recommend deleting the slot
rather than inflating it — an honest gap beats filler.

For missing images, hand off: *"Run `/plgn images` to fill these three."*
Do not generate here; image generation spends credits and belongs to a command
the user chose for that.

## Rules

- **No seam.** This user is connected.
- **Never claim a clean queue without listing it.** The single most damaging
  thing this command could do is report "all good" from a partial read.
- **Confirm before updating**, per `_conventions`. Show the fix, then apply.
- **Never delete a post to clear a problem.** A blocked post still holds a
  usable idea. Deletion is only ever the user's explicit request, confirmed by
  name.
- **Judge thinness by argument, not length.** A 90-character X post can be
  excellent; a 600-character post that says nothing is thin.
