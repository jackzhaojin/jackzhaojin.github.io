/* Explainer for "One da.live MCP Server Across Claude, Gemini, Azure OpenAI and n8n".
   Format switcher: the same get_dalive_content tool as each LLM client in
   azure-da-mcp at 5c7549b declares it, asks for it, reads it and answers it.
   Without JavaScript all three panels show one after another.
   (October 4, 2026: the path input and the session lab were removed; the session
   behavior is a static table in the page.) */
(function () {
  'use strict';

  var dia = document.querySelector('[data-dia]');
  if (!dia) return;
  var tabs = [].slice.call(dia.querySelectorAll('[role="tab"]'));
  var panels = [].slice.call(dia.querySelectorAll('.dia__panel'));
  var show = function (i) {
    tabs.forEach(function (t, j) { t.setAttribute('aria-selected', String(i === j)); t.tabIndex = i === j ? 0 : -1; });
    panels.forEach(function (p, j) { p.hidden = i !== j; });
  };
  tabs.forEach(function (t, i) {
    t.addEventListener('click', function () { show(i); });
    t.addEventListener('keydown', function (e) {
      var k = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (k) { var n = (i + k + tabs.length) % tabs.length; show(n); tabs[n].focus(); }
    });
  });
  dia.querySelectorAll('[hidden][data-js]').forEach(function (el) { el.hidden = false; });
  dia.classList.add('is-live');
  show(0);
})();
