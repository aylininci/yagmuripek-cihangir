/* ==========================================================================
   YAĞMUR & CİHANGİR — Premium düğün davetiyesi etkileşimleri
   Akış: açılış kartı (~2sn) → zarf ekranı → tıkla → davetiye → içerik
   ========================================================================== */

(() => {
  'use strict';

  const WEDDING_DATE = new Date('2026-08-14T19:00:00+03:00');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasGSAP = () => typeof gsap !== 'undefined';
  const canHover = window.matchMedia('(hover: hover)').matches;

  /* ------------------------------------------------------------------------
     Müzik — tek sefer başlar, sayfa boyunca devam eder
     ------------------------------------------------------------------------ */
  const music = {
    el: null, toggle: null, started: false,
    init() {
      this.el = document.getElementById('bgMusic');
      this.toggle = document.getElementById('musicToggle');
      this.el.volume = 0.5;
      this.toggle.addEventListener('click', () => {
        if (this.el.paused) { this.el.play().catch(() => {}); this.toggle.classList.remove('is-muted'); }
        else { this.el.pause(); this.toggle.classList.add('is-muted'); }
      });
      // İlk kullanıcı etkileşiminde başlat (otomatik oynatma engeline karşı)
      const kick = () => { this.start(); document.removeEventListener('pointerdown', kick); };
      document.addEventListener('pointerdown', kick, { once: true });
      this.start();
    },
    start() {
      if (this.started) return;
      this.el.play().then(() => {
        this.started = true;
        this.toggle.classList.remove('is-muted');
      }).catch(() => { this.toggle.classList.add('is-muted'); });
    }
  };

  /* ------------------------------------------------------------------------
     1. AÇILIŞ KARTI → ZARF geçişi
     ------------------------------------------------------------------------ */
  function playOpening() {
    const opening = document.getElementById('opening');
    const card = document.getElementById('openingCard');
    const envStage = document.getElementById('envelope-stage');

    const showEnvelope = () => {
      envStage.removeAttribute('hidden');
      initParticles();
      if (hasGSAP() && !reduce) {
        gsap.fromTo(envStage, { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'power2.out' });
      }
    };

    if (reduce || !hasGSAP()) {
      card.style.opacity = '1';
      card.style.transform = 'none';
      setTimeout(() => { opening.style.display = 'none'; showEnvelope(); }, reduce ? 300 : 2000);
      return;
    }

    const tl = gsap.timeline();
    tl.to(card, { opacity: 1, scale: 1, duration: 1.1, ease: 'power2.out' })
      .to({}, { duration: 1.4 })                                   // ~2sn ekranda kalsın
      .to(card, { opacity: 0, y: -60, scale: 0.98, duration: 0.9, ease: 'power2.inOut' })
      .add(() => { opening.style.display = 'none'; showEnvelope(); });
  }

  /* ------------------------------------------------------------------------
     2. ZARF → DAVETİYE geçişi (zarf açılmaz, zarif geçiş)
     ------------------------------------------------------------------------ */
  function initEnvelope() {
    const wrap = document.getElementById('envelopeWrap');
    let opened = false;

    const open = () => {
      if (opened) return;
      opened = true;
      openInvitation();
    };

    wrap.addEventListener('click', open);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
    });
  }

  function openInvitation() {
    const envStage = document.getElementById('envelope-stage');
    const invitation = document.getElementById('invitation');
    const card = invitation.querySelector('.card--invitation');
    const img = document.getElementById('invitationImage');

    const reveal = () => {
      invitation.removeAttribute('hidden');
      requestAnimationFrame(() => {
        startCountdown();
        initScrollReveals();
        initTilt();
        initMapSkeleton();
        // Davetiye: scale + blur çözülmesi + kamera yaklaşma hissi (fade DEĞİL)
        if (hasGSAP() && !reduce) {
          gsap.fromTo(card,
            { opacity: 0, scale: 1.08, filter: 'blur(14px)' },
            { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 1.6, ease: 'power3.out',
              onComplete: () => {
                // 2-3sn davetiyeyi izlet, sonra çok yavaş countdown'a kay
                setTimeout(() => {
                  const cd = document.querySelector('.section--countdown');
                  if (cd) cd.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 2600);
              }
            });
        } else {
          card.style.opacity = '1';
        }
      });
    };

    if (reduce || !hasGSAP()) {
      envStage.style.transition = 'opacity 0.4s ease';
      envStage.style.opacity = '0';
      setTimeout(() => { envStage.style.display = 'none'; reveal(); }, 400);
      return;
    }

    gsap.to(envStage, {
      opacity: 0, scale: 1.04, duration: 0.9, ease: 'power2.inOut',
      onComplete: () => { envStage.style.display = 'none'; reveal(); }
    });
  }

  /* ------------------------------------------------------------------------
     3. GERİ SAYIM — Rolex mekanizması hissi, sadece rakam değişir
     ------------------------------------------------------------------------ */
  let countdownTimer;
  function startCountdown() {
    if (countdownTimer) return;
    const pad = (n) => String(n).padStart(2, '0');
    const els = {
      days: document.getElementById('cd-days'),
      hours: document.getElementById('cd-hours'),
      minutes: document.getElementById('cd-minutes'),
      seconds: document.getElementById('cd-seconds')
    };
    const last = { days: null, hours: null, minutes: null, seconds: null };

    const set = (key, val) => {
      const v = pad(val);
      if (last[key] === v) return;
      last[key] = v;
      const el = els[key];
      if (!el) return;
      if (reduce) { el.textContent = v; return; }
      el.classList.remove('is-ticking');
      void el.offsetWidth;
      el.textContent = v;
      el.classList.add('is-ticking');
    };

    const tick = () => {
      let diff = WEDDING_DATE.getTime() - Date.now();
      if (diff < 0) diff = 0;
      set('days', Math.floor(diff / 86400000));
      set('hours', Math.floor((diff / 3600000) % 24));
      set('minutes', Math.floor((diff / 60000) % 60));
      set('seconds', Math.floor((diff / 1000) % 60));
      if (diff <= 0) clearInterval(countdownTimer);
    };
    tick();
    countdownTimer = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------------
     4. SCROLL REVEAL — bölümler yumuşak, sinematik belirir; son bölümde finale
     ------------------------------------------------------------------------ */
  function initScrollReveals() {
    const targets = document.querySelectorAll('.reveal-scroll');
    if (reduce || !('IntersectionObserver' in window)) {
      targets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none'; });
      return;
    }
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        if (hasGSAP()) {
          gsap.to(el, { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1.1, ease: 'power2.out' });
        } else {
          el.style.opacity = '1'; el.style.transform = 'none'; el.style.filter = 'none';
        }
        if (el.classList.contains('site-footer') && !el.dataset.finale) {
          el.dataset.finale = '1';
          firePetals();
          setTimeout(fireConfetti, 250);
        }
        io.unobserve(el);
      });
    }, { threshold: 0.2 });
    targets.forEach((el) => io.observe(el));
  }

  /* ------------------------------------------------------------------------
     5. MOUSE PARALLAX — sadece masaüstü, kartlar 3-5px takip eder
     ------------------------------------------------------------------------ */
  function initTilt() {
    if (!canHover || reduce) return;
    document.querySelectorAll('[data-tilt]').forEach((card) => {
      let pending = false, rx = 0, ry = 0;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        rx = ((e.clientX - r.left) / r.width - 0.5);
        ry = ((e.clientY - r.top) / r.height - 0.5);
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          card.style.transform = `translate(${rx * 5}px, ${ry * 5}px)`;
          pending = false;
        });
      });
      card.addEventListener('mouseleave', () => { card.style.transform = 'translate(0,0)'; });
    });
  }

  /* ------------------------------------------------------------------------
     6. HARİTA — paper skeleton, iframe yüklenince fade
     ------------------------------------------------------------------------ */
  function initMapSkeleton() {
    const frame = document.getElementById('mapFrame');
    const skel = document.getElementById('mapSkeleton');
    if (!frame || !skel) return;
    const hide = () => setTimeout(() => skel.classList.add('is-hidden'), 350);
    if (frame.contentDocument === null || frame.complete) hide();
    frame.addEventListener('load', hide);
    setTimeout(hide, 3000); // güvenlik ağı
  }

  /* ------------------------------------------------------------------------
     Atmosfer — floating particles (zarf ekranı), HiDPI uyumlu
     ------------------------------------------------------------------------ */
  function initParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || reduce) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let w, h, raf, parts = [];
    const resize = () => {
      w = canvas.offsetWidth; h = canvas.offsetHeight;
      canvas.width = w * dpr; canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const make = () => {
      const n = Math.min(36, Math.floor((w * h) / 20000));
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        r: Math.random() * 1.5 + 0.4,
        vy: Math.random() * 0.24 + 0.06, vx: (Math.random() - 0.5) * 0.1,
        a: Math.random() * 0.45 + 0.12
      }));
    };
    const draw = () => {
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#e9e9e9';
      parts.forEach((p) => {
        p.y -= p.vy; p.x += p.vx;
        if (p.y < -8) { p.y = h + 8; p.x = Math.random() * w; }
        ctx.globalAlpha = p.a;
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill();
      });
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(draw);
    };
    resize(); make(); draw();
    let t;
    window.addEventListener('resize', () => {
      clearTimeout(t);
      t = setTimeout(() => { cancelAnimationFrame(raf); resize(); make(); draw(); }, 150);
    });
  }

  /* ------------------------------------------------------------------------
     HiDPI canvas yardımcısı (konfeti + yaprak)
     ------------------------------------------------------------------------ */
  function hidpi(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth, h = window.innerHeight;
    canvas.width = w * dpr; canvas.height = h * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  /* ------------------------------------------------------------------------
     Çiçek yaprakları — dağınık, uzun süreli
     ------------------------------------------------------------------------ */
  function firePetals() {
    if (reduce) return;
    const canvas = document.getElementById('petalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let { w, h } = hidpi(canvas, ctx);
    const onR = () => { const d = hidpi(canvas, ctx); w = d.w; h = d.h; };
    window.addEventListener('resize', onR);
    const colors = ['#e9e9e9', '#f2d9d0', '#f7f3ea'];
    const make = () => ({
      x: Math.random() * w, y: -20 - Math.random() * 120,
      size: Math.random() * 12 + 5, color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 6,
      vy: Math.random() * 1.1 + 0.35, vx: (Math.random() - 0.5) * 1.8,
      sway: Math.random() * 0.03 + 0.008, so: Math.random() * Math.PI * 2,
      sa: Math.random() * 1.4 + 0.5, op: Math.random() * 0.3 + 0.7
    });
    const petals = Array.from({ length: 60 }, make);
    let f = 0; const total = 520, fade = total - 120;
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      petals.forEach((p) => {
        p.y += p.vy; p.x += p.vx + Math.sin(f * p.sway + p.so) * p.sa; p.rot += p.vr;
        if (f > fade) p.op = Math.max(0, p.op - 0.01);
        if (p.y < h + 20 && p.op > 0) alive = true;
        ctx.save(); ctx.globalAlpha = p.op; ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.beginPath(); ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      });
      f++;
      if (alive && f < total) requestAnimationFrame(step);
      else { ctx.clearRect(0, 0, w, h); window.removeEventListener('resize', onR); }
    };
    step();
  }

  /* ------------------------------------------------------------------------
     Konfeti — gümüş tonlar, uzun süreli
     ------------------------------------------------------------------------ */
  function fireConfetti() {
    if (reduce) return;
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let { w, h } = hidpi(canvas, ctx);
    const onR = () => { const d = hidpi(canvas, ctx); w = d.w; h = d.h; };
    window.addEventListener('resize', onR);
    const colors = ['#c7ccd1', '#e9e9e9', '#ffffff', '#9aa0a6'];
    const make = (top) => ({
      x: Math.random() * w, y: top ? -20 - Math.random() * 40 : -20 - Math.random() * h * 0.6,
      w: Math.random() * 8 + 4, h: Math.random() * 4 + 3,
      color: colors[(Math.random() * colors.length) | 0],
      rot: Math.random() * 360, vr: (Math.random() - 0.5) * 8,
      vy: Math.random() * 2 + 1.3, vx: (Math.random() - 0.5) * 1.4, op: 1
    });
    let pieces = Array.from({ length: 90 }, () => make(false));
    let f = 0; const total = 560, spawn = 260, fade = total - 90;
    const step = () => {
      ctx.clearRect(0, 0, w, h);
      let alive = false;
      if (f < spawn && f % 16 === 0) for (let i = 0; i < 4; i++) pieces.push(make(true));
      pieces.forEach((p) => {
        p.y += p.vy; p.x += p.vx; p.rot += p.vr;
        if (f > fade) p.op = Math.max(0, p.op - 0.012);
        if (p.y < h + 20 && p.op > 0) alive = true;
        ctx.save(); ctx.globalAlpha = p.op; ctx.translate(p.x, p.y); ctx.rotate(p.rot * Math.PI / 180);
        ctx.fillStyle = p.color; ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h); ctx.restore();
      });
      f++;
      if (alive && f < total) requestAnimationFrame(step);
      else { ctx.clearRect(0, 0, w, h); window.removeEventListener('resize', onR); }
    };
    step();
  }

  /* ------------------------------------------------------------------------
     Başlat
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    music.init();
    initEnvelope();
    playOpening();
  });
})();
