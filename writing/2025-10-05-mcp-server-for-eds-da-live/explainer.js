/* Decision lab for "Building an MCP Server for EDS da.live".
   Two versions of the same edit. The scripted flow follows the four phases of
   functions/src/functions/EditContentFunction.js at 1ffb600. The tool loop follows
   generateEdit() in functions/src/modules/LlmClient.js at 81e4cac: one model call per
   turn, a tool_use answer runs the MCP tool and adds two messages, a text answer ends
   the loop, and MAX_TOOL_ITERATIONS = 10 caps it with the same error message.
   The reader's clicks stand in for the model. No network calls are made. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-loopx]');
  if (!lab) return;

  var MAX_TOOL_ITERATIONS = 10; // LlmClient.js line 12
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var log = lab.querySelector('.loopx__log');
  var verdict = lab.querySelector('.loopx__verdict');
  var modeBtns = [].slice.call(lab.querySelectorAll('.loopx__modes button'));
  var moveBtns = [].slice.call(lab.querySelectorAll('.loopx__moves button'));
  var presetBtns = [].slice.call(lab.querySelectorAll('.loopx__presets button'));
  var say = lab.querySelector('[data-say]');
  var stat = {};
  [].slice.call(lab.querySelectorAll('[data-stat]')).forEach(function (el) { stat[el.dataset.stat] = el; });

  var s, run = 0, mode = 'tools';

  function reset() {
    run++;
    s = { calls: 0, tools: 0, messages: 1, got: false, saved: false, savedBlind: false, done: false, resend: 0 };
    log.innerHTML = '';
    paint();
  }

  function hint(text) {
    var li = document.createElement('li');
    li.innerHTML = '<span class="static-h">' + text + '</span>';
    log.appendChild(li);
  }

  function paint() {
    stat.calls.textContent = s.calls;
    stat.tools.textContent = s.tools;
    stat.messages.textContent = s.done ? '-' : s.messages;
    stat.saved.textContent = s.saved ? 'yes' : 'no';
    moveBtns.forEach(function (b) { b.disabled = mode !== 'tools' || s.done; });
  }

  function line(who, kind, html) {
    var li = document.createElement('li');
    li.className = 'is-new';
    li.innerHTML = '<span class="who who--' + kind + '">' + who + '</span><span>' + html + '</span>';
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }

  function setVerdict(text, tone) {
    verdict.textContent = text;
    verdict.className = 'loopx__verdict' + (tone ? ' is-' + tone : '');
  }

  // One model turn in the tool loop.
  function move(kind) {
    if (mode !== 'tools' || s.done) return;
    if (s.calls === 0) log.innerHTML = '';
    s.calls++;
    var sent = s.messages;
    var html = s.got ? ' The page HTML is in it.' : '';
    if (s.got) s.resend++;
    if (kind === 'final') {
      line('call ' + s.calls, 'model', 'Sends <b>' + sent + '</b> message' + (sent > 1 ? 's' : '') + '.' + html + ' The model answers with text: <b>{ editedHtml, explanation, reasoning }</b>. No tool_use block, so the loop ends.');
      s.done = true;
      if (s.saved && s.savedBlind) setVerdict('Done, and something was saved. But the model saved before it read the page, so it wrote HTML it never saw. Nothing in the loop checks the order. The prompt asks for "FIRST: Call get_dalive_content".', 'warn');
      else if (s.saved) setVerdict('Done. The model read the page, saved it and answered: the order the prompt asks for. It took ' + s.calls + ' model calls where the scripted flow takes one.', 'ok');
      else setVerdict('Done, and nothing was saved. The function still returns 200 with the explanation, because the loop ends on any text answer. Saving is up to the model following "LAST: Call save_dalive_content".', 'warn');
      paint();
      return;
    }
    var tool = kind === 'get' ? 'get_dalive_content' : 'save_dalive_content';
    line('call ' + s.calls, 'model', 'Sends <b>' + sent + '</b> message' + (sent > 1 ? 's' : '') + '.' + html + ' The model answers with a tool_use block: <b>' + tool + '</b>.');
    s.tools++;
    if (kind === 'get') {
      s.got = true;
      line('mcp', 'tool', 'tools/call ' + tool + ': GET admin.da.live/source/... returns the page HTML.');
    } else {
      if (!s.got) s.savedBlind = true;
      s.saved = true;
      line('mcp', 'tool', 'tools/call ' + tool + ': POST admin.da.live/source/... with the HTML the model wrote.');
    }
    s.messages += 2;
    line('loop', 'code', 'Pushes the assistant turn and the tool_result, then <b>continue</b>. Next call sends ' + s.messages + ' messages.');
    if (s.calls >= MAX_TOOL_ITERATIONS) {
      s.done = true;
      line('error', 'err', 'LLM did not return a final response after tool iterations');
      setVerdict('Stopped at ' + MAX_TOOL_ITERATIONS + ' model calls without a final answer. That is the cap in LlmClient.js. The function wraps this in a retry loop, so in real life it starts over, up to 3 attempts.', 'warn');
    } else {
      setVerdict(s.got ? 'The page HTML now rides along on every later call, inside the tool_result. That is one reason the tool version uses more tokens.' : 'Waiting for the model’s next move.');
    }
    paint();
  }

  function scripted() {
    reset();
    setVerdict('Running the four phases in order.');
    var id = run;
    var steps = [
      ['phase 1', 'code', 'Code calls <b>GET admin.da.live/source/...</b> and gets the page HTML.'],
      ['phase 2', 'code', 'Code builds the prompt with the HTML inside it.'],
      ['phase 3', 'model', 'Code calls the model <b>once</b>. It returns editedHtml. No tools are offered.'],
      ['phase 4', 'code', 'Code calls <b>POST admin.da.live/source/...</b> with the edited HTML.']
    ];
    var i = 0;
    function next() {
      if (id !== run) return;
      var st = steps[i++];
      line(st[0], st[1], st[2]);
      if (st[1] === 'model') { s.calls = 1; }
      if (i === 4) {
        s.saved = true; s.done = true; paint();
        setVerdict('Same order every time: get, one model call, save. The code decides. In my test it took about 15 seconds end to end.', 'ok');
        return;
      }
      paint();
      if (reduce) next(); else setTimeout(next, 420);
    }
    next();
  }

  function setMode(m) {
    mode = m;
    modeBtns.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.mode === m)); });
    presetBtns.forEach(function (b) { b.hidden = m !== 'tools' && b.dataset.preset !== 'reset'; });
    if (m === 'tools') {
      say.textContent = 'You play the model. Each click is what it asks for on its next call.';
      reset();
      hint('Waiting for the model’s first move. Call 1 will send 1 message: the prompt.');
      setVerdict('Pick the model’s first move, or try a preset.');
    } else {
      say.textContent = 'Nothing to choose here. The code calls the model once and saves whatever comes back.';
      scripted();
    }
  }

  var presets = {
    order: ['get', 'save', 'final'],
    twice: ['get', 'get', 'save', 'final'],
    blind: ['save', 'final'],
    nosave: ['get', 'final'],
    forever: ['get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get', 'get']
  };

  function play(name) {
    if (name === 'reset') { setMode(mode); return; }
    reset();
    var id = run;
    var seq = presets[name].slice();
    (function step() {
      if (id !== run || !seq.length) return;
      move(seq.shift());
      if (reduce) step(); else setTimeout(step, 360);
    })();
  }

  modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  moveBtns.forEach(function (b) { b.addEventListener('click', function () { run++; move(b.dataset.move); }); });
  presetBtns.forEach(function (b) { b.addEventListener('click', function () { play(b.dataset.preset); }); });

  lab.querySelectorAll('[hidden]').forEach(function (el) { if (el.hasAttribute('data-js')) el.hidden = false; });
  var fallback = lab.querySelector('.loopx__static');
  if (fallback) fallback.remove();
  setMode('tools');
})();
