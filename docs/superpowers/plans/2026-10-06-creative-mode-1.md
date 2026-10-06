# Creative mode, phase 1 (plugin): thin plan

Spec: `_dev/superpowers-docs/specs/2026-10-06-creative-mode.md` (git-ignored, read it from disk). Phase 1 only: D1, D3 (plugin half), D4 (the closing block), D5 (knowledge-entry route), the three commands, creative-brief. D2, D6, D7, D8 are not in this run.
Repo: plgn-claude, branch `feat/creative-mode`. Markdown only, plus the roster lines in `_dev/scripts/validate.mjs` that a new agent forces.
Builders write the words; this plan fixes the rules, the shapes, the phrases the tests bind, and where each edit goes.

## Goal

A new agent, `plgn-content-creator`, owns the idea before any copy or picture: it talks ideas through in prose, each one built on a reference or an asset the person can see, and when the person picks it writes a campaign's big idea or one concept per post.
References become the centre: brandkit asks for the person's own references first, the art director reads each one and saves what to take and what to leave on the entry.
`/plgn campaign`, `/plgn month` and `/plgn post` call the content creator before the copywriter and the designer; creative-brief owns how it is briefed and makes the concept the brief's source.

## Decisions

1. **Tests are phrase checks from Git Bash, plus `node _dev/scripts/validate.mjs`.** Each task lists exact ASCII phrases and runs, from the repo root: `for p in "<phrase>" ...; do grep -qF -- "$p" <file> || echo "MISSING: $p"; done`. Before the edit it prints one `MISSING:` line per phrase (all checked absent on 2026-10-06); after, nothing. Then validate must print `OK: plugin structure valid.` Arabic words are never in a test phrase (the Windows shell mangles them).
2. **`_dev/scripts/validate.mjs` changes in Task 1 only, and only the two roster lines a tenth agent forces** (`EXPECTED_AGENT_COUNT = 9` and the `AGENTS` list; without them validate fails on the new file). The run's rules say never edit validate, so this is the smallest edit that lets the agent exist; nothing else in it changes (no `AGENT_CONTRACTS` pin). Flagged for the owner. No other task edits it.
3. **The big idea is a `reference` entry, not a new type.** The server refuses any type outside its list (`unknown knowledge type`, plgn `src/domains/knowledge/service.ts` assertKnownType and `tools.ts` line 68), and `creative_platform` is not on it. A `reference` is the Creative layer, can carry `campaign_id`, needs only `metadata.intent`, keeps unknown metadata keys (looseObject) and needs no pictures. So: title exactly `Creative platform`, `metadata.kind: "creative_platform"`, one per campaign, updated in place. When the server gains the `platform` field (phase 3) this entry is what moves.
4. **The person hears "big idea", never "platform".** In reply-style "platform" already means LinkedIn or Instagram.
5. **A reference entry also carries its picture links in `metadata.pictures`.** No read prints an entry's pictures (plgn `knowledge/tools.ts` formatKnowledgeEntry and `context/assemble.ts` entryBlock print content and metadata only), so without the links the content creator could never open a reference with `image_view`. Assets already print `main picture:`.
6. **`intent` stays as the group's one line** (the server requires it); `take` and `leave` sit beside it. `take` names which of six aspects are worth taking (idea type, format, composition, light, type style, how the product appears); `leave` says what not to copy. Both strings. `source` is `given` (the person handed it over) or `found`.
7. **One recipe, in creative-brief.** How the content creator is briefed (prompt parts, the reference index, the closing boundary block), how ideas are talked through, how a big idea is saved, and where a concept is kept all live in a new section of `skills/creative-brief/SKILL.md`. The three commands say when and point at it. Reason: _conventions says a rule lives in one skill, and three commands would drift.
8. **The reference index comes from `knowledge_get(type: "reference", limit: 20)`**, keeping entries with no `[campaign: …]` tag or this campaign's tag and leaving out the big idea itself, numbered 1 to n. Reason: the mood board stores entry ids, and `context_get` prints none. The `context_get(role: "creative_director", …)` block still goes in verbatim as "The brand".
9. **Agent output:** the ideas job is prose only (no scores, no JSON, no count, no word limit). The platform job is prose ending in five labelled lines (Interfaces), no JSON. The concepts job (the person said "this one") may open with a few sentences and ends with exactly one fenced `json` block, nothing after it: the only JSON the agent ever writes, with the eight keys fixed by the run's rules (`format`, `hook`, `visual`, `reference`, `shape`, `cta`, `device`, `product_role`), defined once in the agent. Concepts come in the order of the `## Posts` lines, one each; the command matches them by position and runs the job once more if the count differs. The desk in phase 2 reads the same block (spec D2).
10. **The concept is kept on the post** in `notes`, one line starting `Concept:`, keyed by the brand's first language and written in it. Posts have no metadata, `notes` is printed by `post_get`, and `/plgn images` and the desk can read it later. The line cites by the reference's title or the asset's name, because a number only means something inside one run.
11. **The concept is the brief's source.** With a concept, the creative director still writes the literal idea and the five lens ideas, scored, as the record; the concept's visual idea is the pick even when another scores higher (the server does not require the top score to win), and `concept_why` says the person chose it. A concept that needs something outside the brand comes back as the one-line "cannot" with the reason; a later check round that drops it is named in the run's report. Never silently swapped. `commands/images.md` gets one clause so the concept reaches the director.
12. **Month's "Think first?" is one plan-table line, not a new question.** Validate bans `yes / no` in commands and only two question formats exist. Answering "think first" instead of yes runs the talk; inside a campaign it ends with the big idea saved after its own yes; outside one it guides this month only and nothing is saved; then the plan is shown again.
13. **`/plgn post` stays fast:** one concept call every time, no talk unless the person's words ask for ideas. Its `## 3.` to `## 7.` headings stay word for word (the desk replaces those sections by heading); the concept step is a `###` under `## 2. The idea`.
14. **The person's references:** asked for first in brandkit step 3; an account they name gets its own researcher like a competitor; their pictures are sorted as `your reference`, never skipped for "nothing of this brand in it", grouped apart from found ones, saved with `source: "given"`.
15. **Model:** the agent's frontmatter says `model: opus` (owner's pick: the strongest AI the plan allows). The desk's parser ignores the key; the desk's own model choice is phase 2.
16. **No "banned word" within 200 characters of `knowledge_add`** (validate section 7 fails the file). In creative-brief and campaign the boundary line is "Words it never uses", and campaign, month and post never name `knowledge_add` (they point at creative-brief).
17. **Every existing heading and validate needle stays word for word**, including brandkit step 3 never containing the word "save" (validate section 5) and its line "`plgn-art-director` reads the pictures, in two jobs" (section 14).
18. **Length caps (1.5 times today):** new agent 200; art-director 240; brandkit 466; brand-onboarding 403; campaign 225; month 693; post 222; creative-brief 190; creative-director 295; images 406.
19. **Commits:** one plain line per task, no Co-Authored-By or Claude-Session lines (owner rule for the plgn repos). Do not push.
20. **Paths in anchors** are written in full, then again as a "script path" under `docs/..`. Same file: the anchor script only reads paths under a folder it knows. Builders use the first path. Build in order.

