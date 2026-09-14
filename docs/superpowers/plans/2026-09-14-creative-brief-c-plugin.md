# Creative Brief — Plan C (plugin 1.5.0) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the plugin to write a brief — two new agents that think and check, a skill that owns the four steps, an `/plgn images` rewritten around them, and a `/plgn why` that reads a brief back in plain words.

**Architecture:** This repo has no unit tests. `node scripts/validate.mjs` is the test: it reads every command, agent and skill as text and fails on a wrong tool name, a missing preflight, a forbidden `--yes`, or a count that has drifted. So every task here writes its **validator check first**, watches it fail, then writes the content that makes it pass. That is this repo's TDD.

**Tech Stack:** Markdown commands, agents and skills; `scripts/validate.mjs` (plain Node, no dependencies); `.claude-plugin/plugin.json`.

**Spec:** `F:/G drive/Projects/hbs-projects/plgn/docs/superpowers/specs/2026-09-14-creative-brief-design.md` — §11 is this plan's scope in full, with §5 (the four steps), §6.2 (the five tools) and §9 (cost) as the reference for what the server actually does.

**Depends on:** Plan A deployed. The five brief tools do not exist for an installed plugin until the server ships them, and a command naming a tool the server has never heard of fails at the first call. Publish 1.5.0 **after** the server deploy, never beside it.

## Global Constraints

- **Agents cannot read skills** (`commands/_conventions.md` rule 6). Every rule an agent needs goes in the prompt the command sends it. The `creative-brief` skill is for the **command**, never quoted at an agent.
- **Agents never call write tools.** The command owns every write. The validator already enforces this and will catch a slip.
- **`/plgn images` and `/plgn why` never accept `--yes`.** `images` spends real credits; `why` writes nothing and has nothing to confirm.
- **The cost sentence comes before the first generation call**, states the total for the whole run, and waits for a yes (`_conventions` rule 3, the image exception).
- **Never print an internal name** — no `brief_create`, no `anchor`, no `candidate`, no `knowledgeUsed`. "brief", "idea", "frame" and "slide" are plain English and are allowed (`reply-style`).
- **Three checks is the limit.** A fourth is not attempted; the command says which post needs a person.
- **Commit style:** no `Co-Authored-By` and no `Claude-Session` trailers in this repo.

## File Structure

| File | Responsibility |
|---|---|
| `skills/creative-brief/SKILL.md` | The four steps, the two calls, the three-check limit, what makes a real idea, how a carousel is one idea over several frames |
| `agents/plgn-creative-director.md` | Steps 1–3: meaning, ideas with scores, the pick, one direction per frame |
| `agents/plgn-designer.md` | Step 4: check against the brand's rules, then the final image text per frame |
| `agents/plgn-visual.md` | Narrowed: does this post need a picture, and the alt text per frame |
| `agents/plgn-strategist.md` | May mark a post as a carousel at planning time |
| `commands/images.md` | The pipeline, and the cost sentence |
| `commands/why.md` | Reads a brief back in plain words |
| `commands/month.md`, `post.md`, `queue.md`, `report.md` | Carry the pins, the frame count, the failures, the counts |
| `skills/image-prompting`, `platform-specs`, `visual-identity`, `reply-style` | Point at the brief instead of restating it |
| `scripts/validate.mjs`, `.claude-plugin/plugin.json`, `README.md` | The five tools, 24 commands, 12 skills, 12 agents, version 1.5.0 |

---

### Task 1: The validator knows what is coming

**Files:**
- Modify: `scripts/validate.mjs:12-32` (`TOOLS`, `CONNECTED`), and the count constants

**Interfaces:**
- Consumes: nothing.
- Produces: the `TOOLS` set every later task's tool references are checked against, and the counts Task 9 must satisfy. Every later task in this plan is verified by running `node scripts/validate.mjs`.

This task is deliberately first and deliberately **fails the build**. It states the target — 24 commands, 12 skills, 12 agents, five new tools — and every later task moves the repo toward it. Do not skip ahead to Task 9 to silence it.

