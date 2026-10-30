# Story of Leo — personal website review

Current direction: personal photography portfolio, films and visual archive first. Business is secondary through email and a footer link to the separately hosted Shopify shop. This is a local review checkout; nothing is pushed or deployed.

- Review branch: `codex/portfolio-polish`
- Original baseline: `review-base-a38a3f2`
- Prior business-site version: `review-before-personal-site`
- Journal archive: `review-before-journal-archive`

## Preview and checks

```sh
python3 -m http.server 8765 --bind 127.0.0.1
python3 tests/check_site.py
```

Open http://127.0.0.1:8765/index.html. Nine checks cover routes/assets, film media, navigation, the new personal-site boundary and archived rates. Commerce-specific tests were retired with the archived commerce implementation.

## Maintain

`portfolio-data.js` holds the selected photographs and films. Preserve confirmed credits, native aspect ratios and personal-work labels. `gallery-data.js` is the original Cloudinary manifest and remains unchanged. Local additions use `gallery-local-data.js`. Never run `sync_cloudinary.py` for a preview: it uploads media. Store masters separately from web derivatives.

There is no on-site cart, Storefront API client, price configurator, booking form or package section. The gallery retains filtering, keyboard viewer, slideshow, full-screen and wall display preview. Legacy filter URLs are retained. Services now redirects to About; Journal redirects home.

Approved business rates, terms and prepared inquiry code remain recoverable at `review-before-personal-site`. A readable summary is outside the deployable site at `../business-rates-archive.md`. The separate shop still needs provider setup and testing; a link does not claim it is ready for orders.

The sharing image is `assets/social-preview.jpg` (1200×630). Keep business transactions and detailed service selling on the separately hosted shop. This structure aims to align with a personal portfolio use of GitHub Pages, but is not GitHub approval or a guaranteed policy exemption. See REVIEW.md for the source and validation record.

## Publish only after review

The original checkout and DNS remain unchanged. Reconcile with upstream before merging the reviewed source into the publishing branch. Keep the existing CNAME when deploying to GitHub Pages; use its actual Pages configuration. Verify the public routes, media and domain after an owner-approved release. Do not deploy local build caches, original media, private configuration or project review documents.
