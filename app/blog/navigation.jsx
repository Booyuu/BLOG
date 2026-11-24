'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function BlogNavigation({ zh }) {
  const path = usePathname();
  const article = path?.startsWith('/blog/') || path === '/explore/iceland';
  const label = article ? (zh ? '返回博客' : 'Back to blog') : (zh ? '返回主页' : 'Return to base');

  return <nav className="legacy-nav" aria-label={zh ? '博客导航' : 'Blog navigation'}>
    <Link href={article ? '/blog' : '/'}><span aria-hidden="true">←</span> {label}</Link>
  </nav>;
}
