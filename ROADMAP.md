# Story of Leo — Roadmap

Updated: 2026-11-24. Owner authorized publishing current updates and new WIUX panel gallery.

## Current direction

Photography and film first. Preserve sunset-backed moving exhibition, raspberry accents, original image framing, and plain HTML/CSS/JavaScript. Navigation: Home, Portfolio, Services, Archive, About. Publish only after owner approves exact release.

## Implemented locally

- Home: scroll-to-enter media introduction, drifting gallery, pause control, image spotlight and film playback.
- Portfolio: Photography / Film; Portraits / Events / Adventures filters; ordered photo stories, animated opening, keyboard close and focus restoration.
- Portraits: Nicole mixed-media sequence, Christie, Isabella, Anabel. Older environmental portraits remain in Archive.
- Nicole sequence: wide walking clip, creek portrait, close-turn clip, over-shoulder portrait.
- Christie: full-length blossom-path cover; lawn-profile gallery background. Isabella has separate gallery background.
- Events: Women in UX lecture (7 photographs), Figma (9 photographs), WIUX UX Role Possibilities Panel (8 photographs); responsive local image copies, originals preserved.
- Services: approved packages, booking terms, email inquiries. Legacy investment links redirect here.
- Archive retains existing route and collections. About has photographs and three explicit text placeholders.
- Page wipes use native browser view transitions; reduced-motion styling supplied.

## Verification

- 2026-11-18: 10 static site checks, 6 motion checks, and `git diff --check` passed.
- Prior recorded browser review: both event galleries opened with expected counts. About reviewed at desktop and narrow mobile widths. These visual checks were not repeated in this audit.
- Tests do not establish visual quality, remote image availability, sound/playback behavior, or successful publication. Four motion tests cover older homepage code; two cover current exhibition behavior.
- Local HEAD: `014c095` (moving exhibition release). Working tree contains subsequent unpublished edits and new portrait/event assets. Live production was not checked in this audit.

## Next milestone — review and prepare current release

Base polish started November 18: shared desktop navigation enlarged; Services heading/spacing corrected; Services and About descriptive copy raised to 16px; package price hierarchy and touch targets improved. AI-startup positioning research parked at owner's request. No positioning changes planned for this release.

1. Review Events and Nicole on desktop and phone. Approve covers, ordering, and included frames.
2. Check gallery opening/closing, Escape, focus/scroll restoration, filters, muted previews, full playback, reduced motion, and page transitions in actual browsers.
3. Decide whether About placeholders may remain for this release or replace them with owner-provided copy.
4. Confirm print benefits in Services can be fulfilled; separately confirm shop readiness before relying on its public link.
5. Reconcile outdated README, inspect exact release diff, include required portrait/event derivatives, and exclude unused Aero experiment assets.
6. Ask owner to approve exact release. Only then publish and verify public pages and media.

## Pending / deferred

- Kaua: source photographs not supplied; do not fabricate fifth portrait project.
- About: introduction, personal story, creative approach remain unfinished.
- Shop: fulfillment/account readiness unverified; no on-site payments planned.
- Further archive redesign and extra motion: deferred until current work reviewed.

## Local review commands

```sh
python3 -m http.server 8766 --bind 127.0.0.1
python3 tests/check_site.py
node --test tests/home-motion.test.js
git diff --check
```

Use existing server if already running. Open `/portfolio.html?category=events` for event review and `/portfolio.html?category=portraits` for portraits.

<!-- ponytail: document current milestone only; add tooling when repeated work warrants it. -->
