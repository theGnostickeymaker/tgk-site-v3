(function () {
  const root = document.documentElement;
  const KEY = 'tgk_theme';

  // Buttons (both patterns supported)
  const floatBtn = document.getElementById('theme-toggle');
  const navBtn   = document.getElementById('tgkTheme'); // optional nav button
  const topBtn   = document.getElementById('scrollTopBtn');
  const tray     = document.querySelector('.floating-toggles'); // 👈 class selector now

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateUI(theme) {
    if (floatBtn) {
      const icon = floatBtn.querySelector('.icon');
      if (icon) icon.textContent = theme === 'dark' ? '🌙' : '☀️';
      floatBtn.setAttribute('aria-pressed', String(theme === 'dark'));
      floatBtn.title = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
    }
    if (navBtn) {
      navBtn.textContent = theme === 'light' ? 'Dark' : 'Light';
      navBtn.setAttribute('aria-pressed', String(theme === 'dark'));
      navBtn.title = theme === 'dark' ? 'Switch to light' : 'Switch to dark';
    }
  }

  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(KEY, theme); } catch {}
    updateUI(theme);
  }

  function currentTheme() {
    return root.getAttribute('data-theme') || 'dark';
  }

  function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // Init from saved or fallback
  applyTheme(localStorage.getItem(KEY) || 'dark');

  floatBtn?.addEventListener('click', toggleTheme);
  navBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });

  // Scroll-to-top
  topBtn?.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  });

  // Tray visibility — force always visible
  if (tray) {
    tray.classList.add('is-visible'); // 👈 no threshold check, always shown
  }
})();
