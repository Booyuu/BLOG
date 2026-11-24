import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from '@vercel/blob';
import { namespace, storageReady } from './storage.js';
import { icelandDetailsDefaults, parseArticleDetails } from './article-details.js';
import { InputError } from './content.js';

const path = namespace + '/site.json';

const defaults = {
  revision: '',
  icelandDetails: icelandDetailsDefaults,
  contact: { email: 'boyu@novastudio.world', nova: 'https://novastudio.world', ethicraft: 'https://vlink.cc/ethicraft' },
  blogTitle: { en: 'INNER CHRONICLES', zh: '内心纪事' },
  blogDescription: { en: '', zh: '' },
  projects: [
    {
      title: 'NovaStudio',
      label: { en: 'AI CREATION PLATFORM', zh: 'AI 创作平台' },
      description: {
        en: 'Making it easier to create with AI. We start with video and are building toward spatial media.',
        zh: '降低创作门槛的 AI 创作平台。从视频开始，逐步探索空间媒体。',
      },
      href: 'https://novastudio.world',
    },
    {
      title: 'Ethicraft',
      label: { en: 'TRADING COMMUNITY', zh: '交易者社群' },
      description: {
        en: 'A community for traders to learn together and share trading education, resources and market reviews.',
        zh: '面向交易者的学习社群，分享交易教学、学习资料和实盘复盘。',
      },
      href: 'https://vlink.cc/ethicraft',
    },
    {
      title: 'THE PA SYSTEM',
      label: { en: 'PRICE ACTION TRADING', zh: '价格行为交易' },
      description: { en: 'Notes on price action, trade execution and discipline.', zh: '关于价格行为、交易执行与纪律的笔记。' },
      href: '/blog?category=交易',
    },
    {
      title: 'PLANETARY LOGS',
      label: { en: 'GLOBAL EXPLORATION', zh: '旅行记录' },
      description: { en: 'Travel journals and photography.', zh: '旅行日志与摄影。' },
      href: '/explore/travel',
    },
  ],
};

export async function readSiteContent() {
  const result = storageReady() ? await get(path, { access: 'private', useCache: false }) : null;
  if (!result) return defaults;
  if (result.statusCode !== 200) throw new Error('Site settings could not be read');
  return { ...defaults, ...await new Response(result.stream).json() };
}

function string(value, maximum, required = true) {
  if (typeof value !== 'string' || value.length > maximum || (required && !value.trim())) {
    throw new InputError('请检查必填字段和文字长度。');
  }
  return value.trim();
}

function bilingual(value, maximum, required = true) {
  return {
    en: string(value?.en, maximum, required),
    zh: string(value?.zh, maximum, required),
  };
}

function projectLink(value) {
  const href = string(value, 300);
  if (/^\/(?![\/\\])[^\\\s]*$/u.test(href)) return href;
  try {
    const url = new URL(href);
    if (url.protocol === 'https:' && url.hostname && !url.username && !url.password) return url.href;
  } catch {}
  throw new InputError('项目链接需要使用 https:// 或站内路径。');
}

export async function saveSiteContent(input) {
  if (!storageReady()) throw new InputError('内容存储尚未连接。', 503);
  if (!Array.isArray(input?.projects) || input.projects.length > 12) {
    throw new InputError('最多可添加 12 个项目。');
  }
  const blogTitle = bilingual(input.blogTitle, 60);
  const blogDescription = bilingual(input.blogDescription, 240, false);
  const email = string(input.contact?.email, 180);
  if (!/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/u.test(email) || /[?#%&;,]/.test(email)) {
    throw new InputError('请输入有效的联系邮箱。');
  }
  const nova = projectLink(input.contact?.nova);
  const ethicraft = projectLink(input.contact?.ethicraft);
  if (![nova, ethicraft].every((href) => href.startsWith('https://'))) {
    throw new InputError('页脚网站链接需要使用 https://。');
  }
  const contact = { email, nova, ethicraft };
  const projects = input.projects.map((project) => ({
    title: string(project?.title, 80),
    label: bilingual(project?.label, 60),
    description: bilingual(project?.description, 300),
    href: projectLink(project?.href),
  }));
  const metadata = await head(path).catch((error) => {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  });
  const previous = await readSiteContent();
  if (previous.revision !== input.revision) {
    throw new InputError('网站内容已被修改。请刷新后再试。', 409);
  }
  const icelandDetails = parseArticleDetails(input.icelandDetails, previous.icelandDetails);
  if (!icelandDetails) throw new InputError('冰岛游记侧栏的字段格式有误。');
  const saved = { revision: new Date().toISOString(), blogTitle, blogDescription, contact, projects, icelandDetails };
  try {
    await put(path, JSON.stringify(saved), {
      access: 'private',
      contentType: 'application/json',
      ...(metadata ? { allowOverwrite: true, ifMatch: metadata.etag } : {}),
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || /already exists/i.test(error.message)) {
      throw new InputError('网站内容刚刚被修改。请刷新后再试。', 409);
    }
    throw error;
  }
  return saved;
}
