# v3 content plan

Written 2026-09-14 from Jack's direction. A planning document: it lives with the other redesign plans under `ai-docs/`, is not linked from the site, and stays out of `design-systems/` so the demo pages carry no strategy. Companion to `design-systems/v3/PRODUCT.md` and to [seo-site-plan.md](seo-site-plan.md) and [seo-page-blueprint.md](seo-page-blueprint.md).

## Rules

1. **The site is the destination.** Never drive readers back to LinkedIn. LinkedIn is an outbound syndication channel and a profile link, nothing more. The site plan and blueprint were updated on 2026-09-14 to match: no "Discuss on LinkedIn" in the related slot, contact is a mailto with LinkedIn as a profile link only. Book a talk still resolves to LinkedIn in `design-systems/2026-09-13/shared/data/site.json` until the email exists; that is an open input, not a design choice. In v3 templates, post cards link to `/blog/{slug}/`, there is no "Watch on LinkedIn" or "Read on LinkedIn", and LinkedIn appears only in the footer Elsewhere list, the author box and `sameAs`.
2. **Old articles migrate as they are.** Full text from career-blogs, original publish date, canonical on this domain. Add only the page anatomy: the answer block (the first passage lifted where it works), facts table, optional FAQ, schema, related links. Dash and formatting cleanup only; no rewrite. Not now.
3. **Good videos are rewritten as new articles.** A refresher and uplift: updated facts, tools and versions, a title that targets a query, a new publish date, the video embedded as an option with a plain link, and one line noting the original video date. Each one is proposed to Jack as a new article before it is written. Ordinary videos get a transcript-based write-up later, or stay as a video entry with a short summary.
   "Good" means: strong engagement in the career-blogs data, fits the AEM + AI, FDE or hub topics, still accurate or worth bringing up to date, and has a lasting query behind it.
4. **Short posts migrate as they are**, like articles. Grouping several into one article is decided per case, later, and only when they share a query.
5. **Syndication runs outward only.** Each new or uplifted article gets a LinkedIn post that points to the site, and a YouTube description link when there is a video.

## Sequencing (ties to steps 3 and 4 in design-systems/v3/README.md)

- Content pipeline first: generator script plus front matter derived from career-blogs.
- Batch A: the 7 articles, as they are.
- Batch B: the 13 short posts, as they are.
- Batch C: video uplifts, one at a time, each proposed as a new article. Start with the ones that map to the top ten target queries in the site plan.
- Remaining videos: transcript write-ups when transcripts exist.

## Videos to rank (from shared/data/posts.json, parsed 2026-09-13)

Mark the good ones. Columns: date, title, topic, type.

| Date | Title | Topic | Type | Good? |
|---|---|---|---|---|
| 2026-08-09 | Adobe Stardust Explained: Design Agent Skills on EDS | aem | technical | |
| 2026-07-21 | Top Models Compared: 4 Frontier Models, 1 Prompt | ai | technical | |
| 2026-06-21 | Patterns of Work: Five Layers of Working with AI | ai | leadership | |
| 2026-05-24 | Theming a Brand-New EDS Site with Google Stitch + MCP | aem | technical | |
| 2026-05-17 | Adobe EDS Skills Hands-On: create-site + content-driven-development | aem | technical | |
| 2026-04-12 | Two AI Skills for Three Team Enablement Objectives | ai | leadership | |
| 2026-03-23 | Agentic AEM Configuration: Building an EDS HLX Admin Skill for Claude Code | aem | technical | |
| 2026-02-05 | Making AI-Driven Development Modules Reusable: Patterns for Agentic Development | ai | technical | |
| 2026-01-29 | AI-Generated Stakeholder Demos with Playwright: My Harness + Agent Builds It, Then Presents It Back to Me | ai | leadership | |
| 2026-01-18 | From Ad-Hoc Prompts to Harnesses to Continuous Running Agents: My AI Architecture and Engineering Evolution | ai | leadership | |
| 2026-01-05 | From Prompts to Harness: Building Two Agentic Systems Over the Holiday Break | ai | technical | |
| 2025-10-12 | Building Agentic AI for EDS and DA.live Content Automation: Testing MCP Servers Across Claude, Gemini, Azure OpenAI, and n8n | aem | technical | |
| 2025-10-05 | Building an MCP Server for EDS DA.live: AI Content Integration with Adobe's Newest AEM Offering | aem | technical | |
| 2025-09-01 | AEM Caching Video: Breaking Down Web Caching in Real Production Architectures | aem | technical | |
| 2025-07-13 | AEM EDS Architecture Video: Making sense of the 3 EDS offerings - 2025 Edition | aem | technical | |
| 2025-07-12 | AEM Architecture Video: 3 Diagrams and 12+ Considerations on AEM Headless and Omnichannel | aem | technical | |
| 2025-07-11 | My Third and Final Video: Scaling AI Coding and Delivery Methodology | ai | leadership | |
| 2025-07-07 | AI-Coded Next.js Agent Part 2: CI/CD, Infrastructure, and Logic Diagram | ai | technical | |
| 2025-07-06 | My First Video: 100% AI-Coded, Public-Facing Next.js Agent (Release 1.0) | ai | technical | |

19 videos.
