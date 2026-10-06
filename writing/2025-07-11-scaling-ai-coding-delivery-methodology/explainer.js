// AGENTS.md lines are prose, so the shared line-by-line highlighter colors
// them wrong. Show them as plain text.
document.querySelectorAll('.code--prose .ln').forEach(function (l) { l.textContent = l.textContent; });

/* Task lab for Part 3.
   Applies the Task Assignment Protocol in AGENTS.md (lines 37-41 at 75de1c3 of
   jackzhaojin/shadow-pivot-ai-agentv2) to a request, then shows the commits the
   repo really has for that task ID. Task titles come from release-1.0.mdc and
   release-1.1.mdc; commits from git log at 75de1c3. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-tl]');
  if (!lab) return;

  var GH = 'https://github.com/jackzhaojin/shadow-pivot-ai-agentv2/commit/';
  var TASKS = {
    '3.2.3': { title: 'Step 2: Design Evaluation (LLM)', file: 'release-1.0.mdc', release: '1.0',
      commits: [['a4918e9', 'Jun 13', '3.2.3 add design evaluation step'], ['17e0b11', 'Jun 13', '3.2.3 log baseline testing'], ['ed5a048', 'Jun 13', '3.2.3 add detailed error logging']] },
    '3.2.4': { title: 'Step 3: Spec Selection UI and Logic', file: 'release-1.0.mdc', release: '1.0',
      commits: [['66d145c', 'Jun 13', '3.2.4 spec selection ui']] },
    '3.3.1': { title: 'Agent Flow Component Refactoring (Architecture)', file: 'release-1.0.mdc', release: '1.0', commits: [] },
    '3.5': { title: 'Step 4: Parallel Figma Spec Generation Infrastructure', file: 'release-1.0.mdc', release: '1.0',
      commits: [['fecc985', 'Jun 15', '3.5 refactor design evaluation to use prompt template'], ['97e1a6f', 'Jun 15', '3.5 fix evaluation parsing'], ['17f1584', 'Jun 16', '3.5 fix step progression'], ['8c0334c', 'Jun 16', '3.5 doc update']] },
    '1.1.1.1': { title: 'Cypress UI Testing Infrastructure', file: 'release-1.1.mdc', release: '1.1',
      commits: [['fc91aba', 'Jun 21', '1.1.1.1: feat(cypress): implement comprehensive modular testing plan for AI agent flow']] }
  };
  // What each chip asks the agent to do.
  var REQUESTS = {
    one: ['3.2.3'],
    chain: ['3.2.4', '3.3.1'],
    parallel: ['3.5'],
    next: ['1.1.1.1']
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function decide(ids, releaseDone) {
    var rules = { size: 'pass', only: 'pass', mdc: 'pass', release: 'pass' };
    var notes = [];
    var assigned = ids[0];
    var task = TASKS[assigned];
    if (ids.length > 1) {
      rules.only = 'fail';
      notes.push('Narrowed to ' + assigned + '. ' + ids.slice(1).join(', ') + ' waits for its own assignment.');
    }
    if (task.release !== '1.0' && !releaseDone) {
      rules.release = 'fail';
      rules.mdc = 'skip';
      return { go: false, task: task, id: assigned, rules: rules, notes: ['On hold. ' + assigned + ' is a release ' + task.release + ' task, and release 1.0 is not complete.'] };
    }
    return { go: true, task: task, id: assigned, rules: rules, notes: notes };
  }

  var chips = Array.prototype.slice.call(lab.querySelectorAll('[data-req]'));
  var rules = Array.prototype.slice.call(lab.querySelectorAll('[data-rule]'));
  var out = lab.querySelector('[data-out]');
  var current = 'chain';

  function render() {
    chips.forEach(function (c) { c.setAttribute('aria-checked', String(c.getAttribute('data-req') === current)); });
    var r = decide(REQUESTS[current], false);
    rules.forEach(function (li) { li.setAttribute('data-s', r.rules[li.getAttribute('data-rule')]); });
    var html = '';
    if (r.go) {
      html += '<p><b>Assigned: ' + esc(r.id) + ', ' + esc(r.task.title) + '.</b> ' + esc(r.notes.join(' ')) + '</p>';
      html += '<p class="log">Read in order: prd-1.0.md, release-1.0.mdc, AGENTS.md. The task lives in ' + esc(r.task.file) + '.<br>When done: tick it off in ' + esc(r.task.file) + ', start the commit and the pull request with ' + esc(r.id) + '</p>';
      if (r.task.commits.length) {
        html += '<p class="log">What the repo shows for ' + esc(r.id) + ':</p><ul class="tl__commits">' + r.task.commits.map(function (c) {
          return '<li><a href="' + GH + c[0] + '">' + c[0] + '</a> ' + c[1] + ' · ' + esc(c[2]) + '</li>';
        }).join('') + '</ul>';
      }
    } else {
      html += '<p><b>' + esc(r.notes[0]) + '</b></p><p class="log">Nothing is built yet. It waited for the v1.0.0 tag on June 17, and the repo shows it done on June 21:</p><ul class="tl__commits">' + r.task.commits.map(function (c) {
        return '<li><a href="' + GH + c[0] + '">' + c[0] + '</a> ' + c[1] + ' · ' + esc(c[2]) + '</li>';
      }).join('') + '</ul>';
    }
    out.innerHTML = html;
  }

  chips.forEach(function (c) { c.addEventListener('click', function () { current = c.getAttribute('data-req'); render(); }); });
  lab.querySelectorAll('[data-js]').forEach(function (el) { el.hidden = false; });
  lab.querySelectorAll('[data-nojs]').forEach(function (el) { el.hidden = true; });
  render();
})();
