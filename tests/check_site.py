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

    def test_approved_rates_and_existing_inclusions_preserved(self):
        page = (ROOT / 'portfolio.html').read_text()
        for text in ['$325', '$450', '$650', '$950+', '45-Minute Session', '60-Minute Session', '35 Hand-Edited High-Res Files', '$50 Archival Print Credit', '8x12 Archival Fine Art Print', 'Valid Student ID Required', 'From $600 for up to 2 hours', 'from $250/hour']:
            self.assertIn(text, page)
        self.assertNotIn('provisional', page)

    def test_legacy_services_redirect_and_gallery_unchanged_content(self):
        redirect = (ROOT / 'services.html').read_text()
        self.assertIn('location.search', redirect)
        self.assertIn('location.hash', redirect)
        self.assertIn('portfolio.html#investment', redirect)
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

    def test_print_flow_failure_and_success_states(self):
        subprocess.run(['node', 'tests/gallery-flow.test.cjs'], cwd=ROOT, check=True, capture_output=True)

    def test_inquiry_delivery_states(self):
        subprocess.run(['node', 'tests/inquiry-flow.test.cjs'], cwd=ROOT, check=True, capture_output=True)

    def test_javascript_syntax(self):
        for script in ROOT.glob('*.js'):
            subprocess.run(['node','--check',str(script)], check=True, capture_output=True)

    def test_local_portfolio_media_exists(self):
        source = (ROOT / 'portfolio-data.js').read_text()
        for asset in re.findall(r"src: '(assets/[^']+)'", source):
            self.assertTrue((ROOT / asset).is_file(), asset)
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
  native: projectMedia({...portfolioProjects.find(p => p.id === 'made-of-stars'),
    video: {src: 'https://res.cloudinary.com/example/video/upload/stars.mp4', captions: 'stars.vtt'}})
})`, context));
"""
        result = json.loads(subprocess.check_output(['node', '-e', script], cwd=ROOT))
        projects = result['projects']
        self.assertEqual(len(projects), 7)
        self.assertEqual(sum(p['category'] == 'content' for p in projects), 4)
        by_id = {p['id']: p for p in projects}
        for project_id in ['made-of-stars', 'music-video-promo', 'young-and-beautiful']:
            self.assertEqual(by_id[project_id]['credits'], ['Direction', 'Filming', 'Editing', 'Color'])
        for project_id, reel_id in [('made-of-stars', 'Des13xtSB4X'), ('music-video-promo', 'DbkTd0fsNxf')]:
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
            ('music-video-promo', 1276, 718, 'Video-73917_ubxwcy.mp4')
        ]:
            project = by_id[project_id]
            self.assertEqual((project['video']['width'], project['video']['height']), (width, height))
            self.assertTrue(project['video']['src'].endswith(filename))
            video = next(a for tag, a in Document(project['media']).nodes if tag == 'video')
            self.assertEqual((int(video['width']), int(video['height'])), (width, height))
        self.assertEqual(by_id['music-video-promo']['format'], 'landscape')
        self.assertNotIn('vertical-video', by_id['music-video-promo']['media'])
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
