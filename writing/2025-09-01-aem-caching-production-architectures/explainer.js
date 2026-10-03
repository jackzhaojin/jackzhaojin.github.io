/* AEM caching article: header relay and stale-while-revalidate timeline.
   The relay applies the rule from the video: every layer respects the header from the
   layer below and can override it for the layer above. Adobe's CDN reads Surrogate-Control
   first, then Cache-Control. The timeline applies RFC 5861 to one cached response. */
(() => {
  'use strict';

  /* ---------- header relay ---------- */
  document.querySelectorAll('[data-relay]').forEach((fig) => {
    const st = { cc: true, sc: false, dispatcher: 'set', adobe: 'pass', client: 'pass' };
    const layer = (name) => fig.querySelector(`[data-layer="${name}"]`);
    const out = fig.querySelector('[data-relay-out]');
    const code = (h, v, chg) => `<code${chg ? ' class="chg"' : ''}>${h}: max-age=${v}</code>`;
    const label = { publish: 'publish layer', dispatcher: 'dispatcher', adobe: "Adobe's CDN", client: 'client CDN' };

    const compute = () => {
      const L = {};
      // Java publish: renders, caches nothing, may set one or both headers.
      const pub = { cc: st.cc ? 300 : null, sc: st.sc ? 3600 : null, ccBy: 'publish' };
      L.publish = { does: 'Renders the page. Caches nothing.', ret: pub, changed: false };
      // Dispatcher: own cache from .any rules; passes headers on or sets its own (Adobe's example values).
      const dSet = st.dispatcher === 'set';
      const d = dSet ? { cc: 200, sc: 3600, ccBy: 'dispatcher' } : { ...pub };
      L.dispatcher = {
        does: dSet ? 'Caches the page and its headers by its <code>.any</code> rules, then sets its own headers.'
          : 'Caches the page and its headers by its <code>.any</code> rules, and passes the headers on untouched.',
        ret: d, changed: dSet,
      };
      // Adobe's CDN: Surrogate-Control first, then Cache-Control.
      const ttl = d.sc != null ? d.sc : d.cc;
      const src = d.sc != null ? 'Surrogate-Control' : 'Cache-Control';
      const aOver = st.adobe === 'override';
      const a = aOver ? { cc: 60, ccBy: 'adobe' } : { cc: d.cc, ccBy: d.ccBy };
      L.adobe = {
        does: (ttl != null ? `Caches for ${ttl} seconds, from <code>${src}</code>.` : 'No cache header arrived, so the headers say nothing about how long to cache.')
          + (aOver ? ' Replaces <code>Cache-Control</code> for the layer above.' : ''),
        ret: { cc: a.cc }, changed: aOver, ttl,
      };
      // Client CDN: respects Cache-Control from below unless it overrides.
      const cOver = st.client === 'override';
      const c = cOver ? { cc: 120, ccBy: 'client' } : { cc: a.cc, ccBy: a.ccBy };
      L.client = {
        does: cOver ? 'Overrides: caches for 120 seconds by its own rule and returns that.'
          : (a.cc != null ? `Caches for ${a.cc} seconds, from <code>Cache-Control</code>.` : 'No <code>Cache-Control</code> arrived to respect.'),
        ret: { cc: c.cc }, changed: cOver,
      };
      // Browser: respects Cache-Control.
      L.browser = {
        does: c.cc != null ? `Caches the page for ${c.cc} seconds, from <code>Cache-Control</code>.` : 'No <code>Cache-Control</code> arrived. Nothing told the browser how long to keep the page.',
        ret: null, changed: false,
      };
      return { L, final: c };
    };

    const render = () => {
      const { L, final } = compute();
      Object.entries(L).forEach(([name, v]) => {
        const el = layer(name);
        el.querySelector('[data-does]').innerHTML = v.does;
        if (v.ret) {
          const parts = [];
          if (v.ret.cc != null) parts.push(code('Cache-Control', v.ret.cc, v.changed));
          if (v.ret.sc != null) parts.push(code('Surrogate-Control', v.ret.sc, v.changed));
          el.querySelector('[data-returns]').innerHTML = parts.length ? parts.join(' ') : '<span class="muted">No cache headers</span>';
        }
        el.classList.toggle('is-changed', v.changed);
      });
      const changed = ['dispatcher', 'adobe', 'client'].filter((n) => L[n].changed).map((n) => label[n]);
      let msg;
      if (final.cc == null) {
        msg = 'Nothing in the chain sets <code>Cache-Control</code>, so nothing tells the browser how long to keep the page.';
      } else if (!changed.length) {
        msg = `Simple: the publish layer's header goes straight through. The browser keeps the page for <b>${final.cc} seconds</b>`
          + (L.adobe.ttl != null ? `, and Adobe's CDN for ${L.adobe.ttl} seconds.` : '.');
      } else {
        msg = `The browser keeps the page for <b>${final.cc} seconds</b>, a value set by the ${label[final.ccBy]}.`
          + (L.adobe.ttl != null ? ` Adobe's CDN keeps it for ${L.adobe.ttl} seconds.` : '')
          + ` ${changed.length === 1 ? 'One layer' : `${changed.length} layers`} changed the headers on the way up (${changed.join(', ')}). Each one is another block to document and a layer to test on its own.`;
      }
      out.innerHTML = `<p>${msg}</p>`;
    };

    fig.querySelectorAll('.relay__ctl').forEach((ctl) => { ctl.hidden = false; });
    fig.querySelectorAll('.relay__ctl[role="radiogroup"]').forEach((group) => {
      const name = group.closest('[data-layer]').dataset.layer;
      const buttons = [...group.querySelectorAll('button')];
      buttons.forEach((b, i) => {
        b.addEventListener('click', () => {
          st[name] = b.dataset.set;
          buttons.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
          render();
        });
        b.addEventListener('keydown', (e) => {
          if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
          e.preventDefault();
          const n = buttons[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length];
          n.focus(); n.click();
        });
      });
    });
    fig.querySelectorAll('[data-pub]').forEach((box) => {
      st[box.dataset.pub] = box.checked;
      box.addEventListener('change', () => { st[box.dataset.pub] = box.checked; render(); });
    });
    render();
  });

  /* ---------- stale-while-revalidate timeline ---------- */
  document.querySelectorAll('[data-swr]').forEach((fig) => {
    const MAX_AGE = 300, SWR = 1800, END = 2700, ORIGIN = 1; // seconds; the dispatcher takes one second (demo)
    const range = fig.querySelector('[data-swr-range]');
    const on = fig.querySelector('[data-swr-on]');
    const marker = fig.querySelector('[data-swr-marker]');
    const ageEl = fig.querySelector('[data-swr-age]');
    const out = fig.querySelector('[data-swr-out]');
    const directive = fig.querySelector('[data-swr-directive]');
    const cases = Object.fromEntries([...fig.querySelectorAll('[data-case]')].map((li) => [li.dataset.case, li]));
    const wait = fig.querySelector('[data-swr-wait]'), fetchBar = fig.querySelector('[data-swr-fetch]');
    const waitL = fig.querySelector('[data-swr-wait-label]'), fetchL = fig.querySelector('[data-swr-fetch-label]');

    ['.swr__controls', '.swr__track', '.swr__ticks', '.swr__lanes'].forEach((s) => { fig.querySelector(s).hidden = false; });
    const ticks = fig.querySelectorAll('.swr__ticks span');
    [0, MAX_AGE, MAX_AGE + SWR, END].forEach((t, i) => { ticks[i].style.left = `${(t / END) * 100}%`; });
    fig.classList.add('is-live');

    const fmt = (s) => (s < 60 ? `${s} seconds` : `${Math.floor(s / 60)} minute${Math.floor(s / 60) === 1 ? '' : 's'}${s % 60 ? ` ${s % 60} seconds` : ''}`);

    // RFC 5861: fresh while age <= max-age; past that, a cache may serve stale for up to
    // stale-while-revalidate seconds while it revalidates in the background.
    const classify = (age, swrOn) => {
      if (age <= MAX_AGE) return 'fresh';
      if (swrOn && age <= MAX_AGE + SWR) return 'stale';
      return 'old';
    };

    const render = () => {
      const age = +range.value;
      const kind = classify(age, on.checked);
      fig.classList.toggle('is-off', !on.checked);
      directive.classList.toggle('off', !on.checked);
      marker.style.left = `${(age / END) * 100}%`;
      ageEl.textContent = fmt(age);
      Object.entries(cases).forEach(([k, li]) => li.setAttribute('aria-current', String(k === kind)));
      const w = { fresh: 0, stale: 0, old: ORIGIN }[kind];
      const f = { fresh: 0, stale: ORIGIN, old: ORIGIN }[kind];
      wait.style.width = `${(w / 1.25) * 100}%`;
      fetchBar.style.width = `${(f / 1.25) * 100}%`;
      waitL.textContent = w ? `${w} s` : 'none';
      fetchL.textContent = f ? `${f} s` : 'none';
      out.textContent = {
        fresh: `Fresh: the copy is ${fmt(age)} old, inside max-age. The CDN answers from cache and the dispatcher never hears about it.`,
        stale: `Stale but allowed: the CDN answers from cache right away, then spends a second fetching a fresh copy from the dispatcher in the background. The browser never waits for it.`,
        old: on.checked
          ? `Too old: past max-age plus stale-while-revalidate. The request waits the full second while the CDN fetches from the dispatcher.`
          : `Without stale-while-revalidate, anything past max-age means a wait: the browser sits through the full second while the CDN fetches from the dispatcher.`,
      }[kind];
    };
    range.addEventListener('input', render);
    on.addEventListener('change', render);
    render();
  });
})();
