/* ============================================================
   JABBOK PHOTOGRAPHY — Blog Page Script
   Loads all blogs (defaults + admin-added), hides deleted,
   sorts by date (latest first), renders full listing.
   ============================================================ */
(function () {
    'use strict';

    // ── Default blog posts (must match admin-page.js) ──
    const DEFAULT_BLOG = [
        {
            id: 'default-blog-1',
            title: '10 Tips for Stunning Golden Hour Photography',
            category: 'Tips & Tricks',
            excerpt: 'Master the art of shooting during the magical golden hour with these simple yet powerful techniques...',
            content: 'Golden hour — that magical window of warm, diffused light just after sunrise or before sunset — is every photographer\'s secret weapon. Here are 10 tips to help you capture breathtaking golden hour shots:\n\n1. Plan Ahead: Use apps to track the exact time of golden hour in your location.\n2. Arrive Early: Set up at least 20 minutes before golden hour begins.\n3. Shoot Into the Light: Backlighting creates stunning silhouettes and lens flare.\n4. Use a Wide Aperture: f/2.8 or lower gives beautiful bokeh with warm tones.\n5. Warm Your White Balance: Set it to "Shade" or "Cloudy" for extra warmth.\n6. Use Reflectors: Bounce that golden light to fill in shadows on your subject.\n7. Try Different Angles: Get low, shoot through objects, and experiment.\n8. Capture Movement: Flowing hair, fabric, or dust particles glow beautifully.\n9. Work Fast: Golden hour is short — have your compositions planned.\n10. Edit Lightly: The light does the work — don\'t over-process.\n\nThe golden hour transforms ordinary scenes into extraordinary photographs. Practice these techniques and watch your portfolio shine.',
            date: 'Mar 15, 2026',
            image: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80',
            isDefault: true
        },
        {
            id: 'default-blog-2',
            title: 'How to Prepare for Your Wedding Photoshoot',
            category: 'Weddings',
            excerpt: 'Everything you need to know to make sure your wedding photos are absolutely perfect on the big day...',
            content: 'Your wedding day is one of the most important days of your life, and great photos help preserve those precious memories forever. Here\'s how to prepare:\n\nBefore the Big Day:\n- Schedule an engagement shoot to get comfortable with the camera.\n- Create a shot list of must-have photos with your photographer.\n- Plan your timeline to allow plenty of time for photos during golden hour.\n- Scout locations together — your photographer can suggest the best spots.\n\nDay-of Tips:\n- Get ready in a well-lit room with clean backgrounds.\n- Keep your bouquet and accessories nearby for detail shots.\n- Trust your photographer — they know the best angles and poses.\n- Allow buffer time between events for candid moments.\n- Assign a point person so your photographer can focus on shooting.\n\nWhat to Wear:\n- Avoid overly busy patterns that distract from faces.\n- Coordinate — but don\'t match exactly — with your wedding party.\n- Consider how your outfit will look in movement and from all angles.\n\nRemember, the best wedding photos come from genuine emotions. Relax, enjoy the moment, and let the love shine through!',
            date: 'Feb 28, 2026',
            image: 'https://images.unsplash.com/photo-1537633552985-df8429e8048b?w=600&q=80',
            isDefault: true
        },
        {
            id: 'default-blog-3',
            title: 'My Journey Capturing the Northern Lights',
            category: 'Behind the Scenes',
            excerpt: 'A behind-the-scenes look at my recent expedition to Iceland in pursuit of the aurora borealis...',
            content: 'There are few experiences in photography as humbling and awe-inspiring as standing under the northern lights. Last winter, I traveled to Iceland on a mission to capture the aurora borealis in all its glory.\n\nThe Preparation:\nI spent weeks studying aurora forecasts, moon phases, and weather patterns. I packed my sturdiest tripod, fastest lenses (f/1.4 and f/2.8), and enough battery packs to survive sub-zero temperatures.\n\nThe Journey:\nWe drove hours from Reykjavik into the remote countryside, far from any light pollution. The first two nights were cloudy — patience is essential in this kind of photography. On the third night, the sky cleared, and what unfolded was beyond anything I could have imagined.\n\nThe Technical Setup:\n- ISO 3200-6400 for bright auroras\n- 15-25 second exposures on a sturdy tripod\n- Manual focus set to infinity with live view magnification\n- Shooting in RAW for maximum editing flexibility\n\nThe Experience:\nNo photo can truly capture what it feels like to watch the sky dance with green, purple, and pink light. The camera captures what the eye sees, but the feeling of standing in that silence, watching nature\'s greatest light show — that stays with you forever.\n\nThis trip reminded me why I became a photographer: to chase beauty and share it with the world.',
            date: 'Feb 10, 2026',
            image: 'https://images.unsplash.com/photo-1500534314209-a25ddb2bd429?w=600&q=80',
            isDefault: true
        }
    ];

    // ── Gather all blogs ──
    function getAllBlogs() {
        const deletedIds = JSON.parse(localStorage.getItem('jabbok_blog_deleted') || '[]');
        const customBlogs = JSON.parse(localStorage.getItem('jabbok_blog') || '[]');

        // Filter defaults
        const activeDefaults = DEFAULT_BLOG.filter(b => !deletedIds.includes(b.id));

        // Merge: custom blogs first (newest), then defaults
        const all = [...customBlogs, ...activeDefaults];

        // Sort by date descending (parse the date string)
        all.sort((a, b) => {
            const da = new Date(a.date || 0);
            const db = new Date(b.date || 0);
            return db - da;
        });

        return all;
    }

    // ── Render blog listing ──
    function renderBlogs() {
        const grid = document.getElementById('blogPageGrid');
        const empty = document.getElementById('blogPageEmpty');
        if (!grid) return;

        const blogs = getAllBlogs();
        grid.innerHTML = '';

        if (blogs.length === 0) {
            empty.style.display = 'flex';
            return;
        }
        empty.style.display = 'none';

        blogs.forEach((blog, index) => {
            const card = document.createElement('article');
            card.className = 'blog-page-card' + (index === 0 ? ' blog-featured' : '');

            card.innerHTML = `
                <div class="blog-page-image">
                    <img src="${blog.image || 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=600&q=80'}" alt="${blog.title || ''}" loading="lazy">
                    <span class="blog-date">${blog.date || ''}</span>
                    <span class="blog-category-tag">${blog.category || ''}</span>
                </div>
                <div class="blog-page-content">
                    <h2 class="blog-page-title">${blog.title || ''}</h2>
                    <p class="blog-page-excerpt">${blog.excerpt || ''}</p>
                    <div class="blog-page-body">${formatContent(blog.content || blog.excerpt || '')}</div>
                    <button class="blog-read-toggle" aria-label="Read more">
                        <span>Read Full Article</span>
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="18" height="18"><path d="M6 9l6 6 6-6"/></svg>
                    </button>
                </div>
            `;

            // Toggle expand/collapse
            const toggleBtn = card.querySelector('.blog-read-toggle');
            const body = card.querySelector('.blog-page-body');
            const excerpt = card.querySelector('.blog-page-excerpt');

            toggleBtn.addEventListener('click', () => {
                const isExpanded = card.classList.toggle('blog-expanded');
                if (isExpanded) {
                    body.style.display = 'block';
                    excerpt.style.display = 'none';
                    toggleBtn.querySelector('span').textContent = 'Collapse';
                    toggleBtn.querySelector('svg').style.transform = 'rotate(180deg)';
                } else {
                    body.style.display = 'none';
                    excerpt.style.display = '-webkit-box';
                    toggleBtn.querySelector('span').textContent = 'Read Full Article';
                    toggleBtn.querySelector('svg').style.transform = 'rotate(0deg)';
                }
            });

            grid.appendChild(card);
        });
    }

    // ── Format content paragraphs ──
    function formatContent(text) {
        if (!text) return '';
        return text.split('\n').filter(p => p.trim()).map(p => {
            const trimmed = p.trim();
            // If it looks like a heading (ends with colon and is short)
            if (trimmed.endsWith(':') && trimmed.length < 60) {
                return `<h3 style="color:var(--color-accent);font-family:var(--font-heading);font-size:1.1rem;margin:20px 0 8px;">${trimmed}</h3>`;
            }
            // If it starts with a number or dash (list item)
            if (/^[\d]+[.\)]\s/.test(trimmed) || trimmed.startsWith('- ')) {
                return `<p style="padding-left:16px;position:relative;margin:4px 0;">${trimmed}</p>`;
            }
            return `<p>${trimmed}</p>`;
        }).join('');
    }

    // ── Mobile hamburger ──
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');
    if (hamburger && navLinks) {
        hamburger.addEventListener('click', () => {
            navLinks.classList.toggle('active');
            hamburger.classList.toggle('active');
        });
    }

    // ── Back to top ──
    const backToTop = document.getElementById('backToTop');
    if (backToTop) {
        window.addEventListener('scroll', () => {
            backToTop.classList.toggle('visible', window.scrollY > 400);
        });
        backToTop.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // ── Header scroll effect ──
    const header = document.getElementById('header');
    if (header) {
        window.addEventListener('scroll', () => {
            header.classList.toggle('scrolled', window.scrollY > 50);
        });
        // Force solid on load (no hero slider on this page)
        header.classList.add('scrolled');
    }

    // ── Init ──
    renderBlogs();

})();
