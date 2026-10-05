# Creative quality: thin plan

Spec: `_dev/superpowers-docs/specs/2026-10-06-creative-quality.md` (git-ignored, read it from disk).
Repo: plgn-claude, branch `feat/creative-quality`. Markdown only; `_dev/scripts/validate.mjs` is never edited.
Builders write the words; this plan fixes the rules, the exact phrases the test binds, and where each edit goes.

## Goal

The picture crew stops making safe, literal, single-colour pictures: the literal idea loses by rule, every brief scores six ideas from five lenses, and every frame names the product's role.
The designer writes the final text as a craft paragraph: seven parts in a fixed writing order, the brand colour on at most two things, 90 to 160 words.
The two skills and the art director that feed the crew say the same thing. No JSON key, tool argument, server or desk code changes.

## Decisions

1. **Tests are phrase checks run from Git Bash; `_dev/scripts/validate.mjs` is never edited** (project rule, and the spec expects no change to it). Each task lists the exact phrases its text must hold and runs, from the repo root:
   `for p in "<phrase 1>" "<phrase 2>" ...; do grep -qF -- "$p" <file> || echo "MISSING: $p"; done`
   Before the edit it prints one `MISSING:` line per phrase; after it, nothing. Then `node _dev/scripts/validate.mjs`, unchanged, must still print `OK: plugin structure valid.` (that proves the section 7, 8, 11, 13 and 15 needles survived). Phrases are ASCII only, because the Windows shell can mangle the middle dot; the exact `·` prefix is a review item (Review Focus 3).
