# Professional image prompts, plugin 1.17.0: thin plan

Spec: `docs/superpowers/specs/2026-10-08-pro-image-prompt-design.md` (sections 2 and 3, the version, and proof 5.1 are this run; section 4, the desk, is a later run; 5.2, the lab round, is the owner's).
Repo: plugin, `F:/G drive/Projects/hbs-projects/plgn-lane-plugin`, branch `feat/pro-prompts`. The check for every task is `node _dev/scripts/validate.mjs` (prints `OK: plugin structure valid.`).
Commit every task with `git -c user.name=PLGN -c user.email=waslahapp993@gmail.com commit -m "<one line>"`: one line, no Co-Authored-By, no Claude-Session line. Reviewer notes go to `_dev/superpowers-docs/specs/2026-10-08-pro-prompts-plugin-follow-ups.md`; `_dev/` is git-ignored except `_dev/scripts`, so `git add -f` that file. Never open or edit `../plgn`, `../plgn-desk`, `../plgn-claude` or `../plgn-lane-desk`. Write Arabic only with the Edit or Write tools.

**Goal**
1. The designer thinks in the owner's 22-section form and writes plain prose: a real camera, where each thing stands, where the product and the empty space sit, materials and people, and a closing priority line.
2. The art director's order names the camera; the finishing pass checks place and camera (17, 18); the image-prompting skill holds the eight questions; the creative-brief example shows it all.
3. Ship as 1.17.0 with every parsed key, every command heading and every existing agent heading unchanged.

**Decisions**
1. The priority line closes part 7 (Rules) as the last sentence of the prompt; there is no part 8. Reason: image-prompting, the CHANGELOG and the desk all say "seven parts"; the spec only fixes it as the last sentence.
2. The priority line is written without quotation marks, and the quotation-marks paragraph lists it with the preamble as never quoted. Reason: in the prompt, quotation marks mean words to draw.
3. The designer's craft parts become eight labelled bullets in the spec's order: Camera (takes in the old "lens feel"), Framing and composition (takes in "the shot", plus grid position and share of frame), Where things stand, Light, Styling, Materials and people (takes in "texture and finish"), Grade, Space for the words. Light, styling and grade keep their current words. Reason: spec 3; nothing the old list said is lost.
4. With no CAMERA line in the prompt, the designer picks a camera that fits the school and writes it in the camera sentence the same way. "Says so" in spec 2.1 means that sentence: no new JSON key, `executing` unchanged. Reason: parsed fields never change, and the desk does not run the art director yet, so this is the desk's normal path.
5. A reused campaign order keeps its camera like its light (the designer's "Read the order" list gains "camera"). Reason: CAMERA is the brand's usual set-up, not one post's.
6. Art director: Job B answers in "fifteen" labelled lines; the CAMERA form line is the spec's words exactly; how to write it (numbers fine, no camera or lens brand names) goes in a short paragraph after the COLOUR paragraph. Reason: the form line stays as the spec words it, and the brand-name ban needs saying where the line is written.
7. Checks 17 and 18 go in a new bullet `- **Place and camera:**` after the Type bullet; checks 1-16 and their words stay. Reason: `failed_on` examples and the desk use the numbers.
8. The eight questions live in the image-prompting skill only. The designer's eight craft parts plus its priority line are the same questions in prose order, because the designer cannot read skills. Reason: one copy of the questions, no text to drift.
9. No command file changes, `/plgn month`'s quick-path description included. Reason: the spec lists no command change, and the desk replaces command sections by heading. The quick path is flagged in Open.
10. The 1,000-character cut order is the spec's; the priority line stays last even then. Reason: spec 2.5 says it is the last sentence of every prompt.
11. Validate gets its own section 18 with the spec's four pins plus five cheap guards: CAMERA sits between LIGHT and COLOUR, "the fourteen" is gone, the eight craft labels run in order, "cut craft first" is gone, and creative-brief names `CAMERA:` and "keep in this order". Reason: each guards a line this run changes.
12. The creative-brief example prompt is new (none exists today): it goes after step 4's paragraph, for the Bunduq hero frame and the typography block above it. Reason: spec 3 asks the example to show the five blocks and the priority line.
13. The version lives only in `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json` and the CHANGELOG's top heading (searched: README and SETUP carry none). There is no owner-gated task: spec 5.2 is the owner's.

**Interfaces**
- `agents/plgn-art-director.md`, order form, a new line between `LIGHT:` and `COLOUR:`: `CAMERA: <the brand's usual height, distance range, focal length look, depth>`. Job B: "fifteen labelled lines".
- `agents/plgn-designer.md`, the priority line, word for word, the last sentence of every `generation_prompt`, unquoted: `If anything must give, keep in this order: the label and the words, the product, where things stand, the light, the style.`
- `agents/plgn-designer.md`, craft bullets in this order: `- **Camera:**`, `- **Framing and composition:**`, `- **Where things stand:**`, `- **Light:**`, `- **Styling:**`, `- **Materials and people:**`, `- **Grade:**`, `- **Space for the words:**`.
- `agents/plgn-designer.md`, finishing pass: `- **Place and camera:** 17. … 18. …`; check example `"answers": "1 yes · 2 yes · ... · 18 yes"`.
- `skills/image-prompting/SKILL.md`: a heading `## Think in the form, write in prose` and eight numbered questions.
- `_dev/scripts/validate.mjs`: section `// --- 18. 1.17.0: think in the form, write in prose`, one block with its own `need(p, needles)` helper (a copy of section 17's), ending in the line `  // 1.17.0: later tasks add their checks above this line`; every file read with `\r\n` turned to `\n`.
- Versions: `"version": "1.17.0"` in both manifests; CHANGELOG top heading `## 1.17.0 (2026-10-08)`.
- Unchanged: `executing`, `slides`, `order`, `generation_prompt`, `alt_text`, `asset_ids`, `qa_findings`, `check`, `attempt`, `closed`, `answers`, `failed_on`, `next_attempt_adds`, `hand_over`, the typography block's keys, every other order line's name and place.

**Review Focus**
1. Parsed keys and headings: nothing in Interfaces' "Unchanged" list moves; every existing `## ` heading in both agents stays word for word (the desk overlay appends to them); no file under `commands/` is touched.
2. The priority line is exact, unquoted, last, and listed as never quoted; it never becomes a part 8.
3. Checks 1-16 keep their numbers and words; 17 and 18 come after 16; the example ends `18 yes`.
4. No camera or lens brand name anywhere (a number like "85mm" is fine); Western digits; "points" never "credits"; lowercase "plgn".
5. Every pinned phrase sits on one line of its file ("keep in this order", "17. ", "18. ", the craft labels, the skill heading): validate matches raw text, so a line break inside a phrase fails.
6. Never backtick a name with a tool prefix that is not a tool (`image_…`, `check_…`, `post_…`, `list_…`): validate fails it as an unknown MCP tool.

### Task 1: The art director's order names the camera

**Files**
- Modify: `agents/plgn-art-director.md`, `_dev/scripts/validate.mjs`

**What changes**
Validate first (it then fails), then the agent. Job B answers in fifteen labelled lines. The order form gains the CAMERA line from Interfaces between LIGHT and COLOUR. A new paragraph after the COLOUR paragraph says how CAMERA is written: a real camera, its height ("table height, 40 cm"), its distance range to the product ("1 to 1.5 m"), the focal length as a number ("an 85mm look"), the depth in words ("the product sharp, the room soft"); numbers are fine, a camera or lens brand name never; it is the brand's usual set-up, so a campaign's later posts reuse it with the rest of the order.

**Anchors**
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
the picture's words or prompt; the designer does. Answer in the fourteen
labelled lines below, or one `CANNOT:` line, or one `QUESTION:` line. Nothing
```

with the same two lines, "fourteen" now "fifteen".
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
In COLOUR, the brand's colour is an accent on its own things; the dominant
colour is the real place's, unless the brand's look sets a coloured set on
purpose.
```

with the same paragraph, a blank line, and the CAMERA paragraph above, starting "In CAMERA,".
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), directly after the line `LIGHT: <direction, quality, temperature, sources in the scene>` add the CAMERA line from Interfaces.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `if (fails.length) {` add section 18, shaped:

```js
// --- 18. 1.17.0: think in the form, write in prose ------------------------
// The order names the camera; the designer writes the five blocks, ends on the
// priority line and checks place and camera; the skill keeps the eight questions.
{
  const need = (p, needles) => { /* section 17's helper, copied */ };
  // Task 1's art director checks (Tests below) go here.
  // 1.17.0: later tasks add their checks above this line
}
```

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-art-director.md must name "CAMERA:"`: fails before, no such line.
- `agents/plgn-art-director.md: the order's CAMERA: line sits between LIGHT: and COLOUR:`: the index of `\nLIGHT: ` is below that of `\nCAMERA: `, which is below that of `\nCOLOUR: `. Fails before, no CAMERA line.
- `agents/plgn-art-director.md: Job B answers in fifteen labelled lines`: fails while "the fourteen" is in the file.

**Commit**: `feat: the art director's order names the camera`

### Task 2: The designer's eight craft parts

**Files**
- Modify: `agents/plgn-designer.md`, `_dev/scripts/validate.mjs`

**What changes**
The craft-parts paragraph becomes a lead-in line ("The craft parts of the scene, in this order, each in one or two plain sentences:") and the eight bullets of Interfaces. **Camera**: height, distance to the product, focal length as a number, depth of field in words; numbers allowed, camera and lens brand names never; from the order's CAMERA line, else decision 4. **Framing and composition**: what the frame is of and does, how close, cropped to what; where the product sits on the grid (thirds, centred, golden) and its share of the frame ("about a third of the width"). **Where things stand**: every named object placed relative to the product (left, right, behind, in front, on, under), then one sentence of what must not move or double ("one pack, one cup; nothing else on the table"); in a carousel, what stays fixed from frame to frame. **Light**, **Styling**, **Grade**: today's words. **Materials and people**: each important object's surface in a word pair ("matte card", "brushed steel"), never "glossy" when the `never` list forbids shine; people by count, age range, clothing and which way they face, plus the one action (the one-action rule below), nothing else about them. **Space for the words**: where the empty space is, readable at phone size; with a typography block it is where the placement lines put the words and agrees with every one. A reused order also keeps its camera (decision 5); type alone keeps its sentence with "the framing" for "the shot".

**Anchors**
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
The craft parts of the scene, in this order: the shot (what the frame is of and what it does, how close, from
where, cropped to what); the lens feel (shallow or deep focus, wide and close or long and compressed, in plain
words, no camera or lens brand names); the light (one named set-up, "a single window on the left, early
morning"); the styling (the audience's real taste in a real place of the brand's market: a Cairo flat, not a
Scandinavian loft); the texture and finish (never "glossy" when the `never` list forbids shine); the grade (two
or three colours, one of them the brand's); the space (where the copy goes, empty enough to read at phone size).
```

with the lead-in line and the eight bullets above.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace the line `keeps its school, world, light, colour, signature, fixed, free, type notes and never lines; take HERO & HIERARCHY,` with the same line reading "world, light, camera, colour,", rewrapped if it runs long.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace the line `For type alone the shot is the type and its layout; for a built object the light and styling describe its set.` with the same line, "the framing" in place of "the shot".
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `  // 1.17.0: later tasks add their checks above this line` add the check under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-designer.md: the eight craft parts run camera, framing and composition, where things stand, light, styling, materials and people, grade, space for the words`: each bullet label from Interfaces is present and each sits after the one before. Fails before: no label exists.

**Commit**: `feat: the designer's craft parts start from a real camera and a spatial map`

### Task 3: The designer's priority line and cut order

**Files**
- Modify: `agents/plgn-designer.md`, `_dev/scripts/validate.mjs`

**What changes**
Part 7 ends with the priority line from Interfaces, word for word, without quotation marks, as the last sentence of the prompt (decisions 1, 2). The quotation-marks paragraph adds "the priority line" to what is never quoted. The budget rule: with a 1,000-character model, a one-frame prompt is cut in this order: style words, then materials, then people detail, then light detail; never the label, the words, the product or the spatial map; the priority line stays last (decision 10).

**Anchors**
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
7. **Rules:** the brand's never list and the order's never list, in the same terms as the picture, and a line
   that says to write only these texts.
```

with the same item plus: then, last of all, the priority line, word for word and unquoted.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
Quotation marks mean words to draw. Quote only a string meant to appear in the picture; the preamble, the
product's label and the spelling lines are never quoted.
```

with the same lines, "the preamble, the product's label, the spelling lines and the priority line are never quoted".
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
the quote takes at most 1,000 characters, a one-frame prompt is written to fit 1,000 characters: cut craft first,
never what keeps the picture physically true.
```

with the same opening up to "to fit 1,000 characters:" and the cut order above.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `  // 1.17.0: later tasks add their checks above this line` add the checks under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-designer.md must name "keep in this order"`: fails before, no priority line.
- `agents/plgn-designer.md: the 1,000-character cut order replaces "cut craft first"`: fails while "cut craft first" is in the file.

**Commit**: `feat: the designer ends every prompt on the priority line`

### Task 4: The finishing pass checks place and camera

**Files**
- Modify: `agents/plgn-designer.md`, `_dev/scripts/validate.mjs`

**What changes**
A new bullet after Type: `- **Place and camera:** 17. Every named object stands where the prompt put it: nothing moved, nothing doubled. 18. The camera matches: height, distance, focal feel.` The check example ends `18 yes`. Checks 1-16 are not touched (decision 7).

**Anchors**
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), directly after the line `  system and styling; a frame with no block shows no text but the product's own label, exactly as its photo shows it.` add the Place and camera bullet, wrapped like the bullets above it.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace `1 yes · 2 yes · ... · 16 yes` with the same string ending "18 yes".
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `  // 1.17.0: later tasks add their checks above this line` add the checks under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `agents/plgn-designer.md: the finishing pass must hold checks 17. and 18.`: the text from `## The finishing pass` to `## Finishing by school` holds "17. " and "18. ". Fails before.
- `agents/plgn-designer.md: the check example must end "18 yes"`: the file holds `· 18 yes"`. Fails before (it ends `16 yes`).

**Commit**: `feat: the designer's finishing pass checks place and camera`

### Task 5: The skills: the eight questions and the Bunduq example

**Files**
- Modify: `skills/image-prompting/SKILL.md`, `skills/creative-brief/SKILL.md`, `_dev/scripts/validate.mjs`

**What changes**
image-prompting, new section `## Think in the form, write in prose`: a professional picture brief covers a long form; it is the right checklist and the wrong shape for a prompt, because image models read plain sentences and headings, labels and brackets burn the budget (4,000 characters; some models take 1,000). `plgn-designer` answers eight questions before writing, then writes the answers as sentences: 1 what is the frame of, and what does it do; 2 where is the camera (height, distance, focal length as a number, what is sharp; no brand names); 3 where does each thing stand, and what must not move or double; 4 where does the product sit on the grid, and where do the words go (where the typographer's placement lines put them); 5 what is the light; 6 what is each surface; 7 who is in it and what one thing are they doing; 8 what gives first: the priority line, word for word, last. Then the 1,000-character cut order of Task 3. The seven-part list names the scene's parts and the priority line.
creative-brief: the Bunduq order gains `CAMERA: table height, 1 to 1.5 m from the tin, an 85mm look, the tin sharp and the window soft`. After step 4's paragraph, one lead-in line ("For that hero frame and that block, the designer's text reads:") and a `text` fence holding a prompt under 4,000 characters, in the seven parts: an invented Bunduq preamble (unquoted), the school and signature, the concept, the scene with all eight craft parts (the camera as the CAMERA line; the tin on the left third, about a third of the width; the cup on a saucer to the right of the tin and a little behind; one tin, one cup, nothing else on the counter; matte printed tin, glazed white cup, oiled walnut counter; no people and no hands; the empty top third and lower right where the placement lines put the words), the product from the first reference image, the typographer's lines with the two Arabic strings in quotes and an unquoted letter-by-letter line for each, the rules, and the priority line last.

**Anchors**
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), directly before the line `## When to make nothing` add the new section.
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace the line `4. the scene` with "4. the scene: camera, framing, where things stand, light, styling, materials and people, grade, space for the words".
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace the line `7. the rules` with "7. the rules, ending on the priority line".
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `LIGHT: soft window light from the left, warm, one source` add the CAMERA line above.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `doesn't hold up.` add a blank line, the lead-in line and the example.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), directly before the line `  // 1.17.0: later tasks add their checks above this line` add the checks under Tests.

**Tests** (`_dev/scripts/validate.mjs`)
- `skills/image-prompting/SKILL.md must name "## Think in the form, write in prose"`: fails before.
- `skills/creative-brief/SKILL.md must name "CAMERA:"` and `... "keep in this order"`: fail before (no CAMERA line, no example prompt).

**Commit**: `docs: image-prompting thinks in the form; the Bunduq example names the camera`

### Task 6: 1.17.0

**Files**
- Modify: `CHANGELOG.md`, `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`

**What changes**
CHANGELOG 1.17.0 (2026-10-08), in the 1.16.0 entry's plain style: pictures are described the way a photographer sets them up (the camera's height, distance and lens look in numbers, where each thing stands, where the product sits and where the words go, what each surface is, who is in it and what they do); every description ends with what to keep if the image model must drop something; the art director's order has a CAMERA line; the finishing check asks two more questions (everything where it was put, the camera matches); a short-limit model loses style words first, never the label, the words or the product; every answer the desk and the server already read keeps its exact keys and form. Version 1.17.0 in both manifests.

