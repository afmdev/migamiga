/* migamiga nav.js — sticky nav toggle, mobile hamburger, lang persistence.
   Loaded by every visitor-facing HTML with `defer`. All handlers guarded. */

(function () {
  'use strict';

  // 1. Persist current page language into localStorage.
  try {
    var lang = document.documentElement.lang;
    if (lang && /^(de|en|es)$/i.test(lang)) {
      localStorage.setItem('mm_lang', lang.toLowerCase());
    }
  } catch (_) { /* localStorage may be blocked in some contexts */ }

  // 2. Sticky nav — toggle `.scrolled` when #navSentinel leaves the viewport top.
  var nav = document.querySelector('.nav');
  var sentinel = document.getElementById('navSentinel');
  if (nav && sentinel && 'IntersectionObserver' in window) {
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) nav.classList.remove('scrolled');
        else nav.classList.add('scrolled');
      });
    }, { rootMargin: '-1px 0px 0px 0px', threshold: 0 });
    obs.observe(sentinel);
  }

  // 3. Mobile hamburger.
  var burger = document.querySelector('.nav__hamburger');
  var mobile = document.querySelector('.nav__mobile');
  if (burger && mobile) {
    burger.addEventListener('click', function () {
      var open = mobile.hasAttribute('open');
      if (open) { mobile.removeAttribute('open'); burger.setAttribute('aria-expanded', 'false'); }
      else      { mobile.setAttribute('open', '');   burger.setAttribute('aria-expanded', 'true'); }
    });
  }

  // 4. Language dropdown — close on outside click.
  var dds = document.querySelectorAll('.lang-dd');
  if (dds.length) {
    document.addEventListener('click', function (e) {
      dds.forEach(function (dd) {
        if (dd.open && !dd.contains(e.target)) dd.open = false;
      });
    });
  }

  // 5. Theme toggle — click cycles data-theme + persists to localStorage.
  //    Initial data-theme is set inline in <head> to prevent FOUC.
  function currentTheme() {
    var t = document.documentElement.getAttribute('data-theme');
    if (t === 'light' || t === 'dark') return t;
    return (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) ? 'light' : 'dark';
  }
  var toggles = document.querySelectorAll('.theme-toggle');
  toggles.forEach(function (btn) {
    btn.setAttribute('aria-pressed', currentTheme() === 'light' ? 'true' : 'false');
    btn.addEventListener('click', function () {
      var next = currentTheme() === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem('mm_theme', next); } catch (_) {}
      toggles.forEach(function (b) { b.setAttribute('aria-pressed', next === 'light' ? 'true' : 'false'); });
    });
  });
})();
