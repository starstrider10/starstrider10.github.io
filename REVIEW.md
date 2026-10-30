# Story of Leo — review report

Prepared October 29, 2026. Local implementation is ready for design/content review. Publication has not been performed and is not authorized yet.

## Personal website direction — supersedes the business-site plan

Owner requested keeping GitHub Pages with portfolio/gallery as the primary purpose and business secondary. Recommended leaving detailed services/prices on the separately hosted business site. Home now presents personal work and archive selections; Portfolio presents seven photograph/film selections without investment, booking terms or inquiry form. About identifies Seattle and provides a short collaboration contact. Footer shop links point to the separate Shopify site. No shop readiness is claimed.

Removed the on-site cart/drawer, Storefront API client, live/fallback prices, finish selection, booking form and inquiry submission runtime. Preserved gallery media, filters, keyboard viewer, slideshow, fullscreen and non-transactional wall display preview. Retained legacy filter keys and routed Services to About. All approved prices/terms and previous integrations are recoverable at Git tag `review-before-personal-site`; readable rates summary is `../business-rates-archive.md`.

GitHub's [Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) prohibit running an online business/e-commerce site or one primarily facilitating transactions. No numeric ratio or explicit safe harbor for secondary commercial links is stated. This revision aims at a genuine personal portfolio with separately hosted commerce; it is not a guarantee or GitHub determination. No DNS, hosting or published site was changed.

Nine current automated checks pass after retiring commerce-specific tests with the archived implementation. Browser verified the four-film filter, 15-image selection, keyboard modal opening, wall preview and personal homepage; no warnings/errors observed. Desktop and mobile verification is recorded with this revision. Earlier reports below are historical and superseded where they conflict.

## Final local release audit — current

Reproduced and fixed a stale-draft bug: selecting a service through its package button changed the form's selection while leaving a previously prepared email draft visible. Package selection now triggers the same inquiry reset as a manual edit. The browser reproduction showed a Student & Grad draft under an Events selection; the corrected flow hides that draft, preserves contact fields, focuses the package selector and prepares a fresh Events draft. The versioned script URL ensures existing preview sessions receive the fix.

The complete objective remains unfinished. Local booking copy, Seattle wording, curation changes, sharing artwork and prepared submission integration are present. Cancellation details remain privately agreed; no actual event series has been supplied. A verified form endpoint/inbox, physical print samples, provider costs, actual print products, host approval and publication are external dependencies. Automated simulations cannot prove production delivery or checkout. No further business facts, approvals or fulfillment results have been invented.

## Approved booking terms and prepared form integration — current

Owner approved “Based in Seattle” only and the proposed portrait delivery (2–3 weeks), 25% booking retainer, one reschedule with 48 hours' notice, no-charge weather rescheduling, and per-project event/video timelines. These are now in the local draft. Cancellation terms remain personally agreed; no refund/nonrefundability promise was added. Owner requested continued autonomous work without more questions.

Prepared the approved Formspree integration in `inquiry.js`. An empty endpoint keeps email-draft mode. Connecting the owner's verified endpoint enables direct submission, processing disclosure, duplicate protection, 20-second timeout, accessible status and recovery via email while retaining entries. No real endpoint/account is configured; service acceptance and inbox delivery are not verified. Eleven automated checks pass, including actual inquiry-code tests with simulated success, HTTP/network/timeout failures, invalid endpoints, validation, request data and duplicate protection.

The provider review in `../print-provider-review.md` recommends sampling Prodigi first, with Printful/Gelato comparisons and a three-photo draft. Exact size costs, shipping, margins and physical quality remain unverified. No purchases, external account/product changes or publication occurred. See `../contact-form-setup.md` for the remaining form connection steps. Browser verified the email draft after extracting its handler, with no warnings/errors. Booking terms use three desktop columns and one mobile column at 390px without horizontal overflow; a versioned stylesheet URL ensures the new styling loads in an existing preview session. Screenshots: `../booking-terms-desktop.jpg`, `../booking-terms-mobile.jpg`.

