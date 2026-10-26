# Start here

The entry point for the EDS migration. A `/goal` run in `/Users/jackjin/dev/jackzhaojin/www-eds` reads this file first, and every run updates its Done, Left and Run log sections. Last updated 2026-10-25.

## The brief

**What moves:** www.jackzhaojin.com (plain HTML on GitHub Pages) and design system v3 move to AEM Edge Delivery Services, with content in Experience Workspace.

**How the design is kept:** near pixel-perfect, through stardust's replica flow. It changes only through recorded inconsistency-register entries.

**What it has to show:** it is Jack's flagship demo, so best-in-class EDS, the latest Experience Workspace features, and Lighthouse 100.

**What stays:** Cloudflare keeps fronting www, and the 7 GitHub Pages project sites keep working under it.

## Where everything is

| What | Where |
|---|---|
| Source site (live today) | https://www.jackzhaojin.com, repo `/Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io` |
| Design system v3 | `/Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/design-systems/v3/` |
| This plan | `/Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/ai-docs/2026-10-24-eds-migration/` |
| EDS repo | https://github.com/jackzhaojin/www-eds, local `/Users/jackjin/dev/jackzhaojin/www-eds` |
| Experience Workspace | https://da.live/#/jackzhaojin/www-eds (org `jackzhaojin`, site `www-eds`) |
| Preview and live | https://main--www-eds--jackzhaojin.aem.page/ and https://main--www-eds--jackzhaojin.aem.live/ |
| Site config | tools.aem.live, config service for `jackzhaojin/www-eds` |
| Staging host (planned) | `next.jackzhaojin.com` |

## Read in this order

1. **This file.**
2. **[README.md](README.md):** decisions 1 to 20 and the principles. They override anything else.
3. **[best-practices.md](best-practices.md):** the rules every step follows.
4. **[workstreams.md](workstreams.md):** the three phases, who owns what, and "done when" for each step.
5. **[design-system-v3-on-eds.md](design-system-v3-on-eds.md):** where each v3 piece lands, the explainers, the portfolio.
6. **[routing-cloudflare.md](routing-cloudflare.md):** the Worker, staging, cutover. Needed from Phase 3 on.
7. **[open-questions.md](open-questions.md):** two open. Apply each recommendation unless Jack has answered.

Reference only: [adobe-skills-survey.md](adobe-skills-survey.md) for stardust's behaviours, and [session-flow.md](session-flow.md) for how the plan was made.

## Done

As of 2026-10-25:

- **The plan.** Analysis, 20 decisions, the best-practices research and the open questions are all in this folder.
- **The site** was created through the aem.live tutorial:
  - repo from the boilerplate, with AEM Code Sync;
  - site config: code from GitHub, content from Experience Workspace, admin `jackzhaojin@gmail.com`;
  - starter `index`, `nav` and `footer` published, and returning 200 on aem.page and aem.live.
- **Local:** cloned, `npm install` done, and `aem up` served `localhost:3000`.
- **Ready for `/goal`:**
  - Plugins at project scope in `www-eds/.claude/settings.json`: stardust 0.36.0, impeccable 4.7.1 and aem-edge-delivery-services, with both marketplaces declared and no skill files copied into the repo.
  - `www-eds/.claude/settings.local.json` (git-ignored) lets sessions there read this repo.
  - Node 22 is pinned in `www-eds/.nvmrc`, with aem-cli 16.22.14 and playwright-cli 0.1.22 installed under it.
  - `www-eds/AGENTS.md` points here.
  - DA token flow tested: Jack signed in through `da-auth-helper`, the cache is valid until 2026-10-26 09:29 ET, and an authenticated `admin.da.live/list/jackzhaojin/www-eds` returned 200.
