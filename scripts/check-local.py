#!/usr/bin/env python3
"""Dependency-free checks for the v3 site's HTML and discovery contract.

Run from any directory: python3 scripts/check-local.py
Optional local HTTP smoke check: python3 scripts/check-local.py --url http://127.0.0.1:8080
Browser checks are still required for layout, themes, and interaction.
"""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urljoin, urlparse, unquote
from urllib.request import urlopen
from collections import Counter
import argparse
import json
import re
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
ORIGIN = 'https://www.jackzhaojin.com'
ROUTES = {'/': 'index.html', '/writing/': 'writing/index.html', '/writing/2026-10-10-adaptto-2026-25-talks/': 'writing/2026-10-10-adaptto-2026-25-talks/index.html', '/writing/2026-09-20-aem-edge-functions-google-sign-in/': 'writing/2026-09-20-aem-edge-functions-google-sign-in/index.html', '/writing/2026-08-15-anima-mesh-company-of-zero/': 'writing/2026-08-15-anima-mesh-company-of-zero/index.html', '/writing/2026-08-09-adobe-stardust-explained/': 'writing/2026-08-09-adobe-stardust-explained/index.html', '/writing/2026-07-21-four-frontier-models-one-prompt/': 'writing/2026-07-21-four-frontier-models-one-prompt/index.html', '/writing/2026-06-28-patterns-of-work/': 'writing/2026-06-28-patterns-of-work/index.html', '/writing/2026-05-31-continuous-agent-second-brain/': 'writing/2026-05-31-continuous-agent-second-brain/index.html', '/writing/2026-05-24-theming-eds-with-google-stitch/': 'writing/2026-05-24-theming-eds-with-google-stitch/index.html', '/writing/2026-05-17-adobe-eds-skills-hands-on/': 'writing/2026-05-17-adobe-eds-skills-hands-on/index.html', '/writing/2026-04-12-two-ai-skills-team-enablement/': 'writing/2026-04-12-two-ai-skills-team-enablement/index.html', '/writing/2026-04-05-continuous-executive-agent-v2-1/': 'writing/2026-04-05-continuous-executive-agent-v2-1/index.html', '/writing/2026-03-23-eds-hlx-admin-agentic-config/': 'writing/2026-03-23-eds-hlx-admin-agentic-config/index.html', '/writing/2026-02-05-reusable-ai-development-modules/': 'writing/2026-02-05-reusable-ai-development-modules/index.html', '/writing/2026-01-29-playwright-stakeholder-demos/': 'writing/2026-01-29-playwright-stakeholder-demos/index.html', '/writing/2026-01-05-from-prompts-to-harness/': 'writing/2026-01-05-from-prompts-to-harness/index.html', '/writing/2025-10-12-da-live-mcp-across-ai-platforms/': 'writing/2025-10-12-da-live-mcp-across-ai-platforms/index.html', '/writing/2025-10-05-mcp-server-for-eds-da-live/': 'writing/2025-10-05-mcp-server-for-eds-da-live/index.html', '/writing/2025-09-01-aem-caching-production-architectures/': 'writing/2025-09-01-aem-caching-production-architectures/index.html', '/writing/2025-07-13-three-eds-offerings/': 'writing/2025-07-13-three-eds-offerings/index.html', '/writing/2025-07-12-aem-headless-omnichannel-architecture/': 'writing/2025-07-12-aem-headless-omnichannel-architecture/index.html', '/writing/2025-07-11-scaling-ai-coding-delivery-methodology/': 'writing/2025-07-11-scaling-ai-coding-delivery-methodology/index.html', '/writing/2025-07-07-ai-coded-nextjs-agent-cicd-infrastructure/': 'writing/2025-07-07-ai-coded-nextjs-agent-cicd-infrastructure/index.html', '/writing/2025-07-06-ai-coded-nextjs-agent-release-1/': 'writing/2025-07-06-ai-coded-nextjs-agent-release-1/index.html', '/writing/2025-06-12-azure-rbac-cicd-for-ai-agents/': 'writing/2025-06-12-azure-rbac-cicd-for-ai-agents/index.html', '/writing/2025-06-08-edge-cms-shift-adobe-eds/': 'writing/2025-06-08-edge-cms-shift-adobe-eds/index.html', '/writing/2025-06-04-seven-aem-capabilities-tradeoffs/': 'writing/2025-06-04-seven-aem-capabilities-tradeoffs/index.html', '/writing/2025-05-28-aem-headless-when-frontend-teams-lead/': 'writing/2025-05-28-aem-headless-when-frontend-teams-lead/index.html', '/writing/2025-04-13-vibe-coding-star-story-generator/': 'writing/2025-04-13-vibe-coding-star-story-generator/index.html', '/portfolio/': 'portfolio/index.html', '/talks/': 'talks/index.html', '/certifications/': 'certifications/index.html', '/blogs.html': 'blogs.html', '/certifications.html': 'certifications.html', '/404.html': '404.html'}
ALIASES = {'/blogs.html': '/writing/', '/certifications.html': '/certifications/'}
# Separately deployed GitHub project sites, linked by the existing portfolio.
PROJECT_SITES = {'/bruce-lava-dash/', '/bruce-play-ten/', '/bruce-hackathon-2026-09-12/', '/ai-sandbox/'}
ERRORS = []


