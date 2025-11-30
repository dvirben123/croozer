"use server";
import { NextRequest } from 'next/server';
import { auth } from '../../auth';
import { headers, cookies } from 'next/headers';

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
 * Get dev session (development only)
 */
async function getDevSession(): Promise<Session | null> {
  // Only allow in development
  if (process.env.NODE_ENV !== "development") {
    return null;
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("dev_session");

    if (!sessionCookie) {
      return null;
    }

    const user = JSON.parse(sessionCookie.value);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.picture?.data?.url,
      },
      session: { isDev: true },
    };
  } catch (error) {
    console.error('Error getting dev session:', error);
    return null;
  }
}

/**
 * Get the current session using Better Auth or dev session in development
 */
export async function getServerSession(): Promise<Session | null> {
  try {
    // Try dev session first in development mode
    if (process.env.NODE_ENV === "development") {
      const devSession = await getDevSession();
      if (devSession) {
        return devSession;
      }
    }

    // Fall back to Better Auth session
    const session = await auth.api.getSession({
      headers: await headers(),
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
export async function requireAuth(): Promise<Session> {
  const session = await getServerSession();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  return session;
}
