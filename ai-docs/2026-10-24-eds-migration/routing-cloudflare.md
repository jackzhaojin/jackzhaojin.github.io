# Routing and Cloudflare

## Today

From [docs/site-operations.md](../../docs/site-operations.md):

```
browser
  -> Cloudflare edge, zone jackzhaojin.com (TLS, http->https, apex->www, cache)
    -> GitHub Pages (www CNAME -> jackzhaojin.github.io, proxied)
```

- DNS: `A jackzhaojin.com 192.0.2.1` (proxied placeholder) and `CNAME www jackzhaojin.github.io` (proxied). The zone also holds Worker records for other projects whose names start with `content-factory`. Leave them alone.
- Always Use HTTPS on. A redirect rule sends `https://jackzhaojin.com/*` to `https://www.jackzhaojin.com/*` (301).
- HTML is cached about 10 minutes, assets and 404s up to 4 hours.

### Project sites

GitHub Pages serves every project site of the account under the user site's custom domain. Checked 2026-10-24 with `gh api repos/jackzhaojin/<repo>/pages` and curl:

| Repo | Pages source | Build | www status |
|---|---|---|---|
| adapt-to-2026-demo | main `/docs` | legacy | 200 |
| bruce-hackathon-2026-09-12 | main `/` | legacy | 200 |
| bruce-play-ten | main `/` | legacy | 200 |
| bruce-lava-dash | main `/` | workflow | 200 |
| denison-2026-04-24 | main `/` | workflow | 200 |
| ai-sandbox | main `/` | workflow | 200 |
| harness-v2-test | feature/dashboard-mvp `/` | workflow | 200 |

None has its own custom domain.

## The trap

While `jackzhaojin.github.io` carries the `CNAME` file, GitHub answers every `https://jackzhaojin.github.io/*` request with a 301 to `http://www.jackzhaojin.com/*` (checked with curl on 2026-10-24). A Worker that fetches project sites from `jackzhaojin.github.io` would loop back through Cloudflare.

## Target

Keep the `CNAME` file, the GitHub Pages user site and the `www -> jackzhaojin.github.io` DNS record as they are. Add one Worker on the route `www.jackzhaojin.com/*`:

```
request path is /<repo> or starts with /<repo>/, for a repo in the allowlist
    -> fetch(request)       the zone's own origin: GitHub Pages, with Host www.jackzhaojin.com, as today
everything else
    -> EDS origin main--<repo>--jackzhaojin.aem.live, following aem.live's Cloudflare setup
```

What this gives:

- The main site stops being served from GitHub, because no request for it reaches GitHub. `jackzhaojin.github.io/*` keeps 301ing to www, so old github.io deep links land on EDS.
- Project sites are served exactly as today. A new one is one line in the allowlist.
- Rollback is removing the Worker route: requests fall through to GitHub Pages again.
- The `CNAME` file stays load-bearing, now for the project sites, so the rule in `CLAUDE.md` still holds.

Implementation notes:

- Take the EDS half from `adobe/aem-cloudflare-prod-worker` (`src/index.mjs`) and aem.live's Cloudflare setup page. Fetch it at build time; do not write it from memory. Its details (headers, query-string stripping, the `/drafts/` 404) are in [best-practices.md](best-practices.md) § 6.
- The project-site check runs before any of the template's logic, so project sites keep their query strings and paths untouched.
- The allowlist matches `/<repo>` and `/<repo>/...` but not `/<repo>-something`.
- The Worker, its allowlist, a unit test over the route table and the wrangler config live in `edge/` in the EDS repo, listed in `.hlxignore` (decided 2026-10-24). wrangler deploys from there, so the dashboard never holds hand-edited code.
- Routes: the staging route can live in the wrangler config. The www route is added in the dashboard through the built-in browser at cutover, so no `wrangler deploy` can switch production by accident.
- Push invalidation: EDS purges the Cloudflare cache on publish. It needs the zone ID and an API token with Cache Purge on this zone, set in the EDS site config. Jack creates and stores the token. On a non-Enterprise plan every publish purges the whole zone, project sites included; they refill from GitHub on the next request.
- EDS must serve, before cutover: `google57906613577fdd42.html`, `BingSiteAuth.xml`, `robots.txt`, `sitemap.xml`, `llms.txt`, a 404 page, `favicon.ico`, and GA4 in `consented.js` per README decision 9 (no longer first in `<head>`).
- The hostname does not change, so the Search Console URL-prefix property and the GA4 data stream keep working.
- Unknown paths that are not in the allowlist get the EDS 404. That includes `/design-systems/2026-09-13/`, which is not migrated.

