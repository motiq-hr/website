(() => {
  'use strict';

  const isCroatian = document.documentElement.lang === 'hr';
  const labels = isCroatian
    ? { open: 'Otvori izbornik', close: 'Zatvori izbornik', dark: 'Uključi tamni način', light: 'Uključi svijetli način', subject: 'Upit za projekt', name: 'Ime', email: 'Poslovni e-mail', company: 'Tvrtka', message: 'Projekt / problem' }
    : { open: 'Open navigation', close: 'Close navigation', dark: 'Switch to dark mode', light: 'Switch to light mode', subject: 'Project discussion', name: 'Name', email: 'Work email', company: 'Company', message: 'Project / problem' };
  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();

  const themeButton = document.querySelector('.theme-toggle');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');
  const readPreference = () => {
    try { return localStorage.getItem('motiq-theme'); } catch { return null; }
  };
  const applyTheme = (theme, save = false) => {
    const dark = theme === 'dark';
    document.documentElement.dataset.theme = theme;
    if (save) {
      try { localStorage.setItem('motiq-theme', theme); } catch { /* The toggle still works without storage. */ }
    }
    if (themeButton) {
      const label = dark ? labels.light : labels.dark;
      themeButton.setAttribute('aria-pressed', String(dark));
      themeButton.setAttribute('aria-label', label);
      themeButton.title = label;
      themeButton.hidden = false;
    }
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#181a1b' : '#f7f6f2');
    // Pass the preference between languages even when file URLs use isolated storage.
    document.querySelectorAll('.lang a').forEach(link => {
      const url = new URL(link.href);
      url.searchParams.set('theme', theme);
      link.href = url.href;
    });
    const current = new URL(window.location.href);
    if (current.searchParams.has('theme')) {
      current.searchParams.set('theme', theme);
      try { history.replaceState(null, '', current); } catch { /* Some local-file browsers restrict history. */ }
    }
  };
  applyTheme(document.documentElement.dataset.theme || (systemTheme.matches ? 'dark' : 'light'));
  themeButton?.addEventListener('click', () => applyTheme(document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark', true));
  systemTheme.addEventListener('change', event => {
    const saved = readPreference();
    if (saved !== 'dark' && saved !== 'light') applyTheme(event.matches ? 'dark' : 'light');
  });
  window.addEventListener('storage', event => {
    if (event.key === 'motiq-theme') applyTheme(event.newValue === 'dark' || event.newValue === 'light' ? event.newValue : (systemTheme.matches ? 'dark' : 'light'));
  });

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  const setMenu = open => {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? labels.close : labels.open);
    mobileNav.classList.toggle('open', open);
  };
  if (menuButton && mobileNav) {
    setMenu(false);
    menuButton.addEventListener('click', () => setMenu(menuButton.getAttribute('aria-expanded') !== 'true'));
    mobileNav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));
    document.addEventListener('keydown', event => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuButton.focus();
      }
    });
    document.addEventListener('click', event => {
      if (!event.target.closest('.site-header')) setMenu(false);
    });
    window.matchMedia('(min-width: 961px)').addEventListener('change', event => {
      if (event.matches) setMenu(false);
    });
  }

  const documentFlow = document.querySelector('.document-flow');
  const replayButton = documentFlow?.querySelector('.flow-replay');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  if (replayButton) {
    const updateMotion = () => { replayButton.hidden = reducedMotion.matches; };
    updateMotion();
    reducedMotion.addEventListener('change', updateMotion);
    replayButton.addEventListener('click', () => {
      documentFlow.classList.remove('is-playing');
      requestAnimationFrame(() => requestAnimationFrame(() => documentFlow.classList.add('is-playing')));
    });
  }

  const contactForm = document.getElementById('contact-form');
  contactForm?.addEventListener('submit', event => {
    event.preventDefault();
    const data = new FormData(contactForm);
    const name = String(data.get('name') || '').trim();
    const email = String(data.get('email') || '').trim();
    const company = String(data.get('company') || '').trim();
    const message = String(data.get('message') || '').trim();
    const subject = labels.subject + (company ? ' - ' + company : '');
    const body = [
      labels.name + ': ' + name,
      labels.email + ': ' + email,
      ...(company ? [labels.company + ': ' + company] : []),
      '',
      labels.message + ':',
      message
    ].join('\n');
    window.location.href = 'mailto:info@motiq.biz?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(body);
  });
})();
