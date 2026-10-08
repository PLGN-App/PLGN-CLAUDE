# Portable skills, round 1, plugin side (thin plan)

Spec: docs/superpowers/specs/2026-10-08-portable-skills-design.md. Repo: plgn-lane-plugin, branch feat/portable-skills.
Commits as PLGN, one line, no trailers. Never change the version in .claude-plugin/plugin.json (set at merge).
The plgn-setup side (src/skills.js, doctor, i18n, the first committed generation) is a separate lane, not this plan.

## Goal

1. One generator in plgn-claude turns the 27 commands, 12 roles, 13 skills and the conventions into 53 Agent Skills folders named `plgn-*`, checked and byte-for-byte repeatable.
2. The plugin's own words stop saying "Claude Code" where every tool will read them, and validate.mjs runs the generator's check.
3. A workflow file, kept beside the generator, lets plgn-setup regenerate its `skills/` from the plugin's latest release tag.

## Decisions

1. **53, not 52, and never typed in.** plugin.json lists 27 commands (`product-sheet` came in 1.15.0; the spec counted an older list), so the total is 27 + 12 + 13 + 1 = 53. The generator and the tests derive the count from plugin.json and `agents/`; nothing writes "52" or "53" as a rule.
2. **Flag list = the spec's eight + `Claude Code` + any `mcp__` left after the rewrites.** None of the eight occur in the source today; "Claude Code" does (help's restart line, setup's description), and a Codex user would read "Restart Claude Code". The third place (the conventions' restart message) wraps across two lines, so no line scan sees it; Task 2 fixes all three by hand with "your AI tool", which is also true inside Claude Code.
3. **Name rewrites are whole-token matches from tables built from the real names** (agents from `agents/*.md`, skills from plugin.json `skills`): the character before is not `[A-Za-z0-9_/-]` and the one after is not `[A-Za-z0-9_-]`. Every current hit of the 13 skill names was checked: all are skill references (bold, backticks, or "the X skill"), so no form restriction is needed, and `/plgn brand`, `/plgn voice` stay untouched.
4. **`**_conventions**` becomes `**plgn-conventions**`**, not "the `plgn-conventions` skill": it is the only form in the source (56 hits), and "per **plgn-conventions** rule 6" reads like "per **plgn-reply-style** rule 7"; the spec's phrase would give "per the `plgn-conventions` skill rule 6".
5. **Roles: the agent `tools:` list is dropped, and its plgn tools become one body line** `This role uses these plgn tools: `image_view`.` That is where the spec's four `mcp__plugin_plgn_plgn__` rewrites land (art-director, content-creator, product-sheet, researcher), since today they sit only in frontmatter. Read and WebFetch are dropped: every tool has its own.
6. **Opening order:** a role skill opens with the role paragraph, then the slash paragraph; every other skill opens with the slash paragraph. Both are exported constants, added after the rewrites so nothing rewrites them.
7. **description is written with `JSON.stringify`** (a valid YAML double-quoted value): gate-recovery's description holds "warning: or check:", which strict YAML parsers reject in a plain value. The generator has no YAML parser: a quoted, empty, missing or multi-line (`>`, `|`) source description is an error.
8. **Check first, then write.** Everything is built in memory; on any error nothing in the target changes (the workflow can never commit half a tree). Only directories named `plgn-*` are removed. `--out` is refused (exit 2) when it is the plugin root, an ancestor of it, or one of (or inside) its commands, agents, skills or reference folders.
9. **Node built-ins only; sources found from the script's own place, `--out` from the current folder**, because the workflow runs it from a bare clone with no `npm install`, from plgn-setup's root.
10. **`test` script is `node --test _dev/test/*.test.mjs`**, not `_dev/test/`: Node 24 treats a folder argument as a file and fails (checked on this machine); Node 21+ expands the pattern itself, so it also works from cmd.exe.
11. **`.gitignore` gains `!_dev/test/`, `!_dev/portable-repo/` and `dist/`**: `_dev/*` is ignored today, so the new test and workflow files would silently stay out of git.
12. **One-line commits (owner rule) beat the computed "list each change in the commit body"**: the word fixes are listed in the CHANGELOG Unreleased entry instead.
13. **Workflow:** only `vX.Y.Z` tags count, newest by version; no tag at all is a plain failure, never a fallback to main (unreleased work must not ship); skills/VERSION must equal the tag; cron at minute 17 every 6 hours (off the busy top of the hour); a concurrency group so two runs never push together.
14. **Order: generator, word fixes, tests, workflow, wiring**, so the tests that run the generator on the real repo pass when written, and Task 2's "before" is the generator's real exit 1.

