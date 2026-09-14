# kimi-k3 design system

## What this is

One of four candidate design systems for www.jackzhaojin.com, built in the round of 2026-09-13 under the shared contract in `../SPEC.md`. It keeps the visual identity of the Kimi K3 vendor round (`local-only/kimi-2026-09-13/app/`) and drops what broke the rules: invented content, em dashes as a device, a deferred theme script, opacity-zero reveals, and a hub grid that wrapped three plus one.

It is plain HTML, CSS and JavaScript. No framework, no build step, no CDN scripts, no icon font. Fonts come from fonts.googleapis.com only. Every piece of content is in the initial HTML; scripts only switch theme, open the mobile nav, filter and sort.

Version 0.1.0. Status: draft candidate under comparison.

## Identity

Developer editorial. An engineer's ledger: ink on paper, hairline rules, mono metadata, one accent.

Fonts

- Inter 400 / 500 / 600 / 700 for display, headings and body (`--font-display`, `--font-body`).
- IBM Plex Mono 400 / 500 / 600 for labels, chips, bylines, tables, nav, buttons and code (`--font-mono`).
- Mono is the voice of facts, sans is the voice of prose.

Palette

- Light (default): paper `#fafafa`, surface `#ffffff`, ink `#0a0a0a`, muted `#3d3d3d`, faint `#6f6f6f`, line `#e3e3e3`, line-strong `#8a8a8a`, accent `#1100ff`, accent hover `#0d00c4`.
- Dark: bg `#0a0a0a`, surface `#101010`, text `#fafafa`, muted `#cfcfcf`, faint `#979797`, line `#262626`, line-strong `#6b6b6b`, accent `#8f8aff`, accent hover `#aeaaff`.
- Topic hues: aem-ai `#1100ff` / `#8f8aff`, aem `#0b5fd6` / `#9db8e8`, agents `#c2262f` / `#ff9d9d`, work `#7a5c0f` / `#f0cf8e` (light / dark).

Shape

- Square corners. `--radius-sm` 0 on cards, tables, buttons and chips; 2px only on inline code and marks.
- Every border is 1px. No shadows.
- Container 76rem (1216px), reading column 68ch, header 3.5rem.

Identity marks

- An accent "//" drawn by CSS before every kicker, table caption and footer heading. Never typed into the HTML.
- Bracketed mono chips: `[video]`, `[active]`, `[01]`. Brackets are CSS.
- An accent highlight (`mark`) behind one key phrase in a post.
- The wordmark is the text "Jack Jin" in mono with a blinking accent underscore cursor drawn by CSS `::after`. The blink stops under `prefers-reduced-motion`.
- Ledger grids: `.grid--rules` removes gaps so cards share hairlines.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | This file. |
| `index.html` | The documentation site: foundations, tokens, every component with live stories in light and dark, patterns, templates, status, changelog. |
| `tokens.css` | Primitives and semantic tokens for both themes, with the contract's selector structure. |
| `tokens.json` | The same tokens in DTCG 2025.10 format. |
| `base.css` | Reset, typography on elements, `.container`, `.stack`, `.cluster`, `.grid` family, `.prose`, `.table-wrap`, `.sr-only`, `.skip-link`, focus ring, reduced motion. |
| `components.css` | Every component from SPEC section 7 in all states and both themes, plus a small block of styles used only by the documentation page. |
| `scripts.js` | Blog filter and sort with query string state. Optional; only `templates/blog.html` loads it. |
| `templates/home.html` | Home page template. |
| `templates/post.html` | Post template in the video state. |
| `templates/blog.html` | Blog collection template with all 39 posts. |

The pages were authored with a one-time generator kept outside the folder so that every live story and its escaped code sample come from the same string. The HTML files are the deliverable and can be edited by hand.

## How to use

Put this in the head of every page, in this order (the gtag snippet from `docs/site-operations.md` goes first after the viewport meta, then title, description, canonical and robots).

```html
<html lang="en" data-theme-default="light">
<script>
(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('jj-theme');var def=d.getAttribute('data-theme-default')||'light';var c=(s==='light'||s==='dark'||s==='system')?s:def;if(c==='system'){d.removeAttribute('data-theme');}else{d.setAttribute('data-theme',c);}d.setAttribute('data-theme-choice',c);}catch(e){}})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Inter:wght@400;500;600;700&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script src="../shared/theme.js" defer></script>
```

- `data-theme-default="light"` on the root element. The pre-paint snippet reads localStorage and sets `data-theme` before any stylesheet loads, so there is no flash.
- Never hard code `data-theme` in the HTML.
- Include the icon sprite (`<svg hidden>` with ten `symbol` elements) once per page, right after the skip link. `base.css` sets `svg[hidden] { display: none }` because the browser's `hidden` rule does not reach inline SVG.
- Inside `templates/` the paths become `../tokens.css` and `../../shared/theme.js`.

