/* Two explainers for the Company of Zero article.
   1. Beat simulator: ports the due decision and run order of src/harness/heartbeat-core.ts
      and the commit, delivery and failure DM of workers/heartbeat/src/beat.ts
      (jackzhaojin/anima-mesh at 0874733), over the sample brain's five agents.
   2. Defect gate lab: ports parseDefectReports, identityLeakGuard and the issue-first
      branches of src/defects/report-core.ts, src/harness/defects.ts and the gate in
      src/gates/gatekeeper.ts at the same commit. Nothing is sent anywhere.
   Long dashes in the original messages are shown as plain hyphens.
   The page is complete without this script: both figures carry a static example. */
(function () {
  'use strict';

  /* ---------------- shared helpers ---------------- */
  const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  /* ---------------- 1. the beat ---------------- */
  const TZ = 'America/New_York';
  // heartbeat-core.ts lines 24-29
  const PERIOD_HOURS = { daily: 20, weekly: 6 * 24, monthly: 27 * 24, quarterly: 85 * 24 };
  // providers/index.ts line 53
  const CLOUD_HARNESSES = new Set(['moonshot-api', 'anthropic-api']);
  // The sample brain's roster (docs/sample-brain/bundle/agents/*.md), with declared harnesses.
  const AGENTS = [
    { name: 'chief-of-staff', heartbeat: 'daily', harness: 'anthropic-api', commercial: false },
    { name: 'compliance-ops', heartbeat: 'daily', harness: 'opencode', commercial: false },
    { name: 'librarian', heartbeat: 'weekly', harness: 'claude-code', commercial: false },
    { name: 'research-watch', heartbeat: 'weekly', harness: 'anthropic-api', commercial: false },
    { name: 'sales-qualification', heartbeat: 'daily', harness: 'opencode', commercial: true },
  ];
  const HUB = 'chief-of-staff';

  // run-core.ts dateStampFor, with the instance timezone
  function dateStampFor(d) {
    return new Intl.DateTimeFormat('en-CA', { timeZone: TZ, year: 'numeric', month: '2-digit', day: '2-digit' }).format(d);
  }
  const localDay = (ms) => Number(dateStampFor(new Date(ms)).replace(/-/g, ''));

  // heartbeat-core.ts dueVerdict, lines 98-134
  function dueVerdict(agent, schedule, ledger, now) {
    if (schedule.wake.includes(agent.name)) return { due: true, reason: 'wake requested (ops/schedule.md)' };
    const cadence = schedule.cadence[agent.name] || agent.heartbeat;
    if (!cadence) return { due: false, reason: 'no heartbeat declared (manual runs only)' };
    const hours = PERIOD_HOURS[cadence];
    const last = ledger
      .filter((e) => e.agent === agent.name && e.action === 'run-completed')
      .map((e) => Date.parse(e.ts))
      .reduce((max, t) => Math.max(max, t), 0);
    if (last === 0) return { due: true, reason: 'never run' };
    if (cadence === 'daily') {
      return localDay(last) < localDay(now.getTime())
        ? { due: true, reason: 'daily: not yet run today' }
        : { due: false, reason: 'daily: already ran today' };
    }
    const elapsed = (now.getTime() - last) / 3600000;
    return elapsed >= hours
      ? { due: true, reason: `${cadence}: ${Math.floor(elapsed)}h since last run` }
      : { due: false, reason: `${cadence}: ran ${Math.floor(elapsed)}h ago (< ${hours}h)` };
  }

  // One cloud beat: heartbeatCore (cloudTier: true) + runCloudBeat's flush, delivery and failure DM.
  function runBeat(state) {
    const now = new Date(state.now);
    const schedule = state.schedule;
    const due = []; const skipped = []; const tierBlocked = [];
    for (const agent of AGENTS) {
      if (agent.commercial) { skipped.push({ agent: agent.name, reason: 'commercial, dual-gated inactive (D11)' }); continue; }
      if (!CLOUD_HARNESSES.has(agent.harness)) {
        const v = schedule.pause.includes(agent.name) ? { due: false, reason: 'paused' } : dueVerdict(agent, schedule, state.ledger, now);
        if (v.due) {
          const reason = `DUE (${v.reason}) but laptop-tier harness (${agent.harness}) - needs a manual local run`;
          tierBlocked.push({ agent: agent.name, reason }); skipped.push({ agent: agent.name, reason });
        } else skipped.push({ agent: agent.name, reason: `laptop-tier harness (${agent.harness}) - not run in cloud` });
        continue;
      }
      if (schedule.pause.includes(agent.name)) { skipped.push({ agent: agent.name, reason: 'paused (ops/schedule.md)' }); continue; }
      const v = dueVerdict(agent, schedule, state.ledger, now);
      if (v.due) due.push({ agent: agent.name, reason: v.reason }); else skipped.push({ agent: agent.name, reason: v.reason });
    }
    // Spokes alphabetically, the hub last.
    due.sort((a, b) => ((a.agent === HUB) - (b.agent === HUB)) || a.agent.localeCompare(b.agent));
    const runs = []; const failures = [];
    let minute = 0;
    for (const d of due) {
      minute += 4;
      if (state.failing.includes(d.agent)) {
        failures.push({ agent: d.agent, error: 'provider call failed (demo error)' });
        continue;
      }
      const ts = new Date(now.getTime() + minute * 60000).toISOString();
      state.ledger.push({ ts, agent: d.agent, action: 'run-completed' });
      if (d.agent === HUB) state.hubReport = dateStampFor(now);
      runs.push({ agent: d.agent, notes: d.agent === HUB && tierBlocked.length ? tierBlocked.map((t) => t.agent) : null });
    }
    // Wakes are consumed on attempt, not on success.
    const attempted = new Set(due.map((d) => d.agent));
    const consumed = schedule.wake.filter((n) => attempted.has(n));
    schedule.wake = schedule.wake.filter((n) => !attempted.has(n));
    const date = dateStampFor(now);
    const commit = `beat(cloud): ${date} - ${runs.length} run(s), ${failures.length} failure(s)`;
    let delivery;
    if (runs.length > 0) {
      delivery = state.hubReport
        ? (state.hubReport === date ? `brief DM: today's chief-of-staff report` : `brief DM: the newest chief-of-staff report on file, from ${state.hubReport}`)
        : 'brief DM: no chief-of-staff report on file yet';
    } else delivery = 'nothing ran (all skipped or already done today) - no delivery';
    const dm = failures.length
      ? [`cloud beat ${date}: ${failures.length}/${due.length} due agent(s) failed`, ...failures.map((f) => `${f.agent}: ${f.error}`)]
      : null;
    return { date, due, skipped, tierBlocked, runs, failures, consumed, commit, delivery, dm, ok: failures.length === 0 };
  }

  function freshBeatState() {
    return {
      now: '2026-07-27T12:00:00.000Z', // 08:00 in New York, a week after the sample ledger's research run
      ledger: [
        { ts: '2026-07-20T12:04:42.031Z', agent: 'research-watch', action: 'run-completed' },
        { ts: '2026-07-21T12:05:18.007Z', agent: 'chief-of-staff', action: 'run-completed' },
      ],
      hubReport: '2026-07-21',
      schedule: { wake: [], pause: [], cadence: {} },
      failing: [],
    };
  }

  /* ---------------- 2. the defect gate ---------------- */
  const MAX_DEFECTS_PER_RUN = 2;
  const MAX_DEFECT_BYTES = 16 * 1024;
  const BLOCK_RE = /```defect-report\s*\r?\ntitle:[ \t]*(.+?)[ \t]*\r?\n---\r?\n([\s\S]*?)```/g;
  // docs/sample-brain/animamesh.config.json identity (fictional)
  const IDENTITY = { principal: { name: 'Casey Lund', email: 'casey@copperline.example' }, persona: { name: 'Mira Solen', emails: ['mira.solen@copperline.example'] } };
  // Open issues labeled defect on github.com/jackzhaojin/anima-mesh, checked October 3, 2026.
  const OPEN_DEFECTS = [{ number: 7, title: 'claude-code harness: opaque failure when local login expires; instance env not passed to CLI providers' }];
  const AGENT_GATES = {
    'chief-of-staff': { level: 'L3', whitelist: ['schedule-update', 'draft-write', 'defect-report'] },
    'research-watch': { level: 'L1', whitelist: [] },
  };
  const ALLOWS = { L1: ['report'], L2: ['report', 'draft'], L3: ['report', 'draft', 'reversible'], L4: ['report', 'draft', 'reversible', 'external'] };

  function parseDefectReports(text) {
    const out = [];
    for (const m of text.matchAll(BLOCK_RE)) {
      const title = (m[1] || '').trim(); const body = (m[2] || '').trim();
      if (title && body.length > 0) out.push({ title, body });
    }
    return out;
  }
  function escapeRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }
  function identityLeakGuard(text) {
    const words = new Set();
    const addName = (name) => { for (const w of (name || '').split(/\s+/)) { const t = w.trim(); if (t.length >= 3) words.add(t); } };
    addName(IDENTITY.principal.name); addName(IDENTITY.persona.name);
    const emails = [IDENTITY.principal.email, ...IDENTITY.persona.emails];
    const leaked = [];
    for (const w of words) if (new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(text)) leaked.push(w);
    const lower = text.toLowerCase();
    for (const e of emails) if (lower.includes(e.toLowerCase())) leaked.push(e);
    return leaked;
  }
  function defectDraftSlug(title) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 64).replace(/-+$/, '');
    return slug || 'defect';
  }
  function gateCheck(agentName) {
    const g = AGENT_GATES[agentName];
    if (!ALLOWS[g.level].includes('reversible')) return `${agentName} (${g.level}) may not perform reversible actions - the ladder is the law`;
    if (!g.whitelist.includes('defect-report')) return `${agentName} (${g.level}) reversible action 'defect-report' is not on its whitelist [${g.whitelist.join(', ')}]`;
    return null;
  }
  // applyDefectReports, with the GitHub calls replaced by the open-issue list above.
  function applyDefects(text, agentName, hasToken) {
    const reports = parseDefectReports(text);
    const steps = [];
    if (reports.length === 0) return { reports, steps: [{ kind: 'none', text: 'No defect-report block found. Nothing leaves the run.' }] };
    const denied = gateCheck(agentName);
    if (denied) {
      steps.push({ kind: 'deny', title: reports.map((r) => r.title).join(', '), ledger: 'defect-report-denied', text: denied });
      return { reports, steps };
    }
    for (const r of reports.slice(0, MAX_DEFECTS_PER_RUN)) {
      if (r.body.length > MAX_DEFECT_BYTES) { steps.push({ kind: 'deny', title: r.title, ledger: 'defect-report-denied', text: `body exceeds ${MAX_DEFECT_BYTES} bytes` }); continue; }
      const leaked = identityLeakGuard(`${r.title}\n${r.body}`);
      const path = `drafts/defects/${defectDraftSlug(r.title)}.md`;
      if (hasToken && leaked.length === 0) {
        const hit = OPEN_DEFECTS.find((i) => i.title.trim().toLowerCase() === r.title.trim().toLowerCase());
        steps.push(hit
          ? { kind: 'dup', title: r.title, ledger: 'defect-filed (duplicate: true)', text: `Already open upstream as issue #${hit.number}. No second issue.` }
          : { kind: 'file', title: r.title, ledger: 'defect-filed', text: 'Would file a new public issue on the engine, labeled defect. No draft kept.' });
        continue;
      }
      const sub = [];
      if (hasToken && leaked.length > 0) sub.push({ ledger: 'defect-file-skipped', text: `identity leak - the engine repo is public and the report contains: ${leaked.join(', ')}` });
      sub.push({ ledger: 'defect-drafted', text: `private draft at ${path}` + (leaked.length ? `, leak-check: FAILED - de-identify before filing: ${leaked.join(', ')}` : '') });
      steps.push({ kind: 'draft', title: r.title, sub });
    }
    const overflow = reports.slice(MAX_DEFECTS_PER_RUN);
    if (overflow.length) steps.push({ kind: 'deny', title: overflow.map((r) => r.title).join(', '), ledger: 'defect-report-denied', text: `over the ${MAX_DEFECTS_PER_RUN}-defects-per-run cap` });
    return { reports, steps };
  }

  const FENCE = '```';
  const CLEAN = `${FENCE}defect-report
title: External web-fetch tool returns no usable content across consecutive agent runs
---
Repro: an agent whose job budgets web searches runs on a harness that sends no tools.
Expected: the prompt says plainly that no web search is available.
Actual: two runs in a row report a failed search tool that never existed.
${FENCE}`;
  const SCENARIOS = {
    clean: CLEAN,
    leak: CLEAN.replace('Actual:', "Actual: Mira's brief to Casey went out with no research, and"),
    dup: `${FENCE}defect-report
title: claude-code harness: opaque failure when local login expires; instance env not passed to CLI providers
---
Repro: run a laptop-tier agent after the local CLI login has expired.
Expected: a clear auth error. Actual: an opaque failure.
${FENCE}`,
    three: [1, 2, 3].map((n) => `${FENCE}defect-report
title: Demo defect ${n}: schedule note repeated in the brief
---
Repro ${n}: the same scheduler note appears twice in one brief.
${FENCE}`).join('\n\n'),
  };

  const api = { runBeat, freshBeatState, applyDefects, SCENARIOS, dateStampFor };
  if (typeof module !== 'undefined') module.exports = api;
  if (typeof document === 'undefined') return;

  /* ---------------- DOM: beat simulator ---------------- */
  const prettyDate = (iso) => new Intl.DateTimeFormat('en-US', { timeZone: TZ, weekday: 'short', month: 'short', day: 'numeric' }).format(new Date(iso));

  // The page opens on the interesting case: one agent fails on the first morning.
  const freshDemo = () => { const s = freshBeatState(); s.failing = ['research-watch']; return s; };
  document.querySelectorAll('[data-beatsim]').forEach((root) => {
    let state = freshDemo();
    let last = null;
    const rows = root.querySelector('[data-rows]');
    const out = root.querySelector('[data-out]');
    const runBtn = root.querySelector('[data-run]');
    const nextBtn = root.querySelector('[data-next]');
    const resetBtn = root.querySelector('[data-reset]');
    const when = root.querySelector('[data-when]');
    root.querySelectorAll('[hidden][data-live]').forEach((el) => el.removeAttribute('hidden'));
    root.classList.add('is-live');

    function toggle(list, name, on) { const i = list.indexOf(name); if (on && i < 0) list.push(name); if (!on && i >= 0) list.splice(i, 1); }

    function renderRows() {
      rows.innerHTML = AGENTS.map((a) => {
        const cloud = CLOUD_HARNESSES.has(a.harness);
        const tier = a.commercial ? 'commercial, gated' : cloud ? 'cloud' : 'laptop only';
        // Second pass: only the fail switch, and only where the cloud beat actually runs the agent.
        const box = cloud && !a.commercial
          ? `<label class="bs__tg"><input type="checkbox" data-k="fail" data-a="${a.name}"${state.failing.includes(a.name) ? ' checked' : ''}><span>fails today</span></label>`
          : `<span class="bs__na">not run by the cloud beat</span>`;
        return `<tr><th scope="row"><span class="mono">${a.name}</span>${a.name === HUB ? ' <span class="bs__hub">hub</span>' : ''}</th>
          <td>${a.heartbeat}</td><td><span class="bs__tier bs__tier--${a.commercial ? 'gated' : cloud ? 'cloud' : 'laptop'}">${tier}</span></td>
          <td class="bs__tgs">${box}</td></tr>`;
      }).join('');
    }

    function li(cls, html) { return `<li class="${cls}">${html}</li>`; }
    // The engine's own reason strings, said in plain words.
    function plain(reason) {
      let m;
      if ((m = reason.match(/^(\w+): (\d+)h since last run$/))) return `${m[1]}: last ran ${Math.round(m[2] / 24)} days ago, so it is due`;
      if ((m = reason.match(/^(\w+): ran (\d+)h ago/))) return `${m[1]}: ran ${Math.floor(m[2] / 24)} days ago, not due yet`;
      if (/^DUE \(/.test(reason)) return 'due, but it only runs on my laptop, so the brief reminds me to run it';
      if (/laptop-tier harness .* not run in cloud/.test(reason)) return 'only runs on my laptop, and not due today';
      if (/^commercial/.test(reason)) return 'commercial agent, stays off until its activation gates open';
      if (reason === 'never run') return 'never run yet, so it is due';
      return reason;
    }
    function takeaway(r) {
      const names = (list) => list.map((x) => x.agent).join(' and ');
      const blocked = r.tierBlocked.length ? ` The brief also reminds me to run ${names(r.tierBlocked)} on my laptop.` : '';
      if (r.failures.length) {
        return `${names(r.failures)} failed, and the beat kept going: ${r.runs.length} agent${r.runs.length === 1 ? '' : 's'} still ran, the brief went out, and a separate failure DM names ${names(r.failures)}. It never logged a finished run, so it is due again at the next beat.`;
      }
      if (!r.runs.length) return 'Nobody was due, so nothing ran and nothing was sent.';
      return `Every due agent ran and the brief went out. No failure DM was sent, so silence means success.${blocked}`;
    }
    function renderResult(r) {
      if (!r) { out.innerHTML = `<p class="bs__hint">Tick or untick "fails today", then run the beat.</p>`; return; }
      const order = r.due.map((d) => {
        const fail = r.failures.find((f) => f.agent === d.agent);
        const run = r.runs.find((x) => x.agent === d.agent);
        const note = run && run.notes ? `<span class="bs__sub">its prompt includes a note to remind me about ${run.notes.join(' and ')}</span>` : '';
        return li(fail ? 'is-fail' : 'is-ok', `<b class="mono">${d.agent}</b> <span class="bs__why">${esc(plain(d.reason))}</span><span class="bs__res">${fail ? 'failed, the beat continues' : 'report written'}</span>${note}`);
      }).join('');
      const skipped = r.skipped.map((s) => li('is-skip', `<b class="mono">${s.agent}</b> <span class="bs__why">${esc(plain(s.reason))}</span>`)).join('');
      out.innerHTML = `
        <p class="bs__takeaway">${esc(takeaway(r))}</p>
        <p class="bs__label">Due, in run order</p><ol class="bs__list">${order || li('is-skip', 'Nobody is due.')}</ol>
        <p class="bs__label">Skipped</p><ul class="bs__list">${skipped}</ul>
        <div class="bs__term" role="group" aria-label="What the beat leaves behind">
          <span><i>commit</i> ${esc(r.commit)}</span>
          <span><i>deliver</i> ${esc(r.delivery)}</span>
          ${r.dm ? r.dm.map((l, i) => `<span class="no"><i>${i ? '' : 'failure DM'}</i> ${esc(l)}</span>`).join('') : '<span class="ok"><i>failure DM</i> none, so silence means success</span>'}
          ${r.consumed.length ? `<span><i>schedule</i> wake consumed for ${esc(r.consumed.join(', '))}</span>` : ''}
        </div>`;
    }

    function sync() {
      when.textContent = `${prettyDate(state.now)}, 08:00 New York`;
      runBtn.disabled = Boolean(last);
      nextBtn.disabled = !last;
    }

    rows.addEventListener('change', (e) => {
      const t = e.target; if (!t.matches('input[data-k]')) return;
      const list = t.dataset.k === 'fail' ? state.failing : state.schedule[t.dataset.k];
      toggle(list, t.dataset.a, t.checked);
    });
    runBtn.addEventListener('click', () => { last = runBeat(state); renderResult(last); renderRows(); sync(); out.focus({ preventScroll: true }); });
    nextBtn.addEventListener('click', () => { state.now = new Date(Date.parse(state.now) + 86400000).toISOString(); state.failing = []; last = null; renderRows(); renderResult(null); sync(); });
    resetBtn.addEventListener('click', () => { state = freshDemo(); last = null; renderRows(); renderResult(null); sync(); });
    renderRows(); renderResult(null); sync();
  });

  /* ---------------- DOM: defect gate lab ---------------- */
  document.querySelectorAll('[data-defectlab]').forEach((root) => {
    const ta = root.querySelector('textarea');
    const out = root.querySelector('[data-out]');
    const chips = [...root.querySelectorAll('[data-scenario]')];
    const agents = [...root.querySelectorAll('[data-agent]')];
    root.querySelectorAll('[hidden][data-live]').forEach((el) => el.removeAttribute('hidden'));
    ta.removeAttribute('readonly');
    let agent = 'chief-of-staff';
    let timer = 0;

    // One plain sentence for the outcome, above the engine's own ledger lines.
    function verdict(r) {
      const k = r.steps.map((x) => x.kind);
      if (k[0] === 'none') return 'No report block, so nothing leaves the private brain.';
      if (k.length === 1 && k[0] === 'deny' && r.reports.length && agent !== 'chief-of-staff') return 'Stopped at check 1: this agent is not allowed to file engine issues. Nothing leaves the brain.';
      const filed = k.filter((x) => x === 'file').length;
      const capped = k.filter((x) => x === 'deny').length;
      if (k.includes('draft')) return 'Stopped at check 2: the report names one of the brain's people, so it is never filed. It becomes a private draft in the brain instead.';
      if (k.includes('dup')) return 'Stopped at check 3: the same bug is already an open issue, so no second issue is filed.';
      if (capped && filed) return `Check 4: ${filed} filed, and the rest refused by the cap of two per run.`;
      if (capped) return 'Refused before filing. Nothing leaves the brain.';
      return 'Passes all four checks: this would become a public issue on the engine.';
    }
    function render() {
      const r = applyDefects(ta.value, agent, true);
      const head = `<p class="dl__verdict">${esc(verdict(r))}</p><p class="dl__count">${r.reports.length} defect-report block${r.reports.length === 1 ? '' : 's'} parsed</p>`;
      out.innerHTML = head + '<ol class="dl__steps">' + r.steps.map((s) => {
        if (s.kind === 'none') return `<li class="is-skip">${esc(s.text)}</li>`;
        const title = `<b>${esc(s.title)}</b>`;
        if (s.kind === 'draft') return `<li class="is-draft">${title}${s.sub.map((x) => `<span class="dl__ledger">${esc(x.ledger)}</span><span>${esc(x.text)}</span>`).join('')}</li>`;
        const cls = s.kind === 'file' ? 'is-file' : s.kind === 'dup' ? 'is-dup' : 'is-deny';
        return `<li class="${cls}">${title}<span class="dl__ledger">${esc(s.ledger)}</span><span>${esc(s.text)}</span></li>`;
      }).join('') + '</ol>';
    }
    function pick(btn) {
      chips.forEach((b) => b.setAttribute('aria-checked', String(b === btn)));
      ta.value = SCENARIOS[btn.dataset.scenario];
      render();
    }
    chips.forEach((b) => b.addEventListener('click', () => pick(b)));
    agents.forEach((b) => b.addEventListener('click', () => {
      agent = b.dataset.agent;
      agents.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
      render();
    }));
    ta.addEventListener('input', () => { clearTimeout(timer); timer = setTimeout(render, 150); chips.forEach((b) => b.setAttribute('aria-checked', 'false')); });
    pick(chips[0]);
  });
})();
