# Story of Leo — cinematic editorial redesign

## Audit

Baseline: 7a3e2c3; nine existing checks pass. Plain HTML, CSS and vanilla JavaScript. Current Home uses compiled utility CSS, shared styles and an oversized photographic hero. Four primary routes exist; Services redirects to the Portfolio price guide; Contact uses email. Gallery filtering, keyboard viewer, wall preview and films already work. Existing homepage sunset, portrait, landscape and film assets are suitable: no temporary photography needed.

Personal portfolio/gallery remains primary. Approved rates: $325 / $450 / $650 / $950+, events from $600 with extra coverage from $250/hour; films custom quoted. No payments or checkout. No client names, outcomes, availability or event case studies will be invented.

## File-level plan and phases

1. Audit/proposal: this document. Keep existing routes and destinations. Homepage navigation uses Work → portfolio.html, Services → services.html, Contact → #contact.
2. Tokens: add design-tokens.css with current Deep Raspberry palette, Space Grotesk / Inter / IBM Plex Mono, spacing, borders, motion and 12-column/4-column grids. Tokens are additive; other pages migrate later.
3. Homepage: rebuild index.html and add home.css. Carbon cinematic introduction with existing coastal photograph; Paper selected work; Bone artist statement; restrained service list; existing three-image archive; simple contact and external shop footer. Retain homepage statement, photography and routes. Reuse site.js for mobile menu.
4. Later Work: migrate portfolio.html/project styles to tokens while preserving filters, credits, source aspect ratios and links.
5. Later Services/Contact: retain approved hybrid prices and email behavior; improve information hierarchy without new backend or invented policy.
6. Later Gallery/About: migrate visual system while preserving collections, display preview, keyboard access, archived Journal and Practice routes.
7. Homepage QA now: mobile/desktop screenshots, content/routes/assets checks, keyboard navigation, reduced motion, contrast and font/image behavior. Repeat focused QA per later phase.

## Homepage composition

Use actual photographs and film posters. Generous whitespace, editorial asymmetry, technical labels and thin rules. Raspberry identifies a small number of links/markers; Soft Rose supports readable small text on dark surfaces; no fictional telemetry, game assets or decorative dashboards. Use no autoplay video, parallax, scroll-jacking or additional JavaScript.

## Acceptance

No deployment or push. Other pages retain current presentation. Hero prioritized; below-fold imagery lazy-loaded with explicit aspect ratios. Native anchors and links work without JavaScript; mobile menu uses existing focus/Escape handling. No horizontal overflow at 390px or desktop width; visible focus; reduced-motion overrides. Validate with python3 tests/check_site.py. No framework build is introduced.

## Implemented homepage phase

Completed audit, additive tokens and homepage. Owner chose the existing coastal sunset. Space Grotesk headings, Inter body and IBM Plex Mono labels are loaded through one Google Fonts stylesheet; previous homepage utility/legacy font stylesheets are no longer requested. Remaining routes do not load the new tokens or homepage styles yet.

Selected work links to existing project IDs and category filters. Existing three archive photographs and artist statement remain. Home now introduces all three requested services with approved portrait range/event starting price and custom film quotes; detailed packages remain in their existing route. No commerce runtime was added.

The route validator now recognizes dynamically rendered Portfolio project IDs. The homepage price-boundary assertion now permits the explicitly requested approved starting prices. Other routes and original rate-preservation checks remain covered.

## QA evidence

- `python3 tests/check_site.py`: 9 passing checks; `git diff --check`: clean.
- 1440px desktop: 12 grid columns and no horizontal overflow. 390px mobile: 4 grid columns and no overflow. 320px narrow viewport: no overflow.
- Mobile navigation opens; Escape closes and returns focus to Menu. Work-film link lands on the correct visible music-video project with four film selections.
- Computed typography: Space Grotesk / Inter / IBM Plex Mono. Font loading completed. Hero and work imagery loaded; lower archive uses native lazy loading and responsive sources.
- Solid text contrast: Paper/Carbon 16.74:1; Bone/Carbon 15.47:1; Steel/Carbon 6.13:1; Amber/Carbon 9.14:1; Graphite/Paper 13.52:1; Carbon/Bone 15.47:1. Steel and Amber are not used as small text on Paper.
- Browser parsed reduced-motion rules disabling transitions/animations/smooth scrolling; OS preference was not changed or emulated. No autoplay, scroll-driven effects or additional JS was added.
- Screenshots: outputs/homepage-redesign/. Local preview: http://127.0.0.1:8766/index.html.

