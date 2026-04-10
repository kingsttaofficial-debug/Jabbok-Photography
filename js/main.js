/* ========================================
   MERCY PHOTOGRAPHY — MAIN JAVASCRIPT
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // --- Preloader ---
    const preloader = document.getElementById('preloader');
    window.addEventListener('load', () => {
        setTimeout(() => preloader.classList.add('hidden'), 800);
    });
    // Fallback: hide preloader after 3s max
    setTimeout(() => preloader.classList.add('hidden'), 3000);

    // --- Header scroll effect ---
    const header = document.getElementById('header');
    const backToTop = document.getElementById('backToTop');

    window.addEventListener('scroll', () => {
        const scrollY = window.scrollY;
        header.classList.toggle('scrolled', scrollY > 80);
        backToTop.classList.toggle('visible', scrollY > 500);
    });

    // --- Mobile navigation ---
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('open');
        document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    // Close nav on link click
    navLinks.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('open');
            document.body.style.overflow = '';
        });
    });

    // --- Active nav link on scroll ---
    const sections = document.querySelectorAll('section[id]');
    const navLinkElements = document.querySelectorAll('.nav-link');

    function updateActiveNav() {
        const scrollY = window.scrollY + 200;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');
            if (scrollY >= top && scrollY < top + height) {
                navLinkElements.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === '#' + id) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', updateActiveNav);

    // --- Hero slider ---
    const heroSlides = document.querySelectorAll('.hero-slide');
    let currentSlide = 0;

    function nextHeroSlide() {
        heroSlides[currentSlide].classList.remove('active');
        currentSlide = (currentSlide + 1) % heroSlides.length;
        heroSlides[currentSlide].classList.add('active');
    }

    if (heroSlides.length > 1) {
        setInterval(nextHeroSlide, 6000);
    }

    // --- Portfolio filter ---
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryGrid = document.getElementById('galleryGrid');
    const videoGallery = document.getElementById('videoGallery');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.dataset.filter;

            if (filter === 'video') {
                galleryGrid.style.display = 'none';
                videoGallery.style.display = 'block';
            } else {
                galleryGrid.style.display = '';
                videoGallery.style.display = 'none';
                const currentItems = document.querySelectorAll('.gallery-item');
                currentItems.forEach(item => {
                    if (filter === 'all' || item.dataset.category === filter) {
                        item.classList.remove('hidden');
                    } else {
                        item.classList.add('hidden');
                    }
                });
            }
        });
    });

    // --- Video sub-filters ---
    const videoSubBtns = document.querySelectorAll('.video-sub-btn');
    videoSubBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            videoSubBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            const vfilter = btn.dataset.vfilter;
            const items = document.querySelectorAll('.playlist-item');
            let visibleCount = 0;
            items.forEach(item => {
                if (vfilter === 'all' || item.dataset.vcategory === vfilter) {
                    item.style.display = '';
                    visibleCount++;
                } else {
                    item.style.display = 'none';
                }
            });
            const countEl = document.getElementById('videoPlaylistCount');
            if (countEl) countEl.textContent = visibleCount + ' video' + (visibleCount !== 1 ? 's' : '');
        });
    });

    // --- YouTube video player ---
    window.playYouTubeVideo = function(videoId, itemEl) {
        const mainPlayer = document.getElementById('videoMain');
        mainPlayer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
        document.querySelectorAll('.playlist-item').forEach(el => el.classList.remove('active'));
        if (itemEl) itemEl.classList.add('active');
    };

    // =============================================
    // --- Load admin data from localStorage ---
    // =============================================

    const STAR_SVG = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';

    const SVC_ICONS = {
        heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>',
        camera: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>',
        people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>',
        briefcase: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>',
        video: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg>',
        folder: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path><line x1="12" y1="11" x2="12" y2="17"></line><line x1="9" y1="14" x2="15" y2="14"></line></svg>'
    };

    // 1. Load videos from localStorage
    try {
        const savedVideos = JSON.parse(localStorage.getItem('jabbok_videos'));
        if (savedVideos && savedVideos.length) {
            const playlistItems = document.getElementById('playlistItems');
            const videoEmpty = document.getElementById('videoEmpty');
            if (videoEmpty) videoEmpty.style.display = 'none';
            savedVideos.forEach(v => {
                const div = document.createElement('div');
                div.className = 'playlist-item';
                div.setAttribute('data-vcategory', v.category || 'all');
                div.setAttribute('onclick', `playYouTubeVideo('${v.ytId}', this)`);
                div.innerHTML = `
                    <img src="https://img.youtube.com/vi/${v.ytId}/mqdefault.jpg" alt="${v.title || ''}">
                    <span>${v.title || 'Untitled'}</span>
                `;
                playlistItems.appendChild(div);
            });
            const countEl = document.getElementById('videoPlaylistCount');
            if (countEl) countEl.textContent = savedVideos.length + ' video' + (savedVideos.length !== 1 ? 's' : '');
        }
    } catch (e) { /* ignore parse errors */ }

    // 2. Load blog posts from localStorage
    try {
        const deletedBlogs = JSON.parse(localStorage.getItem('jabbok_blog_deleted')) || [];
        const blogGrid = document.querySelector('.blog-grid');
        if (blogGrid) {
            const defaultBlogCards = blogGrid.querySelectorAll('article.blog-card');
            deletedBlogs.forEach(id => {
                const idx = parseInt(id.toString().replace('default-blog-', ''), 10);
                if (!isNaN(idx) && defaultBlogCards[idx]) {
                    defaultBlogCards[idx].style.display = 'none';
                }
            });

            const savedBlogs = JSON.parse(localStorage.getItem('jabbok_blog'));
            if (savedBlogs && savedBlogs.length) {
                savedBlogs.forEach(b => {
                    const article = document.createElement('article');
                    article.className = 'blog-card';
                    article.innerHTML = `
                        <div class="blog-image">
                            <img src="${b.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'}" alt="${b.title || ''}" loading="lazy">
                            <span class="blog-date">${b.date || ''}</span>
                        </div>
                        <div class="blog-content">
                            <span class="blog-category">${b.category || ''}</span>
                            <h3>${b.title || ''}</h3>
                            <p>${b.excerpt || ''}</p>
                            <a href="#" class="blog-link">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
                        </div>
                    `;
                    blogGrid.appendChild(article);
                });
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // 3. Apply hero changes from localStorage
    try {
        const heroDeleted = JSON.parse(localStorage.getItem('jabbok_hero_deleted')) || [];
        const heroSlider = document.querySelector('.hero-slider');
        if (heroSlider) {
            const defaultHeroSlides = heroSlider.querySelectorAll('.hero-slide');
            heroDeleted.forEach(id => {
                const idx = parseInt(id.toString().replace('default-hero-', ''), 10);
                if (!isNaN(idx) && defaultHeroSlides[idx]) {
                    defaultHeroSlides[idx].style.display = 'none';
                }
            });

            const heroData = JSON.parse(localStorage.getItem('jabbok_hero'));
            if (heroData) {
                if (heroData.images && heroData.images.length) {
                    heroData.images.forEach(img => {
                        const slide = document.createElement('div');
                        slide.className = 'hero-slide';
                        slide.style.backgroundImage = `url('${img.url || img.dataUrl || img}')`;
                        heroSlider.appendChild(slide);
                    });
                }
                if (heroData.video) {
                    const videoSlide = document.createElement('div');
                    videoSlide.className = 'hero-slide hero-video-slide';
                    videoSlide.innerHTML = `<video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;"><source src="${heroData.video}" type="video/mp4"></video>`;
                    heroSlider.appendChild(videoSlide);
                }
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // 4. Apply portfolio changes from localStorage
    try {
        const portDeleted = JSON.parse(localStorage.getItem('jabbok_portfolio_deleted')) || [];
        if (galleryGrid) {
            const defaultGalleryItems = galleryGrid.querySelectorAll('.gallery-item');
            portDeleted.forEach(id => {
                const idx = parseInt(id.toString().replace('default-port-', ''), 10);
                if (!isNaN(idx) && defaultGalleryItems[idx]) {
                    defaultGalleryItems[idx].style.display = 'none';
                }
            });

            const savedPortfolio = JSON.parse(localStorage.getItem('jabbok_portfolio'));
            if (savedPortfolio && savedPortfolio.length) {
                savedPortfolio.forEach(photo => {
                    const div = document.createElement('div');
                    div.className = 'gallery-item';
                    div.setAttribute('data-category', photo.category || 'all');
                    div.innerHTML = `
                        <img src="${photo.url || photo.dataUrl || ''}" alt="${photo.title || ''}" loading="lazy">
                        <div class="gallery-overlay">
                            <span class="gallery-category">${photo.category ? photo.category.charAt(0).toUpperCase() + photo.category.slice(1) : ''}</span>
                            <h3>${photo.title || ''}</h3>
                        </div>
                    `;
                    galleryGrid.appendChild(div);
                });
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // 5. Apply about image from localStorage
    try {
        const aboutData = JSON.parse(localStorage.getItem('jabbok_about'));
        if (aboutData && aboutData.dataUrl) {
            const aboutImg = document.querySelector('.about-img-wrapper img');
            if (aboutImg) aboutImg.src = aboutData.dataUrl;
        }
    } catch (e) { /* ignore parse errors */ }

    // 6. Apply testimonials from localStorage
    try {
        const testDeleted = JSON.parse(localStorage.getItem('jabbok_testimonials_deleted')) || [];
        const testimonialTrack = document.getElementById('testimonialTrack');
        if (testimonialTrack) {
            const defaultTestCards = testimonialTrack.querySelectorAll('.testimonial-card');
            testDeleted.forEach(id => {
                const idx = parseInt(id.toString().replace('default-test-', ''), 10);
                if (!isNaN(idx) && defaultTestCards[idx]) {
                    defaultTestCards[idx].style.display = 'none';
                }
            });

            const savedTestimonials = JSON.parse(localStorage.getItem('jabbok_testimonials'));
            if (savedTestimonials && savedTestimonials.length) {
                savedTestimonials.forEach(t => {
                    const card = document.createElement('div');
                    card.className = 'testimonial-card';
                    card.innerHTML = `
                        <div class="testimonial-stars">
                            ${STAR_SVG}${STAR_SVG}${STAR_SVG}${STAR_SVG}${STAR_SVG}
                        </div>
                        <p class="testimonial-text">"${t.text || ''}"</p>
                        <div class="testimonial-author">
                            <img src="${t.image || 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&q=80'}" alt="${t.name || ''}">
                            <div>
                                <strong>${t.name || 'Anonymous'}</strong>
                                <span>${t.role || ''}</span>
                            </div>
                        </div>
                    `;
                    testimonialTrack.appendChild(card);
                });
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // 7. Apply services from localStorage
    try {
        const svcDeleted = JSON.parse(localStorage.getItem('jabbok_services_deleted')) || [];
        const servicesGrid = document.getElementById('servicesGrid');
        if (servicesGrid) {
            const defaultSvcCards = servicesGrid.querySelectorAll('.service-card');
            svcDeleted.forEach(id => {
                const idx = parseInt(id.toString().replace('default-svc-', ''), 10);
                if (!isNaN(idx) && defaultSvcCards[idx]) {
                    defaultSvcCards[idx].style.display = 'none';
                }
            });

            const savedServices = JSON.parse(localStorage.getItem('jabbok_services'));
            if (savedServices && savedServices.length) {
                savedServices.forEach(svc => {
                    const card = document.createElement('div');
                    card.className = 'service-card';
                    const iconSvg = SVC_ICONS[svc.icon] || SVC_ICONS.camera;
                    const featuresHtml = (svc.features || []).map(f => `<li>${f}</li>`).join('');
                    card.innerHTML = `
                        <div class="service-icon">
                            ${iconSvg}
                        </div>
                        <h3>${svc.name || ''}</h3>
                        <p>${svc.description || ''}</p>
                        <div class="service-price">
                            <span>Starting from</span>
                            <strong>&#8377;${svc.price || '0'}</strong>
                        </div>
                        <ul class="service-features">
                            ${featuresHtml}
                        </ul>
                        <a href="#contact" class="btn btn-outline btn-sm">Get a Quote</a>
                    `;
                    servicesGrid.appendChild(card);
                });
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // 8. Apply contact info from localStorage
    try {
        const contactData = JSON.parse(localStorage.getItem('jabbok_contact'));
        if (contactData) {
            const contactItems = document.querySelectorAll('.contact-item');
            if (contactData.phone && contactItems[0]) {
                const phoneLink = contactItems[0].querySelector('a');
                if (phoneLink) {
                    phoneLink.href = 'tel:' + contactData.phone.replace(/\s+/g, '');
                    phoneLink.textContent = contactData.phone;
                }
            }
            if (contactData.email && contactItems[1]) {
                const emailLink = contactItems[1].querySelector('a');
                if (emailLink) {
                    emailLink.href = 'mailto:' + contactData.email;
                    emailLink.textContent = contactData.email;
                }
            }
            if (contactData.address && contactItems[2]) {
                const addressSpan = contactItems[2].querySelector('span');
                if (addressSpan) addressSpan.textContent = contactData.address;
            }
        }
    } catch (e) { /* ignore parse errors */ }

    // =============================================
    // --- End of admin data loading ---
    // =============================================

    // --- Lightbox ---
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const lightboxClose = document.querySelector('.lightbox-close');
    const lightboxPrev = document.querySelector('.lightbox-prev');
    const lightboxNext = document.querySelector('.lightbox-next');
    let lightboxImages = [];
    let lightboxIndex = 0;

    function getVisibleImages() {
        return Array.from(document.querySelectorAll('.gallery-item:not(.hidden) img'));
    }

    function openLightbox(index) {
        lightboxImages = getVisibleImages();
        lightboxIndex = index;
        const src = lightboxImages[lightboxIndex].src.replace('w=600', 'w=1200');
        lightboxImg.src = src;
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    function navigateLightbox(direction) {
        lightboxIndex = (lightboxIndex + direction + lightboxImages.length) % lightboxImages.length;
        const src = lightboxImages[lightboxIndex].src.replace('w=600', 'w=1200');
        lightboxImg.src = src;
    }

    // Re-query gallery items to include dynamically added ones
    const allGalleryItems = document.querySelectorAll('.gallery-item');
    allGalleryItems.forEach((item) => {
        item.addEventListener('click', () => {
            const visibleImages = getVisibleImages();
            const img = item.querySelector('img');
            const index = visibleImages.indexOf(img);
            if (index !== -1) openLightbox(index);
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', () => navigateLightbox(-1));
    lightboxNext.addEventListener('click', () => navigateLightbox(1));

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) closeLightbox();
    });

    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('active')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowLeft') navigateLightbox(-1);
        if (e.key === 'ArrowRight') navigateLightbox(1);
    });

    // --- Testimonial slider ---
    const tTrack = document.getElementById('testimonialTrack');
    const testimonialCards = document.querySelectorAll('.testimonial-card');
    const testimonialDots = document.getElementById('testimonialDots');
    const prevBtn = document.querySelector('.testimonial-prev');
    const nextBtn = document.querySelector('.testimonial-next');
    let testimonialIndex = 0;

    // Create dots
    testimonialCards.forEach((_, i) => {
        const dot = document.createElement('button');
        dot.classList.add('dot');
        if (i === 0) dot.classList.add('active');
        dot.addEventListener('click', () => goToTestimonial(i));
        testimonialDots.appendChild(dot);
    });

    const dots = testimonialDots.querySelectorAll('.dot');

    function goToTestimonial(index) {
        testimonialIndex = index;
        tTrack.style.transform = `translateX(-${index * 100}%)`;
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
    }

    prevBtn.addEventListener('click', () => {
        goToTestimonial((testimonialIndex - 1 + testimonialCards.length) % testimonialCards.length);
    });

    nextBtn.addEventListener('click', () => {
        goToTestimonial((testimonialIndex + 1) % testimonialCards.length);
    });

    // Auto-advance testimonials
    let testimonialTimer = setInterval(() => {
        goToTestimonial((testimonialIndex + 1) % testimonialCards.length);
    }, 5000);

    // Pause on hover
    const sliderEl = document.querySelector('.testimonials-slider');
    sliderEl.addEventListener('mouseenter', () => clearInterval(testimonialTimer));
    sliderEl.addEventListener('mouseleave', () => {
        testimonialTimer = setInterval(() => {
            goToTestimonial((testimonialIndex + 1) % testimonialCards.length);
        }, 5000);
    });

    // --- Counter animation ---
    const statNumbers = document.querySelectorAll('.stat-number');
    let counterAnimated = false;

    function animateCounters() {
        if (counterAnimated) return;
        const aboutSection = document.getElementById('about');
        const rect = aboutSection.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.8) {
            counterAnimated = true;
            statNumbers.forEach(num => {
                const target = parseInt(num.dataset.target);
                const duration = 2000;
                const step = target / (duration / 16);
                let current = 0;

                const timer = setInterval(() => {
                    current += step;
                    if (current >= target) {
                        current = target;
                        clearInterval(timer);
                    }
                    num.textContent = Math.floor(current);
                }, 16);
            });
        }
    }

    window.addEventListener('scroll', animateCounters);

    // --- Scroll reveal ---
    const revealElements = document.querySelectorAll(
        '.section-header, .gallery-filters, .gallery-item, .about-image, .about-content, ' +
        '.service-card, .blog-card, .contact-info, .contact-form'
    );

    revealElements.forEach(el => el.classList.add('reveal'));

    function checkReveal() {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            if (rect.top < window.innerHeight * 0.88) {
                el.classList.add('visible');
            }
        });
    }

    window.addEventListener('scroll', checkReveal);
    checkReveal(); // Check on load

    // --- Contact form ---
    const contactForm = document.getElementById('contactForm');
    const formMessage = document.getElementById('formMessage');

    contactForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const formData = new FormData(contactForm);
        const name = formData.get('name');
        const email = formData.get('email');

        // Simple validation
        if (!name || !email) {
            formMessage.className = 'form-message error';
            formMessage.textContent = 'Please fill in all required fields.';
            return;
        }

        // Simulate form submission
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        submitBtn.disabled = true;
        submitBtn.querySelector('span').textContent = 'Sending...';

        setTimeout(() => {
            formMessage.className = 'form-message success';
            formMessage.textContent = `Thank you, ${name}! Your message has been sent. I'll get back to you within 24 hours.`;
            contactForm.reset();
            submitBtn.disabled = false;
            submitBtn.querySelector('span').textContent = 'Send Message';

            setTimeout(() => {
                formMessage.className = 'form-message';
            }, 5000);
        }, 1500);
    });

    // --- Back to top ---
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // --- Smooth scroll for anchor links ---
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                const offset = header.offsetHeight;
                const position = target.offsetTop - offset;
                window.scrollTo({ top: position, behavior: 'smooth' });
            }
        });
    });

});
