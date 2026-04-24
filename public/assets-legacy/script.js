/* ============================================================
   VAIRAL — script.js
   1. Sparkle / Glow cursor system
   2. Scroll reveal (IntersectionObserver)
   3. Nav scroll shrink
   4. Mobile menu
   5. Case Studies interactive panel
   ============================================================ */

/* ── 1. SPARKLE CURSOR SYSTEM ────────────────────────────── */
(function () {
  let mouseX = -300, mouseY = -300;

  // Colour palette for sparkle particles
  const sparkleColors = [
    '#4671F6', '#6e8fff', '#a855f7', '#c084fc',
    '#ffffff', '#93c5fd', '#818cf8'
  ];

  let lastSparkleTime = 0;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;

    // Throttle sparkles to every ~12ms for a very dense, rich glitter trail
    const now = Date.now();
    if (now - lastSparkleTime > 12) {
      lastSparkleTime = now;
      spawnSparkle(mouseX, mouseY);
      // Spawn a second particle sometimes for extra density
      if (Math.random() > 0.5) spawnSparkle(mouseX, mouseY);
    }
  });

  // Spawn a glowing sparkle particle at (x, y)
  function spawnSparkle(x, y) {
    const p = document.createElement('div');
    p.className = 'sparkle-particle';

    // Random size 3–9px
    const size   = 3 + Math.random() * 6;
    // Random spread around cursor
    const offsetX = (Math.random() - 0.5) * 24;
    const offsetY = (Math.random() - 0.5) * 24;
    const color  = sparkleColors[Math.floor(Math.random() * sparkleColors.length)];
    const dur    = 500 + Math.random() * 400;

    p.style.cssText = `
      left: ${x + offsetX}px;
      top:  ${y + offsetY}px;
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      box-shadow: 0 0 ${size * 2}px ${size}px ${color}80;
      animation-duration: ${dur}ms;
    `;

    document.body.appendChild(p);
    // Remove from DOM after animation ends
    setTimeout(() => p.remove(), dur + 50);
  }
})();


/* ── 2. SCROLL REVEAL ────────────────────────────────────── */
(function () {
  const revealEls = document.querySelectorAll('.reveal');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -48px 0px' });

  revealEls.forEach((el) => observer.observe(el));
})();


/* ── 3. NAV SCROLL SHRINK ────────────────────────────────── */
(function () {
  const nav = document.getElementById('main-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    if (window.scrollY > 60) {
      nav.classList.add('scrolled');
    } else {
      nav.classList.remove('scrolled');
    }
  }, { passive: true });
})();


/* ── 4. MOBILE MENU ──────────────────────────────────────── */
(function () {
  const btn  = document.getElementById('hamburger');
  const menu = document.getElementById('mobile-menu');
  if (!btn || !menu) return;
  btn.addEventListener('click', () => {
    const open = menu.classList.toggle('open');
    btn.setAttribute('aria-expanded', open);
  });
  menu.querySelectorAll('a').forEach(a =>
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      btn.setAttribute('aria-expanded', 'false');
    })
  );
})();