- **Goal 1 (2026-10-25), all in `www-eds` main:**
  - **Prep.** Baselines frozen (home and the article, 1440 and 360). Site scope: extract `--prep` of all 34 sitemap pages, spec S1 to S10 passing (S5 skipped: no telemetry key), dynamics triaged (`stardust/dynamic-features.md`), audit 74/100 (`stardust/audit/jackzhaojin-com/`). Section 9 of [best-practices.md](best-practices.md): all nine checked, findings recorded there. Open questions 1 and 2: recommendations (a) applied (stardust deploys through the Source API).
  - **Foundation.** v3 tokens ported as is into `styles/styles.css`, self-hosted fonts with measured fallback faces, the stored theme applied in `loadEager()`, the v3 header (theme control, menu) and compact footer, bands as section-metadata style words, opt-in buttons and text links in a `.cta-slot` wrapper that holds in quick edit.
  - **Home** live at https://main--www-eds--jackzhaojin.aem.live/ (blocks hero, showcase, cards, columns). Gate pub6: pixel 0.24% at 1440, 1.11% at 360, height delta 0, content-diff 0 red and 0 nothing-lost, chrome crops 100%, cap probe and clip probe pass. Dark 0.13% / 0.93%. Lighthouse mobile performance 100 (source 98). Editability 28/28, no edit-mode drift.
  - **Article archetype** live at https://main--www-eds--jackzhaojin.aem.live/writing/2026-09-20-aem-edge-functions-google-sign-in/ : `templates/article` and the first explainer family blocks (figure, code, compare, switch, lab), plus rail, row-list, author-box, fine-print. Gate pub6: pixel 0.05% / 0.84%, height delta 0, content-diff 0 red and 0 nothing-lost (7 rail thumbnails owner-accepted at 360, register R7). Dark 0.01% / 4.17%. Lighthouse mobile performance 100 (source 93). Editability 110/110, no edit-mode drift. Interaction parity 14 of 14. The family pattern and vocabulary: `www-eds/stardust/explainer-family.md`; the importer: `www-eds/stardust/scripts/import-article.mjs`.
  - **RECONCILE.** The promoted design spec agrees with v3. The block catalog is corrected for what home and D1 established (`www-eds/stardust/reconcile-first-page.md`). v3's contrast eval passes on both pages in Light, Dark and System (`stardust/scripts/v3-eval.mjs`).
