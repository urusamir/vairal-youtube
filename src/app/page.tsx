"use client";
import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function LandingPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Dynamically load the script since it relies on DOM
    const script = document.createElement('script');
    script.src = '/assets-legacy/script.js';
    script.defer = true;
    document.body.appendChild(script);
    
    // Inject the CSS
    
    // Wire up auth buttons immediately after rendering
    setTimeout(() => {
        if (!containerRef.current) return;
        
        // Find any buttons saying Login, Access, Admin, or linking to '#'
        const buttons = document.querySelectorAll('.nav-login, auth-button, .btn-campaign, a[href="/login"], a[href="#"], button');
        buttons.forEach((el) => {
           const btn = el as HTMLElement;
           if (btn.getAttribute('href') === '/login' ||
               btn.textContent?.toLowerCase().includes('login') || 
               btn.textContent?.toLowerCase().includes('admin') || 
               btn.textContent?.toLowerCase().includes('join') ||
               btn.textContent?.toLowerCase().includes('start')) {
              btn.onclick = (e) => {
                 e.preventDefault();
                 // Use Next.js router for instantaneous client-side navigation
                 router.push('/login');
              };
           }
        });
    }, 500);

    return () => {
      // Cleanup
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, []);

  return (
    <div ref={containerRef} suppressHydrationWarning dangerouslySetInnerHTML={{ __html: `
  <!-- Load CSS synchronously to prevent FOUC -->
  <link rel="stylesheet" href="/assets-legacy/style.css" />


  <!-- NAVIGATION -->
  <nav class="nav" id="main-nav">
    <div class="nav-inner">
      <div class="nav-left-group">
        <a href="#" class="nav-logo" id="nav-logo-link">
          <div class="logo-mark">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M4 4L14 24L24 4" stroke="#4671F6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M8 14H20" stroke="#4671F6" stroke-width="3.5" stroke-linecap="round"/>
            </svg>
          </div>
          <span class="logo-text">Vairal</span>
        </a>
      </div>
      <ul class="nav-links" id="nav-links">
        <li><a href="#case-studies" id="nav-case-studies">Case Studies</a></li>
        <li class="nav-dropdown" id="nav-features-wrapper">
          <a href="features.html" id="nav-features">
            Features
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M6 9l6 6 6-6"/></svg>
          </a>
          <div class="nav-dropdown-menu">
            <a href="features.html#campaigns">Campaigns</a>
            <a href="features.html#discover">Discover</a>
            <a href="features.html#dashboard">Dashboard</a>
            <a href="features.html#analytics">Analytics</a>
            <a href="features.html#calendar">Calendar</a>
            <a href="features.html#payments">Payments</a>
          </div>
        </li>
      </ul>
        <div class="nav-actions">
        <a href="/login" class="btn btn-login-outline">Log In</a>
        <a href="/login" class="btn btn-primary" id="nav-cta">Access Platform</a>
        <button class="hamburger" id="hamburger" aria-label="Toggle menu">
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>

  <!-- MOBILE MENU -->
  <div class="mobile-menu" id="mobile-menu">
    <a href="#case-studies" id="mob-case-studies">Case Studies</a>
    <a href="features.html" id="mob-features">Features</a>
    <a href="#footer-cta" class="btn btn-primary" id="mob-cta">Get Access</a>
  </div>

  <!-- AUDIENCE TOGGLE (BRANDS / CREATORS) -->
  <div class="audience-toggle-wrapper">
    <div class="audience-toggle" id="audience-toggle">
      <button class="at-btn active" id="btn-brands">BRANDS</button>
      <button class="at-btn" id="btn-creators">CREATORS</button>
      <div class="at-slider" id="at-slider"></div>
    </div>
  </div>

  <!-- CREATORS CONTENT (Coming Soon) -->
  <div id="creators-content" style="display: none;">
    <section class="coming-soon-section">
      <div class="container text-center">
        <h1 class="hero-alfan-title" style="margin-bottom:20px;">
          Empowering Creators,<span class="highlight"> Coming Soon</span><span style="color:#4671F6">.</span>
        </h1>
        <p class="hero-alfan-sub" style="margin: 0 auto 40px; text-align: center; max-width: 600px; line-height: 1.6;">
          We're building the ultimate suite to help kids & family creators manage partnerships, get paid securely, and grow their channels effortlessly.
        </p>
        
        <form class="creators-waitlist-form">
           <input type="email" placeholder="Enter your email address" required class="waitlist-input" />
           <button type="submit" class="btn btn-campaign waitlist-submit" style="white-space: nowrap; margin-top: 0;">Join Waitlist</button>
        </form>
      </div>
    </section>
  </div>

  <!-- BRANDS CONTENT -->
  <div id="brands-content">
    <!-- HERO SECTION -->
    <section class="hero-alfan" id="hero">
      <div class="hero-bg">
      <div class="hero-orb orb-2" style="opacity: 0.15"></div>
      <div class="hero-grid" style="opacity: 0.4"></div>
    </div>
    <svg class="hero-curves" viewBox="0 0 1440 900" fill="none" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <path class="curve-1" d="M 1300 -50 Q 1400 200 1200 400 Q 1000 600 1300 900" stroke="#4671F6" stroke-width="1.5" fill="none" stroke-opacity="0.35"/>
      <path class="curve-2" d="M 1380 100 Q 1480 350 1280 550 Q 1100 720 1380 950" stroke="#4671F6" stroke-width="1" fill="none" stroke-opacity="0.2"/>
      <path class="curve-3" d="M 1350 -100 Q 1500 150 1350 350 Q 1200 550 1450 800" stroke="#a855f7" stroke-width="0.8" fill="none" stroke-opacity="0.15"/>
    </svg>

    <div class="hero-alfan-inner">
      <!-- LEFT CONTENT -->
      <div class="hero-alfan-text">
        <div class="hero-badge" id="hero-badge" style="background: 'rgba(168; color: #9333ea; border: '1px solid rgba(168">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px; fill: #9333ea; stroke: none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
          Exclusively for Kids &amp; Family Brands
        </div>
        <h1 class="hero-alfan-title" id="hero-title">
          Effortless influencer collabs,<br/><span style="color: #8b5cf6">real results.</span> <span style="color: #fbbf24">✨</span>
        </h1>
        <p class="hero-alfan-sub" id="hero-sub">
          <strong>Join 100+ brands</strong> using Vairal to automate their collaborations with thousands of <strong>kids &amp; family</strong> content creators that deliver real results. 🚀
        </p>
        <div style="display: flex; gap: 16px; align-items: center; flex-wrap: wrap; margin-top: 24px">
          <a href="#footer-cta" class="btn btn-campaign btn-lg" id="hero-cta-primary" style="border-radius: 100px; padding: 16px 36px; font-weight: 600; box-shadow: '0 10px 25px rgba(70">Create campaign <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-left: 4px"><path d="M5 12h14M12 5l7 7-7 7"/></svg></a>
          <a href="#" class="btn btn-ghost btn-lg" style="border-radius: 100px; font-weight: 600; padding: 15px 36px; background: white; border: '1px solid rgba(0; color: #111827; box-shadow: '0 4px 6px rgba(0"><svg width="18" height="18" viewBox="0 0 24 24" fill="var(--primary)" stroke="var(--primary)" stroke-width="2" stroke-linejoin="round" style="margin-right: 8px"><polygon points="5 3 19 12 5 21 5 3"/></svg> Watch how it works</a>
        </div>
        <div class="hero-stats" id="hero-stats" style="margin-top: 54px; gap: 32px">
          <div class="stat-item" style="flex-direction: row; align-items: center; gap: 12px">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#6366f1" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
            <div style="display: flex; flex-direction: column">
              <span class="stat-num" style="font-size: 20px; color: #111827">$0.01</span>
              <span class="stat-label" style="color: #6b7280; font-size: 13px">Cost per view</span>
            </div>
          </div>
          <div class="stat-divider" style="height: 40px; background: 'rgba(0"></div>
          <div class="stat-item" style="flex-direction: row; align-items: center; gap: 12px">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
            <div style="display: flex; flex-direction: column">
              <span class="stat-num" style="font-size: 20px; color: #111827">125M+</span>
              <span class="stat-label" style="color: #6b7280; font-size: 13px">Views delivered</span>
            </div>
          </div>
          <div class="stat-divider" style="height: 40px; background: 'rgba(0"></div>
          <div class="stat-item" style="flex-direction: row; align-items: center; gap: 12px">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
            <div style="display: flex; flex-direction: column">
              <span class="stat-num" style="font-size: 20px; color: #111827">500+</span>
              <span class="stat-label" style="color: #6b7280; font-size: 13px">Family Creators</span>
            </div>
          </div>
        </div>
      </div>

      <!-- RIGHT: PHONE MOCKUP & POLAROIDS -->
      <div class="hero-alfan-phones" id="hero-visual" style="position: relative">
        
        <!-- Floating elements to match the reference -->
        <div style="position: absolute; top: -40px; left: -60px; width: 160px; background: white; padding: 8px; padding-bottom: 24px; border-radius: 12px; box-shadow: 0 20px 40px rgba(0,0,0,0.1); transform: rotate(-6deg); z-index: 10">
          <img src="/images/polaroid-1.png" alt="Kids in nature" style="width: 100%; height: auto; border-radius: 4px;" />
        </div>

        <div style="position: absolute; bottom: 40px; right: -80px; width: 180px; background: white; padding: 8px; padding-bottom: 24px; border-radius: 12px; box-shadow: '0 20px 40px rgba(0; transform: rotate(8deg); z-index: 30">
          <img src="/images/polaroid-3.png" alt="Girl cooking" style="width: 100%; height: auto; border-radius: 4px" />
        </div>

        <div style="position: absolute; top: 60px; right: -40px; background: 'rgba(255; backdrop-filter: blur(10px); padding: 12px 16px; border-radius: 16px; box-shadow: '0 15px 30px rgba(0; display: flex; flex-direction: column; align-items: center; gap: 4px; z-index: 40">
           <div style="width: 32px; height: 32px; border-radius: 50%; background: #f43f5e; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 4px">
             <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
           </div>
           <span style="font-weight: 800; font-size: 18px; color: #111827; line-height: 1">210K+</span>
           <span style="font-size: 10px; font-weight: 700; color: #6b7280; text-align: center; line-height: 1.2">Successful<br/>Campaigns</span>
        </div>

        <div class="phone-back">
          <div class="phone-back-inner">
            <div class="phone-back-content">
              <div class="pbc-label">Campaign preview</div>
            </div>
          </div>
        </div>
        <div class="phone-front">
          <div class="phone-notch"></div>
          <div class="phone-screen">
            <div class="phone-topbar">
              <div class="phone-logo-text">Vairal</div>
              <div class="phone-avatar">A</div>
            </div>
            <div class="phone-kpi-row">
              <div class="phone-kpi pk-blue">
                <div class="pk-val">4.2M</div>
                <div class="pk-lbl">Reach</div>
              </div>
              <div class="phone-kpi">
                <div class="pk-val">8.7%</div>
                <div class="pk-lbl">Eng. Rate</div>
              </div>
            </div>
            <div class="phone-chart">
              <div class="phone-chart-label">Campaign ROI</div>
              <div class="phone-bars">
                <div class="pb" style="height:40%"></div>
                <div class="pb" style="height:65%"></div>
                <div class="pb pb-active" style="height:90%"></div>
                <div class="pb" style="height:75%"></div>
                <div class="pb" style="height:80%"></div>
              </div>
            </div>
            <div class="phone-creators">
              <div class="phone-creator-row"><div class="pcr-dot" style="background:#4671F6"></div><span>Maya's Family</span><span class="pcr-stat">2.1M</span></div>
              <div class="phone-creator-row"><div class="pcr-dot" style="background:#a855f7"></div><span>The Kiddos</span><span class="pcr-stat">890K</span></div>
            </div>
          </div>
        </div>
        <div class="hero-float-card hfc-top" id="floating-card-1">
          <div class="hfc-icon-wrap"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#4671F6" stroke-width="2.5"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div>
          <div>
            <div class="hfc-label">Cost per view</div>
            <div class="hfc-value">\$0.01</div>
            <span class="hfc-badge">Above average</span>
          </div>
        </div>
        <div class="hero-float-card hfc-bottom" id="floating-card-2">
          <div>
            <div class="hfc-label hfc-label-dark">Views</div>
            <div class="hfc-value hfc-value-dark">125m+</div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- LOGO TRUST BAR -->
  <section class="logo-trust-section" id="trust-bar">
    <div class="ltb-heading">
      <p><strong>Join 100's of global and local brands</strong><br/>that trust Vairal for its influencer marketing &amp; creators collaborations</p>
    </div>

    <!-- Row 1: scrolls left -->
    <div class="ltb-track-wrap">
      <div class="ltb-track ltb-left">
        <!-- set 1 -->
        <div class="ltb-card"><img src="https://logo.clearbit.com/rain.com" alt="Rain" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none">🌧 Rain</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/trendyol.com" alt="Trendyol" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FF6000;font-weight:800">trendyol</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/temu.com" alt="TEMU" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FF6900;font-weight:900;font-size:18px">TEMU</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/hungerstation.com" alt="Hunger Station" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:11px;text-align:center">HUNGER<br/>STATION</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/airalo.com" alt="Airalo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#6B3FA0;font-weight:800">airalo</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/huawei.com" alt="Huawei" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#CF0A2C;font-weight:700">HUAWEI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/6thstreet.com" alt="6thStreet" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:11px">6THSTREET</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/namshi.com" alt="Namshi" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#000">NAMSHI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/adidas.com" alt="Adidas" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;letter-spacing:-1px">adidas</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/noon.com" alt="Noon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FEEE00;background:#000;padding:4px 10px;border-radius:4px;font-weight:800">noon</span></div>
        <!-- set 2 (duplicate for infinite loop) -->
        <div class="ltb-card"><img src="https://logo.clearbit.com/rain.com" alt="Rain" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none">🌧 Rain</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/trendyol.com" alt="Trendyol" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FF6000;font-weight:800">trendyol</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/temu.com" alt="TEMU" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FF6900;font-weight:900;font-size:18px">TEMU</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/hungerstation.com" alt="Hunger Station" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:11px;text-align:center">HUNGER<br/>STATION</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/airalo.com" alt="Airalo" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#6B3FA0;font-weight:800">airalo</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/huawei.com" alt="Huawei" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#CF0A2C;font-weight:700">HUAWEI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/6thstreet.com" alt="6thStreet" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:11px">6THSTREET</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/namshi.com" alt="Namshi" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#000">NAMSHI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/adidas.com" alt="Adidas" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;letter-spacing:-1px">adidas</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/noon.com" alt="Noon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#FEEE00;background:#000;padding:4px 10px;border-radius:4px;font-weight:800">noon</span></div>
      </div>
    </div>

    <!-- Row 2: scrolls right -->
    <div class="ltb-track-wrap">
      <div class="ltb-track ltb-right">
        <!-- set 1 -->
        <div class="ltb-card"><img src="https://logo.clearbit.com/hyundai.com" alt="Hyundai" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#002C5F;font-weight:800">HYUNDAI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/okx.com" alt="OKX" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;font-size:18px">OKX</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/eyewa.com" alt="Eyewa" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#1A1A1A">eyewa</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/styli.com" alt="Styli" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800">styli</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/samsung.com" alt="Samsung" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#1428A0;font-weight:700">SAMSUNG</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/lego.com" alt="LEGO" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#E3000B;font-weight:900;background:#FFD700;padding:3px 8px;border-radius:4px">LEGO</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/loreal.com" alt="L'Oreal" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:12px">L'ORÉAL</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/nike.com" alt="Nike" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;font-size:22px;font-style:italic">Nike</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/amazon.com" alt="Amazon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#FF9900">amazon</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/mattel.com" alt="Mattel" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#E00;font-weight:900">MATTEL</span></div>
        <!-- set 2 (duplicate) -->
        <div class="ltb-card"><img src="https://logo.clearbit.com/hyundai.com" alt="Hyundai" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#002C5F;font-weight:800">HYUNDAI</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/okx.com" alt="OKX" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;font-size:18px">OKX</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/eyewa.com" alt="Eyewa" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#1A1A1A">eyewa</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/styli.com" alt="Styli" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800">styli</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/samsung.com" alt="Samsung" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#1428A0;font-weight:700">SAMSUNG</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/lego.com" alt="LEGO" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#E3000B;font-weight:900;background:#FFD700;padding:3px 8px;border-radius:4px">LEGO</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/loreal.com" alt="L'Oreal" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;font-size:12px">L'ORÉAL</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/nike.com" alt="Nike" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:900;font-size:22px;font-style:italic">Nike</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/amazon.com" alt="Amazon" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;font-weight:800;color:#FF9900">amazon</span></div>
        <div class="ltb-card"><img src="https://logo.clearbit.com/mattel.com" alt="Mattel" onerror="this.style.display='none';this.nextElementSibling.style.display='flex'"/><span class="ltb-fallback" style="display:none;color:#E00;font-weight:900">MATTEL</span></div>
      </div>
    </div>
  </section>

  <!-- NETWORK STATS -->
  <section class="network-stats-section" id="network-stats">
    <div class="container">
      <div class="ns-grid">
        <div class="ns-card reveal" id="ns-1">
          <div class="ns-platform">Vairal Network</div>
          <div class="ns-value">1,000+</div>
          <div class="ns-label">Family Creators</div>
        </div>
        <div class="ns-card reveal" id="ns-2">
          <div class="ns-platform">Vairal Discovery</div>
          <div class="ns-value">40,000+</div>
          <div class="ns-label">Creator Profiles</div>
        </div>
        <div class="ns-card reveal" id="ns-3">
          <div class="ns-platform">Vairal Campaigns</div>
          <div class="ns-value">500+</div>
          <div class="ns-label">Active Campaigns</div>
        </div>
      </div>
    </div>
  </section>

  <!-- TOP CREATORS -->
  <section class="top-creators-section" id="top-creators">
    <div class="container">
      <h2 class="tc-title reveal">The Top Creators Use <span class="highlight">Vairal</span>.</h2>
    </div>
    <div class="tc-cards" id="tc-cards">

      <div class="tc-card reveal" id="tc-1">
        <img src="/assets-legacy/creator_1.png" alt="Leo's World" />
        <div class="tc-overlay">
          <div class="tc-name">Leo's World</div>
          <div class="tc-socials">
            <span class="tc-soc-icon">▶</span>
            <span class="tc-soc-icon">📷</span>
            <span class="tc-soc-icon">♪</span>
          </div>
          <div class="tc-followers">2.4M Followers</div>
        </div>
      </div>

      <div class="tc-card reveal" id="tc-2">
        <img src="/assets-legacy/creator_2.png" alt="The Twin Creators" />
        <div class="tc-overlay">
          <div class="tc-name">The Twin Creators</div>
          <div class="tc-socials">
            <span class="tc-soc-icon">▶</span>
            <span class="tc-soc-icon">📷</span>
            <span class="tc-soc-icon">♪</span>
          </div>
          <div class="tc-followers">1.8M Followers</div>
        </div>
      </div>

      <div class="tc-card reveal" id="tc-3">
        <img src="/assets-legacy/creator_3.png" alt="Mia Creates" />
        <div class="tc-overlay">
          <div class="tc-name">Mia Creates</div>
          <div class="tc-socials">
            <span class="tc-soc-icon">▶</span>
            <span class="tc-soc-icon">📷</span>
            <span class="tc-soc-icon">♪</span>
          </div>
          <div class="tc-followers">3.1M Followers</div>
        </div>
      </div>

      <div class="tc-card reveal" id="tc-4">
        <img src="/assets-legacy/creator_4.png" alt="Vlog Kid" />
        <div class="tc-overlay">
          <div class="tc-name">Vlog Kid</div>
          <div class="tc-socials">
            <span class="tc-soc-icon">▶</span>
            <span class="tc-soc-icon">📷</span>
            <span class="tc-soc-icon">♪</span>
          </div>
          <div class="tc-followers">900K Followers</div>
        </div>
      </div>

      <div class="tc-card reveal" id="tc-5">
        <img src="/assets-legacy/creator_5.png" alt="Little Chef Lily" />
        <div class="tc-overlay">
          <div class="tc-name">Little Chef Lily</div>
          <div class="tc-socials">
            <span class="tc-soc-icon">▶</span>
            <span class="tc-soc-icon">📷</span>
            <span class="tc-soc-icon">♪</span>
          </div>
          <div class="tc-followers">1.2M Followers</div>
        </div>
      </div>

    </div>
  </section>

  <!-- CASE STUDIES -->
  <section class="case-studies-section" id="case-studies">
    <div class="container">
      <div class="cs-card">
        <div class="cs-sidebar" id="cs-sidebar">
          <div class="cs-sidebar-title">Brand Partners</div>
          <button class="cs-brand-btn cs-active" data-id="familyfirst" id="csb-familyfirst">
            <div class="cs-brand-icon">FF</div>
            <span>FamilyFirst™</span>
          </button>
          <button class="cs-brand-btn" data-id="tinysteps" id="csb-tinysteps">
            <div class="cs-brand-icon">TS</div>
            <span>TinySteps®</span>
          </button>
          <button class="cs-brand-btn" data-id="kidsbrand" id="csb-kidsbrand">
            <div class="cs-brand-icon">KB</div>
            <span>KidsBrands Co.</span>
          </button>
          <button class="cs-brand-btn" data-id="nurture" id="csb-nurture">
            <div class="cs-brand-icon">NU</div>
            <span>Nurture™</span>
          </button>
          <button class="cs-brand-btn" data-id="growwell" id="csb-growwell">
            <div class="cs-brand-icon">GW</div>
            <span>GrowWell™</span>
          </button>
          <button class="cs-brand-btn" data-id="playzone" id="csb-playzone">
            <div class="cs-brand-icon">PZ</div>
            <span>PlayZone®</span>
          </button>
        </div>
        <div class="cs-results" id="cs-results"></div>
      </div>
    </div>
  </section>

  <!-- TESTIMONIALS (3-column auto-scroll) -->
  <section class="testimonials-section" id="testimonials" aria-labelledby="testimonials-heading">
    <div class="container">
      <div class="tms-header reveal">
        <div class="tms-badge">Testimonials</div>
        <h2 id="testimonials-heading" class="tms-title">What our users say</h2>
        <p class="tms-sub">Discover how hundreds of brands streamline their influencer campaigns with Vairal.</p>
      </div>
    </div>

    <!-- 3-column scrolling grid -->
    <div class="tms-grid" role="region" aria-label="Scrolling Testimonials">

      <!-- Column 1 — speed 15s -->
      <div class="tms-col">
        <div class="tms-belt tms-speed-15">
          <!-- set 1 -->
          <div class="tms-card">
            <p>"Vairal revolutionized our influencer ops. Streamlined campaigns and the creator network is genuinely premium."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="Briana Patton" />
              <div><strong>Briana Patton</strong><span>Operations Manager</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"Implementing Vairal was fast and seamless. The UI made onboarding our team completely effortless."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="Bilal Ahmed" />
              <div><strong>Bilal Ahmed</strong><span>IT Manager</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"The support team is exceptional — they guided us through every step and made sure we were fully satisfied."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80" alt="Saman Malik" />
              <div><strong>Saman Malik</strong><span>Customer Support Lead</span></div>
            </div>
          </div>
          <!-- set 2 (duplicate for loop) -->
          <div class="tms-card" aria-hidden="true">
            <p>"Vairal revolutionized our influencer ops. Streamlined campaigns and the creator network is genuinely premium."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=80&q=80" alt="Briana Patton" />
              <div><strong>Briana Patton</strong><span>Operations Manager</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"Implementing Vairal was fast and seamless. The UI made onboarding our team completely effortless."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&q=80" alt="Bilal Ahmed" />
              <div><strong>Bilal Ahmed</strong><span>IT Manager</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"The support team is exceptional — they guided us through every step and made sure we were fully satisfied."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=80&q=80" alt="Saman Malik" />
              <div><strong>Saman Malik</strong><span>Customer Support Lead</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 2 — speed 19s -->
      <div class="tms-col tms-col-md">
        <div class="tms-belt tms-speed-19">
          <div class="tms-card">
            <p>"The seamless Vairal integration enhanced our business operations and efficiency dramatically. Highly recommend."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="Omar Raza" />
              <div><strong>Omar Raza</strong><span>CEO</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"Robust features and quick support have transformed our workflow — we're significantly more efficient."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80" alt="Zainab Hussain" />
              <div><strong>Zainab Hussain</strong><span>Project Manager</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"The smooth rollout exceeded all our expectations. It streamlined every process and improved business performance."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80" alt="Aliza Khan" />
              <div><strong>Aliza Khan</strong><span>Business Analyst</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"The seamless Vairal integration enhanced our business operations and efficiency dramatically. Highly recommend."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80&q=80" alt="Omar Raza" />
              <div><strong>Omar Raza</strong><span>CEO</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"Robust features and quick support have transformed our workflow — we're significantly more efficient."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=80&q=80" alt="Zainab Hussain" />
              <div><strong>Zainab Hussain</strong><span>Project Manager</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"The smooth rollout exceeded all our expectations. It streamlined every process and improved business performance."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=80&q=80" alt="Aliza Khan" />
              <div><strong>Aliza Khan</strong><span>Business Analyst</span></div>
            </div>
          </div>
        </div>
      </div>

      <!-- Column 3 — speed 17s -->
      <div class="tms-col tms-col-lg">
        <div class="tms-belt tms-speed-17">
          <div class="tms-card">
            <p>"Our business operations improved dramatically with Vairal's user-friendly designs and creator matching."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" alt="Farhan Siddiqui" />
              <div><strong>Farhan Siddiqui</strong><span>Marketing Director</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"They delivered a solution that truly understood our needs and elevated our entire influencer strategy."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" alt="Sana Sheikh" />
              <div><strong>Sana Sheikh</strong><span>Sales Manager</span></div>
            </div>
          </div>
          <div class="tms-card">
            <p>"Using Vairal, our online conversions and brand reach improved massively within the first campaign."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80" alt="Hassan Ali" />
              <div><strong>Hassan Ali</strong><span>E-commerce Manager</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"Our business operations improved dramatically with Vairal's user-friendly designs and creator matching."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=80&q=80" alt="Farhan Siddiqui" />
              <div><strong>Farhan Siddiqui</strong><span>Marketing Director</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"They delivered a solution that truly understood our needs and elevated our entire influencer strategy."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=80&q=80" alt="Sana Sheikh" />
              <div><strong>Sana Sheikh</strong><span>Sales Manager</span></div>
            </div>
          </div>
          <div class="tms-card" aria-hidden="true">
            <p>"Using Vairal, our online conversions and brand reach improved massively within the first campaign."</p>
            <div class="tms-author">
              <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=80&q=80" alt="Hassan Ali" />
              <div><strong>Hassan Ali</strong><span>E-commerce Manager</span></div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </section>

  <!-- FOOTER CTA BLOCK -->
  <section class="footer-cta-block" id="footer-cta">
    <div class="container">
      <div class="fcb-inner">
        <svg class="fcb-arcs" viewBox="0 0 300 300" fill="none" aria-hidden="true">
          <path d="M 280 -20 Q 350 150 200 280" stroke="rgba(255,255,255,0.12)" stroke-width="2" fill="none"/>
          <path d="M 310 0 Q 390 180 240 310" stroke="rgba(255,255,255,0.08)" stroke-width="1.5" fill="none"/>
          <path d="M 250 -60 Q 340 120 190 250" stroke="rgba(255,255,255,0.06)" stroke-width="1" fill="none"/>
        </svg>
        <div class="fcb-logo">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none"><path d="M4 4L14 24L24 4" stroke="white" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14H20" stroke="white" stroke-width="3.5" stroke-linecap="round"/></svg>
        </div>
        <h2 class="fcb-title">Join Hundreds of the Top Brands<br/>Using Vairal.</h2>
        <a href="mailto:hello@vairal.co" class="btn fcb-btn" id="fcb-cta">Sign up now</a>
      </div>
    </div>
  </section>
  </div> <!-- END BRANDS CONTENT -->

  <!-- FOOTER -->
  <footer class="footer" id="footer">
    <div class="container">
      <div class="footer-top">
        <div class="footer-brand">
          <a href="#" class="nav-logo">
            <div class="logo-mark">
              <svg width="24" height="24" viewBox="0 0 28 28" fill="none"><path d="M4 4L14 24L24 4" stroke="#4671F6" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M8 14H20" stroke="#4671F6" stroke-width="3.5" stroke-linecap="round"/></svg>
            </div>
            <span class="logo-text">Vairal</span>
          </a>
          <p class="footer-tagline">The only influencer marketing platform built exclusively for kids &amp; family creators.</p>
        </div>
        <div class="footer-links-col">
          <div class="footer-col-title">Platform</div>
          <a href="features.html">Features</a>
          <a href="#case-studies">Case Studies</a>
          <a href="features.html#for-brands">For Brands</a>
          <a href="features.html#for-creators">For Creators</a>
        </div>
        <div class="footer-links-col">
          <div class="footer-col-title">Company</div>
          <a href="#">About</a>
          <a href="#">Blog</a>
          <a href="#">Careers</a>
          <a href="mailto:hello@vairal.co">Contact</a>
        </div>
        <div class="footer-links-col">
          <div class="footer-col-title">Legal</div>
          <a href="#">Privacy Policy</a>
          <a href="#">Terms &amp; Conditions</a>
          <a href="#">Cookie Policy</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Vairal. All rights reserved.</span>
        <span>Built with ♥ for families everywhere</span>
      </div>
    </div>
  </footer>

  
` }} />
  );
}
