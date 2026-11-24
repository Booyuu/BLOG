import { cookies } from 'next/headers';
import {
  authConfigured, changePassword, CredentialError, login, makeSession,
  sameOrigin, sessionCookie, sessionSeconds, validSession,
} from '../../../lib/auth';
import { InputError, savePost, uploadImage } from '../../../lib/content';
import { saveSiteContent } from '../../../lib/site-content';
import { renderMarkdown } from '../../../lib/markdown';

function reply(data, status = 200) {
  return Response.json(data, { status, headers: { 'Cache-Control': 'private, no-store' } });
}

function setSession(jar, version) {
  jar.set(sessionCookie, makeSession(version), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    path: '/',
    maxAge: sessionSeconds,
  });
}

export async function POST(request) {
  if (!sameOrigin(request)) return reply({ error: '请求来源无效。' }, 403);
  const mode = new URL(request.url).searchParams.get('action');
  const jar = await cookies();
  try {
    if (mode === 'login') {
      if (!authConfigured()) return reply({ error: '后台登录尚未配置。' }, 503);
      const { username, password } = (await request.json()) ?? {};
      const version = await login(username, password);
      if (!version) return reply({ error: '账号或密码不正确。' }, 401);
      setSession(jar, version);
      return reply({ ok: true });
    }
    if (!(await validSession(jar.get(sessionCookie)?.value))) return reply({ error: '登录已过期，请返回后台重新登录。' }, 401);
    if (mode === 'logout') {
      jar.delete(sessionCookie);
      return reply({ ok: true });
    }
    if (mode === 'password') {
      const { current, next, confirm } = (await request.json()) ?? {};
      setSession(jar, await changePassword(current, next, confirm));
      return reply({ ok: true });
    }
    if (mode === 'site') return reply({ site: await saveSiteContent(await request.json()) });
    if (mode === 'save') return reply({ post: await savePost(await request.json()) });
    if (mode === 'image') return reply({ url: await uploadImage((await request.formData()).get('image')) });
    if (mode === 'preview') {
      const { markdown } = (await request.json()) ?? {};
      if (typeof markdown !== 'string' || markdown.length > 120000) return reply({ error: '正文格式有误或超出长度限制。' }, 400);
      return reply({ html: renderMarkdown(markdown) });
    }
    return reply({ error: '未知操作。' }, 400);
  } catch (error) {
    if (error instanceof InputError || error instanceof CredentialError) return reply({ error: error.message }, error.status);
    if (error instanceof SyntaxError) return reply({ error: '请求格式有误。' }, 400);
    console.error('Blog admin operation failed:', mode, error.name);
    return reply({ error: '操作失败，请稍后重试。' }, 500);
  }
}
