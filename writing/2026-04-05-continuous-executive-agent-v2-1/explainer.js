/* Failure ladder. Four outcomes for one goal on the failure path of
   src/core/executive-loop.ts at v2.1.4 (lines 583 to 719): count the attempt,
   run the agentic diagnosis from the third failure, return early when the
   diagnosis escalates or suggests a fix, and block at MAX_RETRIES = 10 otherwise.
   Log lines use the code's own messages. The goal and the diagnosis answers are
   made up. Without JavaScript the figure shows the "never passes" outcome. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ladder]');
  if (!root) return;

  var MAX_RETRIES = 10; // executive-loop.ts line 95
  var DIAGNOSIS_AT = 3; // executive-loop.ts line 646

  var picks = [].slice.call(root.querySelectorAll('[data-s]'));
  var countEl = root.querySelector('[data-count]');
  var noteEl = root.querySelector('[data-count-note]');
  var pipsEl = root.querySelector('[data-pips]');
  var logEl = root.querySelector('[data-log]');
  var verdictEl = root.querySelector('[data-verdict]');

  // Each outcome: how many attempts fail, what the diagnosis says, how it ends.
  var OUTCOMES = {
    pass: { fails: 1, decision: null, end: 'pass',
      verdict: ['ok', 'Passed on the second try. Under three failures there is no diagnosis: the retry prompt carries the last error and asks for a different approach.'] },
    limit: { fails: 10, decision: 'none', end: 'blocked',
      verdict: ['no', 'Blocked after 10 failed attempts, the limit in the constitution. The goal goes to needs-you.md, Discord pings me, and the loop moves on to the next goal.'] },
    escalate: { fails: 3, decision: 'escalate', end: 'escalated',
      verdict: ['no', 'Blocked early, after 3 attempts. The diagnosis decided this needs a human, so the goal goes to needs-you.md with the diagnosis attached.'] },
    fixes: { fails: 12, decision: 'fix', end: 'running',
      verdict: ['no', 'Still retrying at attempt 12, past the limit of 10. A suggested fix returns before the limit check, so the limit never fires while the diagnosis keeps finding fixes.'] }
  };

  var DECISION = {
    none: 'Decision: Continue normal retry logic',
    escalate: 'Decision: Escalate to human (needs-you.md)',
    fix: 'Decision: Apply suggested fix and retry'
  };

  function add(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text + '\n';
    logEl.appendChild(s);
  }

  function attempt(n, o) {
    add('d', 'PHASE 6: Update State (Failure)');
    add('x', '  Attempt ' + n + '/' + MAX_RETRIES + ' failed');
    if (n < DIAGNOSIS_AT) return;
    add('a', 'PHASE 7: Agentic Diagnosis (Investigate Failure)');
    add('a', '  ' + DECISION[o.decision]);
  }

  function show(key) {
    var o = OUTCOMES[key];
    picks.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.s === key)); });

    logEl.textContent = '';
    for (var n = 1; n <= o.fails; n++) {
      // keep long runs readable: show the first three and the last one
      if (o.fails > 4 && n > DIAGNOSIS_AT && n < o.fails) {
        if (n === DIAGNOSIS_AT + 1) add('n', '  # attempts ' + n + ' to ' + (o.fails - 1) + ' repeat the same pattern');
        continue;
      }
      attempt(n, o);
    }
    if (o.end === 'pass') {
      add('d', 'PHASE 6: Update State (Success)');
      add('ok', '  # step complete, Notion and Discord updated, next goal');
    } else if (o.end === 'blocked') {
      add('d', 'PHASE 8: Max Retries Reached (Constitution Limit)');
      add('x', '  Marking as blocked after ' + MAX_RETRIES + ' attempts');
    } else if (o.end === 'escalated') {
      add('n', '  # blocked with the diagnosis, Discord notified, next goal');
    } else {
      add('n', '  # returns early: the 10-attempt check below never runs');
    }

    logEl.scrollTop = logEl.scrollHeight; // the ending is the point
    countEl.textContent = String(o.fails);
    var over = o.fails - MAX_RETRIES;
    noteEl.textContent = over > 0 ? 'of 10, and ' + over + ' past the limit' : 'of 10, the limit in the constitution';
    var pips = pipsEl.children;
    for (var i = 0; i < pips.length; i++) {
      var k = '';
      if (i < o.fails) k = i < DIAGNOSIS_AT - 1 ? 'fail' : (o.decision === 'fix' ? 'fix' : 'diag');
      else if (i === o.fails && o.end === 'pass') k = 'pass';
      if (k) pips[i].setAttribute('data-k', k); else pips[i].removeAttribute('data-k');
    }
    pipsEl.setAttribute('aria-label', o.fails + ' failed attempts' + (over > 0 ? ', ' + over + ' past the limit' : '') + (o.end === 'pass' ? ', then a pass' : ''));

    verdictEl.innerHTML = '';
    var p = document.createElement('p');
    p.className = o.verdict[0];
    p.textContent = o.verdict[1];
    verdictEl.appendChild(p);
  }

  picks.forEach(function (b) { b.addEventListener('click', function () { show(b.dataset.s); }); });
  root.querySelectorAll('[data-live]').forEach(function (n) { n.hidden = false; });
  show('limit');
})();