## Tokens

Three tiers with one-way dependency.

1. Primitives: `--palette-*` colors, `--font-inter`, `--font-plex-mono`. Named by hue and lightness. Never used in components.
2. Semantic: the names fixed by the contract, defined in both themes. Color `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-surface-raised`, `--color-text`, `--color-text-muted`, `--color-text-faint`, `--color-line`, `--color-line-strong`, `--color-accent`, `--color-accent-hover`, `--color-on-accent`, `--color-accent-soft`, `--color-focus`, `--color-inverse-bg`, `--color-inverse-text`, `--color-topic-aem-ai`, `--color-topic-aem`, `--color-topic-agents`, `--color-topic-work`, plus one extra, `--color-mark`. Typography `--font-display`, `--font-body`, `--font-mono`, `--text-display` through `--text-mono`, `--leading-tight`, `--leading-body`, `--tracking-label`, `--weight-regular`, `--weight-medium`, `--weight-bold`. Spacing `--space-1` (4px) to `--space-10` (128px). Layout `--container-max`, `--gutter`, `--measure`, `--header-height`. Shape `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--border-width`, `--shadow-1`, `--shadow-2`. Motion `--duration-fast`, `--duration-base`, `--ease-standard`. Stacking `--z-header`.
3. Component tokens at the top of `components.css` (`--button-*`, `--chip-*`, `--card-*`, `--kicker-mark`) hold theme independent values only. Colors are read at the use site so a nested `[data-theme]` frame re-themes everything inside it.

Where defined: `tokens.css`. The DTCG file `tokens.json` mirrors the values with `$type`, `$value` and `$description`, two theme sets under `color.light` and `color.dark`, and shared `font`, `size`, `space`, `radius` and `duration` groups. Colors are hex strings as in the contract example; fluid type sizes carry their `clamp()` in `$extensions`.

Type scale: display `clamp(3rem, 8vw, 6rem)`, h1 `clamp(2rem, 4.6vw, 3.4rem)`, h2 `clamp(1.35rem, 2.6vw, 1.85rem)`, h3 1.125rem, body-lg `clamp(1.05rem, 1.6vw, 1.25rem)`, body 1.0625rem, small 0.9375rem, label 0.72rem, mono 0.8125rem. Headings tracked at -0.02em, mono labels at +0.12em.

### Band tokens

