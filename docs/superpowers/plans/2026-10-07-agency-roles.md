# Agency roles, phase 1 (plugin): thin plan

Spec: `_dev/superpowers-docs/specs/2026-10-07-agency-roles.md` (git-ignored, read it from disk). The owner's words are in `_dev/superpowers-docs/specs/agency-roles-input/` (creative director, art director, designer; the product sheet is phase 2 and not read for this run).
Repo: plgn-claude, branch `feat/agency-roles`. Markdown, the two manifests and a new CHANGELOG only; `_dev/scripts/validate.mjs` is never edited. plgn and plgn-desk were read for this plan and are never edited.
Builders write the words from the owner's files; this plan fixes the shapes, what stays word for word, the phrases the tests bind and where each edit goes.

## Goal

The three picture agents become the owner's agency roles: the creative director owns the idea, the art director owns the direction (a written order), the designer owns the execution and the finish.
`/plgn images` runs them as idea, then order, then execution, with one order per post (one per campaign inside a run); the look a brand saves names its school.
Every answer today's desk and plgn server read keeps its exact keys and forms, so nothing that parses them changes. Version 1.14.0.

## Decisions

1. **Tests are phrase checks from Git Bash, plus validate and line counts.** From the repo root: `for p in "<phrase>" ...; do grep -qF -- "$p" <file> || echo "MISSING: $p"; done` for phrases that must be there (new ones were checked absent on 2026-10-07, so this prints `MISSING:` lines before the edit and nothing after), and the same loop with `&& echo "FOUND: $p"` for phrases that must never be there. Then `node _dev/scripts/validate.mjs` must print `OK: plugin structure valid.` (agent count stays 10). Phrases are ASCII; Arabic is never a test phrase.
2. **Paths in anchors are written in full, then again as a "script path" under `docs/..`.** Same file: the anchor script only reads paths under a folder it knows, and `docs/..` is the repo root. Builders use the first path. Build in order.
3. **The creative director keeps today's JSON and its six brief keys exactly.** The owner's block maps onto it: IDEA is `concept`; FROM THE BRAND and WHY are `concept_why` (two or three sentences: plgn caps it at 2,000 characters); BENEFIT is `benefit_label`; MEANINGS is `meanings`; CANDIDATES and CHOSEN are `candidates` (the literal one first, one per lens, the winner the only entry with no `rejected_because`); PRODUCT ROLE is the role word at the front of each `art_direction`. The rest becomes five extra keys (`brand_read`, `hierarchy`, `image_words`, `for_the_art_director`, `missing`), written **only** when the prompt holds the line `An art director takes this idea next.` Reason: the desk's `checkDirector`, `checkMonthIdeas` and `checkPictureOne` (plgn-desk `src/lib/crew/helper-answers.ts`) build the idea from the six keys and ignore any other; `brief_create` (plgn `src/domains/briefs/tools.ts`) takes only the six; and the desk's overlays say the designer writes a picture's words. The desk's prompts never carry the line, so desk answers, and their points, stay as today.
4. **Kept from today, not from the owner's numbers:** score 0 to 10 with the literal idea 0 to 3 (zod `min(0).max(10)` in plgn's brief tools); the five named lenses (the content creator and creative-brief name the same five); the role words hero, detail, result, in use, none (the desk's `PRODUCT_ROLES`; the spec's "trace" is today's "result"); the literal idea's fixed territory and `rejected_because`.
5. **"The person chooses" is a question.** The director answers `{"question": …}` with two directions when the brand has no formula yet, meaning its read holds no saved look, no approved execution and no example post. The designer asks for two type systems only when the order's TYPE NOTES says "designer to propose". The art director answers `QUESTION:` with two schools when it finds none. Reason: the owner's "never pick silently"; the desk already reads `question` from the director and the designer.
6. **Art director Job A keeps today's text and its `## What to return` heading word for word.** The school is one line after the ten fields, `school: …`, not an eleventh field. Reason: the desk's art-director overlay replaces "What to return" by name and says "the ten fields"; `checkLook` (plgn-desk `src/lib/crew/crew-answers.ts`) ignores unknown keys; brandkit and visual-identity read the ten fields.
7. **Job B answers in plain labelled lines, not JSON:** the owner's fourteen lines, or one `CANNOT:` line, or one `QUESTION:` line. Reason: no code reads it in phase 1 (the desk never asks for Job B; phase 3 picks the desk's form); the command hands it to the designer word for word.
8. **The order lives only in the command's run** (no brief field takes it). One order per post, for every frame. Inside a campaign it is written once, for the campaign's first post in the run, and reused for that campaign's later posts while what carries the frame stays the same; its HERO & HIERARCHY, PRODUCT and DELIVERY lines are the post's own, and for a later post the designer takes them from that post's idea. Reason: owner's decision (cached per campaign); the desk's cache is phase 3.
9. **The order step goes in `commands/images.md` section 5 and in creative-brief; post, campaign and month are not changed.** None of the three starts the director or the designer: post hands pictures to `/plgn images`, campaign's step 8 is the content creator's big idea, month's quick path writes its own description. `/plgn images` is the only command that starts both.
10. **The designer keeps today's JSON forms**: `slides` (`order`, `generation_prompt`, `alt_text`, `asset_ids`), `qa_findings` grouped per frame, never both. Added: an optional top-level `executing` (the owner's ORDER line, only when the prompt carries an order); a finding about the order starts `order: `; a `question` form (Decision 5); a `check` form for the finishing pass. Reason: the desk's `checkDesigner` reads `slides`, `qa_findings` and `question` and ignores other keys; `brief_finalize` takes `order`, `generation_prompt`, `alt_text`.
11. **The finishing pass is written into the designer, but no command runs it in phase 1**, and the designer's `tools` stay `Read`. Reason: the spec gives the commands only the order step and puts "the finishing pass after each picture" in the desk's phase 3; an `image_view` tool in the front matter would reach the desk's designer through its agent-tools mapping.
12. **The prompt is the owner's seven parts** (preamble word for word, school and finishing signature, concept, scene, product, typography and grid, rules). The scene is written with today's craft parts (shot, lens feel, light, styling, texture and finish, grade, space) and today's accent rule. Plain sentences, no labels or numbering. The 90 to 160 word count goes; the whole text stays under 4,000 characters (`brief_finalize` refuses over 5,000). On the brief path the command no longer puts the preamble in front. Reason: no code prepends it on either path (the desk sends `generation_prompt` as it is), so the designer is the one place.
13. **Quotes mean words to draw.** The preamble is copied without its quotation marks; the letter-by-letter spelling line quotes nothing and says it is not to be drawn; only words meant for the picture are in quotes. Reason: the desk's `wordProblems` (plgn-desk `src/lib/crew/picture-words.ts`) sends back any quoted text not listed in `words`.
14. **A product's printed words are "its own label, exactly as in the product photo; copy exactly, never redraw or restyle"**, not retyped. Reason: the desk's designer and one-picture overlays say exactly this; the owner's "every printed word verbatim" waits for phase 3's code-written letter lines (follow-ups).
15. **Dropped or added to the owner's text:** "Use the workspace's best text-rendering model" is dropped (agents never name or choose a model; plgn uses the workspace's model). "You cannot see files" is not given to the art director (it opens pictures with `image_view` and `Read`). The designer's finishing-by-school table gains a Documentary / editorial photo row from the art director's own "closed means".
16. **Desk text rules for the three agents**: the designer's body still starts "You are the last read before money is spent."; `## What you return` (director, designer), `## What to return` and `## When you cannot` stay word for word; none of the three contains `asked_words`, "In the plgn desk" or "Every frame passes". Reason: plgn-desk `tests/desk-rules.test.ts` reads the plugin's copies of these files after `npm run skills`.
17. **Front matter:** `name`, `tools`, `color` untouched; `description` rewritten in one line with no ": " inside (it would break YAML). No `#` title in an agent body, like every other agent.
18. **CHANGELOG:** the repo has never had one (versions were one-line chore commits). Task 7 creates `CHANGELOG.md` with the 1.14.0 entry only and bumps both manifests. The overlay lines for phase 3 go to the git-ignored follow-ups file.
19. **Line caps:** each agent at most 259 (spec: under 260); creative-brief 230; image-prompting 190; visual-identity 260; images 305; content-creator 186.
20. **Commits:** one plain line per task, PLGN identity (`git -c user.name=PLGN -c user.email=waslahapp993@gmail.com commit -m "..."`), no Co-Authored-By or Claude-Session lines; never push. Stage only the task's own files: never the untracked `.codex/` folder, never anything under `_dev/superpowers-docs/specs/agency-roles-input/` (never edited either). Bunduq Coffee is the only brand in examples.

