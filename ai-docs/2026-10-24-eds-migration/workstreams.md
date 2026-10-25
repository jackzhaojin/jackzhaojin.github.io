# Workstreams

How the build splits for the goal prompt.

- **Decision 13: keep it simple.** The initial build runs single-threaded. Only blocks, templates and the block library run in parallel.
- **Decision 14: one branch.** Every stream commits and pushes straight to the EDS repo's main.

## Rules

- **One writer per path.** Each parallel stream owns disjoint paths in the code repo and in Experience Workspace.
- **The main thread owns the shared files:** `styles/styles.css`, `styles/fonts.css`, `head.html`, `scripts/scripts.js`, `.hlxignore`, `blocks/header/`, `blocks/footer/`. A parallel stream that needs a token or global change asks the main thread instead of editing these files.
- **Each block has one writer.** A stream that needs a variant on a block it does not own asks that block's owner.
- **The block catalog is the contract.** The spec's catalog (`stardust/spec/judgement/catalog.json`) lists every block and widget. Nobody creates a block that is not in it without updating the catalog first, so two agents never build the same thing twice.
- **Stardust run state has one writer,** the main thread: `stardust/state.json`, `status.jsonl`, `learnings.md`.
- **Pushing to main safely.**
  - Pull with rebase before every push. Keep commits small and inside the stream's own paths. Never force-push.
  - A conflict in a file the stream does not own means stop and hand back to the main thread.
- **Each stream proves its own work.**
  - Stardust's gate for its pages: 0 looks-same 🔴, 0 nothing-lost 🟡.
  - Deploy's block and editability gates for its blocks.
  - v3's eval in both themes, and no console errors.

## Phase 1: single thread

| # | Step | Owns | Done when |
|---|---|---|---|
| 0 | **Prep** | `stardust/spec/`, `stardust/current/`, baseline, the spike | Baseline frozen; spec S1 to S10 passes; audit run; every item in [best-practices.md](best-practices.md) § 9 checked and the note updated; [open-questions.md](open-questions.md) answered |
| A | **Foundation and first page** (stardust first page first, Track A) | Shared files above, home page content | Home page published on aem.live, gated at 1440 and 360; both themes checked; Lighthouse 100 |
| D1 | **Article archetype** | Article template; the first explainer-family blocks; one explainer-heavy article | Archetype passes the gate; the family pattern and its variant vocabulary are documented; every block passes the editability gate |

D1 stays in the single thread because it sets the patterns the parallel work copies. These are how a generic explainer block takes content, how a variant word maps to v3, and how a block survives quick edit.

## Phase 2: parallel (blocks, templates, block library)

| # | Stream | Owns | Done when |
|---|---|---|---|
| C1 | **v3 blocks, group 1** | hero, cards, stats, proof-links, panel | Each block passes the block gate and the editability gate |
| C2 | **v3 blocks, group 2** | facts, data-table, row-list, faq, timeline, chapter-head | Same |
| C3 | **v3 blocks, group 3** | showcase, frame, author-box, transcript, chapters | Same |
| D2 | **Explainer family** | The remaining explainer blocks and every variant on them: code, figure, shot, compare, typed terminal, walkthrough, request flow, token lab, video facade, and the generic blocks the one-offs need | Same; the vocabulary is declared with `@variants` and listed in the library |
| F | **Portfolio template** | Portfolio-only blocks, the `/portfolio/` template | Gate passes on the portfolio; every `#ch-*` anchor resolves |
| G1 | **Listing templates** | Writing listing with filter and related posts, talks, certifications, privacy, 404 | Listing, filter and related posts come from the query index; pages gated |
| H | **Design system site and block library** | `/design-systems/v3/` content in Experience Workspace, the library config, the unserved v3 source folder, the eval check | Every v3 component and variant has a live story in both themes; the pages work as the Experience Workspace library (decision 11); eval passes |

H fills in as the other streams land their blocks. At most 7 agents run at once.

## Phase 3: single thread

| # | Step | Owns | Done when |
|---|---|---|---|
| E | **One-off explainers** | Article content, in batches of about 5 articles | Each one-off is mapped onto the family, or a new block goes through the catalog; look changes are in the register and reviewed per batch (decision 16); the page gate passes |
| G2 | **SEO and config** | Config service (query index, sitemap, redirects, headers, robots, bulk metadata), JSON-LD, `llms.txt`, root verification files, GA4 per decision 9 | Redirects for `blogs.html` and `certifications.html`; JSON-LD validates; sitemap and robots served |
| I | **Rollout** | The remaining 27 articles, media upload, link localization over the whole tree | Coverage ledger complete; every page live |
| B | **Edge** | `edge/` in the EDS repo, `next.jackzhaojin.com` | Worker and route-table tests pass; wrangler deploys to staging; staging serves EDS and all 7 project sites; browser stage done up to (not including) the www route |
| J | **QA** | `stardust/qa/` | `stardust:qa` clean; the dark-mode check (decision 18); eval; Lighthouse 100 on every page type against the GitHub Pages baseline; project-site routes; `check-site.sh` on staging |
| K | **Cutover** | The Cloudflare www route; `README.md` in `jackzhaojin.github.io` (decision 19) | [routing-cloudflare.md](routing-cloudflare.md) cutover order complete |

B depends on nothing in the build, so it can move anywhere after Prep. QA is the first step that needs it.

## What the goal prompt has to carry

- Links to the files in this folder: the decisions and principles in [README.md](README.md), and [best-practices.md](best-practices.md) as the rules every step follows.
- Answers to [open-questions.md](open-questions.md).
- The names from decision 12.
- **Stop points that need Jack:**
  - the DA token;
  - Cloudflare sign-in and each Cloudflare change;
  - the Cache Purge token;
  - `wrangler login`;
  - the reviews in decisions 15 and 16;
  - the www route;
  - the cutover go.
- The definition of done per step (the tables above) and the gate thresholds.
- House rules for any copy agents write: plain hyphens only (no em or en dashes), copy carried verbatim, never send readers to LinkedIn.
