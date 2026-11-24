import './style.css';
import './components/mindscape.css';
import { cookies } from 'next/headers';
import SitePlayer from './components/site-player';
import { siteUrl } from '../lib/site';

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: { default: 'MINDSCAPE · Boyu', template: '%s · Boyu' },
  description: 'Boyu’s personal site about life, trading, startups and travel.',
  icons: { icon: '/favicon.png' },
};

export default async function Layout({ children }) {
  const stored = (await cookies()).get('mindscape_lang')?.value;
  const language = stored === 'zh' ? 'zh' : 'en';
  return <html lang={language === 'zh' ? 'zh-CN' : 'en'}>
    <body>
      <SitePlayer language={language} rememberedLanguage={Boolean(stored)} />
      {children}
    </body>
  </html>;
}
