# Knowledge Graph — Plan C: plgn-claude 1.4.0 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Teach the Claude Code plugin the knowledge graph the server already holds — sixteen types in three layers, four singletons, Offerings and Campaigns as records, and one `context_get(role)` read in place of several `knowledge_get` calls — and ship it as 1.4.0 with one new command.

**Architecture:** This plugin is Markdown. It ships no runtime code: `commands/*.md` are entry points, `agents/*.md` are prompt contracts, `skills/*/SKILL.md` are shared know-how, and `scripts/validate.mjs` is a dev-time consistency checker that never reaches a user. So this plan is a documentation plan with a test harness, and the harness is the validator: every behavioural claim it can check, it checks, and each task extends it with the check that pins that task's own change.

**Tech Stack:** Markdown with YAML frontmatter; one Node script (`scripts/validate.mjs`, ESM, no dependencies); `plugin.json` / `marketplace.json` / `.mcp.json`.

**Repository:** `F:/G drive/Projects/hbs-projects/plgn-claude` — a **separate git repo** from `plgn`, on `main` at `b074a51`. Nothing in this plan touches the `plgn` repo.

**Spec:** `F:/G drive/Projects/hbs-projects/plgn/docs/superpowers/specs/2026-09-09-knowledge-graph-design.md` — §10 is this plan's scope in full, with §5 (types and layers), §6 (tools, especially §6.5 `context_get`) and §7 (caps) as the reference for what the server actually does. §9 is Plan B (the dashboard). §13 is Spec 2.

**Server state this plan writes against:** the knowledge graph server work is **merged to `plgn`'s `main` at `1b1ab51` and NOT DEPLOYED**. Every tool named here exists in that tree. Nothing here can be verified end-to-end against a live workspace until `plgn` is deployed and the migration is committed — see "What waits for the deploy" at the end.

---

## Global Constraints

Every task's requirements implicitly include this section.

### What the server actually holds

- **Sixteen types, three layers.** Foundation: `brand_identity`, `brand_positioning`, `voice_tone`, `audience`, `visual_rules`, `creative_rules`. Business: `promotion`, `proof`, `objection`, `competitor`, `market_context`, `seo_rules`, `platform_rules`. Creative: `reference`, `approved_execution`, `example_post`.
- **Four singletons** — `brand_identity`, `brand_positioning`, `voice_tone`, `audience`. A brand holds exactly one of each. A second is **refused**, and the refusal carries the existing entry's id. That is an instruction to update, not an error to report.
- **Foundation writes need `confirm: true`**, passed only after the user has said yes to the text.
- **Four legacy names still work for one generation** — `brand_voice`, `competitor_data`, `seo_guidelines`, `example_article` — as *filters* on `knowledge_get` and as *inputs* to `knowledge_add`, where they are mapped. **No file in this plugin may write one after this plan.** An installed 1.3.0 keeps working through those aliases; that is what they are for.
- **Eleven new tools:** `knowledge_history`, `offering_create`, `offering_update`, `offering_delete`, `offering_list`, `campaign_create`, `campaign_update`, `campaign_delete`, `campaign_get`, `campaign_list`, `context_get`. There is **no `offering_get`** — `offering_list` is the read.
- **`context_get` takes `role`** — one of `marketing_manager`, `creative_director`, `copywriter`, `art_director`, `designer`, `all` — plus optional `campaign_id`, `offering_ids`, `topic_id`. It returns the brand record, then Foundation, then Business, then Creative, in that fixed order, ending with the exact entry versions it gave you. **It replaces several `knowledge_get` calls, not one.**
- **Timezone lives on the brand record** now (`brand_update(timezone)`, printed by `brand_list`), not in a `Publishing` knowledge entry.
- **Free caps:** 12 knowledge entries, 2 offerings, 1 campaign in progress (`draft` + `active` only). Hitting one is a refusal to act on, not an error to report.

### What this plugin is, and what it must stay

- **Markdown only.** No scripts ship. `scripts/validate.mjs` is dev-time and is not in `plugin.json`.
- **Never handle a credential.** No command may ask the user to type, paste or store a token, key or password. Sign-in belongs to plgn's OAuth. The validator checks three phrasings of this; the rule is broader than the check.
- **Free commands call zero MCP tools** — `demo`, `audit`, `strategy`, `voice`, `competitors`, `calendar` — and close with the seam. **Connected commands never carry the seam** and always preflight with `workspace_info`. `help` is neither.
- **Reply in the user's language, at a plain reading level, never printing an internal name.** `skills/reply-style/SKILL.md` owns this and every command points at it rather than restating it.
- **A rule lives in exactly one file.** Commands reference skills by name; they never copy a skill's text. A copy drifts.
- **Agents cannot read skills.** `commands/_conventions.md` rule 6: a command that starts an agent puts the rules that agent needs *into its prompt*. This is why the agent contracts in Task 6 matter — a `context_get` block passed to `plgn-copywriter` is the only way that agent ever sees the brand.

### The validator is the test suite

- **`node scripts/validate.mjs` must exit 0 at the end of every task.** It is the only automated check this repo has.
- **Each task adds the check that pins its own change**, in the same commit — that is this plan's version of writing the failing test first. Two checks are global and can only pass once every file is clean, so they land in the last task: "no file writes an old type name" and "every copy-drafting command reads `context_get`". Both are named in the task that introduces them.
- **`claude plugin details` must report 23 commands** after Task 5 (22 today, plus `campaign`).
- Never weaken a check to make a file pass. If a check is wrong, say so in the report and change the check deliberately, with its reason written beside it — that file is full of such reasons and each one is a bug that was found the hard way.

### Language and voice of the content itself

- **Plain, specific, unhurried.** These files are read by a model *and* by a person debugging why a run went wrong. Short sentences. No marketing.
- **Say what fails and how it fails silently.** Nearly every rule in these files exists because something failed quietly — a banned-word list nothing enforced, a timezone nobody stored, a bulk run nobody could undo. Keep that habit: when a task adds a rule, write the failure it prevents.
- **Tables for maps, prose for reasons.** The map skill is a table because it is a lookup. The trap under it is prose because it is an argument.

### Git

- **Tag first:** `git tag pre-knowledge-graph` on `main` before Task 1, matching spec §12.1's "tag `pre-knowledge-graph` on both `main`s".
- **Branch:** `feat/knowledge-graph`, cut from `main` at `b074a51`.
- **Commit at the end of every task**, with the message the task gives, and these trailer lines on every commit:

```
Co-Authored-By: Claude Opus 5 <noreply@anthropic.com>
Claude-Session: https://claude.ai/code/session_01XLahAqTu1QqzkSSiBM7Zr7
```

---

## File Structure

### Created

| File | Responsibility |
|---|---|
| `commands/campaign.md` | The new connected command: list, create, link, mark done, archive |

### Rewritten

| File | Why |
|---|---|
| `skills/brand-knowledge-map/SKILL.md` | Its whole subject changed: four types became sixteen in three layers, Offerings and Campaigns became records, and the timezone moved onto the brand |
| `skills/visual-identity/SKILL.md` | The direction is now a `brand_identity` entry with ten fields in metadata and its canonical reference in `assets[0]`; a campaign look is a Campaign plus a `reference` |
| `skills/brand-onboarding/SKILL.md` | The write order changed, and "running it twice" now means a singleton refusal |

### Modified

| File | Change |
|---|---|
| `scripts/validate.mjs` | `TOOLS` +11; the knowledge-type exemption becomes the sixteen; check 7 rewritten; `campaign` in `CONNECTED` and in the no-`--yes` list; two new global checks |
| `skills/brand-voice/SKILL.md` | Read through `context_get(copywriter)` |
| `skills/image-prompting/SKILL.md` | Read through `context_get(art_director)` |
| `skills/posting-cadence/SKILL.md` | Timezone comes from the brand record; `brand_list` prints it |
| `skills/gate-recovery/SKILL.md` | The five refusals that are not gate failures and must be acted on |
| `skills/reply-style/SKILL.md` | Four more words that never reach the user |
| `commands/_conventions.md` | `campaign` joins the connected list and the no-`--yes` list |
| `commands/setup.md` | Foundation with `confirm`; offers become `offering_create`; timezone saved with the languages |
| `commands/brandkit.md` | The new write order; structured offerings; re-run compares against the new reads |
| `commands/knowledge.md` | Reports four Foundation slots, Business, Creative, offerings, campaigns |
| `commands/month.md` | `context_get(marketing_manager)`; writers get `context_get(copywriter)`; campaigns in step 2 |
| `commands/post.md` | `context_get(copywriter)`; "for campaign X" |
| `commands/images.md` | `context_get(art_director)` per post with its campaign |
| `commands/visuals.md` | Saves to `brand_identity`; a look "for Ramadan only" becomes a Campaign plus a `reference` |
| `commands/repurpose.md`, `commands/refresh.md` | `context_get` where copy is drafted |
| `commands/topics.md`, `commands/queue.md`, `commands/report.md` | Mention campaigns |
| `commands/help.md` | Lists `/plgn campaign` |
| `agents/plgn-brand-architect.md` | `offers` → structured `offerings[]` |
| `agents/plgn-copywriter.md` | Input gains offerings and the campaign block; output gains `offeringNames[]` |
| `agents/plgn-visual.md` | Input is the `context_get(art_director)` block; output gains `referenceUrl` |
| `agents/plgn-strategist.md` | Returns a `campaign` block when `/plgn campaign` asks |
| `.claude-plugin/plugin.json` | Version 1.4.0; `campaign` in `commands` |
| `README.md` | The command table gains `/plgn campaign` |

### Not touched

`agents/plgn-analyst.md`, `plgn-art-director.md`, `plgn-brand-guard.md`, `plgn-librarian.md`, `plgn-researcher.md`, `plgn-scheduler.md`; `skills/{content-topics,platform-specs,upsell-seam}`; every free command (`demo`, `audit`, `strategy`, `voice`, `competitors`, `calendar`) — **they call zero tools and the graph is a server thing**; `commands/{brand,library,undo}.md`; `.mcp.json`; `marketplace.json`; `docs/`.

**No new agents.** The roster is Spec 2. If a task feels like it wants one, that is the signal it has left this plan's scope.

---

## Task Map

