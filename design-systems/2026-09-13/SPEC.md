# Design system contract, round 2026-09-13

This file is the source of truth for the four design systems in this folder. Every system implements the same contract with a different visual identity. An agent building one system must follow every section marked "required". Where this file and a vendor's original output disagree, this file wins.

Sources consulted for the practices below: the W3C Design Tokens Community Group format 2025.10 (designtokens.org), the three-tier token model (primitive, semantic, component) with one-way dependencies as used by Polaris and Carbon, and Storybook's documentation practice of one story per state with a docs page per component.

## 1. Non-negotiable rules (required)

1. Plain HTML, CSS and JavaScript. No frameworks, no CDN scripts, no Tailwind, no icon fonts. Fonts may load from fonts.googleapis.com only.
2. Every piece of content is in the initial HTML. JavaScript may switch theme, open the mobile nav, filter and sort. It never supplies, fetches or hides content. Pages must read correctly with JavaScript disabled.
3. No invented facts. Content comes from `shared/data/*.json` (parsed from the live site) or is a bracketed placeholder such as `[transcript to be supplied]`. No invented posts, talks, numbers, transcripts, quotes, email addresses or profile URLs.
4. No em dashes or any unicode dash anywhere: not in copy, labels, code comments, JSON or README. Use "-", "/", "," or rephrase.
5. The wordmark is the text "Jack Jin" and nothing else inside the wordmark element. No glyph, icon, half circle or theme symbol. A trailing period or a trailing text cursor is allowed only where the vendor's identity had one, and it must be plain text or CSS, never an image.
6. The container is centered with a max width and tested at 390, 768, 1024, 1440, 1920 and 2560 px. No horizontal scrolling at any width. Content never sits flush left on a wide screen.
7. Light and dark are two token sets on one system. Light is the default. A three-state control (Light, Dark, System) persists the choice in localStorage and is applied before first paint.
8. Accessibility: one H1 per page, heading levels never skip, a skip link, visible focus styles, alt text on every image, `aria-hidden="true"` on decorative SVG, WCAG AA contrast in both themes (4.5:1 for text, 3:1 for large text and UI borders), `prefers-reduced-motion` respected.
9. Voice: an engineer's plain voice. No slogans, no hype, no filler adjectives. Copy points at the work.
10. Do not commit. Do not edit any file outside your system folder. Do not add pages to `sitemap.xml`. Playwright output goes only under `.playwright-cli/<slug>/` at the repo root.

## 2. Folder contract (required)

```
design-systems/2026-09-13/
  SPEC.md                  this contract
  README.md                round overview, written by the coordinator
  index.html               compare page, written by the coordinator
  shared/theme.js          shared theme and nav script, do not fork
  shared/data/*.json       real content: posts, credentials, talks, site
  eval/                    coordinator's automated checks
  <slug>/                  one folder per system
    README.md              AI friendly documentation (section 11)
    index.html             the design system documentation site (section 8)
    tokens.css             primitive and semantic tokens, light and dark (section 5)
    tokens.json            the same tokens in DTCG 2025.10 format (section 5)
    base.css               reset, typography, layout primitives, utilities
    components.css         every component in section 7
    scripts.js             optional: blog filters and sort only
    templates/home.html    page template (section 9)
    templates/post.html    page template, video state (section 9)
    templates/blog.html    page template, collection (section 9)
```

Slugs: `claude-fable-5-1`, `astra`, `kimi-k3`, `google-stitch`.

## 3. HTML head contract (required on every page)

Exact order inside `<head>`:

```html
<!doctype html>
<html lang="en" data-theme-default="light">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZVENE6BXTJ"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ZVENE6BXTJ');
</script>
<title>Page title | System name | Jack Jin</title>
<meta name="description" content="One sentence.">
<link rel="canonical" href="https://www.jackzhaojin.com/design-systems/2026-09-13/<slug>/<path>">
<meta name="robots" content="noindex">
<script>
(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('jj-theme');var def=d.getAttribute('data-theme-default')||'light';var c=(s==='light'||s==='dark'||s==='system')?s:def;if(c==='system'){d.removeAttribute('data-theme');}else{d.setAttribute('data-theme',c);}d.setAttribute('data-theme-choice',c);}catch(e){}})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=...&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script src="../shared/theme.js" defer></script>
</head>
```

