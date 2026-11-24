import BlogNavigation from './navigation';
import BlogAnalytics from './analytics';
import { siteLanguage } from '../../lib/preferences';
import './legacy-blog.css';

export default async function BlogLayout({ children }) {
  const zh = (await siteLanguage()) === 'zh';
  return <div className="legacy-blog mindscape-type">
    <BlogAnalytics />
    <BlogNavigation zh={zh} />
    {children}
  </div>;
}