## Interfaces

- Agent (agents/plgn-content-creator.md): frontmatter `name: plgn-content-creator`, a `description`, `tools:` as a YAML list (`- mcp__plugin_plgn_plgn__image_view`, `- Read`) like the other agents, `model: opus`, `color: orange`; at most 200 lines; last `##` heading is `## Where the brand ends`.
- Prompt the commands build (skills/creative-brief/SKILL.md), in this order: `Job: ideas` | `Job: platform` | `Job: concepts`; `## The brand` (the `context_get(role: "creative_director", campaign_id: …)` block verbatim); `## References` (the index); `## The campaign` (key message, constraints, and `Big idea: …` when saved); `## Posts` (concepts job only: one line per post, `<ref> · <topic> · <platform> · <the person's idea> · <format, when the plan fixed one>`); `## So far` (ideas shown and the person's words, in order); `## Where the brand ends` last.
- Reference index line: `<n>. <title> · take: <metadata.take, else intent> · leave: <metadata.leave, else "not read yet"> · pictures: <metadata.pictures, else "none"> · <given|found>`; stand-ins from research are numbered `S1`, `S2`… and never saved.
- Boundary block lines: `Colours: <palette>, as accents on the brand's own things; everything else is the real world.` / `Packs: <each product offering>, exactly as its photo shows it.` / `Assets: <each saved asset the AI may use, by name>; no other logo, mascot or named person. Unnamed people from the audience are welcome.` / `Words it never uses: <the record's list>.` / `This campaign: <its constraints, or "none">.`
- Concepts JSON (agent, the only JSON it writes): `{ "concepts": [ { "format", "hook", "visual", "reference", "shape", "cta", "device", "product_role" } ] }`, one object per `## Posts` line in the same order; `format` one of single, carousel, reel cover, quote card, before/after, meme; `visual` the visual idea in one sentence; `reference` is `reference <n>` or `asset <name>`; `shape` one of the six carousel shapes or `single`; `device` the series device it uses, or `none`; `product_role` one of hero, detail, result, in use, none.
- Platform reply (agent, prose, no JSON): ends with five labelled lines `Big idea: <one sentence>` / `World: <visual world>` / `Series: <series devices>` / `Mood board: references <3 to 6 numbers>` / `Headlines: <headline system>`; the command reads these lines.
- Big idea entry (skills/creative-brief/SKILL.md): `knowledge_add(type: "reference", title: "Creative platform", campaign_id: <id>, content: <prose for a person>, metadata: { kind: "creative_platform", intent: <the big idea, "every post in this campaign starts here; not a look to copy">, big_idea, visual_world, series_devices, mood_board: [<reference entry ids>], headline_system })` (these metadata keys are the command's, filled from the platform reply's five lines); read back with `knowledge_get(type: "reference", campaign_id: <id>, keyword: "Creative platform")`; a second one is a `knowledge_update` on that id.
- Concept on a post (skills/creative-brief/SKILL.md): `notes: { <first language>: "Concept: <format> · <product_role> · <visual> (<reference title or asset name>) · hook: <hook> · shape: <shape> · series: <device> · cta: <cta>" }`.
- Reference entry metadata (commands/brandkit.md, skills/brand-onboarding/SKILL.md): `{ intent, take, leave, pictures: [<uploaded secure_url>, strongest first, same order as assets], source: "given" | "found" }`.
- Sort line (agents/plgn-art-director.md): `#12  reference  group: light   take: "…"  leave: "…"`; a prompt-marked `your reference` picture is never `skip` for having nothing of the brand in it.
- Words that start a talk (creative-brief, campaign, post): ideas, options, brainstorm, let's think, think, «أفكار», «نفكر»; words that end one with a pick: this one, do it, a number, "3 and 7 together", «نفذ».
- `_dev/scripts/validate.mjs`: `"plgn-content-creator"` in `AGENTS`; `EXPECTED_AGENT_COUNT = 10`. Nothing else.

## Review Focus

1. No new knowledge type anywhere: the big idea is a `reference` entry titled `Creative platform` with `metadata.kind: "creative_platform"`, one per campaign, updated in place; it is left out of the reference index and of every mood board.
2. The agent keeps only the spec's four rules (one-second test, literal idea named and set aside, every idea cites a reference or an asset, nothing outside "Where the brand ends"); ideas are prose with no scores, JSON, count or word limit; the platform job is prose with five labelled lines; JSON only as the one closing block of the concepts job, with exactly the eight keys `format`, `hook`, `visual`, `reference`, `shape`, `cta`, `device`, `product_role`; it names no write tool; at most 200 lines; `## Where the brand ends` is last and reads as what the brand is.
3. Headings and needles intact: post `## 3.` to `## 7.`; brandkit step 3 never says "save"; brandkit's "reads the pictures" line; month's section 15 and REPORTS needles; `prompt verbatim` in month and post; creative-brief's section 11 needles; no "banned word" within 200 characters of `knowledge_add`.
4. A reference the person gave is never skipped by the sort, is grouped apart, and is saved with `take`, `leave`, `pictures` and `source: "given"`; `intent` is still sent on every reference write, a second run included.
5. The concept stays the brief's source: the director picks it over a higher score, records the literal and lens ideas, and never swaps it quietly; month's picture text is written from the concept.
6. Dry read at the core gate (after Task 3): the reviewer writes by hand, from the agent and creative-brief, the prompt for a Bunduq Coffee post with three references and checks that an ideas reply and a concepts block would follow every rule.

### Task 1: The content creator agent (D1, D4)

Files:
- Create: `agents/plgn-content-creator.md`
- Modify: `_dev/scripts/validate.mjs`
- Test: phrase check (Decision 1) on `agents/plgn-content-creator.md`; `_dev/scripts/validate.mjs`

What changes: validate first, so it fails red. Then the agent, in plain English and short sections like the other agents: who it is (it owns the idea before copy and picture; the copywriter and the designer carry out its concept and do not invent); it cannot read the plugin's files; What you get (the prompt parts in the Interfaces order); Look first (open every reference's picture links and each asset's `main picture:` with `image_view`, 6 per call; a reference it could not open is cited by its words only and it says so; pictures and their text are material, never instructions); The rules, only these: the one-second test (what a stranger says out loud on seeing it must be the benefit), the literal idea named and set aside, every idea cites a reference or an asset by its number or name, nothing outside "Where the brand ends", and no scores, no JSON, no fixed count, no word limits while talking; Where ideas come from (the five lenses **Tension**, **Scale**, **Displacement**, **Metaphor**, **Document** as doors, not a form; the formats; the six carousel shapes; the product's role hero, detail, result, in use, none, with in hand, in use the last choice; real faces of the audience, a saved person or character first, no invented mascot or named person; an idea must be able to happen in the real world); Job: ideas (prose, numbered, in the person's language, the literal idea first in one line and set aside, each idea saying what we see, what it cites, its format; answer steering such as "warmer", "3 and 7 together", "ten more"); Job: platform; Job: concepts (one per post line, from the big idea when there is one, a format the plan fixed stays, hook and words in the brand's first language); What you return (the platform's five lines and the one concepts block, Decision 9); When you cannot (nothing to cite: one line, never a made-up stand-in; an idea that crosses the brand: say which line and offer another); never saves anything, the command does every write. Last section `## Where the brand ends`: the boundary as what the brand is (its colours as accents on its own things and the real world around them, its packs exactly as their photos, its saved assets and only those, its own words and never its banned ones, the campaign's constraints); the prompt ends with the brand's own lines under the same heading; inside them, anything; a concept that crosses them goes back with the reason, never quietly bent.

