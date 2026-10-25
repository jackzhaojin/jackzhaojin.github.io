# EDS migration: analysis

Status: analysis only, 2026-10-24, with Jack's decisions recorded the same day. Nothing is built. No EDS repo or Experience Workspace site exists yet, and Cloudflare is unchanged. These files are the input for a goal prompt that builds the migration with several agents in parallel.

## Goal

Move www.jackzhaojin.com from GitHub Pages to AEM Edge Delivery Services, with content in Experience Workspace (the new name for da.live). Keep the design near pixel-perfect using stardust's replica flow, and allow only deliberate, recorded improvements.

## Confirmed requirements (Jack, 2026-10-24)

- The EDS site holds both the main site and the design system site (`design-systems/v3`).
- Design system v3 moves to EDS and stays the system for new pages after the migration.
- Cloudflare fronts everything.
- The main site is no longer served from GitHub Pages.
- GitHub Pages project sites keep working under `www.jackzhaojin.com/<repo>/`, for example `/bruce-hackathon-2026-09-12/`. There are 7 today ([routing-cloudflare.md](routing-cloudflare.md)).
- The goal prompt includes configuring Cloudflare through the built-in browser.

## Files

| File | Covers |
|---|---|
| [adobe-skills-survey.md](adobe-skills-survey.md) | What is in adobe/skills, which skills apply, and the stardust behaviours that matter for this site |
| [design-system-v3-on-eds.md](design-system-v3-on-eds.md) | Where each v3 piece lands in EDS, the source-of-truth question, the explainer tiers, the portfolio |
| [routing-cloudflare.md](routing-cloudflare.md) | Request path today and after, the github.io redirect trap, the Worker, staging, cutover, rollback, and the limits of the browser stage |
| [workstreams.md](workstreams.md) | The parallel split, file ownership, order, and what the goal prompt has to carry |
| [best-practices.md](best-practices.md) | Current EDS, boilerplate and Experience Workspace practice (researched 2026-10-25): block variants and the library, editability, head.html, performance, config, Cloudflare. Every stream follows it |
| [open-questions.md](open-questions.md) | Every open question, each with a recommendation. The one home for them |
| [session-flow.md](session-flow.md) | How this folder was made, prompt by prompt; prep for a video |

## Site at a glance (measured 2026-10-24)

- 34 URLs in `sitemap.xml`. Page types: home, writing listing, article (28), portfolio, talks, certifications, privacy, 404. `blogs.html` and `certifications.html` are compatibility pages that become redirects.
- All 28 articles load the shared explainer kit (`js/explainers.js`); 26 also carry their own `explainer.js` and `explainer.css`.
- 32 pages carry JSON-LD. 20 video embeds. Article images: 28 folders, about 17 MB, 16 SVGs (all pure vector and under 40 KB).
- Light / Dark / System theme on every page, stored under `jj-theme`.
- Root files that must keep serving: `google57906613577fdd42.html`, `BingSiteAuth.xml`, `robots.txt`, `sitemap.xml`, `llms.txt`, `404.html`, `favicon.ico`.

## Decisions (Jack, 2026-10-24)

1. **Design source of truth.** v3's `PRODUCT.md`, `DESIGN.md` and `tokens.css` are canon, and `tokens.css` is ported as is. Replica still runs its extract and promotion; its output is diffed against v3 to catch doc bugs or drift ([design-system-v3-on-eds.md](design-system-v3-on-eds.md)).
2. **Explainers are content.** Every explainer's text, data and media live in Experience Workspace, so this is a content migration. The code is best-in-class EDS: generic blocks with a small, deliberate set of style variants that match v3, built on Experience Workspace's newest block-variation features. One-offs map onto that family.
3. **Authoring.** `jack-technical-writing` writes documents through the DA Source API and Jack touches up by hand in Experience Workspace, so every block passes the editability gate. `docs/publishing-writing.md` changes to match.
4. **URLs stay the same.** `/writing/<slug>/`, `/portfolio/` with every `#ch-*` anchor, `/talks/`, `/certifications/`, `/privacy/`, `/design-systems/v3/`. Only `blogs.html` and `certifications.html` redirect.
5. **Images.** Every content image goes to Experience Workspace media through stardust's uploader. Only fixed brand assets (logo, icons, decorative washes) stay in code.
6. **The 2026-09-13 candidate round is not migrated.** It stays in this repo's history. Future design rounds run as EDS branches instead (see Principles).
7. **One EDS repo, one Experience Workspace site.** The design system site is content in Experience Workspace too, built from the same blocks it documents.
8. **Worker.** The Worker and its wrangler config and scripts live in the EDS repo under `edge/`, listed in `.hlxignore` so EDS never serves them.

