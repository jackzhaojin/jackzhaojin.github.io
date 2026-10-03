/* Pick one capability and see all six platforms on it. Reads the comparison table
   on this page, so the two always match. Without JavaScript the table is shown. */
(function () {
  'use strict';
  var fig = document.querySelector('[data-pv]');
  if (!fig) return;
  var table = fig.querySelector('[data-pv-table]');
  var wrap = fig.querySelector('.pv__wrap');
  var chips = fig.querySelector('.pv__chips');
  var out = fig.querySelector('[data-pv-out]');

  var caps = [].slice.call(table.querySelectorAll('thead th')).slice(1).map(function (th) { return th.textContent.trim(); });
  var rows = [].slice.call(table.querySelectorAll('tbody tr')).map(function (tr) {
    return {
      name: tr.querySelector('th').textContent.trim(),
      eds: tr.classList.contains('pv__eds'),
      values: [].slice.call(tr.querySelectorAll('td')).map(function (td) { return td.textContent.trim(); })
    };
  });

  function show(index) {
    chips.querySelectorAll('button').forEach(function (b) { b.setAttribute('aria-checked', String(Number(b.dataset.i) === index)); });
    var all = index === -1;
    wrap.hidden = !all;
    out.hidden = all;
    if (all) return;
    var list = document.createElement('ol');
    list.className = 'pv__list';
    rows.forEach(function (r) {
      var li = document.createElement('li');
      if (r.eds) li.className = 'is-eds';
      var name = document.createElement('span');
      name.className = 'pv__name';
      name.textContent = r.name;
      var val = document.createElement('span');
      val.className = 'pv__val';
      val.textContent = r.values[index];
      li.appendChild(name);
      li.appendChild(val);
      list.appendChild(li);
    });
    var head = document.createElement('p');
    head.className = 'pv__head';
    head.textContent = caps[index];
    out.innerHTML = '';
    out.appendChild(head);
    out.appendChild(list);
  }

  var SHORT = { 'Authoring surface': 'Authoring', 'Preview support': 'Preview', 'Enterprise workflows': 'Workflows', 'Edge support': 'Edge' };
  chips.setAttribute('aria-label', 'Pick a capability');
  caps.forEach(function (c, i) {
    var b = document.createElement('button');
    b.type = 'button';
    b.setAttribute('role', 'radio');
    b.dataset.i = String(i);
    b.textContent = SHORT[c] || c;
    if (SHORT[c]) b.setAttribute('aria-label', c);
    chips.appendChild(b);
  });
  var allBtn = document.createElement('button');
  allBtn.type = 'button';
  allBtn.setAttribute('role', 'radio');
  allBtn.dataset.i = '-1';
  allBtn.textContent = 'Full table';
  chips.appendChild(allBtn);
  chips.addEventListener('click', function (e) {
    var b = e.target.closest('button[data-i]');
    if (b) show(Number(b.dataset.i));
  });
  chips.addEventListener('keydown', function (e) {
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var list = [].slice.call(chips.querySelectorAll('button'));
    var at = list.indexOf(document.activeElement);
    if (at < 0) return;
    var next = list[(at + (e.key === 'ArrowRight' ? 1 : list.length - 1)) % list.length];
    next.focus();
    show(Number(next.dataset.i));
    e.preventDefault();
  });
  chips.hidden = false;
  show(0);
})();
