---
name: Jack Jin design system v3
description: Editorial field notes for www.jackzhaojin.com, one system for every page, light default with a dark variant.
colors:
  paper: "#f6f4f0"
  paper-alt: "#efece6"
  paper-surface: "#ffffff"
  paper-surface-raised: "#f1eee9"
  ink: "#1a1917"
  ink-muted: "#4a4744"
  ink-faint: "#6f6b66"
  hairline: "rgba(20, 18, 15, 0.10)"
  hairline-strong: "rgba(20, 18, 15, 0.48)"
  lavender: "#5b4bc4"
  lavender-deep: "#4a3ba8"
  lavender-wash: "rgba(91, 75, 196, 0.08)"
  lavender-light: "#c0b3ff"
  lavender-lighter: "#d6cdff"
  lavender-wash-night: "rgba(192, 179, 255, 0.10)"
  topic-aem-blue: "#2f6bb3"
  topic-aem-blue-light: "#9db8e8"
  topic-agents-red: "#c2433d"
  topic-agents-red-light: "#ff9d9d"
  topic-work-gold: "#7d5f0e"
  topic-work-gold-light: "#f0cf8e"
  night: "#131313"
  night-deep: "#0e0e0e"
  night-surface: "#1a1a19"
  night-surface-raised: "#201f1f"
  bone: "#e8e5e3"
  bone-muted: "#b2afac"
  bone-faint: "#94908c"
  hairline-night: "rgba(255, 255, 255, 0.08)"
  hairline-night-strong: "rgba(255, 255, 255, 0.36)"
typography:
  display:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "clamp(2.75rem, 1.9rem + 3vw, 4rem)"
    fontWeight: 600
    lineHeight: 1.05
    letterSpacing: "-0.01em"
  headline:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "clamp(2rem, 1.5rem + 1.8vw, 2.75rem)"
    fontWeight: 600
    lineHeight: 1.12
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "clamp(1.5rem, 1.3rem + 0.8vw, 1.875rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title-sm:
    fontFamily: "Playfair Display, Georgia, Times New Roman, serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "-0.01em"
  body-lg:
    fontFamily: "Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "clamp(1.0625rem, 1rem + 0.35vw, 1.1875rem)"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  body:
    fontFamily: "Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.65
    letterSpacing: "normal"
  small:
    fontFamily: "Inter, -apple-system, Segoe UI, Helvetica, Arial, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.55
    letterSpacing: "normal"
  mono:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.8125rem"
    fontWeight: 400
    lineHeight: 1.4
    letterSpacing: "0.04em"
  label:
    fontFamily: "JetBrains Mono, ui-monospace, Menlo, Consolas, monospace"
    fontSize: "0.6875rem"
    fontWeight: 500
    lineHeight: 1.5
    letterSpacing: "0.14em"
rounded:
  sm: "4px"
  md: "6px"
  lg: "10px"
  pill: "999px"
spacing:
  "1": "4px"
  "2": "8px"
  "3": "12px"
  "4": "16px"
  "5": "24px"
  "6": "32px"
  "7": "48px"
  "8": "64px"
  "9": "96px"
  "10": "128px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-primary-hover:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  button-secondary:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-secondary-hover:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "12px 20px"
  button-ghost-hover:
    backgroundColor: "{colors.paper-surface-raised}"
    textColor: "{colors.ink}"
  button-sm:
    padding: "8px 14px"
  chip:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "3px 8px"
  chip-selected:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  chip-filter:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.pill}"
    padding: "8px 14px"
  card:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "22px"
  panel:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "26px"
  panel-inverse:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    rounded: "{rounded.lg}"
    padding: "clamp(24px, 3.5vw, 48px)"
  cta-band:
    backgroundColor: "{colors.paper-surface}"
    textColor: "{colors.ink}"
    rounded: "{rounded.lg}"
    padding: "36px 40px"
  callout:
    backgroundColor: "{colors.lavender-wash}"
    textColor: "{colors.ink-muted}"
    rounded: "{rounded.lg}"
    padding: "18px 22px"
  nav-link:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    padding: "6px 0"
  theme-control-button:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.label}"
    rounded: "{rounded.sm}"
    padding: "0 12px"
    height: "34px"
  theme-control-button-pressed:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
  wordmark:
    textColor: "{colors.ink}"
    typography: "{typography.display}"
    size: "19px"
    height: "44px"
  site-header:
    backgroundColor: "{colors.paper}"
    height: "62px"
  pagination-item:
    backgroundColor: "transparent"
    textColor: "{colors.ink-muted}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "0 12px"
    height: "44px"
  skip-link:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.paper}"
    typography: "{typography.mono}"
    rounded: "{rounded.md}"
    padding: "12px 16px"
