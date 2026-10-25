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

## Left

In order. The steps and their "done when" are in [workstreams.md](workstreams.md).

### Before the first goal (Jack)

- [ ] Open `www-eds` in Claude Code, trust the folder, and check that `/status` lists the project settings and that the three plugins load.
- [ ] Use auto mode, so goal turns run without a prompt per tool call.
- [ ] Have a DA token ready for content writes. Stardust's `deploy` reads `DA_TOKEN` from `www-eds/.env`. The boilerplate's `.gitignore` does not list `.env`, so add it there before creating the file (stardust's setup also writes that block).
- [ ] Answer [open-questions.md](open-questions.md), or let the goal apply its recommendations.

### Phase 1: single thread (Goal 1)

- [ ] **Prep:**
  - Experience Workspace enablement (`ew.enabled`, the Sidekick edit URL), with Jack's OK.
  - Freeze the baseline, run spec and audit.
  - Check every item in [best-practices.md](best-practices.md) § 9 and update the note.
- [ ] **Foundation and first page:** `stardust:replica --first-page home`.
- [ ] **Article archetype** and the explainer family's first blocks.

### Phase 2: parallel (Goal 2)

- [ ] **Blocks, templates and library:** C1, C2, C3, D2, F, G1, H.

### Phase 3: single thread (Goal 3)

- [ ] **E:** one-off explainers.
- [ ] **G2:** SEO and config.
- [ ] **I:** rollout of the remaining 27 articles.
- [ ] **B:** the edge on staging.
- [ ] **J:** QA.

### Cutover (Jack, not a goal)

- [ ] **K:** the www route and the rest of the cutover order in [routing-cloudflare.md](routing-cloudflare.md).

## Rules for every run

1. **What wins:** README decisions win, then [best-practices.md](best-practices.md).
2. **Code:** commit and push to `www-eds` main (decision 14). Pull with rebase before every push; never force-push.
3. **This folder is read-only** for goals, with two exceptions: this file's Done, Left and Run log, and the findings in [best-practices.md](best-practices.md) § 9. Edit them locally. Never commit or push `jackzhaojin.github.io`; Jack does that.
4. **Stop and ask Jack at:**
   - the DA token;
   - any Experience Workspace or site config change;
   - every Cloudflare change, the Cache Purge token and `wrangler login`;
   - the register reviews (decisions 15 and 16);
   - the www route and the cutover.
5. **Node:** Bash calls do not keep shell state, so prefix every node, npm, npx, aem and playwright-cli command with `source ~/.nvm/nvm.sh && nvm use >/dev/null &&`.
6. **Plugins:** never copy skill files into a repo. Declare plugins in `.claude/settings.json`, and update them between goals, not during one.
7. **Copy:** plain hyphens only (no em or en dashes), content carried verbatim, never send readers to LinkedIn.

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
