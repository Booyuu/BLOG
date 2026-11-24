import { cookies } from 'next/headers';
import { sessionCookie, validSession } from '../../lib/auth';

export async function signedIn() {
  return validSession((await cookies()).get(sessionCookie)?.value);
}
