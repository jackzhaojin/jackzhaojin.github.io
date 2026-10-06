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
        verdict.innerHTML = '<p>Score <b>' + d + '</b>, from the scan alone</p>' +
          '<span class="log">The agent step failed, so the report keeps the scan\'s ' + d + ' on its own: one finding per axe-core violation, no summary and no grade.</span>';
        grades.forEach((g) => g.classList.remove('on'));
        return;
      }
      const score = calculateFinalScore(d, a);
      const grade = calculateGrade(score);
      barA.style.width = (a * 0.7) + '%';
      barD.style.width = (d * 0.3) + '%';
      const exact = Math.round((a * 0.7 + d * 0.3) * 10) / 10;
      formula.textContent = 'Math.round(' + a + ' * 0.7 + ' + d + ' * 0.3)\n= Math.round(' + exact + ')\n= ' + score;
      const gap = score - d;
      const pull = gap === 0 ? 'The two scores agree, so the blend matches the scan.'
        : 'The agent\'s ' + (gap < 0 ? 'lower' : 'higher') + ' score ' + (gap < 0 ? 'pulls' : 'lifts') + ' the result ' + Math.abs(gap) + (Math.abs(gap) === 1 ? ' point ' : ' points ') + (gap < 0 ? 'under' : 'over') + ' the scan.';
      verdict.innerHTML = '<p>Final score <b>' + score + '</b>, ' + grade.replace('-', ' ') + '</p>' +
        '<span class="log">70% of the agent\'s ' + a + ' plus 30% of the scan\'s ' + d + '. ' + pull + '</span>';
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
     A model of the rule only. It does not run any agents. Any change re-runs the
     whole model at once, so the default already shows a subtask being picked up. */
  document.querySelectorAll('[data-loop]').forEach((fig) => {
    const segs = [...fig.querySelectorAll('.loop__seg')];
    const settings = [...fig.querySelectorAll('.loop__setting')];
    const queueEl = fig.querySelector('.loop__queue');
    const logEl = fig.querySelector('.loop__log');
    const resultEl = fig.querySelector('[data-loop-result]');
    if (!queueEl || !logEl) return;

    const defects = {};
    const run = (changed) => {
      const queue = segs.map((sg) => sg.dataset.task);
      const lines = [['loop: run planning agents in order: why, what, how, when', 'det']];
      const subs = [];
      for (let pos = 0; pos < queue.length; pos++) {
        const t = queue[pos];
        lines.push(['loop: next available task is ' + t, 'det']);
        const n = t.includes('.') ? 0 : (defects[t] || 0);
        if (n > 0) {
          const fresh = Array.from({ length: n }, (_, i) => t + '.' + (i + 1));
          queue.splice(pos + 1, 0, ...fresh);
          subs.push(...fresh);
          lines.push(['  validate: ' + n + (n === 1 ? ' defect' : ' defects') + ' logged, created ' + fresh.join(' and '), 'no']);
          const nextPlanned = queue.slice(pos + 1).find((q) => !q.includes('.'));
          lines.push(['loop: ' + fresh[0] + ' exists, so it runs before ' + (nextPlanned ? nextPlanned : 'the run ends'), 'det']);
        } else {
          lines.push(['  validate: passed', 'ok']);
        }
      }
      lines.push(['loop: no tasks left, run complete', 'det']);
      queueEl.innerHTML = '';
      queue.forEach((t) => {
        const li = document.createElement('li');
        li.textContent = t;
        li.classList.add('done');
        if (t.includes('.')) li.classList.add('sub');
        if (changed && subs.includes(t) && !reduce) li.classList.add('new');
        queueEl.appendChild(li);
      });
      logEl.textContent = '';
      lines.forEach(([text, cls]) => {
        const span = document.createElement('span');
        span.style.display = 'block';
        span.className = cls;
        span.textContent = text;
        logEl.appendChild(span);
      });
      if (resultEl) {
        resultEl.textContent = 'Run order ' + queue.join(', ') + ': ' + (subs.length
          ? 'each defect became a subtask (' + subs.join(', ') + '), and the loop ran each one right after its parent task.'
          : 'no defects, so the loop ran the plan as written.');
      }
    };

    segs.forEach((seg) => {
      seg.hidden = false;
      const task = seg.dataset.task;
      const buttons = [...seg.querySelectorAll('button')];
      const on = buttons.find((b) => b.getAttribute('aria-checked') === 'true') || buttons[0];
      defects[task] = Number(on.dataset.n);
      buttons.forEach((b) => b.addEventListener('click', () => {
        buttons.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
        defects[task] = Number(b.dataset.n);
        run(true);
      }));
    });
    settings.forEach((st) => { st.hidden = true; });
    run(false);
  });
})();
