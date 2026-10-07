# Leftovers sweep (plugin): thin plan

Spec: `_dev/superpowers-docs/specs/2026-10-07-leftovers-sweep.md` (git-ignored, read it from disk), and every follow-up file it names. Repo plgn-claude (`plgn-lane-plugin`), branch `sweep/leftovers`. ../plgn and ../plgn-desk were read for this plan; builders never edit them.

## Goal

Close every open reviewer note on the plugin: creative-mode s1, c1, s2, a5, c2; agency-roles a10-a19; server PS9-PS15; desk PS1-PS3.
Wording only: every block code parses keeps its keys, labels and section headings; validate gains three checks (PS15) and two full needles (PS9).
Each item is ticked in its own file (server and desk items in one new closed file); the sweep ships as 1.15.1.

## Decisions

1. **Tests are phrase checks from Git Bash, plus validate.** From the repo root: `for p in "<phrase>" ...; do grep -qF -- "$p" <file> || echo "MISSING: $p"; done` for phrases that must be there (each was checked absent on 2026-10-07, so it prints MISSING before the edit and nothing after), the same loop with `&& echo "FOUND: $p"` for phrases that must be gone, then `node _dev/scripts/validate.mjs` must print `OK: plugin structure valid.` The repo has no package.json and no npm test. Phrases are ASCII; Arabic is never a test phrase. A JSON or width check is a scratch node script, never committed.
2. **Paths are written in full, then as a "script path" under `docs/..`** so the anchor script can read them. Builders use the first path. Build in order: Task 12 re-wraps text that Tasks 1 and 11 wrote.
3. **a16 and PS14 meet on one PRODUCT line:** `PRODUCT: sheet <asset id> · cell three_quarter · role: hero · …` (PS14). a16 asked for "real photo" only because sheets had not shipped; 1.15.0 shipped them and `/plgn images` acts only on `sheet <id> · cell <cell>`. a16's TYPE NOTES fix stands.
4. **s1's stand-in and mood-board parts go in `agents/plgn-content-creator.md`**, where the concept JSON and the five platform lines live; the skill gets the source fallback, the pick sentence and the intent. The desk already reads a non-numeric `reference` as a stand-in (plgn-desk `citedFrom`, regex `^reference\s+(\d+)`), and its platform parser only needs one number on the Mood board line.
5. **Server and desk items go in a new git-ignored file**, `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md`, one line each, never in CHANGELOG (it stays for users). Ids are prefixed by source, because both lists have a PS1-PS3: `server PS9`, `desk PS1`. Task 1 creates the file with the heading `# Product sheet follow-ups closed in the plugin (1.15.1)`; later tasks append, each line `- [x] <source> PS<n>. <plugin file>: Fixed: <one line>.`
6. **PS10: the phase-1 caps are retired and nothing is reflowed for them.** validate.mjs checks no line caps, so only the agency-roles follow-ups file records them: the ruling's review figures (designer 261, art director 260, images.md 312) and the `wc -l` counts after Task 12 (the branch base already has designer 263, images.md 319).
7. **c1 is two tasks:** wording (Task 11), then a pure re-wrap (Task 12), so Task 12's test is "the same words as before".
8. **Re-wrap rule** (Task 12, and every other edit): wrap at the file's own width (about 78 in commands and creative-brief, about 115 in the creative director and designer), hanging indents kept. Never touch frontmatter, fenced blocks, table rows or headings. A validate needle or a desk phrase never breaks across lines.
9. **The desk stays safe.** Section headings in `commands/product-sheet.md`, `commands/images.md` and `commands/post.md` never change (desk overlays replace sections by heading). PS1 and PS2 make the desk's `DESK_COPY` find-strings vanish: harmless, the desk sweep drops them. `check_generation` is named in `commands/product-sheet.md` only inside sections 4 to 9 (a desk test reads every command after the overlay drops those). The designer's first sentence and the director's `## What you return` and `## When you cannot` headings stay word for word.
10. **Rulings applied as written:** PS3, PS11, PS12, a12 (a, d), a15, a19, and a13 (c-d), a18, a6 (one 1,000-character line in the designer; a18 ticked by reference; a1-a9 stay open).
11. **PS12 follows the server's schema** (plgn `src/domains/product-sheets/tools.ts`): `variant` is optional ("left out when it has none"), `use_map` is optional ("needed for a use sheet"), and "a new draft replaces an older draft of the same variant" (and kind).
12. **s2 drops the "about 17 picture views of 60" figure.** It now depends on how many reference accounts are read.
13. **Ticks:** `- [ ]` becomes `- [x]`, the item text stays, and one sentence is appended: ` Fixed: <what changed>.` or ` Noted: <why no text changes>.` The two follow-up files under `_dev/` are tracked in git although `_dev/` is ignored: tick them on disk, never stage them (spec: not committed).
14. **No backticked bare key with a tool prefix in prose.** validate reads a backticked `brand_…`, `image_…`, `sheet_…` (and the other tool prefixes) name as a tool: write a key as `"brand_read"`, with its quotes inside the backticks.
15. **Commits:** `git -c user.name=PLGN -c user.email=waslahapp993@gmail.com commit -m "<one line>"`, no Co-Authored-By or Claude-Session line, never push. Stage only the task's plugin files by path. "points" never "credits", lowercase "plgn", Western digits, no model name with a price in an example; Bunduq Coffee is the only brand in examples.