| # | Task | Ends with |
|---|---|---|
| 1 | The map | `brand-knowledge-map` describes the graph; the validator knows the eleven tools and the sixteen types |
| 2 | The look | `visual-identity` stores a direction as `brand_identity` |
| 3 | Reading, refusing, and what not to say | `brand-voice`, `image-prompting`, `posting-cadence`, `gate-recovery`, `reply-style` |
| 4 | Onboarding | `brand-onboarding` and `/plgn setup` write in the new order |
| 5 | `/plgn campaign` | A twenty-third command, listed everywhere it has to be |
| 6 | The agent contracts | Four prompts carry the new blocks |
| 7 | The commands that draft copy | `month`, `post`, `repurpose`, `refresh` read `context_get` |
| 8 | The commands that report | `brandkit`, `knowledge`, `images`, `visuals`, `topics`, `queue`, `report` |
| 9 | 1.4.0 | Version, README, and the two global checks that can only pass now |

---
## Task 1: The map

`skills/brand-knowledge-map/SKILL.md` is the file every other file points at when it needs to know where something goes. Right now it says there are exactly four knowledge types, that audience and offers are `brand_voice` entries told apart by a metadata `kind`, and that the timezone has nowhere to live but a `Publishing` entry. All three sentences became false when Plan A merged.

**Files:**
- Rewrite: `skills/brand-knowledge-map/SKILL.md`
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Produces, for every later task: the vocabulary this plugin uses for the graph — "layer", "singleton", "offering", "campaign", "the run marker" — and the one table that says which tool writes what.
- The validator's `TOOLS` set becomes the thing every later task's tool references are checked against.

- [ ] **Step 1: Extend the validator, and watch it fail**

In `scripts/validate.mjs`:

Add the eleven names to `TOOLS`, in the sorted run they belong to:

```js
const TOOLS = new Set([
  "brand_archive", "brand_list", "brand_restore", "brand_update",
  "campaign_create", "campaign_delete", "campaign_get", "campaign_list", "campaign_update",
  "check_generation", "cloudinary_connect", "context_get", "delete_image",
  "generate_image", "generate_image_from_image",
  "hashtagset_create", "hashtagset_delete", "hashtagset_list", "hashtagset_update",
  "kie_key_set", "knowledge_add", "knowledge_delete", "knowledge_get",
  "knowledge_history", "knowledge_update",
  "list_images",
  "offering_create", "offering_delete", "offering_list", "offering_update",
  "post_create", "post_delete", "post_get", "post_list", "post_schedule", "post_update",
  "snippet_create", "snippet_delete", "snippet_get", "snippet_list", "snippet_update",
  "topic_create", "topic_delete", "topic_get", "topic_list", "topic_update",
  "upload_image_base64", "upload_image_from_url", "workspace_info",
]);
```

**There is no `offering_get`.** `offering_list` is the read, and a file that names `offering_get` must fail — which the check in section 4 now does, because `offering_` matches its prefix test. Add `offering` and `campaign` and `context` to that regex:

```js
    if (/^(brand|campaign|check|cloudinary|context|delete|generate|hashtagset|kie|knowledge|list|offering|post|snippet|topic|upload|workspace)_/.test(name)
      && !TOOLS.has(name)) {
```

Replace the `KNOWLEDGE_TYPES` exemption set with the sixteen real names, and say why it grew:

```js
// Knowledge type values are API literals that happen to match the tool-name
// shape, and two of them (`brand_identity`, `brand_positioning`) would
// otherwise be read as unknown `brand_*` tools. The four legacy names are
// NOT here: after 1.4.0 no file may write one, and section 8 fails any file
// that names one.
const KNOWLEDGE_TYPES = new Set([
  "brand_identity", "brand_positioning", "voice_tone", "audience",
  "visual_rules", "creative_rules",
  "promotion", "proof", "objection", "competitor", "market_context",
  "seo_rules", "platform_rules",
  "reference", "approved_execution", "example_post",
]);
```

Rewrite check 7's map-skill block:

```js
  const MAP = "skills/brand-knowledge-map/SKILL.md";
  if (!exists(MAP)) {
    fail(`${MAP} is missing — nothing owns where brand knowledge is stored`);
  } else {
    const body = read(MAP);
    if (!body.includes("brand_update")) {
      fail(`${MAP} must name \`brand_update\` as where banned words are written`);
    }
    // All sixteen. The map is the only file that has to list the whole
    // taxonomy; every other file names the two or three types it writes.
    for (const t of KNOWLEDGE_TYPES) {
      if (!body.includes(t)) fail(`${MAP} must list the knowledge type "${t}"`);
    }
    // The four that a brand holds exactly one of. A command that does not
    // know which types are singletons treats a refusal as a failure.
    for (const s of ["brand_identity", "brand_positioning", "voice_tone", "audience"]) {
      if (!new RegExp(`${s}[\\s\\S]{0,400}(singleton|only one|exactly one)`, "i").test(body)
        && !new RegExp(`(singleton|only one|exactly one)[\\s\\S]{0,400}${s}`, "i").test(body)) {
        fail(`${MAP} must say that a brand holds only one "${s}"`);
      }
    }
    // The timezone moved. It used to live in a `Publishing` knowledge entry
    // because the brand record had nowhere for it; the record has a column
    // now, and a command still writing it as knowledge writes a time nobody
    // schedules against.
    if (!/timezone[\s\S]{0,200}brand record|brand record[\s\S]{0,200}timezone/i.test(body)) {
      fail(`${MAP} must say the timezone lives on the brand record`);
    }
    if (!body.includes("external_post_id")) {
      fail(`${MAP} must document the run marker that makes a bulk write undoable`);
    }
    // Offerings and Campaigns are records now, not knowledge entries. A file
    // that saves an offer as a knowledge entry produces a brand whose AI
    // cannot name what it sells.
    for (const tool of ["offering_create", "campaign_create", "context_get"]) {
      if (!body.includes(tool)) fail(`${MAP} must name \`${tool}\``);
    }
  }
