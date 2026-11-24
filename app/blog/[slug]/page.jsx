import Link from 'next/link';
import { siteLanguage } from '../../../lib/preferences';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import MindscapeBackdrop from '../../components/mindscape-backdrop';
import { publishedPosts } from '../../../lib/content';
import { renderMarkdown } from '../../../lib/markdown';
import { displayCategory, legacyArticleDate, slugPattern } from '../../../lib/site';

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
  const [{ slug }, language] = await Promise.all([params, siteLanguage()]);
  const post = await findPost(slug);
  if (!post) notFound();
  const zh = language === 'zh';
  const category = displayCategory(post.category);
  const categoryLabel = { 生活: 'LIFE', 交易: 'TRADING', 创业: 'STARTUP', 旅行: 'TRAVEL' };
  return <main className="legacy-reading">
    <MindscapeBackdrop variant="article" />
    <article>
      <h1>{post.title}</h1>
      <div className="legacy-post-meta">
        <span>{zh ? '日期' : 'DATE'} <time dateTime={post.publishedAt}>{legacyArticleDate(post.publishedAt)}</time></span>
        <span aria-hidden="true">/</span>
        <span>{zh ? '分类' : 'CATEGORY'} {zh ? category : categoryLabel[category]}</span>
      </div>
      {post.cover && <img className="article-cover" src={post.cover} alt="" />}
      <div className="prose legacy-prose" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
      <Link className="legacy-reading-back" href="/blog">{zh ? '返回博客' : 'Back to blog'}</Link>
    </article>
  </main>;
}
