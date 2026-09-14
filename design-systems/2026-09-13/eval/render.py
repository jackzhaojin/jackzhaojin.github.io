#!/usr/bin/env python3
"""Merge eval/results-static.json and eval/results-browser.json into eval/results.md and eval/results.json,
and rebuild the compare page index.html with the scorecard. Run from design-systems/2026-09-13/."""
import json, pathlib, datetime, html
ROOT = pathlib.Path(__file__).resolve().parent.parent
SYSTEMS = [
 ("claude-fable-5-1","Claude Fable 5.1","Editorial field notes, continuous with the portfolio: Playfair Display, Inter, JetBrains Mono, warm neutrals, lavender accent."),
 ("astra","Astra","Serif display with a sans body, violet accent, lavender tint panels and a deep plum feature panel. From the Codex round."),
 ("kimi-k3","Kimi K3","Developer editorial: Inter and IBM Plex Mono, near black on off white, electric blue, square corners, bracketed chips."),
 ("google-stitch","Google Stitch","Terminal console: JetBrains Mono headings, sharp corners, lavender primary with emerald and cyan accents. Extrapolated from one page."),
]
def load(name):
    p = ROOT / "eval" / name
    if not p.exists(): return None
    d = json.loads(p.read_text())
    return json.loads(d) if isinstance(d, str) else d
static = load("results-static.json") or []
browser = load("results-browser.json") or []
smap = {r["slug"]: r for r in static}; bmap = {r["slug"]: r for r in browser}
rows = []
for slug, name, _ in SYSTEMS:
    s = smap.get(slug); b = bmap.get(slug)
    row = {"slug": slug, "name": name}
    row["static"] = f"{s['passed']}/{s['total']}" if s else "not run"
    row["static_fails"] = [f"{c['page']}: {c['check']} {c['detail']}".strip() for c in (s["checks"] if s else []) if not c["pass"]]
    if b:
        ov = [f"{p}@{w}" for p, ws in b["pages"].items() for w, v in ws.items() if v.get("overflow")]
        nc = [f"{p}@{w}" for p, ws in b["pages"].items() for w, v in ws.items() if int(w) >= 1440 and v.get("centered") is False]
        row["overflow"] = "none" if not ov else ", ".join(ov)
        row["centered"] = "yes" if not nc else "no: " + ", ".join(nc)
        t = b.get("theme", {}); row["theme"] = "pass" if t and all(t.get(k) for k in ("defaultLight","clickDark","persists","systemRemovesAttr","systemFollowsDark")) else "fail: " + ", ".join(k for k in ("defaultLight","clickDark","persists","systemRemovesAttr","systemFollowsDark") if not t.get(k))
        cf = [f"{th}: {c['pair']} {c['ratio']}" for th, cs in b.get("contrast", {}).items() for c in cs if not c["pass"]]
        row["contrast"] = "all pairs pass AA" if not cf else "; ".join(cf)
        n = b.get("nojs", {}); row["nojs"] = "pass" if n and all(n.get(k) for k in ("summary","facts","firstSection","nav")) else "fail: " + ", ".join(k for k in ("summary","facts","firstSection","nav") if not n.get(k))
    else:
        for k in ("overflow","centered","theme","contrast","nojs"): row[k] = "not run"
    rows.append(row)
(ROOT / "eval" / "results.json").write_text(json.dumps(rows, indent=1))
stamp = datetime.date.today().isoformat()
md = ["# Eval results, " + stamp, "", "Gates from SPEC.md section 10. Static checks run on the files; browser checks run in Chromium via playwright-cli at 390, 768, 1024, 1440, 1920 and 2560 px.", "",
      "| System | Static checks | Overflow | Centered at 1440+ | Theme control | Contrast AA | No JS |", "|---|---|---|---|---|---|---|"]
for r in rows: md.append(f"| {r['name']} | {r['static']} | {r['overflow']} | {r['centered']} | {r['theme']} | {r['contrast']} | {r['nojs']} |")
md.append("")
for r in rows:
    if r["static_fails"]:
        md.append(f"## {r['name']}: static failures"); md += [f"- {f}" for f in r["static_fails"]]; md.append("")