```

Run: `node scripts/validate.mjs`
Expected: **FAIL**, listing the sixteen types the map does not name, the four singleton sentences it does not have, the timezone sentence, and the three tools.

- [ ] **Step 2: Rewrite the map**

Replace `skills/brand-knowledge-map/SKILL.md` entirely:

````markdown
---
name: brand-knowledge-map
description: Use when saving or reading anything about a brand — deciding where a piece of brand knowledge belongs, which knowledge types exist, why a saved banned-word list is not being enforced, or why a second voice entry was refused. Covers the brand record, the three layers and sixteen types, offerings and campaigns as records, and the things that are not knowledge at all.
---

# Where a brand's knowledge lives

A brand is stored in four different places, and putting something in the wrong
one does not fail loudly. It fails quietly, months later, when a rule nobody
can find is not being applied.

Read this before saving anything about a brand.

## The four places

| Place | What it holds | Written with |
|---|---|---|
| **The brand record** | Name, languages, banned words, **timezone** | `brand_update` |
| **Knowledge entries** | What the brand knows about itself — sixteen types, three layers | `knowledge_add`, `knowledge_update` |
| **Offerings** | What it sells: a product or a service, with its benefits | `offering_create`, `offering_update` |
| **Campaigns** | One thing it is saying for a while, with dates | `campaign_create`, `campaign_update` |

Topics, snippets, hashtag sets and images are none of these. They have their
own tools and are listed at the bottom.

## Read it back with one call

`context_get` assembles all four, in a fixed order, for one role:

```
context_get(role: "copywriter")
```

Roles: `marketing_manager`, `creative_director`, `copywriter`, `art_director`,
`designer`, `all`. Each gets what it needs and not the rest — a copywriter
gets the voice and the benefits, an art director gets the picture rules and
the palette.

**Use it instead of several `knowledge_get` calls.** It is one read, it ends
with the exact entry versions it gave you, and it puts Foundation first so the
things that are never overridden are read first.

Use `knowledge_get` when you are checking or editing **one** thing:

```
knowledge_get(type: "competitor", keyword: "Acme")
```

`knowledge_history` shows every stored version of one entry, newest first, with
who changed it and why.

## The three layers

Entries are grouped by how often they change, and that grouping decides what
overrides what.

| Layer | Rule | Types |
|---|---|---|
| **Foundation** | Read first, never overridden | `brand_identity`, `brand_positioning`, `voice_tone`, `audience`, `visual_rules`, `creative_rules` |
| **Business** | What it sells, and the proof | `promotion`, `proof`, `objection`, `competitor`, `market_context`, `seo_rules`, `platform_rules` |
| **Creative** | How it says one thing, this once | `reference`, `approved_execution`, `example_post` |

Sixteen types. That is the entire list. There is no `offers` type and no
`publishing` type — those are an Offering and the brand record.

## Four of them are singletons

A brand holds **exactly one** `brand_identity`, one `brand_positioning`, one
`voice_tone` and one `audience`. A second one is refused, and the refusal
carries the id of the entry that already exists.

**That refusal is an instruction, not an error.** Update the entry it names
with `knowledge_update`. Never report it to the user as a failure, and never
try a different title to get around it — a brand with two voices has no voice.

## Foundation needs the user's yes

Every write to a Foundation type must pass `confirm: true`, and you may pass it
only **after** the user has approved the text you are about to save.

Foundation is what every future post reads. The confirmation is the difference
between a brand that agreed to how it sounds and one that was told.

## Every write is a version

An entry carries a version number. Changing its content bumps it and stores the
old text, with a note saying what changed. Linking it to a campaign does not.

So: send a short `note` on any write that changes meaning. Six months later it
is the only thing that says why.

## The trap: banned words

Banned words look like knowledge. They are not.

The server checks every post against the list on the **brand record**. A list
saved anywhere else is a note nobody reads — the post goes out with the word in
it, and the person who wrote the rule never finds out why.

Write them with `brand_update`. Read them back with `brand_list`, which returns
each brand's banned words directly.

`brand_update` replaces the whole list. To add one word, read the current list
first and send it back with the new word appended. Sending one word deletes the
rest.

## The timezone lives on the brand record

`brand_update(timezone: "Africa/Cairo")`, and `brand_list` prints it.

It used to be written into a knowledge entry, because the brand record had
nowhere to put it. It has a place now. A timezone saved as knowledge is a time
nobody schedules against.

**Never schedule against an assumed timezone without saying so in the reply.** A
time with no timezone is a time in whatever zone the server happens to think
in, and nobody finds out until a client notices their nine o'clock post arrived
at two in the morning.

## Offerings — what the brand sells

An offering is a **record**, not a knowledge entry:

```
offering_create(
  name: "Signature blend",
  kind: "product",          // product | service
  role: "hero",             // hero | supporting — only one hero at a time
  benefits: [{
    label: { "en": "Roasted weekly" },
    meanings: ["never sits in a warehouse"],
    avoidCliches: ["farm to cup"]
  }]
)
```

`meanings` and `avoidCliches` are the two fields a writer actually reads. A
benefit carrying only a label gives the writer a phrase to repeat, which is the
opposite of what it is for.

Products carry `variants` and pictures; services carry `deliverables`,
`process`, `outcome` and `engagement`. Read them back with `offering_list`
(there is no `offering_get`). Setting a second offering to `hero` demotes the
first — that is deliberate, and worth telling the user.

**Never delete an offering to retire it.** `offering_update(archived: true)`
keeps the record and takes it out of what the AI reads. Deleting unlinks it
from every post, entry and campaign that named it, and cannot be undone.

## Campaigns — one thing, for a while

```
campaign_create(
  name: "Ramadan 2027",
  status: "draft",          // draft | active | done | archived
  startsAt: "2027-02-01",
  endsAt: "2027-03-02",
  keyMessage: { "en": "One table, everyone welcome." },
  constraints: ["no ice"],
  vocabulary: ["gathering"],
  offeringIds: [...],
  topicIds: [...]
)
```

A campaign is **current** when it is `active` and today falls inside its
window. `context_get` reads the current ones unless you name one with
`campaign_id`.

A post inside a campaign carries `campaign_id` and inherits the campaign's
offerings. Its writer is given the key message, the constraints and the
vocabulary.

`campaign_get` returns one campaign with its posts, its references and its
exact counts. `campaign_list` is the overview.

## The caps

| | Free |
|---|---|
| Knowledge entries | 12 |
| Offerings | 2 |
| Campaigns in progress | 1 (`draft` + `active` only) |

Hitting one is a refusal, not an error. Say what is full and what it costs to
raise it — never retry, and never quietly drop the thing that did not fit.

## Not knowledge at all

| What | Tool |
|---|---|
| A content topic | `topic_create` |
| Reusable copy — a hook, a CTA, boilerplate | `snippet_create` |
| A set of hashtags | `hashtagset_create` |
| An image file | `upload_image_from_url` |

An image *file* is not knowledge. A **reference** — a picture worth learning
from, with a line saying what to learn — is: a `reference` entry, with the
picture attached and an `intent` in its metadata. Without the intent it is a
template, and the server refuses it.

## Marking which run made a post

A command that writes many posts at once stamps each one with the same run
marker, in `post_create`'s `external_post_id` field:

```
plgn-run-2026-09-07-1
```

That field exists for identifiers from other systems, it is not shown to the
reader, and it is the only free string a post carries. Posts have **no tags and
no metadata** — this is the whole mechanism.

`post_list` cannot filter by it. So a later command narrows by what `post_list`
*can* filter — status, the scheduled window, and now `campaign_id` — and then
confirms membership by reading the marker on each candidate. For a run of
thirty posts that is thirty cheap reads, and it is what makes a run undoable.

## Updating without losing anything

Use `knowledge_update` in place. It is partial — only the fields you send
change, and the version bumps only when the content does.

**Never delete and re-add.** If the second call fails, the entry is gone and
the brand is worse off than before it was touched. Deleting also throws away
every stored version of it. `knowledge_delete` is for an entry that should no
longer exist at all, confirmed by name.

## The old names

`brand_voice`, `competitor_data`, `seo_guidelines` and `example_article` were
the whole taxonomy until 1.4.0. The server still **accepts** them, so a plugin
that has not been updated keeps working — a `brand_voice` write is mapped to
the type its title suggests, and the reply says which type it became.

**Nothing in this plugin writes one.** They exist so that someone else's
installed copy does not break.
````

- [ ] **Step 3: Run the validator**

Run: `node scripts/validate.mjs`

Expected: **not yet green.** Section 4 will now fail on the *other* files — `skills/visual-identity/SKILL.md`, `commands/setup.md` and the rest still name `brand_voice` inside backticks, and `brand_voice` is no longer in the `KNOWLEDGE_TYPES` exemption, so it reads as an unknown `brand_*` tool.

That is the point at which a decision has to be made rather than guessed. **Make it this way:** keep the four legacy names in the exemption set for now, in a second set named for what it is, and delete that set in Task 9 when the last file stops naming them:

```js
// The four names the taxonomy replaced. Still exempted from the tool-name
// check while the rest of this plugin is converted, task by task. Task 9
// deletes this set and adds the check that no file names one at all — a
// check that can only pass once every file is clean.
const LEGACY_TYPES_BEING_REMOVED = new Set([
  "brand_voice", "competitor_data", "seo_guidelines", "example_article",
]);
```

and skip both sets in section 4's loop.

Then: `node scripts/validate.mjs` → **OK**.

- [ ] **Step 4: Read the map once more, as a stranger**

Two questions, and the answer to both must be findable in under ten seconds by someone who has never seen the graph:

1. "I have a customer testimonial. Where does it go?" → `proof`, a Business type.
2. "I saved the voice twice and it refused. What now?" → the singleton section, which says to update the id it named.

If either takes longer, the file is organised wrong. Fix the organisation, not the answer.

- [ ] **Step 5: Commit**

```bash
git add skills/brand-knowledge-map/SKILL.md scripts/validate.mjs
git commit -m "docs(map): sixteen types in three layers, offerings and campaigns as records"
```

---

## Task 2: The look

`skills/visual-identity/SKILL.md` describes a ten-field visual direction and then says to store it as a `brand_voice` entry titled "Visual direction". It now has a type of its own — `brand_identity`, a Foundation singleton — with the ten fields in `metadata` and the canonical reference in `assets[0]`.

**Files:**
- Rewrite: `skills/visual-identity/SKILL.md`
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Produces: the storage contract Tasks 4 (`brand-onboarding`), 6 (`plgn-visual`) and 8 (`/plgn visuals`, `/plgn images`) all write against — `brand_identity` with the ten fields as metadata keys, `assets[0]` as the canonical reference, and a campaign look as a Campaign plus a `reference` entry carrying an `intent`.

- [ ] **Step 1: Extend the validator, and watch it fail**

In `scripts/validate.mjs`, replace the `VIS` block's assertions with these, keeping the two that are already there:

```js
  const VIS = "skills/visual-identity/SKILL.md";
  if (!exists(VIS)) {
    fail(`${VIS} is missing — nothing owns the brand's look`);
  } else {
    const body = read(VIS);
    // Kept: the two-step remote-image path was established by running both
    // tools. WebFetch on an image URL answers "NO IMAGE VISIBLE" but saves
    // the binary locally, and Read on that saved path does see the image.
    // Without this written down, a later contributor concludes remote
    // references are impossible and quietly drops half the feature.
    if (!(body.includes("WebFetch") && body.includes("Read"))) {
      fail(`${VIS} must document the two-step remote-image path (WebFetch, then Read the saved file)`);
    }
    if (!body.includes("generate_image_from_image")) {
      fail(`${VIS} must say how the canonical reference feeds \`generate_image_from_image\``);
    }
    // New: the direction has a type of its own now. Stored anywhere else it
    // is a note the art director never reads, because context_get assembles
    // the Foundation layer by type and not by title.
    if (!body.includes("brand_identity")) {
      fail(`${VIS} must say the direction is stored as \`brand_identity\``);
    }
    if (!body.includes("assets[0]")) {
      fail(`${VIS} must say the canonical reference is \`assets[0]\``);
    }
    if (!body.includes("context_get")) {
      fail(`${VIS} must say the direction is read back with \`context_get\``);
    }
    // A look "for Ramadan only" is not the brand's look. Saved as
    // brand_identity it silently replaces the permanent one -- a singleton
    // has no second slot to fall back to.
    if (!/campaign[\s\S]{0,300}reference|reference[\s\S]{0,300}campaign/i.test(body)) {
      fail(`${VIS} must say a campaign look is a Campaign plus a \`reference\` entry`);
    }
  }
