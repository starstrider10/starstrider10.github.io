const projectContainer = document.getElementById('portfolio-projects');
const escapeHTML = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

function projectImage(image, index, projectIndex) {
    const src = escapeHTML(image.src);
    const cloud = image.src.includes('res.cloudinary.com');
    const local = /-1440\.webp$/.test(image.src);
    const srcset = local ? ` srcset="${src.replace('-1440.webp', '-480.webp')} 480w, ${src.replace('-1440.webp', '-960.webp')} 960w, ${src} 1440w" sizes="(max-width: 767px) 88vw, 32vw"` : cloud ? ` srcset="${escapeHTML(image.src.replace(/w_\d+/, 'w_640'))} 640w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1200'))} 1200w, ${escapeHTML(image.src.replace(/w_\d+/, 'w_1800'))} 1800w" sizes="(max-width: 767px) 100vw, ${index === 0 ? '60vw' : '35vw'}"` : '';
    return `<figure><img src="${src}"${srcset} alt="${escapeHTML(image.alt)}" decoding="async" ${projectIndex === 0 && index === 0 ? 'fetchpriority="high"' : 'loading="lazy"'}></figure>`;
}

projectContainer.innerHTML = portfolioProjects.map((project, index) => `
  <article class="portfolio-project ${project.images.length ? '' : 'film-project'}" data-category="${escapeHTML(project.category)}" id="${escapeHTML(project.id)}">
    ${project.images.length ? `<div class="project-images images-${project.images.length}">${project.images.map((image, i) => projectImage(image, i, index)).join('')}</div>` : ''}
    ${project.youtube ? `<div class="film-player" ${project.youtubeEmbed ? `data-youtube="${escapeHTML(project.youtube)}"` : ''}>${project.youtubeEmbed ? `<button type="button" class="film-load" aria-label="Play Leo’s one-minute personal film">` : `<a class="film-load" href="https://www.youtube.com/watch?v=${escapeHTML(project.youtube)}" target="_blank" rel="noopener noreferrer" aria-label="Watch Leo’s one-minute personal film on YouTube">`}<img src="https://i.ytimg.com/vi/${escapeHTML(project.youtube)}/hqdefault.jpg" alt="Preview of Leo’s personal short film" loading="lazy"><span>▶ &nbsp; ${project.youtubeEmbed ? 'Watch the one-minute film' : 'Watch the film on YouTube ↗'}</span>${project.youtubeEmbed ? '</button>' : '</a>'}</div><p class="film-privacy">${project.youtubeEmbed ? 'YouTube loads when you press play.' : 'Watch the original film on YouTube.'}</p>` : ''}
    ${project.video ? `<video controls preload="none" poster="${escapeHTML(project.video.poster || '')}" aria-label="${escapeHTML(project.title)}"><source src="${escapeHTML(project.video.src)}">${project.video.captions ? `<track kind="captions" src="${escapeHTML(project.video.captions)}" srclang="en" label="English" default>` : ''}<a href="${escapeHTML(project.video.src)}">Watch this film</a></video>` : ''}
    <div class="project-caption"><div><p class="eyebrow">${escapeHTML(project.label)}</p><h3>${escapeHTML(project.title)}</h3></div><div class="project-copy"><p>${escapeHTML(project.summary)}</p><details><summary>Creative notes &amp; project context</summary><dl><dt>Approach</dt><dd>${escapeHTML(project.approach)}</dd><dt>Deliverables</dt><dd>${escapeHTML(project.delivery)}</dd></dl></details>${project.link ? `<a class="text-link" href="${escapeHTML(project.link)}" ${project.link.startsWith('https:') ? 'target="_blank" rel="noopener noreferrer"' : ''}>${escapeHTML(project.linkLabel)} ↗</a>` : ''}${project.note ? `<p class="draft-note">${escapeHTML(project.note)}</p>` : ''}</div></div>
  </article>`).join('');

const filters = document.querySelectorAll('[data-filter]');
const allowedCategories = ['all', 'portraits', 'events', 'content'];
function filterPortfolio(category, updateURL = true) {
    if (!allowedCategories.includes(category)) category = 'all';
    document.querySelectorAll('[data-category]').forEach(project => {
        project.hidden = category !== 'all' && project.dataset.category !== category;
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

document.querySelectorAll('[data-package]').forEach(button => button.addEventListener('click', () => {
    const select = document.getElementById('package-select');
    select.value = button.dataset.package;
    document.getElementById('inquiry-form-section').scrollIntoView({behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'});
    select.focus({preventScroll: true});
}));

document.getElementById('inquiry-form').addEventListener('submit', event => {
    event.preventDefault();
    const value = id => document.getElementById(id).value.trim();
    const subject = `Story of Leo inquiry: ${value('package-select')} — ${value('client-name')}`;
    const body = `Hi Leo,\n\nI’d like to discuss a project.\n\nService: ${value('package-select')}\nDate / month: ${value('target-date')}\nLocation / setting: ${value('location-vibe')}\nName: ${value('client-name')}\nEmail: ${value('client-email')}\n\nStory, scope and usage:\n${value('client-notes') || 'To discuss'}\n\nThank you!`;
    document.getElementById('inquiry-draft').textContent = `Subject: ${subject}\n\n${body}`;
    document.getElementById('inquiry-email-link').href = `mailto:hello@storyofleo.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    document.getElementById('inquiry-preview').hidden = false;
    document.getElementById('inquiry-preview').scrollIntoView({block: 'nearest'});
});
// Avoid showing a stale draft after editing its input.
document.getElementById('inquiry-form').addEventListener('input', () => { document.getElementById('inquiry-preview').hidden = true; });

// Load third-party video only after the visitor chooses playback.
document.querySelectorAll('[data-youtube]').forEach(player => player.querySelector('button').addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube.com/embed/${player.dataset.youtube}?autoplay=1`;
    iframe.title = 'Leo Fan — personal short film';
    iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = 'strict-origin-when-cross-origin';
    player.replaceChildren(iframe);
}));
