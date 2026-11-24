if (['booyuu.top', 'www.booyuu.top'].includes(location.hostname) && !/^\/admin(?:\/|$)/.test(location.pathname)) {
  window.va = window.va || function () {
    (window.vaq = window.vaq || []).push(arguments);
  };
  const script = document.createElement('script');
  script.defer = true;
  script.src = '/_vercel/insights/script.js';
  document.head.appendChild(script);
}
