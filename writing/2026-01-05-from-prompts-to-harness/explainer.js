/* Explainers for "From Prompts to Harness". The page reads fine without this file:
   each figure ships a worked example in its HTML. This adds the controls. */
(() => {
  'use strict';
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- score lab ----------
     Same arithmetic as calculateFinalScore and calculateGrade in
     content-authoring-eval/src/lib/agents/accessibility/agentic.ts at 0aacf6d,
     and the deterministic-only fallback in src/lib/evaluator.ts. */
  const calculateFinalScore = (deterministicScore, agenticScore) => {
    const finalScore = Math.round(agenticScore * 0.7 + deterministicScore * 0.3);
    return Math.max(0, Math.min(100, finalScore));
  };
  const calculateGrade = (score) => {
    if (score >= 90) return 'excellent';
    if (score >= 75) return 'good';
    if (score >= 60) return 'acceptable';
    if (score >= 40) return 'needs-improvement';
    return 'critical';
  };

  document.querySelectorAll('[data-blend]').forEach((fig) => {
    const ctl = fig.querySelector('.blend__ctl');
    const det = fig.querySelector('[data-det]');
    const agt = fig.querySelector('[data-agt]');
    const fail = fig.querySelector('[data-fail]');
    const detOut = fig.querySelector('[data-det-out]');
    const agtOut = fig.querySelector('[data-agt-out]');
    const barA = fig.querySelector('.blend__bar .a');
    const barD = fig.querySelector('.blend__bar .d');
    const formula = fig.querySelector('[data-formula]');
    const verdict = fig.querySelector('[data-verdict]');
    const grades = [...fig.querySelectorAll('[data-grade]')];
    const staticNote = fig.querySelector('.blend__static');
    if (!ctl || !det || !agt || !fail) return;
    ctl.hidden = false;
    if (staticNote) staticNote.hidden = true;

    const render = () => {
      const d = Number(det.value);
      const a = Number(agt.value);
      detOut.value = d; detOut.textContent = d;
      agtOut.value = a; agtOut.textContent = a;
      const failed = fail.checked;
      fig.classList.toggle('is-fallback', failed);
      agt.disabled = failed;
      if (failed) {
        barD.style.width = d + '%';
        formula.textContent = 'catch {\n  // Fallback to deterministic-only\n  score: deterministic.score  // ' + d + '\n}';
        verdict.innerHTML = '<p>Score <b>' + d + '</b> from the scan alone</p>' +
          '<span class="log">findings: one per axe-core violation, "Fix &lt;rule&gt;: &lt;help&gt;". No summary, strengths or quick wins, and no grade.</span>';
        grades.forEach((g) => g.classList.remove('on'));
        return;
      }
      const score = calculateFinalScore(d, a);
      const grade = calculateGrade(score);
      barA.style.width = (a * 0.7) + '%';
      barD.style.width = (d * 0.3) + '%';
      const exact = Math.round((a * 0.7 + d * 0.3) * 10) / 10;
      formula.textContent = 'Math.round(' + a + ' * 0.7 + ' + d + ' * 0.3)\n= Math.round(' + exact + ')\n= ' + score;
      verdict.innerHTML = '<p>Final score <b>' + score + '</b> ' + grade + '</p>' +
        '<span class="log">the agent counts for 70%, the scan for 30%</span>';
      grades.forEach((g) => g.classList.toggle('on', g.dataset.grade === grade));
    };
    [det, agt, fail].forEach((el) => el.addEventListener('input', render));
    fail.addEventListener('change', render);
    render();
  });

  /* ---------- loop model ----------
     The ordering rule from the video: planning agents run why, what, how, when;
     the loop then takes tasks in order; a task's validator can log defects as
     subtasks (2.1, 2.2), and the loop picks those up before it moves to task 3.
     A model of the rule only. It does not run any agents. */
  document.querySelectorAll('[data-loop]').forEach((fig) => {
    const segs = [...fig.querySelectorAll('.loop__seg')];
    const settings = [...fig.querySelectorAll('.loop__setting')];
    const nav = fig.querySelector('.loop__nav');
    const queueEl = fig.querySelector('.loop__queue');
    const logEl = fig.querySelector('.loop__log');
    const planEl = [...fig.querySelectorAll('.loop__plan li')];
    const stepBtn = fig.querySelector('[data-step]');
    const runBtn = fig.querySelector('[data-run]');
    const resetBtn = fig.querySelector('[data-reset]');
    if (!queueEl || !logEl || !nav) return;

    const defects = {};
    segs.forEach((seg) => {
      seg.hidden = false;
      const task = seg.dataset.task;
      const buttons = [...seg.querySelectorAll('button')];
      const on = buttons.find((b) => b.getAttribute('aria-checked') === 'true') || buttons[0];
      defects[task] = Number(on.dataset.n);
      buttons.forEach((b) => b.addEventListener('click', () => {
        buttons.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        defects[task] = Number(b.dataset.n);
        reset();
      }));
    });
    settings.forEach((s) => { s.hidden = true; });
    nav.hidden = false;

    let queue, pos, planned, runId = 0;
    const tasks = () => segs.map((s) => s.dataset.task);

    const drawQueue = (fresh) => {
      queueEl.innerHTML = '';
      queue.forEach((t, i) => {
        const li = document.createElement('li');
        li.textContent = t;
        if (t.includes('.')) li.classList.add('sub');
        if (i < pos) li.classList.add('done');
        if (i === pos && planned && pos < queue.length) li.classList.add('now');
        if (fresh && fresh.includes(t) && !reduce) li.classList.add('new');
        queueEl.appendChild(li);
      });
    };
    const line = (text, cls) => {
      const span = document.createElement('span');
      span.style.display = 'block';
      if (cls) span.className = cls;
      span.textContent = text;
      logEl.appendChild(span);
      logEl.scrollTop = logEl.scrollHeight;
    };
    const finished = () => planned && pos >= queue.length;
    const syncButtons = () => {
      stepBtn.disabled = finished();
      runBtn.disabled = finished();
    };

    function reset() {
      runId++;
      queue = tasks().slice();
      pos = 0;
      planned = false;
      planEl.forEach((p) => p.classList.remove('done'));
      logEl.textContent = '';
      line('loop ready: a plan of ' + queue.length + ' tasks, nothing run yet', 'det');
      drawQueue();
      syncButtons();
    }

    const step = () => {
      if (!planned) {
        planned = true;
        planEl.forEach((p) => p.classList.add('done'));
        line('loop: run planning agents in order: why, what, how, when', 'det');
        line('  handoff: plan written, ' + queue.length + ' tasks sized by the how');
        drawQueue();
        syncButtons();
        return;
      }
      if (finished()) return;
      const t = queue[pos];
      line('loop: next available task is ' + t, 'det');
      line('  research: spec for task ' + t);
      line('  build: code, Playwright checks, ad hoc + e2e tests');
      const n = t.includes('.') ? 0 : (defects[t] || 0);
      let fresh = [];
      if (n > 0) {
        fresh = Array.from({ length: n }, (_, i) => t + '.' + (i + 1));
        queue.splice(pos + 1, 0, ...fresh);
        line('  validate: ' + n + (n === 1 ? ' defect' : ' defects') + ' logged, created ' + fresh.join(' and '), 'no');
      } else {
        line('  validate: passed', 'ok');
      }
      pos++;
      if (finished()) {
        line('loop: no tasks left, run complete', 'det');
      } else if (fresh.length) {
        line('loop: ' + fresh[0] + ' exists, so it runs before ' + (queue.slice(pos).find((q) => !q.includes('.')) || 'the end'), 'det');
      }
      drawQueue(fresh);
      syncButtons();
    };

    stepBtn.addEventListener('click', () => { runId++; step(); });
    runBtn.addEventListener('click', async () => {
      const id = ++runId;
      while (!finished() && id === runId) {
        step();
        if (!reduce) await new Promise((r) => setTimeout(r, 650));
      }
    });
    resetBtn.addEventListener('click', reset);
    reset();
  });
})();