(ROOT / "eval" / "results.md").write_text("\n".join(md))
# compare page
cards = ""
for slug, name, blurb in SYSTEMS:
    cards += f"""
<article class="sys">
  <h2>{name}</h2>
  <p>{blurb}</p>
  <p class="links"><a href="{slug}/">Design system docs</a> <a href="{slug}/templates/home.html">Home</a> <a href="{slug}/templates/post.html">Post</a> <a href="{slug}/templates/blog.html">Blog</a> <a href="{slug}/README.md">README</a></p>
</article>"""
trs = "".join(f"<tr><th scope=\"row\">{r['name']}</th><td>{r['static']}</td><td>{html.escape(r['overflow'])}</td><td>{html.escape(r['centered'])}</td><td>{html.escape(r['theme'])}</td><td>{html.escape(r['contrast'])}</td><td>{html.escape(r['nojs'])}</td></tr>" for r in rows)
page = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-ZVENE6BXTJ"></script>
<script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){{dataLayer.push(arguments);}}
    gtag('js', new Date());
    gtag('config', 'G-ZVENE6BXTJ');
</script>
<title>Design systems, round 2026-09-13 | Jack Jin</title>
<meta name="description" content="Four candidate design systems for jackzhaojin.com, built to one contract from four vendor design rounds, with automated eval results.">
<link rel="canonical" href="https://www.jackzhaojin.com/design-systems/2026-09-13/">
<meta name="robots" content="noindex">
<style>
:root {{ color-scheme: light dark; --bg:#f7f6f3; --surface:#fff; --ink:#1a1917; --muted:#5a5754; --line:#dcd9d4; --accent:#4b3fb0; }}
@media (prefers-color-scheme: dark) {{ :root {{ --bg:#141414; --surface:#1c1c1b; --ink:#ebe8e4; --muted:#b3afaa; --line:#333; --accent:#c0b3ff; }} }}
body {{ margin:0; background:var(--bg); color:var(--ink); font:16px/1.6 Inter, -apple-system, "Segoe UI", Helvetica, Arial, sans-serif; }}
.wrap {{ max-width:1100px; margin-inline:auto; padding:48px 24px; }}
h1 {{ font-size:32px; margin:0 0 8px; }} h2 {{ font-size:20px; margin:0 0 6px; }}
p {{ margin:0 0 12px; }} .lead {{ color:var(--muted); max-width:70ch; }}
.grid {{ display:grid; grid-template-columns:repeat(auto-fit, minmax(240px, 1fr)); gap:16px; margin:32px 0; }}
.sys {{ background:var(--surface); border:1px solid var(--line); border-radius:8px; padding:20px; }}
.sys p {{ color:var(--muted); font-size:15px; }} .links a {{ margin-right:12px; color:var(--accent); }}
a {{ color:var(--accent); }}
.table-wrap {{ overflow-x:auto; }} table {{ border-collapse:collapse; width:100%; font-size:14px; }}
th, td {{ text-align:left; padding:8px 10px; border-bottom:1px solid var(--line); vertical-align:top; }}
th[scope=row] {{ white-space:nowrap; }}
code {{ font-family: "JetBrains Mono", SFMono-Regular, Consolas, monospace; font-size:13px; }}
</style>
</head>
<body>
<main class="wrap">
<h1>Design systems, round 2026-09-13</h1>
<p class="lead">Four candidate design systems for www.jackzhaojin.com. Each one was built from a different vendor's design round (Claude Design, Codex, Kimi K3, Google Stitch), then rebuilt to one shared contract so they can be compared on equal terms: same token names, same components, same page templates, same three-state theme control, real content only. Read the contract in <a href="SPEC.md">SPEC.md</a> and the round notes in <a href="README.md">README.md</a>.</p>
<div class="grid">{cards}
</div>
<h2>Eval scorecard</h2>
<p class="lead">Automated gates from SPEC section 10, last run {stamp}. Static checks count file-level rules (head contract, tokens, components, dashes, links). Browser checks run at six widths in both themes. Details in <a href="eval/results.md">eval/results.md</a>.</p>
<div class="table-wrap"><table>
<thead><tr><th>System</th><th>Static</th><th>Overflow</th><th>Centered</th><th>Theme</th><th>Contrast</th><th>No JS</th></tr></thead>
<tbody>{trs}</tbody>
</table></div>
<h2>How to evaluate by hand</h2>
<p>Open each docs site, switch the theme control through Light, Dark and System, resize the window from phone width to 2560 px, and read the post template with JavaScript disabled. Then open the three templates side by side across systems. The blueprint the templates follow is in <a href="../../ai-docs/2026-09-13-seo-geo-redesign/seo-page-blueprint.md">seo-page-blueprint.md</a>.</p>
</main>
</body>
</html>
"""
(ROOT / "index.html").write_text(page)
print("\n".join(md))
