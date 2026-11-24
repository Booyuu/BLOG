import { notFound, redirect } from 'next/navigation';
import { readContent } from '../../../lib/content';
import { categories, slugPattern } from '../../../lib/site';
import { Editor } from '../forms';
import { signedIn } from '../session';

export const dynamic = 'force-dynamic';

export default async function EditPage({ params }) {
  if (!(await signedIn())) redirect('/admin');
  const { slug } = await params;
  if (!slugPattern.test(slug)) notFound();
  const { posts } = await readContent();
  const post = slug === 'new' ? null : posts.find((item) => item.slug === slug);
  if (!post && slug !== 'new') notFound();
  const date = new Intl.DateTimeFormat('sv-SE', { timeZone: 'Asia/Singapore' })
    .format(new Date()).replaceAll('-', '');
  const suggestedSlug = 'post-' + date + '-' + crypto.randomUUID().slice(0, 6);
  return <Editor post={post} categories={categories} suggestedSlug={suggestedSlug} />;
}
