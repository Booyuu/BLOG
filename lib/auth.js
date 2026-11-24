import { createHmac, randomBytes, scrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';
import { BlobNotFoundError, BlobPreconditionFailedError, get, head, put } from '@vercel/blob';
import { namespace, storageReady } from './storage.js';

export const adminUsername = 'boyu';
export const minPasswordLength = 16;
export const sessionCookie = 'booyuu_admin';
export const sessionSeconds = 60 * 60 * 8;
const initialVersion = '0';
const authPath = namespace + '/admin-credential.json';
const deriveKey = promisify(scrypt);

export function authConfigured() {
  return process.env.BLOG_ADMIN_PASSWORD?.length >= 32
    && process.env.BLOG_SESSION_SECRET?.length >= 32;
}

function sign(value) {
  return createHmac('sha256', process.env.BLOG_SESSION_SECRET).update(value).digest('hex');
}

function equalHex(first, second) {
  return timingSafeEqual(Buffer.from(first, 'hex'), Buffer.from(second, 'hex'));
}

async function readCredential() {
  if (!storageReady()) return null;
  const result = await get(authPath, { access: 'private', useCache: false });
  if (!result) return null;
  if (result.statusCode !== 200) throw new Error('Administrator credential could not be read');
  return new Response(result.stream).json();
}

async function validPassword(candidate, credential) {
  if (typeof candidate !== 'string' || candidate.length > 128) return false;
  if (!credential) {
    return equalHex(sign('login:' + candidate), sign('login:' + process.env.BLOG_ADMIN_PASSWORD));
  }
  const key = await deriveKey(candidate, credential.salt, 64);
  return equalHex(key.toString('hex'), credential.hash);
}

export async function login(username, password) {
  if (!authConfigured() || typeof username !== 'string' || username.trim().toLowerCase() !== adminUsername) return null;
  const credential = await readCredential();
  return (await validPassword(password, credential)) ? credential?.version ?? initialVersion : null;
}

export function makeSession(version) {
  const expiry = String(Math.floor(Date.now() / 1000) + sessionSeconds);
  return [expiry, version, sign('session-v2:' + expiry + ':' + version)].join('.');
}

export async function validSession(cookie) {
  if (!authConfigured() || !/^\d{10}\.(?:0|[0-9a-f]{32})\.[0-9a-f]{64}$/.test(cookie ?? '')) return false;
  const [expiry, version, provided] = cookie.split('.');
  if (Number(expiry) <= Date.now() / 1000) return false;
  if (!equalHex(provided, sign('session-v2:' + expiry + ':' + version))) return false;
  return version === ((await readCredential())?.version ?? initialVersion);
}

export class CredentialError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

export async function changePassword(current, next, confirmation) {
  if (!storageReady()) throw new CredentialError('凭据存储尚未连接。', 503);
  if (typeof next !== 'string' || next.length < minPasswordLength || next.length > 128 || next !== next.trim()) {
    throw new CredentialError('新密码须为 16 至 128 个字符，首尾不能有空格。');
  }
  if (next !== confirmation) throw new CredentialError('两次输入的新密码不一致。');
  if (next === current) throw new CredentialError('新密码应与当前密码不同。');

  const metadata = await head(authPath).catch((error) => {
    if (error instanceof BlobNotFoundError) return null;
    throw error;
  });
  const previous = await readCredential();
  if (!(await validPassword(current, previous))) throw new CredentialError('当前密码不正确。');
  const salt = randomBytes(32).toString('hex');
  const hash = (await deriveKey(next, salt, 64)).toString('hex');
  const version = randomBytes(16).toString('hex');
  try {
    await put(authPath, JSON.stringify({ salt, hash, version }), {
      access: 'private',
      contentType: 'application/json',
      ...(metadata ? { allowOverwrite: true, ifMatch: metadata.etag } : {}),
    });
  } catch (error) {
    if (error instanceof BlobPreconditionFailedError || /already exists/i.test(error.message)) {
      throw new CredentialError('密码刚刚被更新。请重新登录后再试。', 409);
    }
    throw error;
  }
  return version;
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.slice(0, -1);
  return origin === protocol + '://' + host;
}
