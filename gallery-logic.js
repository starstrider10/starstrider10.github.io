
const strategies = {
    'all': 'Viewing the full archive. Each genre is captured with intentional technical choices designed to evoke specific audience responses and brand values.',
    'portraiture': 'Portraiture: Focusing on human connection and emotional depth. Utilized shallow depth of field and warm, authentic color grading to build immediate viewer trust.',
    'sakura': 'Sakura Series: A collection featuring Anabel, Sandy, and Christie, captured during the peak of spring. This series emphasizes the ephemeral beauty of the season.',
    'adventure': 'Adventure: Highlighting freedom and exploration. Engineered for lifestyle and outdoor brands that value rugged authenticity and wide-scale narrative scope.',
    'backpacking': 'Backpacking: Capturing the essence of self-reliance and the journey. Focused on raw, unposed moments and the vastness of the wilderness.',
    'outdoors': 'Outdoors: Exploring the natural world and outdoor lifestyle. Emphasizing lighting, texture, and the relationship between humans and nature.',
    'street': 'Street: Capturing the rhythmic pulse of urban life. Technical focus on geometric composition and high-contrast lighting to create high-engagement social assets.'
};

let currentAlbum = [];
let currentIndex = 0;
let currentModel = "";

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
        container.innerHTML = ''; 

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
                    if (name === 'quynh') return false;
                    if (p.public_id.includes('20250528-A9200129-kat')) return false;
                    if (p.public_id.includes('20250606-A9200391-jimmy')) return false;
                }
                return true;
            });

            if (assets.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-zinc-500 uppercase tracking-widest text-sm">No assets found in ${category}</div>`;
                return;
            }

            const archiveSection = document.createElement('section');
            archiveSection.className = 'relative h-[100vh] w-[100vw] -mx-6 mt-4 mb-32 overflow-hidden bg-[#0A0A0A]';
            archiveSection.innerHTML = `
                <div class="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
                    <h2 class="text-[12vw] font-black text-white/[0.03] uppercase tracking-tighter">${category === 'all' ? 'Archives' : category}</h2>
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
                const displayName = getDisplayName(p.public_id, p.folder);

                item.className = 'absolute cursor-pointer z-10';
                item.style.top = `${topPos}%`;
                item.style.width = `${width}px`;
                
                item.innerHTML = `
                    <div class="w-fit mx-auto relative p-1 md:p-1.5 bg-zinc-900 shadow-2xl group overflow-hidden border border-white/5 transition-all duration-700">
                        <img src="${optimizeUrl(p.url, 600)}" loading="lazy" class="h-auto max-h-[50vh] object-contain transition-all duration-1000 saturate-[0.4] group-hover:saturate-100">
                        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-end pointer-events-none text-center p-4 pb-6">
                            <span class="text-[7px] md:text-[9px] uppercase tracking-[0.4em] text-white font-bold mb-1 leading-tight">${displayName}</span>
                            <span class="text-[5px] md:text-[6px] uppercase tracking-widest text-[#FFB84D] opacity-70">Click to Select</span>
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

                const tl = gsap.timeline({ repeat: -1 });
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
                    onComplete: () => el._tl.play()
                });
                el.querySelector('span:last-child').innerText = "Click to Select";
                focusedItem = null;
            }

            archiveSection.onclick = () => {
                if (focusedItem) returnToStream(focusedItem);
            };

            return;
        }

        if (category === 'adventure' || category === 'backpacking' || category === 'outdoors') {
            let assets = [];
            if (category === 'adventure') {
                assets = [...(galleryData['adventure/backpacking'] || []), ...(galleryData['adventure/outdoors'] || [])];
            } else {
                assets = galleryData[`adventure/${category}`] || [];
            }

            if (assets.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-zinc-500 uppercase tracking-widest text-sm">No assets found in ${category}</div>`;
                return;
            }

            const gridContainer = document.createElement('div');
            gridContainer.className = 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12';
            
            assets.forEach((p, i) => {
                const item = document.createElement('div');
                item.className = 'group cursor-pointer relative aspect-[4/5] overflow-hidden bg-zinc-900 border border-white/5';
                const displayName = getDisplayName(p.public_id, p.folder);
                
                item.innerHTML = `
                    <img src="${optimizeUrl(p.url, 800)}" loading="lazy" class="w-full h-full object-cover transition-all duration-1000 saturate-[0.4] group-hover:saturate-100 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        <span class="text-[10px] uppercase tracking-[0.3em] text-white font-bold mb-1">${displayName}</span>
                        <span class="text-[8px] uppercase tracking-widest text-[#FFB84D]">View Fullscreen</span>
                    </div>
                `;
                item.onclick = () => openAlbum(assets, category.toUpperCase(), i);
                gridContainer.appendChild(item);
            });
            
            container.appendChild(gridContainer);
            
            gsap.from(gridContainer.children, {
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                ease: "power3.out"
            });
            return;
        }

        // RENDER ALBUMS FOR PORTRAITURE OR SAKURA
        let portraits = (galleryData.portraits || []).filter(p => {
            const name = getModelName(p.public_id);
            if (name === 'quynh') return false;
            if (p.public_id.includes('20250528-A9200129-kat')) return false;
            if (p.public_id.includes('20250606-A9200391-jimmy')) return false;
            
            if (category === 'sakura') {
                const hasSakuraTag = p.tags && p.tags.includes('sakura');
                const hasSakuraKeyword = p.public_id.toLowerCase().includes('sakura');
                const isOriginalSakuraModel = ['anabel', 'sandy', 'christie'].includes(name);
                return hasSakuraTag || hasSakuraKeyword || isOriginalSakuraModel;
            }
            return true;
        });

        const albumGrid = document.createElement('div');
        albumGrid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mt-12';
        container.appendChild(albumGrid);

        const groups = portraits.reduce((acc, p) => {
            const name = getModelName(p.public_id);
            if (!acc[name]) acc[name] = [];
            acc[name].push(p);
            return acc;
        }, {});

        Object.keys(groups).sort().forEach(modelName => {
            const photos = groups[modelName];
            const section = document.createElement('div');
            section.className = 'album-section group cursor-pointer relative h-[50vh] overflow-hidden rounded-sm bg-zinc-900';
            const isSakura = ['anabel', 'sandy', 'christie'].includes(modelName);
            const label = isSakura ? 'Sakura' : 'Series';

            section.innerHTML = `
                <img src="${optimizeUrl(photos[0].url, 800)}" loading="lazy" class="w-full h-full object-cover transition-all duration-1000 group-hover:scale-105 saturate-[0.4] group-hover:saturate-100" alt="${modelName}">
                <div class="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-all duration-700 flex flex-col justify-center items-center">
                    <span class="text-[9px] uppercase tracking-[0.4em] text-[#FFB84D] mb-2 font-bold">${label}</span>
                    <h3 class="text-3xl font-light tracking-tighter capitalize text-white">${modelName}</h3>
                    <span class="mt-4 text-[8px] uppercase tracking-widest text-white/50 opacity-0 group-hover:opacity-100 transition-opacity underline decoration-[#FFB84D]/30 underline-offset-8">Explore Album</span>
                </div>
            `;
            section.onclick = () => openAlbum(photos, modelName);
            albumGrid.appendChild(section);
        });

        gsap.from(".album-section", {
            duration: 1.2,
            y: 40,
            opacity: 0,
            stagger: 0.2,
            ease: "power3.out"
        });

    } catch (e) {
        console.error("Error rendering gallery:", e);
    }
}

