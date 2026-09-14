# Prompt: add full-bleed section bands to one design system

Copy this whole file into the agent that owns one system folder. Replace `<slug>` with `astra`, `kimi-k3` or `google-stitch`. The Claude system (`claude-fable-5-1`) is the reference implementation of the contract; read it for the mechanics, not for the look.

---

You are working in the repository at `/Users/jackjin/dev/jackzhaojin.github.io`, inside `design-systems/2026-09-13/<slug>/`. That folder is one of four candidate design systems for www.jackzhaojin.com, all built to the same contract in `design-systems/2026-09-13/SPEC.md`. Read SPEC.md first, in full. Then read `design-systems/2026-09-13/README.md` and your folder's README.md.

## What to add

Jack wants the site to keep the one thing he likes most about the current portfolio page (`portfolio/index.html`, `portfolio/styles.css`): every section is a full-bleed band with its own background, and the bands act as separators. In the portfolio each chapter paints a wash of its accent color behind itself (`.chapter::before`, lines 596 to 605 of portfolio/styles.css), an optional dot motif (`.chapter::after`), a hairline top edge, and a labeled divider between chapters (`.tdiv`, lines 546 to 562), plus one milestone band for the year (`.year-band`, lines 569 to 577). It works best in dark, and it has to work in light too.

SPEC.md section 7 now defines two components for this: **Section band** (`.band` with `.band--plain`, `.band--alt`, `.band--tint`, `.band--inverse`, `.band--milestone` and the optional `.band--dots`) and **Divider** (`.divider`, `.divider__label`). Section 9 says which sections of each template take which band. Section 10 lists the gates. Implement exactly those class names and tokens; the markup contract is shared across all four systems so they can be compared.

## Deliverables, all inside your folder

1. `tokens.css`: add `--band-tint-strong`, `--band-tint-soft`, `--band-tint-edge` (percentages) and `--band-pad` under every theme scope (light, dark, and the system-dark media block), plus matching entries in `tokens.json` in the same DTCG shape the file already uses. Pick light values that read on your light ground without muddying it; the portfolio's dark values are 7%, 4%, 3%.
2. `components.css`: style `.band` and every variant, `.divider` and `.divider__label`, using semantic tokens only. Component tokens that resolve a color must be declared on `:root, [data-theme]`, never on `:root` alone (see the note in SPEC section 10). Inside `.band--inverse`, every component you place there must stay readable: check links, buttons, chips, row lists and the CTA band.
3. `templates/home.html`, `templates/post.html`, `templates/blog.html`: wrap the sections as SPEC section 9 describes. Content does not change. Keep one H1, the heading order, and the skip link. The `.container` stays centered inside each band.
4. `index.html` (your docs site): add `#c-band` and `#c-divider` subsections under `#components`, following the same Storybook pattern as your other components: status badge, when to use it, anatomy, one live story per variant, at least one story inside `<div class="story" data-theme="dark">`, escaped canonical markup, Do and Don't, accessibility, tokens consumed. Add the two entries to the docs navigation. Add a "Section rhythm" subsection to `#patterns` that lists which section of each template uses which band and restates the band rules.
5. `README.md`: add both components to the Components table, describe the band tokens under Tokens, add a Section rhythm note under Templates, and a changelog entry `0.2.0, 2026-09-14`.

## How to test before you report

Serve the repository root and run the shared eval from `design-systems/2026-09-13/`:

```
python3 -m http.server 8790 --bind 127.0.0.1 --directory /Users/jackjin/dev/jackzhaojin.github.io &
python3 eval/static-check.py
playwright-cli -s=eval --raw run-code --filename=eval/browser-check.js > eval/results-browser.json
python3 eval/render.py
```

Your system must pass every static check and every browser gate, including the new band gates. Then open your three templates at 390, 1440 and 2560 in both themes and look: adjacent bands must read as different grounds, the wash must not fight your identity, text must stay crisp, nothing may overflow horizontally. Fix what you see, then rerun.

## Rules

- Keep your identity. The contract fixes class names, tokens and behaviour; the look of the wash, the divider label and the milestone numeral is yours.
- Semantic tokens only in components. No new primitives in components.css.
- Real content only; no invented facts. Bracketed placeholders stay bracketed.
- No unicode dashes anywhere. Use "-".
- No frameworks, no CDN scripts, no build step. `color-mix()` and CSS custom properties are fine.
- Playwright screenshots and snapshots go under `.playwright-cli/<slug>/` at the repository root, never in your folder.
- Do not touch the other three system folders, `shared/`, `eval/` or SPEC.md. If the contract blocks you, write the conflict into your README under Deviations and choose the reading that keeps the gates green.
- Do not commit or push.

## Report back with

- The list of files you changed.
- The static and browser gate results for your system, copied from `eval/results.md`.
- Which sections took which band on each template, and any place you rebalanced from section 9 and why.
- Anything in the contract you found ambiguous or wrong.
