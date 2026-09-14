---
description: Explain why a picture looks the way it does — the idea behind it, the ideas that lost, what carried the frame, and what the brand knowledge said at the time. Read-only. Use for "why does this look like this", "what was the thinking here", or reading back a picture months later.
---

# /plgn why

A picture made itself, months ago, and now someone wants to know what it was
for. This reads the record back. It writes nothing.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Find the post

The argument can be a title, part of a caption, or an id. Call `post_list`
and match against it.

**Several matches** — show them, each with its title and date, and ask which
one:

```
3 posts match "launch":

  "Our Q3 launch notes"        scheduled, 12 Sep
  "What launch week taught us" published, 3 Sep
  "Launch, honestly"           draft

Which one?
yes / pick / no
```

**No matches** — say so plainly and stop. Never guess which post someone
meant.

## 3. Read the brief

Call `brief_get(post_id: …)` for the post found in step 2.

## 4. When there is none

One line, and nothing else:

> This picture was made before plgn kept briefs, so there is no record of the
> thinking.

Stop there. **Never offer to write one now.** A brief written after the fact
is a story, not a record — it would describe a decision nobody actually made.

## 5. When there is one

Print what `brief_get` returns, in this order, in plain words:

1. The idea, on its own line.
2. What the benefit was taken to mean.
3. The ideas that lost, each with its reason.
4. Each frame: its job, and what carried it — a real photo, a built object, a
   scene, or type alone.
5. How many checks it took. If it needed a person, say that plainly rather
   than implying the picture is settled.
6. What it read at the time: the brand knowledge, by name, with its version.

```
Why "The 90-minute review" looks the way it does

The idea: a rope under tension — for the strain of a packed calendar

"Finish faster" was taken to mean: speed, control, relief

Ideas that didn't make it:
  A clock running out — too literal, reads as a deadline, not a benefit
  An empty inbox — already used for this brand last month

The picture:
  Frame 1 (hook) — shot as a real photo
  Frame 2 (proof) — shot as a real photo

Passed on the first check.

Read at the time: "Brand Voice" (version 3), "Never Say These" (version 1)
```

When a frame needed a person, say so instead of "passed":

```
Needed a person after 3 checks — the direction kept landing on things the
brand's rules rule out.
```

## 6. Never print an internal name

No tool names, no field names, nothing shaped like `id@v3`. A person reads a
knowledge entry's **title** and "version 3" — never the name the entry is
stored under. "brief", "idea" and "frame" are plain English and are fine to
use throughout.

## Notes

- **No seam.** This user is already signed up.
- **Read-only.** This command writes nothing and takes no flags.
- **Never guess a post.** No match, or an unclear pick, ends the command —
  it does not fall back to "the most recent one".
- Replies follow the **reply-style** skill, including the user's language.
