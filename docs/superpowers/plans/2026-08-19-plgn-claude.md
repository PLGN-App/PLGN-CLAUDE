# plgn-claude Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public Claude Code plugin that gives anyone free marketing drafting with no account, and converts them by persisting, validating, illustrating, and scheduling that work into a real plgn workspace via 38 MCP tools.

**Architecture:** Four layers — `commands/` (user entry points, own confirmation), `agents/` (parallel workers with fresh context), `skills/` (shared know-how imported by many commands), and the plgn MCP server (validation, persistence, tenant scoping). All plugin content is Markdown with YAML frontmatter; no runtime code ships. A dev-time Node validator enforces cross-file consistency.

**Tech Stack:** Markdown + YAML frontmatter, JSON manifests, Node 24 (dev-time validation only, zero dependencies), Claude Code plugin format, plgn MCP over HTTP/OAuth.

**Spec:** `docs/superpowers/specs/2026-08-19-plgn-claude-plugin-design.md`

## Global Constraints

- **Plugin name:** `plgn`. **Repo:** `plgn-claude`. **Version:** starts `0.1.0`.
- **MCP endpoint:** `https://useplgn.com/api/mcp`, `"type": "http"`. Never any other URL.
- **License:** MIT.
- **Every `commands/*.md`** requires YAML frontmatter with a `description:` key. The filename is the command name; there is no `name:` key.
- **Every `agents/*.md`** requires YAML frontmatter with `name:` and `description:` keys.
- **Every `skills/<name>/SKILL.md`** requires YAML frontmatter with `name:` and `description:` keys.
- **`_conventions.md` is not a command.** It lives in `commands/` but is excluded from the manifest and from frontmatter checks.
- **The 38 valid MCP tool names** — any other tool name referenced in any file is a bug:
  `brand_archive`, `brand_list`, `brand_restore`, `brand_update`, `check_generation`, `cloudinary_connect`, `delete_image`, `generate_image`, `generate_image_from_image`, `hashtagset_create`, `hashtagset_delete`, `hashtagset_list`, `hashtagset_update`, `kie_key_set`, `knowledge_add`, `knowledge_delete`, `knowledge_get`, `knowledge_update`, `list_images`, `post_create`, `post_delete`, `post_get`, `post_list`, `post_schedule`, `post_update`, `snippet_create`, `snippet_delete`, `snippet_get`, `snippet_list`, `snippet_update`, `topic_create`, `topic_delete`, `topic_get`, `topic_list`, `topic_update`, `upload_image_base64`, `upload_image_from_url`, `workspace_info`
- **Free commands** (`demo`, `audit`, `strategy`, `voice`, `competitors`, `calendar`) must call **zero** MCP tools and must end with the upsell seam.
- **Connected commands** (`setup`, `brand`, `knowledge`, `month`, `post`, `repurpose`, `topics`, `library`, `images`, `review`, `refresh`, `report`) must call `workspace_info` for preflight and must **never** contain the upsell seam.
- **Never reimplement server validation.** Character caps and banned words are enforced by `runGate` server-side. Files describe drafting and recovery, never policing.
- **Never handle credentials.** No file may instruct prompting for, storing, or forwarding a token or API key.
- **The dev validator is not part of the plugin runtime surface.** Spec decision D6 (no `scripts/` layer) governs what ships to users; `scripts/validate.mjs` is repo tooling and is excluded from the plugin manifest.

---

## File Structure

```
plgn-claude/
├── .claude-plugin/
│   ├── plugin.json           # manifest: commands, agents, skills
│   └── marketplace.json      # makes the repo installable
├── .mcp.json                 # plgn OAuth connection
├── scripts/
│   └── validate.mjs          # dev-time consistency checks (not shipped behaviour)
├── commands/
│   ├── _conventions.md       # shared rules, referenced by every command
│   ├── demo.md    audit.md    strategy.md   voice.md
│   ├── competitors.md        calendar.md
│   ├── setup.md   brand.md    knowledge.md  month.md
│   ├── post.md    repurpose.md topics.md    library.md
│   ├── images.md  review.md   refresh.md    report.md
├── agents/
│   ├── plgn-researcher.md    plgn-strategist.md   plgn-copywriter.md
│   ├── plgn-visual.md        plgn-brand-guard.md  plgn-scheduler.md
│   └── plgn-analyst.md
├── skills/
│   ├── upsell-seam/SKILL.md        gate-recovery/SKILL.md
│   ├── platform-specs/SKILL.md     brand-voice/SKILL.md
│   ├── content-pillars/SKILL.md    image-prompting/SKILL.md
│   └── posting-cadence/SKILL.md
├── LICENSE
└── README.md
```

**Responsibility split:** `commands/` own user interaction and confirmation gates. `agents/` own parallel drafting and return findings only. `skills/` own facts and procedures reused across commands — each fact lives in exactly one skill file so the 18 commands cannot drift apart.

---

## Wave 1 — Installable and demo-able

### Task 1: Plugin skeleton and the validator

**Files:**
- Create: `.claude-plugin/plugin.json`
- Create: `.claude-plugin/marketplace.json`
- Create: `.mcp.json`
- Create: `LICENSE`
- Create: `scripts/validate.mjs`

**Interfaces:**
- Consumes: nothing.
- Produces: `node scripts/validate.mjs` — exits `0` on success, exits `1` and prints one `FAIL: <message>` line per problem. Every later task runs this as its test. The manifest keys `commands`, `agents`, `skills` in `plugin.json` are arrays of repo-relative paths beginning `./`.

- [ ] **Step 1: Write the failing test — the validator itself**

Create `scripts/validate.mjs`:

