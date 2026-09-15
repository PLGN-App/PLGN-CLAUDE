# Read Filters and Result Caps Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make every plgn command pass the filters its read tool accepts, and
say so when a printed count came off a capped read.

**Architecture:** Prose only. The cap rule is written once in
`skills/brand-knowledge-map/SKILL.md`; each command passes the filters its own
tool takes and points at the skill for the numbers. `scripts/validate.mjs` — the
whole test suite — gains one needle per behaviour, added before the prose it
binds.

**Tech Stack:** Markdown command and skill files; `scripts/validate.mjs`, a
plain-Node script that reads every markdown file as text. No runtime, no
dependencies, no server code.

**Spec:** `docs/superpowers/specs/2026-09-15-read-filters-design.md`

## Global Constraints

- `node scripts/validate.mjs` must print `OK: plugin structure valid.` at the
  end of every task. It is green now; keep it green.
- **No server change.** Nothing in `../plgn` is edited. `topic_list` accepting
  no filters is a known gap and stays logged, not fixed.
- **No agent change.** Agents call no tools (`_conventions` rule 6).
- **No invented filters.** Only the arguments listed in spec section 2 exist.
  Do not add a date filter to `brief_list` or any filter to `topic_list`.
- **Needle doctrine.** A needle must fail when the behaviour is *deleted*, not
  merely match a word that appears. Before committing, mutation-test it: delete
  the sentence it binds, run the validator, confirm it fails naming the file,
  restore the sentence.
- **A campaign is named by id, never by name.** Resolve with `campaign_list`
  first; an ambiguous or missing name stops the command.
- **Plain English.** Match the surrounding prose: short sentences, no jargon,
  reasons given rather than rules asserted. See `skills/reply-style/SKILL.md`.
- Commit after every task. Commit messages carry no `Co-Authored-By` or
  `Claude-Session` lines in this repo.

---

## File Structure

| File | Responsibility | Tasks |
|---|---|---|
| `skills/brand-knowledge-map/SKILL.md` | The one place the read caps and the two obligations are written | 1 |
| `scripts/validate.mjs` | Needles for every behaviour below | 1–6 |
| `commands/brandkit.md` | Read existing knowledge by layer | 2 |
| `commands/month.md` | Reuse an existing image; honour image controls | 3 |
| `commands/refresh.md` | Filter old posts server-side | 4 |
| `commands/why.md`, `commands/undo.md`, `commands/topics.md` | Bound their reads | 5 |
| `commands/visuals.md`, `commands/library.md` | Pass the filters their tools take | 6 |
| `commands/help.md`, `README.md` | List new flags | 3, 4, 6 |

---

## Task 1: The cap rule, written once

**Files:**
- Modify: `skills/brand-knowledge-map/SKILL.md` — insert a new section after
  the `## The caps` section that ends at line 191
- Modify: `scripts/validate.mjs` — section 7, the `MAP` block that starts at
  line 363
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: the heading string `## How much a read returns`, which Tasks 2–6
  point at by the skill's name (`**brand-knowledge-map**`), matching how
  `commands/images.md` already points at `**platform-specs**`.

**Context you need:** `SKILL.md:183` already has a section called
`## The caps`. It is about the free plan's limit on how many entries a brand
may *hold* (12 knowledge entries, 2 offerings, 1 campaign in progress). The new
section is about how many rows a *read returns*. Do not merge them and do not
reuse the name — two different numbers under one heading is worse than no
section.

- [ ] **Step 1: Add the failing needles**

In `scripts/validate.mjs`, inside the `else` branch of the `MAP` block
(section 7), after the `external_post_id` check, add:

```js
    // Read caps. Added after finding commands/brandkit.md:30 annotated a bare
    // `knowledge_get()` as "every entry" when the server returns twenty and
    // `limit` cannot raise it (knowledge/service.ts:114 is
    // `Math.min(f.limit, MAX_RESULTS)`). A second /plgn brandkit run on a
    // brand past twenty entries duplicates exactly what it could not see.
    if (!body.includes("How much a read returns")) {
      fail(`${MAP} must document how much each read returns`);
    }
    if (!/limit[\s\S]{0,160}cannot raise it/i.test(body)) {
      fail(`${MAP} must say knowledge_get's cap cannot be raised with limit`);
    }
    // The two obligations. A cap nobody declares is a truncated count
    // presented as a total.
    if (!body.includes("Ask for what you need")) {
      fail(`${MAP} must require an explicit limit on a whole-board read`);
    }
    if (!body.includes("Say what the number covers")) {
      fail(`${MAP} must require a capped count to say what it covers`);
    }
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL, four lines naming `skills/brand-knowledge-map/SKILL.md`.

