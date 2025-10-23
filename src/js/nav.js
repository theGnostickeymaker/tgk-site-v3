/* ===========================================================
   🜂 TGK — Drawer Navigation Controller (v3.0)
   Handles floating hamburger, overlay, ESC closing,
   and safe reset after hot reload.
   =========================================================== */

(function () {
  const $ = (id) => document.getElementById(id);

  function init() {
    const drawer  = $('mobileNav') || $('siteNav');
    const overlay = $('navOverlay') || $('navBackdrop');
    const toggles = ['hamburgerFloating', 'hamburger', 'navToggle']
      .map($)
      .filter(Boolean);

    if (!drawer || toggles.length === 0) {
      console.warn('[TGK] nav: missing drawer or toggles');
      return;
    }

    // --- Ensure clean start (no stuck menus after reload) ---
    closeDrawer({ silent: true });

    // === Core helpers ===
    const isOpen = () => drawer.classList.contains('open');

    function sync(expanded) {
      toggles.forEach((btn) => {
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (!btn.hasAttribute('aria-controls')) btn.setAttribute('aria-controls', drawer.id);
      });
      drawer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }

    function setIcon(expanded) {
      toggles.forEach((btn) => (btn.textContent = expanded ? '✕' : '☰'));
    }

    // === Actions ===
    function openDrawer() {
      drawer.hidden = false;
      drawer.classList.add('open');
      if (overlay) {
        overlay.hidden = false;
        overlay.classList.add('visible');
        overlay.style.pointerEvents = 'auto';
      }
      document.body.classList.add('menu-open');
      sync(true);
      setIcon(true);
    }

    function closeDrawer(opts = {}) {
      drawer.classList.remove('open');
      drawer.hidden = true;
      if (overlay) {
        overlay.classList.remove('visible');
        overlay.hidden = true;
        overlay.style.pointerEvents = 'none';
      }
      document.body.classList.remove('menu-open');
      sync(false);
      if (!opts.silent) setIcon(false);
    }

    // === Bindings ===
    toggles.forEach((btn) =>
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isOpen() ? closeDrawer() : openDrawer();
      })
    );

    overlay && overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && isOpen()) closeDrawer();
    });

    // Close when clicking a link or button inside the drawer
    drawer.addEventListener('click', (e) => {
      const el = e.target.closest('a, button');
      if (el) closeDrawer();
    });

    console.info('[TGK] nav: ready');
  }

  // === Auto-init when DOM ready ===
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
