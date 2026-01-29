# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal website for Jack Jin (jackzhaojin.github.io) — professional portfolio with certifications, blog content, and technical architecture documentation. Hosted on GitHub Pages.

## Development

**No build system.** Pure HTML/CSS/JS served directly. No compilation, bundling, or preprocessing.

**Local development:**
```bash
npx http-server . -p 8080
```

**Blueprint build** (combines `platform-blueprint/*.md` into HTML/PDF output):
```bash
node build-node.js                    # or: ./build-node.sh
node build-node.js platform-blueprint # explicit target
```
Output goes to `blueprint-output/`. PDF generation requires `npm install -g puppeteer`.

**No tests, no linter, no CI/CD.** Manual browser testing only. Commits to `main` deploy directly via GitHub Pages.

## Architecture

Three HTML pages, each self-contained:
- `index.html` — landing page with navigation cards to other sections
- `blogs.html` — blog listing with client-side filtering/sorting via `js/blog-filters.js`
- `certifications.html` — certification display with Credly links

**Shared footer** is injected via `js/includes.js` — it embeds footer HTML directly in JS (not fetched) because `fetch()` doesn't work with `file://` protocol. Pages use `<div data-include="includes/footer.html">` as mount points, but `index.html` has the footer inline instead.

**Blog filtering system** (`js/blog-filters.js`): Three-dimension client-side filtering using data attributes on `.blog-item` elements:
- `data-topic` — "ai" or "aem"
- `data-type` — "technical" or "leadership"
- `data-media` — "article", "post", or "video"
- `data-date` — ISO date for sorting

Filter buttons use `data-filter` (dimension) and `data-value` (value) attributes. State tracked in `currentFilters` object.

**CSS theming** uses custom properties in `:root` (`css/styles.css`). Blog-specific styles are in `css/blogs.css`. Only external dependency is Font Awesome via CDN.

## Adding Content

**New blog post:** Add an `<a>` element to `blogs.html` inside `#blogGrid`:
```html
<a href="..." class="blog-item"
   data-topic="ai" data-type="technical"
   data-media="article" data-date="2025-01-15">
```

**New certification:** Add to `certifications.html` following existing card pattern.

## Key Constraints

- **No frameworks, no build tools** — this is intentional, not a limitation
- **No Jekyll** — deliberately avoided despite GitHub Pages support
- **No custom domain** — uses `github.io` subdomain by design
- Do not create markdown files (like CHANGES.md) in the project root
- Do not commit or push unless explicitly instructed to
