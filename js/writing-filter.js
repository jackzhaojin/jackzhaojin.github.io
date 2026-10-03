/* Technical Writing listing: search, topic and year filters and sorting, in place.
   Every article is in the initial HTML; without JavaScript the full list shows newest first
   and the filter bar stays hidden. State lives in the URL fragment so a selection can be
   shared (#topic=aem&year=2025&q=caching), and nothing reloads or navigates. */
(function () {
  var bar = document.querySelector('[data-writing-filter]');
  var list = document.querySelector('.writing-list');
  if (!bar || !list) return;

  var items = Array.prototype.slice.call(list.children).map(function (li, i) {
    return {
      li: li,
      date: li.getAttribute('data-date') || '',
      topics: (li.getAttribute('data-topics') || '').split(' '),
      year: (li.getAttribute('data-date') || '').slice(0, 4),
      title: li.getAttribute('data-title') || '',
      text: normalize(li.getAttribute('data-search') || li.textContent),
      order: i
    };
  });

  var search = bar.querySelector('#writing-search');
  var sort = bar.querySelector('#writing-sort');
  var count = bar.querySelector('[data-count]');
  var empty = document.querySelector('[data-writing-empty]');
  var chips = Array.prototype.slice.call(bar.querySelectorAll('button[data-filter]'));
  var defaults = { q: '', topic: 'all', year: 'all', sort: 'newest' };
  var state = Object.assign({}, defaults);
  var timer;

  function normalize(s) {
    return String(s).toLowerCase().normalize('NFKD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9.+#/ ]+/g, ' ');
  }

  function matches(item, s, skip) {
    if (skip !== 'topic' && s.topic !== 'all' && item.topics.indexOf(s.topic) === -1) return false;
    if (skip !== 'year' && s.year !== 'all' && item.year !== s.year) return false;
    var terms = normalize(s.q).split(' ').filter(Boolean);
    for (var i = 0; i < terms.length; i++) if (item.text.indexOf(terms[i]) === -1) return false;
    return true;
  }

  function compare(a, b) {
    if (state.sort === 'oldest') return a.date.localeCompare(b.date) || a.order - b.order;
    if (state.sort === 'title') return a.title.localeCompare(b.title, 'en', { sensitivity: 'base' });
    return b.date.localeCompare(a.date) || a.order - b.order;
  }

  function render() {
    var shown = 0;
    var sorted = items.slice().sort(compare);
    var first = null;
    var lastYear = null;
    var byDate = state.sort !== 'title';
    sorted.forEach(function (item) {
      list.appendChild(item.li);
      var ok = matches(item, state);
      item.li.hidden = !ok;
      item.li.removeAttribute('data-first');
      item.li.removeAttribute('data-year-mark');
      if (!ok) return;
      shown++;
      if (!first) first = item.li;
      // Year chapters only make sense when the list runs in date order.
      if (byDate && item.year !== lastYear) item.li.setAttribute('data-year-mark', item.year);
      lastYear = item.year;
    });
    if (first) first.setAttribute('data-first', '');

    chips.forEach(function (chip) {
      var key = chip.getAttribute('data-filter');
      var value = chip.getAttribute('data-value');
      chip.setAttribute('aria-pressed', String(state[key] === value));
      var n = chip.querySelector('.chip__n');
      if (n) {
        var probe = Object.assign({}, state);
        probe[key] = value;
        var c = items.filter(function (item) { return matches(item, probe); }).length;
        n.textContent = c;
        chip.classList.toggle('is-zero', c === 0 && state[key] !== value);
      }
    });

    count.textContent = shown === items.length ? 'All ' + items.length + ' pieces' : shown + ' of ' + items.length + ' pieces';
    if (empty) empty.hidden = shown !== 0;
    writeHash();
  }

  function writeHash() {
    var parts = [];
    Object.keys(defaults).forEach(function (k) {
      if (state[k] !== defaults[k]) parts.push(k + '=' + encodeURIComponent(state[k]));
    });
    var hash = parts.length ? '#' + parts.join('&') : '';
    // Leave a plain #article-id anchor alone when no filter is active.
    if (!parts.length && location.hash.indexOf('=') === -1) return;
    if (hash !== location.hash && history.replaceState) {
      history.replaceState(null, '', location.pathname + location.search + hash);
    }
  }

  function readHash() {
    state = Object.assign({}, defaults);
    location.hash.replace(/^#/, '').split('&').forEach(function (pair) {
      var i = pair.indexOf('=');
      if (i < 1) return;
      var k = pair.slice(0, i);
      var v = decodeURIComponent(pair.slice(i + 1));
      if (k in defaults) state[k] = v;
    });
    // Ignore values that no control offers, so a stale link still shows everything.
    ['topic', 'year'].forEach(function (k) {
      if (!bar.querySelector('button[data-filter="' + k + '"][data-value="' + CSS.escape(state[k]) + '"]')) state[k] = 'all';
    });
    if (!sort.querySelector('option[value="' + CSS.escape(state.sort) + '"]')) state.sort = 'newest';
    search.value = state.q;
    sort.value = state.sort;
  }

  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      state[chip.getAttribute('data-filter')] = chip.getAttribute('data-value');
      render();
    });
  });
  search.addEventListener('input', function () {
    clearTimeout(timer);
    timer = setTimeout(function () { state.q = search.value.trim(); render(); }, 120);
  });
  bar.addEventListener('submit', function (e) { e.preventDefault(); state.q = search.value.trim(); render(); });
  sort.addEventListener('change', function () { state.sort = sort.value; render(); });
  Array.prototype.forEach.call(document.querySelectorAll('[data-writing-reset]'), function (btn) {
    btn.addEventListener('click', function () {
      state = Object.assign({}, defaults);
      search.value = '';
      sort.value = 'newest';
      render();
      search.focus();
    });
  });
  window.addEventListener('hashchange', function () { readHash(); render(); });
  document.addEventListener('keydown', function (e) {
    var t = e.target;
    if (e.key === '/' && !e.metaKey && !e.ctrlKey && !e.altKey && !(t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName))) {
      e.preventDefault();
      search.focus();
    }
  });

  bar.hidden = false;
  readHash();
  render();
})();
