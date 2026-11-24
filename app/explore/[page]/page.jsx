import { notFound } from 'next/navigation';
import { explorePages } from '../../../lib/explore';
import { siteLanguage } from '../../../lib/preferences';
import BlogAnalytics from '../../blog/analytics';
import ExploreFrame from './frame';

export async function generateMetadata({ params }) {
  const [{ page }, language] = await Promise.all([params, siteLanguage()]);
  return Object.hasOwn(explorePages, page) ? { title: explorePages[page][language] } : {};
}

export default async function ExplorePage({ params }) {
  const [{ page }, language] = await Promise.all([params, siteLanguage()]);
  if (!Object.hasOwn(explorePages, page)) notFound();
  const pageInfo = explorePages[page];
  return <><BlogAnalytics /><ExploreFrame source={pageInfo.source} language={language} title={pageInfo[language]} /></>;
}
