# Brand Onboarding Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship `/plgn brandkit` and `/plgn visuals` — two connected commands that capture a brand's complete profile (record, identity, look, competitors, topics, library) by inferring from the brand's own material and asking at most five questions.

**Architecture:** No runtime code ships. Three new skills hold the method and the facts, three new agents do the composing in fresh context, two new commands orchestrate and own every write. The only executable file in the repo is `scripts/validate.mjs`, a dev-time consistency checker — so **it is the test suite**, and every task follows the TDD cycle by adding a check that fails, then writing the Markdown that makes it pass.

**Tech Stack:** Markdown + YAML frontmatter, JSON manifests, Node 24 (dev-time validation only, zero dependencies), Claude Code plugin format, plgn MCP over HTTP/OAuth.

**Spec:** `docs/superpowers/specs/2026-09-07-brand-onboarding-design.md`

## Global Constraints

- **The test command is `node scripts/validate.mjs`.** It must print `OK: plugin structure valid.` and exit 0 before any commit. There is no other test runner in this repo.
- **Branch:** `feat/brand-onboarding`. The spec is already committed on it.
- **Every `commands/*.md`** requires YAML frontmatter with a `description:` key and **no** `name:` key. The filename is the command name.
- **Every `agents/*.md`** requires YAML frontmatter with `name:` and `description:`, and `name` must equal the filename without `.md`.
- **Every `skills/<name>/SKILL.md`** requires YAML frontmatter with `name:` and `description:`, and `name` must equal the directory name.
- **`plugin.json` must declare `commands` and `skills`, and must NOT declare `agents`.** An explicit `agents` array suppresses agent discovery entirely; omitting the key lets the loader find `agents/*.md`. Verified empirically — see the comment in `validate.mjs`.
- **Both new commands are CONNECTED.** They must reference `workspace_info` and must never reference the `upsell-seam` skill.
- **The only two question formats** are `yes / pick / no` and `yes / edit / no`. The strings `Proceed?`, `(y/n)`, `(y / n)` and `(y / ` are banned in every file under `commands/` — the validator fails on them.
- **Only real MCP tool names may appear in backticks** in `commands/`, `agents/` and `skills/`. The valid names are the 38 in the `TOOLS` set in `validate.mjs`. There is no `audience` type, no `brand_create`, and no `visual_*` tool.
- **Banned words are written with `brand_update`, never `knowledge_add`.** This is the bug this work fixes; a validator check enforces it from Task 1 onward.
- **Never handle credentials.** No file may instruct prompting for, storing, or repeating a token or API key.
- **Reply text follows the `reply-style` skill** — the user's own language, B2 reading level, no internal names, result first and question last.
- **Neither command spends image credits.** Generation belongs to `/plgn images`.

---

## File Structure

```
plgn-claude/
├── .claude-plugin/plugin.json        # MODIFY: +2 commands, +3 skills
├── scripts/validate.mjs              # MODIFY: the test suite, grown 5 checks
├── commands/
│   ├── _conventions.md               # MODIFY: both commands into the connected list
│   ├── help.md                       # MODIFY: list both, disambiguate visuals vs images
│   ├── setup.md                      # MODIFY: fix the banned-words bug, hand off
│   ├── knowledge.md                  # MODIFY: point at the map, check the look
│   ├── brandkit.md                   # CREATE: the six-pass capture
│   └── visuals.md                    # CREATE: the look, standalone
├── agents/
│   ├── plgn-visual.md                # MODIFY: obey the saved direction
│   ├── plgn-brand-architect.md       # CREATE: composes identity artefacts
│   ├── plgn-librarian.md             # CREATE: extracts snippets and hashtag sets
│   └── plgn-art-director.md          # CREATE: extracts the visual direction
├── skills/
│   ├── image-prompting/SKILL.md      # MODIFY: apply preamble + canonical reference
│   ├── brand-knowledge-map/SKILL.md  # CREATE: where each piece of knowledge lives
│   ├── brand-onboarding/SKILL.md     # CREATE: the method
│   └── visual-identity/SKILL.md      # CREATE: the look
└── README.md                         # MODIFY: both commands in the surface list
```

**Responsibility split.** `brand-knowledge-map` holds *facts* (where things are stored). `brand-onboarding` holds *method* (how to capture). `visual-identity` holds *the look* specifically. Commands orchestrate and own every write; agents compose and never write. That boundary is the repo's existing pattern and is enforced by `_conventions` rule 6.

---

## Wave 1 — The facts, owned and enforced

### Task 1: `brand-knowledge-map` skill, and the bug it prevents

The first task fixes a live bug. `commands/setup.md` currently tells the model to save banned words with `knowledge_add`, but the server-side gate reads them from the brand record. A brand set up today can hold a banned-word list that nothing enforces.

The new validator check fails on the *existing* file before anything is written. That is the failing test.

**Files:**
- Create: `skills/brand-knowledge-map/SKILL.md`
- Modify: `scripts/validate.mjs` (add section 7)
- Modify: `commands/setup.md` (step 4, and the notes)
- Modify: `.claude-plugin/plugin.json` (skills array)

**Interfaces:**
- Produces: a skill named `brand-knowledge-map`, referenced by name from `setup.md`, `knowledge.md`, `brandkit.md`, `visuals.md`, and Tasks 2–7.
- Produces: validator section 7, with three checks later tasks extend.

- [ ] **Step 1a: Stop the tool-name check from rejecting knowledge types**

The existing section 4 check treats any backticked `brand_*` name as an MCP tool
and fails when it is not one. `brand_voice` is a knowledge **type**, not a tool,
and every file from here on names it. Without this exemption nothing in this
plan can go green.

In `scripts/validate.mjs`, in section 4, add the set immediately above the
`for (const p of CONTENT)` loop:

```javascript
// Knowledge type values are API literals that happen to match the tool-name
// shape. They are not tools, and every file that documents storage names them.
const KNOWLEDGE_TYPES = new Set([
  "brand_voice", "competitor_data", "seo_guidelines", "example_article",
]);
```

And inside that loop, immediately after `const name = m[1];`, add:

```javascript
    if (KNOWLEDGE_TYPES.has(name)) continue;
```

- [ ] **Step 1b: Write the failing test**

Append to `scripts/validate.mjs`, immediately before the `if (fails.length)` block at the end:

```javascript
// --- 7. Where brand knowledge lives ------------------------------------
// Added after finding that /plgn setup saved banned words with knowledge_add
// while the server-side gate reads them from the brand record. A brand set up
// that way holds a banned-word list nothing enforces.
{
  const MAP = "skills/brand-knowledge-map/SKILL.md";
  if (!exists(MAP)) {
    fail(`${MAP} is missing — nothing owns where brand knowledge is stored`);
  } else {
    const body = read(MAP);
    if (!body.includes("brand_update")) {
      fail(`${MAP} must name \`brand_update\` as where banned words are written`);
    }
    for (const t of ["brand_voice", "competitor_data", "seo_guidelines", "example_article"]) {
      if (!body.includes(t)) fail(`${MAP} must list the knowledge type "${t}"`);
    }
  }

  // No file may instruct saving banned words with knowledge_add. The map skill
  // itself is exempt: it states the rule, so it necessarily names both.
  const near = (body, a, b, window) => {
    for (const m of body.matchAll(new RegExp(a, "gi"))) {
      const from = Math.max(0, m.index - window);
      const slice = body.slice(from, m.index + m[0].length + window);
      if (new RegExp(b, "i").test(slice)) return true;
    }
    return false;
  };
  for (const p of CONTENT) {
    if (p === MAP) continue;
    if (near(read(p), "banned word", "knowledge_add", 200)) {
      fail(`${p}: banned words are written with \`brand_update\`, never \`knowledge_add\``);
    }
  }
}
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: FAIL, three problems — the missing map skill (twice, once for `brand_update` being absent because the file is absent) and `commands/setup.md: banned words are written with \`brand_update\`, never \`knowledge_add\``.

