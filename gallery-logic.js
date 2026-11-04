const strategies = {
    'all': 'Viewing the full archive. Fine art nature photography, environmental portraiture, and wilderness documentation.',
    'portraiture': 'Portraiture & Outdoor Lifestyle: Focusing on authentic human connection, atmospheric light, and natural character.',
    'sakura': 'Sakura Series: Fine art seasonal portraiture capturing the fleeting beauty of spring in natural light.',
    'adventure': 'Outdoor & Fine Art: Alpine landscapes, wilderness expanses, and quiet moments in the backcountry.',
    'backpacking': 'Backpacking: Visual stories from deep trails, self-reliance, and mountain solitude.',
    'outdoors': 'Outdoors: Curated fine art imagery emphasizing mountain mist, natural textures, and open horizons.',
    'street': 'Street & Urban: Geometric compositions and shadow studies capturing urban geometry and daily life.',
    'prints': 'Selected photographs across alpine landscapes, ocean mist, iconic cityscapes, and wildlife.',
    'prints:alpine': 'Alpine & Wilderness Photographs: Grand mountain vistas, peak reflections, and misty coastlines.',
    'prints:urban': 'Urban & Skyline Photographs: Iconic cityscapes, atmospheric fog, and architectural geometry.',
    'prints:wildlife': 'Wildlife & Nature Photographs: Marine sea turtles, monochrome wildlife portraits, and atmospheric night scenes.',
    'prints:travel': 'Travel & Wanderlust Story Prints: Atmospheric train tracks, floating night lanterns, fire art, and wanderlust travel moments.'
};

let currentAlbum = [];
let currentIndex = 0;
let currentModel = "";
let slideshowInterval = null;
let isSlideshowActive = false;
let archiveMotionPaused = false;
const galleryMotionPreference = matchMedia('(prefers-reduced-motion: reduce)');
const archiveMotionButton = document.getElementById('archive-motion-toggle');
// ponytail: retain drifting archive, with an explicit pause control.
archiveMotionButton.addEventListener('click', () => {
    archiveMotionPaused = !archiveMotionPaused;
    document.querySelectorAll('#floating-archive > div').forEach(item => {
        if (archiveMotionPaused) item._tl?.pause();
        else if (item.style.zIndex !== '2000') item._tl?.play();
    });
    archiveMotionButton.setAttribute('aria-pressed', String(archiveMotionPaused));
    archiveMotionButton.textContent = archiveMotionPaused ? 'Resume archive motion' : 'Pause archive motion';
});
galleryMotionPreference.addEventListener('change', () => {
    const container = document.getElementById('gallery-container');
    const restoreFocus = container.contains(document.activeElement);
    renderGallery(document.getElementById('gallery-category').value);
    if (restoreFocus) document.getElementById('gallery-category').focus();
});

// Helper to optimize Cloudinary URLs on the fly
function optimizeUrl(url, width = 1000) {
    if (!url.includes('cloudinary.com')) return url;
    if (url.includes('upload/')) {
        return url.replace('upload/', `upload/q_auto,f_auto,w_${width}/`);
    }
    return url;
}

