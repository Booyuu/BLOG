import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { publishedPosts } from '../../../lib/content';
import { renderMarkdown } from '../../../lib/markdown';
import { articleDate, slugPattern } from '../../../lib/site';

export const dynamic = 'force-dynamic';
const findPost = cache(async (slug) => slugPattern.test(slug)
  ? (await publishedPosts()).find((post) => post.slug === slug)
  : null);

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.description || undefined,
    alternates: { canonical: '/blog/' + slug },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.description || undefined,
      publishedTime: post.publishedAt,
      images: post.cover ? [post.cover] : undefined,
    },
  };
}

export default async function PostPage({ params }) {
  const { slug } = await params;
  const post = await findPost(slug);
  if (!post) notFound();
  return <main className="shell article-shell">
    <Link className="back" href="/blog">返回文章列表</Link>
    <article>
      <header className="article-header">
        <div className="post-meta"><span>{post.category}</span><time dateTime={post.publishedAt}>{articleDate(post.publishedAt)}</time></div>
        <h1>{post.title}</h1>
        {post.description && <p>{post.description}</p>}
      </header>
      {post.cover && <img className="article-cover" src={post.cover} alt="" />}
      <div className="prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
    </article>
  </main>;
}
