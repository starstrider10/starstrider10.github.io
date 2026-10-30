# Story of Leo — review report

Prepared October 29, 2026. Local implementation is ready for design/content review. Publication has not been performed and is not authorized yet.

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

1. Supply an approved event case study and real project objectives, roles and delivered work. Outdoor personal work is currently a labeled visual reference, not an event commission.
2. The selected Reels and full music video are now linked, with confirmed roles and context. Supply clean Cloudinary MP4 delivery URLs and approved poster images when ready for on-page playback. Keep archival masters separately and confirm applicable music/footage permissions and captions.
3. Confirm final portrait rates and package policies. Event draft rates were approved in this chat; no new delivery turnaround, deposit, cancellation or usage policy has been invented.
4. Restore or locate the Journal source if articles should be public. A private repository, moved folder or another source may require a different publishing workflow; no source content was removed.
5. Verify live Shopify product-title/variant matching, stock and cart/checkout on the intended production origin. Existing API version is 2024-07; this task did not migrate the integration or alter any price/payment setting. Fallback display prices are existing site values, not verified live quotes.
6. Resolve or retain the video-link fallback; a working MP4/managed-stream source would enable reliable on-page playback.
7. Remove local-review notes only when their missing facts have been supplied, and approve publication.

## Hosting and deployment

The Git remote, repository name and `CNAME` indicate a GitHub Pages-style static setup pointing at `www.storyofleo.com`. The account's live Pages source/settings were not inspected, so automatic deployment from main must not be assumed.

Before publishing this client-facing business/print storefront, review the actual hosting arrangement. [GitHub Pages documentation](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits) restricts use as a free host for online businesses/e-commerce or sites primarily facilitating commercial transactions. An appropriate business hosting target may therefore be needed. No DNS, CNAME or hosting changes have been made; changing that target requires owner approval.

After content and hosting approval:

1. Review `git diff review-base-a38a3f2` on `codex/portfolio-polish`. Reconcile with any newer upstream changes before publication; this checkout intentionally starts from the local source snapshot.
2. Inspect the existing host's real publish branch/directory or workflow. Keep Porkbun/DNS unchanged unless a separately approved host migration requires changes.
3. Deploy the static site root, including HTML, first-party JS, `style.css`, `utilities.css`, `assets/` and `vendor/`. There is no production build requirement or server runtime. Do not publish `.git`, credentials, original media masters or build-tool caches.
4. Keep the Services fallback document. GitHub Pages cannot infer redirects from Netlify/Vercel configuration; this implementation works as a plain HTML file.
5. Validate canonical domain/HTTPS, every route, mobile navigation, media, real Journal source and live print checkout on the actual production origin. Confirm a successful host deployment before reporting publication.

## Media storage decision

Current images remain on Cloudinary; new web derivatives are local and were not uploaded. Video is a YouTube link. No new media-hosting service or billing was enabled.

Suggested future workflow: keep original masters plus backups, use a designated local intake folder for web exports/thumbnail/context, upload approved media once, update a small content manifest, preview, then approve publication. Cloudinary can remain the photo host while video uses a dedicated service. Cloudflare Stream is a candidate for managed upload/encoding/playback, currently up to 1080p. It costs $5/month per 1,000 stored minutes of capacity plus $1 per 1,000 delivered minutes; buffering/preload affects delivery usage. R2 is object storage with a Standard-storage free tier and free egress, but adaptive encoding/playback requires additional work. These are recommendations, not configured integrations.

References checked October 29, 2026: [Stream overview](https://developers.cloudflare.com/stream/), [uploads](https://developers.cloudflare.com/stream/uploading-videos/), [pricing](https://developers.cloudflare.com/stream/pricing/), [R2 pricing](https://developers.cloudflare.com/r2/pricing/).
