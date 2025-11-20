import { NextRequest } from 'next/server';
import { cookies } from 'next/headers';

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  picture?: {
    data: {
      url: string;
    };
  };
}

export interface Session {
  user: SessionUser;
  isDev?: boolean;
}

/**
 * Get the current session from cookies
 * Supports both development and production sessions
 */
export async function getServerSession(request: NextRequest): Promise<Session | null> {
  try {
    const cookieStore = await cookies();

    // Check for dev session first (development only)
    if (process.env.NODE_ENV === 'development') {
      const devSessionCookie = cookieStore.get('dev_session');
      if (devSessionCookie) {
        const user = JSON.parse(devSessionCookie.value);
        return { user, isDev: true };
      }
    }

    // Check for production session (Facebook OAuth)
    const sessionCookie = cookieStore.get('session');
    if (sessionCookie) {
      const user = JSON.parse(sessionCookie.value);
      return { user };
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