## Decisions (Jack, 2026-10-25)

Answers to the first round of [open-questions.md](open-questions.md).

9. **GA4 and consent.** GA4 loads in `consented.js` with consent granted by default and no banner, as the site works today. A browser's Global Privacy Control signal counts as a decline, and GA4 starts 3 seconds after LCP. At cutover, `docs/site-operations.md` drops the "gtag first in `<head>`" rule.
10. **Trailing slashes stay.** `/writing/<slug>/` keeps its slash (decision 4 stands). The spike still checks what `/x` and `/x/index` return.
11. **The design system pages are the library.** This holds if the spike confirms that the library's `blocks` sheet can point at them and that `library-metadata` stays hidden on published pages. Otherwise, a `/library/blocks/` copy generated from the same source.
12. **Names.**
    - Repo `github.com/jackzhaojin/jackzhaojin-com`.
    - Experience Workspace org `jackzhaojin`, site `jackzhaojin-com`.
    - Origin `main--jackzhaojin-com--jackzhaojin.aem.live`.
    - Staging `next.jackzhaojin.com`.
13. **Build shape: keep it simple.** The initial build runs single-threaded. Only blocks, templates and the block library run in parallel ([workstreams.md](workstreams.md)).
14. **Git.** Every stream commits and pushes straight to the EDS repo's main. No agent pushes to `jackzhaojin.github.io`; the Cloudflare www route and the cutover stay Jack's.
15. **Stardust run mode.** Gated for Prep, the first page and each archetype; hands-off for the sibling rollout, with a report per wave.
16. **Design approvals.** Jack reviews the inconsistency register once per archetype, and once per batch of about 5 articles.
17. **AI writing.** `jack-technical-writing` always writes through the Experience Workspace MCP server.
18. **Dark mode.** A local check first (v3's eval plus dark captures), then a pull request to adobe/skills adding a colour-scheme option to stardust's capture scripts.
19. **The old repo keeps its main-site files** as rollback, with no deadline. At cutover:
    - a `README.md` in `jackzhaojin.github.io` notes that the main site moved to EDS, that the repo now serves the project sites, and that `CNAME` stays;
    - the cutover checks confirm `CNAME`, the github.io-to-www redirect and every project site.
20. **Staying current is manual.** The best-practices check runs when Jack asks; nothing is scheduled.

## Principles that follow

- **Content in Experience Workspace, design in code.** A design-system change ships as code. Content stays the same, apart from added variant classes for new designs or CSS variations. A future design round is an EDS branch on the same content, previewed at `https://<branch>--<repo>--jackzhaojin.aem.page`.
- **Flagship and living reference.** This is Jack's demo implementation and he keeps evolving it. It uses the latest Experience Workspace and EDS features and current best practices, and stays current after launch.
- **Demo focus.** Authoring in Experience Workspace (quick edit on every block, the design system pages as the block library). Performance (Lighthouse 100 and green Core Web Vitals on every page type, measured against the GitHub Pages site). Listings driven by the query index (writing listing, filters, related posts).

## Research (done 2026-10-25)

[best-practices.md](best-practices.md) covers Experience Workspace's block variants (a Variant dropdown on the canvas toolbar, fed by the library, with no validation of the words) and current EDS and boilerplate practice. Changes it forces on earlier plans:

- The theme script moves out of `head.html` into `scripts.js`.
- GA4 leaves the head for the consent-gated delayed phase.
- Buttons are opt-in (bold or italic).
- Section metadata `id` carries the portfolio anchors.

The questions it raised (GA4 and consent, trailing slashes, the library source) were answered on 2026-10-25: decisions 9 to 11.

## Inputs only Jack can provide

- The GitHub repo name and the Experience Workspace org and site.
- A DA (IMS) token for content writes, kept in `.env` as `DA_TOKEN`.
- Sign-in to Cloudflare in the built-in browser, and an OK for each Cloudflare change.
- `wrangler login`, so the Worker deploys from the repo.
- A Cloudflare API token with Cache Purge on the `jackzhaojin.com` zone, for EDS push invalidation. Jack creates and stores it; no agent types it.
- The go for cutover.