## Interfaces

- Concept JSON, unchanged keys (agents/plgn-content-creator.md): `{"concepts": [{"format", "hook", "visual", "reference", "shape", "cta", "device", "product_role"}]}`; `reference` is `reference <n>` | `reference S<n>` (new) | `asset <name>`.
- Platform reply, unchanged labels (same file): `Big idea:` `World:` `Series:` `Mood board: references <numbers>` `Headlines:`.
- Big idea save (skills/creative-brief/SKILL.md): `knowledge_add(type: "reference", title: "Creative platform", campaign_id, content, metadata: { kind: "creative_platform", intent: "<the big idea's one sentence>; every post in this campaign starts here; not a look to copy", big_idea, visual_world, series_devices, mood_board, headline_system })`.
- Director answer, unchanged (agents/plgn-creative-director.md): `benefit_label`, `meanings`, `candidates: [{metaphor, territory, score, rejected_because?}]` (example now six), `concept`, `concept_why`, `slides: [{order, role, art_direction}]`; five extra keys only after `An art director takes this idea next.`
- Designer answer, unchanged (agents/plgn-designer.md): `executing?`, `slides: [{order, generation_prompt, alt_text, asset_ids}]` | `qa_findings` | `question` | `check: {…, hand_over?}`.
- Art director Job B, unchanged fourteen lines (agents/plgn-art-director.md); its prompt from `/plgn images` now starts `Job B: write the order for this post.` (commands/images.md).
- Sheet save (commands/product-sheet.md): `sheet_create(offering_id, kind, grid: { secure_url, public_id }, cells, parts_map, never)` plus `variant` only with variants and `use_map` only for `kind: "use"`.
- Plan job (commands/product-sheet.md to agents/plgn-product-sheet.md): adds `dimensions` only when the offering or saved knowledge states them.
- validate (_dev/scripts/validate.mjs): tool-name regex ``/`([a-z]+_[a-z0-9_]+)(?:`|\()/g`` (a backticked name closed by a backtick or followed by "("); section 16 pins plgn-product-sheet's `tools` to exactly `mcp__plugin_plgn_plgn__image_view` and checks the `**Connected**` bullet of reference/_conventions.md names every entry of `CONNECTED`; product-sheet needles `needs a real photo or official render of this exact variant` and `Never a third picture`.
- Version `1.15.1` in .claude-plugin/plugin.json and .claude-plugin/marketplace.json; CHANGELOG.md `## 1.15.1 (2026-10-07)`.

## Review Focus

1. **Every parsed shape still parses.** The director example is valid JSON with six candidates, exactly one without `rejected_because`, and it scores highest; designer examples parse; concept keys, the five platform labels, Job B's fourteen labels and `sheet_create`'s argument names are unchanged.
2. **Desk guards hold** (Decision 9): headings; "Start `plgn-copywriter` with the idea" and "`plgn-art-director` reads the pictures" each on one line; no `check_generation` in product-sheet sections 1 to 3 or Notes; no "terminal" left in product-sheet.
3. **Task 12 moved line breaks only:** the word check is empty for all four files and validate's month, post and creative-brief needles survive.
4. **Rulings exactly** (Decision 10): PS11's neutral example and one-picture sentence, PS12's optional `variant`/`use_map` and the draft warning, PS3's client-neutral sentence, six candidates, the restored "carries the frame" sentence, the `Job B:` first line, the designer's 1,000-character line.
5. **Every item is closed in its file:** creative-mode has no `- [ ]` left; agency-roles keeps only a1-a9 open; the closed file has desk PS1-PS3 and server PS9-PS15; no `_dev/superpowers-docs` file is staged.
6. **The new validate checks bite:** each fails on its mutation (Task 10) and passes on the tree.

### Task 1: creative-brief and the content creator (s1, a16, server PS14)

Files:
- Modify: `skills/creative-brief/SKILL.md`
- Modify: `agents/plgn-content-creator.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`, `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (on disk only)
- Create: `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: phrase checks on the two plugin files; validate

