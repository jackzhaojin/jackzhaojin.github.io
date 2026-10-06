/* Explainers for "Adobe Stardust explained".
   1. Page lifecycle lab: the page states and rules from Stardust's
      reference/state-machine.md (adobe/skills at cbaeec4), seeded with four pages
      of the real stardust/state.json from my V2 run (adapt-to-2026-demo at ead7c7f).
      The other eight pages were extracted, like stats; the markup says so in a note.
   2. Three-version viewer: one block and one version at a time.
   The static HTML already shows a finished example of each. */
(function () {
  'use strict';

  /* ---------- 1. page lifecycle lab ---------- */
  var ORDER = ['extracted', 'directed', 'prototyped', 'approved', 'migrated'];
  var JACK = { event: 'approved', by: 'Jack', at: '2026-08-09', note: 'committed+pushed; proceed with workflow' };
  var SEED = [
    ['ai-content-blocks', '/ai-content/blocks/', 'approved'],
    ['ai-content-blocks-hero', '/ai-content/blocks/hero', 'approved'],
    ['ai-content-blocks-cards', '/ai-content/blocks/cards', 'approved'],
    ['ai-content-blocks-stats', '/ai-content/blocks/stats', 'extracted']
  ];

  function seedPages() {
    var pages = {};
    SEED.forEach(function (r) {
      var p = { slug: r[0], path: r[1], status: r[2], prototypePath: null, migratedPath: null };
      if (r[2] === 'approved') {
        p.prototypePath = 'stardust/prototypes/' + r[0] + '-proposed.html';
        p.history = [Object.assign({}, JACK)];
      }
      pages[r[0]] = p;
    });
    return pages;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function today() { return new Date().toISOString().slice(0, 10); }
  function code(s) { return '<code>' + esc(s) + '</code>'; }

  document.querySelectorAll('[data-lifecycle]').forEach(function (lab) {
    var pages = seedPages();
    var handsOff = false;
    var current = 'ai-content-blocks-stats';
    var buttons = Array.prototype.slice.call(lab.querySelectorAll('[data-slug]'));
    var flow = Array.prototype.slice.call(lab.querySelectorAll('[data-states] li'));
    var msg = lab.querySelector('[data-msg]');
    var json = lab.querySelector('[data-json]');
    var hands = lab.querySelector('[data-handsoff]');

    lab.classList.add('is-live');
    lab.querySelector('[data-actions]').hidden = false;

    function say(html) { msg.innerHTML = '<p>' + html + '</p>'; }

    function render() {
      var p = pages[current];
      buttons.forEach(function (b) {
        var pg = pages[b.dataset.slug];
        b.setAttribute('aria-pressed', String(b.dataset.slug === current));
        var st = b.querySelector('.sdl__st');
        st.textContent = pg.status; st.dataset.st = pg.status;
      });
      var at = ORDER.indexOf(p.status);
      flow.forEach(function (li, i) {
        li.classList.toggle('is-done', i < at);
        li.classList.toggle('is-now', i === at);
      });
      var view = { slug: p.slug, path: p.path, status: p.status, prototypePath: p.prototypePath, migratedPath: p.migratedPath };
      if (p.history) view.history = p.history;
      var out = JSON.stringify(view, null, 2);
      if (handsOff) out = '// state.json top level: "handsOff": true\n' + out;
      json.textContent = out;
      hands.setAttribute('aria-checked', String(handsOff));
    }

    function push(p, entry) { p.history = (p.history || []).concat([entry]); }

    function act(name) {
      var p = pages[current];
      var s = p.status;
      var i = ORDER.indexOf(s);
      if (name === 'direct') {
        if (s !== 'extracted') return say('<span class="no">Refused.</span> ' + code('direct') + ' runs on an extracted page. This one is already ' + code(s) + ', and a page never moves backward.');
        p.status = 'directed'; push(p, { status: 'directed', at: today() });
        return say('<span class="ok">Directed.</span> The page is in scope of the direction in ' + code('stardust/direction.md') + '. Next comes a prototype.');
      }
      if (name === 'prototype') {
        if (s === 'extracted') return say('<span class="no">Refused.</span> ' + code('prototype') + ' needs a direction first. This page is still ' + code('extracted') + '.');
        if (i > ORDER.indexOf('prototyped')) return say('<span class="no">Not here.</span> This page is already ' + code(s) + '. A page never moves backward; a new prototype would need a new approval.');
        if (s === 'prototyped') return say('This page already has a prototype waiting for approval.');
        p.status = 'prototyped'; p.prototypePath = 'stardust/prototypes/' + p.slug + '-proposed.html'; push(p, { status: 'prototyped', at: today() });
        if (handsOff) {
          p.status = 'approved'; push(p, { status: 'approved', at: today(), approvedBy: 'hands-off' });
          return say('<span class="ok">Prototyped, then approved by the agent.</span> Hands-off mode grants approval itself, only after its quality gates pass (assumed here), and marks it ' + code('approvedBy: "hands-off"') + '.');
        }
        return say('<span class="ok">Prototyped.</span> The proposed HTML is written. Now the run stops and waits for a person.');
      }
      if (name === 'approve') {
        if (s === 'extracted' || s === 'directed') return say('<span class="no">Nothing to approve.</span> There is no prototype for this page yet.');
        if (s !== 'prototyped') return say('This page is already ' + code(s) + '.');
        p.status = 'approved'; push(p, { status: 'approved', at: today() });
        return say('<span class="ok">Approved by you.</span> This is the human gate: the only state a person sets. Migrate can run now.');
      }
      if (name === 'migrate') {
        if (s === 'migrated') return say('This page is already ' + code('migrated') + '.');
        if (s !== 'approved') return say('<span class="no">Refused.</span> ' + code('migrate') + ' needs an approved page, and this one is ' + code(s) + '. A page moves one state at a time, and a person has to approve its prototype first.');
        p.status = 'migrated'; p.migratedPath = 'stardust/migrated/' + p.slug + '.html'; push(p, { status: 'migrated', at: today() });
        return say('<span class="ok">Migrated.</span> Final static HTML is written. Turning it into EDS blocks and DA content is the job of ' + code('deploy') + ' and ' + code('rollout') + '.');
      }
      return null;
    }

    buttons.forEach(function (b) {
      b.addEventListener('click', function () {
        current = b.dataset.slug; render();
        var p = pages[current];
        say('Selected ' + code(p.path) + ', which is ' + code(p.status) + '.' + (p.history && p.history[0] && p.history[0].by === 'Jack' ? ' I approved it during my run.' : ''));
      });
    });
    lab.querySelectorAll('[data-act]').forEach(function (b) {
      b.addEventListener('click', function () { act(b.dataset.act); render(); });
    });
    hands.addEventListener('click', function () {
      handsOff = !handsOff; render();
      say(handsOff ? 'Hands-off mode is on. Prototypes now get approved by the agent once its quality gates pass. My run had ' + code('"handsOff": false') + '.'
        : 'Hands-off mode is off. Approval waits for a person again.');
    });
    lab.querySelector('[data-reset]').addEventListener('click', function () {
      pages = seedPages(); handsOff = false; current = 'ai-content-blocks-stats'; render();
      say('Back to my run: the index, hero and cards pages approved by me, stats still ' + code('extracted') + '.');
    });
    render();
  });

  /* ---------- 2. three-version viewer ---------- */
  document.querySelectorAll('[data-versions]').forEach(function (fig) {
    var panes = Array.prototype.slice.call(fig.querySelectorAll('.vs__pane'));
    var blocks = Array.prototype.slice.call(fig.querySelectorAll('[data-blocks] [role="radio"]'));
    var vers = Array.prototype.slice.call(fig.querySelectorAll('[data-vers] [role="tab"]'));
    var state = { b: 'hero', v: 'v0' };
    fig.querySelector('.vs__controls').hidden = false;
    fig.classList.add('is-live');

    function render() {
      panes.forEach(function (p) { p.classList.toggle('on', p.dataset.b === state.b && p.dataset.v === state.v); });
      blocks.forEach(function (b) { var on = b.dataset.b === state.b; b.setAttribute('aria-checked', String(on)); b.tabIndex = on ? 0 : -1; });
      vers.forEach(function (t) { var on = t.dataset.v === state.v; t.setAttribute('aria-selected', String(on)); t.tabIndex = on ? 0 : -1; });
    }
    function keys(list, key, attr) {
      list.forEach(function (el, i) {
        el.addEventListener('click', function () { state[key] = el.dataset[attr]; render(); });
        el.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var n = list[(i + d + list.length) % list.length];
          state[key] = n.dataset[attr]; render(); n.focus();
        });
      });
    }
    keys(blocks, 'b', 'b');
    keys(vers, 'v', 'v');
    render();
  });
})();
