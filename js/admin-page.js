/* ========================================
   JABBOK PHOTOGRAPHY — STANDALONE ADMIN PAGE
   Login + Data-only CMS (no main page DOM)
   ======================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ============================
    // AUTH CONFIG
    // ============================
    const ADMIN_CREDS = { username: 'admin', password: 'jabbok2026' };
    const AUTH_KEY = 'jabbok_admin_auth';

    // ============================
    // STORAGE KEYS (shared with main site)
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
    const SVC_ICONS_LIST = ['heart', 'camera', 'people', 'briefcase', 'video', 'folder'];

    // ============================
    // UTILITIES
    // ============================
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
        if (!zoneEl || !fileInput) return;
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


    // ============================
    // LOGIN SYSTEM
    // ============================
    const loginScreen = document.getElementById('loginScreen');
    const dashboard = document.getElementById('adminDashboard');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');

    function checkAuth() {
        const auth = loadObj(AUTH_KEY);
        if (auth && auth.loggedIn) {
            showDashboard(auth);
        }
    }

    function showDashboard(auth) {
        document.body.classList.remove('login-page');
        document.body.classList.add('admin-dashboard');
        loginScreen.style.display = 'none';
        dashboard.style.display = 'block';

        // Set user info
        const nameEl = document.getElementById('userName');
        const avatarEl = document.getElementById('userAvatar');
        if (auth.name) nameEl.textContent = auth.name;
        if (auth.photo) {
            avatarEl.innerHTML = `<img src="${auth.photo}" alt="${auth.name || 'Admin'}">`;
        } else {
            avatarEl.textContent = (auth.name || auth.username || 'A').charAt(0).toUpperCase();
        }

        initAdminCMS();
    }

    // Username/password login
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value.trim();
        const password = document.getElementById('loginPassword').value;

        if (username === ADMIN_CREDS.username && password === ADMIN_CREDS.password) {
            const auth = { loggedIn: true, method: 'credentials', username, name: 'Admin' };
            store(AUTH_KEY, auth);
            loginError.style.display = 'none';
            showDashboard(auth);
        } else {
            loginError.style.display = 'block';
        }
    });

    // Google Sign-In
    document.getElementById('googleLoginBtn').addEventListener('click', () => {
        // Google Identity Services - using popup OAuth flow
        // For production, replace with your actual Google Client ID
        const CLIENT_ID = localStorage.getItem('jabbok_google_client_id') || '';

        if (!CLIENT_ID) {
            // Fallback: simulate Google login for demo (no client ID configured)
            const auth = {
                loggedIn: true,
                method: 'google',
                name: 'Google User',
                email: 'admin@jabbokphotography.com',
                photo: null
            };
            store(AUTH_KEY, auth);
            showDashboard(auth);
            toast('Signed in with Google (demo mode)');
            return;
        }

        // Real Google OAuth flow
        const redirectUri = window.location.origin + window.location.pathname;
        const scope = 'openid email profile';
        const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${CLIENT_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(scope)}`;
        window.location.href = authUrl;
    });

    // Handle Google OAuth redirect
    function handleGoogleRedirect() {
        const hash = window.location.hash;
        if (!hash || !hash.includes('access_token')) return false;

        const params = new URLSearchParams(hash.substring(1));
        const accessToken = params.get('access_token');
        if (!accessToken) return false;

        // Clear the hash
        history.replaceState(null, '', window.location.pathname);

        // Fetch user info from Google
        fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            headers: { Authorization: `Bearer ${accessToken}` }
        })
        .then(r => r.json())
        .then(user => {
            const auth = {
                loggedIn: true,
                method: 'google',
                name: user.name || user.email,
                email: user.email,
                photo: user.picture || null
            };
            store(AUTH_KEY, auth);
            showDashboard(auth);
            toast('Signed in with Google!');
        })
        .catch(() => {
            toast('Google sign-in failed');
        });

        return true;
    }

    // Logout
    document.getElementById('logoutBtn').addEventListener('click', () => {
        localStorage.removeItem(AUTH_KEY);
        document.body.classList.remove('admin-dashboard');
        document.body.classList.add('login-page');
        dashboard.style.display = 'none';
        loginScreen.style.display = '';
        toast('Logged out');
    });


    // ============================
    // ADMIN CMS (data-only, no page DOM)
    // ============================
    function initAdminCMS() {

        // --- Tabs ---
        document.querySelectorAll('.admin-tab').forEach(tab => {
            tab.addEventListener('click', () => {
                document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.admin-tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(tab.dataset.tab).classList.add('active');
            });
        });


        // ============================================================
        // 1. HERO — Manage hero images/video (data only)
        // ============================================================
        const heroVideoPreview = document.getElementById('heroVideoPreview');
        const heroImageList = document.getElementById('heroImageList');
        const heroVideoBadge = document.getElementById('heroVideoBadge');
        const heroImageCount = document.getElementById('heroImageCount');

        setupDropzone(document.getElementById('heroVideoDropzone'), document.getElementById('heroVideoFile'), {
            onFiles: async (files) => {
                const file = files[0];
                if (!file || file.type !== 'video/mp4') { toast('Only MP4 videos supported'); return; }
                if (file.size > 50 * 1024 * 1024) { toast('Max video size: 50MB'); return; }
                const dataUrl = await readFile(file);
                const heroData = loadObj(KEYS.hero) || { video: null, images: [] };
                heroData.video = { dataUrl, name: file.name };
                store(KEYS.hero, heroData);
                renderHero();
                toast('Hero video added!');
            }
        });

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
                renderHero();
                toast(`${files.length} image(s) added!`);
            }
        });

        function renderHero() {
            const heroData = loadObj(KEYS.hero) || { video: null, images: [] };

            // Video
            heroVideoPreview.innerHTML = '';
            if (heroData.video) {
                heroVideoBadge.textContent = 'Active';
                const row = document.createElement('div');
                row.className = 'media-row';
                row.innerHTML = `
                    <video src="${heroData.video.dataUrl}" muted style="width:80px;height:45px;object-fit:cover;border-radius:4px;"></video>
                    <div class="media-row-info"><strong>${heroData.video.name || 'Hero Video'}</strong><span>MP4 Video</span></div>
                    <button class="row-delete">&times;</button>
                `;
                row.querySelector('.row-delete').addEventListener('click', () => {
                    const d = loadObj(KEYS.hero) || { video: null, images: [] };
                    d.video = null;
                    store(KEYS.hero, d);
                    renderHero();
                    toast('Video removed');
                });
                heroVideoPreview.appendChild(row);
            } else {
                heroVideoBadge.textContent = 'None';
            }

            // Images
            heroImageList.innerHTML = '';
            heroData.images.forEach(img => {
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
                    renderHero();
                    toast('Image removed');
                });
                heroImageList.appendChild(card);
            });
            heroImageCount.textContent = heroData.images.length;
        }


        // ============================================================
        // 2. PORTFOLIO — Data-only management
        // ============================================================
        const portfolioList = document.getElementById('portfolioList');
        const portfolioCount = document.getElementById('portfolioCount');
        const portfolioEmpty = document.getElementById('portfolioEmpty');
        let portfolioFileData = null;

        setupDropzone(document.getElementById('portfolioDropzone'), document.getElementById('portfolioFile'), {
            onFiles: async (files) => {
                const file = files[0];
                if (!file || !validImg(file)) return;
                portfolioFileData = await readFile(file);
                document.getElementById('portfolioPreview').src = portfolioFileData;
                document.getElementById('portfolioPreviewContainer').style.display = 'block';
                document.getElementById('portfolioDropzone').style.display = 'none';
            }
        });

        document.getElementById('portfolioRemovePreview').addEventListener('click', () => {
            portfolioFileData = null;
            document.getElementById('portfolioPreviewContainer').style.display = 'none';
            document.getElementById('portfolioDropzone').style.display = 'block';
        });

        document.getElementById('portfolioAddBtn').addEventListener('click', () => {
            if (!portfolioFileData) { toast('Select a photo first'); return; }
            const title = document.getElementById('portfolioTitle').value.trim();
            const cat = document.getElementById('portfolioCategory').value;
            if (!title || !cat) { toast('Fill in title and category'); return; }
            const photo = { id: uid(), title, category: cat, dataUrl: portfolioFileData };
            const photos = load(KEYS.portfolio);
            photos.push(photo);
            store(KEYS.portfolio, photos);
            renderPortfolio();
            portfolioFileData = null;
            document.getElementById('portfolioPreviewContainer').style.display = 'none';
            document.getElementById('portfolioDropzone').style.display = 'block';
            document.getElementById('portfolioTitle').value = '';
            document.getElementById('portfolioCategory').selectedIndex = 0;
            toast('Photo added to portfolio!');
        });

        function renderPortfolio() {
            const photos = load(KEYS.portfolio);
            portfolioList.innerHTML = '';
            portfolioCount.textContent = photos.length;
            portfolioEmpty.style.display = photos.length === 0 ? 'block' : 'none';

            photos.forEach((photo, idx) => {
                const card = document.createElement('div');
                card.className = 'media-card';
                card.draggable = true;
                card.dataset.idx = idx;
                card.innerHTML = `
                    <img src="${photo.dataUrl}" alt="${photo.title}">
                    <span class="drag-handle">&#9776;</span>
                    <div class="media-info"><strong>${photo.title}</strong><br><span>${CAT_LABELS[photo.category] || photo.category}</span></div>
                    <button class="media-delete">&times;</button>
                `;
                card.querySelector('.media-delete').addEventListener('click', () => {
                    const arr = load(KEYS.portfolio);
                    arr.splice(idx, 1);
                    store(KEYS.portfolio, arr);
                    renderPortfolio();
                    toast('Photo deleted');
                });
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
                    renderPortfolio();
                    toast('Photos reordered!');
                });
                portfolioList.appendChild(card);
            });
        }


        // ============================================================
        // 3. ABOUT — Image management
        // ============================================================
        const aboutImagePreview = document.getElementById('aboutImagePreview');

        setupDropzone(document.getElementById('aboutDropzone'), document.getElementById('aboutFile'), {
            onFiles: async (files) => {
                const file = files[0];
                if (!file || !validImg(file)) return;
                const dataUrl = await readFile(file);
                store(KEYS.about, { dataUrl, name: file.name });
                renderAbout();
                toast('About image updated!');
            }
        });

        function renderAbout() {
            aboutImagePreview.innerHTML = '';
            const custom = loadObj(KEYS.about);
            if (custom) {
                const row = document.createElement('div');
                row.className = 'media-row';
                row.innerHTML = `
                    <img src="${custom.dataUrl}" alt="About photo" style="width:80px;height:56px;object-fit:cover;border-radius:4px;">
                    <div class="media-row-info"><strong>${custom.name || 'Custom Upload'}</strong><span>Current about image</span></div>
                    <button class="row-delete" title="Reset to default">&times;</button>
                `;
                row.querySelector('.row-delete').addEventListener('click', () => {
                    localStorage.removeItem(KEYS.about);
                    renderAbout();
                    toast('About image reset to default');
                });
                aboutImagePreview.appendChild(row);
            } else {
                aboutImagePreview.innerHTML = '<p style="color:var(--color-text-muted);font-size:0.85rem;">Using default image. Upload a new one above.</p>';
            }
        }


        // ============================================================
        // 4. TESTIMONIALS
        // ============================================================
        const testimonialListEl = document.getElementById('testimonialList');
        const testimonialCountEl = document.getElementById('testimonialCount');
        const testimonialEmptyEl = document.getElementById('testimonialEmpty');
        let testimonialPhotoData = null;

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
            renderTestimonials();
            document.getElementById('testimonialName').value = '';
            document.getElementById('testimonialService').value = '';
            document.getElementById('testimonialText').value = '';
            testimonialPhotoData = null;
            document.getElementById('testimonialPhotoPreview').style.display = 'none';
            document.getElementById('testimonialDropzone').style.display = 'block';
            toast('Testimonial added!');
        });

        function renderTestimonials() {
            const items = load(KEYS.testimonials);
            testimonialListEl.innerHTML = '';
            testimonialCountEl.textContent = items.length;
            testimonialEmptyEl.style.display = items.length === 0 ? 'block' : 'none';

            items.forEach(t => {
                const card = document.createElement('div');
                card.className = 'admin-testimonial-card';
                const photoHTML = t.photo
                    ? `<img class="tc-avatar" src="${t.photo}" alt="${t.name}">`
                    : `<div class="tc-avatar-placeholder">${t.name.charAt(0)}</div>`;
                card.innerHTML = `
                    ${photoHTML}
                    <div class="tc-body">
                        <strong>${t.name}</strong>
                        <div class="tc-meta">${t.service || ''} &bull; ${t.rating} stars</div>
                        <p>${t.text}</p>
                    </div>
                    <button class="tc-delete">&times;</button>
                `;
                card.querySelector('.tc-delete').addEventListener('click', () => {
                    let data = load(KEYS.testimonials);
                    data = data.filter(x => x.id !== t.id);
                    store(KEYS.testimonials, data);
                    renderTestimonials();
                    toast('Testimonial removed');
                });
                testimonialListEl.appendChild(card);
            });
        }


        // ============================================================
        // 5. SERVICES
        // ============================================================
        const serviceListEl = document.getElementById('serviceList');
        const serviceCountEl = document.getElementById('serviceCount');
        const serviceEmptyEl = document.getElementById('serviceEmpty');
        const serviceEditIdEl = document.getElementById('serviceEditId');

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
            renderServices();
            document.getElementById('serviceName').value = '';
            document.getElementById('serviceDesc').value = '';
            document.getElementById('servicePrice').value = '';
            document.getElementById('serviceFeatures').value = '';
            toast(editId ? 'Service updated!' : 'Service added!');
        });

        function renderServices() {
            const items = load(KEYS.services);
            serviceListEl.innerHTML = '';
            serviceCountEl.textContent = items.length;
            serviceEmptyEl.style.display = items.length === 0 ? 'block' : 'none';

            items.forEach(svc => {
                const card = document.createElement('div');
                card.className = 'admin-service-card';
                card.innerHTML = `
                    <div class="sc-info">
                        <strong>${svc.name}</strong><span>&#8377;${svc.price || '0'}</span>
                        <p>${svc.desc || ''}</p>
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
                    renderServices();
                    toast('Service deleted');
                });
                serviceListEl.appendChild(card);
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
            if (data) {
                document.getElementById('contactPhone').value = data.phone || '';
                document.getElementById('contactEmail').value = data.email || '';
                document.getElementById('contactAddress').value = data.address || '';
            }
        }

        document.getElementById('contactSaveBtn').addEventListener('click', () => {
            const phone = document.getElementById('contactPhone').value.trim();
            const email = document.getElementById('contactEmail').value.trim();
            const address = document.getElementById('contactAddress').value.trim();
            store(KEYS.contact, { phone, email, address });
            toast('Contact details saved!');
        });

        document.getElementById('branchAddBtn').addEventListener('click', () => {
            const name = document.getElementById('branchName').value.trim();
            const phone = document.getElementById('branchPhone').value.trim();
            const address = document.getElementById('branchAddress').value.trim();
            if (!name || !address) { toast('Branch name and address required'); return; }
            const branch = { id: uid(), name, phone, address };
            const arr = load(KEYS.branches);
            arr.push(branch);
            store(KEYS.branches, arr);
            renderBranches();
            document.getElementById('branchName').value = '';
            document.getElementById('branchPhone').value = '';
            document.getElementById('branchAddress').value = '';
            toast('Branch added!');
        });

        function renderBranches() {
            const arr = load(KEYS.branches);
            branchListEl.innerHTML = '';
            branchCountEl.textContent = arr.length;
            branchEmptyEl.style.display = arr.length === 0 ? 'block' : 'none';
            arr.forEach(b => {
                const card = document.createElement('div');
                card.className = 'admin-branch-card';
                card.innerHTML = `
                    <div class="branch-info"><strong>${b.name}</strong><span>${b.address}${b.phone ? ' | ' + b.phone : ''}</span></div>
                    <button class="branch-del">&times;</button>
                `;
                card.querySelector('.branch-del').addEventListener('click', () => {
                    let data = load(KEYS.branches);
                    data = data.filter(x => x.id !== b.id);
                    store(KEYS.branches, data);
                    renderBranches();
                    toast('Branch removed');
                });
                branchListEl.appendChild(card);
            });
        }


        // ============================================================
        // 7. BLOG
        // ============================================================
        const blogListEl = document.getElementById('blogList');
        const blogCountEl = document.getElementById('blogCount');
        const blogEmptyEl = document.getElementById('blogEmpty');
        const blogEditIdEl = document.getElementById('blogEditId');
        let blogImageData = null;

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
                if (idx !== -1) arr[idx] = { ...arr[idx], title, category, excerpt, date: dateStr, image: blogImageData || arr[idx].image };
                blogEditIdEl.value = '';
                document.getElementById('blogAddBtn').querySelector('span').textContent = 'Add Blog Post';
            } else {
                arr.push({ id: uid(), title, category, excerpt, date: dateStr, image: blogImageData || null });
            }

            store(KEYS.blog, arr);
            renderBlogs();
            document.getElementById('blogTitle').value = '';
            document.getElementById('blogExcerpt').value = '';
            document.getElementById('blogDate').value = '';
            blogImageData = null;
            document.getElementById('blogImagePreview').style.display = 'none';
            document.getElementById('blogImageDropzone').style.display = 'block';
            toast(editId ? 'Blog post updated!' : 'Blog post added!');
        });

        function renderBlogs() {
            const items = load(KEYS.blog);
            blogListEl.innerHTML = '';
            blogCountEl.textContent = items.length;
            blogEmptyEl.style.display = items.length === 0 ? 'block' : 'none';

            items.forEach(blog => {
                const card = document.createElement('div');
                card.className = 'admin-blog-card';
                const imgHTML = blog.image ? `<img src="${blog.image}" alt="${blog.title}">` : '<div class="blog-card-placeholder">&#9998;</div>';
                card.innerHTML = `
                    ${imgHTML}
                    <div class="blog-card-body">
                        <strong>${blog.title}</strong>
                        <div class="blog-card-meta">${blog.category} &bull; ${blog.date}</div>
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
                    renderBlogs();
                    toast('Blog post deleted');
                });
                blogListEl.appendChild(card);
            });
        }


        // ============================================================
        // 8. VIDEOS
        // ============================================================
        const videoListEl = document.getElementById('videoList');
        const videoCountEl = document.getElementById('videoCount');
        const videoEmptyAdminEl = document.getElementById('videoEmptyAdmin');

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
            renderVideos();
            document.getElementById('videoUrl').value = '';
            document.getElementById('videoTitle').value = '';
            toast('Video added!');
        });

        function renderVideos() {
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
                    renderVideos();
                    toast('Video removed');
                });
                videoListEl.appendChild(card);
            });
        }


        // ============================================================
        // INIT — Render all admin sections
        // ============================================================
        renderHero();
        renderPortfolio();
        renderAbout();
        renderTestimonials();
        renderServices();
        loadContactFields();
        renderBranches();
        renderBlogs();
        renderVideos();

    } // end initAdminCMS


    // ============================
    // BOOT
    // ============================
    if (!handleGoogleRedirect()) {
        checkAuth();
    }

});
