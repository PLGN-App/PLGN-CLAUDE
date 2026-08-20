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
  "brand_archive", "brand_list", "brand_restore", "brand_update", "check_generation",
  "cloudinary_connect", "delete_image", "generate_image", "generate_image_from_image",
  "hashtagset_create", "hashtagset_delete", "hashtagset_list", "hashtagset_update",
  "kie_key_set", "knowledge_add", "knowledge_delete", "knowledge_get", "knowledge_update",
  "list_images", "post_create", "post_delete", "post_get", "post_list", "post_schedule",
  "post_update", "snippet_create", "snippet_delete", "snippet_get", "snippet_list",
  "snippet_update", "topic_create", "topic_delete", "topic_get", "topic_list",
  "topic_update", "upload_image_base64", "upload_image_from_url", "workspace_info",
]);

const FREE = ["demo", "audit", "strategy", "voice", "competitors", "calendar"];
const CONNECTED = ["setup", "brand", "knowledge", "month", "post", "repurpose",
  "topics", "library", "images", "review", "refresh", "report"];

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
      if (url !== "https://app.plgn.dev/api/mcp") fail(`.mcp.json plgn url is "${url}"`);
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
  // Agents must NOT be declared. Verified against `claude plugin details`:
  // an explicit "agents" array of file paths suppresses discovery entirely
  // (inventory reported "Agents (0)" with all 7 files present on disk).
  // Omitting the key lets the loader discover agents/*.md — reported 7/7.
  // "commands", by contrast, MUST stay declared: without it the loader reads
  // commands/*.md as skills (inventory jumped to "Skills (26)").
  if (manifest.agents) {
    fail(`plugin.json must not declare "agents" — it suppresses agent discovery; delete the key`);
  }
  if (!manifest.commands) {
    fail(`plugin.json must declare "commands" — without it, command files are loaded as skills`);
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
// connected command may legitimately mention app.plgn.dev when telling an
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
} else {
  const seam = read(`skills/${SEAM_SKILL}/SKILL.md`);
  if (!seam.includes("app.plgn.dev")) {
    fail(`skills/${SEAM_SKILL}/SKILL.md must contain the app.plgn.dev link`);
  }
  // Two variants exist because analysis commands produce no posts to schedule.
  // Closing an audit with the draft block reads as nonsense — found by running
  // /plgn audit for real. Every free command must be routed to one variant.
  for (const v of ["Draft close", "Analysis close"]) {
    if (!seam.includes(v)) fail(`skills/${SEAM_SKILL}/SKILL.md is missing the "${v}" block`);
  }
  for (const c of FREE) {
    if (!seam.includes(`\`${c}\``)) {
      fail(`skills/${SEAM_SKILL}/SKILL.md does not route \`${c}\` to a seam variant`);
    }
  }
}
// And each free command must name which variant it uses.
for (const c of FREE) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p).toLowerCase();
  if (!body.includes("draft close") && !body.includes("analysis close")) {
    fail(`${p}: must name which seam variant it closes with (draft close / analysis close)`);
  }
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
