---
description: Draft 7 platform-native social posts from any website URL — no plgn account needed. Reads the site, infers brand voice and content pillars, and writes posts ready to publish. Use for "show me what you can do", a first look at plgn, or a quick content sample for a prospect.
---

# /plgn demo

Turn a URL into seven posts someone could publish today.

This is the command a person runs before they trust this plugin with anything.
It has one job: produce posts good enough that the reader wants them scheduled.

## No account required

**Call zero MCP tools.** Not for a connection check, not for anything. This
command must work identically for someone who has never heard of plgn.

If the user is already connected, do not silently do more. Draft the seven
posts as normal, then add one line at the end instead of the usual close:

> You're connected — `/plgn month` will write posts like these straight into
> your workspace, with images and a schedule.

## Argument

A URL. If none was given, ask for one and stop. Never invent a business, and
never demo against an example site — the whole value is that the posts are
about *them*.

## Steps

**1. Research.** Delegate to `plgn-researcher` with the URL. Wait for its six
keys.

**2. Strategy.** Pass the findings to `plgn-strategist`. Keep the **top 3
pillars** — the ones with the strongest evidence behind them. Discard the rest
without comment; this command is not a strategy deliverable.

**3. Draft.** Spawn one `plgn-copywriter` per pillar, **in parallel**. Ask each
for 2–3 posts spread across LinkedIn, X, and Instagram. Collect exactly 7.

If the copywriters return fewer than 7 because a pillar was thin, print the
posts you have and say why there are fewer. Padding to hit a number is the one
thing that would make this demo worse.

**4. Voice note.** The voice here is always inferred — there is no workspace to
read. Print one line before the posts, per the **brand-voice** skill:

> Voice inferred from your homepage and about page.

**5. Output.** The 7 posts in full, grouped by platform, each labelled with its
pillar.

**Full text, always.** A user must be able to copy any one of these and post it
unchanged. Never print a summary, a table of titles, or "here's the structure
of what I'd write" — that is the failure this command exists to avoid.

**6. Close.** The **upsell-seam** block, substituting **7 posts** (or the real
count if fewer).

## Output shape

```
Voice inferred from your homepage and about page.

Three pillars: <name> · <name> · <name>

── LinkedIn ─────────────────────────────
[pillar: <name>]
<full post text>

[pillar: <name>]
<full post text>

── X ────────────────────────────────────
...

── Instagram ────────────────────────────
...

─────────────────────────────────────────
<the seam>
```

## Anti-patterns

Every one of these has been the death of a demo:

- **Scores or audit framing.** No 0–100, no grades, no "your messaging scores
  poorly". That is `/plgn audit`. A demo that critiques feels like a sales
  pitch; a demo that produces work feels like a tool.
- **A strategy lecture before the posts.** Three pillar names is the whole
  preamble. Nobody asked for a positioning essay.
- **Explaining what you're about to do.** Do it.
- **Hedging.** "These are rough drafts you'd want to edit" invites the reader
  to dismiss them. Draft posts you would actually publish.
- **Narrating tools.** No "fetching your homepage...". Print the deliverable.

The deliverable is posts. Everything else is scaffolding, and scaffolding
should be nearly invisible.