## Interfaces

- Director answer, always (agents/plgn-creative-director.md, unchanged): `{"benefit_label", "meanings": [..], "candidates": [{"metaphor", "territory": "<lens> · <territory>", "score": 0-10, "rejected_because"?}], "concept", "concept_why", "slides": [{"order", "role": hook|proof|how|ask, "art_direction": "<hero|detail|result|in use|none> · <what the frame is of>"}]}`.
- Director extra keys, only after `An art director takes this idea next.`: `"brand_read": {"sells", "talks", "formula", "only_this_brand"}`, `"hierarchy": [first, second, third]`, `"image_words": [{"order", "headline", "support"}]` (`[]` when no words), `"for_the_art_director": "<what the viewer must feel; what the direction must protect>"`, `"missing": "none" | "<data needed and not given>"`.
- Director other forms: `{"question": "<two directions, one line each on why>"}`; the one-line cannot (unchanged).
- Art director Job A (agents/plgn-art-director.md): the ten fields as today, then `school: <one school | several approved worlds, each named | per campaign>`.
- Art director Job B: fourteen lines in this order, nothing before or after: `SCHOOL:` `FIELD:` `REFERENCES:` `WORLD:` `HERO & HIERARCHY:` `PRODUCT:` `LIGHT:` `COLOUR:` `FINISHING SIGNATURE:` `FIXED:` `FREE:` `TYPE NOTES:` `DELIVERY:` `NEVER:` (contents as the owner wrote); or `CANNOT: <reason> — CLOSEST: <closest version that works>`; or `QUESTION: <two schools, one line each>`.
- Schools (same file, owner's table): Manipulation / compositing; Retail offer; Product beauty / still life; Beauty editorial; Lifestyle; Documentary / editorial photo; Cinematic dark-key; 3D / CGI; Flat / illustration; Type-led; Collage.
- Designer answer, exactly one form (agents/plgn-designer.md): `{"executing"?: "Executing <school> for <field>, finishing signature <…>, delivery <platform, ratio>", "slides": [{"order", "generation_prompt", "alt_text": {"<locale>": ".."}, "asset_ids": [at most 4]}]}` | `{"qa_findings": [{"order", "findings": [".." or "order: .."]}]}` | `{"question": ".."}` | `{"check": {"order", "attempt": 1-3, "closed": true, "answers": "1 yes · … · 15 yes"}}` or `{"check": {"order", "attempt", "closed": false, "failed_on": "<line>: <what is wrong>", "next_attempt_adds": "..", "hand_over"?: "<reasons, after attempt 3>"}}`.
- `generation_prompt` writing order (same file): preamble (no quotation marks) → school and finishing signature → the concept in one line → the scene → the product (input image by role, parts in physical order with colours, its own label as in the photo) → typography and grid (every string in quotes, style, weight, colour, treatment, position) → rules (never lists, "write only these texts", spelling lines); under 4,000 characters in all.
- Command (commands/images.md): the director's prompt ends with `An art director takes this idea next.`; `brief_create` gets only `benefit_label`, `meanings`, `candidates`, `concept`, `concept_why`, `slides` plus the ids it already takes; the art director gets the director's whole answer.
- Look (skills/visual-identity/SKILL.md): `brand_identity` `metadata.school`, a string beside the nine keys, also named in `content`.
- Versions: `"version": "1.14.0"` in .claude-plugin/plugin.json and .claude-plugin/marketplace.json; CHANGELOG.md with one `## 1.14.0` entry.

## Review Focus

1. **Today's desk and server still parse every answer.** Director: one JSON object, the six keys, exactly one candidate without `rejected_because` and it scores highest (desk `checkDirector`), `territory` and `metaphor` at most 200 characters, `concept_why` at most 2,000, `role` at most 100 (plgn LIMITS); the five extra keys appear only after the line. Designer: `slides` or `qa_findings` or `question`, never two, `asset_ids` at most four, quotes only around words to draw; `generation_prompt` under 4,000. Art director Job A in the desk is still replaced whole by the overlay's JSON. Answer it from the parsers named in Decisions 3, 6, 10, 13, not by assumption.
2. **Overlay deference, not contradiction.** The director writes `image_words` only after the line (the desk's director and month-ideas overlays say the designer writes words); the designer writes a label as "its own label, exactly as in the product photo"; headings the overlays name stay. Each overlay line phase 3 must move or drop is in the follow-ups (Task 7).
3. **Desk text guards** (Decision 16): designer body's first sentence, the three absent phrases, the headings.
4. **The owner's substance is all there:** the four brand questions, formula versus two directions, the seven idea rules, occasions, Never lists; Job B's school order, fit check, product source order, references, push-back, the eleven schools; typography, grid, the seven-part prompt, the Arabic confusable groups, the fifteen finishing lines, by school and by field. Nothing names a model; "points", never "credits".
5. **The order flow in `/plgn images`:** written once per campaign in the run and reused only while what carries the frame is the same; `brief_create` gets six keys; a `CANNOT:` is a check like any objection; an `order: ` finding goes to the art director once and is not a check; every question reaches the person in plain words; validate needles in images and creative-brief survive.
6. **Dry read at the core gate (after Task 3):** the reviewer writes by hand, from the three agent files, the director's answer, the order and the designer's answer for a Bunduq Coffee hero post, and walks each through the desk's `checkDirector`, `checkDesigner` and `wordProblems` and plgn's `brief_create` and `brief_finalize` schemas, once with the line (plugin) and once without it (desk).

### Task 1: The creative director, from the owner's file

Files:
- Modify: `agents/plgn-creative-director.md` (cap 259 lines, 214 now)
- Test: phrase check and json check (Decision 1) on `agents/plgn-creative-director.md`; validate, read only

What changes: The body is rewritten from the owner's file, in his order and words where they fit, merged with today's machine-read parts. It owns the idea; the art director owns the direction, the designer the execution; it cannot read the plugin's files. Sections: what it gets (today's list); "Read the brand before any idea" (the four questions, one line each; an existing brand stays inside its formula, a break needs a written reason; a brand with no formula yet, Decision 5, gets two directions as a `question`); the brand's own things come first (today's asset rules, kept); what makes an idea right (the owner's bullets: brand first, ownable, one message, the product has a role, claims only from the brand's data with a `proof` entry behind a result, documented use, cultural accuracy); `## Occasions` (the brand's own world, no war or military imagery, weapons or soldiers, the palette's rules, no sales call to action unless the rules ask). Then today's steps in the owner's brief order: benefit, meanings, candidates (the literal idea first with its fixed text, one per lens, scored as today, Already done scores 0), the one (the concept's idea when the post carries one), hierarchy, product role (the role word on each direction, today's rules), words in the image (only after the line, checked against the words the brand never uses). Carousels, people, "When the post carries a concept", "When the brief comes back for another round" (plus the owner's sentence: a different scored idea, never the same idea with more elements), "When you cannot" and a closing Never list (owner's five). "What you return": the six keys always, the extra keys only after the line, the `question` form, the example a complete valid answer; the sentence naming `brief_create` says the command passes the six keys to it.