```

Run: `node scripts/validate.mjs` → FAIL on the four new assertions.

- [ ] **Step 2: Rewrite the storage half of the skill**

Keep the file's first half — "What a direction contains" (the ten fields and their table), "Reading the references", and whatever it says about disagreement between references. Those describe the *work* and did not change.

Replace everything about **where it goes** with:

````markdown
## Where a direction is stored

One entry, of type `brand_identity`. A brand holds exactly one — it is a
Foundation singleton — so there is no question of which one is current.

```
knowledge_add(
  type: "brand_identity",
  title: "Visual direction",
  content: <the direction, written out for a person to read>,
  metadata: {
    palette: [{ name: "ink", hex: "#1A1033" }, ...],
    composition: "...",
    light: "...",
    medium: "...",
    subject: "...",
    finish: "...",
    textInImage: "...",
    never: ["stock smiles", "pure white backgrounds"],
    promptPreamble: "..."
  },
  assets: [{ secure_url: ..., public_id: ... }],
  confirm: true
)
```

Three things about that call are not obvious and all three matter.

**`content` is for a person.** It is what someone reads on the Knowledge page
to understand the look. Write it as prose.

**`metadata` is for the machine.** Nine of the ten fields live here as keys.
An art director reads them back through `context_get`; a field written into
`content` instead is a field no image generation will ever use.

**`assets[0]` is the canonical reference** — the one image that best represents
the set. Upload it first with `upload_image_from_url`, then attach what that
returns. It is `assets[0]` specifically, not "one of the assets": the command
that generates a matching image reaches for the first one.

**`confirm: true`, and only after the user has said yes.** `brand_identity` is
Foundation. Show the direction, get a real yes, then save.

**A second one is refused.** The refusal carries the existing entry's id — that
is the instruction to use `knowledge_update` on it, not a failure to report.
Re-running `/plgn visuals` on a brand that already has a look updates it.

## Rules that are refusals, not descriptions

The `never` list is a refusal, and a refusal is not the same shape as a
description. Keep it in `metadata.never` on the `brand_identity` entry.

Rules that are about **pictures in general** rather than about this brand's
look — "no faces of real customers", "no competitor logos" — belong in a
separate `visual_rules` entry, also Foundation, also with a `never` list. The
split matters because a direction can be replaced when the brand is
redesigned; those refusals usually survive it.

## Reading it back before making an image

```
context_get(role: "art_director")
```

That returns the palette, the `never` list, the picture rules, and an **anchor
hint** — the one product picture a new image should sit next to. It is one
read, and it is the read to make before every generation.

Never rebuild the direction by reading entries one at a time. `context_get`
puts Foundation first, which is the order that matters: the `never` list has to
be in hand before the description is written, not applied to it afterwards.

## Making a picture that matches

`generate_image_from_image` takes the canonical reference — `assets[0]` on the
`brand_identity` entry — and a description. That pairing is what makes a new
picture look like the same brand rather than like the same words.

Use it when there is a canonical reference. Fall back to `generate_image` with
the `promptPreamble` prepended when there is not, and say in the reply that the
match will be looser.

## Seeing an image that lives at a URL

Two steps, and the first one looks like it failed:

1. **`WebFetch`** the image URL. It answers "NO IMAGE VISIBLE" — *and saves the
   binary to a local path, which it names in its output.*
2. **`Read`** that saved path. Now the image is visible.

Without both steps a contributor concludes that remote references cannot be
read at all and quietly drops half of `/plgn visuals`. This was established by
running both tools; it is not a guess about how they behave.

## A look for one campaign only

"Make everything gold for Ramadan" is not the brand's look. Saved as
`brand_identity` it **replaces** the permanent one — a singleton has no second
slot — and the brand comes out of Ramadan looking like Ramadan.

It is two things instead:

1. A **Campaign** — `campaign_create(name: "Ramadan 2027", startsAt, endsAt)`
   — which carries the dates and ends on its own.
2. A **`reference`** entry linked to it, with the picture attached and an
   `intent` in its metadata saying what to take from it.

```
knowledge_add(
  type: "reference",
  title: "Ramadan look",
  content: "...",
  campaignId: <the campaign>,
  assets: [...],
  metadata: { intent: "the warm gold and the low light, not the lanterns" }
)
```

`intent` is required — the server refuses a `reference` without one. That is
deliberate: a reference with no stated intent is a template, and a template is
how every brand's Ramadan post ends up identical.
````

- [ ] **Step 3: Run the validator**

Run: `node scripts/validate.mjs` → OK.

- [ ] **Step 4: Commit**

```bash
git add skills/visual-identity/SKILL.md scripts/validate.mjs
git commit -m "docs(look): a direction is a brand_identity entry, and a campaign look is a reference"
```

---

## Task 3: Reading, refusing, and what not to say

Five small edits to four skills, each one a rule that lives in exactly one file and is about to be relied on by six commands.

**Files:**
- Modify: `skills/brand-voice/SKILL.md`, `skills/image-prompting/SKILL.md`, `skills/posting-cadence/SKILL.md`, `skills/gate-recovery/SKILL.md`, `skills/reply-style/SKILL.md`
- Modify: `scripts/validate.mjs`

- [ ] **Step 1: Extend the validator, and watch it fail**

In `scripts/validate.mjs`, in the block that already holds the cadence and reply-style checks:

```js
    const cadence = "skills/posting-cadence/SKILL.md";
    if (exists(cadence)) {
      const body = read(cadence);
      if (!body.includes("brand-knowledge-map")) {
        fail(`${cadence} names a timezone, so it must point at where one is stored`);
      }
      // It moved. A cadence skill still describing a `Publishing` entry sends
      // every scheduling command to read a place that no longer holds it.
      if (!body.includes("brand_list")) {
        fail(`${cadence} must say the timezone comes from the brand record, printed by \`brand_list\``);
      }
      if (/Publishing/.test(body)) {
        fail(`${cadence} still describes the old \`Publishing\` knowledge entry`);
      }
    }
```

```js
    // The five refusals that are not gate failures. Each one is an
    // instruction the command must act on, and each one used to be reported
    // to the user as a failure because nothing said otherwise.
    const gr = "skills/gate-recovery/SKILL.md";
    if (exists(gr)) {
      const body = read(gr);
      for (const [what, needle] of [
        ["Foundation needing confirm", "confirm"],
        ["a singleton that already exists", "already"],
        ["an offer belonging in offering_create", "offering_create"],
        ["a publishing time needing a timezone", "brand_update"],
        ["a cap being reached", "cap"],
      ]) {
        if (!body.includes(needle)) {
          fail(`${gr} must cover ${what} (looked for "${needle}")`);
        }
      }
    }
```

```js
    // Four more internal words. Every one of them is a thing the server
    // calls something and a person calls nothing.
    if (exists(rs)) {
      const body = read(rs);
      for (const word of ["context_get", "singleton", "revision", "metadata"]) {
        if (!body.includes(word)) {
          fail(`${rs} must list "${word}" among the words that never reach the user`);
        }
      }
      // But the three layer names ARE allowed: the dashboard prints them, so
      // a reply that avoids them describes a screen the user cannot find.
      if (!/Foundation[\s\S]{0,200}(allowed|fine|are words)/i.test(body)) {
        fail(`${rs} must say the three layer names are allowed`);
      }
    }
```

Run: `node scripts/validate.mjs` → FAIL on all three groups.

- [ ] **Step 2: `brand-voice` and `image-prompting` read through `context_get`**

Both skills currently tell a caller to fetch what they need with `knowledge_get`. Replace those instructions with the one read, and say why it is not merely fewer calls:

In `skills/brand-voice/SKILL.md`:

> ## Reading the voice
>
> ```
> context_get(role: "copywriter")
> ```
>
> That is the read. It returns the brand record, then the voice and audience,
> then what the brand sells and the proof behind it, then the campaign running
> now — in that order, because the order is the priority. Foundation is read
> first because nothing overrides it.
>
> It also ends with the exact entry versions it gave you, so a reply can say
> which version of the voice a post was written against.
>
> Do not assemble this from several `knowledge_get` calls. Reading them one at
> a time gets the same words in an order nobody decided, and it drops the
> offerings and the campaign entirely.

In `skills/image-prompting/SKILL.md`, the same shape with `role: "art_director"`, and one sentence more:

> The art director's block carries the palette, the `never` list, the picture
> rules and an **anchor hint** — the one product picture a new image should sit
> beside. Read it before writing the description, not after.

- [ ] **Step 3: `posting-cadence` reads the timezone from the brand**

Replace whatever that file says about a `Publishing` knowledge entry with:

> ## Where the timezone comes from
>
> The **brand record**. `brand_list` prints it beside the brand's name and
> languages; `brand_update(timezone: "Africa/Cairo")` sets it.
>
> It used to live in a knowledge entry, because the record had nowhere to put
> it. See **brand-knowledge-map** for the four places a brand is stored.
>
> **A brand with no timezone set is a brand you must not schedule silently.**
> Say which zone you used and offer to save the right one. A time with no
> timezone is a time in whatever zone the server thinks in, and nobody finds
> out until a client notices their nine o'clock post arrived at two in the
> morning.

- [ ] **Step 4: `gate-recovery` gains the refusals**

Append a section. These are not gate failures; rewriting the copy fixes none of
them, and each one is an instruction:

````markdown
## Refusals that are instructions

Five `ERROR:` results are not about the content checks at all. Each one is the
server telling you what to do instead. Do it — do not report it as a failure,
and do not retry the same call.

**"needs confirm"** — you tried to write a Foundation entry without the user's
approval. Show the text, ask, and send `confirm: true` only after a real yes.
Never send it because the call failed once.

**"already has a …"** — the brand already holds this singleton, and the message
carries its id. Call `knowledge_update` on that id. Do not try a different
title: a brand with two voices has no voice.

**"offers belong in an offering"** — you tried to save what the brand sells as
a knowledge entry. Use `offering_create` with its benefits. An offer stored as
knowledge is an offer the writer cannot name and the art director cannot
picture.

**"a publishing time needs a timezone"** — the brand record has no timezone.
Ask which one, save it with `brand_update`, then schedule. Do not assume the
server's zone.

**"cap reached"** — the plan allows 12 knowledge entries, 2 offerings, or 1
campaign in progress, and this would be one too many. Say what is full, say
what it costs to raise it, and **say what did not get saved, by name**. Never
drop the item quietly and never retry.
````

- [ ] **Step 5: `reply-style` gains four words**

Add four rows to the "Words that must never reach the user" table:

| Never say | Say instead |
|---|---|
| `context_get`, `knowledge_history`, any tool name | nothing — the user has never seen these |
| "singleton" | "there is only one of these" |
| "revision", "version 3" | "the earlier text", or the date it changed |
| "metadata" | the field's own name — "the palette", "the intent" |

And, immediately under the table, a sentence that stops the rule going too far:

> **"Foundation", "Business" and "Creative" are allowed.** The dashboard prints
> those three words as section headings on the Knowledge page, so a reply that
> avoids them describes a screen the user cannot find. They are the one piece
> of this vocabulary a customer sees.

- [ ] **Step 6: Run the validator**

Run: `node scripts/validate.mjs` → OK.

- [ ] **Step 7: Commit**

```bash
git add skills/brand-voice/SKILL.md skills/image-prompting/SKILL.md \
        skills/posting-cadence/SKILL.md skills/gate-recovery/SKILL.md \
        skills/reply-style/SKILL.md scripts/validate.mjs
git commit -m "docs(skills): one read before writing, five refusals to act on, four words to stop saying"
```

---
## Task 4: Onboarding

`skills/brand-onboarding/SKILL.md` and `commands/setup.md` are the first thing a new customer runs. They currently write a voice, an audience, an offers entry and a visual direction as four `brand_voice` entries told apart by a metadata `kind`. Three of those four now have types of their own, and the fourth is not a knowledge entry at all.

**Files:**
- Rewrite: `skills/brand-onboarding/SKILL.md`
- Modify: `commands/setup.md`
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Consumes: the map (Task 1), the look (Task 2), the refusals (Task 3).
- Produces: the write order Task 8's `/plgn brandkit` follows and extends.

### The order, and why it is this order

```
1  brand record      languages, banned words, timezone     brand_update
2  Foundation        voice_tone, audience,                 knowledge_add(confirm: true)
                     brand_positioning — each after a yes
3  Offerings         one per product or service,           offering_create
                     benefits carrying meanings and
                     clichés to avoid
4  The look          brand_identity                        knowledge_add(confirm: true)
5  Business          competitor (one each), seo_rules,     knowledge_add
                     proof, objection, example_post
6  Topics            topic_create
7  Library           snippet_create, hashtagset_create
```

Each step is readable by the next. The offerings come before the look because
an art director's anchor hint is a product picture, and they come before the
Business entries because a `proof` about a product you have not named is a
proof about nothing.

The brand record is first because banned words are enforced from the moment
they are saved, and a run that writes twenty posts before saving them writes
twenty posts nothing checked.

- [ ] **Step 1: Extend the validator, and watch it fail**

```js
  // Onboarding writes the four Foundation singletons and the offerings. If
  // its skill or its command still names a legacy type, a fresh brand is set
  // up in the old shape and every later command reads a brand that is not
  // there.
  for (const p of ["skills/brand-onboarding/SKILL.md", "commands/setup.md"]) {
    if (!exists(p)) { fail(`missing file: ${p}`); continue; }
    const body = read(p);
    for (const t of ["voice_tone", "audience", "offering_create", "brand_update"]) {
      if (!body.includes(t)) fail(`${p} must name \`${t}\``);
    }
    if (!body.includes("confirm")) {
      fail(`${p} writes Foundation entries, so it must say when to pass \`confirm\``);
    }
    if (/timezone/i.test(body) && !body.includes("brand_update")) {
      fail(`${p} names a timezone but not \`brand_update\``);
    }
  }
