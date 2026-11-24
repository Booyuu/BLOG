(() => {
  const switcher = document.querySelector('.lang-switch-container');
  let language = document.documentElement.lang === 'zh-CN' ? 'zh' : 'en';

  function render(value) {
    language = value;
    document.documentElement.lang = value === 'zh' ? 'zh-CN' : 'en';
    if (typeof updateContent === 'function') updateContent(value);
    switcher?.setAttribute('aria-pressed', String(value === 'zh'));
    for (const element of document.querySelectorAll('[data-home-en]')) {
      element.textContent = value === 'zh' ? element.dataset.homeZh : element.dataset.homeEn;
    }
  }

  function announce(language) {
    parent.postMessage({ mindscapeLanguage: language }, location.origin);
  }

  window.changeHomeLanguage = function () {
    const next = language === 'en' ? 'zh' : 'en';
    try { localStorage.setItem('site-lang', next); } catch {}
    render(next);
    announce(next);
  };

  document.addEventListener('DOMContentLoaded', () => {
    let saved = language;
    try { saved = localStorage.getItem('site-lang') === 'zh' ? 'zh' : language; } catch {}
    render(saved);
  }, { once: true });

  window.addEventListener('hashchange', () => {
    parent.postMessage({ mindscapeHomeHash: location.hash }, location.origin);
  });

  window.addEventListener('message', (event) => {
    if (event.origin !== location.origin || event.source !== parent) return;
    const { mindscapeLocale, mindscapeHomeHash } = event.data ?? {};
    if (mindscapeLocale === 'en' || mindscapeLocale === 'zh') render(mindscapeLocale);
    if (typeof mindscapeHomeHash === 'string' && /^#[a-z-]+$/.test(mindscapeHomeHash)) {
      const section = document.getElementById(mindscapeHomeHash.slice(1));
      if (section) {
        section.scrollIntoView();
        history.replaceState(null, '', location.pathname + location.search + mindscapeHomeHash);
      }
    }
  });
})();
