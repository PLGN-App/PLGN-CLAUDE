# Brand onboarding — `/plgn brandkit` and `/plgn visuals`

**Date:** 2026-09-07
**Status:** Approved, ready for implementation planning
**Author:** Ahmed Hashim

## 1. Goal

Give a brand a complete, evidence-backed profile in one command, fast enough
that a beginner finishes it and deep enough that a professional does not have to
redo it by hand.

Two commands ship:

- **`/plgn brandkit`** — captures everything about a brand: the brand record,
  its identity, its look, its competitors, its topics, and its library.
- **`/plgn visuals`** — captures the brand's *look* from reference images, and
  saves it so every later generated image matches. Runs standalone, and runs as
  one pass inside `brandkit`.

Success is a brand where `/plgn month` has nothing left to guess.

## 2. Context

`/plgn setup` exists and is deliberately light: connect, pick a brand, save four
entries from a website. It is the right first command and it stays.

What it cannot do, and what this design adds:

- It reads one website. It never reads the brand's own published posts, which
  are the most accurate record of how a brand actually sounds.
- It captures nothing visual, so every generated image is a fresh guess.
- It seeds no topics, snippets or hashtag sets, so a new brand reaches
  `/plgn month` with an empty workspace behind it.
- It asks open questions a beginner cannot answer, and offers a professional no
  way to go deeper.

### Two facts about storage the current commands get wrong

Established by reading the live tool schemas, not by assumption:

1. **Banned words live on the brand record**, written with
   `brand_update(banned_words: [...])`. `brand_list` returns them, and the
   server-side gate refuses any post whose caption contains one.

   `/plgn setup` currently saves banned words with `knowledge_add`. A brand set
   up today can therefore hold a banned-word list that **nothing enforces**.
   This is a live bug and this work fixes it.

2. **`knowledge_add` accepts exactly four types** — `brand_voice`,
   `competitor_data`, `seo_guidelines`, `example_article`. There is no
   `audience` type and no `offers` type. Those entries are stored as
   `brand_voice` with a distinguishing `title`, and `metadata` carries the kind
   so they can be told apart on read.

Nothing in the repo owns these facts today, which is how the first one became a
bug. The `brand-knowledge-map` skill will own them.

### Also unset today

`brand_update` accepts **`locales`**, and it is never set by any command. For a
brand publishing in Arabic and English this decides what language every post is
written in, and snippet bodies are keyed per locale.

## 3. Decisions

| # | Decision | Reason |
|---|---|---|
| D1 | A new command that runs **after** `setup`, rather than replacing it | `setup` stays the short path from installed to connected. Depth is a separate, deliberate act. |
| D2 | **Infer first, confirm by exception** | Nobody describes their own voice accurately, and a beginner cannot answer an open brand question. Reading their material and asking only about gaps is faster and more accurate for both audiences. |
| D3 | The command fills **everything**, including the library | Requested. The risk — invented snippets are the ones `/plgn library` later deletes — is answered by D4. |
| D4 | Snippets and hashtag sets are **extracted from existing copy**, never invented | An extracted hook is one the brand has already used. An invented one is a guess wearing a template's clothes. |
| D5 | Visual direction is a **first-class artefact**, with its own command | "Sounds like the brand" and "looks like the brand" are the same problem twice, and only one of them was solved. |
| D6 | `/plgn visuals` is **connected** | The extraction is only worth doing if it sticks and feeds later image generation. |
| D7 | A hard cap of **five questions** | The cap is what makes one command serve both audiences. See section 4. |
| D8 | Both commands accept `--dry-run` and **refuse `--yes`** | They write in bulk, which `_conventions` rule 4 says may never be skipped blind. |
| D9 | No image credits are ever spent by either command | Onboarding must be free to run and safe to re-run. Generation belongs to `/plgn images`. |

## 4. The method

Owned by the `brand-onboarding` skill, so `brandkit`, `visuals`, `setup` and
`knowledge` share one copy.

### 4.1 The source ladder

Use every rung available, best first.

| Rung | Source | Gives |
|---|---|---|
| 1 | The brand's own published posts | Real voice and real look, as actually used |
| 2 | Website — homepage, about, pricing, one product page, one article | Positioning, offers, proof, marketing voice |
| 3 | Brand guidelines, a style guide, a deck the user pastes or points at | Stated rules, palette, taboos |
| 4 | Competitor sites, 3–5 | Contrast and gaps. **Never voice.** |
| 5 | The user's own answers | Only what no source can show |

**The governing rule:** *sources beat opinions for how a brand sounds; opinions
beat sources for what it intends.* Published copy is the truth about voice.
Only the user knows what is changing next quarter.

### 4.2 Evidence and confidence

Every drafted claim carries:

- **the claim**, written so it can guide writing,
- **its evidence** — a short quote or the reference it came from,
- **a confidence**, high or low.

A claim with no evidence is not saved. It becomes a question or an assumption.