```

Run: `node scripts/validate.mjs` → FAIL.

- [ ] **Step 2: Rewrite `skills/brand-onboarding/SKILL.md`**

Keep the file's existing shape — what to read from a site, how many questions to ask, how to draft rather than interrogate. Replace the storage half with:

````markdown
## The write order

Seven steps, in this order, because each one is readable by the next.

### 1. The brand record

```
brand_update(
  languages: ["en", "ar"],
  bannedWords: [...],
  timezone: "Africa/Cairo"
)
```

First, because banned words are enforced from the moment they are saved. A run
that writes posts before saving them writes posts nothing checked.

Ask for the timezone if the site does not say. "Where do you post from?" is a
question a person can answer; a wrong timezone is a nine o'clock post that
lands at two in the morning.

### 2. Foundation — three entries, three approvals

`voice_tone`, `audience`, `brand_positioning`. One `knowledge_add` each, with
`confirm: true`, and **the confirm goes after the user's yes, not before it**.

Show the drafted text. Get a real yes. Then save. Foundation is what every
future post reads.

Draft all three first and show them together — three approvals in a row is one
conversation; three write-then-ask cycles is an interrogation.

### 3. Offerings

One `offering_create` per product or service:

```
offering_create(
  name: "...",
  kind: "product",       // or "service" — ask if the site does not say
  role: "hero",          // exactly one hero; the rest are "supporting"
  benefits: [{ label: {...}, meanings: [...], avoidCliches: [...] }]
)
```

**Ask which it is when the site does not say.** "A product or a service?" takes
one line and decides which fields the record carries — variants and pictures,
or deliverables, process and outcome.

`meanings` and `avoidCliches` are what a writer actually reads. A benefit with
only a label is a phrase to repeat.

The free plan allows two. If the brand sells more, save the two that matter,
say which ones you saved and which you did not, and say what raising the cap
costs. Never drop one silently.

### 4. The look

`brand_identity`, with `confirm: true` after the yes. See **visual-identity**
for the ten fields, where each one goes, and why the canonical reference is
`assets[0]`.

Skip it rather than guess it. A direction read off fewer than three real
pictures is a preference dressed as a pattern.

### 5. Business

`competitor` — **one entry each**, not one entry listing five. A competitor you
can read on its own is a competitor a later run can update.

Then `seo_rules`, `proof`, `objection`, and any `example_post` worth imitating.
No `confirm` here: Business is not Foundation.

Twelve entries is the free cap, and Foundation has already spent three or four
of them. Count before writing, and say what you left out.

### 6. Topics, 7. Library

`topic_create`, then `snippet_create` and `hashtagset_create`. Unchanged.

## Running it twice

A brand that has already been set up refuses the second `voice_tone`,
`audience`, `brand_positioning` or `brand_identity`. The refusal carries the
existing entry's id.

**That is an instruction: update it.** `knowledge_update` on the id in the
message, with a `note` saying what changed. Never add a second entry under a
different title — a brand with two voices has no voice, and the reader gets
whichever one the assembler happened to reach first.

Offerings and Business entries have no such rule, so a second run must check
before writing: read `offering_list` and `knowledge_get` first, and update what
is there rather than adding a near-duplicate beside it.
````

- [ ] **Step 3: Update `commands/setup.md`**

Three changes, and nothing else in the file moves.

1. Wherever it saves the voice, audience and offers as `brand_voice` entries, follow the **brand-onboarding** skill's write order instead — by name, not by copying it in.

2. The offers step becomes an `offering_create` per offer, asking product-or-service when the site does not say:

> An offer is not a knowledge entry. Each one becomes an **offering** — a
> record with its own benefits — so the writer can name it and the art director
> can picture it.
>
> If the site does not make clear whether something is a product or a service,
> ask. One line, and it decides which fields the record carries.

3. The timezone is saved with the languages, on the brand record:

> Save the languages, the banned words and the **timezone** together in one
> `brand_update`. Ask for the timezone if the site does not say it — a brand
> with none cannot be scheduled without a guess, and the guess is invisible
> when it is wrong.

Keep everything about `workspace_info`, the seam-free rule, the confirmation format and the reply language exactly as it is.

- [ ] **Step 4: Run the validator, then read the two files side by side**

Run: `node scripts/validate.mjs` → OK.

Then read the skill and the command together and check one thing: **the command must not restate the skill's write order.** If the order appears twice, delete it from the command and point at the skill. Two copies of an ordered list is the failure mode this repo's rule 1 exists to prevent.

- [ ] **Step 5: Commit**

```bash
git add skills/brand-onboarding/SKILL.md commands/setup.md scripts/validate.mjs
git commit -m "docs(onboarding): the brand record first, then Foundation, then what it sells"
```

---

## Task 5: `/plgn campaign`

The one new command. A campaign is the only first-class record with no way to create one from the terminal, and `/plgn month` cannot plan inside one until it exists.

**Files:**
- Create: `commands/campaign.md`
- Modify: `commands/_conventions.md`, `commands/help.md`
- Modify: `.claude-plugin/plugin.json` (the `commands` array only — the version bump is Task 9)
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Consumes: `campaign_list`, `campaign_get`, `campaign_create`, `campaign_update`, `offering_list`, `topic_list`, `workspace_info`; `plgn-strategist`'s new `campaign` block (Task 6).
- Produces: the command `/plgn month` and `/plgn post` name in Task 7 when a subject matches a campaign.

- [ ] **Step 1: Extend the validator, and watch it fail**

In `scripts/validate.mjs`:

```js
const CONNECTED = ["setup", "brand", "campaign", "knowledge", "month", "post", "repurpose",
  "topics", "library", "images", "queue", "refresh", "report", "visuals", "brandkit", "undo"];
```

and add the no-`--yes` check, which this repo has stated in prose and never checked:

```js
// --- 5c. Commands that must never take --yes -------------------------
// _conventions rule 4 names these; nothing checked it. A `--yes` on a
// command that spends credits or writes in bulk turns one typo into a
// month of posts.
const NO_YES = ["month", "images", "visuals", "brandkit", "undo", "repurpose",
  "refresh", "library", "brand", "knowledge", "campaign"];
{
  const conv = exists("commands/_conventions.md") ? read("commands/_conventions.md") : "";
  for (const c of NO_YES) {
    if (!conv.includes(`\`${c}\``)) {
      fail(`commands/_conventions.md rule 4 does not list \`${c}\` among the commands that refuse --yes`);
    }
    const p = `commands/${c}.md`;
    if (exists(p) && /--yes/.test(read(p)) && !/not accepted|never accepted|refuses/i.test(read(p))) {
      fail(`commands/${p}: mentions --yes without saying it is refused`);
    }
  }
}
```

Run: `node scripts/validate.mjs` → FAIL: `commands/campaign.md` is not listed in `plugin.json`, is not in `help.md`, and does not exist.

- [ ] **Step 2: Write the command**

Create `commands/campaign.md`:

````markdown
---
description: Create and manage campaigns — one thing a brand is saying for a while, with dates, a key message, and the words it must and must not use. Lists what is running, creates one from a sentence, links what it sells and the topics it covers, and marks it done or archived. Supports --dry-run. Use for "start a Ramadan campaign", "what campaigns are running", or "mark the launch done".
---

# /plgn campaign

A campaign is one thing a brand is saying for a while: Ramadan, a launch, a
season. It carries dates, a key message, the words to reach for and the ones to
avoid — and every post inside it inherits them.

This command writes real data to a real account.

## 1. Check the connection

Call `workspace_info`. If it fails, print the message from **_conventions**
rule 2 and stop.

The reply also carries the campaign cap: **1 in progress on the free plan**.
Note it now — it decides what step 4 is allowed to do.

## 2. With no argument: show what is running

Call `campaign_list`.

```
Running now

  Ramadan 2027        1 Feb → 2 Mar    12 posts (4 scheduled)
  Spring menu         draft            0 posts

Finished

  Winter blend        Nov → Dec        18 posts, all published
```

Then stop and ask what they want. Do not create anything on an empty argument.

## 3. With a subject: work out what they mean

Three shapes, and they are told apart by the words, not by a flag:

- **"start a Ramadan campaign"** → create. Go to step 4.
- **"mark the launch done"**, **"archive Ramadan"** → go to step 6.
- **"what's in Ramadan"** → `campaign_get`, print it, stop. That is a read and
  needs no confirmation.

**A subject that names a campaign that already exists is never a second one.**
Match on the name, say which one you found, and ask whether they meant to
change it. Two campaigns with the same name is the failure `/plgn month`
already avoids for topics, for the same reason.

## 4. Create: draft it, then ask once

**Dates first, and ask if they are missing.** A campaign with no window is
never current, so `context_get` never reads it and no post ever inherits
anything from it. "When does it run?" is one question and it is the difference
between a record that works and one that sits there.

Read the brand with `context_get(role: "marketing_manager")`, then start
`plgn-strategist` to draft the campaign block: the key message, the
constraints, and the vocabulary. Per **_conventions** rule 6 its prompt carries
what it needs — the brand's voice, what it sells, the subject and the dates —
because it cannot read this file or any skill.

Also read `offering_list` and `topic_list`, so the links can be offered rather
than typed.

Show the whole thing:

```
Ramadan 2027
1 Feb → 2 Mar

Key message
  One table, everyone welcome.

Always
  gathering · unhurried · shared

Never
  hustle · limited time only

Covers
  Signature blend, Barista training

Topics
  Sourcing, Behind the counter

yes / edit / no
```

`--dry-run` ends here: print the plan, write nothing, say so.

**`--yes` is not accepted.** A campaign changes what every post written during
its window says.

## 5. Save

`campaign_create` with the name, the window, the key message per language, the
constraints, the vocabulary, and the offering and topic ids.

Start it as `draft` unless the user says it is running now. `draft` and
`active` both count against the cap; `done` and `archived` do not.

**If the cap refuses it**, say which campaign is holding the slot and what
finishing or archiving it would free. Never retry, and never quietly save it
without the parts that did not fit.

Then say what to do next:

```
Ramadan 2027 saved · 1 Feb → 2 Mar

