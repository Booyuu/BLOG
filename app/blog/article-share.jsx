'use client';

import { useState } from 'react';

export default function ArticleShare({ href, zh }) {
  const [copied, setCopied] = useState(false);
  const xLink = 'https://twitter.com/intent/tweet?url=' + encodeURIComponent(href);

  async function copyLink() {
    try {
      await navigator.clipboard.writeText(href);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  return <div className="legacy-article-share">
    <a href={xLink} target="_blank" rel="noreferrer" aria-label={zh ? '分享到 X' : 'Share on X'}>𝕏</a>
    <button type="button" onClick={copyLink} aria-label={zh ? '复制文章链接' : 'Copy article link'}><span aria-hidden="true">🔗</span></button>
    {copied && <span role="status">{zh ? '已复制' : 'Copied'}</span>}
  </div>;
}