## Booking and launch preparation — latest

Added a branded 1200×630 JPEG sharing card using the existing homepage photograph. Home, Portfolio, Gallery, About and Practice now declare the same absolute image URL, dimensions, descriptive alternative text, canonical Open Graph URL and large-image social card metadata. The asset is local; it becomes publicly reachable only after approved deployment. Source layout is retained outside the deployable site in `../../work/social-preview-source.html`.

The inquiry form now collects the actual project city/location separately from preferred setting, defaults to an open recommendation, provides contact autocomplete and bounds free-text input. Required values are trimmed before validation. Browser verified that location and setting enter the encoded email draft and that editing hides a stale draft; no email was sent. At 390px the form has no horizontal overflow. Ten existing checks pass, with no browser warnings/errors in the changed flow.

Read-only live hosting verification: both public domains resolve to GitHub Pages addresses; www returns HTTP 200 with Server GitHub.com. The public repository reports default branch main and has_pages true. This confirms the current provider, but not its authenticated publishing configuration. Python's local certificate store failed; the system curl client succeeded with certificate verification enabled. No DNS, hosting, remote Git or account changes occurred.

Pending owner answers: public service-area/travel wording, booking terms and whether to connect a hosted inquiry service. Direct submission is not implemented or claimed live; the existing email draft remains functional. Event media, print sampling/product setup, hosting choice and publication approval remain outstanding. Proposed business terms from chat are not published.

## October 30 update — current state

Owner approved portrait packages and rates. Removed provisional pricing copy and internal review notes from visitor-facing project descriptions. Archived Journal at Git tag `review-before-journal-archive`, removed its navigation links and unused Markdown libraries, and redirected the former URL home.

Read-only Shopify audit: the public catalog exposes only “master print temp,” with no exact photograph matches; the shop is password protected. No products, provider apps, payment settings or orders were changed. Updated the retired Storefront API pin to the actual supported response version, 2026-01. Six existing GraphQL operations validate; ProductOption.values has a deprecation warning for a later migration.

Unmatched photographs now show “Ask about this print” and explicitly label existing guide prices as estimates. Cart/network/user errors no longer report false success; live currency formatting preserves cents, and the navigation bag count updates. Ten automated checks pass, including a Node suite exercising actual gallery code with simulated error responses. Browser checked the unmatched print path, approved rates, four-link navigation and Journal redirect; no warnings/errors observed in those flows. Live checkout and fulfillment remain unverified until real provider-backed products exist.

The owner selected provider fulfillment. See `../shopify-print-setup.md` for the proposed setup sequence. Nothing was installed, ordered, uploaded or deployed. Earlier sections below describe previous milestones and are superseded by this section where they differ.

## Portrait curation update — latest

Replaced the Sandy image with Christie's close graduation portrait (`20260331-LEO02645-christie_ynp7ql`), while retaining Anabel's existing portrait. Kept only the original leftmost expedition portrait (`2026-kyle-DSCF0772-.jpg`) in the Portfolio. The other two expedition images remain in the source folder and web assets; Gallery content is unchanged.

Both the mixed landscape/portrait pair and the single mountain portrait now use their complete native framing. The pair stacks on mobile; the mountain portrait stays centered at a restrained width rather than being cropped into a wide image.

Reviewed the existing 29-entry Cloudinary portrait manifest: 28 preview URLs loaded, one returned 404. Produced a six-image numbered shortlist and the complete numbered options sheet, including alternative graduation, golden-hour and architectural portraits. This source pool is the repository's existing manifest, not a fresh inventory of the entire Cloudinary account. See `../portfolio-photo-selection.md`, `../portfolio-photo-shortlist.jpg` and `../portfolio-photo-options.jpg` for filenames, source URLs and selection rationale. The selected replacement is #10; the retained Anabel image is #07.

Verified the new source URLs, three total portrait images, one mountain portrait, full-image framing, and layouts at desktop width 1440 and mobile width 390. No horizontal overflow or console errors observed. Eight existing regression checks pass. Screenshots: `../portraits-revised-desktop.jpg`, `../portraits-revised-mobile.jpg`. Nothing was uploaded or deployed.