2. **The lens rides in `territory`, the product's role rides in `art_direction`, both as a prefix: `<word> · <text>`** (lowercase word, space, middle dot U+00B7, space). No new keys (spec D6). The server stores both as free text, and its reuse check compares `concept` and the direction text only (plgn `src/domains/briefs/checks.ts`), so a prefix changes nothing there.
3. **The literal candidate is fixed text.** `territory` is exactly `literal · the caption, drawn`, `score` is 0 to 3, `rejected_because` is exactly `the literal picture of the caption; adds nothing the reader just read`. It is never picked, in any round. Fixed text makes the record and the test easy to read.
4. **The score stays 0 to 10.** The server refuses anything else (zod `min(0).max(10)` in plgn `src/domains/briefs/tools.ts`). Three questions at 0 to 3 each, plus 1 for the brand's own asset used well. Under 6 is not picked.
5. **Role words: `hero`, `detail`, `result`, `in use`, and `none`.** `none` is for a frame with no product in it (a service brand, type alone), so every direction starts with a role word and the per-frame check is the same for every brand.
6. **90 to 160 words counts the designer's whole paragraph, the exclusions included.** It does not count the preamble the command puts in front.
7. **The subject lives in part 1, the shot.** The seven parts do not name "subject", so the shot says what the frame is of and what it is doing, then how close, from where, cropped to what.
8. **Every existing heading stays word for word.** New rules go under existing headings or under new ones. The desk reads these files by name, never by heading, but keeping headings costs nothing.
9. **No client brand names in plugin text.** The plugin is public. The 2026-10-05 case is told without the brand's name, as the designer already does. A worked example uses Bunduq Coffee (the fictional demo brand) or no brand.
10. **D5 is one sentence per place.** In the `promptPreamble` row of visual-identity, "appended to" becomes "put in front of", because image-prompting and the art director already say "in front"; that is the only wording fixed outside the spec.
11. **`commands/month.md` is not touched.** Its quick path still says "one step sideways"; the spec does not list that file (see Open points in the return).
12. **Length caps (1.5 times today's lines):** director 196, designer 204, creative-brief 177, image-prompting 234, visual-identity 364, art-director 235.
13. **Commits:** one plain line per task, no Co-Authored-By or Claude-Session lines (owner rule for the plgn repos).
14. **Paths in anchors** are written in full, then again as a "script path" under `docs/..` in brackets. That is the same file: the anchor script only reads paths under a folder it knows, and `docs/..` is the repo root. Builders use the first path. Build tasks in order.

## Interfaces

- `candidates[].territory` (agents/plgn-creative-director.md): `"<lens> · <territory>"`, lens one of `literal`, `tension`, `scale`, `displacement`, `metaphor`, `document`.
- Literal candidate (agents/plgn-creative-director.md): first in the list; `territory: "literal · the caption, drawn"`, `score` 0 to 3, `rejected_because: "the literal picture of the caption; adds nothing the reader just read"`.
- `candidates` count (agents/plgn-creative-director.md): six at least: the literal one, then one from each of the five lenses.
- `score` (agents/plgn-creative-director.md): three questions 0 to 3 each, plus 1 for the brand's own asset used well; 0 to 10; under 6 is not picked.
- `slides[].art_direction` (agents/plgn-creative-director.md): `"<role> · <what the frame is of>"`, role one of `hero`, `detail`, `result`, `in use`, `none`.
- `slides[].role` (agents/plgn-creative-director.md): unchanged: `hook`, `proof`, `how`, `ask`.
- `concept_why` for a carousel (agents/plgn-creative-director.md): names one of six shapes: problem → turn → proof; one object, three distances; morning → noon → night; the wrong way / the right way; count-down (3, 2, 1 reasons); a day in one life.
- `slides[].generation_prompt` (agents/plgn-designer.md): one paragraph, 90 to 160 words, written in the order shot, lens feel, light, styling, texture and finish, grade, space, then exclusions, with no labels and without the role prefix.
- Phrase lists in Tasks 1 to 5 (Decision 1). `_dev/scripts/validate.mjs` is read, never edited. No exported names change anywhere.

## Review Focus

1. The literal idea is candidate 1, scored 0 to 3, carries the exact `rejected_because`, and is never picked, not even when the brief comes back for another round. "Six at least" includes it.
2. JSON keys and the section 8 contract needles survive (`candidates`, `"rejected_because":`, `art_direction`, `"concept":`, `"generation_prompt":`, `"qa_findings":`, `"alt_text":`). The winning idea still has no `rejected_because`.
3. Prefix format is exact (lowercase word, space, `·`, space). The designer never copies the role prefix into `generation_prompt`.
4. Designer: the seven parts are a writing order with no labels; the brand colour is on at most two named things; "anchored in" appears only as banned wording; the "physically true" section and "When the person asked for something" paragraph stay, apart from the extended hands bullet.
5. Agent files name no write tool outside a "never call" sentence (validate section 8); no client brand names; each file is under its length cap.
6. Dry read at the core gate (after Task 2): the reviewer writes, by hand from the two agent files, the brief for the 2026-10-05 hair-care post ("تسريح الصبح من غير دموع لبنتك") and checks: the literal idea loses, six candidates from five lenses, the product's role per frame, and the designer's paragraph has the seven parts, the accent rule and 90 to 160 words.

### Task 1: The director's creative ladder (D1)

Files:
- Modify: `agents/plgn-creative-director.md` (cap 196 lines, 131 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: Step 2 now starts with the literal idea (Decision 3), then at least one idea from each of five lenses, as a short bold list: **Tension**, **Scale**, **Displacement**, **Metaphor**, **Document**, each with the spec's one-line meaning and an example from the audience's world. The lens goes at the front of `territory` ("tension · the 7:10 bus stop"). Scoring becomes the three questions from spec D1.3 plus the asset point; under 6 is not picked; if none reaches 6, the "When you cannot" rule applies. State the bar once: global campaign craft, local truth (a real place of the brand's market, people who look like its audience). Step 3: every direction starts with the product's role (Decision 5); a single frame for a product brand is hero or result unless the post is about the act of using it; "in hand, in use" is the last choice, not the first, and an in-use frame names one action a hand can do. Carousels pick one of the six story shapes and name it in `concept_why`; `role` keeps its four words. People: a real face from the audience (age, skin, hair, dress, setting, from the references and `brand_identity`), no stock smile, no model look unless the brand's direction asks for it; a saved person or character comes first.

Anchors:
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
Turn the meanings into three to five ideas. Each idea is a metaphor plus the
territory it lives in — a concrete thing the picture could show that stands
for the benefit without stating it. "A nice photo of the product" is not an
idea; it names no metaphor and no territory.

Score every idea 0–10. **Every idea you do not pick carries the reason you
did not.** That reason is the point of writing any of this down — it is what
stops the same idea being offered to this brand again next month.
```

with the literal rule, the five lenses, "six at least" and the territory prefix, then the bar and the scoring; keep the bold sentence about every idea you do not pick, and the sentence after it, word for word.
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace

```
Write one direction per frame, in words a person could actually shoot or
build from. A single picture is one frame. A carousel is the same idea
carried across several, and each frame gets a job: hook, proof, how, ask.
```

with the first two sentences unchanged, then the product's role, the six carousel shapes and the people rule (new `###` sub-heads are fine).
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), directly after the line `  "candidates": [`, add the literal entry as the first candidate, laid out like the entry below it: metaphor `long, strong hair, shown off`, territory `literal · the caption, drawn`, score 2, and the fixed `rejected_because`.
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace the line `      "territory": "climbing gear",` with the same line reading `metaphor · climbing gear`.
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), replace the line `    { "order": 1, "role": "hook", "art_direction": "what this frame is of" }` with the same line whose direction reads `hero · what this frame is of`.
Exact phrases the test binds: `the caption, drawn`, `adds nothing the reader just read`, `**Tension**`, `**Scale**`, `**Displacement**`, `**Metaphor**`, `**Document**`, `one from each lens`, `under 6 is not picked`, `global campaign craft, local truth`, `hero, detail, result or in use`, `last choice, not the first`, `one object, three distances`, `stock smile`.

Tests: the Decision 1 loop over those 14 phrases on `agents/plgn-creative-director.md`. Run it first: it prints 14 `MISSING:` lines (none is there today, checked 2026-10-06). Write the text, run again: nothing. Then `node _dev/scripts/validate.mjs` prints `OK: plugin structure valid.` (the section 8 contract needles still pass).

Commit: `feat(director): the literal idea loses, five lenses, the product's role per frame`

### Task 2: The designer's craft paragraph (D2)

Files:
- Modify: `agents/plgn-designer.md` (cap 204 lines, 136 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: "What a good final text contains" now gives the seven parts in writing order, still one paragraph (shot, with the subject per Decision 7; lens feel, with no camera or lens brand names; light as one named set-up; styling in the audience's real taste and a real place of the brand's market, a Cairo flat and not a Scandinavian loft; texture and finish, never "glossy" when the `never` list forbids shine; grade, two or three colours with one of them the brand's; space for copy that reads at phone size), then the exclusions. It is a writing order, not a label list: no "Shot:" prefixes. Craft, not length: 90 to 160 words (Decision 6); a sentence that only sounds nice is cut. The brand colour is an accent: at most two things in the frame carry the brand's palette, named ("the tube and the hairband"); everything else is the real colour of a real place. The command puts the preamble in front, so the text never restates the palette as a fill, and "palette anchored in…" is banned wording. Where the brand's own visual direction says otherwise, the direction wins. The role word at the start of a direction is the director's call: write the frame for it, never copy it into the text, and give `in use` the one-action rule. Add one worked example paragraph (Bunduq Coffee, a hero frame) that follows every rule above. Physical truth gains: hands with five fingers in a natural grip, text on a pack only as its reference photo shows it, no invented product variants.

Exact phrases the test binds: `lens feel`, `texture and finish`, `a writing order, not a label list`, `90 to 160 words`, `only sounds nice`, `At most two things in the frame carry`, `anchored in`, `five fingers`, `no invented product variants`.

Anchors:
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
The subject, the composition, the light, the medium, the palette, and what
must not appear. One paragraph per frame — no lists, no camera brand names.
```

with the seven parts, the craft rule, the accent rule, the role-word rule and the worked example (new `##` sub-heads are fine).
- In `agents/plgn-designer.md` (script path `docs/../agents/plgn-designer.md`), replace

```
- Hands hold things the way people hold them; a comb carries no product
  unless the action put it there; nothing appears twice.
```

with the same bullet extended by the three new rules (five fingers, pack text as the reference shows it, no invented product variants).
Tests: the Decision 1 loop over the 9 phrases on `agents/plgn-designer.md`. Before the edit it prints 9 `MISSING:` lines; after, nothing. `node _dev/scripts/validate.mjs` still prints OK; section 8's `"generation_prompt":`, `"qa_findings":` and `"alt_text":` must still pass. The JSON placeholder stays as it is, so `90 to 160 words` can only come from the prose rule.

Commit: `feat(designer): seven-part final text, brand colour as an accent, 90 to 160 words`

### Task 3: creative-brief: a real photo is not a pose (D3)

Files:
- Modify: `skills/creative-brief/SKILL.md` (cap 177 lines, 118 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: the idea becomes a lens, a metaphor and a territory; one more sentence says the literal picture of the caption is written first and always loses, and the others come one from each of five lenses, with the lens written at the front of the territory. "A real photo" gains two sentences: the real pack, from its photo, is in the picture as hero, detail, result or in use, the director's choice for each frame; it does not mean a hand holding the pack. Carousels gain one sentence that points at the director's six story shapes. Every existing needle sentence stays word for word (`brief_create`, "`brief_finalize` saves step 4", "does not attempt a fourth", "more than 10", "before the first call", "check: frame", "alt text per frame").

Exact phrases the test binds: `a lens, a metaphor and a territory`, `does not mean a hand holding the pack`, `six story shapes`.

Anchors:
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
An idea is a metaphor with a territory — a concrete thing the picture could
actually show, that stands for the benefit without stating it. It carries a
score, and every idea that was rejected carries the reason it lost, not just
its name.
```

with the same paragraph starting "An idea is a lens, a metaphor and a territory —", plus the sentence on the literal idea and the five lenses.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace the line `- **A real photo** — the brand has a product with a photo of it.` with the same bullet followed by the two sentences above.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `different procedure, it is the same one with more frames.`, add one sentence: `plgn-creative-director` picks the order of the frames from six story shapes and names the shape in `concept_why`; the jobs keep their four names.
Tests: the Decision 1 loop over the 3 phrases on `skills/creative-brief/SKILL.md`. Before the edit it prints 3 `MISSING:` lines; after, nothing. `node _dev/scripts/validate.mjs` still prints OK: section 11 and the section 15 `check: frame` line must still pass.

Commit: `feat(creative-brief): an idea is a lens, a metaphor and a territory; a real photo is not a hand`

### Task 4: image-prompting: the sideways rule becomes the ladder (D4)

Files:
- Modify: `skills/image-prompting/SKILL.md` (cap 234 lines, 156 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: the "Aim one step sideways" paragraph becomes a pointer: on the brief path, `plgn-creative-director` writes the literal picture first and rejects it, then scores one idea from each of five lenses, and `plgn-designer` writes the final text in seven parts with the brand colour as an accent; **creative-brief** owns the steps. Keep the empty-chairs sentence as the example. The remake bullet gains one sentence: a picture that is physically wrong (a leak, a floating object, six fingers) is a failed picture and may be remade; a dull one is not. Every other section stays as it is, including the needles `picture_need`, `plgn-designer` and `campaign_id: <the post's campaign`.

Exact phrases the test binds: `five lenses`, `seven parts`, `physically wrong`; and `Aim one step sideways` must be gone.

Anchors:
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace

```
Aim one step sideways: the mood of the argument, or what it leads to rather than
what it is about. Empty chairs after a meeting says more about wasted meetings
than a clock does.
```

with the pointer paragraph, ending on the empty-chairs sentence.
- In `skills/image-prompting/SKILL.md` (script path `docs/../skills/image-prompting/SKILL.md`), replace

```
- Never remake an image just because the first one was dull; that is a second
  payment for a small gain. Remake only when one genuinely failed.
```

with the same bullet plus the physically-wrong sentence.
Tests: the Decision 1 loop over the 3 phrases on `skills/image-prompting/SKILL.md`, plus `grep -qF "Aim one step sideways" skills/image-prompting/SKILL.md && echo "STILL THERE: sideways"`. Before the edit it prints 3 `MISSING:` lines and `STILL THERE: sideways`; after, nothing. `node _dev/scripts/validate.mjs` still prints OK (section 15's `picture_need`, `plgn-designer`, `campaign_id: <the post's campaign` needles).

Commit: `feat(image-prompting): the sideways rule points at the five lenses; a physically wrong picture may be remade`

### Task 5: The palette is an accent, not a fill (D5)

Files:
- Modify: `skills/visual-identity/SKILL.md` (cap 364 lines, 243 now)
- Modify: `agents/plgn-art-director.md` (cap 235 lines, 157 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: one sentence in each place. In the palette row, the proportions are of the brand's own things (the pack, the type, the set), not of the whole scene. In the `promptPreamble` row, the preamble names the palette as an accent, never as what the picture is "anchored in"; "appended to" becomes "put in front of" (Decision 10). In the art director's `promptPreamble` bullet, the same rule in one sentence, which also says the proportions in `palette` describe the brand's own things, not the whole scene. The section 7 and section 13 needles for both files stay.

Exact phrases the test binds: `not of the whole scene` and `as an accent` (visual-identity), `as an accent` (art director).

Anchors:
- In `skills/visual-identity/SKILL.md` (script path `docs/../skills/visual-identity/SKILL.md`), replace the line `| **palette** | The colours, as hex values, with rough proportions and how backgrounds are treated |` with the same row plus the proportions sentence in its cell.
- In `skills/visual-identity/SKILL.md` (script path `docs/../skills/visual-identity/SKILL.md`), replace the line `| **promptPreamble** | A block appended to every later image description, plus what to exclude |` with the row reading "put in front of" plus the accent sentence.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
- **`promptPreamble`** — one paragraph to put in front of every later image
  description, plus a short list of things to exclude.
```

with the same bullet plus the one accent sentence.
Tests: the Decision 1 loop over `not of the whole scene` and `as an accent` on `skills/visual-identity/SKILL.md`, and over `as an accent` on `agents/plgn-art-director.md`. Before the edit it prints 3 `MISSING:` lines; after, nothing. Also `grep -qF "appended to every later" skills/visual-identity/SKILL.md && echo "STILL THERE: appended"` prints nothing after. `node _dev/scripts/validate.mjs` still prints OK (section 7 and 13 needles).

Commit: `feat(visual-identity): the palette is an accent on the brand's own things, never a fill`

### Task 6: One live picture for the post that failed (needs the owner's go: it spends points)

Files: none. Nothing is committed.

What changes: nothing in the repo. With his go, and with this branch's plugin loaded (a local plugin folder, or pushed and updated; his choice), run `/plgn images` for the one 2026-10-05 hair-care post. Quote the points first (`image_quote`) and wait for his yes. Then read the record back with `/plgn why`.

Tests: the owner's eye, against the bar in the spec. The record must show the literal idea rejected with the fixed reason, six candidates with five lens prefixes, a role word on each frame, a final text of 90 to 160 words in the seven-part order, and at most two brand-coloured things. The picture must stand beside a top regional agency's work. Report the points spent.

Commit: none.
