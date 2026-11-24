import Link from 'next/link';
import { authConfigured } from '../../lib/auth';
import { readContent, storageReady } from '../../lib/content';
import { analyticsUrl, articleDate, displayCategory } from '../../lib/site';
import { signedIn } from './session';
import { LoginForm, LogoutButton } from './forms';

export const dynamic = 'force-dynamic';

export default async function Admin() {
  if (!authConfigured()) return <section className="panel login"><h1>博客管理</h1><p>后台登录尚未配置。</p></section>;
  if (!(await signedIn())) return <LoginForm />;
  const { posts } = await readContent();
  const ordered = [...posts].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  return <>
    <div className="admin-title">
      <h1>内容管理</h1>
      <div className="account-actions"><Link className="button" href="/admin/account/settings">账号设置</Link><LogoutButton /></div>
    </div>
    {!storageReady() && <p role="status">内容存储尚未连接。</p>}
    <section className="dashboard-grid" aria-label="博客概览">
      <div className="panel stat" data-accent="cyan"><span>已发布</span><strong>{posts.filter((post) => post.status === 'published').length}</strong></div>
      <div className="panel stat"><span>草稿</span><strong>{posts.filter((post) => post.status === 'draft').length}</strong></div>
      <div className="panel stat" data-accent="cyan"><span>网站访问</span><a href={analyticsUrl} target="_blank" rel="noreferrer">查看浏览量与流量来源</a></div>
    </section>
    <section className="panel dashboard-posts">
      <div className="section-heading"><h2>文章</h2><Link className="button primary" href="/admin/new">写文章</Link></div>
      {ordered.length ? <ul className="admin-post-list">{ordered.map((post) => <li key={post.slug}>
        <div><Link href={'/admin/' + post.slug}>{post.title}</Link><p>{displayCategory(post.category)} · {articleDate(post.updatedAt)}</p></div>
        <span className="status">{post.status === 'published' ? '已发布' : '草稿'}</span>
      </li>)}</ul> : <p className="muted">还没有文章。</p>}
    </section>
  </>;
}
