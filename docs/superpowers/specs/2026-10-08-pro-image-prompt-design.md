# Professional image prompts: think in the form, write in prose, 2026-10-08

Owner, 2026-10-08 00:20: "I need the image prompting level to be something professional so it does a better job."
He brought a 22-section visual-generation specification (project type, subject, spatial configuration, grid,
camera, framing, camera and subject movement, environment, architecture, lighting, materials, colour, typography,
people, object placement, realism, style, mood, negatives, priority, quality control). Agreed: it is the right
checklist and the wrong prompt shape. Image models read plain sentences; headers and brackets burn the budget;
the designer's prompt is capped at 4,000 characters and some models take 1,000. So: the designer thinks in the
form and writes prose. Video (sections 07, 08) and architecture (10) are parked for reels and real-estate brands.

## 1. What the designer already covers

Preamble, school and finishing signature, concept, shot, lens feel, light, styling, texture, grade, space for the
copy, the product's physical truth, the words through the typographer's block, the never lists, a 16-check
finishing pass. About 60% of the form.

## 2. What is added

Five blocks, each one or two plain sentences inside the scene, in this fixed order of the craft parts:

1. **Camera as a real camera**: height ("eye level", "table height, 40 cm"), distance to the product ("1.5 m"),
   focal length as a number ("85mm look"), depth of field in words ("the pack sharp, the room soft"). Numbers are
   allowed; camera and lens brand names stay banned. Comes from the order's new `CAMERA:` line when it has one,
   else the designer picks one that fits the school and says so.
2. **Spatial map**: every named object placed relative to the product (left, right, behind, in front, on, under),
   plus one sentence of what must not move or double ("one pack, one cup; nothing else on the table"). In a
   carousel, what stays fixed from frame to frame.
3. **Composition position**: where the product sits on the grid (thirds, centred, golden), the share of the
   frame it takes ("about a third of the width"), and where the empty space for the words is, which must agree
   with the typographer's `placement` lines when a block exists.
4. **Materials and people**: for each important object, its surface in one word pair ("matte card", "brushed
   steel"); for people, count, age range, clothing, orientation to camera, and the one action (the existing
   one-action rule), nothing else about them.
5. **Priority line**, the last sentence of every prompt: "If anything must give, keep in this order: the label
   and the words, the product, where things stand, the light, the style."

The budget rule becomes explicit: when the quote's model takes 1,000 characters, cut in this order: style words,
materials, people detail, light detail; never the label, the words, the product or the spatial map.

## 3. Who writes what

- **Art director** (`agents/plgn-art-director.md`): one new order line `CAMERA: <the brand's usual height,
  distance range, focal length look, depth>` placed after `LIGHT:`. The desk does not run the art director yet,
  so the designer's fallback in 2.1 is the normal desk path.
- **Creative director**: unchanged; frame directions already name the shot's intent.
- **Typographer**: unchanged; its `placement` lines are the source of truth for the empty space in 2.3.
- **Designer** (`agents/plgn-designer.md`): "Writing the prompt" craft parts reordered to camera, framing and
  composition, spatial map, light, styling, materials, grade, space for words; the five blocks above; the budget
  rule; the priority line. The finishing pass gains **17.** every named object stands where the prompt put it,
  nothing moved, nothing doubled, and **18.** the camera matches: height, distance, focal feel. The check example
  ends "18 yes". Checks 1-16 keep their numbers.
- **Skill** `skills/image-prompting/SKILL.md`: a new section "Think in the form, write in prose": the eight
  questions the designer answers before writing (what is the frame of; where is the camera; where does each thing
  stand; where does the product sit on the grid and where do the words go; what is the light; what is each
  surface; who is in it and what one thing are they doing; what gives first). No new headings in commands.
- **Example** in `skills/creative-brief/SKILL.md`: the Bunduq order gains a `CAMERA:` line and the example prompt
  shows the five blocks and the priority line.
- **Validate** `_dev/scripts/validate.mjs`: pins `CAMERA:` in the art director, "17." and "18." in the designer's
  finishing pass, "keep in this order" in the designer, the skill's section heading.
- **Version**: plugin 1.17.0, CHANGELOG, version everywhere the repo keeps it.

Parsed fields do not change: `generation_prompt`, `asset_ids`, `alt_text`, `qa_findings`, `check`, the
typography block. The order's other lines keep their names and positions.

## 4. Desk

No desk code change. The desk packs 1.17.0 with `npm run skills`; `resources/desk/agents/plgn-designer.md` is
read again for any line that restates the old craft order and fixed if one exists; `tests/plugin-skills.test.ts`
reruns. It ships inside 0.11.0 when the typographer wave has not merged yet, else as 0.11.1.

## 5. Proof

1. `node _dev/scripts/validate.mjs` prints OK.
2. A lab round in `plgn-picture-helpers-lab`: the same Bunduq Coffee frame with the 1.16.0 designer and the
   1.17.0 designer, same model, Jev scores side by side, and the owner picks by eye. This spends points and
   runs only on his go.

## 6. Out of scope

Video camera and subject movement; the architecture section; mood words as a separate block (the school and the
concept carry mood); a new agent; any change to the server or the desk's crew code.

**Rules for every builder**: field names that code parses never change; command headings never change (the desk
replaces sections by heading); "points" never "credits"; lowercase "plgn"; Western digits; commits with the PLGN
identity, one line, no Co-Authored-By and no Claude-Session line.