```javascript
#!/usr/bin/env node
// Dev-time consistency checks for the plgn-claude plugin.
// Not part of the shipped plugin surface (see spec D6).
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const fails = [];
const fail = (m) => fails.push(m);

const TOOLS = new Set([
  "brand_archive","brand_list","brand_restore","brand_update","check_generation",
  "cloudinary_connect","delete_image","generate_image","generate_image_from_image",
  "hashtagset_create","hashtagset_delete","hashtagset_list","hashtagset_update",
  "kie_key_set","knowledge_add","knowledge_delete","knowledge_get","knowledge_update",
  "list_images","post_create","post_delete","post_get","post_list","post_schedule",
  "post_update","snippet_create","snippet_delete","snippet_get","snippet_list",
  "snippet_update","topic_create","topic_delete","topic_get","topic_list",
  "topic_update","upload_image_base64","upload_image_from_url","workspace_info",
]);

const FREE = ["demo","audit","strategy","voice","competitors","calendar"];
const CONNECTED = ["setup","brand","knowledge","month","post","repurpose",
  "topics","library","images","review","refresh","report"];

const read = (p) => readFileSync(join(ROOT, p), "utf8");
const exists = (p) => existsSync(join(ROOT, p));
const ls = (p) => (exists(p) ? readdirSync(join(ROOT, p)) : []);

// --- 1. JSON files parse, and hold the required values -----------------
let manifest = null;
for (const p of [".claude-plugin/plugin.json", ".claude-plugin/marketplace.json", ".mcp.json"]) {
  if (!exists(p)) { fail(`missing file: ${p}`); continue; }
  try {
    const json = JSON.parse(read(p));
    if (p.endsWith("plugin.json")) manifest = json;
    if (p === ".mcp.json") {
      const url = json?.mcpServers?.plgn?.url;
      if (url !== "https://useplgn.com/api/mcp") fail(`.mcp.json plgn url is "${url}"`);
      if (json?.mcpServers?.plgn?.type !== "http") fail(".mcp.json plgn type must be http");
    }
  } catch (e) { fail(`invalid JSON in ${p}: ${e.message}`); }
}
if (manifest && manifest.name !== "plgn") fail(`plugin.json name is "${manifest?.name}", expected "plgn"`);

// --- 2. Frontmatter present and correct --------------------------------
const frontmatter = (body) => {
  const m = body.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!m) return null;
  const out = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([a-zA-Z_]+):\s*(.*)$/);
    if (kv) out[kv[1]] = kv[2].trim();
  }
  return out;
};

for (const f of ls("commands")) {
  if (!f.endsWith(".md") || f === "_conventions.md") continue;
  const fm = frontmatter(read(`commands/${f}`));
  if (!fm) { fail(`commands/${f}: no YAML frontmatter`); continue; }
  if (!fm.description) fail(`commands/${f}: frontmatter needs a description`);
  if (fm.name) fail(`commands/${f}: commands must not declare a name key`);
}
for (const f of ls("agents")) {
  if (!f.endsWith(".md")) continue;
  const fm = frontmatter(read(`agents/${f}`));
  if (!fm) { fail(`agents/${f}: no YAML frontmatter`); continue; }
  if (!fm.name) fail(`agents/${f}: frontmatter needs a name`);
  if (!fm.description) fail(`agents/${f}: frontmatter needs a description`);
  if (fm.name && fm.name !== f.replace(/\.md$/, "")) fail(`agents/${f}: name "${fm.name}" != filename`);
}
for (const d of ls("skills")) {
  const p = `skills/${d}/SKILL.md`;
  if (!exists(p)) { fail(`skills/${d}: missing SKILL.md`); continue; }
  const fm = frontmatter(read(p));
  if (!fm) { fail(`${p}: no YAML frontmatter`); continue; }
  if (!fm.name) fail(`${p}: frontmatter needs a name`);
  if (!fm.description) fail(`${p}: frontmatter needs a description`);
  if (fm.name && fm.name !== d) fail(`${p}: name "${fm.name}" != directory "${d}"`);
}

// --- 3. Manifest and disk agree ----------------------------------------
if (manifest) {
  for (const key of ["commands", "agents", "skills"]) {
    for (const rel of manifest[key] ?? []) {
      const clean = rel.replace(/^\.\//, "");
      if (!exists(clean)) fail(`plugin.json ${key} lists missing path: ${rel}`);
    }
  }
  const listed = new Set((manifest.commands ?? []).map((r) => r.replace(/^\.\/commands\//, "")));
  for (const f of ls("commands")) {
    if (f.endsWith(".md") && f !== "_conventions.md" && !listed.has(f)) {
      fail(`commands/${f} exists on disk but is not in plugin.json`);
    }
  }
  const listedAgents = new Set((manifest.agents ?? []).map((r) => r.replace(/^\.\/agents\//, "")));
  for (const f of ls("agents")) {
    if (f.endsWith(".md") && !listedAgents.has(f)) fail(`agents/${f} is not in plugin.json`);
  }
}

// --- 4. Every referenced MCP tool name is real -------------------------
const walk = (dir) => {
  const out = [];
  if (!exists(dir)) return out;
  for (const e of readdirSync(join(ROOT, dir))) {
    const rel = `${dir}/${e}`;
    if (statSync(join(ROOT, rel)).isDirectory()) out.push(...walk(rel));
    else if (rel.endsWith(".md")) out.push(rel);
  }
  return out;
};
const CONTENT = [...walk("commands"), ...walk("agents"), ...walk("skills")];
for (const p of CONTENT) {
  const body = read(p);
  for (const m of body.matchAll(/`([a-z]+_[a-z0-9_]+)`/g)) {
    const name = m[1];
    // only judge names that look like plgn tools: a known prefix
    if (/^(brand|post|topic|snippet|hashtagset|knowledge|workspace|list|delete|upload|generate|check|cloudinary|kie)_/.test(name)
        && !TOOLS.has(name)) {
      fail(`${p}: unknown MCP tool name \`${name}\``);
    }
  }
}

