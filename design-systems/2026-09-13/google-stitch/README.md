# google-stitch design system

Round 2026-09-13. Version 0.1.0. Status: beta, round candidate, not deployed.

## What this is

One of four candidate design systems for www.jackzhaojin.com, built to the shared contract in `../SPEC.md`. It carries the terminal console identity of the Google Stitch round: JetBrains Mono headings, Inter body, sharp corners, 1px borders, bracketed counts, `//` numbered section labels and a `$` prompt on the breadcrumb. Light is the default theme. Dark is the round's native palette. Everything is plain HTML, CSS and JavaScript. No framework, no build step, no CDN script, no icon font.

The folder holds tokens (CSS and DTCG JSON), base and component stylesheets, a documentation page with live stories for every component in both themes, three page templates built from real site data, and an optional filter script for the blog template.

## Identity

Fonts, from fonts.googleapis.com only:

- Display, headings, wordmark, labels, code: JetBrains Mono 400, 500, 600.
- Body: Inter 400, 500, 600.

Palette:

- Light: background #faf8ff, surface #ffffff, text #0f172a, muted #334155, faint #5d6b82, accent #4338ca with white on it, emerald #047857, cyan #0369a1.
- Dark: background #121315, surface #18191b, text #f4f4f6, muted #c9c4d1, faint #8e929b, accent #c0b3ff with #312567 on it, emerald #10b981, cyan #38bdf8.
- Topic colors: AEM + AI indigo or lavender, AEM sky or light cyan, AI Agents red or coral, Working with AI emerald.

Shape: 2px radius on buttons, chips and cards, 4px on panels, 1px borders everywhere, no card shadows. The only shadow sits under the sticky header.

Identity marks:

- Kickers render as `// 01 / TOPICS`. The `//` is CSS generated content; the slash is the separator, never a dash.
- The breadcrumb gets an emerald `$` before the trail and `/` between items, both from CSS. The markup is a real ordered list.
- Counts render in square brackets, `[ 39 ]`, from CSS on the counts strip and from a `.bracket` utility elsewhere.
- FAQ and transcript markers are `[+]` and `[-]`.
- The wordmark is the text "Jack Jin" and nothing else. A 6px emerald dot sits next to it as a decorative sibling with `aria-hidden`. It does not animate and does not mean anything.
- Code blocks and the video frame keep the dark console ground in both themes.

## Files

| File | Purpose |
| --- | --- |
| `README.md` | This file. |
| `index.html` | Documentation site: foundations, tokens, components with stories, patterns, templates, status, changelog. |
| `tokens.css` | Primitives, then light and dark semantic tokens in the SPEC selector structure. |
| `tokens.json` | The same tokens in DTCG 2025.10 format. |
| `base.css` | Reset, element typography, `.container`, `.stack`, `.cluster`, `.grid` family, `.prose`, `.table-wrap`, `.sr-only`, `.skip-link`, focus ring, reduced motion. |
| `components.css` | Every component in SPEC section 7, all states, both themes. Component tokens at the top. |
| `scripts.js` | Optional. Blog format and type filters, sort, and `?topic=` handling, mirrored into the query string. |
| `templates/home.html` | Home page template. |
| `templates/post.html` | Post template in the video state. |
| `templates/blog.html` | Collection template with all 39 posts. |

## How to use

Put these in `<head>` in this order, after the pre-paint snippet and the font link:

```html
<link rel="stylesheet" href="tokens.css">
<link rel="stylesheet" href="base.css">
<link rel="stylesheet" href="components.css">
<script src="../shared/theme.js" defer></script>
```

Set the theme default on the root element. Every page in this round uses light:

```html
<html lang="en" data-theme-default="light">
```

Copy the pre-paint snippet from SPEC section 3 verbatim. It adds the `js` class and applies the stored theme before any CSS loads:

