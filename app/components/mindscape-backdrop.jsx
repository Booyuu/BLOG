'use client';

import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';

export default function MindscapeBackdrop({ variant = 'home' }) {
  const layer = useRef(null);
  const [threeReady, setThreeReady] = useState(false);
  const [sceneReady, setSceneReady] = useState(false);

  useEffect(() => {
    if (threeReady && sceneReady) return window.mountMindscapeBackdrop?.(layer.current, variant);
  }, [threeReady, sceneReady, variant]);

  return <>
    <div aria-hidden="true" className="mindscape-stars" ref={layer} />
    <div aria-hidden="true" className="mindscape-noise" />
    {variant === 'home' && <div aria-hidden="true" className="mindscape-grid" />}
    <Script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js" onReady={() => setThreeReady(true)} />
    <Script src="/js/mindscape-background.js" onReady={() => setSceneReady(true)} />
  </>;
}
