/* Explainers for "One da.live MCP Server Across Claude, Gemini, Azure OpenAI and n8n".
   1. Dialect switcher: the same get_dalive_content tool as each LLM client in
      azure-da-mcp at 5c7549b declares it, asks for it, reads it and answers it.
   2. Session lab: the session and token checks of /api/mcp (McpSessionFunction.js)
      and /api/mcp-streamable (McpStreamableFunction.js) at 5c7549b, with the same
      status codes and error messages. Nothing here calls a network. */
(function () {
  'use strict';

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  // ---------- 1. dialect switcher ----------
  var dia = document.querySelector('[data-dia]');
  if (dia) {
    var input = dia.querySelector('input');
    var tabs = [].slice.call(dia.querySelectorAll('[role="tab"]'));
    var panels = [].slice.call(dia.querySelectorAll('.dia__panel'));
    var fill = function () {
      var path = input.value || '/source/org/site/index.html';
      var asJson = JSON.stringify({ path: path });
      dia.querySelectorAll('[data-path]').forEach(function (el) { el.innerHTML = '<mark>' + esc(JSON.stringify(path)) + '</mark>'; });
      dia.querySelectorAll('[data-args-string]').forEach(function (el) { el.innerHTML = '<mark>' + esc(JSON.stringify(asJson)) + '</mark>'; });
      dia.querySelectorAll('[data-parsed]').forEach(function (el) { el.textContent = 'toolInput = ' + asJson; });
    };
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
    input.addEventListener('input', fill);
    dia.querySelectorAll('[hidden][data-js]').forEach(function (el) { el.hidden = false; });
    dia.classList.add('is-live');
    fill();
    show(0);
  }

  // ---------- 2. session lab ----------
  var lab = document.querySelector('[data-sess]');
  if (!lab) return;
  var state = { ep: 'streamable', method: 'call', session: 'unknown', token: 'header' };
  var statusEl = lab.querySelector('.sess__status');
  var bodyEl = lab.querySelector('.sess__body');
  var whyEl = lab.querySelector('.sess__why');
  var SRC = 'https://github.com/jackzhaojin/azure-da-mcp/blob/5c7549b/functions/src/functions/';

  function link(file, line) { return '<a href="' + SRC + file + '#L' + line + '">' + file + ' line ' + line + '</a>'; }

  function decide(s) {
    var file = s.ep === 'mcp' ? 'McpSessionFunction.js' : 'McpStreamableFunction.js';
    var bearer = s.token !== 'none';
    var sessionId = s.session === 'none' ? null : (s.session === 'known' ? 'known' : 'unknown');
    var known = s.session === 'known';
    var err = function (msg, line, why) { return { ok: false, status: 401, body: { jsonrpc: '2.0', error: { code: -32001, message: msg }, id: 1 }, why: why + ' Decided at ' + link(file, line) + '.' }; };
    var ok = function (result, line, why) { return { ok: true, status: 200, body: { jsonrpc: '2.0', result: result, id: 1 }, why: why + (line ? ' Decided at ' + link(file, line) + '.' : '') }; };
    var tokenWhy = s.token === 'header' ? 'The token comes from the Authorization header.' : s.token === 'env' ? 'No Authorization header, so the token falls back to DALIVE_BEARER_TOKEN on the function.' : 'No header and no DALIVE_BEARER_TOKEN, so there is no token at all.';
    var tools = { tools: ['get_dalive_content', 'save_dalive_content'] };
    var page = { content: [{ type: 'text', text: '{ "htmlContent": "<body>...", ... }' }] };

    if (s.method === 'list') {
      if (sessionId && !known) return err('Invalid session: Session not found or expired', s.ep === 'mcp' ? 184 : 200, 'This instance has never seen that session ID. Both endpoints reject a session they do not know, even for a tool list.');
      return ok(tools, s.ep === 'mcp' ? 184 : 200, sessionId ? 'The session is in this instance’s memory, so the list comes back.' : 'No session header at all is fine for a tool list on both endpoints.');
    }
    if (s.ep === 'mcp') {
      if (!sessionId || !known) return err('Invalid session: Session not found. Call initialize first.', 219, sessionId ? 'The session ID points at another instance’s memory. /api/mcp has no fallback.' : '/api/mcp needs a session for every tool call.');
      if (!bearer) { var r = err('Authentication failed: Bearer token not found in session context', 219, ''); r.why = 'The session exists but was created without a token, so the tool\u2019s own token check stops it, at <a href="https://github.com/jackzhaojin/azure-da-mcp/blob/5c7549b/functions/src/mcp/utils/validator.js#L129-L132">validator.js line 129</a>.'; return r; }
      return ok(page, 0, 'Known session with a token: the tool runs and returns the page. ' + tokenWhy);
    }
    // /api/mcp-streamable
    if (!known && !bearer) return err('Invalid session: No session or Bearer token provided.', 257, 'No usable session and no token to fall back on.');
    if (known && !bearer) return err('Invalid session: No session or Bearer token provided.', 257, 'The session exists but holds no token, and there is none to fall back on.');
    if (!known) return ok(page, 246, 'No usable session, so it builds a temporary one from the token and runs the tool anyway. ' + tokenWhy);
    return ok(page, 241, 'Known session: the tool runs with the token stored at initialize. ' + tokenWhy);
  }

  function render() {
    lab.querySelectorAll('.xp-tabs button').forEach(function (b) { b.setAttribute('aria-checked', String(state[b.parentNode.dataset.key] === b.dataset.v)); });
    var r = decide(state);
    statusEl.textContent = 'HTTP ' + r.status + (r.ok ? ' OK' : ' Unauthorized');
    statusEl.className = 'sess__status ' + (r.ok ? 'ok' : 'no');
    bodyEl.textContent = JSON.stringify(r.body, null, 2);
    whyEl.innerHTML = r.why;
  }

  lab.querySelectorAll('.xp-tabs button').forEach(function (b) {
    b.addEventListener('click', function () { state[b.parentNode.dataset.key] = b.dataset.v; render(); });
  });
  lab.querySelectorAll('[hidden][data-js]').forEach(function (el) { el.hidden = false; });
  render();
})();
