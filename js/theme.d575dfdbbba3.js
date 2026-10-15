// Run before styles paint, including when index.html is opened directly.
(() => {
  let preference = null;
  try { preference = localStorage.getItem('motiq-theme'); } catch { /* Storage may be unavailable on file URLs. */ }
  const linkedTheme = new URLSearchParams(window.location.search).get('theme');
  if (linkedTheme === 'dark' || linkedTheme === 'light') {
    preference = linkedTheme;
    try { localStorage.setItem('motiq-theme', preference); } catch { /* Optional persistence. */ }
  }
  const theme = preference === 'light' || preference === 'dark'
    ? preference
    : (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  document.documentElement.dataset.theme = theme;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#181a1b' : '#f7f6f2');
})();
