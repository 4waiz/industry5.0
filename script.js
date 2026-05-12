// Mobile drawer + Esc-to-close.
(function () {
  'use strict';

  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobileDrawer');

  function closeDrawer() {
    if (!drawer || drawer.hasAttribute('hidden')) return;
    drawer.setAttribute('hidden', '');
    hamburger.classList.remove('is-open');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('menu-open');
  }

  function openDrawer() {
    if (!drawer) return;
    drawer.removeAttribute('hidden');
    hamburger.classList.add('is-open');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('menu-open');
  }

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      if (drawer.hasAttribute('hidden')) openDrawer();
      else closeDrawer();
    });

    // Close when a link in the drawer is clicked.
    drawer.querySelectorAll('a').forEach((a) => {
      a.addEventListener('click', closeDrawer);
    });
  }

  // Esc closes the drawer.
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });

  // Re-show drawer correctly if user resizes back to desktop.
  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (w !== lastWidth && w > 768) closeDrawer();
    lastWidth = w;
  });
})();