- **Wide rollout (2026-10-25, one session: the main thread plus 7 parallel streams, each in its own worktree), all in `www-eds` main.** Per-stream results: `www-eds/stardust/rollout/streams.md`; shared rules: `stardust/rollout/brief.md`.
  - **Every sitemap URL is live:** all 34 answer 200 on https://main--www-eds--jackzhaojin.aem.live at the same path, plus `/404.html` and the root files (Google and Bing verification, `llms.txt`, favicon).
  - **Streams.** Listings (writing, talks, certifications, privacy, 404); portfolio (all 11 `#ch-*` anchors resolve); four article batches A1 to A4 (27 articles, 40 explainer engines under `blocks/explainer/engines/`, each with an import engine); the design system site `/design-systems/v3/` (template `design-docs`, published, `noindex`).
  - **Per-page gates** (content-diff 0 looks-same red and 0 nothing-lost yellow, pixel, height, clip, chrome, editability 0 dead and 0 duplicated) pass at 1440 and 360 on every page except, by decision or register: 2026-08-15 (R11, the source's explainers never run), 2025-07-06 at 1440 (-10px, R13) and the design system page (see Left).
  - **Final sweep** after link localization (gate-all, all 34 pages): pixel and height pass on 34 of 34 at 1440 and 360; full verdict 33 of 34 at each width (portfolio content presence: two repo cards whose source wraps the whole card in one link).
  - **Lighthouse mobile performance 100** on every page type: home, writing listing, article, portfolio, talks, certifications, privacy.
  - **QA:** dark-mode check, v3 eval on all 36 pages and `stardust:qa` (triaged: no migration defect left); 301 of 301 linked anchors resolve.
  - **Shared code built by the main thread for the streams:** series nav; code wrap, prose, plain, stack; data-table nowrap, cheat, rank, stack, caption, sr-caption, row-heads, fill-in, span-first, mono-head, compact, merged cells; figure page, narrow, slim, compact, tall, native, open and split boards; article section styles code-wrap, code-wrap-wide, roomy-h3, page theme code-nowrap, h2 keep-together; dark inverse for a band forced dark; shared theme control. Links localized across the whole content tree (113 links).
  - **Register** R8 to R23 added for review (variant budgets, one-article looks, link targets that would 404 after cutover, explainer behaviour); catalog updated with every block, variant and engine.

## Left

In order. The steps and their "done when" are in [workstreams.md](workstreams.md).

### Before the first goal (Jack)

- [ ] Open `www-eds` in Claude Code, trust the folder, and check that `/status` lists the project settings and that the three plugins load.
- [ ] Use auto mode, so goal turns run without a prompt per tool call.
- [ ] Be ready to sign in to Adobe when the DA token helper opens a browser window (rule 8). The token is cached at `~/.aem/da-token.json` for 24 hours; no `.env` file is needed. The current one is valid until 2026-10-26 09:29 ET.
- [ ] Answer [open-questions.md](open-questions.md), or let the goal apply its recommendations.

### Phase 1: single thread (Goal 1)

- [ ] **Prep:**
  - [ ] Experience Workspace enablement (`ew.enabled` in the DA config `flags` tab, the Sidekick `editUrlPattern` in `sidekick.json`), with Jack's OK. **Asked 2026-10-25; waiting.**
  - [x] Freeze the baseline, run spec and audit.
  - [x] Check every item in [best-practices.md](best-practices.md) § 9 and update the note.
- [x] **Foundation and first page:** `stardust:replica --first-page home`. Approval waits for Jack's register review.
- [x] **Article archetype** and the explainer family's first blocks. Approval waits for Jack's register review.
- [ ] **Jack: register review** (decisions 15, 16) of `www-eds/stardust/replica/inconsistency-register.md`: now R1 to R23. R3 needs a decision (the one-frame light canvas for a stored Dark choice); R11, R16, R18, R20 are applied and need review. Then the state rows advance (`stardust/reconcile-first-page.md` § 3).

### Phase 2: parallel (Goal 2)

- [x] **Blocks, templates and pages:** C1, C2, C3, D2, F, G1 done in the wide rollout (2026-10-25).
- [ ] **H, design system site:** published at `/design-systems/v3/` with every story; it passes the gate at both widths (4d7c0ad: 1440 0 red / 0 nothing-lost, 1.68%, +2px; 360 0 / 0, 3.66%, -4px; clipped 0) with editability 1456/1456 (0 dead, 0 dup). Its stories are the site's own blocks (decision 7) where v3 shows prototype markup, in the register (R17) for Jack; bracketed placeholder text is still Inter where v3 uses mono (+6px per placeholder story at 360). The library config (the blocks sheet, rows listed in `stardust/rollout/streams.md`) is a config change: waits for Jack.
- [ ] **Writing listing from `/query-index.json`:** needs the query index config and article metadata (config change): waits for Jack.

### Phase 3: single thread (Goal 3)

- [x] **E:** one-off explainers, mapped onto the explainer core as engines (register R12, R19 to R23).
- [ ] **G2:** SEO and config. Root files and social images done; redirects (`blogs.html`, `certifications.html`, and folder pages without their slash), query index, sitemap (it lists /nav and /footer today), robots, headers, bulk metadata (`og:type`), JSON-LD and GA4 wait for Jack (config).
- [x] **I:** rollout of the remaining 27 articles, media upload, link localization over the whole tree.
- [ ] **B:** the edge on staging. Built (not deployed): `www-eds/edge/` holds the Worker (project-site allowlist first, then Adobe's Cloudflare worker vendored from `adobe/aem-cloudflare-prod-worker@ec7387c`), `wrangler.toml` with the staging route `next.jackzhaojin.com/*` and no www route, 8 route-table tests passing, and `scripts/check-host.mjs`, which already passes with the Worker in-process against the real origins (34 pages from EDS, 7 project sites from GitHub Pages, root files, 404s; only the legacy redirects wait on config). Left for Jack: the staging DNS record, `wrangler login`, `npx wrangler deploy --env staging`, then `node scripts/check-host.mjs --base https://next.jackzhaojin.com`.
- [ ] **J:** QA. Done: the final gate sweep; Lighthouse mobile 100 on every page type; the dark-mode check (stored Dark on all 34 pages: inside 10% and 8px except R11 and R13); the v3 eval on all 36 pages (Light, Dark, System: 9 of 9 pairs AA, no overflow, no console errors); `stardust:qa` swept and triaged (45 error / 127 warn left, none a migration defect: pre-cutover noindex, config items, findings the source has too; `www-eds/stardust/rollout/streams.md`). Left: project-site routes and `check-site.sh` on staging (need B).

### Cutover (Jack, not a goal)

- [x] **K:** the www route: done 2026-10-26, about 15:12 ET, route-first (see [routing-cloudflare.md](routing-cloudflare.md), "Cutover, as done"). Left: push invalidation (the Cache Purge token), GA4 (decision 9), Search Console, `docs/site-operations.md`, a README in this repo, the publishing docs. Release `v1.0.0` in www-eds.

## Rules for every run

1. **What wins:** README decisions win, then [best-practices.md](best-practices.md).
2. **Code:** commit and push to `www-eds` main (decision 14). Pull with rebase before every push; never force-push.
3. **This folder is read-only** for goals, with two exceptions: this file's Done, Left and Run log, and the findings in [best-practices.md](best-practices.md) § 9. Edit them locally. Never commit or push `jackzhaojin.github.io`; Jack does that.
4. **Stop and ask Jack at:**
   - the Adobe sign-in, whenever the cached DA token has expired;
   - any Experience Workspace or site config change;
   - every Cloudflare change, the Cache Purge token and `wrangler login`;
   - the register reviews (decisions 15 and 16);
   - the www route and the cutover.
5. **Node:** Bash calls do not keep shell state, so prefix every node, npm, npx, aem and playwright-cli command with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
6. **Plugins:** never copy skill files into a repo. Declare plugins in `.claude/settings.json`, and update them between goals, not during one.
7. **Copy:** plain hyphens only (no em or en dashes), content carried verbatim, never send readers to LinkedIn.
8. **DA token:** get it through the aem-edge-delivery-services plugin's `da-auth` skill.
   - Run `npx -y github:adobe-rnd/da-auth-helper token >/dev/null`. It opens Adobe's sign-in and caches the token at `~/.aem/da-token.json` for 24 hours (measured 2026-10-25). If the browser window doesn't appear, the helper prints the sign-in URL on stderr: open it in Chrome and let Jack sign in.
   - Never print the token, never write it into a repo, and never pull it out of a browser. This replaces stardust's `.env` suggestion.
   - Pass it inline to each command that needs it:

     ```bash
     DA_TOKEN=$(node -e "const t=require(process.env.HOME+'/.aem/da-token.json');if(t.expires_at>Date.now()+60000)process.stdout.write(t.access_token)") <command>
     ```

   - If that comes back empty, the token has expired: run the helper again and stop for Jack's sign-in.

## Goal prompts

Paste one per phase in a session opened in `/Users/jackjin/dev/jackzhaojin/www-eds`. The `/goal` evaluator reads only the conversation, not files, so each condition names checks Claude has to print. Each also ends cleanly at a stop point, so Jack answers and runs the goal again.

### Goal 1: Prep and first page

```text
/goal Read /Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/ai-docs/2026-10-24-eds-migration/start-here.md and the files it lists, then complete Phase 1 (Prep, Foundation and first page, Article archetype) of workstreams.md in this repo, following its rules. Done when this conversation shows all of: (1) curl -s -o /dev/null -w "%{http_code}" https://main--www-eds--jackzhaojin.aem.live/ printing 200, with the v3 home page there; (2) stardust gate output for the home page and one explainer-heavy article at 1440 and 360 with 0 looks-same red and 0 nothing-lost yellow findings; (3) a mobile Lighthouse performance score of 100 for the home page; (4) the editability gate passing for every block built so far; (5) every best-practices.md section 9 item checked and the note updated; (6) start-here.md Done, Left and Run log updated. Also counts as met: Claude has stopped at a stop point listed in start-here.md and asked Jack for what it needs. Stop after 60 turns either way and report what is left.
```

### Goal 2: Blocks, templates and library in parallel

```text
/goal Read /Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/ai-docs/2026-10-24-eds-migration/start-here.md and the files it lists, then complete Phase 2 of workstreams.md (C1, C2, C3, D2, F, G1, H) with one subagent per stream spawned from this session, each writing only its own paths and pushing to main after pull --rebase. Done when this conversation shows, for every stream, its workstreams.md "Done when" row with the gate or test output that proves it; every portfolio #ch-* anchor resolving on aem.page; the writing listing reading from /query-index.json; every v3 component and variant with a live story under /design-systems/v3/ on aem.page; and start-here.md Done, Left and Run log updated. Also counts as met: Claude has stopped at a stop point listed in start-here.md and asked Jack for what it needs. Stop after 80 turns either way and report what is left.
```

### Goal 3: Everything before cutover

```text
/goal Read /Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/ai-docs/2026-10-24-eds-migration/start-here.md and the files it lists, then complete Phase 3 of workstreams.md (E, G2, I, B, J) in that order. Done when this conversation shows: every URL in the source site's sitemap.xml returning 200 at the same path on https://main--www-eds--jackzhaojin.aem.live; stardust:qa clean; the dark-mode check and the v3 eval passing; a mobile Lighthouse performance score of 100 on every page type; https://next.jackzhaojin.com serving the EDS home page and a 200 from all 7 GitHub Pages project sites under it; and start-here.md Done, Left and Run log updated. The www route and the cutover are not part of this goal. Also counts as met: Claude has stopped at a stop point listed in start-here.md and asked Jack for what it needs. Stop after 100 turns either way and report what is left.
```

## Run log

One dated line per run: what changed, and what it stopped on.

- 2026-10-25: site created through the aem.live tutorial; `www-eds` made ready for `/goal` (plugins, Node 22, docs access). Planning session.
- 2026-10-25: DA token flow switched from `.env` to Adobe's `da-auth-helper` cache, and tested: 24-hour token, authenticated list 200. Planning session.
- 2026-10-25: Goal 1. Prep, foundation, home and the article archetype built, published and gated (1440 and 360: 0 red, 0 nothing-lost, height delta 0; Lighthouse mobile 100 on both); spec, audit, section 9 and RECONCILE done. Stopped at the Experience Workspace enablement (config change) and the register review, for Jack.
- 2026-10-25: Wide rollout ("migrate everything"). Shared blocks first, then 7 parallel streams (listings, portfolio, design system, articles A1 to A4) with the main thread answering their shared-file requests. All 34 sitemap URLs live and gated, links localized, final sweep 34/34 pixel and height at both widths, Lighthouse mobile 100 on every page type. The design system stream's push was refused by the permission check; Jack approved it and the main thread pushed. QA: dark check, v3 eval on all 36 pages, stardust:qa triaged, fixes for the defects it found. The design system page passed the gate last (4d7c0ad, about 18:05 ET). The article about the build (`/writing/2026-10-25-eds-migration-two-goal-prompts/`), published on www at about 18:30, was migrated the same evening (engine `commit-day`; 1.05% / -3px at 1440, 2.45% / -3px at 360, 0 red), with its writing listing row: double migration continues until the cutover (recipe in www-eds `ai-docs/2026-10-25-initial-buildout-2-goals/whats-left.md` section 5). Evening: the SEO config (www-eds `hlx-config/`: production host, robots.txt, sitemap with the same 35 URLs, redirects, bulk metadata, JSON-LD), and the staging hosts per Jack's plan: eds.jackzhaojin.com (EDS) and gh.jackzhaojin.com (the GitHub Pages site), both noindex, Workers deployed, check-host passes on both; www unchanged. The cutover order is in www-eds `whats-left.md` section 3. Stopped on the register review (R17 design system page; R24 portfolio repo cards since resolved), config (EW enablement, library, query index, redirects, sitemap, robots, bulk metadata) and Cloudflare for the staging edge (B), for Jack.
- 2026-10-25, night: off www, robots.txt and the sitemaps are 404s from the Worker (Cloudflare's managed robots.txt stays on, Jack's call). The build article's link update went in through the DA Source API. Codex's pull request 1 was reviewed and kept as merged. www-eds now documents itself: a README, `edge/README.md`, `stardust/README.md`, and `CLAUDE.md` as a symlink to `AGENTS.md`. Each prompt is an Edge Delivery environment on its original commit: `release/0.1` (4575a93), `release/0.2` (f02e0e7) and `release/0.3` (the end of the day), with 1.0 kept for the cutover (www-eds `ai-docs/2026-10-25-initial-buildout-2-goals/releases.md`). Stopped on the cutover, the register review and the Experience Workspace config, for Jack.
- 2026-10-26: content moved into git as the source of truth: every document went through the DA editor round trip, was gated against gh and published (www-eds `ai-docs/2026-10-26-content-in-git/`, rules in `content/README.md`). The cutover went live at about 15:12 ET, route-first, from another session: www is EDS, GitHub Pages stays on www's origin for the project sites and as rollback. Validated on all three hosts; tagged `v1.0.0` with branch `release/1-0-0` in www-eds. Stopped on push invalidation (Jack's token), GA4 (decision 9), the old URLs that now 404 on www, Search Console and this repo's docs, for Jack.
