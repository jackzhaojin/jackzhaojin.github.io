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
    var presets = Array.prototype.slice.call(lab.querySelectorAll('[data-preset] [role="radio"]'));
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
      presets.forEach(function (b) {
        var checked = (b.dataset.v === 'after' && all) || (b.dataset.v === 'before' && none);
        b.setAttribute('aria-checked', String(checked));
        b.tabIndex = checked || (!all && !none && b.dataset.v === 'after') ? 0 : -1;
      });
      note.textContent = all ? 'Showing all three groups from the commit.'
        : none ? 'Showing the boilerplate as it was before the commit.'
        : 'Theme values for ' + on.join(' and ') + '; boilerplate for the rest.';
    }

    toggles.forEach(function (t) {
      t.addEventListener('click', function () { state[t.dataset.group] = !state[t.dataset.group]; render(); });
    });
    presets.forEach(function (b, i) {
      b.addEventListener('click', function () {
        var v = b.dataset.v === 'after';
        Object.keys(state).forEach(function (g) { state[g] = v; });
        render();
      });
      b.addEventListener('keydown', function (e) {
        if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
        e.preventDefault();
        var n = presets[(i + 1) % presets.length]; n.click(); n.focus();
      });
    });
    render();
  });
})();
