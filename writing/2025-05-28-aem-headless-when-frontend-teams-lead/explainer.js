/* Cache lab: a regular GraphQL query (POST) next to a persisted query (GET).
   The rule it runs is the one in Adobe's persisted queries documentation: a GET
   response can be cached at the Dispatcher and CDN, a POST response cannot easily
   be. A GET is cached under its full URL, so each variable value is its own entry.
   Without JavaScript the figure keeps its fixed five-request example. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-pq]');
  if (!lab) return;

  var controls = lab.querySelector('.pq__controls');
  var req = lab.querySelector('[data-req]');
  var verdict = lab.querySelector('[data-verdict]');
  var log = lab.querySelector('[data-log]');
  var count = lab.querySelector('[data-count]');
  var nodes = {};
  lab.querySelectorAll('[data-node]').forEach(function (n) { nodes[n.dataset.node] = n; });
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)');

  var QUERY = 'my-site/articles-by-locale';
  var state = { method: 'GET', locale: 'en' };
  var cache = new Set();
  var sent = 0, reached = 0, run = 0, timers = [];

  function url() {
    return state.method === 'GET'
      ? '/graphql/execute.json/' + QUERY + ';locale=' + state.locale
      : '<GraphQL endpoint>, with the query and locale "' + state.locale + '" in the request body';
  }
  function showReq() {
    req.innerHTML = '';
    var m = document.createElement('span');
    m.className = 'pq__m';
    m.textContent = state.method;
    req.appendChild(m);
    req.appendChild(document.createTextNode(' ' + url()));
  }
  function clearPath() {
    timers.forEach(clearTimeout);
    timers = [];
    Object.keys(nodes).forEach(function (k) { nodes[k].className = ''; });
  }
  function light(steps) {
    // steps: [[node, className], ...] lit one after another.
    clearPath();
    var my = run;
    steps.forEach(function (s, i) {
      var apply = function () { if (my === run) nodes[s[0]].classList.add(s[1]); };
      if (reduce.matches) apply();
      else timers.push(setTimeout(apply, i * 260));
    });
  }
  function select(group, attr, value) {
    group.querySelectorAll('button').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.getAttribute(attr) === value));
    });
  }
  function addRow(cells, hit) {
    var tr = document.createElement('tr');
    tr.className = 'is-new';
    cells.forEach(function (c, i) {
      var td = document.createElement('td');
      if (i === 1) {
        var code = document.createElement('code');
        code.textContent = state.method;
        td.appendChild(code);
        td.appendChild(document.createTextNode(state.method === 'GET' ? ' ;locale=' + state.locale : ' locale=' + state.locale));
      } else {
        td.textContent = c;
      }
      if (i === 2 && hit) td.className = 'hit';
      tr.appendChild(td);
    });
    log.querySelectorAll('tr.is-new').forEach(function (r) { r.classList.remove('is-new'); });
    log.insertBefore(tr, log.firstChild);
    while (log.children.length > 6) log.removeChild(log.lastChild);
  }
  function updateCount() {
    count.textContent = sent + ' sent · ' + reached + ' reached AEM · ' + (sent - reached) + ' served from cache';
  }

  function send() {
    run += 1;
    sent += 1;
    var key = state.method + ' ' + url();
    var result;
    if (state.method === 'POST') {
      reached += 1;
      result = 'post';
      light([['browser', 'is-on'], ['cache', 'is-off'], ['aem', 'is-on']]);
      verdict.innerHTML = '<b>Not cacheable.</b> A POST goes past the cache to AEM every time, even when it asks for exactly the same thing.';
      addRow([sent, '', 'not cacheable', 'yes'], false);
    } else if (cache.has(key)) {
      result = 'hit';
      light([['browser', 'is-on'], ['cache', 'is-hit'], ['aem', 'is-off']]);
      verdict.innerHTML = '<b>Cache hit.</b> This exact URL was stored by an earlier request, so AEM never sees this one.';
      addRow([sent, '', 'hit', 'no'], true);
    } else {
      reached += 1;
      cache.add(key);
      result = 'miss';
      light([['browser', 'is-on'], ['cache', 'is-on'], ['aem', 'is-on']]);
      verdict.innerHTML = '<b>Cache miss.</b> First time this URL is asked for, so AEM answers and the response is stored under <code>;locale=' + state.locale + '</code>. Send it again.';
      addRow([sent, '', 'miss, stored', 'yes'], false);
    }
    lab.dataset.last = result;
    updateCount();
  }

  function reset() {
    run += 1;
    cache.clear();
    sent = 0;
    reached = 0;
    log.innerHTML = '';
    clearPath();
    verdict.textContent = 'Caches cleared. Pick a query and a locale, then send a request.';
    updateCount();
  }

  var methodGroup = lab.querySelector('[aria-labelledby="pq-method"]');
  var localeGroup = lab.querySelector('[aria-labelledby="pq-locale"]');
  methodGroup.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-method]');
    if (!b) return;
    state.method = b.dataset.method;
    select(methodGroup, 'data-method', state.method);
    showReq();
  });
  localeGroup.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-locale]');
    if (!b) return;
    state.locale = b.dataset.locale;
    select(localeGroup, 'data-locale', state.locale);
    showReq();
  });
  lab.querySelector('[data-send]').addEventListener('click', send);
  lab.querySelector('[data-reset]').addEventListener('click', reset);

  // Switch from the static example to the live lab.
  controls.hidden = false;
  count.hidden = false;
  log.innerHTML = '';
  verdict.textContent = 'Pick a query and a locale, then send a request. Try the same persisted query twice.';
  showReq();
  updateCount();
})();
