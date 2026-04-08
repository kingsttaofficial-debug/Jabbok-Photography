/* ========================================
   JABBOK PHOTOGRAPHY — FULL ADMIN CMS
   Shows ALL existing + custom content
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // UTILITIES
    // ============================
    const KEYS = {
        hero: 'jabbok_hero',
        heroDeleted: 'jabbok_hero_deleted',
        portfolio: 'jabbok_portfolio',
        portfolioDeleted: 'jabbok_portfolio_deleted',
        about: 'jabbok_about',
        testimonials: 'jabbok_testimonials',
        testimonialsDeleted: 'jabbok_testimonials_deleted',
        services: 'jabbok_services',
        servicesDeleted: 'jabbok_services_deleted',
        contact: 'jabbok_contact',
        branches: 'jabbok_branches',
        blog: 'jabbok_blog',
        blogDeleted: 'jabbok_blog_deleted',
        videos: 'jabbok_videos'
    };
    const CAT_LABELS = {
        'weddings': 'Weddings',
        'portraits': 'Portraits',
        'events': 'Events',
        'corporate': 'Corporate'
    };
    const SVC_ICONS = {
        heart: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>',
        camera: '<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/>',
        people: '<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        briefcase: '<rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
        video: '<polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>',
        folder: '<path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/><line x1="12" y1="11" x2="12" y2="17"/><line x1="9" y1="14" x2="15" y2="14"/>'
    };

    function store(key, data) {
        try { localStorage.setItem(key, JSON.stringify(data)); }
        catch { toast('Storage full! Remove items first.'); }
    }
    function load(key) {
        try { return JSON.parse(localStorage.getItem(key)) || []; } catch { return []; }
    }
    function loadObj(key) {
        try { return JSON.parse(localStorage.getItem(key)) || null; } catch { return null; }
    }
    function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 7); }

    function toast(msg) {
        let t = document.querySelector('.admin-toast');
        if (!t) { t = document.createElement('div'); t.className = 'admin-toast'; document.body.appendChild(t); }
        t.textContent = msg;
        t.classList.add('show');
        setTimeout(() => t.classList.remove('show'), 2500);
    }

    function readFile(file) {
        return new Promise((resolve, reject) => {
            const r = new FileReader();
            r.onload = e => resolve(e.target.result);
            r.onerror = reject;
            r.readAsDataURL(file);
        });
    }

    function validImg(file) {
        if (!['image/png', 'image/jpeg'].includes(file.type)) { toast('Only PNG & JPEG supported'); return false; }
        if (file.size > 10 * 1024 * 1024) { toast('Max file size: 10MB'); return false; }
        return true;
    }

    function setupDropzone(zoneEl, fileInput, opts = {}) {
        zoneEl.addEventListener('click', () => fileInput.click());
        zoneEl.addEventListener('dragover', e => { e.preventDefault(); zoneEl.classList.add('dragover'); });
        zoneEl.addEventListener('dragleave', () => zoneEl.classList.remove('dragover'));
        zoneEl.addEventListener('drop', e => {
            e.preventDefault();
            zoneEl.classList.remove('dragover');
            const files = opts.multiple ? Array.from(e.dataTransfer.files) : [e.dataTransfer.files[0]];
            if (opts.onFiles) opts.onFiles(files);
        });
        fileInput.addEventListener('change', () => {
            const files = opts.multiple ? Array.from(fileInput.files) : [fileInput.files[0]];
            if (opts.onFiles) opts.onFiles(files);
            fileInput.value = '';
        });
    }

    function extractImgName(src) {
        try {
            const url = new URL(src);
            const parts = url.pathname.split('/');
            return parts[parts.length - 1].substring(0, 12) + '...';
        } catch { return 'Image'; }
    }

    // ============================
    // ADMIN PANEL OPEN/CLOSE
    // ============================
    const adminPanel = document.getElementById('adminPanel');
    document.getElementById('adminToggle').addEventListener('click', () => {
        adminPanel.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    function closeAdmin() { adminPanel.classList.remove('active'); document.body.style.overflow = ''; }
    document.getElementById('adminClose').addEventListener('click', closeAdmin);
    adminPanel.addEventListener('click', e => { if (e.target === adminPanel) closeAdmin(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && adminPanel.classList.contains('active')) closeAdmin(); });

    // ============================
    // TABS
    // ============================
    document.querySelectorAll('.admin-tab').forEach(tab => {
        tab.addEventListener('click', () => {
            document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
            document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
            tab.classList.add('active');
            document.getElementById(tab.dataset.tab).classList.add('active');
        });
    });


    // ============================================================
    // 1. HERO SECTION — Show existing slides + custom uploads
    // ============================================================
    const heroSlider = document.querySelector('.hero-slider');
    const heroVideoPreview = document.getElementById('heroVideoPreview');
    const heroImageList = document.getElementById('heroImageList');
    const heroVideoBadge = document.getElementById('heroVideoBadge');
    const heroImageCount = document.getElementById('heroImageCount');

    // Scan existing hero slides from the DOM
    function getDefaultHeroSlides() {
        const slides = [];
        heroSlider.querySelectorAll('.hero-slide:not(.hero-slide-custom)').forEach((slide, i) => {
            const bg = slide.style.backgroundImage;
            const match = bg.match(/url\(["']?([^"')]+)["']?\)/);
            if (match) {
                slides.push({ id: 'default-hero-' + i, src: match[1], element: slide, isDefault: true });
            }
        });
        return slides;
    }

    // Video upload
    setupDropzone(document.getElementById('heroVideoDropzone'), document.getElementById('heroVideoFile'), {
        onFiles: async (files) => {
            const file = files[0];
            if (!file || file.type !== 'video/mp4') { toast('Only MP4 videos supported'); return; }
            if (file.size > 50 * 1024 * 1024) { toast('Max video size: 50MB'); return; }
            const dataUrl = await readFile(file);
            const heroData = loadObj(KEYS.hero) || { video: null, images: [] };
            heroData.video = { dataUrl, name: file.name };
            store(KEYS.hero, heroData);
            renderHeroAdmin();
            applyHeroToPage();
            toast('Hero video added!');
        }
    });

    // Image upload
    setupDropzone(document.getElementById('heroImageDropzone'), document.getElementById('heroImageFile'), {
        multiple: true,
        onFiles: async (files) => {
            const heroData = loadObj(KEYS.hero) || { video: null, images: [] };
            for (const file of files) {
                if (!validImg(file)) continue;
                const dataUrl = await readFile(file);
                heroData.images.push({ id: uid(), dataUrl, name: file.name });
            }
            store(KEYS.hero, heroData);
            renderHeroAdmin();
            applyHeroToPage();
            toast(`${files.length} image(s) added!`);
        }
    });

    function renderHeroAdmin() {
        const heroData = loadObj(KEYS.hero) || { video: null, images: [] };
        const deletedDefaults = load(KEYS.heroDeleted);

        // --- Video ---
        heroVideoPreview.innerHTML = '';
        if (heroData.video) {
            heroVideoBadge.textContent = 'Active';
            const row = document.createElement('div');
            row.className = 'media-row';
            row.innerHTML = `
                <video src="${heroData.video.dataUrl}" muted></video>
                <div class="media-row-info"><strong>${heroData.video.name || 'Hero Video'}</strong><span>MP4 Video &bull; Custom Upload</span></div>
                <button class="row-delete">&times;</button>
            `;
            row.querySelector('.row-delete').addEventListener('click', () => {
                const d = loadObj(KEYS.hero) || { video: null, images: [] };
                d.video = null;
                store(KEYS.hero, d);
                renderHeroAdmin();
                applyHeroToPage();
                toast('Video removed');
            });
            heroVideoPreview.appendChild(row);
        } else {
            heroVideoBadge.textContent = 'None';
        }

        // --- Images: defaults + custom ---
        heroImageList.innerHTML = '';
        let totalCount = 0;

        // Default hero slides
        const defaultSlides = getDefaultHeroSlides();
        defaultSlides.forEach(slide => {
            if (deletedDefaults.includes(slide.id)) return;
            totalCount++;
            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <img src="${slide.src}" alt="Hero slide">
                <div class="media-info"><strong>Default Slide</strong><br><span>Original</span></div>
                <button class="media-delete">&times;</button>
            `;
            card.querySelector('.media-delete').addEventListener('click', () => {
                const del = load(KEYS.heroDeleted);
                del.push(slide.id);
                store(KEYS.heroDeleted, del);
                slide.element.style.display = 'none';
                slide.element.classList.remove('active');
                renderHeroAdmin();
                toast('Hero slide hidden');
            });
            heroImageList.appendChild(card);
        });

        // Custom hero images
        heroData.images.forEach(img => {
            totalCount++;
            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <img src="${img.dataUrl}" alt="${img.name}">
                <div class="media-info"><strong>${img.name}</strong><br><span>Custom Upload</span></div>
                <button class="media-delete">&times;</button>
            `;
            card.querySelector('.media-delete').addEventListener('click', () => {
                const d = loadObj(KEYS.hero) || { video: null, images: [] };
                d.images = d.images.filter(i => i.id !== img.id);
                store(KEYS.hero, d);
                renderHeroAdmin();
                applyHeroToPage();
                toast('Hero image removed');
            });
            heroImageList.appendChild(card);
        });

        heroImageCount.textContent = totalCount;
    }

    function applyHeroToPage() {
        const data = loadObj(KEYS.hero);
        const deletedDefaults = load(KEYS.heroDeleted);

        // Hide deleted default slides
        getDefaultHeroSlides().forEach(slide => {
            if (deletedDefaults.includes(slide.id)) {
                slide.element.style.display = 'none';
                slide.element.classList.remove('active');
            }
        });

        // Remove existing custom video
        const existingVid = heroSlider.querySelector('video');
        if (existingVid) existingVid.remove();

        // Remove custom slides
        heroSlider.querySelectorAll('.hero-slide-custom').forEach(s => s.remove());

        if (data) {
            // Add video
            if (data.video) {
                const vid = document.createElement('video');
                vid.src = data.video.dataUrl;
                vid.autoplay = true; vid.muted = true; vid.loop = true; vid.playsInline = true;
                vid.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:0;';
                heroSlider.prepend(vid);
            }
            // Add custom images
            data.images.forEach(img => {
                const slide = document.createElement('div');
                slide.className = 'hero-slide hero-slide-custom';
                slide.style.backgroundImage = `url(${img.dataUrl})`;
                heroSlider.appendChild(slide);
            });
        }

        // Make sure at least one slide is active
        const visibleSlides = heroSlider.querySelectorAll('.hero-slide:not([style*="display: none"])');
        const hasActive = Array.from(visibleSlides).some(s => s.classList.contains('active'));
        if (!hasActive && visibleSlides.length > 0) {
            visibleSlides[0].classList.add('active');
        }
    }


    // ============================================================
    // 2. PORTFOLIO — Show ALL existing + custom images
    // ============================================================
    const galleryGrid = document.querySelector('.gallery-grid');
    const portfolioList = document.getElementById('portfolioList');
    const portfolioCount = document.getElementById('portfolioCount');
    const portfolioEmpty = document.getElementById('portfolioEmpty');
    let portfolioFile = null;

    // Scan all existing gallery items from the DOM
    function getDefaultPortfolioItems() {
        const items = [];
        galleryGrid.querySelectorAll('.gallery-item:not([data-upload-id])').forEach((el, i) => {
            const img = el.querySelector('img');
            const overlayH3 = el.querySelector('.gallery-overlay h3');
            const overlayCat = el.querySelector('.gallery-category');
            items.push({
                id: 'default-port-' + i,
                src: img ? img.src : '',
                title: overlayH3 ? overlayH3.textContent : 'Image ' + (i+1),
                category: el.dataset.category || '',
                element: el,
                isDefault: true
            });
        });
        return items;
    }

    setupDropzone(document.getElementById('portfolioDropzone'), document.getElementById('portfolioFile'), {
        onFiles: async (files) => {
            const file = files[0];
            if (!file || !validImg(file)) return;
            portfolioFile = file;
            const dataUrl = await readFile(file);
            document.getElementById('portfolioPreview').src = dataUrl;
            document.getElementById('portfolioPreviewContainer').style.display = 'block';
            document.getElementById('portfolioDropzone').style.display = 'none';
        }
    });

    document.getElementById('portfolioRemovePreview').addEventListener('click', () => {
        portfolioFile = null;
        document.getElementById('portfolioPreviewContainer').style.display = 'none';
        document.getElementById('portfolioDropzone').style.display = 'block';
    });

    document.getElementById('portfolioAddBtn').addEventListener('click', async () => {
        if (!portfolioFile) { toast('Select a photo first'); return; }
        const title = document.getElementById('portfolioTitle').value.trim();
        const cat = document.getElementById('portfolioCategory').value;
        if (!title || !cat) { toast('Fill in title and category'); return; }
        const dataUrl = await readFile(portfolioFile);
        const photo = { id: uid(), title, category: cat, dataUrl };
        const photos = load(KEYS.portfolio);
        photos.push(photo);
        store(KEYS.portfolio, photos);
        addPortfolioToPage(photo);
        renderPortfolioAdmin();
        portfolioFile = null;
        document.getElementById('portfolioPreviewContainer').style.display = 'none';
        document.getElementById('portfolioDropzone').style.display = 'block';
        document.getElementById('portfolioTitle').value = '';
        document.getElementById('portfolioCategory').selectedIndex = 0;
        toast('Photo added to portfolio!');
    });

    function addPortfolioToPage(photo) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.category = photo.category;
        item.dataset.uploadId = photo.id;
        item.innerHTML = `
            <img src="${photo.dataUrl}" alt="${photo.title}" loading="lazy">
            <div class="gallery-overlay">
                <span class="gallery-category">${CAT_LABELS[photo.category] || photo.category}</span>
                <h3>${photo.title}</h3>
            </div>
        `;
        item.addEventListener('click', () => {
            const imgs = Array.from(document.querySelectorAll('.gallery-item:not(.hidden) img'));
            const idx = imgs.indexOf(item.querySelector('img'));
            if (idx !== -1) {
                document.getElementById('lightboxImg').src = item.querySelector('img').src;
                document.getElementById('lightbox').classList.add('active');
                document.body.style.overflow = 'hidden';
            }
        });
        const activeFilter = document.querySelector('.filter-btn.active');
        if (activeFilter && activeFilter.dataset.filter !== 'all' && activeFilter.dataset.filter !== photo.category) {
            item.classList.add('hidden');
        }
        galleryGrid.appendChild(item);
    }

    function renderPortfolioAdmin() {
        const customPhotos = load(KEYS.portfolio);
        const deletedDefaults = load(KEYS.portfolioDeleted);
        const defaultItems = getDefaultPortfolioItems();

        portfolioList.innerHTML = '';
        let totalCount = 0;

        // Show default portfolio images
        defaultItems.forEach((item, idx) => {
            if (deletedDefaults.includes(item.id)) return;
            totalCount++;
            const card = document.createElement('div');
            card.className = 'media-card';
            card.innerHTML = `
                <img src="${item.src}" alt="${item.title}">
                <div class="media-info"><strong>${item.title}</strong><br><span>${CAT_LABELS[item.category] || item.category} &bull; Default</span></div>
                <button class="media-delete">&times;</button>
            `;
            card.querySelector('.media-delete').addEventListener('click', () => {
                const del = load(KEYS.portfolioDeleted);
                del.push(item.id);
                store(KEYS.portfolioDeleted, del);
                item.element.style.display = 'none';
                renderPortfolioAdmin();
                toast('Image removed from portfolio');
            });
            portfolioList.appendChild(card);
        });

        // Show custom portfolio images
        customPhotos.forEach((photo, idx) => {
            totalCount++;
            const card = document.createElement('div');
            card.className = 'media-card';
            card.draggable = true;
            card.dataset.idx = idx;
            card.innerHTML = `
                <img src="${photo.dataUrl}" alt="${photo.title}">
                <span class="drag-handle">&#9776;</span>
                <div class="media-info"><strong>${photo.title}</strong><br><span>${CAT_LABELS[photo.category] || photo.category} &bull; Custom</span></div>
                <button class="media-delete">&times;</button>
            `;
            card.querySelector('.media-delete').addEventListener('click', () => {
                const arr = load(KEYS.portfolio);
                arr.splice(idx, 1);
                store(KEYS.portfolio, arr);
                const el = galleryGrid.querySelector(`[data-upload-id="${photo.id}"]`);
                if (el) el.remove();
                renderPortfolioAdmin();
                toast('Photo deleted');
            });
            // Drag reorder (custom only)
            card.addEventListener('dragstart', e => { e.dataTransfer.setData('text/plain', idx); card.classList.add('dragging'); });
            card.addEventListener('dragend', () => card.classList.remove('dragging'));
            card.addEventListener('dragover', e => e.preventDefault());
            card.addEventListener('drop', e => {
                e.preventDefault();
                const fromIdx = parseInt(e.dataTransfer.getData('text/plain'));
                const toIdx = idx;
                if (fromIdx === toIdx) return;
                const arr = load(KEYS.portfolio);
                const [moved] = arr.splice(fromIdx, 1);
                arr.splice(toIdx, 0, moved);
                store(KEYS.portfolio, arr);
                rebuildCustomPortfolio();
                renderPortfolioAdmin();
                toast('Photos reordered!');
            });
            portfolioList.appendChild(card);
        });

        portfolioCount.textContent = totalCount;
        portfolioEmpty.style.display = totalCount === 0 ? 'block' : 'none';
    }

    function rebuildCustomPortfolio() {
        galleryGrid.querySelectorAll('[data-upload-id]').forEach(el => el.remove());
        load(KEYS.portfolio).forEach(p => addPortfolioToPage(p));
    }

    function applyPortfolioDeleted() {
        const deleted = load(KEYS.portfolioDeleted);
        getDefaultPortfolioItems().forEach(item => {
            if (deleted.includes(item.id)) {
                item.element.style.display = 'none';
            }
        });
    }


    // ============================================================
    // 3. ABOUT US — Show current image
    // ============================================================
    const aboutImgEl = document.querySelector('.about-img-wrapper img');
    const aboutImagePreview = document.getElementById('aboutImagePreview');
    const originalAboutSrc = aboutImgEl ? aboutImgEl.src : '';

    setupDropzone(document.getElementById('aboutDropzone'), document.getElementById('aboutFile'), {
        onFiles: async (files) => {
            const file = files[0];
            if (!file || !validImg(file)) return;
            const dataUrl = await readFile(file);
            store(KEYS.about, { dataUrl, name: file.name });
            renderAboutAdmin();
            if (aboutImgEl) aboutImgEl.src = dataUrl;
            toast('About image updated!');
        }
    });

    function renderAboutAdmin() {
        aboutImagePreview.innerHTML = '';
        const custom = loadObj(KEYS.about);
        const currentSrc = custom ? custom.dataUrl : originalAboutSrc;
        const label = custom ? (custom.name || 'Custom Upload') : 'Default Image';
        const typeLabel = custom ? 'Custom Upload' : 'Original';

        const row = document.createElement('div');
        row.className = 'media-row';
        row.innerHTML = `
            <img src="${currentSrc}" alt="About photo">
            <div class="media-row-info">
                <strong>${label}</strong>
                <span>Current about image &bull; ${typeLabel}</span>
            </div>
            ${custom ? '<button class="row-delete" title="Reset to default">&times;</button>' : ''}
        `;
        if (custom) {
            row.querySelector('.row-delete').addEventListener('click', () => {
                localStorage.removeItem(KEYS.about);
                if (aboutImgEl) aboutImgEl.src = originalAboutSrc;
                renderAboutAdmin();
                toast('About image reset to default');
            });
        }
        aboutImagePreview.appendChild(row);
    }


    // ============================================================
    // 4. TESTIMONIALS — Show existing + custom
    // ============================================================
    const testimonialTrack = document.getElementById('testimonialTrack');
    const testimonialListEl = document.getElementById('testimonialList');
    const testimonialCountEl = document.getElementById('testimonialCount');
    const testimonialEmptyEl = document.getElementById('testimonialEmpty');
    let testimonialPhotoData = null;

    // Scan existing testimonials from the DOM
    function getDefaultTestimonials() {
        const items = [];
        testimonialTrack.querySelectorAll('.testimonial-card:not([data-custom-id])').forEach((el, i) => {
            const textEl = el.querySelector('.testimonial-text');
            const nameEl = el.querySelector('.testimonial-author strong');
            const metaEl = el.querySelector('.testimonial-author span');
            const imgEl = el.querySelector('.testimonial-author img');
            const stars = el.querySelectorAll('.testimonial-stars svg').length;
            items.push({
                id: 'default-test-' + i,
                name: nameEl ? nameEl.textContent : 'Client',
                service: metaEl ? metaEl.textContent : '',
                text: textEl ? textEl.textContent.replace(/^"|"$/g, '') : '',
                rating: stars || 5,
                photo: imgEl ? imgEl.src : null,
                element: el,
                isDefault: true
            });
        });
        return items;
    }

    setupDropzone(document.getElementById('testimonialDropzone'), document.getElementById('testimonialPhotoFile'), {
        onFiles: async (files) => {
            const file = files[0];
            if (!file || !validImg(file)) return;
            testimonialPhotoData = await readFile(file);
            document.getElementById('testimonialPhotoImg').src = testimonialPhotoData;
            document.getElementById('testimonialPhotoPreview').style.display = 'block';
            document.getElementById('testimonialDropzone').style.display = 'none';
        }
    });

    document.getElementById('testimonialRemovePhoto').addEventListener('click', () => {
        testimonialPhotoData = null;
        document.getElementById('testimonialPhotoPreview').style.display = 'none';
        document.getElementById('testimonialDropzone').style.display = 'block';
    });

    function starsSVG(count) {
        const star = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>';
        return star.repeat(count);
    }

    document.getElementById('testimonialAddBtn').addEventListener('click', () => {
        const name = document.getElementById('testimonialName').value.trim();
        const service = document.getElementById('testimonialService').value.trim();
        const text = document.getElementById('testimonialText').value.trim();
        const rating = parseInt(document.getElementById('testimonialRating').value);
        if (!name || !text) { toast('Name and review text are required'); return; }
        const t = { id: uid(), name, service, text, rating, photo: testimonialPhotoData || null };
        const arr = load(KEYS.testimonials);
        arr.push(t);
        store(KEYS.testimonials, arr);
        addTestimonialToPage(t);
        renderTestimonialsAdmin();
        document.getElementById('testimonialName').value = '';
        document.getElementById('testimonialService').value = '';
        document.getElementById('testimonialText').value = '';
        testimonialPhotoData = null;
        document.getElementById('testimonialPhotoPreview').style.display = 'none';
        document.getElementById('testimonialDropzone').style.display = 'block';
        toast('Testimonial added!');
    });

    function addTestimonialToPage(t) {
        const card = document.createElement('div');
        card.className = 'testimonial-card';
        card.dataset.customId = t.id;
        const photoHTML = t.photo
            ? `<img src="${t.photo}" alt="${t.name}">`
            : `<div style="width:56px;height:56px;border-radius:50%;background:rgba(245,197,24,0.15);display:flex;align-items:center;justify-content:center;color:var(--color-accent);font-size:1.4rem;flex-shrink:0;">${t.name.charAt(0)}</div>`;
        card.innerHTML = `
            <div class="testimonial-stars">${starsSVG(t.rating)}</div>
            <p class="testimonial-text">"${t.text}"</p>
            <div class="testimonial-author">
                ${photoHTML}
                <div><strong>${t.name}</strong><span>${t.service || ''}</span></div>
            </div>
        `;
        testimonialTrack.appendChild(card);
    }

    function renderTestimonialsAdmin() {
        const customItems = load(KEYS.testimonials);
        const deletedDefaults = load(KEYS.testimonialsDeleted);
        const defaultItems = getDefaultTestimonials();

        testimonialListEl.innerHTML = '';
        let totalCount = 0;

        // Default testimonials
        defaultItems.forEach(t => {
            if (deletedDefaults.includes(t.id)) return;
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-testimonial-card';
            const photoHTML = t.photo
                ? `<img class="tc-avatar" src="${t.photo}" alt="${t.name}">`
                : `<div class="tc-avatar-placeholder">${t.name.charAt(0)}</div>`;
            card.innerHTML = `
                ${photoHTML}
                <div class="tc-body">
                    <strong>${t.name}</strong>
                    <div class="tc-meta">${t.service} &bull; ${t.rating} stars &bull; Default</div>
                    <p>${t.text}</p>
                </div>
                <button class="tc-delete">&times;</button>
            `;
            card.querySelector('.tc-delete').addEventListener('click', () => {
                const del = load(KEYS.testimonialsDeleted);
                del.push(t.id);
                store(KEYS.testimonialsDeleted, del);
                t.element.style.display = 'none';
                renderTestimonialsAdmin();
                toast('Testimonial removed');
            });
            testimonialListEl.appendChild(card);
        });

        // Custom testimonials
        customItems.forEach(t => {
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-testimonial-card';
            const photoHTML = t.photo
                ? `<img class="tc-avatar" src="${t.photo}" alt="${t.name}">`
                : `<div class="tc-avatar-placeholder">${t.name.charAt(0)}</div>`;
            card.innerHTML = `
                ${photoHTML}
                <div class="tc-body">
                    <strong>${t.name}</strong>
                    <div class="tc-meta">${t.service || ''} &bull; ${t.rating} stars &bull; Custom</div>
                    <p>${t.text}</p>
                </div>
                <button class="tc-delete">&times;</button>
            `;
            card.querySelector('.tc-delete').addEventListener('click', () => {
                let data = load(KEYS.testimonials);
                data = data.filter(x => x.id !== t.id);
                store(KEYS.testimonials, data);
                const pageCard = testimonialTrack.querySelector(`[data-custom-id="${t.id}"]`);
                if (pageCard) pageCard.remove();
                renderTestimonialsAdmin();
                toast('Testimonial removed');
            });
            testimonialListEl.appendChild(card);
        });

        testimonialCountEl.textContent = totalCount;
        testimonialEmptyEl.style.display = totalCount === 0 ? 'block' : 'none';
    }

    function applyTestimonialsDeleted() {
        const deleted = load(KEYS.testimonialsDeleted);
        getDefaultTestimonials().forEach(t => {
            if (deleted.includes(t.id)) t.element.style.display = 'none';
        });
    }


    // ============================================================
    // 5. SERVICES — Show existing + custom
    // ============================================================
    const servicesGrid = document.getElementById('servicesGrid');
    const serviceListEl = document.getElementById('serviceList');
    const serviceCountEl = document.getElementById('serviceCount');
    const serviceEmptyEl = document.getElementById('serviceEmpty');
    const serviceEditIdEl = document.getElementById('serviceEditId');

    // Scan existing service cards from the DOM
    function getDefaultServices() {
        const items = [];
        servicesGrid.querySelectorAll('.service-card:not([data-custom-svc])').forEach((el, i) => {
            const nameEl = el.querySelector('h3');
            const descEl = el.querySelector('p');
            const priceEl = el.querySelector('.service-price strong');
            const priceLabelEl = el.querySelector('.service-price span');
            const features = [];
            el.querySelectorAll('.service-features li').forEach(li => features.push(li.textContent));
            items.push({
                id: 'default-svc-' + i,
                name: nameEl ? nameEl.textContent : 'Service',
                desc: descEl ? descEl.textContent : '',
                price: priceEl ? priceEl.textContent.replace('₹', '').trim() : '',
                priceLabel: priceLabelEl ? priceLabelEl.textContent : 'Starting from',
                features: features,
                element: el,
                isDefault: true
            });
        });
        return items;
    }

    document.getElementById('serviceAddBtn').addEventListener('click', () => {
        const name = document.getElementById('serviceName').value.trim();
        const desc = document.getElementById('serviceDesc').value.trim();
        const price = document.getElementById('servicePrice').value.trim();
        const priceLabel = document.getElementById('servicePriceLabel').value.trim() || 'Starting from';
        const features = document.getElementById('serviceFeatures').value.trim().split('\n').filter(f => f.trim());
        const icon = document.getElementById('serviceIcon').value;
        if (!name) { toast('Service name is required'); return; }

        const editId = serviceEditIdEl.value;
        let arr = load(KEYS.services);

        if (editId) {
            const idx = arr.findIndex(s => s.id === editId);
            if (idx !== -1) arr[idx] = { ...arr[idx], name, desc, price, priceLabel, features, icon };
            serviceEditIdEl.value = '';
            document.getElementById('serviceAddBtn').querySelector('span').textContent = 'Add Service';
        } else {
            arr.push({ id: uid(), name, desc, price, priceLabel, features, icon });
        }

        store(KEYS.services, arr);
        rebuildCustomServices();
        renderServicesAdmin();
        document.getElementById('serviceName').value = '';
        document.getElementById('serviceDesc').value = '';
        document.getElementById('servicePrice').value = '';
        document.getElementById('serviceFeatures').value = '';
        toast(editId ? 'Service updated!' : 'Service added!');
    });

    function buildServiceCardHTML(svc) {
        const iconSvg = SVC_ICONS[svc.icon] || SVC_ICONS.heart;
        const featuresHTML = svc.features.map(f => `<li>${f}</li>`).join('');
        return `
            <div class="service-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">${iconSvg}</svg>
            </div>
            <h3>${svc.name}</h3>
            <p>${svc.desc || ''}</p>
            <div class="service-price">
                <span>${svc.priceLabel || 'Starting from'}</span>
                <strong>&#8377;${svc.price || '0'}</strong>
            </div>
            <ul class="service-features">${featuresHTML}</ul>
            <a href="#contact" class="btn btn-outline btn-sm">Get a Quote</a>
        `;
    }

    function rebuildCustomServices() {
        servicesGrid.querySelectorAll('[data-custom-svc]').forEach(el => el.remove());
        load(KEYS.services).forEach(svc => {
            const card = document.createElement('div');
            card.className = 'service-card';
            card.dataset.customSvc = svc.id;
            card.innerHTML = buildServiceCardHTML(svc);
            servicesGrid.appendChild(card);
        });
    }

    function renderServicesAdmin() {
        const customServices = load(KEYS.services);
        const deletedDefaults = load(KEYS.servicesDeleted);
        const defaultServices = getDefaultServices();

        serviceListEl.innerHTML = '';
        let totalCount = 0;

        // Default services
        defaultServices.forEach(svc => {
            if (deletedDefaults.includes(svc.id)) return;
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-service-card';
            card.innerHTML = `
                <div class="sc-info">
                    <strong>${svc.name}</strong><span>${svc.price}</span>
                    <p>${svc.desc} &bull; Default</p>
                </div>
                <div class="sc-actions">
                    <button class="sc-del" title="Delete">&times;</button>
                </div>
            `;
            card.querySelector('.sc-del').addEventListener('click', () => {
                const del = load(KEYS.servicesDeleted);
                del.push(svc.id);
                store(KEYS.servicesDeleted, del);
                svc.element.style.display = 'none';
                renderServicesAdmin();
                toast('Service removed');
            });
            serviceListEl.appendChild(card);
        });

        // Custom services
        customServices.forEach(svc => {
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-service-card';
            card.innerHTML = `
                <div class="sc-info">
                    <strong>${svc.name}</strong><span>&#8377;${svc.price || '0'}</span>
                    <p>${svc.desc || ''} &bull; Custom</p>
                </div>
                <div class="sc-actions">
                    <button class="sc-edit" title="Edit">&#9998;</button>
                    <button class="sc-del" title="Delete">&times;</button>
                </div>
            `;
            card.querySelector('.sc-edit').addEventListener('click', () => {
                document.getElementById('serviceName').value = svc.name;
                document.getElementById('serviceDesc').value = svc.desc || '';
                document.getElementById('servicePrice').value = svc.price || '';
                document.getElementById('servicePriceLabel').value = svc.priceLabel || 'Starting from';
                document.getElementById('serviceFeatures').value = (svc.features || []).join('\n');
                document.getElementById('serviceIcon').value = svc.icon || 'heart';
                serviceEditIdEl.value = svc.id;
                document.getElementById('serviceAddBtn').querySelector('span').textContent = 'Update Service';
                toast('Editing: ' + svc.name);
            });
            card.querySelector('.sc-del').addEventListener('click', () => {
                let data = load(KEYS.services);
                data = data.filter(x => x.id !== svc.id);
                store(KEYS.services, data);
                const pageCard = servicesGrid.querySelector(`[data-custom-svc="${svc.id}"]`);
                if (pageCard) pageCard.remove();
                renderServicesAdmin();
                toast('Service deleted');
            });
            serviceListEl.appendChild(card);
        });

        serviceCountEl.textContent = totalCount;
        serviceEmptyEl.style.display = totalCount === 0 ? 'block' : 'none';
    }

    function applyServicesDeleted() {
        const deleted = load(KEYS.servicesDeleted);
        getDefaultServices().forEach(svc => {
            if (deleted.includes(svc.id)) svc.element.style.display = 'none';
        });
    }


    // ============================================================
    // 6. CONTACT & BRANCHES
    // ============================================================
    const branchListEl = document.getElementById('branchList');
    const branchCountEl = document.getElementById('branchCount');
    const branchEmptyEl = document.getElementById('branchEmpty');

    function loadContactFields() {
        const data = loadObj(KEYS.contact);
        // Read current values from page as defaults
        const phoneEl = document.querySelector('.contact-item a[href^="tel"]');
        const emailEl = document.querySelector('.contact-item a[href^="mailto"]');
        const addressSpans = document.querySelectorAll('.contact-item');
        let currentAddress = '';
        addressSpans.forEach(item => {
            const span = item.querySelector('span');
            if (span && !item.querySelector('a')) currentAddress = span.textContent;
        });

        document.getElementById('contactPhone').value = data ? data.phone : (phoneEl ? phoneEl.textContent : '');
        document.getElementById('contactEmail').value = data ? data.email : (emailEl ? emailEl.textContent : '');
        document.getElementById('contactAddress').value = data ? data.address : currentAddress;
    }

    document.getElementById('contactSaveBtn').addEventListener('click', () => {
        const phone = document.getElementById('contactPhone').value.trim();
        const email = document.getElementById('contactEmail').value.trim();
        const address = document.getElementById('contactAddress').value.trim();
        store(KEYS.contact, { phone, email, address });
        applyContactToPage();
        toast('Contact details saved!');
    });

    function applyContactToPage() {
        const data = loadObj(KEYS.contact);
        if (!data) return;
        const phoneEl = document.querySelector('.contact-item a[href^="tel"]');
        const emailEl = document.querySelector('.contact-item a[href^="mailto"]');
        if (data.phone && phoneEl) {
            phoneEl.href = 'tel:' + data.phone.replace(/\s/g, '');
            phoneEl.textContent = data.phone;
        }
        if (data.email && emailEl) {
            emailEl.href = 'mailto:' + data.email;
            emailEl.textContent = data.email;
        }
        if (data.address) {
            document.querySelectorAll('.contact-item').forEach(item => {
                const span = item.querySelector('span');
                if (span && !item.querySelector('a')) span.textContent = data.address;
            });
        }
    }

    // Branches
    document.getElementById('branchAddBtn').addEventListener('click', () => {
        const name = document.getElementById('branchName').value.trim();
        const phone = document.getElementById('branchPhone').value.trim();
        const address = document.getElementById('branchAddress').value.trim();
        if (!name || !address) { toast('Branch name and address required'); return; }
        const branch = { id: uid(), name, phone, address };
        const arr = load(KEYS.branches);
        arr.push(branch);
        store(KEYS.branches, arr);
        addBranchToPage(branch);
        renderBranchesAdmin();
        document.getElementById('branchName').value = '';
        document.getElementById('branchPhone').value = '';
        document.getElementById('branchAddress').value = '';
        toast('Branch added!');
    });

    function addBranchToPage(branch) {
        const contactDetails = document.querySelector('.contact-details');
        if (!contactDetails || contactDetails.querySelector(`[data-branch-id="${branch.id}"]`)) return;
        const item = document.createElement('div');
        item.className = 'contact-item';
        item.dataset.branchId = branch.id;
        item.innerHTML = `
            <div class="contact-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
            </div>
            <div>
                <strong>${branch.name}</strong>
                <span>${branch.address}${branch.phone ? ' | ' + branch.phone : ''}</span>
            </div>
        `;
        contactDetails.appendChild(item);
    }

    function renderBranchesAdmin() {
        const arr = load(KEYS.branches);
        branchListEl.innerHTML = '';
        branchCountEl.textContent = arr.length;
        branchEmptyEl.style.display = arr.length === 0 ? 'block' : 'none';
        arr.forEach(b => {
            const card = document.createElement('div');
            card.className = 'admin-branch-card';
            card.innerHTML = `
                <div class="branch-info">
                    <strong>${b.name}</strong>
                    <span>${b.address}${b.phone ? ' | ' + b.phone : ''}</span>
                </div>
                <button class="branch-del">&times;</button>
            `;
            card.querySelector('.branch-del').addEventListener('click', () => {
                let data = load(KEYS.branches);
                data = data.filter(x => x.id !== b.id);
                store(KEYS.branches, data);
                const pageItem = document.querySelector(`[data-branch-id="${b.id}"]`);
                if (pageItem) pageItem.remove();
                renderBranchesAdmin();
                toast('Branch removed');
            });
            branchListEl.appendChild(card);
        });
    }


    // ============================================================
    // 7. BLOG — Show existing + custom
    // ============================================================
    const blogGrid = document.querySelector('.blog-grid');
    const blogListEl = document.getElementById('blogList');
    const blogCountEl = document.getElementById('blogCount');
    const blogEmptyEl = document.getElementById('blogEmpty');
    const blogEditIdEl = document.getElementById('blogEditId');
    let blogImageData = null;

    function getDefaultBlogs() {
        const items = [];
        if (!blogGrid) return items;
        blogGrid.querySelectorAll('.blog-card:not([data-custom-blog])').forEach((el, i) => {
            const imgEl = el.querySelector('.blog-image img');
            const dateEl = el.querySelector('.blog-date');
            const catEl = el.querySelector('.blog-category');
            const titleEl = el.querySelector('.blog-content h3');
            const excerptEl = el.querySelector('.blog-content p');
            items.push({
                id: 'default-blog-' + i,
                image: imgEl ? imgEl.src : '',
                date: dateEl ? dateEl.textContent : '',
                category: catEl ? catEl.textContent : '',
                title: titleEl ? titleEl.textContent : '',
                excerpt: excerptEl ? excerptEl.textContent : '',
                element: el,
                isDefault: true
            });
        });
        return items;
    }

    setupDropzone(document.getElementById('blogImageDropzone'), document.getElementById('blogImageFile'), {
        onFiles: async (files) => {
            const file = files[0];
            if (!file || !validImg(file)) return;
            blogImageData = await readFile(file);
            document.getElementById('blogImageImg').src = blogImageData;
            document.getElementById('blogImagePreview').style.display = 'block';
            document.getElementById('blogImageDropzone').style.display = 'none';
        }
    });

    document.getElementById('blogRemoveImage').addEventListener('click', () => {
        blogImageData = null;
        document.getElementById('blogImagePreview').style.display = 'none';
        document.getElementById('blogImageDropzone').style.display = 'block';
    });

    document.getElementById('blogAddBtn').addEventListener('click', () => {
        const title = document.getElementById('blogTitle').value.trim();
        const category = document.getElementById('blogCategory').value;
        const excerpt = document.getElementById('blogExcerpt').value.trim();
        const dateVal = document.getElementById('blogDate').value;
        if (!title) { toast('Blog title is required'); return; }

        const dateStr = dateVal ? new Date(dateVal + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const editId = blogEditIdEl.value;
        let arr = load(KEYS.blog);

        if (editId) {
            const idx = arr.findIndex(b => b.id === editId);
            if (idx !== -1) {
                arr[idx] = { ...arr[idx], title, category, excerpt, date: dateStr, image: blogImageData || arr[idx].image };
            }
            blogEditIdEl.value = '';
            document.getElementById('blogAddBtn').querySelector('span').textContent = 'Add Blog Post';
        } else {
            arr.push({ id: uid(), title, category, excerpt, date: dateStr, image: blogImageData || null });
        }

        store(KEYS.blog, arr);
        rebuildCustomBlogs();
        renderBlogAdmin();
        document.getElementById('blogTitle').value = '';
        document.getElementById('blogExcerpt').value = '';
        document.getElementById('blogDate').value = '';
        blogImageData = null;
        document.getElementById('blogImagePreview').style.display = 'none';
        document.getElementById('blogImageDropzone').style.display = 'block';
        toast(editId ? 'Blog post updated!' : 'Blog post added!');
    });

    function buildBlogCardHTML(blog) {
        const imgSrc = blog.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80';
        return `
            <div class="blog-image">
                <img src="${imgSrc}" alt="${blog.title}" loading="lazy">
                <span class="blog-date">${blog.date}</span>
            </div>
            <div class="blog-content">
                <span class="blog-category">${blog.category}</span>
                <h3>${blog.title}</h3>
                <p>${blog.excerpt || ''}</p>
                <a href="#" class="blog-link">Read More <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
            </div>
        `;
    }

    function rebuildCustomBlogs() {
        if (!blogGrid) return;
        blogGrid.querySelectorAll('[data-custom-blog]').forEach(el => el.remove());
        load(KEYS.blog).forEach(blog => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.dataset.customBlog = blog.id;
            card.innerHTML = buildBlogCardHTML(blog);
            blogGrid.appendChild(card);
        });
    }

    function renderBlogAdmin() {
        const customBlogs = load(KEYS.blog);
        const deletedDefaults = load(KEYS.blogDeleted);
        const defaultBlogs = getDefaultBlogs();

        blogListEl.innerHTML = '';
        let totalCount = 0;

        // Default blogs
        defaultBlogs.forEach(blog => {
            if (deletedDefaults.includes(blog.id)) return;
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-blog-card';
            const imgHTML = blog.image ? `<img src="${blog.image}" alt="${blog.title}">` : '<div class="blog-card-placeholder">&#9998;</div>';
            card.innerHTML = `
                ${imgHTML}
                <div class="blog-card-body">
                    <strong>${blog.title}</strong>
                    <div class="blog-card-meta">${blog.category} &bull; ${blog.date} &bull; Default</div>
                    <p>${blog.excerpt}</p>
                </div>
                <div class="blog-card-actions">
                    <button class="bc-del" title="Delete">&times;</button>
                </div>
            `;
            card.querySelector('.bc-del').addEventListener('click', () => {
                const del = load(KEYS.blogDeleted);
                del.push(blog.id);
                store(KEYS.blogDeleted, del);
                blog.element.style.display = 'none';
                renderBlogAdmin();
                toast('Blog post removed');
            });
            blogListEl.appendChild(card);
        });

        // Custom blogs
        customBlogs.forEach(blog => {
            totalCount++;
            const card = document.createElement('div');
            card.className = 'admin-blog-card';
            const imgHTML = blog.image ? `<img src="${blog.image}" alt="${blog.title}">` : '<div class="blog-card-placeholder">&#9998;</div>';
            card.innerHTML = `
                ${imgHTML}
                <div class="blog-card-body">
                    <strong>${blog.title}</strong>
                    <div class="blog-card-meta">${blog.category} &bull; ${blog.date} &bull; Custom</div>
                    <p>${blog.excerpt || ''}</p>
                </div>
                <div class="blog-card-actions">
                    <button class="bc-edit" title="Edit">&#9998;</button>
                    <button class="bc-del" title="Delete">&times;</button>
                </div>
            `;
            card.querySelector('.bc-edit').addEventListener('click', () => {
                document.getElementById('blogTitle').value = blog.title;
                document.getElementById('blogCategory').value = blog.category;
                document.getElementById('blogExcerpt').value = blog.excerpt || '';
                blogEditIdEl.value = blog.id;
                if (blog.image) {
                    blogImageData = blog.image;
                    document.getElementById('blogImageImg').src = blog.image;
                    document.getElementById('blogImagePreview').style.display = 'block';
                    document.getElementById('blogImageDropzone').style.display = 'none';
                }
                document.getElementById('blogAddBtn').querySelector('span').textContent = 'Update Blog Post';
                toast('Editing: ' + blog.title);
            });
            card.querySelector('.bc-del').addEventListener('click', () => {
                let data = load(KEYS.blog);
                data = data.filter(x => x.id !== blog.id);
                store(KEYS.blog, data);
                if (blogGrid) {
                    const el = blogGrid.querySelector(`[data-custom-blog="${blog.id}"]`);
                    if (el) el.remove();
                }
                renderBlogAdmin();
                toast('Blog post deleted');
            });
            blogListEl.appendChild(card);
        });

        blogCountEl.textContent = totalCount;
        blogEmptyEl.style.display = totalCount === 0 ? 'block' : 'none';
    }

    function applyBlogDeleted() {
        const deleted = load(KEYS.blogDeleted);
        getDefaultBlogs().forEach(blog => {
            if (deleted.includes(blog.id)) blog.element.style.display = 'none';
        });
    }


    // ============================================================
    // 8. VIDEOS — YouTube link management
    // ============================================================
    const videoListEl = document.getElementById('videoList');
    const videoCountEl = document.getElementById('videoCount');
    const videoEmptyAdminEl = document.getElementById('videoEmptyAdmin');
    const playlistItemsEl = document.getElementById('playlistItems');
    const videoPlaylistCountEl = document.getElementById('videoPlaylistCount');
    const videoMainEl = document.getElementById('videoMain');

    function extractYouTubeId(url) {
        const patterns = [
            /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
            /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        for (const p of patterns) {
            const m = url.match(p);
            if (m) return m[1];
        }
        return null;
    }

    document.getElementById('videoAddBtn').addEventListener('click', () => {
        const url = document.getElementById('videoUrl').value.trim();
        const title = document.getElementById('videoTitle').value.trim();
        const category = document.getElementById('videoCategory').value;
        if (!url) { toast('YouTube URL is required'); return; }
        const ytId = extractYouTubeId(url);
        if (!ytId) { toast('Invalid YouTube URL'); return; }
        if (!title) { toast('Video title is required'); return; }

        const video = { id: uid(), ytId, title, category, url };
        const arr = load(KEYS.videos);
        arr.push(video);
        store(KEYS.videos, arr);
        renderVideoAdmin();
        renderVideoPlaylist();
        document.getElementById('videoUrl').value = '';
        document.getElementById('videoTitle').value = '';
        toast('Video added!');
    });

    function renderVideoAdmin() {
        const videos = load(KEYS.videos);
        videoListEl.innerHTML = '';
        videoCountEl.textContent = videos.length;
        videoEmptyAdminEl.style.display = videos.length === 0 ? 'block' : 'none';

        videos.forEach(v => {
            const card = document.createElement('div');
            card.className = 'admin-video-card';
            card.innerHTML = `
                <div class="vid-thumb"><img src="https://img.youtube.com/vi/${v.ytId}/mqdefault.jpg" alt="${v.title}"></div>
                <div class="vid-info">
                    <strong>${v.title}</strong>
                    <span>${v.category}</span>
                </div>
                <button class="vid-del">&times;</button>
            `;
            card.querySelector('.vid-del').addEventListener('click', () => {
                let data = load(KEYS.videos);
                data = data.filter(x => x.id !== v.id);
                store(KEYS.videos, data);
                renderVideoAdmin();
                renderVideoPlaylist();
                toast('Video removed');
            });
            videoListEl.appendChild(card);
        });
    }

    function renderVideoPlaylist() {
        const videos = load(KEYS.videos);
        const emptyEl = document.getElementById('videoEmpty');

        // Clear playlist items except the empty message
        playlistItemsEl.querySelectorAll('.playlist-item').forEach(el => el.remove());

        if (videos.length === 0) {
            if (emptyEl) emptyEl.style.display = 'block';
            videoPlaylistCountEl.textContent = '0 videos';
            // Reset player
            videoMainEl.innerHTML = `<div class="video-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="64" height="64"><polygon points="5 3 19 12 5 21 5 3"/></svg><p>Select a video to play</p></div>`;
            return;
        }

        if (emptyEl) emptyEl.style.display = 'none';
        videoPlaylistCountEl.textContent = videos.length + ' video' + (videos.length !== 1 ? 's' : '');

        videos.forEach((v, i) => {
            const item = document.createElement('div');
            item.className = 'playlist-item';
            item.dataset.vcategory = v.category;
            item.innerHTML = `
                <div class="playlist-thumb">
                    <img src="https://img.youtube.com/vi/${v.ytId}/mqdefault.jpg" alt="${v.title}">
                    <div class="play-icon"><svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3"/></svg></div>
                </div>
                <div class="playlist-info">
                    <strong>${v.title}</strong>
                    <span>${v.category}</span>
                </div>
            `;
            item.addEventListener('click', () => {
                if (typeof window.playYouTubeVideo === 'function') {
                    window.playYouTubeVideo(v.ytId, item);
                }
            });
            playlistItemsEl.appendChild(item);
        });

        // Auto-play first video
        const activeFilter = document.querySelector('.video-sub-btn.active');
        const vfilter = activeFilter ? activeFilter.dataset.vfilter : 'all';
        const firstVisible = playlistItemsEl.querySelector(vfilter === 'all' ? '.playlist-item' : `.playlist-item[data-vcategory="${vfilter}"]`);
        if (firstVisible) firstVisible.click();
    }


    // ============================================================
    // INIT — Load & render everything
    // ============================================================

    // Apply deletions to defaults
    applyHeroToPage();
    applyPortfolioDeleted();
    applyTestimonialsDeleted();
    applyServicesDeleted();
    applyContactToPage();
    applyBlogDeleted();

    // Load custom content onto the page
    load(KEYS.portfolio).forEach(p => addPortfolioToPage(p));
    load(KEYS.testimonials).forEach(t => addTestimonialToPage(t));
    rebuildCustomServices();
    load(KEYS.branches).forEach(b => addBranchToPage(b));
    rebuildCustomBlogs();

    // Apply about image
    const aboutData = loadObj(KEYS.about);
    if (aboutData && aboutImgEl) aboutImgEl.src = aboutData.dataUrl;

    // Render admin panels
    renderHeroAdmin();
    renderPortfolioAdmin();
    renderAboutAdmin();
    renderTestimonialsAdmin();
    renderServicesAdmin();
    loadContactFields();
    renderBranchesAdmin();
    renderBlogAdmin();
    renderVideoAdmin();
    renderVideoPlaylist();

});
