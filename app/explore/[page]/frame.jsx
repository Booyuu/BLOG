'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

const publicRoutes = /^\/(?:blog|explore)(?:[/?#]|$)/;

export default function ExploreFrame({ source, language, title }) {
  const frame = useRef(null);
  const router = useRouter();

  useEffect(() => {
    function navigate(event) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const path = event.data?.mindscapePath;
      if (typeof path === 'string' && (path === '/' || publicRoutes.test(path))) router.push(path);
    }
    window.addEventListener('message', navigate);
    return () => window.removeEventListener('message', navigate);
  }, [router]);

  return <iframe ref={frame} className="mindscape-explore" title={title} src={source + '?embedded=1&lang=' + language} />;
}
