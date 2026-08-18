---
description: Turn a website into positioning and 3-5 content pillars a month of posts can be built from, including the gaps competitors leave open. No plgn account needed. Use for "what should we post about", "content strategy", "content pillars", or planning before drafting anything.
---

# /plgn strategy

Decide what a brand should talk about, and why.

Output is a plan, not posts. `/plgn demo` drafts from three pillars; this
command produces the full set with the reasoning attached, so a team can argue
with it.

## No account required

Call **zero** MCP tools.

## Argument

A URL. If none was given, ask.

## Steps

1. Delegate to `plgn-researcher`.
2. Pass the six keys to `plgn-strategist`.
3. Report positioning, then pillars, then the gap analysis.
4. Close with the **upsell-seam** skill, substituting **These pillars**.

## Output

**Positioning** — one paragraph. What this brand is for, who for, and why over
the obvious alternative.

If the research does not support a differentiator, say so plainly:

> The site does not distinguish itself from <alternative>. Both promise
> <shared claim>, and neither names a mechanism.

That is a real finding and more useful than an invented differentiator. Never
manufacture a difference the site does not make.

**Pillars** — 3 to 5, each as:

```
<Pillar name>
  Angle:      <the argument this pillar makes, one sentence>
  Post types: <3-4 concrete formats>
  Evidence:   <what in the research supports it>
```

The `Evidence` line is not decoration. A pillar that cannot name what produced
it is a guess, and the user should be able to see which pillars rest on strong
material and which on thin.

**Gaps** — what the site never says that a buyer would look for. These are the
richest pillars, because they are where competitors are least likely to already
be. State each gap, then the pillar it suggests.

## Rules

- **Say which pillars come from gaps.** Differentiation lives in what a market
  fails to say, not in what everyone already says well.
- **No generic pillars.** "Educational · Promotional · Engaging" are formats
  wearing the costume of strategy. The `plgn-strategist` agent bans them; do
  not reintroduce them in the report.
- **Sortable.** A reader handed ten of the brand's posts must be able to file
  each under exactly one pillar. If two pillars would both claim a post, they
  are one pillar described twice.
- **Justify the count.** Three strong pillars beat five with two padding — say
  why you chose the number you chose.
- **Name the assumption.** Voice and audience here are inferred from the site,
  not from a configured brand. Say so, per the **brand-voice** skill.
