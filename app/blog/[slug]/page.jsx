import Link from 'next/link';
import { siteLanguage } from '../../../lib/preferences';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import ArticleBody from '../article-body';
import { articleDetailsDefaults } from '../../../lib/article-details';
import BlogHero, { blogHeroImage } from '../blog-hero';
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
      images: [post.cover || blogHeroImage],
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
  const label = zh ? category : categoryLabel[category];
  return <main className="legacy-reading">
    <article>
      <BlogHero image={post.cover || undefined} label={label} title={post.title} />
      <ArticleBody details={post.details ?? articleDetailsDefaults} zh={zh}
        date={<time dateTime={post.publishedAt}>{legacyArticleDate(post.publishedAt)}</time>}
        category={<Link href={'/blog?category=' + encodeURIComponent(category)}>{label}</Link>}>
        <div className="legacy-markdown-body" dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown) }} />
      </ArticleBody>
    </article>
  </main>;
}