- [ ] **Step 3: Write the section**

In `skills/brand-knowledge-map/SKILL.md`, immediately before the
`## Not knowledge at all` heading, insert:

```markdown
## How much a read returns

A read is not the whole board. Every list tool stops somewhere, and most stop
earlier than the thing being counted.

| Read | Returns by default | Never returns more than |
|---|---|---|
| `post_list`, `snippet_list` | 50 | 500 |
| `knowledge_get` | 20 | 20 |
| `list_images` | 25 | 50 |
| `brief_list` | 20 | 100 |
| `knowledge_history` | — | 50 |
| `campaign_list`, `topic_list`, `offering_list`, `hashtagset_list` | everything | — |

`knowledge_get` is the one that bites. Its twenty is fixed in the server, and
a larger `limit` cannot raise it — a brand with sixty entries cannot be listed
by one call at all. Read it **one layer at a time**, foundation then business
then creative, when you need to know what is already there.

Two things follow, and neither is optional.

1. **Ask for what you need.** A command reading a whole board passes an
   explicit `limit`. Leaving the default in place is a cut nobody sees.
2. **Say what the number covers.** When a count came off a read that may have
   been cut, the line printing it says so. `/plgn report` does this for
   briefs and is the pattern to copy. A truncated count presented as a total
   is worse than no count.
```

- [ ] **Step 4: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 5: Mutation-test the needles**

Delete the `## How much a read returns` section you just wrote. Run
`node scripts/validate.mjs`. Expected: FAIL naming
`skills/brand-knowledge-map/SKILL.md`. Restore the section and confirm green
again.

- [ ] **Step 6: Commit**

```bash
git add skills/brand-knowledge-map/SKILL.md scripts/validate.mjs
git commit -m "docs(map): say how much each read returns"
```

---

## Task 2: /plgn brandkit reads knowledge by layer

**Files:**
- Modify: `commands/brandkit.md:26-32`
- Modify: `scripts/validate.mjs` — the `REPORTS` array, currently at line 874
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: Task 1's skill section, pointed at by name.
- Produces: nothing later tasks depend on.

**Context you need:** The current block is:

```
Before writing anything, read what already exists:

```
knowledge_get()        every entry, so nothing is added twice
offering_list()        what it already sells
campaign_list()        what it is already saying
```
```

`knowledge_get()` returns twenty entries, not every entry. The paragraph below
this block already states the consequence — *"a second run that does not read
first leaves a brand with two of everything"* — so the fix is to make the read
match the claim the file already makes. Leave that paragraph alone.

- [ ] **Step 1: Add the failing needle**

In `scripts/validate.mjs`, change the `brandkit` row of `REPORTS` to:

```js
  ["brandkit", ["offering_create", "offering_list", "brand_identity",
    "brand_positioning", "one layer at a time"]],
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL — `commands/brandkit.md must name "one layer at a time"`.

- [ ] **Step 3: Rewrite the read block**

Replace lines 26–32 of `commands/brandkit.md` with:

```markdown
Before writing anything, read what already exists:

```
knowledge_get(layer: "foundation")     what it already stands for
knowledge_get(layer: "business")       what it already claims
knowledge_get(layer: "creative")       what it has already made
offering_list()                        what it already sells
campaign_list()                        what it is already saying
```

Knowledge is read **one layer at a time** on purpose. A bare `knowledge_get()`
returns twenty entries however large a `limit` you send, so on a brand with
more than twenty it silently hides the very entries this read exists to find.
See **brand-knowledge-map** for the numbers.
```

- [ ] **Step 4: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 5: Mutation-test the needle**

Delete the "Knowledge is read **one layer at a time**" paragraph. Run
`node scripts/validate.mjs`. Expected: FAIL naming `commands/brandkit.md`.
Restore it.

- [ ] **Step 6: Commit**

```bash
git add commands/brandkit.md scripts/validate.mjs
git commit -m "fix(brandkit): read knowledge by layer, not one capped call"
```

---

## Task 3: /plgn month reuses images and takes image controls

**Files:**
- Modify: `commands/month.md` — section 7, which begins `## 7. Images` at
  line 190
