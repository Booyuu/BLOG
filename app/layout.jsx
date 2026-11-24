import './style.css';
import { siteUrl } from '../lib/site';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'Boyu 的博客', template: '%s · Boyu' },
  description: 'Boyu 关于生活、交易、创业和技术的个人写作。',
  icons: { icon: '/favicon.png' },
};

export default function Layout({ children }) {
  return (
    <html lang="zh-CN">
      <body>{children}</body>
    </html>
  );
}
