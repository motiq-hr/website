/* Motiq — main.js
   Mode switching (tabs + triptych slices), header scroll state,
   scroll-reveal, active-nav highlighting, footer year.
   Scene animations are pure CSS — see the .an classes in style.css. */
(() => {
  'use strict';

  const $  = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Mode switching ---------- */
  const stage = $('.stage');
  const tabs = $$('.tab', stage);
  const slices = $$('.slice', stage);

  function setMode(mode, focusTab = false) {
    stage.dataset.mode = mode;
    tabs.forEach(tab => {
      const selected = tab.dataset.mode === mode;
      tab.setAttribute('aria-selected', String(selected));
      tab.tabIndex = selected ? 0 : -1;
      if (selected && focusTab) tab.focus();
    });
  }

  tabs.forEach(tab => tab.addEventListener('click', () => setMode(tab.dataset.mode)));

  slices.forEach(slice => {
    slice.addEventListener('click', () => setMode(slice.dataset.mode));
    // Hovering a triptych slice previews its tab
    const tab = tabs.find(t => t.dataset.mode === slice.dataset.mode);
    slice.addEventListener('mouseenter', () => tab.classList.add('preview'));
    slice.addEventListener('mouseleave', () => tab.classList.remove('preview'));
  });

  // Arrow-key navigation on the tablist (roving tabindex)
  $('.tabs', stage).addEventListener('keydown', e => {
    const dir = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!dir) return;
    e.preventDefault();
    const current = tabs.findIndex(t => t.getAttribute('aria-selected') === 'true');
    setMode(tabs[(current + dir + tabs.length) % tabs.length].dataset.mode, true);
  });

  /* ---------- Theme toggle ---------- */
  const themeToggle = $('.theme-toggle');
  const themeMeta = $('meta[name="theme-color"]');
  function applyTheme(light, store = true) {
    if (light) document.documentElement.setAttribute('data-theme', 'light');
    else document.documentElement.removeAttribute('data-theme');
    themeToggle.setAttribute('aria-pressed', String(light));
    themeToggle.setAttribute('aria-label', light ? 'Switch to dark theme' : 'Switch to light theme');
    if (themeMeta) themeMeta.content = light ? '#FAFAF8' : '#0B0C0F';
    if (store) try { localStorage.setItem('motiq-theme', light ? 'light' : 'dark'); } catch (e) {}
  }
  if (themeToggle) {
    // Sync button state with the theme restored by the inline head script
    applyTheme(document.documentElement.getAttribute('data-theme') === 'light', false);
    themeToggle.addEventListener('click', () =>
      applyTheme(document.documentElement.getAttribute('data-theme') !== 'light'));
  }

  /* ---------- Header scroll state ---------- */
  /* (intro '.loaded' class is added by an inline script in index.html) */
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      header.classList.toggle('scrolled', window.scrollY > 8);
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (progress) progress.style.setProperty('--sp', max > 0 ? (window.scrollY / max).toFixed(4) : 0);
      ticking = false;
    });
  }
  addEventListener('scroll', onScroll, { passive: true });
  addEventListener('resize', onScroll, { passive: true });
  onScroll();

  /* ---------- Scroll-reveal ---------- */
  const reveals = $$('.reveal');
  if (reducedMotion || !('IntersectionObserver' in window)) {
    reveals.forEach(el => el.classList.add('is-visible'));
  } else {
    $$('.sec').forEach(sec => {
      $$('.reveal', sec).forEach((el, i) => el.style.setProperty('--d', `${i * 70}ms`));
    });
    const revealObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
    reveals.forEach(el => revealObserver.observe(el));
  }

  /* ---------- Active nav link ---------- */
  const navLinks = $$('.site-nav a');
  const sections = navLinks.map(link => $(link.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && sections.length) {
    const navObserver = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const link = navLinks.find(a => a.getAttribute('href') === `#${entry.target.id}`);
        if (link) link.classList.toggle('active', entry.isIntersecting);
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach(sec => navObserver.observe(sec));
  }

  /* ---------- Pause decorative animations off-screen ---------- */
  if ('IntersectionObserver' in window) {
    const animObserver = new IntersectionObserver(entries => {
      entries.forEach(entry =>
        entry.target.classList.toggle('offscreen', !entry.isIntersecting));
    });
    [stage, $('.marquee')].filter(Boolean).forEach(el => animObserver.observe(el));
  }

  /* ---------- Copy email ---------- */
  const copyBtn = $('.copy-btn');
  if (copyBtn) {
    const copyLabel = $('.copy-label', copyBtn);
    let copyTimer = 0;
    copyBtn.addEventListener('click', async () => {
      const email = copyBtn.dataset.email;
      try {
        await navigator.clipboard.writeText(email);
      } catch (e) {
        // Fallback for contexts without the async clipboard API
        const ta = document.createElement('textarea');
        ta.value = email;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e2) {}
        ta.remove();
      }
      copyBtn.classList.add('copied');
      copyLabel.textContent = 'Copied ✓';
      clearTimeout(copyTimer);
      copyTimer = setTimeout(() => {
        copyBtn.classList.remove('copied');
        copyLabel.textContent = 'Copy';
      }, 2000);
    });
  }

  /* ---------- Footer year ---------- */
  $('#year').textContent = new Date().getFullYear();
})();
