/* AEM headless omnichannel article: the consideration lens.
   The table in the page is the single source: each cell names the boxes (data-n) and
   arrows (data-e) on that solution's diagram, and its text becomes the note. */
(() => {
  'use strict';
  document.querySelectorAll('[data-lens]').forEach((fig) => {
    const chips = fig.querySelector('.lens__chips');
    const buttons = [...chips.querySelectorAll('[data-c]')];
    const sols = [...fig.querySelectorAll('.lens__sol')];
    const rows = Object.fromEntries([...fig.querySelectorAll('tbody tr[data-c]')].map((tr) => [tr.dataset.c, tr]));
    const list = (s) => (s || '').split(/\s+/).filter(Boolean);

    const show = (c) => {
      buttons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.c === c)));
      Object.entries(rows).forEach(([k, tr]) => tr.classList.toggle('on', k === c));
      sols.forEach((sol) => {
        const td = rows[c].querySelector(`td[data-sol="${sol.dataset.sol}"]`);
        const nodes = list(td.dataset.n), edges = list(td.dataset.e);
        sol.classList.add('has-focus');
        sol.querySelectorAll('.lens__node').forEach((g) => g.classList.toggle('on', nodes.includes(g.dataset.n)));
        sol.querySelectorAll('.lens__edge, .lens__elabel').forEach((p) => p.classList.toggle('on', edges.includes(p.dataset.e)));
        sol.querySelector('[data-say]').textContent = td.textContent.trim();
      });
    };

    buttons.forEach((b, i) => {
      b.addEventListener('click', () => show(b.dataset.c));
      b.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        const n = buttons[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length];
        n.focus(); show(n.dataset.c);
      });
    });
    chips.hidden = false;
    fig.querySelector('.lens__all').removeAttribute('open');
    show('pushpull');
  });
})();