function renderGallery(category = 'all') {
    try {
        const container = document.getElementById('gallery-container');
        container.querySelectorAll('*').forEach(item => item._tl?.kill());
        gsap.killTweensOf(container.querySelectorAll('*'));
        container.innerHTML = '';
        document.getElementById('gallery-status').textContent = '';
        archiveMotionButton.hidden = !['all', 'street'].includes(category) || galleryMotionPreference.matches;
        document.querySelectorAll('.gallery-filters button').forEach(button => {
            const value = button.getAttribute('onclick').match(/'([^']+)'/)[1];
            const active = value === category || (value === 'prints' && category.startsWith('prints:')) ||
                (value === 'portraiture' && category === 'sakura') || (value === 'adventure' && ['outdoors', 'backpacking'].includes(category));
            button.setAttribute('aria-pressed', String(active));
        });

        const getModelName = (id) => {
            const parts = id.split('-');
            return parts.length >= 3 ? parts[2].split('_')[0].toLowerCase() : 'unknown';
        };

        const getDisplayName = (id, folder) => {
            const parts = id.split('-');
            if (parts.length < 2) return '';
            
            // For portraits, handle the specific YYYYMMDD-LEO####-NAME structure
            if (folder === 'portraits') {
                return parts.length >= 3 ? parts[2].split('_')[0].toUpperCase() : 'PORTRAIT';
            }

            // For Adventure/Outdoors/Street, find the first descriptive segment
            let name = "";
            for (let i = 0; i < parts.length; i++) {
                const p = parts[i];
                // Skip technical segments: dates (8 digits), LEO IDs (LEO+digits), or short suffixes
                if (/^\d{4,8}$/.test(p)) continue;
                if (/^LEO\d+$/i.test(p)) continue;
                if (p === '_mt' || p === 'mt' || p.startsWith('_')) continue;
                
                name = p;
                break;
            }

            // Fallback if no descriptive name found
            if (!name) name = parts[1] || parts[0];

            // Clean up: remove random suffixes, handle camelCase, and capitalize
            name = name.split('_')[0]; 
            return name.replace(/([A-Z])/g, ' $1').trim().replace(/^\w/, c => c.toUpperCase());
        };

        if (category === 'all' || category === 'street') {
            let assets = [];
            const backpackingAssets = galleryData['adventure/backpacking'] || [];
            const outdoorsAssets = galleryData['adventure/outdoors'] || [];
            
            if (category === 'all') {
                assets = [
                    ...(galleryData.portraits || []), 
                    ...backpackingAssets,
                    ...outdoorsAssets,
                    ...(galleryData.street || [])
                ];
            } else if (category === 'street') {
                assets = galleryData.street || [];
            }

            assets = assets.filter(p => {
                if (p.folder === 'portraits') {
                    const name = getModelName(p.public_id);
                    if (name === 'quynh' || name === 'megan') return false;
                }
                return true;
            });

            if (assets.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-[#6E727A] uppercase tracking-widest text-sm font-sans">No assets found in ${category}</div>`;
                return;
            }

            if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
                const grid = document.createElement('div');
                grid.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6';
                assets.forEach((photo, index) => {
                    const button = document.createElement('button');
                    button.type = 'button';
                    button.className = 'relative aspect-[4/5] overflow-hidden';
                    const image = document.createElement('img');
                    image.src = optimizeUrl(photo.url, 800);
                    image.alt = photo.print_title || getDisplayName(photo.public_id, photo.folder) || 'Archive photograph';
                    image.loading = 'lazy';
                    image.className = 'w-full h-full object-cover';
                    button.append(image);
                    button.addEventListener('click', () => openAlbum(assets, 'Gallery Archive', index));
                    grid.append(button);
                });
                container.append(grid);
                return;
            }

            const archiveSection = document.createElement('section');
            archiveSection.className = 'relative h-[100vh] w-full mt-4 mb-32 overflow-hidden bg-[#F9F9FB] border-y border-[#6E727A]/20';
            archiveSection.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <h2 class="text-[12vw] font-serif text-[#121212]/[0.04] uppercase tracking-tighter">${category === 'all' ? 'Archives' : category}</h2>
                </div>
                <div id="floating-archive" class="relative w-full h-full"></div>
            `;
            container.appendChild(archiveSection);
            const archive = archiveSection.querySelector('#floating-archive');

            let focusedItem = null;

            assets.forEach((p, i) => {
                const item = document.createElement('div');
                const isMobile = window.innerWidth < 768;
                const laneCount = isMobile ? 3 : 4;
                const lane = i % laneCount;
                const topPos = isMobile ? (10 + (lane * 35)) : (8 + (lane * 22)); 
                const rotation = (Math.random() - 0.5) * 15;
                const width = isMobile ? (140 + Math.random() * 50) : (260 + Math.random() * 90);
                const displayName = p.print_title || getDisplayName(p.public_id, p.folder);

                item.className = 'absolute cursor-pointer z-10';
                item.style.top = `${topPos}%`;
                item.style.width = `${width}px`;
                
                item.innerHTML = `
                    <div class="w-fit mx-auto relative p-1 md:p-1.5 bg-white shadow-md group overflow-hidden border border-[#6E727A]/30 transition-all duration-700">
                        <img src="${optimizeUrl(p.url, 600)}" loading="lazy" class="h-auto max-h-[50vh] object-contain transition-all duration-1000 saturate-[0.85] group-hover:saturate-100">
                        <div class="absolute inset-0 bg-gradient-to-t from-[#121212]/90 via-[#121212]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pointer-events-none text-center p-4 pb-6">
                            ${p.is_print ? `<span class="text-[6px] md:text-[7px] uppercase tracking-[0.3em] bg-white/20 text-white px-2 py-0.5 mb-1 font-bold font-sans">Selected photograph</span>` : ''}
                            <span class="text-[7px] md:text-[9px] uppercase tracking-[0.4em] text-[#F9F9FB] font-bold mb-1 leading-tight font-sans">${displayName}</span>
                            <span class="text-[5px] md:text-[6px] uppercase tracking-widest text-[#F9F9FB]/80 font-sans">Click to Select</span>
                        </div>
                    </div>
                `;
                
                archive.appendChild(item);

                const screenWidth = window.innerWidth;
                const buffer = 600;
                const totalWidth = screenWidth + (buffer * 2);
                const duration = isMobile ? (30 + Math.random() * 20) : (60 + Math.random() * 40);

                const initialX = (i / assets.length) * totalWidth - buffer;
                gsap.set(item, { x: initialX, rotation: rotation });

                const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
                const tl = gsap.timeline({ repeat: reduceMotion ? 0 : -1, paused: reduceMotion || archiveMotionPaused });
                tl.to(item, {
                    x: -buffer,
                    duration: duration * ((initialX + buffer) / totalWidth),
                    ease: "none"
                });
                tl.set(item, { x: screenWidth + buffer });
                tl.to(item, {
                    x: -buffer,
                    duration: duration,
                    ease: "none"
                });

                item._tl = tl;
                item._rotation = rotation;

                item.onclick = (e) => {
                    e.stopPropagation();
                    if (focusedItem === item) {
                        openAlbum(assets, 'Gallery Archive', i);
                        returnToStream(item);
                        return;
                    }
                    if (focusedItem) returnToStream(focusedItem);
                    focusedItem = item;
                    tl.pause();
                    item.style.zIndex = "2000";
                    
                    const rect = archiveSection.getBoundingClientRect();
                    const sectionCenterY = rect.height / 2;
                    const currentItemTop = (topPos / 100) * rect.height;
                    const targetYOffset = sectionCenterY - currentItemTop - (item.offsetHeight / 2);

                    gsap.to(item, { 
                        x: screenWidth / 2, 
                        xPercent: -50,
                        y: targetYOffset,
                        scale: isMobile ? 1.8 : 1.6, 
                        rotation: 0,
                        duration: 1, 
                        ease: "expo.out" 
                    });
                    item.querySelector('span:last-child').innerText = "Click again to view full";
                };
            });

            function returnToStream(el) {
                el.style.zIndex = "10";
                gsap.to(el, { 
                    x: gsap.getProperty(el, "x"),
                    xPercent: 0,
                    y: 0, 
                    scale: 1, 
                    rotation: el._rotation,
                    duration: 1, 
                    ease: "power3.inOut",
                    onComplete: () => { if (!archiveMotionPaused) el._tl.play(); }
                });
                el.querySelector('span:last-child').innerText = "Click to Select";
                focusedItem = null;
            }

            archiveSection.onclick = () => {
                if (focusedItem) returnToStream(focusedItem);
            };

            return;
        }

        if (category === 'prints' || category.startsWith('prints:') || category === 'adventure' || category === 'backpacking' || category === 'outdoors') {
            let assets = [];
            if (category === 'prints') {
                const allPhotos = [
                    ...(galleryData['adventure/backpacking'] || []),
                    ...(galleryData['adventure/outdoors'] || []),
                    ...(galleryData.portraits || []),
                    ...(galleryData.street || [])
                ];
                assets = allPhotos.filter(p => p.is_print);
                assets.sort((a, b) => (a.print_order || a.print_tier || 99) - (b.print_order || b.print_tier || 99));
            } else if (category.startsWith('prints:')) {
                const subColl = category.split(':')[1];
                const allPhotos = [
                    ...(galleryData['adventure/backpacking'] || []),
                    ...(galleryData['adventure/outdoors'] || []),
                    ...(galleryData.portraits || []),
                    ...(galleryData.street || [])
                ];
                assets = allPhotos.filter(p => p.is_print && p.print_collection === subColl);
                assets.sort((a, b) => (a.print_order || a.print_tier || 99) - (b.print_order || b.print_tier || 99));
            } else if (category === 'adventure') {
                assets = [...(galleryData['adventure/backpacking'] || []), ...(galleryData['adventure/outdoors'] || [])];
            } else {
                assets = galleryData[`adventure/${category}`] || [];
            }

            if (assets.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-[#6E727A] uppercase tracking-widest text-sm font-sans">No assets found in ${category}</div>`;
                return;
            }

            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 3xl:grid-cols-5 gap-6 md:gap-8 mt-12 w-full';
            
            assets.forEach((p, i) => {
                const item = document.createElement('div');
                item.className = 'group cursor-pointer relative aspect-[4/5] overflow-hidden bg-white border border-[#6E727A]/20';
                const displayName = p.print_title || getDisplayName(p.public_id, p.folder);
                const printBadge = p.is_print ? `<span class="inline-block text-[7px] uppercase tracking-[0.3em] bg-[#121212]/90 text-[#F9F9FB] px-2 py-0.5 mb-2 font-bold font-sans w-fit">Photograph</span>` : '';
                
                item.innerHTML = `
                    <img src="${optimizeUrl(p.url, 800)}" loading="lazy" class="w-full h-full object-cover transition-all duration-1000 saturate-[0.85] group-hover:saturate-100 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        ${printBadge}
                        <span class="text-[10px] uppercase tracking-[0.3em] text-[#F9F9FB] font-bold mb-1 font-sans">${displayName}</span>
                        <span class="text-[8px] uppercase tracking-widest text-[#F9F9FB]/80 font-sans">View photograph</span>
                    </div>
                `;
                const albumTitle = category.startsWith('prints') ? 'SELECTED PHOTOGRAPHS' : category.toUpperCase();
                item.onclick = () => openAlbum(assets, albumTitle, i);
                gridContainer.appendChild(item);
            });
            
            container.appendChild(gridContainer);
            
            gsap.from(gridContainer.children, {
                duration: galleryMotionPreference.matches ? 0 : 0.45,
                y: 8,
                opacity: 0,
                stagger: 0.02,
                ease: "power3.out"
            });
            return;
        }

        // RENDER ALBUMS FOR PORTRAITURE OR SAKURA
        let portraits = (galleryData.portraits || []).filter(p => {
            const name = getModelName(p.public_id);
            if (category === 'sakura') {
                return (p.tags && p.tags.includes('sakura')) || ['anabel', 'sandy', 'christie'].includes(name);
            }
            return true;
        });

        const albumGrid = document.createElement('div');
        albumGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12';
        container.appendChild(albumGrid);

        const groups = portraits.reduce((acc, p) => {
            const name = getModelName(p.public_id);
            const groupName = ['anabel', 'sandy'].includes(name) ? 'Sakura Series' : name.charAt(0).toUpperCase() + name.slice(1);
            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push(p);
            return acc;
        }, {});

        Object.keys(groups).sort().forEach(groupName => {
            const photos = groups[groupName];
            if (photos.length < 4) return; // Filter out subjects/sets with < 4 images
            const displayPhotos = photos.slice(0, 6); // 4 to 6 cohesive shots

            const section = document.createElement('div');
            section.className = 'album-section group cursor-pointer relative h-[50vh] overflow-hidden rounded-sm bg-white border border-[#6E727A]/20 shadow-sm';
            const label = groupName === 'Sakura Series' ? 'Sakura' : 'Series';

            section.innerHTML = `
                <img src="${optimizeUrl(displayPhotos[0].url, 800)}" loading="lazy" class="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 saturate-[0.85] group-hover:saturate-100" alt="${groupName}">
                <div class="absolute inset-0 bg-[#121212]/30 group-hover:bg-[#121212]/10 transition-all duration-700 flex flex-col justify-center items-center">
                    <span class="text-[9px] uppercase tracking-[0.4em] text-white mb-2 font-bold font-sans">${label}</span>
                    <h3 class="text-4xl font-serif font-normal tracking-tight text-white drop-shadow-md">${groupName}</h3>
                    <span class="mt-4 text-[8px] uppercase tracking-widest text-white/90 opacity-0 group-hover:opacity-100 transition-opacity underline decoration-white/40 underline-offset-8 font-sans">Explore Album</span>
                </div>
            `;
            section.onclick = () => openAlbum(displayPhotos, groupName);
            albumGrid.appendChild(section);
        });

        gsap.from(".album-section", {
            duration: galleryMotionPreference.matches ? 0 : 0.45,
            y: 8,
            opacity: 0,
            stagger: 0.04,
            ease: "power3.out"
        });

    } catch (e) {
        console.error("Error rendering gallery:", e);
        document.getElementById('gallery-status').textContent = 'Collection could not load. Please try another collection.';
    } finally {
        const count = document.querySelectorAll('#gallery-container img').length;
        if (count) document.getElementById('gallery-status').textContent = `${count} ${['portraiture', 'sakura'].includes(category) ? 'series' : 'photographs'} shown.`;
        else if (!document.getElementById('gallery-status').textContent.includes('could not load')) document.getElementById('gallery-status').textContent = 'No photographs in this collection.';
    }
}