## Interfaces

- `_dev/scripts/portable.mjs`: `export const FLAGGED: string[]`
- `_dev/scripts/portable.mjs`: `export const SLASH_PARAGRAPH: string`, `export const ROLE_PARAGRAPH: string`
- `_dev/scripts/portable.mjs`: `export function applyRewrites(text: string, names: { agents: string[], skills: string[] }): { text: string, count: number }`
- `_dev/scripts/portable.mjs`: `export function buildPortable(root?: string): { version: string, skills: { name: string, kind: "command"|"role"|"skill"|"conventions", source: string, text: string }[], rewrites: number, errors: string[] }`
- `_dev/scripts/portable.mjs`: `export function writePortable(outDir: string, built: ReturnType<typeof buildPortable>): void`
- `_dev/scripts/portable.mjs`: `export function main(argv: string[], root?: string): 0 | 1 | 2` (root defaults to the plugin root two folders up from the script)
- CLI: `node _dev/scripts/portable.mjs --out <dir>` or `--check`; stdout `<count> skills, <N> rewrites`; stderr one `FAIL: <path>:<line>: <what>` per error.
- `package.json` scripts: `validate`, `portable`, `portable:check`, `test`.
- `_dev/portable-repo/generate.yml`: the plgn-setup workflow (copied by the plgn-setup lane to its `.github/workflows/generate.yml`, same content).
- `_dev/scripts/validate.mjs` section 19 runs `portable.mjs --check` and turns each FAIL line into a validate failure.

## Review Focus

1. The count is derived (53 today). The command `product-sheet` becomes `plgn-product-sheet`; the agent `plgn-product-sheet` becomes `plgn-role-product-sheet`; a reference in commands/product-sheet.md to the agent must say `plgn-role-product-sheet`.
2. Rewrites never add or remove a line, so an error's line number is the source line; fixed paragraphs and the tools line are added after the rewrites.
3. Nothing is written when any error exists; stale removal touches only `plgn-*` directories; a foreign folder and any non-`plgn-` file survive.
4. Frontmatter is exactly `name` (equal to the folder) and `description` (JSON string, at most 1024 characters after the rewrites).
5. The script imports only `node:` modules and resolves sources from `import.meta.url`, `--out` from `process.cwd()`.
6. The `.gitignore` negations exist, or Tasks 3 and 4 commit nothing.

Reviewer step (from the owner): run `npm run portable` once and read dist/portable/plgn-month, plgn-role-copywriter and plgn-brand-voice SKILL.md end to end for a reference that points at a name that does not exist.

### Task 1: the generator, package.json and .gitignore

Files:
- Create: `_dev/scripts/portable.mjs`
- Create: `package.json`
- Modify: `.gitignore`

