/* kimi-k3 design system / scripts.js
   Blog collection filter and sort only. Content is in the HTML; this file
   hides and shows cards, reorders them, and mirrors the state into the query
   string. Without JavaScript every card is visible and topic links still work. */
(function () {
  'use strict';
  var form = document.querySelector('.filter-bar[data-collection]');
  var grid = document.querySelector('[data-collection-grid]');
  if (!form || !grid) { return; }

  var cards = Array.prototype.slice.call(grid.querySelectorAll('.card--post'));
  var status = form.querySelector('[data-status]');
  var sortSel = form.querySelector('select[name="sort"]');
  var total = cards.length;

  /* hub slug in the query string to a predicate over card data attributes.
     The AEM + AI hub is a curated set that is not in the shared data yet;
     until it exists the flagship link shows the AEM topic posts. */
  var TOPIC = {
    'aem-ai': function (c) { return c.getAttribute('data-topic') === 'aem'; },
    'adobe-aem': function (c) { return c.getAttribute('data-topic') === 'aem'; },
    'ai-agents': function (c) { return c.getAttribute('data-topic') === 'ai'; },
    'working-with-ai': function (c) { return c.getAttribute('data-type') === 'leadership'; }
  };
  var TOPIC_LABEL = { 'aem-ai': 'AEM + AI', 'adobe-aem': 'Adobe AEM and EDS', 'ai-agents': 'AI Agents', 'working-with-ai': 'Working with AI' };

  var params = new URLSearchParams(window.location.search);
  var state = {
    topic: TOPIC[params.get('topic')] ? params.get('topic') : '',
    format: params.get('format') || 'all',
    type: params.get('type') || 'all',
    sort: params.get('sort') === 'oldest' ? 'oldest' : 'newest'
  };

  function apply() {
    var shown = 0;
    var topicFn = state.topic ? TOPIC[state.topic] : null;
    cards.forEach(function (card) {
      var ok = (!topicFn || topicFn(card)) &&
        (state.format === 'all' || card.getAttribute('data-media') === state.format) &&
        (state.type === 'all' || card.getAttribute('data-type') === state.type);
      card.classList.toggle('is-hidden', !ok);
      if (ok) { shown++; }
    });
    cards.sort(function (a, b) {
      var da = a.getAttribute('data-date') || '', db = b.getAttribute('data-date') || '';
      return state.sort === 'newest' ? db.localeCompare(da) : da.localeCompare(db);
    });
    cards.forEach(function (c) { grid.appendChild(c); });

    /* controls */
    var buttons = form.querySelectorAll('button[data-filter]');
    for (var i = 0; i < buttons.length; i++) {
      var b = buttons[i];
      b.setAttribute('aria-pressed', state[b.getAttribute('data-filter')] === b.getAttribute('data-value') ? 'true' : 'false');
    }
    var links = form.querySelectorAll('a.chip');
    for (var j = 0; j < links.length; j++) {
      var href = links[j].getAttribute('href') || '';
      var m = href.match(/[?&]topic=([^&]+)/);
      var current = m ? m[1] === state.topic : (!state.topic && /blog\.html$/.test(href));
      if (current) { links[j].setAttribute('aria-current', 'true'); } else { links[j].removeAttribute('aria-current'); }
    }
    if (sortSel) { sortSel.value = state.sort; }

    /* status line */
    if (status) {
      var parts = ['Showing ' + shown + ' of ' + total + ' posts.'];
      if (state.topic) { parts.push('Topic: ' + TOPIC_LABEL[state.topic] + '.'); }
      if (state.format !== 'all') { parts.push('Format: ' + state.format + '.'); }
      if (state.type !== 'all') { parts.push('Type: ' + state.type + '.'); }
      parts.push(state.sort === 'newest' ? 'Newest first.' : 'Oldest first.');
      status.textContent = parts.join(' ');
    }

    /* query string mirrors non-default state; the canonical link stays clean */
    var q = new URLSearchParams();
    if (state.topic) { q.set('topic', state.topic); }
    if (state.format !== 'all') { q.set('format', state.format); }
    if (state.type !== 'all') { q.set('type', state.type); }
    if (state.sort !== 'newest') { q.set('sort', state.sort); }
    var qs = q.toString();
    var url = window.location.pathname + (qs ? '?' + qs : '') + window.location.hash;
    if (window.history && window.history.replaceState) { window.history.replaceState(null, '', url); }
  }

  form.addEventListener('click', function (ev) {
    var b = ev.target.closest ? ev.target.closest('button[data-filter]') : null;
    if (!b) { return; }
    state[b.getAttribute('data-filter')] = b.getAttribute('data-value');
    apply();
  });
  if (sortSel) {
    sortSel.addEventListener('change', function () { state.sort = sortSel.value === 'oldest' ? 'oldest' : 'newest'; apply(); });
  }
  form.addEventListener('submit', function (ev) { ev.preventDefault(); apply(); });

  apply();
})();