`--band-tint-strong`, `--band-tint-soft` and `--band-tint-edge` are percentages per theme: 8, 4 and 3 in light, 7, 4 and 3 in dark (the portfolio's values). Restrained on purpose; this system separates with rules, not color. `--band-pad` is the band's vertical padding, `clamp(48px, 8vw, 96px)`. `--band-accent` is set inline per section and defaults to `--color-accent`.

## Components

Class names are fixed by the contract. Each is documented with live stories at `index.html#c-<name>`.

| Component | Class | Status |
| --- | --- | --- |
| Skip link | `.skip-link`, `.sr-only` | stable |
| Site header | `.site-header`, `.wordmark`, `.nav-toggle`, `.site-nav`, `.site-header__actions` | stable |
| Theme control | `.theme-control`, `.theme-control__btn` | stable |
| Breadcrumb | `.breadcrumb` | stable |
| Page head | `.page-head`, `.page-title`, `.byline`, `.summary` | stable |
| Kicker | `.kicker` | stable |
| Button | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm` | stable |
| Chip | `.chip`, `.chip--topic`, `.chip--format`, `.chip--status` | stable |
| Card | `.card`, `.card--post`, `.card--hub`, `.card--project` | stable |
| Facts table | `.facts` | stable |
| Data table | `.table-wrap`, `.table` | stable |
| Counts strip | `.counts` (and the `.strip` list variant) | stable |
| Row list | `.row-list` | stable |
| FAQ | `.faq`, `.faq__item` | stable |
| Filter bar | `.filter-bar` | beta |
| Pagination | `.pagination` | stable |
| Embed | `.embed`, `.embed__frame`, `.embed__fallback` | stable |
| Chapters | `.chapters` | stable |
| Transcript | `.transcript`, `.transcript__body` | stable |
| Author box | `.author-box`, `.avatar` | stable |
| Callout | `.callout`, `.callout--warn` | stable |
| Section band | `.band` with `.band--plain`, `.band--alt`, `.band--tint`, `.band--inverse`, `.band--milestone`, optional `.band--dots`; `.band__numeral`, `.band__caption` | beta |
| Divider | `.divider`, `.divider__label` | beta |
| CTA band | `.cta-band` | stable |
| Footer | `.site-footer` | stable |
| Icons | `.icon` with the `svg[hidden]` sprite | stable |

Layout primitives in `base.css`: `.container`, `.stack` (`--stack-gap`), `.cluster`, `.grid` with `--grid-min`, `.grid--2`, `.grid--3`, `.grid--4`, `.grid--rules`, `.grid--start`, `.prose`, `.section`, `.section-head`, `.table-wrap`.

The four hub cards use `.grid--4`: one row of four from 1280px, two by two from 480px, one column below. Never three plus one.

## Theming

- Two token sets on one system. Light is the default.
- The control is three buttons, Light / Dark / System, with `data-set-theme` and `aria-pressed`. Markup in `index.html#c-theme-control`.
- Storage key `jj-theme`, values `light`, `dark`, `system`.
- `shared/theme.js` (never forked) syncs `aria-pressed`, persists the choice, sets `data-theme-effective` and follows OS changes while in System.
- Selector structure in `tokens.css`: `:root, [data-theme="light"]` for light; `[data-theme="dark"]` for dark; the dark set repeated under `@media (prefers-color-scheme: dark)` for `:root:not([data-theme="light"]):not([data-theme="dark"])`. Because the dark set binds to any element, a nested `div[data-theme="dark"]` shows the dark treatment inside a light page. The documentation page uses this for every dark story.

## Templates

Content comes only from `../shared/data/*.json`. Anything not in the data is a bracketed placeholder.

- `templates/home.html`: H1 "Jack Jin" with the positioning line, the 40 to 60 word summary, four hub cards, latest three posts, featured project (Anima Mesh, facts table, commits bracketed), credentials strip with the link to all 22 certifications, six talks upcoming first, CTA band with LinkedIn and the bracketed email.
- `templates/post.html`: the Adobe Stardust video post. Breadcrumb, byline, summary trimmed from the excerpt to 60 words, facts table, embed placeholder with the LinkedIn link and the pending YouTube link, chapters placeholder, question-shaped H2s, an ordered list of the four steps with the human gate at prototypes, a comparison table with bracketed cells, transcript placeholder, three FAQ items answerable from the excerpt, related links, author box.
- `templates/blog.html`: all 39 posts newest first as `.card--post`, titles linking to LinkedIn. Featured intro, counts by facet as a facts table, filter bar, FAQ. No pagination, since 39 is under the 48 item threshold.

Hub links point to `blog.html?topic=<slug>` because hub pages are not built in this round. The slugs are `aem-ai`, `adobe-aem`, `ai-agents` and `working-with-ai`. `scripts.js` maps them to the data: `adobe-aem` to topic aem, `ai-agents` to topic ai, `working-with-ai` to type leadership. The AEM + AI hub is a curated set per post that is not in the shared data yet, so that link shows the AEM topic posts until the set exists.

Nav links to Portfolio, Certifications and About go to the live site because those pages are not part of this round. Talks goes to the talks section on the home template.

### Section rhythm

Every section between the page head and the footer is a section band. Home: page head plain; topics tint with the AEM + AI accent; latest alt; featured project tint with graph-paper dots; credentials plain, opened by a bracketed divider that carries the section number; talks tint with the Working with AI accent; contact inverse (the CTA band inside drops its own fill and its buttons re-point to the inverse ground). Post: everything through the FAQ plain; related and author box in one alt band. Blog: featured in a tint band with the page accent; filter bar and grid plain; questions alt. The full table is on the docs page under Patterns.

## Accessibility

Contrast, measured 2026-09-13 with WCAG 2.x relative luminance. Text pairs need 4.5:1, the UI border pair 3:1.

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text on bg | 4.5:1 | 18.97:1 pass | 18.97:1 pass |
| text on surface | 4.5:1 | 19.80:1 pass | 18.23:1 pass |
| text-muted on bg | 4.5:1 | 10.41:1 pass | 12.71:1 pass |
| text-muted on surface | 4.5:1 | 10.86:1 pass | 12.21:1 pass |
| text-faint on bg | 4.5:1 | 4.81:1 pass | 6.78:1 pass |
| accent on bg | 4.5:1 | 8.15:1 pass | 6.83:1 pass |
| on-accent on accent | 4.5:1 | 8.51:1 pass | 6.83:1 pass |
| inverse-text on inverse-bg | 4.5:1 | 18.97:1 pass | 18.97:1 pass |
| line-strong on bg | 3:1 | 3.31:1 pass | 3.72:1 pass |

Also checked: every topic hue on bg passes 4.5:1 in both themes (lowest is aem, 5.55:1 in light); accent-hover on bg 11.09:1 light, 9.42:1 dark.

Keyboard: a skip link first in the body, a 2px focus ring in the focus color on every focusable element, native `details` for FAQ and transcript, `aria-pressed` on toggle buttons, `aria-expanded` and `aria-controls` on the menu button, `aria-current` on the current nav item, breadcrumb and page. Links inside body copy are underlined so color is not the only cue.

Motion: only hover color changes, the skip link drop, the FAQ marker and the wordmark cursor. Under `prefers-reduced-motion` every animation and transition is cut to 0.01ms and smooth scrolling is off. Nothing moves on scroll and nothing starts hidden.

Structure: one H1 per page, heading levels never skip, `aria-hidden="true"` on every decorative SVG, `lang="en"`, tables for facts and comparisons, ordered lists for steps.

## Deviations from the vendor round

| What changed | Why |
| --- | --- |
| `--color-line-strong` is `#8a8a8a` in light and `#6b6b6b` in dark (round: `#c9c9c9` and `#3d3d3d`) | The round's values measured 1.59:1 and 1.82:1 on bg; UI borders need 3:1. Hairline rules keep the round's lighter values under `--color-line`. |
| Container is 76rem (round: 72rem) | The contract requires 1200 to 1320px. |
| Every em dash removed (the round used 68) | Contract rule. Labels use a slash, prose uses a comma or a new sentence. |
| Pre-paint theme snippet in the head, shared `theme.js` deferred (round: a deferred script that set the theme after load) | Dark-system users saw a light flash. |
| Three-state Light / Dark / System control (round: a two-state toggle) | Jack's decision; contract rule. |
| No scroll reveal (round: sections at opacity zero until scrolled) | Content must be visible at load with or without JavaScript. |
| Hub grid is `.grid--4`: four in a row from 1280, two by two below (round: auto-fill that wrapped three plus one at 1440) | Contract rule. |
| Wordmark reads "Jack Jin" in title case with the cursor as CSS (round: lowercase "jack jin" with a cursor span) | The wordmark element must contain only the name. |
| The card title is the link, not the whole card (round: the card was an `a`) | Contract markup; a pseudo element extends the hit area. |
| Breadcrumb starts with "Home" (round: "~") | Contract markup. |
| All invented content replaced: eight post titles, five talks, "312 commits", a transcript, chapters, an email address, YouTube and Credly URLs, wrong LinkedIn profile URL | Only `shared/data` is a source of facts. Unknowns are bracketed. |
| No JSON-LD in the templates (round had good coverage) | The head contract fixes the head contents; JSON-LD belongs to the real pages when they are built. |
| Interactive chips are bordered boxes without brackets; static chips are bracketed text | Avoids a box around a bracketed word. Both are mono and square. |
| Links in body copy are underlined (round: color only until hover) | Color alone does not meet the non-text cue requirement. |

Kept from the round: Inter and IBM Plex Mono, the paper and ink palette, the electric blue and lavender accents, square corners, one pixel rules, no shadows, "//" kickers, bracketed mono chips, the accent mark highlight, the underscore cursor, the ledger card grid, the striped embed placeholder, the "Q" box in the FAQ, the mono facts table with a "//" caption, the inverse CTA band, the four column footer with "//" headings, the design system page with a deviations table.

## Sources

- `../SPEC.md`, the round contract.
- `../shared/theme.js` and `../shared/data/site.json`, `posts.json`, `credentials.json`, `talks.json`.
- `local-only/kimi-2026-09-13/app/assets/css/site.css`, `assets/js/site.js`, `design-system/index.html`, `index.html`, `aem-ai/index.html`, `blog/index.html`, `blog/adobe-stardust-explained-edge-delivery-services/index.html`, `portfolio/anima-mesh/index.html`, `about/index.html`, and the review captures under `.playwright-cli/review/kimi-*.png`.
- `ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md` for why each page slot exists.
- `CLAUDE.md` and `portfolio/CLAUDE.md` for voice.
- W3C Design Tokens Community Group format 2025.10; the three-tier token model; Storybook's one story per state practice.

## Status and changelog

Status: 0.2.0, draft candidate. All components stable except the filter bar (beta: the AEM + AI curated set is pending).

- 2026-09-14, 0.2.0: section band and divider from the portfolio page, in this system's idiom: flat grounds, one pixel rules, a restrained wash on tint bands, graph-paper dots, bracketed divider labels, an Inter milestone numeral. Band tokens per theme. All three templates wrapped in bands (home seven, post two, blog four). Inverse bands re-point the semantic tokens so buttons, chips and links read on the inverse ground. Docs page gained `#c-band`, `#c-divider` and a Section rhythm pattern.
- 2026-09-13, 0.1.0: first cut from the Kimi K3 round. Tokens in both themes, base and components, documentation site with live stories, three templates from the shared data, this README. line-strong darkened in both themes to pass 3:1. Tested at 390, 768, 1024, 1440, 1920 and 2560 in light and dark, with the theme control, the mobile nav, the blog filter and with JavaScript disabled.
