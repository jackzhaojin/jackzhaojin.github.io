/* v3: blog filter and sort (base: claude-fable-5-1).
   Reads format, type, sort and topic from the query string, applies them to the
   .card--post elements in #postGrid, keeps the chips' aria-pressed in sync and
   mirrors the state back into the address bar with replaceState. The canonical
   stays clean. Without this file every card shows and topic links still work.
   Also shows #filterEmpty when nothing matches (with a reset) and #filterNote
   while the provisional AEM + AI set is the active topic. */
(function () {
  'use strict';
  var form = document.querySelector('form.filter-bar[data-collection]');
  var grid = document.getElementById('postGrid');
  if (!form || !grid) { return; }

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card--post'));
  var empty = document.getElementById('filterEmpty');
  var note = document.getElementById('filterNote');
  var HUB = { 'aem-ai': 'aem-ai', 'adobe-aem': 'aem', 'ai-agents': 'agents', 'working-with-ai': 'work' };
  var state = { format: 'all', type: 'all', sort: 'newest', topic: '' };

  var params = new URLSearchParams(window.location.search);
  var keys = ['format', 'type', 'sort'];
  for (var i = 0; i < keys.length; i++) {
    var v = params.get(keys[i]);
    if (v) { state[keys[i]] = v; }
  }
  var t = params.get('topic');
  if (t && HUB[t]) { state.topic = t; }

  function hasHub(card, hub) {
    return (' ' + (card.getAttribute('data-hubs') || '') + ' ').indexOf(' ' + hub + ' ') > -1;
  }

  function render() {
    var shown = 0;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      var ok = (state.format === 'all' || c.getAttribute('data-format') === state.format) &&
        (state.type === 'all' || c.getAttribute('data-type') === state.type) &&
        (!state.topic || hasHub(c, HUB[state.topic]));
      c.hidden = !ok;
      if (ok) { shown++; }
    }

    var sorted = cards.slice().sort(function (a, b) {
      var da = a.getAttribute('data-date'), db = b.getAttribute('data-date');
      if (da === db) { return 0; }
      if (state.sort === 'oldest') { return da < db ? -1 : 1; }
      return da > db ? -1 : 1;
    });
    for (var j = 0; j < sorted.length; j++) { grid.appendChild(sorted[j]); }

    var buttons = form.querySelectorAll('button[data-filter]');
    for (var k = 0; k < buttons.length; k++) {
      var b = buttons[k];
      b.setAttribute('aria-pressed', state[b.getAttribute('data-filter')] === b.getAttribute('data-value') ? 'true' : 'false');
    }
    var select = form.querySelector('select[name="sort"]');
    if (select) { select.value = state.sort; }
    var links = form.querySelectorAll('a[data-topic-slug]');
    for (var m = 0; m < links.length; m++) {
      if (links[m].getAttribute('data-topic-slug') === state.topic) { links[m].setAttribute('aria-current', 'true'); }
      else { links[m].removeAttribute('aria-current'); }
    }
    var count = document.getElementById('filterCount');
    if (count) { count.textContent = shown + ' of ' + cards.length + ' shown'; }
    if (empty) { empty.hidden = shown !== 0; }
    if (note) { note.hidden = state.topic !== 'aem-ai'; }

    var q = new URLSearchParams();
    if (state.topic) { q.set('topic', state.topic); }
    if (state.format !== 'all') { q.set('format', state.format); }
    if (state.type !== 'all') { q.set('type', state.type); }
    if (state.sort !== 'newest') { q.set('sort', state.sort); }
    var qs = q.toString();
    try {
      window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash);
    } catch (e) { /* file:// or a restricted context; the view still updates */ }
  }

  form.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-filter]') : null;
    if (!b) { return; }
    state[b.getAttribute('data-filter')] = b.getAttribute('data-value');
    render();
  });
  form.addEventListener('change', function (ev) {
    if (ev.target && ev.target.name === 'sort') { state.sort = ev.target.value; render(); }
  });
  form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  document.addEventListener('click', function (ev) {
    var r = ev.target.closest ? ev.target.closest('[data-filter-reset]') : null;
    if (!r) { return; }
    state = { format: 'all', type: 'all', sort: 'newest', topic: '' };
    render();
  });

  render();
})();
