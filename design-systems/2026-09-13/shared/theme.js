/* Shared theme control for every design system in this round.
   Do not fork this file. Storage key: jj-theme. Values: light | dark | system.
   The pre-paint snippet in <head> (see SPEC.md) applies the stored choice before
   CSS loads. This file wires the control, keeps "system" in sync with the OS,
   and handles the mobile nav toggle. It never supplies content. */
(function () {
  'use strict';
  var KEY = 'jj-theme';
  var root = document.documentElement;
  var mq = window.matchMedia ? window.matchMedia('(prefers-color-scheme: dark)') : null;

  function choice() {
    return root.getAttribute('data-theme-choice') || root.getAttribute('data-theme-default') || 'light';
  }

  function apply(c, persist) {
    if (c === 'system') { root.removeAttribute('data-theme'); } else { root.setAttribute('data-theme', c); }
    root.setAttribute('data-theme-choice', c);
    if (persist) { try { localStorage.setItem(KEY, c); } catch (e) { /* storage unavailable */ } }
    sync();
  }

  function sync() {
    var c = choice();
    var effective = c === 'system' ? (mq && mq.matches ? 'dark' : 'light') : c;
    root.setAttribute('data-theme-effective', effective);
    var btns = document.querySelectorAll('[data-set-theme]');
    for (var i = 0; i < btns.length; i++) {
      btns[i].setAttribute('aria-pressed', btns[i].getAttribute('data-set-theme') === c ? 'true' : 'false');
    }
  }

  document.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('[data-set-theme], .nav-toggle') : null;
    if (!t) { return; }
    if (t.hasAttribute('data-set-theme')) { apply(t.getAttribute('data-set-theme'), true); return; }
    var id = t.getAttribute('aria-controls');
    var nav = id ? document.getElementById(id) : null;
    var open = t.getAttribute('aria-expanded') !== 'true';
    t.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (nav) { nav.classList.toggle('is-open', open); }
  });

  if (mq && mq.addEventListener) { mq.addEventListener('change', sync); }
  sync();
})();
