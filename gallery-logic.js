// ==========================================
// SHOPIFY STOREFRONT CONFIGURATION
// Isolated for easy updates with live keys
// ==========================================
const SHOPIFY_CONFIG = {
    domain: 'g5z00p-jh.myshopify.com',
    storefrontToken: 'ce2dd1785a2231d17a6523d19192a78a',
    apiVersion: '2024-07',
    storageKey: 'storyofleo_cart_id'
};

const FALLBACK_PRICES = {
    '8x12': 85,
    '12x8': 85,
    '12x18': 125,
    '18x12': 125,
    '16x24': 180,
    '24x16': 180,
    '24x36': 290,
    '36x24': 290
};

let shopifyProductsCache = {};
let currentActiveVariant = null;
let currentCart = null;
let isCartBusy = false;

// Standardized GraphQL Fetch Helper
async function shopifyFetch(query, variables = {}) {
    try {
        const response = await fetch(`https://${SHOPIFY_CONFIG.domain}/api/${SHOPIFY_CONFIG.apiVersion}/graphql.json`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Shopify-Storefront-Access-Token': SHOPIFY_CONFIG.storefrontToken
            },
            body: JSON.stringify({ query, variables })
        });
        if (!response.ok) {
            console.error('Shopify API HTTP Error:', response.status, response.statusText);
            return null;
        }
        const json = await response.json();
        if (json.errors) {
            console.error('Shopify GraphQL Errors:', json.errors);
        }
        return json.data || null;
    } catch (e) {
        console.error('Shopify Fetch Network Error:', e);
        return null;
    }
}

// Product Query
async function fetchShopifyProduct(title) {
    if (shopifyProductsCache[title] !== undefined) return shopifyProductsCache[title];

    const query = `
      query getProductByTitle($query: String!) {
        products(first: 1, query: $query) {
          edges {
            node {
              id
              title
              description
              options {
                name
                values
              }
              variants(first: 50) {
                edges {
                  node {
                    id
                    title
                    price {
                      amount
                      currencyCode
                    }
                    availableForSale
                    selectedOptions {
                      name
                      value
                    }
                  }
                }
              }
            }
          }
        }
      }
    `;

    const data = await shopifyFetch(query, { query: `title:"${title}"` });
    const product = data?.products?.edges?.[0]?.node || null;
    shopifyProductsCache[title] = product;
    return product;
}

// Cart GraphQL Fragment
const CART_FRAGMENT = `
  id
  checkoutUrl
  totalQuantity
  cost {
    subtotalAmount {
      amount
      currencyCode
    }
    totalAmount {
      amount
      currencyCode
    }
  }
  lines(first: 50) {
    edges {
      node {
        id
        quantity
        cost {
          totalAmount {
            amount
            currencyCode
          }
        }
        merchandise {
          ... on ProductVariant {
            id
            title
            image {
              url
            }
            price {
              amount
              currencyCode
            }
            product {
              title
            }
            selectedOptions {
              name
              value
            }
          }
        }
      }
    }
  }
`;

async function getCart(cartId) {
    if (!cartId) return null;
    const query = `
      query getCart($id: ID!) {
        cart(id: $id) {
          ${CART_FRAGMENT}
        }
      }
    `;
    const data = await shopifyFetch(query, { id: cartId });
    return data?.cart || null;
}

async function createShopifyCart(lines = []) {
    const query = `
      mutation cartCreate($input: CartInput!) {
        cartCreate(input: $input) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const data = await shopifyFetch(query, { input: { lines } });
    const cart = data?.cartCreate?.cart;
    if (cart) {
        localStorage.setItem(SHOPIFY_CONFIG.storageKey, cart.id);
    }
    return cart || null;
}

async function addLinesToCart(cartId, lines = []) {
    const query = `
      mutation cartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const data = await shopifyFetch(query, { cartId, lines });
    return data?.cartLinesAdd?.cart || null;
}

