/* Freeze-frame lab for "Playwright Stakeholder Demos".
   Runs the same rule as calculateFreezes() in demo/pipeline/merge-highlights-v2.mjs
   (harness-v2-test at fc9e09c): walk the captions in order, start each voice clip
   AUDIO_SHIFT seconds before its caption, keep MIN_GAP of silence between clips,
   and when a clip would start too early, hold the video on one frame until it can.
   Caption times are the script's own list; clip lengths are the 21 voice clips
   committed in the repo (demo/test-output/audio at 94b027b). The static list in the
   page is this function's output with the script's defaults. October 4, 2026: the
   gap slider and the early-start checkbox were removed; both are fixed at the script's values. */
(() => {
  const root = document.querySelector('[data-ff]');
  if (!root) return;

  const CAPTIONS = [
    [1.4, 'Welcome to ProjectHub, a modern project management dashboard.'],
    [5.5, 'Interactive stat cards show key metrics at a glance.'],
    [9.7, 'Data visualization powered by Recharts.'],
    [12.8, 'Hover tooltips reveal exact data points.'],
    [17.0, 'The activity feed tracks team actions in real time.'],
    [21.5, 'Next, the Projects page.'],
    [24.5, 'Search, sorting, and pagination, all built in.'],
    [27.0, 'Real-time filtering as you type.'],
    [30.5, 'Sortable column headers toggle direction.'],
    [34.0, 'Creating a new project via modal form.'],
    [38.5, 'Success, the new project appears instantly.'],
    [41.5, 'The Kanban board, drag-and-drop task management.'],
    [47.0, 'Moving a task from To Do to In Progress.'],
    [50.0, 'And from In Progress to Done.'],
    [53.5, 'Dark mode, one click transforms the entire interface.'],
    [59.0, 'Every chart and card adapts to the dark palette.'],
    [67.5, 'Responsive design, from desktop to mobile.'],
    [71.5, 'Mobile at 375 pixels, everything adapts.'],
    [75.0, 'Tablet, the sidebar collapses to icons.'],
    [77.5, 'Back to desktop, full layout restored.'],
    [79.5, 'ProjectHub, React 18, TypeScript, Tailwind CSS. No backend required. Thanks for watching.'],
  ];
  const CLIP = [4.226, 3.529, 2.740, 2.926, 3.483, 2.647, 4.319, 1.997, 2.694, 2.694, 3.344,
    3.529, 3.251, 2.322, 3.994, 2.926, 3.483, 4.226, 3.344, 3.111, 7.848];
  const RECORDED = 84; // "Actual recorded video is ~84s" (comment in generate-highlights-voice.mjs)

  // Same walk as calculateFreezes(): videoShift grows with every freeze inserted.
  function calculateFreezes(speed, minGap, shift) {
    let videoShift = 0;
    let prevEnd = -Infinity;
    const freezes = [];
    const clips = [];
    CAPTIONS.forEach(([startSec], i) => {
      const dur = CLIP[i] / speed;
      const visualNew = startSec + videoShift;
      let idealStart = visualNew + shift;
      const earliest = prevEnd + minGap;
      if (idealStart < earliest) {
        const freezeDur = Math.ceil((earliest - idealStart) * 10) / 10; // round up to 0.1 s
        freezes.push({ id: i + 1, originalTime: startSec, newTime: visualNew, duration: freezeDur });
        videoShift += freezeDur;
        idealStart = earliest;
      }
      const start = Math.max(idealStart, 0);
      clips.push({ id: i + 1, start, dur });
      prevEnd = start + dur;
    });
    return { freezes, clips, total: Math.max(RECORDED + videoShift, prevEnd), held: videoShift };
  }

  const $ = (s) => root.querySelector(s);
  const speedIn = $('[data-speed]');
  const speedOut = $('[data-speed-out]');
  const videoTrack = $('[data-track="video"]');
  const voiceTrack = $('[data-track="voice"]');
  const summary = $('[data-summary]');
  const list = $('[data-freezes]');
  const fmt = (s) => `${Math.floor(s / 60)}:${(s % 60).toFixed(1).padStart(4, '0')}`;

  function render() {
    const speed = +speedIn.value;
    const minGap = 0.3;  // MIN_GAP in the script
    const shift = -0.5;  // AUDIO_SHIFT in the script
    speedOut.textContent = speed === 1 ? '1.00x, the clips as recorded' : `${speed.toFixed(2)}x, clips ${speed > 1 ? 'shorter' : 'longer'}`;
    const { freezes, clips, total, held } = calculateFreezes(speed, minGap, shift);
    const pct = (t) => `${(t / total) * 100}%`;

    // Video track: normal segments between freezes, a held block at each freeze.
    const segs = [];
    let cursorNew = 0;
    let cursorOld = 0;
    freezes.forEach((f) => {
      const len = f.originalTime - cursorOld;
      segs.push(`<span class="ff__seg" style="left:${pct(cursorNew)};width:${pct(len)}"></span>`);
      cursorNew += len;
      segs.push(`<span class="ff__seg ff__seg--hold" style="left:${pct(cursorNew)};width:${pct(f.duration)}" title="Held ${f.duration.toFixed(1)} s for caption ${f.id}"></span>`);
      cursorNew += f.duration;
      cursorOld = f.originalTime;
    });
    segs.push(`<span class="ff__seg" style="left:${pct(cursorNew)};width:${pct(RECORDED - cursorOld)}"></span>`);
    videoTrack.innerHTML = segs.join('');
    voiceTrack.innerHTML = clips.map((c) => `<span class="ff__clip" style="left:${pct(c.start)};width:${pct(c.dur)}" title="Clip ${c.id}: ${CAPTIONS[c.id - 1][1]}">${c.id}</span>`).join('');

    const lead = speed === 1 ? 'With the clips as recorded' : `At ${speed.toFixed(2)}x`;
    summary.textContent = freezes.length
      ? `${lead}, the merge holds the video ${freezes.length} ${freezes.length === 1 ? 'time' : 'times'}, ${held.toFixed(1)} s in total, so no clip talks over the next caption. The finished video runs about ${Math.round(total)} s, from about ${RECORDED} s recorded.`
      : `${lead}, every clip ends before the next caption, so the video never has to hold. It stays about ${RECORDED} s.`;
    list.innerHTML = freezes.map((f) => `<li><span class="ff__t">${f.duration.toFixed(1)} s</span> before caption ${f.id}, "${CAPTIONS[f.id - 1][1]}", at ${fmt(f.originalTime)} in the recording</li>`).join('');
  }

  root.classList.add('is-live');
  root.querySelectorAll('[hidden][data-live]').forEach((el) => { el.hidden = false; });
  speedIn.addEventListener('input', render);
  $('[data-reset]').addEventListener('click', () => { speedIn.value = 1; render(); });
  render();
})();
