'use client';

import { detailTextLimit } from '../../lib/article-details';

export default function ArticleDetailsFields({ value, onChange, title = '文章信息侧栏' }) {
  function update(field, next) {
    onChange({ ...value, [field]: next });
  }

  return <section className="article-details-fields" aria-label={title}>
    <h2>{title}</h2>
    <div className="article-details-options">
      {[
        ['enabled', '显示侧栏'],
        ['showDate', '显示日期'],
        ['showCategory', '显示分类'],
      ].map(([name, label]) => <label key={name}>
        <input type="checkbox" checked={value[name]} onChange={(event) => update(name, event.target.checked)} />
        {label}
      </label>)}
    </div>
    <div className="article-details-inputs">
      {[
        ['location', '地点'],
        ['date', '自定义日期'],
        ['gear', '设备'],
        ['lens', '镜头'],
        ['mood', '心情'],
      ].map(([name, label]) => <label key={name}>{label}
        <input type="text" maxLength={detailTextLimit} value={value[name]} onChange={(event) => update(name, event.target.value)} placeholder={name === 'date' ? '留空时使用发布日期' : undefined} />
      </label>)}
    </div>
  </section>;
}