**Anchors**
- In `CHANGELOG.md`, directly after the line `# Changelog` add a blank line and the `## 1.17.0 (2026-10-08)` entry.
- In `.claude-plugin/plugin.json` (script path `docs/../.claude-plugin/plugin.json`), replace the line `"version": "1.16.0",` with the same line at 1.17.0.
- In `.claude-plugin/marketplace.json` (script path `docs/../.claude-plugin/marketplace.json`), replace the line `"version": "1.16.0",` with the same line at 1.17.0.

**Tests** (`_dev/scripts/validate.mjs`)
- `versions disagree: plugin.json <a>, marketplace.json <b>, CHANGELOG <c>` (section 17, already there): passes before (1.16.0 in all three); mutation-test it by bumping one file alone, then bump all three.

**Commit**: `chore: 1.17.0`

## Open

- `/plgn month`'s quick path writes its own one-paragraph image description (`commands/month.md`, "write the image description yourself"). It does not use the eight questions or the priority line. Changing it is a command change the spec did not ask for.
- The 1,000-character cut order names four things to cut and four never to cut. The camera, framing, styling, grade and space for the words are in neither list. The designer keeps them unless the prompt still does not fit; the owner may want to rank them.
- Spec 2.1 "says so": read as "writes its pick in the camera sentence" (decision 4). If the owner meant a note to the person, that needs a new key, which the spec forbids.
- The desk (spec 4) is a later run: pack 1.17.0 with `npm run skills`, re-read `resources/desk/agents/plgn-designer.md` for a line that restates the old craft order, rerun `tests/plugin-skills.test.ts`; it ships in 0.11.0 or 0.11.1.
- The lab round (spec 5.2) is the owner's: it spends points and runs only on his go.
