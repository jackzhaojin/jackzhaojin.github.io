# Parallel workstreams

How the build splits for a goal prompt that runs several agents at once.

## Rules for working in parallel

- **One writer per path.** Each stream owns disjoint paths in the code repo and in Experience Workspace. Stardust's first page first uses the same rule between its two tracks.
- **Foundation owns the shared files:** `styles/styles.css`, `styles/fonts.css`, `head.html`, `scripts/scripts.js`, `.hlxignore`, `blocks/header/`, `blocks/footer/`. Other streams ask the foundation owner for token or global changes instead of editing these.
- **Each block has one writer.** Streams that need a new variant on a block they do not own request it from that block's owner.
- **The block catalog is the contract.** The spec's catalog (`stardust/spec/judgement/catalog.json`) lists every block and widget. A stream does not create a block that is not in it without updating the catalog first, so two agents never build the same thing twice.
- **Stardust run state has one writer.** `stardust/state.json`, `status.jsonl` and `learnings.md` belong to the orchestrator; stream agents report back to it.
- **Own branch or worktree per stream**, merged by one integrator.
- **Each stream proves its own work:** stardust's gate for its pages (0 looks-same 🔴, 0 nothing-lost 🟡), deploy's block and editability gates for its blocks, v3's eval in both themes, no console errors.

## Streams

| # | Stream | Starts after | Owns | Done when |
|---|---|---|---|---|
| 0 | **Prep** | Jack's inputs (README), answers to [open-questions.md](open-questions.md) 1 to 10 | `stardust/spec/`, `stardust/current/`, baseline, the spike | Baseline frozen, spec S1 to S10 passes, audit run, every item in [best-practices.md](best-practices.md) § 9 checked and the note updated |
| A | **Foundation and first page** (first page first, Track A) | 0 | Shared files above, home page content | Home page published on aem.live, gated at 1440 and 360, both themes checked, Lighthouse 100 |
| B | **Edge** | nothing, can start on day one | `edge/` in the EDS repo, staging hostname | Worker and route-table tests pass; wrangler deploys to staging; staging serves EDS and all 7 project sites; browser stage done up to (not including) the www route |
| C1 | **v3 blocks, group 1** | A | hero, cards, stats, proof-links, panel | Each block passes the block gate and the editability gate |
| C2 | **v3 blocks, group 2** | A | facts, data-table, row-list, faq, timeline, chapter-head | Same |
| C3 | **v3 blocks, group 3** | A | showcase, frame, author-box, transcript, chapters | Same |
| D | **Article archetype and explainer family** | A | Article template, the explainer block family and every variant on it (code, figure, shot, compare, typed terminal, walkthrough, request flow, token lab, video facade and the generic blocks the one-offs need), one explainer-heavy article | Archetype passes the gate; the family and its variant vocabulary are documented; every block passes the editability gate |
| E | **One-off explainers** | D | Article content for a batch of about 5 articles per agent | Each one-off is mapped onto the family (or a new block is requested through the catalog); variant requests go to D; look changes are in the register; the page gate passes |
| F | **Portfolio** | A, C3, D | Portfolio-only blocks, `/portfolio/` content | Content in Experience Workspace; gate passes; every `#ch-*` anchor resolves |
| G | **Listings and SEO** | A | Query index config, writing listing and filter, related posts, talks, certifications, privacy, 404, metadata, JSON-LD, sitemap, redirects, `llms.txt`, root verification files | Listing, filter and related posts come from the query index; pages gated; redirects for `blogs.html` and `certifications.html`; JSON-LD validates |
| H | **Design system site** | C1 to C3, D | `/design-systems/v3/` content in Experience Workspace, the unserved v3 source folder, eval check | Every v3 component and variant has a live story in both themes; the pages work as the Experience Workspace block library; eval passes |
| I | **Rollout** | D, E, G | Remaining 27 articles, media upload, link localization over the whole tree | Coverage ledger complete; deploy-batch ledger all live |
| J | **QA** | I, F, H | `stardust/qa/` | `stardust:qa` clean, dark pass, eval, Lighthouse 100 on every page type against the GitHub Pages baseline, project-site routes, `check-site.sh` on staging |
| K | **Cutover** | J, B, Jack's go | Cloudflare www route | [routing-cloudflare.md](routing-cloudflare.md) cutover order complete |

Peak concurrency is about 7 agents (B, C1 to C3, D, F, G), then E's batches.

## What the goal prompt has to carry

- Links to the files in this folder.
- The decisions and principles in [README.md](README.md), and [best-practices.md](best-practices.md) as the rules every stream follows.
- Names: GitHub repo, Experience Workspace org and site, staging hostname.
- Stop points that need Jack: tokens, every Cloudflare change, the www route, the cutover go.
- Definition of done per stream (the table above) and the gate thresholds.
- What agents may commit and push, and where. The default in this repo is no commits or pushes without an explicit instruction.
- House rules for any copy agents write: plain hyphens only (no em or en dashes), copy carried verbatim, never send readers to LinkedIn.