function filterGallery(category) {
    const collection = document.getElementById('gallery-category');
    if (collection) collection.value = category;
    const url = new URL(location.href);
    url.searchParams.set('filter', category);
    history.replaceState({}, '', url);
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => btn.classList.remove('text-[#121212]', 'active', 'border-b', 'border-[#121212]'));
    
    btns.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${category}'`)) {
            btn.classList.add('text-[#121212]', 'active');
            const parentGroup = btn.closest('.group');
            if (parentGroup) {
                const parentBtn = parentGroup.querySelector('button.filter-btn');
                if (parentBtn) parentBtn.classList.add('text-[#121212]');
            }
        }
    });
    renderGallery(category);
}

let isRoomView = false;

function toggleRoomView() {
    isRoomView = !isRoomView;
    const stdView = document.getElementById('modal-standard-view');
    const roomView = document.getElementById('room-view');
    const toggleBtn = document.getElementById('room-toggle-btn');
    
    if (isRoomView) {
        if (stdView) stdView.classList.add('hidden');
        if (roomView) roomView.classList.remove('hidden');
        if (toggleBtn) {
            toggleBtn.innerHTML = `🔍 Full Photo View`;
            toggleBtn.classList.add('bg-white', 'text-[#121212]');
        }
        updateRoomScale();
    } else {
        if (stdView) stdView.classList.remove('hidden');
        if (roomView) roomView.classList.add('hidden');
        if (toggleBtn) {
            toggleBtn.innerHTML = `🖼️ Preview on Wall`;
            toggleBtn.classList.remove('bg-white', 'text-[#121212]');
        }
    }
}