Inside `templates/`, the relative paths become `../tokens.css` and `../../shared/theme.js`. The gtag snippet is a site rule from `docs/site-operations.md`. These are demo pages, so they carry `noindex` and are not added to the sitemap.

The pre-paint snippet must be copied verbatim. It adds the `js` class (so CSS can use `html.js` for enhancements) and applies the stored theme choice before any CSS loads.

## 4. Theme contract (required)

- `data-theme-default` on `<html>` is `light` for every page in this round. (`system` is reserved for the portfolio page later.)
- Storage key `jj-theme`, values `light`, `dark`, `system`.
- `tokens.css` must use exactly this selector structure so that a nested frame can be forced to one theme (the docs page uses this to show dark stories inside a light page):

```css
:root, [data-theme="light"] { color-scheme: light; /* light semantic tokens */ }
[data-theme="dark"] { color-scheme: dark; /* dark semantic tokens */ }
@media (prefers-color-scheme: dark) {
  :root:not([data-theme="light"]):not([data-theme="dark"]) { color-scheme: dark; /* dark semantic tokens, duplicated */ }
}
```

- The control markup, placed in the site header on every page:

```html
<div class="theme-control" role="group" aria-label="Color theme">
  <button type="button" class="theme-control__btn" data-set-theme="light" aria-pressed="true">Light</button>
  <button type="button" class="theme-control__btn" data-set-theme="dark" aria-pressed="false">Dark</button>
  <button type="button" class="theme-control__btn" data-set-theme="system" aria-pressed="false">System</button>
</div>
```

- `shared/theme.js` syncs `aria-pressed`, persists the choice, sets `data-theme-effective` on `<html>`, follows OS changes while in System, and toggles the mobile nav. Do not fork it.

## 5. Token contract (required)

Three tiers, one-way dependency: primitives define options, semantic tokens reference primitives, components consume semantic tokens only.

- Primitives: `--palette-*` (colors), `--font-*` families, raw sizes. Names are free per system.
- Semantic tokens (names fixed, every system defines all of them, in both themes):

Color: `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-surface-raised`, `--color-text`, `--color-text-muted`, `--color-text-faint`, `--color-line`, `--color-line-strong`, `--color-accent`, `--color-accent-hover`, `--color-on-accent`, `--color-accent-soft`, `--color-focus`, `--color-inverse-bg`, `--color-inverse-text`, `--color-topic-aem-ai`, `--color-topic-aem`, `--color-topic-agents`, `--color-topic-work`.

Typography: `--font-display`, `--font-body`, `--font-mono`, `--text-display`, `--text-h1`, `--text-h2`, `--text-h3`, `--text-body-lg`, `--text-body`, `--text-small`, `--text-label`, `--text-mono`, `--leading-tight`, `--leading-body`, `--tracking-label`, `--weight-regular`, `--weight-medium`, `--weight-bold`.

Spacing: `--space-1` (4px) through `--space-10` (128px): 4, 8, 12, 16, 24, 32, 48, 64, 96, 128.

Layout: `--container-max` (between 1200px and 1320px), `--gutter`, `--measure` (60ch to 70ch), `--header-height`.

Shape and elevation: `--radius-sm`, `--radius-md`, `--radius-lg`, `--radius-pill`, `--border-width`, `--shadow-1`, `--shadow-2`.

Motion: `--duration-fast`, `--duration-base`, `--ease-standard`. Z-index: `--z-header`.

- Component tokens are optional and live at the top of `components.css` as `--button-*`, `--card-*` and so on, referencing semantic tokens.
- `tokens.json` follows DTCG 2025.10: groups, `$type`, `$value`, `$description`. Provide two theme sets under a top-level `color` group as `light` and `dark`, plus shared `font`, `size`, `space`, `radius`, `duration` groups. Example:

```json
{ "color": { "light": { "bg": { "$type": "color", "$value": "#f6f4f0", "$description": "Page background" } } } }
```

