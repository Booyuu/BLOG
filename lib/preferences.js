import { cookies } from 'next/headers';

export async function siteLanguage() {
  return (await cookies()).get('mindscape_lang')?.value === 'zh' ? 'zh' : 'en';
}