// --- 5. The free/connected contract ------------------------------------
// The seam lives in exactly one place: skills/upsell-seam. Commands invoke it
// by name rather than copying its text, so the contract to check is which
// commands reference the skill — not whether a URL substring appears. (A
// connected command may legitimately mention useplgn.com when telling an
// unconnected user where to sign up.)
const SEAM_SKILL = "upsell-seam";
for (const c of FREE) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p);
  if (!body.includes(SEAM_SKILL)) fail(`${p}: free command must close via the ${SEAM_SKILL} skill`);
  for (const t of TOOLS) {
    if (body.includes(`\`${t}\``)) fail(`${p}: free command must not reference MCP tool \`${t}\``);
  }
}
for (const c of CONNECTED) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p);
  if (!body.includes("workspace_info")) fail(`${p}: connected command must preflight with workspace_info`);
  if (body.includes(SEAM_SKILL)) fail(`${p}: connected command must not use the ${SEAM_SKILL} skill`);
}
// The seam text itself must exist, once, in the skill that owns it.
if (!exists(`skills/${SEAM_SKILL}/SKILL.md`)) {
  fail(`skills/${SEAM_SKILL}/SKILL.md is missing — nothing owns the seam text`);
} else if (!read(`skills/${SEAM_SKILL}/SKILL.md`).includes("useplgn.com")) {
  fail(`skills/${SEAM_SKILL}/SKILL.md must contain the useplgn.com link`);
}

// --- 6. No credential handling ----------------------------------------
for (const p of CONTENT) {
  const body = read(p).toLowerCase();
  for (const phrase of ["ask the user for their api key", "paste your token", "store the token"]) {
    if (body.includes(phrase)) fail(`${p}: must not handle credentials ("${phrase}")`);
  }
}

if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`);
  console.error(`\n${fails.length} problem(s).`);
  process.exit(1);
}
console.log("OK: plugin structure valid.");
```

- [ ] **Step 2: Run it to verify it fails**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: FAIL lines for the three missing JSON files, exit code 1.

- [ ] **Step 3: Write the manifests**

`.claude-plugin/plugin.json` — arrays start empty and each later task appends to them:

```json
{
  "$schema": "https://anthropic.com/claude-code/plugin.schema.json",
  "name": "plgn",
  "version": "0.1.0",
  "description": "Marketing content that ships: draft a month of on-brand posts from your terminal, then persist, validate, illustrate, and schedule them into a real plgn workspace.",
  "author": {
    "name": "Ahmed Hashim",
    "email": "ah.abolaban@gmail.com"
  },
  "license": "MIT",
  "keywords": ["marketing", "social-media", "content", "mcp", "plgn", "scheduling"],
  "commands": [],
  "agents": [],
  "skills": []
}
```

`.claude-plugin/marketplace.json`:

```json
{
  "name": "plgn",
  "owner": {
    "name": "Ahmed Hashim"
  },
  "plugins": [
    {
      "name": "plgn",
      "source": "./",
      "description": "Marketing content that ships — free drafting in your terminal, real scheduling in your plgn workspace."
    }
  ]
}
```

`.mcp.json`:

```json
{
  "mcpServers": {
    "plgn": {
      "type": "http",
      "url": "https://useplgn.com/api/mcp",
      "note": "Uses OAuth — you'll be prompted to authorize on first use."
    }
  }
}
```

`LICENSE`: the standard MIT License text, copyright line `Copyright (c) 2026 Ahmed Hashim`.

- [ ] **Step 4: Run the validator to verify it passes**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.`, exit code 0.

- [ ] **Step 5: Verify Claude Code actually loads the plugin**

```bash
claude plugin marketplace add /c/Users/LENOVO/Desktop/plgn-claude
claude plugin install plgn@plgn
claude plugin details plgn
```
Expected: `details` prints a component inventory naming the plugin `plgn`. Zero commands/agents/skills at this stage is correct.

- [ ] **Step 6: Commit**

```bash
git add .claude-plugin .mcp.json LICENSE scripts
git commit -m "feat: plugin skeleton, MCP connection, and structure validator"
```

---

### Task 2: Conventions and the two load-bearing skills

**Files:**
- Create: `commands/_conventions.md`
- Create: `skills/upsell-seam/SKILL.md`
- Create: `skills/gate-recovery/SKILL.md`
- Modify: `.claude-plugin/plugin.json` (append the two skills)

**Interfaces:**
- Consumes: Task 1's validator.
- Produces: the verbatim seam text (below), reused unchanged by every free command; and the `ERROR:` recovery procedure every write command follows. Later tasks reference these by name, never by copying their reasoning.

- [ ] **Step 1: Write `skills/upsell-seam/SKILL.md`**

Frontmatter, then the seam. The closing paragraph is verbatim and must not be reworded per command:

```markdown
---
name: upsell-seam
description: Use when closing any free plgn command (demo, audit, strategy, voice, competitors, calendar) to convert a drafting result into a reason to connect plgn. Defines the exact closing message so it stays identical across every free command.
---

# The upsell seam

Free commands end where the work gets expensive to do by hand: persisting,
validating, illustrating, and scheduling. Deliver the value first, then name
the limitation the product removes. Never apologise for the free layer and
never oversell the paid one.

## The closing block

Print this after the deliverable, separated by a horizontal rule. Substitute
only the bracketed count and noun to match what was just produced.

> **[7 posts] are text in your terminal.** Connect plgn and the same command
> writes them into a real workspace — checked against your banned-word list,
> images generated, scheduled across the month.
>
> → **useplgn.com** — then run `/plgn setup`

## Rules

- Exactly once per command run, at the very end.
- Never in a connected command. A connected user has already converted;
  selling to them is noise.
- Never mid-output. It interrupts the deliverable the user asked for.
- Do not invent pricing, trial length, or feature claims. Link only.
```

- [ ] **Step 2: Write `skills/gate-recovery/SKILL.md`**

```markdown
---
name: gate-recovery
description: Use when any plgn MCP tool returns a string starting with "ERROR:" — especially post_create, post_update, or post_schedule failing the server validation gate on character caps or banned words. Defines revise-and-retry behaviour so commands recover instead of reporting failure.
---

# Recovering from the validation gate

plgn enforces per-platform character caps and the brand's banned-word list
**server-side**. A post cannot become scheduled or published while a check
fails. This is a guarantee, not an obstacle: it means drafts can be bold,
because bad ones cannot escape.

Never reimplement these checks. Never describe them to the user as the
plugin's protection — they are the server's.

## Procedure

1. **Read the error.** Tool handlers return a plain `ERROR: <reason>` string,
   never a stack trace. The reason names the failing check.