What changes: s1's five parts, a16's TYPE NOTES, PS14's PRODUCT line (Decision 3), stand-ins and the mood board in the agent (Decision 4).

Anchors:
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
  yet"> · pictures: <metadata.pictures, else "none"> · <given|found>`.
```

with the same line ending `· <metadata.source: given or found; else found>`.`.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `Words that end one with a pick: this one, do it, a number, "3 and 7 together", «نفذ».` add: "A pick runs `Job: platform` (in `/plgn campaign`) or `Job: concepts` (in `/plgn post` and `/plgn month`), with the pick in `## So far`."
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
    intent: "every post in this campaign starts here; not a look to copy",
```

with `intent: "<the big idea's one sentence>; every post in this campaign starts here; not a look to copy",` at the same indent.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace `PRODUCT: approved sheet view · role: hero · scale: a hand-sized tin beside a small cup` with `PRODUCT: sheet <asset id> · cell three_quarter · role: hero · scale: a hand-sized tin beside a small cup`, and replace `TYPE NOTES: designer to propose` with `TYPE NOTES: the brand's geometric Kufi, heavy headline, light support`.
- In `agents/plgn-content-creator.md` (script path `docs/../agents/plgn-content-creator.md`), replace `    Mood board: references <3 to 6 numbers from the index>` with `    Mood board: references <3 to 6 numbers from the index; with fewer saved, as many as exist>`.
- In `agents/plgn-content-creator.md` (script path `docs/../agents/plgn-content-creator.md`), replace

```
sentence. `reference` is `reference <n>` or `asset <name>`. `shape` is one of
```

