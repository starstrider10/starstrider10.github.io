# Story of Leo — local portfolio review

This is a separate review checkout of the existing static website. Nothing has been pushed or deployed. The original checkout, Porkbun, DNS, CNAME and hosting settings are unchanged.

- Branch: `codex/portfolio-polish`
- Baseline tag: `review-base-a38a3f2`
- Original repository: `https://github.com/starstrider10/starstrider10.github.io`
- Entry point: `portfolio.html`

## Run locally

From this folder:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765/portfolio.html. Stop the server with Ctrl+C. Another port can be used if 8765 is occupied. No Node runtime or build is needed to serve the site.

## Maintain content

- `portfolio-data.js` holds the selected projects, image sources, visual notes, missing briefs and video links. It never labels personal photographs as client assignments.
- `portfolio.html` holds approved service copy, package inclusions, rates and inquiry fields.
- Owner approved the existing portrait rates/inclusions and the event rates: from $600 for up to two hours, additional coverage from $250/hour, final quote depends on scope. Short-form video remains custom-quoted.
- The supplied YouTube film has a verified title/thumbnail, but both standard and privacy-enhanced embeds reported unavailable in the test browser. It therefore uses a thumbnail link to YouTube. Set `youtubeEmbed: true` only after actual embedded playback is verified. The renderer also supports a `video` object with `src`, `poster`, and optional `captions` for cleared MP4/WebVTT files.
- Preserve the original Cloudinary asset data. The local Street addition is in `gallery-local-data.js`, loaded after the generated Cloudinary data so a sync cannot erase it.
- `sync_cloudinary.py` is the original uploader, including full-resolution master handling. It was not executed. Do not run it just to preview; it can upload files.
- Preserve original/master media separately. `assets/` contains web derivatives, not archival masters.

Journal is archived in Git at `review-before-journal-archive`; its former URL redirects home. Current navigation is Home / Portfolio / Gallery / About.

Print setup walkthrough: `../shopify-print-setup.md`. The public catalog currently exposes only a template product. Unmatched photographs use an email inquiry with clearly labeled guide estimates. No provider is connected by this work.

## Build shared utility CSS after class changes

The pinned Tailwind compiler is only a development tool. From this folder:

```sh
npm exec --cache /private/tmp/story-of-leo-npm-cache --package=tailwindcss@3.4.17 -- tailwindcss -c tailwind.config.cjs -i tailwind.input.css -o utilities.css --minify
```

Commit the resulting `utilities.css`; production does not compile Tailwind. Ordinary CSS changes in `style.css` do not require rebuilding utility CSS.

## Checks

```sh
python3 tests/check_site.py
git diff --check
```

See REVIEW.md for browser results, outstanding publication needs and hosting instructions.