Build: not applicable to this buildless homepage. No dependency install, publishing, DNS change or media upload. Remaining page phases are proposed, not claimed implemented.

## Deep Raspberry color refinement — October 31

Color-only update: Obsidian #18171B, Deep Plum #422633, Raspberry #A45175, Soft Rose #D9A8BA and Porcelain #F7F0F2. Supporting neutral surfaces and muted text remain centralized in design-tokens.css. Earlier six-color contrast values above describe the superseded first draft.

Raspberry is used for light-surface links/labels, buttons, selected controls and occasional large headlines. Soft Rose handles small text and focus on dark surfaces: Raspberry/Obsidian is only 3.41:1, sufficient for large text but not normal text. Porcelain/Raspberry is 4.66:1; Rose/Obsidian 8.72:1; Rose/Deep Plum 6.59:1; Porcelain/Deep Plum 12.01:1; muted-light/Porcelain 5.17:1. No small Raspberry text on Obsidian.

Portfolio loads a color-only override, portfolio-palette.css, after existing styles. Light editorial sections use Porcelain; existing film panels use neutral Obsidian with Deep Plum player backgrounds. Typography, geometry, routes, controls, animation rules and assets are unchanged. All photographic scrims remain neutral grayscale; no pink grading or image edits. Other legacy pages have no previous amber concept to replace and remain outside this phase.

Refinement QA: all 9 existing checks pass; diff whitespace checks pass. Browser review at 1440px and 390px found no horizontal overflow. Mobile Menu opens, Escape closes and restores focus; the film filter reports four selections. Computed dark panel/body colors match tokens; no browser warnings or errors captured. The secondary light neutral is #F3EFF0, giving Raspberry labels 4.59:1; muted dark text/Obsidian is 8.42:1. This is focused color verification, not a full WCAG conformance audit.

Desktop screenshots in outputs/homepage-redesign/: raspberry-home-dark-desktop.jpg, raspberry-home-light-desktop.jpg, raspberry-portfolio-light-desktop.jpg and raspberry-portfolio-dark-desktop.jpg. Mobile screenshots: raspberry-home-mobile.jpg and raspberry-portfolio-mobile.jpg. Preview remains local at http://127.0.0.1:8766/index.html. No push or deployment.

## Mechanical motion homepage pilot — November 1

Homepage-only native motion in home-motion.js and home.css; motion timings and distances centralized in design-tokens.css. Hero text enters at 450ms with 70ms stagger and 12px travel. Section labels/headings/captions enter once with 8px travel and a 650ms sequence budget; section rules trace in. Photographs stay stationary during entrances; existing hover zoom remains. Work links gain corner marks and arrow feedback; service rows gain tracing indicators; navigation gains a sliding selection line; mobile menu gains a short entrance; contact email gains an extending underline. Hover effects also respond to keyboard focus. No dependencies, sound, cursor effects, parallax, loops or deployment.

Content is visible in base HTML/CSS. Unsupported animation/observer APIs skip the enhancement. Reduced-motion CSS disables transitions and keyframes; JavaScript skips/cancels entrance animations and responds to preference changes. Touch travel halves. Focus/hash changes cancel active text entrances; anchored/restored visible sections stay settled. Seen sections do not replay, including after reduced-motion changes or back-forward cache restoration.

Validation: 9 repository checks and 4 Node lifecycle tests pass; node --check and git diff --check pass. Lifecycle tests cover once-only sections, timing budget, reduced-motion startup/change, touch travel, unsupported APIs, restored content, focus cancellation and preference resume. Browser review at 1440px and 390px: no horizontal overflow; card keyboard focus displays corner marks; mobile menu animation runs, Escape closes and restores Menu focus; anchor navigation works; no warnings/errors captured. Reduced-motion preference changes tested with a matchMedia lifecycle fixture, not OS/browser emulation. JavaScript-disabled fallback inspected statically (visible HTML and no hidden-by-default entrance styles), not through a disabled-JavaScript browser session. No instrumented CLS trace; motion layers are transforms/opacity and decorative absolute elements.

