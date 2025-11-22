import { NextRequest } from 'next/server';
import { auth } from '../../auth';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string;
}

export interface Session {
  user: SessionUser;
  session: any;
}

/**
 * Get the current session using Better Auth
 */
export async function getServerSession(request: NextRequest): Promise<Session | null> {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (session?.user) {
      return {
        user: {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          image: session.user.image || undefined,
        },
        session: session.session,
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Require authentication - returns session or throws 401
 */
export async function requireAuth(request: NextRequest): Promise<Session> {
  const session = await getServerSession(request);

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}
