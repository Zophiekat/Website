
document.addEventListener('DOMContentLoaded', function() {
    // Determine base path
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : '';

    // Load header and footer, then reveal the page
    const headerPromise = fetch(`${basePath}includes/header.html`)
        .then(response => {
            if (!response.ok) throw new Error('Header not found');
            return response.text();
        })
        .then(data => {
            const headerPlaceholder = document.getElementById('header-placeholder');
            if (headerPlaceholder) {
                // Adjust links in header
                let processedData = data;
                if (isPagesDir) {
                    // Add ../ to hrefs and srcs that don't start with http, #, mailto, or /
                    processedData = data.replace(/href="(?!(http|#|mailto|\/))(.*?)"/g, `href="../$2"`);
                    processedData = processedData.replace(/src="(?!(http|#|mailto|\/))(.*?)"/g, `src="../$2"`);
                }
                headerPlaceholder.innerHTML = processedData;
                
                // Initialize navigation features after header is loaded
                highlightCurrentPage();
                initMobileMenu();

                // Load socials into header (must happen after header is in DOM)
                fetch(`${basePath}includes/socials.html`)
                    .then(res => res.text())
                    .then(html => {
                        const socialsPlaceholder = document.getElementById('header-socials-placeholder');
                        if (socialsPlaceholder) socialsPlaceholder.innerHTML = html;
                    })
                    .catch(error => console.error('Error loading socials:', error));
            }
        })
        .catch(error => console.error('Error loading header:', error));
    
    const footerPromise = fetch(`${basePath}includes/footer.html`)
        .then(response => {
            if (!response.ok) throw new Error('Footer not found');
            return response.text();
        })
        .then(data => {
            const footerPlaceholder = document.getElementById('footer-placeholder');
            if (footerPlaceholder) {
                // Adjust links in footer if needed (similar to header)
                let processedData = data;
                if (isPagesDir) {
                     processedData = data.replace(/href="(?!(http|#|mailto|\/))(.*?)"/g, `href="../$2"`);
                     processedData = processedData.replace(/src="(?!(http|#|mailto|\/))(.*?)"/g, `src="../$2"`);
                }
                footerPlaceholder.innerHTML = processedData;
            }
        })
        .catch(error => console.error('Error loading footer:', error));

    // Reveal page once all includes are loaded
    Promise.all([headerPromise, footerPromise]).then(() => {
        document.body.classList.add('page-ready');

        // After page is ready, check if we should expand a collection from URL
        initCollectionRouting();
    });
    
    // Function to highlight current page in navigation
    function highlightCurrentPage() {
        let currentPage = window.location.pathname.split('/').pop();
        // Normalize home page identifier
        if (currentPage === '' || currentPage === 'index.html') {
            currentPage = 'home';
        }
        
        const navLinks = document.querySelectorAll('nav a');
        
        navLinks.forEach(link => {
            let linkHref = link.getAttribute('href');
            
            // Handle the home link special cases (/, ../, index.html)
            if (linkHref === '/' || linkHref === '../' || linkHref === 'index.html' || linkHref.endsWith('index.html')) {
                linkHref = 'home';
            } else {
                // For other pages, just get the filename
                linkHref = linkHref.split('/').pop();
            }
            
            if (currentPage === linkHref) {
                link.classList.add('active');
            }
        });
    }

    // Mobile Navigation Toggle
    function initMobileMenu() {
        const menuToggle = document.querySelector('.menu-toggle');
        const nav = document.querySelector('nav');
        
        if (menuToggle) {
            menuToggle.addEventListener('click', function() {
                menuToggle.classList.toggle('active');
                nav.classList.toggle('active');
            });
            
            // Close menu when clicking outside
            document.addEventListener('click', function(event) {
                if (!event.target.closest('nav') && !event.target.closest('.menu-toggle') && nav.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            });
        }
    }
    
    // Gallery Category Filters
    const categoryButtons = document.querySelectorAll('.category-btn');
    if (categoryButtons.length > 0) {
        categoryButtons.forEach(button => {
            button.addEventListener('click', function() {
                // Remove active class from all buttons
                categoryButtons.forEach(btn => btn.classList.remove('active'));
                
                // Add active class to clicked button
                this.classList.add('active');
                
                const category = this.textContent.toLowerCase();
                
                const message = document.createElement('div');
                message.textContent = `Filtering by: ${category}`;
                message.style.textAlign = 'center';
                message.style.padding = '10px';
                message.style.marginTop = '10px';
                message.style.backgroundColor = '#f8f9fa';
                message.style.borderRadius = '5px';
                
                // Remove any existing message
                const existingMessage = document.querySelector('.filter-message');
                if (existingMessage) {
                    existingMessage.remove();
                }
                
                // Add class for easy removal later
                message.classList.add('filter-message');
                
                // Add message after the category buttons
                const categorySection = document.querySelector('.category-buttons');
                categorySection.after(message);
                
                // Animate the gallery items (just for visual feedback)
                const galleryItems = document.querySelectorAll('.gallery-item');
                galleryItems.forEach(item => {
                    item.style.opacity = '0.5';
                    setTimeout(() => {
                        item.style.opacity = '1';
                    }, 300);
                });
            });
        });
    }

    // Smooth scrolling for anchor links
    const links = document.querySelectorAll('a[href^="#"]');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                targetElement.scrollIntoView({ behavior: 'smooth' });
                
                // Close mobile menu after click
                const menuToggle = document.querySelector('.menu-toggle');
                const nav = document.querySelector('nav');
                if (menuToggle && menuToggle.classList.contains('active')) {
                    menuToggle.classList.remove('active');
                    nav.classList.remove('active');
                }
            }
        });
    });

    // Gallery item click — load artwork page as overlay, or show detail panel
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid && !galleryGrid.dataset.lightboxBound) {
        galleryGrid.addEventListener('click', function(e) {
            const item = e.target.closest('.gallery-item');
            if (!item) return;
            if (item.dataset.href) {
                openArtworkPage(item.dataset.href);
            } else {
                openArtworkDetail(item);
            }
        });
        galleryGrid.dataset.lightboxBound = 'true';
    }

    // Prevent layout shift when hiding body scroll by compensating for scrollbar width
    function lockBodyScroll() {
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        if (scrollbarWidth > 0) document.body.style.paddingRight = scrollbarWidth + 'px';
    }
    function unlockBodyScroll() {
        document.body.style.overflow = '';
        document.body.style.paddingRight = '';
    }

    function openArtworkDetail(item) {
        const img = item.querySelector('img');
        const title = (img && img.alt) || item.querySelector('p')?.textContent || 'Artwork';
        const src = img ? img.src : '';
        const description = item.dataset.description || '';
        const date = item.dataset.date || '';
        const tagsRaw = item.dataset.tags || '';
        const downloadUrl = item.dataset.download || '';
        const tags = tagsRaw ? tagsRaw.split(',').map(t => t.trim()).filter(Boolean) : [];

        const dateHTML = date ? `<span class="artwork-detail__date">${date}</span>` : '';
        const descHTML = description ? `<p class="artwork-detail__description">${description}</p>` : '';
        const tagsHTML = tags.length ? `<div class="artwork-detail__tags">${tags.map(t => `<span class="artwork-detail__tag">${t}</span>`).join('')}</div>` : '';
        const downloadHTML = downloadUrl ? `<a class="artwork-detail__download" href="${downloadUrl}" download>&#8595; Download</a>` : '';

        const panel = document.createElement('div');
        panel.className = 'artwork-detail';
        panel.innerHTML = `
            <div class="artwork-detail__inner">
                <header class="artwork-detail__header">
                    <button class="artwork-detail__back">&#8592; Back</button>
                </header>
                <div class="artwork-detail__content">
                    <img class="artwork-detail__image" src="${src}" alt="${title}">
                    <div class="artwork-detail__info">
                        <h2 class="artwork-detail__title">${title}</h2>
                        ${dateHTML}
                        ${descHTML}
                        ${tagsHTML}
                        ${downloadHTML}
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(panel);
        lockBodyScroll();

        const closeDetail = () => {
            panel.remove();
            unlockBodyScroll();
        };

        panel.querySelector('.artwork-detail__back').addEventListener('click', closeDetail);
        panel.addEventListener('click', e => { if (e.target === panel) closeDetail(); });
        document.addEventListener('keydown', function escHandler(e) {
            if (e.key === 'Escape') {
                closeDetail();
                document.removeEventListener('keydown', escHandler);
            }
        });
    }

    async function openArtworkPage(href, options = {}) {
        const shouldPushState = options.pushState !== false;
        try {
            const response = await fetch(href);
            if (!response.ok) throw new Error('Not found');
            const html = await response.text();

            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const article = doc.querySelector('article.artwork-detail');
            if (!article) throw new Error('No artwork-detail article found');

            // Import into main document and switch to overlay mode
            const panel = document.importNode(article, true);
            panel.classList.remove('artwork-detail--page');

            // Push card below the sticky header
            const headerEl = document.getElementById('header-placeholder');
            if (headerEl) panel.style.paddingTop = (headerEl.offsetHeight + 16) + 'px';

            document.body.appendChild(panel);
            lockBodyScroll();

            // Update URL after appending so image src resolves against the current base first
            if (shouldPushState) {
                history.pushState({ type: 'artwork', href }, '', href);
            }

            const closePanel = () => {
                panel.remove();
                unlockBodyScroll();
                // Go back in history to restore the collection URL
                if (shouldPushState) history.back();
            };

            // Prevent the back link from navigating — close overlay instead
            panel.querySelector('.artwork-detail__back')?.addEventListener('click', e => {
                e.preventDefault();
                closePanel();
            });
            let panelDownX = 0, panelDownY = 0;
            panel.addEventListener('pointerdown', e => { panelDownX = e.clientX; panelDownY = e.clientY; });
            panel.addEventListener('click', e => {
                const dx = e.clientX - panelDownX, dy = e.clientY - panelDownY;
                if (Math.sqrt(dx * dx + dy * dy) > 5) return; // drag / text selection — ignore
                if (!e.target.closest('a, button, img, p, h1, h2, h3, h4, h5, h6, span, li, time, label, code, pre, strong, em')) closePanel();
            });
            document.addEventListener('keydown', function escHandler(e) {
                if (e.key === 'Escape') {
                    closePanel();
                    document.removeEventListener('keydown', escHandler);
                }
            });
        } catch (err) {
            console.error('Could not load artwork page:', err);
            window.location.href = href; // fallback: navigate directly
        }
    }

    // Form validation for contact form
    const contactForm = document.querySelector('.contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            let isValid = true;
            const nameInput = document.getElementById('name');
            const emailInput = document.getElementById('email');
            const messageInput = document.getElementById('message');
            
            // Reset previous error messages
            document.querySelectorAll('.error-message').forEach(el => el.remove());
            
            // Validate name
            if (!nameInput.value.trim()) {
                showError(nameInput, 'Please enter your name');
                isValid = false;
            }
            
            // Validate email
            if (!validateEmail(emailInput.value)) {
                showError(emailInput, 'Please enter a valid email address');
                isValid = false;
            }
            
            // Validate message
            if (!messageInput.value.trim()) {
                showError(messageInput, 'Please enter your message');
                isValid = false;
            }
            
            if (!isValid) {
                e.preventDefault();
            }
        });
    }
    
    // Helper function to validate email
    function validateEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    // Helper function to show error messages
    function showError(input, message) {
        const errorMessage = document.createElement('span');
        errorMessage.classList.add('error-message');
        errorMessage.textContent = message;
        errorMessage.style.color = 'red';
        errorMessage.style.fontSize = '0.8rem';
        errorMessage.style.display = 'block';
        errorMessage.style.marginTop = '5px';
        input.parentNode.insertBefore(errorMessage, input.nextSibling);
        input.style.borderColor = 'red';
    }

    // ══════════════════════════════════════════════
    // Collection Folder — expand/collapse + routing
    // ══════════════════════════════════════════════

    // Route map: URL path segments → collection data-collection values
    const collectionRoutes = {
        '3d-rigging': '3d-rigging',
        '3d-modelling': '3d-modelling',
        'tools': 'tools'
    };

    function initCollectionRouting() {
        const grid = document.getElementById('collections-grid');
        if (!grid) return;

        const folders = grid.querySelectorAll('.collection-folder');

        // Click handlers — card face expands, tab collapses
        folders.forEach(folder => {
            const cardFace = folder.querySelector('.collection-card-face');
            const tab = folder.querySelector('.collection-tab');

            if (cardFace) {
                cardFace.addEventListener('click', function() {
                    expandCollection(folder);
                });
            }

            if (tab) {
                tab.addEventListener('click', function() {
                    collapseCollection(folder);
                });
            }
        });

        // Check URL on initial load — expand matching collection or open artwork overlay
        const route = getRouteFromURL();
        if (route) {
            if (collectionRoutes[route]) {
                const target = grid.querySelector(`[data-collection="${collectionRoutes[route]}"]`);
                if (target) expandCollection(target, true);
            } else {
                // Check if this is an artwork page URL (e.g. 3d-modelling/azazel)
                const artworkItem = document.querySelector(`.gallery-item[data-href="/${route}/"]`);
                if (artworkItem) {
                    const parentFolder = artworkItem.closest('.collection-folder');
                    if (parentFolder) expandCollection(parentFolder, true);
                    // Open overlay without pushing state — we're already at the right URL
                    openArtworkPage(artworkItem.dataset.href, { pushState: false });
                }
            }
        }

        // Handle browser back/forward
        window.addEventListener('popstate', function() {
            const route = getRouteFromURL();
            const grid = document.getElementById('collections-grid');
            if (!grid) return;

            // Check if the new URL is an artwork page
            const artworkItem = route
                ? document.querySelector(`.gallery-item[data-href="/${route}/"]`)
                : null;

            if (artworkItem) {
                // Forward navigation to an artwork URL — open the overlay
                const openPanel = document.querySelector('.artwork-detail:not(.artwork-detail--page)');
                if (!openPanel) {
                    const parentFolder = artworkItem.closest('.collection-folder');
                    if (parentFolder && !parentFolder.classList.contains('expanded')) {
                        expandCollection(parentFolder, true);
                    }
                    openArtworkPage(artworkItem.dataset.href, { pushState: false });
                }
                return;
            }

            // Close any open artwork overlay (navigated away from artwork URL)
            const openPanel = document.querySelector('.artwork-detail:not(.artwork-detail--page)');
            if (openPanel) {
                openPanel.remove();
                unlockBodyScroll();
            }

            // Handle collection expand/collapse
            const currentExpanded = grid.querySelector('.collection-folder.expanded');
            if (route && collectionRoutes[route]) {
                const target = grid.querySelector(`[data-collection="${collectionRoutes[route]}"]`);
                if (target && target !== currentExpanded) {
                    if (currentExpanded) collapseCollection(currentExpanded, true);
                    expandCollection(target, true);
                }
            } else if (currentExpanded) {
                collapseCollection(currentExpanded, true);
            }
        });
    }

    function getRouteFromURL() {
        // Check for redirect from 404.html
        const redirectRoute = sessionStorage.getItem('spa-redirect-route');
        if (redirectRoute) {
            sessionStorage.removeItem('spa-redirect-route');
            history.replaceState(null, '', '/' + redirectRoute + '/');
            return redirectRoute;
        }

        // Parse current path: /3d-rigging/ → 3d-rigging
        const path = window.location.pathname.replace(/^\/|\/$/g, '');
        return path || null;
    }

    function expandCollection(folder, instant) {
        const grid = document.getElementById('collections-grid');
        const aboutSection = document.getElementById('about-section');
        if (!grid) return;

        // Update URL
        const route = folder.dataset.route;
        if (route && window.location.pathname !== route) {
            history.pushState({ collection: folder.dataset.collection }, '', route);
        }

        // Update page title
        const label = folder.querySelector('.collection-tab-label');
        if (label) {
            document.title = label.textContent + ' — Zophiekat';
        }

        // Apply expanded state
        if (instant) {
            // Skip animations for initial load / popstate
            folder.style.animation = 'none';
            folder.classList.add('expanded');
            grid.classList.add('has-expanded');
            if (aboutSection) aboutSection.classList.add('hidden');
            // Re-enable animations after a frame
            requestAnimationFrame(() => {
                folder.style.animation = '';
            });
        } else {
            grid.classList.add('has-expanded');
            folder.classList.add('expanded');
            if (aboutSection) aboutSection.classList.add('hidden');

        }

        // Build sibling tab row
        buildTabRow(folder);

        // Bind artwork detail handler for gallery images inside this collection
        const galleryGrid = folder.querySelector('.gallery-grid');
        if (galleryGrid && !galleryGrid.dataset.lightboxBound) {
            galleryGrid.addEventListener('click', function(e) {
                const item = e.target.closest('.gallery-item');
                if (!item) return;
                if (item.dataset.href) {
                    openArtworkPage(item.dataset.href);
                } else {
                    openArtworkDetail(item);
                }
            });
            galleryGrid.dataset.lightboxBound = 'true';
        }
    }

    function collapseCollection(folder, instant) {
        const grid = document.getElementById('collections-grid');
        const aboutSection = document.getElementById('about-section');
        if (!grid) return;

        // Update URL back to home
        if (window.location.pathname !== '/') {
            history.pushState(null, '', '/');
        }

        // Reset page title
        document.title = 'Zophiekat';

        // Tear down sibling tab row
        teardownTabRow(folder);

        // Remove expanded state
        folder.classList.remove('expanded');
        grid.classList.remove('has-expanded');
        if (aboutSection) aboutSection.classList.remove('hidden');

        if (!instant) {
            window.scrollTo({ top: 0, behavior: 'instant' });
        }
    }

    // ══════════════════════════════════════════════

    function buildTabRow(folder) {
        const grid = document.getElementById('collections-grid');
        const folders = Array.from(grid.querySelectorAll('.collection-folder'));
        const tab = folder.querySelector('.collection-tab');

        const row = document.createElement('div');
        row.className = 'collection-tab-row';

        // Insert row before the active tab, then populate in DOM order
        folder.insertBefore(row, tab);

        folders.forEach(f => {
            if (f === folder) {
                // Active tab — move the existing element into the row
                row.appendChild(tab);
            } else {
                const label = f.querySelector('.collection-tab-label').textContent;
                const iconSrc = f.dataset.icon;
                const iconHTML = iconSrc ? `<img src="${iconSrc}" class="collection-tab-icon" alt="">` : '';
                const sibTab = document.createElement('div');
                sibTab.className = 'collection-sibling-tab';
                sibTab.innerHTML = `${iconHTML}<span class="collection-tab-label">${label}</span>`;
                sibTab.addEventListener('click', () => {
                    collapseCollection(folder);
                    expandCollection(f);
                });
                row.appendChild(sibTab);
            }
        });
    }

    function teardownTabRow(folder) {
        const row = folder.querySelector('.collection-tab-row');
        if (!row) return;
        const tab = row.querySelector('.collection-tab');
        if (tab) folder.insertBefore(tab, row);
        row.remove();
    }

});