with the same sentence reading `` `reference` is `reference <n>`, `reference S<n>` for a stand-in, or `asset <name>` ``; re-wrap that paragraph at the file's width.
- In `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`), find the line `- [ ] s1.` and tick it. In `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`), find the line `- [ ] a16.` and tick it, saying PRODUCT follows server PS14 because sheets shipped in 1.15.0.
- Create the closed file (Decision 5) with its heading and the line for `server PS14` (skills/creative-brief/SKILL.md, the example's PRODUCT is a sheet cell).

Tests:
- T1.1 present after, MISSING today, in skills/creative-brief/SKILL.md: "else found" "with the pick in" "big idea's one sentence>; every post" "cell three_quarter · role: hero" "TYPE NOTES: the brand's geometric Kufi". Gone after: "approved sheet view" "TYPE NOTES: designer to propose".
- T1.2 present after, MISSING today, in agents/plgn-content-creator.md: "reference S<n>" "as many as exist".
- T1.3 validate prints OK (creative-brief needles untouched).

Commit: `fix(creative-brief): stand-ins, mood board, pick, big idea intent, sheet cell in the example (s1, a16, PS14)`

### Task 2: The creative director's words (a5, a12 b-d)

Files:
- Modify: `agents/plgn-creative-director.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (on disk only)
- Test: phrase checks on `agents/plgn-creative-director.md`; validate

What changes: a12 (d) restores the "carries the frame" sentence; a12 (b) says where the brand read and hierarchy go (Decision 14 for the key names); a12 (c) separates a claimed outcome from the role word; a5 bounds "When you cannot" when a concept is carried. Re-wrap each paragraph at the file's width.

Anchors:
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
the designer owns the execution and the finish. You never decide how a picture looks, and you do not write the
final image text. You decide what it says, and why only this brand can say it.
```

with the same words plus: "What physically carries the frame (a real photo, a built object, a scene or type alone) is not yours to choose either: plgn decides it from what the brand sells."
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace `Answer these in one line each before you think of a single idea:` with that sentence plus "(in `"brand_read"` when the prompt holds the line `An art director takes this idea next.`; otherwise think them through and write nothing)".
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
  the brand's records. A result, a before and after, or a proof frame needs a `proof` entry behind it.
```

with: "the brand's records. A claimed outcome (a before and after, a proof frame, a promise of what it does) needs a `proof` entry behind it; the role word `result` alone claims nothing and needs none."
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
well. An idea that scores under 6 is not picked, except the concept's idea when the prompt carries one; if none
reaches 6, the rule in "When you cannot" applies. **Every idea you do not pick carries the reason you did not.**
```

with the same words plus, after "applies.": 'With a concept, "When you cannot" applies only when the concept needs something the brand does not have.'
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
Say what is seen first, second and third. The first is the one thing the viewer takes in at once; keep the order
short and true to the idea.
```

with the same words plus "(in `"hierarchy"` when the line is there; otherwise think it through and write nothing)".
- In `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`), find the line `- [ ] a5.` and tick it.

Tests:
- T2.1 present after, MISSING today: "What physically carries the frame" "otherwise think them through and write nothing" "otherwise think it through and write nothing" "alone claims nothing" "applies only when the concept needs something the brand does not have".
- T2.2 still present: "## What you return" "## When you cannot"; never there: "asked_words" "In the plgn desk" "Every frame passes". validate prints OK (no unknown tool name).

Commit: `fix(creative-director): what carries the frame, proof, brand read and hierarchy, cannot with a concept (a5, a12)`

### Task 3: The creative director's example shows six ideas (a12 a, a15)

Files:
- Modify: `agents/plgn-creative-director.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (on disk only)
- Test: a JSON check on `agents/plgn-creative-director.md`; validate

What changes: the `## What you return` example holds the literal idea and one per lens, six in all, still one winner (scale, 9).

Anchors:
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
    { "metaphor": "a rope under tension", "territory": "metaphor · climbing gear", "score": 7,
      "rejected_because": "reads as effort, not as the product's strength" },
```

with that entry followed by three more in the same two-line form, each with a `rejected_because` and a score under 9: `tension · the school run at 7:10` (6, shows the problem louder than the strength), `displacement · the playground swing` (5, a stunt nobody believes of hair), `document · the school gate at 3pm` (8, true, but the strength reads only with the caption).
- In `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`), find the line `- [ ] a12.` and tick it (all four parts, with Task 2); find the line `- [ ] a15.` and tick it.

Tests:
- T3.1 JSON check: the first json block after "## What you return" parses; it holds 6 candidates (3 today, so it fails); exactly one has no `rejected_because` and it holds the strictly highest score; the first territory starts "literal · "; the other five start with tension, scale, displacement, metaphor, document; every `metaphor` and `territory` is at most 200 characters.
- T3.2 validate prints OK (contract needles `candidates`, `"rejected_because":`, `"concept":`).

Commit: `fix(creative-director): the example shows all six candidates (a12, a15)`

### Task 4: The designer (a10, a13, a14, a18)

Files:
- Modify: `agents/plgn-designer.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (on disk only)
- Test: phrase checks and a JSON check on `agents/plgn-designer.md`; validate

What changes: a10's label and text-slot sentence; the ruling's 1,000-character line (a13 c-d, a18, a6); a13 (a) and (b); a14's phrase. The first sentence "You are the last read before money is spent." stays.

Anchors:
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), directly after the line `Plain sentences in this order, with no labels and no numbering. Under 4,000 characters in all.` add two sentences: "The school's standard is for your check, not the prompt; name the label only as 'its own label, exactly as in the product photo', and name no headline or text slot a frame does not fill." and "When your prompt says the model named in the quote takes at most 1,000 characters, a one-frame prompt is written to fit 1,000 characters: cut craft first, never what keeps the picture physically true."
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
the ids of the assets the frame uses in `asset_ids`, at most four, the product's source and the chosen reference
first. A frame that uses none has an empty list. For `in use`, the one-action rule below applies.
```

with: "in `asset_ids` the ids of the assets the frame uses, at most four, and only ids of saved assets your prompt lists; a reference that is a post has no id. A frame that uses none has an empty list. For `in use`, the one-action rule below applies."
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
  "executing": "Executing product beauty for food and drink, finishing signature warm window light, delivery Instagram 4:5",
```

with the same line reading `finishing signature matte-soft`.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
Never run an edit pass over the whole image: re-rendering can silently change a label that was right. After the
third failed attempt, add `"hand_over": "<the reasons, for a person>"` to the same check object and stop.
```

with the same words, the second sentence reading "After three failed attempts, add `"hand_over": "<the reasons, for a person>"` to the same check object and stop.", with "After three failed attempts" on one line.
- In `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`), find the line `- [ ] a10.` and tick it; find the line `- [ ] a13.` and tick it (c-d: the 1,000-character line, ruling 2026-10-07); find the line `- [ ] a14.` and tick it; find the line `- [ ] a18.` and tick it as Noted: a10 is in this file and fixed here; the 1,000-character line is in; reconciling the seven parts with the desk's picture-words check rides with a2 and a6 in phase 3.

Tests:
- T4.1 present after, MISSING today: "The school's standard is for your check, not the prompt" "1,000 characters" "finishing signature matte-soft" "a reference that is a post has no id" "After three failed attempts". Gone after: "warm window light, delivery" "the product's source and the chosen reference" "third failed attempt".
- T4.2 every json block under "## What you return" parses.
- T4.3 the body still starts "You are the last read before money is spent."; validate prints OK (needle "number (count of `asset_ids` + 1)" kept).

Commit: `fix(designer): label and text slots, 1,000-character prompts, saved asset ids only, matte-soft, three attempts (a10, a13, a14, a18)`

### Task 5: Job B by name, and the accent rule (a11, a19)

Files:
- Modify: `agents/plgn-art-director.md`
- Modify: `commands/images.md`
- Modify: `commands/brandkit.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (on disk only)
- Test: phrase checks on the three files; validate

