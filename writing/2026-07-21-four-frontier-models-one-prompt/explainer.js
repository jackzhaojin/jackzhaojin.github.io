/* Two views of the merge for "Four Frontier Models, One Prompt".
   Left: what Jack said he kept from each model (video, 11:36 to 12:52, and his answers
   to the merge questions). Right: what the files say. For every distinct non-blank line
   in the merged files (career-blogs portfolio, commit c26ed73, the version in the
   video), we checked which of the four model builds also contains it. A line found in
   exactly one build counts for that model; a line in two or more counts as shared;
   a line in none was written new during the merge. */
(() => {
  const root = document.querySelector('[data-merge]');
  if (!root) return;

  // All three files together. Per file: HTML 563 (Claude 459, Kimi 1, GPT 5, Gemini 0,
  // shared 31, new 67), CSS 770 (425, 11, 19, 0, 148, 167), JS 381 (237, 2, 1, 4, 19, 118).
  const D = { total: 1714, only: { claude: 1121, kimi: 14, gpt: 25, gemini: 4 }, shared: 198, fresh: 352 };
  const NAMES = { claude: 'Claude Fable 5', kimi: 'Kimi K3', gpt: 'GPT 5.6', gemini: 'Gemini 3.5 Flash' };
  const KEPT = {
    gpt: ['The home screen: its layout, look and feel', 'Paired with Kimi\'s words. My answer to the merge question was "GPT layout, Kimi voice"'],
    kimi: ['The scrolling and the animation', 'The numbers that count up as you scroll', 'Its HTML, which I felt followed the Stitch design more faithfully', 'The pastel palette, shared with Claude'],
    claude: ['The foundation the others were grafted onto', 'The navigation and the navigable timeline', 'The carousel view and the slider', 'The numbers that count up, shared with Kimi'],
    gemini: ['Nothing. Asked whether anything was worth saving, I said no.'],
  };
  const SAYS = {
    claude: 'They agree. Claude was the base, and 1,121 of the 1,714 lines (65%) appear only in its build.',
    kimi: 'They don\'t agree. Only 14 lines (under 1%) appear only in Kimi\'s build. What I kept from Kimi was a look and a behavior, and it mostly came in as new code.',
    gpt: 'They don\'t agree. Only 25 lines (1.5%) appear only in GPT\'s build. The home screen I kept mostly came in as new code on Claude\'s skeleton.',
    gemini: 'They agree. I kept nothing, and only 4 lines appear only in Gemini\'s build.',
  };
  const ORDER = ['claude', 'kimi', 'gpt', 'gemini'];

  const $ = (s) => root.querySelector(s);
  const bar = $('[data-bar]');
  const legend = $('[data-legend]');
  const kept = $('[data-kept]');
  const keptName = $('[data-kept-name]');
  const lines = $('[data-lines]');
  const modelBtns = [...root.querySelectorAll('[data-model]')];
  let model = 'claude';
  const pct = (n, t) => `${((n / t) * 100).toFixed(1)}%`;

  function render() {
    const parts = [
      ...ORDER.map((m) => ({ key: m, label: `only in ${NAMES[m]}`, n: D.only[m] })),
      { key: 'shared', label: 'in two or more builds', n: D.shared },
      { key: 'fresh', label: 'new in the merge', n: D.fresh },
    ];
    bar.innerHTML = parts.filter((p) => p.n > 0).map((p) => `<span class="mg__part mg__part--${p.key}${p.key === model ? ' is-on' : ''}" style="width:${pct(p.n, D.total)}" title="${p.n} lines ${p.label}"></span>`).join('');
    legend.innerHTML = parts.map((p) => `<li class="mg__key mg__key--${p.key}${p.key === model ? ' is-on' : ''}"><span>${p.label}</span><b>${p.n}</b></li>`).join('');
    keptName.textContent = NAMES[model];
    kept.innerHTML = KEPT[model].map((k) => `<li>${k}</li>`).join('');
    lines.textContent = SAYS[model];
  }

  const wire = (btns, set) => btns.forEach((b) => b.addEventListener('click', () => {
    set(b);
    btns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    render();
  }));
  wire(modelBtns, (b) => { model = b.dataset.model; });
  root.querySelectorAll('[hidden][data-live]').forEach((el) => { el.hidden = false; });
  root.classList.add('is-live');
  render();
})();
