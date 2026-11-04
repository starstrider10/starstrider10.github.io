# Portfolio media and updates

## Current storage

- Original films remain on the T7 Shield: `done2026 video/11/rest vs rot.mp4` and `done2026 video/2/full moon.mp4`. Neither original was modified.
- New website-ready copies live in `assets/video/rest-vs-rot.mp4` and `assets/video/full-moon.mp4` inside this repository. Local preview serves these files directly. They have not been uploaded to Cloudinary or published.
- Made of Stars continues to stream from the existing Cloudinary delivery URL in `portfolio-data.js`. Its poster is local in `assets/made-of-stars-poster.jpg`.
- The removed music-video promo is no longer in the visible selection. The original one-minute YouTube film and full music video remain separate linked pieces.
- New portrait originals remain in the supplied `storyofleo.com photos/1. portfolio/environmental portraits` folder. Responsive WebP copies live in this site's `assets/` folder; existing Kyle asset is reused.

## Compression completed

| Film | Original | Website copy | Format |
| --- | ---: | ---: | --- |
| Rest vs Rot | 231.4 MB | 13.0 MB | 720 × 1280 H.264 + AAC, original frame rate |
| Full Moon | 57.8 MB | 2.4 MB | 720 × 1280 H.264 + AAC, original frame rate |

Both copies use CRF 23, yuv420p, 128 kbps AAC and fast-start MP4 metadata. Video and audio are retained, with no crop, grading, watermark or narrative changes. Outputs fully decoded without reported errors; MP4 metadata precedes media data. This is a web delivery copy, not an archival replacement.

You can provide originals; compression can be handled here. Keep original exports for future revisions. For production delivery, use the existing Cloudinary workflow: upload these two compressed copies, copy each original delivery URL, then replace the corresponding `video.src` in `portfolio-data.js`. Uploading alone does not change the website. No new host/account is needed for this draft. Current account quotas were not checked or changed.

## Updating the selection

`portfolio-data.js` holds the curated selection. Each project has a stable `id`, filter `category`, title, images or video, and optional publication link. `compact: true` keeps long notes and credits out of the rendered layout. Credits already confirmed remain in content metadata; no roles were invented for new entries.

Entries with `format: "vertical"` form the Short films row. Current selection: Rest vs Rot, Full Moon and Made of Stars. Each uses a native controlled player, `playsinline`, `preload="none"`, a poster and an Instagram link. Only one native video plays at a time; filtering it away pauses it. Three columns on desktop, one column on mobile.

Image records include `src`, descriptive `alt`, `width` and `height`; local WebP images use 480px/960px/1440px siblings for responsive delivery. Original aspect ratios are preserved. `imageLayout: "environmental-sequence"` defines the current seven-image editorial sequence: wide window-light portrait; Kyle with wider/closer lakeside portraits; meadow and autumn portraits; forest self-portrait. Names of unidentified subjects are not inferred.

Seven supplied images cover this sequence, so no public placeholder photographs were added. Future images can replace or extend the content records; update the focused layout if the sequence structure changes. Delivery ratios and suggested curation ratios remain flexible private guidance, not public guarantees or automatic quotas.

## Design scope and philosophy

Existing strengths: cinematic coastal hero, shared raspberry tokens, accessible navigation, native film players, responsive images, working filters and compact approved packages.

Home now pairs a closer portrait with a wider environmental image. Work preserves classic portraits first, then shows environmental storytelling through varied image scale and natural framing. Short films are media-first, with titles/social links instead of long credit/context panels. Gallery remains the broader personal/experimental archive with its collections, drifting archive and viewer. Portrait inquiry continues through the existing package guide and email, with classic portraits preceding environmental work in the Portraits filter. No duplicate Portraits service page, new pricing, testimonials or percentage promises were added.

## Validation and review

10 site checks plus 4 motion lifecycle checks pass; JavaScript syntax and diff whitespace checks pass. Source media was probed before conversion; both outputs are H.264/AAC, 720 × 1280, and fully decode. Browser playback progressed for both compressed files, with no media errors; switching players pauses the previous player and filtering away pauses all native players. Desktop 1440px, mobile 390px and narrow 320px reviewed without horizontal overflow. All seven environmental photos load with natural aspect ratios and contain fitting. Existing full-film YouTube destinations remain thumbnail/link fallbacks. No complete human listening review or production delivery test performed.

Screenshots in `outputs/homepage-redesign/`: `short-films-three-desktop.jpg`, `short-films-three-mobile.jpg`, `environmental-portraits-kyle-desktop.jpg`, `environmental-portraits-mobile.jpg` and `home-classic-environmental-desktop.jpg`.

Review: http://127.0.0.1:8766/portfolio.html?category=content#short-films

No upload, push, account change or deployment.
