const projectContainer = document.getElementById('portfolio-projects');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function projectImage(image, index, projectIndex) {
    const src = escapeHTML(image.src);
    const cloud = image.src.includes('res.cloudinary.com');
    const local = /-1440\.webp$/.test(image.src);
    const srcset = local ? ` srcset="${src.replace('-1440.webp', '-480.webp')} 480w, ${src.replace('-1440.webp', '-960.webp')} 960w, ${src} 1440w" sizes="(max-width: 767px) 88vw, ${index === 0 || index === 6 ? '88vw' : '48vw'}"` : cloud ? ` srcset="${escapeHTML(image.src.replace(/w_\d+/, 'w_640'))} 640w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1200'))} 1200w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1800'))} 1800w" sizes="(max-width: 767px) 100vw, ${index === 0 ? '60vw' : '35vw'}"` : '';
    const dimensions = Number.isFinite(image.width) && Number.isFinite(image.height) ? ` width="${image.width}" height="${image.height}"` : '';
    return `<figure><img src="${src}"${srcset}${dimensions} alt="${escapeHTML(image.alt)}" decoding="async" ${projectIndex === 0 && index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`;
}

// Prefer a supplied Cloudinary/native file; retain publication links as fallbacks.
function projectMedia(project) {
    const title = escapeHTML(project.title);
    if (project.video?.preview) {
        const { src, preview, poster, width, height } = project.video;
        return `<div class="featured-film-media">
          <video class="featured-film-video" data-preview="${escapeHTML(preview)}" data-full-film="${escapeHTML(src)}"
            width="${width}" height="${height}" poster="${escapeHTML(poster)}"
            aria-label="${title}" muted playsinline preload="none"></video>
        </div>
        <div class="featured-film-actions">
          <button class="text-link" type="button" data-play-film>Play full film</button>
          <a class="text-link" href="${escapeHTML(project.instagramUrl)}" target="_blank" rel="noopener noreferrer">Watch on Instagram ↗</a>
        </div>`;
    }
    if (project.video) {
        const dimensions = Number.isFinite(project.video.width) && Number.isFinite(project.video.height)
            ? ` width="${project.video.width}" height="${project.video.height}"` : '';
        return `<div class="native-film"><video class="native-video ${project.format === 'vertical' ? 'vertical-video' : ''}"${dimensions} controls playsinline preload="none" poster="${escapeHTML(project.video.poster || '')}" aria-label="${title}"><source src="${escapeHTML(project.video.src)}">${project.video.captions ? `<track kind="captions" src="${escapeHTML(project.video.captions)}" srclang="en" label="English" default>` : ''}<a href="${escapeHTML(project.video.src)}">Watch ${title}</a></video>${project.compact ? '' : `<p class="film-privacy"><a href="${escapeHTML(project.video.src)}" target="_blank" rel="noopener noreferrer">Open video ↗</a></p>`}</div>`;
    }
    if (project.youtube) {
        const url = `https://www.youtube.com/watch?v=${escapeHTML(project.youtube)}`;
        const opening = project.youtubeEmbed
            ? `<button type="button" class="film-load" aria-label="Play ${title}">`
            : `<a class="film-load" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${title} on YouTube">`;
        return `<div class="film-player" ${project.youtubeEmbed ? `data-youtube="${escapeHTML(project.youtube)}" data-film-title="${title}"` : ''}>${opening}<img src="https://i.ytimg.com/vi/${escapeHTML(project.youtube)}/hqdefault.jpg" alt="Preview of ${title}" loading="lazy"><span>▶ &nbsp; ${project.youtubeEmbed ? 'Watch the film' : 'Watch the film on YouTube ↗'}</span>${project.youtubeEmbed ? '</button>' : '</a>'}</div><p class="film-privacy">${project.youtubeEmbed ? 'YouTube loads when you press play.' : 'Watch the original film on YouTube.'}</p>`;
    }
    if (project.instagramUrl) {
        return `<a class="reel-link-card" href="${escapeHTML(project.instagramUrl)}" target="_blank" rel="noopener noreferrer"><span class="reel-card-format">${escapeHTML(project.label)}</span><h3 class="reel-card-title">${title}</h3>${project.summary ? `<p>${escapeHTML(project.summary)}</p>` : ''}<span class="reel-card-action">Watch on Instagram ↗</span></a>`;
    }
    return '';
}

// ponytail: one native three-film row; no carousel or extra media player.
function shortFilmCard(project) {
    const title = escapeHTML(project.title);
    return `<article class="short-film-card" data-category="content" id="${escapeHTML(project.id)}">
      ${projectMedia(project)}<div class="short-film-caption"><h3>${title}</h3><a class="text-link" href="${escapeHTML(project.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${title} on Instagram">Instagram ↗</a></div></article>`;
}
// ponytail: one native dialog per photo story; reuse its ordered image data.
function storyImage(image, sizes, lazy = false) {
    const src = escapeHTML(image.src);
    return `<img src="${src}" srcset="${src.replace('w_1200', 'w_480')} 480w, ${src.replace('w_1200', 'w_800')} 800w, ${src} 1200w"
      sizes="${sizes}" width="${image.width}" height="${image.height}" alt="${escapeHTML(image.alt)}" decoding="async"${lazy ? ' loading="lazy"' : ''}>`;
}

