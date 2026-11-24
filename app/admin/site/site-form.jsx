'use client';

import { useRef, useState } from 'react';

function bilingual() {
  return { zh: '', en: '' };
}

function TextPair({ title, value, change, maxLength, optional = false, multiline = false }) {
  const Element = multiline ? 'textarea' : 'input';
  return <div className="site-form-grid">
    {[['zh', '中文'], ['en', '英文']].map(([language, label]) => <label key={language}>
      {title} · {label}
      <Element value={value[language]} onChange={(event) => change({ ...value, [language]: event.target.value })} maxLength={maxLength} required={!optional} rows={multiline ? 2 : undefined} />
    </label>)}
  </div>;
}

export default function SiteForm({ initial }) {
  const nextKey = useRef(initial.projects.length);
  const [form, setForm] = useState(() => ({
    ...initial,
    projects: initial.projects.map((project, key) => ({ ...project, key })),
  }));
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  function replace(field, value) {
    setForm((old) => ({ ...old, [field]: value }));
  }

  function updateProject(key, field, value) {
    replace('projects', form.projects.map((project) => project.key === key ? { ...project, [field]: value } : project));
  }

  function move(index, direction) {
    const entries = [...form.projects];
    [entries[index], entries[index + direction]] = [entries[index + direction], entries[index]];
    replace('projects', entries);
  }

  async function save(event) {
    event.preventDefault();
    setBusy(true);
    setNotice('');
    setError('');
    try {
      const response = await fetch('/api/admin?action=site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || '保存失败。');
      replace('revision', result.site.revision);
      setNotice('网站内容已更新。');
    } catch (failure) {
      setError(failure.message);
    } finally {
      setBusy(false);
    }
  }

  return <form className="site-content-form" method="post" onSubmit={save}>
    <fieldset disabled={busy}>
      <section className="panel">
        <h2>博客信息</h2>
        <TextPair title="标题" value={form.blogTitle} change={(value) => replace('blogTitle', value)} maxLength={60} />
        <TextPair title="简介" value={form.blogDescription} change={(value) => replace('blogDescription', value)} maxLength={240} optional multiline />
      </section>
      <section className="panel">
        <h2>首页底部</h2>
        <label>联系邮箱<input type="email" value={form.contact.email} onChange={(event) => replace('contact', { ...form.contact, email: event.target.value })} required /></label>
        <div className="site-form-grid">
          <label>NovaStudio 网站<input type="url" value={form.contact.nova} onChange={(event) => replace('contact', { ...form.contact, nova: event.target.value })} required /></label>
          <label>Ethicraft 社群门户<input type="url" value={form.contact.ethicraft} onChange={(event) => replace('contact', { ...form.contact, ethicraft: event.target.value })} required /></label>
        </div>
      </section>
      <section className="panel">
        <div className="section-heading"><h2>首页项目</h2>
          <button type="button" disabled={form.projects.length >= 12} onClick={() => {
            replace('projects', [...form.projects, { key: nextKey.current++, title: '', href: '', label: bilingual(), description: bilingual() }]);
          }}>添加项目</button>
        </div>
        <div className="site-project-editor">
          {form.projects.map((project, index) => <section key={project.key} className="site-project-fields" aria-label={project.title || '新项目'}>
            <div className="section-heading">
              <h3>{project.title || '新项目'}</h3>
              <div className="site-project-buttons">
                <button type="button" disabled={index === 0} onClick={() => move(index, -1)}>上移</button>
                <button type="button" disabled={index === form.projects.length - 1} onClick={() => move(index, 1)}>下移</button>
                <button type="button" onClick={() => replace('projects', form.projects.filter((item) => item.key !== project.key))}>移除</button>
              </div>
            </div>
            <div className="site-form-grid">
              <label>项目名称<input value={project.title} maxLength={80} required onChange={(event) => updateProject(project.key, 'title', event.target.value)} /></label>
              <label>项目链接<input value={project.href} maxLength={300} required onChange={(event) => updateProject(project.key, 'href', event.target.value)} /></label>
            </div>
            <TextPair title="标签" value={project.label} change={(value) => updateProject(project.key, 'label', value)} maxLength={60} />
            <TextPair title="简介" value={project.description} change={(value) => updateProject(project.key, 'description', value)} maxLength={300} multiline />
          </section>)}
        </div>
      </section>
      <div className="site-save-bar">
        <button className="primary" type="submit">{busy ? '正在保存' : '保存网站内容'}</button>
        {error && <p className="error" role="alert">{error}</p>}
        {notice && <p className="notice" role="status">{notice}</p>}
      </div>
    </fieldset>
  </form>;
}
