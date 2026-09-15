/* v3 theme and navigation. Content and links are delivered in HTML. */
(function () {
  'use strict';
  var root = document.documentElement;
  var media = window.matchMedia('(prefers-color-scheme: dark)');
  var menu = document.getElementById('site-nav');
  var toggle = document.querySelector('.nav-toggle');
  function sync() {
    var choice = root.getAttribute('data-theme-choice') || 'light';
    root.setAttribute('data-theme-effective', choice === 'system' ? (media.matches ? 'dark' : 'light') : choice);
    document.querySelectorAll('[data-set-theme]').forEach(function (button) {
      button.setAttribute('aria-pressed', String(button.dataset.setTheme === choice));
    });
  }
  function closeMenu(returnFocus) {
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (returnFocus) toggle.focus();
  }
  document.addEventListener('click', function (event) {
    var button = event.target.closest('[data-set-theme]');
    if (button) {
      var choice = button.dataset.setTheme;
      if (choice === 'system') root.removeAttribute('data-theme');
      else root.setAttribute('data-theme', choice);
      root.setAttribute('data-theme-choice', choice);
      try { localStorage.setItem('jj-theme', choice); } catch (error) { /* Optional persistence. */ }
      sync();
    }
    if (event.target.closest('.nav-toggle')) {
      var open = toggle.getAttribute('aria-expanded') !== 'true';
      toggle.setAttribute('aria-expanded', String(open));
      menu.classList.toggle('is-open', open);
    } else if (menu.classList.contains('is-open') && (!event.target.closest('.site-header') || event.target.closest('#site-nav a'))) closeMenu(false);
  });
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && menu.classList.contains('is-open')) closeMenu(true);
  });
  window.addEventListener('storage', function (event) {
    if (event.key !== 'jj-theme') return;
    var choice = ['light', 'dark', 'system'].indexOf(event.newValue) >= 0 ? event.newValue : 'light';
    root.setAttribute('data-theme-choice', choice);
    if (choice === 'system') root.removeAttribute('data-theme');
    else root.setAttribute('data-theme', choice);
    sync();
  });
  if (media.addEventListener) media.addEventListener('change', sync);
  document.querySelectorAll('.credential-mark img').forEach(function (img) {
    function reveal() { if (img.naturalWidth) img.setAttribute('data-loaded', ''); }
    if (img.complete) reveal();
    else img.addEventListener('load', reveal, { once: true });
  });
  sync();
})();