Contrast pairs that must pass AA in both themes: text on bg, text on surface, text-muted on bg, text-muted on surface, text-faint on bg (4.5:1), accent on bg (4.5:1, used for links), on-accent on accent (4.5:1), inverse-text on inverse-bg (4.5:1), line-strong on bg (3:1). Record the measured ratios in the docs page and README.

## 6. Layout contract (required)

- `.container { max-width: var(--container-max); margin-inline: auto; padding-inline: var(--gutter); }`
- Breakpoints: 480, 768, 1024, 1280, 1600. Mobile first.
- `.grid` with `--grid-min` auto-fit columns; `.grid--2`, `.grid--3`, `.grid--4` set explicit column counts from 1024 up. Four hub cards must sit in one row at 1280 and up, two by two below that, never three plus one.
- `.stack` applies vertical rhythm via `--stack-gap`. `.cluster` is a wrapping flex row.
- `.table-wrap { overflow-x: auto; }` around every data table.
- Reading column: `.prose { max-width: var(--measure); }`.

## 7. Component contract (required)

Class names are fixed. Markup below is canonical; systems may add modifier classes but must not rename. Every component must render correctly in both themes.

- Skip link: `<a class="skip-link" href="#main">Skip to content</a>`; `.sr-only` utility.
- Site header: `<header class="site-header"><div class="container site-header__inner"><a class="wordmark" href="/">Jack Jin</a><button class="nav-toggle" aria-expanded="false" aria-controls="site-nav">Menu</button><nav class="site-nav" id="site-nav" aria-label="Primary"><ul><li><a href="..." aria-current="page">AEM + AI</a></li>...</ul></nav><div class="site-header__actions"><a class="btn btn--primary" href="...">Book a talk</a> (theme control) </div></div></header>`. Nav items: AEM + AI, Blog, Portfolio, Talks, Certifications, About. The nav is visible without JavaScript on every width (use `html:not(.js)` rules).
- Breadcrumb: `<nav class="breadcrumb" aria-label="Breadcrumb"><ol><li><a href="...">Home</a></li><li aria-current="page">Blog</li></ol></nav>`, placed directly above the H1 on every page except home.
- Page head: `<header class="page-head"><p class="kicker">...</p><h1 class="page-title">...</h1><p class="byline">By <a>Jack Jin</a> · Published <time datetime="2026-08-09">2026-08-09</time> · Updated <time>...</time> · 12 min · Video</p><p class="summary">40 to 60 words</p></header>`.
- Kicker: `<p class="kicker">` mono label. Systems may prefix it with their identity mark via CSS (`::before`), never with a dash character.
- Button: `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm`; `<a>` or `<button>`; disabled via `aria-disabled="true"`; hover, focus-visible and disabled states.
- Chip: `.chip`, `.chip--topic` with `data-topic="aem-ai|aem|agents|work"`, `.chip--format` with `data-format="video|article|post"`, `.chip--status`.
- Card: `<article class="card card--post"><p class="card__meta"><span class="chip chip--format" data-format="video">Video</span> <time>2026-08-09</time></p><h3 class="card__title"><a href="...">Title</a></h3><p class="card__excerpt">...</p><p class="card__footer"><span class="chip chip--topic" data-topic="aem">AEM</span></p></article>`. Also `.card--hub` (number, `h3`, description, counts line) and `.card--project` (name, period, summary, facts line, link). The whole card is not a link; the title is.
- Facts table: `<table class="facts"><caption class="sr-only">Key facts</caption><tbody><tr><th scope="row">Topic</th><td>...</td></tr></tbody></table>`.
- Data table: `<div class="table-wrap"><table class="table"><caption>...</caption><thead>...</thead><tbody>...</tbody></table></div>`.
- Counts strip: `<dl class="counts"><div><dt>Posts</dt><dd>39</dd></div>...</dl>`.
- Row list: `<ol class="row-list"><li><time>2026-04-06</time><span class="row-list__title"><a>...</a></span><span class="row-list__note">...</span></li></ol>` for talks and related items.
- FAQ: `<section class="faq"><h2>...</h2><details class="faq__item"><summary>Question?</summary><p>Answer.</p></details></section>`. Content stays in the DOM whether open or closed.
- Filter bar: `<form class="filter-bar" data-collection><div class="filter-bar__row"><span class="filter-bar__label">Topic</span> <a class="chip chip--topic" data-topic="aem-ai" href="...">AEM + AI</a>...</div><div class="filter-bar__row"><span class="filter-bar__label">Format</span> <button type="button" class="chip" data-filter="format" data-value="all" aria-pressed="true">All</button>...</div><div class="filter-bar__row"><label for="sort">Sort</label> <select id="sort" name="sort">...</select></div></form>`. Topic chips are links, never buttons. Format and type chips are buttons with `aria-pressed`. State mirrors into the query string (`?format=video&type=leadership&sort=oldest`); the canonical stays clean.
- Pagination: `<nav class="pagination" aria-label="Pagination"><ol><li><a href="..." aria-current="page">1</a></li>...<li><a href="...">Next</a></li></ol></nav>`.
- Embed: `<figure class="embed"><div class="embed__frame">[video placeholder or iframe with title]</div><figcaption class="embed__fallback"><a href="...">Watch on LinkedIn</a> · <a href="...">Watch on YouTube</a></figcaption></figure>`. A plain link is always present.
- Chapters: `<ol class="chapters"><li><time>0:00</time> <span>What Stardust is</span></li></ol>`.
- Transcript: `<details class="transcript"><summary>Transcript</summary><div class="transcript__body">...</div></details>`; the text is in the DOM.
- Author box: `<aside class="author-box"><span class="avatar" aria-hidden="true">JJ</span><div><p class="author-box__name">Jack Jin</p><p class="author-box__role">...</p><p class="author-box__links"><a>LinkedIn</a> <a>GitHub</a></p></div></aside>`.
- Callout: `<aside class="callout" role="note">...</aside>`, `.callout--warn`.
- CTA band: `<section class="cta-band"><h2>Book a talk</h2><p>...</p><p class="cluster"><a class="btn btn--primary">...</a> <a class="btn btn--secondary">...</a></p></section>`. Factual heading, no slogan.
- Footer: `<footer class="site-footer"><div class="container site-footer__grid"><div class="site-footer__col"><h2 class="site-footer__heading">Topics</h2><ul>...</ul></div> x4: Topics, Sections, Elsewhere, Machine files</div><div class="container site-footer__meta"><p>© 2026 Jack Jin · Columbus, Ohio</p></div></footer>`.
- Icons: one inline `<svg hidden>` sprite per page with `<symbol id="icon-video">`, `icon-article`, `icon-post`, `icon-repo`, `icon-external`, `icon-arrow`, `icon-play`, `icon-menu`, `icon-close`, `icon-check`. Use as `<svg class="icon" aria-hidden="true" focusable="false"><use href="#icon-video"></use></svg>`. Stroke or fill uses `currentColor`.

