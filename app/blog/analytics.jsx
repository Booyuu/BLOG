'use client';

import { Analytics } from '@vercel/analytics/next';

export default function BlogAnalytics() {
  return <Analytics beforeSend={(event) => {
    const { hostname } = new URL(event.url, window.location.origin);
    return ['booyuu.top', 'www.booyuu.top'].includes(hostname) ? event : null;
  }} />;
}