What changes: Job B step 5 repeats the accent rule; `/plgn images` names the job on the art director's first line; brandkit says "two passes of Job A".

Anchors:
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), directly after the line `same; HERO & HIERARCHY, PRODUCT and DELIVERY are each post's own.` add: "In COLOUR, the brand's colour is an accent on its own things; the dominant colour is the real place's, unless the brand's look sets a coloured set on purpose."
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
   make it here and reuse it) and send `plgn-art-director` that block, the
```

with: "make it here and reuse it) and send `plgn-art-director` a prompt whose first line is `Job B: write the order for this post.`, then that block, the" at the item's 3-space indent, re-wrapping item 4's next lines only as far as needed.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
- `plgn-art-director` reads the pictures, in two jobs. It cannot call
```

with "- `plgn-art-director` reads the pictures, in two passes of Job A. It cannot" and move "call" to the start of the next line, re-wrapping that bullet's lines at 2-space indent.
- In `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`), find the line `- [ ] a11.` and tick it; find the line `- [ ] a19.` and tick it.

Tests:
- T5.1 present after, MISSING today: "the dominant colour is the real place's" (art director) "Job B: write the order for this post." (images) "in two passes of Job A" (brandkit). Gone after: "in two jobs" (brandkit).
- T5.2 validate prints OK: section 14 still finds "`plgn-art-director` reads the pictures" on one line with `pictures` within 600 characters; images keeps "always uses\n`generate_image_from_image`".

Commit: `fix(art-director, images, brandkit): Job B named in the prompt, accent rule in COLOUR, two passes of Job A (a11, a19)`

### Task 6: Brandkit evidence and picture views (c2, s2)

Files:
- Modify: `commands/brandkit.md`
- Modify: `skills/brand-onboarding/SKILL.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (on disk only)
- Test: phrase checks on both files; validate

What changes: c2: a `your reference` picture is evidence only from the brand's own accounts or site. s2: each picture is opened once, in the sort; the 17-of-60 figure goes (Decision 12).

Anchors:
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
  `/plgn visuals` does. Pictures from other accounts marked `your reference`
  go in only as "what they want to look like", for light and composition,
  the way competitors' pictures go in as contrast. They never feed the
  palette, `never` or the canonical reference. The person's own posts stay
  evidence. If the look
```

with, at 2-space indent: "`/plgn visuals` does. A `your reference` picture is evidence only when it comes from the brand's own accounts or site. Every other `your reference` picture (another account's, a file, a bare picture link) goes in only as 'what they want to look like' (keep the file's double quotes), for light and composition, the way competitors' pictures go in as contrast; it never feeds the palette, `never` or the canonical reference. If the look".
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
  workspace's free daily research limits; a full run uses about 17 picture
  views of 60. When a limit is used up, say which reads were skipped.
```

with: "workspace's free daily research limits, and each account read adds its own picture views. When a limit is used up, say which reads were skipped."
- In `skills/brand-onboarding/SKILL.md` (script path `docs/../skills/brand-onboarding/SKILL.md`), replace

```
  2–4 pictures each, per **visual-identity**. Open each picture with
  `image_view` before it is saved, and put `metadata.take`, `metadata.leave`,
```

with: "2–4 pictures each, per **visual-identity**. Each picture was opened once, in the art director's sort; do not open it again to save it. Put `metadata.take`, `metadata.leave`," re-wrapped at 2-space indent.
- In `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`), find the line `- [ ] c2.` and tick it; find the line `- [ ] s2.` and tick it.

Tests:
- T6.1 present after, MISSING today: "evidence only when it comes from the brand's own accounts or site" "a bare picture link" (brandkit) "opened once, in the art director's sort" (onboarding). Gone after: "about 17 picture" (brandkit) "Open each picture with" (onboarding).
- T6.2 validate prints OK (brandkit step 3 still never says "save"; onboarding keeps `confirm: true` and its four names).

Commit: `fix(brandkit, brand-onboarding): reference pictures are evidence only from the brand's own, one look per picture (c2, s2)`

### Task 7: Product sheet, links and full needles (desk PS1, desk PS2, server PS9)

Files:
- Modify: `commands/product-sheet.md`
- Modify: `_dev/scripts/validate.mjs`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: phrase checks on `commands/product-sheet.md`; validate

