# Site operations: hosting, analytics, search

How www.jackzhaojin.com is served, measured, and kept visible to Google, and how to keep all of that working. Written for both people and AI agents. If you change anything described here, update this file in the same commit.

Quick verification of everything below, run from the repo root after any push:

```bash
./scripts/check-site.sh
```

## At a glance

| Concern | Where it lives | Value |
|---|---|---|
| Source | this repo, branch `main`, root folder | plain HTML, no build |
| Hosting | GitHub Pages | site type "legacy", builds on every push to `main` |
| Custom domain | `CNAME` file at repo root | `www.jackzhaojin.com` |
| DNS, TLS, redirects, CDN | Cloudflare zone `jackzhaojin.com` | proxied ("orange cloud") |
| Analytics | Google Analytics 4 | Measurement ID `G-ZVENE6BXTJ` |
| Search | Google Search Console | URL-prefix property `https://www.jackzhaojin.com/` |
| Crawl hints | `robots.txt`, `sitemap.xml`, canonical links | in this repo |

Both Google products are owned by Jack's personal Google account, in a personal Analytics account named "Jack Jin". They are deliberately not under any company account.

## Request path

```
browser
  -> Cloudflare edge (TLS termination, http->https redirect, apex->www redirect, cache)
    -> GitHub Pages origin (serves the files in this repo)
```

Consequences of Cloudflare sitting in front:

- GitHub never sees the real hostname's certificate request, so the "Enforce HTTPS" toggle in the repo's Pages settings is greyed out and `https_enforced` stays `false`. That is expected. TLS is Cloudflare's job here.
- Cloudflare caches responses, including 404s. See Troubleshooting before you conclude a deploy is broken.

## GitHub Pages

- Settings: Pages source is branch `main`, folder `/`. Custom domain is driven by the `CNAME` file. Do not delete `CNAME`; removing it resets the custom domain.
- Every push to `main` triggers a build (about 40 seconds). Check status with:

  ```bash
  gh api repos/jackzhaojin/jackzhaojin.github.io/pages/builds/latest --jq '.status, .commit, .error.message'
  ```

- Wait for `built` before loading any new URL in a browser or curl. Loading a new path before the build finishes lets Cloudflare cache a 404 for that path (see Troubleshooting).
- `jackzhaojin.github.io` still resolves and 301s to the custom domain.
- The empty `.nojekyll` file at the repo root turns Jekyll off. Without it, Pages runs Jekyll on every build and converts any file that opens with YAML front matter (`---`) into a themed `.html`, so the original file 404s. That is how `design-systems/v3/DESIGN.md` went missing on 2026-09-14. Keep `.nojekyll`; a file with front matter is fine once it is there.

## Cloudflare

Dashboard: cloudflare.com, zone `jackzhaojin.com`. Only two records belong to this site; the zone also carries Worker records for other projects (names starting `content-factory`). Leave those alone.

| Type | Name | Content | Proxy | Purpose |
|---|---|---|---|---|
| A | `jackzhaojin.com` | `192.0.2.1` | proxied | placeholder so the apex resolves; traffic never reaches this IP because a redirect rule sends it to www |
| CNAME | `www` | `jackzhaojin.github.io` | proxied | the real site |

Settings that matter:

- **SSL/TLS > Edge Certificates > Always Use HTTPS: on** (enabled 2026-09-13). Redirects every `http://` request on the zone to `https://`. Before this was on, `http://jackzhaojin.com/` returned a 522 because the apex redirect rule only matched HTTPS and the request fell through to the placeholder IP.
- **Rules:** a redirect rule sends `https://jackzhaojin.com/*` to `https://www.jackzhaojin.com/*` (301). Together with Always Use HTTPS the full chain is `http://apex -> https://apex -> https://www`.
- **Cache:** HTML is cached about 10 minutes (`cache-control: max-age=600` from GitHub). Static assets and 404 responses can be cached up to 4 hours. `?cb=<anything>` on a URL bypasses the cached copy because the query string changes the cache key. "Purge Everything" under Caching > Configuration clears it all.

Expected redirect behaviour (the check script tests exactly this):

| Request | Response |
|---|---|
| `http://www.jackzhaojin.com/` | 301 to `https://www.jackzhaojin.com/` |
| `http://jackzhaojin.com/` | 301 to `https://jackzhaojin.com/`, then 301 to `https://www.jackzhaojin.com/` |
| `https://jackzhaojin.com/` | 301 to `https://www.jackzhaojin.com/` |
| `https://www.jackzhaojin.com/` | 200 |

## Google Analytics 4

