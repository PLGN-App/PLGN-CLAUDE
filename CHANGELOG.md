# Changelog

## 1.19.0 (2026-10-10)

- The typographer writes a picture's words, not only styles them. It reads the person's request, the post as the content creator wrote it, the products the post names and the brand's rules for pictures, then writes the lines the picture needs: the director's image words are its starting point, and a footer, a contact line, a model code, spec lines or a button go in when the brand's rules ask every design to carry them. The person's own lines are kept letter for letter, and every figure, website and phone comes word for word from the saved material. Before, it could only place the director's headline and one line, so a brand rule like "every design ends with our website and phone" left the designer with nothing it was allowed to write, and it refused every idea.
- `/plgn images` sends the typographer that whole job and checks each line it writes: a figure, website or phone found nowhere in the material goes back to it once, by name.
- A `fit` question (a line too long for the picture) is only ever about one of the person's own lines; the typographer shortens its own lines itself.

## 1.18.5 (2026-10-10)

- The knowledge map lists seventeen types: `channels` (the brand's website and its accounts) is the seventeenth, and the fifth a brand holds only one of.
- YouTube has its row in the platform rules: a 5,000-character description, aim for 200–500, video only.
- One size for a hashtag set that has grown too big: about 10 tags, in `/plgn library` and its helper alike.
- Numbers are Western digits (0–9) in every reply and every post, Arabic included.
- The skills `npx plgn-setup` gives other AI tools no longer name Claude Code's own tools: the picture fallback and the researcher say "your web fetch" and "your file reader".
- `/plgn import-store` on one product page skips `(svg)` pictures, uploads each picture once, saves the description keyed by language, and finishes on its own instead of running the store import. `/plgn repurpose` saves each snippet's text keyed by language too.
- `/plgn images` asks once for all of a post's lines that are too long for the picture (a carousel of 10 is one question, not 10).
- A yes in the chat saves or schedules a post; it never approves it. Approving is a person's, on the board, and the commands now say "saved" or "scheduled", never "approved".
- Every connected command now says whether it takes `--yes`: `/plgn post` and `/plgn topics` do; `/plgn setup`, `/plgn assets`, `/plgn queue` join the commands that never do; `/plgn report` and `/plgn why` take no flags.
- Validate knows all of plgn's tools (85, with `place_read`, `route_request`, `brief_delete`, `create_folder`, `move_images` and `hashtagset_get`) and judges every tool prefix, and pins each change above.

## 1.18.4 (2026-10-10)

- Waiting for pictures is one call, not one every five seconds: `/plgn images`, `/plgn month` and `/plgn product-sheet` start every picture first, then ask plgn about all of them at once (`check_generation` with `job_ids` and `wait_s: 20`). plgn waits on its side and answers as soon as one is done; the call is repeated with the ones still pending until each succeeds or fails. A job still pending after about 3 minutes is reported as still running, never as failed. The quote and its yes still come before any picture. Needs the plgn server that takes `job_ids` and `wait_s`.
- Reading the web through plgn costs points now, and the commands say so. In a new brand's first 7 days each read costs only what plgn pays for it (often under 1 point); after that a search is 0.2, a site 0.5, a Google Maps place 1 and an account's posts 3 (Instagram 5). A copy plgn read in the last 7 days and a failed read are free, and so are the store tools and looking at pictures. `/plgn setup`, `/plgn brandkit`, `/plgn competitors`, `/plgn audit` and `/plgn import-store` say roughly what a batch of reads costs before reading, and add up the `Points:` lines at the end; `/plgn setup` and `/plgn brandkit` say that a new brand's first week is at plgn's own cost. The rule is written once, in the conventions (rule 12), and the researcher reports what its reads cost.
- The free commands that read with web fetches only (`demo`, `strategy`, `voice`, `calendar`) now tell the researcher so, so it never spends a connected workspace's points.

## 1.18.3 (2026-10-10)

- One picture for one idea on several platforms: when `/plgn month` or `/plgn images` has the same idea as feed posts on Instagram, Facebook, LinkedIn or X, it makes one picture and plgn puts it on every copy (`also_post_ids`, up to five more posts), quoted and paid for once. A TikTok post, a reel cover or a story (9:16) keeps its own picture unless you say one is fine. You are told in one plain line when a picture goes on several posts. Needs the plgn server that takes `also_post_ids`.
- `/plgn import-store` no longer offers to connect Cloudinary from the chat: it points at Settings › Media keys (useplgn.com/settings/keys), where the key belongs.
- The logo rule is written once, in the brand-assets skill: the logo reaches the image model as a colour reference only — its colours may be used, the mark itself is never drawn or placed, and no other brand's logo ever. The designer's check 14 and its input rule, `/plgn assets`, `/plgn images` and `/plgn month` point at it instead of saying the opposite.
- One answer per list, not one stop per item: `/plgn assets` shows every draft and asks once (a real face's consent is a named line in the same block), and its move-from-references question covers removing the old entries; `/plgn import-store` asks once for all the benefits; `/plgn knowledge` asks once for all the fixes.
- `/plgn brandkit` asks five questions in the whole run: one block up front (references, place, guide, own things, accounts only when none was found), at most four pre-answered ones after reading, the plan's yes, and the owner-only block it keeps; the competitors are no longer confirmed on their own and appear in the plan where `pick` drops one.
- `/plgn setup` uses the only brand without asking, asks for banned words once (inside the four drafts, with the timezone and languages on the same question), and names the real pages: Plan & usage (useplgn.com/settings/plan) and Settings › Media keys (useplgn.com/settings/keys).
- Dashboard pages are named as they are: `/plgn undo` sends unused images to the library (useplgn.com/library), `/plgn brand` to Settings › Brands, and the conventions give the link to the page that holds a missing connection.

## 1.18.2 (2026-10-09)

- `/plgn month` and `/plgn images` ask plgn what the pictures cost before making any: one quote for the whole batch, the model and the total in plain words, a yes before a point is spent. No price is worked out by hand any more, and the quote's prompt limit is handed to the designer.
- The `Image points` line is read as what plgn prints: used of included this period, plus purchased.

## 1.18.1 (2026-10-08)

- `/plgn import-store` reads one product page when the store is not Shopify, WooCommerce or EasyOrders: every spec line, the product's photos (never the logos), one yes, then the photos go to the library and the product is saved with them.

## 1.18.0 (2026-10-08)

- plgn's commands, roles and skills can be used in other AI tools: `_dev/scripts/portable.mjs` writes them as 53 skills in the Agent Skills form, which `npx plgn-setup` installs. Validate checks them too.
- Words that only fitted Claude Code now fit every tool: `/plgn help` and the "can't reach your workspace" message say to restart your AI tool, and `/plgn setup` connects your AI tool.
- The typographer's accent moves: one or two a frame, taken from the palette, never on the product, and written in `styling`.
- Arabic accents go by whole word, never inside a word.
- A brand's never-list names styles to avoid (a face, pure white, gloss), not the things a post may need (a QR code, a price, a partner logo, a date, a screenshot).
- The designer names only the inputs the prompt lists, and leaves the logo rule as it was given.
- Every answer the desk and the server read keeps its exact keys.
- Brand kit searches for the accounts a brand's site does not link, keeps only the ones the researcher confirms, and saves them on the brand too; the researcher can search the web and reports an account only after its name and a second sign match the brand; a chat never says a tool is missing when it has it.

## 1.17.1 (2026-10-08)

- LinkedIn is read now: a brand's company page, or a person's profile, gives its last 20 posts, their pictures and its profile, the same as Instagram, TikTok, Facebook and X. No login is needed.
- A brand's LinkedIn page is saved with its other accounts, as `company/name`.

## 1.17.0 (2026-10-08)

- Pictures are now described the way a photographer sets them up: the camera's height, distance and lens look in numbers, where each thing stands, where the product sits and where the words go, what each surface is, and who is in the picture and what they are doing.
- Every description ends with what to keep if the image model has to drop something: the label and the words first, then the product, where things stand, the light, the style.
- The art director's order has a new CAMERA line, so a campaign's posts keep the same set-up.
- The finishing check asks two more questions: is everything where it was put, and does the camera match.
- A model with a short limit loses style words first, never the label, the words or the product.
- Every answer the desk and the server already read keeps its exact keys and form.

## 1.16.0 (2026-10-07)

- A fifth picture role, the typographer: it chooses the type, the styling and the place for the words in a picture, before the picture is made. It never changes a word.
- `/plgn images` has a new step 4b for a post whose frames carry words. When a line is too long it asks you in plain words, with the shorter line, `yes / edit / no`. The words change only on your yes or edit.
- The designer takes the typographer's block as given and checks every placement in the finish. A frame with no words gets none written.
- `/plgn month` styles quote cards, reel covers and memes the same way, using the hook exactly as saved.
- Every answer the desk and the server already read keeps its exact keys and form.

## 1.15.1 (2026-10-07)

- Wording fixes in the picture agents and commands: no new tool, and every answer keeps its shape.
- `/plgn product-sheet` names its pages, quotes with a neutral example, and asks before replacing a draft.
- The creative director's example now shows all six ideas.

## 1.15.0 (2026-10-07)

- Product sheets: a product variant gets a checked set of pictures, one per view, and a person approves the sheet before any picture uses it.
- `/plgn product-sheet` builds one: it quotes the points first, makes the sheet, checks every view against the real photo, and hands it over for approval.
- `/plgn images` can take a product from an approved sheet view instead of a plain photo.
- The art director names the exact sheet view a picture should use.

## 1.14.0 (2026-10-07)

- The three picture agents are now an agency's three roles: the creative director owns the idea, the art director owns the direction (a written order), the designer owns the execution and the finish.
- The creative director works from the brand's own words, shows its candidates, and asks the person to choose between two directions when the brand has no formula yet.
- The art director can write an order for a post, naming the school, the field, the world, the hero, the light, the colour and what must never appear. It still reads a brand's pictures and writes its look as before.
- The designer writes each picture's prompt from that order, in seven parts, and knows how to check the finish against the school (not run by any command yet).
- `/plgn images` runs idea, then order, then execution: one order per post, one per campaign inside a run.
- A brand's saved look now names its school.
- The content creator leaves a picture's composition to the art director.
- Every answer the desk and the server already read keeps its exact keys and form.
