// ============================================================
// Companion site — minimal interactions
// (1) Sidebar TOC active-section highlight via IntersectionObserver
// (2) Back-to-top FAB show/hide on scroll
// ============================================================

(function () {
  'use strict';

  // ----- Sidebar TOC active-section -----
  const tocLinks = document.querySelectorAll('.toc-side a[href^="#"]');
  const sectionMap = new Map();
  tocLinks.forEach(a => {
    const id = a.getAttribute('href').slice(1);
    const el = document.getElementById(id);
    if (el) sectionMap.set(id, a);
  });

  if (sectionMap.size > 0 && 'IntersectionObserver' in window) {
    let active = null;
    const setActive = id => {
      if (active === id) return;
      tocLinks.forEach(a => a.classList.remove('active'));
      const link = sectionMap.get(id);
      if (link) link.classList.add('active');
      active = id;
    };

    // pick the section whose top is closest to (just past) the top of viewport
    const onScroll = () => {
      const ids = [...sectionMap.keys()];
      let current = ids[0];
      const offset = 32;        // small buffer (no sticky nav)
      for (const id of ids) {
        const el = document.getElementById(id);
        if (!el) continue;
        const top = el.getBoundingClientRect().top - offset;
        if (top <= 0) current = id;
        else break;
      }
      setActive(current);
    };

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  // ----- Back-to-top FAB -----
  const fab = document.querySelector('.back-top');
  if (fab) {
    const toggle = () => {
      if (window.scrollY > window.innerHeight * 0.6) fab.classList.add('visible');
      else fab.classList.remove('visible');
    };
    toggle();
    window.addEventListener('scroll', toggle, { passive: true });
    fab.addEventListener('click', e => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ----- Copy BibTeX button -----
  document.querySelectorAll('.copy-btn[data-target]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-target');
      const target = document.getElementById(id);
      if (!target) return;
      const text = target.innerText.trim();
      const done = () => {
        const lbl = btn.querySelector('span');
        const orig = lbl ? lbl.textContent : '';
        if (lbl) lbl.textContent = 'Copied';
        btn.classList.add('copied');
        setTimeout(() => {
          if (lbl) lbl.textContent = orig;
          btn.classList.remove('copied');
        }, 1600);
      };
      if (navigator.clipboard) {
        navigator.clipboard.writeText(text).then(done).catch(() => {});
      } else {
        // legacy fallback
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  });

  // ----- Heading anchor copy-link (hover ::before, click copies URL) -----
  document.querySelectorAll('main h2[id], main section[id] > h2').forEach(h => {
    const sec = h.closest('section');
    if (!sec || !sec.id) return;
    h.style.cursor = 'pointer';
    h.title = 'Click to copy link to this section';
    h.addEventListener('click', () => {
      const url = location.href.split('#')[0] + '#' + sec.id;
      try {
        navigator.clipboard.writeText(url);
      } catch (e) { /* silent */ }
      // also update visible URL hash for users who don't see toast
      history.replaceState(null, '', '#' + sec.id);
    });
  });
})();
