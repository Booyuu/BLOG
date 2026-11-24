import { get, head, put, BlobNotFoundError, BlobPreconditionFailedError } from '@vercel/blob';
import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { categories, imagePattern, mediaTypes, slugPattern } from './site.js';
import { imageNames } from './markdown.js';
import { namespace, storageReady } from './storage.js';

export { storageReady } from './storage.js';

const path = namespace + '/posts.json';
const seed = {
  slug: 'post-01',
  title: '写在二十一岁前',
  description: '关于交易、家人，以及希望留给自己的那些片刻。',
  category: '生活',
  cover: '',
  publishedAt: '2026-02-21T00:00:00+08:00',
  updatedAt: '2026-02-21T00:00:00+08:00',
  status: 'published',
};

async function seedPost() {
  const markdown = await readFile(join(process.cwd(), 'content', 'post-01.md'), 'utf8');
  return { ...seed, markdown };
}

export async function readContent() {
  const result = storageReady() ? await get(path, { access: 'private', useCache: false }) : null;
  if (!result) return { posts: [await seedPost()] };
  if (result.statusCode !== 200) throw new Error('Content could not be read');
  const { posts } = await new Response(result.stream).json();
  return { posts };
}

export async function publishedPosts() {
  const { posts } = await readContent();
  return posts.filter((post) => post.status === 'published')
    .sort((first, second) => new Date(second.publishedAt) - new Date(first.publishedAt));
}

export class InputError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

function field(body, key, maximum) {
  if (typeof body[key] !== 'string' || body[key].length > maximum) {
    throw new InputError('字段格式有误或超出长度限制。');
  }
  return body[key].trim();
}

export async function savePost(body) {
  if (!storageReady()) throw new InputError('内容存储尚未连接。', 503);
  const slug = field(body, 'slug', 80);
  const title = field(body, 'title', 120);
  const description = field(body, 'description', 240);
  const category = field(body, 'category', 20);
  const cover = field(body, 'cover', 120);
  const markdown = field(body, 'markdown', 120000);
  const status = field(body, 'status', 10);
  const revision = field(body, 'revision', 40);
  if (!slugPattern.test(slug) || slug === 'new' || !title || !categories.includes(category)) {
    throw new InputError('请输入标题、有效的文章链接和分类。链接仅使用小写字母、数字和连字符。');
  }
  if (!['draft', 'published'].includes(status) || (status === 'published' && !markdown)) {
    throw new InputError('请填写正文后再发布。');
  }
  if (cover && (!cover.startsWith('/blog-image/') || !imagePattern.test(cover.slice(12)))) {
    throw new InputError('请通过上传图片设置封面。');
  }
  const metadata = await head(path).catch((error) => {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  });
  const { posts } = await readContent();
  const previous = posts.find((post) => post.slug === slug);
  if ((previous?.updatedAt ?? '') !== revision) {
    throw new InputError('文章已被修改或此链接已被使用。请刷新后重试。', 409);
  }
  const now = new Date().toISOString();
  const post = {
    slug, title, description, category, cover, markdown, status,
    updatedAt: now,
    publishedAt: previous?.publishedAt ?? (status === 'published' ? now : null),
  };
  const next = JSON.stringify({ posts: [...posts.filter((item) => item.slug !== slug), post] });
  try {
    await put(path, next, {
      access: 'private',
      contentType: 'application/json',
      cacheControlMaxAge: 60,
      ...(metadata ? { allowOverwrite: true, ifMatch: metadata.etag } : {}),
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || /already exists/i.test(error.message)) {
      console.warn('Blog content write conflict', {
        hasMetadata: Boolean(metadata),
        hasETag: Boolean(metadata?.etag),
        preconditionFailed: error instanceof BlobPreconditionFailedError,
      });
      throw new InputError('另一个编辑操作刚刚保存了内容。请刷新后重试。', 409);
    }
    throw error;
  }
  return post;
}

export async function uploadImage(file) {
  if (!storageReady()) throw new InputError('内容存储尚未连接。', 503);
  if (!(file instanceof File) || file.size < 12 || file.size > 4 * 1024 * 1024) {
    throw new InputError('请选择一张 4 MB 以内的图片。');
  }
  const bytes = Buffer.from(await file.arrayBuffer());
  const prefix = bytes.subarray(0, 12);
  const signatures = {
    png: prefix.subarray(0, 8).equals(Buffer.from('89504e470d0a1a0a', 'hex')),
    jpg: prefix.subarray(0, 3).equals(Buffer.from('ffd8ff', 'hex')),
    webp: prefix.toString('ascii', 0, 4) === 'RIFF' && prefix.toString('ascii', 8, 12) === 'WEBP',
    gif: /^GIF8[79]a$/.test(prefix.toString('ascii', 0, 6)),
  };
  const extension = Object.keys(signatures).find((key) => signatures[key] && file.type === mediaTypes[key]);
  if (!extension) throw new InputError('支持 JPG、PNG、WebP 和 GIF。');
  const name = crypto.randomUUID() + '.' + extension;
  await put(namespace + '/images/' + name, bytes, { access: 'private', contentType: mediaTypes[extension] });
  return '/blog-image/' + name;
}

export async function readImage(name, admin) {
  if (!storageReady() || !imagePattern.test(name)) return null;
  if (!admin) {
    const posts = await publishedPosts();
    const visible = posts.some((post) =>
      post.cover === '/blog-image/' + name || imageNames(post.markdown).includes(name)
    );
    if (!visible) return null;
  }
  return get(namespace + '/images/' + name, { access: 'private' });
}