- Modify: `commands/month.md:2` — the frontmatter description
- Modify: `commands/help.md` — the `/plgn month` row
- Modify: `README.md` — the `/plgn month` row in the command table
- Modify: `scripts/validate.mjs` — the `REPORTS` array
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: Task 1's skill section (for the 50-image cap on `list_images`).
- Produces: nothing later tasks depend on.

**Context you need:** This is the only task that saves **credits** rather than
tokens. `/plgn month` generates about twenty-four images per run and never
calls `list_images`. The tool's own description says: *"ALWAYS check here for
a reusable existing asset BEFORE calling generate_image — reusing an existing
image is free, generating a new one costs the customer money."*

`list_images` returns 25 by default and never more than 50, so the check is
best-effort and must be described as such. It takes `folder` and `max` only —
there is no search, so matching is done by reading what comes back.

Do not rebuild the brief pipeline here. `month.md:222-225` deliberately points
at `/plgn images` for that, and that paragraph stays.

- [ ] **Step 1: Add the failing needles**

In `scripts/validate.mjs`, change the `month` row of `REPORTS` to:

```js
  ["month", ["art_director", "list_images", "Reuse costs nothing",
    "--no-images", "--max-images"]],
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL — four lines naming `commands/month.md`.

- [ ] **Step 3: Insert the controls and the reuse check**

In `commands/month.md`, immediately after the fenced block containing
`Making 24 images — this takes a few minutes...`, insert:

```markdown
### How many pictures to make

`--dry-run` spends nothing at all. Between that and a full run there are two
controls, and they combine:

- `--no-images` — plan, write and schedule, and make no pictures. The posts
  are saved without media and `/plgn images` can fill them later, with a brief
  behind each one.
- `--max-images 8` — make at most this many, best candidates first, and say in
  the report which posts went out without one.

Say the number you are about to spend before spending it, not after.

### Look for a picture that already exists

Call `list_images` before generating anything. **Reuse costs nothing and a new
picture costs a credit**, so a usable match already in the workspace is always
the better answer. Pass the brand's folder when you know it.

This read returns twenty-five images by default and never more than fifty, so
it is a genuine check and not a guarantee — see **brand-knowledge-map**. When
nothing matches, say so in one line and carry on to generate.

Reuse a match only when it actually fits this post's subject. A picture that
is merely on-brand is not a picture of the right thing, and a wrong reuse
costs more than a credit — it costs the post.
```

- [ ] **Step 4: Update the frontmatter description**

In `commands/month.md`, change `Supports --dry-run.` to:

```
Supports --dry-run, --no-images and --max-images.
```

- [ ] **Step 5: Update help and README**

In `commands/help.md`, the `/plgn month` line keeps its column alignment —
description text starts at column 28. In `README.md`, add the two flags to the
`/plgn month` row of the command table.

- [ ] **Step 6: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 7: Mutation-test the needles**

Delete the `### Look for a picture that already exists` section. Run
`node scripts/validate.mjs`. Expected: FAIL naming `commands/month.md`.
Restore it. Repeat for `### How many pictures to make`.

- [ ] **Step 8: Commit**

```bash
git add commands/month.md commands/help.md README.md scripts/validate.mjs
git commit -m "feat(month): reuse existing images and take image controls"
```

---

## Task 4: /plgn refresh filters old posts server-side

**Files:**
- Modify: `commands/refresh.md` — section 2, `## 2. Find candidates`, at
  line 18
- Modify: `commands/refresh.md:2` — the frontmatter description
- Modify: `commands/help.md`, `README.md` — the `/plgn refresh` rows
- Modify: `scripts/validate.mjs` — the `REPORTS` array
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: Task 1's skill section.
- Produces: nothing later tasks depend on.

**Context you need:** The current text is:

```
## 2. Find candidates

Call `post_list` for published posts older than **90 days**. Any newer and a
real share of the audience still remembers them.

If nothing is old enough, say so and stop. A two-month-old workspace has nothing
to refresh, and inventing candidates wastes the run.
```

`grep scheduled_to commands/refresh.md` returns nothing, so the ninety-day rule
is applied by eye after the tool has already cut the result at fifty. Keep both
existing paragraphs; add the call and the flags.

- [ ] **Step 1: Add the failing needles**

In `scripts/validate.mjs`, add to the `REPORTS` array:

```js
  ["refresh", ["scheduled_to", "limit: 500"]],
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL — two lines naming `commands/refresh.md`.

- [ ] **Step 3: Write the filtered call**

In `commands/refresh.md`, replace the sentence *"Call `post_list` for published
posts older than **90 days**. Any newer and a real share of the audience still
remembers them."* with:

```markdown
Ask the server for them, rather than reading the board and sorting by eye:

```
post_list(status: "published", scheduled_to: <90 days before today>, limit: 500)
```

Any newer and a real share of the audience still remembers them. The `limit`
matters: without it the read stops at fifty, and on a workspace two years old
the fifty it returns are not the fifty you want — see **brand-knowledge-map**.

Three optional narrowings, and they combine:

- `--platform linkedin` — passed as `platform`
- `--campaign "<name>"` — resolved with `campaign_list`, passed as
  `campaign_id`. Stop if the name matches none or more than one
- `--topic "<name>"` — resolved with `topic_list`, passed as `topic_id`
```

- [ ] **Step 4: Update the frontmatter description, help and README**

Add `Supports --platform, --campaign and --topic.` to the end of
`commands/refresh.md`'s description. Add the flags to the `/plgn refresh` rows
in `commands/help.md` and `README.md`.

- [ ] **Step 5: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Mutation-test the needles**

Delete the fenced `post_list(...)` call. Run `node scripts/validate.mjs`.
Expected: FAIL naming `commands/refresh.md`. Restore it.

- [ ] **Step 7: Commit**

```bash
git add commands/refresh.md commands/help.md README.md scripts/validate.mjs
git commit -m "fix(refresh): ask the server for old posts instead of the whole board"
```

---

## Task 5: why, undo and topics bound their reads

**Files:**
- Modify: `commands/why.md:17-18`
- Modify: `commands/undo.md:22-24`
- Modify: `commands/topics.md:22`
- Modify: `scripts/validate.mjs` — the `REPORTS` array
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: Task 1's skill section.
- Produces: nothing later tasks depend on.

**Context you need — one trap per file:**

`why.md` — `post_list.search` matches the **title only**, case-insensitively
(`posts/service.ts:254-257`). The command's own line says the argument "can be
a title, part of a caption, or an id", so a caption fragment will find nothing
through `search`. That has to be said, not hidden.

`undo.md` — the run marker is not something `post_list` can filter on. The file
already says so at line 22 and that sentence stays. What can be filtered is
`status` and the schedule window, which is what "newest window first" at line
24 is asking for informally.

`topics.md` — lines 24–27 already require counting a topic's posts *inside its
campaign's window*. The `post_list` call at line 22 passes nothing, so that rule
has no way to be true. The existing needle
`"count its posts inside the campaign's window"` stays.

- [ ] **Step 1: Add the failing needles**

In `scripts/validate.mjs`, add to `REPORTS` and extend the `topics` row:

```js
  ["why", ["search:", "matches titles only"]],
  ["undo", ["scheduled_from"]],
```

and change the `topics` row to:

```js
  ["topics", ["count its posts inside the campaign's window", "scheduled_from"]],
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL — four lines naming `commands/why.md`, `commands/undo.md` and
`commands/topics.md`.

- [ ] **Step 3: Fix `commands/why.md`**

Replace *"The argument can be a title, part of a caption, or an id. Call
`post_list` and match against it."* with:

```markdown
The argument can be a title, part of a caption, or an id.

When it looks like an id, call `post_get` with it. Otherwise call
`post_list(search: <the argument>, limit: 500)` and match against what comes
back. `search` **matches titles only**, case ignored — so when a caption
fragment finds nothing, say that plainly rather than reporting the post as
missing, and offer to look by title instead.
```

- [ ] **Step 4: Fix `commands/undo.md`**

Replace step 1 of the numbered list — *"Call `post_list` for drafts and
scheduled posts, newest window first."* — with:

```markdown
1. Call `post_list` twice, once per status, bounded to the recent window:
   `post_list(status: "draft", scheduled_from: <30 days ago>, limit: 500)` and
   the same with `status: "scheduled"`. A bulk run that needs undoing is
   almost always the last one. Widen the window only if nothing carries a
   marker.
```

- [ ] **Step 5: Fix `commands/topics.md`**

Replace *"Call `topic_list` and `post_list`."* with:

```markdown
Call `topic_list`, then `post_list` once per topic you are judging:
`post_list(topic_id: <the topic>, limit: 500)`. For a topic inside a campaign,
add that campaign's window — `campaign_id`, `scheduled_from` and
`scheduled_to` — so the count matches the rule below rather than counting all
time.
```