function setWallTone(hexColor) {
    const wallBg = document.getElementById('wall-bg');
    if (wallBg) {
        wallBg.style.backgroundColor = hexColor;
    }
}

let currentPhotoIsVertical = false;

function setupPrintSizeOptions(isVertical) {
    const select = document.getElementById('print-size-select');
    if (!select) return;

    if (select.dataset.isVertical === String(isVertical)) return;
    select.dataset.isVertical = String(isVertical);

    if (isVertical) {
        select.innerHTML = `
            <option value="8x12">8x12" (20x30cm)</option>
            <option value="12x18">12x18" (30x45cm)</option>
            <option value="16x24" selected>16x24" (40x60cm)</option>
            <option value="24x36">24x36" (60x90cm)</option>
        `;
    } else {
        select.innerHTML = `
            <option value="12x8">12x8" (30x20cm)</option>
            <option value="18x12">18x12" (45x30cm)</option>
            <option value="24x16" selected>24x16" (60x40cm)</option>
            <option value="36x24">36x24" (90x60cm)</option>
        `;
    }
}

function updateRoomScale() {
    if (!currentAlbum || currentAlbum.length === 0) return;
    const photo = currentAlbum[currentIndex];
    const select = document.getElementById('print-size-select');
    const roomImg = document.getElementById('room-print-img');
    const frame = document.getElementById('room-framed-print');
    const badge = document.getElementById('room-scale-badge');
    
    if (roomImg) roomImg.src = optimizeUrl(photo.url, 1600);
    if (!select || !frame) return;

    const size = select.value;
    let widthPercent = "58%";
    let badgeText = `16x24" (40x60cm) — Study & Feature Wall`;

    if (currentPhotoIsVertical) {
        frame.style.aspectRatio = "2/3";
        if (size === '8x12') {
            widthPercent = "28%";
            badgeText = `8x12" (20x30cm) — Compact Accent Frame`;
        } else if (size === '12x18') {
            widthPercent = "38%";
            badgeText = `12x18" (30x45cm) — Hallway & Desk Pairing`;
        } else if (size === '16x24') {
            widthPercent = "48%";
            badgeText = `16x24" (40x60cm) — Study & Feature Wall`;
        } else if (size === '24x36') {
            widthPercent = "62%";
            badgeText = `24x36" (60x90cm) — Living Room Centerpiece`;
        }
    } else {
        frame.style.aspectRatio = "3/2";
        if (size === '12x8') {
            widthPercent = "36%";
            badgeText = `12x8" (30x20cm) — Compact Accent Frame`;
        } else if (size === '18x12') {
            widthPercent = "52%";
            badgeText = `18x12" (45x30cm) — Hallway & Desk Pairing`;
        } else if (size === '24x16') {
            widthPercent = "68%";
            badgeText = `24x16" (60x40cm) — Study & Feature Wall`;
        } else if (size === '36x24') {
            widthPercent = "84%";
            badgeText = `36x24" (90x60cm) — Living Room Centerpiece`;
        }
    }

    if (badge) badge.innerText = badgeText;
    
    if (window.gsap && !galleryMotionPreference.matches) {
        gsap.to(frame, {
            width: widthPercent,
            duration: 0.6,
            ease: "power2.out"
        });
    } else {
        frame.style.width = widthPercent;
    }
}