```html
<script>
(function(){var d=document.documentElement;d.classList.add('js');try{var s=localStorage.getItem('jj-theme');var def=d.getAttribute('data-theme-default')||'light';var c=(s==='light'||s==='dark'||s==='system')?s:def;if(c==='system'){d.removeAttribute('data-theme');}else{d.setAttribute('data-theme',c);}d.setAttribute('data-theme-choice',c);}catch(e){}})();
</script>
```

Inside `templates/` the paths are `../tokens.css` and `../../shared/theme.js`. Include the SVG sprite once per page and place the theme control in the header.

## Tokens

Three tiers with one way dependencies:

1. Primitives: `--palette-*` (ink scale from the Stitch dark config, slate scale from the light config, lavender and indigo primaries, emerald, cyan, coral, red), `--font-*`, raw sizes. Defined once on `:root` in `tokens.css`.
2. Semantic: the fixed names from SPEC section 5 (`--color-bg`, `--color-text`, `--color-accent`, `--text-h1`, `--space-4`, `--radius-sm` and so on). Defined for light on `:root, [data-theme="light"]`, for dark on `[data-theme="dark"]` and again inside the `prefers-color-scheme: dark` media query for the System choice. Extra semantic names this system adds: `--color-emerald`, `--color-cyan`, `--color-code-bg`, `--color-code-text`, `--text-label-sm`, `--leading-snug`, `--tracking-display`, `--tracking-h2`, `--tracking-h3`, `--tracking-label-md`.
3. Component: `--button-*`, `--chip-*`, `--card-*`, `--panel-radius`, `--control-line` at the top of `components.css`, referencing semantic tokens only.

`tokens.json` mirrors the CSS in DTCG 2025.10 shape: groups with `$type`, `$value` and `$description`, two theme sets under `color.light` and `color.dark`, primitives under `color.palette`, and shared `font`, `size`, `space`, `radius`, `shadow`, `duration` and `easing` groups. Color values are sRGB hex strings as in the SPEC example.

## Components

| Name | Class | Status |
| --- | --- | --- |
| Skip link | `.skip-link`, `.sr-only` | stable |
| Site header | `.site-header`, `.wordmark`, `.status-dot`, `.nav-toggle`, `.site-nav`, `.site-header__actions` | stable |
| Theme control | `.theme-control`, `.theme-control__btn` | stable |
| Breadcrumb | `.breadcrumb` | stable |
| Page head | `.page-head`, `.page-title`, `.byline`, `.summary` | stable |
| Kicker | `.kicker` | stable |
| Button | `.btn`, `.btn--primary`, `.btn--secondary`, `.btn--ghost`, `.btn--sm` | stable |
| Chip | `.chip`, `.chip--topic`, `.chip--format`, `.chip--status` | stable |
| Card | `.card`, `.card--post`, `.card--hub`, `.card--project` | stable |
| Facts table | `.facts` | stable |
| Data table | `.table` inside `.table-wrap` | stable |
| Counts strip | `.counts` | stable |
| Row list | `.row-list` | stable |
| FAQ | `.faq`, `.faq__item` | stable |
| Filter bar | `.filter-bar` | beta |
| Pagination | `.pagination` | stable |
| Embed | `.embed`, `.embed__frame`, `.embed__fallback` | stable |
| Chapters | `.chapters` | stable |
| Transcript | `.transcript`, `.transcript__body` | stable |
| Author box | `.author-box`, `.avatar` | stable |
| Callout | `.callout`, `.callout--warn` | stable |
| CTA band | `.cta-band` | stable |
| Footer | `.site-footer` | stable |
| Icons | `.icon` with the `<svg hidden>` sprite | stable |
| Credentials strip | `.credential-strip` | beta |

Class names follow the contract. Modifiers this system adds are listed above; nothing is renamed.

## Theming

