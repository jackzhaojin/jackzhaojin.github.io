# Design systems

Design systems for www.jackzhaojin.com. The site has had two looks so far and is getting a third that covers every page.

| Version | What | Where | Status |
|---|---|---|---|
| v1 | The original site: home, blogs and certifications pages, one stylesheet, Font Awesome icons | `/index.html`, `/blogs.html`, `/certifications.html`, `/css/` (since 2025-04-01) | Live; replaced page by page as v3 ships |
| v2 | The portfolio: dark, long-scroll project log with full-bleed chapter bands and its own tokens | `/portfolio/` (since 2026-07-25) | Live; restyled in place under v3 |
| v3 | One system for the whole site, light and dark, built from the 2026-09-13 candidates | [v3/](v3/) | v3 0.1.0 built 2026-09-14 on the Claude Fable 5.1 base; in review |

v1 and v2 are not recreated here. They stay where they are used and are listed so v3 can be traced back to them.

## Folders

- [v3/](v3/): the system being built for the whole site. `PRODUCT.md` holds the product truth, the README holds the lineage, the planned file set and the order in which the rest of the site moves to v3 with search and AI citation in mind.
- [2026-09-13/](2026-09-13/): the candidate round. Four systems built to one contract (`SPEC.md`) from the Claude Design, Codex (Astra), Kimi K3 and Google Stitch design rounds, with shared data and theme script, an automated eval, and a compare page. v3 takes its contract, shared files, eval and base from here.

Pages under this folder are demos. They carry `noindex` and are not listed in the sitemap.
