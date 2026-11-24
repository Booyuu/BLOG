import Link from 'next/link';
import { redirect } from 'next/navigation';
import { readSiteContent } from '../../../../lib/site-content';
import { signedIn } from '../../session';
import SiteForm from '../site-form';

export const metadata = { title: '网站内容' };

export default async function SiteSettings() {
  if (!(await signedIn())) redirect('/admin');
  return <section className="site-editor">
    <Link className="back" href="/admin">返回内容管理</Link>
    <h1>网站内容</h1>
    <SiteForm initial={await readSiteContent()} />
  </section>;
}