function openAlbum(photos, name, startIndex = 0) {
    currentAlbum = photos;
    currentModel = name;
    currentIndex = startIndex;
    
    // Default to Standard Fullscreen view when opening modal
    isRoomView = true; 
    toggleRoomView(); // Toggles to false (standard view) cleanly
    
    updateModal();
    
    const modal = document.getElementById('album-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    stopSlideshow();
    if (document.fullscreenElement || document.webkitFullscreenElement || document.msFullscreenElement) {
        if (document.exitFullscreen) document.exitFullscreen();
        else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
        else if (document.msExitFullscreen) document.msExitFullscreen();
    }
    const modal = document.getElementById('album-modal');
    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
        isRoomView = false;
        const stdView = document.getElementById('modal-standard-view');
        const roomView = document.getElementById('room-view');
        if (stdView) stdView.classList.remove('hidden');
        if (roomView) roomView.classList.add('hidden');
    }, galleryMotionPreference.matches ? 0 : 180);
}

function updateModal() {
    const photo = currentAlbum[currentIndex];
    const img = document.getElementById('modal-img');
    img.src = optimizeUrl(photo.url, 2000);
    img.alt = photo.print_title || currentModel;
    document.getElementById('modal-model-name').innerText = photo.print_title || currentModel;
    document.getElementById('modal-counter').innerText = `${currentIndex + 1} / ${currentAlbum.length}`;
    const tempImg = new Image();
    tempImg.onload = () => {
        if (currentAlbum[currentIndex] !== photo) return;
        currentPhotoIsVertical = tempImg.naturalHeight > tempImg.naturalWidth;
        setupPrintSizeOptions(currentPhotoIsVertical);
        if (isRoomView) updateRoomScale();
    };
    tempImg.src = optimizeUrl(photo.url, 64);
    for (const index of [(currentIndex + 1) % currentAlbum.length, (currentIndex - 1 + currentAlbum.length) % currentAlbum.length]) {
        new Image().src = optimizeUrl(currentAlbum[index].url, 2000);
    }
}

