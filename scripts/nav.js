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
})();