2. **Revise the draft for that reason only.**
   - Over the character cap → tighten the copy. Cut qualifiers and repeated
     ideas first. Never truncate mid-sentence or drop the call to action.
   - Banned word → replace the word, preserving the sentence's intent. If the
     whole idea depends on the banned word, change the idea.
3. **Retry once.**
4. **On a second failure, stop retrying.** Leave the post as a draft, and
   record it for the run's report as needing a human.

## Reporting

Report gate activity as a fact, not a fault:

> 2 posts were revised to fit LinkedIn's cap. 1 post is left as a draft —
> "growth hack" is on your banned-word list and the post's point depends on it.

Never surface a raw `ERROR:` string to the user, and never report the whole
run as failed because individual posts needed revision.
```

- [ ] **Step 3: Write `commands/_conventions.md`**

No frontmatter — it is not a command. Required sections, in order:

1. **Preflight** — connected commands call `workspace_info` first; on failure show `useplgn.com` and stop. Commands needing brand voice also call `knowledge_get` and route to `/plgn setup` when empty. Never half-run.
2. **Confirm before writing** — any command that creates or schedules presents its plan and waits for an explicit yes. Reading is free; thirty posts is not.
3. **Gate recovery** — defer to the `gate-recovery` skill; never restate its rules.
4. **The seam** — free commands only; defer to the `upsell-seam` skill.
5. **Never handle credentials** — OAuth belongs to plgn. Never ask for, store, or forward a token or key.
6. **Output shape** — lead with the deliverable, not the process. No tool-call logs. Report counts, then exceptions.

- [ ] **Step 4: Append both skills to the manifest**

In `.claude-plugin/plugin.json`, set:

```json
  "skills": [
    "./skills/upsell-seam",
    "./skills/gate-recovery"
  ]
```

- [ ] **Step 5: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.`

- [ ] **Step 6: Commit**

```bash
git add commands/_conventions.md skills .claude-plugin/plugin.json
git commit -m "feat: conventions, upsell-seam and gate-recovery skills"
```

---

### Task 3: Platform and voice skills

**Files:**
- Create: `skills/platform-specs/SKILL.md`
- Create: `skills/brand-voice/SKILL.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: Task 1 validator, Task 2 conventions.
- Produces: the per-platform format table every drafting agent and command reads, and the procedure for applying a stored brand voice to new copy. `plgn-copywriter` (Task 5) depends on both.

- [ ] **Step 1: Write `skills/platform-specs/SKILL.md`**

Frontmatter `name: platform-specs`, description naming the trigger ("use when drafting or revising a post for a specific platform"). Body must contain:

- A table of LinkedIn, X, Instagram, Facebook, TikTok with: hard character cap, practical target length, hook style, hashtag convention, link behaviour.
- A **"platform-native, not cross-posted"** section: the same idea must be re-expressed per platform, never pasted. Give a worked example of one idea in three platform voices.
- An explicit note: caps here are for *drafting guidance*; the server's gate is authoritative. Where they disagree, the server wins.

- [ ] **Step 2: Write `skills/brand-voice/SKILL.md`**

Frontmatter `name: brand-voice`. Body must contain:

- How to read a stored voice: call `knowledge_get`, expect voice, audience, offers, banned words.
- How to apply it: match sentence rhythm and vocabulary, not just topic; preserve the brand's stance on formality, humour, and jargon.
- **When no stored voice exists** (free commands): infer from the site's own copy and say so explicitly in the output, so the user knows it is inferred rather than authoritative.
- A short "voice drift" checklist for reviewing a batch of drafts: do all posts sound like one author, or like a model imitating three?

- [ ] **Step 3: Append to the manifest**

```json
  "skills": [
    "./skills/upsell-seam",
    "./skills/gate-recovery",
    "./skills/platform-specs",
    "./skills/brand-voice"
  ]
```

- [ ] **Step 4: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.`

- [ ] **Step 5: Commit**

```bash
git add skills .claude-plugin/plugin.json
git commit -m "feat: platform-specs and brand-voice skills"
```

---

### Task 4: Research and strategy agents

**Files:**
- Create: `agents/plgn-researcher.md`
- Create: `agents/plgn-strategist.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: Tasks 1–3.
- Produces: `plgn-researcher` returns a findings block with keys — `business`, `audience`, `offers`, `voiceMarkers`, `proofPoints`, `gaps`. `plgn-strategist` consumes exactly those keys and returns `positioning` plus `pillars` (3–5, each with `name`, `angle`, `postTypes`). Tasks 6, 8, and 10–12 rely on these key names.

- [ ] **Step 1: Write `agents/plgn-researcher.md`**

Frontmatter: `name: plgn-researcher`, description naming when to delegate (reading a site or competitor set to gather raw marketing material). Include `tools: [WebFetch, Read, Grep]`.

Body must specify:
- Fetch homepage, about, pricing, one product page, one blog post when they exist.
- Return **raw material only** — no recommendations, no prose for the user, no tool-call narration.
- The exact return shape with the six keys above.
- Explicit instruction: report what the site *says*, and separately what it *omits*. Omissions drive pillar selection later.

- [ ] **Step 2: Write `agents/plgn-strategist.md`**

Frontmatter: `name: plgn-strategist`, `tools: [Read]`.

Body must specify:
- Consumes the researcher's six keys.
- Produces `positioning` (one paragraph) and 3–5 `pillars`.
- Each pillar must be defensible from evidence in the research, not generic marketing categories. Ban the default set ("educational / promotional / engaging") explicitly — it is the failure mode to avoid.
- Pillars must be distinguishable enough that a reader could sort ten posts into them without ties.

- [ ] **Step 3: Append to the manifest**

```json
  "agents": [
    "./agents/plgn-researcher.md",
    "./agents/plgn-strategist.md"
  ]
```

- [ ] **Step 4: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.` (Catches a `name:` that does not match the filename.)

- [ ] **Step 5: Commit**

```bash
git add agents .claude-plugin/plugin.json
git commit -m "feat: researcher and strategist agents"
```

---

### Task 5: Copywriter and visual agents