function filterGallery(category) {
    const btns = document.querySelectorAll('.filter-btn');
    btns.forEach(btn => btn.classList.remove('text-[#FFB84D]', 'active'));
    
    btns.forEach(btn => {
        const onclick = btn.getAttribute('onclick');
        if (onclick && onclick.includes(`'${category}'`)) {
            btn.classList.add('text-[#FFB84D]', 'active');
            const parentGroup = btn.closest('.group');
            if (parentGroup) {
                const parentBtn = parentGroup.querySelector('button.filter-btn');
                if (parentBtn) parentBtn.classList.add('text-[#FFB84D]');
            }
        }
    });
    renderGallery(category);
}

function openAlbum(photos, name, startIndex = 0) {
    currentAlbum = photos;
    currentModel = name;
    currentIndex = startIndex;
    updateModal();
    
    const modal = document.getElementById('album-modal');
    modal.classList.remove('hidden');
    modal.classList.add('flex');
    setTimeout(() => modal.classList.add('opacity-100'), 10);
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('album-modal');
    modal.classList.remove('opacity-100');
    setTimeout(() => {
        modal.classList.add('hidden');
        modal.classList.remove('flex');
        document.body.style.overflow = 'auto';
    }, 500);
}

function updateModal() {
    const photo = currentAlbum[currentIndex];
    const img = document.getElementById('modal-img');
    
    // Use high res for modal, but still optimize format/quality
    img.src = optimizeUrl(photo.url, 2000);
    document.getElementById('modal-model-name').innerText = currentModel;
    document.getElementById('modal-counter').innerText = `${currentIndex + 1} / ${currentAlbum.length}`;

    const nextIdx = (currentIndex + 1) % currentAlbum.length;
    const prevIdx = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    
    new Image().src = optimizeUrl(currentAlbum[nextIdx].url, 2000);
    new Image().src = optimizeUrl(currentAlbum[prevIdx].url, 2000);
}

function nextPhoto() {
    currentIndex = (currentIndex + 1) % currentAlbum.length;
    updateModal();
}

function prevPhoto() {
    currentIndex = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    updateModal();
}

document.addEventListener('keydown', (e) => {
    const modal = document.getElementById('album-modal');
    if (modal.classList.contains('hidden')) return;
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
    if (e.key === 'Escape') closeModal();
});

// Initialize
window.addEventListener('load', () => {
    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('filter') || 'all';
    renderGallery(initialCategory);
    
    setTimeout(() => {
        const btns = document.querySelectorAll('.filter-btn');
        btns.forEach(btn => {
            const onclick = btn.getAttribute('onclick');
            if (onclick && onclick.includes(`'${initialCategory}'`)) {
                btn.classList.add('text-[#FFB84D]', 'active');
                const parentGroup = btn.closest('.group');
                if (parentGroup) {
                    const parentBtn = parentGroup.querySelector('button.filter-btn');
                    if (parentBtn) parentBtn.classList.add('text-[#FFB84D]');
                }
            }
        });
    }, 100);
});
