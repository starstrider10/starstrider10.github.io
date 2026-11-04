const menuButton = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');
function closeNavigation(restoreFocus = false) {
    if (!mobileMenu) return;
    mobileMenu.hidden = true;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation');
    menuButton.textContent = 'Menu';
    if (restoreFocus) menuButton.focus();
}
if (menuButton && mobileMenu) {
    menuButton.addEventListener('click', () => {
        const open = mobileMenu.hidden;
        mobileMenu.hidden = !open;
        menuButton.setAttribute('aria-expanded', String(open));
        menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
        menuButton.textContent = open ? 'Close' : 'Menu';
        if (open) mobileMenu.querySelector('a').focus();
    });
    mobileMenu.addEventListener('click', event => { if (event.target.closest('a')) closeNavigation(); });
    matchMedia('(min-width: 768px)').addEventListener('change', event => { if (event.matches) closeNavigation(); });
}

// Shared focus management for the mobile menu and existing Gallery dialogs.
let activeDialog = null;
let lastDialogFocus = null;
const focusableSelector = 'a[href],button:not([disabled]),input,select,textarea,[tabindex="0"],summary';
const visibleControls = root => [...root.querySelectorAll(focusableSelector)].filter(el => el.getClientRects().length);
function currentDialog() {
    const album = document.getElementById('album-modal');
    if (album && !album.classList.contains('hidden')) return album;
    return null;
}
function updateDialogFocus() {
    const next = currentDialog();
    if (next === activeDialog) return;
    if (next) {
        if (!activeDialog) lastDialogFocus = document.activeElement;
        activeDialog = next;
        next.setAttribute('role', 'dialog');
        next.setAttribute('aria-modal', 'true');
        next.setAttribute('aria-label', 'Photography viewer');
        visibleControls(next)[0]?.focus();
    } else {
        activeDialog = null;
        if (lastDialogFocus?.isConnected) lastDialogFocus.focus();
        lastDialogFocus = null;
    }
}
for (const id of ['album-modal']) {
    const dialog = document.getElementById(id);
    if (dialog) new MutationObserver(updateDialogFocus).observe(dialog, { attributes: true, attributeFilter: ['class'] });
}
document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && mobileMenu && !mobileMenu.hidden) closeNavigation(true);
    if (event.key === 'Tab') {
        const root = activeDialog || (mobileMenu && !mobileMenu.hidden ? document.querySelector('.site-nav') : null);
        if (!root) return;
        const controls = visibleControls(root);
        const index = controls.indexOf(document.activeElement);
        if (!controls.length) return;
        if (event.shiftKey && index <= 0) { event.preventDefault(); controls.at(-1).focus(); }
        else if (!event.shiftKey && (index === controls.length - 1 || index === -1)) { event.preventDefault(); controls[0].focus(); }
    }
    if (event.target.matches('[role="button"][data-gallery-card]') && ['Enter', ' '].includes(event.key)) {
        event.preventDefault(); event.target.click();
    }
});
const galleryContainer = document.getElementById('gallery-container');
if (galleryContainer) {
    const accessibleCards = () => {
        galleryContainer.querySelectorAll('.cursor-pointer').forEach(card => {
            if (typeof card.onclick !== 'function' || card.closest('[data-gallery-card]')?.parentElement?.closest('[data-gallery-card]')) return;
            card.tabIndex = 0; card.setAttribute('role', 'button'); card.dataset.galleryCard = '';
            const image = card.querySelector('img');
            const title = card.querySelector('h3')?.textContent || card.textContent.trim().replace(/\s+/g, ' ').slice(0, 100) || 'View photograph';
            card.setAttribute('aria-label', title);
            if (image && !image.hasAttribute('alt')) image.alt = title;
        });
    };
    new MutationObserver(accessibleCards).observe(galleryContainer, {childList: true, subtree: true});
    accessibleCards();
}
updateDialogFocus();
// Existing icon-only controls already carry useful title strings.
document.querySelectorAll('button[title]:not([aria-label])').forEach(button => button.setAttribute('aria-label', button.title));
const previous = document.querySelector('button[onclick="prevPhoto()"]');
const next = document.querySelector('button[onclick="nextPhoto()"]');
previous?.setAttribute('aria-label', 'Previous photograph');
next?.setAttribute('aria-label', 'Next photograph');

// ponytail: one shared navigation indicator; native links remain the fallback.
(() => {
  const links = document.querySelector('.site-links');
  if (links && 'ResizeObserver' in window) {
    const indicator = document.createElement('span');
    indicator.className = 'nav-motion-indicator';
    indicator.setAttribute('aria-hidden', 'true');
    links.append(indicator);
    function select(link) {
      if (!link) return;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
    }
    const current = () => links.querySelector('a[aria-current]');
    links.querySelectorAll('a').forEach(link => {
      link.addEventListener('pointerenter', () => select(link));
      link.addEventListener('focus', () => select(link));
    });
    links.addEventListener('pointerleave', () => select(links.querySelector('a:focus-visible') || current()));
    links.addEventListener('focusout', event => {
      if (!links.contains(event.relatedTarget)) select(current());
    });
    new ResizeObserver(() => select(links.querySelector('a:focus-visible') || current())).observe(links);
    select(current());
  }
})();
