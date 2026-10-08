// Tests for the portable-skills generator (_dev/scripts/portable.mjs).
// Run the real generator once on the real repo, then check the output; the
// failure cases use a small fake plugin written into a temp folder.
import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import {
  mkdtempSync, mkdirSync, writeFileSync, readFileSync, readdirSync, existsSync, rmSync, symlinkSync,
} from "node:fs";
import { join, dirname, parse } from "node:path";
import { tmpdir } from "node:os";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import {
  FLAGGED, SLASH_PARAGRAPH, ROLE_PARAGRAPH, applyRewrites, buildPortable, main,
} from "../scripts/portable.mjs";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");
const manifest = JSON.parse(readFileSync(join(ROOT, ".claude-plugin", "plugin.json"), "utf8"));

const base = (p) => p.replace(/^.*\//, "").replace(/\.md$/, "");
const agentNames = readdirSync(join(ROOT, "agents")).filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
const expected = {
  commands: manifest.commands.map((c) => `plgn-${base(c)}`),
  roles: agentNames.map((n) => `plgn-role-${n.replace(/^plgn-/, "")}`),
  skills: manifest.skills.map((s) => `plgn-${base(s)}`),
};
const expectedAll = [...expected.commands, ...expected.roles, ...expected.skills, "plgn-conventions"];

const temps = [];
const tmp = () => { const d = mkdtempSync(join(tmpdir(), "plgn-portable-test-")); temps.push(d); return d; };

// Writes a minimal plugin: files maps a path under the root to its text.
function fakeRoot(files = {}) {
  const root = tmp();
  const all = {
    ".claude-plugin/plugin.json": JSON.stringify({ version: "9.9.9", commands: ["./commands/x.md"], skills: [] }),
    "commands/x.md": "---\ndescription: Does x.\n---\n\nBody of x.\n",
    "agents/.keep": "",
    "reference/_conventions.md": "---\ndescription: The rules.\n---\n\nRule one.\n",
    ...files,
  };
  for (const [rel, text] of Object.entries(all)) {
    mkdirSync(dirname(join(root, rel)), { recursive: true });
    writeFileSync(join(root, rel), text);
  }
  return root;
}

const read = (out, name) => readFileSync(join(out, name, "SKILL.md"), "utf8");
const body = (text) => text.split("\n---\n").slice(1).join("\n---\n").replace(/^\n/, "");

function filesOf(dir, rel = "") {
  const found = [];
  for (const e of readdirSync(join(dir, rel), { withFileTypes: true })) {
    const p = rel ? `${rel}/${e.name}` : e.name;
    if (e.isDirectory()) found.push(...filesOf(dir, p)); else found.push(p);
  }
  return found.sort();
}

let out;
before(() => {
  out = tmp();
  const quiet = console.log;
  console.log = () => {};
  try { assert.equal(main(["--out", out]), 0); } finally { console.log = quiet; }
});
after(() => { for (const d of temps) rmSync(d, { recursive: true, force: true }); });

test("one folder per command, role and skill, plus plgn-conventions", () => {
  const folders = readdirSync(out, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name).sort();
  assert.deepEqual(folders, [...expectedAll].sort());
  assert.equal(folders.length, manifest.commands.length + agentNames.length + manifest.skills.length + 1);
  assert.ok(folders.includes("plgn-product-sheet"));
  assert.ok(folders.includes("plgn-role-product-sheet"));
});

test("frontmatter is a name equal to its folder and a short description", () => {
  for (const name of expectedAll) {
    const lines = read(out, name).split("\n");
    assert.equal(lines[0], "---", name);
    const close = lines.indexOf("---", 1);
    const front = lines.slice(1, close);
    assert.deepEqual(front.map((l) => l.split(":")[0]), ["name", "description"], name);
    assert.equal(front[0], `name: ${name}`);
    assert.match(name, /^[a-z0-9]+(-[a-z0-9]+)*$/);
    assert.ok(name.length <= 64, name);
    const desc = JSON.parse(front[1].slice("description: ".length));
    assert.ok(desc.length >= 1 && desc.length <= 1024, `${name} description length ${desc.length}`);
  }
});

test("no mcp__ and no flagged word anywhere", () => {
  for (const f of filesOf(out)) {
    const text = readFileSync(join(out, f), "utf8");
    for (const word of [...FLAGGED, "mcp__", "Claude Code"]) {
      assert.ok(!text.includes(word), `${f} holds "${word}"`);
    }
  }
});

test("the fixed opening paragraphs", () => {
  for (const name of expectedAll) {
    const b = body(read(out, name));
    if (expected.roles.includes(name)) {
      assert.ok(b.startsWith(`${ROLE_PARAGRAPH}\n\n${SLASH_PARAGRAPH}\n`), name);
    } else {
      assert.ok(b.startsWith(`${SLASH_PARAGRAPH}\n`), name);
      assert.ok(!b.includes(ROLE_PARAGRAPH), `${name} holds the role paragraph`);
    }
  }
});

test("plgn tool names reach the four roles", () => {
  const line = (n) => read(out, n).split("\n").find((l) => l.startsWith("This role uses these plgn tools:"));
  for (const n of ["plgn-role-art-director", "plgn-role-content-creator", "plgn-role-product-sheet"]) {
    assert.ok(line(n)?.includes("`image_view`"), n);
  }
  const r = line("plgn-role-researcher");
  for (const t of ["site_read", "social_fetch", "place_read"]) assert.ok(r?.includes(`\`${t}\``), t);
  assert.equal(line("plgn-role-copywriter"), undefined);
});

test("references point at plgn- names", () => {
  const month = read(out, "plgn-month");
  for (const s of ["**plgn-reply-style**", "`plgn-role-copywriter`", "**plgn-conventions**", "/plgn month"]) {
    assert.ok(month.includes(s), `plgn-month lacks ${s}`);
  }
  assert.ok(read(out, "plgn-product-sheet").includes("`plgn-role-product-sheet`"));
  for (const f of filesOf(out)) {
    assert.ok(!readFileSync(join(out, f), "utf8").includes("**_conventions**"), f);
  }
});

test("applyRewrites changes whole names only", () => {
  const names = { agents: ["plgn-researcher"], skills: ["brand-voice", "platform-specs"] };
  const input = [
    "**brand-voice**", "the platform-specs skill", "`plgn-researcher`", "plgn-researcher's",
    "/plgn brand", "/plgn product-sheet", "plgn-brand-voice", "mcp__plugin_plgn_plgn__image_view",
  ].join("\n");
  const r = applyRewrites(input, names);
  assert.deepEqual(r.text.split("\n"), [
    "**plgn-brand-voice**", "the plgn-platform-specs skill", "`plgn-role-researcher`", "plgn-role-researcher's",
    "/plgn brand", "/plgn product-sheet", "plgn-brand-voice", "image_view",
  ]);
  assert.equal(r.count, 5);
});

test("VERSION and README", () => {
  assert.equal(readFileSync(join(out, "VERSION"), "utf8"), `${manifest.version}\n`);
  const readme = readFileSync(join(out, "README.md"), "utf8");
  for (const s of [manifest.version, "npx plgn-setup", "npx skills add PLGN-App/plgn-setup"]) {
    assert.ok(readme.includes(s), `README lacks ${s}`);
  }
});

test("a second run is byte-identical", () => {
  const again = tmp();
  const quiet = console.log;
  console.log = () => {};
  try { assert.equal(main(["--out", again]), 0); } finally { console.log = quiet; }
  const first = filesOf(out);
  assert.deepEqual(filesOf(again), first);
  for (const f of first) {
    assert.ok(readFileSync(join(out, f)).equals(readFileSync(join(again, f))), f);
  }
});

test("stale plgn- folders go, other folders stay", () => {
  const dir = tmp();
  mkdirSync(join(dir, "plgn-old"));
  writeFileSync(join(dir, "plgn-old", "SKILL.md"), "stale");
  mkdirSync(join(dir, "my-own-skill"));
  writeFileSync(join(dir, "my-own-skill", "SKILL.md"), "mine");
  const quiet = console.log;
  console.log = () => {};
  try { assert.equal(main(["--out", dir]), 0); } finally { console.log = quiet; }
  assert.ok(!existsSync(join(dir, "plgn-old")));
  assert.equal(readFileSync(join(dir, "my-own-skill", "SKILL.md"), "utf8"), "mine");
});

test("a flagged word fails with its file and line and writes nothing", () => {
  const fake = fakeRoot({ "commands/x.md": "---\ndescription: Does x.\n---\n\nline\nuse the Task tool\n" });
  const built = buildPortable(fake);
  assert.ok(built.errors.some((e) => e.startsWith("commands/x.md:6")), built.errors.join("\n"));
  const o = join(tmp(), "out");
  const quiet = console.error;
  console.error = () => {};
  try { assert.equal(main(["--out", o], fake), 1); } finally { console.error = quiet; }
  assert.ok(!existsSync(o) || readdirSync(o).length === 0);
});

test("limits and sibling files fail", () => {
  const long = fakeRoot({ "commands/x.md": `---\ndescription: ${"a".repeat(1025)}\n---\n\nBody.\n` });
  assert.ok(buildPortable(long).errors.some((e) => e.startsWith("commands/x.md:")));

  const sibling = fakeRoot({
    ".claude-plugin/plugin.json": JSON.stringify({ version: "9.9.9", commands: ["./commands/x.md"], skills: ["./skills/s"] }),
    "skills/s/SKILL.md": "---\ndescription: A skill.\n---\n\nBody.\n",
    "skills/s/notes.md": "extra",
  });
  assert.ok(buildPortable(sibling).errors.some((e) => e.includes("skills/s/notes.md")));
});

test("--check passes and a bad --out is refused", () => {
  const quietLog = console.log;
  const quietErr = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    assert.equal(main(["--check"]), 0);
    assert.equal(main([]), 2);
    assert.equal(main(["--out", join(ROOT, "skills")]), 2);
  } finally {
    console.log = quietLog;
    console.error = quietErr;
  }
});

