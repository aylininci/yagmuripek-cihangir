/* ==========================================================================
   YAĞMUR & CİHANGİR — DÜĞÜN DAVETİYESİ
   Tüm etkileşimler ve animasyonlar bu dosyada yönetilir.
   ========================================================================== */

(() => {
  'use strict';

  /* ------------------------------------------------------------------------
     0. AYARLAR — Bu bölümü kendi bilgilerinize göre güncelleyin
     ------------------------------------------------------------------------ */
  const WEDDING_DATE = new Date('2026-08-14T19:00:00+03:00');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ------------------------------------------------------------------------
     1. INTRO SEQUENCE — siyah ekran, güvercin illüstrasyonu, başlık, fade
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
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        intro.style.display = 'none';
        initEnvelopeParticles();
      }
    });

    gsap.set(envelopeStage, { opacity: 1 });

    tl.to(doves, { opacity: 1, y: 0, scale: 1, duration: 1.2 })
      .to(introText, { opacity: 1, y: -4, duration: 0.7 }, '-=0.4')
      .to({}, { duration: 1.1 })
      .to(intro, { opacity: 0, duration: 0.9, ease: 'circ.inOut' });
  }

  /* ------------------------------------------------------------------------
     2. ATMOSFER — floating particles (gümüş tonda, hafif ve performanslı)
     ------------------------------------------------------------------------ */
  function initEnvelopeParticles() {
    const canvas = document.getElementById('particles-canvas');
    if (!canvas || prefersReducedMotion) return;
    const ctx = canvas.getContext('2d');
    const dpr = window.devicePixelRatio || 1;
    let particles = [];
    let width, height, rafId;

    function resize() {
      width = canvas.offsetWidth;
      height = canvas.offsetHeight;
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function createParticles() {
      const count = Math.min(40, Math.floor((width * height) / 18000));
      particles = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 1.6 + 0.4,
        vy: Math.random() * 0.25 + 0.08,
        vx: (Math.random() - 0.5) * 0.12,
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

    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        cancelAnimationFrame(rafId);
        resize();
        createParticles();
        draw();
      }, 150);
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
      let pending = false;
      let relX = 0;
      let relY = 0;
      wrap.addEventListener('mousemove', (e) => {
        const rect = wrap.getBoundingClientRect();
        relX = (e.clientX - rect.left) / rect.width - 0.5;
        relY = (e.clientY - rect.top) / rect.height - 0.5;
        if (pending) return;
        pending = true;
        requestAnimationFrame(() => {
          if (!envelope.classList.contains('envelope--open')) {
            envelope.style.transform = `rotateY(${relX * 9}deg) rotateX(${-relY * 7}deg)`;
            envelope.style.setProperty('--sheen-x', `${(relX + 0.5) * 100}%`);
            envelope.style.setProperty('--sheen-y', `${(relY + 0.5) * 100}%`);
          }
          pending = false;
        });
      });
      wrap.addEventListener('mouseleave', () => {
        if (!envelope.classList.contains('envelope--open')) {
          envelope.style.transform = 'rotateY(0deg) rotateX(0deg)';
        }
      });
    }

    wrap.addEventListener('touchmove', (e) => {
      if (!e.touches || !e.touches[0]) return;
      if (envelope.classList.contains('envelope--open')) return;
      const rect = wrap.getBoundingClientRect();
      const relX = (e.touches[0].clientX - rect.left) / rect.width - 0.5;
      envelope.style.transform = `rotateY(${relX * 8}deg)`;
    }, { passive: true });

    let opened = false;
    function handleOpen() {
      if (opened) return;
      opened = true;
      openInvitation();
    }

    wrap.addEventListener('click', handleOpen);
    wrap.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleOpen();
      }
    });
  }

  function openInvitation() {
    const wrap = document.getElementById('envelopeWrap');
    const envelope = document.getElementById('envelope');
    const openCue = document.getElementById('openCue');
    const envelopeStage = document.getElementById('envelope-stage');
    const invitation = document.getElementById('invitation');
    const card = document.getElementById('mainCard');

    if (openCue) openCue.setAttribute('hidden', '');
    if (wrap) wrap.classList.add('is-opening');
    envelope.classList.add('envelope--open');
    // Fare tilt'ini sıfırla ki flap açılırken zarf düz dursun
    envelope.style.transform = 'rotateY(0deg) rotateX(0deg)';

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

    if (prefersReducedMotion || typeof gsap === 'undefined') {
      envelopeStage.style.transition = 'opacity 0.3s ease';
      envelopeStage.style.opacity = '0';
      setTimeout(() => { envelopeStage.style.display = 'none'; revealCard(); }, 300);
      return;
    }

    // Kamera hareketi: kapak açılırken hafif yakınlaşma + yavaşça normale dönüş
    gsap.to(envelopeStage, {
      scale: 1.06,
      duration: 1.6,
      ease: 'circ.inOut'
    });

    setTimeout(() => {
      gsap.to(envelopeStage, {
        opacity: 0,
        scale: 1.1,
        duration: 1,
        ease: 'circ.inOut',
        onComplete: () => {
          envelopeStage.style.display = 'none';
          revealCard();
        }
      });
    }, 1400);
  }

  function animateCardEntrance(card) {
    if (prefersReducedMotion || typeof gsap === 'undefined') {
      card.style.opacity = '1';
      card.style.transform = 'none';
      document.querySelectorAll('.reveal').forEach((el) => {
        el.style.opacity = '1';
        el.style.transform = 'none';
        el.style.filter = 'none';
      });
      startCountdown();
      initScrollReveals();
      initCardTilt();
      return;
    }

    // Kamera: kart çıkarken biraz daha yaklaşıp yavaşça normale dönüyor
    gsap.fromTo('#invitation',
      { scale: 1.05 },
      { scale: 1, duration: 1.8, ease: 'expo.out' }
    );

    const tl = gsap.timeline({
      defaults: { ease: 'expo.out' },
      onComplete: () => {
        startCountdown();
        initScrollReveals();
        initCardTilt();
      }
    });

    tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 1.3 })
      .to('.card__names', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.8 }, '-=0.4')
      .to('.card__message', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7 }, '-=0.35')
      .to('.card__details', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7 }, '-=0.3')
      .to('.card__parents', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.7 }, '-=0.3');
  }

  /* ------------------------------------------------------------------------
     3a. DAVETİYE KARTINA HAFİF 3D IŞIK/TİLT — fareye göre (rAF ile 60fps)
     ------------------------------------------------------------------------ */
  function initCardTilt() {
    if (!window.matchMedia('(hover: hover)').matches || prefersReducedMotion) return;
    const wrap = document.getElementById('mainCard');
    if (!wrap) return;

    let pending = false;
    let lastX = 0;
    let lastY = 0;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      lastX = (e.clientX - rect.left) / rect.width - 0.5;
      lastY = (e.clientY - rect.top) / rect.height - 0.5;
      if (pending) return;
      pending = true;
      requestAnimationFrame(() => {
        wrap.style.setProperty('--tilt-x', `${lastX * 6}deg`);
        wrap.style.setProperty('--tilt-y', `${-lastY * 6}deg`);
        pending = false;
      });
    });

    wrap.addEventListener('mouseleave', () => {
      wrap.style.setProperty('--tilt-x', '0deg');
      wrap.style.setProperty('--tilt-y', '0deg');
    });
  }

  /* ------------------------------------------------------------------------
     4. GERİ SAYIM — her saniye güncellenen canlı sayaç
     ------------------------------------------------------------------------ */
  let countdownInterval;
  function startCountdown() {
    if (countdownInterval) return;

    function pad(n) { return String(n).padStart(2, '0'); }

    const units = ['days', 'hours', 'minutes', 'seconds'].map((key) => {
      const card = document.getElementById(`flip-${key}`);
      const q = (sel) => (card ? card.querySelector(sel) : null);
      return {
        key,
        current: null,
        staticTop: q('[data-role="static-top"]'),
        staticBottom: q('[data-role="static-bottom"]'),
        leafTop: q('[data-role="leaf-top"]'),
        leafBottom: q('[data-role="leaf-bottom"]'),
        leafTopText: q('[data-role="leaf-top-text"]'),
        leafBottomText: q('[data-role="leaf-bottom-text"]')
      };
    });

    function flipUnit(unit, value) {
      const formatted = pad(value);
      if (unit.current === formatted) return;
      const oldValue = unit.current;
      unit.current = formatted;

      // Statikler her zaman güncel değeri taşır
      if (unit.staticTop) unit.staticTop.textContent = formatted;
      if (unit.staticBottom) unit.staticBottom.textContent = formatted;
      if (unit.leafBottomText) unit.leafBottomText.textContent = formatted;

      // İlk çizimde (sayfa yeni açıldığında) animasyon oynatma
      if (oldValue === null || prefersReducedMotion || !unit.leafTop || !unit.leafBottom) {
        if (unit.leafTopText) unit.leafTopText.textContent = formatted;
        return;
      }

      if (unit.leafTopText) unit.leafTopText.textContent = oldValue;

      // Yaprakları başlangıç konumuna, geçiş efekti olmadan sıfırla
      unit.leafTop.style.transition = 'none';
      unit.leafBottom.style.transition = 'none';
      unit.leafTop.classList.remove('is-animating', 'is-flipping-top');
      unit.leafBottom.classList.remove('is-animating', 'is-flipping-bottom');
      unit.leafTop.style.transform = 'rotateX(0deg)';
      unit.leafBottom.style.transform = 'rotateX(90deg)';
      void unit.leafTop.offsetWidth; // reflow ile sıfırlamayı garanti et

      // Üst yaprak: tam ortadan aşağı katlanır (0° -> -90°)
      unit.leafTop.style.transition = '';
      unit.leafTop.classList.add('is-animating');
      requestAnimationFrame(() => unit.leafTop.classList.add('is-flipping-top'));

      // Alt yaprak: hafif gecikmeyle aşağıdan yukarı açılır (90° -> 0°)
      // — gerçek mekanik saatlerdeki gibi üst yaprağın düşüşünün ardından gelir
      setTimeout(() => {
        unit.leafBottom.style.transition = '';
        unit.leafBottom.classList.add('is-animating');
        requestAnimationFrame(() => unit.leafBottom.classList.add('is-flipping-bottom'));
      }, 140);

      // Animasyon bitince yaprakları görünmez/başlangıç haline döndür
      setTimeout(() => {
        if (unit.leafTop) unit.leafTop.classList.remove('is-animating', 'is-flipping-top');
        if (unit.leafBottom) unit.leafBottom.classList.remove('is-animating', 'is-flipping-bottom');
      }, 560);
    }

    function tick() {
      const now = new Date();
      let diff = WEDDING_DATE.getTime() - now.getTime();
      if (diff < 0) diff = 0;

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      const seconds = Math.floor((diff / 1000) % 60);

      const values = { days, hours, minutes, seconds };
      units.forEach((unit) => flipUnit(unit, values[unit.key]));

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
            gsap.to(entry.target, {
              opacity: 1,
              y: 0,
              scale: 1,
              filter: 'blur(0px)',
              duration: 1.1,
              ease: 'expo.out'
            });
          } else {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            entry.target.style.filter = 'none';
          }

          if (entry.target.classList.contains('site-footer') && !entry.target.dataset.finaleFired) {
            entry.target.dataset.finaleFired = 'true';
            firePetals();
            setTimeout(fireConfetti, 250);
            const dim = document.getElementById('finalDim');
            if (dim) setTimeout(() => dim.classList.add('is-active'), 1800);
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
     Yardımcı: canvas'ı HiDPI (retina) ekranlara uygun ölçekle hazırla
     ------------------------------------------------------------------------ */
  function setupHiDPICanvas(canvas, ctx) {
    const dpr = window.devicePixelRatio || 1;
    const w = window.innerWidth;
    const h = window.innerHeight;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { w, h };
  }

  /* ------------------------------------------------------------------------
     6a. ÇİÇEK YAPRAKLARI — footer görününce, konfettiyle birlikte
         dağınık, zarifçe süzülerek düşer
     ------------------------------------------------------------------------ */
  function firePetals() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('petalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let { w, h } = setupHiDPICanvas(canvas, ctx);

    const onResize = () => { const d = setupHiDPICanvas(canvas, ctx); w = d.w; h = d.h; };
    window.addEventListener('resize', onResize);

    const colors = ['#e8ecef', '#c7ccd1', '#f6eede'];

    function makePetal() {
      return {
        x: Math.random() * w,
        y: -20 - Math.random() * 120,
        size: Math.random() * 12 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 6,
        vy: Math.random() * 1.1 + 0.35,
        vx: (Math.random() - 0.5) * 1.8,
        sway: Math.random() * 0.03 + 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        swayAmp: Math.random() * 1.4 + 0.5,
        opacity: Math.random() * 0.3 + 0.7
      };
    }

    const petals = Array.from({ length: 60 }, () => makePetal());
    let frame = 0;
    const totalDuration = 420;
    const fadeStart = totalDuration - 100;

    function drawPetal(p) {
      ctx.save();
      ctx.globalAlpha = p.opacity;
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size * 0.5, p.size, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    function animate() {
      ctx.clearRect(0, 0, w, h);
      let stillAlive = false;

      petals.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(frame * p.sway + p.swayOffset) * p.swayAmp;
        p.rotation += p.vRotation;
        if (frame > fadeStart) p.opacity = Math.max(0, p.opacity - 0.012);
        if (p.y < h + 20 && p.opacity > 0) stillAlive = true;
        drawPetal(p);
      });

      frame += 1;
      if (stillAlive && frame < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
        window.removeEventListener('resize', onResize);
      }
    }

    animate();
  }

  /* ------------------------------------------------------------------------
     7. KONFETİ — gümüş tonlarda, sayfanın sonuna gelindiğinde
     ------------------------------------------------------------------------ */
  function fireConfetti() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('confettiCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let { w, h } = setupHiDPICanvas(canvas, ctx);

    const onResize = () => { const d = setupHiDPICanvas(canvas, ctx); w = d.w; h = d.h; };
    window.addEventListener('resize', onResize);

    const colors = ['#c7ccd1', '#e8ecef', '#ffffff', '#8a9096'];

    function makePiece(startAbove) {
      return {
        x: Math.random() * w,
        y: startAbove ? -20 - Math.random() * 40 : -20 - Math.random() * h * 0.6,
        w: Math.random() * 8 + 4,
        h: Math.random() * 4 + 3,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 8,
        vy: Math.random() * 2 + 1.4,
        vx: (Math.random() - 0.5) * 1.4,
        opacity: 1
      };
    }

    let pieces = Array.from({ length: 70 }, () => makePiece(false));

    let frame = 0;
    const totalDuration = 340;   // ~5-6 saniye boyunca konfeti yağar
    const spawnUntil = 120;      // bu kareye kadar birkaç ek parça eklenir
    const fadeStart = totalDuration - 70;

    function animate() {
      ctx.clearRect(0, 0, w, h);
      let stillAlive = false;

      if (frame < spawnUntil && frame % 30 === 0) {
        for (let i = 0; i < 3; i += 1) pieces.push(makePiece(true));
      }

      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vRotation;
        if (frame > fadeStart) p.opacity = Math.max(0, p.opacity - 0.015);
        if (p.y < h + 20 && p.opacity > 0) stillAlive = true;

        ctx.save();
        ctx.globalAlpha = p.opacity;
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
        ctx.restore();
      });

      frame += 1;
      if (stillAlive && frame < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, w, h);
        window.removeEventListener('resize', onResize);
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
