# The typographer: a fifth creative role, 2026-10-07

Owner, 2026-10-07 evening: "add a new agent in the plugin and the desk; it will do the work of typo and styling and
creative concepts and placement". Decisions taken with him, in order: it works BEFORE the picture is made (it writes
into the picture text the designer sends, never on a finished picture); it runs ONLY when the frame carries words;
it styles the given words and never rewrites them (a line too long gets a `fit` note with a proposed cut, applied
only on a yes); its name is `plgn-typographer` («مصمم الخطوط»).

## 1. The job

When a frame carries words (a headline, a line, a price, a label slot), the typographer decides four things and
nothing else:

1. **Type**: the typefaces or closest match, weights, headline-to-support ratio, numeral style, Arabic and Latin
   pairing.
2. **Styling**: colour from the brand palette, treatment (plain, outline, plate, shadow, 3D), case, size steps.
3. **Creative concept of the text**: one idea for how the words live in the picture (a plate, a painted sign, a
   sticker, type as object), tied to the creative director's idea and the school the art director named.
4. **Placement**: where each text element sits on the grid, alignment, safe zones per platform, right-to-left
   start, distance from the product, the face, the hands and the label.

**What moves.** The designer's "Typography" and "Grid" sections move to the typographer, word for word where they
still fit. The designer keeps physical truth, the letter-by-letter Arabic protocol, the finishing pass, and writes the
picture text taking the typographer's block as given.

**Where it runs.** Plugin: in `images`, `post` and `month`, after the art director's order and before the designer,
only when the frame has words. Desk: a new stage in the picture job between the creative director and the designer,
same condition (the desk does not run the art director yet; the brand's type system comes from the look that
`context_get(role: "art_director")` carries, or TYPE NOTES "designer to propose" when there is none). A frame with no
words skips it: nothing spent.

