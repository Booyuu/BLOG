import Link from 'next/link';
import BlogHero from './blog-hero';
import { publishedPosts } from '../../lib/content';
import { displayCategory, legacyArticleDate } from '../../lib/site';

export const dynamic = 'force-dynamic';
import { siteLanguage } from '../../lib/preferences';
import { readSiteContent } from '../../lib/site-content';

export async function generateMetadata() {
  const [language, settings] = await Promise.all([siteLanguage(), readSiteContent()]);
  return {
    title: settings.blogTitle[language],
    description: settings.blogDescription[language] || undefined,
    alternates: { canonical: '/blog' },
  };
}

const lifeCover = 'https://images.unsplash.com/photo-1509688541036-bcf70b62e85f?q=80&w=1440&auto=format&fit=crop';
const labels = { 生活: 'LIFE', 交易: 'TRADING', 创业: 'STARTUP', 旅行: 'TRAVEL LOGS', 投稿: 'SUBMISSIONS' };
const archive = [
  {
    href: '/explore/iceland', title: 'SILENCE IN ICELAND', titleZh: '冰岛之寂', publishedAt: '2025-11-01',
    date: '2025.11', category: '旅行', label: 'TRAVEL',
    cover: 'https://images.unsplash.com/photo-1569187633351-5681193d46ae?q=80&w=1440&auto=format&fit=crop',
    description: '冰岛的荒原有一种寂静的压迫感。穿越黑色沙滩与极光爆发的夜晚，寻找那架著名的 DC-3 飞机残骸。',
  },
  {
    href: '/explore/photos', title: 'FRAGMENTS OF OTHERS', titleZh: '他人的碎片', publishedAt: '2024-12-01',
    date: '2024.12', category: '投稿', label: 'SUBMISSIONS',
    cover: 'https://images.unsplash.com/photo-1517309230475-6736d926b979?q=80&w=1440&auto=format&fit=crop',
    description: '这里的文字来自其他创作者,在这里构成新的整体。他们将自己的碎片托付给我，展示给你。',
  },
];

export default async function BlogPage({ searchParams }) {
  const [posts, { category }, language, settings] = await Promise.all([publishedPosts(), searchParams, siteLanguage(), readSiteContent()]);
  const zh = language === 'zh';
  const filters = ['', '旅行', '生活', '交易', '创业', '投稿'];
  const filter = category === '随笔' ? '生活' : category;
  const selected = filters.includes(filter) ? filter : '';
  const title = settings.blogTitle[language];
  const entries = [
    ...archive,
    ...posts.map((post) => ({
      ...post,
      category: displayCategory(post.category),
      cover: post.cover || (post.slug === 'post-01' ? lifeCover : ''),
      date: legacyArticleDate(post.publishedAt),
      href: '/blog/' + post.slug,
    })),
  ].sort((first, second) => new Date(second.publishedAt) - new Date(first.publishedAt));
  const visible = selected ? entries.filter((entry) => entry.category === selected) : entries;

  return <>
    <BlogHero label={zh ? '博客' : 'BLOG'}
      title={title === 'INNER CHRONICLES' ? <>INNER<br />CHRONICLES</> : title}
      description={settings.blogDescription[language]} />
    <main className="legacy-archive">
      <aside className="legacy-archive-side">
        <nav aria-label="按分类查看文章" className="legacy-filters">
          <h2>{zh ? '按分类查看' : 'FILTER FREQUENCY'}</h2>
          {filters.map((name) => <Link key={name} className="legacy-filter" href={name ? '/blog?category=' + encodeURIComponent(name) : '/blog'} aria-current={name === selected ? 'page' : undefined} scroll={false}>
            [ {zh ? name || '全部' : labels[name] ?? 'ALL LOGS'} ]
          </Link>)}
          <div className="legacy-total">
            <h2>{zh ? '条目' : 'TOTAL ENTRIES'}</h2>
            <span>{String(visible.length).padStart(2, '0')}</span>
          </div>
        </nav>
      </aside>
      <section aria-label="文章列表" className="legacy-entries" key={selected}>
        {visible.map((entry) => <article className="legacy-entry" key={entry.href}>
          <Link href={entry.href}>
            {entry.cover && <div className="legacy-entry-image">
              <span data-life={entry.category === '生活' ? 'true' : undefined}>{zh ? entry.category : entry.label ?? labels[entry.category]}</span>
              <img src={entry.cover} alt="" loading="lazy" />
            </div>}
            <div className="legacy-entry-heading">
              <h2>{zh && entry.titleZh ? entry.titleZh : entry.title}</h2>
              <time dateTime={entry.publishedAt}>{entry.date}</time>
            </div>
            {entry.description && <p>{entry.description}</p>}
          </Link>
        </article>)}
        {!visible.length && <p className="legacy-empty">{zh ? '这个分类还没有文章。' : 'No posts in this category yet.'}</p>}
      </section>
    </main>
  </>;
}
