---
description: Check how healthy your content topics are — which are repeating themselves, which need more posts, and what to add — then create the ones you approve. Supports --yes. Use for "what should I write next", "check my topics", "am I repeating myself", or planning before a new month.
---

# /plgn topics

Are the topics healthy, and what is missing?

A list of topics is easy to read. What is hard — and what this command is for —
is noticing that a topic has been saying the same thing for six weeks.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

Call `knowledge_get` for the brand's voice and what it stands for.

## 2. Read

Call `topic_list` and `post_list`. The topic list alone does not show health —
what matters is how many posts each topic actually produced and whether they
moved the argument on.

Use `topic_get` on any topic you are going to comment on in detail. The list
gives names and counts; `topic_get` gives the description and the posts.

## 3. Work out what's happening

**Repeating itself** — the topic keeps saying the same thing instead of moving
on. Signs: the same hook shape again and again, posts you could swap without
losing anything, unrelated subjects pulled in to fill slots. More posts will not
fix it; narrowing it or retiring it will.

**Too few posts** — the topic exists but has almost nothing in it. Say *why*.
Often it needs proof the brand does not have yet — "this needs two customer
results before it can carry posts" is useful; quietly under-serving it is not.

**Healthy** — producing posts that each take the argument somewhere new. Count
them; do not list them.

**The mix.** Across recent posts, roughly: half that help whether or not the
reader buys, a third proof, a fifth direct asks. Flag a feed where nearly every
post asks for something, because that is what burns an audience.

## 4. Report

```
3 topics · 34 posts over 8 weeks

Repeating itself
  Migration stories — 14 posts, 9 of them open with a number, and the last
  5 all say "legacy tools are expensive" without adding anything.
  → Narrow it to "migrations that broke after go-live", or retire it.

Too few posts
  Pricing without traps — 2 posts in 8 weeks. It needs a published pricing
  page to write against, and there isn't one yet.

Healthy
  Founder notes — 18 posts, each one going somewhere new.

Mix: 30% helpful / 20% proof / 50% asks — heavy on asks.

Add topics?
yes / pick / no
```

## 5. Create

Once approved, call `topic_create` for each agreed topic. Check `topic_list`
first — never create one that already exists.

Where a topic is repeating itself, suggest the **narrowed** version rather than
more of the old framing. The old framing is what produced the repetition.

Retiring a topic is a normal outcome, not a failure. Topics have a life, usually
a few months of regular posting. Say so when you suggest it.

`--dry-run` prints the report and creates nothing.
`--yes` skips the confirmation. Allowed here — creating a topic is cheap and
easy to undo.

## Notes

- **No seam.** This user is already signed up.
- **Never say "post more"** to fix a topic that repeats itself. Volume is what
  wore it out.
- **Judge from the posts, not the topic list.** A topic with twelve ideas and
  two posts is starved, whatever the list suggests.
- Replies follow the **reply-style** skill, including the user's language.