Anchors:
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
description: Decides what a picture is about — the meaning behind a benefit, the ideas that could carry it, and the direction for each frame. Use when a plgn command needs the thinking behind an image worked out before any image gets made. Does not write the final image text and does not choose what carries the frame.
```

with one line: the owner's first description sentence (senior creative director who owns the idea behind every visual, reads the brand first), then today's "Use when" and "Does not write" sentences; no ": " inside.
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), find `You decide what the picture is *about*. You do not write the final image` and rewrite that line and everything after it, to the end of the file, as the new body.

Tests:
- T1.1 new phrases, MISSING today: "Read the brand before any idea" "## Occasions" "military imagery" "two directions" "An art director takes this idea next" '"brand_read":' '"hierarchy":' '"image_words":' '"for_the_art_director":' '"missing":' '"question":'.
- T1.2 kept phrases, present before and after: "## What you return" "## When you cannot" "## When the post carries a concept" "## When the brief comes back for another round" "the literal picture of the caption; adds nothing the reader just read" "hero, detail, result or in use" '"concept":' '"concept_why":' '"rejected_because":' '"art_direction":'.
- T1.3 never there: "asked_words" "In the plgn desk" "Every frame passes".
- T1.4 json: a small node script parses the first fenced json block and checks the desk's director rules (six keys; at least two candidates, each with metaphor, territory, a whole score 0 to 10; exactly one with no `rejected_because`, holding the top score; slides numbered 1 to n with order, role, art_direction). Fails today: both example candidates carry `rejected_because`.
- T1.5 `wc -l` at most 259; validate prints OK.

Commit: `feat(creative-director): the owner's agency creative director, same brief keys`

