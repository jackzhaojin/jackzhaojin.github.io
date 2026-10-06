/* Two versions of the same edit for "Building an MCP Server for EDS da.live".
   The scripted flow follows the four phases of functions/src/functions/EditContentFunction.js
   at 1ffb600: get, build the prompt, one model call, save. The tool loop follows generateEdit()
   in functions/src/modules/LlmClient.js at 81e4cac: one model call per turn; a tool_use answer
   runs the MCP tool and pushes the assistant turn plus the tool_result, so every later call
   re-sends the whole conversation; a text answer ends the loop. Nothing checks the order.
   The scenarios are scripted model choices. No network calls are made. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-loopx]');
  if (!lab) return;

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var log = lab.querySelector('.loopx__log');
  var verdict = lab.querySelector('.loopx__verdict');
  var say = lab.querySelector('[data-say]');
  var modeBtns = [].slice.call(lab.querySelectorAll('.loopx__modes button'));
  var scen = lab.querySelector('.loopx__scen');
  var scenBtns = [].slice.call(scen.querySelectorAll('button'));
  var stat = {};
  [].slice.call(lab.querySelectorAll('[data-stat]')).forEach(function (el) { stat[el.dataset.stat] = el; });

  var SCENARIOS = {
    order: ['get', 'save', 'final'],
    twice: ['get', 'get', 'save', 'final'],
    blind: ['save', 'final']
  };
  var run = 0, mode = 'tools', preset = 'order', s;

  function times(n) { return n + (n === 1 ? ' time' : ' times'); }

  function paint() {
    stat.calls.textContent = s.calls;
    stat.tools.textContent = s.tools;
    stat.resend.textContent = times(s.resend);
    stat.saved.textContent = s.saved ? (s.blind ? 'yes, unread' : 'yes') : 'no';
  }

  function line(who, kind, text) {
    var li = document.createElement('li');
    li.className = 'is-new';
    li.innerHTML = '<span class="who who--' + kind + '">' + who + '</span><span>' + text + '</span>';
    log.appendChild(li);
    log.scrollTop = log.scrollHeight;
  }

  function setVerdict(text, tone) {
    verdict.textContent = text;
    verdict.className = 'loopx__verdict' + (tone ? ' is-' + tone : '');
  }

  function reset() {
    run++;
    s = { calls: 0, tools: 0, resend: 0, got: false, saved: false, blind: false };
    log.innerHTML = '';
    paint();
  }

  // One model call in the tool loop.
  function move(kind) {
    s.calls++;
    var withPage = s.got ? ', page HTML included' : '';
    if (s.got) s.resend++;
    var sent = s.calls === 1 ? 'Sends the prompt' : 'Sends the whole conversation so far' + withPage;
    if (kind === 'final') {
      line('call ' + s.calls, 'model', sent + '. The model answers with text, so the loop ends.');
      return;
    }
    var tool = kind === 'get' ? 'get_dalive_content' : 'save_dalive_content';
    line('call ' + s.calls, 'model', sent + '. The model asks for <b>' + tool + '</b>.');
    s.tools++;
    if (kind === 'get') {
      s.got = true;
      line('tool', 'tool', 'Fetches the page HTML from admin.da.live and adds it to the conversation.');
    } else {
      if (!s.got) s.blind = true;
      s.saved = true;
      line('tool', 'tool', 'Saves the HTML the model wrote to admin.da.live.');
    }
  }

  function finish() {
    if (preset === 'blind') {
      setVerdict('Saved, but the model never read the page, so it wrote HTML blind. The prompt says to get the page first. Nothing in the code enforces it. The scripted flow cannot do this.', 'warn');
    } else if (preset === 'twice') {
      setVerdict('Still the right result, with one more model call and one more copy of the page in every call after it. Every time I ran it, it did different things.', 'ok');
    } else {
      setVerdict(s.calls + ' model calls where the scripted flow makes one, and the page goes to the model ' + times(s.resend) + ' instead of once. That is where the extra time and tokens come from.', 'ok');
    }
  }

  function playTools() {
    reset();
    var id = run;
    var seq = SCENARIOS[preset].slice();
    setVerdict('Running the loop.');
    (function step() {
      if (id !== run) return;
      if (!seq.length) { finish(); return; }
      move(seq.shift());
      paint();
      if (reduce) step(); else setTimeout(step, 380);
    })();
  }

  function playScripted() {
    reset();
    var id = run;
    setVerdict('Running the four steps in order.');
    var steps = [
      ['step 1', 'code', 'Code fetches the page HTML from admin.da.live.'],
      ['step 2', 'code', 'Code builds the prompt with the HTML inside it.'],
      ['call 1', 'model', 'Code calls the model <b>once</b>, page HTML included. It returns the edited HTML. No tools are offered.'],
      ['step 3', 'code', 'Code saves the edited HTML to admin.da.live.']
    ];
    var i = 0;
    (function next() {
      if (id !== run) return;
      var st = steps[i++];
      line(st[0], st[1], st[2]);
      if (st[1] === 'model') { s.calls = 1; s.resend = 1; }
      if (i === steps.length) {
        s.saved = true; paint();
        setVerdict('Same order every time: get, one model call, save. The code decides, so the order can’t go wrong. In my test this took about 15 seconds end to end.', 'ok');
        return;
      }
      paint();
      if (reduce) next(); else setTimeout(next, 380);
    })();
  }

  function setMode(m) {
    mode = m;
    modeBtns.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.mode === m)); });
    scen.hidden = m !== 'tools';
    if (m === 'tools') {
      say.textContent = 'The model picks every step. Pick what it does:';
      playTools();
    } else {
      say.textContent = 'Nothing to pick. The code runs the same four steps every time.';
      playScripted();
    }
  }

  function setPreset(p) {
    preset = p;
    scenBtns.forEach(function (b) { b.setAttribute('aria-checked', String(b.dataset.preset === p)); });
    playTools();
  }

  function arrows(btns, pick) {
    btns.forEach(function (b, i) {
      b.addEventListener('keydown', function (e) {
        if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].indexOf(e.key) === -1) return;
        e.preventDefault();
        var n = btns[(i + (e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 1) + btns.length) % btns.length];
        n.focus(); pick(n);
      });
    });
  }

  modeBtns.forEach(function (b) { b.addEventListener('click', function () { setMode(b.dataset.mode); }); });
  scenBtns.forEach(function (b) { b.addEventListener('click', function () { setPreset(b.dataset.preset); }); });
  arrows(modeBtns, function (b) { setMode(b.dataset.mode); });
  arrows(scenBtns, function (b) { setPreset(b.dataset.preset); });

  lab.querySelectorAll('[data-js]').forEach(function (el) { el.hidden = false; });
  setMode('tools');
})();