Plan posts inside it with:  /plgn month "Ramadan"
```

## 6. Mark done, or archive

`campaign_update(status: ...)`.

- **done** — it ran and it is over. It stops being current, so nothing new
  inherits it, and its posts stay exactly where they are.
- **archived** — put away. Same effect, plus it leaves the default lists.

Confirm **by name**, per **_conventions** rule 3:

```
Mark "Ramadan 2027" as done?
yes / no
```

**Never offer to delete a campaign.** Deleting unlinks it from every post and
entry that named it, and cannot be undone. Archiving is what "we are finished
with this" means.

## 7. Linking

"add the blend to Ramadan" → `campaign_update(offeringIds: [...])`.

The list is **replaced**, not appended. Read the campaign first with
`campaign_get`, add to what is there, and send the whole list back. Sending one
id removes the rest.

Same for `topicIds`.

## Notes

- **No seam.** This user is already signed up.
- The plan is written by `/plgn month`, not here. This command creates the
  container; that one fills it.
- Replies follow the **reply-style** skill, including the user's language. The
  words "campaign", "draft" and "topic" are fine; "status", "id" and
  "constraints" as a field name are not.
````

- [ ] **Step 3: List it everywhere it has to be listed**

`.claude-plugin/plugin.json` — add `"./commands/campaign.md"` to the `commands` array, after `"./commands/brand.md"` so the connected commands stay in the order the README lists them.

`commands/_conventions.md` — add `campaign` to the connected list in the opening block, and to rule 4's no-`--yes` list.

`commands/help.md` — add a row. Match the surrounding table's shape exactly:

> | `/plgn campaign` | Start a campaign, see what's running, mark one done |

- [ ] **Step 4: Run the validator and the inventory**

```
node scripts/validate.mjs
claude plugin details plgn
```

The validator must exit 0. `claude plugin details` must report **23 commands** and **11 skills** and **10 agents**. If it reports skills where commands should be, `plugin.json` has lost its `commands` key — that is the failure the validator's section 3 comment describes at length.

- [ ] **Step 5: Commit**

```bash
git add commands/campaign.md commands/_conventions.md commands/help.md \
        .claude-plugin/plugin.json scripts/validate.mjs
git commit -m "feat(campaign): a command for the one thing a brand is saying for a while"
```

---

## Task 6: The agent contracts

Agents run in their own context and can read neither skills nor commands. Whatever an agent is given in its prompt is the whole world it works in. Four of the ten need a different world now.

**Files:**
- Modify: `agents/plgn-brand-architect.md`, `agents/plgn-copywriter.md`, `agents/plgn-visual.md`, `agents/plgn-strategist.md`
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Produces the four output shapes Tasks 7 and 8 read:
  - `plgn-brand-architect` → `offerings[]`, each `{ name, kind, role, benefits: [{ label, meanings, avoidCliches }] }`, with evidence
  - `plgn-copywriter` → posts, each gaining `offeringNames[]`
  - `plgn-visual` → a description, alt text, and an optional `referenceUrl`
  - `plgn-strategist` → a `campaign` block `{ keyMessage, constraints, vocabulary }` with evidence, **when asked by `/plgn campaign`**

- [ ] **Step 1: Extend the validator, and watch it fail**

```js
  // The four agents whose contract changed. An agent's output shape is read
  // by the command that started it, and a shape that drifts fails at the
  // point the command tries to save -- after the model has already done the
  // work.
  const AGENT_CONTRACTS = [
    ["plgn-brand-architect", ["offerings", "kind", "benefits", "avoidCliches"]],
    ["plgn-copywriter", ["offeringNames", "campaign"]],
    ["plgn-visual", ["referenceUrl", "anchor"]],
    ["plgn-strategist", ["campaign", "keyMessage", "vocabulary"]],
  ];
  for (const [agent, needles] of AGENT_CONTRACTS) {
    const p = `agents/${agent}.md`;
    if (!exists(p)) continue; // the AGENTS check above already fails for this
    const body = read(p);
    for (const n of needles) {
      if (!body.includes(n)) fail(`${p}: contract must name "${n}"`);
    }
  }

  // An agent must never be told to call a write tool. The command owns every
  // write -- _conventions rule 6 -- and an agent that writes is a write
  // nobody confirmed.
  const WRITE_TOOLS = [...TOOLS].filter((t) => /_(create|update|delete|add|schedule|archive|restore|set)$/.test(t));
  for (const f of ls("agents")) {
    if (!f.endsWith(".md")) continue;
    const body = read(`agents/${f}`);
    for (const t of WRITE_TOOLS) {
      if (body.includes(`\`${t}\``)) fail(`agents/${f}: agents never call write tools (\`${t}\`)`);
    }
  }
```

Run: `node scripts/validate.mjs` → FAIL on the four contracts. **If the write-tool check fails on an agent this task does not touch, stop and report it** — that is a real defect this plan has just found, and fixing it is a decision, not a step.

- [ ] **Step 2: `plgn-brand-architect` returns structured offerings**

Its `offers` output is a list of sentences today. Replace that section of its contract:

````markdown
## Offerings

Not a list of sentences. One object per thing the brand sells:

```json
{
  "offerings": [
    {
      "name": "Signature blend",
      "kind": "product",
      "role": "hero",
      "benefits": [
        {
          "label": { "en": "Roasted weekly" },
          "meanings": ["never sits in a warehouse", "you taste the roast date"],
          "avoidCliches": ["farm to cup", "artisanal"]
        }
      ],
      "evidence": "the roasting schedule on /about, and the date stamp on the bag"
    }
  ]
}
```

`kind` is `product` or `service`. **If the source does not say which, say so in
`evidence` and leave `kind` out** — the command asks the user rather than
guessing, and a service filed as a product is a record with the wrong fields.

`role` is `hero` for the one thing the brand leads with, `supporting` for the
rest. At most one hero. If nothing leads, mark them all supporting and say so.

`meanings` is what the benefit actually means in plain words. `avoidCliches` is
what a writer would reach for and must not. Both are read by whoever writes the
copy; a benefit with only a label is a phrase to repeat.

**Never invent a benefit.** Every one carries the evidence it came from.
````

- [ ] **Step 3: `plgn-copywriter` reads the campaign and names what it sells**

Its input block gains two things, and its output gains one:

````markdown
## What you are given

Alongside the voice, the banned words, the platforms and their limits:

**What the brand sells** — each offering's name, its benefits, what each
benefit means, and the clichés to avoid. Write about the thing by name. Use the
meanings; never use the clichés.

**The campaign, when there is one** — its key message, what it must not say,
and the words to reach for:

```
Campaign: Ramadan 2027
Key message: One table, everyone welcome.
Never: hustle, limited time only
Reach for: gathering, unhurried, shared
```

The key message is the one thing every post in the campaign says. Say it
differently each time; never repeat it word for word.

## What you return

Each post gains one field:

```json
{
  "platform": "linkedin",
  "caption": { "en": "..." },
  "offeringNames": ["Signature blend"]
}
```

`offeringNames` names which of the brand's offerings this post is about, using
the names exactly as they were given to you. The command turns them into
links. An empty list is a correct answer for a post about none of them.
````

- [ ] **Step 4: `plgn-visual` takes the art director's block and may name a reference**

````markdown
## What you are given

One block, assembled for the art director: the palette, the composition, the
light, the medium, the finish, what these pictures **never** contain, the
brand's picture rules, and an **anchor** — the one existing product picture
this new image should be able to sit beside.

Read the `never` list before you write anything. It is a refusal, not a
preference, and getting one wrong is what makes a generated image feel like a
different company.

## What you return

```json
{
  "description": "...",
  "alt": "...",
  "referenceUrl": "https://..."
}
```

`referenceUrl` is optional and is the **anchor's** URL — include it when this
picture should match an existing one closely, and leave it out when the
description alone is enough. The command uses its presence to decide between
generating from a description and generating from a reference image.

Do not invent a URL. The only one you may return is one you were given.
````

- [ ] **Step 5: `plgn-strategist` gains a campaign block**

Append to its contract, without touching what it already returns for positioning and topics:

````markdown
## When you are asked for a campaign

`/plgn campaign` asks for one thing more. Return it beside your usual output:

```json
{
  "campaign": {
    "keyMessage": { "en": "One table, everyone welcome." },
    "constraints": ["no ice", "no discount language"],
    "vocabulary": ["gathering", "unhurried", "shared"],
    "evidence": "the Ramadan posts from 2026 all lead on hosting, none on price"
  }
}
```

`keyMessage` is **one sentence**. It is the thing every post in the campaign
says, differently each time. If it needs two sentences it is two campaigns.

`constraints` are refusals — what must not appear while this runs.
`vocabulary` are the words to reach for. Both are read by every writer working
inside the campaign, so keep them short and concrete: "no ice" is usable, "stay
on brand" is not.

Return this **only when asked**. The other commands that start you do not want
it and will not read it.
````

- [ ] **Step 6: Run the validator**

Run: `node scripts/validate.mjs` → OK.

- [ ] **Step 7: Commit**

```bash
git add agents/plgn-brand-architect.md agents/plgn-copywriter.md \
        agents/plgn-visual.md agents/plgn-strategist.md scripts/validate.mjs
