// AGENTS.md lines are prose, so the shared line-by-line highlighter colors
// them wrong. Show them as plain text.
document.querySelectorAll('.code--prose .ln').forEach(function (l) { l.textContent = l.textContent; });

/* Branch lab for Part 2.
   Decides which GitHub Actions workflow a push runs, using the two workflows in
   jackzhaojin/shadow-pivot-ai-agentv2 at 75de1c3:
   - main_shadow-pivot-ai-agentv2.yml: on push to "main"
   - release.yml: on push to "release/*", then the version check from its
     "Validate version format" step.
   Branch filters follow GitHub's cheat sheet: * matches zero or more
   characters but not "/", and ** matches anything. */
(function () {
  'use strict';
  var lab = document.querySelector('[data-br]');
  if (!lab) return;

  var IMAGE = 'ghcr.io/jackzhaojin/shadow-pivot-ai-agentv2';

  function globToRegExp(pattern) {
    var re = '';
    for (var i = 0; i < pattern.length; i++) {
      var c = pattern[i];
      if (c === '*' && pattern[i + 1] === '*') { re += '.*'; i++; }
      else if (c === '*') re += '[^/]*';
      else re += c.replace(/[.+?^${}()|[\]\\]/g, '\\$&');
    }
    return new RegExp('^' + re + '$');
  }
  var matches = function (pattern, branch) { return globToRegExp(pattern).test(branch); };

  function run(branch) {
    var result = { main: null, release: null };
    if (matches('main', branch)) {
      result.main = [
        ['ok', 'Build the Docker image and push <code>' + IMAGE + ':latest</code>'],
        ['ok', 'Log in to Azure with OpenID Connect (<code>azure/login@v2</code>), no secret stored'],
        ['ok', '<code>az webapp restart --name shadow-pivot-ai-agentv2 --resource-group ShadowPivot</code>']
      ];
    }
    if (matches('release/*', branch)) {
      // VERSION=$(echo ${GITHUB_REF#refs/heads/release/})
      var version = branch.replace(/^release\//, '');
      var valid = /^[0-9]+\.[0-9]+(\.[0-9]+)?$/.test(version);
      result.release = [['ok', 'Extract the version from the branch name: <code>' + esc(version) + '</code>']];
      if (!valid) {
        result.release.push(['fail', 'Validate version format<span class="br__log">Invalid version format: ' + esc(version) + '<br>Expected format: #.# or #.#.# (e.g., 3.4 or 3.4.1)</span>']);
        result.release.push(['skip', 'Build and push the release images']);
        result.release.push(['skip', 'Create the GitHub release']);
        result.releaseFailed = true;
      } else {
        result.release.push(['ok', 'Validate version format']);
        result.release.push(['ok', 'Build and push <code>' + IMAGE + ':' + esc(version) + '</code> and <code>:release-latest</code>']);
        result.release.push(['ok', 'Create GitHub release <code>v' + esc(version) + '</code>. No Azure services are restarted.']);
      }
    }
    return result;
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;'); }

  var current = 'release/1.0.0';
  var chips = Array.prototype.slice.call(lab.querySelectorAll('[data-branch]'));
  var lanes = { main: lab.querySelector('[data-lane="main"]'), release: lab.querySelector('[data-lane="release"]') };
  var land = lab.querySelector('[data-land]');

  function paint(lane, steps, failed, idleText) {
    var ol = lane.querySelector('.br__steps');
    var trig = lane.querySelector('.br__trigger[data-js]');
    if (!steps) {
      lane.setAttribute('data-state', 'idle');
      trig.textContent = idleText;
      ol.innerHTML = '';
      return;
    }
    lane.setAttribute('data-state', failed ? 'failed' : 'ran');
    trig.textContent = failed ? 'Runs, and stops at the version check.' : 'Runs on this push.';
    ol.innerHTML = steps.map(function (s) { return '<li data-s="' + s[0] + '"><span>' + s[1] + '</span></li>'; }).join('');
  }

  function render() {
    var branch = current;
    chips.forEach(function (c) { c.setAttribute('aria-checked', String(c.getAttribute('data-branch') === branch)); });
    if (!branch) { land.innerHTML = '<p>Type a branch name.</p>'; paint(lanes.main, null, false, 'Waiting for a branch.'); paint(lanes.release, null, false, 'Waiting for a branch.'); return; }
    var r = run(branch);
    paint(lanes.main, r.main, false, 'Does not run: the filter is exactly "main".');
    paint(lanes.release, r.release, r.releaseFailed, branch.indexOf('release/') === 0
      ? 'Does not run: in "release/*" the * does not match "/", so only one level under release/ counts.'
      : 'Does not run: the branch does not match "release/*".');
    var where;
    if (r.main) where = '<b>Lands on the Azure Web App.</b> The restart makes it pull the new <code>:latest</code> image, a couple of minutes after the push.';
    else if (r.release && !r.releaseFailed) where = '<b>Lands in the registry and on GitHub Releases.</b> Nothing restarts. The EC2 copy picks it up when I run <code>./deploy-with-azure.sh</code>, which pulls <code>:release-latest</code>.';
    else if (r.release) where = '<b>Lands nowhere.</b> The run fails, so no image and no release.';
    else where = '<b>Lands nowhere.</b> No workflow runs on this push. Both workflows can still be started by hand from the Actions tab.';
    land.innerHTML = '<p>' + where + '</p>';
  }

  chips.forEach(function (c) {
    c.addEventListener('click', function () { current = c.getAttribute('data-branch'); render(); });
  });
  lab.querySelectorAll('[data-js]').forEach(function (el) { el.hidden = false; });
  lab.querySelectorAll('[data-nojs]').forEach(function (el) { el.hidden = true; });
  render();
})();