### 4.3 The question budget

**At most five questions**, asked in one block, each with a proposed default.

This cap is the noob/pro split:

- A beginner reads five questions that already have answers filled in, and
  says yes.
- A professional ignores the defaults, edits four of them, and finishes in the
  same minute.

Neither is asked to write anything from a blank page.

Questions are chosen by **downstream blast radius**, in this order:

1. **Banned words** — gate every post server-side
2. **Offer names** — wrong names make every call to action wrong
3. **Audience level** — decides the jargon in every post
4. **Locales** — decides the language of everything
5. **Any conflict between two sources** — never averaged, always asked

Gaps beyond the fifth are **printed as stated assumptions**, per `reply-style`
rule 7. They are never guessed silently.

### 4.4 Write order

Order is load-bearing.

| # | Pass | Writes | Why here |
|---|---|---|---|
| 1 | Brand record | `brand_update` — locales, banned words | The gate reads these; every later write is checked against them |
| 2 | Identity | `knowledge_add` — voice, audience, offers, SEO rules, example posts | Everything downstream reads these |
| 3 | Visual direction | `knowledge_add`, plus `upload_image_from_url` or `upload_image_base64` for the canonical reference, so `generate_image_from_image` can reach it later | Needs the voice for tone alignment |
| 4 | Competitors | `knowledge_add` type `competitor_data`, one per competitor | Independent; safe to fail alone |
| 5 | Topics | `topic_create` × 3–5 | Needs identity and competitors |
| 6 | Library | `snippet_create`, `hashtagset_create` | Extracted from material already read |

If a pass fails, the passes before it stand and the user is told exactly what is
saved, per `_conventions` rule 2.

### 4.5 One plan, one confirmation

Everything is shown grouped, then a single `yes / pick / no`. `pick` drops whole
groups or single items. Six separate prompts for one command is a worse
experience than the thing being confirmed.

### 4.6 Safe to re-run

Every item is marked **new**, **changed**, or **unchanged**. Only new and
changed items are written. Unchanged items are silent. A second run must never
double a brand's saved knowledge.

### 4.7 The quality bar

Before an entry is saved it must pass: *could two writers follow this and
produce opposite copy?* If yes, it is too vague to save — vague guidance is
worse than none, because it reads like direction and gives none.

Example posts are checked by `plgn-brand-guard` before they are saved, because a
bad example poisons every later draft that learns from it.

### 4.8 Never

- Invent a voice or a look with no source
- Spend image credits
- Ask for, store or repeat a key
- Write anything before the confirmation
- Average two conflicting identities into a third one nobody owns

## 5. Command surface

### 5.1 `/plgn brandkit [url]` — connected

1. `workspace_info`, then `brand_list` — pick one brand
2. Gather sources: the site, the brand's own posts, any pasted material,
   competitor URLs, reference images. The URL argument is optional; when it is
   missing, **ask** for it, per `_conventions` rule 10. Never invent one.
3. Fan out `plgn-researcher` — own site plus one per competitor, in parallel
4. `plgn-brand-architect` composes the identity artefacts
5. `plgn-art-director` composes the visual direction (section 5.2)
6. `plgn-strategist` proposes topics; `plgn-librarian` extracts the library
7. Ask up to five questions, in one block, with defaults
8. Show one plan, take one `yes / pick / no`
9. Write in the order of 4.4, then report what is saved

`--dry-run` stops after step 8 and writes nothing.

### 5.2 `/plgn visuals [refs]` — connected

Standalone door for "match this style", and pass 3 of `brandkit`. Preflights
with `workspace_info` like every connected command, and honours `--dry-run` by
printing the direction and saving nothing.

Accepts local image files, screenshots, image URLs, and images already in the
workspace via `list_images`.

Extracts, with evidence per claim:

- **Palette** — hex values, rough proportions, background treatment
- **Composition** — subject placement, crop tightness, negative space, where
  text can safely sit
- **Light** — direction, hardness, temperature, shadow behaviour
- **Medium and camera** — photo, illustration or 3D; lens feel, depth of field,
  grain
- **Subject matter** — what appears, and who the people are when there are
  people
- **Finish** — matte or gloss, gradients, texture, colour grade
- **Text in image** — whether it appears, where, weight, case
- **Never** — what these images never contain. As with voice, the refusals
  define it.
- **Prompt preamble and negative prompt** — a block appended to every later
  image prompt
- **Canonical reference** — the one image to feed `generate_image_from_image`
  when an exact match matters

**Conflicting references are never averaged.** If the set splits into two looks
— a rebrand, a change of designer — both clusters are reported and the user is
asked which is current.

## 6. Agents

Three new. Existing agents are reused unchanged except `plgn-visual`.

