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
        for name in ['portfolio.html', 'gallery.html', 'journal.html', 'index.html', 'about.html', 'practice.html']:
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
            self.assertIn('https://shop.storyofleo.com/', page)
            self.assertNotIn('cart-drawer', page)
            self.assertNotIn('inquiry-form', page)
            if name not in ['portfolio.html', 'index.html']: self.assertNotIn('$325', page)
        gallery = (ROOT / 'gallery-logic.js').read_text()
        for removed in ['shopifyFetch', 'graphql.json', 'initCart', 'handleBuyPrintClick']:
            self.assertNotIn(removed, gallery)
        archived = subprocess.check_output(['git','show','review-before-personal-site:portfolio.html'],cwd=ROOT).decode()
        for rate in ['$325','$450','$650','$950+','From $600']:
            self.assertIn(rate, archived)
        self.assertIn('photo', gallery)
        packages = (ROOT / 'portfolio.html').read_text()
        for text in ['$325','$450','$650','$950+','from $600','from $250/hour','35 Hand-Edited High-Res Files','Personal Print Rights Included']:
            self.assertIn(text, packages)
        self.assertIn('id="investment"', packages)

    def test_legacy_services_redirect_and_gallery_unchanged_content(self):
        redirect = (ROOT / 'services.html').read_text()
        self.assertIn("location.replace('portfolio.html#investment')", redirect)
        self.assertIn('href="portfolio.html#investment"', redirect)
        baseline = subprocess.check_output(['git', 'show', 'review-base-a38a3f2:gallery-data.js'], cwd=ROOT)
        self.assertEqual(baseline, (ROOT / 'gallery-data.js').read_bytes())
        self.assertEqual(subprocess.check_output(['git','show','review-base-a38a3f2:CNAME'],cwd=ROOT), (ROOT/'CNAME').read_bytes())

    def test_archived_journal_and_current_navigation(self):
        for name in ['index.html', 'portfolio.html', 'gallery.html', 'about.html']:
            nodes = Document((ROOT / name).read_text()).nodes
            self.assertFalse(any(a.get('href') == 'journal.html' for _, a in nodes))
        archived = (ROOT / 'journal.html').read_text()
        self.assertIn("location.replace('index.html')", archived)
        self.assertIn('noindex', archived)
        self.assertFalse((ROOT / 'journal.js').exists())
        self.assertIn(b'The Journal', subprocess.check_output(['git','show','review-before-journal-archive:journal.html'], cwd=ROOT))

    def test_shared_main_navigation_and_about_copy_boundary(self):
        expected = ['index.html', 'portfolio.html', 'portfolio.html#investment', 'gallery.html', 'about.html', 'mailto:hello@storyofleo.com']
        for name in ['index.html', 'portfolio.html', 'gallery.html', 'about.html']:
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

    def test_film_projects_links_credits_and_media_fallbacks(self):
        # Run the actual content and pure media renderer without a browser or network.
        script = r"""
const fs = require('node:fs');
const vm = require('node:vm');
const context = vm.createContext({document: {getElementById: () => ({})}});
vm.runInContext(fs.readFileSync('portfolio-data.js', 'utf8'), context);
const renderer = fs.readFileSync('portfolio.js', 'utf8').split('projectContainer.innerHTML =')[0];
vm.runInContext(renderer, context);
console.log(vm.runInContext(`JSON.stringify({
  projects: portfolioProjects.map(project => ({...project, media: projectMedia(project)})),
  cards: verticalFilms.map(shortFilmCard).join(''),
  environment: renderProject(portfolioProjects.find(p => p.id === 'outdoor-portraits'), 1),
  native: projectMedia({...portfolioProjects.find(p => p.id === 'made-of-stars'),
    video: {src: 'https://res.cloudinary.com/example/video/upload/stars.mp4', captions: 'stars.vtt'}})
})`, context));
"""
        result = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT))
        projects = result['projects']
        self.assertEqual(len(projects), 8)
        self.assertEqual(sum(p['category'] == 'content' for p in projects), 5)
        by_id = {p['id']: p for p in projects}
        for project_id in ['made-of-stars', 'young-and-beautiful']:
            self.assertEqual(by_id[project_id]['credits'], ['Direction', 'Filming', 'Editing', 'Color'])
        for project_id, reel_id in [('made-of-stars', 'Des13xtSB4X'), ('rest-vs-rot', 'DfTzJmFyTFp')]:
            project = by_id[project_id]
            self.assertEqual(project['instagramUrl'], f'https://www.instagram.com/reel/{reel_id}/')
            video = next(a for tag, a in Document(project['media']).nodes if tag == 'video')
            self.assertEqual(video['aria-label'], project['title'])
            self.assertIn('controls', video)
            self.assertIn('playsinline', video)
            self.assertNotIn('autoplay', video)
            self.assertEqual(video['preload'], 'none')
            self.assertTrue((ROOT / video['poster']).is_file())
        for project_id, width, height, filename in [
            ('made-of-stars', 720, 1280, 'Video-6606_fhpgfa.mp4'),
            ('rest-vs-rot', 720, 1280, 'rest-vs-rot.mp4'),
            ('full-moon', 720, 1280, 'full-moon.mp4')
        ]:
            project = by_id[project_id]
            self.assertEqual((project['video']['width'], project['video']['height']), (width, height))
            self.assertTrue(project['video']['src'].endswith(filename))
            video = next(a for tag, a in Document(project['media']).nodes if tag == 'video')
            self.assertEqual((int(video['width']), int(video['height'])), (width, height))
        self.assertNotIn('music-video-promo', by_id)
        self.assertEqual(by_id['full-moon']['instagramUrl'], 'https://www.instagram.com/reels/DUQ9rljDwyA/')
        card_nodes = Document(result['cards']).nodes
        self.assertEqual(sum(tag == 'video' for tag, _ in card_nodes), 3)
        self.assertEqual(sum(tag == 'article' for tag, _ in card_nodes), 3)
        self.assertNotIn('Creative notes', result['cards'])
        self.assertNotIn('Direction', result['cards'])
        self.assertNotIn('working title', result['cards'])
        for key in ['rest-vs-rot', 'full-moon']:
            self.assertTrue((ROOT / by_id[key]['video']['src']).is_file())
            self.assertLess((ROOT / by_id[key]['video']['src']).stat().st_size, 25_000_000)
            self.assertTrue((ROOT / by_id[key]['video']['poster']).is_file())
        environmental = by_id['outdoor-portraits']['images']
        self.assertEqual(len(environmental), 7)
        self.assertTrue(any('expedition-portrait' in image['src'] for image in environmental))
        self.assertTrue(all(image['width'] > 0 and image['height'] > 0 for image in environmental))
        self.assertNotIn('Creative notes', result['environment'])
        film = by_id['young-and-beautiful']
        self.assertIn('https://www.youtube.com/watch?v=YpRT2H2vnTw', film['media'])
        self.assertIn('https://i.ytimg.com/vi/YpRT2H2vnTw/hqdefault.jpg', film['media'])
        self.assertIn('Young and Beautiful (Cover) M/V on YouTube', film['media'])
        self.assertNotIn('one-minute', film['media'])
        self.assertNotIn('<iframe', film['media'])
        self.assertEqual(by_id['short-form']['youtube'], '1FaijuGNto0')
        self.assertIn('working title', by_id['made-of-stars']['titleNote'])
        native_nodes = Document(result['native']).nodes
        video = next(a for tag, a in native_nodes if tag == 'video')
        self.assertIn('playsinline', video)
        self.assertEqual(video['preload'], 'none')
        self.assertTrue(any(tag == 'track' for tag, _ in native_nodes))
        self.assertNotIn('instagram.com', result['native'])

if __name__ == '__main__':
    unittest.main(verbosity=2)
