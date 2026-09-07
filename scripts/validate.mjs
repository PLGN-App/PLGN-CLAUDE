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
  "topics", "library", "images", "queue", "refresh", "report"];
// `help` is neither free nor connected: it calls nothing and carries no seam.
const NEITHER = ["help"];

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
// Knowledge type values are API literals that happen to match the tool-name
// shape. They are not tools, and every file that documents storage names them.
const KNOWLEDGE_TYPES = new Set([
  "brand_voice", "competitor_data", "seo_guidelines", "example_article",
]);
for (const p of CONTENT) {
  const body = read(p);
  for (const m of body.matchAll(/`([a-z]+_[a-z0-9_]+)`/g)) {
    const name = m[1];
    if (KNOWLEDGE_TYPES.has(name)) continue;
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
} else {
  const seam = read(`skills/${SEAM_SKILL}/SKILL.md`);
  if (!seam.includes("useplgn.com")) {
    fail(`skills/${SEAM_SKILL}/SKILL.md must contain the useplgn.com link`);
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

// --- 5b. Reply style is declared, referenced, and consistently shaped ---
// Added after a review found six different confirmation prompts across the
// commands, and no rule anywhere about the language or reading level of the
// replies themselves. These checks keep both from drifting back.
{
  const declared = new Set([...FREE, ...CONNECTED, ...NEITHER]);
  for (const f of ls("commands")) {
    if (!f.endsWith(".md") || f === "_conventions.md") continue;
    const name = f.replace(/\.md$/, "");
    if (!declared.has(name)) {
      fail(`commands/${f}: not listed as free, connected, or neither in validate.mjs`);
    }
  }

  const conv = exists("commands/_conventions.md") ? read("commands/_conventions.md") : "";
  if (!conv.includes("reply-style")) {
    fail("commands/_conventions.md must point at the reply-style skill");
  }

  const rs = "skills/reply-style/SKILL.md";
  if (!exists(rs)) {
    fail(`${rs} is missing — nothing owns how plgn talks to the user`);
  } else {
    const body = read(rs);
    for (const fmt of ["yes / pick / no", "yes / edit / no"]) {
      if (!body.includes(fmt)) fail(`${rs} must define the "${fmt}" question format`);
    }
  }

  // Only two question formats are allowed. These are the shapes the review
  // found in the wild; each one is a command inventing its own vocabulary.
  const BAD_PROMPTS = ["(y / ", "(y/n)", "(y / n)", "Proceed?"];
  for (const f of ls("commands")) {
    if (!f.endsWith(".md")) continue;
    const body = read(`commands/${f}`);
    for (const bad of BAD_PROMPTS) {
      if (body.includes(bad)) {
        fail(`commands/${f}: uses "${bad}" — the only question formats are "yes / pick / no" and "yes / edit / no"`);
      }
    }
  }
}

// --- 6. No credential handling ----------------------------------------
for (const p of CONTENT) {
  const body = read(p).toLowerCase();
  for (const phrase of ["ask the user for their api key", "paste your token", "store the token"]) {
    if (body.includes(phrase)) fail(`${p}: must not handle credentials ("${phrase}")`);
  }
}

// --- 7. Where brand knowledge lives ------------------------------------
// Added after finding that /plgn setup saved banned words with knowledge_add
// while the server-side gate reads them from the brand record. A brand set up
// that way holds a banned-word list nothing enforces.
{
  const MAP = "skills/brand-knowledge-map/SKILL.md";
  if (!exists(MAP)) {
    fail(`${MAP} is missing — nothing owns where brand knowledge is stored`);
  } else {
    const body = read(MAP);
    if (!body.includes("brand_update")) {
      fail(`${MAP} must name \`brand_update\` as where banned words are written`);
    }
    for (const t of ["brand_voice", "competitor_data", "seo_guidelines", "example_article"]) {
      if (!body.includes(t)) fail(`${MAP} must list the knowledge type "${t}"`);
    }
  }

  // No file may instruct saving banned words with knowledge_add. The map skill
  // itself is exempt: it states the rule, so it necessarily names both.
  const near = (body, a, b, window) => {
    for (const m of body.matchAll(new RegExp(a, "gi"))) {
      const from = Math.max(0, m.index - window);
      const slice = body.slice(from, m.index + m[0].length + window);
      if (new RegExp(b, "i").test(slice)) return true;
    }
    return false;
  };
  for (const p of CONTENT) {
    if (p === MAP) continue;
    if (near(read(p), "banned word", "knowledge_add", 200)) {
      fail(`${p}: banned words are written with \`brand_update\`, never \`knowledge_add\``);
    }
  }

  // The two-step remote-image path was established by running both tools:
  // WebFetch on an image URL answers "NO IMAGE VISIBLE" but saves the binary
  // locally, and Read on that saved path does see the image. Without this
  // written down, a later contributor concludes remote references are
  // impossible and quietly drops half the feature.
  const VIS = "skills/visual-identity/SKILL.md";
  if (!exists(VIS)) {
    fail(`${VIS} is missing — nothing owns the brand's look`);
  } else {
    const body = read(VIS);
    if (!(body.includes("WebFetch") && body.includes("Read"))) {
      fail(`${VIS} must document the two-step remote-image path (WebFetch, then Read the saved file)`);
    }
    if (!body.includes("generate_image_from_image")) {
      fail(`${VIS} must say how the canonical reference feeds \`generate_image_from_image\``);
    }
  }

  // Agents are discovered from disk, never declared in the manifest, so a
  // missing or renamed agent file fails silently at runtime. This list is the
  // only place that notices.
  const AGENTS = [
    "plgn-analyst", "plgn-art-director", "plgn-brand-architect", "plgn-brand-guard",
    "plgn-copywriter", "plgn-librarian", "plgn-researcher", "plgn-scheduler",
    "plgn-strategist", "plgn-visual",
  ];
  const onDisk = ls("agents").filter((f) => f.endsWith(".md")).map((f) => f.replace(/\.md$/, ""));
  for (const a of AGENTS) {
    if (!onDisk.includes(a)) fail(`agents/${a}.md is missing`);
  }
  for (const a of onDisk) {
    if (!AGENTS.includes(a)) fail(`agents/${a}.md is not listed in validate.mjs AGENTS`);
  }

  // Skills on disk must be registered. The existing check runs manifest →
  // disk; a skill that is written but never listed loads for nobody.
  if (manifest) {
    const listedSkills = new Set((manifest.skills ?? []).map((r) => r.replace(/^\.\//, "")));
    for (const d of ls("skills")) {
      if (!listedSkills.has(`skills/${d}`)) {
        fail(`skills/${d} exists on disk but is not in plugin.json`);
      }
    }
  }
}

if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`);
  console.error(`\n${fails.length} problem(s).`);
  process.exit(1);
}
console.log("OK: plugin structure valid.");
