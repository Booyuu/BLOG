export const siteUrl = 'https://booyuu.top';
export const analyticsUrl = 'https://vercel.com/boyus-projects-7f2e6b3b/booyuu-github-io/analytics';
export const categories = ['随笔', '交易', '创业', '技术', '旅行'];
export const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
export const imagePattern = /^[a-f0-9-]{36}\.(?:png|jpg|webp|gif)$/;
export const mediaTypes = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

export function articleDate(value) {
  return new Intl.DateTimeFormat('zh-SG', {
    dateStyle: 'long',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}