The last one is the pre-existing bug. Confirm it appears before continuing.

- [ ] **Step 3: Write the skill**

Create `skills/brand-knowledge-map/SKILL.md`:

```markdown
---
name: brand-knowledge-map
description: Use when saving or reading anything about a brand — deciding where a piece of brand knowledge belongs, which knowledge types exist, or working out why a saved banned-word list is not being enforced. Covers the brand record, the four knowledge types, and the things that are not knowledge at all.
---

# Where a brand's knowledge lives

A brand is stored in three different places, and putting something in the wrong
one does not fail loudly. It fails quietly, months later, when a rule nobody can
find is not being applied.

Read this before saving anything about a brand.

## The map

| What you want to save | Where it goes | Tool |
|---|---|---|
| Brand name | brand record | `brand_update` |
| Languages the brand publishes in | brand record | `brand_update` |
| **Banned words** | **brand record** | **`brand_update`** |
| Voice | knowledge, type `brand_voice` | `knowledge_add` |
| Audience | knowledge, type `brand_voice` | `knowledge_add` |
| Offers | knowledge, type `brand_voice` | `knowledge_add` |
| Visual direction | knowledge, type `brand_voice` | `knowledge_add` |
| SEO and keyword rules | knowledge, type `seo_guidelines` | `knowledge_add` |
| Posts worth imitating | knowledge, type `example_article` | `knowledge_add` |
| A competitor | knowledge, type `competitor_data` | `knowledge_add` |
| A content topic | not knowledge | `topic_create` |
| Reusable copy — a hook, a CTA, boilerplate | not knowledge | `snippet_create` |
| A set of hashtags | not knowledge | `hashtagset_create` |
| A reference image | not knowledge | `upload_image_from_url` |

## The trap

Banned words look like knowledge. They are not.

The server checks every post against the list on the **brand record**. A list
saved anywhere else is a note nobody reads — the post goes out with the word in
it, and the person who wrote the rule never finds out why.

Write them with `brand_update`. Read them back with `brand_list`, which returns
each brand's banned words directly.

`brand_update` replaces the whole list. To add one word, read the current list
first and send it back with the new word appended. Sending one word deletes the
rest.

## There are exactly four knowledge types

`brand_voice`, `competitor_data`, `seo_guidelines`, `example_article`. That is
the entire list.

There is no `audience` type and no `offers` type. Those are real things a brand
needs, and they are stored as `brand_voice` entries told apart by their title:

| Entry | type | title | metadata |
|---|---|---|---|
| Voice | `brand_voice` | `Voice` | `{ "kind": "voice" }` |
| Audience | `brand_voice` | `Audience` | `{ "kind": "audience" }` |
| Offers | `brand_voice` | `Offers` | `{ "kind": "offers" }` |
| Visual direction | `brand_voice` | `Visual direction` | `{ "kind": "visual" }` |

Always set the metadata. The title is what a person reads; the metadata is what
lets a later command find one entry among four of the same type.

## Reading it back

`knowledge_get` takes a `type` and a `keyword` and returns full entries, up to
twenty, newest first. Entries can be long.

- Need one thing → filter by `type`, or by `keyword` matching the title.
- Need everything before drafting → read all four `brand_voice` entries at once.

## Updating without losing anything

Use `knowledge_update` in place. It is partial — only the fields you send
change.

**Never delete and re-add.** If the second call fails, the entry is gone and the
brand is worse off than before it was touched. `knowledge_delete` is for an
entry that should no longer exist at all, confirmed by name.
```

- [ ] **Step 4: Register the skill in the manifest**

In `.claude-plugin/plugin.json`, add to the `skills` array, after `"./skills/brand-voice"`:

```json
    "./skills/brand-knowledge-map",
```

- [ ] **Step 5: Fix the banned-words bug in `setup.md`**

In `commands/setup.md`, in **step 4**, replace the table row and the save instruction. The table becomes:

```markdown
| Entry | Built from |
|---|---|
| voice | tone, words, rhythm, and what they never do |
| audience | who they talk to and what those people already know |
| offers | what is sold, named the way the brand names it |
```

Then replace the paragraph beginning "**Then call `knowledge_add` once per entry.**" with:

```markdown
**Then save them, each to the right place.** The **brand-knowledge-map** skill
owns which place that is — read it before writing anything. Two of these are
easy to get wrong:

- Voice, audience and offers are knowledge entries. Save them one at a time, so
  a later edit can change one thing without touching the others.
- The words this brand refuses to use go on the **brand record**, with
  `brand_update`. Saved as a knowledge entry they are only a note — plgn's
  checks never see them, and the post goes out with the word in it.
- The languages this brand publishes in go on the brand record too, with
  `brand_update`. Ask when it might be more than one; it decides what language
  every post is written in.
```

The banned-words question later in that step stays exactly as it is.

**Note for the implementer:** this passage deliberately does not name the
knowledge-writing tool. The validator check added in Step 1 fails when that tool
name sits within 200 characters of the phrase "banned word", and deferring to
the **brand-knowledge-map** skill is the better instruction anyway — one file
owns the mapping. A scan confirmed `setup.md` is the only existing file that
trips the check.

- [ ] **Step 6: Point `setup.md` at what comes next**

In `commands/setup.md`, replace the section 6 block with:

```markdown
```
Ready. Run /plgn month <subject>.
```

If they want the brand known properly — its look, its competitors, its topics
and its library — add one line offering `/plgn brandkit`. Say what it adds, not
that it is "deeper".
```

And add to the **Notes** list:

```markdown
- **Where each entry is stored** is owned by the **brand-knowledge-map** skill.
  Banned words in particular are not knowledge.
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 8: Commit**

```bash
git add skills/brand-knowledge-map/SKILL.md scripts/validate.mjs commands/setup.md .claude-plugin/plugin.json
git commit -m "fix: banned words belong on the brand record, not in knowledge

/plgn setup saved banned words with knowledge_add, but the server-side
gate reads them from the brand record — so a brand set up that way held
a list nothing enforced.

