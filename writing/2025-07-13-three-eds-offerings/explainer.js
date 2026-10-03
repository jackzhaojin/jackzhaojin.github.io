/* Three EDS offerings article: pick an offering, see its path on the diagram.
   The paths are read straight from the diagram's arrows: editor, storage, then the
   shared listener, compile step and Edge Delivery that the browser asks for pages. */
(() => {
  'use strict';
  const PATHS = {
    docs: ['docs-editor', 'docs-store', 'listener', 'compile', 'edge', 'browser'],
    ue: ['ue-editor', 'ue-store', 'listener', 'compile', 'edge', 'browser'],
    da: ['da-editor', 'da-store', 'listener', 'compile', 'edge', 'browser'],
    shared: ['listener', 'compile', 'edge', 'browser'],
  };
  const SAY = {
    docs: 'Documents: the content starts as a document in Google Docs or Word.',
    ue: 'Universal Editor: the content starts as AEM nodes, edited in AEM.',
    da: 'da.live: the content starts in Adobe’s cloud, edited in the browser.',
    shared: 'Shared by all three: preview or publish, compile content with code, deliver from the edge.',
  };
  document.querySelectorAll('[data-eds-map]').forEach((fig) => {
    const chips = fig.querySelector('.eds-map__chips');
    const buttons = [...chips.querySelectorAll('[data-o]')];
    const boxes = [...fig.querySelectorAll('[data-box]')];
    const steps = [...fig.querySelectorAll('[data-step]')];
    const say = fig.querySelector('[data-say]');
    const show = (o) => {
      buttons.forEach((b) => b.setAttribute('aria-checked', String(b.dataset.o === o)));
      boxes.forEach((b) => b.classList.toggle('on', PATHS[o].includes(b.dataset.box)));
      steps.forEach((li) => {
        li.classList.toggle('on', li.dataset.on.split(' ').includes(o));
        li.querySelectorAll('[data-o]').forEach((s) => s.classList.toggle('on', s.dataset.o === o));
      });
      say.textContent = SAY[o];
    };
    buttons.forEach((b, i) => {
      b.addEventListener('click', () => show(b.dataset.o));
      b.addEventListener('keydown', (e) => {
        if (!['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) return;
        e.preventDefault();
        const n = buttons[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + buttons.length) % buttons.length];
        n.focus(); show(n.dataset.o);
      });
    });
    chips.hidden = false;
    fig.classList.add('is-live');
    show('docs');
  });
})();
