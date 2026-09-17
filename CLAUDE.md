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

**Validation:** `python3 scripts/check-local.py` checks HTML, links, metadata and discovery files. Use `--url http://127.0.0.1:8080` for local HTTP checks. Browser testing is required for layout and interactions. No build system, linter, or application test framework. Commits to main deploy through GitHub Pages; run `./scripts/check-site.sh` after the build completes.

## Architecture

Every production page uses design system v3:
- `index.html`: personal introduction and selected work
- `writing/index.html`: Technical Writing, currently an empty migration state
- `portfolio/index.html`: full project portfolio, one continuous page
- `talks/index.html`: talks and presentations, separate from credentials
- `certifications/index.html`: all credential records and verification links
- `blogs.html`, `certifications.html`: compatibility pages with canonical links to the new collections
- `404.html`: error page

Shared design assets: `design-systems/v3/tokens.css`, `base.css`, `components.css`, plus production compositions in `css/site.css`. All headers and footers are in the initial HTML. `js/site.js` manages Light / Dark / System (storage key `jj-theme`) and the mobile menu. Portfolio page-specific styles consume v3 tokens; its script owns the timeline, diagrams and image viewer. Old styles and include scripts are retained as historical files and are not loaded by production pages.

## Adding Content

Read [docs/publishing-writing.md](docs/publishing-writing.md) before publishing articles. Every entry needs complete on-site writing. Videos require a complete written companion and a verified YouTube destination. Never send article readers to LinkedIn. When filters become useful, they update the current listing in place; no facet page navigation.

Add credentials to `certifications/index.html`, preserve issuer verification links, update the ItemList and Person credential references, and synchronize the compatibility page. Add talks to `talks/index.html` with verified source details. Keep `sitemap.xml`, the discovery index and validation inventories consistent with canonical routes.

Do not add Book a talk, Follow the work, or an AEM + AI primary navigation destination. The footer is a compact row of Accenture (current employer), LinkedIn, GitHub and Certifications links; keep all four. Preserve every portfolio chapter anchor.

## Key Constraints

- **No frameworks, no build tools** — this is intentional, not a limitation
- **No Jekyll** — deliberately avoided despite GitHub Pages support
- **Custom domain** — configured 2026-06-14 to serve at [www.jackzhaojin.com](https://www.jackzhaojin.com). Driven by the `CNAME` file at the repo root (contents: `www.jackzhaojin.com`), which GitHub Pages reads to set the custom domain. **Do not delete `CNAME`** — it is load-bearing; removing it resets the Pages custom-domain config and breaks the site. The `github.io` subdomain still resolves. All GitHub GET endpoints were smoke tested on 2026-06-14 and are working. POST functionality has not yet been tested (pending — only test if/when POST endpoints exist).
- **Hosting, analytics, search: read [docs/site-operations.md](docs/site-operations.md) before touching any of it.** It covers Cloudflare (DNS, redirects, cache), GitHub Pages, Google Analytics 4 (Measurement ID `G-ZVENE6BXTJ`, personal "Jack Jin" account, never a company account), Google Search Console, and the checklists for adding or changing pages. Hard rules from it:
  - Every page carries the gtag.js snippet as the first thing after the viewport meta in `<head>`, plus a `<link rel="canonical">`. Canonical indexable pages also have an entry in `sitemap.xml`; compatibility and noindex pages do not.
  - **Never delete** `google57906613577fdd42.html` or the `google-site-verification` meta tag in `index.html`; they keep the Search Console property verified.
  - Wait for the Pages build to report `built` before requesting a new URL; Cloudflare caches 404s.
  - GitHub's "Enforce HTTPS" toggle is not eligible (Cloudflare terminates TLS). Expected, not a bug.
- Do not create markdown files (like CHANGES.md) in the project root
- Do not commit or push unless explicitly instructed to
