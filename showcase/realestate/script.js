/* Vanilla JS: nav, scroll-reveal, tabs, filters, demo form. No dependencies. */
(function () {
  'use strict';
  var d = document, root = d.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Sticky nav + mobile menu */
  var nav = d.querySelector('.nav'), toggle = d.querySelector('.nav-toggle'), links = d.querySelector('.nav-links');
  function onScroll() { if (nav) nav.classList.toggle('scrolled', window.scrollY > 24); }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
  function setMenu(open) {
    if (!nav || !toggle) return;
    nav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
  }
  if (toggle && links) {
    toggle.addEventListener('click', function () { setMenu(!nav.classList.contains('open')); });
    links.addEventListener('click', function (e) { if (e.target.closest('a')) setMenu(false); });
    d.addEventListener('keydown', function (e) { if (e.key === 'Escape' && nav.classList.contains('open')) { setMenu(false); toggle.focus(); } });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (m) { if (m.matches) setMenu(false); });
  }

  /* Scroll reveal (content is visible by default; hidden only after this adds .reveal-ready) */
  var items = d.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce && items.length) {
    root.classList.add('reveal-ready');
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); } });
    }, { threshold: 0.12, rootMargin: '0px 0px -6% 0px' });
    items.forEach(function (el) { io.observe(el); });
    /* Safety net: never leave content hidden */
    setTimeout(function () { items.forEach(function (el) { if (el.getBoundingClientRect().top < window.innerHeight * 1.5) el.classList.add('in'); }); }, 2500);
  }

  /* Active nav link */
  if ('IntersectionObserver' in window && links) {
    var map = {};
    links.querySelectorAll('a[href^="#"]').forEach(function (a) { map[a.getAttribute('href').slice(1)] = a; });
    var so = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        var a = map[en.target.id];
        if (a && en.isIntersecting) { Object.keys(map).forEach(function (k) { map[k].classList.remove('active'); }); a.classList.add('active'); }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { var s = d.getElementById(id); if (s) so.observe(s); });
  }

  /* Tabs */
  d.querySelectorAll('[data-tabs]').forEach(function (group) {
    var tabs = Array.prototype.slice.call(group.querySelectorAll('[role="tab"]'));
    function select(tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var p = d.getElementById(t.getAttribute('aria-controls'));
        if (p) p.hidden = !on;
      });
      if (focus) tab.focus();
    }
    tabs.forEach(function (t, i) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(i + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(i - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
  });

  /* Filter chips */
  d.querySelectorAll('[data-filter-group]').forEach(function (group) {
    var grid = d.querySelector(group.getAttribute('data-filter-group'));
    var count = d.querySelector('[data-count]');
    if (!grid) return;
    var cards = grid.querySelectorAll('[data-cat]');
    group.addEventListener('click', function (e) {
      var chip = e.target.closest('[data-filter]');
      if (!chip) return;
      group.querySelectorAll('[data-filter]').forEach(function (c) { c.setAttribute('aria-pressed', String(c === chip)); });
      var f = chip.getAttribute('data-filter'), n = 0;
      cards.forEach(function (card) {
        var show = f === 'all' || card.getAttribute('data-cat').split(' ').indexOf(f) > -1;
        card.hidden = !show;
        if (show) { n++; card.classList.add('in'); }
      });
      if (count) count.textContent = 'Showing ' + n + ' sample listing' + (n === 1 ? '' : 's');
    });
  });

  /* "Enquire" buttons prefill the interest field */
  d.querySelectorAll('[data-enquire]').forEach(function (b) {
    b.addEventListener('click', function () {
      var f = d.getElementById('interest');
      if (f) f.value = b.getAttribute('data-enquire');
    });
  });

  /* Demo forms: nothing is sent or stored */
  d.querySelectorAll('form[data-demo]').forEach(function (form) {
    var done = d.getElementById(form.getAttribute('data-demo'));
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!form.checkValidity()) { form.reportValidity(); return; }
      form.reset();
      if (done) { done.hidden = false; done.setAttribute('tabindex', '-1'); done.focus({ preventScroll: true }); done.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }); }
    });
  });
})();
