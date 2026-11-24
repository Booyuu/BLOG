import Link from 'next/link';
import BlogAnalytics from './analytics';
import { siteLanguage } from '../../lib/preferences';
import './legacy-blog.css';

export default async function BlogLayout({ children }) {
  const zh = (await siteLanguage()) === 'zh';
  return <div className="legacy-blog mindscape-type">
    <BlogAnalytics />
    <nav className="legacy-nav" aria-label={zh ? '博客导航' : 'Blog navigation'}>
      <Link href="/"><span aria-hidden="true">←</span> {zh ? '返回主页' : 'RETURN TO BASE'}</Link>
    </nav>
    {children}
  </div>;
}
