# Open questions

As of 2026-10-25. This is the one home for open questions in this folder. Each has a recommendation; an answer replaces it with the date, and answered questions move to the Decisions list in [README.md](README.md). Facts to check in the first spike are a separate list: [best-practices.md](best-practices.md) § 9.

## Before the goal prompt

### 1. GA4 and consent

The boilerplate loads analytics in `scripts/consented.js`, behind `consent-check.js`, which declines by default. aem.live advises against martech in `head.html` ([best-practices.md](best-practices.md) § 1 and § 4).

- (a) GA4 in `consented.js` behind a real consent banner. Best practice; some visits go uncounted.
- (b) GA4 in `consented.js` with consent granted by default and no banner, as the site works today.
- (c) Keep gtag in `head.html`. Against aem.live guidance; risks the Lighthouse 100 gate.

Recommendation: (b), with two refinements. Treat the browser's Global Privacy Control signal (`navigator.globalPrivacyControl`) as a decline, and start the delayed phase 3 seconds after LCP. This keeps today's behaviour and follows the boilerplate's pattern. It is a privacy call, not a technical one. Whichever is chosen, `docs/site-operations.md` drops the "gtag first in `<head>`" rule.

### 2. Trailing slashes

Decision 4 keeps `/writing/<slug>/`. EDS serves a folder's `index` document at `/x/`. David's Model rule 7 prefers `/x` with 301s from the old form.

Recommendation: keep the slashes (decision 4 stands), since every URL already carries Search Console history. Revisit only if the spike shows that `/x` or `/x/index` misbehave.

### 3. Library source

The Experience Workspace library reads one document per block, with a table per variant and `library-metadata` blocks.

- (a) The `/design-systems/v3/` pages double as the library.
- (b) A separate `/library/blocks/` copy, generated from the same source as the design system pages.

Recommendation: (a) if the spike confirms the `blocks` sheet can point at those documents and `library-metadata` can stay hidden on published pages; otherwise (b). Either way the variants live in one place.

### 4. Names

- The EDS GitHub repo.
- The Experience Workspace org and site.
- The staging hostname.

Recommendation for staging: `next.jackzhaojin.com`. The other two are Jack's choice.

### 5. How the parallel build runs

- (a) One Claude Code session per stream, each in its own worktree, plus one orchestrator session that owns stardust's run state and merges.
- (b) A single Workflow run that fans out agents.
- (c) Subagents inside one session.

Recommendation: (a). Jack can open, watch and steer each stream, each stream keeps its own branch, and file ownership ([workstreams.md](workstreams.md)) maps onto worktrees one to one.

### 6. What agents may commit and push

Recommendation:

- Each stream commits to its own branch in the EDS repo.
- The orchestrator merges into the EDS repo's main.
- No agent pushes to `jackzhaojin.github.io`.
- The Cloudflare www route and the cutover are Jack's go, as in [routing-cloudflare.md](routing-cloudflare.md).

### 7. Stardust run mode

Stardust can run gated (pausing at its decision points) or hands-off (deciding from evidence and logging).

Recommendation: gated for Prep, the first page and each archetype, so Jack sees the inconsistency register and the variant vocabulary as they form. Hands-off for the sibling rollout, with a report per wave.

### 8. Who approves design changes

The inconsistency register and the look changes from mapping one-off explainers onto the family need an owner's yes.

Recommendation: Jack reviews the register once per archetype, and once per batch of articles in stream E, not entry by entry.

### 9. How `jack-technical-writing` writes into Experience Workspace

- (a) The DA Source API, through stardust's `deploy-batch.mjs`.
- (b) The Experience Workspace MCP server (`da_*` tools).

Recommendation: (a) for the migration (bulk, resumable ledger, and the gates run on it), (b) for new articles after launch (it shows AI authoring inside Experience Workspace, and versions mark agent saves). `docs/publishing-writing.md` and the skill change to match.

### 10. The dark-mode check

Stardust's instruments measure in light mode only ([adobe-skills-survey.md](adobe-skills-survey.md) item 1).

- (a) A local check: v3's eval plus dark captures.
- (b) The same, then a pull request to adobe/skills adding a colour-scheme option to stardust's capture scripts.

Recommendation: (b), after the local check works. It fixes the gap for every stardust user, and it makes a good part of the demo.

## After cutover

### 11. The old repo

`jackzhaojin.github.io` keeps its `CNAME` and Pages for the project sites. Its main-site files stay as the rollback.

Recommendation: keep them until two clean weeks of Search Console and GA4 after cutover, then shrink the repo to `CNAME`, `.nojekyll` and a minimal page.

### 12. Keeping the reference current

The site is meant to stay a living reference ([README.md](README.md), Principles).

Recommendation: a monthly check of the aem.live release feed and the boilerplate's commits against [best-practices.md](best-practices.md), run as a scheduled task that reports and never changes code on its own.
