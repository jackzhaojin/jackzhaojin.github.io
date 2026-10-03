/* Spec filter lab for Part 1.
   Runs the validation loop from app/api/agent/evaluate-figma-specs/route.ts in
   jackzhaojin/shadow-pivot-ai-agentv2, before the fix (5919200) and after it
   (dc287d3): same checks, same order, same status codes and messages.
   The model call (evaluateFigmaSpecs) is not run here. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-sf]');
  if (!lab) return;

  // What each choice puts in the request body, as the route would receive it.
  var KINDS = {
    valid: function (n) { return { name: 'Spec ' + n, designSystem: {}, layout: {} }; },
    missing: function () { return { designSystem: {}, layout: {} }; },
    nullname: function () { return { name: null, designSystem: {} }; },
    empty: function () { return { name: '', designSystem: {} }; },
    notobject: function () { return null; }
  };

  // Lines 32-47 at 5919200: the first bad spec ends the request.
  function before(figmaSpecs) {
    var checked = [];
    for (var i = 0; i < figmaSpecs.length; i++) {
      var spec = figmaSpecs[i];
      if (!spec || typeof spec !== 'object') {
        checked.push('fail');
        return { status: 400, checked: checked, body: { success: false, error: 'Invalid spec at index ' + i + ': must be an object' } };
      }
      if (!spec.name || typeof spec.name !== 'string') {
        checked.push('fail');
        return { status: 400, checked: checked, body: { success: false, error: 'Invalid spec at index ' + i + ': missing or invalid name field' } };
      }
      checked.push('pass');
    }
    return { status: 200, checked: checked, evaluated: figmaSpecs.length, body: { success: true, evaluationResults: '__RESULTS__', message: 'Figma specs evaluated successfully' } };
  }

  // Lines 32-91 at dc287d3: bad specs are filtered out and the rest go on.
  function after(figmaSpecs) {
    var validSpecs = [];
    var invalidSpecs = [];
    var checked = [];
    for (var i = 0; i < figmaSpecs.length; i++) {
      var spec = figmaSpecs[i];
      if (!spec || typeof spec !== 'object') {
        invalidSpecs.push({ index: i, reason: 'must be an object' });
        checked.push('fail');
        continue;
      }
      if (!spec.name || typeof spec.name !== 'string') {
        invalidSpecs.push({ index: i, reason: 'missing or invalid name field' });
        checked.push('fail');
        continue;
      }
      validSpecs.push(spec);
      checked.push('pass');
    }
    if (validSpecs.length === 0) {
      return { status: 400, checked: checked, body: { success: false, error: 'No valid specs found', invalidSpecs: invalidSpecs } };
    }
    var body = { success: true, evaluationResults: '__RESULTS__', message: 'Figma specs evaluated successfully' };
    if (invalidSpecs.length > 0) {
      body.warning = invalidSpecs.length + ' invalid specs were filtered out';
      body.invalidSpecs = invalidSpecs;
    }
    return { status: 200, checked: checked, evaluated: validSpecs.length, body: body };
  }

  var selects = Array.prototype.slice.call(lab.querySelectorAll('select[data-spec]'));
  var cards = Array.prototype.slice.call(lab.querySelectorAll('.sf__spec'));
  var modes = Array.prototype.slice.call(lab.querySelectorAll('[data-mode]'));
  var out = lab.querySelector('[data-out]');
  var mode = 'before';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function render() {
    var specs = selects.map(function (s, i) { return KINDS[s.value](i + 1); });
    var r = (mode === 'before' ? before : after)(specs);
    cards.forEach(function (c, i) { c.setAttribute('data-state', r.checked[i] || 'skip'); });
    var json = JSON.stringify(r.body, null, 2).replace(
      '"__RESULTS__"',
      '[ /* ' + r.evaluated + ' result' + (r.evaluated === 1 ? '' : 's') + ' from evaluateFigmaSpecs(), the model call, not run here */ ]'
    );
    var story;
    if (r.status === 200 && r.evaluated === specs.length) story = 'All ' + specs.length + ' specs go on to the model for evaluation.';
    else if (r.status === 200) story = r.evaluated + ' of ' + specs.length + ' specs go on. The flow keeps going and the response says what was dropped.';
    else if (mode === 'before') story = 'The first bad spec ends the request. The whole step fails and the flow stops, whatever the other specs looked like.';
    else story = 'Nothing valid is left, so this still fails.';
    out.innerHTML =
      '<span class="sf__status ' + (r.status === 200 ? 'ok' : 'no') + '">HTTP ' + r.status + '</span>' +
      '<pre class="sf__body">' + esc(json) + '</pre>' +
      '<p class="sf__story">' + esc(story) + '</p>';
  }

  modes.forEach(function (b) {
    b.addEventListener('click', function () {
      mode = b.getAttribute('data-mode');
      modes.forEach(function (m) { m.setAttribute('aria-checked', String(m === b)); });
      render();
    });
  });
  selects.forEach(function (s) { s.addEventListener('change', render); });
  lab.querySelectorAll('[data-js]').forEach(function (el) { el.hidden = false; });
  lab.querySelectorAll('[data-nojs]').forEach(function (el) { el.hidden = true; });
  render();
})();
