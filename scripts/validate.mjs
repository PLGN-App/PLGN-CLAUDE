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
const CONNECTED = ["setup", "brand", "campaign", "knowledge", "month", "post", "repurpose",
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

  // The counts `claude plugin details plgn` reports for an installed copy.
  // Asserted here, on the tree, rather than read off the installed plugin:
  // an installed copy can lag the working tree by a release (it resolves
  // the published version), and this CLI's own inventory output does not
  // print a command count at all. Commands already have both directions of
  // manifest/disk agreement checked just above; skills have theirs checked
  // elsewhere in this file (section 7, "Skills on disk must be registered").
  // Those checks prove the two sides match each other; they do not pin what
  // they add up to, so a file added or removed without updating plugin.json
  // or the agent roster could still keep both sides consistent with each
  // other but wrong in absolute terms. These three numbers pin that.
  const EXPECTED_COMMAND_COUNT = 23;
  const EXPECTED_SKILL_COUNT = 11;
  const EXPECTED_AGENT_COUNT = 10;
  if ((manifest.commands ?? []).length !== EXPECTED_COMMAND_COUNT) {
    fail(`plugin.json commands array has ${(manifest.commands ?? []).length} entries, expected ${EXPECTED_COMMAND_COUNT}`);
  }
  if ((manifest.skills ?? []).length !== EXPECTED_SKILL_COUNT) {
    fail(`plugin.json skills array has ${(manifest.skills ?? []).length} entries, expected ${EXPECTED_SKILL_COUNT}`);
  }
  const agentFileCount = ls("agents").filter((f) => f.endsWith(".md")).length;
  if (agentFileCount !== EXPECTED_AGENT_COUNT) {
    fail(`agents/*.md has ${agentFileCount} files on disk, expected ${EXPECTED_AGENT_COUNT}`);
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
// The one file allowed to name a type the taxonomy replaced. It is the file
// that explains the old names exist and that nothing else writes them --
// see the exemption in section 4 below and the enforcement in section 10 at
// the end of this file. Both key off this same path and the same list so
// there is one place to update if either the file or the list ever moves.
const MAP_SKILL_PATH = "skills/brand-knowledge-map/SKILL.md";
const REPLACED_TYPES = ["brand_voice", "competitor_data", "seo_guidelines", "example_article"];
const MAP_ONLY_LEGACY_TYPES = new Set(REPLACED_TYPES);
// Knowledge type values are API literals that happen to match the tool-name
// shape, and two of them (`brand_identity`, `brand_positioning`) would
// otherwise be read as unknown `brand_*` tools. The four replaced legacy
// names are NOT here: after 1.4.0 no file but the map may write one, and
// section 10 fails any other file that names one.
const KNOWLEDGE_TYPES = new Set([
  "brand_identity", "brand_positioning", "voice_tone", "audience",
  "visual_rules", "creative_rules",
  "promotion", "proof", "objection", "competitor", "market_context",
  "seo_rules", "platform_rules",
  "reference", "approved_execution", "example_post",
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
    if (KNOWLEDGE_TYPES.has(name) || NON_TOOL_NAMES.has(name)) continue;
    // `offering_get` does not exist, and a file naming it is almost always
    // inventing a tool — except the map itself, which has to name it in
    // order to say so ("there is no `offering_get`"). Exempt only there.
    if (name === "offering_get" && p === MAP_SKILL_PATH) continue;
    // `brand_voice` collides with the judged `brand_` prefix below (the
    // other three replaced names do not share a prefix section 4 judges, so
    // they never reach this far). The map alone may name it, for the same
    // reason as `offering_get` above: it is the file that explains the name
    // exists and that nothing else writes it. Section 10 enforces that no
    // other file does.
    if (MAP_ONLY_LEGACY_TYPES.has(name) && p === MAP_SKILL_PATH) continue;
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
  const BAD_PROMPTS = ["(y / ", "(y/n)", "(y / n)", "Proceed?", "yes / no"];
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

// --- 5c. Commands that must never take --yes -------------------------
// _conventions rule 4 names these; nothing checked it. A `--yes` on a
// command that spends credits or writes in bulk turns one typo into a
// month of posts.
//
// The original check was file-wide: --yes mentioned, and no refusal word
// ("not accepted", "never accepted", "refuses") anywhere in the whole file.
// "refuses" turns up in two commands for reasons that have nothing to do
// with flags -- campaign.md's "If the cap refuses it, follow the
// gate-recovery skill" and brandkit.md's "the words this brand refuses to
// use" -- so both files were clearing this check on an unrelated sentence,
// not on their actual --yes refusal. Proven by mutation: rewriting
// campaign.md's "`--yes` is not accepted." to "`--yes` is accepted here and
// skips the question." left the old check green (see final-fix-report.md for
// the trace). Nine of the eleven NO_YES commands were protected only by the
// accident of not containing the word "refuses" at all.
//
// Fixed by checking what all eleven files actually say rather than binding
// more tightly to the same words: every one contains the literal phrase
// "`--yes` is not accepted" (two extend it -- "...by this command." -- but
// the phrase itself is verbatim in all eleven). Requiring that exact string
// means the mutation above now fails, naming the file, because the mutated
// sentence no longer contains it.
const NO_YES = ["month", "images", "visuals", "brandkit", "undo", "repurpose",
  "refresh", "library", "brand", "knowledge", "campaign"];
{
  const conv = exists("commands/_conventions.md") ? read("commands/_conventions.md") : "";
  for (const c of NO_YES) {
    if (!conv.includes(`\`${c}\``)) {
      fail(`commands/_conventions.md rule 4 does not list \`${c}\` among the commands that refuse --yes`);
    }
    const p = `commands/${c}.md`;
    if (exists(p) && !read(p).includes("`--yes` is not accepted")) {
      fail(`${p}: must say "\`--yes\` is not accepted" — a refusal worded any other way is not provably a --yes refusal`);
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
    if (exists(cadence)) {
      const body = read(cadence);
      if (!body.includes("brand-knowledge-map")) {
        fail(`${cadence} names a timezone, so it must point at where one is stored`);
      }
      // It moved. A cadence skill still describing a `Publishing` entry sends
      // every scheduling command to read a place that no longer holds it.
      if (!body.includes("brand_list")) {
        fail(`${cadence} must say the timezone comes from the brand record, printed by \`brand_list\``);
      }
      if (/Publishing/.test(body)) {
        fail(`${cadence} still describes the old \`Publishing\` knowledge entry`);
      }
    }

    // The five refusals that are not gate failures. Each one is an
    // instruction the command must act on, and each one used to be reported
    // to the user as a failure because nothing said otherwise.
    //
    // Keyed on the server's own error wording, quoted in each refusal's
    // bolded header — not on a single common word. An earlier version of this
    // check looked for "confirm", "already" and "cap": those match ordinary
    // prose ("capacity", "recap", "already holds") and would still pass with
    // the refusal itself deleted. Tested by deleting each refusal in turn and
    // confirming this fails naming it (see task-3-report.md).
    const gr = "skills/gate-recovery/SKILL.md";
    if (exists(gr)) {
      const body = read(gr);
      for (const needle of [
        "needs confirm",
        "already has a",
        "offers belong in an offering",
        "a publishing time needs a timezone",
        "cap reached",
      ]) {
        if (!body.includes(needle)) {
          fail(`${gr} must cover the refusal "${needle}"`);
        }
      }
    }

    const rs = "skills/reply-style/SKILL.md";
    if (exists(rs) && !read(rs).includes("Progress is not a log")) {
      fail(`${rs} must define what a long job may print while it works`);
    }
    // Four more internal words. Every one of them is a thing the server
    // calls something and a person calls nothing.
    if (exists(rs)) {
      const body = read(rs);
      for (const word of ["context_get", "singleton", "revision", "metadata"]) {
        if (!body.includes(word)) {
          fail(`${rs} must list "${word}" among the words that never reach the user`);
        }
      }
      // But the three layer names ARE allowed: the dashboard prints them, so
      // a reply that avoids them describes a screen the user cannot find.
      // All three names, not just "Foundation", must sit near the allow-word
      // — otherwise a file that dropped "Business" and "Creative" still passes.
      if (!/Foundation[\s\S]{0,100}Business[\s\S]{0,100}Creative[\s\S]{0,200}(allowed|fine|are words)/i.test(body)) {
        fail(`${rs} must say all three layer names (Foundation, Business, Creative) are allowed`);
      }
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

// --- 7b. Every command that drafts copy reads the brand in one call, and
// hands what it read to the writer ---------------------------------------
// Four commands write words in a brand's voice. Each used to assemble the
// brand itself from brand_list plus a couple of knowledge_get calls, and
// each assembled a slightly different brand -- one read the audience, one
// did not, none read what the brand sells. context_get is one read in a
// fixed order, and it is the order that matters: Foundation first, because
// nothing overrides it.
//
// Three separate assertions here, not one. Originally this was two: a
// presence check for `context_get`, and a proximity check
// (`context_get[\s\S]{0,120}copywriter`) whose fail message claimed the
// file "must pass the copywriter's own block to its writers" -- but the
// regex is satisfied by the read call alone: `context_get(role:
// "copywriter")` puts both words a few characters apart with no writer
// prompt anywhere nearby. Reverting a file's pass-through sentence back to
// the pre-Task-7 wording ("put the voice, the banned words... into the
// prompt") left that check green, because the read line was never touched.
// Confirmed by doing exactly that to post.md and refresh.md in turn and
// watching this check fail to notice; see task-7-report.md for both traces.
//
// Split into what each actually tests:
//   1. the file reads the brand at all (`context_get`)
//   2. that read uses the copywriter's own role, not a proximate word
//      (`context_get(role: "copywriter"` as a literal call, not two tokens
//      loose in the same paragraph)
//   3. the file then instructs passing that block into the writer's prompt
//      -- keyed on "verbatim" next to "prompt", the word a file that lists
//      the voice, the banned words and the rest as separate items would not
//      contain. Passing the whole block unmodified and re-typing its
//      fields are different instructions, and only the first one is what
//      the copywriter's contract (Task 6) and commands/_conventions.md
//      rule 6 require, since the agent cannot read anything else.
const DRAFTS_COPY = ["month", "post", "repurpose", "refresh"];
for (const c of DRAFTS_COPY) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p);
  if (!body.includes("context_get")) {
    fail(`commands/${c}.md drafts copy, so it must read the brand with \`context_get\``);
  }
  if (!/context_get\(role:\s*["']copywriter["']/.test(body)) {
    fail(`commands/${c}.md must read the brand for its writer with \`context_get(role: "copywriter")\``);
  }
  if (!/prompt\s+verbatim/i.test(body)) {
    fail(`commands/${c}.md must instruct passing the \`context_get\` block into the writer's prompt verbatim, not reassembled from named parts`);
  }
}

// --- 7c. Onboarding writes the current types ---------------------------
// Onboarding writes the four Foundation singletons and the offerings. If
// its skill or its command still names a legacy type, a fresh brand is set
// up in the old shape and every later command reads a brand that is not
// there.
for (const p of ["skills/brand-onboarding/SKILL.md", "commands/setup.md"]) {
  if (!exists(p)) { fail(`missing file: ${p}`); continue; }
  const body = read(p);
  for (const t of ["voice_tone", "audience", "offering_create", "brand_update"]) {
    if (!body.includes(t)) fail(`${p} must name \`${t}\``);
  }
  // Keyed on the literal parameter, not the bare word "confirm" -- that was
  // the original check here, and it was the "cap"/"already" mistake task 3
  // already had to fix: both files contain "confirm" for reasons that have
  // nothing to do with Foundation writes ("confirmations", "confirm rather
  // than assuming", "then confirmed"), so the bare word passed even with
  // every real `confirm: true` deleted. `confirm: true` does not occur in
  // either file by accident. Tested by deleting it from each file in turn;
  // see task-4-report.md for the traces.
  if (!body.includes("confirm: true")) {
    fail(`${p} writes Foundation entries, so it must say when to pass \`confirm: true\``);
  }
}

// --- 8. Agent contracts (Task 6) ----------------------------------------
// The four agents whose contract changed. An agent's output shape is read
// by the command that started it, and a shape that drifts fails at the
// point the command tries to save -- after the model has already done the
// work.
// The brand-architect needle was originally the bare word "kind" -- ordinary
// English prose, and nothing stops a future edit from dropping the real
// `kind: product | service` field while leaving some unrelated "kind" behind
// (or vice versa: dropping the field while an unrelated "kind" survives, and
// the check stays green). Keyed instead on `"kind":` -- the quoted-key-plus-
// colon exactly as it appears in the Offerings JSON -- which ordinary prose
// does not produce by accident. Tested by deleting the `"kind"` line from
// that JSON block and confirming this fails naming the file (see
// task-6-report.md, fix round).
//
// The copywriter needle had the same shape: the bare word "campaign". Not a
// false negative yet -- "campaign" appears in plgn-copywriter.md only inside
// the campaign block -- but the final whole-branch review flagged it as the
// same trap, since any future sentence mentioning campaigns elsewhere in the
// file would clear it without the block itself surviving. Keyed instead on
// "Key message:" -- a label from the block's own example that ordinary prose
// about campaigns would not produce by accident.
const AGENT_CONTRACTS = [
  ["plgn-brand-architect", ["offerings", "\"kind\":", "benefits", "avoidCliches"]],
  ["plgn-copywriter", ["offeringNames", "Key message:"]],
  ["plgn-visual", ["referenceUrl", "anchor"]],
  ["plgn-strategist", ["campaign", "keyMessage", "vocabulary"]],
];
for (const [agent, needles] of AGENT_CONTRACTS) {
  const p = `agents/${agent}.md`;
  if (!exists(p)) continue; // the AGENTS check above already fails for this
  const body = read(p);
  for (const n of needles) {
    if (!body.includes(n)) fail(`${p}: contract must name "${n}"`);
  }
}

// An agent must never be told to call a write tool. The command owns every
// write -- _conventions rule 6 -- and an agent that writes is a write
// nobody confirmed.
//
// Changed from a bare "does the file mention this tool in backticks" check:
// that failed agents/plgn-scheduler.md:34, "Do not call `post_schedule` or
// any other tool." -- which is the rule being *stated*, not broken. What
// matters is whether an agent is told to call a write tool, not whether it
// names one.
//
// First fix attempt was a ~120-char window before the mention, cleared by
// any prohibition phrase inside it that did not cross a paragraph break or
// heading. Review found that still binds the wrong thing: it clears on *any*
// prohibition in the window, not one bound to *this* tool. Planted
// counterexample: "Never call `campaign_update` while archived. Once
// confirmed, call `post_schedule` to save it." -- the second sentence is a
// genuine instruction to call a write tool, and it cleared, because the
// first sentence's unrelated "Never call" sat inside the window.
//
// Fixed by binding to the sentence, not a character count: find the sentence
// that contains the backticked mention (bounded by '.', '!', '?', a blank
// line, or a heading -- whichever comes first on each side) and clear only
// if a prohibition phrase sits inside *that* sentence. A prohibition in a
// neighbouring sentence no longer reaches across.
//
// The phrase list also gained contractions ("don't call", "doesn't call"
// and their "save" equivalents) -- missing them only produces false
// positives (a real prohibition failing to clear, which fails loudly), but
// the matcher was being rewritten anyway.
//
// The boundary set was also missing ';'. "Never call `x_update` while
// archived; once confirmed, call `y_schedule` to save it." is one sentence to
// '.', '!' and '?' alone, so the first clause's prohibition wrongly cleared
// the second clause's genuine instruction to call a write tool. Added ';' to
// the boundary set so a semicolon splits the two clauses like a period would.
const WRITE_TOOLS = [...TOOLS].filter((t) => /_(create|update|delete|add|schedule|archive|restore|set)$/.test(t));
const WRITE_TOOL_PROHIBITION = /(do not|does not|don't|doesn't|never|must not)\s+(call|save)\b/i;
const SENTENCE_BOUNDARY = /[.!?;](?=\s|$)|\n[ \t]*\n|\n[ \t]*#/g;
const sentenceContaining = (body, idx) => {
  let start = 0;
  let end = body.length;
  SENTENCE_BOUNDARY.lastIndex = 0;
  let m;
  while ((m = SENTENCE_BOUNDARY.exec(body))) {
    const boundaryEnd = m.index + m[0].length;
    if (boundaryEnd <= idx) start = boundaryEnd;
    else { end = boundaryEnd; break; }
  }
  return body.slice(start, end);
};
for (const f of ls("agents")) {
  if (!f.endsWith(".md")) continue;
  const body = read(`agents/${f}`);
  for (const t of WRITE_TOOLS) {
    const marker = `\`${t}\``;
    let idx = body.indexOf(marker);
    while (idx !== -1) {
      const sentence = sentenceContaining(body, idx);
      if (!WRITE_TOOL_PROHIBITION.test(sentence)) {
        fail(`agents/${f}: agents never call write tools (\`${t}\`)`);
      }
      idx = body.indexOf(marker, idx + 1);
    }
  }
}

// --- 9. The reporting commands cover the whole graph -------------------
// Eight commands read the workspace and tell the user what is in it. Each
// used to describe a world with no offerings and no campaigns, and a
// Foundation layer of four loose entries. This pins the one thing each
// command would otherwise silently stop covering.
//
// `month` was added by the final whole-branch review: its image step read
// `context_get(role: "marketing_manager")` and `context_get(role:
// "copywriter")` only, neither of which returns `brand_identity` or
// `visual_rules` -- those are `art_director` fields. The command still told
// the runner to pass "the brand's saved visual direction" into every image
// prompt, a block it never read, so a month of images generated with no
// look. Fixed in commands/month.md's image step; pinned here on the same
// needle so a later edit that drops the read is caught before it ships.
//
// queue/report/topics were first keyed on the bare word "campaign". Review
// caught that this proves nothing: it only shows the word appears somewhere
// in the file, and a sentence like "This command does not yet handle
// campaigns" would satisfy it while adding none of the required behaviour.
// The point of a needle is not "did this collide with existing prose" (a
// false-positive question) but "will this still fail if the real behaviour
// is later deleted" (a false-negative question) -- the fifth time in this
// plan that distinction has been the deciding one. Rekeyed on a phrase
// distinctive to the actual content of each paragraph, confirmed by
// deleting each paragraph in turn and watching this fail naming the file
// (see task-8-report.md, fix round):
//   - queue: the `campaign_id` filter post_list actually takes
//   - report: the per-campaign publish-status line ("whether it is still
//     running")
//   - topics: the campaign-scoped counting rule ("count its posts inside
//     the campaign's window")
// None of these three strings occurred anywhere in these files before this
// task, so -- as with the bare word before it -- there is nothing already
// in them for a needle to collide with; the difference is that these can no
// longer pass without the actual sentence that carries the behaviour.
const REPORTS = [
  ["brandkit", ["offering_create", "offering_list", "brand_identity", "brand_positioning"]],
  ["knowledge", ["offering_list", "campaign_list", "knowledge_history"]],
  ["images", ["context_get"]],
  ["month", ["art_director"]],
  ["visuals", ["brand_identity", "campaign_create"]],
  ["queue", ["campaign_id"]],
  ["report", ["whether it is still running"]],
  ["topics", ["count its posts inside the campaign's window"]],
];
for (const [c, needles] of REPORTS) {
  const p = `commands/${c}.md`;
  if (!exists(p)) continue;
  const body = read(p);
  for (const n of needles) {
    if (!body.includes(n)) fail(`commands/${c}.md must name "${n}"`);
  }
}

// --- 10. No file writes a type name the taxonomy replaced --------------
// `brand_voice`, `competitor_data`, `seo_guidelines` and `example_article`
// were the whole taxonomy until 1.4.0. The server still ACCEPTS them, so an
// installed 1.3.0 keeps working -- that is what the aliases are for. But a
// file in THIS plugin naming one is a file that writes into the old shape,
// and a brand set up that way holds a voice `context_get` reads as
// something else.
//
// The map skill is the one exemption: it explains that the names exist and
// that nothing here writes them, so it necessarily names all four. Section
// 4's MAP_ONLY_LEGACY_TYPES exemption is what lets the map do that without
// tripping the unknown-tool-name check; this section is the one that
// actually enforces "nowhere else" -- the two together are what replace
// Task 1's scaffolding exemption, which excused every file rather than just
// the one that needs it.
{
  for (const p of CONTENT) {
    if (p === MAP_SKILL_PATH) continue;
    const body = read(p);
    for (const t of REPLACED_TYPES) {
      if (body.includes(t)) {
        fail(`${p}: names the replaced knowledge type "${t}" — see skills/brand-knowledge-map`);
      }
    }
  }
  // Guards the guard: if the map stopped naming them, this whole section
  // would pass over a plugin that had quietly lost the explanation.
  const map = exists(MAP_SKILL_PATH) ? read(MAP_SKILL_PATH) : "";
  for (const t of REPLACED_TYPES) {
    if (!map.includes(t)) {
      fail(`${MAP_SKILL_PATH} must still explain that "${t}" is a replaced name`);
    }
  }
}

if (fails.length) {
  for (const f of fails) console.error(`FAIL: ${f}`);
  console.error(`\n${fails.length} problem(s).`);
  process.exit(1);
}
console.log("OK: plugin structure valid.");
