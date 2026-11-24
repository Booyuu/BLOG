import Link from 'next/link';
import './admin.css';

export const metadata = { title: '博客管理', robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <div className="admin-stage">
    <main className="shell admin-shell">
      <header className="admin-header">
        <Link className="admin-brand" href="/admin">
          <span className="admin-mark" aria-hidden="true" />
          <span><strong>MINDSCAPE</strong><small>博客控制台</small></span>
        </Link>
        <a className="admin-public" href="/blog">查看博客</a>
      </header>
      {children}
    </main>
  </div>;
}
