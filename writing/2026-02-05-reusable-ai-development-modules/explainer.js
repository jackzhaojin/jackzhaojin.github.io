/* Rebuild or reuse: Jack's four patterns as stacks, from his 2026-02-05 diagram.
   Each pattern sits on the ones before it (spec-driven on ad hoc prompting, the
   harness on spec-driven, the 24/7 agent on the harness). "Rebuild" counts every box
   as its own build, the way he built them. "Reuse" builds each piece once and has
   every pattern above use it. The counts come straight from the diagram. */
(() => {
  const root = document.querySelector('[data-reuse]');
  if (!root) return;

  const PIECES = [
    { id: 'adhoc', name: 'Ad hoc prompting' },
    { id: 'spec', name: 'Spec-driven dev' },
    { id: 'harness', name: 'Harness' },
    { id: 'agent', name: '24/7 continuous agent' },
  ];
  // A pattern is its own piece plus every piece below it.
  const stackOf = (i) => PIECES.slice(0, i + 1).reverse();

  const stage = root.querySelector('[data-stage]');
  const out = root.querySelector('[data-out]');
  const modeBtns = [...root.querySelectorAll('[data-mode]')];
  let mode = 'rebuild';

  function render() {
    let built = 0;
    const firstBuilt = new Set();
    const cols = PIECES.map((top, i) => {
      const boxes = stackOf(i).map((p) => {
        let kind;
        if (mode === 'rebuild') { kind = 'built'; built += 1; }
        else if (!firstBuilt.has(p.id)) { kind = 'built'; firstBuilt.add(p.id); built += 1; }
        else kind = 'used';
        const on = '';
        const tag = kind === 'built' ? 'built here' : 'reused';
        return `<li class="ru__box ru__box--${p.id} ru__box--${kind}${on}"><span>${p.name}</span><small>${tag}</small></li>`;
      }).join('');
      return `<div class="ru__col"><p class="ru__head">${top.name}</p><ol class="ru__stack">${boxes}</ol></div>`;
    });
    stage.innerHTML = cols.join('');

    out.textContent = mode === 'rebuild'
      ? `${built} pieces built across the four patterns. Ad hoc prompting alone is built 4 times, once inside every pattern.`
      : `${built} pieces built, each one once. Every pattern above the first reuses the one below it, so ad hoc prompting is built once and used 4 times.`;
  }

  modeBtns.forEach((b) => b.addEventListener('click', () => {
    mode = b.dataset.mode;
    modeBtns.forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    render();
  }));
  root.querySelectorAll('[hidden][data-live]').forEach((el) => { el.hidden = false; });
  root.classList.add('is-live');
  render();
})();