- [ ] **Step 1: Add the five tool names**

In `scripts/validate.mjs`, in the `TOOLS` set, after the campaign tools:

```js
  "brief_create", "brief_update", "brief_finalize", "brief_get", "brief_list",
```

- [ ] **Step 2: Add `why` to the connected list**

In the same file, add `"why"` to `CONNECTED`. It calls `brief_get` and `post_list`, so it is connected, and the existing checks will now require it to preflight with `workspace_info` and to carry no seam.

- [ ] **Step 3: Raise the counts**

`EXPECTED_COMMAND_COUNT` 23 → 24, `EXPECTED_SKILL_COUNT` 11 → 12, `EXPECTED_AGENT_COUNT` 10 → 12.

- [ ] **Step 4: Run it and watch it fail**

Run: `node scripts/validate.mjs`
Expected: FAIL, naming the missing `commands/why.md`, the missing skill directory, the two missing agents, and the three counts. Read the list — it is this plan's task list, restated by a program.

- [ ] **Step 5: Commit**

```bash
git add scripts/validate.mjs
git commit -m "test(validate): name the five brief tools and the counts 1.5.0 must reach"
```

---

### Task 2: The `creative-brief` skill

**Files:**
- Create: `skills/creative-brief/SKILL.md`
- Modify: `.claude-plugin/plugin.json` (the `skills` array)

**Interfaces:**
- Consumes: the five tools (Task 1).
- Produces: the procedure `commands/images.md` (Task 6) follows, and the vocabulary every later task uses — "idea", "frame", "check", "what carries the frame".

- [ ] **Step 1: Write the check first**

In `scripts/validate.mjs`, in the content-checks section beside the existing map-skill check, add:

