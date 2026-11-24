import Link from 'next/link';
import { publishedPosts } from '../../lib/content';
import { articleDate, categories } from '../../lib/site';

export const dynamic = 'force-dynamic';
export const metadata = { title: '文章', alternates: { canonical: '/blog' } };

export default async function BlogPage({ searchParams }) {
  const posts = await publishedPosts();
  const { category } = await searchParams;
  const selected = categories.includes(category) ? category : '';
  const visible = selected ? posts.filter((post) => post.category === selected) : posts;

  return <main className="shell">
    <section className="blog-intro">
      <h1>Boyu 的博客<span>.</span></h1>
      <p>写交易、创业和技术，也记录生活里值得记下来的事。</p>
    </section>
    <nav className="filters" aria-label="按分类查看文章">
      <Link href="/blog" aria-current={!selected ? 'page' : undefined}>全部</Link>
      {categories.map((name) => <Link key={name} href={'/blog?category=' + encodeURIComponent(name)} aria-current={name === selected ? 'page' : undefined}>{name}</Link>)}
    </nav>
    <section className="post-list" aria-label="文章列表">
      {visible.map((post) => <article className="post-row" key={post.slug}>
        <div>
          <div className="post-meta"><span>{post.category}</span><time dateTime={post.publishedAt}>{articleDate(post.publishedAt)}</time></div>
          <h2><Link href={'/blog/' + post.slug}>{post.title}</Link></h2>
          {post.description && <p>{post.description}</p>}
        </div>
        {post.cover && <Link href={'/blog/' + post.slug} aria-label={post.title}><img className="post-thumb" src={post.cover} alt="" loading="lazy" /></Link>}
      </article>)}
      {!visible.length && <p className="muted">这个分类还没有文章。</p>}
    </section>
  </main>;
}
