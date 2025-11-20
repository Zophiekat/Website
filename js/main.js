// Modern Art Portfolio JavaScript - 2023

document.addEventListener('DOMContentLoaded', function() {
    // Determine base path
    const isPagesDir = window.location.pathname.includes('/pages/');
    const basePath = isPagesDir ? '../' : '';

    // Load header
    fetch(`${basePath}includes/header.html`)
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
                    // Add ../ to hrefs that don't start with http, #, mailto, or /
                    processedData = data.replace(/href="(?!(http|#|mailto|\/))(.*?)"/g, `href="../$2"`);
                }
                headerPlaceholder.innerHTML = processedData;
                
                // Initialize navigation features after header is loaded
                highlightCurrentPage();
                initMobileMenu();
            }
        })
        .catch(error => console.error('Error loading header:', error));
    
    // Load footer
    fetch(`${basePath}includes/footer.html`)
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
                }
                footerPlaceholder.innerHTML = processedData;
            }
        })
        .catch(error => console.error('Error loading footer:', error));
    
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
                
                // For demo purposes only - in a real implementation, 
                // this would filter the gallery items based on categories
                // Here we'll just add a visual feedback
                const category = this.textContent.toLowerCase();
                
                // Show a message that this is just a demo
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
});