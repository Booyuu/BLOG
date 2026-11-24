(() => {
  const parameters = new URLSearchParams(location.search);
  if (parameters.get('embedded') !== '1' || parent === window) return;

  const chinese = parameters.get('lang') === 'zh';
  document.documentElement.lang = chinese ? 'zh-CN' : 'en';
  if (chinese) {
    const dictionary = {
      'RETURN TO BASE': '返回主页',
      'VISUAL ARCHIVES': '影像档案',
      'WORLD ARCHIVE': '旅行档案',
      'SILENCE IN ICELAND': '冰岛之寂',
      'THE SILENCE': '寂静',
      'SIGNAL RECEIVED': '订阅成功',
    };
    for (const element of document.querySelectorAll('h1, h2, nav a')) {
      const text = element.innerText?.trim().replace(/\s+/g, ' ');
      if (dictionary[text]) element.textContent = dictionary[text];
    }
  }

  const paths = {
    '/index.html': '/', '/': '/', '/blog': '/blog', '/blog/blog.html': '/blog',
    '/blog/photos.html': '/explore/photos', '/travel/travel.html': '/explore/travel',
    '/travel/Iceland.html': '/explore/iceland', '/media/media.html': '/explore/media',
    '/email_success.html': '/explore/subscribed',
  };
  document.addEventListener('click', (event) => {
    if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) return;
    const element = event.target.closest('a[href], [data-site-route]');
    if (!element || element.target === '_blank' || element.hasAttribute('download')) return;
    const link = new URL(element.dataset.siteRoute ?? element.href, location.href);
    if (link.origin !== location.origin) return;
    const path = paths[link.pathname] ?? (/^\/blog\/[a-z0-9-]+$/.test(link.pathname) ? link.pathname : null);
    if (!path) return;
    event.preventDefault();
    event.stopPropagation();
    parent.postMessage({ mindscapePath: path + link.hash }, location.origin);
  }, true);
})();