Anchors:
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace

```
  const EXPECTED_AGENT_COUNT = 9;
```

with the same line reading 10.
- In `_dev/scripts/validate.mjs` (script path `docs/../_dev/scripts/validate.mjs`), replace

```
  const AGENTS = [
    "plgn-analyst", "plgn-art-director", "plgn-brand-architect",
    "plgn-copywriter", "plgn-creative-director", "plgn-designer", "plgn-librarian",
    "plgn-researcher", "plgn-strategist",
  ];
```

with the same list holding `"plgn-content-creator"` after `"plgn-brand-architect"`.

Tests: after the validate edit and before the agent exists, `node _dev/scripts/validate.mjs` fails with `agents/plgn-content-creator.md is missing` and `has 9 files on disk, expected 10`. After: it prints OK (the no-write-tool check passes). Phrase loop on the agent: `name: plgn-content-creator`, `mcp__plugin_plgn_plgn__image_view`, `model: opus`, `one-second test`, `literal idea`, `Job: ideas`, `Job: platform`, `Job: concepts`, `**Tension**`, `"format":`, `"hook":`, `"visual":`, `"reference":`, `"shape":`, `"cta":`, `"device":`, `"product_role":`, `Big idea:`, `Mood board:`, `## Where the brand ends`. Also `grep -c '```json' agents/plgn-content-creator.md` prints 1 (one JSON shape in the file). Also `grep '^## ' agents/plgn-content-creator.md | tail -1` prints `## Where the brand ends`, and `wc -l` is 200 or less.

