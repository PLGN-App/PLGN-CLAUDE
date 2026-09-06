---
description: Turn one thing you already have — a blog post, case study, talk, or pasted text — into a set of posts that fit each platform, saving the reusable parts as snippets. Use for "repurpose this", "turn this into posts", or getting more out of content you already have.
---

# /plgn repurpose

One article, many posts. Not one post reshaped many times.

Most repurposing fails the same way: the same paragraph pasted onto three
platforms with the length trimmed. That is one post published three times, and
anyone who follows the brand in two places sees exactly that.

## 1. Check the connection

Call `workspace_info`, then `knowledge_get`. If either fails or the voice is
empty, follow **_conventions** rule 2 and stop.

## 2. What to read

Accept any of:

- **A URL** — fetch and read it.
- **A saved snippet** — read it with `snippet_get`.
- **Pasted text** — use it directly.

If none was given, ask which.

## 3. Pull out the separate ideas

Read it and pull out the points that **stand on their own**, each with its own
evidence.

A 2,000-word article usually holds three to five. It rarely holds ten; if you
find ten, most are the same point said again, and turning those into posts
produces a repetitive feed.

Say what you found before writing anything:

```
Four ideas in this piece:
  1. <idea> — backed by: <what supports it>
  2. ...
```

**One idea can become one post per platform. One idea must never become three
posts on the same platform** — that is the repetition this command exists to
avoid.

## 4. Write

Start one `plgn-copywriter` per idea, at the same time, with the platforms
asked for. Each returns a version that fits each platform — a different shape of
argument, not a trimmed copy.

Per **_conventions** rule 6, put the voice, the banned words and each platform's
character limit into every writer's prompt.

## 5. Save the reusable parts

For each separate idea, call `snippet_create` with the point and its evidence.

This is what makes the command build up over time: the next `/plgn month` can
draw on saved snippets instead of re-reading the source. Say so in the report —
users otherwise never notice the library filling up.

## 6. Show everything, then ask

Show the full set — every post, grouped by idea — with the counts:

```
4 ideas → 9 posts (LinkedIn 4 · X 3 · Instagram 2) + 4 snippets saved

Create all of these?
yes / pick / no
```

`pick` lets them choose some. Then call `post_create` per approved post,
following **gate-recovery** on any `ERROR:`.

`--dry-run` stops here and writes nothing.
**`--yes` is not accepted.** This writes in bulk.

## 7. Report

```
9 posts saved as drafts · 4 snippets saved

  1 was shortened to fit X

Schedule them with /plgn queue, or leave them as drafts.
```

## Notes

- **No seam.** This user is already signed up.
- **Never republish the source word for word.** A post that repeats the
  article's opening gives a reader no reason to click.
- **Credit the source when it isn't the brand's own.** Repurposing someone
  else's talk or article without naming them is not something this command does.
- **Drafts, not scheduled.** Repurposing comes in bursts; scheduling is a
  deliberate pass, so leave them as drafts unless asked.
- Replies follow the **reply-style** skill, including the user's language.