**Inputs**: the order (with the brand's TYPE NOTES), the frame's words exactly as the copywriter or content creator
wrote them, the brand palette and look, the platform and format. **Output**: the block below.

## 2. The block it returns

New keys; no existing parsed key changes (brief_create candidates/frames, the designer's `generation_prompt`,
`qa_findings`, `alt_text`, the desk's crew-answers.ts and handoffs.ts fields all stay as they are).

```json
{
  "typography": {
    "system": "<typefaces or closest match, weights, headline-to-support ratio, numerals>",
    "styling": "<colour from the palette, treatment, case, size steps>",
    "concept": "<one line: how the words live in the picture>",
    "placement": [
      { "text": "<the words, unchanged>", "where": "<grid position, alignment, safe zone>", "near": "<what it keeps away from>" }
    ],
    "fit": null
  }
}
```

`fit` is `null` or `{ "text": "<the long line>", "why": "<one line>", "shorter": "<a proposed cut>" }`. The designer
pastes `system`, `styling`, `concept` and every `placement` line into its prompt as given. `fit` is shown to the
person (in a month, to the copywriter's round) as a question; the words change only on a yes.

A carousel gets ONE `system` and ONE `styling` for all frames and a `placement` per frame, so the slides read as one
set; the block then carries `"frames": [ { "frame": 1, "placement": [...] }, ... ]` instead of a top-level
`placement`.

## 3. Rules it keeps

- Words unchanged, letter for letter. It never writes new words and never drops one.
- The brand's saved type system wins. Only when TYPE NOTES says "designer to propose" does it propose two systems
  with one line of reasoning each and ask (the `question` form the other agents use); this question moves from the
  designer to the typographer. It never picks silently.
- The Arabic rules move with it: never colour one word inside a connected line (strengthen the whole line); kashida
  only as a deliberate choice, never as filler; diacritics only where the meaning needs them; line spacing more open
  than Latin, no letter-spacing; right alignment and right-to-left reading order; numerals in the brand's style; text
  never over a face, a hand in action, or the product's label.
- Pairing: match weight and visual size across scripts; never stretch Arabic with kashida to match a Latin line.
- Voice to type stays reasoning, not rules (loud: heavy display, outlines, 3D; soft premium: clean geometric sans,
  space; dry numeric: black sans, mono numbers; price-first retail: heavy display on a fixed plate system).
- Grid: column grid for the format (six on 4:5), modular grid for offers with fixed slots, baseline grid for text
  lines; safe zones per platform; right-to-left mirroring; a brand grid keeps the same positions post after post;
  hierarchy exactly as the creative director set it.
- The desk shows it on the job card as «مصمم الخطوط» / "typographer" with its own points line; thinking at "high",
  no ceiling (owner, 2026-10-07).

## 4. The build

**Plugin (plgn-claude, 1.16.0), first:**
- New `agents/plgn-typographer.md` (frontmatter like the other creative agents; tools: Read; the job, the block, the
  rules, the Arabic rules and the two-systems question moved from the designer).
- `agents/plgn-designer.md`: "Typography" and "Grid" replaced by one section "The typography block" (take it as
  given, never restyle; when the prompt carries no block the frame has no words, write none); the letter-by-letter
  protocol, the finishing pass, physical truth and the alt text stay. The finishing pass gains one check: every
  placement line was honoured.
- `commands/images.md`, `commands/post.md`, `commands/month.md`: a step "4b. When the frame carries words, send
  `plgn-typographer` the order, the words, the palette and the platform, and hand its block to `plgn-designer` with
  the order". Headings that the desk replaces by name never change (the desk overlays replace sections by heading).
- `skills/creative-brief/SKILL.md`: the example order shows the block; the index of roles names the fifth role.
- `_dev/scripts/validate.mjs`: roster line (11 agents), the block's keys pinned (`"typography":`, `"placement":`,
  `"fit":`), the agent's tools pinned to Read.
- `CHANGELOG.md` 1.16.0, version bump everywhere the repo keeps it.
- Reference docs that list the roles (`reference/_conventions.md`, README) name the typographer.

**Desk (plgn-desk, 0.11.0), after the plugin is on main:**
- `resources/desk/agents/plgn-typographer.md` overlay (desk words: no terminal, the desk hands the block to the
  designer by code), `HELPER_THINKING["plgn-typographer"] = "high"`, `TYPOGRAPHER` constant in `crew/lines.ts`, the
  Arabic agent name, the card line, `tests/plugin-skills.test.ts` roster count.
- Picture job: a `type` stage between the creative director and the designer, run only when the frame's words
  (image_words / the concept's words) are non-empty; `crew-answers.ts` gets `readTypography` (new fields only);
  `handoffs.ts` pastes the block into the designer's prompt after the order; `fit` goes through the existing
  question path (`s.person`) and changes the words only on a yes.
- Tests: a frame with words calls the typographer once and the designer's prompt holds the block; a frame without
  words never calls it; a carousel gets one system and a placement per frame; `fit` asks and changes nothing on
  "no"; the points line shows the typographer; typecheck, lint, whole suite.

## 5. Two picture switches in the desk chat (owner, 2026-10-07, desk only)

Next to the picture model picker in the chat (the control that chooses the provider; `imageModel` in
`src/app/chat/page.tsx`), two small toggles, both remembered per brand through the kept picks (`kept.ts`, per
account) and sent with every request like the model is:

- **Logo** on / off (default on). On: the brand's logo asset goes into the picture as a reference image, where the
  brand allows AI use of it (today's rule); the designer's prompt names it. Off: no logo in the picture at all, the
  logo asset is not sent, and the prompt says "no brand mark".
- **Text** on / off (default on). Off: no headline and no added words anywhere; the typographer stage is skipped
  (nothing spent); the designer's prompt says "no added text; the product's own label exactly as in the source
  photo". The product's printed label is never touched either way (the physical-truth rule already forbids changing
  it), so "text off" can never corrupt the label. The creative director still gets the words for the idea; only the
  picture carries none.

The picture job saves both flags in its state before anything paid starts, so a resumed job keeps the choice. The
job card's first line names the choice when either is off («بلا شعار», «بلا نص» / "no logo", "no text"). No server
change: the flags live in the desk's kept picks and the job state.

**Out of scope**: placing words on a finished picture (a design layer), rewriting words, agency-roles phase 3 (the
art director in the desk, the finishing pass in the desk, product sheets in the desk).

**Rules for every builder**: field names that code parses never change; "points" never "credits"; lowercase
"plgn"; Western digits; Arabic text only with the editor tool; commits with the PLGN identity, one line, no
Co-Authored-By and no Claude-Session line.