function nextPhoto() {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
    updateModal();
}

function prevPhoto() {
    currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    updateModal();
}

function startSlideshow(intervalMs = 4500) {
    if (isSlideshowActive) return;
    isSlideshowActive = true;
    updateSlideshowUI();
    slideshowInterval = setInterval(() => {
        nextPhoto();
    }, intervalMs);
}

function stopSlideshow() {
    if (slideshowInterval) {
        clearInterval(slideshowInterval);
        slideshowInterval = null;
    }
    isSlideshowActive = false;
    updateSlideshowUI();
}

function toggleSlideshow() {
    if (isSlideshowActive) {
        stopSlideshow();
    } else {
        startSlideshow();
    }
}

function updateSlideshowUI() {
    const icon = document.getElementById('slideshow-icon');
    const label = document.getElementById('slideshow-label');
    const btn = document.getElementById('slideshow-toggle-btn');
    if (!btn) return;
    btn.setAttribute('aria-pressed', String(isSlideshowActive));
    if (isSlideshowActive) {
        if (icon) icon.innerText = '❚❚';
        if (label) label.innerText = 'Pause Exhibition';
        btn.classList.add('bg-white', 'text-[#121212]');
        btn.classList.remove('bg-[#F9F9FB]/10', 'text-[#F9F9FB]');
    } else {
        if (icon) icon.innerText = '▶';
        if (label) label.innerText = 'Play Exhibition';
        btn.classList.remove('bg-white', 'text-[#121212]');
        btn.classList.add('bg-[#F9F9FB]/10', 'text-[#F9F9FB]');
    }
}

