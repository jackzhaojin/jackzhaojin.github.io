/* Two labs for the V3.0 second brain article.
   1. Hook switchboard: the gating in src/agentic/memory/run-hook.ts (master switch,
      then the per-hook flag) and the call sites in src/core/executive-loop.ts at
      e43ae97, including the idle guard on Hook A.
   2. Empty-string lab: applyDefaults() in memory-harvester/references/defaults.ts
      before and after b4f4554, and the cohort rule in classify.ts, evaluated live.
   Both figures ship a static example in the HTML; this script makes them interactive. */
(function () {
  'use strict';

  /* ---------- 1. hook switchboard ---------- */
  var sb = document.querySelector('[data-switchboard]');
  if (sb) {
    var HOOKS = {
      A: { name: 'pre-work-selection', flag: 'V3_MEM_HOOK_PRE_WORK', io: 'read' },
      B: { name: 'pre-spawn-pack', flag: 'V3_MEM_HOOK_PRE_SPAWN', io: 'read' },
      C: { name: 'post-run-harvest', flag: 'V3_MEM_HOOK_POST_RUN', io: 'write' },
      D: { name: 'failure-diagnosis', flag: 'V3_MEM_HOOK_FAIL_DIAG', io: 'read' },
      E: { name: 'post-retro-harvest', flag: 'V3_MEM_HOOK_POST_RETRO', io: 'write' }
    };
    var PRESETS = {
      golive: { master: true, A: false, B: true, C: true, D: true, E: true },
      example: { master: true, A: false, B: false, C: false, D: false, E: false },
      off: { master: false, A: false, B: false, C: false, D: false, E: false }
    };
    var boxes = {};
    Array.prototype.forEach.call(sb.querySelectorAll('input[data-flag]'), function (i) { boxes[i.dataset.flag] = i; });
    var scenario = 'pass';
    var stepsEl = sb.querySelector('[data-steps]');
    var sumEl = sb.querySelector('[data-sum]');

    // runMemoryHook gating, in the same order as run-hook.ts lines 82 to 87.
    var gate = function (letter) {
      if (!boxes.master.checked) return { ran: false, reason: 'V3_MEMORY_ENABLED off' };
      if (!boxes[letter].checked) return { ran: false, reason: HOOKS[letter].flag + ' off' };
      return { ran: true };
    };

    var rows, counts;
    var phase = function (title, note) { rows.push({ kind: 'phase', title: title, note: note }); };
    var hook = function (letter, runNote, opts) {
      var h = HOOKS[letter];
      opts = opts || {};
      if (opts.notCalled) {
        rows.push({ kind: 'hook', s: 'skip', title: 'Hook ' + letter + ' · ' + h.name, tag: 'not called', note: opts.notCalled });
        return false;
      }
      var g = gate(letter);
      if (!g.ran) {
        rows.push({ kind: 'hook', s: 'skip', title: 'Hook ' + letter + ' · ' + h.name, tag: 'skipped', note: 'runMemoryHook returns { ran: false, reason: "' + g.reason + '" }' });
        return false;
      }
      counts[h.io] += 1;
      rows.push({ kind: 'hook', s: h.io, title: 'Hook ' + letter + ' · ' + h.name, tag: opts.tag || (h.io === 'read' ? 'reads mem0' : 'writes mem0'), note: runNote });
      return true;
    };

    var build = function () {
      rows = []; counts = { read: 0, write: 0 };
      if (scenario === 'pass' || scenario === 'fail') {
        phase('Phase 3: select work', 'A bundle is queued, so the loop may consult memory first.');
        hook('A', '3 to 8 natural-language searches. The synthesis is only logged for audit.');
        var packed = hook('B', 'Searches mem0 and returns a Memory Pack of 2K tokens or less.');
        phase('Phase 4: the worker builds', packed ? 'The pack is appended to the worker\'s generated CLAUDE.md. The worker reads static markdown and never calls mem0.' : 'No pack this time. The worker starts with nothing from earlier runs.');
        if (scenario === 'pass') {
          phase('Phase 5 and 6: validation passes', 'State, ledgers, Notion and Discord are updated.');
          hook('C', 'The harvester decides 0 to 3 memories from this run (an episodic record, maybe a semantic or procedural lesson) and writes them.');
        } else {
          phase('Phase 5 and 6: validation fails', 'This is the third failed attempt, so Phase 7 runs.');
          hook('D', 'Surfaces earlier failures with similar signals before diagnoseFailure() runs. Logged for audit; it writes only on a repeated-failure pattern.', { tag: 'reads, may write' });
          phase('Phase 7: agentic diagnosis', 'diagnoseFailure() decides: retry with a fix, escalate, or keep retrying.');
        }
      } else {
        hook('A', '', { notCalled: 'The idle guard: no bundle in in-progress/P0 to P4 or ondeck, so the loop does not spend searches on nothing.' });
        if (scenario === 'retro') {
          phase('No work: the weekly retrospective trigger fires', 'runWeeklyRetrospective() writes a retro document.');
          hook('E', 'Distills the new retro into reflective, semantic or procedural memories and writes them.');
        } else {
          phase('No work and no trigger', 'The loop sleeps 30 seconds and polls again.');
        }
      }
    };

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
      p1.textContent = 'This iteration: ' + counts.read + ' hook' + (counts.read === 1 ? '' : 's') + ' reading mem0, ' + counts.write + ' writing.';
      var p2 = document.createElement('p');
      p2.textContent = 'Worker calls to mem0: 0. Every hook runs inside the executive, and a memory failure never blocks the loop.';
      sumEl.appendChild(p1); sumEl.appendChild(p2);
    };

    var presetBtns = sb.querySelectorAll('[data-preset]');
    var setPreset = function (key) {
      var p = PRESETS[key];
      boxes.master.checked = p.master;
      'ABCDE'.split('').forEach(function (k) { boxes[k].checked = p[k]; });
      Array.prototype.forEach.call(presetBtns, function (b) { b.setAttribute('aria-checked', String(b.dataset.preset === key)); });
      render();
    };
    Array.prototype.forEach.call(presetBtns, function (b) { b.addEventListener('click', function () { setPreset(b.dataset.preset); }); });
    Object.keys(boxes).forEach(function (k) {
      boxes[k].disabled = false;
      boxes[k].addEventListener('change', function () {
        Array.prototype.forEach.call(presetBtns, function (b) { b.setAttribute('aria-checked', 'false'); });
        render();
      });
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
    setPreset('golive');
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