/* ── 5. CASE STUDIES PANEL ───────────────────────────────── */
(function () {
  const resultsEl = document.getElementById('cs-results');
  if (!resultsEl) return;

  const brands = {
    familyfirst: {
      name: 'FamilyFirst™', abbr: 'FF',
      result: '12 creators', region: 'UAE / Saudi Arabia / Kuwait',
      engagement: '20%', engSub: 'on 40M followers',
      cpv: '$0.02',       cpvSub: 'Instagram / TikTok',
      images: [
        'https://images.unsplash.com/photo-1503454537195-1dcabb73ffb9?w=400&q=80',
        'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80',
        'https://images.unsplash.com/photo-1519689680058-324335c77eba?w=400&q=80',
      ],
    },
    tinysteps: {
      name: 'TinySteps®', abbr: 'TS',
      result: '8 creators', region: 'UAE / Egypt / Jordan',
      engagement: '17%', engSub: 'on 22M followers',
      cpv: '$0.01',      cpvSub: 'YouTube / TikTok',
      images: [
        'https://images.unsplash.com/photo-1558981806-ec527fa84c39?w=400&q=80',
        'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=400&q=80',
        'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400&q=80',
      ],
    },
    kidsbrand: {
      name: 'KidsBrands Co.', abbr: 'KB',
      result: '15 creators', region: 'KSA / Bahrain / Oman',
      engagement: '23%', engSub: 'on 55M followers',
      cpv: '$0.02',       cpvSub: 'Instagram / Snapchat',
      images: [
        'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?w=400&q=80',
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80',
        'https://images.unsplash.com/photo-1543269865-cbf427effbad?w=400&q=80',
      ],
    },
    nurture: {
      name: 'Nurture™', abbr: 'NU',
      result: '6 creators', region: 'UAE / Kuwait',
      engagement: '19%', engSub: 'on 18M followers',
      cpv: '$0.015',     cpvSub: 'Instagram / YouTube',
      images: [
        'https://images.unsplash.com/photo-1491013516836-7db643ee125a?w=400&q=80',
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&q=80',
        'https://images.unsplash.com/photo-1533227268428-f9ed0900fb3b?w=400&q=80',
      ],
    },
    growwell: {
      name: 'GrowWell™', abbr: 'GW',
      result: '10 creators', region: 'UAE / Egypt',
      engagement: '15%', engSub: 'on 30M followers',
      cpv: '$0.01',       cpvSub: 'TikTok / YouTube',
      images: [
        'https://images.unsplash.com/photo-1484820540004-14229fe36ca4?w=400&q=80',
        'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&q=80',
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&q=80',
      ],
    },
    playzone: {
      name: 'PlayZone®', abbr: 'PZ',
      result: '18 creators', region: 'GCC Region',
      engagement: '25%', engSub: 'on 70M followers',
      cpv: '$0.02',       cpvSub: 'All Platforms',
      images: [
        'https://images.unsplash.com/photo-1547347298-4074fc3086f0?w=400&q=80',
        'https://images.unsplash.com/photo-1540479859555-17af45c78602?w=400&q=80',
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&q=80',
      ],
    },
  };

  function renderStudy(id) {
    const b = brands[id];
    if (!b) return;

    resultsEl.innerHTML = `
      <div class="cs-result-header">
        <div class="csr-icon">${b.abbr}</div>
        <div class="csr-name">${b.name}</div>
      </div>
      <div class="csr-metrics">
        <div class="csr-metric">
          <div class="csr-m-label">RESULT</div>
          <div class="csr-m-value">${b.result}</div>
          <div class="csr-m-sub">${b.region}</div>
        </div>
        <div class="csr-metric">
          <div class="csr-m-label">ENGAGEMENT RATE</div>
          <div class="csr-m-value">${b.engagement}</div>
          <div class="csr-m-sub">${b.engSub}</div>
        </div>
        <div class="csr-metric">
          <div class="csr-m-label">COST PER VIEW</div>
          <div class="csr-m-value">${b.cpv}</div>
          <div class="csr-m-sub">${b.cpvSub}</div>
        </div>
      </div>
      <div class="csr-posts-label">Posts</div>
      <div class="csr-posts">
        ${b.images.map(src => `
          <div class="csr-post">
            <img src="${src}" alt="campaign post" loading="lazy" />
          </div>`).join('')}
      </div>
    `;
  }

  // Render first on load
  renderStudy('familyfirst');

  // Wire up buttons
  document.querySelectorAll('.cs-brand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.cs-brand-btn').forEach(b => b.classList.remove('cs-active'));
      btn.classList.add('cs-active');
      renderStudy(btn.dataset.id);
    });
  });
})();

/* ── 6. AUDIENCE TOGGLE ──────────────────────────────────── */
(function () {
  const btnCreators = document.getElementById('btn-creators');
  const btnBrands = document.getElementById('btn-brands');
  const slider = document.getElementById('at-slider');
  const contentCreators = document.getElementById('creators-content');
  const contentBrands = document.getElementById('brands-content');

  if (!btnCreators || !btnBrands || !slider) return;

  // Initial state: Brands is active on the left
  slider.style.transform = 'translateX(0)';

  btnCreators.addEventListener('click', () => {
    btnCreators.classList.add('active');
    btnBrands.classList.remove('active');
    // Creators is on right
    slider.style.transform = 'translateX(100%)';
    
    // Switch content display
    contentBrands.style.display = 'none';
    contentCreators.style.display = 'block';
    
    // Manage Navbar State
    document.body.classList.add('creators-active');
  });

  btnBrands.addEventListener('click', () => {
    btnBrands.classList.add('active');
    btnCreators.classList.remove('active');
    // Brands is on left
    slider.style.transform = 'translateX(0)';
    
    // Switch content display
    contentCreators.style.display = 'none';
    contentBrands.style.display = 'block';
    
    // Manage Navbar State
    document.body.classList.remove('creators-active');
  });
})();

/* ── 7. THEME TOGGLE (LIGHT / DARK) ──────────────────────── */
(function () {
  const themeBtn = document.getElementById('nav-theme-btn');
  if (!themeBtn) return;
  const dTheme = document.documentElement;

  // Icons
  const sunIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
  const moonIcon = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;

  let mode = localStorage.getItem('vairal-theme') || 'dark';

  // Apply saved mode immediately
  if (mode === 'light') {
    dTheme.setAttribute('data-theme', 'light');
    themeBtn.innerHTML = moonIcon;
  } else {
    themeBtn.innerHTML = sunIcon;
  }

  // Toggle listener
  themeBtn.addEventListener('click', () => {
    mode = (mode === 'dark') ? 'light' : 'dark';
    dTheme.setAttribute('data-theme', mode);
    localStorage.setItem('vairal-theme', mode);
    themeBtn.innerHTML = (mode === 'light') ? moonIcon : sunIcon;
  });
})();