test("the workflow regenerates from the latest plugin tag and commits as PLGN", () => {
  const yml = readFileSync(join(ROOT, "_dev", "portable-repo", "generate.yml"), "utf8");
  for (const piece of [
    "workflow_dispatch",
    'cron: "17 */6 * * *"',
    "contents: write",
    "https://github.com/PLGN-App/PLGN-CLAUDE",
    "refs/tags/v*",
    'portable.mjs" --out ./skills',
    "user.name=PLGN",
    "user.email=waslahapp993@gmail.com",
    "skills: regenerated from plugin",
    "git push origin HEAD:main",
  ]) assert.ok(yml.includes(piece), `generate.yml is missing: ${piece}`);
  assert.ok(!yml.includes("secrets."), "generate.yml must not use a secret");
});

test("validate runs the portable check", () => {
  const validate = join(ROOT, "_dev", "scripts", "validate.mjs");
  const text = readFileSync(validate, "utf8");
  assert.ok(text.includes("portable.mjs"), "validate.mjs never names portable.mjs");
  assert.ok(text.includes("--check"), "validate.mjs never passes --check");
  const run = spawnSync(process.execPath, [validate], { encoding: "utf8" });
  assert.equal(run.status, 0, run.stderr);
  assert.ok(run.stdout.includes("OK: plugin structure valid."));
});

