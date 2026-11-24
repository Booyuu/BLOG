import HomeFrame from './components/home-frame';
import BlogAnalytics from './blog/analytics';

export const metadata = { title: 'MINDSCAPE', alternates: { canonical: '/' } };

export default function HomePage() {
  return <><BlogAnalytics /><HomeFrame /></>;
}
