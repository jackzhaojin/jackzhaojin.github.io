# Design systems, round 2026-09-13

Four candidate design systems for www.jackzhaojin.com, each built from one vendor's design round and rebuilt to a single shared contract so they can be compared on equal terms and one can be chosen for the site rebuild.

## Why four

On 2026-09-13 four tools produced designs for the redesign brief: Claude Design, Codex (Jack calls this round Astra), Kimi K3 and Google Stitch. The review found good ideas in each and the same problems in most: invented facts, dark-only palettes, no real theme control, half-circle glyphs that read as theme toggles, em dashes, and layouts that were never tested wide. Kimi's round shipped a design-system page, which Jack wanted from all of them. So each round became a proper design system under one contract.

## The contract

[SPEC.md](SPEC.md) is the source of truth. In short: three-tier tokens (primitive, semantic, component) with fixed semantic names, light and dark as two token sets with light as the default, a three-state Light / Dark / System control persisted in localStorage and applied before first paint, a fixed component catalog with canonical markup, a documentation site per system with Storybook-style stories per state, three page templates built only from real content in `shared/data/`, and automated quality gates.

Practices the contract follows: the W3C Design Tokens Community Group format 2025.10 for `tokens.json`; one-way token dependencies as in Polaris and Carbon; per-state component stories with docs pages as in Storybook; WCAG AA contrast in both themes.

## The systems

| Folder | Name | Origin round | Character |
|---|---|---|---|
| [claude-fable-5-1/](claude-fable-5-1/) | Claude Fable 5.1 | Claude Design canvas | Editorial field notes, continuous with the current portfolio page |
| [astra/](astra/) | Astra | Codex | Serif display, violet accent, lavender tint panels |
| [kimi-k3/](kimi-k3/) | Kimi K3 | Kimi K3 | Developer editorial, electric blue, square corners, bracketed chips |
| [google-stitch/](google-stitch/) | Google Stitch | Google Stitch | Terminal console, mono headings, lavender primary, extrapolated from one page |

Each folder has the same files: `README.md`, `index.html` (docs site), `tokens.css`, `tokens.json`, `base.css`, `components.css`, optional `scripts.js`, and `templates/home.html`, `templates/post.html`, `templates/blog.html`.

Shared files: `shared/theme.js` (the theme and nav script every system loads) and `shared/data/*.json` (posts, credentials, talks and site facts parsed from the live site on 2026-09-13).

## Compare and evaluate

[index.html](index.html) is the compare page with links and the eval scorecard.

To run the eval from this folder:

```bash
python3 eval/static-check.py
python3 -m http.server 8790 --bind 127.0.0.1 --directory /Users/jackjin/dev/jackzhaojin.github.io &
playwright-cli -s=eval open http://127.0.0.1:8790/ && playwright-cli -s=eval --raw run-code --filename=eval/browser-check.js > eval/results-browser.json && playwright-cli -s=eval close
python3 eval/render.py
```

Results land in `eval/results.md`, `eval/results.json` and on the compare page.

## What these pages are not

They are demo pages: every one carries `noindex`, none is in `sitemap.xml`, and the hub links inside the templates point at the blog template because hub pages are not built yet. The theme default here is light everywhere; the portfolio page will use `data-theme-default="system"` when the chosen system is applied to the site.

## Status

Round created 2026-09-13. All four systems built and evaluated the same evening: 130 of 130 static checks each, no overflow at 390 to 2560 px, centered at wide widths, theme control passes (light default, dark persists, System follows the OS), AA contrast on every token pair in both themes, and every template reads with JavaScript disabled. See [eval/results.md](eval/results.md).

Open items the builders raised, for Jack:

- The AEM + AI hub is curated per post and the membership is not in the shared data yet. Each system marks a provisional set; confirm or edit it.
- Email address, YouTube channel and Credly profile links are bracketed placeholders until supplied.
- JSON-LD is not in the templates because the head contract fixes the head; add it when the chosen system is applied to real pages.
- Claude Fable 5.1 wraps its phone header to two rows to keep the theme control visible; Google Stitch hides the Book a talk button under 480 px instead. Pick one behaviour for the site.

Decision pending Jack's review of the four.
