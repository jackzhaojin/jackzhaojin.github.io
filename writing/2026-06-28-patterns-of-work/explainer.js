/* "Walk the five layers": turns the static list of layers into a layer map with the
   spine beside it. Pick a layer to see its climb, where it gets hard and its four spine
   cells. Pick a pillar to follow it up all five layers. All text is read from the list
   in the HTML, so the explainer cannot say anything the page does not. */
(function () {
  'use strict';
  var fig = document.querySelector('[data-pow]');
  if (!fig) return;
  var ui = fig.querySelector('.pow__ui');
  var data = fig.querySelector('.pow__data');
  var layersEl = fig.querySelector('.pow__layers');
  var spineEl = fig.querySelector('.pow__spine');
  var panel = fig.querySelector('.pow__panel');
  if (!ui || !data || !layersEl || !spineEl || !panel) return;

  var items = Array.prototype.slice.call(data.querySelectorAll('.pow__layer'));
  var PILLARS = ['context', 'governance', 'observability', 'evals'];
  var LABEL = { context: 'Context', governance: 'Governance', observability: 'Observability', evals: 'Evals' };

  // Wrap each climb step in a span so it renders as a chip with an arrow between.
  items.forEach(function (li) {
    li.querySelectorAll('.pow__climb > li').forEach(function (step) {
      var s = document.createElement('span');
      s.textContent = step.textContent;
      step.textContent = '';
      step.appendChild(s);
    });
  });

  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var layerBtns = items.map(function (li) {
    var b = el('button', 'pow__lbtn');
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-controls', li.id);
    b.appendChild(el('span', 'pow__n', li.dataset.layer));
    b.appendChild(el('span', null, li.dataset.short));
    b.addEventListener('click', function () { showLayer(li.dataset.layer); });
    layersEl.appendChild(b);
    return b;
  });

  var pillarBtns = PILLARS.map(function (p) {
    var b = el('button', 'pow__pbtn', LABEL[p]);
    b.type = 'button';
    b.setAttribute('aria-pressed', 'false');
    b.setAttribute('aria-label', 'Follow ' + LABEL[p] + ' up all five layers');
    b.addEventListener('click', function () { showPillar(p); });
    spineEl.appendChild(b);
    return b;
  });

  panel.appendChild(data);
  var col = el('div', 'pow__col');
  col.hidden = true;
  panel.appendChild(col);

  function press(list, active) {
    list.forEach(function (b) { b.setAttribute('aria-pressed', b === active ? 'true' : 'false'); });
  }

  function showLayer(n) {
    items.forEach(function (li) { li.hidden = li.dataset.layer !== String(n); });
    data.hidden = false;
    col.hidden = true;
    layersEl.classList.remove('is-pillar');
    press(layerBtns, layerBtns[Number(n) - 1]);
    press(pillarBtns, null);
  }

  function showPillar(p) {
    col.textContent = '';
    var name = el('p', 'pow__name');
    var em = el('em', null, LABEL[p]);
    var t = el('span');
    t.appendChild(em);
    t.appendChild(document.createTextNode(', up the five layers'));
    name.appendChild(t);
    col.appendChild(name);
    var rows = el('ol', 'pow__rows');
    items.forEach(function (li) {
      var cell = li.querySelector('[data-pillar="' + p + '"] dd');
      var row = el('button', 'pow__row');
      row.type = 'button';
      row.appendChild(el('span', 'pow__n', li.dataset.layer));
      row.appendChild(el('span', null, li.dataset.short));
      row.appendChild(el('b', null, cell ? cell.textContent : ''));
      row.setAttribute('aria-label', 'Layer ' + li.dataset.layer + ', ' + li.dataset.short + ': ' + (cell ? cell.textContent : '') + '. Open this layer.');
      row.addEventListener('click', function () { showLayer(li.dataset.layer); layerBtns[Number(li.dataset.layer) - 1].focus(); });
      var wrap = el('li');
      wrap.appendChild(row);
      rows.appendChild(wrap);
    });
    col.appendChild(rows);
    col.appendChild(el('p', 'pow__hint', 'Pick a row to open that layer.'));
    var go = el('p', 'pow__go');
    var a = el('a', null, 'Read about the spine');
    a.href = '#spine';
    go.appendChild(a);
    col.appendChild(go);
    data.hidden = true;
    col.hidden = false;
    layersEl.classList.add('is-pillar');
    press(layerBtns, null);
    press(pillarBtns, pillarBtns[PILLARS.indexOf(p)]);
  }

  ui.hidden = false;
  fig.classList.add('is-live');
  showLayer(1);
})();