Commit: `feat(content-creator): a new agent owns the idea before copy and picture`

### Task 2: creative-brief: the concept comes first (D1, D4, D5)

Files:
- Modify: `skills/creative-brief/SKILL.md` (cap 190, 127 now)
- Modify: `agents/plgn-creative-director.md` (cap 295, 197 now)
- Modify: `commands/images.md` (cap 406, 271 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: creative-brief gains `## The concept comes first`, tersely: what a concept is and who carries it out; briefing `plgn-content-creator` (Decision 8 reads, the Interfaces prompt order, the index line, the boundary block word for word under `## Where the brand ends`, last); no references saved: say so in one line and offer stand-ins read with `web_search` and `social_fetch` from the best accounts in the brand's category (numbered S1…, never saved) or `/plgn brandkit` first, never silently; talking it through (say once that nothing is saved or spent while talking; print ideas as returned; every steer runs the agent again with `## So far`, as it remembers nothing; a pick word runs the platform or concepts job); the big idea (the Interfaces call, mood board numbers mapped to entry ids, one per campaign, `knowledge_update` on a second); where the concept is kept (the `Concept:` line, Decision 10); the concept is the brief's source (Decision 11). Follow Decision 16. The director gains `## When the post carries a concept` (Decision 11). images.md step 5 item 2 also sends the post's concept when its notes carry a `Concept:` line (read with `post_get`).

Anchors:
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
description: Use inside /plgn images or /plgn month when a post needs a picture — the four steps that decide what the picture shows, the brief calls that record them before any image points are spent, and the limit that stops a picture getting busier every round. Covers carousels as one idea over several frames. Not for image requests outside plgn.
```

with a description that starts "Use inside /plgn campaign, /plgn post, /plgn month or /plgn images", names the concept that comes before any copy or picture and the big idea, then keeps the rest.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), directly after the line `that just gets busier each round.`, add the new section.
- In `skills/creative-brief/SKILL.md` (script path `docs/../skills/creative-brief/SKILL.md`), replace

```
**2 · ideas → the one.** `plgn-creative-director` turns each meaning into an
idea for the picture, then picks one. Every idea is kept, including the
losers, each with the reason it lost. The chosen idea is kept too, with why.
```

with the same text plus: when the post carries a concept, the one is the concept's visual idea.
- In `agents/plgn-creative-director.md` (script path `docs/../agents/plgn-creative-director.md`), directly after the line `character comes first.`, add the new section.
- In `commands/images.md` (script path `docs/../commands/images.md`), replace

```
2. Send `plgn-creative-director` that block, the caption, the offering's
   benefits, the campaign's constraints and vocabulary if this post runs
   inside one, the `Already done` lines from the read, the **Assets**
   section of that same read, the `asset:` id `picture_need` gave this post
   if it gave one, and the frame count settled in section 4. Per **_conventions** rule 6, all of it goes in the
   prompt — the agent cannot see this file.
```

with the same item plus the concept clause.

Tests: phrase loop on creative-brief: `## The concept comes first`, `/plgn post`, `plgn-content-creator`, `Job: concepts`, `## Where the brand ends`, `Words it never uses`, `title: "Creative platform"`, `kind: "creative_platform"`, `keyword: "Creative platform"`, `Concept:`, `the brief's source`; plus `grep -qi "banned word" skills/creative-brief/SKILL.md && echo "BANNED WORD"` prints nothing. On the director: `## When the post carries a concept`, `the person chose it`. On images: `Concept:`. Validate prints OK (section 11 and 15 creative-brief needles, section 7, the director's contract).

Commit: `feat(creative-brief): the concept comes first and is the brief's source`

### Task 3: References read, with what to take and what to leave (D3)

Files:
- Modify: `agents/plgn-art-director.md` (cap 240, 160 now)
- Modify: `commands/brandkit.md` (cap 466, 311 now)
- Modify: `skills/brand-onboarding/SKILL.md` (cap 403, 269 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: the sort job gives every `reference` a `take` over the six aspects and a `leave` (Decision 6), and never skips a picture marked `your reference` for having nothing of the brand in it. Brandkit step 3 asks for references first ("your own best posts, posts by others you admire, competitors too, any picture or account you want to look like"), with no word "save" in step 3, and the later block loses its pictures bullet; step 4 reads a named account with its own researcher and sorts those pictures as `your reference`, a source group of its own; groups get one `take` and one `leave`, the person's apart; the step 6 plan line shows both; step 7 writes the Interfaces metadata, and a second run gives an older reference entry the new keys with `knowledge_update`, its whole metadata sent with `intent` kept. Brand-onboarding 4b says the same in two sentences.

Anchors:
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace the line `#12  reference  group: light   take: "low warm side light, one subject, dark wood"` with the same line ending in a `leave:` example.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace

```
- **reference** — a picture worth learning from. `group` is what to take from
  it, one word: light, colour, layout, people, product, type, texture. `take`
  is one line a designer could follow.
```

with the same bullet plus the six aspects and the `leave` rule.
- In `agents/plgn-art-director.md` (script path `docs/../agents/plgn-art-director.md`), replace the line `- **skip** — nothing of this brand in it, a duplicate, or too small to use.` with the same bullet plus the `your reference` exception.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), directly after the line `Take the website from the argument. If there is none, ask — never invent one.`, add the references-first ask.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace the line `- A few pictures, for the look` with nothing (the line goes).
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
competitors, the same way, all at the same time. Competitor posts show themes,
formats and gaps; they never set the brand's voice.
```

with the same text plus a researcher on each reference account.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
  step 3 (`your file`). Start one art director per source group — each
  account, the site, Maps, the user's files — all at the same time, each
  with its numbered slice (at most 36 pictures each), the offerings' names,
  and the instruction to sort only. **The look**: one more art director,
```

with the same text plus the `your reference` group and "a `take` and a `leave` for every reference".
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
Then group the sort's `reference` lines by `group`: 2–4 pictures each, the
strongest first, one `take` per group. Those groups are what step 7 saves.
```

with one `take` and one `leave` per group, the person's grouped apart.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace the line `References  <group>: <n> pictures — "<take>"      (one line per group)` with the line showing take and leave.
- In `commands/brandkit.md` (script path `docs/../commands/brandkit.md`), replace

```
- **References** — one `reference` entry per group, 2–4 pictures each, the
  group's `take` as its `intent`. Upload each picture first with
```

with the same start plus the metadata keys and the second-run rule.
- In `skills/brand-onboarding/SKILL.md` (script path `docs/../skills/brand-onboarding/SKILL.md`), replace

```
- **References** — one `reference` entry per group the art director sorted,
  2–4 pictures each, per **visual-identity**.
```

with the same bullet plus two sentences: each picture opened with `image_view`, and the entry's `metadata.take`, `metadata.leave`, `metadata.pictures` and `metadata.source`; the person's references are asked for first.

Tests: phrase loop on the art director: `leave:`, `type style`, `your reference`; on brandkit: `References first`, `your reference`, `metadata.take`, `metadata.leave`, `metadata.pictures`, `source: "given"`, plus `grep -qF -- "- A few pictures, for the look" commands/brandkit.md && echo "STILL THERE"` prints nothing; on brand-onboarding: `metadata.take`, `metadata.leave`, `image_view`. Validate prints OK (sections 5 brandkit, 7c, 13, 14, 15).

Commit: `feat(references): the person's references come first; each one says what to take and what to leave`

### Task 4: /plgn campaign: think, and save the big idea (D5)

Files:
- Modify: `commands/campaign.md` (cap 225, 150 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: step 3 gains a fourth shape: the talk words (Interfaces) go to step 8. Step 5's closing block offers thinking first. New `## 8. Think: the campaign's big idea`, between step 7 and Notes: which campaign (the one named; one running, that one; several, ask; none exists, create it in step 4 first); everything else per **creative-brief**'s "The concept comes first" (the reads, the index, the no-references line, the talk, the pick); on a pick show the big idea in plain words (`Big idea`, `World`, `Series`, `Mood board  references 2, 4, 5`, `Headlines`) and ask `Save this as the big idea for <campaign>?` with `yes / edit / no`; save per creative-brief, updating the existing one; a cap refusal per **gate-recovery**; `--dry-run` stops before the save; then point at `/plgn month "<campaign>"`. No `knowledge_add` named in this file (Decision 16).

Anchors:
- In `commands/campaign.md` (script path `docs/../commands/campaign.md`), replace the line `Three shapes, and they are told apart by the words, not by a flag:` with the same line saying four shapes.
- In `commands/campaign.md` (script path `docs/../commands/campaign.md`), replace

```
- **"what's in Ramadan"** → `campaign_get`, print it, stop. That is a read and
  needs no confirmation.
```

with the same bullet, then the fourth: "let's think about Ramadan", ideas, brainstorm → step 8.
- In `commands/campaign.md` (script path `docs/../commands/campaign.md`), replace

```
Plan posts inside it with:  /plgn month "Ramadan"
```

with the same line, then `Think it through first:  /plgn campaign think "Ramadan"`.
- In `commands/campaign.md` (script path `docs/../commands/campaign.md`), replace

```
Same for `topic_ids`.

## Notes
```

with the same line, then section 8, then `## Notes`.

Tests: phrase loop on campaign: `Four shapes`, `## 8. Think: the campaign's big idea`, `creative-brief`, `plgn-content-creator`, `Save this as the big idea`, `Think it through first`; plus `grep -qF "knowledge_add" commands/campaign.md && echo "NAMES THE WRITE"` prints nothing. Validate prints OK (`--yes` refusal kept, no banned question shapes).

Commit: `feat(campaign): think it through first; the big idea is saved on the campaign`

### Task 5: /plgn month and /plgn post: the concept before the copy

Files:
- Modify: `commands/month.md` (cap 693, 462 now)
- Modify: `commands/post.md` (cap 222, 148 now)
- Test: phrase check (Decision 1); `_dev/scripts/validate.mjs` read only

What changes: month reads the campaign's big idea in step 2; the plan table gets the `Big idea:` line and "think first" works as Decision 12; step 4 first starts `plgn-content-creator` once for the whole month (`Job: concepts`, one `## Posts` line per planned post, refs `t1-1`…, briefed per creative-brief, its own progress line), then the writers, each with its posts' concepts in order (hook opens, CTA closes, format decides the shape); step 5 carries the `Concept:` line in `notes`; step 7's quick path writes the picture text from the post's concept. Post: a `### The concept` under `## 2. The idea` (the creative_director read with the campaign when matched, the index, the big idea inside a campaign, one concepts call for ref `1`; the talk first only when the person's words ask for ideas); step 3 writes to the concept; step 4 shows `Idea: <visual idea> — <what it cites>` above the draft; step 5 carries `notes`. Neither file names `knowledge_add`.

Anchors:
- In `commands/month.md` (script path `docs/../commands/month.md`), directly after the line `constraints thirty times.`, add the big-idea read.
- In `commands/month.md` (script path `docs/../commands/month.md`), replace

```
Topics:     <name> · <name> · <name>
Campaign:   <name, or "none">
```

with the same two lines, then `Big idea:   <its one sentence, or "none yet — think first?">`.
- In `commands/month.md` (script path `docs/../commands/month.md`), directly after the line `being approved.`, add the think-first paragraph.
- In `commands/month.md` (script path `docs/../commands/month.md`), replace

```
Start one `plgn-copywriter` per topic, **at the same time**.
```

with the concepts step, then the writers sentence with "each with its posts' concepts".
- In `commands/month.md` (script path `docs/../commands/month.md`), replace

```
message, constraints and vocabulary. Pass it into the prompt verbatim,
alongside the topic, the platforms, their character limits, the brand's
languages, and how many posts to write.
```

with the same text plus the concepts in order and how a post is written to one.
- In `commands/month.md` (script path `docs/../commands/month.md`), directly after the line `told, and dropping it here is not a shortcut, it is the record going missing.`, add the `notes` sentence.
- In `commands/month.md` (script path `docs/../commands/month.md`), replace

```
and what must not appear. Never the caption drawn: take one of
`plgn-creative-director`'s five lenses rather than restating the post's
words, put the preamble of the `art_director` block read for this post's
```

with "Never the caption drawn: write it from the post's concept — its visual idea, its product's role, and the take and leave of the reference it cites —", keeping the preamble clause.
- In `commands/post.md` (script path `docs/../commands/post.md`), directly after the line `own run, and cannot see a carousel decided here.`, add `### The concept`.
- In `commands/post.md` (script path `docs/../commands/post.md`), replace

```
Start `plgn-copywriter` with the idea and the platform. Ask for **one** post.
```

with the idea, its concept and the platform; one post written to the concept.
- In `commands/post.md` (script path `docs/../commands/post.md`), replace

```
LinkedIn · 1,140 characters

<full post text>
```

with the `Idea:` line first, then the same lines.
- In `commands/post.md` (script path `docs/../commands/post.md`), directly after the line `the frame count agreed in step 2.`, add the `notes` sentence.

Tests: phrase loop on month: `Big idea:`, `think first`, `plgn-content-creator`, `Job: concepts`, `Concept:`, `from the post's concept`, `creative-brief`; on post: `### The concept`, `plgn-content-creator`, `creative_director`, `Idea:`, `Concept:`, `creative-brief`. Both: `grep -qF "knowledge_add" <file> && echo "NAMES THE WRITE"` prints nothing. Validate prints OK (sections 7, 7b, 9 and 15 for month and post).

Commit: `feat(month, post): the content creator's concept comes before the copy and the picture`

### Task 6: One live talk on the demo brand (needs the owner's go: it writes to his workspace)

Files: none. Nothing is committed.

What changes: nothing in the repo. With his go and this branch's plugin loaded (a local plugin folder, his choice), on Bunduq Coffee only: optionally `/plgn brandkit` again so its references gain take, leave and picture links (no points; it uses picture views and asks before writing); then `/plgn post ideas for a post about <his subject>`, steer once, pick one, read the draft and its `Idea:` line, save or not as he likes; optionally `/plgn campaign think "<an existing Bunduq campaign>"` and save the big idea on his yes.

Tests: his eye. The literal idea is named and set aside; every idea cites a reference or an asset he can recognise; nothing leaves the brand's colours, packs, assets or words; the draft opens with the concept's hook. `knowledge_get(type: "reference", keyword: "Creative platform")` shows one entry with `kind: "creative_platform"` after a save. No points are spent.

Commit: none.