function renderPhotoStory(project) {
    const id = escapeHTML(project.id);
    const title = escapeHTML(project.title);
    return `<article class="portfolio-project photo-story" data-category="${escapeHTML(project.category)}" id="${id}" aria-labelledby="${id}-title">
      <div class="photo-story-copy">
        <p class="eyebrow">${escapeHTML(project.label)}</p>
        <h3 id="${id}-title">${title}</h3>
        <p class="photo-story-summary">${escapeHTML(project.summary)}</p>
        <button class="text-link" type="button" data-open-story aria-haspopup="dialog">Open photo story ↗</button>
      </div>
      <button class="photo-story-cover" type="button" data-open-story aria-haspopup="dialog" aria-label="Open photo story: ${title}">
        ${storyImage(project.images[0], '(max-width: 767px) 90vw, 55vw')}
      </button>
      <dialog class="photo-story-dialog" aria-labelledby="${id}-gallery-title">
        <header class="photo-story-toolbar">
          <div class="photo-story-meta"><h2 id="${id}-gallery-title">${title}</h2><span class="eyebrow">${escapeHTML(project.year || '')}</span></div>
          <button class="eyebrow" type="button" data-close-story autofocus>Close <span aria-hidden="true">×</span></button>
        </header>
        <div class="photo-story-gallery" tabindex="0" role="region" aria-label="Story photographs">
          <template>${project.images.map((image, index) => `<figure>${storyImage(image, `(max-width: 767px) 90vw, ${index % 3 === 0 ? '38vw' : '30vw'}`, index >= 3)}</figure>`).join('')}</template>
        </div>
        <footer class="photo-story-footer">
          <a class="text-link photo-story-archive" href="${escapeHTML(project.link)}">${escapeHTML(project.linkLabel)} ↗</a>
          <span class="eyebrow">${project.images.length} frames</span>
        </footer>
      </dialog>
    </article>`;
}

function renderProject(project, index) {
    if (project.photoStory) return renderPhotoStory(project);
    if (project.video?.preview) {
        return `<article class="portfolio-project featured-film" id="${escapeHTML(project.id)}" data-category="${escapeHTML(project.category)}">
          <div class="featured-film-copy"><p class="eyebrow">${escapeHTML(project.label)}</p><h3>${escapeHTML(project.title)}</h3>
            <p class="photo-story-summary">${escapeHTML(project.summary)}</p></div>
          ${projectMedia(project)}
        </article>`;
    }
    if (project.instagramUrl && !project.video && !project.youtube && !project.images.length) {
        return `<article class="portfolio-project reel-feature" id="${escapeHTML(project.id)}" data-category="${escapeHTML(project.category)}">${projectMedia(project)}</article>`;
    }
    return `<article class="portfolio-project ${project.images.length ? '' : 'film-project'} ${project.imageLayout ? escapeHTML(project.imageLayout) : ''} ${project.compact ? 'compact-project' : ''}" data-category="${escapeHTML(project.category)}" id="${escapeHTML(project.id)}">
      ${project.images.length ? `<div class="project-images images-${project.images.length}">${project.images.map((image, i) => projectImage(image, i, index)).join('')}</div>` : ''}
      ${projectMedia(project)}
      <div class="project-caption"><div><p class="eyebrow">${escapeHTML(project.label)}</p><h3>${escapeHTML(project.title)}</h3></div>
      ${project.compact ? '' : `<div class="project-copy"><p>${escapeHTML(project.summary)}</p><details><summary>Creative notes &amp; project context</summary><dl><dt>Approach</dt><dd>${escapeHTML(project.approach)}</dd>${project.delivery ? `<dt>Deliverables</dt><dd>${escapeHTML(project.delivery)}</dd>` : ''}</dl></details>${project.link ? `<a class="text-link" href="${escapeHTML(project.link)}">${escapeHTML(project.linkLabel)} ↗</a>` : ''}</div>`}</div></article>`;
}
const verticalFilms = portfolioProjects.filter(project => project.format === 'vertical');
projectContainer.innerHTML = portfolioProjects.map((project, index) => {
    if (project.format !== 'vertical') return renderProject(project, index);
    if (project !== verticalFilms[0]) return '';
    return `<section class="short-film-selection" id="short-films" aria-labelledby="short-films-title"><h2 id="short-films-title">Short films</h2><div class="short-film-grid">${verticalFilms.map(shortFilmCard).join('')}</div></section>`;
}).join('');

const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const storyPreload = 'IntersectionObserver' in window ? new IntersectionObserver(entries => {
    for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        warmStory(entry.target);
    }
}, {rootMargin: '240px 0px'}) : null;

// ponytail: warm only the nearby story; native lazy loading handles later frames.
function warmStory(story) {
    storyPreload?.unobserve(story);
    const template = story.querySelector('template');
    if (template) template.replaceWith(template.content.cloneNode(true));
}