What changes:
- `package.json` is exactly `{"private":true,"type":"module","scripts":{"validate":"node _dev/scripts/validate.mjs","portable":"node _dev/scripts/portable.mjs --out dist/portable","portable:check":"node _dev/scripts/portable.mjs --check","test":"node --test _dev/test/*.test.mjs"}}`, 2-space indented, LF, final newline.
- `buildPortable(root)`: version from `.claude-plugin/plugin.json`. Sources, read as UTF-8 with CRLF turned into LF: each plugin.json `commands` entry (name `plgn-<file base>`, kind command); every `agents/*.md`, sorted (name `plgn-role-<base without plgn->`, kind role); each plugin.json `skills` entry's SKILL.md (name `plgn-<folder>`, kind skill); `reference/_conventions.md` (name `plgn-conventions`, kind conventions). The frontmatter is the first `---` block; the description is its single `description:` line (D7); the body is the rest with leading blank lines dropped and trailing white space trimmed. `source` is the repo-relative path with forward slashes.
- `applyRewrites`, run on the description and the body, in this order, each hit counted: remove the literal prefix `mcp__plugin_plgn_plgn__`; each agent name to `plgn-role-<x>` (D3); each skill name to `plgn-<name>` (D3); the literal `**_conventions**` to `**plgn-conventions**` (D4).
- Roles: the `tools:` items starting with `mcp__plugin_plgn_plgn__` become `This role uses these plgn tools: ` + the plain names in backticks, comma-separated, in source order, + `.` (each counted as a rewrite). Every other frontmatter key is dropped.
- Text of each SKILL.md: `---`, `name: <name>`, `description: <JSON.stringify(description)>`, `---`, blank line; then (roles) ROLE_PARAGRAPH and a blank line; SLASH_PARAGRAPH and a blank line; then (roles with plgn tools) the tools line and a blank line; then the body and one final `\n`.
- SLASH_PARAGRAPH is exactly: "`/plgn <name>` in this text means the plgn-<name> skill. In a tool without slash commands, ask for it by name." ROLE_PARAGRAPH is exactly: "This is a role another plgn skill starts. A tool with subagents runs it as one; a tool without runs it in this conversation, one role at a time, then returns to the skill that asked."
- FLAGGED, in this order: `Task tool`, `subagent_type`, `AskUserQuestion`, `TodoWrite`, `claude plugin`, `/plugin `, `.claude-plugin`, `plgn:plgn-`, `Claude Code` (case-sensitive). Errors, all collected, never stopping at the first: a FLAGGED string or `mcp__` on any emitted source line after the rewrites (`<source>:<line>: flagged "<word>"`); a name not matching `^[a-z0-9]+(-[a-z0-9]+)*$` or longer than 64; a description empty or longer than 1024; two outputs with one name; any entry in a source skill folder other than SKILL.md (`skills/<x>/<file>: a file beside SKILL.md`); D7's description errors.
- `writePortable`: create the folder; delete every directory in it whose name starts with `plgn-`; write `<name>/SKILL.md` for each skill sorted by name, `VERSION` (the version + `\n`) and `README.md` with exactly three paragraphs: `# plgn skills`; "Generated from PLGN-App/PLGN-CLAUDE <version> by `_dev/scripts/portable.mjs`. Do not edit anything here by hand: the next run replaces it."; "Install with `npx plgn-setup`, or `npx skills add PLGN-App/plgn-setup`."
- `main`: `--out <dir>` or `--check` (a fresh `mkdtemp` folder under `os.tmpdir()`, removed afterwards); neither, or a refused `--out` (D8), prints usage on stderr and returns 2; errors print as FAIL lines and return 1 with nothing written; otherwise write, print `<count> skills, <N> rewrites`, return 0. The file runs `process.exitCode = main(process.argv.slice(2))` only when it is the entry script.

Anchors:
- In `.gitignore`, directly after the line `!_dev/scripts/`, add `!_dev/test/` and `!_dev/portable-repo/`; add `dist/` as the last line.

Tests: the test file is Task 3. Builder smoke: on today's tree `node _dev/scripts/portable.mjs --out dist/portable` exits 1 with exactly `FAIL: commands/help.md:78: flagged "Claude Code"` and `FAIL: commands/setup.md:2: flagged "Claude Code"`, and dist/portable is not created. That proves the flag on real text; Task 2 clears it.

Commit: `feat: portable.mjs writes plgn's commands, roles and skills as Agent Skills`

### Task 2: say "your AI tool" where the source said Claude Code

Files:
- Modify: `commands/help.md`
- Modify: `commands/setup.md`
- Modify: `reference/_conventions.md`

What changes: the three places that name Claude Code say "your AI tool", which is true in Claude Code too, so the plugin reads the same there. No validate check quotes these lines (checked). No other source edit; the root `SETUP.md` guide is a different file and is not touched.

Anchors:
- In commands/help.md, replace the line `Just installed or updated plgn? Restart Claude Code first, or the commands` with `Just installed or updated plgn? Restart your AI tool first, or the commands`.
- In commands/setup.md, replace `description: Connect Claude Code to a plgn workspace and prepare a brand` with `description: Connect your AI tool to a plgn workspace and prepare a brand`; the rest of the line stays.
- In reference/_conventions.md, replace

```
> **You haven't restarted** since installing or updating plgn. Restart Claude
> Code and run this again — that fixes it most of the time.
```

with the same two quoted lines ending "Restart your AI" and starting "> tool and run this again" (D2: the line scan cannot see this one).

Tests: before, the Task 1 smoke run exits 1 with the two FAIL lines. After, the same run exits 0 and prints `53 skills, <N> rewrites`; `node _dev/scripts/validate.mjs` still prints `OK: plugin structure valid.`; a search for "Claude Code" in commands, agents, skills and reference returns nothing.