Adds skills/brand-knowledge-map to own where each piece of brand
knowledge is stored, and a validator check so the mistake cannot return."
```

---

### Task 2: `brand-onboarding` skill — the method

**Files:**
- Create: `skills/brand-onboarding/SKILL.md`
- Modify: `scripts/validate.mjs` (extend section 7 with the skill registry check)
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: `brand-knowledge-map` (Task 1), referenced by name.
- Produces: a skill named `brand-onboarding`, referenced by `brandkit.md` (Task 7), `visuals.md` (Task 6), `setup.md` and `knowledge.md` (Task 8).
- Produces: a validator check that every skill directory on disk is registered in `plugin.json` — the reverse of the existing manifest-to-disk check.

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, inside the section 7 block added in Task 1, append before its closing brace:

```javascript
  // Skills on disk must be registered. The existing check runs manifest →
  // disk; a skill that is written but never listed loads for nobody.
  if (manifest) {
    const listedSkills = new Set((manifest.skills ?? []).map((r) => r.replace(/^\.\//, "")));
    for (const d of ls("skills")) {
      if (!listedSkills.has(`skills/${d}`)) {
        fail(`skills/${d} exists on disk but is not in plugin.json`);
      }
    }
  }
```

- [ ] **Step 2: Run the test to verify it passes, then break it deliberately**

Run: `node scripts/validate.mjs`

Expected: `OK` — Task 1 already registered its skill, so this check is green.

Now create the directory with an empty file so the check has something to catch:

```bash
mkdir -p skills/brand-onboarding && printf '' > skills/brand-onboarding/SKILL.md
node scripts/validate.mjs
```

Expected: FAIL with `skills/brand-onboarding: no YAML frontmatter` **and** `skills/brand-onboarding exists on disk but is not in plugin.json`.

- [ ] **Step 3: Write the skill**

Write `skills/brand-onboarding/SKILL.md`:

```markdown
---
name: brand-onboarding
description: Use when capturing what plgn knows about a brand — a first setup, a full brand kit, a re-read after a repositioning, or filling gaps in an existing profile. Covers which sources to trust in what order, how many questions to ask, what order to save in, and how to run twice without duplicating anything.
---

# Capturing a brand

The job is to end with a brand profile sharp enough to write from, having asked
the user as little as possible.

Two people run this and both must finish. Someone setting up their first brand
cannot answer "what is your differentiated point of view?". Someone who has run
brand workshops for a decade will not retype what is already on their website.
The same method serves both: **read everything first, then ask only what
reading could not answer.**

## 1. The source ladder

Use every rung available, best first.

| Rung | Source | What it gives |
|---|---|---|
| 1 | The brand's own published posts | Real voice and real look, as actually used |
| 2 | The website — homepage, about, pricing, one product page, one article | Positioning, offers, proof, marketing voice |
| 3 | Brand guidelines, a style guide, a deck the user points at | Stated rules, palette, taboos |
| 4 | Competitor sites, three to five | Contrast and gaps — **never voice** |
| 5 | The user's own answers | Only what no source can show |

**The rule that governs all five:**

> Sources beat opinions for how a brand sounds. Opinions beat sources for what
> a brand intends.

Nobody describes their own voice accurately. Ask ten founders and nine say
"professional but friendly". Their published copy tells the truth. But no
document knows they are dropping a product line in March — only they do.

Never take voice from a competitor. Competitors show you what is crowded and
what nobody says. Borrow either and the brand sounds like the market.

## 2. Evidence and confidence

Every claim you draft carries three things:

- **The claim**, written so a writer could follow it.
- **The evidence** — a short quote, or the reference it came from.
- **A confidence** — high or low.

**No evidence, no save.** A claim with nothing behind it becomes a question, or
a stated assumption. It never becomes a saved entry, because a saved entry
looks like fact to every command that reads it afterwards.

## 3. Ask at most five questions

One block. Five questions. Each with an answer already filled in.

This cap is the whole method:

- A beginner reads five questions that are already answered, and says yes.
- A professional ignores the defaults, edits four, and finishes just as fast.

Neither is handed a blank page.

Choose the five by **how much breaks if you get it wrong**:

1. **Banned words** — every post is checked against them
2. **Offer names** — wrong names make every call to action wrong
3. **Audience level** — decides the jargon in every post
4. **Languages** — decides what language everything is written in
5. **Any place two sources disagree** — never average them, always ask

Anything past the fifth is **printed as a stated assumption**, per the
**reply-style** skill. Never guessed in silence.

## 4. Save in this order

The order is load-bearing. Each pass depends on the one above it.

| # | Pass | Why here |
|---|---|---|
| 1 | Brand record — languages, banned words | plgn's checks read these, and every later write is checked against them |
| 2 | Identity — voice, audience, offers, SEO rules, example posts | Everything downstream reads these |
| 3 | Visual direction | Needs the voice, so the look and the words agree |
| 4 | Competitors | Independent — safe to fail on its own |
| 5 | Topics | Needs identity and competitors |
| 6 | Library — snippets, hashtag sets | Extracted from material already read |

Where each of these is stored is the **brand-knowledge-map** skill's job. Read
it before writing. Banned words in particular are not knowledge.

If a pass fails, the passes above it stand. Say exactly what is saved. A user
must never have to guess.

## 5. One plan, one question

Show everything, grouped by pass, then ask once:

```
Save all this?
yes / pick / no
```

`pick` drops a whole group or a single item. Six separate confirmations for one
command is worse than the thing being confirmed.

## 6. Running it twice

Mark every item **new**, **changed**, or **unchanged**. Write only the new and
changed ones. Say nothing about the unchanged ones.

A second run must never leave a brand with two voices.

## 7. The bar an entry has to clear

> Could two writers follow this and produce opposite copy?

If yes, it is too vague to save. "Professional and friendly" fails. "Short
sentences, no exclamation marks, never opens with a question" passes.

Vague guidance is worse than none, because it reads like direction and gives
none. **Four sharp entries beat nine soft ones.**

Posts saved as examples get checked first — a bad example poisons every draft
that later learns from it.

## Never

- Invent a voice or a look with no source. Say the profile cannot be filled
  responsibly and stop.
- Take voice from a competitor.
- Average two conflicting identities into a third one nobody owns.
- Write anything before the confirmation.
- Ask for a key, a token or a password.
```

- [ ] **Step 4: Register the skill**

In `.claude-plugin/plugin.json`, add to `skills`, after `"./skills/brand-knowledge-map"`:

```json
    "./skills/brand-onboarding",
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Commit**

```bash
git add skills/brand-onboarding/SKILL.md scripts/validate.mjs .claude-plugin/plugin.json
git commit -m "feat: add the brand-onboarding skill — the capture method

Source ladder, evidence per claim, a five-question cap that lets a
beginner and a professional both finish, the write order, and the rule
for running it twice without duplicating a brand.

Also checks that every skill on disk is registered in the manifest."
```

---

### Task 3: `visual-identity` skill — the look

**Files:**
- Create: `skills/visual-identity/SKILL.md`
- Modify: `scripts/validate.mjs` (extend section 7)
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: `brand-knowledge-map` (Task 1) for storage, `brand-onboarding` (Task 2) for the method.
- Produces: a skill named `visual-identity`, referenced by `plgn-art-director` (Task 5), `visuals.md` (Task 6), `brandkit.md` (Task 7), `image-prompting` (Task 5).
- Produces: the ten field names a visual direction contains, used verbatim by Tasks 5, 6 and 7 — `palette`, `composition`, `light`, `medium`, `subject`, `finish`, `textInImage`, `never`, `promptPreamble`, `canonicalReference`.

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, inside the section 7 block, append before its closing brace:

```javascript
  // The two-step remote-image path was established by running both tools:
  // WebFetch on an image URL answers "NO IMAGE VISIBLE" but saves the binary
  // locally, and Read on that saved path does see the image. Without this
  // written down, a later contributor concludes remote references are
  // impossible and quietly drops half the feature.
  const VIS = "skills/visual-identity/SKILL.md";
  if (!exists(VIS)) {
    fail(`${VIS} is missing — nothing owns the brand's look`);
  } else {
    const body = read(VIS);
    if (!(body.includes("WebFetch") && body.includes("Read"))) {
      fail(`${VIS} must document the two-step remote-image path (WebFetch, then Read the saved file)`);
    }
    if (!body.includes("generate_image_from_image")) {
      fail(`${VIS} must say how the canonical reference feeds \`generate_image_from_image\``);
    }
  }
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: FAIL with `skills/visual-identity/SKILL.md is missing — nothing owns the brand's look`.

- [ ] **Step 3: Write the skill**

Write `skills/visual-identity/SKILL.md`:

```markdown
---
name: visual-identity
description: Use when working out how a brand's pictures look and making later images match — reading references, writing the visual direction, storing it, or applying it before generating an image. Covers what a direction contains, how to see an image that lives at a URL, and what to do when the references disagree.
---

# How a brand looks

A brand that has a voice and no look produces posts that read right and look
like stock. This is the other half.

A **visual direction** is a written record of how a brand's pictures work,
taken from pictures it has already published. It is not a mood board and not a
preference. Like voice, it is read off real material.

## What a direction contains

Ten fields. Each carries the evidence it came from.

| Field | What it records |
|---|---|
| **palette** | The colours, as hex values, with rough proportions and how backgrounds are treated |
| **composition** | Where the subject sits, how tight the crop is, how much empty space, where text can safely go |
| **light** | Direction, hardness, warm or cool, how shadows behave |
| **medium** | Photograph, illustration, 3D render or collage — and the camera feel: wide or long lens, shallow or deep focus, grain |
| **subject** | What actually appears. When there are people, who they are and what they are doing |
| **finish** | Matte or glossy, flat or gradient, texture, the colour grade |
| **text-in-image** | Whether words appear at all, where, how heavy, upper or lower case |
| **never** | What these pictures never contain |
| **prompt preamble** | A block appended to every later image description, plus what to exclude |
| **canonical reference** | The one image that best represents the set |

**The `never` field carries more weight than it looks.** A brand whose pictures
never show a face, never use pure white, or never contain a logo has an
identity built on those refusals. Getting a refusal wrong is what makes a
generated image feel like a different company.

## Reading the references

At least three. Fewer than three is a sample, not a pattern — say so rather
than dressing a guess up as a direction.

**A local file or a screenshot** is read directly with `Read`, which shows the
image.

**An image at a URL** — including the images already in a workspace, which
`list_images` returns as URLs — takes two steps:

1. `WebFetch` the URL. It will answer **"NO IMAGE VISIBLE"**. That is not a
   failure. It saves the binary to a local file and names that path in its
   result.
2. `Read` that saved path. The image is now visible.

Both steps are needed. `WebFetch` alone never sees a picture, and `Read` cannot
take a URL.

**If a reference cannot be seen, say so and leave it out.** Never describe an
image from its filename, its alt text, or the caption of the post it belongs
to. A direction built from a picture nobody looked at is worse than no
direction, because everything downstream trusts it.

## When the references disagree

They will, and it usually means something real: a rebrand, a new designer, or
two people posting without a shared rule.

**Never average them.** Averaging two identities produces a third that belongs
to nobody, and every generated image afterwards is slightly wrong in a way
nobody can name.

Report the clusters instead:

```
Your references split in two.

  Six images — flat illustration, two colours, no photography
  Three images — warm photography, shallow focus, people

Which is current?
yes / pick / no
```

Then build the direction from the chosen cluster, and note what was set aside.

## Storing it

One entry, per the **brand-knowledge-map** skill: type `brand_voice`, title
`Visual direction`, metadata `{ "kind": "visual" }`.

The canonical reference is saved as a real image with
`upload_image_from_url` or `upload_image_base64`, so it can be reached later.

## Using it

Before any image is made, read the direction and apply it:

- Put the **prompt preamble** into every image description, ahead of the
  subject.
- Apply **never** as the exclusion list.
- When an exact match matters — a series, a campaign, a carousel — use
  `generate_image_from_image` with the **canonical reference** rather than
  describing the style again in words. A reference image holds detail no
  sentence carries.

The **image-prompting** skill owns the mechanics of generating. This skill owns
what the picture should look like before that starts.

## Honest limits

- Colours read off a compressed screenshot are close, not exact. Say "about
  this" rather than publishing a hex value as though it came from a brand book.
- A direction from three references is thinner than one from twelve. Say which.
- A picture nobody could see is not evidence.
```

- [ ] **Step 4: Register the skill**

In `.claude-plugin/plugin.json`, add to `skills`, after `"./skills/brand-onboarding"`:

```json
    "./skills/visual-identity",
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Commit**

```bash
git add skills/visual-identity/SKILL.md scripts/validate.mjs .claude-plugin/plugin.json
git commit -m "feat: add the visual-identity skill — how a brand looks

Ten fields taken from real references, the rule that conflicting
references are clustered rather than averaged, and the verified two-step
path for seeing an image that lives at a URL: WebFetch saves the binary
locally, then Read sees it."
```

## Wave 2 — The agents that compose

### Task 4: `plgn-brand-architect` and `plgn-librarian`

Two agents that both turn material into drafts and neither of which writes
anything. They ship together because the librarian's output is meaningless
without the architect's voice to check it against.

**Files:**
- Create: `agents/plgn-brand-architect.md`
- Create: `agents/plgn-librarian.md`
- Modify: `scripts/validate.mjs` (extend section 7 with the agent registry)

**Interfaces:**
- Consumes: research findings shaped like `plgn-researcher` output — the six keys `business`, `audience`, `offers`, `voiceMarkers`, `proofPoints`, `gaps`.
- Produces: `plgn-brand-architect` returns six blocks, named verbatim — `voice`, `audience`, `offers`, `bannedWordCandidates`, `seoRules`, `examplePosts` — each carrying `claim`, `evidence`, `confidence`.
- Produces: `plgn-librarian` returns two blocks — `snippets` (each with `title`, `kind` of caption/template/guideline, `body`, `source`) and `hashtagSets` (each with `title`, `platform`, `tags`, `source`).

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, inside the section 7 block, append before its closing brace:

```javascript
  // Agents are discovered from disk, never declared in the manifest, so a
  // missing or renamed agent file fails silently at runtime. This list is the
  // only place that notices.
  const AGENTS = [
    "plgn-analyst", "plgn-art-director", "plgn-brand-architect", "plgn-brand-guard",
    "plgn-copywriter", "plgn-librarian", "plgn-researcher", "plgn-scheduler",
    "plgn-strategist", "plgn-visual",
  ];
  const onDisk = ls("agents").filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  for (const a of AGENTS) {
    if (!onDisk.includes(a)) fail(`agents/${a}.md is missing`);
  }
  for (const a of onDisk) {
    if (!AGENTS.includes(a)) fail(`agents/${a}.md is not listed in validate.mjs AGENTS`);
  }
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: FAIL with three missing agents — `plgn-art-director.md`, `plgn-brand-architect.md`, `plgn-librarian.md`. The art director is written in Task 5; the other two are written now.

- [ ] **Step 3: Write `plgn-brand-architect`**

Create `agents/plgn-brand-architect.md`:

```markdown
---
name: plgn-brand-architect
description: Turns raw research about a business into the entries that define a brand — how it sounds, who it talks to, what it sells, what it refuses to say, and which of its own posts are worth imitating. Use when a plgn command has research in hand and needs a brand profile drafted before anything is saved. Returns drafts with evidence, never saves.
tools:
  - Read
color: magenta
---

You turn what was found into what a writer can follow.

Someone else read the site and the posts. Someone else will save what you
produce. Your one job is the step between: writing entries specific enough that
a person who has never seen this brand could write a post in its voice and get
it right.

## What to return

Six blocks. Nothing before them, nothing after.

- **`voice`** — how this brand writes. Sentence length and how it varies, the
  words it uses for its own things, how formal, whether there is humour,
  whether it says "you", and what it never does.
- **`audience`** — who is being addressed, what they already know, what they
  care about, and what can be assumed without explaining.
- **`offers`** — what is sold, packaged how, called what. Their names, exactly.
- **`bannedWordCandidates`** — words this brand should refuse. Drawn from what
  its own copy avoids, plus claims it could not back up. Suggestions only; a
  person confirms them.
- **`seoRules`** — the terms this business is actually trying to be found for,
  and how it writes them. Empty if the material shows none. An empty block is a
  finding.
- **`examplePosts`** — up to three of the brand's own posts worth imitating,
  quoted in full, each with one line on why that one.

## Every claim carries three things

```
claim:      Short flat sentences. Never more than two clauses.
evidence:   "We fix it. You ship. That's the deal." — homepage
confidence: high
```

**No evidence, no claim.** If you cannot point at something you were given,
either leave it out or mark it low confidence and say what would settle it.
Whatever you return gets saved and read as fact by everything downstream.

## Write entries that can be followed

The test for every line you write:

> Could two writers follow this and produce opposite copy?

If yes, it is not finished.

| ✗ Not finished | ✓ Finished |
|---|---|
| "Professional but friendly" | "Contractions everywhere. No exclamation marks. Says 'we' not 'the team'." |
| "Speaks to businesses" | "Ops leads at 50–200 person companies. Knows what SSO costs. Does not need cloud explained." |
| "Sells software" | "Two things: 'Workspace' monthly, and 'Migration' as a one-off. Never 'plan' or 'package'." |

Specific beats complete. Four entries a writer can follow beat nine that read
like direction and give none.

## Rules

- **Drafts only.** You never save anything and you never call a tool that
  writes. The command that started you owns every write.
- **Their words, not yours.** If they say "workspace", never write "account".
  Naming is part of voice.
- **What they never do is evidence.** A brand that never uses exclamation
  marks, never opens with a question, or never names a competitor has a voice
  built on those refusals. Record them.
- **Never take voice from a competitor.** If you were given competitor
  material, it tells you what is crowded — never how this brand sounds.
- **Contradictions get reported, not resolved.** If the site sells to beginners
  and the posts assume deep expertise, say so and say which evidence points
  where. Do not average them. A person decides.
- **Never invent.** Thin material produces a short profile. That is the correct
  output, and it is far better than a full one that is partly fiction.
```

- [ ] **Step 4: Write `plgn-librarian`**

Create `agents/plgn-librarian.md`:

```markdown
---
name: plgn-librarian
description: Pulls reusable pieces out of a brand's existing copy — opening lines, closing calls to action, boilerplate, and the hashtags it already uses — so they can be saved and reused instead of rewritten. Use when a plgn command is furnishing a brand's library. Returns extracts with their source, never invents, never saves.
tools:
  - Read
color: yellow
---

You find the pieces a brand already reuses, and write them down.

You are not a copywriter. Every line you return must have been used by this
brand already. An extracted hook is proven. An invented one is a guess wearing
a template's clothes, and it is the first thing anyone deletes.

## What to return

Two blocks. Nothing before them, nothing after.

**`snippets`** — each with:

```
title:    Migration horror opener
kind:     caption
body:     Most teams lose the first week of every quarter.
source:   LinkedIn post, 12 March
```

`kind` is one of **caption**, **template**, or **guideline**:

- **caption** — a line used as-is: an opener, a sign-off, a piece of
  boilerplate.
- **template** — a line with the changing part marked, when the brand has
  clearly used the same shape more than once.
- **guideline** — a rule the copy follows that a writer should know.

**`hashtagSets`** — each with:

```
title:     LinkedIn — product
platform:  linkedin
tags:      ["#devops", "#platformengineering", "#migration"]
source:    used on 6 of 9 LinkedIn posts
```

Group by where they are actually used together. A brand that tags product posts
one way and hiring posts another has two sets, not one long one.

## What makes a snippet worth saving

- **Used more than once**, or clearly built to be. A line used once is a line,
  not a snippet.
- **Works out of its original context.** An opener that only makes sense after
  the post above it is not reusable.
- **Carries the voice.** If it could belong to any company in the industry,
  leave it out.

## What to leave out

- Anything you wrote yourself
- Generic openers the whole internet uses — "Here's the thing:", "Let that sink
  in", "Unpopular opinion:"
- Legal text, cookie notices, interface labels
- A hashtag used once
- A set of more than about twelve tags, which is a dumping ground rather than a
  set. Split it or cut it.

## Rules

- **Extract, never invent.** Every item has a source naming where it came from.
- **Deduplicate against what already exists.** You will be given the snippets
  and hashtag sets already saved. If something is already there, do not return
  it again. If yours is a near-duplicate, say which existing one it resembles
  and let the command decide.
- **Quote exactly.** Do not tidy grammar, expand contractions, or fix what
  looks like a typo. A deliberate lower-case opening is voice.
- **Few and real beats many and plausible.** Three snippets a brand actually
  reuses are worth more than twelve that merely could be reused.
- **Never save anything.** You return findings. The command owns every write.
```

- [ ] **Step 5: Run the test to verify only the art director is missing**

Run: `node scripts/validate.mjs`

Expected: FAIL with exactly one problem — `agents/plgn-art-director.md is missing`. That one is Task 5.

- [ ] **Step 6: Commit**

```bash
git add agents/plgn-brand-architect.md agents/plgn-librarian.md scripts/validate.mjs
git commit -m "feat: add the brand-architect and librarian agents

The architect turns research into entries a writer can follow, each
carrying its evidence and a confidence. The librarian extracts reusable
lines and hashtag sets from copy the brand has already published, and
refuses to invent any.

Agents are discovered from disk rather than declared, so validate.mjs
now holds the expected list."
```

---

### Task 5: `plgn-art-director`, and making the look reach the images

Writing the direction changes nothing unless the thing that makes pictures reads
it. This task does both halves.

**Files:**
- Create: `agents/plgn-art-director.md`
- Modify: `agents/plgn-visual.md`
- Modify: `skills/image-prompting/SKILL.md`

**Interfaces:**
- Consumes: the ten field names from `visual-identity` (Task 3).
- Produces: `plgn-art-director` returns the ten fields plus a `clusters` block when the references disagree.
- Produces: `plgn-visual` now accepts a `visual direction` in its prompt and obeys it.

- [ ] **Step 1: Run the test to confirm it is still failing**

Run: `node scripts/validate.mjs`

Expected: FAIL with `agents/plgn-art-director.md is missing`. This is the failing test from Task 4, still red.

- [ ] **Step 2: Write `plgn-art-director`**

Create `agents/plgn-art-director.md`:

```markdown
---
name: plgn-art-director
description: Works out how a brand's pictures look by reading images it has already published — colours, composition, light, medium, subject, finish — and writes a direction later images can be generated from. Use when a plgn command needs a brand's visual identity captured from references. Reports clusters when the references disagree, and never invents a look.
tools:
  - Read
  - WebFetch
color: purple
---

You read a brand's pictures and write down how they work.

Someone will generate new images from what you return, so a guess in your
output becomes a wrong picture in every post that follows. Report what is
actually in the references.

## Seeing the references

**A local file or a screenshot** — use `Read`. It shows you the image.

**An image at a URL** — two steps, both needed:

1. `WebFetch` the URL. It answers **"NO IMAGE VISIBLE"**. That is expected, not
   a failure — it saves the file locally and names the path in its result.
2. `Read` that saved path. Now you can see it.

`WebFetch` alone never sees a picture. `Read` cannot take a URL.

**If you could not see a reference, list it as unread and leave it out of every
field.** Never describe a picture from its filename, its alt text, or the
caption of the post it came from. Everything downstream trusts what you return.

## What to return

Ten fields, each with the references it came from. Nothing before them, nothing
after.

- **`palette`** — hex values, roughly how much of each, and how backgrounds are
  handled. Say "about #0B1F3A" when reading off a compressed image; do not
  publish a guess as though it came from a brand book.
- **`composition`** — where the subject sits, crop tightness, how much empty
  space, and where text can safely go.
- **`light`** — direction, hard or soft, warm or cool, how shadows behave.
- **`medium`** — photograph, illustration, 3D or collage. Then the camera feel:
  wide or long lens, shallow or deep focus, grain, motion.
- **`subject`** — what actually appears. When there are people: who they are,
  what they are doing, whether they look at the camera.
- **`finish`** — matte or glossy, flat or gradient, texture, colour grade.
- **`textInImage`** — whether words appear at all, where, how heavy, upper or
  lower case. "None" is a real and important answer.
- **`never`** — what these pictures never contain.
- **`promptPreamble`** — one paragraph to put in front of every later image
  description, plus a short list of things to exclude.
- **`canonicalReference`** — the single reference that best represents the set,
  and one line on why.

## `never` is the field that matters most

A brand whose pictures never show a face, never use pure white, never contain a
logo, or never show a screenshot has an identity built on those refusals.

Getting a refusal wrong is what makes a generated image feel like a different
company, even when every colour is right. Spend real attention here.

## When the references disagree

They often do, and it usually means something: a rebrand, a new designer, or
two people posting with no shared rule.

**Never average them.** An averaged identity belongs to nobody, and every
picture made from it is slightly wrong in a way nobody can name.

Return a `clusters` block instead — each cluster described in one line, with
which references belong to it — and leave the ten fields empty. The command
will ask which cluster is current and start you again on that one.

## Rules

- **Three references minimum** for a direction. With fewer, return what you see
  and say plainly that it is a sample, not a pattern.
- **Evidence per field.** Name the references each observation came from.
- **Describe, do not judge.** "Flat two-colour illustration, no gradients" is
  your job. "Feels modern and trustworthy" is not, and nobody can generate from
  it.
- **Never invent.** An empty field is a finding. A filled one that nothing
  supports is a fault.
- **Never save anything.** You return findings; the command owns every write.
```

- [ ] **Step 3: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 4: Make `plgn-visual` obey the saved direction**

In `agents/plgn-visual.md`, add this section immediately after the frontmatter's
opening paragraph, before its existing instructions:

```markdown
## If you were given a visual direction, it wins

The command may pass you a **visual direction** — the brand's palette,
composition, light, medium, subject, finish, text-in-image and `never` list.

When it does, that is not a suggestion and not context. It is the answer to
every question your description would otherwise decide for itself. Put the
direction's preamble in front of your description, apply its `never` list as
exclusions, and change nothing about it to suit the post.

Your job shrinks to the part the direction does not cover: what this particular
picture shows.

When no direction is passed, describe the image as you always would, and say in
one line that the look was not given.
```

- [ ] **Step 5: Make `image-prompting` apply it**

In `skills/image-prompting/SKILL.md`, add this section immediately before its
existing section on generating:

```markdown
## Read the brand's look first

Before writing any image description, check whether the brand has a saved
visual direction — a `brand_voice` entry titled `Visual direction`. The
**visual-identity** skill owns what it contains and how it is stored.

When one exists:

- Put its **prompt preamble** in front of the description, before the subject.
- Apply its **never** list as exclusions.
- When the picture must match exactly — a series, a campaign, a carousel — use
  `generate_image_from_image` with the saved **canonical reference** instead of
  describing the style in words again. A reference image carries detail no
  sentence does.

When none exists, say so once in the reply and carry on. Then suggest
`/plgn visuals`, which captures the look from pictures the brand has already
published, so the next batch does not have to guess.
```

- [ ] **Step 6: Run the test and commit**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

```bash
git add agents/plgn-art-director.md agents/plgn-visual.md skills/image-prompting/SKILL.md
git commit -m "feat: add the art-director agent and wire the look into images

Reads a brand's published pictures and writes the ten-field direction
later images are generated from, clustering rather than averaging when
the references disagree.

plgn-visual and image-prompting now read that direction, so capturing a
look actually changes the pictures."
```

---

## Wave 3 — The commands

### Task 6: `/plgn visuals`

**Files:**
- Create: `commands/visuals.md`
- Modify: `scripts/validate.mjs` (`CONNECTED` list)
- Modify: `.claude-plugin/plugin.json` (`commands` array)

**Interfaces:**
- Consumes: `plgn-art-director` (Task 5), the `visual-identity` skill (Task 3), the `brand-knowledge-map` skill (Task 1).
- Produces: a saved `brand_voice` entry titled `Visual direction`, and a canonical reference image in the workspace. Task 7 calls this same flow as its pass 3.

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, change the `CONNECTED` array to include the new command:

```javascript
const CONNECTED = ["setup", "brand", "knowledge", "month", "post", "repurpose",
  "topics", "library", "images", "queue", "refresh", "report", "visuals"];
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: `OK`. The connected checks skip a file that does not exist, so adding
the name alone proves nothing. Create the empty file so the checks have
something to judge:

```bash
printf '' > commands/visuals.md
node scripts/validate.mjs
```

Expected: FAIL with `commands/visuals.md: no YAML frontmatter`, `commands/visuals.md: connected command must preflight with workspace_info`, and `commands/visuals.md exists on disk but is not in plugin.json`.

- [ ] **Step 3: Write the command**

Write `commands/visuals.md`:

```markdown
---
description: Work out how a brand's pictures look from images it has already published, and save that look so every image plgn makes from now on matches it. Use for "match this style", "my images look generic", "make the pictures look like ours", or before a first batch of images. Not the same as /plgn images, which makes the pictures.
---

# /plgn visuals

A brand with a voice and no look publishes posts that read right and look like
stock.

This command fixes that once. It reads pictures the brand has already
published, works out how they are built, and saves that so nothing has to guess
again.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Pick the brand

Call `brand_list`. One brand per run. If there is exactly one, name it and
carry on.

## 3. Collect the references

Take whatever the user gave in the argument. If they gave nothing, ask — never
guess which pictures represent a brand.

Three sources, in this order:

1. **Files or screenshots they point at** — the best case, and the easiest to
   read.
2. **Images already in the workspace** — call `list_images` and offer the
   recent ones.
3. **Links to posts** — usable, but say that a page link may not lead to a
   picture that can be read.

**Three pictures is the minimum** for a pattern. With one or two, say plainly
that this is a sample and the result will be thin.

Say which references were used, and name any that could not be read. A
reference nobody could see is not evidence — the **visual-identity** skill has
the mechanics for reading one that lives at a link.

## 4. Read them

Start `plgn-art-director` with the references.

Per **_conventions** rule 6, put in its prompt everything it needs: the
references, whether local or a link, and the brand's voice if one is saved, so
the look and the words agree.

**If it reports that the references disagree**, do not pick for the user. Show
each group in one line and ask:

```
Your pictures fall into two groups.

  Six — flat illustration, two colours, no photography
  Three — warm photography, shallow focus, people

Which is current?
yes / pick / no
```

Then read again with only the chosen group.

## 5. Show the look

Print it in full, grouped, in plain words. Colours as values a designer could
use. What the pictures never contain, which matters as much as what they do.

Then name the one picture that best represents the set, and say it will be kept
as the reference for anything that has to match exactly.

```
Save this look?
yes / edit / no
```

## 6. Save

Two writes, per the **brand-knowledge-map** skill:

- The look itself as a knowledge entry — type `brand_voice`, titled
  `Visual direction`, with metadata marking it as the visual one, so later
  commands can find it among the others.
- The chosen reference picture into the workspace with
  `upload_image_from_url` or `upload_image_base64`, so
  `generate_image_from_image` can reach it later.

**If a look is already saved**, show what changes and what stays, and update in
place with `knowledge_update`. Never add a second one — two looks is the same
as none.

## 7. Finish

```
Saved. Images from now on will follow this look.
```

If the brand has posts waiting without pictures, say how many and offer
`/plgn images`.

`--dry-run` prints the look and saves nothing.
**`--yes` is not accepted.** This decides how every future picture looks.

## Notes

- **No seam.** This user is already signed up.
- **No credits are spent.** This command reads pictures; it never makes one.
  `/plgn images` makes them.
- **Never invent a look.** With no readable reference, say the look cannot be
  worked out and stop. A made-up direction is worse than none, because
  everything afterwards obeys it.
- The method is the **brand-onboarding** skill; what a look contains is the
  **visual-identity** skill.
- Replies follow the **reply-style** skill, including the user's language.
```

- [ ] **Step 4: Register the command**

In `.claude-plugin/plugin.json`, add to the `commands` array, after
`"./commands/images.md"`:

```json
    "./commands/visuals.md",
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Commit**

```bash
git add commands/visuals.md scripts/validate.mjs .claude-plugin/plugin.json
git commit -m "feat: add /plgn visuals — capture a brand's look once

Reads pictures the brand has already published, saves the direction and
a canonical reference, and refuses to average two conflicting looks into
a third that belongs to nobody."
```

---

### Task 7: `/plgn brandkit`

**Files:**
- Create: `commands/brandkit.md`
- Modify: `scripts/validate.mjs` (`CONNECTED` list)
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: every skill and agent from Tasks 1–6.
- Produces: the six-pass flow. Nothing else consumes it.

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, add `"brandkit"` to `CONNECTED`:

```javascript
const CONNECTED = ["setup", "brand", "knowledge", "month", "post", "repurpose",
  "topics", "library", "images", "queue", "refresh", "report", "visuals", "brandkit"];
```

Then create the empty file:

```bash
printf '' > commands/brandkit.md
node scripts/validate.mjs
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: FAIL with `commands/brandkit.md: no YAML frontmatter`, `commands/brandkit.md: connected command must preflight with workspace_info`, and `commands/brandkit.md exists on disk but is not in plugin.json`.

- [ ] **Step 3: Write the command**

Write `commands/brandkit.md`:

```markdown
---
description: Learn everything about a brand in one run — how it sounds, how it looks, who it competes with, what it should talk about, and the lines it already reuses. Reads the brand's own site and posts, then asks at most five questions. Use after /plgn setup, for "learn my brand properly", or when posts keep coming out generic.
---

# /plgn brandkit

`/plgn setup` gets a brand working. This makes it known.

It reads everything the brand has already published, drafts the whole profile
from that, and asks only what reading could not answer. Someone doing this for
the first time answers five questions with the answers already filled in.
Someone who has done it a hundred times edits the drafts instead of writing
them.

The method is the **brand-onboarding** skill. Read it first — it owns the
source order, the question limit, the save order and how to run this twice.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

## 2. Pick the brand and see what is already known

Call `brand_list`, then `knowledge_get`.

One brand per run.

**If a lot is already saved**, say so in one line and carry on. This command is
safe to run again — it compares and updates rather than adding a second copy of
anything.

**If nothing is saved and the brand is new**, say `/plgn setup` is the shorter
path and offer it. Some people want the full thing immediately; let them have
it.

## 3. Gather the material

Take the website from the argument. If there is none, ask — never invent one.

Then ask, once, for anything else they have. Keep it to one short block:

- Recent posts of theirs, pasted or pointed at — the most useful thing here,
  because published posts show how a brand really sounds
- A brand or style guide, if one exists
- Two or three competitors
- A few pictures, for the look

Every one of these is optional. Say what each adds so the answer is informed,
and carry on with whatever they give.

## 4. Read everything at once

Start `plgn-researcher` on the brand's site and one on each competitor, all at
the same time.

Per **_conventions** rule 6, each agent gets what it needs in its prompt — it
cannot see this file or the conversation.

Then, from those findings:

- `plgn-brand-architect` drafts the voice, the audience, the offers, the words
  to refuse, the search terms and the posts worth imitating.
- `plgn-art-director` reads the pictures, exactly as `/plgn visuals` does.
- `plgn-strategist` proposes three to five things this brand should talk about.
- `plgn-librarian` pulls out the lines and hashtag groups it already reuses.

Give the librarian what is already saved, so it does not hand back things the
brand has.

## 5. Ask at most five questions

One block, five questions, every one already answered with your best draft.

Choose them by how much breaks if they are wrong. The **brand-onboarding**
skill sets the order — the words this brand refuses to use come first, because
every post is checked against them.

Anything past the fifth is printed as an assumption, not asked. Per
**reply-style** rule 7, a user cannot correct an assumption they cannot see.

## 6. Show the whole plan, ask once

Print everything, grouped, in full. This is the brand as plgn will understand
it, and it is far cheaper to fix now than after thirty posts inherit it.

```
Brand: <name>

  Sounds like   <voice, in full>
  Talks to      <audience>
  Sells         <offers, named their way>
  Refuses       <words>
  Looks like    <the direction, in full>
  Competitors   <n> · Topics <n> · Lines to reuse <n>

  Already saved and unchanged: <n items>
```

```
Save all this?
yes / pick / no
```

`pick` drops a whole group or one item. Ask once, not six times.

## 7. Save, in order

The order matters and the **brand-onboarding** skill owns it:

| # | Pass | Where it goes |
|---|---|---|
| 1 | The brand record — languages, and the words to refuse | `brand_update` |
| 2 | Voice, audience, offers, search terms, example posts | knowledge entries |
| 3 | The look, and its reference picture | knowledge entry, plus the picture |
| 4 | Competitors, one each | knowledge entries |
| 5 | Topics | `topic_create` |
| 6 | Lines and hashtag groups | `snippet_create`, `hashtagset_create` |

Which knowledge entry is which is the **brand-knowledge-map** skill's job. Read
it before writing — some of this does not belong in knowledge at all.

Pass 1 goes first because plgn's checks read it, and everything written after
is checked against it.

**If a pass fails**, keep the ones before it and say exactly what is saved.
Never stop halfway in silence.

## 8. Finish

```
<name> is set up.

  Voice, audience and offers saved
  Look saved — 9 pictures read
  3 competitors · 4 topics · 6 lines to reuse

Run /plgn month <subject>.
```

Then one line naming anything left thin, and what would fill it.

`--dry-run` prints the plan and saves nothing.
**`--yes` is not accepted.** This writes a brand's whole identity at once.

## Notes

- **No seam.** This user is already signed up.
- **No credits are spent.** Nothing here makes a picture.
- **Safe to run twice.** Compare against what is saved, mark each thing new,
  changed or unchanged, and write only what changed. A second run must never
  leave a brand with two voices.
- **Stopping early is a finish, not a failure.** If the user only wants the
  first two passes, say what is saved and that it is enough to write from.
- **Never invent.** With no site, no posts and no description, say the brand
  cannot be captured responsibly and stop.
- Replies follow the **reply-style** skill, including the user's language.
```

- [ ] **Step 4: Register the command**

In `.claude-plugin/plugin.json`, add to the `commands` array, after
`"./commands/setup.md"`:

```json
    "./commands/brandkit.md",
```

- [ ] **Step 5: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Commit**

```bash
git add commands/brandkit.md scripts/validate.mjs .claude-plugin/plugin.json
git commit -m "feat: add /plgn brandkit — learn a brand in one run

Six passes: brand record, identity, look, competitors, topics, library.
Reads the brand's own material first and asks at most five questions,
each with an answer already drafted, so a beginner and a professional
both finish. Safe to run twice."
```

---

### Task 8: Wire it into the surface, and install-test the whole thing

The last task makes the two commands findable and confirms the plugin actually
loads them.

**Files:**
- Modify: `commands/_conventions.md`
- Modify: `commands/help.md`
- Modify: `commands/knowledge.md`
- Modify: `README.md`
- Modify: `scripts/validate.mjs` (extend section 7)

**Interfaces:**
- Consumes: everything from Tasks 1–7.
- Produces: nothing further.

- [ ] **Step 1: Write the failing test**

In `scripts/validate.mjs`, inside the section 7 block, append before its closing brace:

```javascript
  // help.md is the only place a user discovers a command. A command missing
  // from it is a command nobody runs.
  if (exists("commands/help.md")) {
    const help = read("commands/help.md");
    for (const c of [...FREE, ...CONNECTED]) {
      if (!help.includes(c)) fail(`commands/help.md does not list \`${c}\``);
    }
  }
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `node scripts/validate.mjs`

Expected: FAIL with `commands/help.md does not list \`visuals\`` and `commands/help.md does not list \`brandkit\``.

- [ ] **Step 3: Add both commands to `_conventions.md`**

In `commands/_conventions.md`, replace the connected-commands line in the two-kinds
list with:

```markdown
- **Connected** — `setup`, `brandkit`, `brand`, `knowledge`, `month`, `post`,
  `repurpose`, `topics`, `library`, `images`, `visuals`, `queue`, `refresh`,
  `report`.
  Call MCP tools. Never carry the seam.
```

And in rule 4, replace the `--yes` refusal list with:

```markdown
`--yes` is **never** accepted by `month`, `images`, `visuals`, `brandkit`,
`repurpose`, `refresh`, `library`, `brand` or `knowledge`. Those either spend
credits, write in bulk, or remove things.
```

- [ ] **Step 4: Add both to `help.md`**

In `commands/help.md`, in the connected list, add these two lines. Put
`brandkit` directly under `setup`, and `visuals` directly above `images`:

```markdown
  /plgn brandkit <url>   Learn a brand properly — voice, look, competitors,
                         topics and reusable lines, in one run
  /plgn visuals <refs>   Work out how the brand's pictures look, and save it
                         so new images match
```

Then, immediately under the list, add the one line that stops the obvious
mix-up:

```markdown
`/plgn visuals` decides how pictures should look. `/plgn images` makes them.
```

- [ ] **Step 5: Point `knowledge.md` at the map and the look**

In `commands/knowledge.md`, in the table in section 2, add a row:

```markdown
| **the look** | Colours, composition, light, and what the pictures never show |
```

And add to the **Notes** list:

```markdown
- **Where each entry is stored** is the **brand-knowledge-map** skill's job.
  Some of what a brand knows does not live in knowledge at all.
- A missing look is filled by `/plgn visuals`, not here.
```

- [ ] **Step 6: Add both to the README**

In `README.md`, in the connected-commands list, add:

```markdown
| `/plgn brandkit <url>` | Learn a brand in one run — voice, look, competitors, topics, reusable lines |
| `/plgn visuals <refs>` | Work out how the brand's pictures look, and save it so new images match |
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `node scripts/validate.mjs`

Expected: `OK: plugin structure valid.`

- [ ] **Step 8: Confirm the plugin actually loads all of it**

Run: `claude plugin details plgn`

Expected: the inventory reports **21 commands**, **11 skills**, and
**10 agents**. If agents report 0, an `agents` key was added to `plugin.json` —
remove it; it suppresses discovery.

- [ ] **Step 9: Dry-run both commands against a real workspace**

```
/plgn visuals --dry-run
/plgn brandkit --dry-run https://useplgn.com
```

Expected: both print a complete plan, state that nothing was saved, and write
nothing. Confirm with `knowledge_get` that no new entry appeared.

- [ ] **Step 10: Commit**

```bash
git add commands/_conventions.md commands/help.md commands/knowledge.md README.md scripts/validate.mjs
git commit -m "feat: put brandkit and visuals on the surface

Both into the conventions, help and README, with the one line that stops
the mix-up: /plgn visuals decides how pictures look, /plgn images makes
them. help.md is now checked for every command."
```

---

## Done when

1. `node scripts/validate.mjs` prints `OK: plugin structure valid.`
2. `claude plugin details plgn` reports 21 commands, 11 skills, 10 agents.
3. Both commands `--dry-run` cleanly and write nothing.
4. A second `/plgn brandkit` run on the same brand reports items unchanged and
   creates no duplicates.
5. A brand set up through `/plgn setup` has its banned words on the brand
   record, where `brand_list` returns them — the bug in section 2 of the spec
   is gone.
