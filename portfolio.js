const projectContainer = document.getElementById('portfolio-projects');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function projectImage(image, index, projectIndex) {
    const src = escapeHTML(image.src);
    const cloud = image.src.includes('res.cloudinary.com');
    const local = /-1440\.webp$/.test(image.src);
    const srcset = local ? ` srcset="${src.replace('-1440.webp', '-480.webp')} 480w, ${src.replace('-1440.webp', '-960.webp')} 960w, ${src} 1440w" sizes="(max-width: 767px) 88vw, 32vw"` : cloud ? ` srcset="${escapeHTML(image.src.replace(/w_\d+/, 'w_640'))} 640w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1200'))} 1200w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1800'))} 1800w" sizes="(max-width: 767px) 100vw, ${index === 0 ? '60vw' : '35vw'}"` : '';
    return `<figure><img src="${src}"${srcset} alt="${escapeHTML(image.alt)}" decoding="async" ${projectIndex === 0 && index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`;
}

// Prefer a supplied Cloudinary/native file; retain publication links as fallbacks.
function projectMedia(project) {
    const title = escapeHTML(project.title);
    if (project.video) {
        const dimensions = Number.isFinite(project.video.width) && Number.isFinite(project.video.height)
            ? ` width="${project.video.width}" height="${project.video.height}"` : '';
        return `<div class="native-film"><video class="native-video ${project.format === 'vertical' ? 'vertical-video' : ''}"${dimensions} controls playsinline preload="none" poster="${escapeHTML(project.video.poster || '')}" aria-label="${title}"><source src="${escapeHTML(project.video.src)}">${project.video.captions ? `<track kind="captions" src="${escapeHTML(project.video.captions)}" srclang="en" label="English" default>` : ''}<a href="${escapeHTML(project.video.src)}">Watch ${title}</a></video><p class="film-privacy"><a href="${escapeHTML(project.video.src)}" target="_blank" rel="noopener noreferrer">Open video ↗</a></p></div>`;
    }
    if (project.youtube) {
        const url = `https://www.youtube.com/watch?v=${escapeHTML(project.youtube)}`;
        const opening = project.youtubeEmbed
            ? `<button type="button" class="film-load" aria-label="Play ${title}">`
            : `<a class="film-load" href="${url}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${title} on YouTube">`;
        return `<div class="film-player" ${project.youtubeEmbed ? `data-youtube="${escapeHTML(project.youtube)}" data-film-title="${title}"` : ''}>${opening}<img src="https://i.ytimg.com/vi/${escapeHTML(project.youtube)}/hqdefault.jpg" alt="Preview of ${title}" loading="lazy"><span>▶ &nbsp; ${project.youtubeEmbed ? 'Watch the film' : 'Watch the film on YouTube ↗'}</span>${project.youtubeEmbed ? '</button>' : '</a>'}</div><p class="film-privacy">${project.youtubeEmbed ? 'YouTube loads when you press play.' : 'Watch the original film on YouTube.'}</p>`;
    }
    if (project.instagramUrl) {
        return `<a class="reel-link-card" href="${escapeHTML(project.instagramUrl)}" target="_blank" rel="noopener noreferrer" aria-label="Watch ${title} on Instagram"><span class="reel-card-format">Vertical film / Instagram Reel</span><span class="reel-card-title">${title}</span><span class="reel-card-action">Watch on Instagram ↗</span></a>`;
    }
    return '';
}

projectContainer.innerHTML = portfolioProjects.map((project, index) => `
  <article class="portfolio-project ${project.images.length ? '' : 'film-project'} ${project.format === 'vertical' ? 'reel-project' : ''} ${project.imageLayout ? escapeHTML(project.imageLayout) : ''}" data-category="${escapeHTML(project.category)}" id="${escapeHTML(project.id)}">
    ${project.images.length ? `<div class="project-images images-${project.images.length}">${project.images.map((image, i) => projectImage(image, i, index)).join('')}</div>` : ''}
    ${projectMedia(project)}
    <div class="project-caption"><div><p class="eyebrow">${escapeHTML(project.label)}</p><h3>${escapeHTML(project.title)}</h3>${project.titleNote ? `<p class="project-title-note">${escapeHTML(project.titleNote)}</p>` : ''}</div><div class="project-copy"><p>${escapeHTML(project.summary)}</p>${project.credits ? `<p class="project-credits"><span>Leo Fan</span>${project.credits.map(escapeHTML).join(' · ')}</p>` : ''}<details><summary>Creative notes &amp; project context</summary><dl><dt>Approach</dt><dd>${escapeHTML(project.approach)}</dd>${project.delivery ? `<dt>Deliverables</dt><dd>${escapeHTML(project.delivery)}</dd>` : ''}</dl></details>${project.link ? `<a class="text-link" href="${escapeHTML(project.link)}" ${project.link.startsWith('https:') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(project.linkLabel)} ↗</a>` : ''}</div></div>
  </article>`).join('');

const filters = document.querySelectorAll('[data-filter]');
const allowedCategories = ['all', 'portraits', 'events', 'content'];
function filterPortfolio(category, updateURL = true) {
    if (!allowedCategories.includes(category)) category = 'all';
    document.querySelectorAll('[data-category]').forEach(project => {
        project.hidden = category !== 'all' && project.dataset.category !== category;
        if (project.hidden) project.querySelectorAll('video').forEach(video => video.pause());
    });
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    const count = [...document.querySelectorAll('[data-category]')].filter(project => !project.hidden).length;
    document.getElementById('work-status').textContent = `${count} ${count === 1 ? 'selection' : 'selections'} shown.`;
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
    portfolioVideos.forEach(other => { if (other !== video) other.pause(); });
}));

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