```js
// The brief skill must own the three-check limit and both calls. A skill
// that describes the steps but not where they stop is a skill that reads
// fine and loops forever in practice.
const BRIEF_SKILL = "skills/creative-brief/SKILL.md";
if (exists(BRIEF_SKILL)) {
  const b = read(BRIEF_SKILL);
  for (const needle of ["brief_create", "brief_finalize", "three"]) {
    if (!b.includes(needle)) fail(`${BRIEF_SKILL}: must state \`${needle}\``);
  }
} else {
  fail(`${BRIEF_SKILL} is missing — nothing owns the four steps`);
}
```

Run: `node scripts/validate.mjs` — expect the new failure to appear.

- [ ] **Step 2: Write the skill**

Create `skills/creative-brief/SKILL.md` with frontmatter whose `name` is `creative-brief` (the validator checks name against directory) and a description shaped like the other skills':

```yaml
---
name: creative-brief
description: Use when making a picture for a post — the four steps that decide what the picture shows, the two calls that save them, and the limit that stops a picture getting busier every round. Covers carousels as one idea over several frames.
---
```

Body, in this order:

1. **What a brief is for** — three sentences. It answers "why does this look like this" months later, it stops an idea being offered twice, and it gives a failed check somewhere to go back to.
2. **The four steps**, one short section each: benefit → meanings; ideas → the one; what carries the frame → direction; check → final text. Say who does each (`plgn-creative-director` for 1–3, `plgn-designer` for 4).
3. **Two calls, not four.** `brief_create` saves steps 1–3. `brief_finalize` saves step 4. A failed check calls `brief_update` with the objections and a different idea taken from the ones already saved.
4. **Three checks, then stop.** The fourth is not attempted. The command names the post and moves on. Write the reason down: with no record of the ideas that lost, the only way to answer an objection is to add elements, and that is how pictures get busy.
5. **What makes a real idea** — a metaphor with a territory, scored, and every rejected one carrying its reason. "A nice photo of the product" is not an idea; it is the absence of one.
6. **What carries the frame is not yours to choose.** The server decides it from what the brand sells. A service brand has nothing to photograph. Say what the four answers mean in one line each.
7. **Carousels** — one idea over several frames, each frame with a job (hook, proof, how, ask). A single picture is a brief with one frame, so there is never a second way of doing this. Default 3 frames when someone asks for a carousel, never more than 10.
8. **Cost** — every frame is a picture and a charge. The total is stated before the first call.

- [ ] **Step 3: Register the skill**

Add `"./skills/creative-brief"` to the `skills` array in `.claude-plugin/plugin.json`.

- [ ] **Step 4: Run the validator**

Run: `node scripts/validate.mjs`
Expected: the brief-skill failures and the skill-count failure are gone; the command, agent and count failures from Task 1 remain.

- [ ] **Step 5: Commit**

```bash
git add skills/creative-brief .claude-plugin/plugin.json scripts/validate.mjs
git commit -m "feat(skills): creative-brief — the four steps, two calls, three checks"
```

---

### Task 3: `plgn-creative-director`

**Files:**
- Create: `agents/plgn-creative-director.md`

**Interfaces:**
- Consumes: the prompt `commands/images.md` (Task 6) sends it — a `context_get(creative_director)` block, the post's caption, the offering benefits, the campaign's constraints and vocabulary, the `Already done` section, and the frame count.
- Produces: the JSON the command passes to `brief_create`:
  ```
  benefitLabel, meanings[], candidates[{metaphor, territory, score, rejectedBecause}],
  concept, conceptWhy, slides[{order, role, artDirection}]
  ```
  Task 4's designer consumes `concept` and `slides[].artDirection`.

- [ ] **Step 1: Write the agent**

Create `agents/plgn-creative-director.md` following `agents/plgn-visual.md`'s frontmatter shape (`name` must equal the filename, `tools: [Read]`, a colour). Body:

- **Your job** — you decide what the picture is *about*. You do not write the final image text and you do not choose what physically carries the frame.
- **You cannot read the plugin's files.** Everything you need is in your prompt. (The same sentence every other agent carries — the validator does not check it, but an agent without it starts inventing file reads.)
- **Step 1** — take the benefit and say what it actually means. Two to four meanings, concrete nouns, not adjectives. "Stronger hair" → strength, resilience, load.
- **Step 2** — three to five ideas. Each is a metaphor plus the territory it lives in, scored 0–10, and **every one you do not pick carries the reason you did not**. That reason is the point: it is what stops the same cliché being offered next month.
- **Read `Already done` before you score.** An idea that appears there scores 0 and says so.
- **Step 3** — one direction per frame, in words a person could shoot. Give each frame a job: hook, proof, how, ask.
- **What you return** — the exact JSON keys above, and nothing else. No prose around it.
- **When the brief comes back for another round** — you are given the objections and your own earlier ideas. Pick a *different* idea. Never answer an objection by adding elements to the idea that already failed.
- **When you cannot** — say so in one line rather than returning a weak idea. A post with no picture is better than a picture that says nothing.

- [ ] **Step 2: Run the validator**

Run: `node scripts/validate.mjs`
Expected: one fewer missing-agent failure. If it reports an unknown tool name, the agent prompt is naming a tool — remove it. This agent calls nothing.

- [ ] **Step 3: Commit**

```bash
git add agents/plgn-creative-director.md
git commit -m "feat(agents): the creative director — meaning, ideas, and the reason the losers lost"
```

---

### Task 4: `plgn-designer`

**Files:**
- Create: `agents/plgn-designer.md`

**Interfaces:**
- Consumes: the concept and per-frame directions from Task 3, plus `brand_identity`, `visual_rules` and the campaign constraints, passed in its prompt by `commands/images.md`.
- Produces: either `slides[{order, generationPrompt, altTextHint}]` for `brief_finalize`, or `qaFindings[]` for `brief_update`. Never both.

- [ ] **Step 1: Write the agent**

Create `agents/plgn-designer.md`. Body:

- **Your job** — check the idea against what the brand never does, then write the final image text for each frame. You are the last read before money is spent.
- **You cannot read the plugin's files.**
- **Check first, write second.** Go through the brand's `never` list, the picture rules, and the campaign's constraints, one at a time, against each frame. Anything that breaks one is an objection.
- **You never rewrite the idea.** If it breaks a rule, return the objections and stop. Sending it back is cheap; a picture that breaks a brand rule is not.
- **Write the text for what carries the frame, as it was decided** — a real photo, a built object, a scene, or type alone. You are told which. Do not argue with it: a service brand has nothing to photograph.
- **What a good final text contains** — the subject, the composition, the light, the medium, the palette, and what must not appear. One paragraph per frame, no lists, no camera brand names.
- **What you return** — either `slides` with one `generationPrompt` each, or `qaFindings`. Never both, because a command that receives both does not know whether to spend.

- [ ] **Step 2: Run the validator**

Run: `node scripts/validate.mjs`
Expected: the agent-count failure is gone; commands and counts from Task 1 remain.

- [ ] **Step 3: Commit**

```bash
git add agents/plgn-designer.md
git commit -m "feat(agents): the designer — check against the brand, then write the final text"
```

---

### Task 5: The two agents that change

**Files:**
- Modify: `agents/plgn-visual.md`
- Modify: `agents/plgn-strategist.md`

**Interfaces:**
- Consumes: nothing new.
- Produces: `plgn-visual` returns `{ needsImage: boolean, why: string, altText: LocaleMap }` per frame — the shape Task 6 expects. `plgn-strategist` gains `plannedSlides` on each planned post, which `commands/month.md` (Task 8) passes to `post_create`.

- [ ] **Step 1: Narrow `plgn-visual`**

Delete its image-description sections (the `imagePrompt` output and the art-direction guidance — they are now Tasks 3 and 4's work) and leave two jobs, stated at the top:

1. **Does this post need a picture at all?** Return `needsImage: false` with one line of reason when it reads better plain. This answer is worth more than it looks: it is the only thing in the pipeline that saves money by *not* making something.
2. **The alt text**, once the picture exists — one per frame, describing what the picture shows for someone who cannot see it. Not the caption again.

Update its frontmatter `description` to match, since that is what makes it get picked.

- [ ] **Step 2: Teach `plgn-strategist` about carousels**

Add one section: when a subject needs several beats — a process, a before/after, a list of three — mark the post as a carousel and say how many frames. **Default 3. Never more than 10.** The caption is then written for a carousel, which is a different caption. Add `plannedSlides` to its output shape.

- [ ] **Step 3: Run the validator**

Run: `node scripts/validate.mjs`
Expected: no new failures.

- [ ] **Step 4: Read them side by side**

Open the four agent files (creative director, designer, visual, strategist) and answer one question: **could two of them return the same thing?** If the visual still describes a picture, or the designer still picks ideas, the split has not happened and the prompts need cutting, not adding.

- [ ] **Step 5: Commit**

```bash
git add agents/plgn-visual.md agents/plgn-strategist.md
git commit -m "feat(agents): the visual keeps two jobs, the strategist can plan a carousel"
```

---

### Task 6: `/plgn images`, rebuilt

**Files:**
- Modify: `commands/images.md` (whole body below the frontmatter)

**Interfaces:**
- Consumes: the skill (Task 2), all four agents (Tasks 3–5), and the tools `context_get`, `brief_create`, `brief_update`, `brief_finalize`, `generate_image`, `generate_image_from_image`, `check_generation`, `post_update`.
- Produces: nothing later in this plan depends on it.

- [ ] **Step 1: Write the check first**

In `scripts/validate.mjs`, beside the other content checks:

```js
// The pipeline check: /plgn images must go through a brief, not straight to
// the image maker. A command that calls generate_image with no brief_create
// is the old behaviour wearing the new version number.
const IMAGES = "commands/images.md";
if (exists(IMAGES)) {
  const body = read(IMAGES);
  for (const needle of ["brief_create", "brief_finalize", "creative-brief"]) {
    if (!body.includes(needle)) fail(`${IMAGES}: must go through \`${needle}\``);
  }
}
```

Run: `node scripts/validate.mjs` — expect three new failures.

- [ ] **Step 2: Rewrite the command**

Keep sections 1 and 2 (connection check; find the gaps) as they are. Replace everything from "Decide which deserve one" with:

**3. Decide which deserve a picture** — `plgn-visual` per post, unchanged in purpose. Say which are being skipped and why.

**4. Say what it costs, then ask** — moved **before** any thinking, because the frame count is now known from each post's planned frames and the total can be stated honestly:

```
9 pictures for 5 posts (one is a 4-frame carousel).
9 credits, leaving 15.
yes / pick / no
```

**5. Per post: read, think, check, save** — in order, and per post, not once for the run:

1. `context_get(role: "creative_director", campaign_id: <the post's campaign, if it has one>)`
2. `plgn-creative-director` with that block, the caption, the benefits, the campaign's constraints and vocabulary, the `Already done` lines, and the frame count. Per `_conventions` rule 6, all of it goes in the prompt.
3. `brief_create` with what it returned, plus `knowledge_used` copied from the end of the `context_get` read.
4. `plgn-designer` with the concept, the frames, the brand's identity and picture rules, and what carries each frame as the brief resolved it.
5. Objections → `brief_update` with them and a different idea, then back to the designer. **Three times at most.** On the fourth, stop for that post, say which post and why, and carry on with the rest of the run.
6. No objections → `brief_finalize`.

**6. Make the pictures** — one `generate_image` per frame, carrying `post_id`, `brief_id` and `slide_order`; `generate_image_from_image` when the brand has a reference. Then `check_generation` as the **image-prompting** skill describes — point at it, do not restate the waiting cycle.

**7. Attach** — `plgn-visual` for the alt text per frame, then `post_update` with the media in frame order. `media[0]` is the cover, so the order matters and is the frame order.

**8. Say what happened** — counts first: pictures made, credits spent, posts skipped and why, posts that needed a person. Print the idea line for each post, because that is the part a user can disagree with.

- [ ] **Step 3: Run the validator**

Run: `node scripts/validate.mjs`
Expected: the three `images` failures are gone.

- [ ] **Step 4: Commit**

```bash
git add commands/images.md scripts/validate.mjs
git commit -m "feat(images): make pictures through a brief, and state the whole cost first"
```

---

### Task 7: `/plgn why`

**Files:**
- Create: `commands/why.md`
- Modify: `.claude-plugin/plugin.json` (the `commands` array), `commands/help.md`, `README.md`, `commands/_conventions.md` (the connected list and the no-`--yes` list)

**Interfaces:**
- Consumes: `brief_get`, `post_list`, `workspace_info`.
- Produces: nothing later depends on it.

- [ ] **Step 1: Write the command**

Create `commands/why.md`. Frontmatter carries a description only (the validator fails a command that declares a `name`):

```yaml
---
description: Explain why a picture looks the way it does — the idea behind it, the ideas that lost, what carried the frame, and what the brand knowledge said at the time. Read-only. Use for "why does this look like this", "what was the thinking here", or reading back a picture months later.
---
```

Body:

1. **Check the connection** — `workspace_info`, the `_conventions` rule 2 message on failure.
2. **Find the post** — the argument may be a title, part of a caption, or an id. Use `post_list` and match. Several matches → show them and ask which. None → say so and stop; never guess.
3. **Read the brief** — `brief_get(post_id: …)`.
4. **When there is none** — one line: this picture was made before plgn kept briefs, so there is no record of the thinking. Offer nothing else. Do not offer to write one now; a brief written after the fact is a story, not a record.
5. **When there is one** — print it in this order, in plain words:
   - the idea, in its own line
   - what the benefit was taken to mean
   - the ideas that lost, each with its reason
   - each frame: its job, and what carried it
   - how many checks it took, and if it failed, say plainly that it needed a person
   - what it read: the brand knowledge, by name, with the version
6. **Never print an internal name.** No tool names, no `anchor`, no `id@vN` — the entry's title and "version 3" is what a person reads.

- [ ] **Step 2: Register it in four places**

- `.claude-plugin/plugin.json`: `"./commands/why.md"` in the `commands` array.
- `commands/help.md`: one line in the connected list.
- `README.md`: a row in the command table.
- `commands/_conventions.md`: add `why` to the connected list at the top, and leave it out of the `--yes` list (it writes nothing, so there is nothing to skip).

- [ ] **Step 3: Run the validator**

Run: `node scripts/validate.mjs`
Expected: the missing-command and command-count failures are gone.

- [ ] **Step 4: Commit**

```bash
git add commands/why.md commands/help.md commands/_conventions.md README.md .claude-plugin/plugin.json
git commit -m "feat(why): read a picture's brief back in plain words"
```

---

### Task 8: The commands that carry the new fields

**Files:**
- Modify: `commands/month.md`, `commands/post.md`, `commands/queue.md`, `commands/report.md`

**Interfaces:**
- Consumes: `post_create`'s new `knowledge_used`, `brief_id` and `planned_slides`; `brief_list`.
- Produces: nothing later depends on it.

- [ ] **Step 1: Write the check first**

In `scripts/validate.mjs`, extend the existing "every copy-drafting command must read `context_get`" check with its natural pair:

```js
// Reading the brand and then not saying what you read is half a feature: the
// pins are what make "why does this say that" answerable later.
for (const f of ["month.md", "post.md"]) {
  const body = read(`commands/${f}`);
  if (!body.includes("knowledge_used")) fail(`commands/${f}: must pass \`knowledge_used\` from its context_get read`);
}
```

Run: `node scripts/validate.mjs` — expect two new failures.

- [ ] **Step 2: `month`**

- The strategist may mark a post as a carousel; pass `planned_slides` to `post_create`.
- Every `post_create` carries `knowledge_used`, copied from the end of the `context_get(copywriter)` read that produced the caption. One sentence explaining why, so a later editor does not delete it as noise.
- The run summary counts carousels separately, because they cost differently: `28 posts · 4 of them carousels (9 extra pictures)`.

- [ ] **Step 3: `post`**

Carry `knowledge_used` on the single `post_create`. If the user asked for a carousel, `planned_slides` too, defaulting to 3.

- [ ] **Step 4: `queue`**

Add a fourth list beside the existing three: posts whose brief gave up. Head it with what to do — these need a person, not another run — and name each post.

- [ ] **Step 5: `report`**

Add two counts: how many pictures went through a brief, and how often the check failed. Say what a high number means in one line — the direction is fighting the brand's rules, and the rules are probably right.

- [ ] **Step 6: Run the validator**

Run: `node scripts/validate.mjs`
Expected: the two new failures are gone.

- [ ] **Step 7: Commit**

```bash
git add commands/month.md commands/post.md commands/queue.md commands/report.md scripts/validate.mjs
git commit -m "feat(commands): carry the pins, the frame counts, and the posts that need a person"
```

---

### Task 9: The four skills that point at the brief, and 1.5.0

**Files:**
- Modify: `skills/image-prompting/SKILL.md`, `skills/platform-specs/SKILL.md`, `skills/visual-identity/SKILL.md`, `skills/reply-style/SKILL.md`
- Modify: `.claude-plugin/plugin.json` (version), `README.md`

**Interfaces:**
- Consumes: everything above.
- Produces: the published plugin.

- [ ] **Step 1: Write the check first**

```js
// The words a brief introduces that must never reach a user. "brief",
// "idea", "frame" and "slide" are deliberately NOT here: they are plain
// English and the panel in the dashboard uses them too.
const NEVER_SAY = ["brief_create", "brief_finalize", "anchor", "knowledgeUsed"];
const STYLE = read("skills/reply-style/SKILL.md");
for (const w of NEVER_SAY) {
  if (!STYLE.includes(w)) fail(`skills/reply-style/SKILL.md: must ban \`${w}\` from user-facing text`);
}
```

Run: `node scripts/validate.mjs` — expect four new failures.

- [ ] **Step 2: `reply-style`**

Add the four words to the list that never reaches the user, with the one-line reason: they are the machine's names for things the user already has words for.

- [ ] **Step 3: `image-prompting`**

Replace its "write the description" section with a pointer: the final text now comes from a finalized brief, and the four steps live in **creative-brief**. Keep the waiting cycle and the credit-cost sections exactly as they are — they are still the only place that owns `check_generation` and the timeout.

- [ ] **Step 4: `platform-specs`**

Add carousel frame counts per platform (Instagram up to 10, LinkedIn up to 10, Facebook up to 10, X up to 4, TikTok not a carousel) and one paragraph on how a carousel caption differs from a single-picture caption — the first frame carries the hook, so the caption does not have to.

- [ ] **Step 5: `visual-identity`**

One change: what carries the frame is resolved by the server from what the brand sells, not chosen. The reference path (`generate_image_from_image` with the canonical reference) is unchanged.

- [ ] **Step 6: 1.5.0**

`.claude-plugin/plugin.json` version `1.4.0` → `1.5.0`. README's command table gains `/plgn why`; its counts become 24 commands, 12 skills, 12 agents.

- [ ] **Step 7: Run the validator, clean**

Run: `node scripts/validate.mjs`
Expected: `OK: plugin structure valid.` — every failure from Task 1 onward now resolved.

- [ ] **Step 8: Read two things a program cannot check**

1. Open `skills/creative-brief/SKILL.md` and answer, in under ten seconds: **where does a failed check go, and when does it stop?** If you have to read twice, the section order is wrong.
2. Search the diff for `brief_create`, `anchor`, `candidate` and `knowledgeUsed` appearing inside something a command **prints** rather than something it **calls**. The validator cannot tell those apart; a reader can.

- [ ] **Step 9: Commit**

```bash
git add skills .claude-plugin/plugin.json README.md scripts/validate.mjs
git commit -m "chore: 1.5.0 — the creative brief, two new agents, carousels"
```

---

## Execution order and risks

**1 first.** It states the target and fails loudly until the plan is done. **2 before 3–6**, because the skill sets the vocabulary those files use. **3, 4, 5 in any order** — the three agent tasks touch different files. **6 after 3–5**, because it briefs all of them. **7 and 8 in any order after 6.** **9 last.**

| Risk | Handling |
|---|---|
| 1.5.0 published before the server deploy | The five tools do not exist yet and `/plgn images` fails at the first call. Publish after, never beside. The plan's Depends-on line says so; the release step is a human's |
| A 1.4.0 user runs `/plgn why` | They cannot — the command ships with 1.5.0. But a 1.5.0 user with old posts can, and that path is Task 7 step 4: one line, no offer to invent a brief |
| The three-check limit is quietly raised by a later editor | It is stated in the skill, in the command and in the server (`MAX_QA_ROUNDS`). The server is the one that actually enforces it; the other two only have to agree |
| Carousel costs surprise someone | Task 6 step 2's cost sentence states the frame count, the credits and the balance left, before anything is spent |

## Self-Review

**Spec coverage:** §11.1 agents → Tasks 3, 4, 5. §11.2 skills → Tasks 2 and 9. §11.3 commands → Tasks 6, 7, 8. §11.4 validator → Tasks 1, 2, 6, 8, 9. §9 cost → Task 6 step 2. §5's three-check limit → Tasks 2, 3, 6. Carousels → Tasks 2, 5, 6, 9.

**Placeholder scan:** none. Every validator snippet is real JavaScript against the real helper names (`exists`, `read`, `fail`); every content step lists the sections to write and the order to write them in.

**Type consistency:** the creative director's output keys (`benefitLabel`, `meanings`, `candidates`, `concept`, `conceptWhy`, `slides[].artDirection`) match `brief_create`'s arguments in Plan A Task 5, and are named identically in Tasks 3 and 6 here. The designer's two-way output (`slides[].generationPrompt` **or** `qaFindings`) matches `brief_finalize` and `brief_update` in Plan A. `plannedSlides` is the strategist's key (Task 5), `planned_slides` the tool argument (Task 8) — snake_case at the boundary, as everywhere else in this plugin.