git commit -m "docs(agents): structured offerings, the campaign block, and a reference the visual may name"
```

---
## Task 7: The commands that draft copy

Four commands write words in a brand's voice: `month`, `post`, `repurpose`, `refresh`. Each of them currently assembles the brand by hand — `brand_list` plus `knowledge_get` — and each assembles a slightly different brand, because nothing said what the order should be.

**Files:**
- Modify: `commands/month.md`, `commands/post.md`, `commands/repurpose.md`, `commands/refresh.md`
- Modify: `scripts/validate.mjs`

**Interfaces:**

- Consumes: `context_get` (Task 1's map, Task 3's skills), `plgn-copywriter`'s new input and output (Task 6), `/plgn campaign` (Task 5).
- Produces: nothing later in this plan depends on it.

- [ ] **Step 1: Extend the validator, and watch it fail**

This is one of the two global checks. It can pass as soon as these four files are converted, so it lands here rather than in Task 9:

```js
// --- 7b. Every command that drafts copy reads the brand in one call ----
// Four commands write words in a brand's voice. Each used to assemble the
// brand itself from brand_list plus a couple of knowledge_get calls, and
// each assembled a slightly different brand -- one read the audience, one
// did not, none read what the brand sells. context_get is one read in a
// fixed order, and it is the order that matters: Foundation first, because
// nothing overrides it.
const DRAFTS_COPY = ["month", "post", "repurpose", "refresh"];
for (const c of DRAFTS_COPY) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p);
  if (!body.includes("context_get")) {
    fail(`commands/${c}.md drafts copy, so it must read the brand with \`context_get\``);
  }
  if (!/context_get[\s\S]{0,120}copywriter/.test(body)) {
    fail(`commands/${c}.md must pass the copywriter's own block to its writers`);
  }
}
```

Run: `node scripts/validate.mjs` → FAIL on all four.

- [ ] **Step 2: `commands/month.md`**

Four changes. Everything else in that file — the plan table, the confirmation, the run marker, the image phase, the honest report — stays exactly as it is.

**In step 1, replace the two reads with one.** The file currently says "Then call `brand_list` and `knowledge_get`." Replace with:

> Then call `context_get(role: "marketing_manager")`.
>
> That is one read and it returns the brand in a fixed order: the record — with
> the **languages** and the **timezone** this command must not guess — then the
> voice and audience, then what the brand sells, then any campaign running now.
>
> The languages are the brand's, not the user's. Someone writing to plgn in
> English may publish only in Arabic.
>
> **If the brand has no Foundation, stop and send them to `/plgn setup`.** Do
> not work a voice out from a website here. Guessing is the free layer's
> compromise; a connected user has a real profile one call away, and thirty
> posts in a guessed voice is thirty posts to redo.

**In step 2, campaigns join the look-around.** After the `topic_list` paragraph:

> **Call `campaign_list` too.** A subject that matches a campaign is planned
> *inside* it, which changes three things:
>
> - every post carries `campaign_id`
> - every post inherits the campaign's offerings
> - every writer is given the campaign's key message, the words it must not
>   use, and the words to reach for
>
> Say which campaign you are planning inside, in the plan, before anything is
> written. A month planned inside the wrong campaign inherits the wrong
> constraints thirty times.
>
> If the subject matches no campaign, that is ordinary. Plan without one and
> say so — do not offer to create one here. `/plgn campaign` does that, and
> creating a container as a side effect of filling it is how a workspace ends
> up with four half-empty campaigns.

**In step 3, the plan table gains a line:**

```
Campaign:   <name, or "none">
```

**In step 4, the writers get their own block.** Replace the paragraph about what each writer's prompt must carry:

> Per **_conventions** rule 6, each writer's prompt carries what it needs, and
> the way to build it is one call:
>
> ```
> context_get(role: "copywriter", campaign_id: <the campaign, when there is one>)
> ```
>
> That block holds the voice, the banned words, what the brand sells with each
> benefit's meanings and clichés, and — when there is a campaign — its key
> message, constraints and vocabulary. Pass it into the prompt verbatim,
> alongside the topic, the platforms, their character limits, the brand's
> languages, and how many posts to write.
>
> Agents cannot read skills or see this file. Whatever is in the prompt is the
> whole world the writer works in.

**In step 5, the saved post carries its links:**

> `post_create` also takes `campaign_id` and `offering_ids`. Set the campaign
> when the month is planned inside one, and set the offerings from each post's
> own `offeringNames` — matched against the offerings you were given, never
> invented.

- [ ] **Step 3: `commands/post.md`**

Two changes.

**The read:**

> Call `context_get(role: "copywriter")` before drafting. One read: the voice,
> the banned words, what the brand sells, and the campaign running now.

**"for campaign X":**

> If the request names a campaign — "a post for Ramadan" — call `campaign_list`,
> match it by name, and pass `campaign_id` to both `context_get` and
> `post_create`. The post then inherits that campaign's offerings, and its
> writer is given the key message it has to say differently.
>
> A name that matches no campaign is a question, not a new campaign: say what
> you found and ask. `/plgn campaign` is where one gets created.

`--yes` stays accepted here. One post is one post.

- [ ] **Step 4: `commands/repurpose.md` and `commands/refresh.md`**

One change each: wherever they read the brand before drafting, replace it with `context_get(role: "copywriter")`, and pass that block into the writing agent's prompt.

`refresh` gets one sentence more, because it rewrites posts that already exist:

> A post being refreshed may already belong to a campaign. Keep its
> `campaign_id`, and read the brand with that id so the rewrite is given the
> same key message the original was written against. A refresh that drops the
> campaign turns a campaign post into a loose one, and nothing says so.

- [ ] **Step 5: Run the validator**

Run: `node scripts/validate.mjs` → OK.

- [ ] **Step 6: Read the four together**

One question: **does any of them still describe assembling the brand from parts?** A leftover "call `knowledge_get` for the voice" beside a `context_get` is two instructions that disagree, and a model given both will follow whichever it reads last. Delete the old one.

`knowledge_get` is still correct in these files for one thing only: checking or editing a single named entry. If it appears for any other reason, it is a leftover.

- [ ] **Step 7: Commit**

```bash
git add commands/month.md commands/post.md commands/repurpose.md commands/refresh.md \
        scripts/validate.mjs
git commit -m "docs(commands): one read before drafting, and a month can be planned inside a campaign"
```

---

## Task 8: The commands that report

Seven commands that read the workspace and tell the user what is in it. Each one is now describing a smaller world than the one that exists.

**Files:**
- Modify: `commands/brandkit.md`, `commands/knowledge.md`, `commands/images.md`, `commands/visuals.md`, `commands/topics.md`, `commands/queue.md`, `commands/report.md`
- Modify: `scripts/validate.mjs`

- [ ] **Step 1: Extend the validator, and watch it fail**

```js
  // The reporting commands. Each one is checked for the single thing it
  // would otherwise silently stop covering.
  const REPORTS = [
    ["brandkit", ["offering_create", "offering_list", "brand_identity", "brand_positioning"]],
    ["knowledge", ["offering_list", "campaign_list", "knowledge_history"]],
    ["images", ["context_get"]],
    ["visuals", ["brand_identity", "campaign_create"]],
    ["queue", ["campaign"]],
    ["report", ["campaign"]],
    ["topics", ["campaign"]],
  ];
  for (const [c, needles] of REPORTS) {
    const p = `commands/${c}.md`;
    if (!exists(p)) continue;
    const body = read(p);
    for (const n of needles) {
      if (!body.includes(n)) fail(`commands/${c}.md must name "${n}"`);
    }
  }
```

Run: `node scripts/validate.mjs` → FAIL.

- [ ] **Step 2: `commands/brandkit.md`**

It learns a whole brand in one run, so it changes most.

- The passes follow **brand-onboarding**'s write order (Task 4). Point at the skill; do not restate the order.
- `plgn-brand-architect` now drafts **structured offerings** — each becomes an `offering_create`, not a knowledge entry. Ask product-or-service when the source does not say.
- `plgn-strategist`'s positioning becomes a **`brand_positioning`** entry, with `confirm: true` after the yes.
- The look goes to **`brand_identity`** — see **visual-identity** for the ten fields and `assets[0]`.
- Competitors become **one `competitor` entry each**.
- **Re-running compares against what is there**, and the three reads are now:

> Before writing anything, read what already exists:
>
> ```
> knowledge_get()        every entry, so nothing is added twice
> offering_list()        what it already sells
> campaign_list()        what it is already saying
> ```
>
> A second run **updates** rather than adds. The four Foundation singletons
> refuse a second entry anyway — that refusal is an instruction to update, see
> **gate-recovery** — but offerings and Business entries have no such rule, and
> a second run that does not read first leaves a brand with two of everything.

- Add the caps to the reported summary: 12 entries, 2 offerings. Say what was left out and what raising the cap costs.

- [ ] **Step 3: `commands/knowledge.md`**

This is the brand's health check, and its report is now four sections instead of one list:

````markdown
## What to report

Read `context_get(role: "all")`, then `offering_list` and `campaign_list`.

### Foundation — four slots

Say **fine**, **thin** or **missing** for each:

```
Foundation
  Identity        fine
  Positioning     thin — two lines, and no market named
  Voice           fine
  Audience        missing
```

"Thin" is a judgement and it must carry its reason. "Missing" is a fact.

### Business and Creative

Count them, then name what is stale or in conflict:

```
Business        7 entries
  Two competitor entries describe the same company under different names
  The SEO terms have not changed since March

Creative        3 references, 1 approved post
```

### Offerings

```
Offerings       2 · 1 without benefits
```

"1 without benefits" is the single most common gap and the one worth leading
with — a benefit-less offering gives every writer a name and nothing to say
about it.

### Campaigns

```
Campaigns       Ramadan 2027 running until 2 Mar
                Spring menu still a draft with no dates
