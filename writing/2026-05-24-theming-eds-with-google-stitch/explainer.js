/* Token swap lab for "Theming EDS with Google Stitch". Each switch swaps one group of
   values between the boilerplate (before commit d6355ee) and the Stitch theme
   (after it). The values live in explainer.css; this file only flips the classes. */
(function () {
  'use strict';
  document.querySelectorAll('[data-tokenlab]').forEach(function (lab) {
    var page = lab.querySelector('[data-page]');
    var table = lab.querySelector('[data-table]');
    var note = lab.querySelector('[data-note]');
    var toggles = Array.prototype.slice.call(lab.querySelectorAll('[data-group]'));
    var CLASS = { colors: 'c-after', fonts: 'f-after', buttons: 'b-after' };
    var state = { colors: true, fonts: true, buttons: true };

    lab.querySelector('.tkl__controls').hidden = false;
    table.classList.add('is-live');

    function render() {
      Object.keys(CLASS).forEach(function (g) { page.classList.toggle(CLASS[g], state[g]); });
      toggles.forEach(function (t) { t.setAttribute('aria-checked', String(state[t.dataset.group])); });
      table.querySelectorAll('tbody tr').forEach(function (tr) { tr.dataset.on = state[tr.dataset.g] ? 'after' : 'before'; });
      var on = Object.keys(state).filter(function (g) { return state[g]; });
      var all = on.length === 3; var none = on.length === 0;
      var off = Object.keys(state).filter(function (g) { return !state[g]; });
      note.textContent = all ? 'The finished theme from the commit: Stitch colors, fonts and buttons.'
        : none ? 'All boilerplate: the site as it looked before the commit.'
        : 'Stitch ' + on.join(' and ') + ', boilerplate ' + off.join(' and ') + '.';
    }

    toggles.forEach(function (t) {
      t.addEventListener('click', function () { state[t.dataset.group] = !state[t.dataset.group]; render(); });
    });
    render();
  });
})();