What changes: section 1 names the plan page and says "in a chat"; section 2 names the offerings page; both PS9 sentences sit on one line each, and validate checks the plan's full needles. Edit validate first and see it fail.

Anchors:
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace

```
    "a real photo or official render of this exact variant", "sheet_create", "sheet_mark", "sheet_cut",
    "sheet_approve", "image_view", "Never a third"]);
```

with the same list holding "needs a real photo or official render of this exact variant" and "Never a third picture".
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
section 1 does. No points left: say so, point at billing in the dashboard,
never ask for a key in the terminal, and stop. `cloudinary: missing`: say so
```

with the same sentence reading "point at Plan & usage (useplgn.com/settings/plan), never ask for a key in a chat, and stop", re-wrapped.
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
The offering must have at least one photo. With none, stop and say it needs
a real photo or official render of this exact variant, and point at
Knowledge › Offerings in the dashboard. A sheet with no source is a
guess.
```

with: "The offering must have at least one photo. With none, stop: the sheet / needs a real photo or official render of this exact variant. Point at / Knowledge › Offerings (useplgn.com/knowledge?tab=offerings). A sheet with / no source is a guess." (slashes mark the line breaks).
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
second look a cell that still fails is `needs_real_photo`. Never a third
picture. A second picture is paid for with the points the quote stated.
```

with the same words, the line breaking after "`needs_real_photo`." so "Never a third picture." starts the next line.
- Append to the closed file one line each for `desk PS1`, `desk PS2` and `server PS9`.

Tests:
- T7.1 validate after the validate.mjs edit alone prints two FAIL lines for commands/product-sheet.md (the full needles), and OK after the command edits.
- T7.2 present after, MISSING today: "Plan & usage (useplgn.com/settings/plan)" "never ask for a key in a chat" "useplgn.com/knowledge?tab=offerings". Gone after: "in the dashboard" "terminal". Headings "## 1. Check the connection" and "## 2. Find the product" unchanged.

Commit: `fix(product-sheet): name the plan and offerings pages, full needles on one line (PS1, PS2, PS9)`

### Task 8: Product sheet, the quote and the grid's address (desk PS3, server PS11)

Files:
- Modify: `commands/product-sheet.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: phrase checks on `commands/product-sheet.md`; validate

What changes: a neutral quote example and the one-picture balance (PS11); one client-neutral sentence on where the grid's address comes from (PS3). `check_generation` stays inside section 5.

Anchors:
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
1 picture now, 1 more only if a cell fails — GPT 2.5 Flare 2K, 2 points
each, 4 at most, leaving 20.
```

with two lines: "1 picture now, 1 more only if a cell fails — <model>, <n> points each," and "2 at most, leaving <n>."
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
model. If they name one, pass it as `model` here and on every picture of
this run.
```

with the same two lines, then a new paragraph: "When the balance covers only one picture, say so before the yes: this run makes the Product Sheet's picture alone, a cell that fails its first look is marked `needs_real_photo` with no second picture, and the Use Sheet waits until there are points for it."
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
`check_generation`. It reports the picture's `url` and `public_id`; keep
both.
```

with: "`check_generation`. The grid's address is the finished picture's `url` and `public_id`: where the client waits for the picture, `check_generation` reports them; where a sheet job makes the picture, the job's answer carries them. Keep both; section 7 sends the `url` as `secure_url`."
- Append to the closed file one line each for `desk PS3` and `server PS11`.

Tests:
- T8.1 present after, MISSING today: "<model>, <n> points each," "2 at most, leaving <n>." "covers only one picture" "where a sheet job makes the picture". Gone after: "GPT 2.5 Flare".
- T8.2 `check_generation` appears only between "## 4." and "## Notes"; validate prints OK (quote before spend).

Commit: `fix(product-sheet): neutral quote, one-picture balance, where the grid's address comes from (PS3, PS11)`

### Task 9: Product sheet, drafts, the save and dimensions (server PS12, PS13)

Files:
- Modify: `commands/product-sheet.md`
- Modify: `agents/plgn-product-sheet.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: phrase checks on both files; validate

What changes: Decision 11 for the draft warning and the save; dimensions only when known (PS13).

Anchors:
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), directly after the line `that the approved one stays in use until the new one is approved.` add: "When it lists a draft of this variant, of either kind, waiting for approval or not, say that this run replaces it (plgn retires the older draft of the same variant and kind when the new one is saved), and ask `yes / no` before going on."
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
Send `plgn-product-sheet` the plan job: `kind: "product"`, the offering's
name, the variant, the description, its photo links, and the `never` lines.
```