```

A draft with no dates is never current, so nothing inherits it. Say so.

## Fixing what you find

`knowledge_update` for entries — with `confirm: true` on Foundation, after the
user's yes — and `offering_update` for offerings. One fix at a time, each one
confirmed.

**`--yes` is not accepted.** These are the brand's own words.

## Explaining a change

When something looks wrong and the user asks why, `knowledge_history` shows
every stored version of that entry, newest first, with who changed it and the
note they left. Use it to answer "when did this change?" — never to undo
something without being asked.
````

- [ ] **Step 4: `commands/images.md`**

One change: the art director's block is read **per post, with that post's campaign**.

> For each post that needs a picture, read
> `context_get(role: "art_director", campaign_id: <the post's campaign, if it has one>)`
> and pass that block into `plgn-visual`'s prompt.
>
> Per post, not once for the run: two posts in different campaigns want
> different references, and a run that reads the direction once gives them the
> same one.
>
> If `plgn-visual` returns a `referenceUrl`, call
> `generate_image_from_image` with it. Otherwise call `generate_image` with the
> description. See **visual-identity** for why the two are different.

- [ ] **Step 5: `commands/visuals.md`**

Two changes.

**Where the direction is saved:**

> Save it as **`brand_identity`** — one entry, ten fields in its metadata, the
> canonical reference uploaded first and attached as `assets[0]`, and
> `confirm: true` **after** the user has said yes. See **visual-identity**.
>
> Re-running on a brand that already has a look is refused, and the refusal
> carries the existing entry's id. Update that entry.

**A look for one campaign:**

> "Make everything gold for Ramadan" is not the brand's look. Saved as
> `brand_identity` it replaces the permanent one, and the brand comes out of
> Ramadan looking like Ramadan.
>
> It is two writes instead: `campaign_create` for the window, then a
> `reference` entry linked to it with the picture attached and an `intent`
> saying what to take from it. Ask which one they mean before saving —
> "just for Ramadan, or from now on?" is one line and it is not recoverable
> afterwards.

- [ ] **Step 6: `topics`, `queue` and `report`**

One paragraph each, no restructuring.

`topics` — a topic can belong to a campaign, and that changes what "needs more posts" means:

> A topic inside a running campaign is not the same as a loose one. Say which
> campaign a topic belongs to, and count its posts inside the campaign's window
> rather than over all time — a topic with forty posts from last year and none
> this month is a gap, not a surplus.

`queue` — the queue can be read one campaign at a time:

> `post_list` filters by `campaign_id`. When the user names a campaign, narrow
> to it and say so. When they do not, group what is blocked by campaign, so
> "the Ramadan posts are the ones stuck" is visible without counting.

`report` — the report says how the campaign held, not only how the topics did:

> If a campaign ran in the period, report it on its own line: how many of its
> posts went out, how many are still drafts, and whether it is still running.
> A campaign that ended with half its posts unpublished is the single most
> useful thing this command can say.

- [ ] **Step 7: Run the validator**

Run: `node scripts/validate.mjs` → OK.

- [ ] **Step 8: Commit**

```bash
git add commands/brandkit.md commands/knowledge.md commands/images.md \
        commands/visuals.md commands/topics.md commands/queue.md commands/report.md \
        scripts/validate.mjs
git commit -m "docs(commands): report the whole graph — Foundation slots, offerings, campaigns"
```

---

## Task 9: 1.4.0

The version, the README, and the one check that could not pass until now.

**Files:**
- Modify: `.claude-plugin/plugin.json`
- Modify: `README.md`
- Modify: `scripts/validate.mjs`

- [ ] **Step 1: Add the check that no file writes an old name**

Delete `LEGACY_TYPES_BEING_REMOVED` (Task 1 added it as scaffolding) and add section 8:

```js
// --- 8. No file writes a type name the taxonomy replaced --------------
// `brand_voice`, `competitor_data`, `seo_guidelines` and `example_article`
// were the whole taxonomy until 1.4.0. The server still ACCEPTS them, so an
// installed 1.3.0 keeps working -- that is what the aliases are for. But a
// file in THIS plugin naming one is a file that writes into the old shape,
// and a brand set up that way holds a voice `context_get` reads as
// something else.
//
// The map skill is the one exemption: it explains that the names exist and
// that nothing here writes them, so it necessarily names all four.
const REPLACED_TYPES = ["brand_voice", "competitor_data", "seo_guidelines", "example_article"];
{
  const EXEMPT = new Set(["skills/brand-knowledge-map/SKILL.md"]);
  for (const p of CONTENT) {
    if (EXEMPT.has(p)) continue;
    const body = read(p);
    for (const t of REPLACED_TYPES) {
      if (body.includes(t)) {
        fail(`${p}: names the replaced knowledge type "${t}" — see skills/brand-knowledge-map`);
      }
    }
  }
  // Guards the guard: if the map stopped naming them, this whole section
  // would pass over a plugin that had quietly lost the explanation.
  const map = exists("skills/brand-knowledge-map/SKILL.md")
    ? read("skills/brand-knowledge-map/SKILL.md")
    : "";
  for (const t of REPLACED_TYPES) {
    if (!map.includes(t)) {
      fail(`skills/brand-knowledge-map/SKILL.md must still explain that "${t}" is a replaced name`);
    }
  }
}
```

Run: `node scripts/validate.mjs`

**Expect it to fail, and expect that to be useful.** It lists every file Tasks 1–8 missed. Fix each one where it is — a `brand_voice` still sitting in `commands/queue.md` is a real leftover, not a false positive. If a file genuinely needs to name one for the same reason the map does, say so in the report and add it to `EXEMPT` deliberately; do not widen the check.

- [ ] **Step 2: The version**

`.claude-plugin/plugin.json`:

```json
  "version": "1.4.0",
```

A minor bump: new commands and new behaviour, nothing removed. An installed 1.3.0 keeps working against the new server through the legacy aliases, which is what makes this minor rather than major.

Check `marketplace.json` for a version too. If it carries one, it moves with this; if it does not, leave it alone.

- [ ] **Step 3: The README**

One row in the connected table, after `/plgn brandkit`:

> | `/plgn campaign` | Start a campaign — one thing you're saying for a while, with dates |

And one paragraph in "Getting started", after the `brandkit` paragraph:

> Running something with a start and an end — Ramadan, a launch, a season? Make
> it a campaign with `/plgn campaign`, then plan inside it with
> `/plgn month "Ramadan"`. Every post in the campaign then says the same one
> thing, differently, and stops saying it when the campaign ends.

Do **not** rewrite the README's flagship example or its free/connected table. The graph did not change what the plugin is for.

- [ ] **Step 4: The whole check**

```
node scripts/validate.mjs
claude plugin details plgn
```

- Validator exits 0.
- `claude plugin details` reports **23 commands**, **11 skills**, **10 agents**. Anything else, read the validator's section 3 comment: an `agents` key in `plugin.json` suppresses agent discovery entirely, and a missing `commands` key makes every command load as a skill.

- [ ] **Step 5: Read the diff as one change**

`git diff main --stat`, then read the whole diff. Three questions:

1. **Does any rule now live in two files?** The commands point at skills by name. A skill's text copied into a command is the failure mode rule 1 of `_conventions` exists to prevent, and this plan edited both layers.
2. **Does any file tell the user something the reply-style skill forbids?** The four new banned words landed in Task 3; the commands were edited in Tasks 7 and 8. Search the diff for `context_get`, `singleton`, `revision` and `metadata` appearing inside something a command *prints* rather than something it *calls*.
3. **Is there an instruction that contradicts another?** The most likely place is a command that reads `context_get` in one step and `knowledge_get` for the voice in another.

- [ ] **Step 6: Commit**

```bash
git add .claude-plugin/plugin.json README.md scripts/validate.mjs
git commit -m "chore: 1.4.0 — the knowledge graph, offerings, campaigns"
```

---

## Finishing Plan C

### Definition of done

- `node scripts/validate.mjs` exits 0.
- `claude plugin details plgn` reports 23 commands, 11 skills, 10 agents.
- `.claude-plugin/plugin.json` says `1.4.0` and lists `./commands/campaign.md`.
- No file outside `skills/brand-knowledge-map/SKILL.md` names `brand_voice`, `competitor_data`, `seo_guidelines` or `example_article`.
- Every command that drafts copy reads `context_get`.

### What waits for the deploy

Everything above can be done, checked and merged offline. Three things cannot, because they need a live server with the graph deployed and the migration committed:

1. **`/plgn brandkit --dry-run`, `/plgn campaign --dry-run` and `/plgn month --dry-run` against a live brand.** A dry run writes nothing but it does *read*, so it exercises `context_get`, `offering_list` and `campaign_list` against real data — which is the only way to find out whether the blocks these commands pass to agents are the shape they expect.
2. **The **installed 1.3.0** plugin's `/plgn setup` against the new server, on a scratch brand.** This is the compatibility test that matters: the legacy aliases have to carry an old plugin through, and the only way to know is to run one. Do it on a brand you are willing to throw away.
3. **Publishing.** Spec §12.1 puts it sixth: deploy plgn → migrate → the pricing row → *then* publish 1.4.0. Publishing before the server has the tools means every connected command in the new version fails on a tool the server does not have.

Until then: merge the branch, tag it, and hold the publish.

### After the branch is green

Use `superpowers:finishing-a-development-branch`. The base is `main`.

---

## Self-review

**Spec §10 coverage:**

| Spec | Task |
|---|---|
| §10.1 `brand-knowledge-map` rewritten | 1 |
| §10.1 `visual-identity` | 2 |
| §10.1 `brand-onboarding` | 4 |
| §10.1 `brand-voice`, `image-prompting` | 3 |
| §10.1 `posting-cadence` | 3 |
| §10.1 `gate-recovery` | 3 |
| §10.1 `reply-style` | 3 |
| §10.2 `setup` | 4 |
| §10.2 `brandkit` | 8 |
| §10.2 `knowledge` | 8 |
| §10.2 `month` | 7 |
| §10.2 `post` | 7 |
| §10.2 `images` | 8 |
| §10.2 `visuals` | 8 |
| §10.2 `repurpose`, `refresh` | 7 |
| §10.2 `topics`, `queue`, `report` | 8 |
| §10.2 **`campaign`** (new, connected, no `--yes`, in `_conventions`, `help`, README, `plugin.json`) | 5 |
| §10.3 four agent contracts | 6 |
| §10.4 validator — `TOOLS` +11 | 1 |
| §10.4 validator — the sixteen-name exemption | 1 |
| §10.4 validator — check 7 | 1 |
| §10.4 validator — `campaign` in `CONNECTED` and no-`--yes` | 5 |
| §10.4 validator — no command writes an old type name | 9 |
| §10.4 validator — every copy-drafting command reads `context_get` | 7 |
| §10.4 `plugin.json` 1.4.0, README command table | 9 |

**Ordering constraints:**

- **1 first.** It defines the vocabulary and the `TOOLS` set every later task's tool references are checked against.
- **2 before 4 and 8.** Onboarding and `/plgn visuals` both write `brand_identity`, and the storage contract lives in the look skill.
- **3 before 7 and 8.** Six commands lean on `context_get`, the refusals and the banned words.
- **5 before 7.** `/plgn month` names `/plgn campaign` as where a campaign gets created.
- **6 before 7 and 8.** The commands pass blocks the agents' contracts describe.
- **9 last, necessarily.** Its check can only pass once every file is clean.

**Two things a reviewer should push on:**

1. **The validator's write-tool check (Task 6, Step 1) may fail on an agent this plan does not touch.** That would be a real defect found by this plan — an agent told to call a write tool is a write nobody confirmed. The step says to stop and report it rather than fix it inline, because deciding what such an agent should do instead is a design question, not a step.
2. **The `NO_YES` check (Task 5) is new and asserts something `_conventions` has only ever stated in prose.** If it fails on a command this plan does not touch, that command has been accepting `--yes` against the stated rule for some time. Same handling: report it, do not quietly change either the command or the check.

**Placeholder scan:** none. Two skills are given in full (`brand-knowledge-map`, the storage half of `visual-identity`), one command is given in full (`campaign`), and the rest are precise replacements quoted against the text they replace. Where a step says "keep the file's existing shape", it names exactly which sections stay and which are replaced.

**One thing this plan cannot check and a human must:** whether the rewritten skills are still *readable*. The validator can prove that `brand-knowledge-map` names all sixteen types; it cannot prove that a model reading it under pressure finds the right one. Task 1 Step 4 is the substitute — two questions, answered in under ten seconds — and it is the only step in this plan whose pass condition is a judgement.
