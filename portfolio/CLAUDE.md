# Portfolio page working rules

These rules apply to all work on this directory (index.html, styles.css, script.js, assets/).

## Who is writing this page

An engineer. Not a marketer, not a salesperson, not a hype account. The work carries the page; the copy just points at it. Zero cringe. If a sentence would make an engineer reading it wince, delete it. When in doubt, understate.

## Voice: present the work; the work doesn't need exaggeration

- Engineering is the truth. Describe what exists, link to it, stop.
- Link labels name the destination factually: "Summit 2024 post ↗", "v2.1 deck post ↗", "ciam-demo ↗". NEVER triumphal or flourish labels: "The win, posted ↗", "X, published ↗", or any label that celebrates instead of describes.
- No first-mover or gap claims. "My first X" only when literally true and load-bearing.
- No unnecessary anything: no filler adjectives, no drama in dividers or kickers, no self-congratulation dressed as a caption. Every phrase either states a fact or gets cut.
- Honest limitations build credibility and stay in: "since retired", "frozen as the backup", "the git history under-counts this one".
- Plain engineer voice everywhere: labels not poetry, no editorial flourish, no AI-tell words. Short sentences over em-dash constructions in prose.

## Facts

- Every number on the page (commits, tags, dates, scores, run counts) comes from git history, ledgers, or repo docs. Verify in the sibling repos under `/Users/jackjin/dev/` before writing. Never estimate or carry a number forward without checking.

## Page systems

- Link icon types (one per destination): `link-repo` git-branch, `link-live` globe, `link-post` LinkedIn badge, `link-video` play button.
- Build-method labels: `spec-first` / `incremental specs` / `ad hoc` / `dark factory`. Legend lives under the Gantt; each chapter carries one `.method-line` chip. A label must match repo evidence, not aspiration.
- Diagrams follow the shared semantic palette: deterministic blue, agentic red, mixed purple, neutral ink.
- Cache stamps: bump the `?v=` query on styles.css / script.js when they change. Cloudflare caches 404s for ~4h, so never probe a newly added URL before the Pages build finishes.

## Verifying changes

- The reveal animations require a real browser; headless `file://` screenshots render blank. Serve locally:
  `python3 -m http.server <port> --bind 127.0.0.1 --directory /Users/jackjin/dev/jackzhaojin.github.io`
- Verify with Playwright MCP. All Playwright output goes in `.playwright-mcp/` (gitignored), never the repo root.
- Do not commit or push unless Jack explicitly says so.
