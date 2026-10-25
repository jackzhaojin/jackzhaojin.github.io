# EDS and Experience Workspace best practices

Researched 2026-10-25. Sources: aem.live docs (including `/docs/ew/*`, which replaced docs.da.live), the Experience Workspace source in `adobe/da-live`, `adobe/da-nx` and `adobe/da-universal`, `adobe/aem-boilerplate` at `5cea543` (2026-10-09, aem.js 3.1.9), `adobe/aem-block-collection` (2026-10-07), the Cloudflare Worker `adobe/aem-cloudflare-prod-worker`, and stardust 0.36.0's deploy rules. aem.live pages show no dates; the release feed (`aem-release-feed.adobeaem.workers.dev`) dated the 2026 changes.

Every stream follows this note. Where it conflicts with an older statement in this folder, this note wins. Items marked **verify** were read from code or inferred, and get checked in the first spike.

## 1. What this research changes

1. **Variants have a picker now.** The Experience Workspace canvas has a Variant dropdown on the block toolbar (da-live #1171, 2026-08-20; last fixed #1455, 2026-10-20). It lists the variants found in the library's block documents and writes them into the block header as `Name (variant)`. Nothing validates the words, so stardust's `@variants` declaration and probe are the validation (section 2).
2. **No inline script in `head.html`.** aem.live: head.html "should remain largely unchanged from the boilerplate" and inline scripts or styles are "not advisable". The pre-paint theme script moves into `scripts.js` (section 4).
3. **GA4 leaves the head.** Analytics loads in `scripts/consented.js` behind `consent-check.js`, which declines by default. This replaces the rule in `docs/site-operations.md` that gtag is the first thing in `<head>`. The consent model is README decision 9.
4. **Buttons are opt-in.** A link becomes a button only when authored bold (primary), italic (secondary) or both (accent). The wrapper class is `p.button-wrapper` (formerly `button-container`).
5. **Section metadata is applied on the server** for sites created on or after 2026-05-01: `style` becomes classes, `id` becomes the section id, any other key becomes `data-*`, and the metadata block is gone from the served DOM. The `id` key is how the portfolio keeps its `#ch-*` anchors.
6. **CSP and Trusted Types are on by default.** Every script needs the per-request nonce, and the default Trusted Types policy filters HTML strings.
7. **Configuration is the config service only.** There are no `fstab.yaml`, `helix-query.yaml` or `helix-sitemap.yaml` files; file-based config is listed as removed.
8. **On Cloudflare's non-Enterprise plans, push invalidation purges the whole zone on every publish**, project sites included (section 6).

## 2. Block variants in Experience Workspace

### How a variant is stored

- A visual variant is a word in parentheses in the block's header row: `Cards (hub, rules)`. The delivery pipeline turns it into classes (`class="cards hub rules"`; helix-html-pipeline `toBlockCSSClassNames`). Multi-word options are joined with hyphens (`super wide` -> `super-wide`).
- In div form (what the DA Source API writes), variants are extra class tokens after the block name: `<div class="cards hub rules">`.
- The block name is always the first class. `decorateBlock` reads `classList[0]`.

### How authors pick one

- **Variant dropdown** on the canvas block toolbar (Layout or Content mode, whole block selected), next to Replace block, Add item, Edit, Delete and Comment. It rewrites the header to `name (variant)` (`setTableBlockVariant` in `blocks/canvas/editor-utils/blocks.js`).
- **Library modal** with every variant grouped under its block, search, and a desktop / tablet / mobile preview that scrolls to the variant (#1420, 2026-10-21).
- **Slash menu** with each variant as its own entry.
- Matching is case- and spacing-insensitive (#1297). An unknown variant shows as its raw text; authors can still type any word in Content mode. **There is no allowed-values schema.**

### Where the list comes from: the library

From `/docs/ew/administering/set-up-library` and the da-live source:

- One document per block under `/library/blocks/`, registered in the library's `blocks` sheet (columns `name`, `path`, optional `features` such as `focal-point`).
- **Visual variants:** one table per variant in that document, with the variant in parentheses (`table (graybar)`). Each becomes a library item and a CSS class.
- **Content variants:** the same block with different starter content, named by a heading placed above the table. No class.
- `library-metadata` block per item: `description` (shown under the info icon), `searchtags`, `name` (overrides the label).
- `library-container-start` / `library-container-end` carry several blocks or sections as one item.
- `templates` sheet (`key`, `value`) for page templates; `icons` sheet for `::key::` icons.
- The site config (`da.live/config#/{org}/{site}/`) has a `library` tab with rows for Blocks, Templates, Icons and Placeholders.

### Options and Add item (not variants)

- An `options` tab in the blocks workbook (columns `key`, `blocks`, `values`, `type` single/multi/json, `label`) gives value autocomplete for key-value blocks such as `section-metadata` and `metadata`, and drives the Page metadata panel (#1359, 2026-10-06). Use it to offer the band words (plain, alt, tint, inverse, topic and project accents) for section metadata.
- An `editor` tab with `property=multi` per block turns on Add item, which copies the library block's first item row.

### Rules for this project

1. **Few generic blocks, few variants.** David's Model rules 1 and 9: limit blocks and variants through the design system, and infer from content where possible. Stardust's budget is 3 to 4 author-facing words per block; more means a design decision was handed to authors.
2. **One closed vocabulary per block,** declared in the block JSDoc with `@variants` (stardust deploy #134) and listed in the library document. Each word maps to v3 tokens and components in the block CSS; an empty or unknown word falls back to the declared default.
3. **Every variant appears in the library.** If it is not there, authors cannot pick it from the dropdown.
4. **Prefer variants over config cells** (`Hero (dark)`, not a `style | dark` row). Config rows are for key-value blocks only.
5. **No CSS in content.** No declaration, length, colour, class name or `--token` in a cell, and no `el.style = text` from authored content (David's Model rule 15, stardust D15/#134).
6. **CSS-only variants need no JS.** Read `block.classList` in `decorate()` only when a variant changes structure or behaviour (the Block Collection's `table no-header` is the model; `table striped`, `table bordered` are CSS only).
7. **Validation is ours.** Run stardust's editability probe with `@variants` declared; it fails a word outside the set.

### The design system site as the library (verify)

The plan makes `/design-systems/v3/` the block library. The library expects specific documents (a table per variant, `library-metadata` blocks), registered by URL in the `blocks` sheet. Verify in the spike whether the `blocks` sheet can point at `/design-systems/v3/<block>` documents, and whether `library-metadata` blocks can stay hidden on the published pages. If not, keep `/library/blocks/` as the authoring copy and generate it from the same source as the design system pages, so the two cannot drift.

## 3. Editability in Experience Workspace

### What the editor does

- Layout mode renders an iframe of `https://{branch}--{site}--{org}.preview.da.live/{path}?quick-edit=on`. The preview proxy builds the page from Experience Workspace source.
- Before decoration it stamps `data-prose-index` on the outermost text elements, `data-image-index` on images and `data-block-index` on blocks (da-nx `prose2aem.js`). After decoration it re-finds blocks by class and adds `data-block-variant`. It restores image indices only when the decorated block has **the same number of images** as the source.
- The proxy appends a quick-edit bootstrap to `scripts/scripts.js` when that file has a top-level `loadPage` and does not already import `quick-edit.js` (**verify**: `/docs/ew/about` still lists adding quick edit by hand).
- An opt-in scoped-reload loader (da-nx #814, 2026-10-13) goes at the top of `<head>`. It is not auto-injected yet, would load a second origin before LCP, and needs head.html changes; **do not adopt it yet**.

### Rules for block code (stardust EW1 to EW10)

- **Move authored elements into the layout; never rebuild them** from `textContent` or `innerHTML`, never clone and discard, never retag, never trim displayed text (EW1). This is the big one for the explainers: 20 of the 26 per-article `explainer.js` files and the shared kit build markup with `innerHTML`, so the ports rewrite those paths as moves.
- **Wrappers carry layout classes;** style the authored element as a descendant (`.headline :is(h2, h3)`), never with `>` or positional pseudo-classes on the path to it (EW2, EW10). The editor wraps authored elements in two extra divs.
- **CTAs move as their paragraph** (EW3). Clones strip instrumentation (EW4).
- **Text that cannot be editable is declared** with `@ew-exempt` (EW5).
- **No editor inside `<button>` or `<summary>`** (EW7). This matters for the FAQ, compare toggles and switches.
- **Re-entrant `decorate()`,** no module-level state (EW9).
- **Do not add or remove `<img>` elements** in a block (image index restore).
- `styles.css` ships the edit-mode foundation under `.prosemirror-editor`: CTA repaint from the authored marks, card-as-link inner anchors, wrapper variants of link utilities.
- The gate: stardust `block-roundtrip --ew` and `ew-editability-probe.mjs --simulate-editor` (no font or colour drift, block height delta at most 2 px).

## 4. Code and performance

### Start from the boilerplate as it is today

- `adobe/aem-boilerplate` main, aem.js 3.1.9. It ships `AGENTS.md`, ESLint (airbnb-base, ESLint 8) and Stylelint (standard), Node 24 in CI, and these blocks: cards, columns, footer, fragment, header, hero (CSS only, no auto-block), widget.
- Runtime files stay stock (`aem.js`, the structure of `scripts.js`). Project hooks are `buildAutoBlocks()`, `decorateButtons()` and `loadFonts()`.
- **Known issue (verify):** `blocks/header/header.js` still references `.button-container`, which no longer exists; a bold or italic brand link may throw. The foundation stream checks this first.

### head.html

Stock. It holds the CSP meta (`'nonce-aem' 'strict-dynamic'`, `require-trusted-types-for 'script'`, moved into an HTTP header by the server with a fresh nonce per request), the viewport meta, the two module scripts with `nonce="aem"`, and `styles.css`. Editing head.html purges the cache for every HTML page.

### Theme without an inline script

- **System choice is pure CSS:** v3's `@media (prefers-color-scheme: dark)` with no `data-theme` attribute already handles it.
- **A stored Light or Dark choice** is applied at the top of `loadEager()` in `scripts.js`, from `localStorage` key `jj-theme`, before `body.appear`. The body stays hidden until `appear`, so content never paints in the wrong theme.
- **Verify** that a stored Dark choice on a light OS does not flash the light canvas colour in the moment before `scripts.js` runs.

### Loading phases and budgets (`/developer/keeping-it-100`)

- **Eager:** decorate, first section, LCP image. Keep the aggregate payload before LCP under 100 KB, with no second origin before LCP. Preload, preconnect and `fetchpriority` do not help and can hurt.
- **Lazy:** header (first), remaining sections, footer, `lazy-styles.css`, fonts.
- **Delayed:** third-party code, behind consent. It should start at least 3 seconds after LCP. The boilerplate no longer enforces that with a timer, so this project adds the delay.
- **Fonts:** self-hosted woff2 in `styles/fonts.css`, loaded after LCP (early only on desktop at 900 px or wider, or on repeat views). Metric-matched fallback faces with `size-adjust` in `styles.css` keep CLS at 0. No font preloads.
- **The gate:** the AEM GitHub bot fails a PR whose mobile Lighthouse score is below 100. The go-live checklist targets 100 on mobile and desktop.

### Content shape

- **Content lives in the initial HTML.** LLM crawlers do not run JavaScript (`/docs/seo-geo`), another reason explainers are content.
- **Header and footer stay client-side.** A server-side experiment (2025-11 to 2026-07) showed no measurable SEO upside.
- **Fragments:** `/fragments/` links are auto-blocked, and fragment sections are promoted to top-level sections. Use them for chrome and genuinely shared bands only ("fragments may be harmful"), and mark `/fragments/**` noindex.
- **Widgets** are for app-like features that appear in few places (`/widgets/<name>/<name>.{html,css,js}`, a lone link in a paragraph, query params become `data-*`).
- **David's Model rules:** no nested blocks, at most 4 columns, fully qualified URLs, default content before blocks, name-value pairs only for configuration.

## 5. Content and configuration

- **Config service** at `admin.hlx.page/config/{org}/sites/{site}`: `code`, `content`, `cdn/prod`, `headers`, `public` (served at `/config.json`, so no secrets), `sidekick`, `content/query.yaml`, `content/sitemap.yaml`, `robots.txt`. A config POST can create a site (2026-10-21).
- **Query index:** created in Index Admin (`tools.aem.live/tools/index-admin`) or the Admin API, served at `/query-index.json`, defined in `content/query.yaml`. It reads the undecorated HTML. Experience Workspace indexes are strongly typed (arrays stay arrays). On DA sources you cannot keep pages out of the index; filter on `robots` in the listing code. Partitioned indexes are new (2026-09 to 10, release feed only).
- **Sitemap:** generated from the index through `content/sitemap.yaml`. Generate `sitemap-index.xml` and reference it from `robots.txt`. Use an exclude glob for noindex pages; the docs disagree on whether `noindex` alone removes a page.
- **Redirects:** a `redirects` sheet at the site root, with relative `Source` and `Destination`. 301 only, no wildcards (pattern redirects go in the Cloudflare Worker), at most 100,000 per site. They take precedence over content.
- **Bulk metadata:** a `metadata` sheet with a `URL` column and `*` / `**` globs. Use it for `/design-systems/**` noindex, `/fragments/**` noindex, shared Open Graph defaults. A page's own metadata block wins.
- **robots.txt** lives in config and is served only on the production host; aem.page and aem.live are blocked from crawlers.
- **URLs:** lowercase a-z, 0-9 and hyphens. A trailing `/` serves the folder's `index` document. David's Model rule 7 recommends dropping trailing slashes with 301s; decision 4 keeps them (section 8).
- **Media:** content images are uploaded into Experience Workspace (to the page's dotfolder or a shared `/media` folder). AVIF and WebP uploads are allowed since 2026-10-21. Focal points are set per image.

## 6. Cloudflare for this site

From `/docs/byo-cdn-cloudflare-worker-setup`, `/docs/setup-byo-cdn-push-invalidation-for-cloudflare` and the Worker source:

- **The template Worker** sets `x-forwarded-host`, `x-byo-cdn-type: cloudflare` and `x-push-invalidation: enabled`. It strips most query strings (keeping `width/height/format/optimize` on `/media_*` and `limit/offset/sheet` on `.json`), returns 404 for `/drafts/`, and returns 500 when the origin does not match `main--<site>--<org>.aem.live`. Environment: `ORIGIN_HOSTNAME`, `PUSH_INVALIDATION` (disabled on staging), optional `ORIGIN_AUTHENTICATION`.
- **Our Worker** runs the project-site check **before** any of that, so project sites keep their query strings and paths untouched.
- **Everything else goes to EDS,** which is what EDS pages need: `/scripts`, `/styles`, `/blocks`, `/icons`, `/fonts`, `/media_*`, `/nav`, `/footer`, `/.rum` and `/.optel` (POST allowed). Routing by allowlist of project sites, not by allowlist of EDS paths, avoids missing one.
- **Cache settings:** Caching Level Standard, Browser TTL "Respect Existing Headers", a cache rule that is eligible for cache and respects origin TTL. With push invalidation, EDS sends long TTLs (1 week).
- **Push invalidation:** config `cdn/prod` with `host`, `type: cloudflare`, `plan`, `zoneId`, `apiToken` (Zone > Cache Purge > Purge, scoped to `jackzhaojin.com`). On free, pro and business plans every publish does a **Purge All on the zone**: project-site pages cached from GitHub are purged too and refill on the next request. Only `main--` origins trigger it. Validate with `tools.aem.live/tools/push-invalidation/index.html?type=cloudflare`.
- **Routes:** `www.jackzhaojin.com/*`, never `*.jackzhaojin.com/*` (the zone has other Workers).

## 7. Experience Workspace setup and authoring

- **Scope.** Experience Workspace is DA upgraded ("an upgrade, not a migration"). It covers the whole authoring surface: the canvas at `da.live/canvas#/{org}/{site}/{path}` with Layout, Content and Split modes; the AI Assistant, skills and author memory; versions, comments, Preflight; schedule and request-publish; AEM Assets integration; and an MCP server (`https://mcp.adobeaemcloud.com/adobe/mcp/da`, `da_*` tools) plus REST. The domains (da.live, content.da.live, admin.da.live) did not change.
- **Enablement:** set `ew.enabled=true` explicitly; the docs disagree on the default. Set the Sidekick `editUrlPattern` to the canvas (the `ew-setup` tool does both).
- **How `jack-technical-writing` writes:** through the Experience Workspace MCP server, always (README decision 17). Which path stardust's own deploy uses is [open-questions.md](open-questions.md) 1. Versions mark agent-authored saves with "(agent)", which helps the demo show human and AI edits side by side.
- **Universal Editor:** aem.live recommends Experience Workspace over Universal Editor for new projects. Stardust's content stays expressible in Universal Editor's three model shapes, so nothing locks us out.

## 8. Open questions

The questions this research raised (GA4 and consent, trailing slashes, the library source) were answered on 2026-10-25: README decisions 9 to 11. Remaining questions are in [open-questions.md](open-questions.md).

## 9. Verify in the first spike

All nine checked 2026-10-25 in Goal 1, against the source of adobe/da-live, da-nx, da-universal, ew-extensions, helix-tools-website and helix-html-pipeline (2026-10-22 to 10-23), the aem.live docs, and the live `main--www-eds--jackzhaojin` site. Evidence: `www-eds/stardust/first-page/s9-findings.md`.

- [x] **The library's `blocks` sheet pointing at `/design-systems/v3/` documents.** Confirmed from source: any row with `name` and `path` is kept (da-live `blocks/edit/da-library/helpers/index.js:220`); `/library/blocks` is only the docs' convention. Register `https://content.da.live/jackzhaojin/www-eds/design-systems/v3/<block>` paths: they read the DA source in both editors, with no preview needed. **`library-metadata` is not hidden** by the pipeline or the boilerplate; the project hides it (done: `styles/lazy-styles.css`). Not yet tried live: the library is a site config change, so it waits for Jack's OK (Phase 2, H).
- [x] **Light-canvas flash for a stored Dark choice: it exists.** With Dark stored on a light OS, one frame of the light canvas paints before `scripts.js` applies `data-theme` (screencast luminance 244, then 19); the source's inline head script goes straight to dark. Content never paints in the wrong theme (the body stays hidden until `appear`). Options: accept, or a tiny classic `/scripts/theme-init.js` in `head.html` (not inline; one extra blocking request). Jack's call: inconsistency register R3.
- [x] **`/x` and `/x/index` for a folder index.** `/x/` serves the folder's `index` (200). `/x` returns **404 with no redirect**, and `/x/index` and `/x/index.html` return 404 (the pipeline rejects `/index` by design, `fetch-content.js:70`). GitHub Pages 301s `/x` to `/x/` today, so slash-less links would break: add `/x` to `/x/` redirects (redirects sheet entries per folder page, or the Worker), in G2 or B.
- [x] **The preview proxy's automatic quick-edit bootstrap.** Confirmed: the proxy appends it to `scripts/scripts.js` when that file has a top-level `loadPage` and no `quick-edit.js` import (da-universal `quick-edit.js:255-257`, "Inject Quick Edit (#224)", 2026-06-03). `/docs/ew/about` is out of date. Add nothing; keep `loadPage()`. Seeing it in the canvas waits for `ew.enabled`.
- [x] **Server-side section metadata in `.plain.html`.** Confirmed live: `style` arrives as classes (`<div class="tint">`, `related`), `id` as the section id (`#part-1` to `#part-6`, `#video`, `#takeaways`), any other key as `data-*` (`data-note-label`), and the section-metadata block is gone. A section holding only the page metadata block is left empty; the project hides empty sections.
- [x] **`header.js` and the removed `.button-container` class.** Confirmed: the boilerplate header called `brandLink.closest('.button-container').className = ''`, which throws now that the class is gone. The v3 header block replaces it (no reference).
- [x] **The `redirects` sheet in Experience Workspace.** Confirmed: a DA sheet named `redirects` at the site root, columns `Source` and `Destination`, one default tab (a named single sheet is not accepted), preview and publish. Proven on adobe/da-live (`/adaptto` 301). Not created yet: G2.
- [x] **Push invalidation config path.** Both work: `cdn.json` with `{"prod": {...}}` or `cdn/prod.json` flat ("two views of the same node", helix-admin); tools.aem.live writes `cdn/prod.json`. Keys `host`, `type: "cloudflare"`, `plan` (free, pro, business, enterprise; default free), `zoneId`, `apiToken`; optional `route`, `branch`.
- [x] **Scheduling.** `/docs/deprecation` covers only the old `.helix` `crontab` sheet. Experience Workspace Schedule Publish is supported (built in, `helix-snapshot-scheduler-prod`). It needs a `prepare` tab row titled `Schedule Publish` in the DA site or org config and Register site at `da.live/apps/scheduler`: a config change for Jack's OK.

Also learned: `ew.enabled` is set in the DA config's `flags` tab (site or org), off by default (da-nx `nx2/utils/ewFlags.js:163`); the Sidekick edit URL is `sidekick.json` in the config service, `editUrlPattern: "https://da.live/canvas#/{{org}}/{{site}}{{pathname}}"`. The `ew-setup` tool (adobe-rnd/ew-extensions) makes exactly those two writes.

## Sources

aem.live:

- `/developer/markup-sections-blocks`, `/developer/block-collection`, `/developer/block-collection/section-metadata`
- `/docs/davidsmodel`, `/docs/widgets`, `/docs/fragments`
- `/developer/keeping-it-100`, `/developer/anatomy-of-a-project`, `/developer/font-fallback`, `/developer/gtm-martech-integration`
- `/developer/indexing`, `/docs/indexing-reference`, `/developer/sitemap`, `/docs/config-service-setup`, `/docs/redirects`, `/docs/custom-headers`, `/docs/bulk-metadata`
- `/docs/seo-geo`, `/docs/go-live-checklist`, `/docs/faq`, `/docs/limits`, `/docs/deprecation`
- `/docs/byo-cdn-cloudflare-worker-setup`, `/docs/setup-byo-cdn-push-invalidation-for-cloudflare`
- `/docs/ew/da-is-ew`, `/docs/ew/about`, `/docs/ew/administering/set-up-library`, `/docs/ew/administering/focal-point`, `/docs/ew/developing/upgrading`, `/docs/ew/authoring/publishing`

Code:

- `adobe/aem-boilerplate`: `head.html`, `scripts/scripts.js`, `scripts/aem.js`, `scripts/consent-check.js`, `styles/`, `blocks/`, `.hlxignore`
- `adobe/da-live`: `blocks/canvas/ew-block-toolbar/ew-block-toolbar.js`, `blocks/canvas/editor-utils/blocks.js`, PRs #1171, #1297, #1359, #1403, #1420, #1455
- `adobe/da-nx`: `nx/blocks/quick-edit-portal/src/prose2aem.js`, `nx/public/plugins/quick-edit/quick-edit-init.js`, PR #814
- `adobe/da-universal`: `src/utils/quick-edit.js`
- `adobe/aem-cloudflare-prod-worker`: `src/index.mjs`
- stardust 0.36.0: `skills/deploy/SKILL.md` (Step 3, Step 8 EW1 to EW10, #134), `skills/deploy/davids-model.md`