Commit: `fix: help, setup and the conventions say "your AI tool", not Claude Code`

### Task 3: tests for the generator

Files:
- Create: `_dev/test/portable.test.mjs`

What changes: `node:test` and `node:assert/strict`, importing the exports of `../scripts/portable.mjs`. A `before` hook runs `main(["--out", tmp])` on the real repo into an `mkdtemp` folder; `after` removes it. A local helper `fakeRoot(files)` writes a minimal plugin (plugin.json with version, commands, skills; `agents/`; `reference/_conventions.md`) into a temp folder for the failure cases.

Tests (name: what it asserts):
- `one folder per command, role and skill, plus plgn-conventions`: the folder set equals the set derived from plugin.json `commands`, `agents/*.md`, plugin.json `skills` and `plgn-conventions`; the count is their sum; `plgn-product-sheet` and `plgn-role-product-sheet` both exist.
- `frontmatter is a name equal to its folder and a short description`: exactly the keys name and description; name equals the folder, matches the pattern, at most 64; description parses with `JSON.parse`, 1 to 1024 characters.
- `no mcp__ and no flagged word anywhere`: every output file against FLAGGED and `mcp__`.
- `the fixed opening paragraphs`: every role body starts ROLE_PARAGRAPH, blank line, SLASH_PARAGRAPH; every other body starts SLASH_PARAGRAPH; ROLE_PARAGRAPH is in no non-role skill.
- `plgn tool names reach the four roles`: art-director, content-creator and product-sheet roles hold the tools line with `image_view`; the researcher role names `site_read`, `social_fetch`, `place_read`; the copywriter role has no tools line.
- `references point at plgn- names`: plgn-month holds `**plgn-reply-style**`, `` `plgn-role-copywriter` ``, `**plgn-conventions**` and `/plgn month`; plgn-product-sheet holds `` `plgn-role-product-sheet` ``; no file holds `**_conventions**`.
- `applyRewrites changes whole names only`: `**brand-voice**` and "the platform-specs skill" gain `plgn-`; `` `plgn-researcher` `` and "plgn-researcher's" become `plgn-role-researcher`; `/plgn brand`, `/plgn product-sheet` and `plgn-brand-voice` stay; `mcp__plugin_plgn_plgn__image_view` becomes `image_view`; `count` equals the hits.
- `VERSION and README`: VERSION is plugin.json's version plus a newline; README holds the version, `npx plgn-setup` and `npx skills add PLGN-App/plgn-setup`.
- `a second run is byte-identical`: a second `main` into another temp folder; every file is `Buffer.equals`.
- `stale plgn- folders go, other folders stay`: a pre-made `plgn-old/SKILL.md` is gone; a pre-made `my-own-skill/SKILL.md` is unchanged.
- `a flagged word fails with its file and line and writes nothing`: a fake command with "use the Task tool" on line 5; `buildPortable(fake).errors` holds `commands/x.md:5`; `main(["--out", out], fake)` returns 1 and `out` stays empty.
- `limits and sibling files fail`: a 1025-character description and a `notes.md` beside a fake SKILL.md each give an error naming the file.
- `--check passes and a bad --out is refused`: `main(["--check"])` is 0; `main([])` and `main(["--out", <plugin root>/skills])` are 2.

Why they fail before: they are written after Tasks 1 and 2, so they pass on arrival. The builder proves three can fail by a temporary break, then restores: skip the stale delete (the stale test fails), skip ROLE_PARAGRAPH (the paragraphs test fails), drop `Claude Code` from FLAGGED and put back Task 2's setup line (the flagged test fails).

Commit: `test: portable skills generator`

### Task 4: the plgn-setup workflow file

Files:
- Create: `_dev/portable-repo/generate.yml`
- Test: `_dev/test/portable.test.mjs`

