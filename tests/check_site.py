"""Static regression checks. Run with Python 3.12+; no dependencies or network."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit, unquote
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
        self.assertIn('provisional', page)

    def test_legacy_services_redirect_and_gallery_unchanged_content(self):
        redirect = (ROOT / 'services.html').read_text()
        self.assertIn('location.search', redirect)
        self.assertIn('location.hash', redirect)
        self.assertIn('portfolio.html#investment', redirect)
        baseline = subprocess.check_output(['git', 'show', 'review-base-a38a3f2:gallery-data.js'], cwd=ROOT)
        self.assertEqual(baseline, (ROOT / 'gallery-data.js').read_bytes())
        self.assertEqual(subprocess.check_output(['git','show','review-base-a38a3f2:CNAME'],cwd=ROOT), (ROOT/'CNAME').read_bytes())

    def test_javascript_syntax(self):
        for script in ROOT.glob('*.js'):
            subprocess.run(['node','--check',str(script)], check=True, capture_output=True)

    def test_local_portfolio_media_exists(self):
        source = (ROOT / 'portfolio-data.js').read_text()
        for asset in re.findall(r"src: '(assets/[^']+)'", source):
            self.assertTrue((ROOT / asset).is_file(), asset)
            for width in [480, 960, 1440]:
                self.assertTrue((ROOT / asset.replace('-1440.webp', f'-{width}.webp')).is_file())

if __name__ == '__main__':
    unittest.main(verbosity=2)
