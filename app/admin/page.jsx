import Link from 'next/link';
import { configuredPassword } from '../../lib/auth';
import { readContent, storageReady } from '../../lib/content';
import { analyticsUrl, articleDate } from '../../lib/site';
import { signedIn } from './session';
import { LoginForm, LogoutButton } from './forms';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!configuredPassword()) return <section className="panel login"><h1>博客管理</h1><p>请在部署环境中设置管理密码。</p></section>;
  if (!(await signedIn())) return <LoginForm />;
  const { posts } = await readContent();
  const ordered = [...posts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return <>
    <div className="admin-title"><h1>内容管理</h1><LogoutButton /></div>
    {!storageReady() && <p role="status">内容存储尚未连接。</p>}
    <section className="dashboard-grid" aria-label="博客概览">
      <div className="panel stat"><span>已发布</span><strong>{posts.filter((post) => post.status === 'published').length}</strong></div>
      <div className="panel stat"><span>草稿</span><strong>{posts.filter((post) => post.status === 'draft').length}</strong></div>
      <div className="panel stat"><span>网站访问</span><a href={analyticsUrl} target="_blank" rel="noreferrer">查看浏览量与流量来源</a></div>
    </section>
    <section className="panel dashboard-posts">
      <div className="section-heading"><h2>文章</h2><Link className="button primary" href="/admin/new">写文章</Link></div>
      {ordered.length ? <ul className="admin-post-list">{ordered.map((post) => <li key={post.slug}>
        <div><Link href={'/admin/' + post.slug}>{post.title}</Link><p>{post.category} · {articleDate(post.updatedAt)}</p></div>
        <span className="status">{post.status === 'published' ? '已发布' : '草稿'}</span>
      </li>)}</ul> : <p className="muted">还没有文章。</p>}
    </section>
  </>;
}