with the same list ending "the `never` lines, and its dimensions when the offering's text or the brand's saved knowledge states them. Never estimate one; with none, say so in the prompt."
- In `commands/product-sheet.md` (script path `docs/../commands/product-sheet.md`), replace

```
Call `sheet_create(offering_id, variant, kind, grid: { secure_url, public_id
}, cells: <the measured cells>, parts_map, use_map, never)`. `grid` is the
```

with: "Call `sheet_create(offering_id, kind, grid: { secure_url, public_id }, cells: <the measured cells>, parts_map, never)`, adding `variant` only when the offering has variants and `use_map` only for a use sheet. `grid` is the", re-wrapped.
- In `agents/plgn-product-sheet.md` (script path `docs/../agents/plgn-product-sheet.md`), replace

```
- `dimensions` from the brand, never estimated.
```

with: "- `dimensions`, only as the prompt gives them from the brand; never estimated. With none given, the spec panel leaves dimensions out."
- Append to the closed file one line each for `server PS12` and `server PS13`.

Tests:
- T9.1 present after, MISSING today (command): "this run replaces it" "dimensions when the offering" "only when the offering has variants" "only for a use sheet". Gone after: "variant, kind, grid".
- T9.2 present after (agent): "the spec panel leaves dimensions out".
- T9.3 validate prints OK (agent contract keys; no write tool named in the agent).

Commit: `fix(product-sheet): draft replacement asked first, optional variant and use_map, dimensions only when known (PS12, PS13)`

### Task 10: Validate checks calls, the sheet agent's tools and the Connected list (server PS15)