| Agent | Tools | Job |
|---|---|---|
| `plgn-brand-architect` | Read | Turns research plus user answers into the identity artefacts, each with its source quote and a confidence. Returns drafts only. |
| `plgn-librarian` | Read | Extracts reusable snippets and hashtag sets from copy that already exists. Dedupes against what is saved. Never invents. |
| `plgn-art-director` | Read, WebFetch | Extracts the visual direction from a set of references. Reports clusters rather than averaging. |

`plgn-brand-architect` is not `plgn-researcher`, which gathers and refuses to
interpret, and not `plgn-strategist`, which does positioning and topics rather
than identity.

Per `_conventions` rule 6, every rule an agent needs goes into its prompt.
Agents never call tools that write.

### 6.1 Verified: how an agent sees a remote image

Established by running both tools, not assumed:

- `WebFetch` on an image URL **cannot see the image**. It answers
  "NO IMAGE VISIBLE" — and **saves the binary to a local file**, naming that
  path in its result.
- `Read` on that saved path **does see the image**.

So a remote image is reachable in two steps: fetch it, then read the file the
fetch saved. This is why `plgn-art-director` carries both tools, and it is
documented in the `visual-identity` skill so nobody later concludes the URL path
is impossible.

Local files and pasted screenshots need only `Read`.

## 7. Skills

| Skill | Owns |
|---|---|
| `brand-onboarding` | The method of section 4 — ladder, evidence, question budget, write order, re-run, the quality bar |
| `brand-knowledge-map` | Where each piece of brand knowledge lives: the brand record versus the four knowledge types, plus topics, snippets and hashtag sets. The file that prevents the section 2 bug from returning. |
| `visual-identity` | What a visual direction contains, how to extract one, how it is stored, how it feeds image generation, and the honest limits — including that a reference the model could not see is never described as though it had been |

## 8. Changes to existing files

| File | Change |
|---|---|
| `commands/setup.md` | Banned words written with `brand_update`, not `knowledge_add`. Set locales. Point at `brand-knowledge-map`. Close by offering `/plgn brandkit`. |
| `commands/knowledge.md` | Point at `brand-knowledge-map` for where entries live; check the visual direction alongside the other entries. |
| `commands/help.md` | List both new commands, and disambiguate `/plgn visuals` (the brand's look) from `/plgn images` (makes pictures for posts). |
| `commands/_conventions.md` | Add both commands to the connected list. |
| `agents/plgn-visual.md` | Read the saved visual direction and obey it, rather than describing each image fresh. |
| `skills/image-prompting/SKILL.md` | Apply the saved preamble, negative prompt and canonical reference. |
| `.claude-plugin/plugin.json` | Register two commands and three skills. Do **not** add an `agents` key — it suppresses agent discovery. |
| `scripts/validate.mjs` | Section 9. |
| `README.md` | Both commands in the surface list. |

## 9. Validator changes

- Add `brandkit` and `visuals` to `CONNECTED`, so the free/connected contract,
  the `workspace_info` preflight check and the seam check all apply to them.
- Assert `skills/brand-knowledge-map/SKILL.md` exists and states both storage
  facts: that banned words are written with `brand_update`, and that exactly
  four knowledge types exist.
- Assert no command instructs saving banned words with `knowledge_add` — the
  check that would have caught the original bug. Concretely: fail when a file
  under `commands/` or `skills/` contains "banned word" within 200 characters
  of `knowledge_add`, in either order — exempting
  `skills/brand-knowledge-map/SKILL.md`, which must state the rule and would
  otherwise fail the check it exists to enforce.
- Assert `visual-identity` documents the two-step remote-image path, so the
  verified mechanic cannot be quietly dropped.

## 10. Testing

1. `node scripts/validate.mjs` passes.
2. `claude plugin details` reports the new commands, skills and agents — agent
   count rises from 7 to 10.
3. `/plgn brandkit --dry-run` against a live workspace writes nothing and prints
   a complete plan.
4. `/plgn visuals --dry-run` on a set of local images returns a direction with
   evidence per claim.
5. A second `/plgn brandkit` run on the same brand marks items unchanged and
   writes no duplicates.

## 11. Non-goals

- Replacing `/plgn setup`
- Generating any image
- Reading a brand's social accounts through their APIs — references are
  supplied by the user
- Scoring or ranking a brand. `/plgn audit` owns that.
- A free variant of either command

## 12. Risks

| Risk | Mitigation |
|---|---|
| The kit is furnished but shallow — many entries, none sharp | The 4.7 quality bar refuses vague entries. Fewer, sharper entries beat complete ones. |
| Extraction from thin sources produces confident nonsense | No evidence, no save. Low-confidence items become questions or stated assumptions. |
| Users confuse `/plgn visuals` with `/plgn images` | Disambiguated in `help`, the README, and both descriptions. |
| A rebrand mid-library makes references disagree | Clusters are reported, never averaged; the user says which is current. |
| Six passes make one command too long to finish | `pick` drops groups. Passes 1 and 2 alone leave a usable brand, and the report says so. |
