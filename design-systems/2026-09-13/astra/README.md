# Astra design system

## What this is

Astra is one of four candidate design systems for www.jackzhaojin.com, built in the round of 2026-09-13. Origin: the Codex round of 2026-09-13, which Jack refers to as Astra. It follows the shared contract in `../SPEC.md`: plain HTML, CSS and JavaScript, no frameworks, no CDN scripts, all content in the initial HTML, light and dark as two token sets on one system, light by default.

This folder holds the documentation site (`index.html`), the tokens, the stylesheets, an optional filter script and three page templates built from the shared data in `../shared/data/`. Nothing here is on the sitemap and every page carries `noindex`.

Version 0.1.0, status Beta.

## Identity

Fonts. Display and headings: Georgia, "Times New Roman", serif, no webfont. Body: Inter 400, 500 and 600 from Google Fonts with a system-ui fallback. Labels and metadata: SFMono-Regular, Consolas, monospace.

Palette. One violet accent (#6850b5 light, #c0b3ff dark) on a lavender-tinted white (#fcfbfe) with plum ink (#242135). Lavender tint panels (#eee9fa) for the flagship hub card, the featured blog intro, the FAQ and the author box. A deep plum inverse panel (#282238 light, #292237 dark) for the featured project and the CTA band. Topic hues: AEM + AI violet, AEM blue, AI Agents red, Working with AI gold. In dark the page goes to #18161f with #f2eef8 text.

Shape. Cards 8px, tables and panels 6px, buttons 5px, chips pill. 1px hairlines. Soft shadows on cards only.

Identity marks. Numbered mono kickers in uppercase ("01 / Flagship topic"). Question-shaped H2s in the serif. Tint panels for featured and FAQ areas. The deep plum panel for the featured project and the CTA. A serif H1 "Jack Jin." with an accent-colored period on the home template only. The wordmark is the text "Jack Jin" and nothing else.

## Files

- `README.md` this file.
- `index.html` the documentation site: foundations, tokens, contrast, components with stories, patterns, templates, status, changelog.
- `tokens.css` primitives and semantic tokens for both themes, with the selector structure from SPEC section 4.
- `tokens.json` the same tokens in W3C Design Tokens (DTCG 2025.10) format.
- `base.css` reset, type scale on elements, `.container`, `.stack`, `.cluster`, `.grid` family, `.prose`, `.table-wrap`, `.sr-only`, `.skip-link`, focus ring, reduced motion.
- `components.css` every component from SPEC section 7 in all states and both themes, plus the documentation chrome.
- `scripts.js` blog filters and sort with query-string state. Only runs on a page with `.filter-bar[data-collection]` and `#post-grid`.
- `templates/home.html`, `templates/post.html`, `templates/blog.html` the three page templates.

## How to use

Add the three stylesheets in this order and the shared theme script deferred:

```html
<html lang="en" data-theme-default="light">
...
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script src="../shared/theme.js" defer></script>
```

Set `data-theme-default="light"` on the root element. Place the pre-paint snippet from SPEC section 3 in the head before the stylesheets, copied verbatim. It adds the `js` class and applies the stored theme before first paint. Every page also carries the gtag snippet, a canonical link and `noindex`, in the exact order given in SPEC section 3.

## Tokens

Three tiers with one-way dependency. Primitives are `--palette-*` colors, `--font-*` families and raw sizes, defined once on `:root`. Semantic tokens carry the names fixed by SPEC section 5 (`--color-bg`, `--color-text`, `--color-accent`, `--text-h1`, `--space-4`, `--radius-lg` and so on) and reference primitives. They are defined three times: on `:root, [data-theme="light"]`, on `[data-theme="dark"]`, and on `:root:not([data-theme="light"]):not([data-theme="dark"])` inside a `prefers-color-scheme: dark` media query. Components consume semantic tokens only. Component tokens (`--button-*`, `--card-*`, `--chip-*`, `--panel-*`) sit at the top of `components.css`.

Extra semantic tokens beyond the contract: `--color-inverse-text-muted`, `--color-inverse-accent`, `--color-inverse-line` for the deep plum panel, and `--tracking-display` for serif headings.

`tokens.json` mirrors `tokens.css`: a `palette` group of primitives, `color.light` and `color.dark` groups whose values reference the palette, and shared `font`, `size`, `space`, `layout`, `radius`, `border`, `shadow`, `duration`, `easing` and `breakpoint` groups. Each token has `$type`, `$value` and `$description`.

## Components

| Component | Class | Status |
| --- | --- | --- |
| Skip link | `.skip-link`, `.sr-only` | Stable |
| Site header | `.site-header`, `.wordmark`, `.nav-toggle`, `.site-nav` | Stable |
| Theme control | `.theme-control` | Stable |
| Breadcrumb | `.breadcrumb` | Stable |
| Page head | `.page-head`, `.page-title`, `.byline`, `.summary` | Stable |
| Kicker | `.kicker` | Stable |
| Button | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm` | Stable |
| Chip | `.chip`, `.chip--topic`, `.chip--format`, `.chip--status` | Stable |
| Card | `.card`, `.card--post`, `.card--hub`, `.card--project` | Stable |
| Facts table | `.facts` | Stable |
| Data table | `.table-wrap`, `.table` | Stable |
| Counts strip | `.counts` | Stable |
| Row list | `.row-list` | Stable |
| FAQ | `.faq`, `.faq__item` | Stable |
| Filter bar | `.filter-bar` | Beta |
| Pagination | `.pagination` | Beta |
| Embed | `.embed`, `.embed__frame`, `.embed__fallback` | Beta |
| Chapters | `.chapters` | Beta |
| Transcript | `.transcript` | Beta |
| Author box | `.author-box`, `.avatar` | Stable |
| Callout | `.callout`, `.callout--warn` | Stable |
| CTA band | `.cta-band` | Stable |
| Footer | `.site-footer` | Stable |
| Icons | `.icon` with the inline sprite | Stable |

Beta means the component waits on content not yet supplied (video source, chapters, transcript), on a count below its threshold (pagination past 48 items), or its script is new (filter bar). Each component is documented in `index.html#c-<name>` with anatomy, live stories in light and in a dark frame, the escaped canonical markup, a do and a don't, accessibility notes and the tokens it uses.

## Theming

Storage key `jj-theme`, values `light`, `dark`, `system`. The control is three toggle buttons with `data-set-theme` and `aria-pressed` inside a `role="group"`. The pre-paint snippet sets `data-theme` on the root element (or removes it for System) before CSS loads. `../shared/theme.js` syncs `aria-pressed`, persists the choice, sets `data-theme-effective`, follows OS changes while in System and toggles the mobile nav. It is shared and not forked.

Because `[data-theme="dark"]` matches any element, a frame can be forced to one theme. The docs page uses `<div class="story" data-theme="dark">` to show dark stories inside a light page. Without JavaScript the control is hidden (it would do nothing) and the page renders light, or dark when the OS prefers dark.

Tested with Playwright: empty storage renders light; clicking Dark sets `data-theme="dark"` and survives reload; clicking System removes `data-theme`; System with an emulated dark color scheme gives a computed background of rgb(24, 22, 31), which is the dark `--color-bg`.

## Templates

- `templates/home.html`: H1 "Jack Jin." with the positioning line, the 40 to 60 word summary, four hub cards in one row from 1280px and two by two below, the latest three posts, Anima Mesh on the deep plum panel with its facts table, a credentials strip, six talks as a row list (upcoming first), the CTA band.
- `templates/post.html`: the Adobe Stardust video post. Breadcrumb, kicker, H1, byline, summary trimmed to 55 words from the 2026-08-09 excerpt, facts table, embed placeholder with the LinkedIn link, chapters, four question H2s, transcript, FAQ, related items, author box.
- `templates/blog.html`: breadcrumb, H1 "Blog", summary, the Stardust post as the featured intro, counts by facet as a facts table, the filter bar, all 39 posts as cards newest first with titles linking to LinkedIn, a three-question FAQ. No pagination because 39 is below the 48 threshold.

Hub links point to `blog.html?topic=<slug>` because hub pages are not built in this round. The slugs are the ones in `site.json`: `aem-ai`, `adobe-aem`, `ai-agents`, `working-with-ai`. The script also accepts `aem`, `agents` and `work` as aliases. Membership for the AEM + AI hub is provisional: the six AEM posts whose excerpts name an agent, skill or MCP server on AEM, EDS or DA.live (dated 2026-08-09, 2026-05-24, 2026-05-17, 2026-03-23, 2025-10-12, 2025-10-05) carry `data-hub="aem-ai"`. Jack should confirm or change that set.

All facts on the templates come from `../shared/data/`. Anything not there is a bracketed placeholder: the email address, the watch time, the updated date, chapters, transcript, the YouTube link, the Content Factory relation, the Anima Mesh commit count, the talk titles still to confirm, and llms.txt.

## Accessibility

Contrast, measured with the WCAG relative luminance formula from the hex values in `tokens.css`. Every pair passes AA in both themes. The docs page re-computes these in the browser and reports whether they match.

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text on bg | 4.5 | 15.16 | 15.65 |
| text on surface | 4.5 | 15.63 | 14.30 |
| text-muted on bg | 4.5 | 5.80 | 8.49 |
| text-muted on surface | 4.5 | 5.98 | 7.76 |
| text-faint on bg | 4.5 | 4.92 | 5.59 |
| accent on bg (links) | 4.5 | 5.99 | 9.49 |
| on-accent on accent | 4.5 | 6.17 | 9.49 |
| inverse-text on inverse-bg | 4.5 | 14.17 | 14.15 |
| line-strong on bg | 3.0 | 3.25 | 3.39 |
| topic-aem on bg | 4.5 | 5.26 | 8.91 |
| topic-agents on bg | 4.5 | 5.56 | 9.00 |
| topic-work on bg | 4.5 | 6.05 | 11.95 |

Keyboard. A skip link is the first focusable element on every page. Every interactive element shows a 3px focus ring in `--color-focus` (the inverse accent on plum panels). FAQ and transcript use native `details`. The mobile nav toggle carries `aria-expanded` and `aria-controls`. Filter toggles carry `aria-pressed`; the active topic link carries `aria-current`. Buttons and pagination targets are 44px high.

Motion. Under `prefers-reduced-motion: reduce` every transition and animation is cut to 0.01ms and smooth scrolling is off. No reveal-on-scroll patterns exist.

Structure. One H1 per page, no skipped levels, `lang="en"`, alt on every image (the templates ship no images), `aria-hidden="true"` and `focusable="false"` on every decorative SVG, `.table-wrap` around every data table, `scope` on every table header.

## Deviations from the vendor round

- Dropped the two slogans ("Bring the work into the room." and "Let's talk about the work."). The CTA heading is "Book a talk" and the home H1 is the name.
- Dropped the half-circle mark, the "Field notes and systems" role line and the italic "Jin" from the wordmark. The wordmark is the text "Jack Jin" only.
- Dropped the repeated "Input / Agent / Evidence" card art and the "Design to build" mini flow. Cards carry a format chip, a date, a title, an excerpt and topic chips, no art.
- Replaced the one-button light/dark toggle (storage key `jack-theme`) with the three-state Light / Dark / System control on the shared key `jj-theme`, applied before first paint by the shared snippet.
- Removed pagination at six per page; the blog shows all 39 items. Pagination stays in the docs for use past 48 items.
- Extended the palette to the full semantic set in both themes. Three values from the brief were adjusted to pass AA: light `--color-text-faint` from #7b7686 to #716c7d (4.26 to 4.92), light `--color-line-strong` from #bdb8cc to #8f89a3 (1.87 to 3.25), dark `--color-line-strong` from #5d5470 to #706786 (2.53 to 3.39).
- Breakpoints changed from 600 / 900 / 1150 to the contract's 480 / 768 / 1024 / 1280 / 1600. Spacing extended from 4 to 80 to the contract's 4 to 128. The nav collapses below 1024px instead of 900px because the three-state control needs the room.
- The fixed 1248px container keeps the round's 1320px step at 1600px and up, and is verified centered at 1440, 1920 and 2560.
- The home H1 uses the accent period only; the vendor's italic "Jin" is not used, since the wordmark rule asks for plain text and the two should match.
- The home talks list shows all six entries from `talks.json` rather than the round's two.
- Nav links for Portfolio, Certifications and About point at the live site, since those pages are not part of this round.
- Primary buttons, pressed chips and the current pagination page are filled with the ink color (light text on ink in dark mode), as the round did, rather than with the plum inverse panel color, which was too subtle against the dark page.

## Sources

- `../SPEC.md`, the contract, including the astra brief in section 12.
- `../shared/theme.js` and `../shared/data/site.json`, `posts.json`, `credentials.json`, `talks.json`.
- `../../../ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md`, why each page slot exists.
- The Codex round in `local-only/codex-design-2026-09-13/outputs/redesign/`: `styles.css`, `design-tokens.json`, `design-system/index.html`, `index.html`, `blog/index.html`, `blog/adobe-stardust/index.html`, `DESIGN-NOTES.md` and the PNG boards in `mockups/`.
- Voice rules in the repo `CLAUDE.md` and `portfolio/CLAUDE.md`.
- The W3C Design Tokens Community Group format 2025.10 for `tokens.json`.

## Status and changelog

Status: 0.1.0, Beta. All quality gates from SPEC section 10 were run locally with Playwright on 2026-09-13: head contract, one H1, heading order, wordmark text, no unicode dashes, no external scripts beyond gtag, fonts from fonts.googleapis.com only, internal links resolve, no empty hash links, no horizontal overflow and equal container margins at 390, 768, 1024, 1440, 1920 and 2560 in both themes, the theme behaviour above, and with JavaScript disabled the summary, facts table, first section and nav are visible on every page.

- 0.1.1, 2026-09-13. Fixed: post and project cards inside the docs page's dark story frames rendered a light surface under dark-theme text (1.14:1), because `--card-bg` and `--card-line` were declared on `:root` only and carried their resolved light values into the frame. They now resolve on every themed scope (`:root, [data-theme]`). Flagship hub counts use muted text so the dark tint panel passes 4.5:1 (was 4.4:1). Found by the Codex review of this system.
- 0.1.0, 2026-09-13. First build from the Codex round to the shared contract. Tokens in both themes, every component with stories, three templates from shared data, contrast adjustments listed above.
