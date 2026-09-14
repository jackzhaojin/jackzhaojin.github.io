# Field Notes (claude-fable-5-1)

## What this is

Field Notes is one design system for www.jackzhaojin.com, the portfolio page included. It is the cleaned up version of the Claude Design canvas round from 2026-09-13, built to the contract in `../SPEC.md`. It ships tokens in CSS and DTCG JSON, a base stylesheet, a component stylesheet, a documentation site with live stories in light and dark, and three page templates filled from `../shared/data`. Light is the default. Dark is the portfolio's palette on the same token names.

Origin: the Claude Design canvas at `local-only/claude-design-2026-09-13/` (system.mjs, build.mjs, preview/*.html), produced by Claude Fable 5.1. The tokens continue `portfolio/styles.css`.

## Identity

Character: editorial field notes. Serif display type, warm neutrals, a lavender accent, hairline borders, mono uppercase labels.

Fonts, from fonts.googleapis.com only:

- Playfair Display 500 and 600 (display, headings, wordmark). Italic 500 and 600 allowed for emphasis inside a heading, never in the wordmark.
- Inter 400, 500, 600 (body).
- JetBrains Mono 400, 500, 700 (kickers, chips, bylines, nav, buttons, code).

Palette, light: bg #f6f4f0, bg-alt #efece6, surface #ffffff, surface-raised #f1eee9, text #1a1917, muted #4a4744, faint #6f6b66, line rgba(20,18,15,0.10), line-strong rgba(20,18,15,0.48), accent #5b4bc4, accent-hover #4a3ba8, on-accent #ffffff, accent-soft rgba(91,75,196,0.08), inverse-bg #1a1917, inverse-text #f6f4f0, topics aem-ai #5b4bc4, aem #2f6bb3, agents #c2433d, work #7d5f0e.

Palette, dark: bg #131313, bg-alt #0e0e0e, surface #1a1a19, surface-raised #201f1f, text #e8e5e3, muted #b2afac, faint #94908c, line rgba(255,255,255,0.08), line-strong rgba(255,255,255,0.36), accent #c0b3ff, accent-hover #d6cdff, on-accent #131313, accent-soft rgba(192,179,255,0.10), inverse-bg #e8e5e3, inverse-text #131313, topics aem-ai #c0b3ff, aem #9db8e8, agents #ff9d9d, work #f0cf8e.

Shape: cards 10px, buttons and controls 6px, chips 4px, filter pills 999px. Every border is 1px. Elevation is tone (bg, surface, surface-raised), not shadow; the two shadow tokens are near zero and unused today.

Identity marks:

- Mono uppercase kickers with 0.14em tracking, optionally with a trailing hairline (`.kicker--rule`).
- Chips with a small colored dot; format chips draw an icon instead of the dot.
- Primary button filled with ink (`--color-inverse-bg`).
- Mono text links with a hairline underline border.
- The wordmark is the text "Jack Jin" in Playfair Display 600 and nothing else.

## Files

- `README.md`: this file.
- `index.html`: the documentation site. Sections: overview, color, typography, spacing, layout, shape-elevation, motion, iconography, theming, components (one `#c-<name>` subsection each), patterns, templates, status, changelog.
- `tokens.css`: primitives (`--palette-*`, `--font-*`, raw sizes) and semantic tokens in the SPEC selector structure, light on `:root` and `[data-theme="light"]`, dark on `[data-theme="dark"]` and under `prefers-color-scheme: dark` when no attribute is set.
- `tokens.json`: the same tokens in DTCG 2025.10 format. Top level groups: palette, color (light and dark sets), font, size, space, radius, duration.
- `base.css`: reset, element typography, links, focus ring, reduced motion, `.container`, `.stack`, `.cluster`, `.grid` family, `.prose`, `.table-wrap`, `.sr-only`, `.skip-link`, `.placeholder`.
- `components.css`: every component in SPEC section 7 plus the docs-only story and specimen styles. Component tokens (`--button-*`, `--card-*`, `--chip-*`) sit at the top and reference semantic tokens.
- `scripts.js`: blog filter and sort with query string state. Optional; the blog reads without it.
- `templates/home.html`, `templates/post.html`, `templates/blog.html`: the three page templates.

## How to use

Put this in the head, in this order, after the gtag snippet, title, description, canonical and robots tags:

```html
<html lang="en" data-theme-default="light">
...
<script>
(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('jj-theme');var def=d.getAttribute('data-theme-default')||'light';var c=(s==='light'||s==='dark'||s==='system')?s:def;if(c==='system'){d.removeAttribute('data-theme');}else{d.setAttribute('data-theme',c);}d.setAttribute('data-theme-choice',c);}catch(e){}})();
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400;500;700&family=Playfair+Display:ital,wght@0,500;0,600;1,500;1,600&display=swap">
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script src="../shared/theme.js" defer></script>
```

Inside `templates/` the paths are `../tokens.css` and `../../shared/theme.js`. The pre-paint snippet is copied verbatim from SPEC section 3; it adds the `js` class and applies the stored theme before any CSS loads. `data-theme-default` is `light` on every page in this round.

Include the icon sprite once per page right after `<body>` (copy it from any template). Put the skip link first, then the header with the theme control, then `<main id="main">`.

## Tokens

Three tiers with one-way dependency:

1. Primitives: `--palette-*` colors, `--font-*` families, `--size-*` raw sizes. Defined once on `:root` in `tokens.css`.
2. Semantic: the names fixed by SPEC section 5. Color tokens are defined per theme and reference primitives. Typography, spacing, layout, shape, motion and z-index tokens are theme independent.
3. Component: `--button-radius`, `--button-pad`, `--card-radius`, `--card-pad`, `--chip-radius`, `--chip-dot`, `--panel-pad`, defined at the top of `components.css` and referencing semantic tokens.

Semantic names: `--color-bg`, `--color-bg-alt`, `--color-surface`, `--color-surface-raised`, `--color-text`, `--color-text-muted`, `--color-text-faint`, `--color-line`, `--color-line-strong`, `--color-accent`, `--color-accent-hover`, `--color-on-accent`, `--color-accent-soft`, `--color-focus`, `--color-inverse-bg`, `--color-inverse-text`, `--color-topic-aem-ai`, `--color-topic-aem`, `--color-topic-agents`, `--color-topic-work`; `--font-display`, `--font-body`, `--font-mono`; `--text-display` (44 to 64px), `--text-h1` (32 to 44px), `--text-h2` (24 to 30px), `--text-h3` 20px, `--text-body-lg` 19px, `--text-body` 16px, `--text-small` 14px, `--text-label` 11px, `--text-mono` 13px; `--leading-tight` 1.12, `--leading-body` 1.65, `--tracking-label` 0.14em; `--weight-regular` 400, `--weight-medium` 500, `--weight-bold` 600; `--space-1` to `--space-10` (4, 8, 12, 16, 24, 32, 48, 64, 96, 128); `--container-max` 1280px, `--gutter` clamp(20px, 5vw, 64px), `--measure` 66ch, `--header-height` 62px; `--radius-sm` 4, `--radius-md` 6, `--radius-lg` 10, `--radius-pill` 999, `--border-width` 1px, `--shadow-1`, `--shadow-2`; `--duration-fast` 120ms, `--duration-base` 250ms, `--ease-standard` cubic-bezier(0.16, 1, 0.3, 1); `--z-header` 100.

The DTCG file `tokens.json` mirrors these with `$type`, `$value` and `$description`. Semantic color values reference palette entries with `{palette.name}` aliases.

## Components

| Name | Class | Status |
| --- | --- | --- |
| Skip link | `.skip-link` (with `.sr-only`) | stable |
| Site header | `.site-header`, `.wordmark`, `.nav-toggle`, `.site-nav`, `.site-header__actions` | stable |
| Theme control | `.theme-control`, `.theme-control__btn` | stable |
| Breadcrumb | `.breadcrumb` | stable |
| Page head | `.page-head`, `.page-title`, `.byline`, `.summary` | stable |
| Kicker | `.kicker`, `.kicker--accent`, `.kicker--rule` | stable |
| Button | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm` | stable |
| Chip | `.chip`, `.chip--topic`, `.chip--format`, `.chip--status`, `.chip--plain` | stable |
| Card | `.card`, `.card--post`, `.card--hub`, `.card--project` | stable |
| Facts table | `.facts` | stable |
| Data table | `.table` inside `.table-wrap` | stable |
| Counts strip | `.counts`, `.counts--inline` | stable |
| Row list | `.row-list`, `.row-list__title`, `.row-list__note`, `.row-list__kind` | stable |
| FAQ | `.faq`, `.faq__item` | stable |
| Filter bar | `.filter-bar`, `.filter-bar__row`, `.filter-bar__label` | beta |
| Pagination | `.pagination` | stable |
| Embed | `.embed`, `.embed__frame`, `.embed__fallback`, `.embed__play` | beta |
| Chapters | `.chapters` | stable |
| Transcript | `.transcript`, `.transcript__body` | stable |
| Author box | `.author-box`, `.avatar` | stable |
| Callout | `.callout`, `.callout--warn`, `.callout__label` | stable |
| CTA band | `.cta-band` | stable |
| Footer | `.site-footer`, `.site-footer__grid`, `.site-footer__col`, `.site-footer__heading`, `.site-footer__meta` | stable |
| Icons | `.icon`, `.icon--sm`, `.icon--md`, `.icon--lg` | stable |

Each has a docs entry at `index.html#c-<name>` with stories in both themes, escaped markup, do and don't, accessibility notes and the tokens it uses.

## Theming

Three states: Light, Dark, System. The control is a `role="group"` of three buttons with `data-set-theme` and `aria-pressed`. `../shared/theme.js` (not forked) persists the choice under the localStorage key `jj-theme`, syncs `aria-pressed`, sets `data-theme-effective` on the root and follows OS changes while in System. The pre-paint snippet applies the stored choice before first paint. With empty storage the page renders light. Any element can be forced to one theme with `data-theme="dark"` or `data-theme="light"`; the docs page uses that for its dark stories. `color-scheme` follows the theme so native form controls and scrollbars match.

## Templates

Content comes only from `../shared/data/site.json`, `posts.json`, `credentials.json` and `talks.json`. Anything not in those files is a bracketed placeholder, for example `[email address to be supplied]`, `[YouTube link pending]`, `[transcript to be supplied]`, `[from git, not yet verified]`.

- `templates/home.html`: H1 "Jack Jin" with the positioning line, the 40 to 60 word summary, four hub cards, the latest three posts, the Anima Mesh featured project with its facts table, the credentials strip with the "All 22 certifications" link, all six talks upcoming first, the CTA band, footer.
- `templates/post.html`: the Stardust video post. Breadcrumb, H1 from site.json, byline, summary trimmed from the 2026-08-09 excerpt (59 words), facts table, embed placeholder with the LinkedIn link, one bracketed chapter item, body with four H2s answerable from the excerpt, transcript details with a bracketed body, three FAQ items, related items, author box.
- `templates/blog.html`: generated from posts.json so every URL, date and excerpt is exact. Breadcrumb, H1 "Blog", summary, a start-here panel for the Stardust post, counts by facet from site.json, the filter bar, all 39 posts newest first linking to LinkedIn, a three question FAQ. No pagination because 39 is under the 48 threshold.

Hub pages are not built in this round, so every hub link points to `blog.html?topic=<slug>` with the slugs from site.json: `aem-ai`, `adobe-aem`, `ai-agents`, `working-with-ai`. `scripts.js` maps them to the card `data-hubs` values. Provisional: AEM + AI membership is "[curated: membership set per post]" in site.json, so the six AEM posts whose excerpts are about agents, skills or MCP servers (2026-08-09, 2026-05-24, 2026-05-17, 2026-03-23, 2025-10-12, 2025-10-05) carry the AEM + AI chip until Jack sets the real membership.

## Accessibility

Contrast, measured 2026-09-13 with a WCAG 2.x relative luminance script (alpha values composited over the background first):

| Pair | Minimum | Light | Dark |
| --- | --- | --- | --- |
| text on bg | 4.5 | 15.99:1 pass | 14.82:1 pass |
| text on surface | 4.5 | 17.57:1 pass | 13.89:1 pass |
| text-muted on bg | 4.5 | 8.40:1 pass | 8.51:1 pass |
| text-muted on surface | 4.5 | 9.23:1 pass | 7.98:1 pass |
| text-faint on bg | 4.5 | 4.81:1 pass | 5.86:1 pass |
| accent on bg | 4.5 | 5.89:1 pass | 9.85:1 pass |
| on-accent on accent | 4.5 | 6.46:1 pass | 9.85:1 pass |
| inverse-text on inverse-bg | 4.5 | 15.99:1 pass | 14.82:1 pass |
| line-strong on bg | 3 | 3.22:1 pass | 3.33:1 pass |

Also checked: accent-hover on bg 7.70:1 and 12.42:1; topic colors on surface 5.04:1 to 5.97:1 in light and 8.67:1 to 11.63:1 in dark.

Keyboard: a skip link is the first focusable element; every interactive element shows a 2px accent ring with a 2px offset on `:focus-visible`; the nav toggle exposes `aria-expanded` and `aria-controls`; filter chips expose `aria-pressed`; FAQ and transcript are native `details`; pagination and the current nav item use `aria-current`. Targets are at least 44px for buttons and pagination.

Motion: two durations and one easing. Under `prefers-reduced-motion: reduce` every transition and animation collapses to 0.01ms and smooth scrolling is off. There are no reveal-on-scroll or opacity-zero patterns.

Structure: one H1 per page, heading levels in order, `nav` landmarks labelled, decorative SVG `aria-hidden="true"`, every `img` has alt, the nav is visible without JavaScript at every width.

## Deviations from the vendor round

- Fixed 1440px artboard replaced by a fluid centered container (1280px max, 20 to 64px gutters). The canvas read as left aligned on wide screens.
- Light is now the default. The canvas defaulted to dark with light as separate previews.
- Three-state Light / Dark / System control added, using the shared script and the pre-paint snippet.
- The wordmark's half-circle glyph and italic "Jin" are gone. The wordmark is the plain text "Jack Jin".
- line-strong raised from rgba(20,18,15,0.24) to 0.48 in light and from rgba(255,255,255,0.20) to 0.36 in dark. The original values measured 1.69:1 and 2.16:1 against the page background and failed the 3:1 UI border requirement. The hairline `--color-line` keeps the original values.
- H2 raised from 28px to 30px per the SPEC brief; headings use clamp() for phones instead of a separate mobile rule set.
- Hub and blog H1s shortened ("Blog", the hub name). Keywords moved to the summary.
- Invented facts from the canvas removed: commit counts, tag counts, first and last commit dates, watch times, "25 certifications", the invented transcript and chapter lists, the YouTube and Credly URLs, the invented comparison table cells. All are bracketed or replaced by values from shared/data.
- Cards are no longer anchors; the title is the link.
- The FAQ uses `details` instead of static heading and paragraph pairs so it can collapse without a script.
- Topic filter chips are links; format and type chips are buttons with `aria-pressed`; sort is a real `select`.
- No pagination on the blog (39 items, threshold 48). The component remains in the docs.
- Format chips draw their icon with a CSS mask on `::before` so the canonical markup is text only; the canvas used `a.ico` classes.

## Sources

- `../SPEC.md`, sections 1 to 13.
- `../shared/theme.js` and `../shared/data/site.json`, `posts.json`, `credentials.json`, `talks.json`.
- `../../../ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md`.
- `../../../CLAUDE.md` and `../../../portfolio/CLAUDE.md` for voice.
- `../../../local-only/claude-design-2026-09-13/system.mjs`, `build.mjs`, `preview/Main.light.html`, `preview/Main.html`, `preview/PostVideo.light.html`, `preview/Blog.light.html`, `preview/AemAiHub.light.html`, `preview/Components.html`, `preview/Tokens.html`.
- `../../../portfolio/styles.css`.
- W3C Design Tokens Community Group format 2025.10 for `tokens.json`.

## Status and changelog

Version 0.1.0, beta. Built 2026-09-13.

0.1.0, 2026-09-13

- First release for the four-system comparison round.
- Tokens lifted from portfolio/styles.css and the Claude Design canvas; light theme made the default.
- line-strong adjusted to pass 3:1 in both themes.
- Fixed artboard replaced by a fluid container; H1s shortened; theme control added; wordmark glyph removed.
- 24 component entries documented with light and dark stories; three templates built from shared data.
