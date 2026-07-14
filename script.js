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
        envelope.style.transform = `rotateY(${relX * 9}deg) rotateX(${-relY * 7}deg)`;
        envelope.style.setProperty('--sheen-x', `${(relX + 0.5) * 100}%`);
        envelope.style.setProperty('--sheen-y', `${(relY + 0.5) * 100}%`);
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

    // Kamera hareketi: kapak açılırken hafif yakınlaşma + yavaşça normale dönüş
    gsap.to(envelopeStage, {
      scale: 1.06,
      duration: 1.6,
      ease: 'power2.inOut'
    });

    setTimeout(() => {
      gsap.to(envelopeStage, {
        opacity: 0,
        scale: 1.1,
        duration: 1,
        ease: 'power1.inOut',
        onComplete: () => {
          envelopeStage.style.display = 'none';
          revealCard();
        }
      });
    }, 1650);
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
      { scale: 1, duration: 1.8, ease: 'power2.out' }
    );

    const tl = gsap.timeline({
      defaults: { ease: 'power3.out' },
      onComplete: () => {
        startCountdown();
        initScrollReveals();
        initCardTilt();
      }
    });

    tl.to(card, { opacity: 1, y: 0, scale: 1, duration: 1.3 })
      .to('.invitation-image', { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 1 }, '-=0.4');
  }

  /* ------------------------------------------------------------------------
     3a. DAVETİYE GÖRSELİNE HAFİF 3D IŞIK/TİLT — fareye göre
     ------------------------------------------------------------------------ */
  function initCardTilt() {
    if (!window.matchMedia('(hover: hover)').matches || prefersReducedMotion) return;
    const wrap = document.getElementById('invitationImageWrap');
    if (!wrap) return;

    wrap.addEventListener('mousemove', (e) => {
      const rect = wrap.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      wrap.style.setProperty('--tilt-x', `${relX * 6}deg`);
      wrap.style.setProperty('--tilt-y', `${-relY * 6}deg`);
      wrap.style.setProperty('--sheen-x', `${(relX + 0.5) * 100}%`);
      wrap.style.setProperty('--sheen-y', `${(relY + 0.5) * 100}%`);
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

    // Her birim için flip-card elemanlarını hazırla
    const units = ['days', 'hours', 'minutes', 'seconds'].map((key) => {
      const card = document.getElementById(`flip-${key}`);
      const inner = card ? card.querySelector('.flip-card__inner') : null;
      const front = card ? card.querySelector('[data-role="front"]') : null;
      const back = card ? card.querySelector('[data-role="back"]') : null;
      return { key, inner, front, back, current: null };
    });

    function flipTo(unit, value) {
      const formatted = pad(value);
      if (unit.current === formatted) return;
      unit.current = formatted;

      if (!unit.inner || prefersReducedMotion) {
        if (unit.front) unit.front.textContent = formatted;
        if (unit.back) unit.back.textContent = formatted;
        return;
      }

      // Arka yüz yeni değeri gösterir, kart 180° dönünce bu yüz öne gelir
      unit.back.textContent = formatted;
      unit.inner.classList.add('is-flipping');

      const onDone = () => {
        unit.inner.removeEventListener('transitionend', onDone);
        // Dönüşü sıfırla ama geçiş efekti olmadan (görünmez şekilde),
        // ön yüzü de yeni değere güncelle — bir sonraki flip için hazır olsun
        unit.inner.style.transition = 'none';
        unit.inner.classList.remove('is-flipping');
        unit.front.textContent = formatted;
        // Reflow zorlayarak transition'ı güvenle geri aç
        void unit.inner.offsetWidth;
        unit.inner.style.transition = '';
      };

      unit.inner.addEventListener('transitionend', onDone, { once: true });
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
      units.forEach((unit) => flipTo(unit, values[unit.key]));

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
              ease: 'power2.out'
            });
          } else {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'none';
            entry.target.style.filter = 'none';
          }

          if (entry.target.classList.contains('site-footer') && !entry.target.dataset.finaleFired) {
            entry.target.dataset.finaleFired = 'true';
            firePetals();
            setTimeout(fireConfetti, 900);
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
     6a. ÇİÇEK YAPRAKLARI — footer görününce, konfettiden hemen önce
         yavaşça, zarifçe süzülerek düşer
     ------------------------------------------------------------------------ */
  function firePetals() {
    if (prefersReducedMotion) return;
    const canvas = document.getElementById('petalsCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#e8ecef', '#c7ccd1', '#f6eede'];

    function makePetal() {
      return {
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 60,
        size: Math.random() * 10 + 6,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        vRotation: (Math.random() - 0.5) * 3,
        vy: Math.random() * 0.6 + 0.4,
        vx: Math.sin(Math.random() * Math.PI) * 0.6,
        sway: Math.random() * 0.02 + 0.01,
        swayOffset: Math.random() * Math.PI * 2,
        opacity: 0.9
      };
    }

    const petals = Array.from({ length: 36 }, () => makePetal());
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillAlive = false;

      petals.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx + Math.sin(frame * p.sway + p.swayOffset) * 0.6;
        p.rotation += p.vRotation;
        if (frame > fadeStart) p.opacity = Math.max(0, p.opacity - 0.012);
        if (p.y < canvas.height + 20 && p.opacity > 0) stillAlive = true;
        drawPetal(p);
      });

      frame += 1;
      if (stillAlive && frame < totalDuration) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
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
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const colors = ['#c7ccd1', '#e8ecef', '#ffffff', '#8a9096'];

    function makePiece(startAbove) {
      return {
        x: Math.random() * canvas.width,
        y: startAbove ? -20 - Math.random() * 40 : -20 - Math.random() * canvas.height * 0.6,
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
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let stillAlive = false;

      if (frame < spawnUntil && frame % 30 === 0) {
        for (let i = 0; i < 3; i += 1) pieces.push(makePiece(true));
      }

      pieces.forEach((p) => {
        p.y += p.vy;
        p.x += p.vx;
        p.rotation += p.vRotation;
        if (frame > fadeStart) p.opacity = Math.max(0, p.opacity - 0.015);
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
      if (stillAlive && frame < totalDuration) {
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