### Task 2: The art director, job B and the schools

Files:
- Modify: `agents/plgn-art-director.md` (cap 259 lines, 166 now)
- Test: phrase check and label-order check (Decision 1) on `agents/plgn-art-director.md`; validate, read only

What changes: A new opening from the owner (owns the direction: the school, the world, the light, the hierarchy, what never changes; two jobs; Job A when the prompt hands pictures to read or sort, Job B when it hands a creative director's idea to direct), keeping today's warning that a guess becomes a wrong picture. Job A is today's sections word for word, plus the owner's "name the school" as the `school` line (Decision 6). Job B, appended at the end under `## Job B`: find the school in the owner's order (the post's concept, the campaign's reference, `school` in the brand's look, its own posts, else `QUESTION:`); check the school fits what the brand sells and what carries the frame as plgn resolved it (a real photo, a built object, a scene, type alone); the product source order (approved product sheet view, official render, real photo; none means PRODUCT says "needs a product photo" and the picture shows no product; a photo of another model or code is a `CANNOT:`); references (the brand's own posts first with take and leave, outside ones for staging only, never an asset marked NOT for AI pictures, characters only from their saved asset); write the order (Interfaces), with the campaign rule of Decision 8; push back with `CANNOT:` and the closest version; `## The schools library` as the owner's table; a Never list (owner's five). Job B names no write tool.

Anchors:
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
description: Works out how a brand's pictures look by reading images it has already published — colours, composition, light, medium, subject, finish — and writes a direction later images can be generated from. Use when a plgn command needs a brand's visual identity captured from references. Reports clusters when the references disagree, and never invents a look.
```

with one line: the owner's first sentence, the two jobs (a brand's look with its school; one post's order for the designer), and today's "Reports clusters … never invents a look"; no ": " inside.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
You read a brand's pictures and write down how they work.

Someone will generate new images from what you return, so a guess in your
output becomes a wrong picture in every post that follows. Report what is
actually in the references.
```

with the new opening described above, ending on the guess sentence.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
Ten fields, each with the references it came from. Nothing before them, nothing
after.
```

with: ten fields, each with the references it came from, then the `school` line; nothing before them, nothing after.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), directly after the line `and one line on why.` add the `school` bullet (Interfaces; the library is in Job B).
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), directly after the line `- **Never save anything.** You return findings; the command owns every write.` add Job B, the schools library and the Never list.

Tests:
- T2.1 new phrases, MISSING today: "## Job B" "SCHOOL:" "FIELD:" "REFERENCES:" "WORLD:" "HERO & HIERARCHY:" "PRODUCT:" "LIGHT:" "COLOUR:" "FINISHING SIGNATURE:" "FIXED:" "FREE:" "TYPE NOTES:" "DELIVERY:" "NEVER:" "CANNOT:" "CLOSEST:" "QUESTION:" "## The schools library" "Manipulation / compositing" "Documentary / editorial photo" "Type-led" "needs a product photo".
- T2.2 kept: "## What to return" "## The sort job (when the prompt asks you to sort)" "Never average them." '**`promptPreamble`**' '**`canonicalReference`**' "[flagged:" "[removed:".
- T2.3 label order: `grep -n` of the fourteen labels inside the order block gives rising line numbers (none exist today).
- T2.4 `wc -l` at most 259; validate prints OK (it pins `image_view` in the front matter and body).

Commit: `feat(art-director): job B writes the order; the schools library; the look names its school`

### Task 3: The designer and finisher, from the owner's file

Files:
- Modify: `agents/plgn-designer.md` (cap 259 lines, 186 now)
- Test: phrase check, first-line check and json check (Decision 1) on `agents/plgn-designer.md`; validate, read only

What changes: The body is rewritten from the owner's file, merged with today's machine-read parts. It starts with "You are the last read before money is spent." then the owner's role line. Sections: what it gets (today's list, plus the art director's order when given); `## Read the order` (restate it as `executing`; a conflict with the brand's data or the product's truth is a finding that starts `order: `; never obey or change it silently); check first, write second (today's, kept: never list, asset rules, invented logo, mascot or face; never rewrite the idea); `## Typography` (the owner's Arabic and Latin schools, pairing, Arabic rules, the brand's type system or the two-proposal `question` of Decision 5, voice to type); `## Grid` (owner's); `## Writing the prompt` (Decisions 12, 13, 14; what carries the frame as decided; the role word never copied in; inputs named by role, `asset_ids` at most four, the product source and the chosen reference first); "The picture must be physically true" and the person's-words paragraph (today's, kept); `## Arabic spelling` (the owner's protocol and confusable groups, a letter-by-letter line for any word holding one, checked against the words the brand never uses); "The alt text" (today's, kept); `## The finishing pass` (when the prompt hands a finished picture: the fifteen lines at full size and thumbnail, any no fails, regenerate from the brief with the failed line restated, never an edit pass over the whole image, stop after three and hand over); `## Finishing by school` (owner's table plus the documentary row) and `## Finishing by field` (owner's eight); "What you return" (Interfaces, one form only); a Never list (owner's four). The Bunduq paragraph may be cut to fit the cap.

Anchors:
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
description: Checks a picture's direction against what the brand never does, then writes the final image text for each frame. Use when a plgn command has a concept and a direction from plgn-creative-director and needs it checked before any image gets made. Returns objections instead of a picture when a frame breaks a rule.
```

with one line: the owner's first sentence (senior designer and finisher who executes the art director's order), what it checks and writes, today's "Use when" sentence with the order added, and "Returns objections instead of a picture when a frame breaks a rule"; no ": " inside.
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), find `You are the last read before money is spent. You check the picture's` and rewrite that line and everything after it, to the end of the file, as the new body; its first sentence stays as it is.

Tests:
- T3.1 new phrases, MISSING today: "## Read the order" "Executing" '"executing":' "order: " "## Typography" "## Grid" "## Writing the prompt" "## Arabic spelling" "letter by letter" "## The finishing pass" "the failed line restated" "three failed attempts" "## Finishing by school" "Documentary / editorial photo" "## Finishing by field" '"check":' '"next_attempt_adds":' '"question":' "4,000 characters".
- T3.2 kept: "## What you return" "## The picture must be physically true" "## The alt text" "one action a hand can do" "The brand colour is an accent" "Never both" '"generation_prompt":' '"qa_findings":' '"alt_text":' '"asset_ids":'.
- T3.3 never there: "asked_words" "In the plgn desk" "Every frame passes".
- T3.4 first line: the first non-empty line after the front matter starts with "You are the last read before money is spent." (passes today; guards the desk test).
- T3.5 json: every fenced json block parses; no block holds two of `slides`, `qa_findings`, `question`, `check`; the slides example has order, generation_prompt, an alt_text object and at most four asset_ids; one block holds `check`. Fails today: there is no `check` block yet.
- T3.6 `wc -l` at most 259; validate prints OK.

Commit: `feat(designer): the owner's designer and finisher, same JSON forms`

### Task 4: creative-brief and image-prompting follow the chain

Files:
- Modify: `skills/creative-brief/SKILL.md` (cap 230, 190 now), `skills/image-prompting/SKILL.md` (cap 190, 162 now)
- Test: phrase check (Decision 1) on both files; validate, read only

What changes: creative-brief gets the order between step 3 and step 4 (the four steps keep their numbers, so "`brief_finalize` saves step 4" stays true) with a fenced Bunduq Coffee example of the fourteen-line order, and step 4 reads the order. image-prompting shows the chain idea, order, execution and the seven-part prompt order as its example, and the preamble rule of Decision 12.

Anchors:
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `the server decides it from what the brand sells. See below.` add a paragraph starting "**Between 3 and 4 · the order.**": `plgn-art-director` turns the idea into the order (school, world, light, hierarchy, product source, what never changes); one per post, for every frame; inside a campaign, once per run; not saved in the brief; then the fenced example.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
**4 · check → final text.** `plgn-designer` checks the direction against the
brand and the brief, then writes the final image text and the alt text per
frame — or raises objections if the direction doesn't hold up.
```

with the same step reading: the designer checks the direction and the order against the brand and the brief, then writes the final image text in the prompt order (see **image-prompting**) and the alt text per frame, or raises objections.
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace

```
- Put its **promptPreamble** in front of the description, before the subject.
```

with: on `/plgn month`'s quick path, put it in front; on the brief path the designer's text already starts with it, so never add it a second time.
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace

```
On the brief path, `plgn-creative-director` writes the literal picture first and
rejects it, then scores one idea from each of five lenses, and `plgn-designer`
writes the final text in seven parts with the brand colour as an accent.
```

with the chain: the director as today, `plgn-art-director` writes the order, `plgn-designer` writes the final text in the seven-part order (a short list: preamble, school and the finishing signature, concept, scene, product, typography and grid, rules), the brand colour still an accent.

Tests:
- T4.1 MISSING today: creative-brief "Between 3 and 4" "plgn-art-director" "not saved in the brief" "SCHOOL:" "FINISHING SIGNATURE:"; image-prompting "plgn-art-director" "a second time" "school and the finishing signature".
- T4.2 kept, checked by validate: creative-brief's five section-11 needles, "check: frame", "alt text per frame"; image-prompting's "picture_need", "plgn-designer", "campaign_id: <the post's campaign". Validate prints OK; each file under its cap.

Commit: `feat(skills): idea, order, execution in creative-brief and image-prompting`

### Task 5: The look names its school

Files:
- Modify: `skills/visual-identity/SKILL.md` (cap 260, 243 now), `commands/visuals.md`
- Test: phrase check (Decision 1) on both files; validate, read only

What changes: visual-identity says the art director names the school after the ten fields and shows where it is saved; `/plgn visuals` saves it with the nine keys.

Anchors:
- In `skills/visual-identity/SKILL.md` (script path `docs/../skills/visual-identity/SKILL.md`), directly after the line `generated image feel like a different company.` add a blank line and a paragraph starting "**The school.**": after the ten fields the art director names the school (one, several approved worlds, or per campaign) from its library; saved as `metadata.school` and named in `content`; Job B looks there for a post's school.
- In `skills/visual-identity/SKILL.md` (script path `docs/../skills/visual-identity/SKILL.md`), replace

```
    promptPreamble: "..."
```

with that line ending in a comma, then `    school: "product beauty / still life"`.
- In `skills/visual-identity/SKILL.md` (script path `docs/../skills/visual-identity/SKILL.md`), replace

```
**`metadata` is for the machine.** Nine of the ten fields live here as keys.
```

with the same sentence plus ", with `school` beside them."
- In `commands/visuals.md` (script path `docs/../commands/visuals.md`), replace

```
`upload_image_base64`. Save it as **`brand_identity`** — one entry, nine fields
in its metadata, the canonical reference attached as `assets[0]`, and
```

with the same two lines reading "one entry, nine fields and the school in its metadata".

Tests:
- T5.1 MISSING today: visual-identity "**The school.**" "metadata.school"; visuals "nine fields and the school".
- T5.2 kept, checked by validate: visual-identity's `image_view`, WebFetch, `generate_image_from_image`, `brand_identity`. Validate prints OK; visual-identity under its cap.

Commit: `feat(visual-identity): the look names its school`

### Task 6: The order step in /plgn images; the content creator's boundary line

Files:
- Modify: `commands/images.md` (cap 305, 272 now), `agents/plgn-content-creator.md` (cap 186, 182 now)
- Test: phrase check (Decision 1) on both files; validate, read only

What changes: In section 5 the director's prompt ends with the agreed line; `brief_create` gets the six keys; a new order step sits at the head of item 4 (the art director also gets the **Assets** section of step 1's read, so its PRODUCT and REFERENCES lines can name the brand's saved things and never one marked NOT for AI pictures); objections from the order are routed; questions reach the person. The content creator gets one paragraph saying the creative director turns its concept's visual idea into the picture's idea and it never writes the picture's composition (framing, angle, light, layout).

Anchors:
- In `commands/images.md` (script path `docs/../commands/images.md`), directly after the line `prompt — the agent cannot see this file.` add: end the prompt with the line `An art director takes this idea next.`; a `question` answer (two directions) is put to the person in plain words, the director starts again with their answer, and later posts of this brand in the run get the same answer; a `missing` other than none is named in section 8.
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
3. Call `brief_create` with what it returned, plus `post_id` for the post
```

with the same line naming the six keys it passes (`benefit_label`, `meanings`, `candidates`, `concept`, `concept_why`, `slides`) and keeping the rest of the answer for the art director.
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
4. Read `context_get(role: "designer", campaign_id: <the post's campaign, if
   it has one>)` for the brand's identity and picture rules. Send
   `plgn-designer` the concept, the frames, that block, the campaign's
```

with: read `context_get(role: "art_director", …)` once per campaign (the read section 6 uses: make it here and reuse it) and send `plgn-art-director` that block, the director's whole answer, the post's `Concept:` line, what carries each frame as step 3 resolved it, and the platform; it answers with the order, `CANNOT:` or `QUESTION:` (two schools, asked like the director's); the order is reused per Decision 8. Then the designer read as today, and the designer gets the order word for word first, then the concept, the frames, that block, the campaign's (the next line continues unchanged).
- In `commands/images.md` (script path `docs/../commands/images.md`), directly after the line `carry on with the rest of the run. Never attempt a fourth.` add: a `CANNOT:` is an objection against every frame, handled as this item says, and counts as a check; a designer finding that starts `order: ` goes to `plgn-art-director` once for a corrected order, then back to the designer, with no `brief_update` and no check; with both kinds, this item first and the order's findings go to the art director with the new idea; a designer `question` (two type systems) is put to the person like the director's.
- In `agents/plgn-content-creator.md` (script path `docs/../agents/plgn-content-creator.md`), directly after the line `them, anything goes. A concept that crosses them goes back with the reason.` add a blank line and the one paragraph described above.

Tests:
- T6.1 MISSING today: images "An art director takes this idea next" "plgn-art-director" "CANNOT:" "QUESTION:" '`order: `' "benefit_label"; content creator "the picture's composition" (the agent file speaks to "you").
- T6.2 kept: images' needles through validate (`once per campaign`, `permanent look`, `check: frame`, `## 7. Attach`, `## 8. Say what happened` and the rest); `grep '^## ' agents/plgn-content-creator.md | tail -1` prints `## Where the brand ends`. No "yes / no" in images (validate). Each file under its cap.

Commit: `feat(images): the art director's order between the idea and the designer; composition is not the content creator's`

### Task 7: Version 1.14.0, CHANGELOG, follow-ups, validate

Files:
- Modify: `.claude-plugin/plugin.json`, `.claude-plugin/marketplace.json`
- Create: `CHANGELOG.md`, `_dev/superpowers-docs/specs/2026-10-07-agency-roles-follow-ups.md` (git-ignored, not committed)
- Test: phrase check (Decision 1); validate

What changes: Both manifests say 1.14.0. CHANGELOG.md opens with `# Changelog` and one `## 1.14.0 (2026-10-07)` entry of five to eight plain lines (the three roles, the order step, the school, the content creator's line). The follow-ups file lists, for phase 3, each overlay or desk line to move or drop: the desk director overlay's "The words in a picture are not yours" section and month-ideas' "Never write the words that will appear in it" (once the desk runs the art director and passes `image_words`); the designer and one-picture overlays' "its own label … do not write its words" (with code-written letter lines); the art-director overlay's look JSON and "The ten fields" (add `school`, and to `checkLook` and the desk's look save); the one-picture call, which has no order step; `CARRIED.generated` in the desk's handoffs ("the product made") against "never let the model invent the product"; longer prompts now that the designer writes the preamble (plgn caps one model's prompt at 1,000 characters); the director's new `question` for a brand with no formula; no command runs the finishing pass yet; and, found while reading, the desk requires the pick to score highest while a person-chosen concept may score lower.

Anchors:
- In `.claude-plugin/plugin.json` (script path `docs/../.claude-plugin/plugin.json`), replace

```
  "version": "1.13.0",
```

with the same line reading 1.14.0.
- In `.claude-plugin/marketplace.json` (script path `docs/../.claude-plugin/marketplace.json`), replace

```
      "version": "1.13.0",
```

with the same line reading 1.14.0.

Tests:
- T7.1 MISSING today: '"version": "1.14.0"' in both manifests; "## 1.14.0" in CHANGELOG.md (the file does not exist yet).
- T7.2 validate prints `OK: plugin structure valid.`; `git diff --stat main...HEAD` lists only the files of Tasks 1 to 7 (plus this plan file, if it was committed; the follow-ups file is git-ignored and never listed).

Commit: `chore: 1.14.0 -- agency roles: the idea, the order, the finish`

### Task 8: Live proof on Bunduq Coffee (needs the owner's go)

Files:
- none (a run, no edits)

What changes: Nothing is built. With the plugin loaded from this branch and his go on the points, run `/plgn images` on one Bunduq Coffee post with no picture, one frame, the cost said first. Check and write down in the follow-ups file: the director's answer held the five extra keys and `brief_create` replied OK; the order had the fourteen lines in order (or a question the person answered); the designer's answer was one JSON object with `executing` and a prompt that starts with the preamble, quotes only the picture's words and is under 4,000 characters; `brief_finalize` replied OK; the picture arrived. Anything that failed goes to the follow-ups, not into a fix in this run.

Tests:
- T8.1 the five checks above, read off the run.

Commit: none.
