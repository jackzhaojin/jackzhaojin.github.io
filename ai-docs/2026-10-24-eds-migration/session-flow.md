# Session flow: planning the EDS migration

A record of the session that produced this folder, kept as prep for a video and as raw material for `jack-technical-writing`. It ran in Claude Code (desktop app, Opus 5.5) on the evening of 2026-10-24 into 2026-10-25. The first commit, `f3f1633`, landed at 00:08 ET on 2026-10-25.

Nothing was built. The whole session is analysis: what Adobe ships, what this site is, how the two fit, what Jack decides, and what the current platform actually does.

## The arc in one paragraph

Jack pointed Claude at a local clone of `adobe/skills` and asked what Adobe has been doing and whether any of it could migrate his GitHub Pages site pixel-perfect or better. Claude surveyed the repo (stardust dominates, about one release a day), mapped the site through stardust's eyes, then mapped design system v3 onto EDS. Mid-turn, Jack added the requirement that changed the routing plan: seven GitHub Pages project sites must keep working under www. A curl turned up a redirect trap, and the Worker design came out of it. Jack made eight decisions through multiple-choice questions with free text, and overrode the explainer recommendation for a reason only he could know: this is his flagship demo. Three research agents then read the aem.live docs, Experience Workspace's source and the boilerplate in parallel, and found a variant picker that exists in code but not yet in the docs. Everything was verified, written into this folder and pushed. Jack then answered the twelve open questions the same way. Where he overrode a recommendation, he picked the simpler option or the one that demos better.

## Timeline

Jack's prompts are quoted as typed.

### 1. What has Adobe been doing?

> Looking into this folder - can you tell me what adobe has been doing? looks like they have a bunch of skills, anything that could help me migrate my github pages and plan it out and use stardust and do a pixel perfect migraiton or better?

- **Claude did:** read the README, git history by month, plugin and author, then stardust's README, changelog and replica skill. Then it looked at the site repo: page count by section, sitemap, structured data, scripts and the theme toggle.
- **Found:**
  - About 1,200 commits since February 2026.
  - Stardust 178 commits and web 143 in the last 90 days; everything else is small.
  - Stardust is at 0.36.0, and most releases harden the replica gate.
- **Found in stardust's scripts:** the measuring tools force light mode (`colorScheme: 'light'` in `cap-probe.mjs` and `measure.mjs`), so dark mode would go unchecked.
- **Output:** the survey and a six-step plan in chat.

### 2. Analysis only, plus the design system

> This is just analyze phase, we'll create a da.live (now called experience workspace) repo eventualy and help me think through it, eventually we'll create a goal prompt and get things built in parallel. do note that i have a design system we'll want ot move to EDS as well /Users/jackjin/dev/jackzhaojin/jackzhaojin.github.io/design-systems/v3

- **Claude did:** read v3's README, tokens, components and how production pages load them; counted explainer figures; found the per-article `explainer.js` files; read stardust's promotion rule and deploy's widget, font and section rules.
- **Found:**
  - Replica's full-site prep copies its own reverse-engineered `PRODUCT.md` and `DESIGN.md` over the project root, the same file names as v3's authored ones.
  - 26 articles carry bespoke explainer code: 3,335 lines of JS and 1,850 of CSS.

### 3. The requirement that changed the routing (sent mid-turn)

> The final EDS site should have the main site and the design system site, and the whole thing is routed to cloudflare as well, i want my other specific github io sites to work, however the main site wll no longer be served from github pages on jackzhaojin.github.io, however other sites will be such as https://www.jackzhaojin.com/bruce-hackathon-2026-09-12/
>
> goal prompt should eventually include in configuring cloudfront via built in browser as well

- **Claude did:**
  - read `docs/site-operations.md`;
  - listed every repo with Pages enabled (`gh api users/jackzhaojin/repos`) and checked each one's Pages config;
  - curled each project site under www;
  - curled one through `jackzhaojin.github.io` directly.
