export const siteUrl = 'https://booyuu.top';
export const analyticsUrl = 'https://vercel.com/boyus-projects-7f2e6b3b/booyuu-github-io/analytics';
export const categories = ['随笔', '交易', '创业', '旅行'];
export const slugPattern = /^[a-z0-9][a-z0-9-]{0,79}$/;
export const imagePattern = /^[a-f0-9-]{36}\.(?:png|jpg|webp|gif)$/;
export const mediaTypes = { png: 'image/png', jpg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif' };

export function articleDate(value) {
  return new Intl.DateTimeFormat('zh-SG', {
    dateStyle: 'long',
    timeZone: 'Asia/Singapore',
  }).format(new Date(value));
}

export function displayCategory(category) {
  return categories.includes(category) ? category : categories[0];
}

export function legacyArticleDate(value) {
  const parts = new Intl.DateTimeFormat('en-SG', {
    year: 'numeric', month: 'numeric', day: 'numeric', timeZone: 'Asia/Singapore',
  }).formatToParts(new Date(value));
  const date = Object.fromEntries(parts.map(({ type, value }) => [type, value]));
  return [date.year, Number(date.month), Number(date.day)].join('.');
}
