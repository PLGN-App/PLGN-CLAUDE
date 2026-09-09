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

const FREE = ["demo", "audit", "strategy", "voice", "competitors", "calendar"];
const CONNECTED = ["setup", "brand", "knowledge", "month", "post", "repurpose",
  "topics", "library", "images", "queue", "refresh", "report", "visuals", "brandkit", "undo"];
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
// The four names the taxonomy replaced. Still exempted from the tool-name
// check while the rest of this plugin is converted, task by task. Task 9
// deletes this set and adds the check that no file names one at all — a
// check that can only pass once every file is clean.
const LEGACY_TYPES_BEING_REMOVED = new Set([
  "brand_voice", "competitor_data", "seo_guidelines", "example_article",
]);
// Names that share a tool's prefix but are arguments passed *to* a tool,
// never tools themselves. Real parameters on knowledge_get, context_get,
// post_create, post_list, campaign_create and knowledge_history — not
// speculation. Kept explicit rather than a pattern like "anything ending in
// `_id`/`_ids`", which would let a genuinely invented tool through.
const NON_TOOL_NAMES = new Set([
  "campaign_id", "offering_id", "offering_ids", "topic_id", "topic_ids", "knowledge_id",
]);
for (const p of CONTENT) {
  const body = read(p);
  for (const m of body.matchAll(/`([a-z]+_[a-z0-9_]+)`/g)) {
    const name = m[1];
    if (KNOWLEDGE_TYPES.has(name) || LEGACY_TYPES_BEING_REMOVED.has(name) || NON_TOOL_NAMES.has(name)) continue;
    // `offering_get` does not exist, and a file naming it is almost always
    // inventing a tool — except the map itself, which has to name it in
    // order to say so ("there is no `offering_get`"). Exempt only there.
    if (name === "offering_get" && p === "skills/brand-knowledge-map/SKILL.md") continue;
    // only judge names that look like plgn tools: a known prefix
    if (/^(brand|campaign|check|cloudinary|context|delete|generate|hashtagset|kie|knowledge|list|offering|post|snippet|topic|upload|workspace)_/.test(name)
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
    //
    // Replaced 2026-09-09: this used to be a proximity regex (`campaign`
    // within 300 chars of `reference`, either order). It passed on the
    // pre-rewrite file for the wrong reason -- "reference" matched as a bare
    // substring inside "canonicalReference", which happened to sit near an
    // unrelated sentence ("a series, a campaign, a carousel"). That file said
    // nothing about campaign-scoped looks at all, so the check would have
    // sat quietly through the exact regression it exists to catch. Keying on
    // the backticked type name and the `intent` key the server requires ties
    // the check to the actual contract instead of two English words that can
    // occur together by accident.
    if (!(/`reference`/.test(body) && body.includes("intent"))) {
      fail(`${VIS} must say a campaign look is a Campaign plus a \`reference\` entry carrying an \`intent\``);
    }
  }

  // Three things that were each written somewhere and read nowhere. Every one
  // of them failed silently: locales saved and never used, a timezone the
  // cadence skill assumed but nothing captured, and posts written in bulk with
  // no way to find them again.
  {
    const cadence = "skills/posting-cadence/SKILL.md";
    if (exists(cadence) && !read(cadence).includes("brand-knowledge-map")) {
      fail(`${cadence} names a timezone, so it must point at where one is stored`);
    }
    const rs = "skills/reply-style/SKILL.md";
    if (exists(rs) && !read(rs).includes("Progress is not a log")) {
      fail(`${rs} must define what a long job may print while it works`);
    }
    for (const c of ["month", "post"]) {
      const p = `commands/${c}.md`;
      if (exists(p) && !/languages/i.test(read(p))) {
        fail(`${p}: writes copy, so it must read the brand's languages`);
      }
    }
  }

  // help.md is the only place a user discovers a command. A command missing
  // from it is a command nobody runs.
  if (exists("commands/help.md")) {
    const help = read("commands/help.md");
    for (const c of [...FREE, ...CONNECTED]) {
      if (!help.includes(c)) fail(`commands/help.md does not list \`${c}\``);
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