**Files:**
- Create: `agents/plgn-copywriter.md`
- Create: `agents/plgn-visual.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: Task 3 skills, Task 4 agent output shapes.
- Produces: `plgn-copywriter` takes one pillar plus voice and returns `posts[]`, each with `platform`, `body`, `hook`, `cta`, `pillar`. `plgn-visual` takes a post and returns `imagePrompt` plus `altText`. Task 8 spawns one copywriter per pillar and depends on these field names.

- [ ] **Step 1: Write `agents/plgn-copywriter.md`**

Frontmatter: `name: plgn-copywriter`, `tools: [Read]`.

Body must specify:
- Input: one pillar, the brand voice, the target platforms, and the post count.
- Reads `platform-specs` and `brand-voice` skills rather than restating their rules.
- Returns `posts[]` with the five fields above — drafts only, no tool calls. The spawning command owns all writes.
- **Repetition ban:** within one pillar, no two posts may share a hook structure. State that the second post must not open the way the first did.
- Draft to the practical target length, not the hard cap, leaving the gate headroom.

- [ ] **Step 2: Write `agents/plgn-visual.md`**

Frontmatter: `name: plgn-visual`, `tools: [Read]`.

Body must specify:
- Input: one post plus brand voice.
- Returns `imagePrompt` (for Kie AI) and `altText`.
- Prompts describe subject, composition, lighting, and mood — never embedded text, since generated text renders unreliably.
- `altText` describes the image for a screen reader; it is not a caption and must not repeat the post body.

- [ ] **Step 3: Append to the manifest**

```json
  "agents": [
    "./agents/plgn-researcher.md",
    "./agents/plgn-strategist.md",
    "./agents/plgn-copywriter.md",
    "./agents/plgn-visual.md"
  ]
```

- [ ] **Step 4: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.`

- [ ] **Step 5: Commit**

```bash
git add agents .claude-plugin/plugin.json
git commit -m "feat: copywriter and visual agents"
```

---

### Task 6: `/plgn demo` — the hook

**Files:**
- Create: `commands/demo.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: `plgn-researcher`, `plgn-strategist`, `plgn-copywriter`, `platform-specs`, `brand-voice`, `upsell-seam`.
- Produces: the reference implementation of a free command. Tasks 10–12 follow its structure.

- [ ] **Step 1: Write `commands/demo.md`**

```markdown
---
description: Draft 7 platform-native social posts from any website URL — no plgn account needed. Reads the site, infers brand voice and content pillars, and writes posts ready to publish. Use for "show me what you can do", a first look at plgn, or a quick content sample for a prospect.
---
```

Body must specify, in order:

1. **No account required.** This command calls **zero** MCP tools. If the user is connected, say so and point at `/plgn month` instead — do not silently do more.
2. **Argument:** a URL. If absent, ask for one; do not invent a business.
3. **Research:** delegate to `plgn-researcher`.
4. **Strategy:** delegate to `plgn-strategist`; keep the top 3 pillars.
5. **Draft:** spawn `plgn-copywriter` per pillar in parallel; collect 7 posts spread across LinkedIn, X, and Instagram.
6. **Output:** the 7 posts in full, grouped by platform, each labelled with its pillar. Full text — never a summary or a table of titles. A user must be able to copy one and post it.
7. **Close:** the `upsell-seam` block with "7 posts".

Add an explicit anti-pattern list: no scores, no audit framing, no strategy lecture before the posts. The deliverable is posts; everything else is scaffolding.

- [ ] **Step 2: Append to the manifest**

```json
  "commands": ["./commands/demo.md"]
```

- [ ] **Step 3: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.` — this run exercises the free-command contract (seam present, zero tool references).

- [ ] **Step 4: Prove the contract is actually enforced**

Temporarily add the line ``Call `post_create` for each post.`` to `commands/demo.md`, then:

```bash
node scripts/validate.mjs
```
Expected: `FAIL: commands/demo.md: free command must not reference MCP tool \`post_create\``. Remove the line and re-run to confirm `OK`.

- [ ] **Step 5: Commit**

```bash
git add commands/demo.md .claude-plugin/plugin.json
git commit -m "feat: /plgn demo — free 7-post hook"
```

---

### Task 7: `/plgn setup` — connect once

**Files:**
- Create: `commands/setup.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: `_conventions` preflight, `plgn-researcher`, `brand-voice`.
- Produces: a workspace whose brand has seeded knowledge. Task 8 requires this to have run.

- [ ] **Step 1: Write `commands/setup.md`**

```markdown
---
description: Connect Claude Code to a plgn workspace and prepare a brand — verifies the MCP connection, picks or creates a brand, and seeds its voice, audience, offers, and banned words from your website. Run this once before /plgn month. Use for "connect plgn", "set up my workspace", or first-time onboarding.
---
```

Body must specify the six steps:

1. **Preflight:** call `workspace_info`. On failure the user is not connected — direct them to sign up at useplgn.com, let OAuth run on the next call, and stop. Do not retry in a loop.
2. **Report state:** workspace name, plan, and remaining image credits, in one short block.
3. **Brand:** call `brand_list`. If brands exist, ask which to configure. If none, gather a name and create it with `brand_update`.
4. **Seed knowledge:** ask for the brand's website, delegate to `plgn-researcher`, then write voice, audience, offers, and banned words with `knowledge_add` — one call per category, so later updates are surgical. Show the user what will be written and confirm before writing.
5. **Integrations:** report `cloudinary_connect` and `kie_key_set` status plainly — what is missing and what it costs the user in capability. Never ask them to paste a key into the terminal; direct them to the dashboard.
6. **Finish:** `Ready. Run /plgn month <topic>.`

Note explicitly: this command must not contain the upsell seam — the user is already connected.

- [ ] **Step 2: Append to the manifest, run validator, confirm the connected contract**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK` — exercises the connected-command rules (has `workspace_info`, lacks the seam).

- [ ] **Step 3: Commit**

```bash
git add commands/setup.md .claude-plugin/plugin.json
git commit -m "feat: /plgn setup — connect, brand, seeded knowledge"
```

---

### Task 8: `/plgn month` — the flagship

