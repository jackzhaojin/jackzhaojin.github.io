/* Technical Writing article: the right-rail outline. The outline is plain HTML;
   this adds the current-section highlight, the reading progress bar and the
   collapsed default on narrow screens. */
(function () {
  'use strict';
  var rail = document.querySelector('.rail');
  var body = document.querySelector('.article-body');
  if (!rail || !body) return;

  var narrow = window.matchMedia('(max-width: 1080px)');
  var links = Array.prototype.slice.call(rail.querySelectorAll('.rail__list a'));
  var bar = rail.querySelector('.rail__progress span');
  var sections = links.map(function (a) { return document.getElementById(a.hash.slice(1)); }).filter(Boolean);

  function layout() {
    if (narrow.matches) rail.removeAttribute('open');
    else rail.setAttribute('open', '');
  }

  function current() {
    // The current section is the last heading above a line a third of the way down the screen.
    var line = window.innerHeight / 3;
    var active = sections[0];
    sections.forEach(function (s) { if (s.getBoundingClientRect().top <= line) active = s; });
    links.forEach(function (a) {
      if (a.hash.slice(1) === active.id) a.setAttribute('aria-current', 'true');
      else a.removeAttribute('aria-current');
    });
    if (bar) {
      var r = body.getBoundingClientRect();
      var total = r.height - window.innerHeight;
      var done = total > 0 ? Math.min(1, Math.max(0, -r.top / total)) : 1;
      bar.style.transform = 'scaleX(' + done.toFixed(3) + ')';
    }
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { ticking = false; current(); });
  }

  links.forEach(function (a) {
    a.addEventListener('click', function () { if (narrow.matches) rail.removeAttribute('open'); });
  });
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  if (narrow.addEventListener) narrow.addEventListener('change', layout);
  layout();
  current();
})();
