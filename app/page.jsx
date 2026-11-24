import Link from 'next/link';
import MindscapeBackdrop from './components/mindscape-backdrop';
import Newsletter from './components/newsletter';
import BlogAnalytics from './blog/analytics';
import { publishedPosts } from '../lib/content';
import { siteLanguage } from '../lib/preferences';
import { siteUrl, legacyArticleDate } from '../lib/site';
import { readSiteContent } from '../lib/site-content';
import './home.css';

export const metadata = { title: 'MINDSCAPE', alternates: { canonical: '/' } };
export const dynamic = 'force-dynamic';

const photos = [
  'https://images.unsplash.com/photo-1476610182048-b716b8518aae?q=80&w=600',
  'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?q=80&w=600',
  'https://images.unsplash.com/photo-1764083029040-a803c4924d5b?q=80&w=600',
];

export default async function HomePage() {
  const [language, { projects, contact }, posts] = await Promise.all([siteLanguage(), readSiteContent(), publishedPosts()]);
  const zh = language === 'zh';

  return <div className="mindscape-home mindscape-type">
    <MindscapeBackdrop />
    <BlogAnalytics />
    <header className="home-nav">
      <Link className="home-orb" href="/" aria-label={zh ? '首页' : 'Home'}><span /></Link>
      <nav aria-label={zh ? '主导航' : 'Main navigation'}>
        <Link href="/#about">{zh ? '关于' : 'About'}</Link>
        <Link href="/#projects">{zh ? '项目' : 'Projects'}</Link>
        <Link href="/blog">{zh ? '博客' : 'Blog'}</Link>
        <Link href="/#nexus">{zh ? '联系' : 'Contact'}</Link>
      </nav>
    </header>

    <main>
      <section className="home-hero">
        <h1>MINDSCAPE</h1>
        <p>{zh ? '我的视界' : 'EVENT HORIZON'}</p>
      </section>

      <section id="about" className="home-section home-about">
        <div className="home-about-copy">
          <p className="home-kicker">{zh ? '关于我' : 'ABOUT ME'}</p>
          <h2>{zh ? '我是 Boyu' : 'I’m Boyu.'}</h2>
          <p className="home-lead">{zh ? '我在新加坡学习、做交易，也在做自己的产品。' : 'I study, trade and build products in Singapore.'}</p>
          <p>{zh
            ? '我在 NovaStudio 做降低创作门槛的工具。这里记录我在交易、创业、旅行和生活里遇到的事，以及它们怎么改变了我的想法。'
            : 'At NovaStudio, I build tools that make it easier to create. Here I write about what I learn through trading, building products and travelling.'}</p>
          <Link href="/#nexus" className="home-outline">{zh ? '联系我' : 'Get in touch'}</Link>
        </div>
        <figure><img src="/assets/12.jpg" alt={zh ? 'Boyu 的照片' : 'Photograph of Boyu'} loading="lazy" /></figure>
      </section>

      <section id="projects" className="home-section">
        <h2>{zh ? '项目' : 'Projects'}</h2>
        <div className="home-projects">
          {projects.map((project, index) => {
            const content = <><span className="home-kicker">{project.label[language]}</span><h3>{project.title}</h3><p>{project.description[language]}</p></>;
            return project.href.startsWith('/') || project.href.startsWith(siteUrl + '/')
              ? <Link key={index} href={project.href} className="home-project">{content}</Link>
              : <a key={index} href={project.href} className="home-project" target="_blank" rel="noreferrer">{content}</a>;
          })}
        </div>
      </section>

      <section id="blog" className="home-section">
        <div className="home-section-heading"><h2>{zh ? '博客' : 'Blog'}</h2><Link href="/blog">{zh ? '查看全部' : 'All posts'}</Link></div>
        <div className="home-posts">
          {posts.slice(0, 3).map((post) => <Link key={post.slug} className="home-post" href={'/blog/' + post.slug}>
            <time dateTime={post.publishedAt}>{legacyArticleDate(post.publishedAt)}</time>
            <h3>{post.title}</h3>
            {post.description && <p>{post.description}</p>}
          </Link>)}
        </div>
      </section>

      <section id="photos" className="home-section">
        <div className="home-section-heading"><h2>{zh ? '影像日志' : 'Visual Logs'}</h2><Link href="/explore/photos">{zh ? '摄影集' : 'Gallery'}</Link></div>
        <Link className="home-gallery" href="/explore/photos" aria-label={zh ? '打开摄影集' : 'Open gallery'}>
          {photos.map((photo) => <img key={photo} src={photo} alt="" loading="lazy" />)}
        </Link>
      </section>
    </main>

    <footer id="nexus" className="home-footer">
      <div className="home-section home-footer-grid">
        <div>
          <h2>{zh ? '保持联系' : 'Stay in touch'}</h2>
          <a className="home-email" href={'mailto:' + contact.email}>{contact.email}</a>
          <Newsletter zh={zh} />
        </div>
        <div className="home-footer-links">
          <div><h3>{zh ? '网站与社群' : 'Sites & community'}</h3>
            <a href={contact.nova} target="_blank" rel="noreferrer">NovaStudio</a>
            <a href={contact.ethicraft} target="_blank" rel="noreferrer">{zh ? 'Ethicraft 社群门户' : 'Ethicraft Community'}</a>
            <Link href="/blog">{zh ? '博客' : 'Blog'}</Link>
          </div>
          <div><h3>{zh ? '更多' : 'More'}</h3>
            <a href="https://x.com/Booyuu888" target="_blank" rel="noreferrer">X</a>
            <a href="https://www.linkedin.com/in/boyu-ethicraft/" target="_blank" rel="noreferrer">LinkedIn</a>
            <a href="https://github.com/Booyuu" target="_blank" rel="noreferrer">GitHub</a>
            <Link href="/explore/media">{zh ? '媒体收藏' : 'Media'}</Link>
          </div>
        </div>
      </div>
      <div className="home-footnote">{zh ? '新加坡' : 'SINGAPORE'} <span>MINDSCAPE</span></div>
    </footer>
  </div>;
}
