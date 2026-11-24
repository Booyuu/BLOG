import Link from 'next/link';
import { publishedPosts } from '../../lib/content';
import { categories, displayCategory, legacyArticleDate } from '../../lib/site';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'INNER CHRONICLES', alternates: { canonical: '/blog' } };

const hero = 'https://images.unsplash.com/photo-1686349472661-ff361a66834b?q=80&w=3270&auto=format&fit=crop';
const lifeCover = 'https://images.unsplash.com/photo-1509688541036-bcf70b62e85f?q=80&w=1440&auto=format&fit=crop';
const labels = { 随笔: 'LIFE', 交易: 'TRADING', 创业: 'STARTUP', 旅行: 'TRAVEL LOGS', 投稿: 'SUBMISSIONS' };
const archive = [
  {
    href: '/travel/Iceland.html', title: 'SILENCE IN ICELAND', publishedAt: '2025-11-01',
    date: '2025.11', category: '旅行', label: 'TRAVEL',
    cover: 'https://images.unsplash.com/photo-1569187633351-5681193d46ae?q=80&w=1440&auto=format&fit=crop',
    description: '冰岛的荒原有一种寂静的压迫感。穿越黑色沙滩与极光爆发的夜晚，寻找那架著名的 DC-3 飞机残骸。',
  },
  {
    href: '/blog/photos.html', title: 'FRAGMENTS OF OTHERS', publishedAt: '2024-12-01',
    date: '2024.12', category: '投稿', label: 'SUBMISSIONS',
    cover: 'https://images.unsplash.com/photo-1517309230475-6736d926b979?q=80&w=1440&auto=format&fit=crop',
    description: '这里的文字来自其他创作者,在这里构成新的整体。他们将自己的碎片托付给我，展示给你。',
  },
];

export default async function BlogPage({ searchParams }) {
  const posts = await publishedPosts();
  const { category } = await searchParams;
  const filters = ['', '旅行', '随笔', '交易', '创业', '投稿'];
  const selected = filters.includes(category) ? category : '';
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
    <header className="legacy-hero">
      <img src={hero} alt="" fetchPriority="high" />
      <div className="legacy-hero-title">
        <span>BLOG</span>
        <h1>INNER<br />CHRONICLES</h1>
      </div>
    </header>
    <main className="legacy-archive">
      <aside className="legacy-archive-side">
        <nav aria-label="按分类查看文章" className="legacy-filters">
          <h2>FILTER FREQUENCY</h2>
          {filters.map((name) => <Link key={name} className="legacy-filter" href={name ? '/blog?category=' + encodeURIComponent(name) : '/blog'} aria-current={name === selected ? 'page' : undefined} scroll={false}>
            [ {labels[name] ?? 'ALL LOGS'} ]
          </Link>)}
          <div className="legacy-total">
            <h2>TOTAL ENTRIES</h2>
            <span>{String(visible.length).padStart(2, '0')}</span>
          </div>
        </nav>
      </aside>
      <section aria-label="文章列表" className="legacy-entries" key={selected}>
        {visible.map((entry) => <article className="legacy-entry" key={entry.href}>
          <a href={entry.href}>
            {entry.cover && <div className="legacy-entry-image">
              <span data-life={entry.category === '随笔' ? 'true' : undefined}>{entry.label ?? labels[entry.category]}</span>
              <img src={entry.cover} alt="" loading="lazy" />
            </div>}
            <div className="legacy-entry-heading">
              <h2>{entry.title}</h2>
              <time dateTime={entry.publishedAt}>{entry.date}</time>
            </div>
            {entry.description && <p>{entry.description}</p>}
          </a>
        </article>)}
        {!visible.length && <p className="legacy-empty">这个分类还没有文章。</p>}
      </section>
    </main>
  </>;
}
