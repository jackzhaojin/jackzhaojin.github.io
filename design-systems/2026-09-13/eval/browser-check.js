// Browser quality gates from SPEC.md section 10. Run with:
//   playwright-cli -s=eval --raw run-code --filename=eval/browser-check.js > eval/results-browser.json
// Expects the repo root served at http://127.0.0.1:8790 (python3 -m http.server 8790 --directory <repo root>).
async page => {
  const BASE = 'http://127.0.0.1:8790/design-systems/2026-09-13/';
  const SLUGS = ['claude-fable-5-1', 'astra', 'kimi-k3', 'google-stitch'];
  const PAGES = ['index.html', 'templates/home.html', 'templates/post.html', 'templates/blog.html'];
  const WIDTHS = [390, 768, 1024, 1440, 1920, 2560];
  const PAIRS = [['--color-text','--color-bg',4.5],['--color-text','--color-surface',4.5],['--color-text-muted','--color-bg',4.5],
    ['--color-text-muted','--color-surface',4.5],['--color-text-faint','--color-bg',4.5],['--color-accent','--color-bg',4.5],
    ['--color-on-accent','--color-accent',4.5],['--color-inverse-text','--color-inverse-bg',4.5],['--color-line-strong','--color-bg',3]];
  const out = [];
  const contrastFn = `(() => {
    function parse(c){ c=c.trim(); const m=c.match(/^#([0-9a-f]{3,8})$/i); if(m){ let h=m[1]; if(h.length===3||h.length===4) h=h.split('').map(x=>x+x).join(''); return [parseInt(h.slice(0,2),16),parseInt(h.slice(2,4),16),parseInt(h.slice(4,6),16), h.length===8?parseInt(h.slice(6,8),16)/255:1]; }
      const r=c.match(/rgba?\\(([^)]+)\\)/); if(r){ const p=r[1].split(',').map(s=>parseFloat(s)); return [p[0],p[1],p[2], p.length>3?p[3]:1]; } return null; }
    function blend(fg,bg){ const a=fg[3]; return [fg[0]*a+bg[0]*(1-a), fg[1]*a+bg[1]*(1-a), fg[2]*a+bg[2]*(1-a),1]; }
    function lum(c){ const f=v=>{v/=255; return v<=0.03928? v/12.92 : Math.pow((v+0.055)/1.055,2.4)}; return 0.2126*f(c[0])+0.7152*f(c[1])+0.0722*f(c[2]); }
    return (fgVar,bgVar) => { const cs=getComputedStyle(document.documentElement); const el=document.createElement('div'); document.body.appendChild(el);
      el.style.color='var('+fgVar+')'; el.style.backgroundColor='var('+bgVar+')'; const st=getComputedStyle(el); let fg=parse(st.color), bg=parse(st.backgroundColor); el.remove();
      if(!fg||!bg) return null; const pageBg=parse(getComputedStyle(document.body).backgroundColor)||[255,255,255,1]; if(bg[3]<1) bg=blend(bg,pageBg); if(fg[3]<1) fg=blend(fg,bg);
      const l1=lum(fg), l2=lum(bg); return Math.round(((Math.max(l1,l2)+0.05)/(Math.min(l1,l2)+0.05))*100)/100; };
  })()`;
  for (const slug of SLUGS) {
    const r = { slug, pages: {}, theme: {}, contrast: {}, nojs: {} };
    for (const p of PAGES) {
      const pr = {};
      for (const w of WIDTHS) {
        await page.setViewportSize({ width: w, height: 900 });
        try {
          await page.goto(BASE + slug + '/' + p, { waitUntil: 'load', timeout: 20000 });
          await page.waitForTimeout(300);
          pr[w] = await page.evaluate((w) => {
            const c = document.querySelector('.site-header .container') || document.querySelector('main .container') || document.querySelector('.container');
            const rect = c ? c.getBoundingClientRect() : null;
            const left = rect ? rect.left : null, right = rect ? window.innerWidth - rect.right : null;
            return { overflow: document.documentElement.scrollWidth > window.innerWidth + 1, h1: document.querySelectorAll('h1').length,
              centered: rect ? Math.abs(left - right) <= 2 : null, left, right: right, containerWidth: rect ? Math.round(rect.width) : null };
          }, w);
        } catch (e) { pr[w] = { error: e.message.slice(0, 80) }; }
      }
      r.pages[p] = pr;
    }
    // theme behaviour on home template
    await page.setViewportSize({ width: 1440, height: 900 });
    const home = BASE + slug + '/templates/home.html';
    try {
      await page.goto(home); await page.evaluate(() => localStorage.removeItem('jj-theme')); await page.reload();
      const t = {};
      t.defaultLight = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'light');
      await page.click('[data-set-theme="dark"]'); t.clickDark = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark');
      await page.reload(); t.persists = await page.evaluate(() => document.documentElement.getAttribute('data-theme') === 'dark' && localStorage.getItem('jj-theme') === 'dark');
      await page.click('[data-set-theme="system"]'); t.systemRemovesAttr = await page.evaluate(() => !document.documentElement.hasAttribute('data-theme'));
      await page.emulateMedia({ colorScheme: 'dark' }); await page.reload(); await page.waitForTimeout(200);
      t.systemFollowsDark = await page.evaluate(() => { const bg = getComputedStyle(document.body).backgroundColor; const m = bg.match(/\d+/g); return m ? (parseInt(m[0]) + parseInt(m[1]) + parseInt(m[2])) / 3 < 100 : null; });
      await page.emulateMedia({ colorScheme: 'light' });
      // contrast in both themes
      for (const theme of ['light', 'dark']) {
        await page.evaluate((th) => document.documentElement.setAttribute('data-theme', th), theme);
        await page.waitForTimeout(50);
        r.contrast[theme] = await page.evaluate(([fn, pairs]) => { const c = eval(fn); return pairs.map(([fg, bg, min]) => { const v = c(fg, bg); return { pair: fg + ' on ' + bg, ratio: v, min, pass: v !== null && v >= min }; }); }, [contrastFn, PAIRS]);
      }
      await page.evaluate(() => localStorage.removeItem('jj-theme'));
      r.theme = t;
    } catch (e) { r.theme = { error: e.message.slice(0, 120) }; }
    // no-JS check on post template
    try {
      const ctx = await page.context().browser().newContext({ javaScriptEnabled: false, viewport: { width: 1024, height: 900 } });
      const p2 = await ctx.newPage(); await p2.goto(BASE + slug + '/templates/post.html', { waitUntil: 'load' });
      r.nojs = await p2.evaluate(() => { const vis = sel => { const el = document.querySelector(sel); if (!el) return false; const st = getComputedStyle(el); return st.display !== 'none' && st.visibility !== 'hidden' && parseFloat(st.opacity) > 0.9 && el.getBoundingClientRect().height > 0; };
        return { summary: vis('.summary'), facts: vis('.facts'), firstSection: vis('main h2'), nav: vis('.site-nav'), transcriptInDom: !!document.querySelector('.transcript') }; });
      await ctx.close();
    } catch (e) { r.nojs = { error: e.message.slice(0, 120) }; }
    out.push(r);
  }
  return JSON.stringify(out);
}
