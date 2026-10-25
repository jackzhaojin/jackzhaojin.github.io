# adobe/skills survey

Read 2026-10-24 from the local clone at `/Users/jackjin/dev/others/adobe/skills` (main at `e3611d4c`, stardust 0.36.0). Re-check versions before the build; stardust ships about one release a day.

## Activity

- The repo started in February 2026 and has about 1,200 commits. October 2026 is the busiest month so far (273).
- Last 90 days, commits per plugin: stardust 178, web 143, aem 39, creative-cloud 15, workfront 12, app-builder 12, commerce 7. Analytics and CJA had none.
- Most stardust work comes from Paolo Mottadelli and David Catalan. Each release is a "field learning" from a recorded migration run, and most of them harden the replica gate: content-diff tiers (looks the same vs nothing lost, 0.35.0), sticky layers captured once in stitched shots (0.34.12), icons matched by pixels (0.34.11), consent banners dismissed (0.34.6), a diff report that names the block a pixel difference belongs to (0.34.14), and first page first (0.36.0).

## Skills that apply

| Skill | Use here |
|---|---|
| `stardust:spec` | Pre-migration spec with the `generic` parser profile: page types, a block catalog with reuse verdicts, dynamic features, redirects, open questions with defaults. Skip stage S5 (real-user data needs an AEM telemetry key). |
| `stardust:audit` | Scorecard across design, performance, SEO, AI search and accessibility. Source of inconsistency-register entries. |
| `stardust:replica` | Same-design migration. One archetype per page type, gated against the live site at 1440 and 360. `--first-page home` delivers one page while the rest is scoped. `--freeze-baseline` freezes the origin so weekly publishing does not move the target. |
| `stardust:dynamics` | Triage of every interactive surface: explainers, writing filter, theme control, portfolio scripts, video. |
| `stardust:migrate` | Clones sibling pages from an archetype. |
| `stardust:deploy` | One page to EDS blocks and Experience Workspace content through the DA Source API, with media upload, link localization and the editability gate. |
| `stardust:rollout` | The whole site: coverage ledger, block dedup, sitemap, redirects, dynamics phase, optimize gate, report. |
| `stardust:qa` | Read-only sweep of the live EDS site. Reports, never fixes. |
| `stardust:diff` | Pixel and structure comparison, `eds` or `generic` profile. |
| EDS `create-site` | GitHub repo from the boilerplate, aem-code-sync, first content. |
| EDS `aem-cli` | Local dev server (`aem up`). |
| EDS `snowflake` | Keeps a page's DOM byte for byte inside EDS. Fallback for a page that will not pass the gate as blocks, most likely the portfolio. |
| `web` | `site-scan`, `page-cache` (offline replay of the source), `page-prep`, `browser-probe`. |

Already installed in this repo: impeccable, plus the marketing skills `seo-audit`, `schema`, `ai-seo`, `site-architecture` and `programmatic-seo`. Audit and rollout's optimize gate use the first four when present.

## Install

```bash
/plugin marketplace add adobe/skills
/plugin install stardust@adobe-skills
/plugin marketplace add pbakaus/impeccable
/plugin install impeccable@impeccable
```

Prerequisites: Node 22 or later, Playwright with Chromium resolvable from the project (`npm i -D playwright && npx playwright install chromium`), `playwright-cli` on PATH.

## Stardust behaviours that matter for this site

1. **Light mode only.** `cap-probe.mjs`, `measure.mjs` and `style-census.mjs` set `colorScheme: 'light'`. `stitch-shot.mjs` and `visual-diff.mjs` do not set it, so Playwright's default (light) applies. There is no dark flag. The dark theme needs its own pass: v3's eval plus dark captures.
2. **Reduced motion.** `cap-probe.mjs`, `measure.mjs` and `visual-diff.mjs` force reduced motion. Explainer animations and the portfolio reveal are not what the pixel gate measures; behaviour is covered by interaction parity and dynamics.
3. **Spec promotion.** A full-prep replica run copies `stardust/current/PRODUCT.md`, `DESIGN.md` and `DESIGN.json` to the project root byte for byte (`replica/reference/preserve-direction.md` § 1). These are the same file names as v3's authored files.
4. **Widgets.** A section with no authored rows ships as a widget at `widgets/<path>/<name>.{html,css,js}`, authored as a paragraph holding only a `/widgets/` link (deploy Step 2, rule D1). Deploy's per-block gate skips widgets and the editability gate exempts them; page-level content-diff still compares the rendered page. This migration ships explainers as blocks with their content in Experience Workspace (README decision 2), so widgets are only for UI that carries no content.
5. **Fonts.** No Google Fonts link and no font preloads. `@font-face` goes in `styles/fonts.css`, metric-matched fallback faces in `styles/styles.css` (deploy Step 4).
6. **URLs.** EDS serves a folder index at `/x/` and a leaf at `/x/y`, never `.html` (`eds-path.mjs`). Link localization rewrites internal links that resolve on the new site and leaves the rest absolute, which is the right outcome for links to the project sites.
7. **Crawl scope.** The project sites share the host, and the home page and portfolio link to 4 of them (ai-sandbox, bruce-play-ten, bruce-lava-dash, bruce-hackathon-2026-09-12). Exclude all 7 prefixes from extract and spec.
8. **Media.** The ingester rehosts images only. SVGs must be pure vector and under about 40 KB (this site's 16 are). Video stays on YouTube.
9. **Section styles.** Default-content sections get a section-metadata style word, never CSS in a cell. Per-instance looks are named variants from a closed vocabulary (deploy #134).
10. **Reserved names.** No block or widget named `section`, `block`, `wrap`, `button` or `widget`, and no names ending in `-wrapper` or `-container`.
11. **State files have one writer.** `stardust/state.json`, `status.jsonl` and `learnings.md` are run state. First page first splits work into tracks with one writer per path; parallel agents need the same discipline ([workstreams.md](workstreams.md)).
