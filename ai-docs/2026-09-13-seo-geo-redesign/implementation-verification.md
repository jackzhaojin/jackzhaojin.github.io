# v3 implementation and verification

Date: 2026-09-14. v3 implementation; commit, push and live verification authorized in the follow-up request. No hosting configuration change.

## Delivered

- All five canonical public pages use shared v3 tokens, base styles and components: Home, Technical Writing, Portfolio, Talks and Certifications.
- Shared static navigation and footer, with Light / Dark / System applied before styles load. The footer contains LinkedIn and GitHub profile links. No booking or Follow the work controls.
- Portfolio retains all 11 chapter IDs, original diagrams and project content, a continuous page, timeline, chapter links, image viewer and diagram tabs. Colors now follow the same v3 palettes in light and dark. Scroll reveals no longer hide readable content.
- Writing is empty with a migration notice. No LinkedIn article cards or artificial entries. Listing filters are deliberately absent until real writing is published.
- Certifications retain all 22 original credential verification destinations and earned/renewed/expiry text. Remote badge artwork has a readable issuer fallback while loading or unavailable.
- Talks are separate from credentials and contain six records. Official event sources replace the provisional adaptTo title and support the Columbus AI Week dates; no guessed exact adaptTo date or invented recording URL.
- Each canonical page has its own title, description, canonical and social metadata, plus JSON-LD linking its content to the same Person identity. A shared local social image is provided.
- sitemap.xml lists only the five canonical routes. robots.txt, CNAME, .nojekyll, GA4 and Search Console verification remain intact. llms.txt is a curated optional index, not a ranking claim.
- blogs.html and certifications.html are v3 compatibility pages with canonicals to the new collections. They serve HTTP 200, not a fabricated server redirect. 404.html has the v3 shell and noindex.
- Publishing and operations docs describe current routes, content rules and deployment checks. Historical design plans now identify the superseding production decisions.
- Four 2025 articles were read and ranked for a 2026 refresh. The shortlist includes source-specific technical corrections and current Adobe/Microsoft references. No articles were automatically republished.

## Verification evidence

`python3 scripts/check-local.py --url http://127.0.0.1:8080` checks all eight routes, the exact canonical sitemap set, GA placement and verification artifacts, JSON-LD parsing and identity, one H1/main per page, local resources and fragment destinations, absence of LinkedIn content destinations, v3 assets, and credential/talk/chapter counts. It also verifies that Writing contains no article placeholders. All passed.

`node --check js/site.js`, `node --check portfolio/script.js`, `bash -n scripts/check-site.sh`, and `git diff --check` passed.

Browser review: Home, Writing, Talks, Certifications and Portfolio were rendered at desktop and 390px phone width, including light and dark states. No document overflow was observed in the checked layouts. Tested explicit Dark, explicit Light, System matching the current OS preference, preference persistence between routes, menu open/close, Escape focus return, chapter navigation, ten timeline bars, ten chapter rail links, diagram tab selection with one visible panel, and the image viewer opening/closing. No browser console errors appeared in the checked portfolio interactions. Issuer labels cover remote badge loading; the final browser view also loaded the badge art.

The three linked GitHub project sites (`/bruce-lava-dash/`, `/bruce-play-ten/`, `/ai-sandbox/`) are separate deployments. Their existing live endpoints returned HTTP 200. They are explicitly identified in the local verifier rather than mistaken for missing files in this repository.

A local portfolio fixture with every script removed retained all 11 chapters and 28,619 characters of main text. No reveal content was transparent. The check found and fixed a hidden-panel cascade conflict: all six diagram panels now display without scripts. At 390px, all four navigation links remained visible, inactive theme controls were hidden, and the document had no horizontal overflow. This fixture checks script-free rendering; it is not a search-engine indexing test.

## Content provenance and limits

Credential data comes from the previous certifications.html, including renewal details that the older shared JSON omitted. Talk sources include the existing public records, the official adaptTo session page and ETA's September 10-11, 2026 agenda. The content refresh shortlist references the exact local article files reviewed.

Portfolio metrics remain historical snapshots, not live totals. Spot checks against local git confirmed: ai-builder-kit 54 commits, conversion-factory-eds 19, continuous-agent 374 and 16 tags, ciam-demo 48, bruce-lava-dash 52, azure-star-generator 24, nextjs-postal-2025-07 89, and ai-sandbox 236 across all refs. The Content Factory's two repos total 317 commits at the end of June snapshot (298 + 19), with 16 core tags. Anima Mesh's count was corrected from 36 to 38 tags reachable from v0.16.2; the unsupported passing-test count was removed. CEA's historical operational figures are recorded in career-blogs/portfolio/story-map-v2.md. This redesign is not a fresh audit of every historic project benchmark or private operational ledger.

## Deployment boundary

The release procedure waits for GitHub Pages to report built for the pushed commit before probing the new URLs, then runs scripts/check-site.sh. See the deployment verification record for the live outcome. Live Google indexing, rich-result eligibility, AI citations, CDN bot behavior and production analytics cannot be established by a local build. Optional server-side 301 redirects require a separate hosting change; current compatibility pages keep old addresses usable.

## Release preflight

The follow-up visual pass checked every core page in Light and Dark, plus phone layouts. Corrected the Certifications introduction spacing and portfolio diagram header contrast; reserved intrinsic dimensions for all 21 static portfolio images so image loading does not shift chapter destinations. Bumped the shared production stylesheet to v4. Checked all five routes in both themes for document overflow and computed RGB text contrast against ancestor backgrounds. No remaining failures in those checks; decorative outlined numerals, CSS color-mix values and gradient overlays were assessed visually rather than treated as numeric contrast proof. Keyboard diagram tabs exposed one selected panel, mobile Escape restored menu focus, chapter navigation landed below the header, and the carousel advanced to 2 / 3.
