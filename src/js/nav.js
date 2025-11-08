/* ===========================================================
   🜂 TGK — Drawer Navigation Controller (v3.1)
   Adds dynamic auth-aware link toggling for membership items
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

    /* --- Ensure clean start (no stuck menus after reload) --- */
    closeDrawer({ silent: true });

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

    /* ===========================================================
       🜂 Auth-aware menu visibility
       =========================================================== */
    try {
      import("https://www.gstatic.com/firebasejs/10.14.0/firebase-auth.js")
        .then(({ getAuth, onAuthStateChanged, signOut }) => {
          import("/js/firebase-init.js").then(({ app }) => {
            const auth = getAuth(app);
            const showAuthTrue  = drawer.querySelectorAll('[data-auth="true"]');
            const showAuthFalse = drawer.querySelectorAll('[data-auth="false"]');
            const signOutBtn    = drawer.querySelector('.nav-signout');

            onAuthStateChanged(auth, (user) => {
              if (user) {
                showAuthTrue.forEach(el => el.hidden = false);
                showAuthFalse.forEach(el => el.hidden = true);
              } else {
                showAuthTrue.forEach(el => el.hidden = true);
                showAuthFalse.forEach(el => el.hidden = false);
              }
            });

            if (signOutBtn) {
              signOutBtn.addEventListener('click', async () => {
                try {
                  await signOut(auth);
                  localStorage.clear();
                  sessionStorage.clear();
                  window.location.href = "/signin/";
                } catch (err) {
                  console.error("[TGK] Sign-out error:", err);
                  alert("Error signing out: " + err.message);
                }
              });
            }
          });
        });
    } catch (err) {
      console.error("[TGK] nav-auth integration failed:", err);
    }

    console.info('[TGK] nav: ready');
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
