'use client';

import { useState } from 'react';

export default function Newsletter({ zh }) {
  const [status, setStatus] = useState('');

  async function subscribe(event) {
    event.preventDefault();
    const form = event.currentTarget;
    setStatus('pending');
    try {
      const response = await fetch(form.action, {
        method: 'POST', headers: { Accept: 'application/json' }, body: new FormData(form),
      });
      if (!response.ok) throw new Error('Subscription could not be saved');
      form.reset();
      setStatus('saved');
    } catch { setStatus('error'); }
  }

  return <form className="home-subscribe" action="https://formspree.io/f/xangajoy" method="post" onSubmit={subscribe}>
    <label htmlFor="subscribe-email">{zh ? '订阅博客更新' : 'Get blog updates'}</label>
    <div>
      <input id="subscribe-email" name="email" type="email" autoComplete="email" placeholder={zh ? '你的邮箱' : 'Your email'} required />
      <button type="submit" disabled={status === 'pending'}>{zh ? '订阅' : 'Subscribe'}</button>
    </div>
    {status === 'saved' && <p role="status">{zh ? '订阅成功。' : 'You’re subscribed.'}</p>}
    {status === 'error' && <p role="status">{zh ? '订阅失败，请稍后重试。' : 'Subscription failed. Please try again.'}</p>}
  </form>;
}
