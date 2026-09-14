/* Astra design system, blog filters and sort.
   Only runs on a page with a .filter-bar[data-collection] and #post-grid.
   Every card is in the HTML; this script hides the ones that do not match
   the chosen format, type or topic, sorts by date, and mirrors the state into
   the query string. Topic chips are links, so topic changes are navigations.
   Storage: none. Fetching: none. */
(function () {
  'use strict';
  var grid = document.getElementById('post-grid');
  var form = document.querySelector('.filter-bar[data-collection]');
  if (!grid || !form) { return; }
  var status = document.getElementById('filter-status');
  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card--post'));
  var params = new URLSearchParams(window.location.search);
  var alias = { 'aem': 'adobe-aem', 'agents': 'ai-agents', 'work': 'working-with-ai' };
  var labels = { 'aem-ai': 'AEM + AI', 'adobe-aem': 'Adobe AEM and EDS', 'ai-agents': 'AI Agents', 'working-with-ai': 'Working with AI' };
  var state = {
    topic: params.get('topic') || '',
    format: params.get('format') || 'all',
    type: params.get('type') || 'all',
    sort: params.get('sort') === 'oldest' ? 'oldest' : 'newest'
  };
  if (alias[state.topic]) { state.topic = alias[state.topic]; }
  if (!labels[state.topic]) { state.topic = ''; }

  function matchesTopic(card) {
    switch (state.topic) {
      case '': return true;
      case 'aem-ai': return (card.getAttribute('data-hub') || '').split(' ').indexOf('aem-ai') > -1;
      case 'adobe-aem': return card.getAttribute('data-topic') === 'aem';
      case 'ai-agents': return card.getAttribute('data-topic') === 'ai';
      case 'working-with-ai': return card.getAttribute('data-type') === 'leadership';
      default: return true;
    }
  }

  function apply() {
    var shown = 0;
    cards.forEach(function (card) {
      var ok = matchesTopic(card) &&
        (state.format === 'all' || card.getAttribute('data-format') === state.format) &&
        (state.type === 'all' || card.getAttribute('data-type') === state.type);
      card.hidden = !ok;
      if (ok) { shown++; }
    });
    cards.slice().sort(function (a, b) {
      var da = a.getAttribute('data-date'), db = b.getAttribute('data-date');
      if (da === db) { return 0; }
      return state.sort === 'oldest' ? (da < db ? -1 : 1) : (da > db ? -1 : 1);
    }).forEach(function (card) { grid.appendChild(card); });

    var buttons = form.querySelectorAll('button[data-filter]');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.setAttribute('aria-pressed', state[b.getAttribute('data-filter')] === b.getAttribute('data-value') ? 'true' : 'false');
    }
    var links = form.querySelectorAll('a.chip');
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href') || '';
      var m = href.match(/[?&]topic=([a-z-]+)/);
      var t = m ? m[1] : '';
      if (t === state.topic) { links[j].setAttribute('aria-current', 'true'); } else { links[j].removeAttribute('aria-current'); }
    }
    var select = form.querySelector('#sort');
    if (select) { select.value = state.sort; }

    if (status) {
      var parts = ['Showing ' + shown + ' of ' + cards.length + ' items'];
      if (state.topic) { parts.push('topic ' + labels[state.topic]); }
      if (state.format !== 'all') { parts.push('format ' + state.format); }
      if (state.type !== 'all') { parts.push('type ' + state.type); }
      parts.push(state.sort === 'oldest' ? 'oldest first' : 'newest first');
      status.textContent = parts.join(', ') + '.';
    }

    var q = new URLSearchParams();
    if (state.topic) { q.set('topic', state.topic); }
    if (state.format !== 'all') { q.set('format', state.format); }
    if (state.type !== 'all') { q.set('type', state.type); }
    if (state.sort !== 'newest') { q.set('sort', state.sort); }
    var qs = q.toString();
    try { window.history.replaceState(null, '', window.location.pathname + (qs ? '?' + qs : '') + window.location.hash); } catch (e) { /* history unavailable */ }
  }

  form.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-filter]') : null;
    if (!b) { return; }
    state[b.getAttribute('data-filter')] = b.getAttribute('data-value');
    apply();
  });
  form.addEventListener('change', function (ev) {
    if (ev.target && ev.target.id === 'sort') { state.sort = ev.target.value === 'oldest' ? 'oldest' : 'newest'; apply(); }
  });
  form.addEventListener('submit', function (ev) { ev.preventDefault(); });
  apply();
})();