- Three choices: Light, Dark, System. Storage key `jj-theme`. Light is the default when nothing is stored.
- The pre-paint snippet sets `data-theme` before first paint. `shared/theme.js` (not forked) wires the buttons, syncs `aria-pressed`, persists the choice, sets `data-theme-effective`, and follows OS changes while in System.
- Because the dark set is also keyed on `[data-theme="dark"]`, any element can be forced dark. The docs page uses this for its dark stories.
- `color-scheme` is declared with each set so native controls and scrollbars follow.
- Verified: with empty storage the page renders light; clicking Dark sets `data-theme="dark"` and survives a reload; clicking System removes the attribute; with System and an emulated dark scheme the body background equals the dark `--color-bg` (#121315). A second control on the docs page stays in sync with the header control.

## Templates

All content comes from `../shared/data/*.json`. Anything not in the data is a bracketed placeholder.

- `templates/home.html`: H1 "Jack Jin", positioning line, the 40 to 60 word summary, four hub cards, latest three posts, the Anima Mesh featured project with a facts table (commits stay bracketed), a credentials strip with the link to all 22 certifications, all six talks with upcoming first, and a CTA band with the LinkedIn link and the bracketed email.
- `templates/post.html`: the Stardust video post. Breadcrumb, byline, a 60 word summary trimmed from the excerpt, facts table, embed placeholder with the LinkedIn link, chapters placeholder, four question H2s answerable from the excerpt, a comparison table with bracketed cells, transcript placeholder, three FAQ items, related hub and posts, author box.
- `templates/blog.html`: 39 cards newest first, titles linking to LinkedIn, featured intro, counts by facet, filter bar, three FAQ items. No pagination under 48 items.

Hub links point to `blog.html?topic=<slug>` because hub pages are not built in this round. `scripts.js` maps the slugs: `adobe-aem` to topic aem, `ai-agents` to topic ai, `working-with-ai` to type leadership, and `aem-ai` to topic aem for now because its curated membership set is not in the data.

The header hides the Book a talk button under 480px so the wordmark, theme control and Menu fit in one row; the CTA band and footer carry the same link.

## Accessibility

Contrast, measured with the WCAG 2 relative luminance formula. Every required pair passes in both themes.

| Pair | Min | Light | Ratio | Result | Dark | Ratio | Result |
| --- | --- | --- | --- | --- | --- | --- | --- |
| --color-text on --color-bg | 4.5 | #0f172a on #faf8ff | 16.95 | pass | #f4f4f6 on #121315 | 16.92 | pass |
| --color-text on --color-surface | 4.5 | #0f172a on #ffffff | 17.85 | pass | #f4f4f6 on #18191b | 16.02 | pass |
| --color-text-muted on --color-bg | 4.5 | #334155 on #faf8ff | 9.83 | pass | #c9c4d1 on #121315 | 10.89 | pass |
| --color-text-muted on --color-surface | 4.5 | #334155 on #ffffff | 10.35 | pass | #c9c4d1 on #18191b | 10.30 | pass |
| --color-text-faint on --color-bg | 4.5 | #5d6b82 on #faf8ff | 5.12 | pass | #8e929b on #121315 | 5.96 | pass |
| --color-accent on --color-bg | 4.5 | #4338ca on #faf8ff | 7.50 | pass | #c0b3ff on #121315 | 9.86 | pass |
| --color-on-accent on --color-accent | 4.5 | #ffffff on #4338ca | 7.90 | pass | #312567 on #c0b3ff | 7.00 | pass |
| --color-inverse-text on --color-inverse-bg | 4.5 | #faf8ff on #0f172a | 16.95 | pass | #121315 on #f4f4f6 | 16.92 | pass |
| --color-line-strong on --color-bg | 3.0 | #7b8798 on #faf8ff | 3.46 | pass | #6b6875 on #121315 | 3.42 | pass |

Also checked: topic chip text is at least 4.83:1 on light surfaces and 10:1 on dark; the light cyan used for the video chip is 5.93:1 on white.

Keyboard: the skip link is the first tab stop. Every interactive element has a 2px focus ring in `--color-focus` with a 2px offset; inside the CTA band the ring switches to the on-accent color. Disabled buttons use `aria-disabled` and stay readable. The nav toggle exposes `aria-expanded` and `aria-controls`. Theme and filter toggles expose `aria-pressed`. FAQ and transcript use native `details`.

Motion: two durations (120ms, 200ms) and one easing. Under `prefers-reduced-motion: reduce` every transition and animation is cut to 0.01ms and smooth scrolling is off. Nothing animates on load or scroll.

Structure: one H1 per page, headings never skip a level, `lang="en"`, alt on every image, `aria-hidden` on every decorative SVG, every table has a caption, every data table sits in `.table-wrap`. Pages read with JavaScript off: the nav becomes a second header row, every card is visible, and the summary, facts table and first section are in the initial HTML.

## Deviations from the vendor round

- Removed the telemetry bar ("NODE: RUNTIME_OK", "PASS_RATE: 100%", "SYS: OPERATIONAL") and every invented fact: posts, talk titles, tenure, version numbers, pass rates, the email address. Content now comes from the shared data or is bracketed.
- Removed Tailwind and Material Symbols. The identity is written as plain CSS and a ten symbol inline SVG sprite.
- Removed the 36 em dashes. Section labels use `/` as the separator.
- Removed the avatar circle and the "person" icon from the header. The wordmark is text only; the emerald dot stays as a decorative sibling.
- Built the light theme as a complete token set from the round's light config, and every page and component the round did not produce.
- Wired the three-state control the round showed but did not connect, through the shared script, with persistence and pre-paint application.
- Changed three token values that failed contrast: dark line-strong #484550 (1.99:1) to #6b6875 (3.42:1); light line-strong #cbd5e1 (1.41:1) to #7b8798 (3.46:1); light text-faint #64748b (4.52:1, and 4.34:1 on the alternate background) to #5d6b82 (5.12:1). Light cyan and the AEM topic color moved from #0284c7 (4.10:1 on white) to #0369a1 (5.93:1) because they are used as chip text.
- Container max width is 1280px instead of the round's 1120px, per the contract range.
- The header does not wrap at 1440. Six nav items, the button and the control sit in one 64px row from 1024 up.
- Radius: 2px and 4px kept; the round's 12px "full" value is not used except as `--radius-pill` for the status dot.

## Sources

- `../SPEC.md`, the round contract.
- `../shared/theme.js`, `../shared/data/site.json`, `posts.json`, `credentials.json`, `talks.json`.
- `../../../ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md`, why each page slot exists.
- `../../../CLAUDE.md` and `../../../portfolio/CLAUDE.md`, voice rules.
- Vendor round: `../../../local-only/stitch-2026-09-13/stitch-v1.html` (dark document from line 682, light from line 1141) and the split copies in `../../../.playwright-cli/stitch/dark.html` and `light.html`, including their Tailwind config blocks for the color maps and type scale.
- Design Tokens Community Group format 2025.10 for `tokens.json`.

## Status and changelog

Status: beta. Every quality gate in SPEC section 10 was checked locally at 390, 768, 1024, 1440, 1920 and 2560 in both themes, plus the theme gates and a no JavaScript pass.

- 0.1.1, 2026-09-13. Fixed: cards inside the docs page's dark story frames rendered a light surface under dark-theme text (1.1:1) because `--card-bg`, `--card-line` and `--control-line` were declared on `:root` only. They now resolve on every themed scope (`:root, [data-theme]`).
- 0.1.0, 2026-09-13. First build from the Stitch round. Tokens in CSS and DTCG JSON for light and dark, base and component styles, the documentation page, three templates, this README. Three token values replaced for contrast. Telemetry bar, invented facts, Tailwind, Material Symbols and em dashes removed.