- **Found:**
  - Seven project sites, all served under www because they inherit the user site's custom domain.
  - **The trap:** `https://jackzhaojin.github.io/bruce-hackathon-2026-09-12/` answers 301 to www, so a Worker fetching project sites from github.io would loop.
- **Resulting design:** keep `CNAME` and the DNS record as they are, and add one Worker. It sends allowlisted project paths to the zone's own origin with `fetch(request)` and everything else to EDS. Rollback is deleting a route.
- **Read as:** "cloudfront" as Cloudflare, since that is what fronts the site.

### 4. Write it down

> Save this analysis as a dated folder under ai-docs/ in jackzhaojin.github.io so the goal prompt can build on it. Don't commit.

- **Claude did:** wrote five files following the existing `ai-docs/` convention, then checked links, dashes and facts. Writing them caught three of its own errors: 28 articles not 29, 26 with bespoke code not 27, and widget text is still checked at page level. It also found that `scripts/check-site.sh` has `SITE` hard-coded.

### 5. Decisions as multiple choice

> let's go through each decision! give me MCQs with a recommended and let me free type

Claude asked in three rounds, each option with a recommendation and a description, so free text was always possible. Jack's answers:

- **Design canon:** v3 canon, extract as a cross-check (the recommendation).
- **Explainers:** Jack overrode the recommendation (widgets):

  > Content would be part of experience worksapce, so it's a content migration. we'll however need to demonstrate our skills and capabilities to use best in class EDS impelmentation as i'll need to demo it and be my flagship implementation

- **Authoring:** AI writes, Jack touches up. **URLs:** keep every one. **Images:** Experience Workspace media.
- **One-off explainers:**

  > We should explore the very very latest capablity of experience workspace block variation capabilites, and yeah ew should have generic blocks, however we need css style minimially to thin about style variations. and those should match our design system

- **Topology:**

  > One repo one site, and design system should basically also just be "content" in experience workspace

- **Worker:**

  > Let's have wrangler scripts be part of eds however added to hlxignore

- **Demo focus:** authoring in Experience Workspace, performance, index-driven listings, plus:

  > also the latest features, this is something for me to continue doing, ideally it should have all the best practices updated

- **Candidate round:** not migrated, and a principle for next time:

  > Let's not migrate this one, maybe if we do it again we can have like, differnet feature branches or design system branches in EDS. Ideally content should be the same with additional css classes, however code is what ideall ychanges with design system updates and not content (barring additional designs / css variations)

The free text did more than pick options. It produced the folder's two principles: content in Experience Workspace with design in code, and a flagship that stays current.

### 6. Research what the platform does today

> Research Experience Workspace's current block-variation capabilities and current EDS best practices (aem.live docs, da.live / Experience Workspace docs, the latest aem-boilerplate, stardust deploy's variant rules) and write it up as the best-practices note in the ai-docs folder. Don't commit.

- **Claude did:** started three research agents in parallel and, while they ran, read stardust's editability contract (EW1 to EW10), David's Model and the local EDS skills itself:

  | Agent | Read | Tool uses | Time |
  |---|---|---|---|
  | aem.live docs | about 38 pages plus the release feed | 58 | about 8.5 min |
  | Experience Workspace | docs and the `da-live`, `da-nx`, `da-universal` source | 78 | about 9.7 min |
  | Boilerplate and Block Collection | through `gh api` | 55 | about 7.5 min |

  Then Claude verified the claims that mattered against primary sources before writing anything: `head.html` and `scripts.js` from the repo, the consent gate's code, three aem.live pages, and the variant picker in the da-live source.