- Account "Jack Jin" (personal) > property "jackzhaojin.com" > web data stream "jackzhaojin.com web" for `https://www.jackzhaojin.com`. Measurement ID `G-ZVENE6BXTJ`. Enhanced measurement is on (page views, scrolls, outbound clicks, site search, video, file downloads).
- Reporting time zone America/New_York, currency USD.
- The tag is the standard gtag.js snippet, placed in `<head>` directly after the viewport meta so it is the first script on the page. It is present in all four pages: `index.html`, `blogs.html`, `certifications.html`, `portfolio/index.html`.

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZVENE6BXTJ"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-ZVENE6BXTJ');
</script>
```

- Every new page must carry the same snippet. There is no shared include for the head (the footer include in `js/includes.js` runs after DOM load, which is too late for a tag).
- To confirm a page is reporting: open it, then in DevTools > Network filter on `collect`. A request to `google-analytics.com/g/collect` with `tid=G-ZVENE6BXTJ` and `en=page_view` means the hit went out. GA > Reports > Realtime shows it within a minute. Standard reports lag by 24 to 48 hours.
- The GA property is linked to the Search Console property (GA Admin > Product links > Search Console links), so Search queries show up inside GA under Reports > Search Console.

## Google Search Console

- Property type: URL prefix, `https://www.jackzhaojin.com/`. It covers exactly that origin, which is fine because every other form of the address 301s to it.
- Verified three independent ways. Any one of them keeps the property verified, so do not remove any of them:
  1. HTML file `google57906613577fdd42.html` at the repo root (body is one line: `google-site-verification: google57906613577fdd42.html`).
  2. Meta tag in `index.html`: `<meta name="google-site-verification" content="6FfUrqzAd1GDf35t2W1QHz-2rIbSjVTKzuZwWQKJjqw" />`.
  3. The Google Analytics tag above, because the same Google account has edit rights on the GA property.
- `sitemap.xml` is submitted and reads "Success". Search Console re-reads it on its own schedule; after adding pages you can resubmit it under Indexing > Sitemaps, or use URL Inspection > Request indexing for a single page.
- Optional upgrade not done yet: a Domain property (`jackzhaojin.com`) would cover every subdomain and protocol, but needs a DNS TXT record in Cloudflare. The URL-prefix property is enough while everything redirects to www.

## Crawl and share metadata in the repo

| File or tag | Rule |
|---|---|
| `robots.txt` | allows everything, points at the sitemap. |
| `sitemap.xml` | one `<url>` per page with a `<lastmod>` date (YYYY-MM-DD). Update `lastmod` when a page changes materially; add an entry for every new page. |
| `<link rel="canonical">` | every page declares its own `https://www.jackzhaojin.com/...` URL. |
| Open Graph / Twitter tags | `blogs.html` has them; the URLs use `www.jackzhaojin.com`, not `jackzhaojin.github.io`. |

## Checklists

**Adding a page**

1. In `<head>`, right after the viewport meta, paste the gtag snippet from the Analytics section.
2. Add `<link rel="canonical" href="https://www.jackzhaojin.com/<path>">`.
3. Add a `<url>` entry to `sitemap.xml` with today's date.
4. Add the path to the `PAGES` array in `scripts/check-site.sh`.
5. Push, wait for the Pages build to report `built`, run `./scripts/check-site.sh`.
6. Optional: Search Console > URL Inspection > Request indexing.

**Changing an existing page**

- Bump its `<lastmod>` in `sitemap.xml` if the content change is meaningful.

**Replacing the Measurement ID** (only if the GA property is recreated)

- Change it in the four HTML files, in `scripts/check-site.sh` (`GA_ID`), in `CLAUDE.md`, and in this file. `grep -rn "G-" --include=*.html --include=*.sh --include=*.md .` finds every spot.

**Moving to a different hostname**

- `CNAME` file, Cloudflare DNS, the canonical and Open Graph URLs, `sitemap.xml`, `robots.txt`, the GA data stream URL, a new Search Console property, and `SITE` in the check script.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Site unstyled or images missing right after a deploy, but the repo is correct | A URL was requested before the Pages build finished and Cloudflare cached the 404 | Confirm with `?cb=1` on the asset URL. Then either wait out the cache, purge in Cloudflare, or version-stamp the asset URL in the HTML (`styles.css?v=N`). |
| Search Console sitemap shows "Couldn't fetch" | Normal for the first minutes after submission | Reload the Sitemaps page later; it flips to "Success". If it stays for a day, curl the sitemap URL and check it returns XML with a 200. |
| GA shows "No data received" | Standard reports lag up to 48 hours, or the tag is missing | Check Realtime first, then run the check script (section 3). |
| Search Console says the property is no longer verified | Verification file or meta tag was removed | Restore them from git history; both are load bearing. |
| `http://jackzhaojin.com/` returns 522 | Always Use HTTPS got switched off in Cloudflare | Turn it back on under SSL/TLS > Edge Certificates. |
| Pages build `errored` | Usually a bad `CNAME` or a file GitHub refuses to publish | `gh api .../pages/builds/latest --jq .error.message` has the reason. |
| GitHub Pages settings show "Enforce HTTPS" unavailable | Cloudflare proxy hides the origin from GitHub's certificate check | Not a problem; leave it. |

## Change log

- **2026-06-14** Custom domain `www.jackzhaojin.com` configured via `CNAME`; Cloudflare in front.
- **2026-09-13** Google Analytics 4 property created under the personal "Jack Jin" account and tagged on all pages (`G-ZVENE6BXTJ`). Search Console property added and verified by file, meta tag, and GA; `sitemap.xml` and `robots.txt` added and the sitemap submitted; canonical links added; Open Graph URLs moved off github.io; GA linked to Search Console. Cloudflare "Always Use HTTPS" turned on, which also fixed the HTTP 522 on the apex. `scripts/check-site.sh` added. Commits 05c2e7c, a4209a8, 3476858 plus this documentation commit.
- **2026-09-14** `.nojekyll` added at the repo root after Jekyll converted `design-systems/v3/DESIGN.md` (YAML front matter) into a themed `DESIGN.html` and the `.md` 404ed. Design system demo pages (`/design-systems/2026-09-13/`, `/design-systems/v3/`) are live as noindex pages and listed in `NOINDEX_PAGES` of `scripts/check-site.sh`.