## 8. Documentation site contract: `<slug>/index.html` (required)

One page, the site header from section 7 at the top, a sticky in-page `nav.docs-nav` on desktop, and these sections with these exact ids, in this order:

1. `#overview`: system name, the model that produced the original round, the origin folder, one paragraph of identity, three to five principles, version and status, a "Quick start" block showing the three `<link>` tags and the `data-theme-default` attribute.
2. `#color`: primitive palette (swatches with name and hex), the semantic token table (token, light value, dark value, use), and the contrast table with measured ratios for every pair in section 5, in both themes, marked pass or fail. Ratios are static text in the HTML; a small inline script may re-verify them live.
3. `#typography`: families with their roles, the full scale with a live specimen per step (display, h1, h2, h3, body-lg, body, small, label, mono), line heights, measure.
4. `#spacing`: the scale rendered as bars with names and values.
5. `#layout`: container, gutters, breakpoints, grid demos, and a note on wide screens (what happens at 1920 and 2560).
6. `#shape-elevation`: radii, borders, shadows.
7. `#motion`: durations, easing, reduced motion.
8. `#iconography`: the sprite rendered as a grid with names and sizing rules.
9. `#theming`: how the three-state control works, the pre-paint snippet, the selector structure, the storage key, a live control.
10. `#components`: one subsection per component in section 7, id `#c-<name>` (for example `#c-button`, `#c-card`, `#c-facts-table`). Each subsection follows the Storybook docs pattern: a status badge (stable, beta), a one-paragraph description of when to use it, an anatomy list, stories (each variant and state rendered live inside `<div class="story">` with a `<p class="story__label">`), at least one story rendered inside `<div class="story" data-theme="dark">` to show the dark treatment, the canonical markup as escaped HTML in `<pre><code>`, a "Do / Don't" pair, accessibility notes, and the tokens it consumes.
11. `#patterns`: page anatomy (breadcrumb, H1, byline, summary, facts, body), heading rules, content-in-HTML rule, image and alt rules, the theme default rule. Link to `../../../ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md` (three levels up from a system folder).
12. `#templates`: links to the three templates with one line each.
13. `#status`: table of components with status and version.
14. `#changelog`: dated entries, starting with 0.1.0 on 2026-09-13.