Artifacts in outputs/homepage-redesign/: motion-opening.mp4 (short opening capture), motion-home-desktop.jpg, motion-work-focus.jpg, motion-home-mobile.jpg and motion-mobile-menu.jpg. Preview: http://127.0.0.1:8766/index.html. Existing palette edits remain part of the local uncommitted working tree; nothing pushed or published.

## Main-page consistency pass — November 2

Portfolio and Gallery now use shared Space Grotesk / Inter / IBM Plex Mono, Porcelain/Obsidian surfaces and Raspberry/Soft Rose accents. site-chrome.css shares navigation/footer geometry and styling across Home, Work, Gallery and About. Shared navigation: Home, Work, Services (direct to portfolio.html#investment), Gallery, About, Contact (email). services.html remains a backward-compatible redirect; its document title now describes packages. The sliding navigation indicator moved from the homepage script into site.js, avoiding duplicated behavior. Cache versions updated for changed scripts.

interior.css refines Work/project headings, 12-column caption alignment, readable package hierarchy, Gallery introduction/filter controls and dark viewer colors. Existing project content, media dimensions, prices and photography data remain unchanged. Gallery uses flat keyboard/touch-friendly main filters plus the full Collection select; nested collection selection highlights its parent filter. Visible counts announce photographs/series. Existing drifting archive is retained with an explicit pause/resume control. Entrance movement shortened to 8px/450ms. Reduced-motion changes re-render the static archive; wall-size animations honor the preference. Space on focused viewer buttons now performs the button action rather than toggling slideshow globally; close target expanded to 44px.

About retains its soft photo-only collage and hidden accessible heading. No introduction or quote text restored. Lake/guitar originals remain untouched; new 600px/1200px WebP derivatives serve responsive copies. Mobile pair totals about 83 KB (versus about 3 MB of source JPEGs); larger pair about 329 KB. Original source files remain preserved.

Validation: 10 repository regression checks plus 4 motion lifecycle checks pass; git diff --check passes. Desktop 1440px and mobile 390px reviewed; Work/Gallery also checked at 320px without horizontal overflow. Seven Work selections, four film selections; promo geometry stays 1276:718 and mobile display remains 16:9. Gallery selected filter shows 15 photographs; full archive shows 44; Sakura shows 2 series and highlights Portraiture. Pausing archive kept sampled computed transforms stable across observations. Keyboard Enter opens viewer; next/previous navigation, Space on wall-preview control, size selection, close/return focus, and mobile menu Escape verified. Services menu reaches approved package section. All About photographs load and mobile picks the 600px derivatives. No captured browser warnings/errors.

Homepage reduced-motion lifecycle is unit-tested; Gallery preference branches and CSS overrides inspected. OS preference not changed/emulated. This is focused QA, not a full WCAG or CLS audit. Practice remains a separate existing tool; no feature or content changes there. No new framework or dependency; no publishing, checkout, upload or production deployment.

Screenshots under outputs/homepage-redesign/: unified-work-desktop.jpg, unified-gallery-desktop.jpg, unified-work-mobile.jpg, unified-film-mobile.jpg, unified-gallery-mobile.jpg, unified-gallery-viewer-mobile.jpg, unified-gallery-wall-desktop.jpg and unified-about-mobile.jpg. Local preview: http://127.0.0.1:8766/gallery.html?filter=prints.

## About revision and approved release — November 4

Replaced pastel collage with cinematic editorial About: subtle supplied background photo, orange-jacket portrait, rainbow and prayer-flags photographs. Three explicit placeholder copy panels remain WIP. Responsive WebP derivatives preserve source originals. Desktop and 390px mobile reviewed; 320px has no horizontal overflow. Mobile menu Escape returns focus; no captured browser warnings/errors. Ten site checks and four motion checks pass, along with whitespace checks.

Owner approved publishing current draft including unfinished About. GitHub Pages configuration verified: main branch, repository root, www.storyofleo.com. Native Pages exclusions keep review documents, tests and local outputs out of published site. Unused Aero artwork and original personal images are not included in release.
