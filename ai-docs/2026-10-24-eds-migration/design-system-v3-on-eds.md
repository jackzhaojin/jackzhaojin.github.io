# Design system v3 on EDS

## What exists today

`design-systems/v3` (0.2.0):

| File | What it holds |
|---|---|
| `tokens.css` (249 lines) | Three tiers: primitives, semantic, component. Light is the default; `[data-theme="dark"]` sets the dark set, and the OS preference applies when no `data-theme` attribute is present (the System choice). The selector structure lets a nested frame be forced to one theme. |
| `tokens.json` | The same tokens in W3C Design Tokens format. |
| `base.css` (202) | Reset, type, links, focus. |
| `components.css` (1,296) | About 30 components from the 2026-09-13 contract plus 7 taken from the portfolio (showcase, frame, proof links, stat chips, chapter head, timeline, tool card). |
| `index.html` (1,806) | Docs site: light and dark stories for every component, with markup. |
| `eval/` | `static-check.py` and `browser-check.js`: WCAG AA on every semantic pair in both themes and inside inverse surfaces. |
| `PRODUCT.md`, `DESIGN.md` | impeccable's product truth and the visual record written from the built code. |
| `shared/`, `templates/`, `scripts.js` | Theme script, data, historical templates. |

Production layers on top of v3: `css/site.css` (244), `css/article.css` (116), `css/explainers.css` (314) with `js/explainers.js` (428), `portfolio/styles.css` (1,349) with `portfolio/script.js` (604), `js/site.js` (theme and menu), `js/page-art.js` (canvas art in the home, writing, talks and certifications heroes), `js/writing-filter.js`.

Fonts come from Google Fonts today: Playfair Display, Inter, JetBrains Mono (all OFL). The theme is applied by an inline script in `<head>` before first paint.

## Source of truth

Stardust's replica flow writes its own `PRODUCT.md`, `DESIGN.md` and `DESIGN.json` at the project root, reverse-engineered from the live site ([adobe-skills-survey.md](adobe-skills-survey.md) item 3). v3 already has authored versions of the first two.

Decided (2026-10-24):

- v3 is canon. Let replica run its normal extract and promotion so its gates have the inputs they expect, then diff the promoted files against v3's `DESIGN.md` and `tokens.css`. The live site is v3, so they should agree; a mismatch is a v3 doc bug or drift on the live site, fixed at the source.
- Port `tokens.css` into `styles/styles.css` as it is. Do not replace it with values re-derived from computed styles.
- Keep v3's source files (`PRODUCT.md`, `DESIGN.md`, `tokens.json`, `eval/`) in the EDS repo under a design-system folder that is not served (listed in `.hlxignore`, as stardust does for `stardust/`).
- Record the arrangement in `stardust/direction.md` so later stardust runs know why the root spec matches v3.
- Optional: generate `tokens.css` from `tokens.json` so the two cannot drift.

## Where each piece lands