## 9. Templates contract (required)

Content comes from `shared/data/`. Hub links point to `blog.html?topic=<slug>` because hub pages are not built in this round; say so in the README.

`templates/home.html`, in this order: H1 "Jack Jin" with the positioning line under it; summary (site.json `summary_40_60`); four hub cards (site.json `hubs`); latest three posts (posts.json, newest first); featured project (site.json `featured_project`, facts table from its `facts`, commits stay bracketed); credentials strip (Adobe Certified Master, AEM Champion 2026, Azure Solutions Architect Expert, Claude Certified Architect - Professional, link "All 22 certifications" to `https://www.jackzhaojin.com/certifications.html`); talks as a row list (talks.json, all six, upcoming first); CTA band with LinkedIn and the bracketed email; footer.

`templates/post.html`: breadcrumb Home / Blog / title; H1 from site.json `video_post`; byline (author, published 2026-08-09, updated `[date]`, watch time bracketed, Video); summary trimmed faithfully from the 2026-08-09 excerpt in posts.json to 40 to 60 words; facts table (topic AEM + AI, format, tools named in the excerpt: Adobe EDS, Stardust in the public adobe/skills repo, impeccable, DA.live, Google Stitch as the baseline; related project bracketed `[Content Factory, to confirm]`; also on: the LinkedIn URL from posts.json and `[YouTube link pending]`); embed placeholder with fallback links; chapters as `[to be supplied from the recording]` in a single list item; body with H2s answerable from the excerpt only: "What is Adobe Stardust?", "How does the skill work?" (an `<ol>` of the four steps: extract, direction, prototype, build into EDS, with the human gate at prototypes), "How did the runs compare with the Google Stitch baseline?" (a data table with the three DA.live blocks as rows and the three runs as columns, cells bracketed), "Where did it break?" (bracketed); transcript details with bracketed body; FAQ of two or three questions answerable from the excerpt; related: the AEM + AI hub link, the 2026-05-24 and 2026-05-17 posts from posts.json, "Discuss on LinkedIn"; author box.

`templates/blog.html`: breadcrumb; H1 "Blog"; summary; featured intro (the Stardust post); counts by facet as a facts table (site.json `counts`); filter bar; all 39 posts as `.card--post` newest first (titles link to their LinkedIn URLs, since the posts live there today); no pagination (39 is under the 48 threshold; the pagination component appears in the docs); FAQ of three factual questions.

## 10. Quality gates (the coordinator's eval checks these)

For every page: gtag snippet present, canonical present, noindex present, `lang="en"`, skip link, exactly one H1, no skipped heading levels, wordmark text is "Jack Jin" (with an optional trailing period or underscore) and contains no `<svg>` or `<img>`, no unicode dashes in any file, no external scripts other than gtag, fonts only from fonts.googleapis.com, every `<img>` has alt, every internal link resolves, no `href="#"`.

At 390, 768, 1024, 1440, 1920, 2560: no horizontal overflow; `.container` left and right margins equal within 2px at 1440 and above.