Files:
- Modify: `_dev/scripts/validate.mjs`
- Modify: `reference/_conventions.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: validate, two mutations

What changes: PS15's three parts (Interfaces). Write the checks first; validate fails on the Connected list until the conventions edit.

Anchors:
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace

```
  for (const m of body.matchAll(/`([a-z]+_[a-z0-9_]+)`/g)) {
```

with the same loop on the regex below, and a one-line comment above it: 1.15.1 (PS15), a backticked name followed by "(" is checked too. The new regex:

```
/`([a-z]+_[a-z0-9_]+)(?:`|\()/g
```

- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add section `// --- 16. 1.15.1 (PS15) ---`: (a) the `tools:` list in agents/plgn-product-sheet.md's front matter (lines `  - <name>`) is exactly `mcp__plugin_plgn_plgn__image_view`, else fail naming the file; (b) the bullet of reference/_conventions.md starting `- **Connected**`, up to the next blank line, names every entry of `CONNECTED` in backticks, else fail naming the missing ones.
- In `reference/_conventions.md` (script path `docs/../reference/_conventions.md`), replace

```
- **Connected** — `setup`, `brandkit`, `brand`, `campaign`, `knowledge`, `month`, `post`, `undo`,
  `repurpose`, `topics`, `library`, `images`, `visuals`, `queue`, `refresh`,
  `report`, `why`.
```

with the same list ending "`report`, `why`, `assets`, `import-store`, `product-sheet`."
- Append to the closed file the line for `server PS15`.

Tests:
- T10.1 before the conventions edit, validate fails naming reference/_conventions.md and `assets`, `import-store`, `product-sheet`; after it, OK. Every backticked call form in commands, agents and skills names a known tool (checked 2026-10-07), so the wider regex adds no failure.
- T10.2 mutation: `sheet_get(sheet_id:` written as `sheet_gett(sheet_id:` in commands/images.md makes validate name `sheet_gett`; restore. It passes today, so it fails before the change.
- T10.3 mutation: a second tools line `  - mcp__plugin_plgn_plgn__sheet_create` in agents/plgn-product-sheet.md makes validate fail naming that file; restore. It passes today.

Commit: `chore(validate): check tool calls, pin the sheet agent's tools, Connected list (PS15)`

### Task 11: Month and campaign wording (c1, part 1)

Files:
- Modify: `commands/campaign.md`
- Modify: `commands/month.md`
- Test: phrase checks on both files; validate

What changes: campaign step 8 names no example campaign; month's think-first says where its five lines go when no campaign is matched.

Anchors:
- In `commands/campaign.md` (script path `docs/../commands/campaign.md`), replace

```
Then point at `/plgn month "Ramadan"`.
```

with: 'Then point at `/plgn month "<campaign>"`, with the campaign's name.'
- In `commands/month.md` (script path `docs/../commands/month.md`), replace

```
ends with the big idea saved after its own yes; outside one it guides this month only and
saves nothing. Then show the plan again.
```

with: "ends with the big idea saved after its own yes; outside one it saves nothing: its five lines go into the concepts prompt as `Big idea:` under `## The campaign`, for this run only. Then show the plan again."

Tests:
- T11.1 present after, MISSING today: 'month "<campaign>"' (campaign) "go into the concepts prompt" "for this run only" (month). Gone after: 'month "Ramadan"' (campaign).
- T11.2 validate prints OK.

Commit: `fix(month, campaign): think first outside a campaign, no fixed example name (c1)`

### Task 12: Re-wrap the creative-mode paragraphs (c1, part 2)

Files:
- Modify: `commands/month.md`
- Modify: `commands/campaign.md`
- Modify: `commands/post.md`
- Modify: `skills/creative-brief/SKILL.md`
- Modify: `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (on disk only)
- Test: a word check, a width check, desk phrases, validate

What changes: Decision 8. Re-wrap only paragraphs and list items that hold a line over 80 characters, at about 78; leave every other line byte for byte. Characters, not bytes, are counted. No word is added, removed or reordered.

Anchors: none in the four files (no line is replaced; they are re-wrapped by rule).
- In `_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-06-creative-mode-follow-ups.md`), find the line `- [ ] c1.` and tick it (wording in Task 11, width here).

Tests:
- T12.1 word check, per file: `diff <(git show HEAD:<file> | tr -s '[:space:]' '\n') <(tr -s '[:space:]' '\n' < <file>)` prints nothing.
- T12.2 width check (scratch node script): outside the front matter, fenced blocks, table rows and lines that are one code span with optional end punctuation, no line in the four files is over 80 characters. Today it lists about 60 lines (month 108-110 and 354, post 55-60, creative-brief 16-75 among them).
- T12.3 still on one line: "Start `plgn-copywriter` with the idea" (post); "Review at useplgn.com" (month); every section heading unchanged; validate prints OK (month, post, creative-brief needles).

Commit: `style(month, campaign, post, creative-brief): re-wrap the concept paragraphs to the files' width (c1)`

### Task 13: CHANGELOG, version 1.15.1, caps and the last ticks (a17, server PS10)

Files:
- Modify: `CHANGELOG.md`
- Modify: `.claude-plugin/plugin.json`
- Modify: `.claude-plugin/marketplace.json`
- Modify: `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`, `_dev/superpowers-docs/specs/2026-10-07-product-sheets-plugin-closed.md` (on disk only)
- Test: phrase checks, open-item counts, validate

What changes: a17's two 1.14.0 lines; a 1.15.1 entry (wording fixes, no new tool, no answer changes shape); both manifests; PS10's caps (Decision 6). The README has no version badge.

Anchors:
- In `CHANGELOG.md`, replace

```
- The creative director works from the brand's own words, shows its candidates, and asks the person to choose between two directions when the brand has no look yet.
```

with the same line ending "when the brand has no formula yet."
- In `CHANGELOG.md`, replace

```
- The designer writes each picture's prompt from that order, in seven parts, and checks the finish against the school.
```

with the same line ending "in seven parts, and knows how to check the finish against the school (not run by any command yet)."
- In `CHANGELOG.md`, directly after the line `# Changelog` add a blank line, `## 1.15.1 (2026-10-07)` and three or four plain bullets: wording fixes in the picture agents and commands, no new tool, every answer keeps its shape; `/plgn product-sheet` names its pages, quotes with a neutral example, and asks before replacing a draft; the creative director's example shows all six ideas.
- In `.claude-plugin/plugin.json` (script path `docs/../.claude-plugin/plugin.json`), replace `"version": "1.15.0",` with `"version": "1.15.1",`; in `.claude-plugin/marketplace.json` (script path `docs/../.claude-plugin/marketplace.json`), replace `"version": "1.15.0",` with `"version": "1.15.1",`.
- In `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (script path `docs/../_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md`), find the line `- [ ] a17.` and tick it; at the end add one line: the phase-1 line caps are retired (server PS10, ruling 2026-10-07); at the 1.15.0 review designer 261, art director 260, images.md 312; at 1.15.1 the `wc -l` counts of those three files.
- Append to the closed file the line for `server PS10`.

Tests:
- T13.1 present after, MISSING today: "## 1.15.1 (2026-10-07)" "no formula yet" "not run by any command yet" (CHANGELOG); "1.15.1" in both manifests. Gone after: "no look yet" (CHANGELOG), "1.15.0" in both manifests.
- T13.2 `grep -c -- "- \[ \]"`: creative-mode follow-ups 0; agency-roles 9 (a1-a9). The closed file holds 10 lines starting `- [x]`: desk PS1-PS3, server PS9-PS15.
- T13.3 validate prints OK; `git status --short` shows no staged file under `_dev/superpowers-docs`.

Commit: `chore: 1.15.1 -- leftovers sweep (a17, PS10)`
