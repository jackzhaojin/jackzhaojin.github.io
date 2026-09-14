/* google-stitch design system: blog filters and sort.
   Progressive enhancement only. Every card is in the HTML; this script hides
   non-matching cards with the hidden attribute, reorders them for sort, and
   mirrors the state into the query string. Topic chips are links; the
   ?topic= parameter is honored here because hub pages are not built yet. */
(function () {
  'use strict';
  var form = document.querySelector('form.filter-bar[data-collection]');
  var grid = document.getElementById('posts');
  if (!form || !grid) { return; }

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card--post'));
  var countEl = document.getElementById('post-count');
  var empty = document.getElementById('no-results');
  var sortEl = form.querySelector('select[name="sort"]');
  var state = { format: 'all', type: 'all', sort: 'newest', topic: '' };

  /* Hub slug (from site.json) to the card attributes it matches */
  var topicMap = {
    'aem-ai': { attr: 'topic', value: 'aem' },          /* curated set pending, shows the AEM topic */
    'adobe-aem': { attr: 'topic', value: 'aem' },
    'ai-agents': { attr: 'topic', value: 'ai' },
    'working-with-ai': { attr: 'type', value: 'leadership' }
  };

  function readUrl() {
    var q = new URLSearchParams(window.location.search);
    var f = q.get('format'), t = q.get('type'), s = q.get('sort'), tp = q.get('topic');
    if (f && /^(all|video|article|post)$/.test(f)) { state.format = f; }
    if (t && /^(all|technical|leadership)$/.test(t)) { state.type = t; }
    if (s && /^(newest|oldest)$/.test(s)) { state.sort = s; }
    if (tp && topicMap[tp]) { state.topic = tp; }
  }

  function writeUrl() {
    var q = new URLSearchParams();
    if (state.topic) { q.set('topic', state.topic); }
    if (state.format !== 'all') { q.set('format', state.format); }
    if (state.type !== 'all') { q.set('type', state.type); }
    if (state.sort !== 'newest') { q.set('sort', state.sort); }
    var qs = q.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    try { window.history.replaceState(null, '', url); } catch (e) { /* ignore */ }
  }

  function syncControls() {
    var chips = form.querySelectorAll('button.chip[data-filter]');
    for (var i = 0; i < chips.length; i++) {
      var c = chips[i];
      c.setAttribute('aria-pressed', state[c.getAttribute('data-filter')] === c.getAttribute('data-value') ? 'true' : 'false');
    }
    if (sortEl) { sortEl.value = state.sort; }
    var links = form.querySelectorAll('a.chip--topic');
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href') || '';
      var m = href.match(/topic=([a-z-]+)/);
      if (m && m[1] === state.topic) { links[j].setAttribute('aria-current', 'true'); }
      else { links[j].removeAttribute('aria-current'); }
    }
  }

  function apply() {
    var shown = 0;
    var topic = state.topic ? topicMap[state.topic] : null;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var ok = (state.format === 'all' || c.getAttribute('data-format') === state.format) &&
               (state.type === 'all' || c.getAttribute('data-type') === state.type) &&
               (!topic || c.getAttribute('data-' + topic.attr) === topic.value);
      c.hidden = !ok;
      if (ok) { shown++; }
    }
    var sorted = cards.slice().sort(function (a, b) {
      var da = a.getAttribute('data-date') || '', db = b.getAttribute('data-date') || '';
      return state.sort === 'oldest' ? (da < db ? -1 : da > db ? 1 : 0) : (da > db ? -1 : da < db ? 1 : 0);
    });
    for (var k = 0; k < sorted.length; k++) { grid.appendChild(sorted[k]); }
    if (countEl) { countEl.textContent = shown + (shown === 1 ? ' post' : ' posts'); }
    if (empty) { empty.hidden = shown !== 0; }
    syncControls();
  }

  form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  form.addEventListener('click', function (ev) {
    var t = ev.target.closest ? ev.target.closest('button.chip[data-filter]') : null;
    if (!t) { return; }
    state[t.getAttribute('data-filter')] = t.getAttribute('data-value');
    apply(); writeUrl();
  });
  if (sortEl) {
    sortEl.addEventListener('change', function () { state.sort = sortEl.value; apply(); writeUrl(); });
  }

  readUrl();
  apply();
})();
