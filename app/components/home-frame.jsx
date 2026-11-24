'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function HomeFrame() {
  const frame = useRef(null);
  const router = useRouter();

  function syncHash() {
    frame.current?.contentWindow?.postMessage({ mindscapeHomeHash: location.hash }, location.origin);
  }

  useEffect(() => {
    function receive(event) {
      if (event.origin !== location.origin || event.source !== frame.current?.contentWindow) return;
      const { mindscapePath, mindscapeHomeHash } = event.data ?? {};
      if (typeof mindscapePath === 'string' && /^\/(?:blog|explore)(?:[/?#]|$)/.test(mindscapePath)) {
        router.push(mindscapePath);
      }
      if (typeof mindscapeHomeHash === 'string' && /^#?[a-z-]*$/.test(mindscapeHomeHash) && mindscapeHomeHash !== location.hash) {
        history.replaceState(null, '', '/' + mindscapeHomeHash);
      }
    }
    window.addEventListener('message', receive);
    window.addEventListener('hashchange', syncHash);
    return () => {
      window.removeEventListener('message', receive);
      window.removeEventListener('hashchange', syncHash);
    };
  }, [router]);

  return <iframe ref={frame} className="mindscape-home-frame" title="MINDSCAPE" src="/home-view?embedded=1" onLoad={syncHash} />;
}
