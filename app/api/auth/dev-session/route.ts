import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Check if there's an active development session
 * Returns user data if session exists
 */
export async function GET(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { user: null },
      { status: 200 }
    );
  }

  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('dev_session');

    if (!sessionCookie) {
      return NextResponse.json({ user: null });
    }

    const user = JSON.parse(sessionCookie.value);

    return NextResponse.json({
      user,
      isDev: true,
    });
  } catch (error) {
    return NextResponse.json({ user: null });
  }
}