## Staging

Staging is `next.jackzhaojin.com` (decision 12), with the same Worker. Its DNS entry is a proxied placeholder record, Cloudflare's usual pattern for a Worker-only hostname. On staging, `fetch(request)` has no GitHub origin to reach, so the project-site branch fetches `https://www.jackzhaojin.com/<path>` instead. Make that one config value (`PROJECT_ORIGIN`: passthrough on www, the www URL on staging). It works before cutover and after.

Run `scripts/check-site.sh` against staging (its `SITE` value is hard-coded to www today, so it needs a way to point at staging) along with the redirect table in `docs/site-operations.md` and a 200 check on every project site.

## Cutover, as done (2026-10-26)

Done at about 15:12 ET from another Claude session, **route-first**: the steps below weren't followed in order. It was validated afterwards from the www-eds session. Record: www-eds `ai-docs/2026-10-26-cutover/`.

- **The switch:** the top-level Worker `www-eds-edge` was deployed with `PUSH_INVALIDATION=disabled` (version `fa323e37`; the var is now in `edge/wrangler.toml`). Then the route `www.jackzhaojin.com/*` was added in the dashboard, as a Route, not a Custom Domain.
- **Step 4 (push invalidation) is still open.** Until the Cache Purge token is in the site config, the override keeps aem.live's cache times short.
- **GitHub Pages was not moved** (decision 19 as written): this repo keeps `CNAME` `www.jackzhaojin.com`. `PROJECT_ORIGIN = "passthrough"` sends the 7 project sites to it, and gh.jackzhaojin.com mirrors the old site from it.
- **Verified:**
  - `check-host.mjs` passes on www, gh and eds;
  - all 7 project sites answer 200 on www, and their slashless URLs redirect;
  - the apex and jackzhaojin.github.io redirect to www;
  - all 35 sitemap pages carry the same SEO tags as the original;
  - the stardust sweep compared www with gh.
- **Still open:** step 6's GA4 and Search Console checks, step 7 (`docs/site-operations.md`), and step 8's README in this repo.
- **Rollback:** remove the www route (Workers & Pages > www-eds-edge > Domains). GitHub Pages never stopped serving www's origin.

## Cutover order

1. EDS site published on aem.live; QA passed in both themes.
2. Root files above served by EDS.
3. Worker deployed on staging; every route checked, project sites included.
4. Push invalidation configured.
5. Worker route `www.jackzhaojin.com/*` added. This is the switch.
6. Verify: redirect table, project sites 200, a sample of EDS pages, GA4 real-time hits, Search Console fetch of the home page.
7. Rewrite `docs/site-operations.md` for the new request path and the GA4 change (decision 9), in the EDS repo.
8. Keep `jackzhaojin.github.io` with `CNAME` and Pages on, and its main-site files as the rollback with no deadline (decision 19). Add a `README.md` there (the repo has none today). It notes that the main site moved to EDS, that the repo now serves the project sites under www, and that `CNAME` must stay. Then confirm `CNAME`, the `jackzhaojin.github.io/*` 301 to www, and a 200 from every project site.

Rollback at any point after step 5: remove the www Worker route, then purge the cache.

## Built-in browser stage

The goal prompt includes Cloudflare configuration through the built-in browser. Limits that stage has to respect:

- Jack signs in to Cloudflare in the built-in browser and runs `wrangler login`. The agent does not sign in or handle credentials.
- wrangler deploys the Worker code. The browser covers the rest: the staging DNS record, the www route, push-invalidation settings, cache purges and verification.
- The agent pauses for Jack's OK before each change: the staging DNS record, each Worker deploy, each Worker route, the push-invalidation settings, a cache purge. Reading settings, testing URLs and reading Worker logs need no approval.
- Jack creates the Cache Purge API token and stores it where the EDS config step reads it. The agent does not type tokens into any field.
- The www route (cutover step 5) is its own approval, after Jack has seen staging.
