export const metadata = { title: '博客管理', robots: { index: false, follow: false } };

export default function AdminLayout({ children }) {
  return <main className="shell admin-shell">
    <header className="admin-header">
      <a className="wordmark" href="/admin">Boyu<span>.</span> <small>博客管理</small></a>
      <a href="/blog">查看博客</a>
    </header>
    {children}
  </main>;
}