projectContainer.querySelectorAll('.photo-story').forEach(story => {
    const dialog = story.querySelector('dialog');
    const close = dialog.querySelector('[data-close-story]');
    let opener;
    let opening;
    storyPreload?.observe(story);
    story.addEventListener('pointerenter', () => warmStory(story), {once: true});
    story.addEventListener('focusin', () => warmStory(story), {once: true});
    story.querySelectorAll('[data-open-story]').forEach(button => button.addEventListener('click', () => {
        opener = button;
        warmStory(story);
        dialog.showModal();
        dialog.scrollTop = 0;
        close.focus({preventScroll: true});
        if (!reducedMotion.matches) {
            opening = dialog.animate?.([{opacity: 0}, {opacity: 1}], {
                duration: 500, easing: 'cubic-bezier(.22,.61,.36,1)'
            });
        }
    }));
    close.addEventListener('click', () => dialog.close());
    dialog.addEventListener('close', () => {
        opening?.cancel();
        opener?.focus({preventScroll: true});
    });
});

const filters = document.querySelectorAll('[data-filter]');
const allowedCategories = ['all', 'portraits', 'events', 'content'];
function filterPortfolio(category, updateURL = true) {
    if (!allowedCategories.includes(category)) category = 'all';
    document.querySelectorAll('[data-category]').forEach(project => {
        project.hidden = category !== 'all' && project.dataset.category !== category;
        if (project.hidden) project.querySelectorAll('video').forEach(video => video.pause());
    });
    document.getElementById('short-films').hidden = !['all', 'content'].includes(category);
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const count = [...document.querySelectorAll('[data-category]')].filter(project => !project.hidden).length;
    document.getElementById('work-status').textContent = `${count} ${count === 1 ? 'selection' : 'selections'} shown.`;
    projectContainer.dispatchEvent(new Event('portfolio-filtered'));
    if (updateURL) {
        const url = new URL(location.href);
        if (category === 'all') url.searchParams.delete('category');
        else url.searchParams.set('category', category);
        history.pushState({}, '', url);
    }
}
filters.forEach(button => button.addEventListener('click', () => filterPortfolio(button.dataset.filter)));
window.addEventListener('popstate', () => filterPortfolio(new URLSearchParams(location.search).get('category') || 'all', false));
filterPortfolio(new URLSearchParams(location.search).get('category') || 'all', false);

const portfolioVideos = document.querySelectorAll('#portfolio-projects video');
portfolioVideos.forEach(video => video.addEventListener('play', () => {
    if (video.dataset.preview && !video.controls) return;
    portfolioVideos.forEach(other => { if (other !== video) other.pause(); });
}));

// ponytail: swap sources on the same native player after an explicit click.
const featuredFilm = projectContainer.querySelector('.featured-film');
if (featuredFilm) {
    const player = featuredFilm.querySelector('video');
    const playFull = featuredFilm.querySelector('[data-play-film]');
    let mostlyVisible = false;
    let previewBlocked = false;

    function updatePreview() {
        if (player.controls) return;
        if (reducedMotion.matches || previewBlocked) {
            if (player.hasAttribute('src')) {
                player.removeAttribute('src');
                player.load();
            }
            return;
        }
        const otherPlaying = [...portfolioVideos].some(video => video !== player && !video.paused && !video.ended);
        if (!mostlyVisible || featuredFilm.hidden || document.hidden || otherPlaying) {
            player.pause();
            return;
        }
        if (!player.hasAttribute('src')) player.src = player.dataset.preview;
        if (player.ended || !player.paused) return;
        player.play().catch(error => {
            if (player.controls || error.name === 'AbortError') return;
            previewBlocked = true;
            updatePreview();
        });
    }

    const observer = 'IntersectionObserver' in window ? new IntersectionObserver(([entry]) => {
        mostlyVisible = entry.intersectionRatio >= .6;
        updatePreview();
    }, {threshold: .6}) : null;
    observer?.observe(player);
    reducedMotion.addEventListener('change', updatePreview);
    document.addEventListener('visibilitychange', updatePreview);
    projectContainer.addEventListener('portfolio-filtered', updatePreview);
    portfolioVideos.forEach(video => {
        if (video !== player) {
            video.addEventListener('pause', updatePreview);
            video.addEventListener('ended', updatePreview);
        }
    });

    playFull.addEventListener('click', () => {
        if (!player.controls) {
            observer?.disconnect();
            player.controls = true;
            player.muted = false;
            player.src = player.dataset.fullFilm;
        }
        player.play().then(() => {
            if (document.activeElement === playFull) player.focus({preventScroll: true});
        }).catch(() => {
            // Native controls and the Instagram link remain available.
        });
    });
}

// Load third-party video only after the visitor chooses playback.
document.querySelectorAll('[data-youtube]').forEach(player => player.querySelector('button').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${player.dataset.youtube}?autoplay=1`;
    iframe.title = player.dataset.filmTitle;
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(iframe);
}));
