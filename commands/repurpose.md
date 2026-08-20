---
description: Turn one asset — a blog post, case study, talk, or pasted text — into a set of platform-native posts, saving the reusable pieces as snippets. Use for "repurpose this", "turn this into posts", "make social from this article", or getting more out of content you already have.
---

# /plgn repurpose

One asset, many posts. Not one post reshaped many times.

Most repurposing fails the same way: the same paragraph pasted across three
platforms with the length trimmed. That is one post published three times, and
readers who follow a brand on two platforms see exactly that.

## 1. Preflight

Call `workspace_info`, then `knowledge_get`. On failure or empty knowledge,
route as `_conventions` requires and stop.

## 2. Input

Accept any of:

- **A URL** — fetch and read it.
- **A snippet id** — read it with `snippet_get`.
- **Pasted text** — use it directly.

If none was given, ask which.

## 3. Extract the durable ideas

Read the asset and pull out the **separable arguments** — each one a claim that
stands on its own, with its own evidence.

A 2,000-word article usually holds three to five. It rarely holds ten; if you
find ten, most are restatements of the same point, and turning restatements
into posts produces a repetitive feed.

Report what you found before drafting:

```
Four ideas in this piece:
  1. <idea> — evidence: <what backs it>
  2. ...
```

**One idea can become one post per platform. One idea must never become three
posts on the same platform** — that is the repetition this command exists to
avoid.

## 4. Draft

Spawn `plgn-copywriter` per idea, in parallel, with the platforms requested.
Each returns platform-native expressions of that idea, per **platform-specs** —
different argument shape per platform, not a trimmed copy.

## 5. Save the reusable pieces

For each durable idea, call `snippet_create` with the core claim and its
evidence.

This is what makes the command compound: the next `/plgn month` can draw on
snippets rather than re-reading the source. Say so in the report — users
otherwise never notice the library filling up.

## 6. Confirm before writing

Show the full set — every post, grouped by idea — with the counts:

```
4 ideas → 9 posts (LinkedIn 4 · X 3 · Instagram 2) + 4 snippets saved

Create all? (y / pick / cancel)
```

`pick` lets them select a subset. Then call `post_create` per approved post,
applying **gate-recovery** on `ERROR:`.

## 7. Report

```
9 posts created as drafts · 4 snippets saved

  1 revised to fit X's cap

Schedule these with /plgn review, or leave as drafts.
```

## Rules

- **No seam.** This user is connected.
- **Never publish the source verbatim.** A post that reproduces the article's
  opening paragraph gives a reader no reason to click through.
- **Attribute where the asset is not the brand's own.** Repurposing someone
  else's talk or article without naming them is not a workflow this command
  supports.
- **Drafts, not scheduled.** Repurposing is bursty; scheduling belongs to a
  deliberate pass, so leave the posts as drafts unless asked.
