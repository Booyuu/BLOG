import Link from 'next/link';

export default function ArticleBody({ children, details, zh, category, date, footer, share }) {
  const fields = [
    [zh ? '地点' : 'LOCATION', details.location],
    [zh ? '日期' : 'DATE', details.showDate && (details.date || date)],
    [zh ? '设备' : 'GEAR', details.gear || details.lens, details.gear ? details.lens : ''],
    [zh ? '心情' : 'MOOD', details.mood],
    [zh ? '分类' : 'CATEGORY', details.showCategory && category],
  ].filter(([, value]) => value);
  const hasSidebar = details.enabled && fields.length > 0;

  return <div className="legacy-reading-layout" data-no-sidebar={hasSidebar ? undefined : 'true'}>
    <div className="prose legacy-prose">{children}</div>
    {hasSidebar && <aside className="legacy-reading-side" aria-label={zh ? '文章信息' : 'Article details'}>
      <details className="legacy-reading-panel" open>
        <summary>
          <span className="legacy-reading-hide">{zh ? '收起文章信息' : 'Hide article details'}</span>
          <span className="legacy-reading-show">{zh ? '展开文章信息' : 'Show article details'}</span>
          <span className="legacy-reading-arrow" aria-hidden="true">›</span>
        </summary>
        <div className="legacy-reading-details">
          <dl className="legacy-reading-meta">
            {fields.map(([label, value, sublabel]) => <div key={label}>
              <dt>{label}</dt>
              <dd>{value}{sublabel && <span className="legacy-meta-secondary">{sublabel}</span>}</dd>
            </div>)}
          </dl>
          {share}
        </div>
      </details>
    </aside>}
    <footer className="legacy-reading-footer">
      {footer}
      <Link className="legacy-reading-back" href="/blog">{zh ? '返回博客' : 'Back to blog'}</Link>
    </footer>
  </div>;
}
