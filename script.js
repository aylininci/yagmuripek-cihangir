/* ==========================================================================
   YAĞMUR & CİHANGİR — DÜĞÜN DAVETİYESİ
   Tüm etkileşimler ve animasyonlar bu dosyada yönetilir.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     0a. GÖRSEL UZANTI YEDEKLEME — davetiye.jpg bulunamazsa .jpeg/.png dener
         (dosya adını değiştirmenize gerek kalmaz)
     ------------------------------------------------------------------------ */
  window.__tryNextImageSource = function (img) {
    const list = (img.dataset.fallbacks || '').split(',').map((s) => s.trim()).filter(Boolean);
    if (list.length === 0) {
      img.style.display = 'none';
      return;
    }
    const next = list.shift();
    img.dataset.fallbacks = list.join(',');
    img.src = next;
  };

  /* ------------------------------------------------------------------------
     0. AYARLAR — Bu bölümü kendi bilgilerinize göre güncelleyin
     ------------------------------------------------------------------------ */
  const WEDDING_DATE = new Date('2026-08-14T19:00:00+03:00');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. INTRO SEQUENCE — siyah ekran, alyanslar, başlık, fade
     ------------------------------------------------------------------------ */
  function playIntro() {
    const intro = document.getElementById('intro');
    const doves = document.querySelector('.intro__doves');
    const introText = document.querySelector('.intro__text');
    const envelopeStage = document.getElementById('envelope-stage');

    if (prefersReducedMotion || typeof gsap === 'undefined') {
      intro.style.display = 'none';
      envelopeStage.style.opacity = '1';
      initEnvelopeParticles();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power2.out' },
      onComplete: () => {
        intro.style.display = 'none';
        initEnvelopeParticles();
      }
    });

    gsap.set(envelopeStage, { opacity: 1 });

    tl.to(doves, { opacity: 1, y: 0, scale: 1, duration: 1.2 })
      .to(introText, { opacity: 1, y: -4, duration: 0.7 }, '-=0.4')
      .to({}, { duration: 1.1 })
      .to(intro, { opacity: 0, duration: 0.9, ease: 'power1.inOut' });
  }

  /* ------------------------------------------------------------------------
     2. ATMOSFER — floating particles (gümüş tonda, hafif ve performanslı)
     ------------------------------------------------------------------------ */
  function initEnvelopeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    let particles = [];
    let width, height, rafId;

    function resize() {
      width = canvas.width = canvas.offsetWidth * devicePixelRatio;
      height = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function createParticles() {
      const count = Math.min(40, Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: (Math.random() * 1.6 + 0.4) * devicePixelRatio,
        vy: (Math.random() * 0.25 + 0.08) * devicePixelRatio,
        vx: (Math.random() - 0.5) * 0.12 * devicePixelRatio,
        alpha: Math.random() * 0.5 + 0.15
      }));
    }

    function draw() {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#c7ccd1';
      particles.forEach((p) => {
        p.y -= p.vy;
        p.x += p.vx;
        if (p.y < -10) { p.y = height + 10; p.x = Math.random() * width; }
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    resize();
    createParticles();
    draw();

    window.addEventListener('resize', () => {
      cancelAnimationFrame(rafId);
      resize();
      createParticles();
      draw();
    });
  }

  /* ------------------------------------------------------------------------
     3. ZARF ETKİLEŞİMİ — mouse tilt, dokunmatik, açılış animasyonu
        (Buton yok: tüm zarf alanı tıklanabilir, tıklama ile açılış+müzik başlar)
     ------------------------------------------------------------------------ */
  function initEnvelope() {
    const wrap = document.getElementById('envelopeWrap');
    const envelope = document.getElementById('envelope');

    if (window.matchMedia('(hover: hover)').matches && !prefersReducedMotion) {
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        envelope.style.transform = `rotateY(${relX * 10}deg) rotateX(${-relY * 8}deg)`;
      });
      wrap.addEventListener('mouseleave', () => {
        envelope.style.transform = 'rotateY(0deg) rotateX(0deg)';
      });
    }

    wrap.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      const rect = wrap.getBoundingClientRect();
      const relX = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
      envelope.style.transform = `rotateY(${relX * 8}deg)`;
    }, { passive: true });

    let opened = false;
    function handleOpen(e) {
      if (opened) return;
      opened = true;
      openInvitation();
    }

    wrap.addEventListener('click', handleOpen);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen(e);
      }
    });
  }

  function openInvitation() {
    const envelope = document.getElementById('envelope');
    const openCue = document.getElementById('openCue');
    const envelopeStage = document.getElementById('envelope-stage');
    const invitation = document.getElementById('invitation');
    const card = document.getElementById('mainCard');

    if (openCue) openCue.setAttribute('hidden', '');
    envelope.classList.add('envelope--open');

    // Tıklama zaten bir kullanıcı etkileşimi olduğundan müzik burada
    // popup sormadan doğrudan başlatılabilir (tarayıcı otomatik oynatma
    // politikalarına uygun şekilde).
    startMusic();

    const revealCard = () => {
      invitation.removeAttribute('hidden');
      requestAnimationFrame(() => {
        invitation.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        animateCardEntrance(card);
      });
    };

    if (prefersReducedMotion) {
      envelopeStage.style.transition = 'opacity 0.3s ease';
      envelopeStage.style.opacity = '0';
      setTimeout(() => { envelopeStage.style.display = 'none'; revealCard(); }, 300);
      return;
    }

    setTimeout(() => {
      gsap.to(envelopeStage, {
        opacity: 0,
        duration: 0.8,
        ease: 'power1.inOut',
        onComplete: () => {
          envelopeStage.style.display = 'none';
          revealCard();
        }
      });
    }, 900);
  }

  function animateCardEntrance(card) {
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      card.style.opacity = '1';
      card.style.transform = 'none';
      document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
      });
      startCountdown();
      initScrollReveals();
      return;
    }

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        startCountdown();
        initScrollReveals();
      }
    });

    tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 1.1 })
      .to('.invitation-image', { opacity: 1, y: 0, duration: 0.8 }, '-=0.3')
      .to('.illustration-motif', { opacity: 0.55, y: 0, duration: 0.6 }, '-=0.3')
      .to('.details', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2')
      .to('.parents', { opacity: 1, y: 0, duration: 0.7 }, '-=0.2');
  }

  /* ------------------------------------------------------------------------
     4. GERİ SAYIM — her saniye güncellenen canlı sayaç
     ------------------------------------------------------------------------ */
  let countdownInterval;
  function startCountdown() {
    if (countdownInterval) return;
    const daysEl = document.getElementById('cd-days');
    const hoursEl = document.getElementById('cd-hours');
    const minutesEl = document.getElementById('cd-minutes');
    const secondsEl = document.getElementById('cd-seconds');

    function pad(n) { return String(n).padStart(2, '0'); }

    function tick() {
      const now = new Date();
      let diff = WEDDING_DATE.getTime() - now.getTime();
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      daysEl.textContent = pad(days);
      hoursEl.textContent = pad(hours);
      minutesEl.textContent = pad(minutes);
      secondsEl.textContent = pad(seconds);

      if (diff <= 0) clearInterval(countdownInterval);
    }

    tick();
    countdownInterval = setInterval(tick, 1000);
  }

  /* ------------------------------------------------------------------------
     5. SCROLL REVEAL — bölümler görünür olunca fade + IntersectionObserver
     ------------------------------------------------------------------------ */
  function initScrollReveals() {
    const targets = document.querySelectorAll('.reveal-scroll');
    if (prefersReducedMotion || !('IntersectionObserver' in window)) {
      targets.forEach((el) => { el.style.opacity = '1'; el.style.transform = 'none'; });
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          if (typeof gsap !== 'undefined') {
            gsap.to(entry.target, { opacity: 1, y: 0, duration: 0.9, ease: 'power2.out' });
          } else {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
          }

          if (entry.target.classList.contains('site-footer') && !entry.target.dataset.confettiFired) {
            entry.target.dataset.confettiFired = 'true';
            fireConfetti();
          }

          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    targets.forEach((el) => observer.observe(el));
  }

  /* ------------------------------------------------------------------------
     6. MÜZİK — popup yok, zarfa tıklanınca otomatik başlar + aç/kapa butonu
     ------------------------------------------------------------------------ */
  function startMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');
    music.volume = 0.5;
    music.play().then(() => {
      toggle.removeAttribute('hidden');
      toggle.classList.remove('is-muted');
    }).catch(() => {
      // Tarayıcı otomatik oynatmayı engellediyse yalnızca toggle butonunu göster,
      // kullanıcı manuel olarak başlatabilir.
      toggle.removeAttribute('hidden');
      toggle.classList.add('is-muted');
    });
  }

  function initMusic() {
    const music = document.getElementById('bgMusic');
    const toggle = document.getElementById('musicToggle');

    toggle.addEventListener('click', () => {
      if (music.paused) {
        music.play().catch(() => {});
        toggle.classList.remove('is-muted');
      } else {
        music.pause();
        toggle.classList.add('is-muted');
      }
    });
  }

  /* ------------------------------------------------------------------------
     7. KONFETİ — gümüş tonlarda, sayfanın sonuna gelindiğinde
     ------------------------------------------------------------------------ */
  function fireConfetti() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('confettiCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#c7ccd1', '#e8ecef', '#ffffff', '#8a9096'];
    const pieces = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.5,
      w: Math.random() * 8 + 4,
      h: Math.random() * 4 + 3,
      color: colors[Math.floor(Math.random() * colors.length)],
      rotation: Math.random() * 360,
      vRotation: (Math.random() - 0.5) * 10,
      vy: Math.random() * 2.5 + 2,
      vx: (Math.random() - 0.5) * 2,
      opacity: 1
    }));

    let frame = 0;
    const maxFrames = 260;

    function animate() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillAlive = false;

      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vRotation;
        if (frame > maxFrames - 60) p.opacity = Math.max(0, p.opacity - 0.02);
        if (p.y < canvas.height + 20 && p.opacity > 0) stillAlive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame += 1;
      if (stillAlive && frame < maxFrames) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }

    animate();
  }

  /* ------------------------------------------------------------------------
     8. BAŞLAT
     ------------------------------------------------------------------------ */
  document.addEventListener('DOMContentLoaded', () => {
    initEnvelope();
    initMusic();
    playIntro();
  });
})();
