
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

    // Image gallery lightbox
    // Use event delegation for dynamically loaded images or just wait for load
    // Since images are hardcoded in HTML, this is fine, but let's be safe
    const galleryGrid = document.querySelector('.gallery-grid');
    if (galleryGrid) {
        galleryGrid.addEventListener('click', function(e) {
            if (e.target.tagName === 'IMG') {
                openLightbox(e.target);
            }
        });
    }

    function openLightbox(image) {
        // Create lightbox elements
        const lightbox = document.createElement('div');
        lightbox.classList.add('lightbox');
        
        const lightboxContent = document.createElement('div');
        lightboxContent.classList.add('lightbox-content');
        
        const closeBtn = document.createElement('span');
        closeBtn.classList.add('close-lightbox');
        closeBtn.innerHTML = '&times;';
        
        const img = document.createElement('img');
        img.src = image.src;
        img.alt = image.alt;
        
        const caption = document.createElement('p');
        caption.textContent = image.alt || 'Artwork';
        
        // Assemble and append lightbox to page
        lightboxContent.appendChild(closeBtn);
        lightboxContent.appendChild(img);
        lightboxContent.appendChild(caption);
        lightbox.appendChild(lightboxContent);
        document.body.appendChild(lightbox);
        
        // Prevent scrolling when lightbox is open
        document.body.style.overflow = 'hidden';
        
        // Close lightbox function
        const closeLightbox = function() {
            document.body.removeChild(lightbox);
            document.body.style.overflow = '';
        };
        
        // Close lightbox events
        closeBtn.addEventListener('click', closeLightbox);
        lightbox.addEventListener('click', function(e) {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
        
        // Close on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeLightbox();
            }
        });
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

        // Check URL on initial load — expand matching collection
        const route = getRouteFromURL();
        if (route && collectionRoutes[route]) {
            const target = grid.querySelector(`[data-collection="${collectionRoutes[route]}"]`);
            if (target) {
                // Expand immediately without animation on initial load
                expandCollection(target, true);
            }
        }

        // Handle browser back/forward
        window.addEventListener('popstate', function() {
            const route = getRouteFromURL();
            const grid = document.getElementById('collections-grid');
            if (!grid) return;

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
            // Scroll to top of the collection
            folder.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Re-bind lightbox for gallery images inside this collection
        const galleryGrid = folder.querySelector('.gallery-grid');
        if (galleryGrid && !galleryGrid.dataset.lightboxBound) {
            galleryGrid.addEventListener('click', function(e) {
                if (e.target.tagName === 'IMG') {
                    openLightbox(e.target);
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

        // Remove expanded state
        folder.classList.remove('expanded');
        grid.classList.remove('has-expanded');
        if (aboutSection) aboutSection.classList.remove('hidden');

        if (!instant) {
            // Scroll to top
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }

    // ══════════════════════════════════════════════

});