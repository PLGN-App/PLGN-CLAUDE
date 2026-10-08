# Portable skills: plgn's commands, roles and skills in every AI tool (round 1)

Owner, 2026-10-08: the plugin must work in other AI CLIs and apps with a professional install, "like `npx skills add`".
Order: CLIs first, ChatGPT second. `npx plgn-setup` (0.1.1, on npm) already connects a tool to plgn's MCP server, which
gives the tools only. This round ships the rest: the 26 commands, the 12 roles (agents) and the 13 skills, in the Agent
Skills standard every tool reads. Owner, 19:50: **everything lives in the one `plgn-setup` repo** (installer + skills),
no second repo.

## What a person gets

```
npx plgn-setup                    # connects every AI tool found, then installs plgn's 52 skills into each
npx plgn-setup codex              # one tool
npx skills add PLGN-App/plgn-setup   # the skills alone, for people who already use the skills CLI
```

Afterwards, in Codex, Cursor, Gemini CLI, Devin, VS Code Copilot or OpenCode: "plgn month for Bunduq" loads the
`plgn-month` skill, which reads `plgn-conventions`, does the `plgn-role-copywriter` work per topic, and saves with the
plgn tools over MCP. Claude Code keeps the plugin; the portable set is for the other tools.

## Decisions

1. **Source of truth stays `plgn-claude`.** Nothing is hand-written twice. A generator there reads `commands/`, `agents/`,
   `skills/` and `reference/_conventions.md` and writes a flat skills tree. The output is committed into
   `plgn-setup/skills/` (generated, never edited by hand; the folder's README says so) and ships inside the npm package.
2. **Name every skill with the `plgn-` prefix** so nothing collides in a person's skill folder: `plgn-<command>`
   (26), `plgn-role-<agent without the plgn- prefix>` (12, e.g. `plgn-role-copywriter`), `plgn-<skill>` (13, e.g.
   `plgn-brand-voice`), `plgn-conventions` (1). 52 skills.
3. **Form = Agent Skills standard**: `skills/<name>/SKILL.md` with frontmatter `name` (equal to the folder, lowercase,
   hyphens, at most 64 chars) and `description` (at most 1024 chars, the trigger words first). Nothing else in the
   frontmatter; Claude Code's `tools`, `color`, `disable-model-invocation` are dropped. Any file a skill reads beside
   itself goes in that skill's folder (today none do; the generator fails if one appears).
4. **Rewrites the generator applies, by exact-match tables, never free regex over prose:**
   - `mcp__plugin_plgn_plgn__<tool>` → `<tool>` (4 files today). Plain tool names like `workspace_info` stay.
   - The 13 skill names, when they appear as a skill reference (in backticks or after the words "skill"/"skills"), →
     their `plgn-` name. The list is the 13 folder names; the builder checks each hit by hand once.
   - Agent names `plgn-<x>` referenced as something to start → `plgn-role-<x>`.
   - `/plgn <command>` stays as written. Each generated SKILL.md opens with one fixed paragraph: *"`/plgn <name>` in this
     text means the plgn-<name> skill. In a tool without slash commands, ask for it by name."*
   - "the `_conventions` file / **_conventions**" → "the `plgn-conventions` skill".
5. **Roles without subagents.** Every role skill opens with a fixed paragraph: *"This is a role another plgn skill
   starts. A tool with subagents runs it as one; a tool without runs it in this conversation, one role at a time, then
   returns to the skill that asked."* The command skills' "in parallel" wording stays (it is true where subagents exist).
6. **Claude-Code-only words are flagged, not silently kept.** The generator fails when output contains any of:
   `Task tool`, `subagent_type`, `AskUserQuestion`, `TodoWrite`, `claude plugin`, `/plugin `, `.claude-plugin`,
   `plgn:plgn-`. Each hit is fixed in the SOURCE file in plgn-claude (words that mean the same in every tool), so the
   Claude Code plugin improves too. The fix list is part of this round.
7. **Refresh and versioning.** `plgn-setup/skills/VERSION` holds the plugin version the tree came from. A workflow in
   plgn-setup, `.github/workflows/generate.yml` (schedule every 6 hours + manual run; `permissions: contents: write`),
   clones `https://github.com/PLGN-App/PLGN-CLAUDE` at its latest `v*` tag, runs `node _dev/scripts/portable.mjs --out
   <plgn-setup>/skills` from that clone, and commits to main as `PLGN <waslahapp993@gmail.com>` with the message
   `skills: regenerated from plugin X.Y.Z` only when something changed. No secret: the repo's own GITHUB_TOKEN. After
   each plugin release I run `gh workflow run generate.yml`, then bump + tag plgn-setup, and the existing publish
   workflow puts it on npm.
8. **`npx plgn-setup` installs the skills itself (0.2.0), no network, no `skills` CLI.** After the MCP entry is written
   for a host that has a skills folder, it offers *"Install plgn's 52 skills for <host>?"* and copies every
   `skills/plgn-*` folder from its own package into the host's global skills folder, replacing only folders named
   `plgn-*` (a person's other skills are never touched). `--yes` says yes; `--dry-run` lists what it would copy;
   `--no-skills` skips. Host → folder, taken from the `skills` CLI 1.7.1 agent table and verified by the builder on the
   day (Source line in the file like the host files have): codex `~/.codex/skills`, cursor `~/.cursor/skills`, gemini
   `~/.gemini/skills`, devin `~/.devin/skills`, vscode (Copilot) its global skills folder per that table. claude-code and
   claude-desktop get no skills step (plugin / no skills folder). `doctor` adds one row per skills host: `skills ✔ 52 of
   52 plgn skills` or `✘ 40 of 52 · run npx plgn-setup <host>` or `✘ none · run npx plgn-setup <host>`. The package's
   `files` list gains `skills`; the "files list" test is updated.
9. **Not in this round**: ChatGPT `plugin.json` + `agents/openai.yaml` (round 2, same `skills/` folder, same repo); a
   `/.well-known/agent-skills/index.json` on useplgn.com so `npx skills add https://useplgn.com` works (later); a
   server-side crew; a skills version check in doctor (follow-up).

## Interfaces

- `plgn-claude/_dev/scripts/portable.mjs --out <dir> [--check]`: writes `<dir>/<name>/SKILL.md` for the 52 skills,
  `<dir>/VERSION`, `<dir>/README.md` ("generated from PLGN-App/PLGN-CLAUDE X.Y.Z by _dev/scripts/portable.mjs; do not
  edit; install with npx plgn-setup or npx skills add PLGN-App/plgn-setup"); removes stale `plgn-*` folders in `<dir>`
  first; prints `52 skills, N rewrites`; exit 1 with the file and line on any flagged word, any frontmatter over the
  limits, any sibling file a skill reads. `--check` generates into a temp dir and only reports. plgn-claude gets a
  minimal private `package.json` with `validate`, `portable`, `portable:check` and `test` scripts; `validate.mjs` calls
  the check so the plugin's own gate covers it.
- `plgn-claude/_dev/portable-repo/generate.yml`: the workflow file for plgn-setup, kept beside the generator so the two
  move together; copied into `plgn-setup/.github/workflows/` by the plgn-setup lane (same content).
- `plgn-setup/src/skills.js`: `skillsDirFor(hostId, ctx) → path | null`, `bundledSkills() → [{name, dir}]` (reads the
  package's own `skills/`), `installSkills(ctx, hostId, {dryRun}) → {copied, replaced}`, `skillsStatus(ctx, hostId) →
  {installed, total}`. `cli.js` calls it after each host write; `doctor.js` adds the row; `i18n.js` gets the new lines
  in both languages (Arabic by the Edit/Write tool only, simple formal MSA, Western digits).

## Tests

- plgn-claude (`node --test _dev/test/portable.test.mjs`): runs the generator on the real repo into a temp dir; exactly
  52 folders, every `name` equals its folder, every description ≤ 1024 chars, no `mcp__`, none of the flagged words,
  every command/agent/skill of plugin.json present, the two fixed opening paragraphs present where they belong, the four
  tool-name rewrites applied, VERSION equals plugin.json's version. A second run is byte-identical (deterministic). A
  stale `plgn-old` folder in the target is removed; a `my-own-skill` folder there is kept.
- plgn-setup (`node --test`): host → folder map covers every host id with a path or null; install from a fake package
  dir into a fake home copies 52 folders, replaces an old `plgn-*` folder, keeps a foreign one; `--dry-run` lists and
  writes nothing; `--no-skills` and a "no" answer skip; doctor row green / partial / none from a fake home; i18n keys
  exist in both languages; the `files` list test includes `skills`; the real bundled `skills/` has 52 folders and a
  VERSION once the generated tree is committed (the lane commits a first generation).
- Live proof (me, after merge): `npx skills add PLGN-App/plgn-setup -l` lists 52; `npx plgn-setup codex` on this
  machine, then Codex (`codex mcp login plgn` done) runs "plgn post for Bunduq" end to end. Points only on the owner's go.

## Rules carried over

PLGN commit identity, one-line messages, no trailers. Lowercase "plgn", "points" never "credits". No worktrees: lane
copies are clones under hbs-projects, deleted after merge. Arabic text only through Edit/Write tools. The Arabic status
page is updated when the wave lands.
