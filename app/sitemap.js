import { publishedPosts } from '../lib/content';
import { siteUrl } from '../lib/site';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const paths = ['/', '/blog', '/blog/photos.html', '/travel/travel.html', '/travel/Iceland.html', '/media/media.html', '/project-ethicraft.html'];
  return [
    ...paths.map((path) => ({ url: siteUrl + path })),
    ...(await publishedPosts()).map((post) => ({
      url: siteUrl + '/blog/' + post.slug,
      lastModified: post.updatedAt,
    })),
  ];
}
