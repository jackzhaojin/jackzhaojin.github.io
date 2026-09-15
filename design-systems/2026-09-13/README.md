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

Decision made 2026-09-14 after a four-way critique: Claude Fable 5.1 is the base for [design system v3](../v3/), with named pieces from the other three. These four folders stay as built; fixes land in v3.

### 2026-09-14: section bands

Jack wants the site to keep the portfolio page's full-bleed section grounds, in light as well as dark. SPEC.md section 7 now defines a **Section band** component (`.band` with plain, alt, tint, inverse and milestone variants, the portfolio's accent wash and dot motif, per-theme tint tokens) and a **Divider**; section 9 says which sections of each template take which band; section 10 adds the gates (static: classes, `color-mix`, template usage, docs ids; browser: full bleed at three widths, distinct grounds per theme, text and filled-button contrast on tint and inverse bands). The compare page has a Bands column.

Claude Fable 5.1 was built first as the reference implementation. Google Stitch followed the same day (built here, in the console idiom: flat grounds, a sparse dot grid, slash-slash divider labels, a mono milestone numeral; its light faint text token darkened one step so kickers clear AA on a washed ground). Astra was implemented by Codex from the prompt below. Kimi K3 was implemented here after Kimi's run produced nothing (developer-editorial reading: flat grounds, one pixel rules, a restrained wash, graph-paper dots, bracketed divider labels, an Inter milestone numeral). All four now pass every gate. The prompt is [ai-docs/2026-09-13-seo-geo-redesign/section-bands-prompt-2026-09-14.md](../../ai-docs/2026-09-13-seo-geo-redesign/section-bands-prompt-2026-09-14.md).

A defect sweep on 2026-09-14 across all 17 pages in both themes found zero console errors and zero broken requests; it did find duplicate ids in the header and filter-bar stories of three docs pages and story sections with no accessible name, both fixed. The gate parser also learned Chromium's `color(srgb ...)` serialization of `color-mix()` results, which had let one invisible button through.

Also on 2026-09-14: a review of Astra by Codex found cards inside dark story frames rendering light surfaces under dark text; the same defect existed in Google Stitch. Both are fixed (component tokens that resolve a color are now declared on every themed scope), and the eval gained a dark-frame gate. A fidelity review of Claude Fable 5.1 against its canvas is recorded in that system's README.
