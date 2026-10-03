/* Failure ladder lab. Mirrors the failure path of src/core/executive-loop.ts at
   v2.1.4 (lines 583 to 719): count the attempt, run the agentic diagnosis from the
   third failure, return early when the diagnosis escalates or suggests a fix, and
   block at MAX_RETRIES = 10 otherwise. Log lines use the code's own messages.
   Without JavaScript the figure shows a static run that fails ten times. */
(function () {
  'use strict';
  var root = document.querySelector('[data-ladder]');
  if (!root) return;

  var MAX_RETRIES = 10; // executive-loop.ts line 95
  var DIAGNOSIS_AT = 3; // executive-loop.ts line 646

  var el = function (sel) { return root.querySelector(sel); };
  var countEl = el('[data-count]');
  var pipsEl = el('[data-pips]');
  var askEl = el('[data-ask]');
  var runLabel = el('[data-run-label]');
  var runBtns = el('[data-run]');
  var diagBtns = el('[data-diag]');
  var logEl = el('[data-log]');
  var verdictEl = el('[data-verdict]');
  var gates = {};
  Array.prototype.forEach.call(root.querySelectorAll('[data-gate]'), function (g) { gates[g.dataset.gate] = g; });

  var state;

  function reset() {
    state = { attempts: 0, marks: [], mode: 'run', fixes: 0 };
    logEl.innerHTML = '';
    line('n', '# a demo goal enters the loop. Each button is one iteration.');
    setGates({});
    verdict('Pick what happens when the worker finishes.', '');
    render();
  }

  function line(cls, text) {
    var s = document.createElement('span');
    s.className = cls;
    s.textContent = text + '\n';
    logEl.appendChild(s);
    logEl.scrollTop = logEl.scrollHeight;
  }

  function setGates(map) {
    Object.keys(gates).forEach(function (k) {
      if (map[k]) gates[k].setAttribute('data-state', map[k]);
      else gates[k].removeAttribute('data-state');
    });
  }

  function verdict(text, cls) {
    verdictEl.innerHTML = '';
    var p = document.createElement('p');
    if (cls) p.className = cls;
    p.textContent = text;
    verdictEl.appendChild(p);
  }

  function render() {
    countEl.textContent = String(state.attempts);
    var pips = pipsEl.children;
    for (var i = 0; i < pips.length; i++) {
      if (state.marks[i]) pips[i].setAttribute('data-k', state.marks[i]);
      else pips[i].removeAttribute('data-k');
    }
    var over = state.attempts - MAX_RETRIES;
    pipsEl.setAttribute('aria-label', state.attempts + ' failed attempts' + (over > 0 ? ', ' + over + ' past the limit' : ''));
    runBtns.hidden = state.mode !== 'run';
    diagBtns.hidden = state.mode !== 'diag';
    askEl.hidden = state.mode !== 'diag';
    runLabel.hidden = state.mode !== 'run';
    Array.prototype.forEach.call(runBtns.querySelectorAll('button'), function (b) { b.disabled = state.mode !== 'run'; });
  }

  function execute() {
    line('a', 'PHASE 4: Execute Work (Agent SDK Worker)');
    line('a', 'PHASE 5: Validate Work');
  }

  function pass() {
    if (state.mode !== 'run') return;
    execute();
    line('d', 'PHASE 6: Update State (Success)');
    line('ok', '  goal or step complete, Notion and Discord updated');
    state.marks[Math.min(state.attempts, 9)] = 'pass';
    state.mode = 'done';
    setGates({ validate: 'done', update: 'done' });
    verdict('Validation passed. The loop records it and picks the next goal right away.', 'ok');
    render();
  }

  function fail() {
    if (state.mode !== 'run') return;
    execute();
    line('d', 'PHASE 6: Update State (Failure)');
    state.attempts += 1; // retry.attempts++
    if (state.attempts <= MAX_RETRIES) state.marks[state.attempts - 1] = 'fail';
    line('x', '  Attempt ' + state.attempts + '/' + MAX_RETRIES + ' failed');
    if (state.attempts >= DIAGNOSIS_AT) {
      line('a', 'PHASE 7: Agentic Diagnosis (Investigate Failure)');
      line('n', '  Root cause: (the diagnosis model reads the error and the output folder)');
      state.mode = 'diag';
      setGates({ validate: 'block', update: 'active', diagnose: 'active' });
      verdict('Failure ' + state.attempts + '. From the third failure, a diagnosis runs before anything else. What does it decide?', '');
    } else {
      setGates({ validate: 'block', update: 'active' });
      verdict('Failure ' + state.attempts + '. Below three, no diagnosis: the next iteration retries with the last error and a different approach in the prompt.', '');
    }
    render();
  }

  function maxRetries() {
    // PHASE 8: only reached when the diagnosis did not return early.
    if (state.attempts >= MAX_RETRIES) {
      line('d', 'PHASE 8: Max Retries Reached (Constitution Limit)');
      line('x', '  Marking as blocked after ' + MAX_RETRIES + ' attempts');
      line('n', '  writeToNeedsYou() + Discord blocked notification, then the next goal');
      state.mode = 'blocked';
      setGates({ validate: 'block', update: 'active', diagnose: 'done', escalate: 'block' });
      verdict('Blocked at ' + MAX_RETRIES + ' attempts, the constitution limit. It waits in needs-you.md for my answer.', 'no');
      return true;
    }
    return false;
  }

  function diagnose(choice) {
    if (state.mode !== 'diag') return;
    if (choice === 'escalate') {
      line('a', '  Decision: Escalate to human (needs-you.md)');
      line('n', '  escalateWithDiagnosis() + Discord blocked notification');
      state.mode = 'blocked';
      setGates({ validate: 'block', update: 'active', diagnose: 'done', escalate: 'block' });
      verdict('The diagnosis escalated after ' + state.attempts + ' attempts. The goal is blocked with the diagnosis attached, and the loop moves on.', 'no');
    } else if (choice === 'fix') {
      line('a', '  Decision: Apply suggested fix and retry');
      line('n', '  return early: the ' + MAX_RETRIES + '-attempt check below is skipped');
      if (state.attempts <= MAX_RETRIES) state.marks[state.attempts - 1] = 'fix';
      state.fixes += 1;
      state.mode = 'run';
      setGates({ validate: 'block', update: 'active', diagnose: 'done' });
      var past = state.attempts >= MAX_RETRIES
        ? ' This is attempt ' + state.attempts + ', and it still retries, because a suggested fix returns before the limit check.'
        : ' The next iteration retries with the fix.';
      verdict('Retry with a fix.' + past, state.attempts >= MAX_RETRIES ? 'no' : '');
    } else {
      line('a', '  Decision: Continue normal retry logic');
      state.mode = 'run';
      if (!maxRetries()) {
        setGates({ validate: 'block', update: 'active', diagnose: 'done' });
        verdict('No clear call. Under ' + MAX_RETRIES + ' attempts, so the next iteration retries with a different approach.', '');
      }
    }
    render();
  }

  function failToLimit() {
    reset();
    var guard = 0;
    while (state.mode !== 'blocked' && guard < 20) {
      fail();
      if (state.mode === 'diag') diagnose('none');
      guard += 1;
    }
  }

  root.querySelector('[data-act="pass"]').addEventListener('click', pass);
  root.querySelector('[data-act="fail"]').addEventListener('click', fail);
  root.querySelector('[data-act="fix"]').addEventListener('click', function () { diagnose('fix'); });
  root.querySelector('[data-act="escalate"]').addEventListener('click', function () { diagnose('escalate'); });
  root.querySelector('[data-act="none"]').addEventListener('click', function () { diagnose('none'); });
  root.querySelector('[data-act="reset"]').addEventListener('click', reset);
  root.querySelector('[data-act="limit"]').addEventListener('click', failToLimit);

  root.querySelectorAll('[data-live]').forEach(function (n) { n.hidden = false; });
  root.querySelectorAll('[data-static]').forEach(function (n) { n.hidden = true; });
  reset();
})();
