/* Explainers for "Adobe's EDS skills, hands-on".
   1. Skill tracker lab: the parsing and tagging rules of skill_tracker.py
      (eds-skill-assess-2026-05 at a4bcb3c), ported line for line.
   2. Content contract lab: decorate() from blocks/teaser/teaser.js at 4a15caf,
      run on authored content built in the browser.
   The static HTML already shows a finished example; this file adds the controls. */
(function () {
  'use strict';

  /* ---------- 1. skill tracker lab ---------- */

  // Same set as BUILTIN_COMMANDS in skill_tracker.py, lines 32 to 38.
  var BUILTIN_COMMANDS = new Set([
    'compact', 'clear', 'help', 'init', 'config', 'memory', 'model',
    'vim', 'status', 'release-notes', 'permissions', 'login', 'logout',
    'cost', 'doctor', 'bug', 'exit', 'quit', 'review', 'ide',
    'agents', 'mcp', 'hooks', 'terminal-setup', 'add-dir', 'resume',
    'pr_comments', 'fast'
  ]);

  // Demo transcript entries, in the shape the hook reads (entry.message.content).
  var LINES = [
    { message: { content: '<command-name>/content-driven-development</command-name>' } },
    { message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'building-blocks' } }] } },
    { message: { content: [{ type: 'tool_use', name: 'Bash', input: { command: 'gh pr create' } }] } },
    { message: { content: '<command-name>/compact</command-name>' } },
    { message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'testing-blocks' } }] } },
    { message: { content: [{ type: 'tool_use', name: 'Skill', input: { skill: 'building-blocks' } }] } }
  ];

  // Python str.strip() and str.lstrip('/').
  function strip(s) { return s.replace(/^\s+|\s+$/g, ''); }
  function lstripSlash(s) { return s.replace(/^\/+/, ''); }

  // extract_invocations(), lines 63 to 105.
  function extractInvocations(entries) {
    var out = [];
    entries.forEach(function (entry) {
      var msg = entry && typeof entry === 'object' ? entry.message : null;
      var content = msg && typeof msg === 'object' ? msg.content : null;
      if (Array.isArray(content)) {
        content.forEach(function (part) {
          if (part && typeof part === 'object' && part.type === 'tool_use' && part.name === 'Skill') {
            var skill = (part.input || {}).skill;
            if (skill) out.push({ skill: strip(skill), source: 'model_tool_call' });
          }
        });
      }
      if (typeof content === 'string') {
        var re = /<command-name>([^<]+)<\/command-name>/g;
        var m;
        while ((m = re.exec(content))) {
          var name = strip(lstripSlash(strip(m[1])));
          if (!name || BUILTIN_COMMANDS.has(name)) continue;
          out.push({ skill: name, source: 'slash_command' });
        }
      }
    });
    return out;
  }

  // json.dumps() with Python's default separators.
  function pyList(arr) { return '[' + arr.map(function (s) { return JSON.stringify(s); }).join(', ') + ']'; }
  function pyDict(obj) { return '{' + Object.keys(obj).map(function (k) { return JSON.stringify(k) + ': ' + obj[k]; }).join(', ') + '}'; }

  // apply_tags(), lines 147 to 163: the tag values the hook writes.
  function buildTags(invocations) {
    var skills = Array.from(new Set(invocations.map(function (i) { return i.skill; }))).sort();
    var sources = Array.from(new Set(invocations.map(function (i) { return i.source; }))).sort();
    var counts = {};
    invocations.forEach(function (i) { counts[i.skill] = (counts[i.skill] || 0) + 1; });
    return {
      skills_used: pyList(skills),
      skills_used_count: String(invocations.length),
      skills_unique_count: String(skills.length),
      skill_invocation_sources: pyList(sources),
      skills_used_breakdown: pyDict(counts)
    };
  }

  // What MLflow's autolog shows for one entry, per the hook's docstring (lines 7 to 13).
  function autologSpans(entry) {
    var c = entry.message.content;
    if (Array.isArray(c)) {
      return c.filter(function (p) { return p.type === 'tool_use'; }).map(function (p) {
        return { span: 'tool_' + p.name, note: p.name === 'Skill' ? 'name only inside the input' : '' };
      });
    }
    var m = /<command-name>([^<]+)<\/command-name>/.exec(c);
    return m ? [{ span: 'no span', note: strip(m[1]), none: true }] : [];
  }

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  document.querySelectorAll('[data-skilllab]').forEach(function (lab) {
    var boxes = Array.prototype.slice.call(lab.querySelectorAll('[data-line]'));
    var spansEl = lab.querySelector('[data-spans]');
    var tagsEl = lab.querySelector('[data-tags]');
    var noteEl = lab.querySelector('[data-note]');

    function render() {
      var picked = boxes.filter(function (b) { return b.checked; }).map(function (b) { return LINES[Number(b.dataset.line)]; });
      var spans = [];
      picked.forEach(function (e) { spans = spans.concat(autologSpans(e)); });
      spansEl.innerHTML = spans.length
        ? spans.map(function (s) { return '<li' + (s.none ? ' class="is-none"' : '') + '><code>' + esc(s.span) + '</code>' + (s.note ? '<span>' + esc(s.note) + '</span>' : '') + '</li>'; }).join('')
        : '<li class="is-none"><code>no spans</code></li>';

      var inv = extractInvocations(picked);
      if (!inv.length) {
        // main(), lines 189 to 192: nothing found, so no tags are written.
        tagsEl.textContent = 'no tags written\n(session has no skill invocations)';
      } else {
        var tags = buildTags(inv);
        tagsEl.innerHTML = Object.keys(tags).map(function (k) { return '<span class="k">' + k + '</span>\n  ' + esc(tags[k]); }).join('\n');
      }
      var dropped = picked.filter(function (e) {
        return typeof e.message.content === 'string' && /<command-name>\/?(compact)<\/command-name>/.test(e.message.content);
      }).length;
      var bash = picked.some(function (e) { return Array.isArray(e.message.content) && e.message.content[0].name === 'Bash'; });
      var notes = [];
      if (dropped) notes.push('Built-in commands like <code>/compact</code> are dropped.');
      if (bash) notes.push('The Bash call is a tool, not a skill.');
      if (!notes.length) notes.push('Every picked line is a skill call.');
      noteEl.innerHTML = notes.join(' ');
    }
    boxes.forEach(function (b) { b.addEventListener('change', render); });
    render();
  });

  /* ---------- 2. content contract lab ---------- */

  // blocks/teaser/teaser.js at 4a15caf, lines 3 to 30, unchanged.
  var VARIANTS = ['banner', 'cards-2', 'cards-3', 'cards-4'];

  function isCtaParagraph(p) {
    var links = p.querySelectorAll('a');
    if (!links.length) return false;
    return Array.prototype.slice.call(p.childNodes).every(function (node) {
      if (node.nodeType === Node.TEXT_NODE) return node.textContent.trim() === '';
      return ['A', 'EM', 'STRONG', 'BR'].indexOf(node.tagName) !== -1;
    });
  }

  function markEyebrow(textCell) {
    var first = textCell.firstElementChild;
    if (!first || first.tagName !== 'P') return;
    var em = first.querySelector('em');
    if (!em || first.children.length !== 1) return;
    first.classList.add('teaser-eyebrow');
    first.textContent = em.textContent;
  }

  function markCtas(textCell) {
    var cta = Array.prototype.slice.call(textCell.querySelectorAll('p')).reverse().find(isCtaParagraph);
    if (!cta) return;
    cta.classList.add('teaser-ctas');
    cta.querySelectorAll('a').forEach(function (a, i) {
      a.classList.add('button', i === 0 ? 'primary' : 'secondary');
    });
  }

  // decorate(), lines 32 to 69. The picture optimization at lines 61 to 66 is
  // left out because the demo has no real images.
  function decorate(block) {
    var rows = Array.prototype.slice.call(block.children);
    var variant = VARIANTS.find(function (v) { return block.classList.contains(v); });
    if (!variant) {
      variant = rows.length === 1 ? 'banner' : 'cards-3';
      block.classList.add(variant);
    }
    var ul = document.createElement('ul');
    rows.forEach(function (row) {
      var li = document.createElement('li');
      li.className = 'teaser-item';
      Array.prototype.slice.call(row.children).forEach(function (cell) {
        var wrap = document.createElement('div');
        if (cell.querySelector('picture')) {
          wrap.className = 'teaser-visual';
        } else {
          wrap.className = 'teaser-text';
          markEyebrow(cell);
          markCtas(cell);
        }
        wrap.append.apply(wrap, Array.prototype.slice.call(cell.childNodes));
        li.append(wrap);
      });
      ul.append(li);
    });
    block.replaceChildren(ul);
    return variant;
  }

  // Entries from the /teasers test page the skill authored in DA.
  var ENTRIES = [
    { eyebrow: 'Scale', heading: 'Content at scale', body: 'Publish more in less time with smaller teams.', links: ['Learn how', 'Read the docs'] },
    { eyebrow: 'Predictability', heading: 'Previews at 100% fidelity', body: 'What authors see is what visitors get.', links: ['Try a preview', 'How it works'] },
    { eyebrow: 'Team', heading: 'Author-friendly by default', body: 'Anyone who can edit a document can publish a page.', links: ['See the workflow', 'Meet the team'] },
    { eyebrow: 'MLflow + EDS', heading: 'Auto-trace every block you build', body: 'This very page was created while MLflow recorded each tool call.', links: ['View traces', 'Explore the repo'] }
  ];

  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) { n.setAttribute(k, attrs[k]); });
    (kids || []).forEach(function (k) { n.append(k); });
    return n;
  }

  // The block as EDS delivers it before decoration: a div per row, a div per cell.
  function authoredBlock(state) {
    var block = el('div', { class: 'teaser' + (state.variant ? ' ' + state.variant : '') });
    for (var i = 0; i < state.rows; i += 1) {
      var e = ENTRIES[i];
      var text = el('div');
      text.append(state.eyebrow ? el('p', null, [el('em', null, [e.eyebrow])]) : el('p', null, [e.eyebrow]));
      text.append(el('h3', null, [e.heading]));
      text.append(el('p', null, [e.body]));
      if (state.ctas > 0) {
        var p = el('p');
        if (state.extra) p.append('Or ');
        e.links.slice(0, state.ctas).forEach(function (t, j) {
          if (j) p.append(' ');
          p.append(el('a', { href: '#' }, [t]));
        });
        text.append(p);
      }
      block.append(el('div', null, [el('div', null, [el('picture')]), text]));
    }
    return block;
  }

  function docTable(state) {
    var name = 'Teaser' + (state.variant ? ' (' + state.variant + ')' : '');
    var rows = '';
    for (var i = 0; i < state.rows; i += 1) {
      var e = ENTRIES[i];
      var links = state.ctas ? '<p>' + (state.extra ? 'Or ' : '') + e.links.slice(0, state.ctas).map(function (t) { return '<u>' + esc(t) + '</u>'; }).join(' ') + '</p>' : '';
      rows += '<tr><td class="ccl__img">image</td><td>' + (state.eyebrow ? '<p><em>' + esc(e.eyebrow) + '</em></p>' : '<p>' + esc(e.eyebrow) + '</p>') +
        '<p class="h">' + esc(e.heading) + '</p><p>' + esc(e.body) + '</p>' + links + '</td></tr>';
    }
    return '<table class="ccl__table"><thead><tr><th colspan="2">' + esc(name) + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
  }

  var HOT = ['teaser-eyebrow', 'teaser-ctas', 'button', 'primary', 'secondary', 'teaser-item', 'teaser-visual', 'teaser-text', 'banner', 'cards-2', 'cards-3', 'cards-4'];
  function tree(node, depth, out) {
    var pad = '  '.repeat(depth);
    var tag = node.tagName.toLowerCase();
    var cls = node.className ? ' class="' + node.className.split(' ').map(function (c) {
      return HOT.indexOf(c) !== -1 ? '<span class="hot">' + esc(c) + '</span>' : esc(c);
    }).join(' ') + '"' : '';
    var t = node.textContent.trim();
    var short = esc(t.length > 26 ? t.slice(0, 25) + '…' : t);
    var line = pad + '&lt;' + tag + cls + '&gt;';
    if (tag === 'picture') { out.push(line); return; }
    if (['p', 'h3', 'a', 'em'].indexOf(tag) !== -1 && !node.children.length) { out.push(line + ' ' + short); return; }
    out.push(tag === 'p' && !node.classList.contains('teaser-ctas') ? line + ' ' + short : line);
    Array.prototype.slice.call(node.children).forEach(function (c, i) {
      if (tag === 'ul' && i > 0) {
        if (i === 1) out.push(pad + '  <span class="dim">&lt;li class="teaser-item"&gt; …' + (node.children.length - 1) + ' more</span>');
        return;
      }
      tree(c, depth + 1, out);
    });
  }

  document.querySelectorAll('[data-contract]').forEach(function (lab) {
    var state = { variant: 'cards-3', rows: 3, ctas: 1, eyebrow: true, extra: false };
    var docEl = lab.querySelector('[data-doc]');
    var whyEl = lab.querySelector('[data-why]');
    var treeEl = lab.querySelector('[data-tree]');
    var prevEl = lab.querySelector('[data-preview]');
    lab.querySelector('.ccl__controls').hidden = false;
    lab.querySelector('[data-prevwrap]').hidden = false;

    function render() {
      docEl.innerHTML = docTable(state);
      var block = authoredBlock(state);
      var variant = decorate(block);
      var lines = [];
      tree(block, 0, lines);
      treeEl.innerHTML = lines.join('\n');
      prevEl.replaceChildren(block.cloneNode(true));
      prevEl.querySelectorAll('a').forEach(function (a) { a.setAttribute('tabindex', '-1'); });

      var why = [];
      if (state.variant) why.push('The variant comes from the block name: <code>' + variant + '</code>.');
      else why.push('No variant in the block name, so decorate() picks one: ' + state.rows + (state.rows === 1 ? ' row means' : ' rows mean') + ' <code>' + variant + '</code>.');
      why.push(state.eyebrow ? 'A first paragraph holding only italics becomes the eyebrow.' : 'Without italics, the first paragraph stays a plain paragraph, so there is no eyebrow.');
      if (!state.ctas) why.push('No links, so no buttons.');
      else if (state.extra) why.push('The extra words make the link paragraph fail <code>isCtaParagraph()</code>, so the links stay plain links.');
      else why.push(state.ctas === 1 ? 'The last paragraph of links becomes a primary button.' : 'The last paragraph of links becomes a primary and a secondary button.');
      whyEl.innerHTML = why.join(' ');
    }

    lab.querySelectorAll('[data-group]').forEach(function (group) {
      var key = group.dataset.group;
      var buttons = Array.prototype.slice.call(group.querySelectorAll('[role="radio"]'));
      function sync() {
        buttons.forEach(function (b) {
          var on = String(state[key]) === b.dataset.v;
          b.setAttribute('aria-checked', String(on));
          b.tabIndex = on ? 0 : -1;
        });
      }
      buttons.forEach(function (b, i) {
        b.addEventListener('click', function () {
          state[key] = key === 'variant' ? b.dataset.v : Number(b.dataset.v);
          sync(); render();
        });
        b.addEventListener('keydown', function (e) {
          var d = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? 1 : e.key === 'ArrowLeft' || e.key === 'ArrowUp' ? -1 : 0;
          if (!d) return;
          e.preventDefault();
          var n = buttons[(i + d + buttons.length) % buttons.length];
          n.click(); n.focus();
        });
      });
      sync();
    });
    lab.querySelectorAll('[data-tog]').forEach(function (t) {
      t.addEventListener('click', function () {
        var key = t.dataset.tog;
        state[key] = !state[key];
        t.setAttribute('aria-checked', String(state[key]));
        render();
      });
    });
    render();
  });
})();
