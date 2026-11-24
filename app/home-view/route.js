import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { publishedPosts } from '../../lib/content';
import { siteLanguage } from '../../lib/preferences';
import { legacyArticleDate, siteUrl } from '../../lib/site';
import { readSiteContent } from '../../lib/site-content';

export const dynamic = 'force-dynamic';

const about = {
  en: 'I build tools at NovaStudio that make it easier to create. Away from trading screens, I’m drawn to Norway’s fjords, Ólafur Arnalds’ music and the small things worth remembering.',
  zh: '我在 NovaStudio 做降低创作门槛的工具。在 K 线之外，我喜欢挪威的峡湾、Ólafur Arnalds 的音乐，也在这里记录生活里值得记下的时刻。',
};

function escape(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[character]);
}

function localText(value, language) {
  return `data-home-en="${escape(value.en)}" data-home-zh="${escape(value.zh)}"`;
}

function projectCards(projects, language) {
  return projects.map((project) => {
    const external = !project.href.startsWith('/') && !project.href.startsWith(siteUrl + '/');
    const style = project.title === 'THE PA SYSTEM' ? 'group-hover:text-accent-red'
      : project.title === 'PLANETARY LOGS' ? 'group-hover:text-accent-green' : 'group-hover:text-accent-blue';
    return `<a class="project-item group" href="${escape(project.href)}"${external ? ' target="_blank" rel="noreferrer"' : ''}>
      <div>
        <h3 class="project-title ${style} transition-colors">${escape(project.title)}</h3>
        <p class="font-mono text-xs text-dim mt-2 tracking-widest" ${localText(project.label, language)}>${escape(project.label[language])}</p>
        <p class="project-summary font-sans text-xs text-gray-500 mt-2 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity" ${localText(project.description, language)}>${escape(project.description[language])}</p>
      </div>
      <i class="ri-arrow-right-line text-2xl text-dim group-hover:text-white transition-colors" aria-hidden="true"></i>
    </a>`;
  }).join('');
}

function postCards(posts) {
  const items = posts.slice(0, 3).map((post) => ({
    title: post.title, date: legacyArticleDate(post.publishedAt), summary: post.description, href: '/blog/' + post.slug,
  }));
  if (items.length < 3) items.push({
    title: 'Finding Alpha in Bear Markets', date: '2025.10.15', summary: '如何在下行周期中保持冷静并寻找获利机会…', href: '/blog?category=交易',
  });
  if (items.length < 3) items.push({
    title: 'A Solo Trip to Iceland', date: '2025.09.02', summary: '冰岛环岛骑行记录与摄影集…', href: '/explore/iceland',
  });
  return items.map((item) => `<a class="blog-card group pointer-events-auto" href="${escape(item.href)}" style="text-decoration:none">
    <div class="font-mono text-xs text-dim">${escape(item.date)}</div>
    <div>
      <h3 class="font-serif text-2xl text-gray-200 group-hover:text-white transition-colors mb-4 leading-tight">${escape(item.title)}</h3>
      <p class="font-sans text-xs text-gray-500 line-clamp-3">${escape(item.summary)}</p>
    </div>
    <div class="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white transition-colors">
      <i class="ri-arrow-right-up-line text-dim group-hover:text-white" aria-hidden="true"></i>
    </div>
  </a>`).join('');
}

function footer(contact, language) {
  const labels = {
    contact: { en: 'CONTACT', zh: '联系' },
    sites: { en: 'SITES & COMMUNITY', zh: '网站与社群' },
    socials: { en: 'ELSEWHERE', zh: '社交账号' },
    ethicraft: { en: 'Ethicraft Community', zh: 'Ethicraft 社群门户' },
  };
  const label = (key) => `<h3 class="text-dim tracking-widest" ${localText(labels[key], language)}>${labels[key][language]}</h3>`;
  return `<footer class="text-left font-mono border-t border-white/20 pt-10">
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-x-8 gap-y-9 text-sm">
      <div class="flex flex-col gap-3">${label('contact')}
        <a class="text-white break-all hover:text-accent-blue" href="mailto:${escape(contact.email)}">${escape(contact.email)}</a>
      </div>
      <div class="flex flex-col gap-3">${label('sites')}
        <a class="text-white hover:text-accent-blue" href="${escape(contact.nova)}" target="_blank" rel="noreferrer">NovaStudio</a>
        <a class="text-white hover:text-accent-blue" href="${escape(contact.ethicraft)}" target="_blank" rel="noreferrer" ${localText(labels.ethicraft, language)}>${labels.ethicraft[language]}</a>
      </div>
      <div class="flex flex-col gap-3">${label('socials')}
        <a class="text-white hover:text-accent-blue" href="https://x.com/Booyuu888" target="_blank" rel="noreferrer">Twitter / X</a>
        <a class="text-white hover:text-accent-blue" href="https://www.linkedin.com/in/boyu-ethicraft/" target="_blank" rel="noreferrer">LinkedIn</a>
      </div>
    </div>
    <div class="mt-12 flex flex-wrap justify-between gap-3 pt-5 border-t border-white/10 text-xs text-dim tracking-widest">
      <span>SINGAPORE / EARTH</span><span>MINDSCAPE</span>
    </div>
  </footer>`;
}

export async function GET() {
  const [template, language, site, posts] = await Promise.all([
    readFile(join(process.cwd(), 'content', 'original-home.html'), 'utf8'),
    siteLanguage(),
    readSiteContent(),
    publishedPosts(),
  ]);
  const sections = {
    LANG: language === 'zh' ? 'zh-CN' : 'en',
    ABOUT: escape(about[language]),
    ROLE: language === 'zh' ? '目前在做' : 'CURRENT ROLE ::',
    NOVA_LINK: escape(site.contact.nova),
    PROJECTS: projectCards(site.projects, language),
    POSTS: postCards(posts),
    FOOTER: footer(site.contact, language),
  };
  return new Response(template.replace(/%%([A-Z_]+)%%/g, (_, name) => sections[name]), {
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'private, no-store',
      'X-Robots-Tag': 'noindex',
      'X-Frame-Options': 'SAMEORIGIN',
    },
  });
}
