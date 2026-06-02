// ============================================================
//  BRIDGE — Industry 5.0 article page
//  Interactivity: mobile drawer, scroll progress, reveal-on-scroll,
//  sticky TOC + scroll-spy, animated count-up stats, interactive
//  revolution timeline, animated hero scene, back-to-top.
// ============================================================
(function () {
  'use strict';

  /* -------------------------------------------------- Mobile drawer */
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
    drawer.querySelectorAll('a').forEach((a) => a.addEventListener('click', closeDrawer));
  }
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeDrawer(); });

  let lastWidth = window.innerWidth;
  window.addEventListener('resize', () => {
    const w = window.innerWidth;
    if (w !== lastWidth && w > 768) closeDrawer();
    lastWidth = w;
  });

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* -------------------------------------------------- Fast, fixed-duration smooth scroll
     Native `behavior:'smooth'` scales its duration with distance, so jumping
     across this long article feels sluggish. This caps every jump at ~420ms. */
  let scrollRAF = null;
  function smoothScrollTo(targetY) {
    if (scrollRAF) cancelAnimationFrame(scrollRAF);
    const maxY = document.documentElement.scrollHeight - window.innerHeight;
    const endY = Math.max(0, Math.min(targetY, maxY));
    if (reduceMotion) { window.scrollTo(0, endY); return; }
    const startY = window.scrollY;
    const dist = endY - startY;
    if (Math.abs(dist) < 2) { window.scrollTo(0, endY); return; }
    const duration = 420; // ms — same snappy feel regardless of distance
    let startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      window.scrollTo(0, startY + dist * eased);
      if (p < 1) scrollRAF = requestAnimationFrame(step);
      else scrollRAF = null;
    }
    scrollRAF = requestAnimationFrame(step);
  }
  // Cancel the animation if the user scrolls manually mid-flight.
  window.addEventListener('wheel', () => { if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; } }, { passive: true });
  window.addEventListener('touchstart', () => { if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; } }, { passive: true });

  /* -------------------------------------------------- Scroll progress bar */
  const progressBar = document.getElementById('readProgress');
  function updateProgress() {
    if (!progressBar) return;
    const doc = document.documentElement;
    const scrollTop = doc.scrollTop || document.body.scrollTop;
    const height = doc.scrollHeight - doc.clientHeight;
    const pct = height > 0 ? (scrollTop / height) * 100 : 0;
    progressBar.style.width = pct + '%';
  }

  /* -------------------------------------------------- Back-to-top */
  const toTop = document.getElementById('toTop');
  function updateToTop() {
    if (!toTop) return;
    if (window.scrollY > 600) toTop.classList.add('is-visible');
    else toTop.classList.remove('is-visible');
  }
  if (toTop) {
    toTop.addEventListener('click', () => smoothScrollTo(0));
  }

  /* -------------------------------------------------- Reveal on scroll */
  const revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduceMotion) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach((el) => io.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-in'));
  }

  /* -------------------------------------------------- Count-up stats */
  function animateCount(el) {
    const target = parseFloat(el.dataset.count);
    const decimals = (el.dataset.decimals ? parseInt(el.dataset.decimals, 10) : 0);
    const suffix = el.dataset.suffix || '';
    const prefix = el.dataset.prefix || '';
    const duration = 1400;
    if (reduceMotion) {
      el.textContent = prefix + target.toFixed(decimals) + suffix;
      return;
    }
    let startTime = null;
    function step(ts) {
      if (startTime === null) startTime = ts;
      const p = Math.min((ts - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const val = target * eased;
      el.textContent = prefix + val.toFixed(decimals) + suffix;
      if (p < 1) requestAnimationFrame(step);
      else el.textContent = prefix + target.toFixed(decimals) + suffix;
    }
    requestAnimationFrame(step);
  }
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window) {
    const co = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          animateCount(entry.target);
          co.unobserve(entry.target);
        }
      });
    }, { threshold: 0.6 });
    counters.forEach((el) => co.observe(el));
  } else {
    counters.forEach(animateCount);
  }

  /* -------------------------------------------------- Interactive timeline */
  const timeline = document.getElementById('revTimeline');
  if (timeline) {
    const items = timeline.querySelectorAll('.tl-item');
    const detail = document.getElementById('tlDetail');
    function selectItem(item) {
      items.forEach((i) => i.classList.remove('is-active'));
      item.classList.add('is-active');
      if (detail) {
        detail.querySelector('.tl-d-era').textContent   = item.dataset.era;
        detail.querySelector('.tl-d-years').textContent = item.dataset.years;
        detail.querySelector('.tl-d-title').textContent = item.dataset.title;
        detail.querySelector('.tl-d-body').textContent  = item.dataset.body;
        detail.classList.remove('flash');
        // force reflow to restart the flash animation
        void detail.offsetWidth;
        if (!reduceMotion) detail.classList.add('flash');
      }
    }
    items.forEach((item) => {
      item.addEventListener('click', () => selectItem(item));
      item.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectItem(item); }
      });
    });
    // select the last (Industry 5.0) by default
    if (items.length) selectItem(items[items.length - 1]);
  }

  /* -------------------------------------------------- Sticky TOC + scroll-spy */
  const toc = document.getElementById('toc');
  let tocLinks = [];
  let headings = [];
  if (toc) {
    const heads = document.querySelectorAll('.article-container > h2[id]');
    const ul = toc.querySelector('ul');
    heads.forEach((h) => {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = '#' + h.id;
      a.textContent = h.textContent;
      a.addEventListener('click', (e) => {
        e.preventDefault();
        const top = h.getBoundingClientRect().top + window.scrollY - 110;
        smoothScrollTo(top);
      });
      li.appendChild(a);
      ul.appendChild(li);
      tocLinks.push(a);
      headings.push(h);
    });
  }
  function updateSpy() {
    if (!headings.length) return;
    const pos = window.scrollY + 140;
    let activeIdx = 0;
    for (let i = 0; i < headings.length; i++) {
      if (headings[i].offsetTop <= pos) activeIdx = i;
    }
    tocLinks.forEach((a, i) => a.classList.toggle('is-active', i === activeIdx));
  }

  /* -------------------------------------------------- rAF-throttled scroll handler */
  let ticking = false;
  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateProgress();
        updateToTop();
        updateSpy();
        ticking = false;
      });
      ticking = true;
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll, { passive: true });
  updateProgress();
  updateToTop();
  updateSpy();
})();
