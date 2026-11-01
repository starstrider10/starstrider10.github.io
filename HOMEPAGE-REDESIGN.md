# Story of Leo — cinematic editorial redesign

## Audit

Baseline: 7a3e2c3; nine existing checks pass. Plain HTML, CSS and vanilla JavaScript. Current Home uses compiled utility CSS, shared styles and an oversized photographic hero. Four primary routes exist; Services redirects to the Portfolio price guide; Contact uses email. Gallery filtering, keyboard viewer, wall preview and films already work. Existing homepage sunset, portrait, landscape and film assets are suitable: no temporary photography needed.

Personal portfolio/gallery remains primary. Approved rates: $325 / $450 / $650 / $950+, events from $600 with extra coverage from $250/hour; films custom quoted. No payments or checkout. No client names, outcomes, availability or event case studies will be invented.

## File-level plan and phases

1. Audit/proposal: this document. Keep existing routes and destinations. Homepage navigation uses Work → portfolio.html, Services → services.html, Contact → #contact.
2. Tokens: add design-tokens.css with supplied six-color palette, Space Grotesk / Inter / IBM Plex Mono, spacing, borders, motion and 12-column/4-column grids. Tokens are additive; other pages migrate later.
3. Homepage: rebuild index.html and add home.css. Carbon cinematic introduction with existing coastal photograph; Paper selected work; Bone artist statement; restrained service list; existing three-image archive; simple contact and external shop footer. Retain homepage statement, photography and routes. Reuse site.js for mobile menu.
4. Later Work: migrate portfolio.html/project styles to tokens while preserving filters, credits, source aspect ratios and links.
5. Later Services/Contact: retain approved hybrid prices and email behavior; improve information hierarchy without new backend or invented policy.
6. Later Gallery/About: migrate visual system while preserving collections, display preview, keyboard access, archived Journal and Practice routes.
7. Homepage QA now: mobile/desktop screenshots, content/routes/assets checks, keyboard navigation, reduced motion, contrast and font/image behavior. Repeat focused QA per later phase.

## Homepage composition

Use actual photographs and film posters. Generous whitespace, editorial asymmetry, technical labels and thin rules. Amber identifies a small number of links/markers; no fictional telemetry, game assets or decorative dashboards. Use no autoplay video, parallax, scroll-jacking or additional JavaScript.

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