**Files:**
- Create: `commands/month.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: every Wave 1 skill and agent.
- Produces: topics and scheduled posts in a real workspace. The `--dry-run` flag stops after the plan.

- [ ] **Step 1: Write `commands/month.md`**

```markdown
---
description: Fill a plgn workspace with a month of on-brand content — plans pillars, drafts posts in parallel, generates images, and schedules everything after your approval. Supports --dry-run to see the plan without writing. Use for "a month of content", "fill my calendar", or "plan next month".
---
```

Body must specify the eight steps from spec §8, with these details made explicit:

1. **Preflight:** `workspace_info`, then `knowledge_get`. Empty knowledge routes to `/plgn setup` and stops — never guess a voice that is one call away.
2. **Plan, and stop.** Present pillars, platforms, cadence, and total post count as a short table. Wait for an explicit yes. **No writes before approval.** `--dry-run` ends here with the plan and no other output.
3. **Fan out:** one `plgn-copywriter` per pillar, in parallel.
4. **Write:** `topic_create` per pillar, then `post_create` per post as drafts. Record the returned ids; never assume ordering.
5. **Recover:** on `ERROR:`, follow `gate-recovery`. Do not abort the run for one post.
6. **Illustrate:** `generate_image` per post, then poll `check_generation` — generation is asynchronous and returns a task id, not an image. State the polling interval and a give-up threshold, after which the post keeps its draft image slot empty and is reported.
7. **Schedule:** `post_schedule` across the month per the agreed cadence.
8. **Report:** counts first — created, revised by the gate, needing a human, images pending — then the exceptions by name, then the dashboard link.

Add a **partial-failure rule:** if the run stops midway, report exactly what exists in the workspace so far. Never leave the user guessing what landed.

- [ ] **Step 2: Append to manifest and run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK` — also verifies every tool name in the file is one of the 38.

- [ ] **Step 3: Verify a typo would be caught**

Change one `post_schedule` to `post_shedule`, run the validator.
Expected: `FAIL: commands/month.md: unknown MCP tool name \`post_shedule\``. Revert and confirm `OK`.

- [ ] **Step 4: Commit**

```bash
git add commands/month.md .claude-plugin/plugin.json
git commit -m "feat: /plgn month — flagship month-of-content command"
```

---

### Task 9: README and Wave 1 install test

**Files:**
- Create: `README.md`
- Create: `.gitignore` (if absent)

**Interfaces:**
- Consumes: the finished Wave 1 surface.
- Produces: the public growth asset. Wave 2–4 tasks append rows to its command table.

- [ ] **Step 1: Write `README.md`**

Required order — install must appear before any architecture discussion:

1. **Title + one-line pitch.**
2. **A terminal transcript of `/plgn month`** in the first screen, mirroring `ai-marketing-claude`'s opening: the command, the plan table, then a result block showing posts created, gate revisions, images generated, and posts scheduled.
3. **"Try it with no account"** — the `/plgn demo` transcript, and a plain statement that it needs no signup.
4. **Install** — exactly:
   ```
   /plugin marketplace add <github-user>/plgn-claude
   /plugin install plgn
   ```
   Then `/plgn setup` to authorize.
5. **Command table** — free and connected sections, matching the shipped surface.
6. **What plgn adds** — the free/paid seam stated once, honestly: drafting is free and local; persistence, the validation gate, image generation, and scheduling need a workspace.
7. **Architecture** — the four-layer diagram, last.
8. **License.**

Do not claim pricing, trial terms, or performance numbers.

- [ ] **Step 2: Full install smoke test from a clean state**

```bash
claude plugin marketplace update plgn
claude plugin details plgn
```
Expected: inventory lists 3 commands (`demo`, `setup`, `month`), 4 agents, 4 skills. Any mismatch means the manifest and disk disagree — fix before committing.

- [ ] **Step 3: Commit and tag**

```bash
git add README.md .gitignore
git commit -m "docs: README growth asset; Wave 1 complete"
git tag v0.1.0
```

---

## Wave 2 — Top-of-funnel free layer

### Task 10: `/plgn audit`

**Files:**
- Create: `commands/audit.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: `plgn-researcher`, `upsell-seam`.
- Produces: a 0–100 score with fixed weights. Task 20's README table lists it.

- [ ] **Step 1: Write `commands/audit.md`**

Frontmatter description must name the triggers ("audit my social presence", "score my content", prospect research before a sales call).

Body must define **fixed weights** — the property that makes audits comparable across clients, which is what makes them sellable:

| Dimension | Weight |
|---|---|
| Message clarity | 25% |
| Content consistency | 20% |
| Platform fit | 20% |
| Audience targeting | 15% |
| Visual identity | 10% |
| Conversion path | 10% |

For each dimension specify what 0–2, 3–4, 5–6, 7–8, 9–10 look like, so two runs on the same site agree. Output: the weighted score, the three highest-impact fixes, then the seam.

- [ ] **Step 2: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/audit.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn audit — scored social presence audit"
```

---

### Task 11: `/plgn strategy` and `/plgn voice`

**Files:**
- Create: `commands/strategy.md`, `commands/voice.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: `plgn-researcher`, `plgn-strategist`, `brand-voice`, `upsell-seam`.
- Produces: `voice.md` output shaped to be pasteable into `/plgn setup` — it is literally the input to `knowledge_add`.

- [ ] **Step 1: Write `commands/strategy.md`**

Delegates to researcher then strategist. Outputs positioning, audience segments, and 3–5 pillars with angles and post types. Must state which pillars come from what the site *omits*, since gaps are where differentiation lives. Closes with the seam.

- [ ] **Step 2: Write `commands/voice.md`**

Outputs a voice guide with: tone descriptors, vocabulary to use and avoid, sentence rhythm, a banned-word list, and two worked before/after rewrites. The output must be structured as four labelled blocks — voice, audience, offers, banned words — matching the four `knowledge_add` categories in `/plgn setup`, and must say so, so the user can carry it straight across. Closes with the seam.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/strategy.md commands/voice.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn strategy and /plgn voice"
```

---

### Task 12: `/plgn competitors` and `/plgn calendar`

