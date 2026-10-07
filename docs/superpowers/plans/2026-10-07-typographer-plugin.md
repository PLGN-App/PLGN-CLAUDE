# The typographer, plugin 1.16.0: thin plan

Spec: `docs/superpowers/specs/2026-10-07-typographer-design.md` (sections 1-3 are the role; section 4 "Plugin" is this run; the desk part is a later run).
Repo: plugin, `F:/G drive/Projects/hbs-projects/plgn-lane-plugin`, branch `feat/typographer`. The check for every task is `node _dev/scripts/validate.mjs` (prints `OK: plugin structure valid.`).
Commit every task with `git -c user.name=PLGN -c user.email=waslahapp993@gmail.com commit -m "<one line>"`: one line, no Co-Authored-By, no Claude-Session line. Never open or edit `../plgn` or `../plgn-desk`.

**Goal**
1. Add `plgn-typographer`, a fifth picture role that styles and places the words a frame carries, before the picture is made, without changing a word.
2. The designer hands its Typography and Grid sections to it and takes its block as given; `/plgn images` (and `/plgn month`'s quick path) run it only when a frame carries words.
3. Ship as 1.16.0 with every key that code parses unchanged.

**Decisions**
1. The roster becomes **12** agents, not 11. Reason: 11 are on disk already (`plgn-product-sheet` shipped in 1.15.0); the spec's "(11 agents)" was written before it.
2. `commands/post.md` gets no 4b. Reason: in the plugin it makes no picture (no order, no designer, no generate call); its pictures come from `/plgn images`, which runs 4b. Flagged in Open.
3. In `commands/images.md` item 4 of section 5 is split: item 4 keeps the order; a new list item `4b.` holds the typographer and then the designer read and send that used to end item 4. No new `## ` heading anywhere in the three commands. Reason: the desk replaces `## 5. Per post: read, think, check, save` up to the next `## ` line, so a new level-2 heading would leak plugin steps into the desk; items 5's references to "item 4's prompt" (the art director's) stay true.
4. "A frame carries words" means the creative director's image words for that frame are not empty. One typographer call per post covers all its frames with words; a post with none never calls it (nothing spent either way: the typographer costs no points).
5. `fit` in `/plgn images`: asked of the person in plain words with the shorter line, `yes / no`. On yes that frame's words become the shorter line and 4b runs again with them; on no nothing changes. The words change only on a yes.
6. `/plgn month` gets 4b on its quick path only for a post whose concept format is made of words (quote card, reel cover, meme); its words are the concept's hook exactly as saved. The `art_director` look stands in for the order. Its `question` is asked once for the run; a `fit` never stops the run: the hook stays and step 9 names the line and the shorter one. Reason: month's rule is "ask once, not thirty times", and the spec's "to the copywriter's round" has no place after step 5 has saved.
7. The two-type-systems `question` moves from the designer to the typographer. The literal `TYPE NOTES: designer to propose` stays. Reason: the art director writes it and the desk keys on it.
8. The block is saved nowhere new: it travels in the designer's prompt and ends inside `generation_prompt`. No brief, server or desk key changes.
9. The finishing pass gains check **16**, added at the end. Reason: checks 1-15 keep their numbers, which `failed_on` examples use.
10. The designer with no block writes no words, as the owner worded it. The desk risk is flagged in Open.
11. `reference/_conventions.md` is left as it is: it lists no roles. README gets one sentence naming the four picture roles.
12. Typographer frontmatter: `tools:` is `Read` only (pinned), `color: red` (no other agent uses it).

**Interfaces**
- `agents/plgn-typographer.md`: frontmatter `name: plgn-typographer`, `description: <one paragraph>`, `tools: [Read]`, `color: red`.
- Its answer, one frame: `{ "typography": { "system": str, "styling": str, "concept": str, "placement": [ { "text": str, "where": str, "near": str } ], "fit": null | { "text": str, "why": str, "shorter": str } } }`.
- Its answer, a carousel: the same with `"frames": [ { "frame": int, "placement": [ ... ] } ]` in place of the top-level `"placement"`.
- Its answer, no type system: `{ "question": "Two type systems: ... Which fits?" }`.
- `_dev/scripts/validate.mjs`: `EXPECTED_AGENT_COUNT = 12`; `AGENTS` gains `"plgn-typographer"`; `AGENT_CONTRACTS` gains `["plgn-typographer", ["\"typography\":", "\"placement\":", "\"fit\":", "\"frames\":"]]`; a new section `// --- 17. 1.16.0: the typographer` before `if (fails.length) {`, grown by tasks 1-6.
- `.claude-plugin/plugin.json` and `.claude-plugin/marketplace.json`: `"version": "1.16.0"`.

**Review Focus**
1. Keys code parses never change: the designer's `executing`, `slides`, `generation_prompt`, `alt_text`, `asset_ids`, `qa_findings`, `check`; the `brief_create` and `brief_finalize` calls. Only the typography block is new.
2. Desk headings stay word for word: images `## 5. Per post: read, think, check, save`, `## 6. Make the pictures`, `## 7. Attach`; post `## 3.` to `## 7.`. Nothing new at level 2 inside them.
3. Words never change without a yes. The typographer never writes, cuts or drops a word; a frame with no words never reaches it, and the designer then writes none.
4. Moved text is moved word for word (the designer's Typography and Grid sections into the typographer); the designer keeps Arabic spelling, physical truth, the finishing pass and the alt text.
5. Validate traps: never backtick a name with a tool prefix that is not a tool (`image_words` fails as an unknown MCP tool: write "the director's image words"); never backtick a write tool in an agent file.
6. Nothing internal reaches the person: questions say "the words in the picture", never "typographer" or "block" (reply-style).

### Task 1: The typographer agent and the roster

**Files**
- Create: `agents/plgn-typographer.md`
- Modify: `_dev/scripts/validate.mjs`

**What changes**
Validate first (it then fails), then the agent. The agent, in this order: frontmatter as in Interfaces, the description in the creative agents' style ("Use when a plgn command has an order and a frame that carries words, before plgn-designer writes the prompt"; "never writes, cuts or drops a word"). The role, from spec section 1's opening, ending "You cannot read the plugin's files. Everything you need is in your prompt." `## What you get`: spec section 1 Inputs; with no order in the prompt the brand's look stands in, and a look naming no type system counts as TYPE NOTES "designer to propose"; a carousel's frames come in one prompt. `## The words are not yours`: spec section 3's first bullet, letter for letter, plus the `fit` rule. `## What you decide`: spec section 1 items 1-4. `## Type`: the designer's lines 53-76 (from "Know the schools." to "heavy display on a fixed plate system.") word for word, except the paragraph "The brand's type system.", rewritten as spec section 3's second bullet (the saved system wins; only "designer to propose" with no choice in the prompt asks; never pick silently). `## Grid`: the designer's lines 80-83 word for word. `## What you return`: exactly one JSON object, the three forms in Interfaces, each with a filled example; the question example is the designer's, as it stands. `## Never`.

**Anchors**
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace the line `  const EXPECTED_AGENT_COUNT = 11;` with the same line set to 12.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace the line `    "plgn-product-sheet", "plgn-researcher", "plgn-strategist",` with the same line ending in `"plgn-typographer",`.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly after the line `["plgn-product-sheet", ["\"parts_map\":", "\"grid_prompt\":", "\"cells\":", "\"marks\":", "\"cell_id\":"]],` add the typographer entry from Interfaces.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add section 17 with its own small `need(path, needles)` helper and two checks: the typographer's frontmatter tools are exactly `Read` (read as section 16 reads the product sheet's), and its body names "Two type systems", "designer to propose" and "letter for letter".

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-typographer.md is missing` and `agents/*.md has 11 files on disk, expected 12`: fail before the file exists.
- The contract check (`contract must name "\"typography\":"` and the other three keys) and `agents/plgn-typographer.md: tools must be exactly Read`: fail on an empty file. All pass once the agent is written.

**Commit**: `feat: plgn-typographer, the fifth picture role`

### Task 2: The designer takes the block as given

**Files**
- Modify: `agents/plgn-designer.md`, `_dev/scripts/validate.mjs`

**What changes**
The Typography and Grid sections become one section `## The typography block`: a frame with words comes with a block from `plgn-typographer`; paste `system`, `styling`, `concept` and every `placement` line (per frame in a carousel's `frames`) into part 6 as given; never restyle, recolour, move or re-case a text; when the prompt carries no block the frame has no words: write none; a `fit` note is never the designer's. Prompt part 6 and the finishing pass follow; the two-type-systems question leaves "What you return". Arabic spelling, physical truth, the finishing pass and the alt text stay word for word.

**Anchors**
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace `with typography, grid and finish for the school and field it was ordered in` with "with the typographer's words placed as given and the finish for the school and field it was ordered in".
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), directly after the line `image model may be given it, and the languages the brand publishes in.` add one sentence: when a frame carries words, the typography block from `plgn-typographer` comes right after the order.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), find the line `## Typography` and find the line `post after post. **Hierarchy:** first, second and third, exactly as the creative director set it.`; everything from the first to the second, both included, becomes the one section `## The typography block` described above.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
6. **Typography and grid:** every text element with its exact string in quotes, typeface style, weight, colour,
   treatment and position. Quote the director's image words exactly and write no others; `[]` means no words.
```

with item `6. **The words:**` the block's system, styling and concept, then each placement line with its exact string in quotes, as given, and no other words; no block, no words.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), directly after the line `  list. 15. Safe zones are respected for the platform and ratio.` add the bullet `- **Type:** 16. Every placement line of the typography block was honoured: each text where the block put it, in its system and styling; a frame with no block shows no text.`
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace `1 yes · 2 yes · ... · 15 yes` with the same string ending `16 yes`.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

````
Name only the frames that failed; none appears with an empty list. When the person must choose, two type systems:

```json
{ "question": "Two type systems: a heavy Kufi display, loud and sure; or a soft geometric sans, calm and premium. Which fits?" }
```
````

with its first sentence alone.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add to section 17 the designer checks listed under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-designer.md: the Typography and Grid sections moved to plgn-typographer`: fails while a line is exactly `## Typography` or `## Grid`.
- `agents/plgn-designer.md must name "## The typography block"` and `... "16. Every placement line"`: fail before the edit.
- `agents/plgn-designer.md: the two type systems question is plgn-typographer's`: fails while "Two type systems" is in the file.

**Commit**: `feat: the designer takes the typography block as given`

### Task 3: /plgn images, step 4b

**Files**
- Modify: `commands/images.md`, `_dev/scripts/validate.mjs`

**What changes**
Section 5's item 4 ends at "the post's platform." A new item `4b. When a frame carries words` (decision 4) sends `plgn-typographer` the order word for word, each such frame's words exactly as the director returned them, the `art_director` block from item 4 (palette and look) and the platform and ratio; one call per post. Its `question` goes to the person like the director's, it starts again with the answer, and later posts of this brand in the run get the same answer. Its `fit` follows decision 5, with a plain example ending `yes / no`. Then 4b carries the designer read and send moved from item 4, wording kept, with "then the typography block, word for word, when this step ran" right after "the order word for word first". Item 5 loses the designer question and says a round that changes the idea or a frame's words runs 4b again before the designer.

**Anchors**
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
   the post's platform. Then
   read `context_get(role: "designer", campaign_id: <the post's campaign, if
   it has one>)` for the brand's identity and picture rules. Send
   `plgn-designer` the order word for word first, then the concept, the
```

with "the post's platform." closing item 4, then item 4b as above, ending on the moved designer sentence up to "then the concept, the".
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
   item comes first and the order's findings go to the art director with
   the new idea. A designer `question` (two type systems) is put to the
   person like the director's.
```

with the first two clauses up to "the new idea." and the sentence about running 4b again.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add to section 17 the images checks listed under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `commands/images.md: item 4b must send plgn-typographer before plgn-designer`: slices from `\n4b. When a frame carries words` to the next `\n5. ` and needs `` `plgn-typographer` `` before `` `plgn-designer` `` in it. Fails before: no item 4b.
- `commands/images.md: the two type systems question is the typographer's`: fails while "A designer `question`" is in the file.
- `commands/images.md: no level-2 heading may sit inside section 5` (desk guard): the text between `## 5. Per post: read, think, check, save` and `## 6. Make the pictures` holds no `\n## `. Passes before; it guards decision 3.

**Commit**: `feat: images step 4b sends the typographer before the designer`

### Task 4: /plgn month, words on the quick path

**Files**
- Modify: `commands/month.md`, `_dev/scripts/validate.mjs`

**What changes**
One paragraph opening `**4b. Words in a picture.**` (decision 6): the quick path draws no words except for a quote card, a reel cover or a meme, whose picture carries the concept's hook exactly as saved and nothing else; send `plgn-typographer` the group's `art_director` block in place of an order (no type system in it: TYPE NOTES "designer to propose"), the hook and the platform and ratio; write its system, styling, concept and each placement line, the hook in quotes, into the description as given; for Arabic add a letter-by-letter line for each easily confused letter, unquoted, marked not to be drawn; its `question` is asked once for the run, before the first such picture; a `fit` never stops the run. Step 9's example gains the fit line.

**Anchors**
- In `commands/month.md` (script path `docs/../commands/month.md`), directly before the line `Write the post's **alt text** at the same time, one per language the brand` add the paragraph above.
- In `commands/month.md` (script path `docs/../commands/month.md`), directly after the line `  1 has no image — that one took too long; the post goes out without it` add `  1 quote card's line is long for its frame — a shorter one: "…"; /plgn images can remake it`.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add to section 17 the month check listed under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `commands/month.md: the quick path must style a word picture with plgn-typographer`: needs "**4b. Words in a picture.**", `` `plgn-typographer` `` and "quote card" in that paragraph. Fails before: no such paragraph.

**Commit**: `feat: month's quick path places a word picture's words with the typographer`

### Task 5: The skills name the typographer

**Files**
- Modify: `skills/creative-brief/SKILL.md`, `skills/image-prompting/SKILL.md`, `_dev/scripts/validate.mjs`

**What changes**
creative-brief: a new paragraph `**Between the order and 4 · the words.**` (the fifth role: only when a frame carries words, words unchanged, the designer takes the block as given), followed by the block for the Bunduq hero order above it: one frame, a headline and a support line, in the order's Kufi, `"fit": null`. Step 4 says the designer takes the block as given and keeps "alt text per frame" (a validate needle). image-prompting: the chain names the typographer, and part 6 follows the block.

**Anchors**
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly before the line `**4 · check → final text.**` add the paragraph and the JSON example.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
**4 · check → final text.** `plgn-designer` checks the direction and the order
against the brand and the brief, then writes the final image text in the prompt
order (see **image-prompting**) and the alt text per frame — or raises
objections if the direction or the order doesn't hold up.
```

with the same paragraph plus "taking the typography block as given" after "writes the final image text".
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace

```
On the brief path the work runs as a chain: idea, order, execution.
`plgn-creative-director` writes the literal picture first and rejects it, then
scores one idea from each of five lenses. `plgn-art-director` turns the idea
into the order. `plgn-designer` writes the final text in seven parts, in this
order, with the brand colour as an accent:
```

with the chain "idea, order, words, execution" and one sentence that `plgn-typographer` styles and places a frame's words when it carries any, the rest kept.
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace the line `6. typography and grid` with `6. the words, as the typographer's block places them`.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add to section 17 the skill checks listed under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `skills/creative-brief/SKILL.md must name "`plgn-typographer`"` and `... "\"placement\":"`: fail before (no typographer, no block example).
- `skills/image-prompting/SKILL.md must name "`plgn-typographer`"`, and a fail while it still says "6. typography and grid".

**Commit**: `docs: creative-brief and image-prompting name the typographer`

### Task 6: 1.16.0

**Files**
- Modify: `README.md`, `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`, `_dev/scripts/validate.mjs`

**What changes**
README names the four picture roles in one sentence: creative director (the idea), art director (the order), typographer (the words' type and place, only when a frame carries words), designer (execution and finish). CHANGELOG 1.16.0 (2026-10-07), in the 1.14.0 entry's plain style: the new role and that it never changes a word; images' step 4b and the `yes / no` on a long line; the designer takes the block and checks every placement; month's quote cards, reel covers and memes; every answer the desk and the server already read keeps its exact keys. Version 1.16.0 in both manifests.

**Anchors**
- In `README.md`, directly after the line `drift apart as the plugin grows.` add a blank line and the roles sentence.
- In `CHANGELOG.md`, directly after the line `# Changelog` add a blank line and the `## 1.16.0 (2026-10-07)` entry.
- In `.claude-plugin/plugin.json` (script path `docs/../.claude-plugin/plugin.json`), replace the line `"version": "1.15.1",` with the same line at 1.16.0.
- In `.claude-plugin/marketplace.json` (script path `docs/../.claude-plugin/marketplace.json`), replace the line `"version": "1.15.1",` with the same line at 1.16.0.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add to section 17 the checks listed under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `README.md must name plgn-typographer`: fails before.
- `versions disagree: plugin.json <a>, marketplace.json <b>, CHANGELOG <c>`: the manifest version, the marketplace plugin's version and the first `## x.y.z` heading of the CHANGELOG must be equal. Passes before (1.15.1 in all three); mutation-test it by bumping one file alone, then bump all three.

**Commit**: `chore: 1.16.0`

### Task 7: Live proof on Bunduq Coffee (needs the owner's go)

**Files**
- none

**What changes**
With the owner's go (it spends points), load the plugin from this branch in Claude Code and run `/plgn images` on Bunduq Coffee: one post whose idea carries a headline, one with none, and one carousel of 3. Watch that the typographer is called once for the first and the carousel, never for the second; the designer's prompt holds the block's lines word for word after the order; the carousel has one system and a placement per frame; a deliberately long headline brings the plain `yes / no` question and nothing changes on no; every finished picture shows the words exactly as the director wrote them.

**Anchors**
- none

**Tests**
- The checks above, read off the run; `node _dev/scripts/validate.mjs` still prints OK.

**Commit**: none (proof only)
