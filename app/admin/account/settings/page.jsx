import Link from 'next/link';
import { redirect } from 'next/navigation';
import { adminUsername, minPasswordLength } from '../../../../lib/auth';
import { PasswordForm } from '../../forms';
import { signedIn } from '../../session';

export const dynamic = 'force-dynamic';
export const metadata = { title: '账号设置' };

export default async function SettingsPage() {
  if (!(await signedIn())) redirect('/admin');

  return <section className="admin-settings">
    <Link className="back" href="/admin">返回内容管理</Link>
    <h1>账号设置</h1>
    <PasswordForm username={adminUsername} minimum={minPasswordLength} />
  </section>;
}
