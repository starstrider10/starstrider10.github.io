/* ponytail: one native dialog and one shared catalog; no router or animation library. */
(() => {
  const home = document.getElementById('exhibition');
  const projects = document.getElementById('portfolio-projects');
  const motionControl = document.getElementById(home ? 'motion-toggle' : 'film-motion-toggle');
  const reduce = matchMedia('(prefers-reduced-motion: reduce)');
  const mobile = matchMedia('(max-width: 767px)');
  const esc = value => String(value || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const lookup = id => portfolioProjects.find(p => p.id === id);
  const selection = homeSelection.map(item => ({project: lookup(item.project), index: item.image || 0}));
  const imageTag = (image, sizes, lazy = false) => {
    let set = '';
    if (image.src.includes('res.cloudinary.com')) {
      set = [480, 960, 1600].map(w => `${image.src.replace(/w_\d+/, `w_${w}`)} ${w}w`).join(', ');
    } else if (image.src.endsWith('-1440.webp')) {
      set = [480, 960, 1440].map(w => `${image.src.replace('-1440.webp', `-${w}.webp`)} ${w}w`).join(', ');
    }
    return `<img src="${esc(image.src)}" ${set ? `srcset="${esc(set)}" sizes="${sizes}"` : ''} width="${image.width || 1600}" height="${image.height || 1067}" alt="${esc(image.alt)}" decoding="async" ${lazy ? 'loading="lazy"' : ''}>`;
  };
  const poster = p => p.video?.poster || p.preview?.poster || (p.youtube ? `https://i.ytimg.com/vi/${p.youtube}/hqdefault.jpg` : '');
  const isFilm = p => p.category === 'content';
  function tile(p, index = 0, lazy = true) {
    const image = (!home && p.cover) || p.images[index];
    const format = p.video || p.preview;
    const preview = p.video?.preview || p.preview?.src;
    const ratio = image ? (image.width || 1600) / (image.height || 1067) : (format?.width || 16) / (format?.height || 9);
    const media = image ? imageTag(image, home ? '(max-width:767px) 80vw, 34vw' : '(max-width:767px) 45vw, 30vw', lazy)
      : preview ? `<video data-preview="${esc(preview)}" poster="${esc(poster(p))}" width="${format.width}" height="${format.height}" muted playsinline loop preload="none" aria-hidden="true"></video>`
      : imageTag({src: poster(p), alt: '', width: p.video?.width || 480, height: p.video?.height || 360}, '35vw', lazy);
    return `<button type="button" class="exhibit-tile" data-project="${p.id}" data-image="${index}" style="--frame-ratio:${ratio}" aria-haspopup="dialog" aria-expanded="false" aria-label="${esc(isFilm(p) ? `Play ${p.title}` : `Open ${home ? image.alt : p.title}`)}">${media}${isFilm(p) ? '<span class="film-symbol" aria-hidden="true">▶</span>' : ''}</button>`;
  }
  const dialog = document.createElement('dialog');
  dialog.className = 'exhibit-dialog';
  dialog.setAttribute('aria-labelledby', 'viewer-title');
  dialog.innerHTML = `<header><h2 id="viewer-title"></h2><button type="button" data-close autofocus>Close ×</button></header><div class="viewer-body" tabindex="0" role="region" aria-label="Project media"></div><footer></footer>`;
  document.body.append(dialog);
  const body = dialog.querySelector('.viewer-body');
  const footer = dialog.querySelector('footer');
  const close = dialog.querySelector('[data-close]');
  let opener, current, frame = 0, story = false, savedScroll = 0;
  let animations = [];
  function clearReveal() {
    animations.forEach(animation => animation.cancel());
    animations = [];
  }
  // ponytail: fly each photo from the same clicked frame into its own grid position.
  function flyOpen(origin, source) {
    if (reduce.matches) return;
    const originIndex = current.sequence && (home || !current.cover) ? current.sequence.indexOf(frame) : frame;
    body.querySelectorAll('img, video').forEach((image, index) => {
      const target = image.getBoundingClientRect();
      if (!image.animate || !target.width || !target.height) return;
      if (index === originIndex && source && image.tagName === 'IMG') image.style.background = `center / contain no-repeat url(${JSON.stringify(source)})`;
      const scale = Math.min(origin.width / target.width, origin.height / target.height);
      const x = origin.left + origin.width / 2 - target.left - target.width / 2;
      const y = origin.top + origin.height / 2 - target.top - target.height / 2;
      animations.push(image.animate([
        {transform: `translate(${x}px, ${y}px) scale(${scale})`, opacity: index === originIndex ? 1 : 0},
        {transform: 'none', opacity: 1}
      ], {duration: 520, delay: index === originIndex ? 0 : 35 + index * 28, easing: 'cubic-bezier(.2,.72,.25,1)', fill: 'backwards'}));
    });
  }
  let manualPause = false, touchPause = false, focusPause = false;
  let introPlaying = false;
  const previews = new Map();
  const blocked = new WeakSet();
  function stopPreviews() { previews.forEach((_, video) => video.pause()); }
  function updatePreviews() {
    if (reduce.matches || introPlaying || manualPause || document.hidden || dialog.open) {
      stopPreviews();
      return;
    }
    // ponytail: play visible previews only; Home keeps a single moving film.
    const visible = [...previews].filter(([video, seen]) => seen && !blocked.has(video) && !video.closest('[hidden]'));
    const playing = new Set((home ? visible.slice(0, 1) : visible).map(([video]) => video));
    previews.forEach((_, video) => {
      if (!playing.has(video)) { video.pause(); return; }
      if (!video.paused) return;
      if (!video.hasAttribute('src')) video.src = video.dataset.preview;
      video.play().catch(error => {
        if (error.name === 'AbortError') return;
        blocked.add(video);
        video.removeAttribute('src');
        video.load();
        if (home) updatePreviews();
      });
    });
  }
  function observePreviews() {
    if (!('IntersectionObserver' in window)) return;
    const threshold = home ? .6 : .25;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => previews.set(entry.target, entry.intersectionRatio >= threshold));
      updatePreviews();
    }, {threshold: [0, threshold]});
    document.querySelectorAll('[data-preview]').forEach(video => {
      video.muted = true;
      previews.set(video, false);
      observer.observe(video);
    });
  }
  function stopFullFilm() { body.querySelectorAll('video').forEach(v => { v.pause(); v.removeAttribute('src'); v.load(); }); }
  function paintViewer() {
    stopFullFilm(); clearReveal();
    const title = dialog.querySelector('h2');
    title.textContent = current.title;
    title.classList.toggle('visually-hidden', story && !current.sequence);
    body.classList.toggle('viewer-story', story);
    body.classList.toggle('viewer-mixed', Boolean(story && current.sequence));
    dialog.classList.toggle('has-story-background', Boolean(story && current.background));
    if (story && current.background) dialog.style.setProperty('--story-background', `url(${JSON.stringify(current.background)})`);
    else dialog.style.removeProperty('--story-background');
    body.replaceChildren(); footer.replaceChildren();
    if (isFilm(current)) {
      if (current.video) {
        const video = document.createElement('video');
        video.controls = true; video.playsInline = true; video.preload = 'none';
        video.poster = current.video.poster; video.src = current.video.src;
        video.setAttribute('aria-label', current.title);
        if (current.video.captions) {
          const track = document.createElement('track'); Object.assign(track, {kind: 'captions', src: current.video.captions, srclang: 'en', label: 'English', default: true}); video.append(track);
        }
        body.append(video); video.play().catch(() => {});
        video.addEventListener('error', () => { const p = document.createElement('p'); p.textContent = 'Video unavailable. Use original link below.'; body.append(p); }, {once: true});
      } else {
        body.innerHTML = `<div class="viewer-external">${imageTag({src: poster(current), alt: `Preview of ${current.title}`, width: 480, height: 360}, '80vw')}<a href="https://www.youtube.com/watch?v=${esc(current.youtube)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div>`;
      }
      if (current.instagramUrl) footer.innerHTML = `<a href="${esc(current.instagramUrl)}" target="_blank" rel="noopener noreferrer">Watch on Instagram ↗</a>`;
    } else if (story) {
      // ponytail: numbers reference existing stills in the ordered media sequence.
      body.innerHTML = (current.sequence || current.images).map((item, i) => {
        if (item.clip) return `<video controls playsinline preload="none" src="${esc(item.clip)}" poster="${esc(item.poster)}" width="1280" height="720" aria-label="${esc(item.label)}"></video>`;
        return imageTag(typeof item === 'number' ? current.images[item] : item, current.sequence ? '(max-width:767px) 90vw, 44vw' : '(max-width:767px) 90vw, 32vw', i >= 3);
      }).join('');
      body.querySelectorAll('video').forEach(video => video.addEventListener('play', () => {
        body.querySelectorAll('video').forEach(other => { if (other !== video) other.pause(); });
      }));
      if (current.link) footer.innerHTML = `<a href="${esc(current.link)}">${esc(current.linkLabel || 'Archive')} ↗</a>`;
    } else {
      body.innerHTML = imageTag(current.images[frame], '90vw');
      footer.innerHTML = '<button type="button" data-prev aria-label="Previous photograph">← Previous</button><button type="button" data-next aria-label="Next photograph">Next →</button>';
      if (current.images.length > 1) footer.innerHTML += '<button type="button" data-story>Open photo story ↗</button>';
      footer.querySelector('[data-prev]').onclick = () => step(-1);
      footer.querySelector('[data-next]').onclick = () => step(1);
      footer.querySelector('[data-story]')?.addEventListener('click', () => {
        const image = body.querySelector('img');
        const origin = image.getBoundingClientRect();
        const source = image.currentSrc;
        story = true;
        paintViewer();
        close.focus({preventScroll:true});
        dialog.scrollTop = 0;
        flyOpen(origin, source);
      });
    }
  }
  function step(direction) {
    const focused = document.activeElement?.dataset;
    if (home) {
      const photos = (mobile.matches ? selection.slice(0, 8) : selection).filter(item => !isFilm(item.project));
      const position = photos.findIndex(item => item.project === current && item.index === frame);
      const next = photos[(position + direction + photos.length) % photos.length];
      current = next.project; frame = next.index;
    } else frame = (frame + direction + current.images.length) % current.images.length;
    paintViewer();
    if (focused && 'prev' in focused) footer.querySelector('[data-prev]')?.focus();
    if (focused && 'next' in focused) footer.querySelector('[data-next]')?.focus();
  }
  function open(button) {
    opener = button; savedScroll = scrollY;
    opener.setAttribute('aria-expanded', 'true');
    current = lookup(button.dataset.project); frame = Number(button.dataset.image);
    story = !home && !isFilm(current);
    const spotlight = home && !isFilm(current);
    dialog.classList.toggle('is-spotlight', spotlight);
    const thumbnail = button.querySelector('img');
    const origin = (thumbnail || button).getBoundingClientRect();
    stopPreviews(); dialog.showModal(); paintViewer(); dialog.scrollTop = 0;
    close.focus({preventScroll:true});
    const image = body.querySelector('img');
    if (story) flyOpen(origin, thumbnail?.currentSrc);
    else if (spotlight && !reduce.matches && image?.animate) {
      if (thumbnail.currentSrc) image.style.background = `center / contain no-repeat url(${JSON.stringify(thumbnail.currentSrc)})`;
      const target = image.getBoundingClientRect();
      animations.push(image.animate([
        {transformOrigin:'top left', transform:`translate(${origin.left-target.left}px, ${origin.top-target.top}px) scale(${origin.width/target.width}, ${origin.height/target.height})`, opacity:1},
        {transformOrigin:'top left', transform:'none', opacity:1}
      ], {duration:440, easing:'cubic-bezier(.22,.61,.36,1)'}));
    } else if (!reduce.matches && body.animate) animations.push(body.animate([{opacity:0},{opacity:1}], {duration:350}));
  }
  close.onclick = () => dialog.close();
  dialog.addEventListener('close', () => {
    clearReveal(); stopFullFilm(); body.replaceChildren();
    window.scrollTo({top:savedScroll, behavior:'instant'});
    opener?.setAttribute('aria-expanded', 'false');
    opener?.focus({preventScroll:true}); updatePreviews();
  });
  dialog.addEventListener('keydown', event => {
    if (!story && !isFilm(current) && ['ArrowLeft','ArrowRight'].includes(event.key)) {
      event.preventDefault(); step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
  document.addEventListener('click', event => { const button = event.target.closest('.exhibit-tile'); if (button) open(button); });
  // ponytail: media errors retain accessible button labels and original project links.
  document.addEventListener('error', event => {
    if (event.target.tagName === 'IMG') { event.target.alt ||= 'Image unavailable'; event.target.style.minHeight = '100px'; }
  }, true);

  const lanePositions = [];
  let lastTime = 0, tickID;
  function drifting() { return home && !reduce.matches && !introPlaying && !manualPause && !touchPause && !focusPause && !document.hidden && !dialog.open; }
  function tick(time) {
    if (drifting()) {
      const delta = Math.min((time-lastTime)/1000, .05);
      lanePositions.forEach((state, i) => {
        const lane = state.lane;
        const max = lane.scrollWidth - lane.clientWidth;
        if (max <= 0) return;
        state.x += delta * (i % 2 ? 12 : 16) * state.direction;
        if (state.x >= max) { state.x = max; state.direction = -1; }
        if (state.x <= 0) { state.x = 0; state.direction = 1; }
        lane.scrollLeft = state.x;
      });
    }
    lastTime = time;
    tickID = requestAnimationFrame(tick);
  }
  function renderHome() {
    document.body.classList.toggle('static-exhibition', reduce.matches);
    for (let row = 0; row < selection.length / 4; row++) {
      const lane = document.createElement('div'); lane.className = 'exhibit-lane';
      const group = selection.slice(row * 4, row * 4 + 4);
      lane.innerHTML = group.map((item, i) => tile(item.project, item.index, i >= 2)).join('');
      home.append(lane);
      const state = {lane, x: row % 2 ? Math.min(mobile.matches ? 18 : 52, lane.scrollWidth - lane.clientWidth) : 0, direction: row % 2 ? -1 : 1};
      lanePositions.push(state); lane.scrollLeft = state.x;
      lane.addEventListener('scroll', () => { if (!drifting()) state.x = lane.scrollLeft; }, {passive:true});
    }
    observePreviews();
    motionControl.hidden = reduce.matches;
  }
  // ponytail: six curated frames tied to native scroll; video clips stay muted.
  const intro = document.getElementById('exhibition-intro');
  let finishIntro;
  function playIntro() {
    if (!intro || reduce.matches || location.hash) return;
    try {
      if (sessionStorage.getItem('scroll-opening-seen')) return;
    } catch { /* Storage is optional. */ }
    const sequence = [
      {id:'the-life-i-promised', x:0, y:0},
      {id:'spring-portraits', x:-10, y:1},
      {id:'the-life-i-promised', x:11, y:-2, clip:true},
      {id:'isabella', x:-8, y:4},
      {id:'full-moon', x:12, y:2, clip:true},
      {id:'life-outdoors', x:0, y:0}
    ];
    const stage = intro.querySelector('.intro-stage');
    const frameWall = intro.querySelector('.intro-frames');
    const credit = intro.querySelector('.intro-credit');
    const percent = intro.querySelector('.intro-percent');
    const outside = document.querySelectorAll('.exhibition-home > :is(.skip-link, .site-nav, main)');
    frameWall.innerHTML = sequence.map(({id, clip}, i) => {
      const project = lookup(id);
      const media = clip
        ? `<video data-src="${esc(project.video.preview)}" poster="${esc(poster(project))}" muted playsinline loop preload="none"></video>`
        : i === 0 ? `<img class="intro-portrait" src="${esc(poster(project))}" alt="">`
        : imageTag(project.images[0], '65vw');
      return `<div class="intro-frame${clip ? ' is-tall' : ''}">${media}</div>`;
    }).join('');
    const frames = [...frameWall.children];
    let pending = 0;
    const clamp = value => Math.max(0, Math.min(1, value));

    function paintOpening() {
      pending = 0;
      const distance = intro.offsetHeight - stage.offsetHeight;
      const progress = clamp(scrollY / Math.max(1, distance));
      const position = progress * (frames.length - 1);
      intro.style.setProperty('--progress', progress);
      percent.textContent = `${String(Math.floor(progress * 100)).padStart(2, '0')}%`;
      credit.style.opacity = String(1 - clamp(position * 1.65));
      frames.forEach((frame, index) => {
        const {x, y} = sequence[index];
        const relative = position - index;
        const opacity = relative < 0 ? clamp(1 + relative * 1.6) : clamp(1 - relative * 1.15);
        const scale = index === 0 ? .46 + clamp(relative) * .55 : .56 + clamp(relative + .45) * .56;
        frame.style.opacity = String(opacity * (index === 0 ? .48 : 1));
        frame.style.transform = `translate(${x}vw, ${y}vh) scale(${scale})`;
        const video = frame.querySelector('video');
        if (!video) return;
        if (opacity > .25 && !document.hidden) {
          if (!video.hasAttribute('src')) video.src = video.dataset.src;
          if (video.paused) video.play().catch(() => {});
        } else video.pause();
      });
      if (progress >= .998) finishIntro();
    }

    function queuePaint() {
      if (!pending) pending = requestAnimationFrame(paintOpening);
    }

    finishIntro = (instant = false) => {
      if (!introPlaying) return;
      introPlaying = false;
      window.removeEventListener('scroll', queuePaint);
      window.removeEventListener('resize', queuePaint);
      document.removeEventListener('visibilitychange', queuePaint);
      cancelAnimationFrame(pending);
      frameWall.querySelectorAll('video').forEach(video => video.pause());
      try { sessionStorage.setItem('scroll-opening-seen', '1'); } catch { /* Optional. */ }
      const moveFocus = intro.contains(document.activeElement);
      if (!instant) intro.classList.add('intro-leaving');
      intro.style.height = '0';
      if (instant) intro.hidden = true;
      else stage.addEventListener('animationend', () => { intro.hidden = true; }, {once:true});
      outside.forEach(node => { node.inert = false; });
      window.scrollTo({top:0, behavior:'instant'});
      if (moveFocus) document.querySelector('.site-brand').focus({preventScroll:true});
      updatePreviews();
    };

    introPlaying = true;
    intro.hidden = false;
    outside.forEach(node => { node.inert = true; });
    intro.querySelector('button').addEventListener('click', () => finishIntro());
    intro.addEventListener('keydown', event => { if (event.key === 'Escape') finishIntro(); });
    window.addEventListener('scroll', queuePaint, {passive:true});
    window.addEventListener('resize', queuePaint, {passive:true});
    document.addEventListener('visibilitychange', queuePaint);
    paintOpening();
  }
  if (home) {
    playIntro();
    renderHome();
    home.addEventListener('touchstart', () => { touchPause = true; }, {passive:true});
    home.addEventListener('touchend', () => { touchPause = false; }, {passive:true});
    home.addEventListener('focusin', event => {
      focusPause = event.target.matches(':focus-visible');
      if (focusPause) event.target.scrollIntoView({block:'nearest', inline:'nearest', behavior:'instant'});
    });
    home.addEventListener('focusout', event => { focusPause = home.contains(event.relatedTarget); });
    tickID = requestAnimationFrame(tick);
    home.addEventListener('touchcancel', () => { touchPause = false; }, {passive:true});
  }
  if (projects) {
    const categories = {portraits:'Portraits', events:'Events', adventures:'Adventures'};
    const card = (project, index = 0) => {
      const film = isFilm(project);
      return `<article class="project-cover${project.youtube ? ' is-wide' : ''}" ${index === 0 ? `id="${project.id}"` : ''} data-category="${film ? 'film' : project.category}">${tile(project, project.coverIndex ?? index)}</article>`;
    };
    const collections = Object.entries(categories).map(([key, label]) => {
      const works = portfolioProjects.filter(project => project.category === key);
      return `<section class="photo-collection" data-collection="${key}" aria-labelledby="title-${key}">
        <h2 class="visually-hidden" id="title-${key}">${label}</h2>
        ${works.length ? `<div class="photo-grid">${works.map(project => card(project)).join('')}</div>` : '<p>Event work coming soon.</p>'}
      </section>`;
    });
    projects.innerHTML = `<nav class="photo-subnav" aria-label="Photography collections">${Object.entries(categories).map(([key, label]) =>
      `<a href="?category=${key}" data-collection-link="${key}">${label}</a>`).join('')}</nav>
      <div class="photo-wall">${collections.join('')}</div>
      <section class="film-grid" id="short-films" aria-label="Films">${portfolioProjects.filter(isFilm).map(project => card(project)).join('')}</section>`;

    const aliases = {content:'film'};
    const filters = ['photography', 'film', ...Object.keys(categories)];
    function filter(requested, update = false) {
      const raw = requested || new URLSearchParams(location.search).get('category');
      const selected = aliases[raw] || (filters.includes(raw) ? raw : 'photography');
      const collection = selected === 'photography' ? 'portraits' : selected;
      const photo = Object.hasOwn(categories, collection);
      const tab = photo ? 'photography' : selected;
      document.body.dataset.view = tab;
      motionControl.hidden = reduce.matches || tab === 'photography';
      projects.querySelector('.photo-subnav').hidden = tab === 'film';
      projects.querySelector('#short-films').hidden = tab === 'photography';
      projects.querySelector('.photo-wall').hidden = tab === 'film';
      projects.querySelectorAll('[data-collection]').forEach(section => {
        section.hidden = tab === 'film' || section.dataset.collection !== collection;
      });
      projects.querySelectorAll('[data-collection-link]').forEach(link => {
        if (photo && link.dataset.collectionLink === collection) link.setAttribute('aria-current', 'true');
        else link.removeAttribute('aria-current');
      });
      document.querySelectorAll('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === tab)));
      const count = [...projects.querySelectorAll('.project-cover[id]')].filter(item => !item.closest('[hidden]')).length;
      document.getElementById('work-status').textContent = `${count} projects shown`;
      updatePreviews();
      if (update) {
        const url = new URL(location.href);
        url.searchParams.set('category', selected);
        url.hash = '';
        history.pushState({}, '', url);
      }
    }
    function legacy() {
      if (location.hash === '#investment' || location.hash === '#inquiry-form-section') {
        location.replace('services.html#investment');
        return;
      }
      const id = location.hash.slice(1);
      if (id === 'outdoor-portraits') {
        location.replace('gallery.html?filter=portraiture#outdoor-portraits');
        return;
      }
      const target = document.getElementById(id);
      const project = lookup(id);
      if (!target || (!project && id !== 'short-films')) return;
      if (target.closest('[hidden]')) filter(project && !isFilm(project) ? project.category : 'film');
      target.scrollIntoView({block:'start'});
    }
    document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => filter(button.dataset.filter, true));
    projects.querySelectorAll('[data-collection-link]').forEach(link => link.addEventListener('click', event => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      filter(link.dataset.collectionLink, true);
    }));
    window.addEventListener('popstate', () => { filter(); legacy(); });
    window.addEventListener('hashchange', legacy);
    filter(); observePreviews(); legacy();
  }
  if (motionControl) motionControl.onclick = () => {
    manualPause = !manualPause;
    if (home) motionControl.setAttribute('aria-pressed', String(manualPause));
    motionControl.textContent = `${manualPause ? 'Resume' : 'Pause'} ${home ? 'motion' : 'previews'}`;
    updatePreviews();
  };
  reduce.addEventListener('change', () => {
    if (reduce.matches) finishIntro?.(true);
    clearReveal(); stopPreviews();
    document.querySelectorAll('[data-preview]').forEach(v => { v.removeAttribute('src'); v.load(); });
    if (home) {
      document.body.classList.toggle('static-exhibition', reduce.matches);
      motionControl.hidden = reduce.matches;
    }
    if (projects) motionControl.hidden = reduce.matches || document.body.dataset.view === 'photography';
    updatePreviews();
  });
  document.addEventListener('visibilitychange', updatePreviews);
  window.addEventListener('pagehide', () => {
    cancelAnimationFrame(tickID); stopPreviews();
    body.querySelector('video')?.pause();
  });
  window.addEventListener('pageshow', event => {
    if (!event.persisted) return;
    if (home) tickID = requestAnimationFrame(tick);
    updatePreviews();
  });
})();