**Files:**
- Create: `commands/competitors.md`, `commands/calendar.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: `plgn-researcher` (spawned once per competitor, in parallel), `plgn-strategist`, `platform-specs`, `upsell-seam`.
- Produces: `calendar.md` output shaped so `/plgn month` can adopt it as its plan.

- [ ] **Step 1: Write `commands/competitors.md`**

Takes the user's URL, identifies 3–5 competitors (asking the user to confirm the list before researching — never assume who a competitor is), spawns one researcher each in parallel, then reports: positioning per rival, themes they all cover, and **gaps none of them cover**. The gaps are the deliverable; the summaries are supporting evidence. Closes with the seam.

- [ ] **Step 2: Write `commands/calendar.md`**

Produces a 30-day table: date, platform, pillar, hook, and a one-line brief per slot. Applies cadence sensibly (not every platform daily) and states the assumed cadence up front so it can be challenged. Explicitly notes the output is a plan, not drafted posts, and that `/plgn month` both drafts and schedules it. Closes with the seam.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/competitors.md commands/calendar.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn competitors and /plgn calendar; Wave 2 complete"
git tag v0.2.0
```

---

## Wave 3 — Connected workhorses

### Task 13: Cadence, pillar, and image-prompt skills

**Files:**
- Create: `skills/content-pillars/SKILL.md`, `skills/image-prompting/SKILL.md`, `skills/posting-cadence/SKILL.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: Task 3 skills.
- Produces: `posting-cadence` defines the schedule spacing `/plgn month` and `/plgn review` both use; `image-prompting` defines the `generate_image` → `check_generation` polling contract used by `/plgn images` and `/plgn month`.

- [ ] **Step 1: Write `skills/content-pillars/SKILL.md`**

Pillar theory, healthy ratios, detecting an exhausted pillar (the same angle restated), and how many pillars a brand can sustain. Includes the "no generic pillars" ban from Task 4 in its canonical form.

- [ ] **Step 2: Write `skills/image-prompting/SKILL.md`**

Kie AI prompt construction (subject, composition, lighting, mood; no embedded text), plus the **async contract**: `generate_image` returns a task id; poll `check_generation`; state the interval, the give-up threshold, and what to do on timeout (leave the slot empty, report it, never block scheduling).

- [ ] **Step 3: Write `skills/posting-cadence/SKILL.md`**

Frequency per platform, time-of-day guidance framed as defaults rather than claims, spacing rules so one pillar does not clump, and how to thin a schedule when there are fewer good posts than slots — better to post less than to pad.

- [ ] **Step 4: Validator + commit**

```bash
node scripts/validate.mjs
git add skills .claude-plugin/plugin.json
git commit -m "feat: content-pillars, image-prompting, posting-cadence skills"
```

---

### Task 14: Brand-guard and scheduler agents

**Files:**
- Create: `agents/plgn-brand-guard.md`, `agents/plgn-scheduler.md`
- Modify: `.claude-plugin/plugin.json`

**Interfaces:**
- Consumes: `brand-voice`, `posting-cadence`.
- Produces: `plgn-brand-guard` returns `{ pass, issues[] }` per draft. `plgn-scheduler` returns `slots[]` with `postId`, `platform`, `scheduledAt`.

- [ ] **Step 1: Write `agents/plgn-brand-guard.md`**

Frontmatter `name: plgn-brand-guard`, `tools: [Read]`.

Body must state prominently: **this is an optimisation, not a safety control.** The server's gate is the safety control. This agent exists only to cut round-trips by catching obvious banned-word and cap problems before a write. It must never be described to the user as what keeps bad posts out, and its pass must never be reported as approval.

- [ ] **Step 2: Write `agents/plgn-scheduler.md`**

Frontmatter `name: plgn-scheduler`, `tools: [Read]`. Consumes drafts plus the cadence skill, returns slots. Must not call `post_schedule` itself — the command owns writes.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add agents .claude-plugin/plugin.json
git commit -m "feat: brand-guard and scheduler agents"
```

---

### Task 15: `/plgn post` and `/plgn repurpose`

**Files:**
- Create: `commands/post.md`, `commands/repurpose.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: preflight, `plgn-copywriter`, `plgn-brand-guard`, `gate-recovery`.
- Produces: single and multi-post writes.

- [ ] **Step 1: Write `commands/post.md`**

Preflight with `workspace_info` and `knowledge_get`. Takes an idea, drafts for the chosen platform, shows the draft, waits for yes, then `post_create` and optionally `post_schedule`. Applies `gate-recovery` on `ERROR:`. Fast path: this is the command someone runs ten times a day, so keep output to the draft plus a one-line confirmation.

- [ ] **Step 2: Write `commands/repurpose.md`**

Takes a URL, a snippet id, or pasted text. Extracts the durable ideas, then produces one platform-native post per platform per idea — never the same text reshaped. Saves reusable fragments with `snippet_create` so the asset compounds. Confirms the full set before writing.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/post.md commands/repurpose.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn post and /plgn repurpose"
```

---

### Task 16: `/plgn review` and `/plgn images`

**Files:**
- Create: `commands/review.md`, `commands/images.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: preflight, `image-prompting`, `plgn-visual`, `gate-recovery`.
- Produces: queue triage and image backfill.

- [ ] **Step 1: Write `commands/review.md`**

Calls `post_list`, then sorts the queue into four buckets: **blocked by the gate**, **missing an image**, **thin** (too short to carry its pillar), and **ready**. For each blocked post, propose a specific fix and offer to apply it with `post_update`. Report counts first, then exceptions. This is the command that makes a workspace trustworthy — it must never say "all good" without having actually listed the queue.

- [ ] **Step 2: Write `commands/images.md`**

Calls `post_list` and `list_images` to find posts without images, delegates prompts to `plgn-visual`, generates with `generate_image`, polls `check_generation` per the `image-prompting` contract, and attaches results. Confirms the count and the credit cost before generating — image generation draws down a real credit pool.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/review.md commands/images.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn review and /plgn images"
```

---

### Task 17: `/plgn library` and `/plgn topics`

