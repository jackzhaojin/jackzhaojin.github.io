/* Guard lab: the same three checks, in the same order, with the same output as
   plugins/hlx-admin-api-executor-guarded/hooks/guard-admin-api.sh in
   jackzhaojin/ai-builder-kit at cfb0f59. The script greps the command line by line,
   so this port tests each line separately too. Nothing is sent anywhere. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-guard]');
  if (!lab) return;
  var box = lab.querySelector('textarea');
  var chips = [].slice.call(lab.querySelectorAll('.chips button'));
  var gates = [].slice.call(lab.querySelectorAll('[data-gate]'));
  var verdict = lab.querySelector('.verdict');
  var current = null;

  var RE_CURL = /curl\b/i;                                          // line 20
  var RE_METHOD = /(--request|-X)\s+(POST|PUT|DELETE|PATCH)/i;      // line 21
  var RE_TARGET = /(admin\.hlx\.page|\$\{?BASE_URL\}?)/i;           // line 22
  var RE_URL = /(admin\.hlx\.page|BASE_URL)[^ ]*/i;                 // line 30

  function firstMatch(lines, re) {
    for (var i = 0; i < lines.length; i++) { var m = lines[i].match(re); if (m) return m[0]; }
    return '';
  }

  function guard(cmd) {
    if (!cmd) return { steps: ['skip', 'skip', 'skip'], ask: false, empty: true };
    var lines = cmd.split('\n');
    var any = function (re) { return lines.some(function (l) { return re.test(l); }); };
    var c1 = any(RE_CURL), c2 = c1 && any(RE_METHOD), c3 = c2 && any(RE_TARGET);
    var steps = [c1 ? 'pass' : 'miss', c1 ? (c2 ? 'pass' : 'miss') : 'skip', c2 ? (c3 ? 'pass' : 'miss') : 'skip'];
    if (!c3) return { steps: steps, ask: false };
    var method = firstMatch(lines, RE_METHOD).split(/\s+/).pop().toUpperCase();
    var target = firstMatch(lines, RE_URL) || 'admin.hlx.page';
    return { steps: steps, ask: true, out: { hookSpecificOutput: { hookEventName: 'PreToolUse', permissionDecision: 'ask', permissionDecisionReason: '[HLX Admin API Guard] ' + method + ' request to ' + target + '. This is a destructive admin API operation. Approve?' } } };
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;'); }

  function render() {
    var r = guard(box.value);
    var hits = [RE_CURL, RE_METHOD, RE_TARGET];
    gates.forEach(function (g, i) {
      var st = r.steps[i];
      g.dataset.state = st === 'pass' ? 'hit' : st === 'miss' ? 'exit' : 'skip';
      var msg = g.querySelector('.gate__msg');
      if (st === 'pass') msg.textContent = 'matched: ' + firstMatch(box.value.split('\n'), hits[i]);
      else if (st === 'miss') msg.textContent = 'no match, so the script exits 0 here';
      else msg.textContent = '';
      msg.style.display = st === 'skip' ? 'none' : 'block';
    });
    var note = current && current.dataset.note ? ' <span class="verdict__note">' + esc(current.dataset.note) + '</span>' : '';
    if (r.ask) {
      verdict.innerHTML = '<p><span class="ask">Stops for approval.</span>' + note + '</p><p class="verdict__sub">The hook prints this, and Claude Code shows the reason in its prompt:</p><pre>' + esc(JSON.stringify(r.out, null, 2)) + '</pre>';
    } else {
      verdict.innerHTML = '<p><span class="allow">Runs without a prompt.</span>' + (note || (r.empty ? ' Empty command: the script fails open and exits 0.' : ' The script exits 0 with no output, so Claude Code runs the command.')) + '</p>';
    }
  }

  chips.forEach(function (b) {
    b.addEventListener('click', function () {
      chips.forEach(function (c) { c.setAttribute('aria-checked', String(c === b)); });
      current = b;
      box.value = b.dataset.cmd;
      render();
    });
  });
  box.addEventListener('input', function () { current = null; chips.forEach(function (c) { c.setAttribute('aria-checked', 'false'); }); render(); });
  lab.querySelectorAll('[hidden][data-js]').forEach(function (el) { el.hidden = false; });
  var stat = lab.querySelector('.lab__static'); if (stat) stat.remove();
  chips[1].click();
})();
