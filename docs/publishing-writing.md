# Publishing Technical Writing

The site is plain HTML/CSS/JavaScript. There is no build step. All published writing must be readable on this domain before it appears in the listing.

## Current routes

- Home: index.html
- Writing: writing/index.html
- Portfolio: portfolio/index.html, one continuous page with stable chapter anchors
- Talks: talks/index.html
- Certifications: certifications/index.html
- Old blogs.html and certifications.html: v3 compatibility pages with canonicals pointing to the new collections. Keep their content synchronized until permanent hosting redirects replace them.
- 404.html: v3 error page, noindex

All production pages load the shared design-systems/v3 tokens, base and component styles, then css/site.css. Portfolio layouts also consume v3 tokens through portfolio/styles.css. js/site.js owns the shared three-state theme and mobile menu; portfolio/script.js owns its diagrams, image viewer and timeline.

## Add an article

The bar for anything listed here: a reader learns something they can use, technical or about building with AI. Personal journey, milestone and announcement posts stay on LinkedIn (Jack, 2026-10-03).

1. Create writing/yyyy-mm-dd-descriptive-slug/index.html. The date is the day the page goes live, the same as datePublished and the byline. The first article, writing/2026-09-20-aem-edge-functions-google-sign-in/, keeps its recording-date slug because published URLs never change using the current production head, header and footer. Replace the title, description, canonical and social metadata. Keep the analytics snippet immediately after viewport and the pre-paint theme setup before stylesheets.
2. Write the complete article in semantic HTML: one H1, introduction, useful H2/H3 sections, code or diagrams as needed, limitations, and links to primary evidence. The design system's post template is a visual reference, not publish-ready content.
3. Show Jack Jin as author, the publication date, and a separate update date only when content materially changes. Do not refresh the publication date just to suggest freshness. New writing uses the day the page goes live. Writing migrated from LinkedIn keeps its original LinkedIn post date in the slug, byline and datePublished (Jack, 2026-10-03), with `dateModified` and a visible "Updated" date for the site rewrite, and a plain-text note that it first ran on LinkedIn (never a LinkedIn link). Recording dates of videos stay in the text, away from the byline. Composite client examples must remain identified as illustrative.
4. Use Article structured data with headline, author referencing https://www.jackzhaojin.com/#person, datePublished, dateModified when warranted, and mainEntityOfPage. Use WebPage for the page and BreadcrumbList for Home / Technical Writing / Article. Match schema to actual visible content; do not add fabricated ratings, FAQ sections or reviews.
5. Link to related portfolio chapter anchors, talks or other complete articles when relevant. Keep all content and links in the initial HTML; JavaScript may improve interactions.
6. Add a real title, summary, date and ordinary article link to writing/index.html and keep blogs.html synchronized. Everything listed is writing; a YouTube video is something an article may include, not a separate type. Each row carries `data-date`, `data-topics` (aem, ai-engineering; Working with AI merged into AI Engineering on 2026-10-03), `data-title` and `data-search` (extra search terms, including "video youtube" when the article embeds one), and the first row of each year carries `data-year-mark`. js/writing-filter.js reads those for in-place search, topic and year filters and newest / oldest / title sorting, with shareable fragment state (`#topic=aem&year=2025&q=caching`). Filters never reload or navigate and never generate indexable filter URLs; without JavaScript the bar stays hidden and the full list shows newest first.
7. Update the listing ItemList and its numberOfItems; add the canonical article URL to sitemap.xml, scripts/check-site.sh, and the local check route inventory. Link it from llms.txt if it is a useful entry point.
8. Run python3 scripts/check-local.py and git diff --check. Verify mobile/desktop, keyboard focus, light/dark/system, and the page with scripts unavailable. Check structured data against the visible article and use Schema.org Validator / Google Rich Results Test where appropriate.
9. Publishing requires an explicit commit/push request. Follow site-operations.md: wait for the Pages build to report built before requesting new URLs, then run scripts/check-site.sh.

## Articles with a video

The article is the piece; a video is something it may include. The byline reads `N min read · Includes my mm:ss video`, never "companion to my video". A video in the Writing listing must have a complete written article. The article should explain the material without requiring playback. A raw transcript or short summary is insufficient. Add a verified Watch on YouTube link. If you embed the video, use a real lazy-loaded iframe from youtube-nocookie.com in the initial HTML, not a click-to-load poster: Google does not click, so it cannot detect a video that needs one. Set a custom YouTube thumbnail cut from the recording. In VideoObject use embedUrl and leave out contentUrl, which must point at a media file, never a YouTube watch page. Keep the original recording date separate from the article's dates. Never invent a channel or video URL.

## Search and AI discovery

The primary foundation is crawlable HTML, clear identity, concrete project evidence, appropriate structured data, direct internal links and canonical URLs. llms.txt is an optional curated index, not a promise of ranking or citation. The current robots.txt allows crawlers; this migration does not change model-training permissions or Cloudflare bot settings.

Only canonical indexable pages belong in sitemap.xml. Historical design-system demonstrations, 404.html and compatibility URLs stay out. Google Search Console and GA4 verification artifacts remain in place. Use the primary documentation listed in the review brief and article shortlist when refreshing technical claims.

## Retiring or replacing an article

Published URLs never change. When a newer article supersedes an old one, either keep the old page with a short note at the top linking to the new one, or retire it with a permanent redirect. GitHub Pages cannot send a 301, so redirects are Cloudflare Single Redirect rules (see site-operations.md): add the rule `https://www.jackzhaojin.com/writing/<old-slug>/` to the new URL (301), then delete the old folder, remove it from writing/index.html, blogs.html, sitemap.xml, llms.txt and the check inventories, and update any internal links that pointed at it. Purge the old URL in Cloudflare after the Pages build reports built.

## Talks and their write-ups

Every public talk should end up with a written article. On /talks/, a talk with an article links "Read the write-up"; a past talk still waiting for one shows the "Write-up in progress" status chip. The Talks page is the only place that lists pending write-ups; the Writing page lists finished articles only, with no placeholder pages (Jack, 2026-10-03). When the article ships, swap the chip for the link and add `talk` to the article's manifest so its listing row shows a "Given as a talk at ..." line linking the record (no separate talk filter).
