import { createHmac, timingSafeEqual } from 'node:crypto';

export const sessionCookie = 'booyuu_admin';
export const sessionSeconds = 60 * 60 * 8;

export function configuredPassword() {
  const password = process.env.BLOG_ADMIN_PASSWORD;
  return password?.length >= 32 ? password : null;
}

function signature(value, password) {
  return createHmac('sha256', password).update(value).digest('hex');
}

export function validPassword(candidate) {
  const password = configuredPassword();
  if (!password || typeof candidate !== 'string' || candidate.length > 512) return false;
  const digest = (value) => Buffer.from(signature(value, 'booyuu-admin-login-v1'), 'hex');
  return timingSafeEqual(digest(candidate), digest(password));
}

export function makeSession() {
  const expiry = String(Math.floor(Date.now() / 1000) + sessionSeconds);
  return expiry + '.' + signature('session-v1:' + expiry, configuredPassword());
}

export function validSession(cookie) {
  const password = configuredPassword();
  if (!password || !/^\d{10}\.[0-9a-f]{64}$/.test(cookie ?? '')) return false;
  const [expiry, provided] = cookie.split('.');
  if (Number(expiry) <= Date.now() / 1000) return false;
  const expected = signature('session-v1:' + expiry, password);
  return timingSafeEqual(Buffer.from(provided, 'hex'), Buffer.from(expected, 'hex'));
}

export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const host = request.headers.get('host');
  const protocol = request.headers.get('x-forwarded-proto') ?? new URL(request.url).protocol.slice(0, -1);
  return origin === protocol + '://' + host;
}