What changes: a GitHub Actions workflow for plgn-setup, with a header comment in the publish workflow's style (what it does, that `skills/` is generated and never edited by hand, that it needs no secret).
- `name: generate`; `on:` `schedule: - cron: "17 */6 * * *"` and `workflow_dispatch:`; `permissions: contents: write`; `concurrency: { group: generate-skills, cancel-in-progress: false }`.
- One job on ubuntu-latest: `actions/checkout@v4` with `ref: main`; `actions/setup-node@v4` with node-version 24; no npm install.
- Step "latest plugin tag": `git ls-remote --tags --refs --sort=-v:refname https://github.com/PLGN-App/PLGN-CLAUDE 'refs/tags/v*'`, keep names matching `^v[0-9]+\.[0-9]+\.[0-9]+$`, take the first; none prints "PLGN-CLAUDE has no vX.Y.Z tag yet" and exits 1 (D13); the tag goes to `$GITHUB_OUTPUT`.
- `git clone --depth 1 --branch <tag> https://github.com/PLGN-App/PLGN-CLAUDE "$RUNNER_TEMP/plgn-claude"`, then `node "$RUNNER_TEMP/plgn-claude/_dev/scripts/portable.mjs" --out ./skills`.
- `skills/VERSION` must equal the tag without `v`, or exit 1.
- `git add -A skills`; when `git diff --cached --quiet` succeeds, print "skills unchanged" and stop; otherwise `git -c user.name=PLGN -c user.email=waslahapp993@gmail.com commit -m "skills: regenerated from plugin <version>"` and `git push origin HEAD:main`.

Tests: add at the end of the Task 3 test file `the workflow regenerates from the latest plugin tag and commits as PLGN`: the yml text holds `workflow_dispatch`, `cron: "17 */6 * * *"`, `contents: write`, `https://github.com/PLGN-App/PLGN-CLAUDE`, `refs/tags/v*`, `portable.mjs" --out ./skills`, `user.name=PLGN`, `user.email=waslahapp993@gmail.com`, `skills: regenerated from plugin`, `git push origin HEAD:main`, and no `secrets.`. Fails before: the file does not exist.

Commit: `feat: generate.yml for plgn-setup regenerates skills from the latest plugin tag`

### Task 5: validate runs the check, and the changelog

Files:
- Modify: `_dev/scripts/validate.mjs`
- Modify: `CHANGELOG.md`
- Test: `_dev/test/portable.test.mjs`

What changes: the plugin's own gate covers the portable set; the changelog names both changes. .claude-plugin/plugin.json is not touched.

Anchors:
- In `CHANGELOG.md`, directly after the line `# Changelog`, add a blank line, `## Unreleased`, a blank line and two bullets: "plgn's commands, roles and skills can be used in other AI tools: `_dev/scripts/portable.mjs` writes them as 53 skills in the Agent Skills form, which `npx plgn-setup` installs. Validate checks them too." and "Words that only fitted Claude Code now fit every tool: `/plgn help` and the \"can't reach your workspace\" message say to restart your AI tool, and `/plgn setup` connects your AI tool."
- In _dev/scripts/validate.mjs, directly after the line `import { fileURLToPath } from "node:url";`, add `import { execFileSync } from "node:child_process";`.
- In _dev/scripts/validate.mjs, replace

```
if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`);
```

with a new block headed `// --- 19. Portable skills: every command, role and skill converts ---` that runs `execFileSync(process.execPath, [join(ROOT, "_dev", "scripts", "portable.mjs"), "--check"], { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] })` in try/catch and, on a non-zero exit, calls `fail("portable: " + line)` for each non-empty stderr line with its leading `FAIL: ` removed; then the same two lines, unchanged.

Tests: add `validate runs the portable check` to the Task 3 test file: validate.mjs's text holds `portable.mjs` and `--check`, and running it with `spawnSync(process.execPath, [validate])` exits 0 with `OK: plugin structure valid.`. Fails before: validate.mjs never names portable.mjs. Builder check by hand: put "Task tool" into one command, validate prints a `FAIL: portable: commands/...` line; revert.

Commit: `chore: validate runs the portable check; changelog Unreleased entry`

### Task 6: live proof of the workflow and the skills listing (needs the owner's go)

Files: none.

What changes: nothing in code. After both lanes merge and push (the plgn-setup lane commits `.github/workflows/generate.yml` and the first generation):
- The owner sets the plugin version, then tags `vX.Y.Z` on PLGN-App/PLGN-CLAUDE and pushes the tag (the repo has no `v*` tag today, so the workflow fails until this exists).
- Run `gh workflow run generate.yml -R PLGN-App/plgn-setup` and watch it: a commit by PLGN "skills: regenerated from plugin X.Y.Z", or "skills unchanged" when the lane's first generation already matches. A second run makes no commit.
- `npx skills add PLGN-App/plgn-setup -l` lists the 53 `plgn-*` skills and nothing else.

Tests: the three checks above. No points are spent.

Commit: none.
