import { cookies } from 'next/headers';
import { configuredPassword, makeSession, sameOrigin, sessionCookie, sessionSeconds, validPassword, validSession } from '../../../lib/auth';
import { InputError, savePost, uploadImage } from '../../../lib/content';
import { renderMarkdown } from '../../../lib/markdown';

function reply(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

export async function POST(request) {
  if (!sameOrigin(request)) return reply({ error: '请求来源无效。' }, 403);
  const mode = new URL(request.url).searchParams.get('action');
  const jar = await cookies();
  try {
    if (mode === 'login') {
      if (!configuredPassword()) return reply({ error: '管理密码尚未配置。' }, 503);
      if (!validPassword((await request.json())?.password)) return reply({ error: '密码不正确。' }, 401);
      jar.set(sessionCookie, makeSession(), {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        path: '/',
        maxAge: sessionSeconds,
      });
      return reply({ ok: true });
    }
    if (!validSession(jar.get(sessionCookie)?.value)) return reply({ error: '登录已过期，请返回后台重新登录。' }, 401);
    if (mode === 'logout') {
      jar.delete(sessionCookie);
      return reply({ ok: true });
    }
    if (mode === 'save') return reply({ post: await savePost(await request.json()) });
    if (mode === 'image') return reply({ url: await uploadImage((await request.formData()).get('image')) });
    if (mode === 'preview') {
      const { markdown } = await request.json();
      if (typeof markdown !== 'string' || markdown.length > 120000) return reply({ error: '正文格式有误或超出长度限制。' }, 400);
      return reply({ html: renderMarkdown(markdown) });
    }
    return reply({ error: '未知操作。' }, 400);
  } catch (error) {
    if (error instanceof InputError) return reply({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return reply({ error: '请求格式有误。' }, 400);
    console.error('Blog admin operation failed:', mode, error.name);
    return reply({ error: '操作失败，请稍后重试。' }, 500);
  }
}