## Cloudinary playback update — latest

Connected the two owner-supplied Cloudinary MP4s to native on-page players. Inspection and sample frames identify `Video-6606_fhpgfa.mp4` as the reflective short (720×1280, 80.94 seconds) and `Video-73917_ubxwcy.mp4` as the music-video promo (1276×718, 15.86 seconds). Both have H.264 video and AAC audio.

The promo is landscape, not vertical. Its entry now uses the wide editorial layout with intrinsic width/height and `height: auto; object-fit: contain`. The reflective short retains its 9:16 side-by-side desktop presentation and stacked mobile presentation. Locally extracted real frames provide posters without new Cloudinary transformations. Both players have controls, inline playback, no autoplay and no video preload, plus a direct-video fallback link. Starting one video pauses the other; filtering a video out pauses it.

Verified both videos actually decode and advance during playback in the local browser, not just that their controls appear. Verified the promo's rendered ratio at desktop width 1440 (1.777179) and mobile width 390 (1.777165), matching the source ratio 1276/718 (1.777159) within subpixel rounding. The reflective short's mobile ratio is 0.562502, matching 9/16. No horizontal overflow or console errors observed. Category filtering and pause-on-hide behavior pass. Eight automated regression checks pass, now covering actual source URLs, poster files, dimensions, controls and landscape promo classification.

Video files remain hosted in the owner's Cloudinary account; this task did not upload or alter them. The full music video and earlier personal film still use their YouTube links. Updated screenshots: `../promo-player-desktop.jpg`, `../promo-player-mobile.jpg`.

## Filmmaking update

Added the three supplied pieces: Made of Stars (explicitly a descriptive working title), a music-video promo, and Young and Beautiful (Cover) M/V. Each shows Leo Fan's confirmed direction, filming, editing and color credits. The promo and full film remain separate entries; no relationship between their productions is asserted. The original personal film remains.

There are now seven Portfolio selections, four under Short-Form Content. Reels use clean Instagram URLs and intentional 9:16 typographic link cards; no unapproved thumbnail or unrelated imagery is used. The full music video uses its verified YouTube thumbnail and a project-specific accessible link. Native/Cloudinary video sources take precedence when supplied, support vertical layout and captions, and do not autoplay.

Validated 1440×1000 desktop and 390×844 mobile presentation, the four-film filter, seven-item total, exact destination URLs, visible credits, Reel keyboard focus order, and the full film's own title/thumbnail. No console errors were observed. Eight automated tests pass, including a new regression check for credits, clean links, project-specific labels and native-video fallback precedence. External Instagram/YouTube playback is not claimed as verified: these entries intentionally open their original publications. No uploads, paid services or deployment occurred.

Changed for this update: `portfolio-data.js`, `portfolio.js`, `style.css`, `tests/check_site.py`, and this report. Screenshots: `../filmmaking-desktop.jpg`, `../filmmaking-mobile.jpg`.

## Implemented

