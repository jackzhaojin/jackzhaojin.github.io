# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Static personal website for Jack Jin — professional portfolio with certifications, blog content, and technical architecture documentation. Hosted on GitHub Pages and served at the custom domain [www.jackzhaojin.com](https://www.jackzhaojin.com) (the `github.io` subdomain still resolves).

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

**No tests, no linter, no CI/CD.** Manual browser testing only. Commits to `main` deploy directly via GitHub Pages. After a push, `./scripts/check-site.sh` verifies the live site end to end (build state, redirects, analytics tag, Search Console verification, sitemap).

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
- **Custom domain** — configured 2026-06-14 to serve at [www.jackzhaojin.com](https://www.jackzhaojin.com). Driven by the `CNAME` file at the repo root (contents: `www.jackzhaojin.com`), which GitHub Pages reads to set the custom domain. **Do not delete `CNAME`** — it is load-bearing; removing it resets the Pages custom-domain config and breaks the site. The `github.io` subdomain still resolves. All GitHub GET endpoints were smoke tested on 2026-06-14 and are working. POST functionality has not yet been tested (pending — only test if/when POST endpoints exist).
- **Hosting, analytics, search: read [docs/site-operations.md](docs/site-operations.md) before touching any of it.** It covers Cloudflare (DNS, redirects, cache), GitHub Pages, Google Analytics 4 (Measurement ID `G-ZVENE6BXTJ`, personal "Jack Jin" account, never a company account), Google Search Console, and the checklists for adding or changing pages. Hard rules from it:
  - Every page carries the gtag.js snippet as the first thing after the viewport meta in `<head>`, plus a `<link rel="canonical">` and an entry in `sitemap.xml`.
  - **Never delete** `google57906613577fdd42.html` or the `google-site-verification` meta tag in `index.html`; they keep the Search Console property verified.
  - Wait for the Pages build to report `built` before requesting a new URL; Cloudflare caches 404s.
  - GitHub's "Enforce HTTPS" toggle is not eligible (Cloudflare terminates TLS). Expected, not a bug.
- Do not create markdown files (like CHANGES.md) in the project root
- Do not commit or push unless explicitly instructed to
