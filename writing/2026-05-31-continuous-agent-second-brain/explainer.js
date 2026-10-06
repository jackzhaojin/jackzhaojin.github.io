/* Two labs for the V3.0 second brain article.
   1. Hook switchboard: the per-hook flag check in src/agentic/memory/run-hook.ts and
      the call sites in src/core/executive-loop.ts at e43ae97, including the idle
      guard on Hook A. Simplified in October 2026: go-live flags only, plain labels.
   2. Empty-string lab: applyDefaults() in memory-harvester/references/defaults.ts
      before and after b4f4554, and the cohort rule in classify.ts, evaluated live.
   Both figures ship a static example in the HTML; this script makes them interactive. */
(function () {
  'use strict';

  /* ---------- 1. hook switchboard ---------- */
  var sb = document.querySelector('[data-switchboard]');
  if (sb) {
    var HOOKS = {
      A: { name: 'before picking work', io: 'read' },
      B: { name: 'before a worker starts', io: 'read' },
      C: { name: 'after a run passes', io: 'write' },
      D: { name: 'before diagnosing a failure', io: 'read' },
      E: { name: 'after a retrospective', io: 'write' }
    };
    var boxes = {};
    Array.prototype.forEach.call(sb.querySelectorAll('input[data-flag]'), function (i) { boxes[i.dataset.flag] = i; });
    var scenario = 'pass';
    var stepsEl = sb.querySelector('[data-steps]');
    var sumEl = sb.querySelector('[data-sum]');

    var rows, counts;
    var phase = function (title, note) { rows.push({ kind: 'phase', title: title, note: note }); };
    // runMemoryHook() in run-hook.ts: a hook whose flag is off returns without doing anything.
    var hook = function (letter, runNote, opts) {
      var h = HOOKS[letter];
      opts = opts || {};
      var title = 'Hook ' + letter + ', ' + h.name;
      if (opts.notCalled) {
        rows.push({ kind: 'hook', s: 'skip', title: title, tag: 'not called', note: opts.notCalled });
        return false;
      }
      if (!boxes[letter].checked) {
        rows.push({ kind: 'hook', s: 'skip', title: title, tag: 'skipped', note: 'Its flag is off, so it returns without touching mem0.' });
        return false;
      }
      counts[h.io] += 1;
      rows.push({ kind: 'hook', s: h.io, title: title, tag: opts.tag || (h.io === 'read' ? 'reads mem0' : 'writes mem0'), note: runNote });
      return true;
    };

    var build = function () {
      rows = []; counts = { read: 0, write: 0 };
      if (scenario === 'pass' || scenario === 'fail') {
        phase('Pick the next goal', 'A goal is queued, so the loop may check memory first.');
        hook('A', '3 to 8 plain-English searches. For now the answer is only logged, not used to pick the goal.');
        var packed = hook('B', 'Searches mem0 and builds a memory pack of 2K tokens or less.');
        phase('The worker builds', packed ? 'The pack is added to the worker\'s CLAUDE.md. The worker reads plain markdown and never calls mem0.' : 'No pack this time. The worker starts with nothing from earlier runs.');
        if (scenario === 'pass') {
          phase('Checks pass', 'State, ledgers, Notion and Discord are updated.');
          hook('C', 'The harvester picks 0 to 3 memories from this run (a record of what happened, maybe a lesson) and writes them.');
        } else {
          phase('Checks fail, for the third time', 'So the loop moves on to diagnosing the failure.');
          hook('D', 'Finds earlier failures with similar signals before the diagnosis. It writes only when it spots a repeated-failure pattern.', { tag: 'reads, may write' });
          phase('Diagnose the failure', 'The executive decides: retry with a fix, escalate, or keep retrying.');
        }
      } else {
        hook('A', '', { notCalled: 'Nothing is queued, so the loop doesn\'t spend searches on nothing. This guard was one of the go-live fixes.' });
        if (scenario === 'retro') {
          phase('The weekly retrospective runs', 'With no work queued, the loop writes a retro document.');
          hook('E', 'Turns the new retro into lessons and writes them to mem0.');
        } else {
          phase('Nothing to do', 'The loop sleeps 30 seconds and checks again.');
        }
      }
    };

    var plural = function (n, one) { return n === 0 ? 'no hook ' + one + 's' : n === 1 ? 'one hook ' + one + 's' : (['', '', 'two', 'three', 'four', 'five'][n] || n) + ' hooks ' + one; };
    var render = function () {
      build();
      stepsEl.innerHTML = '';
      rows.forEach(function (r) {
        var li = document.createElement('li');
        if (r.kind === 'hook') { li.className = 'hook'; li.setAttribute('data-s', r.s); }
        var b = document.createElement('b'); b.textContent = r.title; li.appendChild(b);
        if (r.tag) { var t = document.createElement('span'); t.className = 'sb__tag'; t.textContent = r.tag; li.appendChild(t); }
        if (r.note) { var s = document.createElement('small'); s.textContent = r.note; li.appendChild(s); }
        stepsEl.appendChild(li);
      });
      sumEl.innerHTML = '';
      var p1 = document.createElement('p');
      var txt = 'This pass: ' + plural(counts.read, 'read') + ' memory, ' + plural(counts.write, 'write') + ' it. The worker never calls mem0.';
      p1.textContent = txt.charAt(0).toUpperCase() + txt.slice(1);
      sumEl.appendChild(p1);
    };

    Object.keys(boxes).forEach(function (k) {
      boxes[k].disabled = false;
      boxes[k].addEventListener('change', render);
    });
    var scenBtns = sb.querySelectorAll('[data-scenario]');
    Array.prototype.forEach.call(scenBtns, function (b) {
      b.addEventListener('click', function () {
        scenario = b.dataset.scenario;
        Array.prototype.forEach.call(scenBtns, function (x) { x.setAttribute('aria-checked', String(x === b)); });
        render();
      });
    });
    sb.querySelectorAll('[data-live]').forEach(function (n) { n.hidden = false; });
    render();
  }

  /* ---------- 2. the empty-string cohort bug ---------- */
  var eb = document.querySelector('[data-emptybug]');
  if (eb) {
    var envMode = 'empty';
    var fixed = false;
    var ENV = {
      empty: { line: 'V3_MEM0_COHORT=', value: '' },
      set: { line: 'V3_MEM0_COHORT=smoke-2026-05-16', value: 'smoke-2026-05-16' },
      unset: { line: '# no V3_MEM0_COHORT line', value: undefined }
    };
    var show = function (v) { return v === undefined ? 'undefined' : JSON.stringify(v); };
    var codeEl = eb.querySelector('[data-code]');
    var traceEl = eb.querySelector('[data-trace]');
    var verdictEl = eb.querySelector('[data-verdict]');

    var run = function () {
      var env = ENV[envMode];
      var raw = env.value;                                   // what dotenv puts in process.env
      var cohortFromEnv = fixed ? (raw || undefined) : raw;  // defaults.ts line 107 after, line 98 before
      var mCohort;                                           // the harvester does not set one
      var cohort = mCohort !== undefined && mCohort !== null ? mCohort
        : (cohortFromEnv !== undefined && cohortFromEnv !== null ? cohortFromEnv : undefined); // m.cohort ?? cohortFromEnv ?? undefined
      var stamped = cohort !== undefined;                    // if (cohort !== undefined) metadata.cohort = cohort
      var bad = stamped && (typeof cohort !== 'string' || cohort.trim().length === 0); // classify.ts lines 214 to 215

      codeEl.innerHTML = '';
      var add = function (text, cls) { var s = document.createElement('span'); if (cls) s.className = cls; s.textContent = text; codeEl.appendChild(s); };
      add(fixed ? '// defaults.ts after b4f4554\n' : '// defaults.ts before b4f4554\n', 'c');
      add(fixed ? 'const cohortFromEnv = process.env.V3_MEM0_COHORT || undefined;\n' : 'const cohortFromEnv = process.env.V3_MEM0_COHORT;\n', 'hl');
      add('const cohort = m.cohort ?? cohortFromEnv ?? undefined;\n');
      add('if (cohort !== undefined) metadata.cohort = cohort;');

      var steps = [
        ['.env.executive', env.line, ''],
        ['process.env.V3_MEM0_COHORT', show(raw), ''],
        ['cohortFromEnv', show(cohortFromEnv), ''],
        ['metadata.cohort', stamped ? show(cohort) : '(left out)', bad ? 'bad' : ''],
        ['classify.ts', bad ? 'metadata.cohort: when set, must be a non-empty string' : 'valid', bad ? 'bad' : 'good']
      ];
      traceEl.innerHTML = '';
      steps.forEach(function (s) {
        var li = document.createElement('li');
        if (s[2]) li.setAttribute('data-s', s[2]);
        var b = document.createElement('b'); b.textContent = s[0];
        var c = document.createElement('code'); c.textContent = s[1];
        li.appendChild(b); li.appendChild(c); traceEl.appendChild(li);
      });

      verdictEl.innerHTML = '';
      var p = document.createElement('p');
      p.className = bad ? 'no' : 'ok';
      p.textContent = bad ? 'Every write is rejected before it reaches mem0.' : 'The write passes validation and goes to mem0.';
      var log = document.createElement('span');
      log.className = 'log';
      log.textContent = fixed
        ? '[MEMORY] hook post-run-harvest ran: N tool calls [Read×…, Bash×…], …ms, ok\n[MEMORY] hook post-run-harvest result tail: …' + (bad ? 'validation error' : 'memories written')
        : '[MEMORY] hook post-run-harvest ran: N tool calls, …ms, ok';
      var note = document.createElement('span');
      note.className = 'log';
      note.textContent = fixed
        ? 'After the fix the log also carries the tool histogram and the tail of the hook\'s answer, so a failed harvest shows up.'
        : (bad ? 'The hook log still says ok: the agent turn succeeded, even though every write failed.' : 'Same log line as a failed run would print.');
      verdictEl.appendChild(p); verdictEl.appendChild(log); verdictEl.appendChild(note);
    };

    var wire = function (attr, onPick) {
      var btns = eb.querySelectorAll('[' + attr + ']');
      Array.prototype.forEach.call(btns, function (b) {
        b.addEventListener('click', function () {
          Array.prototype.forEach.call(btns, function (x) { x.setAttribute('aria-checked', String(x === b)); });
          onPick(b.getAttribute(attr));
          run();
        });
      });
    };
    wire('data-env', function (v) { envMode = v; });
    wire('data-fix', function (v) { fixed = v === 'after'; });
    eb.querySelectorAll('[data-live]').forEach(function (n) { n.hidden = false; });
    run();
  }
})();
