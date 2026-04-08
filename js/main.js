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
                const galleryItems = document.querySelectorAll('.gallery-item');
                galleryItems.forEach(item => {
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

    galleryItems.forEach((item) => {
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
    const testimonialTrack = document.getElementById('testimonialTrack');
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
        testimonialTrack.style.transform = `translateX(-${index * 100}%)`;
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
