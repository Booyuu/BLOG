import { publishedPosts } from '../lib/content';
import { siteUrl } from '../lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const paths = ['/', '/blog', '/explore/photos', '/explore/travel', '/explore/iceland', '/explore/media'];
  return [
    ...paths.map((path) => ({ url: siteUrl + path })),
    ...(await publishedPosts()).map((post) => ({
      url: siteUrl + '/blog/' + post.slug,
      lastModified: post.updatedAt,
    })),
  ];
}
