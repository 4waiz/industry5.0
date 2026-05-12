// Minimal interactivity: mobile drawer + accessible mega-menu toggles.
(function () {
  'use strict';

  const hamburger = document.getElementById('hamburger');
  const drawer    = document.getElementById('mobileDrawer');

  if (hamburger && drawer) {
    hamburger.addEventListener('click', () => {
      const open = drawer.hasAttribute('hidden') ? true : false;
      if (open) {
        drawer.removeAttribute('hidden');
        hamburger.setAttribute('aria-expanded', 'true');
      } else {
        drawer.setAttribute('hidden', '');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Mega-menu: support hover (CSS) and keyboard/click toggle.
  document.querySelectorAll('.has-mega > .nav-link').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const parent = btn.parentElement;
      const isOpen = parent.classList.toggle('open');
      btn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      // close siblings
      parent.parentElement.querySelectorAll('.has-mega.open').forEach((other) => {
        if (other !== parent) {
          other.classList.remove('open');
          const ob = other.querySelector('.nav-link');
          if (ob) ob.setAttribute('aria-expanded', 'false');
        }
      });
      e.stopPropagation();
    });
  });

  // Click outside closes any open mega.
  document.addEventListener('click', () => {
    document.querySelectorAll('.has-mega.open').forEach((el) => {
      el.classList.remove('open');
      const ob = el.querySelector('.nav-link');
      if (ob) ob.setAttribute('aria-expanded', 'false');
    });
  });

  // Escape closes drawer + megas.
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (drawer && !drawer.hasAttribute('hidden')) {
      drawer.setAttribute('hidden', '');
      hamburger.setAttribute('aria-expanded', 'false');
    }
    document.querySelectorAll('.has-mega.open').forEach((el) => el.classList.remove('open'));
  });
})();
