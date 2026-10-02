/* Explainer kit for Technical Writing articles (typed terminal, code walkthrough, request flow,
   compare, two-way switch, three views, bar placement, token lab, video facade, static code).
   Every component is readable without JavaScript; this adds motion and controls. */
(() => {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const onceVisible = (el, fn) => {
    if (!('IntersectionObserver' in window)) return fn();
    const io = new IntersectionObserver((es) => { if (es.some((e) => e.isIntersecting)) { io.disconnect(); fn(); } }, { threshold: 0.45 });
    io.observe(el);
  };

  /* ---------- 1. typed terminal ---------- */
  document.querySelectorAll('[data-typed]').forEach((term) => {
    const pre = term.querySelector('pre');
    const replay = term.querySelector('[data-replay]');
    const cmds = [...pre.querySelectorAll('.cmd')].map((el) => ({ el, text: el.textContent }));
    const caret = Object.assign(document.createElement('span'), { className: 'caret' });
    caret.setAttribute('aria-hidden', 'true');
    const prompt = Object.assign(document.createElement('span'), { className: 'prompt' });
    prompt.setAttribute('aria-hidden', 'true');
    const rest = () => { prompt.appendChild(caret); pre.appendChild(prompt); caret.classList.add('idle'); };
    let run = 0;

    const finish = () => {
      term.classList.remove('is-playing');
      cmds.forEach((c) => { c.el.textContent = c.text; });
      pre.querySelectorAll('.out, .gap').forEach((o) => o.classList.remove('shown'));
      rest();
      pre.removeAttribute('aria-busy');
    };

    const play = async () => {
      const id = ++run;
      if (reduce) return finish();
      pre.setAttribute('aria-busy', 'true');
      term.classList.add('is-playing');
      pre.querySelectorAll('.out, .gap').forEach((o) => o.classList.remove('shown'));
      cmds.forEach((c) => { c.el.textContent = ''; c.el.classList.remove('shown'); });
      prompt.remove();
      caret.classList.remove('idle');
      for (const c of cmds) {
        c.el.classList.add('shown');
        c.el.appendChild(caret);
        await wait(380);
        for (const ch of c.text) {
          if (id !== run) return;
          caret.before(ch);
          await wait(ch === ' ' ? 45 : 26);
        }
        await wait(260);
        caret.remove();
        c.el.textContent = c.text;
        let n = c.el.nextElementSibling;
        while (n && !n.classList.contains('cmd')) {
          if (id !== run) return;
          n.classList.add('shown');
          await wait(n.classList.contains('gap') ? 180 : 90);
          n = n.nextElementSibling;
        }
      }
      if (id === run) { term.classList.remove('is-playing'); pre.querySelectorAll('.out, .gap').forEach((o) => o.classList.add('shown')); rest(); pre.removeAttribute('aria-busy'); }
    };

    replay.hidden = false;
    replay.addEventListener('click', play);
    onceVisible(term, play);
  });

  /* ---------- shared stepper: turns the static list into buttons ---------- */
  const stepper = (root, onStep) => {
    const items = [...root.querySelectorAll('.step-list .static')];
    const buttons = items.map((div, i) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.innerHTML = div.innerHTML;
      Object.assign(b.dataset, div.dataset);
      div.replaceWith(b);
      b.addEventListener('click', () => go(i, true));
      return b;
    });
    const nav = root.querySelector('.nav');
    nav.hidden = false;
    const prev = nav.querySelector('[data-prev]');
    const next = nav.querySelector('[data-next]');
    let cur = -1;
    const go = (i, user) => {
      cur = Math.max(0, Math.min(buttons.length - 1, i));
      buttons.forEach((b, j) => (j === cur ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
      prev.disabled = cur === 0;
      next.disabled = cur === buttons.length - 1;
      onStep(buttons[cur], cur, user);
    };
    prev.addEventListener('click', () => go(cur - 1, true));
    next.addEventListener('click', () => go(cur + 1, true));
    return { go, get cur() { return cur; }, count: buttons.length };
  };

  /* ---------- 2. code walkthrough ---------- */
  const KEYWORDS = /\b(const|let|if|return|await|async|new|try|catch|export|function|null)\b/g;
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  const highlight = (line) => {
    const out = [];
    const re = /(\/\/.*$)|('[^']*'|`[^`]*`|"[^"]*")|(\b\d+\b)/g;
    let last = 0, m;
    while ((m = re.exec(line))) {
      out.push(esc(line.slice(last, m.index)).replace(KEYWORDS, '<span class="tk-k">$1</span>'));
      const cls = m[1] ? 'tk-c' : m[2] ? 'tk-s' : 'tk-n';
      out.push(`<span class="${cls}">${esc(m[0])}</span>`);
      last = re.lastIndex;
    }
    out.push(esc(line.slice(last)).replace(KEYWORDS, '<span class="tk-k">$1</span>'));
    return out.join('');
  };
  // Static code excerpts get the same coloring as the walkthrough.
  document.querySelectorAll('.code--static .ln').forEach((l) => { l.innerHTML = highlight(l.textContent); });

  document.querySelectorAll('[data-walk]').forEach((walk) => {
    const code = walk.querySelector('.code');
    const pre = code.querySelector('pre');
    const lines = [...code.querySelectorAll('.ln')];
    lines.forEach((l) => { l.innerHTML = highlight(l.textContent); });
    stepper(walk, (btn) => {
      const [a, b] = btn.dataset.lines.split('-').map(Number);
      code.classList.add('has-focus');
      lines.forEach((l) => { const n = +l.dataset.n; l.classList.toggle('on', n >= a && n <= b); });
      const first = lines.find((l) => +l.dataset.n === a);
      pre.scrollTop = Math.max(0, first.offsetTop - pre.clientHeight / 3);
    }).go(0);
  });

  /* ---------- 3. request flow (wide and tall layouts share one step list) ---------- */
  document.querySelectorAll('[data-flow]').forEach((flow) => {
    const svgs = [...flow.querySelectorAll('svg')];
    const playBtn = flow.querySelector('[data-play]');
    const visible = () => svgs.find((s) => s.getBoundingClientRect().width > 0) || svgs[0];
    let anim = 0;
    const travel = (svg, path, reverse, id) => new Promise((resolve) => {
      const dot = svg.querySelector('.dot');
      const len = path.getTotalLength();
      const t0 = performance.now();
      const tick = (now) => {
        if (id !== anim) return resolve();
        let t = Math.min(1, (now - t0) / 650);
        t = t < .5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        const pt = path.getPointAtLength((reverse ? 1 - t : t) * len);
        dot.setAttribute('cx', pt.x); dot.setAttribute('cy', pt.y);
        t < 1 ? requestAnimationFrame(tick) : resolve();
      };
      requestAnimationFrame(tick);
    });
    const show = async (btn, i) => {
      const id = ++anim;
      flow.classList.add('has-focus');
      const edges = btn.dataset.edges.split(',');
      const nodes = btn.dataset.nodes.split(',');
      svgs.forEach((svg) => {
        svg.querySelector('.dot').style.opacity = 0;
        svg.querySelectorAll('.edge').forEach((e) => e.classList.toggle('on', edges.includes(e.dataset.e)));
        svg.querySelectorAll('.node').forEach((n) => n.classList.toggle('on', nodes.includes(n.dataset.node)));
        svg.querySelectorAll('.badge').forEach((b) => b.classList.toggle('on', +b.dataset.step === i + 1));
      });
      if (reduce) return;
      const svg = visible();
      const dot = svg.querySelector('.dot');
      const path = (e) => svg.querySelector(`.edge[data-e="${e}"]`);
      dot.style.opacity = 1;
      for (const e of edges) await travel(svg, path(e), !!btn.dataset.reverse, id);
      if (btn.dataset.back) for (const e of [...edges].reverse()) await travel(svg, path(e), true, id);
      if (id === anim) dot.style.opacity = 0;
    };
    let playing = false;
    const s = stepper(flow, (btn, i, user) => { if (user) playing = false; show(btn, i); });
    playBtn.addEventListener('click', async () => {
      playing = true;
      for (let i = 0; i < s.count && playing; i++) {
        s.go(i, false);
        await wait(reduce ? 1600 : 2300);
      }
      playing = false;
    });
  });

  /* ---------- 4. token lab: real RS256 signing, the same four checks as google-token.js ---------- */
  document.querySelectorAll('[data-lab]').forEach((lab) => {
    if (!window.crypto || !crypto.subtle) return;
    const CLIENT = 'demo-client.apps.googleusercontent.com';
    const ISSUERS = ['https://accounts.google.com', 'accounts.google.com'];
    const enc = new TextEncoder();
    const b64u = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    const b64uJson = (o) => b64u(enc.encode(JSON.stringify(o)));
    const fromB64u = (str) => {
      if (!/^[A-Za-z0-9_-]+$/.test(str)) throw new Error('invalid base64url input');
      const bin = atob(str.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (str.length % 4)) % 4));
      return Uint8Array.from(bin, (c) => c.charCodeAt(0));
    };
    const ALG = { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' };
    const tokenEl = lab.querySelector('[data-token]');
    const segs = { h: tokenEl.querySelector('.seg--h'), p: tokenEl.querySelector('.seg--p'), s: tokenEl.querySelector('.seg--s') };
    const decodedEl = lab.querySelector('[data-decoded]');
    const verdict = lab.querySelector('[data-verdict]');
    const gates = Object.fromEntries([...lab.querySelectorAll('[data-gate]')].map((g) => [g.dataset.gate, g]));
    const chips = lab.querySelector('.chips');
    const buttons = [...chips.querySelectorAll('button')];
    let keys = null;
    let ready = null;
    let run = 0;

    const setup = async () => {
      const gen = () => crypto.subtle.generateKey({ ...ALG, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ['sign', 'verify']);
      const [good, evil] = await Promise.all([gen(), gen()]);
      const jwk = await crypto.subtle.exportKey('jwk', good.publicKey);
      keys = { good, evil, jwks: { keys: [{ kty: jwk.kty, n: jwk.n, e: jwk.e, kid: 'demo-key-1', alg: 'RS256', use: 'sig' }] } };
      lab.querySelector('[data-modulus]').textContent = `n: ${jwk.n.slice(0, 18)}…`;
    };

    const sign = async (header, payload, privateKey) => {
      const input = `${b64uJson(header)}.${b64uJson(payload)}`;
      const sig = await crypto.subtle.sign(ALG, privateKey, enc.encode(input));
      return `${input}.${b64u(sig)}`;
    };

    const scenario = async (name) => {
      const now = Math.floor(Date.now() / 1000);
      const header = { alg: 'RS256', kid: 'demo-key-1', typ: 'JWT' };
      const payload = { iss: 'https://accounts.google.com', aud: CLIENT, sub: '110248495921238986420', email: 'trail.reader@example.com', name: 'Trail Reader', given_name: 'Trail', iat: now, exp: now + 3600 };
      const valid = await sign(header, payload, keys.good.privateKey);
      switch (name) {
        case 'edited': {
          const [h, , s] = valid.split('.');
          return { token: `${h}.${b64uJson({ ...payload, name: 'Someone Else', given_name: 'Someone' })}.${s}`, changed: ['p'], hot: ['name'] };
        }
        case 'own-key':
          return { token: await sign({ ...header, kid: 'attacker-key' }, payload, keys.evil.privateKey), changed: ['h', 's'], hot: ['kid'] };
        case 'alg-none': {
          const [, p, s] = (await sign(header, payload, keys.evil.privateKey)).split('.');
          return { token: `${b64uJson({ ...header, alg: 'none' })}.${p}.${s}`, changed: ['h'], hot: ['alg'] };
        }
        case 'other-site':
          return { token: await sign(header, { ...payload, aud: 'another-site.apps.googleusercontent.com' }, keys.good.privateKey), changed: [], hot: ['aud'] };
        case 'old':
          return { token: await sign(header, { ...payload, iat: now - 7200, exp: now - 3600 }, keys.good.privateKey), changed: [], hot: ['exp'] };
        default:
          return { token: valid, changed: [], hot: [] };
      }
    };

    // Mirrors verifyIdToken() and checkClaims(): same order, same messages.
    async function* verify(token, jwks) {
      const [eh, ep, es] = token.split('.');
      const dec = new TextDecoder();
      const header = JSON.parse(dec.decode(fromB64u(eh)));
      const payload = JSON.parse(dec.decode(fromB64u(ep)));
      yield ['alg', 'h', header.alg !== 'RS256' ? `unsupported algorithm "${header.alg}"` : null];
      const jwk = (jwks.keys || []).find((k) => k.kid === header.kid);
      yield ['kid', 'h', jwk ? null : `no published key matches kid "${header.kid}"`];
      const key = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e }, ALG, false, ['verify']);
      const ok = await crypto.subtle.verify(ALG, key, fromB64u(es), enc.encode(`${eh}.${ep}`));
      yield ['sig', 'hps', ok ? null : 'signature is invalid'];
      const now = Math.floor(Date.now() / 1000);
      const problems = [];
      if (!ISSUERS.includes(payload.iss)) problems.push(`issuer "${payload.iss}" is not trusted`);
      const auds = Array.isArray(payload.aud) ? payload.aud : [payload.aud];
      if (!auds.includes(CLIENT)) problems.push('audience does not match this client');
      if (typeof payload.exp !== 'number' || payload.exp + 60 < now) problems.push('token has expired');
      if (typeof payload.iat === 'number' && payload.iat - 60 > now) problems.push('token issued in the future');
      yield ['claims', 'p', problems.length ? problems.join('; ') : null, payload];
    }

    const showDecoded = (token, hot, failedKey) => {
      const [eh, ep] = token.split('.');
      const dec = new TextDecoder();
      const header = JSON.parse(dec.decode(fromB64u(eh)));
      const p = JSON.parse(dec.decode(fromB64u(ep)));
      const esc = (v) => String(v).replace(/&/g, '&amp;').replace(/</g, '&lt;');
      const field = (k, v) => {
        const val = typeof v === 'number' ? v : `"${esc(v)}"`;
        const cls = hot.includes(k) ? (failedKey ? 'bad' : 'hot') : '';
        return cls ? `<span class="${cls}">"${k}": ${val}</span>` : `"${k}": ${val}`;
      };
      decodedEl.innerHTML = `{\n  "header": {\n    ${field('alg', header.alg)}, ${field('kid', header.kid)}\n  },\n  "payload": {\n    ${['iss', 'aud', 'email', 'name', 'exp'].map((k) => field(k, p[k])).join(',\n    ')}\n  }\n}`;
    };

    const play = async (name) => {
      const id = ++run;
      buttons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.scenario === name)));
      Object.values(gates).forEach((g) => { g.dataset.state = ''; g.querySelector('.gate__msg').textContent = ''; });
      verdict.innerHTML = '<p>Checking…</p>';
      await (ready ||= setup());
      const { token, changed, hot } = await scenario(name);
      if (id !== run) return;
      const [h, p, s] = token.split('.');
      segs.h.textContent = h; segs.p.textContent = p; segs.s.textContent = s;
      Object.entries(segs).forEach(([k, el]) => el.classList.toggle('changed', changed.includes(k)));
      showDecoded(token, hot, false);
      let failed = null, claims = null;
      for await (const [gate, focus, error, payload] of verify(token, keys.jwks)) {
        if (id !== run) return;
        const el = gates[gate];
        tokenEl.dataset.focus = focus;
        el.dataset.state = 'checking';
        await wait(reduce ? 0 : 480);
        if (id !== run) return;
        el.dataset.state = error ? 'fail' : 'pass';
        if (error) { el.querySelector('.gate__msg').textContent = error; failed = error; break; }
        claims = payload;
      }
      if (id !== run) return;
      delete tokenEl.dataset.focus;
      Object.values(gates).forEach((g) => { if (!g.dataset.state) g.dataset.state = 'skip'; });
      if (failed) showDecoded(token, hot, true);
      verdict.innerHTML = failed
        ? `<p><span class="no">Anonymous visitor.</span> The page renders the sign-in button.</p><span class="log">session cookie rejected: ${failed}</span>`
        : `<p><span class="ok">Signed in as ${claims.name}.</span> The greeting bar says hello, and the page is marked private.</p><span class="log">verified by adapt-edge-function</span>`;
    };

    chips.hidden = false;
    buttons.forEach((b) => b.addEventListener('click', () => play(b.dataset.scenario)));
    onceVisible(lab, () => play('valid'));
  });


  /* ---------- compare: tabs over stacked screenshots ---------- */
  document.querySelectorAll('[data-compare]').forEach((cmp) => {
    const tabs = [...cmp.querySelectorAll('[role="tab"]')];
    const panes = [...cmp.querySelectorAll('.cmp__pane')];
    const show = (i) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panes.forEach((p, j) => p.classList.toggle('on', i === j));
    };
    cmp.querySelector('.cmp__tabs').hidden = false;
    cmp.classList.add('is-live');
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = (i + d + tabs.length) % tabs.length; show(n); tabs[n].focus(); }
      });
    });
    show(0);
  });

  /* ---------- a two-way switch used by production/laptop and the bar placement ---------- */
  const twoWay = (root, onMode) => {
    const sw = root.querySelector('[role="radiogroup"]');
    const buttons = [...sw.querySelectorAll('[role="radio"]')];
    const set = (mode) => {
      buttons.forEach((b) => { const on = b.dataset.mode === mode; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      onMode(mode);
    };
    sw.hidden = false;
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => set(b.dataset.mode));
      b.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') { const n = buttons[(i + 1) % 2]; set(n.dataset.mode); n.focus(); }
      });
    });
    return set;
  };

  /* ---------- production vs laptop ---------- */
  document.querySelectorAll('[data-pvl]').forEach((pvl) => {
    let run = 0;
    const set = twoWay(pvl, async (mode) => {
      const id = ++run;
      if (!reduce) { pvl.classList.add('is-swapping'); await wait(220); }
      if (id !== run) return;
      pvl.querySelectorAll('[data-swap]').forEach((el) => { el.textContent = el.dataset[mode]; });
      pvl.querySelectorAll('[data-diff]').forEach((el) => el.classList.toggle('differs', mode === 'laptop'));
      pvl.querySelectorAll('[data-same]').forEach((el) => el.classList.toggle('same', mode === 'laptop'));
      pvl.querySelectorAll('[data-note]').forEach((el) => el.classList.toggle('differs', mode === 'laptop'));
      pvl.classList.remove('is-swapping');
    });
    set('prod');
  });

  /* ---------- three views of one request ---------- */
  document.querySelectorAll('[data-tv]').forEach((tv) => {
    const tabs = [...tv.querySelectorAll('[role="tab"]')];
    const panels = [...tv.querySelectorAll('[data-panel]')];
    const says = [...tv.querySelectorAll('[data-say]')];
    const apply = (i) => {
      tabs.forEach((t, j) => { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
      panels.forEach((p, j) => { p.hidden = i !== j; });
      says.forEach((s, j) => { s.hidden = i !== j; });
    };
    const show = (i) => {
      // The token chip morphs from the cookie row to the Authorization row where view transitions exist.
      if (document.startViewTransition && !reduce) document.startViewTransition(() => apply(i));
      else apply(i);
    };
    tv.querySelector('[role="tablist"]').hidden = false;
    tabs.forEach((t, i) => {
      t.addEventListener('click', () => show(i));
      t.addEventListener('keydown', (e) => {
        const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
        if (d) { const n = (i + d + tabs.length) % tabs.length; show(n); tabs[n].focus(); }
      });
    });
    apply(0);
  });

  /* ---------- where the bar goes ---------- */
  document.querySelectorAll('[data-bp]').forEach((bp) => {
    const modes = [...bp.querySelectorAll('.bp__mode')];
    const set = twoWay(bp, (mode) => {
      modes.forEach((m) => { m.hidden = m.dataset.mode !== mode; });
      bp.classList.remove('is-live');
      void bp.offsetWidth;
      bp.classList.add('is-live');
    });
    set('before');
  });

  /* ---------- video: load YouTube only when asked ---------- */
  document.querySelectorAll('[data-video]').forEach((fig) => {
    const facade = fig.querySelector('.video__facade');
    facade.addEventListener('click', (e) => {
      e.preventDefault();
      const f = document.createElement('iframe');
      f.src = `https://www.youtube-nocookie.com/embed/${fig.dataset.video}?autoplay=1&rel=0`;
      f.title = fig.dataset.title || 'Video';
      f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      facade.replaceWith(f);
    });
  });
})();