- New editorial Portfolio with a responsive introduction, large real photographs, three category filters, permalink/history support, expandable creative notes, services/investment and inquiry paths.
- Curated existing Sakura images and three local expedition portraits. No invented client names, commissions, testimonials, results or delivery history. Personal visual studies are identified as such; missing briefs remain explicitly marked for review.
- Added the supplied personal film with verified title/author/thumbnail. Browser embedding failed for both YouTube embed domains, so the default is a thumbnail link to the original film. Optional embed and native MP4 rendering are supported by the content structure.
- Portrait rates/inclusions carried over: Student & Grad $325 / 45 minutes / 10 edited files; Essential $450 / 60 minutes / 15 files; Lifestyle & Story $650 / 2 hours / 35 files; Wilderness $950+ / half-day or multi-day / 60+ files. Existing locations, galleries, student-ID rule, print rights, print credit, included print and license wording are retained. These rates remain provisional.
- Owner-approved local event draft: from $600 for up to two hours, additional coverage from $250/hour, final quote depends on scope. Social/short-form work uses scope-based custom quotes.
- Inquiry form labels/validation, package preselection and an editable-by-returning-to-fields email preview. No email was sent, no backend was added, and no personal form data is uploaded by the website.
- Home now introduces all three client services while retaining the personal statement, fine-art prints and Journal access. Shared static navigation is Home | Portfolio | Gallery | Journal | About.
- Services route redirects to Portfolio on static hosting, preserving query strings and existing fragments with JavaScript, plus a no-JavaScript fallback to investment.
- Replaced mixed runtime Tailwind versions with one checked-in compiled utility stylesheet. Existing GSAP and Markdown dependencies are locally served; Markdown is sanitized before rendering.
- Added skip links, current-page navigation state, visible focus, mobile-menu Escape/focus management, keyboard gallery cards, labeled print selectors, dialog focus handling and inert closed shopping bag.
- Improved mobile print controls; preserved all existing gallery categories, albums, print prices, room preview, slideshow, fullscreen code, Shopify configuration/cart logic and standalone practice functionality.
- Restored Street with an existing local photograph in a separate local manifest. Original Cloudinary manifest, CNAME and upload script are byte-for-byte unchanged.
- Added responsive Cloudinary sources, lazy/async loading, local WebP portrait derivatives, a favicon and page-specific metadata. Photo viewing no longer waits on remote product availability; stale product responses are ignored after navigating images. Discarded animation timelines are cleaned up on filtering.

## Files created or modified

Modified: `index.html`, `about.html`, `gallery.html`, `gallery-logic.js`, `journal.html`, `practice.html`, `services.html`, `style.css`.

Created: `portfolio.html`, `portfolio-data.js`, `portfolio.js`, `site.js`, `journal.js`, `gallery-local-data.js`, `favicon.svg`, `tailwind.config.cjs`, `tailwind.input.css`, `utilities.css`, `assets/` web derivatives, `vendor/` pinned libraries and notices, `tests/check_site.py`, `AUDIT.md`, `README.md`, and this report.

Screenshots are saved beside this project: `../portfolio-desktop.jpg` and `../portfolio-mobile.jpg`.

## Automated checks

`python3 tests/check_site.py`: **8 tests pass**.

- Local HTML routes, asset references and fragments exist.
- No runtime Tailwind scripts or stock Portfolio photographs.
- Unique IDs and labeled Portfolio form controls.
- Approved rates and existing key package inclusions are present.
- Legacy redirect preserves parameters/fragments; Cloudinary manifest and CNAME remain unchanged.
- First-party JavaScript syntax checks pass.
- Responsive local Portfolio media exists.
- Filmmaking credits, canonical social URLs, accurate video labels and native-video precedence are preserved.

`git diff --check`: passes after correcting whitespace on changed image tags.

The Tailwind build completed successfully. Its bundled browser-support database reports an outdated-data advisory; the build did not fail.

## Real browser checks

