/* Parser lab for "A STAR Story Generator on Azure".
   parseAIResponse, parseAIResponseText, validateStories and normalizeText are
   ported line for line from src/services/responseProcessor.js in
   github.com/jackzhaojin/azure-star-generator at da712d5. The wrapping error
   messages come from storyService.js and storyController.js at the same commit.
   The model replies below are written for this page as examples. */
// A prompt is prose inside a template literal, so the shared line-by-line
// highlighter colors it wrong. Show it as plain text.
document.querySelectorAll('.code--prose .ln').forEach(function (l) { l.textContent = l.textContent; });

(function () {
  'use strict';

  // ---- ported from responseProcessor.js (da712d5) ----
  function processResponse(responseText, trace) {
    try {
      var stories = parseAIResponse(responseText, trace);
      if (!stories || stories.length === 0) {
        throw new Error('No valid stories were parsed from the response');
      }
      return validateStories(stories, trace);
    } catch (error) {
      throw new Error('Failed to process AI response: ' + error.message);
    }
  }

  function parseAIResponse(responseText, trace) {
    try {
      var jsonText = responseText;
      var jsonStartIndex = responseText.indexOf('[');
      var jsonEndIndex = responseText.lastIndexOf(']');
      if (jsonStartIndex >= 0 && jsonEndIndex > jsonStartIndex) {
        jsonText = responseText.substring(jsonStartIndex, jsonEndIndex + 1);
        trace.extract = { start: jsonStartIndex, end: jsonEndIndex, trimmed: jsonStartIndex > 0 || jsonEndIndex < responseText.length - 1 };
      } else {
        trace.extract = null;
      }
      var stories = JSON.parse(jsonText);
      if (!Array.isArray(stories)) {
        throw new Error('Response is not a valid array');
      }
      trace.path = 'json';
      return stories;
    } catch (error) {
      trace.jsonError = error.message;
      trace.path = 'text';
      return parseAIResponseText(responseText);
    }
  }

  function parseAIResponseText(responseText) {
    var stories = [];
    var chunks = responseText.split(/\n\s*\n/);
    for (var c = 0; c < chunks.length; c++) {
      var chunk = chunks[c];
      var situationMatch = chunk.match(/situation:?\s*(.*?)\s*(?=task:|$)/is);
      var taskMatch = chunk.match(/task:?\s*(.*?)\s*(?=action:|$)/is);
      var actionMatch = chunk.match(/action:?\s*(.*?)\s*(?=result:|$)/is);
      var resultMatch = chunk.match(/result:?\s*(.*)\s*$/is);
      if (situationMatch && taskMatch && actionMatch && resultMatch) {
        var actionText = actionMatch[1].trim();
        var actionItems = [];
        var bulletMatches = actionText.match(/(?:^|\n)[\s]*[•\-\*\d+\.\)]\s*(.*?)(?=(?:^|\n)[\s]*[•\-\*\d+\.\)]|$)/gs);
        if (bulletMatches && bulletMatches.length > 0) {
          actionItems = bulletMatches.map(function (bullet) {
            return bullet.replace(/^[\s]*[•\-\*\d+\.\)]\s*/, '').trim();
          });
        } else {
          actionItems = actionText.split(/[\.;]\s+/).filter(function (item) { return item.trim().length > 0; });
        }
        if (actionItems.length === 0) {
          actionItems = [actionText];
        }
        stories.push({
          situation: situationMatch[1].trim(),
          task: taskMatch[1].trim(),
          action: actionItems,
          result: resultMatch[1].trim()
        });
      }
    }
    return stories;
  }

  function validateStories(stories, trace) {
    trace.dropped = [];
    trace.converted = [];
    return stories.filter(function (story, i) {
      var hasAllFields = story &&
        typeof story === 'object' &&
        typeof story.situation === 'string' && story.situation.trim() !== '' &&
        typeof story.task === 'string' && story.task.trim() !== '' &&
        story.result && typeof story.result === 'string' && story.result.trim() !== '';
      var validAction = false;
      if (Array.isArray(story.action)) {
        validAction = story.action.length > 0 &&
          story.action.every(function (item) { return typeof item === 'string' && item.trim() !== ''; });
      } else if (typeof story.action === 'string' && story.action.trim() !== '') {
        story.action = [story.action];
        validAction = true;
        trace.converted.push(i + 1);
      }
      var keep = !!(hasAllFields && validAction);
      if (!keep) trace.dropped.push(i + 1);
      return keep;
    }).map(function (story) {
      return {
        situation: normalizeText(story.situation),
        task: normalizeText(story.task),
        action: Array.isArray(story.action) ? story.action.map(normalizeText) : [normalizeText(story.action)],
        result: normalizeText(story.result)
      };
    });
  }

  function normalizeText(text) {
    if (!text) return '';
    return text.trim().replace(/\s+/g, ' ');
  }
  // ---- end of port ----

  // The full run, wrapped the way storyService.js and storyController.js wrap errors.
  function run(text) {
    var trace = {};
    try {
      var stories = processResponse(text, trace);
      return { ok: true, status: 200, stories: stories, trace: trace };
    } catch (e) {
      var msg = 'Failed to generate stories: Story generation failed: ' + e.message;
      return { ok: false, status: 500, error: msg, trace: trace };
    }
  }

  window.StarParser = { run: run };

  var lab = document.querySelector('[data-parser-lab]');
  if (!lab) return;
  var replies = {}, takeaways = {};
  lab.querySelectorAll('template[data-reply]').forEach(function (t) {
    replies[t.dataset.reply] = t.content.textContent.replace(/^\n/, '');
    takeaways[t.dataset.reply] = t.dataset.takeaway || '';
  });
  var takeawayEl = lab.querySelector('[data-takeaway]:not(template)');
  var chips = lab.querySelector('.chips');
  var buttons = Array.prototype.slice.call(chips.querySelectorAll('button'));
  var input = lab.querySelector('[data-input]');
  var steps = {
    extract: lab.querySelector('[data-step="extract"]'),
    json: lab.querySelector('[data-step="json"]'),
    text: lab.querySelector('[data-step="text"]'),
    validate: lab.querySelector('[data-step="validate"]')
  };
  var out = lab.querySelector('[data-out]');
  var statusEl = lab.querySelector('[data-status]');

  chips.hidden = false;
  input.readOnly = false;
  lab.classList.add('is-live');

  function setStep(el, state, msg) {
    el.dataset.state = state;
    el.querySelector('.ps__msg').textContent = msg;
  }

  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function render() {
    var r = run(input.value);
    var t = r.trace;
    if (t.extract) {
      setStep(steps.extract, t.extract.trimmed ? 'pass' : 'skip', t.extract.trimmed
        ? 'Cut characters ' + t.extract.start + ' to ' + t.extract.end + ', from the first [ to the last ].'
        : 'The reply already starts with [ and ends with ].');
    } else {
      setStep(steps.extract, 'skip', 'No [ ... ] pair found, so the whole reply goes to JSON.parse.');
    }
    if (t.path === 'json') {
      setStep(steps.json, 'pass', 'Parsed an array of ' + (r.ok ? t.dropped.length + r.stories.length : 0) + ' item(s).');
      setStep(steps.text, 'off', 'Not needed.');
    } else {
      setStep(steps.json, 'fail', t.jsonError);
      var found = r.ok ? r.stories.length + t.dropped.length : 0;
      setStep(steps.text, found ? 'pass' : 'fail', found
        ? 'Found ' + found + ' block(s) with Situation, Task, Action and Result.'
        : 'No block had all four labels.');
    }
    if (r.ok) {
      var m = 'Kept ' + r.stories.length + '.';
      if (t.dropped.length) m += ' Dropped story ' + t.dropped.join(', ') + ': a field is missing or empty.';
      if (t.converted.length) m += ' Story ' + t.converted.join(', ') + ' had a string action, wrapped into a one-item list.';
      setStep(steps.validate, t.dropped.length ? 'warn' : 'pass', m);
    } else if (t.path) {
      setStep(steps.validate, 'fail', 'Nothing to validate.');
    }
    statusEl.textContent = r.ok ? 'HTTP 200 · success: true · ' + r.stories.length + ' stor' + (r.stories.length === 1 ? 'y' : 'ies') : 'HTTP 500 · success: false';
    statusEl.dataset.ok = r.ok ? 'yes' : 'no';
    if (r.ok) {
      out.innerHTML = r.stories.map(function (s, i) {
        return '<div class="pl__story"><p class="pl__n">Story ' + (i + 1) + '</p>' +
          '<p><b>Situation</b> ' + esc(s.situation) + '</p>' +
          '<p><b>Task</b> ' + esc(s.task) + '</p>' +
          '<p><b>Action</b></p><ul>' + s.action.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('') + '</ul>' +
          '<p><b>Result</b> ' + esc(s.result) + '</p></div>';
      }).join('');
    } else {
      out.innerHTML = '<p class="pl__err">' + esc(r.error) + '</p>';
    }
  }

  function pick(id) {
    buttons.forEach(function (b) { b.setAttribute('aria-checked', b.dataset.pick === id ? 'true' : 'false'); });
    input.value = replies[id];
    render();
    if (takeawayEl) takeawayEl.textContent = takeaways[id] || '';
  }

  buttons.forEach(function (b) { b.addEventListener('click', function () { pick(b.dataset.pick); }); });
  var pending = 0;
  input.addEventListener('input', function () {
    buttons.forEach(function (b) { b.setAttribute('aria-checked', 'false'); });
    if (takeawayEl) takeawayEl.textContent = 'Your own edit: the steps above show the path it took.';
    cancelAnimationFrame(pending);
    pending = requestAnimationFrame(render);
  });
  pick('wrapped');
})();
