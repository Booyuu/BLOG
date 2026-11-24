import Script from 'next/script';
import BlogAnalytics from './analytics';
import './legacy-blog.css';

export default function BlogLayout({ children }) {
  return <div className="legacy-blog mindscape-type">
    <BlogAnalytics />
    <nav className="legacy-nav" aria-label="博客导航">
      <a href="/"><span aria-hidden="true">←</span> RETURN TO BASE</a>
      <span className="legacy-nav-divider" aria-hidden="true" />
      <div id="audio-slot" />
    </nav>
    {children}
    <Script src="/js/audio.js" strategy="afterInteractive" />
  </div>;
}
