import Link from 'next/link';
import BlogAnalytics from './analytics';

export default function BlogLayout({ children }) {
  return <>
    <BlogAnalytics />
    <header className="site-header">
      <nav className="shell navigation" aria-label="主导航">
        <a className="wordmark" href="/">Boyu<span>.</span></a>
        <div className="links">
          <Link href="/blog" aria-current="page">文章</Link>
          <a href="/blog/photos.html">相册</a>
          <a href="/travel/travel.html">旅行</a>
        </div>
      </nav>
    </header>
    {children}
    <footer className="shell site-footer"><a href="/">Boyu 的主页</a><Link href="/blog">文章归档</Link></footer>
  </>;
}
