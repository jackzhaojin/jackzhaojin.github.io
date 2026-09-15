# 2025 article refresh shortlist

Reviewed 2026-09-14. These are editorial recommendations, not published articles or completed fact checks. Source repository: /Users/jackjin/dev/career-blogs/LinkedIn2025. The live Writing collection intentionally remains empty.

## Recommended order

| Priority | Original | Proposed 2026 treatment | Work required |
| --- | --- | --- | --- |
| 1 | Why AEM Headless Makes Sense When Frontend Teams Lead the Way (May 28) | Choosing AEM headless when your frontend team owns the experience | Keep the team-ownership decision. Add a current REST/OpenAPI vs GraphQL delivery comparison, separate content modeling from editor instrumentation, and verify preview, cache and localization examples. |
| 2 | Enabling Agentic AI Agents with Azure Proper Role-Based Access Control (June 12) | Azure identity for AI development: local tools, workloads and CI/CD | Correct the role matrix before reuse. Separate management-plane Contributor from blob data roles; scope identities to actual operations; re-test credential-chain behavior. Treat the old Codex secret limitation as a dated observation, not a current product capability claim. |
| 3 | Making Sense of 7 AEM Capabilities (June 4) | How to choose an AEM authoring and delivery architecture in 2026 | Rebuild the matrix around independent decisions: content store, authoring UI, delivery API, frontend ownership and operations. Add DA.live; recheck legacy SPA patterns and Universal Editor integrations. Avoid treating seven combinations as an exhaustive product catalog. |
| 4 | How Adobe EDS Stacks Up Against the Modern Web (June 8) | Edge Delivery Services in an enterprise architecture: strengths and tradeoffs | Substantial rewrite. Preserve the authoring and delivery perspective; remove unsupported absolutes such as no runtime errors, nothing to break, foolproof, and first enterprise-ready edge CMS. Separate native features from integrations and authoring-provider differences. |

## Source files actually reviewed

- LinkedIn2025/list.md: publication index and dated engagement snapshots. These are historical records, not current analytics measurements.
- LinkedIn2025/2025-05-28-aem-headless-frontend/actual-blog.md
- LinkedIn2025/2025-06-12-agentic-ai-series-1-auth-and-cicd/2025-06-12-actual-blog.md
- LinkedIn2025/2025-06-04-7-aem-offerings/2025-06-04-actual-blog.md
- LinkedIn2025/2025-06-08-adobe-eds-cms-shift/2025-06-08-actual-blog.md

The AEM drafts contain composite/fictitious client scenarios. Retain a clear distinction between illustrative scenarios and verified project results. Do not turn those passages into personal client case studies or quantified outcomes.

## Current documentation that changes the rewrite

### AEM headless

Adobe's documentation, updated June 5, 2026, describes both Content Fragment Delivery with OpenAPI and GraphQL. It separates delivery APIs from management APIs and identifies deprecated Content Fragment support in the Assets HTTP API. The old articles' GraphQL-first explanation needs that additional choice and API-lifecycle context. [Adobe API overview](https://experienceleague.adobe.com/en/docs/experience-manager-cloud-service/content/headless/apis-headless-and-content-fragments).

### Azure role assignments

Microsoft distinguishes resource management from blob data access. The 2025 article repeatedly assigns Contributor while discussing data operations; the new version should state the required data role for each operation and identity. For example, its blob-access discussion needs Storage Blob Data Reader or Storage Blob Data Contributor as appropriate, with deliberately scoped access. [Microsoft blob access documentation](https://learn.microsoft.com/en-us/azure/storage/blobs/assign-azure-role-data-access).

### EDS authoring and delivery

The current Adobe docs describe multiple authoring choices, including Document Authoring, Universal Editor, Microsoft Word and Google Docs. The original comparison primarily equates EDS authoring with Word/Docs. Rework that distinction, and explain the delivery architecture using the Content Bus, Media Bus and Code Bus rather than broad claims that all pages render dynamically at the edge. [Adobe authoring FAQ](https://www.aem.live/docs/faq), [EDS architecture](https://www.aem.live/docs/architecture), [Document Authoring](https://docs.da.live/about).

## Suggested first article outline

Working title: Choosing AEM headless when your frontend team owns the experience.

1. The decision: existing frontend investment, structured content needs, and author expectations.
2. When headless fits and when a simpler authoring/delivery model is enough.
3. Content Fragment delivery choices: GraphQL persisted queries and OpenAPI.
4. Preview and in-context editing: what the frontend must implement.
5. Caching, localization, authorization, and model changes as operational decisions.
6. A small proof of concept with explicit acceptance criteria for both authors and developers.
7. What changed since the May 2025 version, with dated references.

No invented benchmark, unsupported recommendation, fabricated experience, or untested configuration should be added to fill a section. Keep publication and update dates distinct. A substantive 2026 rewrite can identify its original 2025 source without linking readers back to LinkedIn.