test("--out refuses the plugin, its parent, the drive root and a case-changed parent; keeps foreign plgn-* folders", () => {
  const parent = tmp();
  const fake = join(parent, "plgn-fake");
  mkdirSync(fake);
  for (const [rel, text] of Object.entries({
    ".claude-plugin/plugin.json": JSON.stringify({ version: "9.9.9", commands: ["./commands/x.md"], skills: [] }),
    "commands/x.md": "---\ndescription: Does x.\n---\n\nBody of x.\n",
    "reference/_conventions.md": "---\ndescription: The rules.\n---\n\nRule one.\n",
  })) {
    mkdirSync(dirname(join(fake, rel)), { recursive: true });
    writeFileSync(join(fake, rel), text);
  }
  mkdirSync(join(fake, "agents"));
  const sibling = join(parent, "plgn-sibling-repo");
  mkdirSync(join(sibling, ".git"), { recursive: true });
  writeFileSync(join(sibling, "SKILL.md"), "keep");

  const quietLog = console.log;
  const quietErr = console.error;
  console.log = () => {};
  console.error = () => {};
  try {
    assert.equal(main(["--out", fake], fake), 2);
    assert.equal(main(["--out", parent], fake), 2);
    assert.equal(main(["--out", parse(fake).root], fake), 2);
    if (process.platform === "win32" || process.platform === "darwin") {
      assert.equal(main(["--out", parent.toUpperCase()], fake), 2);
    }
    // a plgn-* folder that is a git checkout survives a normal run
    const out = join(tmp(), "out");
    mkdirSync(join(out, "plgn-mine", ".git"), { recursive: true });
    writeFileSync(join(out, "plgn-mine", "SKILL.md"), "keep");
    assert.equal(main(["--out", out], fake), 0);
    assert.ok(existsSync(join(out, "plgn-mine", "SKILL.md")));
  } finally {
    console.log = quietLog;
    console.error = quietErr;
  }
  assert.ok(existsSync(join(sibling, ".git")));
  assert.ok(existsSync(join(fake, "commands", "x.md")));
});

test("the script runs when started through a link", (t) => {
  const link = join(tmp(), "lane");
  try { symlinkSync(ROOT, link, process.platform === "win32" ? "junction" : "dir"); } catch { t.skip("cannot create a link here"); return; }
  const script = join(link, "_dev", "scripts", "portable.mjs");
  assert.equal(spawnSync(process.execPath, [script], { encoding: "utf8" }).status, 2);
  assert.equal(spawnSync(process.execPath, [script, "--check"], { encoding: "utf8" }).status, 0);
});
