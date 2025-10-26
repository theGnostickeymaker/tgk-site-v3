(function () {
  const root = document.documentElement;
  const THEME_KEY = 'tgk_theme';

  // Element selectors
  const floatBtn = document.getElementById('theme-toggle');
  const navBtn   = document.getElementById('tgkTheme');
  const topBtn   = document.getElementById('scrollTopBtn');
  const btmBtn   = document.getElementById('scrollBtmBtn');
  const tray     = document.querySelector('.floating-toggles');

  // --- Theme handling ---
  /**
   * @param {string} theme
   */
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    try { localStorage.setItem(THEME_KEY, theme); } catch {}
    updateThemeUI(theme);
  }

  /**
   * @param {string} theme
   */
  function updateThemeUI(theme) {
    const isDark = theme === 'dark';

    if (floatBtn) {
      const icon = floatBtn.querySelector('.icon');
      if (icon) icon.textContent = isDark ? '🌙' : '☀️';
      floatBtn.setAttribute('aria-pressed', String(isDark));
      floatBtn.title = isDark ? 'Switch to light' : 'Switch to dark';
    }

    if (navBtn) {
      navBtn.textContent = isDark ? 'Light' : 'Dark';
      navBtn.setAttribute('aria-pressed', String(isDark));
      navBtn.title = isDark ? 'Switch to light' : 'Switch to dark';
    }
  }

  function toggleTheme() {
    const current = root.getAttribute('data-theme') || 'dark';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  }

  // --- scroll buttons ---
  if (topBtn) {
    topBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'auto' });
    });
  }

  if (btmBtn) {
    btmBtn.addEventListener('click', () => {
      window.scrollTo({ 
        top: document.documentElement.scrollHeight, 
        behavior: 'auto' 
      });
    });
  }

  // --- Theme toggle bindings ---
  floatBtn?.addEventListener('click', toggleTheme);
  navBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    toggleTheme();
  });

  // --- Init theme + make tray visible ---
  applyTheme(localStorage.getItem(THEME_KEY) || 'dark');
  tray?.classList.add('is-visible');
})();
