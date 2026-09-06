# plgn-claude — Claude Code Plugin Design

**Date:** 2026-08-19
**Status:** Approved, ready for implementation planning
**Author:** Ahmed Hashim

## 1. Goal

Ship a public Claude Code plugin that acts as a **growth asset** for plgn (the agent-first marketing SaaS at `useplgn.com`).

The plugin has two jobs, in this order:

1. **Acquire.** Give a stranger who finds it on the plugin marketplace real, usable marketing output with no plgn account and no payment.
2. **Convert.** Make that stranger feel the one thing the free layer cannot do — persist, validate, illustrate, and schedule the work — and hand them a one-command path to plgn.

Success is measured by installs that become connected workspaces, not by command count.

## 2. Context

plgn is a Next.js 16 / MongoDB / Better Auth SaaS that exposes marketing operations as an MCP tool surface over OAuth. Customers connect their own AI client (claude.ai, ChatGPT, Cursor, Claude Code) and the dashboard is the review/approve surface rather than the primary work surface.

The server exposes **38 MCP tools** across 8 domains:

| Domain | Count | Tools |
|---|---|---|
| context | 5 | `workspace_info`, `brand_list`, `brand_update`, `brand_archive`, `brand_restore` |
| posts | 6 | `post_create`, `post_get`, `post_list`, `post_update`, `post_delete`, `post_schedule` |
| topics | 5 | `topic_create`, `topic_get`, `topic_list`, `topic_update`, `topic_delete` |
| library | 9 | `snippet_create/get/list/update/delete`, `hashtagset_create/list/update/delete` |
| knowledge | 4 | `knowledge_add`, `knowledge_get`, `knowledge_update`, `knowledge_delete` |
| media | 4 | `list_images`, `upload_image_from_url`, `upload_image_base64`, `delete_image` |
| generation | 3 | `generate_image`, `generate_image_from_image`, `check_generation` |
| integrations | 2 | `cloudinary_connect`, `kie_key_set` |

Server-side guarantees the plugin inherits for free and MUST NOT reimplement:

- **Tenant isolation** — every tool call is workspace-scoped by `dbFor(workspaceId)`.
- **The validation gate** (`runGate`) — per-platform character caps and the brand's banned-word list are enforced server-side. A post cannot enter `scheduled`/`published` while a check fails, regardless of what the agent attempts.
- **Role enforcement and audit** — `safeTool` validates args, checks `minRole`, and writes one `ToolCall` row on every path.

This is the design's most important asymmetry: **the plugin can be wrong and the data stays correct.** Skills therefore optimise for good drafts and clean recovery, never for defensive validation the server already performs.

### Prior art

