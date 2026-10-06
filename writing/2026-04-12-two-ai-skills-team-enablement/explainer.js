/* Harvest sorter for "Two AI Skills ...".
   The AI Knowledge Harvester is a skill: instructions an AI model follows, not code.
   This sorter applies the same written rules literally, from ai-builder-kit at 93cfafd:
   SKILL.md (document types, two-tier taxonomy, filename pattern) and
   references/repo-scan.md (exclusions, sub-project detection, CLAUDE.md duplicates).
   A model reads the content too, so on real files it can classify better than this. */
(() => {
  const root = document.querySelector('[data-sorter]');
  if (!root) return;

  const SAMPLES = {
    log: { repo: 'jack-dev-server-configs', path: 'local/generic-harness-v1/ai-docs/init/prompt-log.md', text: '# Prompt Log\n### Prompt 1: Kickoff (10:00 AM)\n> Read the kickoff guide first, then ask me four questions.\n→ Response: Read the guide and asked four questions.\n→ Action: Read 6 files.' },
    spec: { repo: 'jack-dev-server-configs', path: 'local/generic-harness-v1/ai-docs/init/CONSOLIDATED_SPEC.md', text: '# Consolidated Specification\nRequirements and architecture decisions for the generic harness.' },
    claude: { repo: 'jack-dev-server-configs', path: 'local/generic-harness-v1/CLAUDE.md', text: '# CLAUDE.md\nGuidance for agents working in this harness.' },
    kickoff: { repo: 'ciam-demo', path: 'ai-docs/kickoff-guide.md', text: '# CIAM Claims PoC, Kickoff Guide\nThe "Start Here" document for AI agents and humans.' },
    readme: { repo: 'ciam-demo', path: 'README.md', text: '# CIAM Demo\nPublic documentation for the project.' },
    docs: { repo: 'ciam-demo', path: 'docs/architecture.md', text: '# Architecture\nHow the services fit together.' },
  };

  const $ = (s) => root.querySelector(s);
  const src = $('[data-src]');
  const DATE = '2026-04-12';
  let current = null;
  const result = $('[data-result]');
  const why = $('[data-why]');
  const front = $('[data-front]');
  const chips = [...root.querySelectorAll('[data-sample]')];

  const esc = (v) => String(v).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const slugify = (s) => s.toLowerCase().replace(/\.md$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'untitled';

  function exclusion(path) {
    const file = path.split('/').pop();
    if (/(^|\/)(node_modules|\.git|dist|build|output)\//.test(path)) return 'build output and dependencies are never harvested';
    if (/(^|\/)docs\//.test(path)) return 'docs/ folders are integral project documentation, even if AI wrote them';
    if (/(^|\/)src\/prompts\//.test(path)) return 'harness prompts in src/prompts/ are executable, so they stay with the code';
    if (/^readme\.md$/i.test(file)) return 'README.md files are public documentation, not AI docs';
    if (/^\.env/.test(file) || /lock/i.test(file)) return '.env files, lock files and generated files are never harvested';
    if (!/\.md$/i.test(file)) return 'the harvester collects markdown documents';
    return null;
  }

  function subProject(repo, path) {
    let m = path.match(/^local\/([^/]+)\//) || path.match(/^server\/([^/]+)\//) || path.match(/^packages\/([^/]+)\//);
    if (m) return [m[1], `the path starts with ${path.split('/')[0]}/${m[1]}/, so this is a monorepo sub-project`];
    m = path.match(/^([^/]+)\/(CLAUDE|AGENTS)\.md$/);
    if (m) return [m[1], `${m[1]}/ has its own ${m[2]}.md, so it is a sub-project`];
    return [repo, 'a root-level file in a simple repo repeats the repo name as the second tier'];
  }

  function classify(path, text) {
    const file = path.split('/').pop();
    if (/^(CLAUDE|AGENTS)\.md$/.test(file)) return ['working-doc', `${file} counts as a working doc`];
    if (/prompt-log/i.test(file) || /→ Response|→ Action/.test(text)) return ['prompt-log', 'it reads like a session log, prompts followed by → Response and → Action lines'];
    if (/(^|\/)prompts\//.test(path)) return ['harness-prompt', 'it is a prompt template in a prompts/ folder'];
    if (/spec|prd/i.test(file) || /\b(specification|requirements|architecture|decisions)\b/i.test(text)) return ['spec', 'it has spec signals: specification, requirements, architecture or decisions'];
    if (/kickoff|gap/i.test(file)) return ['working-doc', 'kickoff prompts and gap analyses are working docs'];
    return ['working-doc', 'nothing stronger matched, and working-doc is the default when uncertain'];
  }

  function render() {
    const { repo, path, text } = SAMPLES[current];
    const date = DATE;
    chips.forEach((c) => c.setAttribute('aria-checked', String(c.dataset.sample === current)));
    src.innerHTML = `<span class="hv__seg">${esc(repo)}</span> <span class="hv__sl">:</span> ${esc(path)}`;
    const ex = exclusion(path);
    if (ex) {
      result.innerHTML = '<span class="hv__skip">Not harvested. It stays only in the source repo.</span>';
      why.innerHTML = `<li>Skipped: ${ex}.</li>`;
      front.textContent = '';
      return;
    }
    const [sub, subWhy] = subProject(repo, path);
    const [type, typeWhy] = classify(path, text);
    const file = path.split('/').pop();
    const dup = /^(CLAUDE|AGENTS)\.md$/.test(file);
    const dest = `ai-knowledge/projects/${repo}/${sub}/${type}s/${date}-01-${slugify(file)}.md`;
    result.innerHTML = dest.split('/').map((p, i, a) => `<span class="hv__seg${i === a.length - 1 ? ' hv__seg--file' : ''}">${esc(p)}</span>`).join('<span class="hv__sl">/</span>');
    why.innerHTML = [
      `<li>Tier 1 is the GitHub repo name: <code>${esc(repo)}</code>.</li>`,
      `<li>Tier 2 is <code>${esc(sub)}</code>: ${esc(subWhy)}.</li>`,
      `<li>Type is <code>${type}</code>: ${esc(typeWhy)}.</li>`,
      `<li>The name is the date, a sequence number and a slug, so the folder sorts in time order.</li>`,
      dup ? '<li>It is copied as a duplicate. Claude Code reads it at session start, so the original never moves.</li>' : '<li>It is a copy. The source file stays where it is.</li>',
    ].join('');
    const h1 = (text.match(/^# (.+)$/m) || [])[1];
    const title = (h1 || file.replace(/\.md$/, '')).replace(/"/g, "'");
    front.textContent = ['---', `title: "${title}"`, `project: ${repo}`, `sub_project: ${sub}`, `type: ${type}`, `date: ${date}`, 'tags: []', 'why_private: "one phrase, written by the model"', 'status: stable', `source_repo: https://github.com/jackzhaojin/${repo}`, 'source_tool: claude-code', dup ? 'duplicate: true' : null, '---'].filter(Boolean).join('\n');
  }

  chips.forEach((c) => c.addEventListener('click', () => {
    current = c.dataset.sample;
    render();
  }));
  root.querySelectorAll('[hidden][data-live]').forEach((el) => { el.hidden = false; });
  root.classList.add('is-live');
  chips[0].click();
})();