async function removeLinesFromCart(cartId, lineIds = []) {
    const query = `
      mutation cartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const data = await shopifyFetch(query, { cartId, lineIds });
    return data?.cartLinesRemove?.cart || null;
}

async function updateCartLines(cartId, lines = []) {
    const query = `
      mutation cartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
          cart {
            ${CART_FRAGMENT}
          }
          userErrors {
            field
            message
          }
        }
      }
    `;
    const data = await shopifyFetch(query, { cartId, lines });
    return data?.cartLinesUpdate?.cart || null;
}


const strategies = {
    'all': 'Viewing the full archive. Fine art nature photography, environmental portraiture, and wilderness documentation.',
    'portraiture': 'Portraiture & Outdoor Lifestyle: Focusing on authentic human connection, atmospheric light, and natural character.',
    'sakura': 'Sakura Series: Fine art seasonal portraiture capturing the fleeting beauty of spring in natural light.',
    'adventure': 'Outdoor & Fine Art: Alpine landscapes, wilderness expanses, and quiet moments in the backcountry.',
    'backpacking': 'Backpacking: Visual stories from deep trails, self-reliance, and mountain solitude.',
    'outdoors': 'Outdoors: Curated fine art imagery emphasizing mountain mist, natural textures, and open horizons.',
    'street': 'Street & Urban: Geometric compositions and shadow studies capturing urban geometry and daily life.',
    'prints': 'Fine Art Prints Collection: Curated archival prints across alpine landscapes, ocean mist, iconic cityscapes, and wildlife.',
    'prints:alpine': 'Alpine & Wilderness Fine Art Prints: Grand mountain vistas, peak reflections, and misty coastlines.',
    'prints:urban': 'Urban & Skyline Fine Art Prints: Iconic cityscapes, atmospheric fog, and architectural geometry.',
    'prints:wildlife': 'Wildlife & Fine Art Nature Prints: Marine sea turtles, monochrome wildlife portraits, and atmospheric night scenes.',
    'prints:travel': 'Travel & Wanderlust Story Prints: Atmospheric train tracks, floating night lanterns, fire art, and wanderlust travel moments.'
};

let currentAlbum = [];
let currentIndex = 0;
let currentModel = "";
let slideshowInterval = null;
let isSlideshowActive = false;

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
                    if (name === 'quynh' || name === 'megan') return false;
                }
                return true;
            });

            if (assets.length === 0) {
                container.innerHTML = `<div class="py-20 text-center text-[#6E727A] uppercase tracking-widest text-sm font-sans">No assets found in ${category}</div>`;
                return;
            }

            const archiveSection = document.createElement('section');
            archiveSection.className = 'relative h-[100vh] w-[100vw] -mx-6 mt-4 mb-32 overflow-hidden bg-[#F9F9FB] border-y border-[#6E727A]/20';
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
                            ${p.is_print ? `<span class="text-[6px] md:text-[7px] uppercase tracking-[0.3em] bg-white/20 text-white px-2 py-0.5 mb-1 font-bold font-sans">Print Available</span>` : ''}
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
                const printBadge = p.is_print ? `<span class="inline-block text-[7px] uppercase tracking-[0.3em] bg-[#121212]/90 text-[#F9F9FB] px-2 py-0.5 mb-2 font-bold font-sans w-fit">Fine Art Print</span>` : '';
                
                item.innerHTML = `
                    <img src="${optimizeUrl(p.url, 800)}" loading="lazy" class="w-full h-full object-cover transition-all duration-1000 saturate-[0.85] group-hover:saturate-100 group-hover:scale-105">
                    <div class="absolute inset-0 bg-gradient-to-t from-[#121212]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6">
                        ${printBadge}
                        <span class="text-[10px] uppercase tracking-[0.3em] text-[#F9F9FB] font-bold mb-1 font-sans">${displayName}</span>
                        <span class="text-[8px] uppercase tracking-widest text-[#F9F9FB]/80 font-sans">View Fullscreen & Order Print</span>
                    </div>
                `;
                const albumTitle = category.startsWith('prints') ? 'FINE ART PRINTS' : category.toUpperCase();
                item.onclick = () => openAlbum(assets, albumTitle, i);
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
    
    if (window.gsap) {
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
    }, 500);
}

async function updateModal() {
    const photo = currentAlbum[currentIndex];
    const img = document.getElementById('modal-img');
    const photoTitle = photo.print_title || currentModel;
    document.getElementById('modal-model-name').innerText = photoTitle;
    document.getElementById('modal-counter').innerText = `${currentIndex + 1} / ${currentAlbum.length}`;

    const buyBtn = document.getElementById('buy-print-btn');
    if (buyBtn) {
        buyBtn.innerHTML = `<span>Loading Availability...</span>`;
        buyBtn.disabled = true;
    }

    // Prefetch Shopify product variants for dynamic pricing
    let product = null;
    if (photo.is_print || photo.shopify_url) {
        product = await fetchShopifyProduct(photoTitle);
        // If product has finish options defined in Shopify, reflect them dynamically
        if (product && product.options) {
            const finishOpt = product.options.find(o => o.name.toLowerCase() === 'finish' || o.name.toLowerCase() === 'material');
            const finishSelect = document.getElementById('print-finish-select');
            if (finishOpt && finishOpt.values.length > 0 && finishSelect) {
                const currentVal = finishSelect.value;
                finishSelect.innerHTML = finishOpt.values.map(val => `<option value="${val}" ${val === currentVal ? 'selected' : ''}>${val}</option>`).join('');
            }
        }
    }
    
    // Detect orientation when image loads
    const tempImg = new Image();
    tempImg.onload = () => {
        currentPhotoIsVertical = tempImg.naturalHeight > tempImg.naturalWidth;
        setupPrintSizeOptions(currentPhotoIsVertical);
        updatePrintPrice();
        if (isRoomView) updateRoomScale();
    };
    tempImg.src = photo.url;

    // Use high res for modal, but still optimize format/quality
    img.src = optimizeUrl(photo.url, 2000);

    const nextIdx = (currentIndex + 1) % currentAlbum.length;
    const prevIdx = (currentIndex - 1 + currentAlbum.length) % currentAlbum.length;
    
    new Image().src = optimizeUrl(currentAlbum[nextIdx].url, 2000);
    new Image().src = optimizeUrl(currentAlbum[prevIdx].url, 2000);
}

function updatePrintPrice() {
    if (!currentAlbum || currentAlbum.length === 0) return;
    const photo = currentAlbum[currentIndex];
    const sizeSelect = document.getElementById('print-size-select');
    const finishSelect = document.getElementById('print-finish-select');
    const buyBtn = document.getElementById('buy-print-btn');
    if (!sizeSelect || !finishSelect || !buyBtn) return;

    const size = sizeSelect.value;
    const finish = finishSelect.value;
    const photoTitle = photo.print_title || currentModel;

    if (isRoomView) updateRoomScale();

    let normalizedSize = size;
    if (size === '12x8') normalizedSize = '8x12';
    if (size === '18x12') normalizedSize = '12x18';
    if (size === '24x16') normalizedSize = '16x24';
    if (size === '36x24') normalizedSize = '24x36';
    const shopifySizeWithQuotes = normalizedSize + '"';

    const product = shopifyProductsCache[photoTitle];
    currentActiveVariant = null;

    if (product && product.variants && product.variants.edges && product.variants.edges.length > 0) {
        const variantEdge = product.variants.edges.find(e => {
            const opts = e.node.selectedOptions || [];
            const hasSize = opts.some(o => {
                const v = o.value.trim().toLowerCase();
                return v === shopifySizeWithQuotes.toLowerCase() ||
                       v === normalizedSize.toLowerCase() ||
                       v === size.toLowerCase();
            });
            const hasFinish = opts.some(o => {
                const v = o.value.trim().toLowerCase();
                const f = finish.trim().toLowerCase();
                return v === f || v.includes(f) || f.includes(v);
            });
            return hasSize && hasFinish;
        });

        if (variantEdge) {
            currentActiveVariant = variantEdge.node;
        }
    }

    if (currentActiveVariant) {
        if (currentActiveVariant.availableForSale) {
            const price = Math.round(parseFloat(currentActiveVariant.price.amount));
            buyBtn.innerHTML = `<span>Add to Cart — $${price}</span> <span class="text-xs">&rarr;</span>`;
            buyBtn.disabled = false;
            buyBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        } else {
            buyBtn.innerHTML = `<span>Out of Stock</span>`;
            buyBtn.disabled = true;
            buyBtn.classList.add('opacity-60', 'cursor-not-allowed');
        }
    } else {
        // Fallback pricing when variant is not found in Shopify yet
        const fallbackPrice = FALLBACK_PRICES[size] || 180;
        buyBtn.disabled = false;
        buyBtn.classList.remove('opacity-60', 'cursor-not-allowed');
        if (photo.shopify_url) {
            buyBtn.innerHTML = `<span>Order Fine Art Print — $${fallbackPrice}</span> <span class="text-xs">&rarr;</span>`;
        } else {
            buyBtn.innerHTML = `<span>Inquire Print — $${fallbackPrice}</span> <span class="text-xs">&rarr;</span>`;
        }
    }
}

async function handleBuyPrintClick(event) {
    if (event) event.preventDefault();
    if (!currentAlbum || currentAlbum.length === 0) return;
    const photo = currentAlbum[currentIndex];
    const photoTitle = photo.print_title || currentModel;
    const sizeSelect = document.getElementById('print-size-select');
    const finishSelect = document.getElementById('print-finish-select');
    const size = sizeSelect ? sizeSelect.value : '';
    const finish = finishSelect ? finishSelect.value : '';
    const buyBtn = document.getElementById('buy-print-btn');

    if (currentActiveVariant && currentActiveVariant.availableForSale) {
        if (isCartBusy) return;
        isCartBusy = true;
        const originalHtml = buyBtn.innerHTML;
        buyBtn.innerHTML = `<span>Adding to Cart...</span>`;
        buyBtn.disabled = true;

        try {
            await addItemToCart(currentActiveVariant.id, 1);
            buyBtn.innerHTML = `<span>Added to Cart! ✓</span>`;
            setTimeout(() => {
                buyBtn.innerHTML = originalHtml;
                buyBtn.disabled = false;
                isCartBusy = false;
            }, 1200);
            toggleCartDrawer(true);
        } catch (err) {
            console.error('Error adding to cart:', err);
            buyBtn.innerHTML = `<span>Error Adding Item</span>`;
            setTimeout(() => {
                buyBtn.innerHTML = originalHtml;
                buyBtn.disabled = false;
                isCartBusy = false;
            }, 2000);
        }
    } else if (photo.shopify_url) {
        window.open(photo.shopify_url, '_blank');
    } else {
        const subject = encodeURIComponent(`Fine Art Print Inquiry: ${photoTitle} (${size})`);
        const body = encodeURIComponent(`Hi Leo,\n\nI would like to order an archival fine art print of:\nImage Title: ${photoTitle}\nFinish: ${finish}\nSize Requested: ${size}\n\nPlease let me know pricing, availability, and shipping details!\n\nBest,`);
        window.location.href = `mailto:hello@storyofleo.com?subject=${subject}&body=${body}`;
    }
}

async function addItemToCart(variantId, quantity = 1) {
    let cartId = localStorage.getItem(SHOPIFY_CONFIG.storageKey);
    let cart = null;

    if (cartId) {
        cart = await addLinesToCart(cartId, [{ merchandiseId: variantId, quantity }]);
        // If line add failed (e.g. cart expired on Shopify), create a fresh cart
        if (!cart) {
            cart = await createShopifyCart([{ merchandiseId: variantId, quantity }]);
        }
    } else {
        cart = await createShopifyCart([{ merchandiseId: variantId, quantity }]);
    }

    if (cart) {
        renderCartUI(cart);
    }
    return cart;
}

function toggleCartDrawer(forceOpen) {
    const drawer = document.getElementById('cart-drawer');
    const backdrop = document.getElementById('cart-drawer-backdrop');
    if (!drawer || !backdrop) return;

    const isOpen = drawer.classList.contains('translate-x-0');
    const shouldOpen = forceOpen !== undefined ? forceOpen : !isOpen;

    if (shouldOpen) {
        drawer.classList.remove('translate-x-full');
        drawer.classList.add('translate-x-0');
        backdrop.classList.remove('opacity-0', 'pointer-events-none');
        backdrop.classList.add('opacity-100');
        document.body.style.overflow = 'hidden';
    } else {
        drawer.classList.remove('translate-x-0');
        drawer.classList.add('translate-x-full');
        backdrop.classList.remove('opacity-100');
        backdrop.classList.add('opacity-0', 'pointer-events-none');
        const modal = document.getElementById('album-modal');
        if (!modal || modal.classList.contains('hidden')) {
            document.body.style.overflow = 'auto';
        }
    }
}

async function removeCartItem(lineId) {
    const cartId = localStorage.getItem(SHOPIFY_CONFIG.storageKey);
    if (!cartId || isCartBusy) return;
    isCartBusy = true;
    try {
        const updatedCart = await removeLinesFromCart(cartId, [lineId]);
        if (updatedCart) {
            renderCartUI(updatedCart);
        }
    } catch (e) {
        console.error('Error removing cart item:', e);
    } finally {
        isCartBusy = false;
    }
}

async function updateCartItemQuantity(lineId, quantity) {
    const cartId = localStorage.getItem(SHOPIFY_CONFIG.storageKey);
    if (!cartId || isCartBusy) return;
    if (quantity <= 0) {
        return removeCartItem(lineId);
    }
    isCartBusy = true;
    try {
        const updatedCart = await updateCartLines(cartId, [{ id: lineId, quantity }]);
        if (updatedCart) {
            renderCartUI(updatedCart);
        }
    } catch (e) {
        console.error('Error updating cart line quantity:', e);
    } finally {
        isCartBusy = false;
    }
}

function renderCartUI(cart) {
    currentCart = cart;
    const totalQty = cart ? (cart.totalQuantity || 0) : 0;
    
    // Update badge in desktop and mobile nav
    const badges = [
        document.getElementById('cart-counter-badge'),
        document.getElementById('cart-counter-badge-mobile')
    ];
    badges.forEach(b => {
        if (b) {
            b.innerText = totalQty;
            if (totalQty > 0) {
                b.classList.remove('hidden');
                b.classList.add('inline-flex');
            } else {
                b.classList.add('hidden');
                b.classList.remove('inline-flex');
            }
        }
    });

    const drawerCount = document.getElementById('cart-drawer-count');
    if (drawerCount) drawerCount.innerText = `(${totalQty} ${totalQty === 1 ? 'item' : 'items'})`;

    const emptyState = document.getElementById('cart-empty-state');
    const itemsContainer = document.getElementById('cart-items-container');
    const footer = document.getElementById('cart-footer');
    const subtotalEl = document.getElementById('cart-subtotal');
    const checkoutBtn = document.getElementById('cart-checkout-btn');

    const lines = cart?.lines?.edges || [];

    if (!cart || lines.length === 0) {
        if (emptyState) emptyState.classList.remove('hidden');
        if (itemsContainer) {
            itemsContainer.classList.add('hidden');
            itemsContainer.innerHTML = '';
        }
        if (footer) footer.classList.add('hidden');
        return;
    }

    if (emptyState) emptyState.classList.add('hidden');
    if (itemsContainer) itemsContainer.classList.remove('hidden');
    if (footer) footer.classList.remove('hidden');

    const subtotalAmount = cart.cost?.subtotalAmount?.amount || '0.00';
    const currency = cart.cost?.subtotalAmount?.currencyCode || 'USD';
    if (subtotalEl) {
        subtotalEl.innerText = `$${parseFloat(subtotalAmount).toFixed(2)} ${currency}`;
    }
    if (checkoutBtn && cart.checkoutUrl) {
        checkoutBtn.href = cart.checkoutUrl;
    }

    if (itemsContainer) {
        itemsContainer.innerHTML = lines.map(({ node }) => {
            const merchandise = node.merchandise;
            const lineId = node.id;
            const qty = node.quantity;
            const title = merchandise?.product?.title || 'Fine Art Print';
            const variantTitle = merchandise?.title || '';
            const lineTotal = parseFloat(node.cost?.totalAmount?.amount || 0).toFixed(2);
            const imgUrl = merchandise?.image?.url || '';

            return `
                <div class="flex gap-4 p-3 bg-[#1A1A1A] border border-[#6E727A]/20 rounded-sm">
                    ${imgUrl ? `<img src="${imgUrl}" alt="${title}" class="w-16 h-20 object-cover bg-black/40 flex-shrink-0 border border-white/10">` : `<div class="w-16 h-20 bg-[#252525] flex-shrink-0 flex items-center justify-center text-xs text-[#6E727A]">Print</div>`}
                    <div class="flex-1 flex flex-col justify-between min-w-0">
                        <div>
                            <div class="flex justify-between items-start gap-2">
                                <h4 class="font-serif text-sm text-[#F9F9FB] truncate">${title}</h4>
                                <button onclick="removeCartItem('${lineId}')" class="text-xs text-[#6E727A] hover:text-[#F9F9FB] transition-colors leading-none cursor-pointer" title="Remove">&times;</button>
                            </div>
                            <p class="text-[9px] uppercase tracking-wider text-[#6E727A] font-sans mt-0.5">${variantTitle}</p>
                        </div>
                        <div class="flex justify-between items-center mt-2">
                            <div class="flex items-center border border-[#6E727A]/30 text-xs">
                                <button onclick="updateCartItemQuantity('${lineId}', ${qty - 1})" class="px-2 py-0.5 hover:bg-white/10 text-[#6E727A] hover:text-white cursor-pointer">-</button>
                                <span class="px-2 py-0.5 text-[10px] text-white font-sans">${qty}</span>
                                <button onclick="updateCartItemQuantity('${lineId}', ${qty + 1})" class="px-2 py-0.5 hover:bg-white/10 text-[#6E727A] hover:text-white cursor-pointer">+</button>
                            </div>
                            <span class="font-sans text-xs font-bold text-[#F9F9FB]">$${lineTotal}</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    }
}

async function initCart() {
    const cartId = localStorage.getItem(SHOPIFY_CONFIG.storageKey);
    if (cartId) {
        try {
            const cart = await getCart(cartId);
            if (cart) {
                renderCartUI(cart);
                return;
            } else {
                localStorage.removeItem(SHOPIFY_CONFIG.storageKey);
            }
        } catch (e) {
            console.error('Error initializing cart:', e);
        }
    }
    renderCartUI(null);
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
    const cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer && cartDrawer.classList.contains('translate-x-0')) {
        if (e.key === 'Escape') {
            toggleCartDrawer(false);
            return;
        }
    }

    const modal = document.getElementById('album-modal');
    if (modal && modal.classList.contains('hidden')) return;

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
    initCart();

    const urlParams = new URLSearchParams(window.location.search);
    const initialCategory = urlParams.get('filter') || 'prints';
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