- [ ] **Step 6: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 7: Mutation-test the needles**

For each of the three files in turn: delete the paragraph you added, run
`node scripts/validate.mjs`, confirm it fails naming that file, restore.

- [ ] **Step 8: Commit**

```bash
git add commands/why.md commands/undo.md commands/topics.md scripts/validate.mjs
git commit -m "fix(why,undo,topics): bound the reads these commands make"
```

---

## Task 6: visuals and library pass the filters their tools take

**Files:**
- Modify: `commands/visuals.md:33-34`
- Modify: `commands/library.md:19-20`
- Modify: `commands/library.md:2` — the frontmatter description
- Modify: `commands/help.md`, `README.md` — the `/plgn library` rows
- Modify: `scripts/validate.mjs` — the `REPORTS` array
- Test: `node scripts/validate.mjs`

**Interfaces:**
- Consumes: Task 1's skill section.
- Produces: nothing — this is the last task.

**Context you need:** `list_images` takes `folder` and `max` only, returns 25
by default and never more than 50. `snippet_list` takes `kind` (caption,
template, guideline), `platform`, `search` and `limit` — default 50, cap 500.
`hashtagset_list` takes `platform` and `search`, and has **no** `limit`
argument; do not write one.

- [ ] **Step 1: Add the failing needles**

In `scripts/validate.mjs`, extend the `visuals` row and add a `library` row:

```js
  ["visuals", ["brand_identity", "campaign_create", "fifty at most"]],
  ["library", ["snippet_list", "--kind", "has no limit argument"]],
```

- [ ] **Step 2: Run the validator to verify it fails**

Run: `node scripts/validate.mjs`
Expected: FAIL — three lines naming `commands/visuals.md` and
`commands/library.md`.

- [ ] **Step 3: Fix `commands/visuals.md`**

Replace *"**Images already in the workspace** — call `list_images` and offer
the recent ones."* with:

```markdown
2. **Images already in the workspace** — call `list_images(max: 50)` and offer
   what comes back. Pass `folder` when the user names one. This read returns
   twenty-five by default and **fifty at most**, so on a busy workspace it
   shows the newest, not all of them — say that rather than implying the list
   is everything.
```

- [ ] **Step 4: Fix `commands/library.md`**

Replace *"Call `snippet_list` and `hashtagset_list`. Read the contents, not
just the names — duplicates rarely share a title."* with:

```markdown
Call `snippet_list(limit: 500)` and `hashtagset_list`. Read the contents, not
just the names — duplicates rarely share a title.

Narrow when the user asks, and the filters combine:

- `--kind caption` — also `template` or `guideline`, passed as `kind`
- `--platform linkedin` — passed as `platform`, and both lists take it
- a plain word — passed as `search`, matched against names

`hashtagset_list` has no limit argument and returns everything, so it needs no
narrowing to be complete. `snippet_list` stops at five hundred — see
**brand-knowledge-map**.
```

- [ ] **Step 5: Update the library description, help and README**

Add `Supports --kind and --platform.` to `commands/library.md`'s description,
and add the flags to the `/plgn library` rows in `commands/help.md` and
`README.md`.

- [ ] **Step 6: Run the validator to verify it passes**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.`

- [ ] **Step 7: Mutation-test the needles**

Delete the narrowing list from `commands/library.md`, run
`node scripts/validate.mjs`, confirm it fails naming the file, restore. Repeat
for the `fifty at most` sentence in `commands/visuals.md`.

- [ ] **Step 8: Commit**

```bash
git add commands/visuals.md commands/library.md commands/help.md README.md scripts/validate.mjs
git commit -m "feat(visuals,library): pass the filters these reads accept"
```

---

## Self-review notes

**Spec coverage.** Every row of spec section 5 has a task: skill → Task 1,
brandkit → 2, month → 3, refresh → 4, why/undo/topics → 5, visuals/library → 6,
help + README folded into 3, 4 and 6, validator needles into all six.

**Known gap, carried deliberately.** Spec 4.4 says a filter the tool does not
have is not invented. `topic_list` takes no arguments, so Task 5's `topics.md`
narrows by `post_list` instead — the topic list itself is read whole. This is
the server gap in spec section 6 and is not fixed here.

**Ordering.** Task 1 is first because Tasks 2–6 all point at the section it
writes. Tasks 2–6 are independent of each other and could be reordered, but
Task 3 is the only one that changes what a run costs, so it comes early.