| v3 piece | EDS home |
|---|---|
| `tokens.css`, `base.css` | `styles/styles.css`, on top of the boilerplate's structural layer (the `body.appear` gate, header height reservation, `main > .section` scaffold), which stays as it is. |
| Google Fonts link | Self-hosted woff2 in `styles/fonts.css`, metric-matched `-fallback` faces in `styles/styles.css`. |
| Pre-paint theme script | No inline script: head.html stays stock. The System choice is pure CSS; a stored Light or Dark choice is applied at the top of `loadEager()` in `scripts.js`, before `body.appear` ([best-practices.md](best-practices.md) § 4). Keep the `jj-theme` key and the `data-theme` / `data-theme-choice` attributes so stored choices carry over. |
| Bands (plain, alt, tint, inverse) | Section-metadata style words mapped to section classes. Topic tints and project accents as a second word (for example `tint, aem` or `inverse, cyan`) that sets `--band-accent`. Declare the vocabulary. |
| Button, chip and status chip, kicker, text link, icons, divider, callout | Global styles for default content in `styles/styles.css`. Buttons are opt-in: a link authored bold is primary, italic is secondary, both is accent ([best-practices.md](best-practices.md) § 1). |
| Hero with proof list | `hero` block. |
| Card (link, hub, tool) and ruled grid | `cards` block with variants `link`, `hub`, `tool`, `rules`. |
| Facts table, data table, row list (status) | `facts`, `data-table`, `row-list` blocks. |
| FAQ | `faq` block. |
| Counts strip, stat chips | `stats` block with variants. |
| Showcase, frame, proof links | `showcase` (variants `flip`, `wide`), `frame` (`diagram`, `portrait`), `proof-links`. |
| Chapter head, timeline, inverse panel | `chapter-head` (`flagship`), `timeline`, `panel` (`inverse`). |
| Author box, transcript, chapters | `author-box`, `transcript`, `chapters`. |
| Breadcrumb, page head | From page metadata, decorated in the article template or an auto-block. |
| Site header with theme control and menu | `header` block from a nav document; it ports the theme and menu logic from `js/site.js`. |
| Compact footer | `footer` block from a footer document. Keep the four links. |
| Video embed | Auto-block from a YouTube URL alone on its line. Authors never build an embed table. |
| `page-art.js` canvas | Hero variant JS (decorative, `aria-hidden`), or `delayed.js`. |
| Writing filter | Listing over the query index, with authored rows as the fallback (deploy #17); dynamics decides the final form. |
| `eval/` | A check in the EDS repo, run in both themes. It covers the dark theme, which stardust's tools do not. |

The spec's block catalog decides the final names and the reuse verdicts. This table is the starting hypothesis.

## Design system site on EDS

Decided (2026-10-24): the design system site is content in Experience Workspace, in the same repo and site as the main site.

- `/design-systems/v3/` becomes Experience Workspace pages built from the real blocks: each story is a live block instance with its variants, so the docs cannot drift from the code. Light and dark stories use frames forced to one theme, which the v3 selector structure already supports. Markup samples become static code blocks.
- The same pages serve as the block library authors pick from in Experience Workspace (a demo focus), if the spike confirms the library can point at them ([best-practices.md](best-practices.md) § 2).
- Keep `noindex`, as today.
- The 2026-09-13 candidate round (four systems and a compare page) is not migrated. It stays in this repo's history, and `/design-systems/2026-09-13/` returns the EDS 404 after cutover.

## Future design rounds

Content stays the same and code changes. A new design system, or a new version of v3, is an EDS branch that changes `styles/` and `blocks/` on the same Experience Workspace content, previewed at `https://<branch>--<repo>--jackzhaojin.aem.page`. Content changes only when a new design needs an added variant word or a new block. This is the model a candidate round would use next time, in place of four static copies of the site.

## Explainers

Decided (2026-10-24): explainers are content. Their text, data and media live in Experience Workspace documents, and moving them is a content migration like the rest of the site. The code that renders them is a generic explainer block family.

| Tier | What | Count | Delivery |
|---|---|---|---|
| Common figures | `board` (image and caption), static code, video, `shot`, `page` | 102 boards, 45 code, 20 video, 9 shots, 3 pages | Default content, a figure block, a code block, the video auto-block |
| Shared kit | `js/explainers.js`: typed terminal, code walkthrough, request flow, token lab, compare, gate, two-way switch, three views, bar placement, video facade | about 10 components, used by all 28 articles | The core of the explainer family: content in rows, behaviour in `decorate()` |
| One-offs | Each article's own `explainer.js` and `explainer.css` | 26 articles, 3,335 lines of JS and 1,850 of CSS, about 20 one-off components | Mapped onto the family, kit first. A new generic block only when nothing fits, added to the catalog first |

Rules for the family:

- **Generic blocks, few of them.** A block earns its place by fitting several explainers.
- **Minimal, deliberate variants.** Each variant is one plain word from a closed, documented set, mapped in the block CSS to v3 tokens and components. No CSS, colours or lengths in content.
- **Variants match the design system.** A variant that needs a value v3 does not have is a v3 change first (a token or a component), then a variant.
- **Latest capabilities.** Variants use Experience Workspace's newest block-variation features (research item in [README.md](README.md)).
- **Changes are recorded.** Re-expressing a one-off through the family can change how it looks. Each change is an inconsistency-register entry, and the page gate checks the result.
- **Editable.** Every block passes the editability gate, so Jack can touch up explainer content in quick edit.

Widgets remain for UI that carries no content at all, if dynamics finds any.

## Portfolio

- The heaviest page: 1,349 lines of CSS and 604 of JS. It references 49 distinct v3 tokens.
- Page-level pieces v3 left out by design: the tabbed diagram deck, glossary chips, projects-over-time chart, year rail, scroll progress bar, reveal animation. The ones that carry content (diagram deck, glossary chips, the chart's data) become blocks with their content in Experience Workspace, generic where the explainer family fits. Pure UI (year rail, scroll progress, reveal) is block JS.
- Every `#ch-*` anchor must survive. Each chapter is its own section with a section-metadata `id`; on new sites the server turns that key into the section's id ([best-practices.md](best-practices.md) § 1). Confirm in the portfolio archetype.
- Snowflake's page-level overlay is the fallback if the block conversion cannot pass the gate.

## Candidates for the inconsistency register ("or better")

These are the only design changes replica allows, each with evidence and a status.

- 75 hard-coded hex values across page-level CSS (portfolio, `site.css`, `explainers.css`, the per-article CSS). Replace each with a token where one exists, which also makes them follow the dark theme.
- Look changes from mapping one-off explainers onto the explainer family.
- Design findings from `stardust:audit` (contrast, target size, type ramp).
- Anything the v3-vs-extract diff shows where the live site drifted from v3.

Delivery improvements that need no register entry because the look does not change: self-hosted fonts with metric fallbacks, eager first image, reserved space for header and footer, sitemap and redirects from rollout.