| Check | Result |
| --- | --- |
| Main routes at 390×844 and 1440×1000 | Pass: Home, Portfolio, Gallery, Journal, About and Practice render without document horizontal overflow |
| Main navigation | Pass: consistent five links on every main page; standalone Practice keeps Back to Site |
| Mobile menu | Pass: open, close, Escape, expanded state and focus restoration |
| Portfolio filters | Pass: Portraits, Events/Lifestyle and Short-Form show the intended selections; selected state and category URL update |
| Inquiry | Pass: service preselection; synthetic form input generated the correct encoded mailto draft; no email app/send action taken |
| Legacy Services URL | Pass: old inquiry anchor reaches the new inquiry section |
| Portfolio images | Existing Cloudinary and local photographs loaded; responsive sources inspected |
| Gallery categories | Rendered print groups: alpine 4, urban 4, wildlife 4, travel 3; portrait albums 5; Sakura albums 2; adventure images 17; backpacking 11; outdoors 6; archive 43 before adding the local Street image |
| Street repair | Verified local Street image renders after restoration |
| Print viewer | Pass: keyboard open, image view, room preview, size change ($180 existing fallback to $85 at 8×12), slideshow play/pause, next photo and close/focus restoration |
| Shopping bag | Pass: empty drawer opens/closes and closed drawer is hidden from keyboard/accessibility navigation |
| Live Shopify variants/cart/checkout | **Not verified**: selected print used the existing fallback shop link rather than a live matching variant; no cart mutation or purchase performed |
| Journal unavailable state | Pass: existing public `posts` source returns 404; visitor gets a clear message and retry control |
| Actual article reading | **Not verified**: no articles available locally or through the existing public source; sanitizer/loader added but no real article could be read |
| Supplied video | Metadata/thumbnail verified; **embedded playback failed** in this browser, so default changed to a YouTube link; full watch-page playback not verified |
| Practice | Pass: local folder accepted, photo displayed, timer started, Spin Photo advanced and reset to 02:00; files stayed local |
| Console | No first-party script exceptions observed in checked flows; expected remote Journal-source failure is handled |
| Other limits | No cross-browser/device lab, formal accessibility audit, real email delivery, fullscreen-mode test, payment/fulfillment test or production performance audit |

## Remaining before publication

1. Supply an approved event case study and actual objectives/deliverables. Current outdoor work is labeled personal photography.
2. Choose and sample a print provider, approve costs and retail prices, then create actual photograph products and shipping/policy settings. Test variant mapping, cart and checkout on the production origin before enabling sales.
3. Confirm remaining cancellation terms privately, media permissions and any required captions. Owner-approved prices, retainer, portrait delivery and rescheduling terms are applied.
4. Approve the hosting target and publication. Journal remains archived until the owner requests restoration.

## Hosting and deployment

DNS, public HTTPS headers and public repository metadata now confirm GitHub Pages at `www.storyofleo.com`. Authenticated Pages source/settings were not inspected, so automatic deployment from main must not be assumed.

Before publishing this client-facing business/print storefront, review the actual hosting arrangement. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) restricts use as a free host for online businesses/e-commerce or sites primarily facilitating commercial transactions. An appropriate business hosting target may therefore be needed. No DNS, CNAME or hosting changes have been made; changing that target requires owner approval.

After content and hosting approval:

1. Review `git diff review-base-a38a3f2` on `codex/portfolio-polish`. Reconcile with any newer upstream changes before publication; this checkout intentionally starts from the local source snapshot.
2. Inspect the existing host's real publish branch/directory or workflow. Keep Porkbun/DNS unchanged unless a separately approved host migration requires changes.
3. Deploy the static site root, including HTML, first-party JS, `style.css`, `utilities.css`, `assets/` and `vendor/`. There is no production build requirement or server runtime. Do not publish `.git`, credentials, original media masters or build-tool caches.
4. Keep the Services fallback document. GitHub Pages cannot infer redirects from Netlify/Vercel configuration; this implementation works as a plain HTML file.
5. Validate canonical domain/HTTPS, every route, mobile navigation, media, archived Journal redirect and live print checkout on the actual production origin. Confirm a successful host deployment before reporting publication.

## Media storage decision

Current images remain on Cloudinary; new web derivatives are local and were not uploaded. Video is a YouTube link. No new media-hosting service or billing was enabled.

Suggested future workflow: keep original masters plus backups, use a designated local intake folder for web exports/thumbnail/context, upload approved media once, update a small content manifest, preview, then approve publication. Cloudinary can remain the photo host while video uses a dedicated service. Cloudflare Stream is a candidate for managed upload/encoding/playback, currently up to 1080p. It costs $5/month per 1,000 stored minutes of capacity plus $1 per 1,000 delivered minutes; buffering/preload affects delivery usage. R2 is object storage with a Standard-storage free tier and free egress, but adaptive encoding/playback requires additional work. These are recommendations, not configured integrations.

References checked October 29, 2026: [Stream overview](https://developers.cloudflare.com/stream/), [uploads](https://developers.cloudflare.com/stream/uploading-videos/), [pricing](https://developers.cloudflare.com/stream/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
