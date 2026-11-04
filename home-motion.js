/* ponytail: homepage-only native motion; visible content is the fallback. */
(() => {
  if (!document.body.classList.contains('home-cinematic')) return;
  if (!('IntersectionObserver' in window) || !Element.prototype.animate) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const touch = matchMedia('(hover: none)');
  const styles = getComputedStyle(document.documentElement);
  const token = name => parseFloat(styles.getPropertyValue(`--motion-${name}`));
  const ease = styles.getPropertyValue('--motion-ease').trim();
  const active = new Set();
  const seen = new WeakSet();
  const sections = [...document.querySelectorAll('main > section')];
  let observer;

  function enter(element, index, opening = false) {
    if (reduced.matches) return;
    const duration = token('entrance');
    const delay = Math.min(index * token('stagger'), token('section-limit') - duration);
    const distance = token(opening ? 'opening-travel' : 'section-travel') / (touch.matches ? 2 : 1);
    const horizontal = element.matches('.label');
    const animation = element.animate([
      { opacity: 0, transform: `translate${horizontal ? 'X' : 'Y'}(${horizontal ? -distance : distance}px)` },
      { opacity: 1, transform: 'translate(0, 0)' }
    ], { duration, delay: opening ? index * token('stagger') : delay, easing: ease, fill: 'backwards' });
    active.add(animation);
    animation.finished.then(() => {
      active.delete(animation);
      animation.cancel();
    }, () => active.delete(animation));
  }

  function reveal(section) {
    if (seen.has(section)) return;
    seen.add(section);
    observer?.unobserve(section);
    if (reduced.matches) return;
    section.classList.add('motion-enter');
    section.querySelectorAll('.section-label, h2:not(.section-label), blockquote, .work-caption, .archive-card h3, .archive-card p, .contact-copy')
      .forEach((element, index) => enter(element, index));
  }

  function observeSections(settleVisible = true) {
    observer = new IntersectionObserver(entries => {
      entries.forEach(entry => { if (entry.isIntersecting) reveal(entry.target); });
    }, { rootMargin: '0px 0px -15% 0px', threshold: 0 });
    sections.forEach(section => {
      // ponytail: restored/anchored content stays settled; no delayed hiding.
      if (settleVisible && section.getBoundingClientRect().top < innerHeight * .85) seen.add(section);
      if (!seen.has(section)) observer.observe(section);
    });
  }

  if (!reduced.matches) {
    if (!location.hash && scrollY === 0) {
      document.querySelectorAll('.hero-copy > .label, .hero-line, .hero-description, .hero-actions')
        .forEach((element, index) => enter(element, index, true));
    }
    observeSections(Boolean(location.hash || scrollY > 0));
  }
  reduced.addEventListener('change', () => {
    observer?.disconnect();
    active.forEach(animation => animation.cancel());
    active.clear();
    document.querySelectorAll('.motion-enter').forEach(section => section.classList.remove('motion-enter'));
    if (!reduced.matches) observeSections();
  });
  addEventListener('pagehide', () => {
    observer?.disconnect();
    active.forEach(animation => animation.cancel());
  });
  addEventListener('pageshow', event => {
    if (event.persisted && !reduced.matches) observeSections();
  });
  // Keyboard/hash navigation must never land on temporarily transparent text.
  function settle() {
    active.forEach(animation => animation.cancel());
    active.clear();
  }
  document.addEventListener('focusin', settle);
  addEventListener('hashchange', () => {
    settle();
    const section = document.getElementById(location.hash.slice(1))?.closest('main > section');
    if (section) { seen.add(section); observer?.unobserve(section); }
  });

})();