function toggleFullscreen() {
    const modal = document.getElementById('album-modal');
    if (!document.fullscreenElement && !document.webkitFullscreenElement && !document.msFullscreenElement) {
        if (modal.requestFullscreen) {
            modal.requestFullscreen();
        } else if (modal.webkitRequestFullscreen) {
            modal.webkitRequestFullscreen();
        } else if (modal.msRequestFullscreen) {
            modal.msRequestFullscreen();
        }
    } else {
        if (document.exitFullscreen) {
            document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }
}

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('album-modal');
    if (modal && modal.classList.contains('hidden')) return;

    if (e.target.matches('input, select, textarea')) return;
    if ((e.key === ' ' || e.code === 'Space') && e.target.closest('button, a, summary')) return;
    if (e.key === 'ArrowRight') nextPhoto();
    else if (e.key === 'ArrowLeft') prevPhoto();
    else if (e.key === 'Escape') closeModal();
    else if (e.key === ' ' || e.code === 'Space' || e.key === 'p' || e.key === 'P') {
        e.preventDefault();
        toggleSlideshow();
    } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
    }
});

// Initialize
window.addEventListener('load', () => {

    const urlParams = new URLSearchParams(window.location.search);
    const requestedCategory = urlParams.get('filter') || 'all';
    const validCategories = ['prints','prints:alpine','prints:urban','prints:wildlife','prints:travel','portraiture','sakura','adventure','backpacking','outdoors','street','all'];
    const initialCategory = validCategories.includes(requestedCategory) ? requestedCategory : 'all';
    document.getElementById('gallery-category').value = initialCategory;
    renderGallery(initialCategory);
    
    setTimeout(() => {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(`'${initialCategory}'`)) {
                btn.classList.add('text-[#121212]', 'active');
                const parentGroup = btn.closest('.group');
                if (parentGroup) {
                    const parentBtn = parentGroup.querySelector('button.filter-btn');
                    if (parentBtn) parentBtn.classList.add('text-[#121212]');
                }
            }
        });
    }, 100);
});
