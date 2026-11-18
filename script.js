/* =========================================================
   PORTFOLIO MODERN - script.js
   Edit bagian CONFIG di bawah untuk menyesuaikan cepat.
   ========================================================= */
(() => {
  'use strict';

  /* ---------- CONFIG (silakan ubah) ---------- */
  const CONFIG = {
    // Teks yang mengetik otomatis di hero
    roles: ['UI/UX Designer', 'Web Developer', 'IT Support', 'Problem Solver'],
    typeSpeed: 80,     // ms per huruf saat mengetik
    deleteSpeed: 45,   // ms per huruf saat menghapus
    pauseTime: 1600,   // jeda setelah satu kata selesai
    counterDuration: 1800 // durasi animasi angka (ms)
  };

  /* ---------- Helper ---------- */
  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const canHover     = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

  const store = {
    get(k) { try { return localStorage.getItem(k); } catch { return null; } },
    set(k, v) { try { localStorage.setItem(k, v); } catch { /* abaikan */ } }
  };

  /* =========================================================
     1. TEMA TERANG / GELAP
     ========================================================= */
  const root = document.documentElement;
  const themeBtn = $('#themeToggle');

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    // Di tema gelap tampilkan ikon matahari (untuk pindah ke terang), dan sebaliknya
    themeBtn.innerHTML = theme === 'dark'
      ? '<i class="fa-solid fa-sun"></i>'
      : '<i class="fa-solid fa-moon"></i>';
  }

  const savedTheme = store.get('theme');
  const systemDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(savedTheme || (systemDark ? 'dark' : 'dark')); // default: gelap

  themeBtn.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    store.set('theme', next);
  });

  /* =========================================================
     2. MENU MOBILE
     ========================================================= */
  const burger = $('#burger');
  const menu = $('#menu');

  function setMenu(open) {
    menu.classList.toggle('open', open);
    burger.classList.toggle('open', open);
    burger.setAttribute('aria-expanded', String(open));
  }

  burger.addEventListener('click', () => setMenu(!menu.classList.contains('open')));
  $$('a', menu).forEach(a => a.addEventListener('click', () => setMenu(false)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') setMenu(false); });

  /* =========================================================
     3. SCROLL: header, progress bar, back-to-top
     ========================================================= */
  const header = $('#header');
  const progress = $('#scrollProgress');
  const backTop = $('#backTop');
  let ticking = false;

  function onScroll() {
    const y = window.scrollY;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    header.classList.toggle('scrolled', y > 30);
    progress.style.width = (max > 0 ? (y / max) * 100 : 0) + '%';
    backTop.classList.toggle('show', y > 600);
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(onScroll); ticking = true; }
  }, { passive: true });
  onScroll();

  backTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* =========================================================
     4. SCROLLSPY (menu aktif mengikuti section)
     ========================================================= */
  const sections = $$('main section[id]');
  const menuLinks = $$('a', menu);

  const spy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        menuLinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + entry.target.id));
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px' });

  sections.forEach(s => spy.observe(s));

  /* =========================================================
     5. ANIMASI REVEAL SAAT SCROLL
     ========================================================= */
  // Beri jeda bertingkat (stagger) pada anak-anak grup
  $$('[data-stagger]').forEach(group => {
    $$(':scope > .reveal', group).forEach((el, i) => el.style.setProperty('--d', (i * 0.1) + 's'));
  });

  const revealTargets = $$('.reveal, .skill');

  if (reduceMotion || !('IntersectionObserver' in window)) {
    revealTargets.forEach(el => el.classList.add('show'));
  } else {
    const revealObs = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('show');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach(el => revealObs.observe(el));
  }

  /* =========================================================
     6. EFEK MENGETIK
     ========================================================= */
  const typedEl = $('#typed');

  function startTyping() {
    if (!typedEl) return;
    if (reduceMotion) { typedEl.textContent = CONFIG.roles[0]; return; }

    let roleIdx = 0, charIdx = 0, deleting = false;

    (function tick() {
      const word = CONFIG.roles[roleIdx];
      typedEl.textContent = word.slice(0, charIdx);

      let delay = deleting ? CONFIG.deleteSpeed : CONFIG.typeSpeed;

      if (!deleting && charIdx === word.length) {
        deleting = true;
        delay = CONFIG.pauseTime;
      } else if (deleting && charIdx === 0) {
        deleting = false;
        roleIdx = (roleIdx + 1) % CONFIG.roles.length;
        delay = 400;
      } else {
        charIdx += deleting ? -1 : 1;
      }
      setTimeout(tick, delay);
    })();
  }
  startTyping();

  /* =========================================================
     7. ANIMASI ANGKA (counter)
     ========================================================= */
  function animateCount(el) {
    const target = +el.dataset.target;
    if (reduceMotion) { el.textContent = target; return; }

    const start = performance.now();
    const easeOut = t => 1 - Math.pow(1 - t, 3);

    (function frame(now) {
      const p = Math.min((now - start) / CONFIG.counterDuration, 1);
      el.textContent = Math.round(easeOut(p) * target);
      if (p < 1) requestAnimationFrame(frame);
    })(start);
  }

  const counterObs = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCount(entry.target);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });

  $$('.count').forEach(el => counterObs.observe(el));

  /* =========================================================
     8. MARQUEE (gandakan isi agar looping mulus)
     ========================================================= */
  const track = $('#marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* =========================================================
     9. FILTER PROYEK
     ========================================================= */
  const filterBtns = $$('#filters .chip');
  const projects = $$('#projectsGrid .project');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;
      projects.forEach(card => {
        const match = filter === 'all' || card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
        card.classList.remove('pop');
        if (match) {
          // paksa reflow agar animasi bisa diulang
          void card.offsetWidth;
          card.classList.add('pop');
          card.classList.add('show'); // pastikan terlihat walau belum ter-reveal
        }
      });
    });
  });

  /* =========================================================
     10. EFEK TILT 3D PADA FOTO HERO
     ========================================================= */
  const tilt = $('#tilt');

  if (tilt && canHover && !reduceMotion) {
    const MAX = 9; // derajat

    tilt.parentElement.addEventListener('pointermove', e => {
      const r = tilt.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      tilt.style.transform = `rotateY(${x * MAX * 2}deg) rotateX(${-y * MAX * 2}deg)`;
    });

    tilt.parentElement.addEventListener('pointerleave', () => {
      tilt.style.transform = 'rotateY(0) rotateX(0)';
    });
  }

  /* =========================================================
     11. CURSOR GLOW (cahaya mengikuti mouse)
     ========================================================= */
  const glow = $('#cursorGlow');

  if (glow && canHover && !reduceMotion) {
    let tx = window.innerWidth / 2, ty = window.innerHeight / 2;
    let cx = tx, cy = ty;

    window.addEventListener('pointermove', e => {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = 1;
    }, { passive: true });

    document.addEventListener('pointerleave', () => { glow.style.opacity = 0; });

    (function follow() {
      cx += (tx - cx) * 0.12;
      cy += (ty - cy) * 0.12;
      glow.style.transform = `translate(${cx - 260}px, ${cy - 260}px)`;
      requestAnimationFrame(follow);
    })();
  }

  /* =========================================================
     12. TOAST
     ========================================================= */
  const toast = $('#toast');
  let toastTimer;

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove('show'), 3500);
  }

  /* =========================================================
     13. FORM KONTAK (validasi)
     ========================================================= */
  const form = $('#contactForm');

  const rules = {
    name:    v => v.trim().length >= 2 ? '' : 'Nama minimal 2 karakter.',
    email:   v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim()) ? '' : 'Masukkan email yang valid.',
    message: v => v.trim().length >= 10 ? '' : 'Pesan minimal 10 karakter.'
  };

  function validateField(input) {
    const msg = rules[input.name](input.value);
    const field = input.closest('.field');
    field.classList.toggle('error', !!msg);
    $('.error-msg', field).textContent = msg;
    return !msg;
  }

  $$('input, textarea', form).forEach(input => {
    input.addEventListener('blur', () => validateField(input));
    input.addEventListener('input', () => {
      if (input.closest('.field').classList.contains('error')) validateField(input);
    });
  });

  form.addEventListener('submit', e => {
    e.preventDefault();

    const inputs = $$('input, textarea', form);
    const allValid = inputs.map(validateField).every(Boolean);
    if (!allValid) {
      showToast('Mohon periksa kembali isian formulir.');
      return;
    }

    const btn = $('#submitBtn');
    const label = $('.btn-label', btn);
    btn.classList.add('loading');
    label.textContent = 'Mengirim...';

    /* ---------------------------------------------------------
       CATATAN: ini masih SIMULASI (belum mengirim ke mana pun).
       Untuk mengirim betulan, ganti setTimeout di bawah dengan
       fetch() ke layanan seperti Formspree, EmailJS, atau
       backend milikmu sendiri.
       --------------------------------------------------------- */
    setTimeout(() => {
      btn.classList.remove('loading');
      label.textContent = 'Kirim Pesan';
      form.reset();
      showToast('Terima kasih! Pesanmu sudah terkirim (simulasi).');
    }, 1200);
  });

  /* =========================================================
     14. TAHUN OTOMATIS DI FOOTER
     ========================================================= */
  const year = $('#year');
  if (year) year.textContent = new Date().getFullYear();
})();