- **Found:**
  - A Variant dropdown on the canvas block toolbar (da-live #1171 to #1455, Aug to Oct 2026) that reads its list from the library. It isn't in the docs yet, and nothing validates the words.
  - `head.html` should stay stock: no inline scripts, no martech. GA4 goes behind a consent gate that declines by default.
  - Buttons are opt-in through bold or italic.
  - Section metadata `id` becomes a real id on the server, which keeps the portfolio's `#ch-*` anchors.
  - Non-Enterprise Cloudflare plans purge the whole zone on every publish.
  - 20 of the 26 per-article explainers build markup with `innerHTML`, which kills editability.
- **Output:** `best-practices.md`, plus corrections to three other files where the research proved them wrong.

### 7. Commit and push

> After your research you can commit and push!
>
> push to main branch is fine

Claude committed through the `jack-git-commit` skill (`f3f1633`, six files) and pushed to main. It waited for GitHub Pages to report `built` before loading the new URL, because Cloudflare caches 404s (`docs/site-operations.md`).

### 8. Open questions and this record

> Let's write it down as open questions, and as well as document this flow! we did today, we'll eventualy probably do a video on this, but this is good prep work

This produced `open-questions.md` (12 questions, each with a recommendation, now the one home for them) and this file.

### 9. Answering the open questions

> OK ask me teh questions in MCQs format with recommended and otehrs section

Three rounds of four. Jack's answers:

- **The recommendation, 7 times:** GA4 and consent, trailing slashes, library source, names, run mode, approvals, dark mode.
- **His own words, twice.** On how the parallel build runs:

  > I would keep it simple - single thread the initial build out but then for block/templates/block libraries that could go in parallel we should, commit to main is fine

  On the old repo:

  > Keep, but we'll make a note in README.md and make sure the CNAME redirects and stuff

- **A different option, 3 times:** streams push straight to the EDS repo's main; `jack-technical-writing` always writes through the Experience Workspace MCP server; the best-practices check stays manual.

Every override went toward simpler (one thread first, one branch, no schedule) or toward the demo (MCP).

What came of it:

- The answers became README decisions 9 to 20.
- "MCP always" raised a follow-up: stardust's own deploy writes through the Source API, and its ledger and gates depend on that. That is now open question 1.
- The workstreams were rewritten as three phases: single thread, parallel blocks, templates and library, then single thread.

## Moments worth showing

1. **The redirect trap.** One curl shows `jackzhaojin.github.io/<repo>/` answering 301 to www, and the whole routing design follows from it.
2. **The override.** The agent recommended widgets for one-off explainers; Jack chose content plus generic blocks because the site is his flagship demo.
3. **Docs lag the code.** The variant picker exists in da-live but not in the docs. Reading the source found it, and a second check confirmed it.
4. **The light-mode gap.** One grep shows stardust measures in light mode only, on a site with a Light / Dark / System toggle.
5. **Two design systems claiming one file name.** Replica would have copied its reverse-engineered spec over v3's authored `DESIGN.md`.
6. **Self-correction.** Writing the docs caught three of the agent's own numbers being wrong.
7. **Simple beats clever.** Offered a session per stream with worktrees and merges, Jack chose one thread first and one branch.

## Techniques

- **Multiple-choice decisions with a recommendation and free text.** Fast to answer, and the free text carried the real intent.
- **Parallel research agents with narrow briefs.** Each brief named its sources, asked for dates and URLs, and asked for unverified claims to be labelled.
- **Verify before writing.** Every claim the plan depends on was checked against code or a primary page.
- **One home per fact.** Decisions in the README, rules in `best-practices.md`, questions in `open-questions.md`. Other files point.
- **House rules respected:** analysis only until asked, no commits until asked, and no load of a new URL before the Pages build reports `built`.

## Not done yet

- Answering the two remaining questions in [open-questions.md](open-questions.md).
- The first spike ([best-practices.md](best-practices.md) § 9).
- Writing the goal prompt.
- Installing and running stardust, and creating the EDS repo and Experience Workspace site.

## A possible video outline

1. **The ask:** plan a pixel-perfect migration of my own site before writing any code.
2. **What Adobe shipped:** stardust and its measured gate.
3. **My site through stardust's eyes:** explainers, dark mode, two design specs.
4. **The routing trap and the Worker.**
5. **Deciding by multiple choice, and the override.**
6. **When the docs lag the code:** the variant picker.
7. **The plan in the repo, and what the goal prompt will run.**
