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

  const DATA = {
    html: { total: 563, only: { claude: 459, kimi: 1, gpt: 5, gemini: 0 }, shared: 31, fresh: 67 },
    css: { total: 770, only: { claude: 425, kimi: 11, gpt: 19, gemini: 0 }, shared: 148, fresh: 167 },
    js: { total: 381, only: { claude: 237, kimi: 2, gpt: 1, gemini: 4 }, shared: 19, fresh: 118 },
  };
  const NAMES = { claude: 'Claude Fable 5', kimi: 'Kimi K3', gpt: 'GPT 5.6', gemini: 'Gemini 3.5 Flash' };
  const KEPT = {
    gpt: ['The home screen: its layout, look and feel', 'Paired with Kimi\'s words. My answer to the merge question was "GPT layout, Kimi voice"'],
    kimi: ['The scrolling and the animation', 'The numbers that count up as you scroll', 'Its HTML, which I felt followed the Stitch design more faithfully', 'The pastel palette, shared with Claude'],
    claude: ['The foundation the others were grafted onto', 'The navigation and the navigable timeline', 'The carousel view and the slider', 'The numbers that count up, shared with Kimi'],
    gemini: ['Nothing. Asked whether anything was worth saving, I said no.'],
  };
  const ORDER = ['claude', 'kimi', 'gpt', 'gemini'];

  const $ = (s) => root.querySelector(s);
  const bar = $('[data-bar]');
  const legend = $('[data-legend]');
  const kept = $('[data-kept]');
  const keptName = $('[data-kept-name]');
  const lines = $('[data-lines]');
  const fileBtns = [...root.querySelectorAll('[data-file]')];
  const modelBtns = [...root.querySelectorAll('[data-model]')];
  let file = 'html';
  let model = 'claude';
  const pct = (n, t) => `${((n / t) * 100).toFixed(1)}%`;

  function render() {
    const d = DATA[file];
    const parts = [
      ...ORDER.map((m) => ({ key: m, label: `only in ${NAMES[m]}`, n: d.only[m] })),
      { key: 'shared', label: 'in two or more builds', n: d.shared },
      { key: 'fresh', label: 'new in the merge', n: d.fresh },
    ];
    bar.innerHTML = parts.filter((p) => p.n > 0).map((p) => `<span class="mg__part mg__part--${p.key}${p.key === model ? ' is-on' : ''}" style="width:${pct(p.n, d.total)}" title="${p.n} lines ${p.label}"></span>`).join('');
    legend.innerHTML = parts.map((p) => `<li class="mg__key mg__key--${p.key}${p.key === model ? ' is-on' : ''}"><span>${p.label}</span><b>${p.n}</b></li>`).join('');
    keptName.textContent = NAMES[model];
    kept.innerHTML = KEPT[model].map((k) => `<li>${k}</li>`).join('');
    const n = d.only[model];
    lines.textContent = `${n} of the ${d.total} distinct lines in the final ${file.toUpperCase()} appear only in ${NAMES[model]}'s build (${pct(n, d.total)}).`;
  }

  const wire = (btns, set) => btns.forEach((b) => b.addEventListener('click', () => {
    set(b);
    btns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    render();
  }));
  wire(fileBtns, (b) => { file = b.dataset.file; });
  wire(modelBtns, (b) => { model = b.dataset.model; });
  root.querySelectorAll('[hidden][data-live]').forEach((el) => { el.hidden = false; });
  root.classList.add('is-live');
  render();
})();
