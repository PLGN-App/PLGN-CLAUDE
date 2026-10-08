# Portable skills: plgn's commands, roles and skills in every AI tool (round 1)

Owner, 2026-10-08: the plugin must work in other AI CLIs and apps with a professional install, "like `npx skills add`".
Order: CLIs first, ChatGPT second. `npx plgn-setup` (0.1.1, on npm) already connects a tool to plgn's MCP server, which
gives the tools only. This round ships the rest: the 26 commands, the 12 roles (agents) and the 13 skills, in the Agent
Skills standard every tool reads, installed with one line.

## What a person gets

```
npx skills add PLGN-App/plgn-skills          # every plgn skill, into every AI tool found on the machine
npx plgn-setup codex                         # connects Codex, then offers the same install for Codex
```

Afterwards, in Codex, Cursor, Gemini CLI, Devin, VS Code Copilot or OpenCode: "plgn month for Bunduq" loads the
`plgn-month` skill, which reads `plgn-conventions`, starts the `plgn-role-copywriter` work per topic, and saves with the
plgn tools over MCP. Claude Code keeps the plugin; the portable set is for the other tools.

## Decisions

1. **Source of truth stays `plgn-claude`.** Nothing is hand-written twice. A generator reads `commands/`, `agents/`,
   `skills/` and `reference/_conventions.md` and writes a flat skills tree. `PLGN-App/plgn-skills` (new public repo) holds
   only generated output plus a README; its history is the generator's history.
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
7. **Versioning**: `plgn-skills` carries `VERSION` (= plgn-claude's plugin.json version) and the README says which plugin
   version it was generated from. Generation is the plugin's `npm run portable` (`_dev/scripts/portable.mjs --out
   <dir>`), run in CI of the `plgn-skills` repo itself: a workflow there (schedule every 6 hours + manual run) clones
   `PLGN-App/PLGN-CLAUDE` at its latest `v*` tag, generates into the working tree, commits as PLGN when something
   changed. No secret crosses repos (the repo's own GITHUB_TOKEN commits). After each plugin release I run
   `gh workflow run` there.
8. **`npx plgn-setup` gets a skills step** (plgn-setup 0.2.0): after the MCP entry is written for a host, it offers
   *"Install plgn's skills (commands and roles) for <host>?"* and runs `npx -y skills@latest add PLGN-App/plgn-skills
   -g -y -a <agent>`; `--yes` says yes; `--dry-run` prints the command; `--no-skills` skips. Host → `skills` agent id:
   codex→`codex`, cursor→`cursor`, gemini→`gemini-cli`, devin→`devin`, vscode→`github-copilot`; claude-code and
   claude-desktop get no skills step (plugin / no skills folder). `doctor` adds one row per skills host: `skills ✔ 52
   plgn skills` (counts `plgn-*` folders in the host's global skills dir as the `skills` CLI lays them out; verify the
   path per host from the CLI on the day) or `✘ not installed · npx plgn-setup <host>`. The "no network" rule gains the
   one exception: this step, only after a yes.
9. **Not in this round**: ChatGPT `plugin.json` + `agents/openai.yaml` (round 2, same generated folder); a
   `/.well-known/agent-skills/index.json` on useplgn.com so `npx skills add https://useplgn.com` works (nice, later; it
   needs the tarballs published from the server repo); a server-side crew.

## Interfaces

- `plgn-claude/_dev/scripts/portable.mjs --out <dir> [--check]`: writes `<dir>/skills/*/SKILL.md`, `<dir>/README.md`,
  `<dir>/VERSION`, `<dir>/LICENSE`; prints `52 skills, N rewrites`; exit 1 with the file and line on any flagged word,
  any frontmatter over the limits, any sibling file a skill reads. `--check` runs the generation into a temp dir and
  only reports. `npm run portable` and `npm run portable:check` in plgn-claude's package.json; `validate.mjs` calls the
  check so the plugin's own gate covers it.
- `plgn-claude/_dev/portable-repo/`: the files the `plgn-skills` repo needs besides the output: `.github/workflows/
  generate.yml`, `README.md` template. I copy them into the new repo once.
- `plgn-setup/src/skills-step.js`: `skillsAgentFor(hostId) → id | null`, `skillsCommand(agent) → string[]`,
  `runSkillsInstall(ctx, host)` (spawns npx, inherits stdio, returns ok/fail), `skillsInstalled(ctx, host) → count`.
  `cli.js` calls it after each host write; `doctor.js` adds the row; `i18n.js` gets the five new lines in both
  languages (Arabic by the Edit/Write tool only, simple formal MSA, Western digits).

## Tests

- plgn-claude (`node --test _dev/test/portable.test.mjs`): runs the generator on the real repo into a temp dir; exactly
  52 folders, every `name` equals its folder, every description ≤ 1024 chars, no `mcp__`, none of the flagged words,
  every command/agent/skill of plugin.json present, the two fixed opening paragraphs present where they belong, the four
  tool-name rewrites applied, VERSION equals plugin.json's version. A second run is byte-identical (deterministic).
- plgn-setup (`node --test`): agent map covers every host id with the right id or null; the command line is exactly
  `npx -y skills@latest add PLGN-App/plgn-skills -g -y -a <agent>`; `--dry-run` prints it and spawns nothing; `--no-skills`
  and a "no" answer skip; doctor row green/red from a fake home; i18n keys exist in both languages.
- Live proof (me, after merge): `npx skills add PLGN-App/plgn-skills -l` lists 52; `npx skills add PLGN-App/plgn-skills
  -g -y -a codex` on this machine, then Codex (`codex mcp login plgn` done) runs "plgn post for Bunduq" end to end.
  Points are spent only on the owner's go.

## Rules carried over

PLGN commit identity, one-line messages, no trailers. Lowercase "plgn", "points" never "credits". No worktrees: lane
copies are clones under hbs-projects, deleted after merge. Arabic text only through Edit/Write tools. The Arabic status
page is updated when the wave lands.
