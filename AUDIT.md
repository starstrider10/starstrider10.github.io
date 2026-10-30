# Story of Leo — inspection and implementation plan

## Baseline
- Source: `/Users/leofan/Documents/LEO+MEDIA/starstrider10.github.io`, clean main at a38a3f2.
- Review copy on `codex/portfolio-polish`; `review-base-a38a3f2` tags the recoverable baseline. Original checkout and production are untouched.
- Six standalone HTML pages, shared CSS, a 1,228-line gallery/cart script, Cloudinary asset manifest and an upload/sync script. No package manifest, build pipeline, tests or checked-in hosting workflow.
- GitHub remote and CNAME (`www.storyofleo.com`) indicate GitHub Pages. Actual Pages publishing settings and DNS are not inspected or changed.
- Runtime Tailwind v4 on Home/Practice; v3 on other pages. Invalid browser-native @theme/import rules. Google Fonts, Cloudinary, GSAP, marked and Shopify are external dependencies.
- Gallery: filters, albums, room preview, slideshow/fullscreen, Shopify product/variant reads and persistent cart. Preserve configuration, print prices and checkout behavior; no purchase or payment activation.
- Journal: no local posts. Existing public GitHub API for posts returned 404 during inspection. This does not prove content was intentionally removed; it is unavailable through the existing route.
- Existing Services uses Unsplash examples, four portrait packages and a mailto inquiry form. Preserve prices, duration, licensing, print credits and all deliverables provisionally.
- Real photos: Cloudinary gallery manifest plus three local expedition portraits in adjacent `storyofleo.com photos/services/3 expedition`. No confirmed event briefs, video assets, delivery history or client outcomes found.

## Priority plan
1. Dedicated editorial Portfolio, real photo selections, three service sections, transparent provisional portrait rates, event-rate approval gap and scope-based video quotes.
2. Consistent Home | Portfolio | Gallery | Journal | About navigation; useful Home inquiry paths; static-host-compatible legacy Services redirect.
3. Replace runtime Tailwind with one checked-in compiled stylesheet, preserve gallery/cart and practice, improve keyboard access and responsive behavior.
4. Repair Journal error handling/rendering, then browser-check all routes, categories, inquiry draft, gallery/print controls and mobile layouts.

## Approval boundaries
Do not deploy/push, change DNS/hosting/CNAME, alter prices or policies, remove content/features, enable payments or paid services. Event minimum/rate, publication-ready project briefs and video links require owner input before publication. Local copies and reversible fixes are authorized.

## Decisions and verified updates during implementation
- Owner supplied YouTube film 1FaijuGNto0; official oEmbed identifies Leo Fan and the title about UW/productivity/learning a useless skill. Embedding reported unavailable in this browser, so the review draft uses a thumbnail link; no hosted video file was uploaded.
- Owner approved event pricing for the local draft: from $600 for up to two hours, then from $250/hour, final quote depends on scope. Portrait pricing remains provisional.
- Street category had no manifest entries; restored using the existing local DSC01862.jpg derivative, without altering the Cloudinary manifest.
- All main routes fit at 390px and 1440px in the test browser. Actual Journal articles and live Shopify variant/cart/checkout remain unresolved.
