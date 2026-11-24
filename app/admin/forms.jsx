'use client';

import { useRouter } from 'next/navigation';
import { useDeferredValue, useMemo, useRef, useState } from 'react';
import ArticleDetailsFields from './fields-article-details';
import { articleDetailsDefaults } from '../../lib/article-details';
import { renderMarkdown } from '../../lib/markdown';
import { displayCategory, siteUrl, slugPattern } from '../../lib/site';

async function send(action, data) {
  const multipart = data instanceof FormData;
  const response = await fetch('/api/admin?action=' + action, {
    method: 'POST',
    headers: multipart ? undefined : { 'Content-Type': 'application/json' },
    body: multipart ? data : JSON.stringify(data),
  });
  const result = await response.json().catch(() => null);
  if (!response.ok || !result) throw new Error(result?.error ?? '操作失败，请稍后重试。');
  return result;
}

export function LoginForm() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function login(event) {
    event.preventDefault();
    const { username, password } = Object.fromEntries(new FormData(event.currentTarget));
    setBusy(true);
    setError('');
    try {
      await send('login', { username, password });
      router.refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="panel login" method="post" onSubmit={login}>
    <h1>登录博客后台</h1>
    <label>账号<input name="username" autoComplete="username" autoCapitalize="none" spellCheck="false" required /></label>
    <label>管理密码<input type="password" name="password" autoComplete="current-password" required /></label>
    {error && <p role="alert" className="error">{error}</p>}
    <button className="primary" disabled={busy}>{busy ? '正在登录' : '登录'}</button>
  </form>;
}

export function PasswordForm({ username, minimum }) {
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  async function update(event) {
    event.preventDefault();
    const form = event.currentTarget;
    const fields = Object.fromEntries(new FormData(form));
    setStatus('');
    setError('');
    if (fields.next !== fields.confirm) {
      setError('两次输入的新密码不一致。');
      return;
    }
    setBusy(true);
    try {
      await send('password', fields);
      form.reset();
      setStatus('密码已更新，其他设备上的登录已失效。');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="panel settings-form" method="post" onSubmit={update}>
    <div className="settings-identity"><span>管理员账号</span><strong>{username}</strong></div>
    <input type="text" name="username" autoComplete="username" value={username} readOnly hidden />
    <label>当前密码<input type="password" name="current" autoComplete="current-password" maxLength={128} required /></label>
    <label>新密码<input type="password" name="next" autoComplete="new-password" minLength={minimum} maxLength={128} aria-describedby="password-requirements" required /></label>
    <p id="password-requirements" className="muted">使用 {minimum} 至 128 个字符，首尾不要留空格。</p>
    <label>确认新密码<input type="password" name="confirm" autoComplete="new-password" minLength={minimum} maxLength={128} required /></label>
    {error && <p role="alert" className="error">{error}</p>}
    {status && <p role="status" className="notice">{status}</p>}
    <button className="primary" disabled={busy}>{busy ? '正在保存' : '更新密码'}</button>
  </form>;
}

export function LogoutButton() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function logout() {
    setBusy(true);
    try {
      await send('logout', {});
      router.refresh();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <div><button onClick={logout} disabled={busy}>退出登录</button>{error && <p role="alert" className="error">{error}</p>}</div>;
}

export function Editor({ post, categories, suggestedSlug }) {
  const router = useRouter();
  const textarea = useRef(null);
  const selection = useRef(null);
  const [current, setCurrent] = useState(post);
  const [slug, setSlug] = useState(post?.slug ?? suggestedSlug);
  const [cover, setCover] = useState(post?.cover ?? '');
  const [details, setDetails] = useState(post?.details ?? articleDetailsDefaults);
  const [markdown, setMarkdown] = useState(post?.markdown ?? '');
  const [view, setView] = useState('split');
  const deferredMarkdown = useDeferredValue(markdown);
  const previewHtml = useMemo(() => view === 'write' ? '' : renderMarkdown(deferredMarkdown), [deferredMarkdown, view]);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  async function perform(operation) {
    setBusy(true);
    setNotice('');
    setError('');
    try {
      await operation();
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  function save(event) {
    event.preventDefault();
    const fields = Object.fromEntries(new FormData(event.currentTarget));
    const status = event.nativeEvent.submitter?.value || 'draft';
    if (!slugPattern.test(slug) || slug === 'new') {
      setNotice('');
      setError('自定义网址只接受小写字母、数字和短横线。');
      return;
    }
    if (current?.status === 'published' && status === 'draft' && !confirm('撤下后，读者将暂时无法打开这篇文章。')) return;
    perform(async () => {
      const { post: saved } = await send('save', {
        slug: current?.slug ?? slug,
        title: fields.title,
        description: fields.description,
        category: fields.category,
        cover,
        details,
        markdown,
        revision: current?.updatedAt ?? '',
        status,
      });
      setCurrent(saved);
      setNotice(status === 'published' ? '文章已发布。' : '草稿已保存。');
      if (!current) window.history.replaceState(null, '', '/admin/' + saved.slug);
      router.refresh();
    });
  }

  function importMarkdown(event) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = '';
    if (!file || (markdown.trim() && !confirm('导入文件会替换当前编辑器里的正文。'))) return;
    perform(async () => {
      if (file.size > 480000) throw new Error('Markdown 文件超出长度限制。');
      const text = await file.text();
      if (text.length > 120000) throw new Error('Markdown 文件超出长度限制。');
      setMarkdown(text);
      selection.current = null;
      setNotice('Markdown 已导入编辑器。');
    });
  }

  function upload(event, asCover) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    const [start, end] = selection.current ?? [markdown.length, markdown.length];
    perform(async () => {
      const payload = new FormData();
      payload.set('image', file);
      const { url } = await send('image', payload);
      if (asCover) setCover(url);
      else {
        const alt = file.name.replace(/\.[^.]+$/, '').replace(/[\[\]\\]/g, '').replace(/[\r\n]/g, ' ');
        const image = '\n\n![' + alt + '](' + url + ')\n\n';
        setMarkdown((text) => text.slice(0, start) + image + text.slice(end));
        selection.current = [start + image.length, start + image.length];
        requestAnimationFrame(() => {
          textarea.current?.focus();
          textarea.current?.setSelectionRange(...selection.current);
        });
      }
      setNotice(asCover ? '封面已上传。' : '图片已插入正文。');
    });
  }

  return <section>
    <a className="back" href="/admin">返回内容管理</a>
    <div className="section-heading editor-heading">
      <h1>{current ? '编辑文章' : '写文章'}</h1>
      {current?.status === 'published' && <a href={'/blog/' + current.slug} target="_blank" rel="noreferrer">查看已发布文章</a>}
    </div>
    <form className="panel editor" method="post" onSubmit={save}>
      <fieldset disabled={busy}>
        <label>标题<input name="title" defaultValue={post?.title} maxLength={120} required /></label>
        <div className="editor-grid">
          <div className="article-address">
            <span>文章网址</span>
            <code>{siteUrl + '/blog/' + slug}</code>
            {current && current.status !== 'published' && <span className="muted">发布后读者可以打开。</span>}
            {!current && <details className="slug-options">
              <summary>自定义网址尾段</summary>
              <label>网址尾段<input value={slug} onChange={(event) => setSlug(event.target.value)} maxLength={80} spellCheck="false" autoCapitalize="none" /></label>
            </details>}
          </div>
          <label>分类<select name="category" defaultValue={displayCategory(post?.category)}>{categories.map((category) => <option key={category}>{category}</option>)}</select></label>
        </div>
        <label>摘要<input name="description" defaultValue={post?.description} maxLength={240} /></label>
        <div className="media-tools">
          <label className="upload">上传封面<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => upload(event, true)} /></label>
          {cover && <><img src={cover} alt="文章封面" /><button type="button" onClick={() => setCover('')}>移除封面</button></>}
        </div>
        <ArticleDetailsFields value={details} onChange={setDetails} />
        <div className="editor-toolbar">
          <div className="body-view-options" role="group" aria-label="正文显示方式">
            {[['split', '并排预览'], ['preview', '仅预览'], ['write', '仅编辑']].map(([mode, label]) =>
              <button type="button" key={mode} aria-pressed={view === mode} onClick={() => setView(mode)}>{label}</button>)}
          </div>
          {view !== 'preview' && <div className="media-tools">
            <label className="upload">导入 Markdown<input type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" onChange={importMarkdown} /></label>
            <label className="upload inline-image">在光标处插入图片<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" onChange={(event) => upload(event, false)} /></label>
          </div>}
        </div>
        <div className="editor-body" data-view={view}>
          <label className="editor-source" hidden={view === 'preview'}>正文（Markdown）
            <textarea ref={textarea} value={markdown} onSelect={(event) => { selection.current = [event.target.selectionStart, event.target.selectionEnd]; }} onChange={(event) => setMarkdown(event.target.value)} maxLength={120000} rows={15} />
          </label>
          {view !== 'write' && <section className="editor-rendered" aria-label="实时预览">
            <h2>实时预览</h2>
            {previewHtml
              ? <div className="prose preview" tabIndex={0} aria-label="正文预览" dangerouslySetInnerHTML={{ __html: previewHtml }} />
              : <p className="preview muted">写下正文，文字和图片会显示在这里。</p>}
          </section>}
        </div>
        <div className="editor-actions">
          <button name="status" value="published" className="primary">{current?.status === 'published' ? '更新已发布文章' : '发布文章'}</button>
          <button name="status" value="draft">{current?.status === 'published' ? '撤下并转为草稿' : '保存草稿'}</button>
        </div>
      </fieldset>
      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="notice" role="status">{notice}</p>}
    </form>
  </section>;
}
