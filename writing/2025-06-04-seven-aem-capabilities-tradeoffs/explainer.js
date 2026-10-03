/* Compare any two of the seven AEM options. The data is read from the four
   matrix tables on this page, so the comparison can never drift from them.
   Without JavaScript the figure stays hidden and the tables are the content. */
(function () {
  'use strict';
  var fig = document.querySelector('[data-mx-compare]');
  var tables = document.querySelectorAll('table[data-mx]');
  if (!fig || !tables.length) return;

  var GROUPS = { functional: 'Functional and authoring', technical: 'Technical and infrastructure' };
  var options = [];          // [{ key, label }] in table order
  var rows = [];             // [{ group, feature, cells: { key: html } }]
  var byFeature = {};

  tables.forEach(function (table) {
    var group = table.dataset.mx;
    var keys = [];
    table.querySelectorAll('thead th[data-opt]').forEach(function (th) {
      keys.push(th.dataset.opt);
      if (!options.some(function (o) { return o.key === th.dataset.opt; })) options.push({ key: th.dataset.opt, label: th.textContent.trim() });
    });
    table.querySelectorAll('tbody tr').forEach(function (tr) {
      var feature = tr.querySelector('th').textContent.trim();
      var id = group + '|' + feature;
      var row = byFeature[id];
      if (!row) { row = byFeature[id] = { group: group, feature: feature, cells: {} }; rows.push(row); }
      tr.querySelectorAll('td').forEach(function (td, i) { row.cells[keys[i]] = td.innerHTML.trim(); });
    });
  });

  var selA = fig.querySelector('[data-mx-a]');
  var selB = fig.querySelector('[data-mx-b]');
  var only = fig.querySelector('[data-mx-only]');
  var out = fig.querySelector('[data-mx-out]');
  var summary = fig.querySelector('[data-mx-summary]');

  var PICK = { aem65: 'Classic AEM 6.5', aemaacs: 'AEM as a Cloud Service', spa: 'AEM with SPA SDKs', cfue: 'Headless Content Fragments + UE', uesites: 'UE with AEM Sites', ueeds: 'AEM UE + EDS', docs: 'Docs with EDS' };
  options.forEach(function (o) {
    selA.add(new Option(PICK[o.key] || o.label, o.key));
    selB.add(new Option(PICK[o.key] || o.label, o.key));
  });
  selA.value = 'aemaacs';
  selB.value = 'docs';

  // "Same" in a cell means "same as Classic AEM 6.5", the first column of the original table.
  function resolve(row, key) {
    var v = row.cells[key];
    return v === 'Same' ? row.cells.aem65 : v;
  }
  function text(html) {
    var d = document.createElement('div');
    d.innerHTML = html;
    return d.textContent.trim();
  }
  function plain(html) { return text(html).toLowerCase(); }
  var SHORT = { aem65: 'Classic AEM 6.5', aemaacs: 'AEM as a Cloud Service', spa: 'SPA SDKs', cfue: 'Headless CF + UE', uesites: 'UE with Sites', ueeds: 'UE + EDS', docs: 'Docs + EDS' };
  function short(key) { return SHORT[key] || label(key); }
  function label(key) {
    for (var i = 0; i < options.length; i++) if (options[i].key === key) return options[i].label;
    return key;
  }

  function render() {
    var a = selA.value, b = selB.value;
    var differ = 0, total = 0;
    var frag = document.createDocumentFragment();
    Object.keys(GROUPS).forEach(function (g) {
      var groupRows = rows.filter(function (r) { return r.group === g; });
      var table = document.createElement('table');
      table.className = 'mx__table';
      var cap = document.createElement('caption');
      cap.textContent = GROUPS[g];
      table.appendChild(cap);
      var head = document.createElement('thead');
      head.innerHTML = '<tr><th scope="col">Feature</th><th scope="col"></th><th scope="col"></th></tr>';
      head.querySelectorAll('th')[1].textContent = short(a);
      head.querySelectorAll('th')[2].textContent = short(b);
      table.appendChild(head);
      var body = document.createElement('tbody');
      groupRows.forEach(function (r) {
        var va = resolve(r, a), vb = resolve(r, b);
        var same = plain(va) === plain(vb);
        total += 1;
        if (!same) differ += 1;
        if (only.checked && same) return;
        var tr = document.createElement('tr');
        if (!same) tr.className = 'is-diff';
        var th = document.createElement('th');
        th.scope = 'row';
        th.textContent = r.feature;
        if (!same) {
          var tag = document.createElement('span');
          tag.className = 'mx__tag';
          tag.textContent = 'differs';
          th.appendChild(tag);
        }
        tr.appendChild(th);
        [r.cells[a], r.cells[b]].forEach(function (html, i) {
          var td = document.createElement('td');
          td.innerHTML = html;
          if (html === 'Same') {
            var note = document.createElement('span');
            note.className = 'mx__same';
            note.textContent = ' as Classic AEM 6.5: ' + text(r.cells.aem65);
            td.appendChild(note);
          }
          tr.appendChild(td);
        });
        body.appendChild(tr);
      });
      table.appendChild(body);
      if (body.children.length) frag.appendChild(table);
    });
    out.innerHTML = '';
    out.appendChild(frag);
    summary.textContent = a === b
      ? 'Same option on both sides. Pick a different one to compare.'
      : differ + ' of ' + total + ' rows differ between ' + short(a) + ' and ' + short(b) + '.';
    fig.dataset.differ = String(differ);
  }

  selA.addEventListener('change', render);
  selB.addEventListener('change', render);
  only.addEventListener('change', render);
  fig.hidden = false;
  render();
})();
