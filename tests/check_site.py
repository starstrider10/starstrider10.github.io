"""Static regression checks. Run with Python 3.12+; no dependencies or network."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
import json
import re
import subprocess
import unittest

ROOT = Path(__file__).resolve().parents[1]

class Document(HTMLParser):
    def __init__(self, source):
        super().__init__()
        self.nodes = []
        self.feed(source)
    def handle_starttag(self, tag, attributes):
        self.nodes.append((tag, dict(attributes)))

class SiteChecks(unittest.TestCase):
    def test_internal_routes_assets_and_fragments(self):
        for page in ROOT.glob('*.html'):
            for tag, attrs in Document(page.read_text()).nodes:
                for attribute in ['href', 'src']:
                    raw = attrs.get(attribute, '')
                    if not raw: continue
                    url = urlsplit(raw)
                    if url.scheme or url.netloc: continue
                    target = ROOT / unquote(url.path) if url.path else page
                    with self.subTest(page=page.name, target=raw):
                        self.assertTrue(target.is_file(), f'Missing local target: {raw}')
                        if url.fragment and target.suffix == '.html':
                            ids = {a.get('id') for _, a in Document(target.read_text()).nodes}
                            if target.name == 'portfolio.html':
                                ids.update(re.findall(r'["\']?id["\']?\s*:\s*["\']([^"\']+)["\']' , (ROOT / 'portfolio-data.js').read_text()))
                            self.assertIn(unquote(url.fragment), ids)

    def test_no_runtime_tailwind_or_stock_portfolio(self):
        for page in ROOT.glob('*.html'):
            text = page.read_text()
            self.assertNotIn('cdn.tailwindcss.com', text)
            self.assertNotIn('@tailwindcss/browser', text)
        for name in ['portfolio.html', 'portfolio-data.js']:
            self.assertNotIn('unsplash', (ROOT / name).read_text())

    def test_accessible_form_labels_and_unique_ids(self):
        for name in ['portfolio.html', 'gallery.html', 'journal.html', 'index.html', 'about.html', 'practice.html', 'services.html']:
            nodes = Document((ROOT / name).read_text()).nodes
            ids = [a['id'] for _, a in nodes if 'id' in a]
            self.assertEqual(len(ids), len(set(ids)), name)
        nodes = Document((ROOT / 'portfolio.html').read_text()).nodes
        labels = {a.get('for') for tag, a in nodes if tag == 'label'}
        for tag, attrs in nodes:
            if tag in ['input', 'select', 'textarea']:
                self.assertIn(attrs.get('id'), labels)

    def test_personal_site_with_external_business_links(self):
        for name in ['index.html','portfolio.html','gallery.html','about.html']:
            page = (ROOT / name).read_text()
            if name != 'index.html': self.assertIn('https://shop.storyofleo.com/', page)
            self.assertNotIn('cart-drawer', page)
            self.assertNotIn('inquiry-form', page)
            self.assertNotIn('$325', page)
        gallery = (ROOT / 'gallery-logic.js').read_text()
        for removed in ['shopifyFetch', 'graphql.json', 'initCart', 'handleBuyPrintClick']:
            self.assertNotIn(removed, gallery)
        archived = subprocess.check_output(['git','show','review-before-personal-site:portfolio.html'],cwd=ROOT).decode()
        for rate in ['$325','$450','$650','$950+','From $600']:
            self.assertIn(rate, archived)
        self.assertIn('photo', gallery)
        packages = (ROOT / 'services.html').read_text()
        for text in ['$325','$450','$650','$950+','from $600','from $250/hour','35 Hand-Edited High-Res Files','Personal Print Rights Included']:
            self.assertIn(text, packages)
        self.assertIn('id="investment"', packages)

    def test_legacy_services_redirect_and_gallery_unchanged_content(self):
        redirect = (ROOT / 'exhibition.js').read_text()
        self.assertIn("location.replace('services.html#investment')", redirect)
        self.assertIn('id="investment"', (ROOT / 'services.html').read_text())
        baseline = subprocess.check_output(['git', 'show', 'review-base-a38a3f2:gallery-data.js'], cwd=ROOT)
        self.assertEqual(baseline, (ROOT / 'gallery-data.js').read_bytes())
        self.assertEqual(subprocess.check_output(['git','show','review-base-a38a3f2:CNAME'],cwd=ROOT), (ROOT/'CNAME').read_bytes())

    def test_archived_journal_and_current_navigation(self):
        for name in ['index.html', 'portfolio.html', 'gallery.html', 'about.html', 'services.html']:
            nodes = Document((ROOT / name).read_text()).nodes
            self.assertFalse(any(a.get('href') == 'journal.html' for _, a in nodes))
        archived = (ROOT / 'journal.html').read_text()
        self.assertIn("location.replace('index.html')", archived)
        self.assertIn('noindex', archived)
        self.assertFalse((ROOT / 'journal.js').exists())
        self.assertIn(b'The Journal', subprocess.check_output(['git','show','review-before-journal-archive:journal.html'], cwd=ROOT))

    def test_shared_main_navigation_and_about_copy_boundary(self):
        expected = ['index.html', 'portfolio.html', 'services.html', 'gallery.html', 'about.html']
        for name in ['index.html', 'portfolio.html', 'gallery.html', 'about.html', 'services.html']:
            source = (ROOT / name).read_text()
            nav = re.search(r'<nav class="site-nav".*?</nav>', source, re.S).group()
            nodes = Document(nav).nodes
            links = [a['href'] for tag, a in nodes if tag == 'a'][1:]
            self.assertEqual(links, expected + expected, name)
            self.assertEqual(sum('aria-current' in a for tag, a in nodes if tag == 'a'), 2)
            self.assertIn('site-chrome.css', source)
        about = (ROOT / 'about.html').read_text()
        self.assertNotIn('Welcome', about)
        self.assertNotIn('blue planet', about)
        self.assertEqual(about.count('class="placeholder-label"'), 3)
        self.assertNotIn('photo-collage', about)
        self.assertNotIn('about-leo-lake', about)
        self.assertNotIn('about-leo-guitar', about)
        for name in ['travel-portrait', 'rainbow', 'prayer-flags']:
            for size in [480, 960, 1440]:
                asset = f'assets/about-{name}-{size}.webp'
                self.assertIn(asset, about)
                self.assertTrue((ROOT / asset).is_file())
        for size in [640, 1280, 2000]:
            self.assertIn(f'assets/about-background-{size}.webp', about)
            self.assertTrue((ROOT / f'assets/about-background-{size}.webp').is_file())

    def test_javascript_syntax(self):
        for script in ROOT.glob('*.js'):
            subprocess.run(['node','--check',str(script)], check=True, capture_output=True)

    def test_local_portfolio_media_exists(self):
        source = (ROOT / 'portfolio-data.js').read_text()
        for asset in re.findall(r'["\']?src["\']?\s*:\s*["\'](assets/[^"\']+)["\']' , source):
            self.assertTrue((ROOT / asset).is_file(), asset)
            if asset.endswith('-1440.webp'):
                for width in [480, 960, 1440]:
                    self.assertTrue((ROOT / asset.replace('-1440.webp', f'-{width}.webp')).is_file())

    def test_exhibition_catalog_and_media_fallbacks(self):
        script = (ROOT / 'portfolio-data.js').read_text()
        data = json.loads(subprocess.check_output(
            ['node', '-e', script + '\nconsole.log(JSON.stringify({portfolioProjects, homeSelection}));'],
            cwd=ROOT))
        projects = {p['id']: p for p in data['portfolioProjects']}
        self.assertEqual(len(projects), 15)
        self.assertEqual(sum(p['category'] == 'content' for p in projects.values()), 6)
        self.assertEqual(projects['life-outdoors']['category'], 'adventures')
        self.assertEqual(projects['outdoor-portraits']['category'], 'archive')
        self.assertEqual([p['id'] for p in projects.values() if p['category'] == 'portraits'],
                         ['nicole', 'christie', 'isabella', 'spring-portraits'])
        for project in projects.values():
            if project['category'] != 'content':
                continue
            preview = project.get('video') or project['preview']
            for asset in [preview['poster'], preview.get('preview') or preview['src']]:
                self.assertTrue((ROOT / asset).is_file(), asset)
        self.assertEqual(len(projects['spring-portraits']['images']), 3)
        self.assertEqual(len(projects['wiux-panel']['images']), 8)
        self.assertEqual(projects['wiux-panel']['coverIndex'], 2)
        self.assertEqual(len(projects['outdoor-portraits']['images']), 7)
        self.assertTrue(any('expedition-portrait' in i['src'] for i in projects['outdoor-portraits']['images']))
        for item in data['homeSelection']:
            project = projects[item['project']]
            if 'image' in item:
                self.assertLess(item['image'], len(project['images']))
            else:
                self.assertIn('video', project)
        for key in ['the-life-i-promised', 'rest-vs-rot', 'full-moon']:
            project = projects[key]
            for asset in [project['video']['poster'], project['video']['preview'], project['video']['src']]:
                self.assertTrue((ROOT / asset).is_file(), asset)
            self.assertLess((ROOT / project['video']['preview']).stat().st_size, 500_000)
            self.assertTrue(project['instagramUrl'].startswith('https://www.instagram.com/'))
        self.assertEqual(projects['the-life-i-promised']['instagramUrl'], 'https://www.instagram.com/reel/Dffx2Dqv0LU/')
        self.assertEqual(projects['young-and-beautiful']['youtube'], 'YpRT2H2vnTw')
        self.assertEqual(projects['short-form']['youtube'], '1FaijuGNto0')
        self.assertNotIn('music-video-promo', projects)

if __name__ == '__main__':
    unittest.main(verbosity=2)