Theme: with empty storage the page renders light; clicking Dark sets `data-theme="dark"` and survives reload; clicking System removes `data-theme`; with System and an emulated dark scheme the computed background equals the dark `--color-bg`.

No JavaScript: summary, facts table, first body section and nav are visible (opacity 1, not hidden).

Contrast: every pair in section 5 passes in both themes.

## 11. README contract (required)

`<slug>/README.md` with these headings in this order: What this is; Identity (fonts, palette, shape, the identity marks); Files; How to use (the link tags, the theme default attribute, the pre-paint snippet); Tokens (tiers, naming, where defined, the DTCG file); Components (table: name, class, status); Theming; Templates; Accessibility (contrast table with measured ratios, keyboard, motion); Deviations from the vendor round (what changed and why); Sources; Status and changelog. Plain language, short sentences, no dashes other than "-".

## 12. Vendor identity briefs

Each system keeps the character of its vendor round and drops what broke the rules. Study the source files before writing CSS.

### claude-fable-5-1 (origin: the Claude Design canvas, `local-only/claude-design-2026-09-13/`)

Character: editorial field notes, continuous with the current portfolio page. Serif display type, warm neutrals, lavender accent, hairline borders, mono labels. Sources: `system.mjs` (tokens and CSS), `preview/*.html` (every page in both themes), `build.mjs` (content), and `portfolio/styles.css` in the repo root.

Fonts: Playfair Display 500/600 (display, headings, wordmark), Inter 400/500/600 (body), JetBrains Mono 400/500/700 (labels, mono).

Light: bg `#f6f4f0`, bg-alt `#efece6`, surface `#ffffff`, surface-raised `#f1eee9`, text `#1a1917`, muted `#4a4744`, faint `#6f6b66`, line `rgba(20,18,15,0.10)`, line-strong `rgba(20,18,15,0.24)`, accent `#5b4bc4`, on-accent `#ffffff`, accent-soft `rgba(91,75,196,0.08)`, inverse-bg `#1a1917`, inverse-text `#f6f4f0`, topics aem-ai `#5b4bc4`, aem `#2f6bb3`, agents `#c2433d`, work `#7d5f0e`.

Dark: bg `#131313`, bg-alt `#0e0e0e`, surface `#1a1a19`, surface-raised `#201f1f`, text `#e8e5e3`, muted `#b2afac`, faint `#94908c`, line `rgba(255,255,255,0.08)`, line-strong `rgba(255,255,255,0.20)`, accent `#c0b3ff`, on-accent `#131313`, accent-soft `rgba(192,179,255,0.10)`, inverse-bg `#e8e5e3`, inverse-text `#131313`, topics aem-ai `#c0b3ff`, aem `#9db8e8`, agents `#ff9d9d`, work `#f0cf8e`.

Shape: cards 10px, buttons and chips 6px and 4px, 1px hairlines, almost no shadow. Type: h1 44px (home display 64px), h2 30px, h3 20px, body 16px at 1.65, label 11px mono uppercase with 0.14em tracking. Identity marks: mono uppercase kickers, chips with a small colored dot, primary button filled with ink, mono text links with an underline border. Serif italic is allowed for emphasis in headings but not in the wordmark.

Fix from the round: the canvas used a fixed 1440px artboard, which read as left-aligned on wide screens; use the fluid centered container. Shorten the hub and blog H1s; the keywords belong in the summary line. Add the theme control.

### astra (origin: the Codex round, `local-only/codex-design-2026-09-13/outputs/redesign/`)

Character: serif display with a sans body, violet accent, lavender tint panels and a deep plum panel for featured content, question-shaped section headings, numbered mono kickers. Sources: `styles.css`, `design-tokens.json`, `design-system/index.html`, `index.html`, `blog/adobe-stardust/index.html`.

Fonts: Georgia, "Times New Roman", serif (display and headings, no webfont), Inter 400/500/600 from Google Fonts with system-ui fallback (body), SFMono-Regular, Consolas, monospace (labels).

