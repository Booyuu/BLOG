import Link from 'next/link';
import BlogAnalytics from '../../blog/analytics';
import ArticleBody from '../../blog/article-body';
import ArticleShare from '../../blog/article-share';
import BlogHero from '../../blog/blog-hero';
import BlogNavigation from '../../blog/navigation';
import { siteLanguage } from '../../../lib/preferences';
import { readSiteContent } from '../../../lib/site-content';
import { siteUrl } from '../../../lib/site';
import '../../blog/legacy-blog.css';

const cover = 'https://images.unsplash.com/photo-1530883154101-ce08df5ec9be?q=80&w=2400&auto=format&fit=crop';
const destinations = [
  ['SINGAPORE', '新加坡', 'https://images.unsplash.com/photo-1525625293386-3f8f99389edd?q=80&w=800'],
  ['SHANGHAI', '上海', 'https://images.unsplash.com/photo-1508804185872-d7badad00f7d?q=80&w=800'],
];

export async function generateMetadata() {
  const zh = (await siteLanguage()) === 'zh';
  return {
    title: zh ? '冰岛之寂' : 'Silence in Iceland',
    alternates: { canonical: '/explore/iceland' },
  };
}

export default async function IcelandArticle() {
  const [language, { icelandDetails }] = await Promise.all([siteLanguage(), readSiteContent()]);
  const zh = language === 'zh';
  const footer = <section className="legacy-destinations">
    <h2>{zh ? '下一个目的地' : 'NEXT DESTINATION'}</h2>
    <div className="legacy-destinations-grid">
      {destinations.map(([en, cn, image]) => <figure key={en}>
        <img src={image} alt="" loading="lazy" />
        <figcaption>{zh ? cn : en}</figcaption>
      </figure>)}
    </div>
  </section>;

  return <div className="legacy-blog mindscape-type">
    <BlogAnalytics />
    <BlogNavigation zh={zh} />
    <main className="legacy-reading">
      <article>
        <BlogHero image={cover} label="Redhouse" title={zh ? '冰岛之寂' : <>SILENCE IN<br />ICELAND</>} />
        <ArticleBody zh={zh} details={icelandDetails} date="Sep 2025"
          category={<Link href="/blog?category=%E6%97%85%E8%A1%8C">{zh ? '旅行' : 'TRAVEL'}</Link>}
          footer={footer} share={<ArticleShare href={siteUrl + '/explore/iceland'} zh={zh} />}>
          <p>冰岛的荒原有一种寂静的压迫感。当你驾驶着越野车穿越高地，周围是黑色的火山灰和苔藓，你会感觉自己降落在了另一个星球。</p>
          <p>这次旅程的目的是寻找那架著名的 DC-3 飞机残骸，并在极光爆发的夜晚拍下一张完美的照片。</p>
          <figure className="legacy-travel-figure">
            <img src="https://images.unsplash.com/photo-1520769669658-f07657f5a307?q=80&w=1200" alt="黑沙滩上的飞机残骸" loading="lazy" />
            <figcaption>▲ 飞机残骸，摄于黑沙滩</figcaption>
          </figure>
          <h2>{zh ? '寂静' : 'THE SILENCE'}</h2>
          <p>在这里，时间仿佛是静止的。没有信号，没有噪音，只有风声。这让我想起了交易时的那种“心流”状态——当市场的所有噪音都被过滤，只剩下K线的律动。</p>
          <p>我们在维克小镇停留了一晚，等待极光指数（KP）达到 5 的时刻。</p>
          <div className="legacy-travel-gallery">
            <img src="https://images.unsplash.com/photo-1531366936337-7c912a4589a7?q=80&w=800" alt="冰岛极光" loading="lazy" />
            <img src="https://images.unsplash.com/photo-1484429791456-7762873ce0f9?q=80&w=1200" alt="冰岛风景" loading="lazy" />
          </div>
        </ArticleBody>
      </article>
    </main>
  </div>;
}
