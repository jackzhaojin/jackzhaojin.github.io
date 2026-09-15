# Page blueprint for the design agent

Brief for whoever designs www.jackzhaojin.com: what each page type contains, in what order, and why. Visual decisions are yours (last section). Tags say who a constraint serves: (H) humans, (S) search engines, (A) AI engines and agents. Push back with reasons; the tag shows whose need is traded. Source: [seo-site-plan.md](seo-site-plan.md).

## Global constraints

- Every slot below ships in the initial HTML; JavaScript may enhance, never supply (S, A: most crawlers and agents never run JS).
- One H1 per page, then H2 and H3 in order, phrased the way people ask (S, A: headings are the extraction map).
- Facts in `<table>`, steps in `<ol>`, lists in `<ul>`, never styled `<div>` grids (A: parsers lift tables and lists verbatim).
- Tabs, accordions and carousels only when the content stays in the DOM (`<details>`, or `hidden` toggled by JS) and the default view shows the answer block, facts table and first section (S, A: hidden content is discounted).
- Breadcrumb directly above the H1 on every page except home, mirroring the URL, with BreadcrumbList JSON-LD (H: location; S: structural links).
- Alt text is one sentence naming what a diagram shows and the entities in it; decorative images get `alt=""`; no fact lives only inside an image (H accessibility; S, A).
- Published and updated dates visible near the H1 (S, A: freshness is weighted heavily).
- Titles and H1s say "Adobe Experience Manager (AEM)", "Edge Delivery Services (EDS)", "DA.live", never "Adobe Experience Cloud" (S: the searched terms).
- One JSON-LD `@graph` in `<head>` per page, with a Person node at `@id` `https://www.jackzhaojin.com/about/#person` referenced everywhere; same name and headshot on every page and profile (S, A: one entity).
- Header: AEM + AI, Blog, Portfolio, Talks, Certifications, About, plus a "Book a talk" button, all real `<a>` (H; S: nav links carry the most weight). Footer: Topics, Sections, Elsewhere, Machine files.
- docs/site-operations.md still applies: gtag first in head, canonical link, sitemap entry (S). Voice per portfolio/CLAUDE.md: plain engineer's voice, no em dashes (H).

## Home `/` (WebSite + Person)

1. H1 "Jack Jin" with one-line positioning (AEM + AI). 2. Answer block, 40 to 60 words: who, what he builds, for whom. 3. Four hub cards, each a link with a one-line description. 4. Latest three posts. 5. One featured project. 6. Credentials strip linking to `/certifications/`. 7. Next and recent talks. 8. Speaking and contact CTA.

Keep the Search Console meta tag (S). The H1 is the name, not a slogan (S, A: entity page).

## Profile `/about/` (ProfilePage + Person)

1. Breadcrumb. 2. H1 "About Jack Jin". 3. Answer-block bio. 4. Headshot, alt is the name. 5. Facts table: role, employer, location, certifications held, speaking topics. 6. Speaker bios at 50, 100 and 200 words. 7. Speaking topics. 8. Past talks linking to `/talks/`. 9. Credentials. 10. Contact section with `id="speaking"`: a mailto; LinkedIn appears as a profile link, not as the contact route. 11. sameAs links: LinkedIn, GitHub, YouTube, Credly.

No form that needs JavaScript to submit (A: agents act through links).

## Topic hub (CollectionPage + ItemList + FAQPage)

1. Breadcrumb. 2. H1 with the topic keyword. 3. Answer block defining the topic in Jack's terms. 4. "Start here": 3 to 5 pieces with a reason each. 5. Counts: posts, videos, projects, talks. 6. H2 sections Projects, Videos, Articles and posts, Talks; each item an `<a>` with title, date and one-line summary. 7. Related hubs. 8. FAQ, 3 to 5 questions.

"Start here" sets differ across hubs (S: no near-duplicates). Lists are static HTML, never fetched (A).

## Collection (`/blog/`, `/videos/`, `/portfolio/`, `/talks/`, `/certifications/`)

1. Breadcrumb. 2. H1. 3. Answer block. 4. Featured intro. 5. Counts by facet in HTML. 6. Filters: topic buttons are links to hubs; media and type toggles are JS with query-string state; sort is JS only. 7. Grid, newest first in source order. 8. Numbered pagination links past 48 items. 9. FAQ.

Certifications is a real `<table>` (name, issuer, issued, expires, status, Credly link) grouped by issuer; presentations move to `/talks/`. Portfolio keeps its `#ch-*` ids on the cards so shared links land (H, S).

## Post detail `/blog/{slug}/` (BlogPosting, plus VideoObject for videos, plus FAQPage)

1. Breadcrumb. 2. H1. 3. Byline: author link, published, updated, read or watch time, media type. 4. Answer block as the first paragraph, no hero image between the H1 and it (A: the first passage gets lifted). 5. Facts table. 6. Body: H2 sub-questions, `<ol>` steps, `<table>` comparisons. Video: embed with a plain watch link, chapter `<ol>` with timestamps, full transcript in the DOM. 7. FAQ, 2 to 4 questions. 8. Related: hub link, 3 to 5 spokes with descriptive anchors; no link that sends the reader to LinkedIn. 9. Author box with credentials and profile links.

The transcript may sit in `<details>` but never behind a fetch (A).

## Project detail `/portfolio/{slug}/` (SoftwareSourceCode, or CreativeWork without a repo)

1. Breadcrumb. 2. H1: project name and what it is. 3. Answer block. 4. Facts table: repo, status, first and last commit, commits, tags, stack, build method. 5. Architecture diagram. 6. Body H2s: what it does, how it is built, what it proved, limitations. 7. Related posts and talks. 8. Optional FAQ.

Every number comes from git or repo docs (H: trust).

## Talk detail `/talks/{slug}/` (Event with performer Person, plus VideoObject when recorded)

1. Breadcrumb. 2. H1 title. 3. Answer block: what the talk argues. 4. Facts table: event, date, city, format, duration, slides, recording. 5. Abstract. 6. Key points `<ul>`. 7. Slides and recording embeds, each with a plain link; transcript in the DOM. 8. Related posts and projects.

## Credential write-up `/certifications/{slug}/` (BlogPosting about EducationalOccupationalCredential)

Same slots as a post, with exam code, issuer, dates, format and prep time in the facts table. Built only with a first-person write-up (S: otherwise thin).

## What this document does not decide

Visual style, typography, spacing, color, iconography, animation, breakpoints and component choice belong to the design skill; the build tool is not chosen here. When a design choice would break a constraint above, say which audience (H, S, A) loses and why, so the plan is amended, not bypassed.