class Page(HTMLParser):
    def __init__(self, source):
        super().__init__(convert_charrefs=True)
        self.tags = []
        self.schemas = []
        self.script_type = None
        self.script_text = ''
        self.feed(source)

    def handle_starttag(self, tag, attrs):
        self.tags.append((tag, dict(attrs)))
        if tag == 'script':
            self.script_type = dict(attrs).get('type')
            self.script_text = ''

    def handle_data(self, data):
        if self.script_type == 'application/ld+json':
            self.script_text += data

    def handle_endtag(self, tag):
        if tag == 'script':
            if self.script_type == 'application/ld+json':
                self.schemas.append(json.loads(self.script_text))
            self.script_type = None


def check(condition, message):
    if not condition:
        ERRORS.append(message)


def local_file(url):
    p = ROOT / unquote(urlparse(url).path).lstrip('/')
    return p / 'index.html' if p.is_dir() else p


def main():
    args = argparse.ArgumentParser()
    args.add_argument('--url')
    opts = args.parse_args()
    parsed = {}
    texts = {}
    for route, name in ROUTES.items():
        source = (ROOT / name).read_text()
        texts[route] = source
        p = parsed[route] = Page(source)
        tags = p.tags
        ids = [a['id'] for _, a in tags if 'id' in a]
        check(not [key for key, n in Counter(ids).items() if n > 1], route + ': duplicate IDs')
        check(sum(t == 'h1' for t, _ in tags) == 1, route + ': exactly one H1')
        check(sum(t == 'main' for t, _ in tags) == 1, route + ': exactly one main')
        check('Book a talk' not in source and 'Follow the work' not in source, route + ': retired CTA')
        check('font-awesome' not in source and 'css/styles.css' not in source, route + ': legacy styles')
        for asset in ['tokens.css', 'base.css', 'components.css']:
            check('/design-systems/v3/' + asset in source, route + ': missing v3 ' + asset)
        check(source.count('gtag/js?id=G-ZVENE6BXTJ') == 1, route + ': analytics tag count')
        viewport = next(i for i, (t, a) in enumerate(tags) if t == 'meta' and a.get('name') == 'viewport')
        check(tags[viewport + 1][0] == 'script' and 'gtag/js' in tags[viewport + 1][1].get('src', ''), route + ': analytics placement')
        canonicals = [a['href'] for t, a in tags if t == 'link' and a.get('rel') == 'canonical']
        check(canonicals == [ORIGIN + ALIASES.get(route, route)], route + ': canonical')
        for prop in ['description', 'og:title', 'og:description', 'og:url', 'og:image', 'twitter:card']:
            check(any(t == 'meta' and (a.get('name') == prop or a.get('property') == prop) and a.get('content') for t, a in tags), route + ': missing metadata ' + prop)
        check(len(p.schemas) == 1 and p.schemas[0].get('@context') == 'https://schema.org', route + ': JSON-LD')
        graph = p.schemas[0]['@graph']
        check(any(x.get('@id') == ORIGIN + '/#person' and x.get('name') == 'Jack Jin' for x in graph), route + ': Person identity')
        expected_noindex = route == '/404.html'
        check(any(a.get('name') == 'robots' and 'noindex' in a.get('content', '') for t, a in tags) == expected_noindex, route + ': indexing policy')
        for tag, a in tags:
            if tag == 'img':
                check('alt' in a, route + ': image lacks alt')
            if tag == 'a' and 'linkedin.com/' in a.get('href', ''):
                check('/in/jackjin' in a['href'], route + ': LinkedIn content destination')
            for attr in ['href', 'src', 'poster']:
                if attr not in a or a[attr].startswith(('data:', 'mailto:', 'tel:')):
                    continue
                url = urljoin(ORIGIN + route, a[attr])
                target = urlparse(url)
                if target.netloc != 'www.jackzhaojin.com':
                    continue
                if target.path in PROJECT_SITES:
                    continue
                file = local_file(url)
                check(file.is_file(), route + ': missing local file ' + a[attr])
                if target.fragment and file.is_file() and file.suffix == '.html':
                    dest = Page(file.read_text())
                    check(any(d.get('id') == unquote(target.fragment) for _, d in dest.tags), route + ': missing anchor ' + a[attr])
        if opts.url:
            with urlopen(opts.url.rstrip('/') + route) as response:
                check(response.status == 200 and '<html' in response.read().decode(), route + ': HTTP')

    check((ROOT / 'CNAME').read_text().strip() == 'www.jackzhaojin.com', 'CNAME')
    check((ROOT / '.nojekyll').exists(), '.nojekyll')
    check((ROOT / 'google57906613577fdd42.html').read_text().strip() == 'google-site-verification: google57906613577fdd42.html', 'verification file')
    check('6FfUrqzAd1GDf35t2W1QHz-2rIbSjVTKzuZwWQKJjqw' in texts['/'], 'verification meta')
    locs = {x.text for x in ET.parse(ROOT / 'sitemap.xml').findall('.//{*}loc')}
    check(locs == {ORIGIN + r for r in ROUTES if r not in ALIASES and r != '/404.html'}, 'sitemap canonical page set')
    check('Sitemap: ' + ORIGIN + '/sitemap.xml' in (ROOT / 'robots.txt').read_text(), 'robots sitemap reference')
    creds = [a for t, a in parsed['/certifications/'].tags if t == 'article' and 'credential-row' in a.get('class', '')]
    check(len(creds) == 22, '22 credential records preserved')
    check(sum(t == 'article' and 'talk-row' in a.get('class', '') for t, a in parsed['/talks/'].tags) == 9, '9 talk records')
    chapters = {a['id'] for t, a in parsed['/portfolio/'].tags if t == 'section' and 'chapter' in a.get('class', '')}
    check(chapters == {'ch-anima', 'ch-bruce', 'ch-factory', 'ch-kit', 'ch-conv', 'ch-cea', 'ch-ciam', 'ch-postal', 'ch-shadow', 'ch-star', 'ch-rockstar'}, 'portfolio chapters preserved')
    # Every listed article is a real routed page, dated in its slug, and the ItemList matches the listing.
    articles = [r for r in ROUTES if r.startswith('/writing/') and r != '/writing/']
    listed = [a['href'] for t, a in parsed['/writing/'].tags if t == 'a' and a.get('href', '').startswith('/writing/2')]
    check(set(listed) == set(articles), 'writing listing matches article routes')
    check(all(re.match(r'^/writing/\d{4}-\d{2}-\d{2}-[a-z0-9-]+/$', r) for r in articles), 'article slugs start with yyyy-mm-dd')
    items = next(x for x in parsed['/writing/'].schemas[0]['@graph'] if x.get('@type') == 'ItemList')
    check(items['numberOfItems'] == len(articles) == len(items['itemListElement']), 'writing ItemList count')
    check({i['url'] for i in items['itemListElement']} == {ORIGIN + r for r in articles}, 'writing ItemList URLs')
    for r in articles:
        g = parsed[r].schemas[0]['@graph']
        check(any(x.get('@type') in ('Article', 'TechArticle', 'BlogPosting') and x.get('datePublished') for x in g), r + ': article datePublished')
        # Google detects embedded video only from a real player in the HTML, and contentUrl must be the media file.
        for v in [x for x in g if x.get('@type') == 'VideoObject']:
            check('youtube.com/watch' not in v.get('contentUrl', '') and 'youtu.be' not in v.get('contentUrl', ''), r + ': VideoObject contentUrl must be a media file')
            check(any(t == 'iframe' and a.get('src', '').split('?')[0] == v.get('embedUrl') for t, a in parsed[r].tags), r + ': VideoObject embedUrl needs a real iframe in the HTML')
    check(texts['/blogs.html'].count('/writing/2') == texts['/writing/'].count('/writing/2'), 'blogs.html synchronized with writing listing')
    if ERRORS:
        print('\n'.join('FAIL: ' + e for e in ERRORS))
        raise SystemExit(1)
    print('PASS: ' + str(len(ROUTES)) + ' routes; v3 assets; metadata; JSON-LD; local links, anchors and images; analytics; verification; sitemap; 22 credentials; 9 talks; 11 portfolio chapters; ' + str(len([r for r in ROUTES if r.startswith('/writing/2')])) + ' article(s) listed.' + (' Local HTTP responses passed.' if opts.url else ''))


if __name__ == '__main__':
    main()