Light: bg `#fcfbfe`, bg-alt `#f5f3fa`, surface `#ffffff`, surface-raised `#f0edf6`, text `#242135`, muted `#666171`, faint `#7b7686`, line `#dedbe7`, line-strong `#bdb8cc`, accent `#6850b5`, on-accent `#ffffff`, accent-soft `#eee9fa`, inverse-bg `#282238`, inverse-text `#f8f5ff`, topics aem-ai `#6850b5`, aem `#2f6bb3`, agents `#b8392f`, work `#7a5c0f`.

Dark: bg `#18161f`, bg-alt `#131119`, surface `#211e2a`, surface-raised `#2a2635`, text `#f2eef8`, muted `#b7afc6`, faint `#948ca6`, line `#423b51`, line-strong `#5d5470`, accent `#c0b3ff`, on-accent `#18161f`, accent-soft `#302740`, inverse-bg `#292237`, inverse-text `#f8f5ff`, topics aem-ai `#c0b3ff`, aem `#9db8e8`, agents `#ff9d9d`, work `#f0cf8e`.

Shape: card 8px, table 6px, button 5px, soft shadows on raised cards. Spacing scale 4 to 80. Breakpoints in the round were 600, 900, 1150; use the contract's. Identity marks: numbered kickers ("01 / FLAGSHIP TOPIC"), question-shaped H2s, tint panels for featured and FAQ areas, the deep plum inverse panel for the featured project and CTA, a serif H1 with an accent-colored period ("Jack Jin.") on home only.

Fix from the round: drop the two slogans, drop the half-circle mark, drop the repeated "Input / Agent / Evidence" card art (use no card art, or an honest diagram), use the three-state theme control, no pagination below 48 items.

### kimi-k3 (origin: the Kimi K3 round, `local-only/kimi-2026-09-13/app/`)

Character: developer editorial. One sans family for everything, a mono family for labels, near-black on off-white, electric blue accent, square corners, thin rules, bracketed chips and "//" section labels. Sources: `assets/css/site.css`, `design-system/index.html`, `index.html`, `blog/adobe-stardust-explained-edge-delivery-services/index.html`.

Fonts: Inter 400/500/600/700 (display, headings, body), IBM Plex Mono 400/500/600 (labels, mono).

Light: bg `#fafafa`, bg-alt `#f2f2f2`, surface `#ffffff`, surface-raised `#f5f5f5`, text `#0a0a0a`, muted `#3d3d3d`, faint `#6f6f6f`, line `#e3e3e3`, line-strong `#c9c9c9`, accent `#1100ff`, on-accent `#ffffff`, accent-soft `rgba(17,0,255,0.07)`, inverse-bg `#0a0a0a`, inverse-text `#fafafa`, topics aem-ai `#1100ff`, aem `#0b5fd6`, agents `#c2262f`, work `#7a5c0f`.

Dark: bg `#0a0a0a`, bg-alt `#050505`, surface `#101010`, surface-raised `#171717`, text `#fafafa`, muted `#cfcfcf`, faint `#979797`, line `#262626`, line-strong `#3d3d3d`, accent `#8f8aff`, on-accent `#0a0a0a`, accent-soft `rgba(143,138,255,0.10)`, inverse-bg `#fafafa`, inverse-text `#0a0a0a`, topics aem-ai `#8f8aff`, aem `#9db8e8`, agents `#ff9d9d`, work `#f0cf8e`.

Type: display clamp(3rem, 8vw, 6rem), h1 clamp(2rem, 4.6vw, 3.4rem), h2 clamp(1.35rem, 2.6vw, 1.85rem), h3 1.125rem, body 1.0625rem, small 0.9375rem, mono 0.8125rem, headings tracked at -0.02em. Spacing 0.25 to 6rem on a 4px base, container 72rem, measure 68ch, header 3.5rem, easing cubic-bezier(0.165, 0.84, 0.44, 1).

Shape: radius 0 to 2px, 1px rules, no shadows. Identity marks: "//" prefixed mono kickers (CSS `::before`), bracketed mono chips ("[01]", "[active]"), an accent "mark" highlight for a key phrase, a trailing underscore cursor on the wordmark ("Jack Jin_", cursor blink disabled under reduced motion).

