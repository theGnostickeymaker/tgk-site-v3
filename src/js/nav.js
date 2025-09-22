/* TGK Drawer Controller (robust + safe reset) */
(function () {
  function $(id){ return document.getElementById(id); }

  function init(){
    const drawer  = $('mobileNav') || $('siteNav');
    const overlay = $('navOverlay') || $('navBackdrop');
    const toggles = ['hamburgerFloating','hamburger','navToggle'].map($).filter(Boolean);

    // Safety: start closed (prevents stuck overlay after hot-reload)
    if (drawer){ drawer.classList.remove('open'); drawer.hidden = true; drawer.setAttribute('aria-hidden','true'); }
    if (overlay){ overlay.classList.remove('visible'); overlay.hidden = true; overlay.style.pointerEvents = 'none'; }
    document.body.classList.remove('menu-open');

    if (!drawer || toggles.length === 0) {
      console.warn('[TGK] nav: missing drawer or toggles');
      return;
    }

    const isOpen = () => drawer.classList.contains('open') || drawer.hidden === false;

    function sync(expanded){
      toggles.forEach(btn => {
        btn.setAttribute('aria-expanded', expanded ? 'true' : 'false');
        if (!btn.hasAttribute('aria-controls')) btn.setAttribute('aria-controls', drawer.id);
      });
      drawer.setAttribute('aria-hidden', expanded ? 'false' : 'true');
    }

    function openDrawer(){
      drawer.hidden = false;
      drawer.classList.add('open');
      if (overlay){ overlay.hidden = false; overlay.classList.add('visible'); overlay.style.pointerEvents = 'auto'; }
      document.body.classList.add('menu-open');
      sync(true);
    }

    function closeDrawer(){
      drawer.classList.remove('open');
      drawer.hidden = true;
      if (overlay){ overlay.classList.remove('visible'); overlay.hidden = true; overlay.style.pointerEvents = 'none'; }
      document.body.classList.remove('menu-open');
      sync(false);
    }

    toggles.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        isOpen() ? closeDrawer() : openDrawer();
      }, { capture: true });
    });

    overlay && overlay.addEventListener('click', closeDrawer);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && isOpen()) closeDrawer(); });

    // Close when clicking a link/button inside the drawer
    drawer.addEventListener('click', (e) => {
      const el = e.target.closest('a,button');
      if (el) closeDrawer();
    });

    console.info('[TGK] nav: ready');
  }

  // Wait for DOM to be safe
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // icon swap (optional)
function setIcon(expanded){
  const btns = ['hamburgerFloating','hamburger','navToggle'].map(id=>document.getElementById(id)).filter(Boolean);
  btns.forEach(b => b && (b.textContent = expanded ? '✕' : '☰'));
}
// call inside your open/close:
 // openDrawer() -> setIcon(true)
 // closeDrawer() -> setIcon(false)

})();

