import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

/**
 * Development-only login endpoint
 * Creates a mock session for local development
 * 
 * IMPORTANT: This endpoint is ONLY available in development mode
 */
export async function POST(request: NextRequest) {
  // Only allow in development
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const { userId, name, email } = body;

    // Create mock user session
    const mockUser = {
      id: userId || 'dev_user_123',
      name: name || 'Dev User',
      email: email || 'dev@localhost',
      picture: {
        data: {
          url: 'https://via.placeholder.com/150'
        }
      }
    };

    // Set session cookie (simplified for dev)
    const cookieStore = await cookies();
    cookieStore.set('dev_session', JSON.stringify(mockUser), {
      httpOnly: true,
      secure: false, // Allow HTTP in dev
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return NextResponse.json({
      success: true,
      user: mockUser,
      message: 'Development session created',
    });
  } catch (error: any) {
    console.error('Dev login error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

// Logout endpoint
export async function DELETE(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json(
      { success: false, error: 'This endpoint is only available in development' },
      { status: 403 }
    );
  }

  const cookieStore = await cookies();
  cookieStore.delete('dev_session');

  return NextResponse.json({
    success: true,
    message: 'Development session cleared',
  });
}


