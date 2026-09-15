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

1. Create writing/descriptive-slug/index.html using the current production head, header and footer. Replace the title, description, canonical and social metadata. Keep the analytics snippet immediately after viewport and the pre-paint theme setup before stylesheets.
2. Write the complete article in semantic HTML: one H1, introduction, useful H2/H3 sections, code or diagrams as needed, limitations, and links to primary evidence. The design system's post template is a visual reference, not publish-ready content.
3. Show Jack Jin as author, original publication date, and a separate update date only when content materially changes. Do not refresh the publication date just to suggest freshness. Composite client examples must remain identified as illustrative.
4. Use Article structured data with headline, author referencing https://www.jackzhaojin.com/#person, datePublished, dateModified when warranted, and mainEntityOfPage. Use WebPage for the page and BreadcrumbList for Home / Technical Writing / Article. Match schema to actual visible content; do not add fabricated ratings, FAQ sections or reviews.
5. Link to related portfolio chapter anchors, talks or other complete articles when relevant. Keep all content and links in the initial HTML; JavaScript may improve interactions.
6. Add a real title, summary, date and ordinary article link to writing/index.html. Replace the empty state and keep blogs.html synchronized. Introduce in-place topic filtering and sorting as the collection grows. The agreed initial topics are Adobe AEM & EDS, AI Engineering, and Working with AI. Default sorting is newest publication first; also support oldest and title. Filters must not reload or navigate to another page. Use optional fragment state for shareable selections; don't generate indexable filter combinations.
7. Update the listing ItemList and its numberOfItems; add the canonical article URL to sitemap.xml, scripts/check-site.sh, and the local check route inventory. Link it from llms.txt if it is a useful entry point.
8. Run python3 scripts/check-local.py and git diff --check. Verify mobile/desktop, keyboard focus, light/dark/system, and the page with scripts unavailable. Check structured data against the visible article and use Schema.org Validator / Google Rich Results Test where appropriate.
9. Publishing requires an explicit commit/push request. Follow site-operations.md: wait for the Pages build to report built before requesting new URLs, then run scripts/check-site.sh.

## Video companions

A video in the Writing listing must have a complete written companion. The article should explain the material without requiring playback. A raw transcript or short summary is insufficient. Add a verified Watch on YouTube link; an embed is optional and should have a plain-link fallback. Keep the original recording date separate from the article's dates. Never invent a channel or video URL.

## Search and AI discovery

The primary foundation is crawlable HTML, clear identity, concrete project evidence, appropriate structured data, direct internal links and canonical URLs. llms.txt is an optional curated index, not a promise of ranking or citation. The current robots.txt allows crawlers; this migration does not change model-training permissions or Cloudflare bot settings.

Only canonical indexable pages belong in sitemap.xml. Historical design-system demonstrations, 404.html and compatibility URLs stay out. Google Search Console and GA4 verification artifacts remain in place. Use the primary documentation listed in the review brief and article shortlist when refreshing technical claims.