Fix from the round: remove every em dash (the round used them as a device; use "/" instead), remove the deferred theme script in favor of the pre-paint snippet, fix the hub grid so four cards never wrap three plus one, keep the sections visible without scrolling (no opacity-zero reveal), replace all invented content with the shared data.

### google-stitch (origin: the Stitch round, `local-only/stitch-2026-09-13/stitch-v1.html`, dark document from line 682, light document from line 1141; split copies in `.playwright-cli/stitch/`)

Character: terminal console. Mono headings, sharp corners, a Material-style dark palette with a lavender primary, emerald and cyan accents used sparingly, bracketed counts and "//" numbered section labels. The round only produced the home page in dark; extrapolate the rest from its Tailwind config and the structure of the other three systems. Sources: the two Tailwind configs inside the file (dark and light color maps and the type scale).

Fonts: JetBrains Mono 400/500/600 (display, headings, labels), Inter 400/500/600 (body).

Dark (native): bg `#121315`, bg-alt `#0d0e10`, surface `#18191b`, surface-raised `#1f2022`, text `#f4f4f6`, muted `#c9c4d1`, faint `#8e929b`, line `#2e3138`, line-strong `#484550`, accent `#c0b3ff`, on-accent `#312567`, accent-hover `#dcd3ff`, accent-soft `rgba(192,179,255,0.12)`, inverse-bg `#f4f4f6`, inverse-text `#121315`, topics aem-ai `#c0b3ff`, aem `#7bd0ff`, agents `#ffb4ab`, work `#4edea3`. Secondary accents: emerald `#10b981`, cyan `#38bdf8`.

Light (extrapolated from the round's light config): bg `#faf8ff`, bg-alt `#f1f5f9`, surface `#ffffff`, surface-raised `#f8fafc`, text `#0f172a`, muted `#334155`, faint `#64748b`, line `#e2e8f0`, line-strong `#cbd5e1`, accent `#4338ca`, on-accent `#ffffff`, accent-hover `#372abf`, accent-soft `#e0e7ff`, inverse-bg `#0f172a`, inverse-text `#faf8ff`, topics aem-ai `#4338ca`, aem `#0284c7`, agents `#dc2626`, work `#047857`. Secondary accents: emerald `#047857`, cyan `#0284c7`.

Type (mono headings with negative tracking): display 40/48 at -0.04em, h1 40/48, h2 28/36 at -0.03em, h3 20/28 at -0.02em, body-lg 18/30, body 15/26, small 13/20, label 13/18 at +0.02em, label-sm 11/16 uppercase at +0.05em, code 13.5/22.

Shape: radius 2px, 4px for panels, no shadows, 1px borders. Identity marks: a prompt-style breadcrumb treatment (a "$" glyph before the trail via CSS, the markup stays a real breadcrumb), bracketed mono counts ("[ 39 POSTS ]"), numbered "// 01 / SECTION" kickers, a small emerald status dot as a decorative header element placed outside the wordmark, CTA filled with the accent and on-accent text.

Fix from the round: remove the fake telemetry bar and every invented fact, remove Tailwind and Material Symbols, remove em dashes, build the light theme as a first-class set, build all pages and components, and make the light header not wrap at 1440.

## 13. Local testing (required)

Serve the repo root so shared paths resolve. Ports are assigned to avoid clashes: claude-fable-5-1 8801, astra 8802, kimi-k3 8803, google-stitch 8804.

```bash
python3 -m http.server <port> --bind 127.0.0.1 --directory /Users/jackjin/dev/jackzhaojin.github.io
```

Open `http://127.0.0.1:<port>/design-systems/2026-09-13/<slug>/`. Test with `playwright-cli -s=<slug>` and write every screenshot or snapshot with `--filename=.playwright-cli/<slug>/<name>.png` from the repo root. Check every width in section 10, both themes, and JavaScript disabled (`playwright-cli run-code` with a context where `javaScriptEnabled` is false, or by removing the script tags in a copy). Close your session and stop your server when done.
