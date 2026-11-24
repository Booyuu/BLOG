import { readImage } from '../../../lib/content';
import { mediaTypes } from '../../../lib/site';
import { signedIn } from '../../admin/session';

export const dynamic = 'force-dynamic';

export async function GET(_request, { params }) {
  const { name } = await params;
  const file = await readImage(name, await signedIn());
  if (!file || file.statusCode !== 200) return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
  return new Response(file.stream, {
    headers: {
      'Content-Type': mediaTypes[name.split('.').at(-1)],
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