---

# Design System: Jack Jin design system v3

<!-- Written 2026-09-14 from the built code in design-systems/v3 (tokens.css, tokens.json, base.css, components.css, templates/, index.html). The frontmatter is normative. Dark values, band tints, motion, breakpoints and component snippets are in .impeccable/design.json. Plain keyboard hyphens only; no em dashes or other unicode dashes anywhere in this file or in the surfaces it governs. -->

## Overview

**Creative North Star: "Editorial Field Notes"**

v3 is one system for the whole of www.jackzhaojin.com: home, the four topic hubs, blog and posts, the portfolio scroll, talks, certifications and about. It is continuous with the v2 portfolio: warm paper in light, near-black in dark, a lavender accent, hairline borders, and surfaces that step by tone rather than shadow. Every section is a full-bleed band with its own ground (plain, alt, a tint wash keyed to the section's topic, or inverse). Section headings are phrased as the reader's questions. Evidence is rendered as evidence: a proof list of dated facts in the hero, facts tables with a visible "Key facts" caption, dated rows, status chips.

Density is editorial rather than dashboard: a 1280px centered container, generous band padding (48 to 96px), a 66ch measure for prose, and a 4px spacing base that reads in multiples of 4, 8, 12, 16, 24, 32, 48, 64, 96 and 128. Three faces divide the work: Playfair Display carries headings and the wordmark, Inter carries body copy, JetBrains Mono carries labels, bylines, chips, buttons, breadcrumbs, table headers and the nav. Light is the site default; dark is applied by `[data-theme="dark"]` or by the OS preference when the three-state control is on System.

Confirmed rejections, from the 2026-09-13 critique and the v3 build: no section-number kickers, no three-restatement hero, no generated marks without the CSS alt-text syntax, no inverse band alias round trip (inverse surfaces set every semantic token from primitives), no icon fonts or external sprites, no reveal-on-scroll that withholds content.

**Key Characteristics:**
- Warm paper ground (#f6f4f0) in light, near-black (#131313) in dark, with one lavender accent that swaps tone per theme
- Hairline borders (1px) at two strengths do all the separating; depth is tonal, never shadowed
- Full-bleed section bands with topic-keyed tint washes; content stays inside the centered container
- Playfair Display, Inter, JetBrains Mono: display, body, label
- Question-shaped section headings; facts tables, proof lists and dated rows carry the evidence
- Every semantic token pair passes WCAG AA in both themes and inside inverse surfaces (eval-gated)
- 44px minimum targets in the header, menu, pagination and text links

## Colors

The palette is warm neutral paper against ink, one lavender accent, three topic colors borrowed from the portfolio diagram palette, and a night set for dark.

### Primary
- **Lavender** (#5b4bc4): the single accent. Links outside prose, italic emphasis inside headings (`h1 em`), the chip dot by default, hub labels, callout labels, row-list dates, the caret, the focus ring and text selection. Hover deepens to **Lavender Deep** (#4a3ba8). In dark the accent lightens to **Lavender Light** (#c0b3ff) with **Lavender Lighter** (#d6cdff) on hover, and on-accent ink becomes the night ground.
- **Lavender Wash** (rgba(91, 75, 196, 0.08)): the callout ground and the tint-band accent at rest. Dark uses **Lavender Wash Night** (rgba(192, 179, 255, 0.10)).
- Lavender is also the topic color for AEM + AI, the flagship topic, so the flagship card border, the flagship chip and the topics band tint are all the accent.

### Secondary (topic colors)
- **Topic AEM Blue** (#2f6bb3 light, #9db8e8 dark): the Adobe AEM topic dot, hub label and band tint.
- **Topic Agents Red** (#c2433d light, #ff9d9d dark): the AI agents topic; also the fail state in data tables, the deprecated chip dot and the warn callout label.
- **Topic Work Gold** (#7d5f0e light, #f0cf8e dark): the working-with-AI topic; also the pass state, the beta and upcoming chip dots, and the talks band tint.

### Neutral (light, the default)
- **Paper** (#f6f4f0): the page ground, the sticky header and the footer.
- **Paper Alt** (#efece6): the alt band ground, one step warmer than the page.
- **Paper Surface** (#ffffff): cards, panels, the filter bar, transcripts, the author box, the CTA band, the theme control.
- **Paper Surface Raised** (#f1eee9): inline code, the embed frame, the ghost button hover, the ruled-grid card hover.
- **Ink** (#1a1917): headings, body text, the wordmark, the primary button ground, the inverse band ground.
- **Ink Muted** (#4a4744): prose paragraphs, list items, card excerpts, table cells, nav links, chips.
- **Ink Faint** (#6f6b66): labels, captions, bylines, card meta, counts, placeholders.
- **Hairline** (rgba(20, 18, 15, 0.10)): cards, table rows, the band top edge, the header and footer rule, the ruled grid.
- **Hairline Strong** (rgba(20, 18, 15, 0.48)): buttons, the theme control, selects, link underlines, the proof list top edge, and anything a user must find by its edge.

### Neutral (dark)
- **Night** (#131313) page ground; **Night Deep** (#0e0e0e) alt band; **Night Surface** (#1a1a19) cards and panels; **Night Surface Raised** (#201f1f) code and raised hovers.
- **Bone** (#e8e5e3) text; **Bone Muted** (#b2afac); **Bone Faint** (#94908c).
- **Hairline Night** (rgba(255, 255, 255, 0.08)) and **Hairline Night Strong** (rgba(255, 255, 255, 0.36)).

### Inverse surfaces
The inverse band and the inverse panel take the page's ink as ground and paper as text (in light: Ink on Paper; in dark: Night on Bone). Inside them every semantic token is set again from primitives, per theme, so a filled button inside an inverse surface is the page ground with page ink, lines are paper at 14 and 42 percent, and the accent stays lavender (light tint on ink, deep tint on bone).

### Named Rules
**The One Accent Rule.** Lavender is the only accent. Topic colors mark topics (dot, label, band tint, flagship border) and states (pass, fail, upcoming, deprecated); they never decorate.

**The Tone Step Rule.** Depth is a step in tone: page, alt, surface, raised. A hover raises a border from Hairline to Hairline Strong or a ground from surface to raised. Nothing floats.

**The Inverse From Primitives Rule.** An inverse surface never aliases a token from outside itself. Every color inside is set straight from the palette, per theme, so a browser has no round trip to resolve.

## Typography

**Display Font:** Playfair Display (with Georgia, Times New Roman, serif)
**Body Font:** Inter (with -apple-system, Segoe UI, Helvetica, Arial, sans-serif)
**Label/Mono Font:** JetBrains Mono (with ui-monospace, Menlo, Consolas, monospace)

**Character:** A serif with weight for headings and the wordmark, a plain sans for reading, and a monospace for every piece of apparatus: labels, bylines, chips, buttons, breadcrumbs, captions, table headers, the nav and the footer meta. Headings are semibold (600), tightened by 1 percent, and wrap with `text-wrap: pretty` (H1 balanced). Italic inside an H1 or H2 (`em`) turns the phrase lavender at the same weight.

### Hierarchy
- **Display** (600, clamp 44 to 64px, 1.05): the home H1 wordmark line (`.page-title--display`) and the milestone band numeral (outlined, clamp 64 to 160px, 700). Home only.
- **Headline** (600, clamp 32 to 44px, 1.12): the page title (H1) on every other page.
- **Title** (600, clamp 24 to 30px, 1.2): section H2s, phrased as the reader's questions. The CTA band title is fixed at 26px; the feature title is clamp 28 to 40px at 1.1.
- **Title small** (600, 20px, 1.3): H3, hub card titles (20px), author name (20px); card titles and FAQ summaries at 19px.
- **Body large** (400, clamp 17 to 19px, 1.55): the summary and lead paragraph, max 66ch. The positioning line under the home H1 is 20px at 1.45, max 60ch.
- **Body** (400, 16px, 1.65; 1.7 inside `.prose`): paragraphs and list items in Ink Muted. Row lists, facts cells, FAQ answers, callouts and transcript paragraphs sit at 15px.
- **Small** (400, 14px, 1.55): card excerpts, row notes, the author role line.
- **Mono** (400, 13px, 0.02 to 0.05em): buttons, nav links, text links, pagination, code. 12px for breadcrumbs, card counts, project period, footer meta, proof notes and the nav toggle.
- **Label** (500, 11px, 0.14em, uppercase): kicker-style labels wherever a label carries information: proof list terms, facts and data table captions, footer headings, filter labels, callout labels, hub card labels, divider labels, the band caption, docs H4s. Table column headers are the same voice at 11.5px and 0.1em; card meta at 11px and 0.1em.

### Named Rules
**The Three Voices Rule.** Serif for what is said, sans for the reading, mono for the apparatus. A control, label or piece of metadata is always mono; a heading is always the serif; a paragraph is always Inter.

**The Question Heading Rule.** A section H2 is a question a practitioner or an assistant would ask, answered by the section's own content. Not a slogan, not a section number.

**The Tabular Time Rule.** Every `time` element uses tabular numerals so dates line up in rows, proof lists and bylines.

## Layout

The container is 1280px max, centered, with a fluid gutter of clamp(20px, 5vw, 64px). Only section bands are full bleed between the header and the footer; the band carries the ground and the hairline top edge, and the container sits inside it, never the other way round. Band padding is clamp(48px, 8vw, 96px) vertically, dropping to 48px under 480px. A page that ends on a band ends on the band; only a bare trailing container pads 96px before the footer.

Spacing is a 4px base with ten steps (4, 8, 12, 16, 24, 32, 48, 64, 96, 128). Layout primitives: `.stack` (column, 16px default, 8/32/64 variants), `.cluster` (wrapping row, 12px), `.grid` (auto-fit at 260px min, 16px gap) and the fixed `.grid--2/3/4` variants. Prose is capped at 66ch with 16px between blocks, 48px above an H2 and 32px above an H3.

Mobile first breakpoints, as used: 480px (grid--4 to two columns, proof list and row list gain a label column, band padding grows), 768px (grid--2 and grid--3 to two columns, footer to four columns, facts label column widens to 200px), 1024px (grid--3 to three, the hero and feature panel to two columns, the docs sidebar appears, the header nav unfolds from the menu), 1280px (grid--4 to four, container reaches its max). The eval confirms no horizontal overflow at 390 through 2560px and a centered container at 1440px and above.

The home hero is two columns from 1024px: the introduction on the left (1.2fr), the proof list on the right (1fr), aligned to the bottom. The feature panel is two columns from 1024px with the facts table on the wider right side. The sticky header is one row at every width, 62px tall.

**The Band Owns the Ground Rule.** Every section is a band; the tint follows the section's topic; two alt bands never stack; one inverse band per page at most.

## Elevation & Depth

This system does not use shadows for depth. Depth is tonal layering: page (Paper), alt band (Paper Alt), surface (Paper Surface) and raised (Paper Surface Raised), each separated by a 1px hairline. Hover raises a card's border from Hairline to Hairline Strong, or a ruled-grid card's ground from surface to raised. The primary button lifts 1px on hover with its opacity at 0.88; that is the only vertical motion in the system.

Two shadow tokens are defined (`--shadow-1`: 0 1px 2px rgba(20, 18, 15, 0.04); `--shadow-2`: 0 8px 24px rgba(20, 18, 15, 0.07); black at 0.30 and 0.40 in dark) and no shipped component consumes either. They exist for a future overlay. The flagship hub card uses an inset 1px ring in the topic color, which is a border, not an elevation.

Tint bands add atmosphere without depth: a radial wash from the top center at the strong tint and a linear wash top to bottom at the soft and edge tints, mixed from the band's accent (9, 5 and 4 percent in light; 7, 4 and 3 percent in dark). The dots variant scatters six faint accent dots on a 900 by 700px tile at half opacity.

### Named Rules
**The Flat Ground Rule.** Surfaces are flat. A hairline, a tone step or a tint wash separates; a shadow never does.

## Shapes

Every border is one pixel. Radii step by role: chips 4px (`sm`), buttons, controls, selects, the theme control and pagination 6px (`md`), cards, panels, the filter bar, the transcript, the author box, the embed frame, the CTA band and code blocks 10px (`lg`), filter pills and large chips 999px (`pill`). The focus ring is a 2px outline in the focus color at 2px offset with a 2px radius. Avatars and the embed play button are circles. Chip dots are 7px circles.

Recurring silhouettes: the hairline-ruled list (proof list, row list, chapters, facts rows, FAQ items) with a top rule per row and a bottom rule on the last; the ruled grid that turns a row of cards into one object by sharing 1px gaps of Hairline inside one rounded border; the labeled divider, a mono label between two hairlines that fade to the edges; the outlined milestone numeral drawn with a 1px text stroke.

**The One Pixel Rule.** No two-pixel rules, no colored left borders, no dashed edges except the placeholder bracket and the docs component separator.

## Components

Class names are fixed by the 2026-09-13 contract; modifiers may be added, nothing is renamed. Every component consumes semantic tokens only. Status per the docs site table (v3 0.1.0): filter bar, embed, section band, divider, proof list, linked card, ruled grid and inverse panel are beta; everything else is stable.

### Buttons
- **Shape:** gently rounded (6px), 1px border, mono 13px at 0.04em tracking, 12px by 20px padding; small variant 8px by 14px at 12px type.
- **Primary:** Ink ground with Paper text and border (inverse pair). Hover: opacity 0.88 and a 1px lift over 250ms. Inside an inverse surface the pair flips to Paper on Ink.
- **Secondary:** transparent with a Hairline Strong border and Ink text. Hover: border and text to Ink.
- **Ghost:** transparent, no visible border, Ink Muted text. Hover: Paper Surface Raised ground.
- **Disabled:** opacity 0.45, no pointer events, no lift.
- **Rule:** one primary per view, labeled with the destination ("Book a talk", "Start with AEM + AI"). A placeholder never becomes a disabled button.

### Chips
- **Style:** mono 11px at 0.04em, 1px Hairline border, 4px radius, 3px by 8px padding, Ink Muted text, a 7px accent dot before the text.
- **Topic** (`data-topic`: aem-ai lavender, aem blue, agents red, work gold): the dot takes the topic color; the text names the topic so color is never the only carrier.
- **Format** (`data-format`: video, article, post): the dot becomes a 12px masked line icon in currentColor.
- **Status** (`data-status`): flagship (lavender text, lavender border at 45 percent, lavender dot), upcoming (gold dot), delivered (Ink Faint text, Hairline Strong dot), beta (gold dot), deprecated (red dot), stable (accent dot).
- **Selected** (`aria-pressed` or `aria-current`): Ink ground, Paper text, dot in Paper.
- **Filter pills:** 999px radius, 8px by 14px, 12px type, Hairline Strong border; large chips share the pill.

### Cards / Containers
- **Corner Style:** 10px.
- **Background:** Paper Surface; ruled-grid cards go transparent on the grid's Hairline ground and raise to Paper Surface Raised on hover.
- **Shadow Strategy:** none; hover moves the border to Hairline Strong.
- **Border:** 1px Hairline. The flagship hub card adds a topic-color border and inset ring.
- **Internal Padding:** 22px, 10px between children. Card meta is 11px mono uppercase at 0.1em in Ink Faint; card title 19px serif; excerpt 14px Ink Muted, clamped to four lines on post cards; footer pinned to the bottom.
- **Linked card** (`.card--link`): the title carries the one real link; a stretched pseudo-element makes the whole card the hit area; focus draws on the card as a 2px ring (inset 3px inside a ruled grid). Never wrap a whole card in an anchor.
- **Hub card** (`.card--hub`): a topic label with its color dot (`.card__label`), a question as the title (20px), a count line in 12px mono pinned to the bottom. `[data-flagship]` adds the border ring and a flagship chip beside the label; the flagship shows no count.
- **Ruled grid** (`.grid--rules`): zero gap replaced by 1px of Hairline, one 10px border around the set, child card borders removed, overflow clipped. Four hub cards read as one object.
- **Panels:** `.panel` is a 10px card at 26px padding. `.panel--inverse` is the inverse surface as a panel, transparent border, clamp(24px, 3.5vw, 48px) padding; used once per page for the featured project's proof block with its facts table.
- **Callout:** Lavender Wash ground, 10px, 18px by 22px, 15px text, a lavender mono label above; the warn variant uses Paper Surface Raised with a red label. One per section at most.
- **Filter bar, transcript, author box, embed frame:** the same 10px Paper Surface container at 18 to 22px padding; the embed frame is 16 by 9 on Paper Surface Raised with a 64px circular lavender-edged play button and a plain fallback link below.

### Inputs / Fields
- **Style:** the filter bar select: mono 12px, 1px Hairline Strong border, 6px radius, 8px by 12px padding, Paper Surface ground, 36px minimum height. There are no text inputs or forms in the shipped system.
- **Focus:** the global 2px lavender outline at 2px offset.

### Navigation
- **Site header:** sticky, Paper ground, 1px Hairline bottom rule, 62px minimum, one row at every width. Wordmark first: "Jack Jin" in Playfair Display 600 at 19px with a 44px hit height, lavender on hover, text only. Links in mono 13px at 0.05em in Ink Muted, 22px apart, with a 1px transparent bottom border that turns lavender on the current page. The tools (`.site-nav__tools`) sit at the right end of the nav: a small primary button and the three-state theme control.
- **Below 1024px with JavaScript:** the whole nav folds behind a 44px "Menu" toggle (mono 12px, Hairline Strong border) whose text swaps to "Close" by CSS on `aria-expanded`. Open, the links stack at 15px with 44px rows and Hairline separators, the current page in lavender; the tools spread across one row with the button stretching. Without JavaScript the nav stays a wrapping row.
- **Theme control:** a 2px-padded group with a Hairline Strong border on Paper Surface, three mono 11px buttons at 34px height; the pressed one is Ink on Paper (inverse pair). Persists to localStorage under `jj-theme`, applied before first paint.
- **Breadcrumb:** mono 12px in Ink Faint, links in Ink Muted, separators generated as `"/" / ""` so screen readers skip them.
- **Pagination:** 44px square-ish items, 6px radius, Hairline border, mono 13px; current page in the inverse pair. Real links only.
- **Footer:** Hairline top rule, two columns to four at 768px, mono 11px uppercase headings, 13.5px links at 36px row height, a mono 12px meta row under a Hairline.
- **Skip link:** off-screen until focus, then Ink on Paper at the top left, mono 13px, 6px radius.
- **Text link** (`.text-link`): mono 13px in Ink Muted with a Hairline Strong underline; the hit area grows to 44px by padding and a negative margin without moving the visible line.

### Section bands (signature)
Full-bleed grounds per section with a 1px Hairline top edge and clamp(48px, 8vw, 96px) vertical padding. Variants: `--plain` (Paper), `--alt` (Paper Alt), `--tint` (a radial plus linear wash of `--band-accent`, default lavender, overridable per section to a topic color), `--dots` (adds the faint dot scatter), `--milestone` (centered, tinted, a bottom rule, the outlined numeral with a mono caption), `--inverse` (Ink ground, Paper text, tokens reset from primitives; a CTA band inside it loses its border and padding). The home page runs plain, tint (AEM + AI), alt, tint with dots, plain, tint (work gold), inverse. Content stays in the container inside the band.

### Divider (signature)
A mono 11px uppercase label between two hairlines that fade to the edges (linear gradient through Hairline Strong), 12px vertical padding, 24px below. Without a label only the leading line draws. Used where a section has no visible H2 or between groups in one band, never under every heading.

### Proof list (signature)
A definition list in the hero, opened by a Hairline Strong top rule, each row a Hairline-ruled grid of a 104px mono uppercase label and a 16px value with an optional 12px mono note; values link in Ink with a Hairline Strong underline. Three to five rows of dated facts from the shared data; a row with a placeholder is dropped, not shown.

### Facts table and data table (signature)
Facts: a visible caption ("Key facts") in the label voice, 200px mono uppercase row headers (120px on phones), 15px cells in Ink Muted, Hairline rules between rows; 132px headers inside the feature panel. Data tables: 36rem minimum width inside a scrolling wrap, mono uppercase column headers over a Hairline Strong rule, the first column in Ink at medium weight, pass in gold and fail in red. Every table has a caption; never shrink type to fit.

### Row list, chapters, FAQ, counts
Row list: Hairline-ruled rows with a 110px mono date or kind column (lavender for dates, Ink Faint for kinds), 15px titles in Ink, 14px notes in Ink Faint; the status variant adds a third auto column holding a status chip at the row's start. Chapters: 48px mono lavender timestamps. FAQ: `details` items with a 19px serif summary and a masked chevron that rotates 180 degrees over 250ms. Counts: 11px mono uppercase terms over 24px serif numbers; the inline variant puts a 13px mono bold number beside the term.

### Closing CTA band (signature)
`.cta-band` is a 10px Paper Surface container at 36px by 40px (28px by 22px on phones) with a 26px serif title, a 15.5px paragraph capped at 64ch, a row of at most two actions 18px apart (stacked on phones). The closing "Follow the work" band places it inside the inverse band, where it becomes borderless. `.cta-band__contact` follows under a Hairline: 15px text with the booking line as prose, links in the page text color with a Hairline Strong underline, the address a bracketed placeholder. `.cta-band__profiles` is a row of text links to profiles that exist (LinkedIn, GitHub) 18px apart.

### Icons
Inline SVG only, 1.6 stroke in currentColor, at 12, 16, 24 or 32px, always paired with text; format icons are masked data-URI SVGs. No icon fonts, no external sprites.

## Do's and Don'ts

### Do:
- **Do** keep the wordmark as plain text: "Jack Jin" in Playfair Display, no glyph, mark, half circle or theme symbol beside it.
- **Do** give every section its own full-bleed band and let the tint follow the section's topic; put the container inside the band.
- **Do** keep every interactive target at least 44px (`--target-min`): the wordmark, the menu toggle, menu links, text links through padding, footer links, pagination and buttons in the open menu.
- **Do** keep placeholders visible in brackets as text (`.placeholder`: mono, dashed Hairline Strong edge, Ink Faint); a value that cannot be verified is bracketed, never invented.
- **Do** write generated text marks (breadcrumb slashes, step counters, kicker rules) with the CSS alt-text syntax, `content: "/" / ""`, so screen readers do not announce them.
- **Do** phrase section H2s as the question the section answers, and let facts tables, proof lists and dated rows carry the evidence.
- **Do** put every content slot in the initial HTML; JavaScript only filters, sorts, switches theme and toggles the menu.
- **Do** set the inverse surface's tokens from primitives per theme, and keep the inverse pair flipped inside it so a filled button reads as page ground on page ink.
- **Do** use the four topic values only (aem-ai, aem, agents, work) and name the topic in text beside its dot.
- **Do** use plain keyboard hyphens; write "AEM + AI" with spaces around the plus.

### Don't:
- **Don't** route the reader to LinkedIn: no "Discuss on LinkedIn", "Watch on LinkedIn" or "Read on LinkedIn" links, no post cards that leave the site, no Book a talk control that resolves to LinkedIn. LinkedIn is a profile text link in the footer, the author box and the closing band only.
- **Don't** render a placeholder as a control or in the loudest slot on a page: no disabled button holding a missing address, no bracketed count on the flagship hub card, no placeholder row in the proof list.
- **Don't** use em dashes or any other unicode dash anywhere, including code comments, generated pages and this file.
- **Don't** convey depth with shadows; the two shadow tokens are reserved for a future overlay and no component consumes them.
- **Don't** draw two-pixel rules, colored left borders, or card art; the hairline and the tone step are the whole vocabulary.
- **Don't** stack two alt bands, use more than one inverse band per page, or raise a tint until the ground competes with the cards on it.
- **Don't** wrap a whole card in an anchor or make a chip the only link on a card; the title carries the link and the linked-card pseudo-element extends it.
- **Don't** hide content behind reveal animations or opacity-zero starts; `prefers-reduced-motion` collapses every transition to 0.01ms and nothing depends on motion to appear.
- **Don't** load an icon font, an external sprite, or an image as an icon; inline SVG paired with text only.
- **Don't** add a hero image between the H1 and the summary, write a keyword string as an H1, or restate the positioning line in the proof list.