`ai-marketing-claude` (this design's structural model) is a pure-skills bundle: 20 Markdown files copied into `~/.claude/` by an installer. Its value is packaged judgment — fixed scoring dimensions, parallel subagents, opinionated output. Its ceiling is that every output is a dead Markdown file on a laptop.

The Vercel plugin is the closer technical precedent: a hosted OAuth MCP server declared in `.mcp.json`, plus commands and agents that orchestrate it.

plgn-claude takes the judgment layering from the first and the distribution mechanics from the second.

## 3. Decisions

| # | Decision | Rationale |
|---|---|---|
| D1 | **Separate public repo** `plgn-claude`, not a folder inside plgn | A marketplace repo must be public. plgn's repo contains tenant-isolation logic, the Kashier webhook, and auth bootstrap; it cannot be published. Repos cannot be half-public. |
| D2 | **Plugin format**, not an `install.sh` copy-files installer | Only the plugin format can ship `.mcp.json`, which turns connection into part of installation. |
| D3 | **Bundle the plgn MCP server** in `.mcp.json` | Collapses activation from *find URL, hand-edit config, restart* to *install, authorize*. Requires zero backend work; Better Auth's `mcp` plugin already issues the tokens. |
| D4 | **Two layers: free drafting and connected persistence** | A connected-only plugin is a paywall to anyone browsing the marketplace. The free layer is the acquisition channel, and its limitation is the sales pitch. |
| D5 | **Per-command files, no mega-orchestrator** | `ai-marketing-claude` routes everything through one `SKILL.md` whose full routing table loads on every invocation. Native plugin commands load only what is invoked. |
| D6 | **No `scripts/` layer** | The equivalent deterministic work lives behind the MCP tools, where it is validated, tenant-scoped, and audited. |
| D7 | **Ship in four waves** | 32 files written before anyone uses one is 32 files of guesswork. Wave 1 is independently installable and demo-able. |
| D8 | **Every command must add judgment** | A command that only wraps one tool call is worse than nothing — the user could have just asked. This is the admission test for the surface. |

## 4. Architecture

```
plgn-claude/
├── .claude-plugin/
│   ├── plugin.json          # name, version, commands + skills (never agents)
│   └── marketplace.json     # makes the repo itself installable
├── .mcp.json                # ships the plgn OAuth connection
├── commands/                # user entry points
│   └── _conventions.md      # shared rules every command follows
├── agents/                  # parallel specialists
├── skills/                  # shared know-how, model-invoked
├── docs/superpowers/specs/  # this document
├── LICENSE                  # MIT
└── README.md                # the growth asset itself
```

### The four layers

```
commands/   entry points     — one user-facing job each, owns confirmation
   ↓
agents/     parallel workers — fresh context each, return findings only
   ↓
skills/     shared know-how  — imported by many commands, never invoked directly
   ↓
MCP tools   the server       — validation, persistence, tenant scoping
```

The `skills/` layer is what `ai-marketing-claude` lacks, and is the reason 18 command files will not drift apart: platform character caps, brand-voice application, and gate-recovery behaviour are each defined in exactly one place.

### Manifest quirk, verified empirically

`plugin.json` must declare `commands` and `skills`, and must **not** declare
`agents`. Confirmed against `claude plugin details` during Wave 4:

| Manifest | Result |
|---|---|
| `agents` declared as file paths | **Agents (0)** — declaring the key suppresses discovery, despite all 7 files being present |
| `agents` key omitted | **Agents (7)** — the loader discovers `agents/*.md` itself |
| `commands` key omitted | **Skills (26)** — all 19 command files are loaded as skills |
| `commands` declared, `agents` omitted | **Skills (7), Agents (7)** ✅ correct |

The validator enforces both halves, so the mistake cannot be reintroduced.

### `.mcp.json`

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

## 5. Command surface

Commands are namespaced by plugin name. The exact invocation form (`/plgn:demo` vs `/demo`) is resolved by Claude Code's plugin loader and is to be confirmed empirically in Wave 1; the design does not depend on which form wins.

### Free layer — no account required

Output is Markdown. Every command ends with the upsell seam (§7.4).

| Command | Does | Justification under D8 |
|---|---|---|
| `/plgn demo <url>` | Reads their site, drafts 7 platform-native posts | The hook — the first thing a marketplace browser runs |
| `/plgn audit <url>` | Scores social presence 0–100 across 6 fixed dimensions | Fixed weights make audits comparable across clients, which is what makes them sellable |
| `/plgn strategy <url>` | Positioning, audience segments, 3–5 content pillars | Pillars are the input to every other command |
| `/plgn voice <url>` | Brand voice guide and banned-word list | Output is literally the input to `knowledge_add` |
| `/plgn competitors <url>` | Rival cadence, themes, and gaps to attack | Parallel multi-site research |
| `/plgn calendar <topic>` | 30-day calendar draft | The artefact people actually want |

### Connected layer — writes to the workspace

| Command | Does | Primary tools |
|---|---|---|
| `/plgn setup` | Connect, workspace, brand, seeded knowledge | `workspace_info`, `brand_list/update`, `knowledge_add` |
| `/plgn brand` | Create / switch / archive brands | `brand_list/update/archive/restore` |
| `/plgn knowledge` | Audit what the brand knows about itself, fill gaps | `knowledge_get/add/update` |
| **`/plgn month <topic>`** | **Flagship** — pillars, posts, images, gate, scheduled | most of the surface |
| `/plgn post <idea>` | One on-brand post, validated and scheduled | `post_create`, `post_schedule` |
| `/plgn repurpose <url>` | One asset into many platform-native posts | `snippet_*`, `post_create` |
| `/plgn topics` | Idea pipeline; flags exhausted pillars | `topic_list/create/update` |
| `/plgn library` | Curate snippets and hashtag sets, kill duplicates | `snippet_*`, `hashtagset_*` |
| `/plgn images` | Find posts missing images, generate, attach | `generate_image`, `check_generation` |
| `/plgn review` | Triage queue: gate failures, missing images, thin posts | `post_list`, `post_update` |
| `/plgn refresh` | Find stale posts, rewrite, reschedule | `post_list/update/schedule` |
| `/plgn report` | What shipped, what to do next | `post_list`, `topic_list` |

## 6. Agents and skills

### Agents (7)

Each returns findings only — never prose for the user, never a tool-call log.

| Agent | Job |
|---|---|
| `plgn-researcher` | Reads sites and competitors, returns raw material |
| `plgn-strategist` | Positioning, pillars, audience segments |
| `plgn-copywriter` | Platform-native copy; spawned **one per pillar** by `/plgn month` |
| `plgn-visual` | Image prompts and art direction |
| `plgn-brand-guard` | Checks drafts against voice and banned words before they reach the server |
| `plgn-scheduler` | Cadence, platform mix, timing |
| `plgn-analyst` | Reads the workspace, reports what is working |

`plgn-brand-guard` is an optimisation, not a safety control — the server is the safety control. It exists to cut round-trips, and must never be described as the thing that keeps bad posts out.

### Skills (7)

| Skill | Holds |
|---|---|
| `platform-specs` | Character caps, format rules, what performs per platform |
| `brand-voice` | How to apply a stored voice to new copy |
| `content-pillars` | Pillar theory, ratios, avoiding repetition |
| `image-prompting` | Kie AI prompt construction and the async polling pattern |
| `gate-recovery` | What to do when a tool returns `ERROR:` — revise and retry, never surface a raw failure |
| `posting-cadence` | Frequency, timing, platform mix |
| `upsell-seam` | The exact free-to-paid messaging, defined once |

`gate-recovery` and `upsell-seam` carry the most weight: the first makes every write command robust, the second makes every free command sell.

## 7. Cross-cutting rules (`commands/_conventions.md`)

### 7.1 Preflight before work

Every connected command first calls `workspace_info`. On failure the user is not connected: show the signup link, let OAuth run, stop. Commands that need brand knowledge additionally check `knowledge_get` and route to `/plgn setup` when it is empty. Never half-run and leave partial state in a workspace.

### 7.2 Confirm before writing

Reading is free; creating thirty posts is not. Any command that writes must present its plan and wait for an explicit yes. `/plgn month` additionally supports `--dry-run`, which stops after the plan.

### 7.3 Gate recovery, not gate failure

When a tool returns `ERROR:` from the validation gate, the command revises the draft and retries. A user should learn that their banned-word list was respected, not that the command failed. Repeated failure on the same post is reported once, with the post left as a draft for human review.

### 7.4 The upsell seam

Every free command closes with the same shaped message, defined once in the `upsell-seam` skill:

> These 7 posts are text in your terminal. Connect plgn and the same command writes them into a real workspace — checked against your banned-word list, images generated, scheduled across the month. → useplgn.com

The mechanism is deliberate: deliver the value, then expose the limitation that only the product removes. It must never appear in a connected command.

## 8. Flagship: `/plgn month <topic>`

1. **Preflight** — `workspace_info` and `knowledge_get`. Empty brand knowledge routes to `/plgn setup`. Never guess a voice that is one call away.
2. **Plan, and stop** — show pillars, platforms, cadence, post count. Wait for approval. No writes before this point. `--dry-run` ends here.
3. **Fan out** — one `plgn-copywriter` per pillar, in parallel.
4. **Write** — `topic_create` per pillar, `post_create` per post as drafts.
5. **Recover** — handle `ERROR:` returns per §7.3.
6. **Illustrate** — `generate_image`, then poll `check_generation` (async).
7. **Schedule** — `post_schedule` across the month per `posting-cadence`.
8. **Report** — created, auto-fixed, needs-human, plus a dashboard link.

## 9. Distribution

`README.md` is not documentation — it is the growth asset, and is written for someone who has never heard of plgn. It must carry a terminal-transcript demo of `/plgn month` in the first screen, mirroring `ai-marketing-claude`'s opening, and reach the install instructions before any architecture discussion.

Install is two lines:

```
/plugin marketplace add <github-user>/plgn-claude
/plugin install plgn
```

`.claude-plugin/marketplace.json` makes the repo itself a marketplace, so no separate listing repository is required.

License: MIT, matching `ai-marketing-claude`.

## 10. Build waves

Each wave ends in a shippable state.

| Wave | Contents | Ships |
|---|---|---|
| **1** | `plugin.json`, `marketplace.json`, `.mcp.json`, `_conventions`, skills `upsell-seam` + `gate-recovery` + `platform-specs` + `brand-voice`, commands `demo` / `setup` / `month`, agents `researcher` / `strategist` / `copywriter` / `visual` | Installable, demo-able, records a launch video |
| **2** | Free layer: `audit`, `strategy`, `voice`, `competitors`, `calendar` | Top-of-funnel |
| **3** | Connected workhorses: `post`, `repurpose`, `review`, `images`, `library`, `topics`, `knowledge`, `brand`; skills `content-pillars` + `image-prompting` + `posting-cadence`; agents `brand-guard` + `scheduler` | Daily-use retention |
| **4** | `refresh`, `report`, agent `analyst` | Retention, once workspaces have history |

## 11. Non-goals

- **No reimplementation of server validation.** Character caps and banned words live in `runGate`. The plugin drafts and recovers; it does not police.
- **No local persistence.** The plugin writes no database, cache, or state file. The workspace is the source of truth.
- **No credential handling.** OAuth is Better Auth's job. The plugin never prompts for, stores, or forwards a token or API key.
- **No posting to social platforms directly.** plgn owns publishing.
- **No analytics claims.** `/plgn report` reports what the workspace contains, not platform performance data plgn does not have.

## 12. Risks

| Risk | Mitigation |
|---|---|
| Free layer cannibalises conversion — people use the drafts forever | The seam sits at persistence, scheduling, and images, which are the expensive parts to do by hand. Drafts alone are the demo, not the job. |
| Skills drift from the tool surface as plgn adds tools | Two repos, so drift is possible. Tool names change rarely; a later CI check that diffs `ALL_TOOLS` against skill references is the fix if drift is observed. Not built pre-emptively. |
| `/plgn month` creates junk in a real workspace | §7.2 confirmation gate plus `--dry-run`; posts land as drafts and are only scheduled after the gate passes. |
| Marketplace browsers install and never connect | Acceptable and expected. They are the top of the funnel; `/plgn demo` is built for exactly this person. |
