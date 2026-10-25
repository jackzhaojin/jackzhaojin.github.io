# Open questions

This is the one home for open questions in this folder. Each has a recommendation; an answer replaces it with the date, and answered questions move to the Decisions list in [README.md](README.md). Facts to check in the first spike are a separate list: [best-practices.md](best-practices.md) § 9.

## Answered

The first round (12 questions, written 2026-10-25) was answered the same day and became README decisions 9 to 20:

- GA4 and consent
- trailing slashes
- library source
- names
- build shape
- git
- stardust run mode
- design approvals
- AI writing
- dark mode
- the old repo
- staying current

## Open

### 1. Which path stardust's own deploy uses

Decision 17 has `jack-technical-writing` always write through the Experience Workspace MCP server. Stardust's `deploy` and `rollout` write migrated pages through the DA Source API (`deploy-batch.mjs`). Its resumable ledger, its delivered-page check, and the editability and content gates run on that path.

- (a) Stardust keeps the Source API for the pages it migrates. `jack-technical-writing` uses MCP for everything it writes: new articles, rewrites, touch-ups.
- (b) The migration also goes through MCP. The ledger and gates are then rebuilt or run separately on each page.

Recommendation: (a). The two tools do different jobs. Stardust moves 34 existing pages under its gates; the skill authors new content inside Experience Workspace, which is what the demo shows.

### 2. How the parallel phase runs

Decision 13 keeps the initial build single-threaded and runs only blocks, templates and the block library in parallel.

- (a) The main session spawns one subagent per block group or template. Each pulls with rebase, commits and pushes to the EDS repo's main.
- (b) One Claude Code session per group, which Jack can open and steer.

Recommendation: (a), which keeps it simple. Disjoint file ownership ([workstreams.md](workstreams.md)) keeps pushes to main from colliding.