**Files:**
- Create: `commands/library.md`, `commands/topics.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: preflight, `content-pillars`.
- Produces: curation over `snippet_*`, `hashtagset_*`, and `topic_*`.

- [ ] **Step 1: Write `commands/library.md`**

Lists snippets and hashtag sets, then **adds judgment** rather than dumping them: flags near-duplicate snippets, hashtag sets that overlap heavily, and sets that are too large to perform. Proposes merges and deletions, confirms, then applies with `snippet_update` / `snippet_delete` / `hashtagset_update` / `hashtagset_delete`.

- [ ] **Step 2: Write `commands/topics.md`**

Lists topics with `topic_list` and reports pipeline health: which pillars are exhausted (per `content-pillars`), which are starved, and what to add. Creates new topics with `topic_create` after confirmation.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/library.md commands/topics.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn library and /plgn topics"
```

---

### Task 18: `/plgn knowledge` and `/plgn brand`

**Files:**
- Create: `commands/knowledge.md`, `commands/brand.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: preflight, `brand-voice`, `plgn-researcher`.
- Produces: brand and knowledge management. Closes the loop opened by `/plgn setup`.

- [ ] **Step 1: Write `commands/knowledge.md`**

Calls `knowledge_get` and audits it against the four categories `/plgn setup` seeds — voice, audience, offers, banned words. Reports what is missing, stale, or self-contradictory, and offers to fill gaps via `knowledge_add` / `knowledge_update` after confirmation. Deleting knowledge always requires explicit confirmation naming the entry.

- [ ] **Step 2: Write `commands/brand.md`**

Lists brands with `brand_list`, supports creating and updating with `brand_update`, and archiving/restoring with `brand_archive` / `brand_restore`. Archive is presented as reversible — because `brand_restore` exists — and must be confirmed by brand name, never by index.

- [ ] **Step 3: Validator + commit**

```bash
node scripts/validate.mjs
git add commands/knowledge.md commands/brand.md .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn knowledge and /plgn brand; Wave 3 complete"
git tag v0.3.0
```

---

## Wave 4 — Retention

### Task 19: `/plgn refresh`, `/plgn report`, and the analyst agent

**Files:**
- Create: `commands/refresh.md`, `commands/report.md`, `agents/plgn-analyst.md`
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: preflight, `plgn-analyst`, `gate-recovery`, `posting-cadence`.
- Produces: the retention loop for workspaces with history.

- [ ] **Step 1: Write `agents/plgn-analyst.md`**

Frontmatter `name: plgn-analyst`, `tools: [Read]`. Reads workspace contents and reports patterns: which pillars got used, what cadence actually held, where the queue thinned. **Constraint:** plgn holds no platform performance data, so the analyst must never claim engagement, reach, or impressions. It reports what the workspace contains, and says plainly when a question needs data plgn does not have.

- [ ] **Step 2: Write `commands/refresh.md`**

Finds posts old enough to reuse via `post_list`, rewrites the strongest ones rather than all of them (state the selection criteria), and reschedules with `post_update` / `post_schedule` after confirmation. Never silently republishes — every rewrite is shown first.

- [ ] **Step 3: Write `commands/report.md`**

Summarises the period from `post_list` and `topic_list` via `plgn-analyst`: what shipped, pillar balance, gate activity, and what to do next. Must carry the analyst's no-performance-claims constraint explicitly.

- [ ] **Step 4: Validator + commit**

```bash
node scripts/validate.mjs
git add commands agents .claude-plugin/plugin.json README.md
git commit -m "feat: /plgn refresh, /plgn report, analyst agent"
```

---

### Task 20: Final reconciliation and release

**Files:**
- Modify: `.claude-plugin/plugin.json`, `README.md`

**Interfaces:**
- Consumes: everything.
- Produces: a plugin whose manifest, disk, and documentation agree.

- [ ] **Step 1: Reconcile the manifest**

Confirm `plugin.json` lists all 18 commands, 7 agents, and 7 skills, and bump `version` to `1.0.0`.

- [ ] **Step 2: Run the validator**

```bash
cd /c/Users/LENOVO/Desktop/plgn-claude && node scripts/validate.mjs
```
Expected: `OK: plugin structure valid.`

- [ ] **Step 3: Confirm Claude Code's inventory matches**

```bash
claude plugin marketplace update plgn
claude plugin details plgn
```
Expected: 18 commands, 7 agents, 7 skills. A mismatch means the manifest and disk disagree.

- [ ] **Step 4: Verify the README table matches the shipped surface**

Every command in `plugin.json` appears in the README table, and every README row exists on disk. Fix either side until they agree.

- [ ] **Step 5: Commit and tag**

```bash
git add .claude-plugin/plugin.json README.md
git commit -m "chore: reconcile manifest and docs for v1.0.0"
git tag v1.0.0
```

---

## Self-Review

**Spec coverage.** Every spec section maps to a task: §4 architecture → Task 1; §5 free layer → Tasks 6, 10–12; §5 connected layer → Tasks 7, 8, 15–19; §6 agents → Tasks 4, 5, 14, 19; §6 skills → Tasks 2, 3, 13; §7.1 preflight and §7.2 confirmation → Task 2 conventions, enforced by the validator on every connected command; §7.3 gate recovery → Task 2; §7.4 seam → Task 2, enforced on every free command; §8 flagship → Task 8; §9 distribution → Tasks 1 and 9; §10 waves → task grouping; §11 non-goals → Global Constraints plus validator checks 5 and 6; §12 drift risk → validator check 4, which is the mitigation the spec deferred.

**Placeholder scan.** One placeholder remains by necessity: `<github-user>` in the README install lines (Task 9), because the GitHub username is not yet known. It is called out in the task rather than left silent. No TBDs elsewhere.

**Type consistency.** Agent return keys are declared once and reused: researcher's six keys (`business`, `audience`, `offers`, `voiceMarkers`, `proofPoints`, `gaps`) are consumed by the strategist in Task 4; the strategist's `pillars` feed the copywriter in Task 5; the copywriter's `posts[]` fields (`platform`, `body`, `hook`, `cta`, `pillar`) are consumed by Task 8 and Task 15; `plgn-visual`'s `imagePrompt`/`altText` are consumed by Tasks 8 and 16. The validator's `FREE` and `CONNECTED` arrays match the command lists in Global Constraints exactly.
