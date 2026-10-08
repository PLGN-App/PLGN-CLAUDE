#!/usr/bin/env node
// Turns the plugin's commands, roles, skills and conventions into Agent Skills
// folders named plgn-*, so any AI tool can read them (not only Claude Code).
// Not part of the shipped plugin surface. Node built-ins only: the plgn-setup
// workflow runs it from a bare clone with no npm install.
import {
  readFileSync, readdirSync, existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync,
} from "node:fs";
import { join, dirname, resolve, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { tmpdir } from "node:os";

const PLUGIN_ROOT = join(dirname(fileURLToPath(import.meta.url)), "..", "..");

export const FLAGGED = [
  "Task tool", "subagent_type", "AskUserQuestion", "TodoWrite", "claude plugin",
  "/plugin ", ".claude-plugin", "plgn:plgn-", "Claude Code",
];

export const SLASH_PARAGRAPH =
  "`/plgn <name>` in this text means the plgn-<name> skill. In a tool without slash commands, ask for it by name.";
export const ROLE_PARAGRAPH =
  "This is a role another plgn skill starts. A tool with subagents runs it as one; a tool without runs it in this conversation, one role at a time, then returns to the skill that asked.";

const MCP_PREFIX = "mcp__plugin_plgn_plgn__";
const NAME_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

const escapeRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// Whole-token match: the character before is not [A-Za-z0-9_/-], the one after is not [A-Za-z0-9_-].
function tokenRewrite(text, names, make) {
  let count = 0;
  for (const name of names) {
    const re = new RegExp(`(?<![A-Za-z0-9_/-])${escapeRe(name)}(?![A-Za-z0-9_-])`, "g");
    text = text.replace(re, () => { count++; return make(name); });
  }
  return { text, count };
}

function literalRewrite(text, from, to) {
  const parts = text.split(from);
  return { text: parts.join(to), count: parts.length - 1 };
}

// Rewrites never add or remove a line, so a line number in the output is the source line.
export function applyRewrites(text, names) {
  let count = 0;
  const step = (r) => { count += r.count; text = r.text; };
  step(literalRewrite(text, MCP_PREFIX, ""));
  step(tokenRewrite(text, names.agents, (n) => `plgn-role-${n.replace(/^plgn-/, "")}`));
  step(tokenRewrite(text, names.skills, (n) => `plgn-${n}`));
  step(literalRewrite(text, "**_conventions**", "**plgn-conventions**"));
  return { text, count };
}

function readUtf8(path) {
  return readFileSync(path, "utf8").replace(/\r\n/g, "\n");
}

// Splits a source file into its description, its plgn tools and its body.
// bodyLine is the 1-based source line of body[0]. problems are "line: what" strings.
function parseSource(text) {
  const lines = text.split("\n");
  const problems = [];
  if (lines[0] !== "---") return { problems: ["1: no frontmatter"] };
  const close = lines.indexOf("---", 1);
  if (close === -1) return { problems: ["1: frontmatter is never closed"] };
  const front = lines.slice(1, close);

  let descLine = 0;
  let description = "";
  const descAt = front.findIndex((l) => l.startsWith("description:"));
  if (descAt === -1) {
    problems.push("1: description is missing");
  } else {
    descLine = descAt + 2;
    description = front[descAt].slice("description:".length).trim();
    const next = front[descAt + 1];
    if (description === "") problems.push(`${descLine}: description is empty`);
    else if (/^[>|]/.test(description)) problems.push(`${descLine}: description must be one line, not a block`);
    else if (/^["']/.test(description)) problems.push(`${descLine}: description must not be quoted`);
    else if (next !== undefined && /^\s+\S/.test(next)) problems.push(`${descLine}: description must be one line`);
  }

  const tools = [];
  const toolsAt = front.findIndex((l) => /^tools:/.test(l));
  if (toolsAt !== -1) {
    const inline = front[toolsAt].slice("tools:".length).trim().replace(/^\[|\]$/g, "");
    if (inline) tools.push(...inline.split(",").map((s) => s.trim()).filter(Boolean));
    for (let i = toolsAt + 1; i < front.length; i++) {
      const m = /^\s+-\s+(\S+)\s*$/.exec(front[i]);
      if (!m) break;
      tools.push(m[1]);
    }
  }

  let start = close + 1;
  while (start < lines.length && lines[start].trim() === "") start++;
  const body = lines.slice(start).join("\n").trimEnd();
  return { description, descLine, tools, body, bodyLine: start + 1, problems };
}

export function buildPortable(root = PLUGIN_ROOT) {
  const errors = [];
  const skills = [];
  let rewrites = 0;

  const manifest = JSON.parse(readUtf8(join(root, ".claude-plugin", "plugin.json")));
  const baseOf = (p) => p.replace(/^.*\//, "").replace(/\.md$/, "");

  const agentFiles = readdirSync(join(root, "agents")).filter((f) => f.endsWith(".md")).sort();
  const agentNames = agentFiles.map((f) => f.replace(/\.md$/, ""));
  const skillFolders = (manifest.skills || []).map((s) => s.replace(/^\.\//, ""));
  const names = {
    agents: agentNames,
    skills: skillFolders.map((s) => s.replace(/^skills\//, "")),
  };

  const sources = [];
  for (const c of manifest.commands || []) {
    const rel = c.replace(/^\.\//, "");
    sources.push({ name: `plgn-${baseOf(rel)}`, kind: "command", source: rel });
  }
  for (const f of agentFiles) {
    sources.push({ name: `plgn-role-${f.replace(/^plgn-/, "").replace(/\.md$/, "")}`, kind: "role", source: `agents/${f}` });
  }
  for (const s of skillFolders) {
    const folder = join(root, s);
    if (existsSync(folder)) {
      for (const entry of readdirSync(folder).sort()) {
        if (entry !== "SKILL.md") errors.push(`${s}/${entry}: a file beside SKILL.md`);
      }
    }
    sources.push({ name: `plgn-${s.replace(/^skills\//, "")}`, kind: "skill", source: `${s}/SKILL.md` });
  }
  sources.push({ name: "plgn-conventions", kind: "conventions", source: "reference/_conventions.md" });

  const seen = new Set();
  for (const src of sources) {
    const path = join(root, src.source);
    if (!existsSync(path)) { errors.push(`${src.source}:1: source file is missing`); continue; }
    const parsed = parseSource(readUtf8(path));
    for (const p of parsed.problems) errors.push(`${src.source}:${p}`);
    if (parsed.problems.length && parsed.body === undefined) continue;

    if (!NAME_RE.test(src.name) || src.name.length > 64) errors.push(`${src.source}:1: bad skill name "${src.name}"`);
    if (seen.has(src.name)) errors.push(`${src.source}:1: two skills named "${src.name}"`);
    seen.add(src.name);

    const desc = applyRewrites(parsed.description || "", names);
    const body = applyRewrites(parsed.body || "", names);
    rewrites += desc.count + body.count;
    if (desc.text.length > 1024) errors.push(`${src.source}:${parsed.descLine}: description is longer than 1024 characters`);

    const scan = (line, n) => {
      for (const word of [...FLAGGED, "mcp__"]) {
        if (line.includes(word)) errors.push(`${src.source}:${n}: flagged "${word}"`);
      }
    };
    if (parsed.descLine) scan(desc.text, parsed.descLine);
    body.text.split("\n").forEach((line, i) => scan(line, parsed.bodyLine + i));

    const parts = ["---", `name: ${src.name}`, `description: ${JSON.stringify(desc.text)}`, "---", ""];
    if (src.kind === "role") parts.push(ROLE_PARAGRAPH, "");
    parts.push(SLASH_PARAGRAPH, "");
    if (src.kind === "role") {
      const plain = (parsed.tools || []).filter((t) => t.startsWith(MCP_PREFIX)).map((t) => t.slice(MCP_PREFIX.length));
      if (plain.length) {
        rewrites += plain.length;
        parts.push(`This role uses these plgn tools: ${plain.map((t) => `\`${t}\``).join(", ")}.`, "");
      }
    }
    parts.push(body.text);
    skills.push({ ...src, text: `${parts.join("\n")}\n` });
  }

  skills.sort((a, b) => (a.name < b.name ? -1 : a.name > b.name ? 1 : 0));
  return { version: manifest.version, skills, rewrites, errors };
}

export function writePortable(outDir, built) {
  mkdirSync(outDir, { recursive: true });
  for (const e of readdirSync(outDir, { withFileTypes: true })) {
    if (e.isDirectory() && e.name.startsWith("plgn-")) rmSync(join(outDir, e.name), { recursive: true, force: true });
  }
  for (const s of built.skills) {
    mkdirSync(join(outDir, s.name), { recursive: true });
    writeFileSync(join(outDir, s.name, "SKILL.md"), s.text);
  }
  writeFileSync(join(outDir, "VERSION"), `${built.version}\n`);
  writeFileSync(join(outDir, "README.md"), [
    "# plgn skills",
    "",
    `Generated from PLGN-App/PLGN-CLAUDE ${built.version} by \`_dev/scripts/portable.mjs\`. Do not edit anything here by hand: the next run replaces it.`,
    "",
    "Install with `npx plgn-setup`, or `npx skills add PLGN-App/plgn-setup`.",
    "",
  ].join("\n"));
}

const USAGE = "usage: node _dev/scripts/portable.mjs --out <dir> | --check";

// --out must not be able to wipe the plugin's own sources.
function refusedOut(out, root) {
  const inside = (p, dir) => p === dir || p.startsWith(dir + sep);
  if (inside(root, out)) return true;
  return ["commands", "agents", "skills", "reference"].some((d) => inside(out, join(root, d)));
}

export function main(argv, root = PLUGIN_ROOT) {
  const check = argv.includes("--check");
  const outAt = argv.indexOf("--out");
  const outArg = outAt === -1 ? undefined : argv[outAt + 1];
  if ((!check && !outArg) || (check && outAt !== -1)) { console.error(USAGE); return 2; }

  let out;
  if (!check) {
    out = resolve(process.cwd(), outArg);
    if (refusedOut(out, resolve(root))) { console.error(`${USAGE}\n--out may not be the plugin or its sources: ${out}`); return 2; }
  }

  const built = buildPortable(root);
  if (built.errors.length) {
    for (const e of built.errors) console.error(`FAIL: ${e}`);
    return 1;
  }
  if (check) {
    const tmp = mkdtempSync(join(tmpdir(), "plgn-portable-"));
    try { writePortable(tmp, built); } finally { rmSync(tmp, { recursive: true, force: true }); }
  } else {
    writePortable(out, built);
  }
  console.log(`${built.skills.length} skills, ${built.rewrites} rewrites`);
  return 0;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  process.exitCode = main(process.argv.slice(2));
}
